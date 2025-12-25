# The-League Backend

## Overview
FastAPI backend for a two-sided marketplace platform connecting athletes with recreational sports leagues. Venues (golf courses, bowling alleys, sports complexes, esports arenas) create and manage leagues for various sports. Supports league discovery via geolocation, participant registration, score posting, standings tracking, social features, and prediction/pick'em systems.

## Recent Changes
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
│   └── users.py       # User management
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

## Remaining Tasks
- Golf: GHIN API integration for handicap sync
- Online Games: Game engines for chess, checkers, connect 4, battleship
- Payments: Stripe integration for registration fees
- Notifications: Alerts for new leagues, deadlines, results
- Frontend: Next.js + Tailwind with Polymarket-inspired design
