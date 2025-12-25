from datetime import datetime
from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


T = TypeVar("T")


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


class VenueRole(str, Enum):
    owner = "owner"
    admin = "admin"
    staff = "staff"


class LeagueRole(str, Enum):
    organizer = "organizer"
    captain = "captain"
    participant = "participant"


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class ErrorDetail(BaseModel):
    loc: list[str] | None = None
    msg: str
    type: str | None = None


class ErrorResponse(BaseModel):
    detail: str | list[ErrorDetail]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        import re
        if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$", v):
            raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
        return v


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=2000)
    avatar_url: str | None = Field(default=None, max_length=500)
    latitude: float | None = None
    longitude: float | None = None
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    bio: str | None = None
    avatar_url: str | None = None
    city: str | None = None
    state: str | None = None
    created_at: datetime


class VenueCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    venue_type: VenueType = VenueType.other
    address: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    zip_code: str | None = Field(default=None, max_length=20)
    country: str = Field(default="US", max_length=100)
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    website: str | None = Field(default=None, max_length=500)
    is_virtual: bool = False


class VenueUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    venue_type: VenueType | None = None
    address: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    zip_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    website: str | None = Field(default=None, max_length=500)
    is_virtual: bool | None = None


class VenueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    name: str
    description: str | None
    venue_type: VenueType
    address: str | None
    city: str | None
    state: str | None
    zip_code: str | None
    country: str
    latitude: float | None
    longitude: float | None
    phone: str | None
    email: str | None
    website: str | None
    logo_url: str | None
    is_virtual: bool
    created_at: datetime


class SportCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: SportCategory
    description: str | None = Field(default=None, max_length=2000)
    icon: str | None = Field(default=None, max_length=100)
    scoring_type: ScoringType = ScoringType.points
    team_based: bool = True
    min_players_per_team: int = Field(default=1, ge=1)
    max_players_per_team: int | None = Field(default=None, ge=1)
    is_online: bool = False
    scoring_rules: str | None = None
    standings_rules: str | None = None


class SportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: SportCategory
    description: str | None
    icon: str | None
    scoring_type: ScoringType
    team_based: bool
    min_players_per_team: int
    max_players_per_team: int | None
    is_online: bool
    scoring_rules: str | None
    standings_rules: str | None
    created_at: datetime


class LeagueCreate(BaseModel):
    venue_id: int
    sport_id: int
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    registration_mode: RegistrationMode = RegistrationMode.open
    registration_fee: float | None = Field(default=None, ge=0)
    max_participants: int | None = Field(default=None, ge=1)
    min_participants: int | None = Field(default=None, ge=1)


class LeagueUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    registration_mode: RegistrationMode | None = None
    registration_fee: float | None = Field(default=None, ge=0)
    max_participants: int | None = Field(default=None, ge=1)
    min_participants: int | None = Field(default=None, ge=1)
    is_active: bool | None = None


class LeagueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    venue_id: int
    sport_id: int
    name: str
    description: str | None
    registration_mode: RegistrationMode
    registration_fee: float | None
    max_participants: int | None
    min_participants: int | None
    is_active: bool
    created_at: datetime


class SeasonCreate(BaseModel):
    league_id: int
    name: str = Field(..., min_length=1, max_length=255)
    start_date: datetime | None = None
    end_date: datetime | None = None
    registration_deadline: datetime | None = None


class SeasonUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    start_date: datetime | None = None
    end_date: datetime | None = None
    is_active: bool | None = None
    registration_open: bool | None = None
    registration_deadline: datetime | None = None


class SeasonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    league_id: int
    name: str
    start_date: datetime | None
    end_date: datetime | None
    is_active: bool
    registration_open: bool
    registration_deadline: datetime | None
    created_at: datetime


class RegistrationCreate(BaseModel):
    league_id: int
    team_id: int | None = None
    notes: str | None = Field(default=None, max_length=1000)


class RegistrationUpdate(BaseModel):
    status: RegistrationStatus | None = None
    team_id: int | None = None
    role: LeagueRole | None = None
    payment_status: str | None = Field(default=None, max_length=50)
    payment_amount: float | None = Field(default=None, ge=0)
    notes: str | None = Field(default=None, max_length=1000)


class RegistrationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    league_id: int
    user_id: int
    team_id: int | None
    status: RegistrationStatus
    role: LeagueRole
    payment_status: str | None
    payment_amount: float | None
    notes: str | None
    created_at: datetime


class TeamCreate(BaseModel):
    league_id: int
    name: str = Field(..., min_length=1, max_length=255)
    city: str | None = Field(default=None, max_length=255)


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    city: str | None = Field(default=None, max_length=255)
    captain_id: int | None = None


class TeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    league_id: int
    name: str
    city: str | None
    logo_url: str | None
    captain_id: int | None
    created_at: datetime


class PlayerCreate(BaseModel):
    team_id: int
    user_id: int | None = None
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    position: str | None = Field(default=None, max_length=50)
    number: int | None = Field(default=None, ge=0, le=999)
    handicap: float | None = None
    ghin_number: str | None = Field(default=None, max_length=20)


class PlayerUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    position: str | None = Field(default=None, max_length=50)
    number: int | None = Field(default=None, ge=0, le=999)
    handicap: float | None = None
    ghin_number: str | None = Field(default=None, max_length=20)


class PlayerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    user_id: int | None
    first_name: str
    last_name: str
    position: str | None
    number: int | None
    handicap: float | None
    ghin_number: str | None
    created_at: datetime


class GameCreate(BaseModel):
    season_id: int
    home_team_id: int | None = None
    away_team_id: int | None = None
    home_player_id: int | None = None
    away_player_id: int | None = None
    start_time: datetime | None = None
    location: str | None = Field(default=None, max_length=500)
    status: GameStatus = GameStatus.scheduled


class GameUpdate(BaseModel):
    start_time: datetime | None = None
    end_time: datetime | None = None
    location: str | None = Field(default=None, max_length=500)
    status: GameStatus | None = None
    home_score: int | None = Field(default=None, ge=0)
    away_score: int | None = Field(default=None, ge=0)
    notes: str | None = Field(default=None, max_length=2000)


class GameRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    season_id: int
    home_team_id: int | None
    away_team_id: int | None
    home_player_id: int | None
    away_player_id: int | None
    start_time: datetime | None
    end_time: datetime | None
    location: str | None
    status: str
    home_score: int | None
    away_score: int | None
    notes: str | None
    created_at: datetime


class ScoreSubmissionCreate(BaseModel):
    game_id: int
    home_score: int | None = Field(default=None, ge=0)
    away_score: int | None = Field(default=None, ge=0)
    details: str | None = Field(default=None, max_length=5000)


class ScoreSubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    game_id: int
    submitted_by: int
    home_score: int | None
    away_score: int | None
    details: str | None
    is_verified: bool
    verified_by: int | None
    verified_at: datetime | None
    created_at: datetime


class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1, max_length=50000)
    venue_id: int | None = None
    league_id: int | None = None
    post_type: str = Field(default="general", max_length=50)
    is_pinned: bool = False


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    body: str | None = Field(default=None, min_length=1, max_length=50000)
    post_type: str | None = Field(default=None, max_length=50)
    is_pinned: bool | None = None


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    venue_id: int | None
    league_id: int | None
    title: str
    body: str
    post_type: str
    is_pinned: bool
    created_at: datetime


class PredictionCreate(BaseModel):
    game_id: int
    predicted_winner_team_id: int | None = None
    predicted_winner_user_id: int | None = None
    confidence_points: int = Field(default=1, ge=1, le=10)


class PredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    game_id: int
    user_id: int
    predicted_winner_team_id: int | None
    predicted_winner_user_id: int | None
    confidence_points: int
    is_correct: bool | None
    points_earned: int | None
    created_at: datetime


class StandingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    season_id: int
    team_id: int | None
    user_id: int | None
    rank: int
    wins: int
    losses: int
    ties: int
    points: float
    games_played: int
    points_for: int
    points_against: int
    custom_stats: str | None
    created_at: datetime


class LocationSearch(BaseModel):
    latitude: float
    longitude: float
    radius_miles: float = Field(default=25, ge=1, le=500)


class ReactionType(str, Enum):
    like = "like"
    love = "love"
    celebrate = "celebrate"
    insightful = "insightful"
    curious = "curious"


class CommentCreate(BaseModel):
    post_id: int
    body: str = Field(..., min_length=1, max_length=10000)
    parent_id: int | None = None


class CommentUpdate(BaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    author_id: int
    parent_id: int | None
    body: str
    is_deleted: bool
    created_at: datetime


class ReactionCreate(BaseModel):
    post_id: int | None = None
    comment_id: int | None = None
    reaction_type: ReactionType = ReactionType.like


class ReactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    post_id: int | None
    comment_id: int | None
    reaction_type: str
    created_at: datetime


def paginate(items: list, total: int, page: int, page_size: int) -> dict:
    pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }
