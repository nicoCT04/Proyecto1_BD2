from fastapi import APIRouter, Body
from app.services.visit_service import create_visit, get_visits

router = APIRouter(prefix="/visits", tags=["Visits"])

@router.post("/")
def create_visit_route(data: dict = Body(...)):
    return create_visit(data)

@router.get("/")
def get_visits_route():
    return get_visits()