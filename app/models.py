from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Timestamped(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: str | None = None
    is_active: bool = True


class User(UserBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str

    orgs: list["Organization"] = Relationship(back_populates="owner")
    posts: list["Post"] = Relationship(back_populates="author")


class UserCreate(SQLModel):
    email: str
    password: str
    full_name: str | None = None


class UserRead(UserBase, Timestamped):
    id: int


class OrganizationBase(SQLModel):
    name: str = Field(index=True)
    description: str | None = None


class Organization(OrganizationBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)

    owner: User = Relationship(back_populates="orgs")
    leagues: list["League"] = Relationship(back_populates="org")
    posts: list["Post"] = Relationship(back_populates="org")


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationRead(OrganizationBase, Timestamped):
    id: int
    owner_id: int


class LeagueBase(SQLModel):
    name: str = Field(index=True)
    sport: str | None = Field(default=None, index=True)
    season: str | None = Field(default=None, index=True)


class League(LeagueBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organization.id", index=True)

    org: Organization = Relationship(back_populates="leagues")
    teams: list["Team"] = Relationship(back_populates="league")
    games: list["Game"] = Relationship(back_populates="league")


class LeagueCreate(LeagueBase):
    org_id: int


class LeagueRead(LeagueBase, Timestamped):
    id: int
    org_id: int


class TeamBase(SQLModel):
    name: str = Field(index=True)
    city: str | None = None


class Team(TeamBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="league.id", index=True)

    league: League = Relationship(back_populates="teams")
    players: list["Player"] = Relationship(back_populates="team")


class TeamCreate(TeamBase):
    league_id: int


class TeamRead(TeamBase, Timestamped):
    id: int
    league_id: int


class PlayerBase(SQLModel):
    first_name: str
    last_name: str
    position: str | None = Field(default=None, index=True)
    number: int | None = None


class Player(PlayerBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id", index=True)

    team: Team = Relationship(back_populates="players")


class PlayerCreate(PlayerBase):
    team_id: int


class PlayerRead(PlayerBase, Timestamped):
    id: int
    team_id: int


class GameBase(SQLModel):
    start_time: datetime | None = Field(default=None, index=True)
    location: str | None = None
    status: str = Field(default="scheduled", index=True)  # scheduled|in_progress|final
    home_score: int | None = None
    away_score: int | None = None


class Game(GameBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="league.id", index=True)
    home_team_id: int = Field(foreign_key="team.id", index=True)
    away_team_id: int = Field(foreign_key="team.id", index=True)

    league: League = Relationship(back_populates="games")


class GameCreate(GameBase):
    league_id: int
    home_team_id: int
    away_team_id: int


class GameRead(GameBase, Timestamped):
    id: int
    league_id: int
    home_team_id: int
    away_team_id: int


class PostBase(SQLModel):
    title: str = Field(index=True)
    body: str


class Post(PostBase, Timestamped, table=True):
    id: int | None = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id", index=True)
    org_id: int | None = Field(default=None, foreign_key="organization.id", index=True)
    league_id: int | None = Field(default=None, foreign_key="league.id", index=True)

    author: User = Relationship(back_populates="posts")
    org: Optional[Organization] = Relationship(back_populates="posts")


class PostCreate(PostBase):
    org_id: int | None = None
    league_id: int | None = None


class PostRead(PostBase, Timestamped):
    id: int
    author_id: int
    org_id: int | None
    league_id: int | None

