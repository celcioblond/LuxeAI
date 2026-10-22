from typing import Annotated

from fastapi import Depends, FastAPI, Request
from pymongo.asynchronous.database import AsyncDatabase

from app.db.client import get_client
from app.repositories.catalog import get_catalog
from app.services.recommender import build_index


async def lifespan(app: FastAPI):
    client = get_client()
    app.state.mongo_client = client
    app.state.mongo_db = client.get_default_database()
    # Idempotent: one saved-recommendations document per user
    await app.state.mongo_db["saved_recommendations"].create_index(
        "userId", unique=True
    )
    catalog = await get_catalog(app.state.mongo_db)
    app.state.index = build_index(catalog)

    yield

    await client.close()


def get_db(request: Request) -> AsyncDatabase:
    return request.app.state.mongo_db


MongoDbDep = Annotated[AsyncDatabase, Depends(get_db)]
