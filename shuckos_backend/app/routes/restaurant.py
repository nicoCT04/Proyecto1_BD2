from fastapi import APIRouter, Body, Query
from app.services.restaurant_service import (
    create_restaurant,
    get_all_restaurants,
    get_restaurant_by_id,
    update_restaurant,
    delete_restaurant,
    update_many_restaurants,
    delete_many_restaurants,
    search_restaurants_nearby,
    search_restaurants_text
)
from app.schemas.all_schemas import RestaurantCreate

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

@router.post("/")
def create_restaurant_route(restaurant: RestaurantCreate):
    return {"id": create_restaurant(restaurant.dict())}

@router.get("/")
def get_restaurants_route():
    return get_all_restaurants()

# Busqueda geoespacial - debe ir antes de /{restaurant_id}
@router.get("/nearby")
def get_nearby_restaurants(
    lat: float = Query(..., description="Latitud"),
    lng: float = Query(..., description="Longitud"),
    maxDistance: int = Query(5000, description="Distancia maxima en metros")
):
    """
    Busca restaurantes cercanos usando indice geoespacial 2dsphere.
    """
    return search_restaurants_nearby(lat, lng, maxDistance)

# Busqueda de texto - debe ir antes de /{restaurant_id}
@router.get("/search")
def search_restaurants(
    q: str = Query(..., description="Texto a buscar")
):
    """
    Busca restaurantes usando indice de texto full-text.
    """
    return search_restaurants_text(q)

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