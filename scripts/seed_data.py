#!/usr/bin/env python3
"""Seed the database with mock data for all user groups."""

import sys
sys.path.insert(0, '/home/runner/workspace')

from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.db import engine
from app.models import (
    User, Venue, VenueMember, Sport, VenueSport, League, Season,
    Registration, Team, Player, Game, OnlineGame, Tournament, TournamentMatch,
    Post, Notification,
    VenueType, SportCategory, ScoringType, RegistrationMode, RegistrationStatus,
    GameStatus, VenueRole, LeagueRole, OnlineGameType, OnlineGameStatus,
    TournamentFormat, TournamentStatus
)
from app.security import hash_password

def seed_database():
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == "player1@example.com")).first()
        if existing:
            print("Database already seeded. Skipping...")
            return

        print("Seeding database with mock data...")

        players = []
        player_data = [
            ("player1@example.com", "Alex Martinez", "Phoenix", "AZ", 33.4484, -112.0740),
            ("player2@example.com", "Mike Chen", "Scottsdale", "AZ", 33.4942, -111.9261),
            ("player3@example.com", "Sarah Williams", "Tempe", "AZ", 33.4255, -111.9400),
            ("player4@example.com", "John Davis", "Mesa", "AZ", 33.4152, -111.8315),
            ("player5@example.com", "Emily Johnson", "Chandler", "AZ", 33.3062, -111.8413),
            ("player6@example.com", "Chris Thompson", "Gilbert", "AZ", 33.3528, -111.7890),
            ("player7@example.com", "Jessica Lee", "Glendale", "AZ", 33.5387, -112.1860),
            ("player8@example.com", "David Garcia", "Peoria", "AZ", 33.5806, -112.2374),
        ]
        for email, name, city, state, lat, lng in player_data:
            user = User(
                email=email,
                full_name=name,
                hashed_password=hash_password("password123"),
                city=city,
                state=state,
                latitude=lat,
                longitude=lng,
                bio=f"Recreational sports enthusiast from {city}"
            )
            session.add(user)
            players.append(user)

        venue_admins = []
        admin_data = [
            ("admin1@desertridge.com", "Tom Wilson", "Desert Ridge Golf Club"),
            ("admin2@metrocenter.com", "Lisa Brown", "Metro Pickleball Center"),
            ("admin3@sunsetlanes.com", "Mark Anderson", "Sunset Lanes"),
            ("admin4@westside.com", "Karen Miller", "Westside Sports Complex"),
        ]
        for email, name, venue_name in admin_data:
            user = User(
                email=email,
                full_name=name,
                hashed_password=hash_password("admin123"),
                city="Phoenix",
                state="AZ",
                latitude=33.4484,
                longitude=-112.0740,
                bio=f"Venue manager at {venue_name}"
            )
            session.add(user)
            venue_admins.append(user)

        session.commit()
        for u in players + venue_admins:
            session.refresh(u)

        print(f"Created {len(players)} players and {len(venue_admins)} venue admins")

        sports_data = [
            ("Golf", SportCategory.golf, ScoringType.stroke_play, "18-hole stroke play golf"),
            ("Pickleball", SportCategory.pickleball, ScoringType.points, "Doubles and singles pickleball"),
            ("Bowling", SportCategory.bowling, ScoringType.frames, "10-pin bowling leagues"),
            ("Softball", SportCategory.softball, ScoringType.wins_losses, "Slow-pitch softball"),
            ("Tennis", SportCategory.tennis, ScoringType.sets, "Singles and doubles tennis"),
            ("Soccer", SportCategory.soccer, ScoringType.points, "Indoor and outdoor soccer"),
            ("Chess", SportCategory.chess, ScoringType.wins_losses, "Competitive chess"),
            ("Checkers", SportCategory.checkers, ScoringType.wins_losses, "Classic checkers"),
            ("Connect Four", SportCategory.connect_four, ScoringType.wins_losses, "Connect Four strategy game"),
            ("Battleship", SportCategory.battleship, ScoringType.wins_losses, "Naval battle strategy"),
        ]
        sports = []
        for name, category, scoring, desc in sports_data:
            sport = Sport(name=name, category=category, scoring_type=scoring, description=desc)
            session.add(sport)
            sports.append(sport)
        session.commit()
        for s in sports:
            session.refresh(s)
        print(f"Created {len(sports)} sports")

        venues_data = [
            (venue_admins[0].id, "Desert Ridge Golf Club", VenueType.golf_course,
             "21500 N Pima Rd", "Scottsdale", "AZ", "85255", 33.6784, -111.8902,
             "Premier 18-hole championship golf course with stunning desert views"),
            (venue_admins[1].id, "Metro Pickleball Center", VenueType.sports_complex,
             "2800 E Camelback Rd", "Phoenix", "AZ", "85016", 33.5094, -111.9876,
             "12-court indoor pickleball facility with pro shop"),
            (venue_admins[2].id, "Sunset Lanes", VenueType.bowling_alley,
             "4500 W Glendale Ave", "Glendale", "AZ", "85301", 33.5387, -112.1860,
             "40-lane bowling center with arcade and bar"),
            (venue_admins[3].id, "Westside Sports Complex", VenueType.sports_complex,
             "7500 W Encanto Blvd", "Phoenix", "AZ", "85035", 33.4734, -112.2374,
             "Multi-sport complex with softball fields, soccer pitches, and tennis courts"),
        ]
        venues = []
        for owner_id, name, vtype, addr, city, state, zip_code, lat, lng, desc in venues_data:
            venue = Venue(
                owner_id=owner_id, name=name, venue_type=vtype, address=addr,
                city=city, state=state, zip_code=zip_code, latitude=lat, longitude=lng,
                description=desc, phone="(602) 555-0100", email=f"info@{name.lower().replace(' ', '')}.com"
            )
            session.add(venue)
            venues.append(venue)
        session.commit()
        for v in venues:
            session.refresh(v)
        print(f"Created {len(venues)} venues")

        for i, venue in enumerate(venues):
            member = VenueMember(venue_id=venue.id, user_id=venue_admins[i].id, role=VenueRole.owner)
            session.add(member)
        session.commit()

        venue_sports_map = [
            (venues[0].id, [sports[0].id]),
            (venues[1].id, [sports[1].id, sports[4].id]),
            (venues[2].id, [sports[2].id]),
            (venues[3].id, [sports[3].id, sports[5].id, sports[4].id]),
        ]
        for venue_id, sport_ids in venue_sports_map:
            for sport_id in sport_ids:
                vs = VenueSport(venue_id=venue_id, sport_id=sport_id)
                session.add(vs)
        session.commit()

        leagues_data = [
            (venues[0].id, sports[0].id, "Monday Night Golf League", "Weekly stroke play competition", 450.0),
            (venues[0].id, sports[0].id, "Wednesday Scramble Series", "Team scramble format", 400.0),
            (venues[1].id, sports[1].id, "Pickleball Ladder League", "Competitive ladder system", 150.0),
            (venues[1].id, sports[1].id, "Mixed Doubles League", "Mixed doubles round robin", 200.0),
            (venues[2].id, sports[2].id, "Thursday Night Bowling", "Team bowling league", 250.0),
            (venues[2].id, sports[2].id, "Friday Fun League", "Casual bowling league", 150.0),
            (venues[3].id, sports[3].id, "Citywide Softball Championship", "Competitive slow-pitch", 500.0),
            (venues[3].id, sports[5].id, "Indoor Soccer League", "7v7 indoor soccer", 350.0),
            (venues[3].id, sports[4].id, "Weekend Tennis Ladder", "Singles tennis ladder", 175.0),
        ]
        leagues = []
        for venue_id, sport_id, name, desc, fee in leagues_data:
            league = League(
                venue_id=venue_id, sport_id=sport_id, name=name, description=desc,
                registration_fee=fee, max_participants=16, is_active=True
            )
            session.add(league)
            leagues.append(league)
        session.commit()
        for l in leagues:
            session.refresh(l)
        print(f"Created {len(leagues)} leagues")

        now = datetime.utcnow()
        seasons = []
        for league in leagues:
            season = Season(
                league_id=league.id,
                name=f"Winter 2025",
                start_date=now + timedelta(days=7),
                end_date=now + timedelta(days=90),
                registration_open=True,
                registration_deadline=now + timedelta(days=3),
                is_active=True
            )
            session.add(season)
            seasons.append(season)
        session.commit()
        for s in seasons:
            session.refresh(s)
        print(f"Created {len(seasons)} seasons")

        for i, player in enumerate(players):
            league_idx = i % len(leagues)
            reg = Registration(
                league_id=leagues[league_idx].id,
                user_id=player.id,
                status=RegistrationStatus.approved,
                payment_status="paid",
                payment_amount=leagues[league_idx].registration_fee
            )
            session.add(reg)
        session.commit()
        print(f"Created registrations for {len(players)} players")

        teams_data = [
            (leagues[0].id, "Eagle Squad", players[0].id),
            (leagues[0].id, "Birdie Hunters", players[1].id),
            (leagues[2].id, "Court Kings", players[2].id),
            (leagues[2].id, "Dink Masters", players[3].id),
            (leagues[4].id, "Strike Force", players[4].id),
            (leagues[4].id, "Pin Crushers", players[5].id),
            (leagues[6].id, "Red Sox Elite", players[6].id),
            (leagues[6].id, "Diamond Kings", players[7].id),
        ]
        teams = []
        for league_id, name, captain_id in teams_data:
            team = Team(league_id=league_id, name=name, captain_id=captain_id)
            session.add(team)
            teams.append(team)
        session.commit()
        for t in teams:
            session.refresh(t)
        print(f"Created {len(teams)} teams")

        for i, player in enumerate(players):
            team_idx = i % len(teams)
            p = Player(team_id=teams[team_idx].id, user_id=player.id, jersey_number=str(10 + i))
            session.add(p)
        session.commit()

        games_data = [
            (leagues[0].id, teams[0].id, teams[1].id, GameStatus.in_progress, 72, 75),
            (leagues[2].id, teams[2].id, teams[3].id, GameStatus.in_progress, 11, 9),
            (leagues[4].id, teams[4].id, teams[5].id, GameStatus.in_progress, 180, 165),
            (leagues[6].id, teams[6].id, teams[7].id, GameStatus.scheduled, None, None),
        ]
        for league_id, home_id, away_id, status, home_score, away_score in games_data:
            game = Game(
                league_id=league_id,
                home_team_id=home_id,
                away_team_id=away_id,
                start_time=now + timedelta(hours=2),
                status=status,
                home_score=home_score,
                away_score=away_score
            )
            session.add(game)
        session.commit()
        print("Created games")

        online_games_data = [
            (players[0].id, players[1].id, OnlineGameType.chess, OnlineGameStatus.in_progress),
            (players[2].id, players[3].id, OnlineGameType.checkers, OnlineGameStatus.in_progress),
            (players[4].id, players[5].id, OnlineGameType.connect_four, OnlineGameStatus.in_progress),
            (players[6].id, None, OnlineGameType.chess, OnlineGameStatus.waiting),
            (players[0].id, players[2].id, OnlineGameType.battleship, OnlineGameStatus.in_progress),
        ]
        for p1_id, p2_id, game_type, status in online_games_data:
            og = OnlineGame(
                player1_id=p1_id,
                player2_id=p2_id,
                game_type=game_type,
                status=status,
                game_state={"board": [], "current_turn": p1_id}
            )
            session.add(og)
        session.commit()
        print("Created online games")

        tournaments_data = [
            ("Chess Grand Masters Cup", OnlineGameType.chess, 32, TournamentStatus.registration),
            ("Connect 4 Speed Tournament", OnlineGameType.connect_four, 16, TournamentStatus.in_progress),
            ("Checkers Championship", OnlineGameType.checkers, 16, TournamentStatus.registration),
        ]
        for name, game_type, max_p, status in tournaments_data:
            t = Tournament(
                name=name,
                game_type=game_type,
                format=TournamentFormat.single_elimination,
                max_participants=max_p,
                current_participants=max_p // 2,
                status=status,
                created_by=players[0].id,
                time_limit_seconds=600
            )
            session.add(t)
        session.commit()
        print("Created tournaments")

        for player in players[:4]:
            for i, (message, ntype) in enumerate([
                ("Welcome to The League! Check out leagues near you.", "new_league"),
                ("New season registration is now open!", "registration_deadline"),
                ("Your match is starting in 2 hours.", "game_scheduled"),
            ]):
                notif = Notification(
                    user_id=player.id,
                    title="League Update" if i == 0 else "Reminder",
                    message=message,
                    notification_type=ntype,
                    is_read=i == 0
                )
                session.add(notif)
        session.commit()
        print("Created notifications")

        print("\n=== Seed Complete ===")
        print(f"Players: {len(players)} (password: password123)")
        print(f"Venue Admins: {len(venue_admins)} (password: admin123)")
        print(f"Venues: {len(venues)}")
        print(f"Leagues: {len(leagues)}")
        print(f"Seasons: {len(seasons)}")
        print(f"Teams: {len(teams)}")
        print("Online Games: 5 (3 in progress, 1 waiting, 1 battleship)")
        print("Tournaments: 3")
        print("\nTest Accounts:")
        print("  player1@example.com / password123 (Regular player)")
        print("  admin1@desertridge.com / admin123 (Venue admin)")

if __name__ == "__main__":
    seed_database()
