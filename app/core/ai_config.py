import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class AISettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    anthropic_api_key: str = os.environ.get("AI_INTEGRATIONS_ANTHROPIC_API_KEY", "")
    anthropic_base_url: str = os.environ.get("AI_INTEGRATIONS_ANTHROPIC_BASE_URL", "")
    anthropic_model: str = "claude-sonnet-4-5"
    ai_requests_per_hour: int = 100
    ai_max_tokens: int = 8192


ai_settings = AISettings()
