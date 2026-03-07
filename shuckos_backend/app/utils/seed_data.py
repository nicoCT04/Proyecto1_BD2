from app.database import db
from bson import ObjectId
from datetime import datetime
from pymongo import InsertOne
import random


def generate_full_dataset(restaurant_id: str, user_id: str):

    restaurant_object_id = ObjectId(restaurant_id)
    user_object_id = ObjectId(user_id)

    visit_count = 50000
    conversion_rate = 0.10
    review_rate = 0.40

    #  1. VISITS
    visit_operations = []

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

    #  2. ORDERS
    order_ids = []
    total_orders = int(visit_count * conversion_rate)

    for _ in range(total_orders):
        total_amount = random.randint(30, 150)

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
            "total": total_amount,
            "status": "completed",
            "orderDate": datetime.utcnow()
        }

        result = db.orders.insert_one(order)
        order_ids.append(result.inserted_id)

    #  3. REVIEWS
    review_operations = []
    review_count = int(total_orders * review_rate)

    selected_orders = random.sample(order_ids, review_count)

    for order_id in selected_orders:
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

    #  4. INSPECTIONS
    inspection_operations = []

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

    #  5. RECALCULAR MÉTRICAS DEL RESTAURANTE

    # Orders
    db.restaurants.update_one(
        {"_id": restaurant_object_id},
        {"$set": {"totalOrders": total_orders}}
    )

    # Reviews
    review_stats = list(
        db.reviews.aggregate([
            {"$match": {"restaurantId": restaurant_object_id}},
            {
                "$group": {
                    "_id": "$restaurantId",
                    "avgRating": {"$avg": "$rating"},
                    "totalReviews": {"$sum": 1}
                }
            }
        ])
    )

    if review_stats:
        db.restaurants.update_one(
            {"_id": restaurant_object_id},
            {
                "$set": {
                    "averageRating": review_stats[0]["avgRating"],
                    "totalReviews": review_stats[0]["totalReviews"]
                }
            }
        )

    # Inspections
    inspection_stats = list(
        db.quality_inspections.aggregate([
            {"$match": {"restaurantId": restaurant_object_id}},
            {
                "$group": {
                    "_id": "$restaurantId",
                    "avgScore": {"$avg": "$score"}
                }
            }
        ])
    )

    if inspection_stats:
        db.restaurants.update_one(
            {"_id": restaurant_object_id},
            {
                "$set": {
                    "averageQualityScore": inspection_stats[0]["avgScore"]
                }
            }
        )

    return {
        "message": "Dataset realista generado correctamente",
        "visits": visit_count,
        "orders": total_orders,
        "reviews": review_count,
        "inspections": 200
    }