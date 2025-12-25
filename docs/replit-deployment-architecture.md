# League Platform: Critical Systems Architecture for Replit Deployment

## Overview: Replit-Optimized Architecture

```yaml
Architecture Philosophy: 
- Single monolith for MVP (fast deployment)
- PostgreSQL + Redis core data layer
- Serverless-ready for scale
- AI features via external APIs initially
```

## System Architecture Diagram (Replit-Compatible)

```
┌─────────────────────────────────────────────────────────────┐
│                      REPLIT CONTAINER                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 MAIN APPLICATION                    │   │
│  │              (Python FastAPI/Node.js)              │   │
│  ├─────────────────┬─────────────────┬─────────────────┤   │
│  │  Web Server     │  API Layer      │  Job Queue      │   │
│  │  • Next.js/React│  • FastAPI/REST │  • Celery/Redis │   │
│  │  • Static Files │  • Auth         │  • Async tasks  │   │
│  │  • SSR          │  • Business     │  • Cron jobs    │   │
│  │                 │    Logic        │                 │   │
│  └─────────────────┴─────────────────┴─────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DATABASE LAYER                         │   │
│  │  PostgreSQL (Supabase/Aiven) + Redis (Upstash)      │   │
│  │  • Managed services outside Replit                  │   │
│  │  • Connection pooling                               │   │
│  │  • Read replicas for scale                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                     │
                      ┌──────────────▼────────────────────┐
                      │        EXTERNAL SERVICES          │
                      ├───────────────────────────────────┤
                      │  • Stripe (Payments)              │
                      │  • SendGrid/Resend (Email)        │
                      │  • Twilio (SMS)                   │
                      │  • OpenAI API (AI Features)       │
                      │  • Mapbox/Google Maps (Geoloc)    │
                      │  • Cloudinary (Image Storage)     │
                      └───────────────────────────────────┘
```

## Critical Components Design

### 1. **Database Schema (PostgreSQL)**
```sql
-- Core Tables
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    location JSONB, -- {city, state, coordinates}
    skill_levels JSONB, -- {sport: level}
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    config JSONB -- sport-specific settings
);

CREATE TABLE leagues (
    id UUID PRIMARY KEY,
    sport_id INTEGER REFERENCES sports(id),
    name VARCHAR(200),
    venue_id UUID REFERENCES venues(id),
    organizer_id UUID REFERENCES users(id),
    schedule JSONB, -- {days, times, start_date, end_date}
    capacity INTEGER,
    skill_level VARCHAR(20),
    price DECIMAL(10,2),
    status VARCHAR(20), -- draft, open, full, in_progress, completed
    settings JSONB, -- sport-specific config
    created_at TIMESTAMP
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY,
    league_id UUID REFERENCES leagues(id),
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id) NULL,
    status VARCHAR(20), -- pending, confirmed, waitlisted, cancelled
    payment_status VARCHAR(20),
    created_at TIMESTAMP,
    UNIQUE(league_id, user_id)
);

-- Redis Data Structures
Key Patterns:
- sessions:{session_id} → User session data
- cache:leagues:{city}:{sport} → Cached league listings
- queue:registrations → Registration processing queue
- realtime:scores:{league_id} → Live score updates
```

### 2. **Authentication & Authorization System**
```python
# auth.py - JWT-based auth with RBAC
from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from datetime import datetime, timedelta

class AuthService:
    SECRET_KEY = os.getenv("JWT_SECRET")
    ALGORITHM = "HS256"
    
    def create_token(self, user_id: str, roles: list):
        expires = datetime.utcnow() + timedelta(days=7)
        payload = {
            "sub": user_id,
            "roles": roles,
            "exp": expires
        }
        return jwt.encode(payload, self.SECRET_KEY, algorithm=self.ALGORITHM)
    
    def verify_token(self, token: str):
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            return payload
        except JWTError:
            return None

# Role-Based Access Control
ROLES = {
    "athlete": ["register", "view", "post_scores"],
    "organizer": ["create_league", "manage_rosters", "update_scores"],
    "venue_admin": ["manage_venues", "view_analytics"],
    "admin": ["all"]
}
```

### 3. **Payment Processing System**
```python
# payments.py - Stripe integration with idempotency
import stripe
from tenacity import retry, stop_after_attempt, wait_exponential

class PaymentProcessor:
    def __init__(self):
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def process_registration_payment(self, user_id, league_id, amount):
        """
        Idempotent payment processing with retry logic
        """
        # Check if payment already processed
        existing = await self.db.get_payment_intent(user_id, league_id)
        if existing and existing.status == "succeeded":
            return existing
            
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={
                "user_id": user_id,
                "league_id": league_id,
                "type": "league_registration"
            },
            idempotency_key=f"reg_{user_id}_{league_id}"
        )
        
        # Store in database
        await self.db.store_payment(intent.id, user_id, league_id, amount)
        
        return intent
    
    async def handle_webhook(self, payload, sig_header):
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
        
        if event.type == "payment_intent.succeeded":
            await self.confirm_registration(event.data.object)
        elif event.type == "payment_intent.payment_failed":
            await self.handle_failed_payment(event.data.object)
```

### 4. **Real-time Scoring & Standings**
```python
# scoring.py - Real-time updates with Redis pub/sub
import redis
import asyncio
from datetime import datetime

class ScoringSystem:
    def __init__(self):
        self.redis = redis.from_url(os.getenv("REDIS_URL"))
        self.pubsub = self.redis.pubsub()
        
    async def post_score(self, league_id, match_data):
        """
        Post score and broadcast update
        """
        # Validate score
        if not self.validate_score(match_data):
            raise ValueError("Invalid score data")
            
        # Store in PostgreSQL
        score_id = await self.db.store_score(league_id, match_data)
        
        # Update standings
        standings = await self.calculate_standings(league_id)
        
        # Broadcast via Redis
        await self.broadcast_update(league_id, {
            "type": "score_update",
            "score_id": score_id,
            "match_data": match_data,
            "standings": standings,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return score_id
    
    async def broadcast_update(self, league_id, data):
        """
        Publish update to league channel
        """
        channel = f"league:{league_id}:updates"
        self.redis.publish(channel, json.dumps(data))
        
    async def subscribe_to_updates(self, league_id, callback):
        """
        Subscribe to real-time updates
        """
        channel = f"league:{league_id}:updates"
        self.pubsub.subscribe(channel)
        
        for message in self.pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await callback(data)
```

### 5. **AI Matchmaking & Recommendations**
```python
# ai_service.py - Lightweight ML for Replit
import numpy as np
from sklearn.neighbors import NearestNeighbors
import pickle

class AIMatchmaker:
    def __init__(self):
        # Load pre-trained model or use simple algorithm
        self.skill_weights = {
            "pickleball": 0.4,
            "location": 0.3,
            "availability": 0.2,
            "social": 0.1
        }
        
    def find_matches(self, user, league, candidates):
        """
        Simple matchmaking algorithm
        """
        scores = []
        
        for candidate in candidates:
            # Calculate skill compatibility
            skill_diff = abs(user.skill_level - candidate.skill_level)
            skill_score = 1 - (skill_diff / 10)  # Normalize to 0-1
            
            # Calculate distance
            distance = self.calculate_distance(user.location, candidate.location)
            distance_score = max(0, 1 - (distance / 50))  # 50 mile radius
            
            # Calculate schedule overlap
            overlap = self.calculate_schedule_overlap(user.availability, candidate.availability)
            
            # Weighted score
            total_score = (
                skill_score * self.skill_weights["pickleball"] +
                distance_score * self.skill_weights["location"] +
                overlap * self.skill_weights["availability"]
            )
            
            scores.append((candidate.id, total_score))
        
        # Return top matches
        return sorted(scores, key=lambda x: x[1], reverse=True)[:5]
    
    def generate_recommendations(self, user, leagues):
        """
        Content-based filtering for league recommendations
        """
        user_vector = self.create_user_vector(user)
        recommendations = []
        
        for league in leagues:
            league_vector = self.create_league_vector(league)
            similarity = self.cosine_similarity(user_vector, league_vector)
            
            # Boost local leagues
            if self.is_local(user.location, league.location):
                similarity *= 1.2
                
            recommendations.append((league.id, similarity))
            
        return sorted(recommendations, key=lambda x: x[1], reverse=True)[:10]
```

### 6. **Queue System for Async Processing**
```python
# queue_manager.py - Background job processing
import redis
from rq import Queue
from rq.job import Job
import asyncio

class BackgroundQueue:
    def __init__(self):
        self.redis_conn = redis.from_url(os.getenv("REDIS_URL"))
        self.queue = Queue(connection=self.redis_conn)
        
    def enqueue_registration(self, user_id, league_id):
        """
        Queue registration for async processing
        """
        job = self.queue.enqueue(
            'tasks.process_registration',
            user_id, league_id,
            job_timeout=300,  # 5 minutes
            result_ttl=86400  # Keep result for 24 hours
        )
        return job.id
    
    def enqueue_email_notification(self, user_id, template, data):
        """
        Queue email sending
        """
        job = self.queue.enqueue(
            'tasks.send_email',
            user_id, template, data,
            job_timeout=60
        )
        return job.id

# Background tasks (tasks.py)
def process_registration(user_id, league_id):
    """
    Process registration in background
    """
    # 1. Validate capacity
    # 2. Process payment
    # 3. Send confirmation
    # 4. Update waitlist if needed
    # 5. Notify organizer
    pass

def send_email(user_id, template, data):
    """
    Send email via SendGrid/Resend
    """
    # Template rendering and sending
    pass
```

## File Structure for Replit
```
league-platform/
├── app.py                    # Main FastAPI/Flask app
├── requirements.txt          # Python dependencies
├── .env                     # Environment variables (not in git)
├── replit.nix              # Replit package configuration
├── Procfile                # For web process
│
├── api/                    # API endpoints
│   ├── __init__.py
│   ├── auth.py
│   ├── leagues.py
│   ├── users.py
│   ├── payments.py
│   └── scores.py
│
├── core/                   # Business logic
│   ├── models.py          # Database models
│   ├── services.py        # Business services
│   ├── ai_matchmaker.py   # AI/ML logic
│   └── notifications.py   # Email/SMS notifications
│
├── db/                    # Database layer
│   ├── database.py        # DB connection
│   ├── migrations/        # Alembic migrations
│   └── redis_client.py    # Redis client
│
├── tasks/                 # Background tasks
│   ├── __init__.py
│   ├── registrations.py
│   ├── notifications.py
│   └── maintenance.py
│
├── static/               # Frontend assets
│   ├── css/
│   ├── js/
│   └── images/
│
└── templates/            # HTML templates (if SSR)
    ├── base.html
    ├── league/
    └── user/
```

## Replit Configuration Files

### `replit.nix`
```nix
{ pkgs }: {
    deps = [
        pkgs.python310
        pkgs.python310Packages.pip
        pkgs.postgresql
        pkgs.redis
        pkgs.nodejs_20
        pkgs.openssl
    ];
    
    env = {
        PYTHONPATH = "/home/runner/${REPL_SLUG}";
        DATABASE_URL = "postgresql://user:pass@localhost:5432/league_db";
        REDIS_URL = "redis://localhost:6379";
    };
}
```

### `.replit`
```toml
language = "python3"
entrypoint = "app.py"

[env]
PYTHONPATH = "/home/runner/${REPL_SLUG}"
PORT = "8080"

[packager]
language = "python3"
ignoredPackages = ["tests", "docs"]

[deployment]
run = ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Deployment Strategy on Replit

### Phase 1: MVP on Replit
```yaml
Replit Setup:
- Always-on instance: $7/month
- PostgreSQL: Supabase Free Tier (500MB)
- Redis: Upstash Free Tier (10K commands/day)
- File Storage: Cloudinary Free Tier
- Email: Resend Free Tier (100 emails/day)
- Payments: Stripe Test Mode → Production

Configuration:
- Enable "Always On" in Replit
- Set up database connections
- Configure environment variables
- Set up SSL/TLS
```

### Phase 2: Scale Preparation
```yaml
When to scale off Replit:
- > 1,000 daily active users
- > 100 concurrent registrations
- Database > 1GB
- Need advanced scaling

Migration Path:
1. Dockerize application
2. Deploy to Railway/Render
3. Add load balancer
4. Database scaling (Supabase Pro)
5. Add CDN (Cloudflare)
```

## Critical Path Operations

### 1. **League Registration Flow**
```
User clicks Register → 
1. Check capacity (Redis cache) → 
2. Create payment intent (Stripe) → 
3. Queue confirmation email (Redis Queue) → 
4. Update roster (PostgreSQL) → 
5. Broadcast to waitlist if full (WebSocket)
```

### 2. **Score Posting Flow**
```
User posts score → 
1. Validate score (Business logic) → 
2. Store in DB (PostgreSQL) → 
3. Update standings (Recalc) → 
4. Broadcast update (Redis Pub/Sub) → 
5. Update player stats (Async)
```

### 3. **Search & Discovery**
```
User searches leagues → 
1. Check cache (Redis) → 
2. If miss, query DB with filters → 
3. Apply AI ranking (Python) → 
4. Cache results (Redis, 5 min TTL) → 
5. Return paginated results
```

## Performance Optimizations for Replit

### **Database Optimization**
```sql
-- Critical indexes
CREATE INDEX idx_leagues_location ON leagues USING GIST(location);
CREATE INDEX idx_leagues_sport_status ON leagues(sport_id, status);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_league ON registrations(league_id);

-- Use connection pooling
# database.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30
)
```

### **Caching Strategy**
```python
# cache_manager.py
from functools import lru_cache
import redis

class CacheManager:
    def __init__(self):
        self.redis = redis.Redis(...)
    
    @lru_cache(maxsize=1000)
    def get_league(self, league_id):
        # Try Redis first
        cached = self.redis.get(f"league:{league_id}")
        if cached:
            return json.loads(cached)
        
        # Then database
        league = self.db.get_league(league_id)
        
        # Cache for 5 minutes
        self.redis.setex(
            f"league:{league_id}",
            300,
            json.dumps(league)
        )
        
        return league
```

## Monitoring & Logging on Replit

```python
# monitoring.py
import logging
from pythonjsonlogger import jsonlogger

# Structured logging
log_handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(levelname)s %(name)s %(message)s'
)
log_handler.setFormatter(formatter)

logging.basicConfig(
    level=logging.INFO,
    handlers=[log_handler]
)

# Performance monitoring
import time
from contextlib import contextmanager

@contextmanager
def time_operation(name):
    start = time.time()
    try:
        yield
    finally:
        duration = time.time() - start
        if duration > 1.0:  # Log slow operations
            logging.warning(f"Slow operation: {name}", 
                          extra={"duration": duration, "operation": name})
```

## Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379

# External Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
OPENAI_API_KEY=sk-...
MAPBOX_TOKEN=pk....

# App Configuration
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-byte-encryption-key
APP_ENV=development
FRONTEND_URL=https://yourapp.repl.co
```

## Security Considerations for Replit

```python
# security.py
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
import secrets

class SecurityConfig:
    # CORS settings
    CORS_ORIGINS = [
        "https://yourapp.repl.co",
        "http://localhost:3000"
    ]
    
    # Rate limiting
    RATE_LIMIT = "100/minute"
    
    # Content Security Policy
    CSP = {
        "default-src": "'self'",
        "script-src": "'self' 'unsafe-inline'",
        "style-src": "'self' 'unsafe-inline'",
        "img-src": "'self' data: https:",
        "connect-src": "'self' https://api.stripe.com"
    }
    
    # Secure headers
    SECURE_HEADERS = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block"
    }
```

This architecture is designed specifically for Replit deployment with:
- **Simplicity**: Single codebase, easy to maintain
- **Scalability**: Ready to scale beyond Replit when needed
- **Cost-effective**: Uses free/cheap external services
- **Production-ready**: Includes critical systems (auth, payments, real-time updates)
- **AI-ready**: Basic ML with path to advanced AI

The system can handle ~100 concurrent users on Replit's free tier and can scale to thousands with the "Always On" plan and external database services.