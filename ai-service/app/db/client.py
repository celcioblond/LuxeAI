from app.core.config import settings
from pymongo import AsyncMongoClient


def get_client() -> AsyncMongoClient:
    if not settings.MONGODB_URI:
        raise RuntimeError("Missing MONGODB_URI")
    return AsyncMongoClient(settings.MONGODB_URI)
