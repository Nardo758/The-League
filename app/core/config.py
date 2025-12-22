from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "The-League API"
    environment: str = "dev"

    # Replit typically exposes HTTP on port 3000.
    host: str = "0.0.0.0"
    port: int = 3000

    database_url: str = "sqlite:///./league.db"

    # IMPORTANT: override in production via env var SECRET_KEY
    secret_key: str = "CHANGE_ME_IN_PROD"
    access_token_exp_minutes: int = 60 * 24 * 7  # 7 days

    cors_origins: str = "*"  # comma-separated origins, or "*" for dev


settings = Settings()

