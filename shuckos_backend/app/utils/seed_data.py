from app.database import db
from bson import ObjectId
from datetime import datetime
from pymongo import InsertOne
import random


def generate_full_dataset(restaurant_id: str, user_id: str):

    restaurant_object_id = ObjectId(restaurant_id)
    user_object_id = ObjectId(user_id)

    visit_operations = []
    order_operations = []
    review_operations = []
    inspection_operations = []

    visit_count = 50000
    conversion_rate = 0.10
    review_rate = 0.40

    # 🔹 Generar visitas
    for _ in range(visit_count):

        visit_operations.append(
            InsertOne({
                "userId": user_object_id,
                "restaurantId": restaurant_object_id,
                "source": random.choice(["ads", "organic", "social"]),
                "device": random.choice(["mobile", "web"]),
                "visitDate": datetime.utcnow()
            })
        )

        if len(visit_operations) == 1000:
            db.restaurant_visits.bulk_write(visit_operations)
            visit_operations = []

    if visit_operations:
        db.restaurant_visits.bulk_write(visit_operations)

    # 🔹 Generar órdenes
    order_ids = []

    for _ in range(int(visit_count * conversion_rate)):

        total = random.randint(30, 150)

        order = {
            "userId": user_object_id,
            "restaurantId": restaurant_object_id,
            "items": [
                {
                    "name": "Shuko Especial",
                    "price": 35,
                    "quantity": 1,
                    "subtotal": 35
                }
            ],
            "total": total,
            "status": "completed",
            "orderDate": datetime.utcnow()
        }

        result = db.orders.insert_one(order)
        order_ids.append(result.inserted_id)

    # 🔹 Generar reviews
    for order_id in random.sample(order_ids, int(len(order_ids) * review_rate)):

        review_operations.append(
            InsertOne({
                "userId": user_object_id,
                "restaurantId": restaurant_object_id,
                "orderId": order_id,
                "rating": random.randint(3, 5),
                "comment": "Auto generated review",
                "verifiedPurchase": True,
                "createdAt": datetime.utcnow()
            })
        )

    if review_operations:
        db.reviews.bulk_write(review_operations)

    # 🔹 Generar inspecciones
    for _ in range(200):
        inspection_operations.append(
            InsertOne({
                "restaurantId": restaurant_object_id,
                "inspectorId": user_object_id,
                "score": random.randint(6, 10),
                "observations": "Auto generated inspection",
                "inspectionDate": datetime.utcnow()
            })
        )

    if inspection_operations:
        db.quality_inspections.bulk_write(inspection_operations)

    return {
        "message": "Dataset realista generado",
        "visits": visit_count,
        "orders": int(visit_count * conversion_rate),
        "reviews": int(len(order_ids) * review_rate),
        "inspections": 200
    }