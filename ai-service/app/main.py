from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recommendation_routes import router as recommendation_router
from app.core.config import settings
from app.db.db import lifespan

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)


app.include_router(recommendation_router)


@app.get("/")
async def root():
    return {"Service": "Recommendation system"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
