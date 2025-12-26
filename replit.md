# The-League Backend

## Overview
The-League is a FastAPI backend for a two-sided marketplace connecting athletes with recreational sports leagues. Venues can create and manage leagues, while participants can discover, register for, and track their progress in various sports. The platform includes features for score posting, standings, social interactions, predictions, and online games. The business vision is to become the leading platform for recreational sports, offering comprehensive tools for venues and an engaging experience for players, ultimately increasing sports participation and community engagement.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development and will provide feedback at each stage. Ask before making major changes. Do not make changes to the `alembic/` folder or `tests/` folder.

## System Architecture

### UI/UX Decisions
The frontend utilizes Next.js 16 with App Router, Tailwind CSS, and TypeScript, adhering to a Polymarket-inspired dark theme.
- **Theme Colors**: Background: `#0d0d0d`, Card: `#1a1a1a`, Accent: `#00d4aa` (teal), Error: `#ef4444`, Success: `#22c55e`, Warning: `#f59e0b`.
- **Key Pages**: Comprehensive Venue Detail, League Detail, Tournament Detail, and Player Profile pages with tabbed navigation, a unified Search page with sub-tabs (Leagues, Venues, Tournaments, Players), and a user-centric dashboard (`/my-leagues`) and Profile page.
  - **Player Profile (`/players/[id]`)**: Cover photo with avatar, name/username/location, Level/XP/followers, sports played, bio, CTAs (Follow, Message, Share), Quick Stats bar (Leagues, Events, Win Rate, Streak), 5 tabs (Activity, Stats, Leagues, Achievements, About), per-sport statistics, activity feed, earned badges/milestones, and mutual connections.
- **Navigation**: Streamlined to Discover, Search, Play, My Leagues, plus a Profile dropdown.

### Technical Implementations
The backend is built with FastAPI.
- **Core Features**:
    - **Venue-Centric Model**: Centralizes around `Venue` (physical/virtual locations), `Sport` (with customizable scoring), `League`, `Season`, and `Registration` (with approval workflows).
    - **Role-Based Access Control (RBAC)**: Implemented with `VenueMember` roles (owner, admin, staff) and `LeagueRole` (organizer, captain, participant) to manage permissions.
    - **Online Games Engine**: Supports Connect 4, Checkers, Battleship, and Chess with move validation and matchmaking based on ELO ratings.
    - **Tournaments**: Single elimination bracket system with bye handling and match progression.
    - **Scoring & Standings**: Dynamic calculation based on sport-specific scoring types (`stroke_play`, `match_play`, `points`, `wins_losses`, `sets`, `frames`).
    - **Social Features**: Comments and reactions on posts, user/venue following with notifications.
    - **Predictions/Pick'em System**: Allows users to make predictions with a leaderboard.
    - **Notifications System**: Supports 11 types of user notifications.
    - **Channels**: Dedicated broadcast-style pages for each sport, aggregating feed entries.

### Feature Specifications
- **Discovery**: Geolocation-based venue and league search.
- **Management**: Tools for venues to create, manage, and track leagues, seasons, and registrations. Score submission with staff verification.
- **Player Experience**: Registration, personal dashboards (active leagues, schedule, stats), live game feeds, tournament participation, and social interaction.
- **Payments**: Stripe integration for secure transactions.

### System Design Choices
- **API Design**: RESTful API with clear endpoints for CRUD operations and specific functionalities.
- **Database**: SQLModel for ORM, supporting SQLite/PostgreSQL.
- **Security**: JWT for authentication, password hashing.
- **Scalability**: Rate limiting, caching utilities, structured logging.
- **Modularity**: Codebase organized into `routers`, `game_engines`, `schemas`, and `models` for maintainability.

## External Dependencies
- **Stripe**: For payment processing (checkout sessions and webhooks).
- **PostgreSQL / SQLite**: Database storage.
- **Replit AI Integrations**: For `AI_INTEGRATIONS_ANTHROPIC_API_KEY`.