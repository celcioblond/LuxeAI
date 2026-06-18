from db.mongo import (
    get_all_products,
    get_fallback_products,
    get_user_purchased_product_ids,
    serialize_product,
)
from services.embeddings import embed, product_text
from services.vector_store import store


async def sync_catalog() -> int:
    """Read every product from Mongo, embed it, and (re)build the vector index.

    This is the only place the embedding model actually runs. Returns the number
    of products indexed.
    """
    products = await get_all_products()
    if not products:
        store.build([], embed([]), {})
        return 0

    product_ids = [str(p["_id"]) for p in products]
    texts = [product_text(p) for p in products]
    embeddings = embed(texts)
    metadata = {str(p["_id"]): serialize_product(p) for p in products}

    store.build(product_ids, embeddings, metadata)
    return len(product_ids)


async def recommend(user_id: str, limit: int) -> list[dict]:
    """Top-N recommendations for a user, with a cold-start fallback."""
    purchased = await get_user_purchased_product_ids(user_id)
    if not purchased:
        return await get_fallback_products(limit)

    results = store.query(purchased, limit)
    if not results:
        # Purchased products may have been deleted from the catalog, or nothing
        # similar is in stock — fall back rather than return an empty list.
        return await get_fallback_products(limit)
    return results
