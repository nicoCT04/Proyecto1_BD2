from app.database import db
from bson import ObjectId
from datetime import datetime, timedelta
from pymongo import InsertOne
import random

VISIT_CAP = 15000
ORDER_COUNT = 8000
REVIEW_RATE = 0.70
INSPECTION_COUNT = 500
BATCH_SIZE = 1000

RESTAURANT_NAMES = [
    "La Mariscada", "El Fogón", "Sabor Oriental", "Pizzería Roma", "Tacos & Más",
    "Café Central", "Sushi Bar", "Parrilla del Sur", "Vegetariano Verde", "Dulce Tentación",
]

MENU_CATEGORIES = {
    "Entradas": ["Ceviche", "Sopa del día", "Bruschetta", "Ensalada César", "Empanadas"],
    "Platos fuertes": ["Pasta carbonara", "Pollo al horno", "Risotto", "Parrillada", "Pescado grill"],
    "Postres": ["Flan", "Brownie", "Helado", "Tiramisú", "Cheesecake"],
    "Bebidas": ["Limonada", "Jugo natural", "Café", "Agua mineral", "Cerveza"],
    "Ensaladas": ["Ensalada griega", "Ensalada mixta", "Ensalada de quinoa", "Caprese", "Waldorf"],
}

REVIEW_COMMENTS = [
    "Muy bueno, volveré.",
    "Excelente servicio.",
    "Rico y abundante.",
    "Recomendado.",
    "Buen ambiente y buena comida.",
]


def _random_date(days_back: int):
    return datetime.utcnow() - timedelta(days=random.randint(0, days_back))


def _ensure_restaurants() -> list:
    existing = list(db.restaurants.find())
    existing_names = {r["name"] for r in existing}
    if len(existing) >= 8:
        return [r["_id"] for r in existing]
    to_create = []
    for i, name in enumerate(RESTAURANT_NAMES):
        if name in existing_names:
            continue
        to_create.append({
            "name": name,
            "description": f"Restaurante {name} - especialidades de la casa",
            "location": {"type": "Point", "coordinates": [-90.5 + i * 0.01, 14.63 + i * 0.005]},
            "address": {"street": "Calle Principal", "zone": "Zona 1", "city": "Guatemala"},
            "contact": {"phone": "12345678", "email": f"contacto{i}@demo.com"},
            "averageRating": 0,
            "totalReviews": 0,
            "totalOrders": 0,
            "averageQualityScore": 0,
            "isActive": True,
            "specialties": [name, "comida variada", "atención al cliente"],
            "createdAt": datetime.utcnow(),
        })
    if to_create:
        result = db.restaurants.insert_many(to_create)
        return [r["_id"] for r in existing] + list(result.inserted_id)
    return [r["_id"] for r in existing]


def _ensure_users(count: int = 50) -> list:
    existing = list(db.users.find().limit(count))
    if len(existing) >= 30:
        return [u["_id"] for u in existing]
    base = datetime.utcnow().strftime("%Y%m%d%H%M")
    to_create = [
        {
            "name": f"Usuario Demo {i + 1}",
            "email": f"demo.{base}.{i}@example.com",
            "phone": f"8765432{i % 10}",
            "role": "client",
            "isActive": True,
            "homeLocation": {"type": "Point", "coordinates": [-90.5 + random.random() * 0.1, 14.6 + random.random() * 0.1]},
            "createdAt": _random_date(365),
        }
        for i in range(count - len(existing))
    ]
    result = db.users.insert_many(to_create)
    return list(result.inserted_id) + [u["_id"] for u in existing]


def _ensure_menu_items(restaurant_ids: list) -> dict:
    by_rest = {}
    for rid in restaurant_ids:
        count = db.menu_items.count_documents({"restaurantId": rid})
        if count >= 15:
            items = list(db.menu_items.find({"restaurantId": rid}, {"_id": 1, "name": 1, "price": 1}))
            by_rest[rid] = items
            continue
        docs = []
        for category, names in MENU_CATEGORIES.items():
            for name in names[:3]:
                docs.append({
                    "restaurantId": rid,
                    "name": f"{name}",
                    "description": f"{name} - plato de la categoría {category}",
                    "price": round(random.uniform(25, 120), 2),
                    "category": category,
                    "timesOrdered": 0,
                    "ingredients": [name, category, "ingredientes frescos"],
                    "tags": [category, "popular", "recomendado"],
                })
        if docs:
            db.menu_items.insert_many(docs)
        items = list(db.menu_items.find({"restaurantId": rid}, {"_id": 1, "name": 1, "price": 1}))
        by_rest[rid] = items
    return by_rest


def generate_full_dataset(restaurant_id: str = None, user_id: str = None):
    restaurant_ids = _ensure_restaurants()
    user_ids = _ensure_users(50)
    menu_by_rest = _ensure_menu_items(restaurant_ids)

    if restaurant_id:
        rid = ObjectId(restaurant_id)
        if rid not in restaurant_ids:
            restaurant_ids = [rid] + restaurant_ids
    else:
        rid = random.choice(restaurant_ids)
    if user_id:
        uid = ObjectId(user_id)
        if uid not in user_ids:
            user_ids = [uid] + user_ids
    else:
        uid = random.choice(user_ids)

    current_visits = db.restaurant_visits.count_documents({})
    to_add_visits = max(0, VISIT_CAP - current_visits)
    if to_add_visits > 0:
        visit_ops = []
        for _ in range(to_add_visits):
            r = random.choice(restaurant_ids)
            u = random.choice(user_ids)
            visit_ops.append(InsertOne({
                "userId": u,
                "restaurantId": r,
                "source": random.choice(["ads", "organic", "social"]),
                "device": random.choice(["mobile", "web"]),
                "visitDate": _random_date(365),
            }))
            if len(visit_ops) >= BATCH_SIZE:
                db.restaurant_visits.bulk_write(visit_ops)
                visit_ops = []
        if visit_ops:
            db.restaurant_visits.bulk_write(visit_ops)

    order_ids = []
    menu_list_by_rest = {str(r): menu_by_rest.get(r, []) for r in restaurant_ids}
    for _ in range(ORDER_COUNT):
        rest_id = random.choice(restaurant_ids)
        user_id = random.choice(user_ids)
        items_raw = menu_list_by_rest.get(str(rest_id), [])
        if not items_raw:
            items_raw = next(iter(menu_list_by_rest.values()), [])
        if not items_raw:
            continue
        num_items = random.randint(1, min(4, len(items_raw)))
        chosen = [random.choice(items_raw) for _ in range(num_items)]
        order_items = []
        total = 0
        for it in chosen:
            qty = random.randint(1, 2)
            price = it["price"] if isinstance(it["price"], (int, float)) else 50
            subtotal = price * qty
            total += subtotal
            order_items.append({
                "name": it["name"],
                "price": price,
                "quantity": qty,
                "subtotal": subtotal,
            })
        order = {
            "userId": user_id,
            "restaurantId": rest_id,
            "items": order_items,
            "total": total,
            "status": "delivered",
            "orderDate": _random_date(365),
            "userLocation": {"type": "Point", "coordinates": [-90.5 + random.random() * 0.1, 14.6 + random.random() * 0.1]},
        }
        result = db.orders.insert_one(order)
        order_ids.append(result.inserted_id)

    review_count = int(len(order_ids) * REVIEW_RATE)
    selected = random.sample(order_ids, min(review_count, len(order_ids)))
    orders_data = {str(o["_id"]): (o["userId"], o["restaurantId"]) for o in db.orders.find({"_id": {"$in": selected}}, {"userId": 1, "restaurantId": 1})}
    review_ops = []
    for oid in selected:
        key = str(oid)
        if key not in orders_data:
            continue
        u, r = orders_data[key]
        review_ops.append(InsertOne({
            "userId": u,
            "restaurantId": r,
            "orderId": oid,
            "rating": random.randint(3, 5),
            "comment": random.choice(REVIEW_COMMENTS),
            "verifiedPurchase": True,
            "createdAt": _random_date(180),
        }))
        if len(review_ops) >= BATCH_SIZE:
            db.reviews.bulk_write(review_ops)
            review_ops = []
    if review_ops:
        db.reviews.bulk_write(review_ops)

    inspection_ops = []
    for _ in range(INSPECTION_COUNT):
        rest_id = random.choice(restaurant_ids)
        inspector_id = random.choice(user_ids)
        food = random.randint(60, 100)
        surface = random.randint(60, 100)
        staff = random.randint(60, 100)
        overall = round((food + surface + staff) / 3, 2)
        inspection_ops.append(InsertOne({
            "restaurantId": rest_id,
            "inspectorId": inspector_id,
            "scores": {
                "foodHandling": food,
                "surfaceCleanliness": surface,
                "staffHygiene": staff,
            },
            "overallScore": overall,
            "observations": "Inspección rutinaria.",
            "inspectionDate": _random_date(365),
        }))
        if len(inspection_ops) >= BATCH_SIZE:
            db.quality_inspections.bulk_write(inspection_ops)
            inspection_ops = []
    if inspection_ops:
        db.quality_inspections.bulk_write(inspection_ops)

    for rest_id in restaurant_ids:
        review_stats = list(db.reviews.aggregate([
            {"$match": {"restaurantId": rest_id}},
            {"$group": {"_id": "$restaurantId", "avgRating": {"$avg": "$rating"}, "totalReviews": {"$sum": 1}}},
        ]))
        if review_stats:
            avg = review_stats[0]["avgRating"]
            db.restaurants.update_one(
                {"_id": rest_id},
                {"$set": {"averageRating": avg, "rating": avg, "totalReviews": review_stats[0]["totalReviews"]}},
            )
        order_count = db.orders.count_documents({"restaurantId": rest_id})
        db.restaurants.update_one({"_id": rest_id}, {"$set": {"totalOrders": order_count}})
        insp_stats = list(db.quality_inspections.aggregate([
            {"$match": {"restaurantId": rest_id}},
            {"$group": {"_id": "$restaurantId", "avgScore": {"$avg": "$overallScore"}}},
        ]))
        if insp_stats:
            db.restaurants.update_one(
                {"_id": rest_id},
                {"$set": {"averageQualityScore": round(insp_stats[0]["avgScore"], 2)}},
            )

    return {
        "message": "Dataset generado correctamente",
        "restaurants": db.restaurants.count_documents({}),
        "users": db.users.count_documents({}),
        "menu_items": db.menu_items.count_documents({}),
        "visits": db.restaurant_visits.count_documents({}),
        "orders": db.orders.count_documents({}),
        "reviews": db.reviews.count_documents({}),
        "inspections": db.quality_inspections.count_documents({}),
    }
