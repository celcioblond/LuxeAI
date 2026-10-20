from app.core.config import settings
from app.db.db import lifespan
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
