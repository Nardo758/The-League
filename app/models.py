from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Timestamped(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime | None = Field(default=None)


class VenueType(str, Enum):
    golf_course = "golf_course"
    bowling_alley = "bowling_alley"
    sports_complex = "sports_complex"
    gym = "gym"
    rec_center = "rec_center"
    esports_arena = "esports_arena"
    online = "online"
    other = "other"


class SportCategory(str, Enum):
    golf = "golf"
    bowling = "bowling"
    pickleball = "pickleball"
    softball = "softball"
    tennis = "tennis"
    soccer = "soccer"
    volleyball = "volleyball"
    basketball = "basketball"
    chess = "chess"
    checkers = "checkers"
    connect_four = "connect_four"
    battleship = "battleship"
    other = "other"


class ScoringType(str, Enum):
    stroke_play = "stroke_play"
    match_play = "match_play"
    points = "points"
    wins_losses = "wins_losses"
    sets = "sets"
    frames = "frames"
    custom = "custom"


class RegistrationMode(str, Enum):
    open = "open"
    approval_required = "approval_required"
    invite_only = "invite_only"


class RegistrationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    waitlisted = "waitlisted"
    cancelled = "cancelled"


class GameStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    final = "final"
    cancelled = "cancelled"
    postponed = "postponed"


class OnlineGameType(str, Enum):
    chess = "chess"
    checkers = "checkers"
    connect_four = "connect_four"
    battleship = "battleship"


class OnlineGameStatus(str, Enum):
    waiting = "waiting"
    in_progress = "in_progress"
    completed = "completed"
    abandoned = "abandoned"


class VenueRole(str, Enum):
    owner = "owner"
    admin = "admin"
    staff = "staff"


class LeagueRole(str, Enum):
    organizer = "organizer"
    captain = "captain"
    participant = "participant"


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: str | None = None
    is_active: bool = True
    bio: str | None = None
    avatar_url: str | None = None
    latitude: float | None = Field(default=None, index=True)
    longitude: float | None = Field(default=None, index=True)
    city: str | None = Field(default=None, index=True)
    state: str | None = Field(default=None, index=True)


class User(UserBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str

    venue_memberships: list["VenueMember"] = Relationship(back_populates="user")
    registrations: list["Registration"] = Relationship(back_populates="user")
    posts: list["Post"] = Relationship(back_populates="author")


class VenueBase(SQLModel):
    name: str = Field(index=True)
    description: str | None = None
    venue_type: VenueType = Field(default=VenueType.other, index=True)
    address: str | None = None
    city: str | None = Field(default=None, index=True)
    state: str | None = Field(default=None, index=True)
    zip_code: str | None = None
    country: str = Field(default="US")
    latitude: float | None = Field(default=None, index=True)
    longitude: float | None = Field(default=None, index=True)
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    logo_url: str | None = None
    is_virtual: bool = Field(default=False)


class Venue(VenueBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)

    members: list["VenueMember"] = Relationship(back_populates="venue")
    sports: list["VenueSport"] = Relationship(back_populates="venue")
    leagues: list["League"] = Relationship(back_populates="venue")
    posts: list["Post"] = Relationship(back_populates="venue")


class VenueMember(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    venue_id: int = Field(foreign_key="venue.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: VenueRole = Field(default=VenueRole.staff, index=True)

    venue: Venue = Relationship(back_populates="members")
    user: User = Relationship(back_populates="venue_memberships")


class Sport(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    category: SportCategory = Field(index=True)
    description: str | None = None
    icon: str | None = None
    scoring_type: ScoringType = Field(default=ScoringType.points)
    team_based: bool = Field(default=True)
    min_players_per_team: int = Field(default=1)
    max_players_per_team: int | None = None
    is_online: bool = Field(default=False)
    scoring_rules: str | None = None
    standings_rules: str | None = None


class VenueSport(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    venue_id: int = Field(foreign_key="venue.id", index=True)
    sport_id: int = Field(foreign_key="sport.id", index=True)

    venue: Venue = Relationship(back_populates="sports")
    sport: Sport = Relationship()


class LeagueBase(SQLModel):
    name: str = Field(index=True)
    description: str | None = None
    registration_mode: RegistrationMode = Field(default=RegistrationMode.open, index=True)
    registration_fee: float | None = None
    max_participants: int | None = None
    min_participants: int | None = None
    is_active: bool = Field(default=True, index=True)


class League(LeagueBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    venue_id: int = Field(foreign_key="venue.id", index=True)
    sport_id: int = Field(foreign_key="sport.id", index=True)

    venue: Venue = Relationship(back_populates="leagues")
    sport: Sport = Relationship()
    seasons: list["Season"] = Relationship(back_populates="league")
    registrations: list["Registration"] = Relationship(back_populates="league")
    teams: list["Team"] = Relationship(back_populates="league")


class SeasonBase(SQLModel):
    name: str = Field(index=True)
    start_date: datetime | None = Field(default=None, index=True)
    end_date: datetime | None = Field(default=None, index=True)
    is_active: bool = Field(default=True, index=True)
    registration_open: bool = Field(default=True)
    registration_deadline: datetime | None = None


class Season(SeasonBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="league.id", index=True)

    league: League = Relationship(back_populates="seasons")
    games: list["Game"] = Relationship(back_populates="season")


class Registration(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="league.id", index=True)
    season_id: int | None = Field(default=None, foreign_key="season.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    team_id: int | None = Field(default=None, foreign_key="team.id", index=True)
    status: RegistrationStatus = Field(default=RegistrationStatus.pending, index=True)
    role: LeagueRole = Field(default=LeagueRole.participant, index=True)
    payment_status: str | None = Field(default=None, index=True)
    payment_amount: float | None = None
    payment_intent_id: str | None = Field(default=None, index=True)
    notes: str | None = None

    league: League = Relationship(back_populates="registrations")
    user: User = Relationship(back_populates="registrations")
    team: Optional["Team"] = Relationship(back_populates="registrations")


class TeamBase(SQLModel):
    name: str = Field(index=True)
    city: str | None = None
    logo_url: str | None = None


class Team(TeamBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="league.id", index=True)
    captain_id: int | None = Field(default=None, foreign_key="user.id", index=True)

    league: League = Relationship(back_populates="teams")
    players: list["Player"] = Relationship(back_populates="team")
    registrations: list["Registration"] = Relationship(back_populates="team")


class PlayerBase(SQLModel):
    first_name: str
    last_name: str
    position: str | None = Field(default=None, index=True)
    number: int | None = None
    handicap: float | None = None
    ghin_number: str | None = None


class Player(PlayerBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id", index=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)

    team: Team = Relationship(back_populates="players")


class GameBase(SQLModel):
    start_time: datetime | None = Field(default=None, index=True)
    end_time: datetime | None = None
    location: str | None = None
    status: GameStatus = Field(default=GameStatus.scheduled, index=True)
    home_score: int | None = None
    away_score: int | None = None
    notes: str | None = None


class Game(GameBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    season_id: int = Field(foreign_key="season.id", index=True)
    home_team_id: int | None = Field(default=None, foreign_key="team.id", index=True)
    away_team_id: int | None = Field(default=None, foreign_key="team.id", index=True)
    home_player_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    away_player_id: int | None = Field(default=None, foreign_key="user.id", index=True)

    season: Season = Relationship(back_populates="games")
    score_submissions: list["ScoreSubmission"] = Relationship(back_populates="game")


class ScoreSubmission(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    game_id: int = Field(foreign_key="game.id", index=True)
    submitted_by: int = Field(foreign_key="user.id", index=True)
    home_score: int | None = None
    away_score: int | None = None
    details: str | None = None
    is_verified: bool = Field(default=False)
    verified_by: int | None = Field(default=None, foreign_key="user.id")
    verified_at: datetime | None = None

    game: Game = Relationship(back_populates="score_submissions")


class PostBase(SQLModel):
    title: str = Field(index=True)
    body: str
    is_pinned: bool = Field(default=False)
    post_type: str = Field(default="general", index=True)


class Post(PostBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id", index=True)
    venue_id: int | None = Field(default=None, foreign_key="venue.id", index=True)
    league_id: int | None = Field(default=None, foreign_key="league.id", index=True)

    author: User = Relationship(back_populates="posts")
    venue: Optional[Venue] = Relationship(back_populates="posts")


class Prediction(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    game_id: int = Field(foreign_key="game.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    predicted_winner_team_id: int | None = Field(default=None, foreign_key="team.id")
    predicted_winner_user_id: int | None = Field(default=None, foreign_key="user.id")
    confidence_points: int = Field(default=1, ge=1, le=10)
    is_correct: bool | None = None
    points_earned: int | None = None


class Standing(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    season_id: int = Field(foreign_key="season.id", index=True)
    team_id: int | None = Field(default=None, foreign_key="team.id", index=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    rank: int = Field(default=0, index=True)
    wins: int = Field(default=0)
    losses: int = Field(default=0)
    ties: int = Field(default=0)
    points: float = Field(default=0)
    games_played: int = Field(default=0)
    points_for: int = Field(default=0)
    points_against: int = Field(default=0)
    custom_stats: str | None = None


class Comment(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    author_id: int = Field(foreign_key="user.id", index=True)
    parent_id: int | None = Field(default=None, foreign_key="comment.id", index=True)
    body: str
    is_deleted: bool = Field(default=False)


class ReactionType(str, Enum):
    like = "like"
    love = "love"
    celebrate = "celebrate"
    insightful = "insightful"
    curious = "curious"


class NotificationType(str, Enum):
    new_league = "new_league"
    registration_deadline = "registration_deadline"
    registration_approved = "registration_approved"
    registration_rejected = "registration_rejected"
    game_scheduled = "game_scheduled"
    game_result = "game_result"
    score_verified = "score_verified"
    prediction_resolved = "prediction_resolved"
    new_post = "new_post"
    comment_reply = "comment_reply"
    mention = "mention"


class Reaction(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    post_id: int | None = Field(default=None, foreign_key="post.id", index=True)
    comment_id: int | None = Field(default=None, foreign_key="comment.id", index=True)
    reaction_type: ReactionType = Field(default=ReactionType.like, index=True)


class Notification(Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    notification_type: NotificationType = Field(index=True)
    title: str
    message: str
    link: str | None = None
    is_read: bool = Field(default=False, index=True)
    related_id: int | None = None
    related_type: str | None = None


class OnlineGame(Timestamped, table=True):
    __tablename__ = "online_game"

    id: int | None = Field(default=None, primary_key=True)
    game_type: OnlineGameType = Field(index=True)
    status: OnlineGameStatus = Field(default=OnlineGameStatus.waiting, index=True)
    player1_id: int = Field(foreign_key="user.id", index=True)
    player2_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    current_turn: int | None = None
    winner_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    board_state: str | None = None
    moves_history: str | None = None
    season_id: int | None = Field(default=None, foreign_key="season.id", index=True)
    league_id: int | None = Field(default=None, foreign_key="league.id", index=True)
    is_ranked: bool = Field(default=False)
    time_limit_seconds: int | None = None
    player1_time_remaining: int | None = None
    player2_time_remaining: int | None = None


class OnlineGameMatch(Timestamped, table=True):
    __tablename__ = "online_game_match"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    game_type: OnlineGameType = Field(index=True)
    is_searching: bool = Field(default=True, index=True)
    elo_rating: int = Field(default=1200)
    preferred_time_limit: int | None = None
