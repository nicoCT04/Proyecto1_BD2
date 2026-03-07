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
        
def serialize_review(review: dict):
    return {
        "_id": str(review["_id"]),
        "userId": str(review["userId"]),
        "restaurantId": str(review["restaurantId"]),
        "orderId": str(review["orderId"]),
        "rating": review["rating"],
        "comment": review.get("comment"),
        "verifiedPurchase": review["verifiedPurchase"],
        "createdAt": review["createdAt"].isoformat()
    }

def get_all_reviews():
    reviews = list(db.reviews.find())
    return [serialize_review(review) for review in reviews]

def get_reviews_by_restaurant(restaurant_id: str):
    reviews = list(
        db.reviews.find({"restaurantId": ObjectId(restaurant_id)})
    )
    return [serialize_review(review) for review in reviews]

def delete_review(review_id: str):

    review = db.reviews.find_one({"_id": ObjectId(review_id)})

    if not review:
        return {"message": "Review no encontrada"}

    restaurant_id = review["restaurantId"]

    db.reviews.delete_one({"_id": ObjectId(review_id)})

    # Recalcular promedio
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
            }
        )
    else:
        # Si ya no hay reviews
        db.restaurants.update_one(
            {"_id": restaurant_id},
            {
                "$set": {
                    "averageRating": 0,
                    "totalReviews": 0
                }
            }
        )

    return {"message": "Review eliminada correctamente"}

def delete_many_reviews(filter_query: dict):

    reviews = list(db.reviews.find(filter_query))

    restaurant_ids = set(review["restaurantId"] for review in reviews)

    result = db.reviews.delete_many(filter_query)

    # Recalcular promedio para cada restaurante afectado
    for restaurant_id in restaurant_ids:

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

        agg_result = list(db.reviews.aggregate(pipeline))

        if agg_result:
            db.restaurants.update_one(
                {"_id": restaurant_id},
                {
                    "$set": {
                        "averageRating": agg_result[0]["avgRating"],
                        "totalReviews": agg_result[0]["totalReviews"]
                    }
                }
            )
        else:
            db.restaurants.update_one(
                {"_id": restaurant_id},
                {
                    "$set": {
                        "averageRating": 0,
                        "totalReviews": 0
                    }
                }
            )

    return {"deleted": result.deleted_count}