import numpy as np


class VectorStore:
  def __init__(self):
    self.product_ids = []
    self.embeddings = None
    self.metadata = {}
    self.index = {}

  def size(self):
    return len(self.product_ids)

  def normalize(self, matrix):
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return matrix / norms

  def build(self, product_ids, embeddings, metadata):
    self.product_ids = product_ids
    self.embeddings = self.normalize(embeddings) if embeddings.size else embeddings
    self.metadata = metadata
    self.index = { pid: i for i, pid in enumerate(product_ids) }

  def query(self, purchased_ids, limit):
    if self.embeddings is None or self.embeddings.size == 0:
      return []

    purchased_set = set(purchased_ids)
    rows = [self.index[pid] for pid in purchased_ids if pid in self.index]
    if not rows:
      return []

    purchased_vecs = self.embeddings[rows]
    sims = self.embeddings @ purchased_vecs.T

    # score = highest similarity to any single purchase (max, not average) so
    # multiple distinct interests (gothic, pre-workout) are each preserved
    scores = sims.max(axis=1)

    # never recommend what they already bought or anything out of stock
    for i, pid in enumerate(self.product_ids):
      if pid in purchased_set:
        scores[i] = -np.inf
      elif (self.metadata.get(pid, {}).get("stock") or 0) <= 0:
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
