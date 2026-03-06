from app.database import db
from bson import ObjectId
from datetime import datetime

def create_order(data: dict):
    user_id = ObjectId(data["userId"])
    restaurant_id = ObjectId(data["restaurantId"])
    items_input = data["items"]

    items = []
    total = 0

    for item in items_input:
        price = item["price"]
        quantity = item["quantity"]
        subtotal = price * quantity

        items.append({
            "name": item["name"],
            "price": price,
            "quantity": quantity,
            "subtotal": subtotal
        })

        total += subtotal

    order = {
        "userId": user_id,
        "restaurantId": restaurant_id,
        "items": items,
        "total": total,
        "status": "pending",
        "orderDate": datetime.utcnow()
    }

    result = db.orders.insert_one(order)
    return str(result.inserted_id)