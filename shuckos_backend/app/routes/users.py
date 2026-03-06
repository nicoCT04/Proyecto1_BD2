from fastapi import APIRouter, Body
from app.services.user_service import create_user, get_all_users

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/")
def create_user_route(user: dict = Body(...)):
   user_id = create_user(user)
   return {"id": user_id}

@router.get("/")
def get_users_route():
   return get_all_users()