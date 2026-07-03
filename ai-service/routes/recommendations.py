from fastapi import APIRouter
from controllers import recommendations as controller

router = APIRouter()

router.add_api_route("/health", controller.health, methods=["GET"])
router.add_api_route("/sync", controller.sync, methods=["POST"])
router.add_api_route("/recommendations/{user_id}", controller.get_recommendations, methods=["GET"])
