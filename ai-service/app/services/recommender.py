from dataclasses import dataclass

import numpy as np
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass(frozen=True)
class CatalogIndex:
    product_ids: list[str]
    id_to_row: dict[str, int]
    matrix: csr_matrix | None
    products_by_id: dict[str, dict]


def build_index(products: list[dict]) -> CatalogIndex:
    if len(products) == 0:
        return CatalogIndex(
            product_ids=[], id_to_row={}, matrix=None, products_by_id={}
        )
    product_ids = [product["_id"] for product in products]

    id_to_row = {product["_id"]: i for i, product in enumerate(products)}

    products_by_id: dict = {product["_id"]: product for product in products}

    texts = [
        f"{product['name']} {product['description']} {product['category']} {product['category']}"
        for product in products
    ]

    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(texts)
    return CatalogIndex(
        product_ids=product_ids,
        id_to_row=id_to_row,
        matrix=matrix,
        products_by_id=products_by_id,
    )


def recommend(index: CatalogIndex, purchases: dict[str, int], limit: int) -> list[str]:
    if index.matrix is None or not purchases:
        return []

    rows = []
    weights = []
    for product_id, qty in purchases.items():
        row = index.id_to_row.get(product_id)
        if row is None:
            continue
        rows.append(row)
        weights.append(qty)

    if not rows:
        return []

    weights = np.array(weights, dtype=float)
    profile = index.matrix[rows].multiply(weights[:, None]).sum(axis=0)
    profile = np.asarray(profile)

    scores = cosine_similarity(profile, index.matrix)[0]

    recommended = []
    for pos in np.argsort(scores)[::-1]:
        product_id = index.product_ids[pos]

        if product_id in purchases:
            continue

        if index.products_by_id[product_id]["stock"] <= 0:
            continue

        recommended.append(product_id)
        if len(recommended) >= limit:
            break

    return recommended
