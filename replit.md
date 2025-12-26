# The-League Backend

## Overview
FastAPI backend for a two-sided marketplace platform connecting athletes with recreational sports leagues. Venues (golf courses, bowling alleys, sports complexes, esports arenas) create and manage leagues for various sports. Supports league discovery via geolocation, participant registration, score posting, standings tracking, social features, and prediction/pick'em systems.

## Recent Changes
- 2024-12-26: Landing page now displays real-time live events and upcoming tournaments from API, plus demo featured leagues
- 2024-12-26: Added /channels/featured/events endpoint aggregating live online games and open tournaments
- 2024-12-26: Added Online Games Arena channel with live games, lobby, tournaments, and leaderboard tabs
- 2024-12-26: Added 🎮 Online Games icon to home page that links to /channels/online-games
- 2024-12-26: Added VenueFollow and UserFollow models for following venues and players with notification preferences
- 2024-12-26: Created follow/unfollow endpoints for venues (POST/DELETE /venues/{id}/follow) and users (POST/DELETE /users/{id}/follow)
- 2024-12-26: Added user profile endpoint with follower/following counts (/users/{id})
- 2024-12-26: Added Sport Channels feature - dedicated broadcast-style pages for each sport (Golf, Pickleball, Bowling, Softball, Tennis, Soccer)
- 2024-12-26: Created Channel, ChannelFeedEntry, and ChannelSubscription database models
- 2024-12-26: Added channel router with list, detail, feed, and subscription endpoints
- 2024-12-26: Made online games and tournaments endpoints publicly accessible for browsing (spectator mode)
- 2024-12-26: Added optional user authentication dependency for public/mixed endpoints
- 2024-12-25: Added Tournament bracket system with single elimination, bye handling, and match progression
- 2024-12-25: Built Online Games engine (Connect 4, Checkers, Battleship, Chess) with move validation
- 2024-12-25: Added Matchmaking system with ELO ratings and ranked games
- 2024-12-25: Integrated Stripe payments with checkout sessions and webhooks
- 2024-12-25: Added Notifications system with 11 notification types and batch operations
- 2024-12-25: Added Comments and Reactions for social features (nested comments, multiple reaction types)
- 2024-12-25: Added Predictions/Pick'em system with leaderboard
- 2024-12-25: Added Standings calculation by sport scoring type (wins_losses, stroke_play, points)
- 2024-12-25: Added Score submission with venue staff verification
- 2024-12-25: Replaced Organization model with Venue model (location-based with geolocation support)
- 2024-12-25: Added Sport model with customizable scoring types
- 2024-12-25: Added Season model to track league seasons with registration deadlines
- 2024-12-25: Implemented Registration model with approval modes
- 2024-12-25: Built RBAC with VenueMember roles and LeagueRole

## Architecture

### Venue-Centric Model
- **Venue**: Physical/virtual location that hosts leagues (golf_course, bowling_alley, sports_complex, esports_arena, etc.)
- **Sport**: Defines sport types with scoring systems (supports Golf, Pickleball, Softball, Bowling, Chess, etc.)
- **VenueSport**: Links venues to sports they support
- **League**: Competition organized by a venue for a specific sport
- **Season**: Time-bounded period within a league with registration deadlines
- **Registration**: Player enrollment in a season with approval workflow

### Role-Based Access Control
- **VenueMember**: User membership in a venue with role (owner, admin, staff)
- **LeagueRole**: User role within a specific league (organizer, captain, participant)
- Owner/Admin can create leagues, Staff can manage teams/games/scores

## Project Structure
```
app/
├── core/
│   ├── config.py      # Application settings
│   ├── ai_config.py   # AI-specific settings
│   ├── cache.py       # TTL caching utilities
│   ├── limiter.py     # Shared rate limiter
│   └── logging.py     # Structured logging setup
├── schemas.py         # Pydantic schemas with validation
├── routers/
│   ├── auth.py        # Authentication (register, login)
│   ├── ai.py          # AI endpoints with rate limiting
│   ├── realtime.py    # Realtime token generation
│   ├── metrics.py     # Prometheus metrics
│   ├── venues.py      # Venue CRUD with geolocation search
│   ├── sports.py      # Sport definitions CRUD
│   ├── seasons.py     # Season management
│   ├── registrations.py # Player registration workflow
│   ├── leagues.py     # League CRUD
│   ├── teams.py       # Team CRUD
│   ├── players.py     # Player CRUD
│   ├── games.py       # Game CRUD with score submissions
│   ├── standings.py   # Standings calculation by sport type
│   ├── predictions.py # Pick'em system with leaderboard
│   ├── comments.py    # Comments and reactions on posts
│   ├── posts.py       # Bulletin board / announcements
│   ├── users.py       # User management
│   ├── online_games.py # Online games with move validation
│   ├── tournaments.py  # Tournament brackets and match progression
│   ├── notifications.py # User notifications system
│   ├── payments.py    # Stripe checkout and webhooks
│   └── channels.py    # Sport channels with feed aggregation
├── game_engines/
│   ├── base.py        # Abstract GameEngine base class
│   ├── connect4.py    # Connect 4 logic
│   ├── checkers.py    # Checkers with king promotion
│   ├── battleship.py  # Battleship ship placement and attacks
│   └── chess.py       # Chess move validation
├── stripe_client.py   # Stripe API integration
├── db.py              # Database connection (SQLite/PostgreSQL)
├── deps.py            # FastAPI dependencies
├── main.py            # Application entry point
├── models.py          # SQLModel database models
└── security.py        # Password hashing, JWT tokens
alembic/               # Database migrations
docs/
├── roadmap.md         # Development roadmap
└── adr/               # Architecture Decision Records
tests/                 # pytest test suite (19 tests)
```

## Key Endpoints

### Venues & Leagues
- `GET /venues` - List venues with geolocation filter (lat, lng, radius_miles)
- `POST /venues` - Create venue (user becomes owner)
- `GET /leagues` - List leagues (filterable by venue, sport)
- `POST /leagues` - Create league (requires venue admin)

### Scores & Standings
- `POST /games/{id}/scores` - Submit score (participants)
- `POST /games/{id}/scores/{submission_id}/verify` - Verify score (venue staff)
- `GET /standings/seasons/{season_id}` - Get calculated standings

### Predictions/Pick'em
- `POST /predictions` - Make prediction on scheduled game
- `POST /predictions/games/{id}/resolve` - Resolve predictions (venue staff)
- `GET /predictions/leaderboard/seasons/{season_id}` - Season leaderboard

### Social Features
- `POST /comments` - Add comment to post
- `POST /comments/reactions` - Add/update reaction
- `GET /comments/reactions/posts/{id}` - Get reaction counts

### Online Games & Tournaments
- `POST /online-games` - Create open game (anyone can join)
- `POST /online-games/challenge` - Challenge a specific player
- `GET /online-games/challenges` - List pending challenges
- `POST /online-games/{id}/accept` - Accept a challenge
- `POST /online-games/{id}/decline` - Decline a challenge
- `POST /online-games/{id}/move` - Make a move
- `GET /online-games/{id}/spectate` - Watch a game (anyone can view)
- `POST /online-games/matchmaking/search` - Find opponent with ELO matching
- `POST /tournaments` - Create tournament
- `POST /tournaments/{id}/register` - Join tournament
- `POST /tournaments/{id}/start` - Generate bracket (organizer only)
- `POST /tournaments/{id}/matches/{match_id}/report` - Report result

### Payments & Notifications
- `POST /payments/create-checkout` - Create Stripe checkout session
- `POST /payments/webhook` - Handle Stripe webhooks
- `GET /notifications` - List user notifications
- `POST /notifications/{id}/read` - Mark notification as read

## Data Models

### Scoring Types
- `stroke_play` - Lower is better (Golf)
- `match_play` - Head-to-head points
- `points` - Higher is better
- `wins_losses` - Win/Loss record
- `sets` - Set-based scoring (Tennis, Volleyball)
- `frames` - Frame-based scoring (Bowling)

### Registration Modes
- `open` - Anyone can register
- `approval_required` - Requires venue admin approval
- `invite_only` - Invitation by organizer only

### Reaction Types
- `like`, `love`, `celebrate`, `insightful`, `curious`

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes (prod) | `CHANGE_ME_IN_PROD` | JWT signing key |
| `DATABASE_URL` | No | `sqlite:///./league.db` | Database connection URL |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `ENVIRONMENT` | No | `dev` | `dev` or `production` |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Auto | - | Set by Replit AI Integrations |

## Testing
```bash
pytest tests/ -v          # Run all 19 tests
pytest tests/test_auth.py # Auth tests only
pytest tests/test_leagues.py # Venue/League tests
```

## Frontend

### Stack
- Next.js 16 with App Router (Turbopack)
- Tailwind CSS with Polymarket-inspired dark theme
- TypeScript

### Theme Colors
- Background: `#0d0d0d`
- Card: `#1a1a1a`
- Accent: `#00d4aa` (teal)
- Error: `#ef4444`
- Success: `#22c55e`
- Warning: `#f59e0b`

### Frontend Structure
```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with nav
│   │   ├── page.tsx          # Home page
│   │   ├── login/page.tsx    # Login form
│   │   ├── register/page.tsx # Registration form
│   │   ├── venues/page.tsx   # Venue discovery
│   │   ├── leagues/page.tsx  # Leagues listing
│   │   ├── games/            # Online games
│   │   │   ├── page.tsx      # Games lobby
│   │   │   └── [id]/page.tsx # Active game
│   │   └── tournaments/page.tsx # Tournaments list
│   └── lib/
│       ├── api.ts            # API client with typed endpoints
│       └── auth-context.tsx  # Auth state management
├── tailwind.config.ts        # Theme configuration
└── next.config.ts            # API rewrites, allowed origins
```

### Running Frontend
```bash
cd client && npm run dev -- -p 5000
```

## Remaining Tasks
- Golf: GHIN API integration for handicap sync

## Completed Features
- Online Games: Connect 4, Checkers, Battleship, Chess with full move validation
- Payments: Stripe checkout sessions and webhook handling
- Notifications: 11 notification types with unread tracking
- Tournaments: Single elimination brackets with bye handling
- Matchmaking: ELO-based ranking with preferred time limits
