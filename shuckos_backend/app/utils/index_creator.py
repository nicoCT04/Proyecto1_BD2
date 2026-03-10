from app.database import db

def create_indexes():
    """
    Crea índices optimizados para el sistema.
    Nota: En un entorno de Sharding, el shard key debe ser parte de los índices únicos.
    """

    # Orders - Shard Key sugerido: { "restaurantId": 1, "orderDate": -1 }
    db.orders.create_index([("restaurantId", 1), ("orderDate", -1)])
    db.orders.create_index("userId")
    db.orders.create_index("status")

    # Users
    db.users.create_index("email", unique=True)

    # Restaurants
    db.restaurants.create_index("name")
    db.restaurants.create_index("averageRating")

    # Menu Items
    db.menu_items.create_index([("restaurantId", 1), ("name", 1)])
    db.menu_items.create_index("timesOrdered")

    # Reviews - Shard Key sugerido: { "restaurantId": 1 }
    db.reviews.create_index([("restaurantId", 1), ("createdAt", -1)])
    db.reviews.create_index("orderId", unique=True) # Una reseña por orden

    # Quality Inspections
    db.quality_inspections.create_index([("restaurantId", 1), ("inspectionDate", -1)])

    # Visits - Alta cardinalidad
    db.restaurant_visits.create_index([("restaurantId", 1), ("visitDate", -1)])

    print("Índices de alto rendimiento creados correctamente")