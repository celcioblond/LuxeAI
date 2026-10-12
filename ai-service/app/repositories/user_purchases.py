from collections import Counter

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import PyMongoError


# Returns what the user bought and how much in all his/her orders
async def get_user_purchaes(userId: str, db: AsyncDatabase) -> dict[str, int]:
    orders: AsyncCollection = db["orders"]

    user_orders = await orders.find({"customer.userId": ObjectId(userId)}).to_list()

    user_product_and_quantity = Counter()

    for order in user_orders:
        for product in order["products"]:
            user_product_and_quantity[str(product["productId"])] += product["quantity"]

    return dict(user_product_and_quantity)
