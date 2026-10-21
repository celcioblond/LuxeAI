from app.db.db import MongoDbDep
from app.repositories.catalog import get_catalog
from app.repositories.user_purchases import get_user_purchases
from app.schemas.serialize_products import individual_serial_to_front
from app.services.recommender import build_index, recommend
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter(
    prefix="/recommendations",
)


@router.get("/{user_id}")
async def get_recommendations(
    request: Request, db: MongoDbDep, user_id: str, limit: int = Query(3, ge=1, le=50)
):
    try:
        purchases = await get_user_purchases(user_id, db)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if not purchases:
        return {"recommendations": []}

    index = request.app.state.index
    recommended_ids = recommend(index, purchases, limit)

    return {
        "recommendations": [
            individual_serial_to_front(index.products_by_id[product_id])
            for product_id in recommended_ids
        ]
    }


@router.post("/sync")
async def sync(request: Request, db: MongoDbDep):
    catalog = await get_catalog(db)
    request.app.state.index = build_index(catalog)
    return {
        "message": "Index synced correctly",
        "products": len(request.app.state.index.product_ids),
    }
