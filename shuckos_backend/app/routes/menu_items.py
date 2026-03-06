from fastapi import APIRouter, Body
from app.services.menu_item_service import (
    create_menu_item,
    get_menu_items,
    get_menu_items_by_restaurant
)

router = APIRouter(prefix="/menu-items", tags=["Menu Items"])

@router.post("/")
def create_item(data: dict = Body(...)):
    return {"id": create_menu_item(data)}

@router.get("/")
def get_items():
    return get_menu_items()

@router.get("/restaurant/{restaurant_id}")
def get_items_by_restaurant(restaurant_id: str):
    return get_menu_items_by_restaurant(restaurant_id)