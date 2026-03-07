from app.database import db

def get_conversion_rate_by_restaurant():

    visits_pipeline = [
        {
            "$group": {
                "_id": "$restaurantId",
                "totalVisits": {"$sum": 1}
            }
        }
    ]

    orders_pipeline = [
        {
            "$group": {
                "_id": "$restaurantId",
                "totalOrders": {"$sum": 1}
            }
        }
    ]

    visits = list(db.restaurant_visits.aggregate(visits_pipeline))
    orders = list(db.orders.aggregate(orders_pipeline))

    visits_dict = {v["_id"]: v["totalVisits"] for v in visits}
    orders_dict = {o["_id"]: o["totalOrders"] for o in orders}

    results = []

    for restaurant_id, total_visits in visits_dict.items():
        total_orders = orders_dict.get(restaurant_id, 0)

        conversion_rate = (
            (total_orders / total_visits) * 100
            if total_visits > 0 else 0
        )

        restaurant = db.restaurants.find_one({"_id": restaurant_id})

        results.append({
            "restaurant": restaurant["name"],
            "totalVisits": total_visits,
            "totalOrders": total_orders,
            "conversionRate": round(conversion_rate, 2)
        })

    return results