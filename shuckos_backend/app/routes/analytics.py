from fastapi import APIRouter
from app.services.analytics_service import get_conversion_rate_by_restaurant

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/conversion-rate")
def conversion_rate():
    return get_conversion_rate_by_restaurant()