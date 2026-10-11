from collections import Counter

from app.db.db import MongoDbDep
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from pymongo.errors import PyMongoError


# Returns what the user bought and how much in all his/her orders
async def get_user_purchaes(userId: str, db: MongoDbDep) -> dict[str, int]:
    orders_collection = db["orders"]
    try:
        user_object_id = ObjectId(userId)
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="Invalid user id") from e

    try:
        # Get the user's orders
        user_orders = await orders_collection.find(
            {"customer.userId": user_object_id}
        ).to_list()
        # Get the users products and quantity
        user_product_and_quantity = Counter()
        for order in user_orders:
            for product in order["products"]:
                user_product_and_quantity[str(product["productId"])] += product[
                    "quantity"
                ]
        return dict(user_product_and_quantity)

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail="Could not retrieve orders") from e
