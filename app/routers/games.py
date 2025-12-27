from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import Game, GameStatus, League, NotificationType, Registration, RegistrationStatus, ScoreSubmission, Season, User, VenueMember, VenueRole
from app.schemas import GameCreate, GameRead, GameUpdate, PaginatedResponse, ScoreSubmissionCreate, ScoreSubmissionRead, paginate
from app.schemas import GameStatus as GameStatusSchema
from app.routers.notifications import create_notification, notify_league_participants

router = APIRouter(prefix="/games", tags=["games"])


@router.get("", response_model=PaginatedResponse[GameRead])
def list_games(
    season_id: int | None = None,
    status_filter: GameStatusSchema | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    status_val = status_filter.value if status_filter else None
    cache_id = f"games:{cache_key(season_id=season_id, status=status_val, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Game)
    count_stmt = select(func.count()).select_from(Game)

    if season_id is not None:
        stmt = stmt.where(Game.season_id == season_id)
        count_stmt = count_stmt.where(Game.season_id == season_id)
    if status_filter is not None:
        stmt = stmt.where(Game.status == status_filter.value)
        count_stmt = count_stmt.where(Game.status == status_filter.value)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Game.start_time.desc().nullslast(), Game.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [GameRead.model_validate(game) for game in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/{game_id}", response_model=GameRead)
def get_game(game_id: int, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.post("", response_model=GameRead, status_code=status.HTTP_201_CREATED)
def create_game(
    payload: GameCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    season = session.get(Season, payload.season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to create games for this season")

    game = Game(**payload.model_dump())
    session.add(game)
    session.commit()
    session.refresh(game)

    if league:
        notify_league_participants(
            session=session,
            league_id=league.id,
            notification_type=NotificationType.game_scheduled,
            title="Game Scheduled",
            message=f"A new game has been scheduled for {league.name}",
            link=f"/games/{game.id}",
            exclude_user_id=current_user.id
        )
        session.commit()

    invalidate_list_cache("games:")
    return game


@router.patch("/{game_id}", response_model=GameRead)
def update_game(
    game_id: int,
    payload: GameUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    season = session.get(Season, game.season_id)
    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to update this game")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "status" and value is not None:
            setattr(game, key, value.value if hasattr(value, "value") else value)
        else:
            setattr(game, key, value)

    session.add(game)
    session.commit()
    session.refresh(game)

    invalidate_list_cache("games:")
    return game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    season = session.get(Season, game.season_id)
    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to delete this game")

    session.delete(game)
    session.commit()
    invalidate_list_cache("games:")


@router.post("/{game_id}/scores", response_model=ScoreSubmissionRead, status_code=status.HTTP_201_CREATED)
def submit_score(
    game_id: int,
    payload: ScoreSubmissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if payload.game_id != game_id:
        raise HTTPException(status_code=400, detail="Game ID mismatch")

    season = session.get(Season, game.season_id)
    league = session.get(League, season.league_id)

    is_venue_staff = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()

    is_participant = session.exec(
        select(Registration).where(
            Registration.season_id == game.season_id,
            Registration.user_id == current_user.id,
            Registration.status == RegistrationStatus.approved
        )
    ).first()

    is_game_player = (
        game.home_player_id == current_user.id or 
        game.away_player_id == current_user.id
    )

    if not (is_venue_staff or is_participant or is_game_player):
        raise HTTPException(status_code=403, detail="Not authorized to submit scores for this game")

    submission = ScoreSubmission(
        game_id=game_id,
        submitted_by=current_user.id,
        home_score=payload.home_score,
        away_score=payload.away_score,
        details=payload.details
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)

    return submission


@router.get("/{game_id}/scores", response_model=list[ScoreSubmissionRead])
def list_score_submissions(
    game_id: int,
    session: Session = Depends(get_session)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    submissions = session.exec(
        select(ScoreSubmission)
        .where(ScoreSubmission.game_id == game_id)
        .order_by(ScoreSubmission.created_at.desc())
    ).all()

    return [ScoreSubmissionRead.model_validate(s) for s in submissions]


@router.post("/{game_id}/scores/{submission_id}/verify", response_model=ScoreSubmissionRead)
def verify_score(
    game_id: int,
    submission_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    submission = session.get(ScoreSubmission, submission_id)
    if not submission or submission.game_id != game_id:
        raise HTTPException(status_code=404, detail="Score submission not found")

    season = session.get(Season, game.season_id)
    league = session.get(League, season.league_id)

    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Only venue staff can verify scores")

    submission.is_verified = True
    submission.verified_by = current_user.id
    submission.verified_at = datetime.utcnow()

    game.home_score = submission.home_score
    game.away_score = submission.away_score
    game.status = GameStatus.final

    session.add(submission)
    session.add(game)
    session.commit()
    session.refresh(submission)

    if submission.submitted_by and submission.submitted_by != current_user.id:
        create_notification(
            session=session,
            user_id=submission.submitted_by,
            notification_type=NotificationType.score_verified,
            title="Score Verified",
            message=f"Your score submission for {league.name if league else 'the game'} has been verified",
            link=f"/games/{game.id}",
            related_id=game.id,
            related_type="game"
        )

    if league:
        notify_league_participants(
            session=session,
            league_id=league.id,
            notification_type=NotificationType.game_result,
            title="Game Result Posted",
            message=f"Final score: {game.home_score}-{game.away_score}",
            link=f"/games/{game.id}",
            exclude_user_id=current_user.id
        )

    session.commit()
    invalidate_list_cache("games:")
    return submission


@router.delete("/{game_id}/scores/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_score_submission(
    game_id: int,
    submission_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    submission = session.get(ScoreSubmission, submission_id)
    if not submission or submission.game_id != game_id:
        raise HTTPException(status_code=404, detail="Score submission not found")

    if submission.is_verified:
        raise HTTPException(status_code=400, detail="Cannot delete verified score submission")

    if submission.submitted_by != current_user.id:
        season = session.get(Season, game.season_id)
        league = session.get(League, season.league_id)
        member = session.exec(
            select(VenueMember).where(
                VenueMember.venue_id == league.venue_id,
                VenueMember.user_id == current_user.id,
                VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
            )
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not authorized to delete this submission")

    session.delete(submission)
    session.commit()
