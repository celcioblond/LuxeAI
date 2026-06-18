from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # protected_namespaces=() lets us keep the field name `model_name`
    # (pydantic reserves the `model_` prefix by default).
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", protected_namespaces=()
    )

    mongodb_uri: str
    db_name: str = "test"
    port: int = 8000
    model_name: str = "BAAI/bge-small-en-v1.5"
    default_limit: int = 10
    vector_store_path: str = "./data/vectors.npz"


settings = Settings()
