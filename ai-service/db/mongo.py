from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorClient

from config import settings

# Orders in these states represent a real purchase worth learning from.
PURCHASED_STATUSES = ["paid", "processing", "shipped", "delivered"]

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.db_name]


def serialize_product(doc: dict) -> dict:
    """Mongo document -> JSON-serializable product the frontend can render."""
    return {
        "_id": str(doc["_id"]),
        "name": doc.get("name"),
        "price": doc.get("price"),
        "description": doc.get("description"),
        "stock": doc.get("stock"),
        "imageUrl": doc.get("imageUrl"),
    }


async def get_all_products() -> list[dict]:
    """Every product in the catalog, as raw Mongo docs (used to build the index)."""
    cursor = db.products.find({})
    return await cursor.to_list(length=None)


async def get_user_purchased_product_ids(user_id: str) -> list[str]:
    """Distinct productIds the user has actually bought, as strings."""
    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        return []

    cursor = db.orders.find(
        {"customer.userId": oid, "status": {"$in": PURCHASED_STATUSES}},
        {"products.productId": 1},
    )

    ids: set[str] = set()
    async for order in cursor:
        for item in order.get("products", []):
            if item.get("productId") is not None:
                ids.add(str(item["productId"]))
    return list(ids)


async def get_fallback_products(limit: int) -> list[dict]:
    """Cold-start: newest in-stock products for users with no purchase history."""
    cursor = db.products.find({"stock": {"$gt": 0}}).sort("createdAt", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [serialize_product(d) for d in docs]
