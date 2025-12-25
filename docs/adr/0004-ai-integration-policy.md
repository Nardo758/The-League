# ADR-0004: AI Integration Policy and Data Handling

## Status
Accepted

## Date
2024-12-25

## Context
We plan to add AI features to the platform. This requires clear policies on:
- What data is sent to AI models
- Rate limiting and cost control
- Audit logging for compliance

## Decision
Implement AI features with the following safeguards:

### AI Provider
We use **Anthropic Claude** (claude-sonnet-4-5) via Replit AI Integrations. This provides:
- No separate API key required
- Charges billed to Replit credits
- Managed infrastructure

### Data Policy
1. **Minimal Data Principle**: Only send data necessary for the specific AI task
2. **No PII by Default**: User emails, passwords, and sensitive fields are never sent to AI models
3. **Explicit Consent**: Features that send user-generated content require user acknowledgment
4. **Audit Trail**: All AI requests are logged with request type, timestamp, and user ID

### What Data MAY Be Sent
- Game descriptions and summaries
- League/team names (public information)
- Post content (with user consent)
- Anonymized statistics

### What Data is NEVER Sent
- User passwords or hashed passwords
- Email addresses
- Session tokens
- Private user data

### Rate Limiting
- Per-user request limits (100 requests/hour by default)
- Global rate limiting to control costs
- Graceful degradation when limits exceeded

### Audit Logging
- Every AI request logged with:
  - Timestamp
  - User ID
  - Request type/endpoint
  - Token count (input/output)
  - Response status

## Consequences

### Positive
- Clear compliance story for users
- Cost control via rate limiting
- Audit trail for debugging and accountability
- No API key management required with Replit integration

### Negative
- Some AI features may be limited by data restrictions
- Rate limiting may frustrate power users
- Dependent on Replit AI Integrations availability
