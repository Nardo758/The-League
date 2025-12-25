from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import generate_request_id, request_id_var, setup_logging
from app.db import init_db
from app.routers import (
    ai,
    auth,
    comments,
    games,
    leagues,
    notifications,
    online_games,
    payments,
    players,
    posts,
    predictions,
    registrations,
    seasons,
    sports,
    standings,
    teams,
    tournaments,
    users,
    venues,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()
    init_db()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter

if settings.environment == "production":
    if settings.cors_origins.strip() == "*":
        origins = []
    else:
        origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
else:
    origins = ["*"] if settings.cors_origins.strip() == "*" else [o.strip() for o in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id_and_security_headers(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or generate_request_id()
    request_id_var.set(request_id)

    response: Response = await call_next(request)

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/health")
def health():
    return {"ok": True}


from app.routers import metrics, realtime

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(venues.router)
app.include_router(sports.router)
app.include_router(leagues.router)
app.include_router(seasons.router)
app.include_router(registrations.router)
app.include_router(teams.router)
app.include_router(players.router)
app.include_router(games.router)
app.include_router(standings.router)
app.include_router(predictions.router)
app.include_router(comments.router)
app.include_router(notifications.router)
app.include_router(online_games.router)
app.include_router(payments.router)
app.include_router(posts.router)
app.include_router(tournaments.router)
app.include_router(ai.router)
app.include_router(realtime.router)
app.include_router(metrics.router)
