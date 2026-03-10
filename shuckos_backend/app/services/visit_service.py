from app.database import db
from bson import ObjectId
from datetime import datetime

def create_visit(data: dict):

    visit = {
        "userId": ObjectId(data["userId"]) if data.get("userId") else None,
        "restaurantId": ObjectId(data["restaurant"]) if data.get("restaurant") else ObjectId(data.get("restaurantId")),
        "source": data.get("source", "organic"),
        "device": data.get("device", "web"),
        "ip": data.get("ip"),
        "visitDate": data.get("timestamp") or datetime.utcnow()
    }

    result = db.restaurant_visits.insert_one(visit)

    return {"id": str(result.inserted_id)}

def serialize_visit(visit: dict):
    return {
        "_id": str(visit["_id"]),
        "userId": str(visit["userId"]) if visit.get("userId") else None,
        "restaurantId": str(visit["restaurantId"]),
        "source": visit.get("source"),
        "device": visit.get("device"),
        "ip": visit.get("ip"),
        "visitDate": visit.get("visitDate").isoformat() if isinstance(visit.get("visitDate"), datetime) else visit.get("visitDate"),
        "timestamp": visit.get("visitDate").isoformat() if isinstance(visit.get("visitDate"), datetime) else visit.get("visitDate") # Alias para frontend
    }

def get_visits():
    visits = list(db.restaurant_visits.find())
    return [serialize_visit(visit) for visit in visits]

def get_visits_by_restaurant(restaurant_id: str):
    # Limitamos a los últimos 100 registros para evitar saturar el frontend
    visits = list(
        db.restaurant_visits.find({"restaurantId": ObjectId(restaurant_id)})
        .sort("visitDate", -1)
        .limit(100)
    )
    return [serialize_visit(visit) for visit in visits]