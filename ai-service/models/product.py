from config.db import get_db


def serialize(doc):
  return {
    "_id": str(doc["_id"]),
    "name": doc.get("name"),
    "price": doc.get("price"),
    "description": doc.get("description"),
    "category": doc.get("category"),
    "stock": doc.get("stock"),
    "imageUrl": doc.get("imageUrl"),
  }


async def find_all():
  db = get_db()
  cursor = db.products.find({})
  return await cursor.to_list(length=None)


async def find_fallback(limit):
  db = get_db()
  cursor = db.products.find({ "stock": { "$gt": 0 } }).sort("createdAt", -1).limit(limit)
  docs = await cursor.to_list(length=limit)
  return [serialize(doc) for doc in docs]
