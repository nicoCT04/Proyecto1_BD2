from fastapi import APIRouter, Body, HTTPException
from app.utils.index_creator import create_indexes
from app.utils.seed_data import generate_full_dataset
from app.database import db
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/create-indexes")
def create_indexes_route():
    create_indexes()
    return {"message": "Indexes created successfully"}

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
    # Para mayor seguridad, se puede pasar {"confirm": "YES"} pero no es obligatorio
    # Si no se pasa confirmación, se asume que se quiere limpiar (para facilitar testing)
    
    # Contar documentos antes de eliminar
    visits_count = db.restaurant_visits.count_documents({})
    orders_count = db.orders.count_documents({})
    reviews_count = db.reviews.count_documents({})
    inspections_count = db.quality_inspections.count_documents({})
    
    # Eliminar todas las colecciones de datos generados
    db.restaurant_visits.delete_many({})
    db.orders.delete_many({})
    db.reviews.delete_many({})
    db.quality_inspections.delete_many({})
    
    # Resetear métricas de restaurantes
    db.restaurants.update_many(
        {},
        {
            "$set": {
                "averageRating": 0,
                "totalReviews": 0,
                "totalOrders": 0,
                "averageQualityScore": 0
            }
        }
    )

    return {
        "message": "Database cleaned successfully", 
        "deleted": {
            "visits": visits_count,
            "orders": orders_count,
            "reviews": reviews_count,
            "inspections": inspections_count
        }
    }