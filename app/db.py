from collections.abc import Generator

from sqlalchemy import pool
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

is_sqlite = settings.database_url.startswith("sqlite")

if is_sqlite:
    connect_args = {"check_same_thread": False}
    engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)
else:
    engine = create_engine(
        settings.database_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300,
    )


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
