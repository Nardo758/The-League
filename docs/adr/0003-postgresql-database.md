# ADR-0003: PostgreSQL as Primary Database

## Status
Accepted

## Date
2024-12-25

## Context
We needed a production-ready database that supports:
- Relational data with complex joins
- ACID transactions
- Scalability for growing user base
- Good tooling and ecosystem

## Decision
We chose PostgreSQL via Replit's built-in database service because:
- Robust, battle-tested relational database
- Excellent support in SQLAlchemy/SQLModel
- Managed service reduces operational overhead
- Built-in connection handling via DATABASE_URL

## Implementation
- Development uses SQLite for quick iteration (optional)
- Production uses PostgreSQL via DATABASE_URL
- Connection pooling to be added for production

## Consequences

### Positive
- ACID compliance for data integrity
- Rich query capabilities (JSON, full-text search, etc.)
- Proven scalability

### Negative
- More complex than NoSQL for simple use cases
- Requires migrations for schema changes

## Future Work
- Add Alembic for database migrations
- Configure connection pooling for production
