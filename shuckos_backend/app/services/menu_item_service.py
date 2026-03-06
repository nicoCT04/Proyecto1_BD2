from app.database import db
from bson import ObjectId

def create_menu_item(data: dict):
    data["restaurantId"] = ObjectId(data["restaurantId"])
    result = db.menu_items.insert_one(data)
    return str(result.inserted_id)

def get_menu_items():
    items = list(db.menu_items.find())
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item["restaurantId"])
    return items

def get_menu_items_by_restaurant(restaurant_id: str):
    items = list(
        db.menu_items.find({"restaurantId": ObjectId(restaurant_id)})
    )
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item["restaurantId"])
    return items