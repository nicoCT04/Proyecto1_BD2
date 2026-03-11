from app.database import db
from pymongo import TEXT, GEOSPHERE

def create_indexes():
    """
    Crea índices optimizados para el sistema.
    Implementa todos los tipos requeridos: Simples, Compuestos, Multikey, Geoespaciales y Texto.
    """
    
    print("Creando índices del sistema...")
    
    # 0. Limpieza previa de índices conflictivos (opcional pero recomendado en desarrollo)
    try:
        db.reviews.drop_index("orderId_1")
    except:
        pass
    
    # 1. INDICES SIMPLES
    print("1. Creando índices simples...")
    
    # Users - Indices simples
    db.users.create_index("email", unique=True)
    db.users.create_index("role")
    db.users.create_index("isActive")
    
    # Restaurants - Indices simples
    db.restaurants.create_index("name")
    db.restaurants.create_index([("averageRating", -1)])
    db.restaurants.create_index("isActive")
    
    # Orders - Indices simples
    db.orders.create_index("userId")
    db.orders.create_index("status")
    db.orders.create_index([("orderDate", -1)])
    
    # 2. INDICES COMPUESTOS
    print("2. Creando índices compuestos...")
    
    # Orders - Compuestos
    db.orders.create_index([("restaurantId", 1), ("orderDate", -1)])
    db.orders.create_index([("restaurantId", 1), ("status", 1)])
    db.orders.create_index([("userId", 1), ("orderDate", -1)])
    
    # Reviews - Compuestos
    db.reviews.create_index([("restaurantId", 1), ("createdAt", -1)])
    db.reviews.create_index([("userId", 1), ("createdAt", -1)])
    
    # FIX: Una reseña por orden, pero ignoramos los nulos usando un índice PARCIAL.
    # Esto permite que múltiples reseñas tengan orderId: null sin chocar.
    db.reviews.create_index(
        "orderId", 
        unique=True, 
        partialFilterExpression={"orderId": {"$type": "objectId"}}
    )
    
    # Menu Items - Compuestos
    db.menu_items.create_index([("restaurantId", 1), ("name", 1)])
    db.menu_items.create_index([("restaurantId", 1), ("category", 1)])
    db.menu_items.create_index([("timesOrdered", -1)])
    
    # Quality Inspections - Compuestos
    db.quality_inspections.create_index([("restaurantId", 1), ("inspectionDate", -1)])
    db.quality_inspections.create_index([("inspectorId", 1), ("inspectionDate", -1)])
    
    # Restaurant Visits - Compuestos
    db.restaurant_visits.create_index([("restaurantId", 1), ("visitDate", -1)])
    db.restaurant_visits.create_index([("userId", 1), ("visitDate", -1)])
    db.restaurant_visits.create_index("source")
    
    # 3. INDICES GEOESPACIALES
    print("3. Creando índices geoespaciales...")
    db.restaurants.create_index([("location", "2dsphere")])
    db.users.create_index([("homeLocation", "2dsphere")])
    db.orders.create_index([("userLocation", "2dsphere")])
    
    # 4. INDICES DE TEXTO
    print("4. Creando índices de texto...")
    db.restaurants.create_index([("name", TEXT), ("description", TEXT)], default_language="spanish")
    db.menu_items.create_index([("name", TEXT), ("description", TEXT)], default_language="spanish")
    db.reviews.create_index([("comment", TEXT)], default_language="spanish")
    
    # 5. INDICES MULTIKEY
    print("5. Creando índices multikey para arrays...")
    db.menu_items.create_index("ingredients")
    db.menu_items.create_index("tags")
    db.restaurants.create_index("specialties")
    db.restaurants.create_index("tags")
    
    print("Todos los índices creados correctamente con soporte para nulos en reseñas.")
    
def configure_no_table_scan():
    try:
        db.admin.command("setParameter", notablescan=True)
        return {"message": "notablescan configurado correctamente"}
    except Exception as e:
        return {"message": f"Error: {str(e)}", "note": "Requiere permisos de administrador"}

def get_index_usage_stats():
    stats = {}
    collections = ["restaurants", "users", "orders", "reviews", "menu_items", "quality_inspections", "restaurant_visits"]
    for collection_name in collections:
        collection = db[collection_name]
        stats[collection_name] = {
            "indexes": list(collection.list_indexes()),
            "stats": list(collection.aggregate([{"$indexStats": {}}]))
        }
    return stats