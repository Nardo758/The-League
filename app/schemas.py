from datetime import datetime
from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


T = TypeVar("T")


class GameStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    final = "final"
    cancelled = "cancelled"
    postponed = "postponed"


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


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    created_at: datetime


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)


class OrganizationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    owner_id: int
    created_at: datetime


class LeagueCreate(BaseModel):
    org_id: int
    name: str = Field(..., min_length=1, max_length=255)
    sport: str | None = Field(default=None, max_length=100)
    season: str | None = Field(default=None, max_length=100)


class LeagueUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sport: str | None = Field(default=None, max_length=100)
    season: str | None = Field(default=None, max_length=100)


class LeagueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    org_id: int
    name: str
    sport: str | None
    season: str | None
    created_at: datetime


class TeamCreate(BaseModel):
    league_id: int
    name: str = Field(..., min_length=1, max_length=255)
    city: str | None = Field(default=None, max_length=255)


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    city: str | None = Field(default=None, max_length=255)


class TeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    league_id: int
    name: str
    city: str | None
    created_at: datetime


class PlayerCreate(BaseModel):
    team_id: int
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    position: str | None = Field(default=None, max_length=50)
    number: int | None = Field(default=None, ge=0, le=999)


class PlayerUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    position: str | None = Field(default=None, max_length=50)
    number: int | None = Field(default=None, ge=0, le=999)


class PlayerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    first_name: str
    last_name: str
    position: str | None
    number: int | None
    created_at: datetime


class GameCreate(BaseModel):
    league_id: int
    home_team_id: int
    away_team_id: int
    start_time: datetime | None = None
    location: str | None = Field(default=None, max_length=500)
    status: GameStatus = GameStatus.scheduled
    home_score: int | None = Field(default=None, ge=0)
    away_score: int | None = Field(default=None, ge=0)

    @field_validator("away_team_id")
    @classmethod
    def teams_must_differ(cls, v: int, info) -> int:
        if "home_team_id" in info.data and v == info.data["home_team_id"]:
            raise ValueError("home_team_id and away_team_id must be different")
        return v


class GameUpdate(BaseModel):
    start_time: datetime | None = None
    location: str | None = Field(default=None, max_length=500)
    status: GameStatus | None = None
    home_score: int | None = Field(default=None, ge=0)
    away_score: int | None = Field(default=None, ge=0)


class GameRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    league_id: int
    home_team_id: int
    away_team_id: int
    start_time: datetime | None
    location: str | None
    status: str
    home_score: int | None
    away_score: int | None
    created_at: datetime


class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1, max_length=50000)
    org_id: int | None = None
    league_id: int | None = None


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    body: str | None = Field(default=None, min_length=1, max_length=50000)


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    org_id: int | None
    league_id: int | None
    title: str
    body: str
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
