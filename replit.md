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
  - **Player Profile (`/players/[id]`)**: Cover photo with avatar, name/username/location, Level/XP/followers, sports played, bio, CTAs (Follow, Message, Share), Quick Stats bar (Leagues, Events, Win Rate, Streak), 5 tabs (Activity, Stats, Leagues, Achievements, About), per-sport statistics, activity feed, earned badges/milestones, mutual connections, and **Upcoming Games** section showing scheduled rounds with open spots and join requests.
  - **League Detail (`/leagues/[id]`)**: Enhanced tabs including Schedule (All/Upcoming/Past filters, List/Calendar view toggle), Standings (movement indicators, season stats summary), Roster (search, mutual connections, verified badges), and Reviews (rating distribution chart, helpful voting).
  - **My Leagues Dashboard (`/my-leagues`)**: Added **Friends Looking to Play** feed showing friends' open game invites with Request to Join functionality.
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
- **Discovery**: Geolocation-based venue and league search with location-aware platform defaults.
  - **Location-Aware Platform**: All content is filtered by user's location by default. No separate "local feed" - the entire platform respects location context.
  - **User Location Model**: Users have `latitude`, `longitude`, `city`, `state`, `search_radius_miles` (default 25), `auto_detect_location`, `allow_global_search`, `location_setup_complete` fields.
  - **Saved Locations**: `UserLocation` model stores multiple locations (Home, Work, etc.) with label, lat/lng, radius, and `is_primary` flag.
  - **Location Bar**: Persistent header component showing current location and radius, with quick-switch dropdown to saved locations.
  - **Location Settings**: `/settings/locations` page for managing saved locations with auto-detect, add/remove/set-primary functionality.
  - **API Filtering**: Leagues and venues endpoints accept `latitude`, `longitude`, `radius_miles` query params for distance-based filtering using Haversine formula. Returns `distance_miles` in response when location params provided.
  - **Location Setup Modal**: Modal appears on first visit for users without location, offering auto-detect or manual entry with radius selection.
  - **No Results Component**: `NoResultsInArea` component shows when no results found with options to expand radius or search all locations.
- **Management**: Tools for venues to create, manage, and track leagues, seasons, and registrations. Score submission with staff verification.
- **Player Experience**: Registration, personal dashboards (active leagues, schedule, stats), live game feeds, tournament participation, and social interaction.
- **Payments**: Stripe integration for secure transactions.
  - **Payment Success Page (`/payment/success`)**: Confirmation with animated checkmark, registration details, payment summary, What's Next steps (email check, calendar integration, directions), social sharing (Twitter, Facebook, copy link), quick actions.
  - **Payment Cancel Page (`/payment/cancel`)**: Warning header, countdown timer for spot hold, retry payment functionality, registration details preserved, urgency messaging, alternative options.
  - **Backend Endpoint**: `GET /payments/session/{session_id}` returns comprehensive session details including league, venue, season, user, and registration data with session status and expiration handling.

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