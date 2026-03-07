from app.database import db, client
from bson import ObjectId
from bson.json_util import dumps
from datetime import datetime
import json

def create_order(data: dict):

    with client.start_session() as session:
        with session.start_transaction():

            user_id = ObjectId(data["userId"])
            restaurant_id = ObjectId(data["restaurantId"])
            items_input = data["items"]

            items = []
            total = 0

            for item in items_input:
                price = item["price"]
                quantity = item["quantity"]
                subtotal = price * quantity

                items.append({
                    "name": item["name"],
                    "price": price,
                    "quantity": quantity,
                    "subtotal": subtotal
                })

                total += subtotal

                #  Actualizar contador en menu_items
                db.menu_items.update_one(
                    {"name": item["name"], "restaurantId": restaurant_id},
                    {"$inc": {"timesOrdered": quantity}},
                    session=session
                )

            order = {
                "userId": user_id,
                "restaurantId": restaurant_id,
                "items": items,
                "total": total,
                "status": "pending",
                "orderDate": datetime.utcnow()
            }

            result = db.orders.insert_one(order, session=session)

            #  Actualizar métrica en restaurante
            db.restaurants.update_one(
                {"_id": restaurant_id},
                {"$inc": {"totalOrders": 1}},
                session=session
            )

            return str(result.inserted_id)

def get_all_orders(restaurantId=None, status=None, limit=10, skip=0):

    match_stage = {}

    if restaurantId:
        match_stage["restaurantId"] = ObjectId(restaurantId)

    if status:
        match_stage["status"] = status

    pipeline = []

    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.extend([
        {
            "$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "_id",
                "as": "user"
            }
        },
        {
            "$lookup": {
                "from": "restaurants",
                "localField": "restaurantId",
                "foreignField": "_id",
                "as": "restaurant"
            }
        },
        {"$unwind": "$user"},
        {"$unwind": "$restaurant"},
        {
            "$project": {
                "_id": 1,
                "user.name": 1,
                "restaurant.name": 1,
                "items": 1,
                "total": 1,
                "status": 1,
                "orderDate": 1
            }
        },
        {"$sort": {"orderDate": -1}},
        {"$skip": skip},
        {"$limit": limit}
    ])

    orders = list(db.orders.aggregate(pipeline))

    for order in orders:
        order["_id"] = str(order["_id"])

    return orders

def get_order_by_id(order_id: str):
    order = db.orders.find_one({"_id": ObjectId(order_id)})

    if order:
        order["_id"] = str(order["_id"])
        order["userId"] = str(order["userId"])
        order["restaurantId"] = str(order["restaurantId"])

    return order

def get_revenue_by_restaurant():

    pipeline = [
        {
            "$group": {
                "_id": "$restaurantId",
                "totalRevenue": {"$sum": "$total"},
                "totalOrders": {"$sum": 1}
            }
        },
        {
            "$lookup": {
                "from": "restaurants",
                "localField": "_id",
                "foreignField": "_id",
                "as": "restaurant"
            }
        },
        {"$unwind": "$restaurant"},
        {
            "$project": {
                "_id": 0,
                "restaurant": "$restaurant.name",
                "totalRevenue": 1,
                "totalOrders": 1
            }
        },
        {"$sort": {"totalRevenue": -1}}
    ]

    return list(db.orders.aggregate(pipeline))

def get_top_selling_products():

    pipeline = [
        {
            "$unwind": "$items"
        },
        {
            "$group": {
                "_id": "$items.name",
                "totalQuantitySold": {"$sum": "$items.quantity"},
                "totalRevenue": {"$sum": "$items.subtotal"}
            }
        },
        {
            "$project": {
                "_id": 0,
                "product": "$_id",
                "totalQuantitySold": 1,
                "totalRevenue": 1
            }
        },
        {
            "$sort": {"totalQuantitySold": -1}
        }
    ]

    return list(db.orders.aggregate(pipeline))

def get_average_ticket_by_restaurant():

    pipeline = [
        {
            "$group": {
                "_id": "$restaurantId",
                "averageTicket": {"$avg": "$total"},
                "totalOrders": {"$sum": 1}
            }
        },
        {
            "$lookup": {
                "from": "restaurants",
                "localField": "_id",
                "foreignField": "_id",
                "as": "restaurant"
            }
        },
        {"$unwind": "$restaurant"},
        {
            "$project": {
                "_id": 0,
                "restaurant": "$restaurant.name",
                "averageTicket": {"$round": ["$averageTicket", 2]},
                "totalOrders": 1
            }
        },
        {"$sort": {"averageTicket": -1}}
    ]

    return list(db.orders.aggregate(pipeline))

def explain_orders_by_restaurant(restaurant_id: str):

    explanation = db.orders.find(
        {"restaurantId": ObjectId(restaurant_id)}
    ).explain()

    # Convertir a JSON serializable
    return json.loads(dumps(explanation))