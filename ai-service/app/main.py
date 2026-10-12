from app.core.config import settings
from app.db.db import MongoDbDep, lifespan
from app.repositories.catalog import get_catalog
from app.repositories.user_purchases import get_user_purchaes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)


@app.get("/")
async def root():
    return {"Service": "Recommendation system"}


@app.get("/user_purchases/{user_id}")
async def read_user_purchases(user_id: str, db: MongoDbDep):
    result = await get_user_purchaes(user_id, db)
    return {"user_purchases": result}


@app.get("/catalog")
async def read_catalog(db: MongoDbDep):
    result = await get_catalog(db)
    return {"catalog": result}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
