from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

allowed_origins = [
  "http://localhost:5173",
  "http://localhost:5001"
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=allowed_origins,
  allow_credentials=True,
  allow_headers= ['*'],
  allow_methods= ['*']
)

@app.get("/")
async def root():
  return {"Service": "Recommendation system"}