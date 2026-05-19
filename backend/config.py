from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    """Centralized application settings loaded from environment variables."""

    app_name: str = "AI Idea Authenticity & Innovation Platform API"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api"
    frontend_url: str = "http://localhost:3001"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/idea_platform"
    jwt_secret_key: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    openai_api_key: str = ""
    groq_api_key: str = ""
    nvidia_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    groq_model: str = "llama-3.3-70b-versatile"
    faiss_index_path: str = str(BASE_DIR / "storage" / "faiss" / "idea_index.faiss")
    faiss_metadata_path: str = str(BASE_DIR / "storage" / "faiss" / "idea_index_meta.json")
    certificate_output_dir: str = str(BASE_DIR / "storage" / "certificates")
    dataset_path: str = str(BASE_DIR / "dataset" / "ideas.json")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("faiss_index_path", "faiss_metadata_path", "certificate_output_dir", "dataset_path")
    @classmethod
    def normalize_paths(cls, value: str) -> str:
        """Resolve relative paths from the backend root to keep Docker and local runs consistent."""
        path = Path(value)
        return str(path if path.is_absolute() else (BASE_DIR.parent / path).resolve())


settings = Settings()
