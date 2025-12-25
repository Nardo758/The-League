# The-League Backend

## Overview
FastAPI backend for a two-sided marketplace platform connecting athletes with recreational sports leagues. Venues (golf courses, bowling alleys, sports complexes, esports arenas) create and manage leagues for various sports. Supports league discovery via geolocation, participant registration, score posting, standings tracking, social features, and prediction/pick'em systems.

## Recent Changes
- 2024-12-25: Replaced Organization model with Venue model (location-based with geolocation support)
- 2024-12-25: Added Sport model with customizable scoring types (stroke_play, match_play, points, wins_losses, sets, frames)
- 2024-12-25: Added Season model to track league seasons with registration deadlines
- 2024-12-25: Implemented Registration model with approval modes (open, approval_required, invite_only)
- 2024-12-25: Built RBAC with VenueMember, VenueRole (owner, admin, staff), and LeagueRole
- 2024-12-25: Added geolocation search for venues using distance calculation (radius in miles)
- 2024-12-25: Updated all tests to work with new Venue-based architecture (19 tests passing)

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
- Owner/Admin can create leagues, Staff can manage teams/games

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
tests/                 # pytest test suite
```

## Key Endpoints
- **Health**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)
- **Docs**: `GET /docs` (Swagger UI)
- **Auth**:
  - `POST /auth/register` - User registration
  - `POST /auth/token` - Login
  - `GET /users/me` - Current user info
- **Venues** (require authentication):
  - `GET /venues` - List venues with geolocation filter (lat, lng, radius_miles)
  - `POST /venues` - Create venue (user becomes owner)
  - `GET /venues/{id}` - Venue details
  - `PATCH /venues/{id}` - Update venue
- **Sports**:
  - `GET /sports` - List sport definitions
  - `POST /sports` - Create sport
- **Leagues**:
  - `GET /leagues` - List leagues (filterable by venue, sport)
  - `POST /leagues` - Create league (requires venue admin)
  - `PATCH /leagues/{id}` - Update league
- **Seasons**:
  - `GET /seasons` - List seasons
  - `POST /seasons` - Create season for league
- **Registrations**:
  - `POST /registrations` - Register for a season
  - `PATCH /registrations/{id}` - Approve/reject registration
- **Teams/Players/Games/Posts**: Standard CRUD operations

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

### Venue Types
- `golf_course`, `bowling_alley`, `sports_complex`, `esports_arena`, `indoor_court`, `outdoor_field`, `virtual`, `other`

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes (prod) | `CHANGE_ME_IN_PROD` | JWT signing key |
| `DATABASE_URL` | No | `sqlite:///./league.db` | Database connection URL |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `ENVIRONMENT` | No | `dev` | `dev` or `production` |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Auto | - | Set by Replit AI Integrations |

## Development Commands
```bash
make run          # Start development server (port 5000)
make test         # Run test suite
make test-cov     # Run tests with coverage
make format       # Format code with ruff
make lint         # Check code with ruff
make migrate      # Run database migrations
make help         # Show all commands
```

## Testing
```bash
pytest tests/ -v          # Run all 19 tests
pytest tests/test_auth.py # Auth tests only
pytest tests/test_leagues.py # Venue/League tests
```

## Security Features
- JWT-based authentication with 7-day expiry
- Strong password requirements (8+ chars, upper/lower/digit)
- Rate limiting on auth and AI endpoints
- Security headers (HSTS, X-Frame-Options, etc.)
- Role-based access control for venues and leagues
