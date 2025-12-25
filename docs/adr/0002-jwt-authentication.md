# ADR-0002: JWT-Based Authentication

## Status
Accepted

## Date
2024-12-25

## Context
We needed an authentication mechanism for the API that works well with:
- Stateless API design
- Future realtime/Socket.IO integration
- Mobile and web clients

## Decision
We chose JWT (JSON Web Tokens) with the python-jose library because:
- Stateless authentication reduces server-side session storage
- JWTs can be validated by the realtime server without database lookups
- Standard OAuth2 password flow compatibility
- Easy to extend with refresh tokens

## Implementation
- Access tokens expire after 7 days (configurable)
- Tokens contain user ID as the subject claim
- SECRET_KEY must be set in production

## Consequences

### Positive
- Stateless, scalable authentication
- Works across services (API, realtime, etc.)
- Standard OAuth2 token endpoint

### Negative
- Token revocation requires additional infrastructure (planned: refresh tokens)
- Longer-lived tokens increase security risk if compromised

## Future Work
- Implement refresh token rotation
- Add token blacklist for logout/revocation
