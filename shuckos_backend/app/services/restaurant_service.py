from app.database import db
from bson import ObjectId

def create_restaurant(data: dict):
    result = db.restaurants.insert_one(data)
    return str(result.inserted_id)

def get_all_restaurants():
    restaurants = list(db.restaurants.find())
    for r in restaurants:
        r["_id"] = str(r["_id"])
    return restaurants

def get_restaurant_by_id(restaurant_id: str):
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if restaurant:
        restaurant["_id"] = str(restaurant["_id"])
    return restaurant

def update_restaurant(restaurant_id: str, data: dict):
    db.restaurants.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$set": data}
    )
    return {"message": "Restaurant updated"}

def delete_restaurant(restaurant_id: str):
    db.restaurants.delete_one({"_id": ObjectId(restaurant_id)})
    return {"message": "Restaurant deleted"}

def update_many_restaurants(filter_query: dict, update_data: dict):
    result = db.restaurants.update_many(
        filter_query,
        {"$set": update_data}
    )
    return {
        "matched": result.matched_count,
        "modified": result.modified_count
    }

def delete_many_restaurants(filter_query: dict):
    result = db.restaurants.delete_many(filter_query)
    return {"deleted": result.deleted_count}