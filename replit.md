# The-League Backend

## Overview
FastAPI backend for a league management platform supporting organizations, leagues, teams, players, games, and announcements. Includes AI integration, realtime capabilities, and comprehensive security features.

## Recent Changes
- 2024-12-25: Switched AI integration from OpenAI to Anthropic Claude (claude-sonnet-4-5)
- 2024-12-25: Added documentation structure (docs/roadmap.md, docs/adr/)
- 2024-12-25: Implemented AI router with rate limiting and audit logging
- 2024-12-25: Added realtime token endpoints for Socket.IO integration
- 2024-12-25: Security hardening (CORS, password rules, rate limiting, security headers)
- 2024-12-25: Added Alembic migrations with PostgreSQL connection pooling
- 2024-12-25: Added Prometheus metrics endpoint
- 2024-12-25: Added pytest test suite for auth and CRUD operations
- 2024-12-25: Added Makefile for developer commands

## Project Structure
```
app/
├── core/
│   ├── config.py      # Application settings
│   ├── ai_config.py   # AI-specific settings
│   └── logging.py     # Structured logging setup
├── routers/
│   ├── auth.py        # Authentication (register, login)
│   ├── ai.py          # AI endpoints with rate limiting
│   ├── realtime.py    # Realtime token generation
│   ├── metrics.py     # Prometheus metrics
│   ├── orgs.py        # Organization CRUD
│   ├── leagues.py     # League CRUD
│   ├── teams.py       # Team CRUD
│   ├── players.py     # Player CRUD
│   ├── games.py       # Game CRUD
│   ├── posts.py       # Posts/announcements CRUD
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
  - `POST /auth/register` - User registration (rate limited)
  - `POST /auth/token` - Login (rate limited)
  - `GET /users/me` - Current user info
- **AI** (requires authentication):
  - `GET /ai/policy` - Data handling policy
  - `POST /ai/chat` - Chat completion (rate limited)
  - `POST /ai/summarize` - Text summarization (rate limited)
- **Realtime**:
  - `POST /games/{id}/realtime-token` - Get JWT for Socket.IO
  - `POST /realtime/validate` - Validate realtime token
- **CRUD** (all require authentication):
  - `/orgs/*` - Organizations
  - `/leagues/*` - Leagues
  - `/teams/*` - Teams
  - `/players/*` - Players
  - `/games/*` - Games
  - `/posts/*` - Posts

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes (prod) | `CHANGE_ME_IN_PROD` | JWT signing key |
| `DATABASE_URL` | No | `sqlite:///./league.db` | Database connection URL |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `ENVIRONMENT` | No | `dev` | `dev` or `production` |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Auto | - | Set by Replit AI Integrations |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Auto | - | Set by Replit AI Integrations |
| `AI_REQUESTS_PER_HOUR` | No | `100` | Rate limit for AI endpoints |

## Development Commands
```bash
make run          # Start development server (port 5000)
make test         # Run test suite
make test-cov     # Run tests with coverage
make format       # Format code with ruff
make lint         # Check code with ruff
make migrate      # Run database migrations
make migrate-new  # Create new migration
make help         # Show all commands
```

## Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations (if using PostgreSQL)
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 5000
```

## Replit Deployment
The app is configured to run on port 5000 with the workflow "Backend API". The DATABASE_URL environment variable is automatically set by Replit's PostgreSQL integration.

## Security Features
- JWT-based authentication with 7-day expiry
- Strong password requirements (8+ chars, upper/lower/digit)
- Rate limiting on auth and AI endpoints
- Security headers (HSTS, X-Frame-Options, etc.)
- Strict CORS in production mode
- Request ID tracking for observability

## AI Integration
AI features use Anthropic Claude (claude-sonnet-4-5) via Replit AI Integrations. This means:
- No separate API key required - automatically configured by Replit
- Charges are billed to your Replit credits
- Rate limited per user (100 requests/hour by default)
- Audit logged with timestamps and token counts
- Subject to data handling policy (see `GET /ai/policy`)

## Testing
```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_auth.py -v
```
