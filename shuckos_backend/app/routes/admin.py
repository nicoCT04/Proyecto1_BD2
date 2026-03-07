from fastapi import APIRouter, Body, HTTPException
from app.utils.index_creator import create_indexes
from app.utils.seed_data import generate_full_dataset
from app.database import db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/create-indexes")
def create_indexes_route():
    create_indexes()
    return {"message": "Indexes created successfully"}

@router.post("/seed-full-dataset")
def seed_full_dataset(data: dict = Body(...)):

    restaurant_id = data.get("restaurantId")
    user_id = data.get("userId")

    if not restaurant_id or not user_id:
        raise HTTPException(status_code=400, detail="restaurantId and userId are required")

    return generate_full_dataset(restaurant_id, user_id)

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