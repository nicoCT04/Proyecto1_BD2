from fastapi import APIRouter, Body
from app.services.restaurant_service import (
    create_restaurant,
    get_all_restaurants,
    get_restaurant_by_id,
    update_restaurant,
    delete_restaurant,
    update_many_restaurants,
    delete_many_restaurants
)

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

@router.post("/")
def create_restaurant_route(data: dict = Body(...)):
    return {"id": create_restaurant(data)}

@router.get("/")
def get_restaurants_route():
    return get_all_restaurants()

@router.get("/{restaurant_id}")
def get_restaurant_route(restaurant_id: str):
    return get_restaurant_by_id(restaurant_id)

@router.put("/{restaurant_id}")
def update_restaurant_route(restaurant_id: str, data: dict = Body(...)):
    return update_restaurant(restaurant_id, data)

@router.delete("/{restaurant_id}")
def delete_restaurant_route(restaurant_id: str):
    return delete_restaurant(restaurant_id)

@router.put("/")
def update_many_route(data: dict = Body(...)):
    filter_query = data.get("filter")
    update_data = data.get("update")
    return update_many_restaurants(filter_query, update_data)

@router.delete("/")
def delete_many_route(data: dict = Body(...)):
    filter_query = data.get("filter")
    return delete_many_restaurants(filter_query)