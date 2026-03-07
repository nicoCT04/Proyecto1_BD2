from app.database import db
from bson import ObjectId
from datetime import datetime

def create_visit(data: dict):

    visit = {
        "userId": ObjectId(data["userId"]),
        "restaurantId": ObjectId(data["restaurantId"]),
        "source": data.get("source", "organic"),
        "device": data.get("device", "web"),
        "visitDate": datetime.utcnow()
    }

    result = db.restaurant_visits.insert_one(visit)

    return {"id": str(result.inserted_id)}

def serialize_visit(visit: dict):
    return {
        "_id": str(visit["_id"]),
        "userId": str(visit["userId"]),
        "restaurantId": str(visit["restaurantId"]),
        "source": visit.get("source"),
        "device": visit.get("device"),
        "visitDate": visit.get("visitDate").isoformat() if visit.get("visitDate") else None
    }

def get_visits():
    visits = list(db.restaurant_visits.find())
    return [serialize_visit(visit) for visit in visits]