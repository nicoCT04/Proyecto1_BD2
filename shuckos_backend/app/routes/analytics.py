from fastapi import APIRouter
from app.services.analytics_service import get_conversion_rate_by_restaurant

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/conversion-rate")
def conversion_rate():
    data = get_conversion_rate_by_restaurant()
    
    # Calcular totales globales para el frontend
    total_visits = sum(item["totalVisits"] for item in data)
    total_orders = sum(item["totalOrders"] for item in data)
    
    global_rate = (total_orders / total_visits) if total_visits > 0 else 0
    
    return {
        "conversion_rate": global_rate,
        "total_visits": total_visits,
        "total_orders": total_orders,
        "by_restaurant": data
    }