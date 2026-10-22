from bson import ObjectId

from app.repositories.user_purchases import PAID_STATUSES, get_user_purchases


class FakeOrders:
    def __init__(self, orders):
        self.orders = orders
        self.query = None

    def find(self, query):
        self.query = query
        outer = self

        class Cursor:
            async def to_list(self):
                return [
                    o for o in outer.orders if o["status"] in query["status"]["$in"]
                ]

        return Cursor()


async def test_only_paid_orders_count_as_purchases():
    pid_paid, pid_pending = ObjectId(), ObjectId()
    orders = FakeOrders(
        [
            {"status": "paid", "products": [{"productId": pid_paid, "quantity": 2}]},
            {
                "status": "pending",
                "products": [{"productId": pid_pending, "quantity": 1}],
            },
        ]
    )
    result = await get_user_purchases(str(ObjectId()), {"orders": orders})
    assert result == {str(pid_paid): 2}
    assert "pending" not in PAID_STATUSES
