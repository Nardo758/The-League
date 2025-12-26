# Enhanced League Platform Architecture with Online Competitions & Polly-like Features

## Overview: Dual-Mode Platform Architecture

```yaml
Platform Evolution:
- Hybrid Model: IRL Sports + Online Competitions
- Social Marketplace: Polly-like user engagement features
- Multi-mode: Synchronous & asynchronous gameplay
- Community-driven content creation
```

## Updated System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DUAL-MODE PLATFORM                                  │
├──────────────────────────────┬─────────────────────────────────────────────┤
│   PHYSICAL SPORTS            │       ONLINE COMPETITIONS                  │
│   • Pickleball, Golf, etc.   │   • Chess, Checkers, Poker                 │
│   • Team-based               │   • Board games, eSports                   │
│   • Location-specific        │   • Video game tournaments                 │
│   • Scheduled events         │   • Real-time & async play                 │
└──────────────────────────────┴─────────────────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │     UNIFIED GAME ENGINE LAYER       │
                    ├─────────────────────────────────────┤
                    │  • Multi-game rule engine           │
                    │  • Real-time synchronization        │
                    │  • Matchmaking across modes         │
                    │  • Tournament bracket system        │
                    │  • Skill rating (Elo/Glicko)        │
                    └──────────────┬──────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POLLY-LIKE SOCIAL MARKETPLACE                           │
├──────────────┬──────────────┬──────────────┬───────────────────────────────┤
│ Predictions  │ Polls/Quizzes│ Challenges   │ Content Creation             │
│ & Betting    │              │ & Streaks    │ & UGC                        │
├──────────────┼──────────────┼──────────────┼───────────────────────────────┤
│• Game outcome│• Team polls  │• Daily/weekly│• Highlight sharing           │
│  prediction  │• MVP voting  │  challenges  │• Tutorial creation           │
│• Prop bets   │• Trivia games│• Skill streaks│• Strategy guides            │
│• Virtual     │• Fan surveys │• Achievement │• Community events            │
│  currency    │              │  systems     │• Meme/Reaction creation      │
└──────────────┴──────────────┴──────────────┴───────────────────────────────┘
```

## 1. Online Competitions System

### Game Engine Architecture
```python
# game_engine.py - Unified game management
from enum import Enum
from typing import Dict, Any, List
import asyncio

class GameType(Enum):
    PHYSICAL = "physical"  # Golf, pickleball, etc.
    BOARD = "board"        # Chess, checkers, backgammon
    CARD = "card"          # Poker, bridge
    ESPORTS = "esports"    # Video games
    CASUAL = "casual"      # Word games, trivia

class GameEngine:
    def __init__(self):
        self.games = {
            "chess": ChessEngine(),
            "checkers": CheckersEngine(),
            "poker": PokerEngine(),
            "8ball": EightBallEngine(),
            "wordle": WordleEngine()
        }
    
    async def create_match(self, game_type: str, config: Dict) -> Match:
        """Create a new game match"""
        engine = self.games.get(game_type)
        if not engine:
            raise ValueError(f"Unsupported game type: {game_type}")
        
        match = Match(
            game_type=game_type,
            players=config["players"],
            rules=config["rules"],
            mode=config.get("mode", "synchronous")  # sync, async, turn-based
        )
        
        # Initialize game state
        match.state = engine.initialize(config)
        
        # Set up real-time connection if synchronous
        if config["mode"] == "synchronous":
            await self.setup_realtime_channel(match.id)
        
        return match
    
    async def make_move(self, match_id: str, player_id: str, move: Dict):
        """Process a game move"""
        match = await self.get_match(match_id)
        engine = self.games[match.game_type]
        
        # Validate move
        if not engine.validate_move(match.state, player_id, move):
            raise InvalidMoveError("Invalid move")
        
        # Apply move
        match.state = engine.apply_move(match.state, player_id, move)
        
        # Check for game completion
        if engine.is_game_over(match.state):
            await self.end_game(match, engine.get_winner(match.state))
        
        # Broadcast update
        await self.broadcast_move(match_id, move, match.state)
        
        return match.state

class ChessEngine:
    """Example game engine implementation"""
    def initialize(self, config):
        return {
            "board": self.create_initial_board(),
            "turn": "white",
            "move_history": [],
            "clock": config.get("clock", {"white": 600, "black": 600}),
            "status": "active"
        }
    
    def validate_move(self, state, player_id, move):
        # Validate chess move logic
        return self.is_legal_move(state["board"], move)
```

### Online Competition Database Schema
```sql
-- Online Games Extension
CREATE TABLE online_games (
    id UUID PRIMARY KEY,
    game_type VARCHAR(50), -- chess, checkers, poker, etc.
    title VARCHAR(200),
    description TEXT,
    max_players INTEGER DEFAULT 2,
    min_players INTEGER DEFAULT 2,
    game_config JSONB, -- Game-specific settings
    skill_based BOOLEAN DEFAULT TRUE,
    rating_type VARCHAR(20), -- elo, glicko, trueskill
    created_at TIMESTAMP
);

CREATE TABLE online_matches (
    id UUID PRIMARY KEY,
    game_id UUID REFERENCES online_games(id),
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, completed, abandoned
    mode VARCHAR(20), -- synchronous, async, turn-based
    time_control JSONB, -- {initial: 600, increment: 5, days_per_move: 3}
    match_data JSONB, -- Current game state
    result JSONB, -- {winner: user_id, score: {}, method: 'resignation'}
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE match_players (
    match_id UUID REFERENCES online_matches(id),
    user_id UUID REFERENCES users(id),
    player_number INTEGER,
    rating_before INTEGER,
    rating_after INTEGER,
    color VARCHAR(10), -- For games like chess (white/black)
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    PRIMARY KEY (match_id, user_id)
);

CREATE TABLE game_moves (
    id SERIAL PRIMARY KEY,
    match_id UUID REFERENCES online_matches(id),
    player_id UUID REFERENCES users(id),
    move_number INTEGER,
    move_data JSONB, -- Game-specific move representation
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    move_duration INTEGER, -- Time taken for move in seconds
    INDEX idx_match_moves (match_id, move_number)
);
```

### Real-time Game Server (WebSockets)
```python
# websocket_server.py - Real-time gameplay
import websockets
import json
from collections import defaultdict

class GameWebSocketServer:
    def __init__(self):
        self.connections = defaultdict(dict)
        self.match_rooms = defaultdict(set)
    
    async def handler(self, websocket, path):
        """Handle WebSocket connections"""
        user_id = await self.authenticate(websocket)
        if not user_id:
            await websocket.close()
            return
        
        # Join user's personal channel
        self.connections[user_id] = websocket
        
        try:
            async for message in websocket:
                data = json.loads(message)
                await self.handle_message(user_id, data)
                
        except websockets.ConnectionClosed:
            await self.handle_disconnection(user_id)
    
    async def handle_message(self, user_id, data):
        message_type = data.get("type")
        
        if message_type == "join_match":
            match_id = data["match_id"]
            await self.join_match(user_id, match_id)
            
        elif message_type == "make_move":
            match_id = data["match_id"]
            move = data["move"]
            await self.process_move(user_id, match_id, move)
            
        elif message_type == "chat_message":
            match_id = data["match_id"]
            message = data["message"]
            await self.broadcast_chat(match_id, user_id, message)
    
    async def join_match(self, user_id, match_id):
        """Join a match room"""
        self.match_rooms[match_id].add(user_id)
        
        # Send current game state
        match_state = await self.get_match_state(match_id)
        await self.send_to_user(user_id, {
            "type": "match_state",
            "match_id": match_id,
            "state": match_state
        })
        
        # Notify other players
        await self.broadcast_to_match(match_id, {
            "type": "player_joined",
            "user_id": user_id
        }, exclude=[user_id])
    
    async def process_move(self, user_id, match_id, move):
        """Process and broadcast a game move"""
        # Validate and process move via game engine
        new_state = await self.game_engine.make_move(match_id, user_id, move)
        
        # Broadcast to all players in match
        await self.broadcast_to_match(match_id, {
            "type": "move_made",
            "user_id": user_id,
            "move": move,
            "state": new_state,
            "timestamp": datetime.utcnow().isoformat()
        })
```

## 2. Polly-like Social Features

### Prediction & Betting System
```python
# predictions.py - Polly-like prediction markets
from decimal import Decimal
from datetime import datetime, timedelta

class PredictionMarket:
    def __init__(self):
        self.virtual_currency = "LP Coins"
        self.coin_value = 100  # 1 coin = 100 credits
    
    async def create_prediction(self, event_id, title, options, end_time):
        """Create a new prediction market"""
        prediction = {
            "id": generate_uuid(),
            "event_id": event_id,
            "title": title,
            "options": options,  # [{"id": "a", "text": "Team A wins", "odds": 2.0}]
            "total_pool": 0,
            "status": "open",
            "created_at": datetime.utcnow(),
            "end_time": end_time,
            "resolved": False,
            "result": None
        }
        
        await self.db.store_prediction(prediction)
        return prediction
    
    async def place_bet(self, user_id, prediction_id, option_id, amount):
        """Place a bet on a prediction"""
        # Check if user has enough virtual currency
        user_balance = await self.get_user_balance(user_id)
        if user_balance < amount:
            raise InsufficientFundsError("Not enough coins")
        
        # Calculate potential payout
        option = await self.get_option(prediction_id, option_id)
        payout = amount * option["odds"]
        
        # Create bet
        bet = {
            "id": generate_uuid(),
            "user_id": user_id,
            "prediction_id": prediction_id,
            "option_id": option_id,
            "amount": amount,
            "potential_payout": payout,
            "placed_at": datetime.utcnow(),
            "status": "active"
        }
        
        # Deduct from user balance
        await self.update_user_balance(user_id, -amount)
        
        # Update prediction pool
        await self.update_prediction_pool(prediction_id, amount)
        
        return bet
    
    async def resolve_prediction(self, prediction_id, winning_option_id):
        """Resolve a prediction and distribute winnings"""
        prediction = await self.get_prediction(prediction_id)
        
        # Calculate each option's share
        total_pool = prediction["total_pool"]
        winning_bets = await self.get_bets_for_option(prediction_id, winning_option_id)
        
        if not winning_bets:
            # No winners, refund all bets
            await self.refund_all_bets(prediction_id)
        else:
            # Distribute winnings proportionally
            total_winning_amount = sum(bet["amount"] for bet in winning_bets)
            
            for bet in winning_bets:
                share = bet["amount"] / total_winning_amount
                payout = total_pool * share
                
                # Pay out to winner
                await self.update_user_balance(bet["user_id"], payout)
                
                # Mark bet as won
                await self.update_bet_status(bet["id"], "won", payout)
        
        # Mark prediction as resolved
        await self.mark_prediction_resolved(prediction_id, winning_option_id)
```

### Polls & Quizzes System
```python
# polls.py - Interactive polls and quizzes
import random
from typing import List, Dict

class PollSystem:
    def __init__(self):
        self.poll_types = {
            "single_choice": SingleChoicePoll(),
            "multiple_choice": MultipleChoicePoll(),
            "ranking": RankingPoll(),
            "trivia": TriviaPoll()
        }
    
    async def create_poll(self, creator_id, poll_data: Dict):
        """Create a new poll"""
        poll_type = self.poll_types.get(poll_data["type"])
        if not poll_type:
            raise ValueError(f"Invalid poll type: {poll_data['type']}")
        
        poll = {
            "id": generate_uuid(),
            "creator_id": creator_id,
            "title": poll_data["title"],
            "description": poll_data.get("description"),
            "type": poll_data["type"],
            "options": poll_data["options"],
            "settings": {
                "anonymous": poll_data.get("anonymous", False),
                "multiple_votes": poll_data.get("multiple_votes", False),
                "duration": poll_data.get("duration"),  # hours
                "visibility": poll_data.get("visibility", "public")  # public, league, private
            },
            "created_at": datetime.utcnow(),
            "expires_at": self.calculate_expiry(poll_data.get("duration")),
            "total_votes": 0,
            "status": "active"
        }
        
        # Store in database
        await self.db.store_poll(poll)
        
        # Notify relevant users based on visibility
        await self.notify_users(poll)
        
        return poll
    
    async def create_trivia_quiz(self, league_id, sport, difficulty="medium"):
        """Generate sport-specific trivia quiz"""
        questions = await self.generate_trivia_questions(sport, difficulty)
        
        quiz = {
            "id": generate_uuid(),
            "type": "trivia",
            "league_id": league_id,
            "title": f"{sport.capitalize()} Trivia Challenge",
            "questions": questions,
            "time_limit": 300,  # 5 minutes
            "points_per_question": 10,
            "bonus_points": 50,  # For perfect score
            "leaderboard_size": 20,
            "created_at": datetime.utcnow(),
            "status": "active"
        }
        
        return quiz
    
    async def vote_on_poll(self, user_id, poll_id, selections: List):
        """Submit votes on a poll"""
        poll = await self.get_poll(poll_id)
        
        # Validate vote based on poll type
        poll_type = self.poll_types[poll["type"]]
        if not poll_type.validate_vote(poll, selections):
            raise InvalidVoteError("Invalid vote submission")
        
        # Check if user has already voted (if not allowed)
        if not poll["settings"]["multiple_votes"]:
            has_voted = await self.has_user_voted(user_id, poll_id)
            if has_voted:
                raise AlreadyVotedError("User has already voted")
        
        # Record vote
        vote = {
            "id": generate_uuid(),
            "user_id": user_id,
            "poll_id": poll_id,
            "selections": selections,
            "submitted_at": datetime.utcnow(),
            "anonymous": poll["settings"]["anonymous"]
        }
        
        await self.db.store_vote(vote)
        
        # Update poll statistics
        await self.update_poll_stats(poll_id)
        
        # Check if poll should close (reached vote limit or expired)
        await self.check_poll_completion(poll_id)
        
        return vote

class TriviaPoll:
    """Sport-specific trivia implementation"""
    async def generate_trivia_questions(self, sport, difficulty):
        question_pools = {
            "basketball": [
                {
                    "question": "Who holds the record for most points in an NBA game?",
                    "options": ["Wilt Chamberlain", "Kobe Bryant", "Michael Jordan", "LeBron James"],
                    "correct_answer": 0,
                    "explanation": "Wilt Chamberlain scored 100 points in 1962."
                }
            ],
            "soccer": [
                {
                    "question": "Which country has won the most World Cup titles?",
                    "options": ["Brazil", "Germany", "Italy", "Argentina"],
                    "correct_answer": 0,
                    "explanation": "Brazil has won 5 World Cups (1958, 1962, 1970, 1994, 2002)."
                }
            ]
        }
        
        # Select random questions based on difficulty
        pool = question_pools.get(sport, [])
        num_questions = {"easy": 5, "medium": 10, "hard": 15}[difficulty]
        
        return random.sample(pool, min(num_questions, len(pool)))
```

### Challenges & Streaks System
```python
# challenges.py - Daily challenges and achievement streaks
from datetime import datetime, timedelta

class ChallengeSystem:
    def __init__(self):
        self.challenge_types = [
            "daily",
            "weekly", 
            "monthly",
            "seasonal",
            "achievement"
        ]
    
    async def generate_daily_challenges(self, user_id):
        """Generate personalized daily challenges"""
        user_profile = await self.get_user_profile(user_id)
        sports_interests = user_profile.get("sports_interests", [])
        
        challenges = []
        
        # Sport-specific challenges
        for sport in sports_interests[:3]:  # Top 3 sports
            sport_challenge = await self.create_sport_challenge(sport)
            challenges.append(sport_challenge)
        
        # Social challenges
        challenges.append({
            "id": generate_uuid(),
            "type": "daily",
            "title": "Social Butterfly",
            "description": "Vote on 3 polls or predictions",
            "reward": 50,  # LP Coins
            "target": 3,
            "current": 0,
            "expires_at": datetime.utcnow() + timedelta(days=1)
        })
        
        # Platform engagement challenge
        challenges.append({
            "id": generate_uuid(),
            "type": "daily",
            "title": "Platform Explorer",
            "description": "Try one online game feature",
            "reward": 100,
            "target": 1,
            "current": 0,
            "expires_at": datetime.utcnow() + timedelta(days=1)
        })
        
        return challenges
    
    async def track_streak(self, user_id, activity_type):
        """Track user streaks for various activities"""
        today = datetime.utcnow().date()
        
        # Get current streak
        streak = await self.get_user_streak(user_id, activity_type)
        
        if streak:
            last_activity = streak["last_activity"].date()
            
            if last_activity == today:
                # Already logged today
                return streak
            
            elif last_activity == today - timedelta(days=1):
                # Consecutive day
                streak["current_streak"] += 1
                streak["longest_streak"] = max(
                    streak["longest_streak"], 
                    streak["current_streak"]
                )
            else:
                # Streak broken
                streak["current_streak"] = 1
            
            streak["last_activity"] = datetime.utcnow()
            streak["total_days"] += 1
            
        else:
            # New streak
            streak = {
                "user_id": user_id,
                "activity_type": activity_type,
                "current_streak": 1,
                "longest_streak": 1,
                "total_days": 1,
                "last_activity": datetime.utcnow(),
                "started_at": datetime.utcnow()
            }
        
        # Check for milestone rewards
        await self.check_streak_milestones(user_id, streak)
        
        # Save updated streak
        await self.save_streak(streak)
        
        return streak
    
    async def check_streak_milestones(self, user_id, streak):
        """Award bonuses for streak milestones"""
        milestones = {
            7: {"coins": 100, "badge": "7-day_streak"},
            30: {"coins": 500, "badge": "monthly_legend"},
            100: {"coins": 2000, "badge": "century_club"}
        }
        
        current = streak["current_streak"]
        
        for days, reward in milestones.items():
            if current == days:
                # Award milestone
                await self.award_user(user_id, {
                    "coins": reward["coins"],
                    "badge": reward["badge"],
                    "message": f"{days}-day {streak['activity_type']} streak achieved!"
                })
                
                # Broadcast achievement
                await self.broadcast_achievement(user_id, {
                    "type": "streak_milestone",
                    "days": days,
                    "activity": streak["activity_type"]
                })
```

### Content Creation & UGC System
```python
# content_creation.py - User-generated content platform
import boto3
from PIL import Image
import io

class ContentCreationSystem:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.allowed_types = ['image/jpeg', 'image/png', 'video/mp4', 'application/json']
    
    async def create_highlight(self, user_id, match_id, content_data):
        """Create a game highlight"""
        # Validate user participated in match
        participation = await self.verify_participation(user_id, match_id)
        if not participation:
            raise PermissionError("User did not participate in this match")
        
        highlight = {
            "id": generate_uuid(),
            "user_id": user_id,
            "match_id": match_id,
            "title": content_data["title"],
            "description": content_data.get("description"),
            "type": content_data["type"],  # video, photo, text, combo
            "content_urls": [],
            "tags": content_data.get("tags", []),
            "visibility": content_data.get("visibility", "public"),
            "created_at": datetime.utcnow(),
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "featured": False
        }
        
        # Process and upload media
        if content_data.get("media"):
            urls = await self.upload_media(content_data["media"], highlight["id"])
            highlight["content_urls"] = urls
        
        # Generate thumbnail if video
        if content_data["type"] == "video":
            highlight["thumbnail_url"] = await self.generate_thumbnail(
                highlight["content_urls"][0]
            )
        
        # Store in database
        await self.db.store_highlight(highlight)
        
        # Notify match participants
        await self.notify_participants(match_id, {
            "type": "new_highlight",
            "highlight_id": highlight["id"],
            "user_id": user_id
        })
        
        return highlight
    
    async def create_strategy_guide(self, user_id, sport, guide_data):
        """Create a strategy guide/tutorial"""
        guide = {
            "id": generate_uuid(),
            "user_id": user_id,
            "sport": sport,
            "title": guide_data["title"],
            "content": guide_data["content"],
            "difficulty": guide_data.get("difficulty", "intermediate"),
            "tags": guide_data.get("tags", []),
            "estimated_read_time": self.calculate_read_time(guide_data["content"]),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "upvotes": 0,
            "bookmarks": 0,
            "featured": False,
            "verified_by_expert": False
        }
        
        # Check if user is qualified (optional)
        if await self.is_user_qualified(user_id, sport):
            guide["verified_by_expert"] = True
        
        # Store guide
        await self.db.store_guide(guide)
        
        # Add to sport-specific knowledge base
        await self.index_guide(guide)
        
        return guide
    
    async def create_community_event(self, organizer_id, event_data):
        """Create a community-driven event"""
        event = {
            "id": generate_uuid(),
            "organizer_id": organizer_id,
            "title": event_data["title"],
            "description": event_data["description"],
            "type": event_data["type"],  # tournament, meetup, workshop, watch_party
            "sport": event_data["sport"],
            "format": event_data["format"],  # online, hybrid, in_person
            "start_time": event_data["start_time"],
            "end_time": event_data["end_time"],
            "max_participants": event_data.get("max_participants"),
            "registration_required": event_data.get("registration_required", True),
            "registration_deadline": event_data.get("registration_deadline"),
            "location": event_data.get("location"),
            "online_link": event_data.get("online_link"),
            "created_at": datetime.utcnow(),
            "status": "scheduled",
            "participants": [],
            "waitlist": []
        }
        
        # Store event
        await self.db.store_event(event)
        
        # Promote to relevant users
        await self.promote_event(event)
        
        return event
```

## Enhanced Database Schema

```sql
-- Online Games & Competitions
CREATE TABLE online_games (
    id UUID PRIMARY KEY,
    game_type VARCHAR(50),
    title VARCHAR(200),
    category VARCHAR(50), -- board, card, puzzle, trivia, esports
    min_players INTEGER,
    max_players INTEGER,
    avg_duration INTEGER, -- in minutes
    skill_rating_type VARCHAR(20),
    game_config JSONB,
    created_at TIMESTAMP
);

-- Predictions & Polls
CREATE TABLE predictions (
    id UUID PRIMARY KEY,
    event_id UUID, -- Optional link to real event
    title VARCHAR(300),
    description TEXT,
    creator_id UUID REFERENCES users(id),
    options JSONB, -- [{id, text, odds, pool}]
    total_pool DECIMAL(10,2),
    status VARCHAR(20), -- open, closed, resolved
    result_option_id VARCHAR(50),
    created_at TIMESTAMP,
    closes_at TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE polls (
    id UUID PRIMARY KEY,
    league_id UUID REFERENCES leagues(id),
    creator_id UUID REFERENCES users(id),
    title VARCHAR(300),
    type VARCHAR(20), -- single_choice, multiple_choice, ranking, trivia
    options JSONB,
    settings JSONB,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    visibility VARCHAR(20) -- public, league, private
);

-- Challenges & Achievements
CREATE TABLE challenges (
    id UUID PRIMARY KEY,
    type VARCHAR(20), -- daily, weekly, monthly, achievement
    title VARCHAR(200),
    description TEXT,
    sport VARCHAR(50),
    difficulty VARCHAR(20),
    target_value INTEGER,
    reward_coins INTEGER,
    reward_badge VARCHAR(50),
    created_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id),
    achievement_id UUID REFERENCES challenges(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- Content Creation
CREATE TABLE user_content (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(20), -- highlight, guide, meme, event
    sport VARCHAR(50),
    title VARCHAR(300),
    content_urls JSONB,
    description TEXT,
    tags TEXT[],
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    visibility VARCHAR(20) DEFAULT 'public'
);

CREATE TABLE content_interactions (
    content_id UUID REFERENCES user_content(id),
    user_id UUID REFERENCES users(id),
    interaction_type VARCHAR(20), -- like, bookmark, share, report
    created_at TIMESTAMP,
    PRIMARY KEY (content_id, user_id, interaction_type)
);
```

## Integration Architecture

```python
# integration_manager.py - Unified feature integration
class IntegrationManager:
    def __init__(self):
        self.features = {
            "predictions": PredictionMarket(),
            "polls": PollSystem(),
            "challenges": ChallengeSystem(),
            "content": ContentCreationSystem(),
            "online_games": GameEngine()
        }
    
    async def handle_event(self, event_type, event_data):
        """Route events to relevant features"""
        handlers = {
            "match_completed": self.handle_match_completion,
            "user_joined": self.handle_user_join,
            "new_league_created": self.handle_new_league,
            "user_activity": self.handle_user_activity
        }
        
        handler = handlers.get(event_type)
        if handler:
            await handler(event_data)
    
    async def handle_match_completion(self, match_data):
        """Trigger multiple features on match completion"""
        tasks = []
        
        # 1. Update predictions
        if match_data.get("had_predictions"):
            tasks.append(
                self.features["predictions"].resolve_match_predictions(match_data["id"])
            )
        
        # 2. Generate highlight suggestions
        tasks.append(
            self.features["content"].suggest_highlights(match_data)
        )
        
        # 3. Update challenge progress
        tasks.append(
            self.features["challenges"].update_match_challenges(
                match_data["participants"],
                match_data["sport"]
            )
        )
        
        # 4. Create post-match poll
        tasks.append(
            self.features["polls"].create_post_match_poll(match_data)
        )
        
        # Execute all tasks concurrently
        await asyncio.gather(*tasks)
    
    async def get_user_feed(self, user_id):
        """Generate personalized activity feed"""
        feed_items = []
        
        # Get predictions user might be interested in
        predictions = await self.features["predictions"].get_relevant_predictions(user_id)
        feed_items.extend(predictions)
        
        # Get active polls
        polls = await self.features["polls"].get_active_polls(user_id)
        feed_items.extend(polls)
        
        # Get available challenges
        challenges = await self.features["challenges"].get_user_challenges(user_id)
        feed_items.extend(challenges)
        
        # Get trending content
        content = await self.features["content"].get_trending_content(user_id)
        feed_items.extend(content)
        
        # Get online game invitations
        invitations = await self.features["online_games"].get_pending_invitations(user_id)
        feed_items.extend(invitations)
        
        # Sort by relevance and timestamp
        return self.rank_feed_items(feed_items, user_id)
```

## Enhanced Frontend Components

```jsx
// React components for integrated features

// Main Dashboard with Tabs
const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('leagues');
  
  const tabs = [
    { id: 'leagues', label: 'My Leagues', icon: '🏆' },
    { id: 'online', label: 'Online Games', icon: '♟️' },
    { id: 'predict', label: 'Predictions', icon: '🎯' },
    { id: 'challenges', label: 'Challenges', icon: '🔥' },
    { id: 'feed', label: 'Community Feed', icon: '👥' },
    { id: 'create', label: 'Create', icon: '✨' }
  ];
  
  return (
    <div className="dashboard">
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="content-area">
        {activeTab === 'leagues' && <LeaguesTab />}
        {activeTab === 'online' && <OnlineGamesTab />}
        {activeTab === 'predict' && <PredictionsTab />}
        {activeTab === 'challenges' && <ChallengesTab />}
        {activeTab === 'feed' && <CommunityFeedTab />}
        {activeTab === 'create' && <ContentCreationTab />}
      </div>
    </div>
  );
};

// Online Game Lobby Component
const OnlineGamesLobby = () => {
  const [games, setGames] = useState([]);
  const [quickPlayGame, setQuickPlayGame] = useState(null);
  
  const gameTypes = [
    { id: 'chess', name: 'Chess', players: '35k online', icon: '♔' },
    { id: 'checkers', name: 'Checkers', players: '12k online', icon: '⚫' },
    { id: 'poker', name: 'Texas Hold\'em', players: '8k online', icon: '🃏' },
    { id: '8ball', name: '8-Ball Pool', players: '25k online', icon: '🎱' },
    { id: 'wordle', name: 'Sport Wordle', players: '5k online', icon: '🔠' },
  ];
  
  const handleQuickPlay = async (gameType) => {
    // Find opponent with similar skill level
    const match = await matchmaking.findQuickMatch(gameType);
    setQuickPlayGame(match);
  };
  
  return (
    <div className="online-games-lobby">
      <div className="quick-play-section">
        <h3>Quick Play</h3>
        <div className="game-grid">
          {gameTypes.map(game => (
            <GameCard 
              key={game.id}
              game={game}
              onPlay={() => handleQuickPlay(game.id)}
            />
          ))}
        </div>
      </div>
      
      {quickPlayGame && <GameBoard match={quickPlayGame} />}
      
      <div className="tournaments-section">
        <h3>Active Tournaments</h3>
        <TournamentList />
      </div>
      
      <div className="social-games">
        <h3>Play with Friends</h3>
        <FriendChallengeList />
      </div>
    </div>
  );
};

// Prediction Marketplace Component
const PredictionMarketplace = () => {
  const [predictions, setPredictions] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [virtualBalance, setVirtualBalance] = useState(1000);
  
  const placeBet = async (predictionId, optionId, amount) => {
    if (amount > virtualBalance) {
      alert('Insufficient funds!');
      return;
    }
    
    const bet = await api.placeBet(predictionId, optionId, amount);
    setUserBets([...userBets, bet]);
    setVirtualBalance(virtualBalance - amount);
    
    // Update prediction pool display
    setPredictions(predictions.map(p => 
      p.id === predictionId 
        ? { ...p, total_pool: p.total_pool + amount }
        : p
    ));
  };
  
  return (
    <div className="prediction-market">
      <div className="balance-card">
        <h4>Your LP Coins</h4>
        <div className="coin-balance">{virtualBalance.toLocaleString()}</div>
        <button className="btn-buy-coins">Buy More Coins</button>
      </div>
      
      <div className="prediction-list">
        <h3>Active Predictions</h3>
        {predictions.map(prediction => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            userBets={userBets}
            onPlaceBet={placeBet}
          />
        ))}
      </div>
      
      <div className="leaderboard">
        <h3>Top Predictors</h3>
        <PredictionLeaderboard />
      </div>
    </div>
  );
};
```

## Monetization Enhancements

```python
# monetization.py - Enhanced revenue streams
class MonetizationEngine:
    def __init__(self):
        self.revenue_streams = {
            "premium_subscriptions": self.handle_premium_subs,
            "virtual_currency": self.handle_virtual_currency,
            "sponsored_content": self.handle_sponsorships,
            "tournament_fees": self.handle_tournament_fees,
            "data_insights": self.handle_data_products
        }
    
    async def handle_virtual_currency(self):
        """Virtual currency (LP Coins) monetization"""
        coin_packages = [
            {"coins": 1000, "price": 4.99, "bonus": 0},
            {"coins": 2500, "price": 9.99, "bonus": 250},
            {"coins": 5000, "price": 19.99, "bonus": 750},
            {"coins": 10000, "price": 34.99, "bonus": 2000}
        ]
        
        # Users can buy coins for:
        # 1. Placing bets in prediction markets
        # 2. Entering paid tournaments
        # 3. Buying virtual goods (badges, themes, etc.)
        # 4. Boosting content visibility
        
        revenue = await self.calculate_coin_sales()
        return revenue
    
    async def handle_tournament_fees(self):
        """Paid tournament entry fees"""
        tournament_types = {
            "free": {"entry_fee": 0, "prize_pool": "virtual_coins"},
            "bronze": {"entry_fee": 4.99, "prize_pool": 100},
            "silver": {"entry_fee": 9.99, "prize_pool": 250},
            "gold": {"entry_fee": 19.99, "prize_pool": 600},
            "platinum": {"entry_fee": 49.99, "prize_pool": 1500}
        }
        
        # Platform takes 10-20% of prize pool as fee
        revenue = await self.calculate_tournament_fees()
        return revenue
    
    async def create_sponsored_challenges(self, sponsor, challenge_data):
        """Brand-sponsored challenges"""
        sponsored_challenge = {
            "id": generate_uuid(),
            "sponsor_id": sponsor["id"],
            "title": challenge_data["title"],
            "description": challenge_data["description"],
            "branding": {
                "logo": sponsor["logo_url"],
                "colors": sponsor["brand_colors"],
                "message": sponsor["challenge_message"]
            },
            "reward": {
                "virtual_coins": challenge_data.get("coin_reward", 0),
                "real_prizes": challenge_data.get("real_prizes", []),
                "discount_codes": challenge_data.get("discounts", [])
            },
            "participation_goal": challenge_data["goal"],
            "current_participants": 0,
            "status": "active"
        }
        
        # Charge sponsor based on engagement metrics
        sponsor_fee = self.calculate_sponsor_fee(
            challenge_data["goal"],
            challenge_data["duration"]
        )
        
        return sponsored_challenge, sponsor_fee
```

## Deployment & Scaling Strategy

```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/league
      - REDIS_URL=redis://redis:6379
      - WEB_CONCURRENCY=4
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=league
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
  
  game-server:
    build: ./game-server
    ports:
      - "3001:3001"
    environment:
      - REDIS_URL=redis://redis:6379
      - WEB_SOCKET_PORT=3001
  
  worker:
    build: .
    command: celery -A tasks worker --loglevel=info
    depends_on:
      - redis
      - db

volumes:
  postgres_data:

# replit.nix with additional dependencies
{ pkgs }: {
  deps = [
    pkgs.python310
    pkgs.python310Packages.pip
    pkgs.postgresql
    pkgs.redis
    pkgs.nodejs_20
    pkgs.openssl
    pkgs.imagemagick  # For image processing
    pkgs.ffmpeg       # For video processing
    pkgs.libsodium    # For encryption
  ];
}
```

This enhanced architecture transforms League Platform into a comprehensive recreational sports and gaming ecosystem with:

1. **Dual-Mode Play**: Seamless integration of physical sports leagues and online competitions
2. **Polly-like Engagement**: Prediction markets, polls, challenges, and social features
3. **Community Ecosystem**: User-generated content, tutorials, and community events
4. **Enhanced Monetization**: Virtual currency, sponsored challenges, and premium tournaments
5. **Scalable Architecture**: Ready to grow from MVP to full-scale platform

The system maintains the original focus on real-world sports while expanding into the massive online gaming and social prediction market spaces, creating a unique hybrid platform that captures engagement across multiple dimensions.