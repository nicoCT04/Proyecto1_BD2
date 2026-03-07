from app.database import client, db
from bson import ObjectId
from datetime import datetime

def create_review(data: dict):

    with client.start_session() as session:
        with session.start_transaction():

            user_id = ObjectId(data["userId"])
            restaurant_id = ObjectId(data["restaurantId"])
            order_id = ObjectId(data["orderId"])
            rating = data["rating"]

            #  Verificar que la orden exista y pertenezca al usuario
            order = db.orders.find_one(
                {
                    "_id": order_id,
                    "userId": user_id,
                    "restaurantId": restaurant_id
                }
            )

            if not order:
                raise Exception("Compra no válida para review")

            review = {
                "userId": user_id,
                "restaurantId": restaurant_id,
                "orderId": order_id,
                "rating": rating,
                "comment": data.get("comment"),
                "verifiedPurchase": True,
                "createdAt": datetime.utcnow()
            }

            db.reviews.insert_one(review, session=session)

            #  Recalcular promedio
            pipeline = [
                {"$match": {"restaurantId": restaurant_id}},
                {
                    "$group": {
                        "_id": "$restaurantId",
                        "avgRating": {"$avg": "$rating"},
                        "totalReviews": {"$sum": 1}
                    }
                }
            ]

            result = list(db.reviews.aggregate(pipeline))

            if result:
                db.restaurants.update_one(
                    {"_id": restaurant_id},
                    {
                        "$set": {
                            "averageRating": result[0]["avgRating"],
                            "totalReviews": result[0]["totalReviews"]
                        }
                    },
                    session=session
                )

            return {"message": "Review creada correctamente"}