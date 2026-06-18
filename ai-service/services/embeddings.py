import numpy as np
from fastembed import TextEmbedding

from config import settings

_model: TextEmbedding | None = None


def get_model() -> TextEmbedding:
    """Lazy-load the embedding model.

    Importing this module is cheap; the ONNX model (~50MB) is only downloaded
    and loaded the first time we actually embed something (i.e. on /sync).
    """
    global _model
    if _model is None:
        _model = TextEmbedding(model_name=settings.model_name)
    return _model


def embed(texts: list[str]) -> np.ndarray:
    """Embed a list of texts into an (n, dim) float32 matrix."""
    if not texts:
        return np.empty((0, 0), dtype=np.float32)
    vectors = list(get_model().embed(texts))
    return np.array(vectors, dtype=np.float32)


def product_text(product: dict) -> str:
    """The text we embed for a product: name carries the theme, description the detail."""
    name = product.get("name") or ""
    description = product.get("description") or ""
    return f"{name}. {description}".strip()
