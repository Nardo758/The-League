from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Game, GameStatus, League, Prediction, Registration, RegistrationStatus, Season, Team, User
from app.schemas import PaginatedResponse, PredictionCreate, PredictionRead, paginate

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("", response_model=PredictionRead, status_code=status.HTTP_201_CREATED)
def create_prediction(
    payload: PredictionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, payload.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.scheduled:
        raise HTTPException(status_code=400, detail="Can only predict on scheduled games")

    existing = session.exec(
        select(Prediction).where(
            Prediction.game_id == payload.game_id,
            Prediction.user_id == current_user.id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a prediction for this game")

    if payload.predicted_winner_team_id:
        if payload.predicted_winner_team_id not in [game.home_team_id, game.away_team_id]:
            raise HTTPException(status_code=400, detail="Predicted team must be one of the game participants")

    if payload.predicted_winner_user_id:
        if payload.predicted_winner_user_id not in [game.home_player_id, game.away_player_id]:
            raise HTTPException(status_code=400, detail="Predicted player must be one of the game participants")

    prediction = Prediction(
        game_id=payload.game_id,
        user_id=current_user.id,
        predicted_winner_team_id=payload.predicted_winner_team_id,
        predicted_winner_user_id=payload.predicted_winner_user_id,
        confidence_points=payload.confidence_points
    )
    session.add(prediction)
    session.commit()
    session.refresh(prediction)

    return prediction


@router.get("/my", response_model=PaginatedResponse[PredictionRead])
def list_my_predictions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    count_stmt = select(func.count()).select_from(Prediction).where(
        Prediction.user_id == current_user.id
    )
    total = session.exec(count_stmt).one()

    stmt = select(Prediction).where(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [PredictionRead.model_validate(p) for p in session.exec(stmt).all()]
    return paginate(items, total, page, page_size)


@router.get("/games/{game_id}", response_model=list[PredictionRead])
def list_game_predictions(
    game_id: int,
    session: Session = Depends(get_session)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status == GameStatus.scheduled:
        raise HTTPException(status_code=403, detail="Predictions are hidden until game is completed")

    predictions = session.exec(
        select(Prediction).where(Prediction.game_id == game_id)
    ).all()

    return [PredictionRead.model_validate(p) for p in predictions]


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    prediction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    prediction = session.get(Prediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if prediction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this prediction")

    game = session.get(Game, prediction.game_id)
    if game and game.status != GameStatus.scheduled:
        raise HTTPException(status_code=400, detail="Cannot delete prediction after game has started")

    session.delete(prediction)
    session.commit()


@router.post("/games/{game_id}/resolve")
def resolve_predictions(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.final:
        raise HTTPException(status_code=400, detail="Game must be finalized before resolving predictions")

    if game.home_score is None or game.away_score is None:
        raise HTTPException(status_code=400, detail="Game scores not set")

    if game.home_team_id:
        if game.home_score > game.away_score:
            winning_team_id = game.home_team_id
        elif game.away_score > game.home_score:
            winning_team_id = game.away_team_id
        else:
            winning_team_id = None
    else:
        winning_team_id = None

    if game.home_player_id:
        if game.home_score > game.away_score:
            winning_player_id = game.home_player_id
        elif game.away_score > game.home_score:
            winning_player_id = game.away_player_id
        else:
            winning_player_id = None
    else:
        winning_player_id = None

    predictions = session.exec(
        select(Prediction).where(Prediction.game_id == game_id)
    ).all()

    resolved_count = 0
    for prediction in predictions:
        if prediction.is_correct is not None:
            continue

        is_correct = False
        if winning_team_id and prediction.predicted_winner_team_id == winning_team_id:
            is_correct = True
        elif winning_player_id and prediction.predicted_winner_user_id == winning_player_id:
            is_correct = True

        prediction.is_correct = is_correct
        prediction.points_earned = prediction.confidence_points if is_correct else 0
        session.add(prediction)
        resolved_count += 1

    session.commit()

    return {"message": f"Resolved {resolved_count} predictions", "game_id": game_id}


@router.get("/leaderboard/seasons/{season_id}")
def get_season_leaderboard(
    season_id: int,
    limit: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session)
):
    season = session.get(Season, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    game_ids = [g.id for g in session.exec(
        select(Game).where(Game.season_id == season_id)
    ).all()]

    if not game_ids:
        return {"season_id": season_id, "leaderboard": []}

    stmt = (
        select(
            Prediction.user_id,
            func.sum(Prediction.points_earned).label("total_points"),
            func.count(Prediction.id).label("total_predictions"),
            func.sum(func.case((Prediction.is_correct == True, 1), else_=0)).label("correct_predictions")
        )
        .where(
            Prediction.game_id.in_(game_ids),
            Prediction.is_correct.isnot(None)
        )
        .group_by(Prediction.user_id)
        .order_by(func.sum(Prediction.points_earned).desc())
        .limit(limit)
    )

    results = session.exec(stmt).all()

    leaderboard = []
    for i, row in enumerate(results):
        user = session.get(User, row.user_id)
        accuracy = (row.correct_predictions / row.total_predictions * 100) if row.total_predictions > 0 else 0
        leaderboard.append({
            "rank": i + 1,
            "user_id": row.user_id,
            "user_name": user.full_name if user else "Unknown",
            "total_points": row.total_points or 0,
            "total_predictions": row.total_predictions,
            "correct_predictions": row.correct_predictions,
            "accuracy_percentage": round(accuracy, 1)
        })

    return {
        "season_id": season_id,
        "season_name": season.name,
        "leaderboard": leaderboard
    }
