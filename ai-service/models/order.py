from bson import ObjectId
from bson.errors import InvalidId
from config.db import get_db

# Only orders in these states count as a real purchase worth learning from
PURCHASED_STATUSES = ["paid", "processing", "shipped", "delivered"]


async def find_purchased_product_ids(user_id):
  try:
    oid = ObjectId(user_id)
  except (InvalidId, TypeError):
    return []

  db = get_db()
  cursor = db.orders.find(
    { "customer.userId": oid, "status": { "$in": PURCHASED_STATUSES } },
    { "products.productId": 1 },
  )

  ids = set()
  async for order in cursor:
    for item in order.get("products", []):
      if item.get("productId") is not None:
        ids.add(str(item["productId"]))
  return list(ids)
