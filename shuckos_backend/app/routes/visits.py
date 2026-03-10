from fastapi import APIRouter, Body
from app.services.visit_service import create_visit, get_visits, get_visits_by_restaurant

router = APIRouter(prefix="/visits", tags=["Visits"])

@router.post("/")
def create_visit_route(data: dict = Body(...)):
    return create_visit(data)

@router.get("/")
def get_visits_route():
    return get_visits()

@router.get("/restaurant/{restaurant_id}")
def get_visits_by_restaurant_route(restaurant_id: str):
    return get_visits_by_restaurant(restaurant_id)