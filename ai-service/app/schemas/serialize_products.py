def individual_serial_to_front(product) -> dict:
    return {
        "_id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "category": product["category"],
        "price": product["price"],
        "stock": product["stock"],
        "imageUrl": product["imageUrl"],
    }
