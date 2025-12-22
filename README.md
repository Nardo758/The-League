# The-League (Backend)

FastAPI backend intended to run on Replit.

## Run (Replit)

- Replit uses `.replit` which runs:
  - `uvicorn app.main:app --host 0.0.0.0 --port 3000`

## Local run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

## Key endpoints

- **Health**: `GET /health`
- **OpenAPI**: `GET /docs` (Swagger UI), `GET /openapi.json`
- **Auth**
  - `POST /auth/register` (JSON: `{email,password,full_name?}`)
  - `POST /auth/token` (form fields: `username=<email>`, `password=<password>`)
  - `GET /users/me` (Bearer token)
- **Core CRUD**
  - `GET/POST/PATCH/DELETE /orgs`
  - `GET/POST/PATCH/DELETE /leagues`
  - `GET/POST/PATCH/DELETE /teams`
  - `GET/POST/PATCH/DELETE /players`
  - `GET/POST/PATCH/DELETE /games`
  - `GET/POST/PATCH/DELETE /posts`

## Environment variables

- **SECRET_KEY**: set this in production
- **DATABASE_URL**: defaults to `sqlite:///./league.db`
- **CORS_ORIGINS**: `*` or comma-separated list
