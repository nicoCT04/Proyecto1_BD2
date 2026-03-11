from app.database import db

def get_conversion_rate_by_restaurant():
    """
    Calcula la tasa de conversión (Pedidos / Visitas) utilizando un pipeline de agregación único.
    Este enfoque es altamente escalable ya que MongoDB procesa la unión de datos de forma nativa.
    """
    pipeline = [
        # 1. Agrupar visitas por restaurante
        {
            "$group": {
                "_id": "$restaurantId",
                "totalVisits": {"$sum": 1}
            }
        },
        # 2. Unir con la colección de órdenes (lookup de alta eficiencia)
        {
            "$lookup": {
                "from": "orders",
                "let": {"restId": "$_id"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$restaurantId", "$$restId"]}}},
                    {"$count": "count"}
                ],
                "as": "orderCountData"
            }
        },
        # 3. Procesar el conteo de órdenes
        {
            "$addFields": {
                "totalOrders": {
                    "$ifNull": [{"$arrayElemAt": ["$orderCountData.count", 0]}, 0]
                }
            }
        },
        # 4. Unir con el nombre del restaurante
        {
            "$lookup": {
                "from": "restaurants",
                "localField": "_id",
                "foreignField": "_id",
                "as": "restaurantData"
            }
        },
        {"$unwind": "$restaurantData"},
        # 5. Calcular la tasa de conversión final y proyectar campos
        {
            "$project": {
                "_id": 0,
                "restaurant": "$restaurantData.name",
                "totalVisits": 1,
                "totalOrders": 1,
                "conversionRate": {
                    "$cond": [
                        {"$gt": ["$totalVisits", 0]},
                        {"$round": [{"$multiply": [{"$divide": ["$totalOrders", "$totalVisits"]}, 100]}, 2]},
                        0
                    ]
                }
            }
        },
        # 6. Ordenar por tasa de conversión descendente
        {"$sort": {"conversionRate": -1}}
    ]

    return list(db.restaurant_visits.aggregate(pipeline))


def get_orders_count_by_status():
    """
    Agregacion simple: cuenta pedidos agrupados por status.
    Demuestra $group con $sum para conteo.
    """
    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    result = list(db.orders.aggregate(pipeline))
    
    # Formatear resultado
    formatted = []
    for item in result:
        formatted.append({
            "status": item["_id"] or "sin_status",
            "count": item["count"]
        })
    
    return {
        "message": "Conteo de pedidos por status",
        "operacion": "$group + $sum (Agregacion Simple)",
        "data": formatted,
        "total_pedidos": sum(item["count"] for item in formatted)
    }


def get_distinct_menu_categories():
    """
    Agregacion simple: obtiene categorias unicas de menu items.
    Demuestra uso de distinct.
    """
    categories = db.menu_items.distinct("category")
    
    return {
        "message": "Categorias unicas de menu",
        "operacion": "distinct (Agregacion Simple)",
        "categorias": categories,
        "total_categorias": len(categories)
    }