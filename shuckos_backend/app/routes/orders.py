from fastapi import APIRouter, Body, Query, HTTPException
from app.services.order_service import( 
    create_order, get_all_orders, get_order_by_id, 
    get_revenue_by_restaurant, get_top_selling_products, 
    get_average_ticket_by_restaurant, explain_orders_by_restaurant,
    update_order_status)
from app.schemas.all_schemas import OrderCreate

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/")
def create_order_route(order: OrderCreate):
    try:
        # Pydantic valida automáticamente el cuerpo aquí
        order_id = create_order(order.dict())
        return {"id": order_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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
    order = get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return order

@router.patch("/{order_id}/status")
def update_status_route(order_id: str, data: dict = Body(...)):
    try:
        new_status = data.get("status")
        return update_order_status(order_id, new_status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

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