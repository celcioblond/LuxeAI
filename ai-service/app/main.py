from app.core.config import settings
from app.db.db import MongoDbDep, lifespan
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


@app.get("/products_count")
async def read_products_count(db: MongoDbDep):
    products_collection = db["products"]
    try:
        products_count = await products_collection.count_documents({})
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail="Could not count products") from e

    print(f"products count: {products_count}")
    return {"products_count": products_count}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
