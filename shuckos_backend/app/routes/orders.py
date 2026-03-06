from fastapi import APIRouter, Body
from app.services.order_service import create_order

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/")
def create_order_route(data: dict = Body(...)):
    return {"id": create_order(data)}