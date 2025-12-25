from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models import Game, GameStatus, League, Season, Sport, Standing, Team, User

router = APIRouter(prefix="/standings", tags=["standings"])


def calculate_standings_wins_losses(session: Session, season_id: int) -> list[dict]:
    games = session.exec(
        select(Game).where(
            Game.season_id == season_id,
            Game.status == GameStatus.final
        )
    ).all()

    team_stats = {}
    player_stats = {}

    for game in games:
        if game.home_score is None or game.away_score is None:
            continue

        if game.home_team_id:
            if game.home_team_id not in team_stats:
                team_stats[game.home_team_id] = {"wins": 0, "losses": 0, "ties": 0, "points_for": 0, "points_against": 0}
            if game.away_team_id not in team_stats:
                team_stats[game.away_team_id] = {"wins": 0, "losses": 0, "ties": 0, "points_for": 0, "points_against": 0}

            team_stats[game.home_team_id]["points_for"] += game.home_score
            team_stats[game.home_team_id]["points_against"] += game.away_score
            team_stats[game.away_team_id]["points_for"] += game.away_score
            team_stats[game.away_team_id]["points_against"] += game.home_score

            if game.home_score > game.away_score:
                team_stats[game.home_team_id]["wins"] += 1
                team_stats[game.away_team_id]["losses"] += 1
            elif game.away_score > game.home_score:
                team_stats[game.away_team_id]["wins"] += 1
                team_stats[game.home_team_id]["losses"] += 1
            else:
                team_stats[game.home_team_id]["ties"] += 1
                team_stats[game.away_team_id]["ties"] += 1

        if game.home_player_id:
            if game.home_player_id not in player_stats:
                player_stats[game.home_player_id] = {"wins": 0, "losses": 0, "ties": 0, "points_for": 0, "points_against": 0}
            if game.away_player_id not in player_stats:
                player_stats[game.away_player_id] = {"wins": 0, "losses": 0, "ties": 0, "points_for": 0, "points_against": 0}

            player_stats[game.home_player_id]["points_for"] += game.home_score
            player_stats[game.home_player_id]["points_against"] += game.away_score
            player_stats[game.away_player_id]["points_for"] += game.away_score
            player_stats[game.away_player_id]["points_against"] += game.home_score

            if game.home_score > game.away_score:
                player_stats[game.home_player_id]["wins"] += 1
                player_stats[game.away_player_id]["losses"] += 1
            elif game.away_score > game.home_score:
                player_stats[game.away_player_id]["wins"] += 1
                player_stats[game.home_player_id]["losses"] += 1
            else:
                player_stats[game.home_player_id]["ties"] += 1
                player_stats[game.away_player_id]["ties"] += 1

    standings = []

    for team_id, stats in team_stats.items():
        team = session.get(Team, team_id)
        games_played = stats["wins"] + stats["losses"] + stats["ties"]
        win_pct = stats["wins"] / games_played if games_played > 0 else 0
        standings.append({
            "type": "team",
            "team_id": team_id,
            "team_name": team.name if team else "Unknown",
            "user_id": None,
            "user_name": None,
            "wins": stats["wins"],
            "losses": stats["losses"],
            "ties": stats["ties"],
            "games_played": games_played,
            "win_percentage": round(win_pct, 3),
            "points_for": stats["points_for"],
            "points_against": stats["points_against"],
            "point_differential": stats["points_for"] - stats["points_against"]
        })

    for user_id, stats in player_stats.items():
        user = session.get(User, user_id)
        games_played = stats["wins"] + stats["losses"] + stats["ties"]
        win_pct = stats["wins"] / games_played if games_played > 0 else 0
        standings.append({
            "type": "player",
            "team_id": None,
            "team_name": None,
            "user_id": user_id,
            "user_name": user.full_name if user else "Unknown",
            "wins": stats["wins"],
            "losses": stats["losses"],
            "ties": stats["ties"],
            "games_played": games_played,
            "win_percentage": round(win_pct, 3),
            "points_for": stats["points_for"],
            "points_against": stats["points_against"],
            "point_differential": stats["points_for"] - stats["points_against"]
        })

    standings.sort(key=lambda x: (-x["wins"], x["losses"], -x["point_differential"]))

    for i, s in enumerate(standings):
        s["rank"] = i + 1

    return standings


def calculate_standings_stroke_play(session: Session, season_id: int) -> list[dict]:
    games = session.exec(
        select(Game).where(
            Game.season_id == season_id,
            Game.status == GameStatus.final
        )
    ).all()

    player_stats = {}

    for game in games:
        if game.home_player_id and game.home_score is not None:
            if game.home_player_id not in player_stats:
                player_stats[game.home_player_id] = {"total_strokes": 0, "rounds": 0}
            player_stats[game.home_player_id]["total_strokes"] += game.home_score
            player_stats[game.home_player_id]["rounds"] += 1

        if game.away_player_id and game.away_score is not None:
            if game.away_player_id not in player_stats:
                player_stats[game.away_player_id] = {"total_strokes": 0, "rounds": 0}
            player_stats[game.away_player_id]["total_strokes"] += game.away_score
            player_stats[game.away_player_id]["rounds"] += 1

    standings = []
    for user_id, stats in player_stats.items():
        user = session.get(User, user_id)
        avg_strokes = stats["total_strokes"] / stats["rounds"] if stats["rounds"] > 0 else 0
        standings.append({
            "type": "player",
            "team_id": None,
            "team_name": None,
            "user_id": user_id,
            "user_name": user.full_name if user else "Unknown",
            "total_strokes": stats["total_strokes"],
            "rounds_played": stats["rounds"],
            "average_strokes": round(avg_strokes, 2),
            "wins": 0,
            "losses": 0,
            "ties": 0,
            "games_played": stats["rounds"]
        })

    standings.sort(key=lambda x: (x["average_strokes"] if x["average_strokes"] > 0 else 999, -x["rounds_played"]))

    for i, s in enumerate(standings):
        s["rank"] = i + 1

    return standings


def calculate_standings_points(session: Session, season_id: int) -> list[dict]:
    games = session.exec(
        select(Game).where(
            Game.season_id == season_id,
            Game.status == GameStatus.final
        )
    ).all()

    team_stats = {}
    player_stats = {}

    for game in games:
        if game.home_team_id and game.home_score is not None:
            if game.home_team_id not in team_stats:
                team_stats[game.home_team_id] = {"total_points": 0, "games": 0}
            team_stats[game.home_team_id]["total_points"] += game.home_score
            team_stats[game.home_team_id]["games"] += 1

        if game.away_team_id and game.away_score is not None:
            if game.away_team_id not in team_stats:
                team_stats[game.away_team_id] = {"total_points": 0, "games": 0}
            team_stats[game.away_team_id]["total_points"] += game.away_score
            team_stats[game.away_team_id]["games"] += 1

        if game.home_player_id and game.home_score is not None:
            if game.home_player_id not in player_stats:
                player_stats[game.home_player_id] = {"total_points": 0, "games": 0}
            player_stats[game.home_player_id]["total_points"] += game.home_score
            player_stats[game.home_player_id]["games"] += 1

        if game.away_player_id and game.away_score is not None:
            if game.away_player_id not in player_stats:
                player_stats[game.away_player_id] = {"total_points": 0, "games": 0}
            player_stats[game.away_player_id]["total_points"] += game.away_score
            player_stats[game.away_player_id]["games"] += 1

    standings = []

    for team_id, stats in team_stats.items():
        team = session.get(Team, team_id)
        standings.append({
            "type": "team",
            "team_id": team_id,
            "team_name": team.name if team else "Unknown",
            "user_id": None,
            "user_name": None,
            "total_points": stats["total_points"],
            "games_played": stats["games"],
            "average_points": round(stats["total_points"] / stats["games"], 2) if stats["games"] > 0 else 0
        })

    for user_id, stats in player_stats.items():
        user = session.get(User, user_id)
        standings.append({
            "type": "player",
            "team_id": None,
            "team_name": None,
            "user_id": user_id,
            "user_name": user.full_name if user else "Unknown",
            "total_points": stats["total_points"],
            "games_played": stats["games"],
            "average_points": round(stats["total_points"] / stats["games"], 2) if stats["games"] > 0 else 0
        })

    standings.sort(key=lambda x: (-x["total_points"], -x["games_played"]))

    for i, s in enumerate(standings):
        s["rank"] = i + 1

    return standings


@router.get("/seasons/{season_id}")
def get_standings(
    season_id: int,
    session: Session = Depends(get_session)
):
    season = session.get(Season, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    league = session.get(League, season.league_id)
    sport = session.get(Sport, league.sport_id)

    if sport.scoring_type in ["stroke_play"]:
        standings = calculate_standings_stroke_play(session, season_id)
    elif sport.scoring_type in ["points", "frames"]:
        standings = calculate_standings_points(session, season_id)
    else:
        standings = calculate_standings_wins_losses(session, season_id)

    return {
        "season_id": season_id,
        "season_name": season.name,
        "league_name": league.name,
        "sport_name": sport.name,
        "scoring_type": sport.scoring_type,
        "standings": standings
    }


@router.post("/seasons/{season_id}/refresh")
def refresh_standings(
    season_id: int,
    session: Session = Depends(get_session)
):
    season = session.get(Season, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    league = session.get(League, season.league_id)
    sport = session.get(Sport, league.sport_id)

    session.exec(
        select(Standing).where(Standing.season_id == season_id)
    )
    existing = session.exec(
        select(Standing).where(Standing.season_id == season_id)
    ).all()
    for s in existing:
        session.delete(s)

    if sport.scoring_type in ["stroke_play"]:
        standings_data = calculate_standings_stroke_play(session, season_id)
    elif sport.scoring_type in ["points", "frames"]:
        standings_data = calculate_standings_points(session, season_id)
    else:
        standings_data = calculate_standings_wins_losses(session, season_id)

    for s in standings_data:
        standing = Standing(
            season_id=season_id,
            team_id=s.get("team_id"),
            user_id=s.get("user_id"),
            rank=s.get("rank", 0),
            wins=s.get("wins", 0),
            losses=s.get("losses", 0),
            ties=s.get("ties", 0),
            points=float(s.get("total_points", 0)),
            games_played=s.get("games_played", 0)
        )
        session.add(standing)

    session.commit()

    return {"message": "Standings refreshed", "count": len(standings_data)}
