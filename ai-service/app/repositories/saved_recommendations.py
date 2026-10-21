from pymongo.asynchronous.database import AsyncDatabase


async def get_saved_recommendations(user_id: str, db: AsyncDatabase) -> list[str]:
    doc = await db["saved_recommendations"].find_one({"userId": user_id})
    return doc["productIds"] if doc else []


async def save_recommendations(
    user_id: str, product_ids: list[str], db: AsyncDatabase
) -> None:
    await db["saved_recommendations"].update_one(
        {"userId": user_id},
        {"$set": {"productIds": product_ids}},
        upsert=True,
    )
