import numpy as np


class VectorStore:

    def __init__(self):
        self.product_ids: list[str] = []
        self.embeddings: np.ndarray | None = None  # (n, dim), L2-normalized rows
        self.metadata: dict[str, dict] = {}        # product_id -> serialized product
        self._index: dict[str, int] = {}           # product_id -> row index

    def size(self) -> int:
        return len(self.product_ids)

    @staticmethod
    def _normalize(matrix: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0  # avoid division by zero for empty embeddings
        return matrix / norms

    def build(self, product_ids: list[str], embeddings: np.ndarray, metadata: dict[str, dict]):
        """Replace the index with a freshly embedded catalog."""
        self.product_ids = product_ids
        self.embeddings = self._normalize(embeddings) if embeddings.size else embeddings
        self.metadata = metadata
        self._index = {pid: i for i, pid in enumerate(product_ids)}

    def query(self, purchased_ids: list[str], limit: int) -> list[dict]:
        """Recommend products similar to the ones the user purchased.

        Score per candidate = MAX similarity across the user's purchases. Max
        (not average) preserves multiple distinct interests: a gothic shirt
        scores high near the gothic purchase even if it's far from the
        pre-workout purchase, and vice versa. Purchased and out-of-stock
        products are excluded.
        """
        if self.embeddings is None or self.embeddings.size == 0:
            return []

        purchased_set = set(purchased_ids)
        rows = [self._index[pid] for pid in purchased_ids if pid in self._index]
        if not rows:
            return []

        # Categories the user has actually purchased from. Recommendations are
        # restricted to these so we never suggest an unrelated category just to
        # fill the limit. Empty (e.g. legacy products without a category) means
        # no category constraint, falling back to pure similarity.
        def category_of(pid):
            return (self.metadata.get(pid, {}).get("category") or "").strip().lower()

        purchased_categories = {category_of(pid) for pid in purchased_ids if pid in self._index}
        purchased_categories.discard("")

        purchased_vecs = self.embeddings[rows]              # (k, dim)
        sims = self.embeddings @ purchased_vecs.T           # (n, k)
        scores = sims.max(axis=1)                           # (n,) max aggregation

        # Mask out anything we should never recommend.
        for i, pid in enumerate(self.product_ids):
            if pid in purchased_set:
                scores[i] = -np.inf
            elif (self.metadata.get(pid, {}).get("stock") or 0) <= 0:
                scores[i] = -np.inf
            elif purchased_categories and category_of(pid) not in purchased_categories:
                scores[i] = -np.inf

        order = np.argsort(-scores)[:limit]
        results = []
        for i in order:
            if not np.isfinite(scores[i]):
                continue
            product = dict(self.metadata[self.product_ids[i]])
            product["score"] = round(float(scores[i]), 4)
            results.append(product)
        return results


store = VectorStore()
