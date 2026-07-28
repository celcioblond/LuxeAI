from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore"
    )

    mongodb_uri: str
    db_name: str = "test"
    port: int = 8000
    model_name: str = "BAAI/bge-small-en-v1.5"
    default_limit: int = 10
    reload: bool = False  # dev auto-reload; keep False in production/containers


settings = Settings()
