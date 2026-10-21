from app.services.recommender import build_index, recommend

PRODUCTS = [
    {
        "_id": "1",
        "name": "Moisturizer",
        "description": "skin cream",
        "category": "Skincare",
        "stock": 5,
    },
    {
        "_id": "2",
        "name": "Face serum",
        "description": "skin serum",
        "category": "Skincare",
        "stock": 5,
    },
    {
        "_id": "3",
        "name": "Keyboard",
        "description": "mechanical keys",
        "category": "Tech",
        "stock": 5,
    },
]


def test_recommend_similar_products():
    index = build_index(PRODUCTS)
    assert recommend(index, {"1": 1}, 2)[0] == "2"


def test_respects_limits_and_skips():
    index = build_index(PRODUCTS)
    result = recommend(index, {"1": 1}, 1)
    assert len(result) == 1 and "1" not in result


def test_empty_cases():
    assert recommend(build_index([]), {"1": 1}, 3) == []
    assert recommend(build_index(PRODUCTS), {}, 3) == []


def test_skips_products_with_zero_or_negative_stock():
    products = [dict(p) for p in PRODUCTS]
    products[1]["stock"] = -2
    index = build_index(products)
    assert "2" not in recommend(index, {"1": 1}, 3)
