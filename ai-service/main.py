from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from config import settings
from services.recommender import recommend, sync_catalog
from services.vector_store import store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Build the index on startup. If Mongo is briefly unavailable we still let
    # the app boot so /health works and /sync can retry.
    try:
        count = await sync_catalog()
        print(f"[startup] indexed {count} products")
    except Exception as exc:
        print(f"[startup] catalog sync failed: {exc}")
    yield


app = FastAPI(title="LuxeAI Recommendation Service", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "products_indexed": store.size()}


@app.post("/sync")
async def sync():
    count = await sync_catalog()
    return {"synced": count}


@app.get("/recommendations/{user_id}")
async def recommendations(user_id: str, limit: int | None = None):
    recs = await recommend(user_id, limit or settings.default_limit)
    return {"recommendations": recs}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
