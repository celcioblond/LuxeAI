import pytest
from fastapi.testclient import TestClient

import app.api.recommendation_routes as routes
from app.main import app
from app.services.recommender import build_index


def product(pid, category, stock=5):
    return {
        "_id": pid,
        "name": f"item {pid}",
        "description": f"{category} thing",
        "category": category,
        "stock": stock,
        "price": 1,
        "imageUrl": "x",
    }


@pytest.fixture
def client(monkeypatch):
    store, purchases = {}, {}

    async def fake_purchases(user_id, db):
        return dict(purchases)

    async def fake_get_saved(user_id, db):
        return store.get(user_id, [])

    async def fake_save(user_id, ids, db):
        store[user_id] = ids

    monkeypatch.setattr(routes, "get_user_purchases", fake_purchases)
    monkeypatch.setattr(routes, "get_saved_recommendations", fake_get_saved)
    monkeypatch.setattr(routes, "save_recommendations", fake_save)

    app.state.mongo_db = None
    # No `with`: the lifespan would connect to the real database
    test_client = TestClient(app)
    test_client.purchases, test_client.store = purchases, store
    return test_client


def ids(response):
    return [p["_id"] for p in response.json()["recommendations"]]


def test_previous_recommendations_are_kept(client):
    app.state.index = build_index(
        [product(str(i), "Skincare") for i in range(1, 4)]
        + [product(str(i), "Fitness") for i in range(4, 8)]
    )
    client.purchases["1"] = 1
    first = ids(client.get("/recommendations/u1"))
    client.purchases["4"] = 1
    second = ids(client.get("/recommendations/u1"))

    still_valid = [i for i in first if i not in client.purchases]
    assert second[: len(still_valid)] == still_valid
    assert not set(second) & set(client.purchases)


def test_saved_list_is_capped(client):
    app.state.index = build_index([product(str(i), "Skincare") for i in range(1, 40)])
    client.purchases["1"] = 1
    client.store["u1"] = [str(i) for i in range(2, 30)]
    assert (
        len(ids(client.get("/recommendations/u1"))) == routes.MAX_SAVED_RECOMMENDATIONS
    )


def test_invalid_user_id_returns_400():
    app.state.mongo_db = {"orders": type("Orders", (), {"find": lambda *a: None})()}
    assert TestClient(app).get("/recommendations/not-an-id").status_code == 400
