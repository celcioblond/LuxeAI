from collections import Counter

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import PyMongoError

PAID_STATUSES = ["paid", "processing", "shipped", "delivered"]


# Returns what the user bought and how much in all his/her orders
async def get_user_purchases(user_id: str, db: AsyncDatabase) -> dict[str, int]:
    orders: AsyncCollection = db["orders"]

    # Only orders that were actually paid count as purchases
    user_orders = await orders.find(
        {
            "customer.userId": ObjectId(user_id),
            "status": {"$in": PAID_STATUSES},
        }
    ).to_list()

    user_product_and_quantity = Counter()

    for order in user_orders:
        for product in order["products"]:
            user_product_and_quantity[str(product["productId"])] += product["quantity"]

    return dict(user_product_and_quantity)
