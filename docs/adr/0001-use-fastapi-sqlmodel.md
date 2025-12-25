# ADR-0001: Use FastAPI with SQLModel

## Status
Accepted

## Date
2024-12-25

## Context
We needed to choose a Python web framework and ORM for the league management backend API.

## Decision
We chose FastAPI with SQLModel because:
- FastAPI provides automatic OpenAPI documentation
- Built-in request validation with Pydantic
- Async support for future scalability
- SQLModel combines SQLAlchemy with Pydantic models, reducing boilerplate
- Strong typing throughout the codebase

## Consequences

### Positive
- Automatic API documentation at /docs
- Type-safe request/response handling
- Easy integration with PostgreSQL
- Single model definition for both ORM and API schemas

### Negative
- SQLModel is relatively new, smaller community than pure SQLAlchemy
- Some advanced SQLAlchemy patterns require workarounds
