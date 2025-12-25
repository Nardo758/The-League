from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, func, select

from app.db import get_session
from app.deps import get_current_user
from app.game_engines import (
    BattleshipEngine,
    CheckersEngine,
    ChessEngine,
    ConnectFourEngine,
    GameEngine,
)
from app.models import (
    OnlineGame,
    OnlineGameMatch,
    OnlineGameStatus,
    OnlineGameType,
    User,
)
from app.schemas import PaginatedResponse, paginate

router = APIRouter(prefix="/online-games", tags=["online-games"])


def get_engine(game_type: OnlineGameType) -> GameEngine:
    engines = {
        OnlineGameType.connect_four: ConnectFourEngine(),
        OnlineGameType.checkers: CheckersEngine(),
        OnlineGameType.battleship: BattleshipEngine(),
        OnlineGameType.chess: ChessEngine(),
    }
    return engines[game_type]


class CreateGameRequest(BaseModel):
    game_type: OnlineGameType
    is_ranked: bool = False
    time_limit_seconds: int | None = None


class JoinGameRequest(BaseModel):
    pass


class MakeMoveRequest(BaseModel):
    move: dict


class GameResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    game_type: str
    status: str
    player1_id: int
    player2_id: int | None
    current_turn: int | None
    winner_id: int | None
    is_ranked: bool
    created_at: str


class GameStateResponse(BaseModel):
    id: int
    game_type: str
    status: str
    board_state: dict | None
    current_turn: int | None
    player_number: int
    valid_moves: list[dict]
    is_your_turn: bool
    winner_id: int | None


class MatchmakingRequest(BaseModel):
    game_type: OnlineGameType
    preferred_time_limit: int | None = None


class MatchmakingResponse(BaseModel):
    status: str
    game_id: int | None = None
    message: str


class ChallengePlayerRequest(BaseModel):
    opponent_id: int
    game_type: OnlineGameType
    is_ranked: bool = False
    time_limit_seconds: int | None = None


class ChallengeResponse(BaseModel):
    id: int
    game_type: str
    challenger_id: int
    challenged_id: int
    is_ranked: bool
    time_limit: int | None
    created_at: str


@router.post("", response_model=GameResponse)
def create_game(
    payload: CreateGameRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    engine = get_engine(payload.game_type)
    initial_state = engine.create_initial_state()
    
    game = OnlineGame(
        game_type=payload.game_type,
        status=OnlineGameStatus.waiting,
        player1_id=current_user.id,
        board_state=engine.serialize_state(initial_state),
        current_turn=1,
        is_ranked=payload.is_ranked,
        time_limit_seconds=payload.time_limit_seconds,
        player1_time_remaining=payload.time_limit_seconds,
        player2_time_remaining=payload.time_limit_seconds
    )
    
    session.add(game)
    session.commit()
    session.refresh(game)
    
    return GameResponse(
        id=game.id,
        game_type=game.game_type.value,
        status=game.status.value,
        player1_id=game.player1_id,
        player2_id=game.player2_id,
        current_turn=game.current_turn,
        winner_id=game.winner_id,
        is_ranked=game.is_ranked,
        created_at=game.created_at.isoformat()
    )


@router.get("", response_model=PaginatedResponse[GameResponse])
def list_games(
    game_type: OnlineGameType | None = None,
    status: OnlineGameStatus | None = None,
    my_games: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(OnlineGame)
    count_stmt = select(func.count()).select_from(OnlineGame)
    
    if game_type:
        stmt = stmt.where(OnlineGame.game_type == game_type)
        count_stmt = count_stmt.where(OnlineGame.game_type == game_type)
    
    if status:
        stmt = stmt.where(OnlineGame.status == status)
        count_stmt = count_stmt.where(OnlineGame.status == status)
    
    if my_games:
        stmt = stmt.where(
            (OnlineGame.player1_id == current_user.id) | 
            (OnlineGame.player2_id == current_user.id)
        )
        count_stmt = count_stmt.where(
            (OnlineGame.player1_id == current_user.id) | 
            (OnlineGame.player2_id == current_user.id)
        )
    
    total = session.exec(count_stmt).one()
    
    stmt = stmt.order_by(OnlineGame.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    games = session.exec(stmt).all()
    
    items = [
        GameResponse(
            id=g.id,
            game_type=g.game_type.value,
            status=g.status.value,
            player1_id=g.player1_id,
            player2_id=g.player2_id,
            current_turn=g.current_turn,
            winner_id=g.winner_id,
            is_ranked=g.is_ranked,
            created_at=g.created_at.isoformat()
        )
        for g in games
    ]
    
    return paginate(items, total, page, page_size)


@router.get("/available")
def list_available_games(
    game_type: OnlineGameType | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(OnlineGame).where(
        OnlineGame.status == OnlineGameStatus.waiting,
        OnlineGame.player1_id != current_user.id
    )
    
    if game_type:
        stmt = stmt.where(OnlineGame.game_type == game_type)
    
    stmt = stmt.order_by(OnlineGame.created_at.desc()).limit(20)
    games = session.exec(stmt).all()
    
    return [
        {
            "id": g.id,
            "game_type": g.game_type.value,
            "player1_id": g.player1_id,
            "is_ranked": g.is_ranked,
            "time_limit": g.time_limit_seconds,
            "created_at": g.created_at.isoformat()
        }
        for g in games
    ]


@router.post("/{game_id}/join", response_model=GameResponse)
def join_game(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(OnlineGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != OnlineGameStatus.waiting:
        raise HTTPException(status_code=400, detail="Game is not available to join")
    
    if game.player1_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot join your own game")
    
    if game.challenged_user_id and game.challenged_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This game is a private challenge")
    
    game.player2_id = current_user.id
    game.status = OnlineGameStatus.in_progress
    
    session.add(game)
    session.commit()
    session.refresh(game)
    
    return GameResponse(
        id=game.id,
        game_type=game.game_type.value,
        status=game.status.value,
        player1_id=game.player1_id,
        player2_id=game.player2_id,
        current_turn=game.current_turn,
        winner_id=game.winner_id,
        is_ranked=game.is_ranked,
        created_at=game.created_at.isoformat()
    )


@router.post("/challenge", response_model=ChallengeResponse)
def challenge_player(
    payload: ChallengePlayerRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if payload.opponent_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot challenge yourself")
    
    opponent = session.get(User, payload.opponent_id)
    if not opponent:
        raise HTTPException(status_code=404, detail="Opponent not found")
    
    engine = get_engine(payload.game_type)
    initial_state = engine.create_initial_state()
    
    game = OnlineGame(
        game_type=payload.game_type,
        status=OnlineGameStatus.waiting,
        player1_id=current_user.id,
        challenged_user_id=payload.opponent_id,
        board_state=engine.serialize_state(initial_state),
        current_turn=1,
        is_ranked=payload.is_ranked,
        time_limit_seconds=payload.time_limit_seconds,
        player1_time_remaining=payload.time_limit_seconds,
        player2_time_remaining=payload.time_limit_seconds
    )
    
    session.add(game)
    session.commit()
    session.refresh(game)
    
    return ChallengeResponse(
        id=game.id,
        game_type=game.game_type.value,
        challenger_id=game.player1_id,
        challenged_id=game.challenged_user_id,
        is_ranked=game.is_ranked,
        time_limit=game.time_limit_seconds,
        created_at=game.created_at.isoformat()
    )


@router.get("/challenges", response_model=list[ChallengeResponse])
def list_challenges(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(OnlineGame).where(
        OnlineGame.status == OnlineGameStatus.waiting,
        OnlineGame.challenged_user_id == current_user.id
    ).order_by(OnlineGame.created_at.desc())
    
    games = session.exec(stmt).all()
    
    return [
        ChallengeResponse(
            id=g.id,
            game_type=g.game_type.value,
            challenger_id=g.player1_id,
            challenged_id=g.challenged_user_id,
            is_ranked=g.is_ranked,
            time_limit=g.time_limit_seconds,
            created_at=g.created_at.isoformat()
        )
        for g in games
    ]


@router.post("/{game_id}/accept", response_model=GameResponse)
def accept_challenge(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(OnlineGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.challenged_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This challenge is not for you")
    
    if game.status != OnlineGameStatus.waiting:
        raise HTTPException(status_code=400, detail="Challenge already responded to")
    
    game.player2_id = current_user.id
    game.status = OnlineGameStatus.in_progress
    
    session.add(game)
    session.commit()
    session.refresh(game)
    
    return GameResponse(
        id=game.id,
        game_type=game.game_type.value,
        status=game.status.value,
        player1_id=game.player1_id,
        player2_id=game.player2_id,
        current_turn=game.current_turn,
        winner_id=game.winner_id,
        is_ranked=game.is_ranked,
        created_at=game.created_at.isoformat()
    )


@router.post("/{game_id}/decline")
def decline_challenge(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(OnlineGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.challenged_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This challenge is not for you")
    
    if game.status != OnlineGameStatus.waiting:
        raise HTTPException(status_code=400, detail="Challenge already responded to")
    
    game.status = OnlineGameStatus.cancelled
    session.add(game)
    session.commit()
    
    return {"message": "Challenge declined"}


@router.get("/{game_id}", response_model=GameStateResponse)
def get_game_state(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(OnlineGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.player1_id == current_user.id:
        player_number = 1
    elif game.player2_id == current_user.id:
        player_number = 2
    else:
        raise HTTPException(status_code=403, detail="Not a player in this game")
    
    engine = get_engine(game.game_type)
    state = engine.deserialize_state(game.board_state) if game.board_state else {}
    
    is_your_turn = (
        game.status == OnlineGameStatus.in_progress and 
        game.current_turn == player_number
    )
    
    valid_moves = engine.get_valid_moves(state, player_number) if is_your_turn else []
    
    if game.game_type == OnlineGameType.battleship:
        board_state = engine.get_player_view(state, player_number)
    else:
        board_state = state
    
    return GameStateResponse(
        id=game.id,
        game_type=game.game_type.value,
        status=game.status.value,
        board_state=board_state,
        current_turn=game.current_turn,
        player_number=player_number,
        valid_moves=valid_moves,
        is_your_turn=is_your_turn,
        winner_id=game.winner_id
    )


@router.post("/{game_id}/move")
def make_move(
    game_id: int,
    payload: MakeMoveRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(OnlineGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.player1_id == current_user.id:
        player_number = 1
    elif game.player2_id == current_user.id:
        player_number = 2
    else:
        raise HTTPException(status_code=403, detail="Not a player in this game")
    
    if game.status != OnlineGameStatus.in_progress:
        if game.status == OnlineGameStatus.waiting:
            raise HTTPException(status_code=400, detail="Waiting for opponent")
        raise HTTPException(status_code=400, detail="Game is not in progress")
    
    engine = get_engine(game.game_type)
    state = engine.deserialize_state(game.board_state)
    
    is_valid, error = engine.validate_move(state, player_number, payload.move)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
    
    new_state = engine.apply_move(state, player_number, payload.move)
    
    game.board_state = engine.serialize_state(new_state)
    game.current_turn = new_state.get("current_player", 
                                       2 if player_number == 1 else 1)
    
    if engine.is_game_over(new_state):
        game.status = OnlineGameStatus.completed
        winner = engine.check_winner(new_state)
        if winner == 1:
            game.winner_id = game.player1_id
        elif winner == 2:
            game.winner_id = game.player2_id
    
    session.add(game)
    session.commit()
    session.refresh(game)
    
    is_your_turn = (
        game.status == OnlineGameStatus.in_progress and 
        game.current_turn == player_number
    )
    
    if game.game_type == OnlineGameType.battleship:
        board_state = engine.get_player_view(new_state, player_number)
    else:
        board_state = new_state
    
    return {
        "success": True,
        "game_status": game.status.value,
        "board_state": board_state,
        "current_turn": game.current_turn,
        "winner_id": game.winner_id,
        "is_your_turn": is_your_turn
    }


@router.post("/{game_id}/resign")
def resign_game(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(OnlineGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.player1_id == current_user.id:
        player_number = 1
    elif game.player2_id == current_user.id:
        player_number = 2
    else:
        raise HTTPException(status_code=403, detail="Not a player in this game")
    
    if game.status != OnlineGameStatus.in_progress:
        raise HTTPException(status_code=400, detail="Game is not in progress")
    
    game.status = OnlineGameStatus.completed
    game.winner_id = game.player2_id if player_number == 1 else game.player1_id
    
    session.add(game)
    session.commit()
    
    return {"message": "You have resigned", "winner_id": game.winner_id}


@router.post("/matchmaking/search", response_model=MatchmakingResponse)
def search_for_match(
    payload: MatchmakingRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    existing_search = session.exec(
        select(OnlineGameMatch).where(
            OnlineGameMatch.user_id == current_user.id,
            OnlineGameMatch.is_searching == True
        )
    ).first()
    
    if existing_search:
        session.delete(existing_search)
    
    opponent = session.exec(
        select(OnlineGameMatch).where(
            OnlineGameMatch.game_type == payload.game_type,
            OnlineGameMatch.is_searching == True,
            OnlineGameMatch.user_id != current_user.id
        ).order_by(OnlineGameMatch.created_at)
    ).first()
    
    if opponent:
        opponent.is_searching = False
        session.add(opponent)
        
        engine = get_engine(payload.game_type)
        initial_state = engine.create_initial_state()
        
        game = OnlineGame(
            game_type=payload.game_type,
            status=OnlineGameStatus.in_progress,
            player1_id=opponent.user_id,
            player2_id=current_user.id,
            board_state=engine.serialize_state(initial_state),
            current_turn=1,
            is_ranked=True,
            time_limit_seconds=payload.preferred_time_limit
        )
        
        session.add(game)
        session.commit()
        session.refresh(game)
        
        return MatchmakingResponse(
            status="matched",
            game_id=game.id,
            message="Found an opponent! Game started."
        )
    
    match_request = OnlineGameMatch(
        user_id=current_user.id,
        game_type=payload.game_type,
        is_searching=True,
        preferred_time_limit=payload.preferred_time_limit
    )
    
    session.add(match_request)
    session.commit()
    
    return MatchmakingResponse(
        status="searching",
        message="Looking for an opponent..."
    )


@router.post("/matchmaking/cancel")
def cancel_matchmaking(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    searches = session.exec(
        select(OnlineGameMatch).where(
            OnlineGameMatch.user_id == current_user.id,
            OnlineGameMatch.is_searching == True
        )
    ).all()
    
    for search in searches:
        search.is_searching = False
        session.add(search)
    
    session.commit()
    
    return {"message": "Matchmaking cancelled"}
