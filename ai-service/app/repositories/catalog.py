from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase


# Brings products required by front and to transform
async def get_catalog(db: AsyncDatabase) -> list[dict]:
    products_collection: AsyncCollection = db["products"]
    products = await products_collection.find(
        {},
        {
            "name": 1,
            "description": 1,
            "category": 1,
            "price": 1,
            "stock": 1,
            "imageUrl": 1,
        },
    ).to_list()

    id_key = "_id"

    for product in products:
        product[id_key] = str(product[id_key])
    return products
