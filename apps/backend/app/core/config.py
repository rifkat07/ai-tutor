import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Tutor v2.0 Engine"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_tutor.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    GROQ_BASE_URL: str = "https://api.cerebras.ai/v1"
    GROQ_API_KEY: str = "csk-8xf9fk25meejd6fdpcp2f3vtmkkeemdetm9y2kn4n3rytjp4"
    GROQ_CHAT_MODEL: str = "gemma-4-31b"
    GROQ_REASONER_MODEL: str = "gemma-4-31b"

    DEEPSEEK_BASE_URL: str = "https://api.cerebras.ai/v1"
    DEEPSEEK_API_KEY: str = "csk-8xf9fk25meejd6fdpcp2f3vtmkkeemdetm9y2kn4n3rytjp4"
    DEEPSEEK_CHAT_MODEL: str = "gemma-4-31b"
    DEEPSEEK_REASONER_MODEL: str = "gemma-4-31b"

    SECRET_KEY: str = "9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    model_config = SettingsConfigDict(
        env_file=(
            BACKEND_DIR / ".env",
            ROOT_DIR / ".env",
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
