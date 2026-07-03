import numpy as np
from fastembed import TextEmbedding
from config.settings import settings

_model = None


def get_model():
  # loaded lazily so importing this module stays cheap; the model only
  # downloads the first time we actually embed (on sync)
  global _model
  if _model is None:
    _model = TextEmbedding(model_name=settings.model_name)
  return _model


def embed(texts):
  if not texts:
    return np.empty((0, 0), dtype=np.float32)
  vectors = list(get_model().embed(texts))
  return np.array(vectors, dtype=np.float32)


def product_text(product):
  name = product.get("name") or ""
  description = product.get("description") or ""
  return f"{name}. {description}".strip()
