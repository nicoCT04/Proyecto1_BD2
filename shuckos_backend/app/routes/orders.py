from fastapi import APIRouter, Body, Query
from app.services.order_service import( 
    create_order, get_all_orders, get_order_by_id, 
    get_revenue_by_restaurant, get_top_selling_products, 
    get_average_ticket_by_restaurant, explain_orders_by_restaurant)

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

@router.get("/analytics/revenue")
def revenue_by_restaurant():
    return get_revenue_by_restaurant()

@router.get("/analytics/top-products")
def top_products():
    return get_top_selling_products()

@router.get("/analytics/average-ticket")
def average_ticket():
    return get_average_ticket_by_restaurant()

@router.get("/analytics/explain/{restaurant_id}")
def explain_orders(restaurant_id: str):
    return explain_orders_by_restaurant(restaurant_id)