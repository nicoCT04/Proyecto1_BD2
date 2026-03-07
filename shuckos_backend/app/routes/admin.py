from fastapi import APIRouter, Body, HTTPException
from app.utils.index_creator import create_indexes
from app.utils.seed_data import generate_visits_bulk
from app.database import db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/create-indexes")
def create_indexes_route():
    create_indexes()
    return {"message": "Indexes created successfully"}

@router.post("/seed-visits")
def seed_visits(data: dict = Body(...)):

    restaurant_id = data.get("restaurantId")
    user_id = data.get("userId")
    amount = data.get("amount", 50000)

    if not restaurant_id or not user_id:
        raise HTTPException(status_code=400, detail="restaurantId and userId are required")

    if amount > 200000:
        raise HTTPException(status_code=400, detail="Max allowed is 200000")

    return generate_visits_bulk(restaurant_id, user_id, amount)

@router.delete("/reset-database")
def reset_database(data: dict = Body(...)):

    if data.get("confirm") != "YES":
        raise HTTPException(
            status_code=400,
            detail="Confirmation required"
        )

    db.restaurant_visits.delete_many({})
    db.orders.delete_many({})
    db.reviews.delete_many({})
    db.quality_inspections.delete_many({})

    return {"message": "Database cleaned"}