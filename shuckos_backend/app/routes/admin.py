from fastapi import APIRouter, Body, HTTPException
from app.utils.index_creator import create_indexes, configure_no_table_scan, get_index_usage_stats
from app.utils.seed_data import generate_full_dataset, SHUKOS_NAMES
from app.database import db
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/create-indexes")
def create_indexes_route():
    create_indexes()
    return {"message": "All index types created successfully (Simple, Compound, Geospatial, Text, Multikey)"}

@router.get("/configure-no-table-scan")
def configure_no_table_scan_route():
    result = configure_no_table_scan()
    return result

@router.get("/index-usage-stats")
def get_index_stats():
    stats = get_index_usage_stats()
    return {"message": "Index usage statistics", "data": stats}

@router.post("/seed-full-dataset")
def seed_full_dataset(data: dict = Body(default={})):
    # Si se pasan IDs específicos, usarlos
    restaurant_id = data.get("restaurantId") if data else None
    user_id = data.get("userId") if data else None
    
    # Si no se pasan IDs, buscar o crear automáticamente
    if not restaurant_id:
        restaurant = db.restaurants.find_one({"isActive": True})
        if not restaurant:
            restaurant_result = db.restaurants.insert_one({
                "name": "Shukos Demo Restaurant",
                "description": "Restaurante de prueba para dataset",
                "location": {
                    "type": "Point",
                    "coordinates": [-90.5069, 14.6349]
                },
                "address": {
                    "street": "5ta Avenida",
                    "zone": "Zona 1", 
                    "city": "Guatemala"
                },
                "contact": {
                    "phone": "12345678",
                    "email": "demo@shukos.com"
                },
                "averageRating": 0,
                "totalReviews": 0,
                "isActive": True,
                "createdAt": datetime.utcnow()
            })
            restaurant_id = str(restaurant_result.inserted_id)
        else:
            restaurant_id = str(restaurant["_id"])
    
    if not user_id:
        user = db.users.find_one({"role": "client", "isActive": True})
        if not user:
            user_result = db.users.insert_one({
                "name": "Usuario Demo",
                "email": "demo@example.com",
                "phone": "87654321",
                "role": "client",
                "isActive": True,
                "createdAt": datetime.utcnow()
            })
            user_id = str(user_result.inserted_id)
        else:
            user_id = str(user["_id"])

    return generate_full_dataset(restaurant_id, user_id)

@router.delete("/reset-database")
def reset_database(data: dict = Body(default={})):
    seeded = list(db.restaurants.find({"name": {"$in": SHUKOS_NAMES}}, {"_id": 1}))
    seeded_ids = [r["_id"] for r in seeded]

    if not seeded_ids:
        visits_count = db.restaurant_visits.count_documents({})
        orders_count = db.orders.count_documents({})
        reviews_count = db.reviews.count_documents({})
        inspections_count = db.quality_inspections.count_documents({})
        db.restaurant_visits.delete_many({})
        db.orders.delete_many({})
        db.reviews.delete_many({})
        db.quality_inspections.delete_many({})
        db.restaurants.update_many(
            {},
            {"$set": {"averageRating": 0, "totalReviews": 0, "totalOrders": 0, "averageQualityScore": 0}},
        )
        return {
            "message": "Database cleaned successfully",
            "deleted": {"visits": visits_count, "orders": orders_count, "reviews": reviews_count, "inspections": inspections_count, "restaurants": 0},
        }

    visits_count = db.restaurant_visits.count_documents({"restaurantId": {"$in": seeded_ids}})
    orders_count = db.orders.count_documents({"restaurantId": {"$in": seeded_ids}})
    reviews_count = db.reviews.count_documents({"restaurantId": {"$in": seeded_ids}})
    inspections_count = db.quality_inspections.count_documents({"restaurantId": {"$in": seeded_ids}})
    menu_count = db.menu_items.count_documents({"restaurantId": {"$in": seeded_ids}})

    db.restaurant_visits.delete_many({"restaurantId": {"$in": seeded_ids}})
    db.orders.delete_many({"restaurantId": {"$in": seeded_ids}})
    db.reviews.delete_many({"restaurantId": {"$in": seeded_ids}})
    db.quality_inspections.delete_many({"restaurantId": {"$in": seeded_ids}})
    db.menu_items.delete_many({"restaurantId": {"$in": seeded_ids}})
    db.restaurants.delete_many({"_id": {"$in": seeded_ids}})

    db.restaurants.update_many(
        {},
        {"$set": {"averageRating": 0, "totalReviews": 0, "totalOrders": 0, "averageQualityScore": 0, "averageCleanliness": 0}},
    )

    return {
        "message": "Database cleaned successfully",
        "deleted": {
            "visits": visits_count,
            "orders": orders_count,
            "reviews": reviews_count,
            "inspections": inspections_count,
            "menu_items": menu_count,
            "restaurants": len(seeded_ids),
        },
    }


@router.get("/list-indexes")
def list_indexes_route():
    """
    Lista todos los indices de todas las colecciones.
    Muestra tipo de indice y campos indexados.
    """
    collections = ["restaurants", "users", "orders", "reviews", "menu_items", "quality_inspections", "restaurant_visits"]
    all_indexes = {}
    
    for collection_name in collections:
        collection = db[collection_name]
        indexes = list(collection.list_indexes())
        all_indexes[collection_name] = []
        
        for idx in indexes:
            index_info = {
                "name": idx.get("name"),
                "keys": dict(idx.get("key", {})),
                "unique": idx.get("unique", False)
            }
            
            # Detectar tipo de indice
            keys = idx.get("key", {})
            if "2dsphere" in str(keys.values()):
                index_info["type"] = "Geoespacial (2dsphere)"
            elif "text" in str(keys.values()):
                index_info["type"] = "Texto (Full-text)"
            elif len(keys) > 1:
                index_info["type"] = "Compuesto"
            else:
                index_info["type"] = "Simple"
            
            all_indexes[collection_name].append(index_info)
    
    return {
        "message": "Indices listados correctamente",
        "indexes": all_indexes,
        "resumen": {
            "total_colecciones": len(collections),
            "tipos_implementados": ["Simple", "Compuesto", "Geoespacial (2dsphere)", "Texto", "Multikey"]
        }
    }
