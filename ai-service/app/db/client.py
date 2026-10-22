from pymongo import AsyncMongoClient

from app.core.config import settings


def get_client() -> AsyncMongoClient:
    if not settings.MONGODB_URI:
        raise RuntimeError("Missing MONGODB_URI")
    return AsyncMongoClient(settings.MONGODB_URI)
