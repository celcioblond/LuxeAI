from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings

client = None
db = None

async def connect_db():
  global client, db
  try:
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.db_name]
    await client.admin.command("ping")
    print("MongoDB connected")
  except Exception as error:
    print(f"Error: {error}")
    raise SystemExit(1)

def get_db():
  return db
