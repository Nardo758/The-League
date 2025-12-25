# The-League Platform Roadmap

## Overview
This document tracks the development roadmap, MVP scope, and key milestones for The-League backend platform.

## MVP Scope

### Core Features (v1.0)
- [x] User authentication (register, login, JWT tokens)
- [x] Organization management (CRUD)
- [x] League management (CRUD)
- [x] Team management (CRUD)
- [x] Player management (CRUD)
- [x] Game scheduling and scoring (CRUD)
- [x] Posts/announcements (CRUD)

### Infrastructure (v1.0)
- [x] PostgreSQL database support
- [x] FastAPI with SQLModel ORM
- [x] JWT-based authentication
- [ ] Alembic migrations
- [ ] Rate limiting on auth endpoints
- [ ] Structured logging

### v1.1 - Security & Observability
- [ ] Strict CORS configuration (no wildcards in production)
- [ ] Stronger password validation rules
- [ ] Refresh token strategy
- [ ] Security headers middleware
- [ ] Prometheus metrics endpoint
- [ ] Request ID tracking
- [ ] Structured JSON logs

### v1.2 - AI & Realtime
- [ ] AI router (/ai/*) with request limits and audit logging
- [ ] Realtime token endpoint for Socket.IO integration
- [ ] JWT validation for realtime sessions

### v1.3 - Performance & DX
- [ ] Response caching for read-heavy endpoints
- [ ] N+1 query optimization
- [ ] Database indexes aligned to query patterns
- [ ] Makefile/justfile for common commands
- [ ] Comprehensive test suite

## Key Decisions
See [Architecture Decision Records](./adr/) for detailed decision documentation.

## Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| MVP Backend | 2024-12 | Complete |
| Security Hardening | 2025-01 | In Progress |
| AI Integration | 2025-01 | Planned |
| Realtime Support | 2025-02 | Planned |

## Change Log

### 2024-12-25
- Initial roadmap creation
- Defined MVP scope and v1.x feature sets
