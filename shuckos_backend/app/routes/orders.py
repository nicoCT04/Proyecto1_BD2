from fastapi import APIRouter, Body, Query
from app.services.order_service import create_order, get_all_orders, get_order_by_id

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/")
def create_order_route(data: dict = Body(...)):
    return {"id": create_order(data)}

@router.get("/")
def get_orders_route(
    restaurantId: str = Query(None),
    status: str = Query(None),
    limit: int = Query(10),
    skip: int = Query(0)
):
    return get_all_orders(restaurantId, status, limit, skip)


@router.get("/{order_id}")
def get_order_route(order_id: str):
    return get_order_by_id(order_id)