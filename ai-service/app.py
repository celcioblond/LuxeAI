from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from config.db import connect_db
from models.http_error import HttpError
from controllers.recommendations import sync
from routes.recommendations import router as recommendations


@asynccontextmanager
async def lifespan(app):
  # connect to Mongo, then embed the catalog so the index is ready on boot
  await connect_db()
  try:
    result = await sync()
    print(f"Indexed {result['synced']} products")
  except HttpError as error:
    print(f"Catalog sync failed: {error.message}")
  yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allow_headers=["Content-Type", "Authorization"],
)

app.include_router(recommendations)


@app.exception_handler(HttpError)
async def http_error_handler(request: Request, error: HttpError):
  status = error.status_code or 500
  return JSONResponse(status_code=status, content={ "message": error.message, "data": error.data })


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, error: StarletteHTTPException):
  if error.status_code == 404:
    return JSONResponse(status_code=404, content={ "message": "Could not find this route", "data": None })
  return JSONResponse(status_code=error.status_code, content={ "message": error.detail, "data": None })
