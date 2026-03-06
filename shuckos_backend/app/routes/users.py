from fastapi import APIRouter, Body
from app.database import db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/")
def create_user(user: dict = Body(...)):
    result = db.users.insert_one(user)
    return {"id": str(result.inserted_id)}

@router.get("/")
def get_users():
    users = list(db.users.find())
    for user in users:
        user["_id"] = str(user["_id"])
    return users