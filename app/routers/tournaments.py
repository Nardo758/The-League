import math
from datetime import datetime

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
)
from app.models import (
    OnlineGame,
    OnlineGameStatus,
    OnlineGameType,
    Tournament,
    TournamentFormat,
    TournamentMatch,
    TournamentParticipant,
    TournamentStatus,
    User,
)
from app.schemas import PaginatedResponse, paginate

router = APIRouter(prefix="/tournaments", tags=["tournaments"])


def get_engine(game_type: OnlineGameType):
    engines = {
        OnlineGameType.connect_four: ConnectFourEngine(),
        OnlineGameType.checkers: CheckersEngine(),
        OnlineGameType.battleship: BattleshipEngine(),
        OnlineGameType.chess: ChessEngine(),
    }
    return engines[game_type]


class CreateTournamentRequest(BaseModel):
    name: str
    description: str | None = None
    game_type: OnlineGameType
    format: TournamentFormat = TournamentFormat.single_elimination
    max_participants: int = 16
    registration_deadline: datetime | None = None
    start_time: datetime | None = None


class TournamentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    game_type: str
    format: str
    status: str
    max_participants: int
    participant_count: int
    organizer_id: int
    current_round: int
    winner_id: int | None
    created_at: str


class TournamentMatchResponse(BaseModel):
    id: int
    round_number: int
    match_number: int
    player1_id: int | None
    player2_id: int | None
    winner_id: int | None
    online_game_id: int | None
    is_bye: bool


class BracketResponse(BaseModel):
    tournament_id: int
    total_rounds: int
    matches: list[TournamentMatchResponse]


@router.post("", response_model=TournamentResponse)
def create_tournament(
    payload: CreateTournamentRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = Tournament(
        name=payload.name,
        description=payload.description,
        game_type=payload.game_type,
        format=payload.format,
        max_participants=payload.max_participants,
        organizer_id=current_user.id,
        registration_deadline=payload.registration_deadline,
        start_time=payload.start_time
    )
    
    session.add(tournament)
    session.commit()
    session.refresh(tournament)
    
    return TournamentResponse(
        id=tournament.id,
        name=tournament.name,
        description=tournament.description,
        game_type=tournament.game_type.value,
        format=tournament.format.value,
        status=tournament.status.value,
        max_participants=tournament.max_participants,
        participant_count=0,
        organizer_id=tournament.organizer_id,
        current_round=tournament.current_round,
        winner_id=tournament.winner_id,
        created_at=tournament.created_at.isoformat()
    )


@router.get("", response_model=PaginatedResponse[TournamentResponse])
def list_tournaments(
    game_type: OnlineGameType | None = None,
    status_filter: TournamentStatus | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Tournament)
    count_stmt = select(func.count()).select_from(Tournament)
    
    if game_type:
        stmt = stmt.where(Tournament.game_type == game_type)
        count_stmt = count_stmt.where(Tournament.game_type == game_type)
    
    if status_filter:
        stmt = stmt.where(Tournament.status == status_filter)
        count_stmt = count_stmt.where(Tournament.status == status_filter)
    
    total = session.exec(count_stmt).one()
    
    stmt = stmt.order_by(Tournament.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    tournaments = session.exec(stmt).all()
    
    items = []
    for t in tournaments:
        count = session.exec(
            select(func.count()).select_from(TournamentParticipant).where(
                TournamentParticipant.tournament_id == t.id
            )
        ).one()
        
        items.append(TournamentResponse(
            id=t.id,
            name=t.name,
            description=t.description,
            game_type=t.game_type.value,
            format=t.format.value,
            status=t.status.value,
            max_participants=t.max_participants,
            participant_count=count,
            organizer_id=t.organizer_id,
            current_round=t.current_round,
            winner_id=t.winner_id,
            created_at=t.created_at.isoformat()
        ))
    
    return paginate(items, total, page, page_size)


@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(
    tournament_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    count = session.exec(
        select(func.count()).select_from(TournamentParticipant).where(
            TournamentParticipant.tournament_id == tournament_id
        )
    ).one()
    
    return TournamentResponse(
        id=tournament.id,
        name=tournament.name,
        description=tournament.description,
        game_type=tournament.game_type.value,
        format=tournament.format.value,
        status=tournament.status.value,
        max_participants=tournament.max_participants,
        participant_count=count,
        organizer_id=tournament.organizer_id,
        current_round=tournament.current_round,
        winner_id=tournament.winner_id,
        created_at=tournament.created_at.isoformat()
    )


@router.post("/{tournament_id}/register")
def register_for_tournament(
    tournament_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.status != TournamentStatus.registration:
        raise HTTPException(status_code=400, detail="Registration is closed")
    
    existing = session.exec(
        select(TournamentParticipant).where(
            TournamentParticipant.tournament_id == tournament_id,
            TournamentParticipant.user_id == current_user.id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
    
    count = session.exec(
        select(func.count()).select_from(TournamentParticipant).where(
            TournamentParticipant.tournament_id == tournament_id
        )
    ).one()
    
    if count >= tournament.max_participants:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user.id,
        seed=count + 1
    )
    
    session.add(participant)
    session.commit()
    
    return {"message": "Successfully registered", "seed": count + 1}


@router.post("/{tournament_id}/start", response_model=BracketResponse)
def start_tournament(
    tournament_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can start tournament")
    
    if tournament.status != TournamentStatus.registration:
        raise HTTPException(status_code=400, detail="Tournament already started")
    
    if tournament.format != TournamentFormat.single_elimination:
        raise HTTPException(
            status_code=400, 
            detail="Only single elimination format is currently supported"
        )
    
    participants = session.exec(
        select(TournamentParticipant).where(
            TournamentParticipant.tournament_id == tournament_id
        ).order_by(TournamentParticipant.seed)
    ).all()
    
    if len(participants) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 participants")
    
    num_participants = len(participants)
    num_rounds = math.ceil(math.log2(num_participants))
    bracket_size = 2 ** num_rounds
    num_byes = bracket_size - num_participants
    
    matches = []
    first_round_matches = bracket_size // 2
    
    for i in range(first_round_matches):
        match = TournamentMatch(
            tournament_id=tournament_id,
            round_number=1,
            match_number=i + 1
        )
        matches.append(match)
    
    for round_num in range(2, num_rounds + 1):
        num_matches = bracket_size // (2 ** round_num)
        for i in range(num_matches):
            match = TournamentMatch(
                tournament_id=tournament_id,
                round_number=round_num,
                match_number=i + 1
            )
            matches.append(match)
    
    for match in matches:
        session.add(match)
    session.commit()
    
    for match in matches:
        session.refresh(match)
    
    first_round = [m for m in matches if m.round_number == 1]
    for round_num in range(1, num_rounds):
        current_round = [m for m in matches if m.round_number == round_num]
        next_round = [m for m in matches if m.round_number == round_num + 1]
        
        for i, match in enumerate(current_round):
            next_match_idx = i // 2
            if next_match_idx < len(next_round):
                match.next_match_id = next_round[next_match_idx].id
                session.add(match)
    
    session.commit()
    
    player_idx = 0
    bye_positions = set(range(num_byes))
    
    for i, match in enumerate(first_round):
        if i in bye_positions:
            if player_idx < len(participants):
                match.player1_id = participants[player_idx].user_id
                match.is_bye = True
                match.winner_id = participants[player_idx].user_id
                player_idx += 1
        else:
            if player_idx < len(participants):
                match.player1_id = participants[player_idx].user_id
                player_idx += 1
            if player_idx < len(participants):
                match.player2_id = participants[player_idx].user_id
                player_idx += 1
        
        session.add(match)
    
    session.commit()
    
    _advance_bye_winners(session, tournament_id)
    
    tournament.status = TournamentStatus.in_progress
    tournament.current_round = 1
    session.add(tournament)
    session.commit()
    
    all_matches = session.exec(
        select(TournamentMatch).where(
            TournamentMatch.tournament_id == tournament_id
        ).order_by(TournamentMatch.round_number, TournamentMatch.match_number)
    ).all()
    
    return BracketResponse(
        tournament_id=tournament_id,
        total_rounds=num_rounds,
        matches=[
            TournamentMatchResponse(
                id=m.id,
                round_number=m.round_number,
                match_number=m.match_number,
                player1_id=m.player1_id,
                player2_id=m.player2_id,
                winner_id=m.winner_id,
                online_game_id=m.online_game_id,
                is_bye=m.is_bye
            )
            for m in all_matches
        ]
    )


def _advance_bye_winners(session: Session, tournament_id: int):
    bye_matches = session.exec(
        select(TournamentMatch).where(
            TournamentMatch.tournament_id == tournament_id,
            TournamentMatch.is_bye == True,
            TournamentMatch.winner_id != None
        )
    ).all()
    
    for match in bye_matches:
        if match.next_match_id:
            next_match = session.get(TournamentMatch, match.next_match_id)
            if next_match:
                if not next_match.player1_id:
                    next_match.player1_id = match.winner_id
                elif not next_match.player2_id:
                    next_match.player2_id = match.winner_id
                session.add(next_match)
    
    session.commit()


@router.get("/{tournament_id}/bracket", response_model=BracketResponse)
def get_bracket(
    tournament_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    matches = session.exec(
        select(TournamentMatch).where(
            TournamentMatch.tournament_id == tournament_id
        ).order_by(TournamentMatch.round_number, TournamentMatch.match_number)
    ).all()
    
    if not matches:
        raise HTTPException(status_code=400, detail="Bracket not generated yet")
    
    total_rounds = max(m.round_number for m in matches)
    
    return BracketResponse(
        tournament_id=tournament_id,
        total_rounds=total_rounds,
        matches=[
            TournamentMatchResponse(
                id=m.id,
                round_number=m.round_number,
                match_number=m.match_number,
                player1_id=m.player1_id,
                player2_id=m.player2_id,
                winner_id=m.winner_id,
                online_game_id=m.online_game_id,
                is_bye=m.is_bye
            )
            for m in matches
        ]
    )


@router.post("/{tournament_id}/matches/{match_id}/start")
def start_match(
    tournament_id: int,
    match_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    match = session.get(TournamentMatch, match_id)
    if not match or match.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.is_bye or match.winner_id:
        raise HTTPException(status_code=400, detail="Match already completed")
    
    if not match.player1_id or not match.player2_id:
        raise HTTPException(status_code=400, detail="Waiting for players")
    
    if current_user.id not in [match.player1_id, match.player2_id, tournament.organizer_id]:
        raise HTTPException(status_code=403, detail="Not a participant in this match")
    
    if match.online_game_id:
        return {"message": "Game already started", "game_id": match.online_game_id}
    
    engine = get_engine(tournament.game_type)
    initial_state = engine.create_initial_state()
    
    game = OnlineGame(
        game_type=tournament.game_type,
        status=OnlineGameStatus.in_progress,
        player1_id=match.player1_id,
        player2_id=match.player2_id,
        board_state=engine.serialize_state(initial_state),
        current_turn=1,
        is_ranked=True
    )
    
    session.add(game)
    session.commit()
    session.refresh(game)
    
    match.online_game_id = game.id
    session.add(match)
    session.commit()
    
    return {"message": "Match started", "game_id": game.id}


@router.post("/{tournament_id}/matches/{match_id}/report")
def report_match_result(
    tournament_id: int,
    match_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    match = session.get(TournamentMatch, match_id)
    if not match or match.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Match not found")
    
    is_participant = current_user.id in [match.player1_id, match.player2_id]
    is_organizer = current_user.id == tournament.organizer_id
    if not is_participant and not is_organizer:
        raise HTTPException(status_code=403, detail="Only match participants or organizer can report results")
    
    if match.winner_id:
        raise HTTPException(status_code=400, detail="Match already has a winner")
    
    if not match.online_game_id:
        raise HTTPException(status_code=400, detail="Game not started")
    
    game = session.get(OnlineGame, match.online_game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != OnlineGameStatus.completed:
        raise HTTPException(status_code=400, detail="Game not finished")
    
    if not game.winner_id:
        raise HTTPException(status_code=400, detail="Game has no winner (draw)")
    
    match.winner_id = game.winner_id
    session.add(match)
    
    loser_id = match.player1_id if game.winner_id == match.player2_id else match.player2_id
    loser = session.exec(
        select(TournamentParticipant).where(
            TournamentParticipant.tournament_id == tournament_id,
            TournamentParticipant.user_id == loser_id
        )
    ).first()
    if loser:
        loser.is_eliminated = True
        session.add(loser)
    
    if match.next_match_id:
        next_match = session.get(TournamentMatch, match.next_match_id)
        if next_match:
            if not next_match.player1_id:
                next_match.player1_id = game.winner_id
            elif not next_match.player2_id:
                next_match.player2_id = game.winner_id
            session.add(next_match)
    else:
        tournament.winner_id = game.winner_id
        tournament.status = TournamentStatus.completed
        
        winner = session.exec(
            select(TournamentParticipant).where(
                TournamentParticipant.tournament_id == tournament_id,
                TournamentParticipant.user_id == game.winner_id
            )
        ).first()
        if winner:
            winner.final_placement = 1
            session.add(winner)
        if loser:
            loser.final_placement = 2
            session.add(loser)
        
        session.add(tournament)
    
    session.commit()
    
    return {
        "message": "Result recorded",
        "winner_id": game.winner_id,
        "tournament_complete": tournament.status == TournamentStatus.completed
    }


@router.get("/{tournament_id}/participants")
def list_participants(
    tournament_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    participants = session.exec(
        select(TournamentParticipant).where(
            TournamentParticipant.tournament_id == tournament_id
        ).order_by(TournamentParticipant.seed)
    ).all()
    
    return [
        {
            "user_id": p.user_id,
            "seed": p.seed,
            "is_eliminated": p.is_eliminated,
            "final_placement": p.final_placement
        }
        for p in participants
    ]
