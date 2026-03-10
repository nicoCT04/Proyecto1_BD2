from fastapi import APIRouter
from app.services.user_service import create_user, get_all_users
from app.schemas.all_schemas import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/")
def create_user_route(user: UserCreate):
   user_id = create_user(user.dict())
   return {"id": user_id}

@router.get("/")
def get_users_route():
   return get_all_users()