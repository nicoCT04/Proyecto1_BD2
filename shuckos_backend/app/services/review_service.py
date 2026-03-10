from app.database import client, db
from bson import ObjectId
from datetime import datetime
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern
from pymongo.errors import ConnectionFailure, OperationFailure

def create_review(data: dict):
    def callback(session):
        user_id = ObjectId(data["user"])
        restaurant_id = ObjectId(data["restaurant"])
        order_id_str = data.get("orderId")
        rating = data["rating"]

        # 1. Verificar que la orden exista y pertenezca al usuario (Opcional si viene orderId)
        if order_id_str:
            order_id = ObjectId(order_id_str)
            order = db.orders.find_one(
                {
                    "_id": order_id,
                    "userId": user_id,
                    "restaurantId": restaurant_id
                },
                session=session
            )

            if not order:
                raise Exception("Compra no válida para review")

            # 2. Evitar duplicados: una reseña por orden
            existing_review = db.reviews.find_one({"orderId": order_id}, session=session)
            if existing_review:
                raise Exception("Ya existe una reseña para esta orden")
        else:
            order_id = None

        # 3. Insertar la reseña
        review = {
            "userId": user_id,
            "restaurantId": restaurant_id,
            "orderId": order_id,
            "rating": rating,
            "comment": data.get("comment"),
            "verifiedPurchase": True if order_id else False,
            "createdAt": datetime.utcnow()
        }
        db.reviews.insert_one(review, session=session)

        # 4. Cálculo Incremental Matemático (Fix para evitar el desfase del aggregate)
        # Obtenemos el estado actual del restaurante DENTRO de la transacción
        restaurant = db.restaurants.find_one({"_id": restaurant_id}, session=session)
        if not restaurant:
            raise Exception("Restaurante no encontrado")

        current_total = restaurant.get("totalReviews", 0)
        current_avg = restaurant.get("averageRating", 0.0)

        # Fórmula: NuevoPromedio = ((PromedioActual * TotalActual) + NuevaRating) / (TotalActual + 1)
        new_total = current_total + 1
        new_avg = ((current_avg * current_total) + rating) / new_total

        # 5. Actualizar restaurante con los nuevos valores calculados
        db.restaurants.update_one(
            {"_id": restaurant_id},
            {
                "$set": {
                    "averageRating": round(new_avg, 2),
                    "totalReviews": new_total,
                    "rating": round(new_avg, 2) # Sincronizar campo rating para el frontend
                }
            },
            session=session
        )

        return {"message": "Review creada correctamente"}

    with client.start_session() as session:
        try:
            return session.with_transaction(
                callback,
                read_concern=ReadConcern("majority"),
                write_concern=WriteConcern("majority")
            )
        except (ConnectionFailure, OperationFailure) as e:
            raise Exception(f"Error transaccional en reseña: {str(e)}")
        
def serialize_review(review: dict):
    return {
        "_id": str(review["_id"]),
        "userId": str(review["userId"]),
        "restaurantId": str(review["restaurantId"]),
        "orderId": str(review["orderId"]) if review.get("orderId") else None,
        "rating": review["rating"],
        "comment": review.get("comment"),
        "verifiedPurchase": review.get("verifiedPurchase", False),
        "createdAt": review["createdAt"].isoformat() if isinstance(review["createdAt"], datetime) else review["createdAt"]
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
    # Lógica de eliminación simplificada, en producción debería ser transaccional
    review = db.reviews.find_one({"_id": ObjectId(review_id)})

    if not review:
        return {"message": "Review no encontrada"}

    restaurant_id = review["restaurantId"]

    with client.start_session() as session:
        def callback(session):
            db.reviews.delete_one({"_id": ObjectId(review_id)}, session=session)

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

            result = list(db.reviews.aggregate(pipeline, session=session))

            if result:
                db.restaurants.update_one(
                    {"_id": restaurant_id},
                    {
                        "$set": {
                            "averageRating": round(result[0]["avgRating"], 2),
                            "totalReviews": result[0]["totalReviews"],
                            "rating": round(result[0]["avgRating"], 2)
                        }
                    },
                    session=session
                )
            else:
                db.restaurants.update_one(
                    {"_id": restaurant_id},
                    {
                        "$set": {
                            "averageRating": 0,
                            "totalReviews": 0,
                            "rating": 0
                        }
                    },
                    session=session
                )
            return {"message": "Review eliminada correctamente"}

        try:
            return session.with_transaction(callback)
        except Exception as e:
            raise Exception(f"Error al eliminar reseña: {str(e)}")

def delete_many_reviews(filter_query: dict):
    # Para eliminaciones masivas, es mejor manejarlo fuera de una sola transacción
    # si el volumen es muy alto para evitar bloqueos largos.
    # Aquí lo mantendremos simple pero efectivo.
    reviews = list(db.reviews.find(filter_query))
    restaurant_ids = set(review["restaurantId"] for review in reviews)

    result = db.reviews.delete_many(filter_query)

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
                        "averageRating": round(agg_result[0]["avgRating"], 2),
                        "totalReviews": agg_result[0]["totalReviews"],
                        "rating": round(agg_result[0]["avgRating"], 2)
                    }
                }
            )
        else:
            db.restaurants.update_one(
                {"_id": restaurant_id},
                {
                    "$set": {
                        "averageRating": 0,
                        "totalReviews": 0,
                        "rating": 0
                    }
                }
            )

    return {"deleted": result.deleted_count}