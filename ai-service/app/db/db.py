from typing import Annotated

from app.db.client import get_client
from fastapi import Depends, FastAPI, Request
from pymongo.asynchronous.database import AsyncDatabase


async def lifespan(app: FastAPI):
    client = get_client()
    app.state.mongo_client = client
    app.state.mongo_db = client.get_default_database()

    yield

    await client.close()


def get_db(request: Request) -> AsyncDatabase:
    return request.app.state.mongo_db


MongoDbDep = Annotated[AsyncDatabase, Depends(get_db)]
