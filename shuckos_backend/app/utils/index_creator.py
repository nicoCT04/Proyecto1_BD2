from app.database import db

def create_indexes():

    # Orders
    db.orders.create_index("restaurantId")
    db.orders.create_index("userId")
    db.orders.create_index("orderDate")
    db.orders.create_index([("restaurantId", 1), ("orderDate", -1)])

    # Users
    db.users.create_index("email", unique=True)

    # Restaurants
    db.restaurants.create_index("name")

    # Menu Items
    db.menu_items.create_index("restaurantId")

    # Quality Inspections
    db.quality_inspections.create_index(
    [("restaurantId", 1), ("inspectionDate", -1)]
)

    print("Indexes creados correctamente")