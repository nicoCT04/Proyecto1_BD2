from app.database import db
from pymongo import TEXT, GEOSPHERE

def create_indexes():
    """
    Crea índices optimizados para el sistema.
    Implementa todos los tipos requeridos: Simples, Compuestos, Multikey, Geoespaciales y Texto.
    """
    
    print("Creando índices del sistema...")
    
    # INDICES SIMPLES
    print("1. Creando índices simples...")
    
    # Users - Indices simples
    db.users.create_index("email", unique=True)  # Unico para autenticacion
    db.users.create_index("role")                # Filtrar por tipo de usuario
    db.users.create_index("isActive")            # Filtrar usuarios activos
    
    # Restaurants - Indices simples
    db.restaurants.create_index("name")
    db.restaurants.create_index([("averageRating", -1)])  # Ordenar por mejor calificacion
    db.restaurants.create_index("isActive")
    
    # Orders - Indices simples
    db.orders.create_index("userId")
    db.orders.create_index("status")
    db.orders.create_index([("orderDate", -1)])  # Ordenar por fecha
    
    # INDICES COMPUESTOS
    print("2. Creando índices compuestos...")
    
    # Orders - Compuestos para consultas frecuentes
    db.orders.create_index([("restaurantId", 1), ("orderDate", -1)])  # Pedidos por restaurante y fecha
    db.orders.create_index([("restaurantId", 1), ("status", 1)])      # Pedidos por restaurante y estado
    db.orders.create_index([("userId", 1), ("orderDate", -1)])        # Historial de usuario
    
    # Reviews - Compuestos
    db.reviews.create_index([("restaurantId", 1), ("createdAt", -1)])
    db.reviews.create_index([("userId", 1), ("createdAt", -1)])
    db.reviews.create_index("orderId", unique=True)  # Una resena por orden
    
    # Menu Items - Compuestos
    db.menu_items.create_index([("restaurantId", 1), ("name", 1)])
    db.menu_items.create_index([("restaurantId", 1), ("category", 1)])
    db.menu_items.create_index([("timesOrdered", -1)])  # Productos mas vendidos
    
    # Quality Inspections - Compuestos
    db.quality_inspections.create_index([("restaurantId", 1), ("inspectionDate", -1)])
    db.quality_inspections.create_index([("inspectorId", 1), ("inspectionDate", -1)])
    
    # Restaurant Visits - Compuestos
    db.restaurant_visits.create_index([("restaurantId", 1), ("visitDate", -1)])
    db.restaurant_visits.create_index([("userId", 1), ("visitDate", -1)])
    db.restaurant_visits.create_index("source")  # Analisis de fuentes de trafico
    
    # INDICES GEOESPACIALES (2dsphere)
    print("3. Creando índices geoespaciales...")
    
    # Restaurants - Ubicacion para busquedas por proximidad
    db.restaurants.create_index([("location", "2dsphere")])
    
    # Users - Ubicacion del usuario para analisis geografico
    db.users.create_index([("homeLocation", "2dsphere")])
    
    # Orders - Ubicacion del pedido para analisis de delivery
    db.orders.create_index([("userLocation", "2dsphere")])
    
    # INDICES DE TEXTO
    print("4. Creando índices de texto...")
    
    # Restaurants - Busqueda de texto completo
    db.restaurants.create_index([
        ("name", TEXT),
        ("description", TEXT)
    ], default_language="spanish")
    
    # Menu Items - Busqueda en nombre y descripcion
    db.menu_items.create_index([
        ("name", TEXT),
        ("description", TEXT)
    ], default_language="spanish")
    
    # Reviews - Busqueda en comentarios
    db.reviews.create_index([("comment", TEXT)], default_language="spanish")
    
    # INDICES MULTIKEY (Arrays)
    print("5. Creando índices multikey para arrays...")
    
    # Menu Items - Indice en array de ingredientes
    db.menu_items.create_index("ingredients")  # Multikey automatico para arrays
    
    # Menu Items - Indice en array de tags/categorias
    db.menu_items.create_index("tags")  # Para multiples etiquetas
    
    # Restaurants - Indice en array de specialties
    db.restaurants.create_index("specialties")  # Especialidades del restaurante
    
    print("Todos los índices creados correctamente:")
    print("   - Simples: email, role, name, status, etc.")
    print("   - Compuestos: (restaurantId, orderDate), (userId, createdAt), etc.")
    print("   - Geoespaciales: location, homeLocation, userLocation")
    print("   - Texto: restaurants, menu_items, reviews")
    print("   - Multikey: ingredients, tags, specialties")
    
def configure_no_table_scan():
    """
    Configura la base de datos para rechazar consultas sin indices.
    ADVERTENCIA: Esto forzara el uso de indices en todas las consultas.
    """
    try:
        # Configurar el parametro notablescan
        db.admin.command("setParameter", notablescan=True)
        print("Configurado: Base de datos rechazara consultas sin indices (notablescan=true)")
        return {"message": "notablescan configurado correctamente"}
    except Exception as e:
        print(f"Error configurando notablescan: {e}")
        print("Nota: Esta configuracion requiere permisos de admin en MongoDB Atlas")
        return {"message": f"Error: {str(e)}", "note": "Requiere permisos de administrador"}

def get_index_usage_stats():
    """
    Obtiene estadisticas de uso de indices para optimizacion.
    """
    stats = {}
    collections = ["restaurants", "users", "orders", "reviews", "menu_items", "quality_inspections", "restaurant_visits"]
    
    for collection_name in collections:
        collection = db[collection_name]
        stats[collection_name] = {
            "indexes": list(collection.list_indexes()),
            "stats": collection.aggregate([{"$indexStats": {}}])
        }
    
    return stats