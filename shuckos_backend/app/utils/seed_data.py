from app.database import db
from bson import ObjectId
from datetime import datetime
from pymongo import InsertOne
import random


def generate_visits_bulk(restaurant_id: str, user_id: str, amount: int = 50000):

    operations = []

    restaurant_object_id = ObjectId(restaurant_id)
    user_object_id = ObjectId(user_id)

    for _ in range(amount):

        visit = {
            "userId": user_object_id,
            "restaurantId": restaurant_object_id,
            "source": random.choice(["ads", "organic", "social"]),
            "device": random.choice(["mobile", "web"]),
            "visitDate": datetime.utcnow()
        }

        operations.append(InsertOne(visit))

        # Ejecutar en batches de 1000 para no saturar memoria
        if len(operations) == 1000:
            db.restaurant_visits.bulk_write(operations)
            operations = []

    if operations:
        db.restaurant_visits.bulk_write(operations)

    return {"message": f"{amount} visitas generadas correctamente"}
