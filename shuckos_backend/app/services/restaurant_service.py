from app.database import db
from bson import ObjectId

def create_restaurant(data: dict):
    result = db.restaurants.insert_one(data)
    return str(result.inserted_id)

def get_all_restaurants():
    restaurants = list(db.restaurants.find())
    for r in restaurants:
        r["_id"] = str(r["_id"])
        # Mapear averageRating a rating para compatibilidad con el frontend
        r["rating"] = r.get("averageRating", 0)
    return restaurants

def get_restaurant_by_id(restaurant_id: str):
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if restaurant:
        restaurant["_id"] = str(restaurant["_id"])
        restaurant["rating"] = restaurant.get("averageRating", 0)
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


def search_restaurants_nearby(lat: float, lng: float, max_distance: int = 5000):
    """
    Busca restaurantes cercanos usando indice geoespacial 2dsphere.
    Usa $near para encontrar restaurantes dentro del radio especificado.
    """
    try:
        restaurants = list(db.restaurants.find({
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]  # GeoJSON usa [longitud, latitud]
                    },
                    "$maxDistance": max_distance
                }
            }
        }).limit(20))
        
        for r in restaurants:
            r["_id"] = str(r["_id"])
            r["rating"] = r.get("averageRating", 0)
        
        return {
            "message": "Busqueda geoespacial completada",
            "query": {
                "tipo": "Indice 2dsphere",
                "coordenadas": [lng, lat],
                "radio_metros": max_distance
            },
            "resultados": restaurants,
            "total": len(restaurants)
        }
    except Exception as e:
        return {
            "message": "Error en busqueda geoespacial",
            "error": str(e),
            "nota": "Asegurate de crear los indices con /api/admin/create-indexes"
        }


def search_restaurants_text(query: str):
    """
    Busca restaurantes usando indice de texto full-text.
    Busca en campos name y description.
    """
    try:
        restaurants = list(db.restaurants.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(20))
        
        for r in restaurants:
            r["_id"] = str(r["_id"])
            r["rating"] = r.get("averageRating", 0)
            r["relevancia"] = r.pop("score", 0)
        
        return {
            "message": "Busqueda de texto completada",
            "query": {
                "tipo": "Indice de Texto (Full-text)",
                "busqueda": query,
                "campos_indexados": ["name", "description"]
            },
            "resultados": restaurants,
            "total": len(restaurants)
        }
    except Exception as e:
        return {
            "message": "Error en busqueda de texto",
            "error": str(e),
            "nota": "Asegurate de crear los indices con /api/admin/create-indexes"
        }