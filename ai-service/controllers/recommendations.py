from config.settings import settings
from models.http_error import HttpError
from models import order as Order
from models import product as Product
from services.embeddings import embed, product_text
from services.vector_store import store


async def sync():
  try:
    products = await Product.find_all()
    if not products:
      store.build([], embed([]), {})
      return { "synced": 0 }

    product_ids = [str(product["_id"]) for product in products]
    texts = [product_text(product) for product in products]
    embeddings = embed(texts)
    metadata = { str(product["_id"]): Product.serialize(product) for product in products }

    store.build(product_ids, embeddings, metadata)
    return { "synced": len(product_ids) }
  except Exception as error:
    raise HttpError(f"Failed to sync catalog: {error}", 500)


async def get_recommendations(user_id, limit=None):
  try:
    if not user_id:
      raise HttpError("User id is required", 400)

    top = limit or settings.default_limit
    purchased = await Order.find_purchased_product_ids(user_id)

    # Cold start: no purchase history yet — return nothing so the client can
    # prompt the user to make a purchase before recommendations appear
    if not purchased:
      return { "recommendations": [] }

    results = store.query(purchased, top)

    # Purchased products may have been deleted, or nothing similar is in stock
    if not results:
      fallback = await Product.find_fallback(top)
      return { "recommendations": fallback }

    return { "recommendations": results }
  except HttpError:
    raise
  except Exception as error:
    raise HttpError(f"Failed to fetch recommendations: {error}", 500)


async def health():
  return { "status": "ok", "products_indexed": store.size() }
