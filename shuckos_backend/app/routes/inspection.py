from fastapi import APIRouter, Body, Query, HTTPException
from app.services.inspection_service import (create_inspection,
                                            get_all_inspections,
                                            get_inspections_by_restaurant)
from app.schemas.all_schemas import InspectionCreate

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.post("/")
def create_inspection_route(inspection: InspectionCreate):
    try:
        return create_inspection(inspection.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_inspections_route():
    return get_all_inspections()


@router.get("/restaurant/{restaurant_id}")
def get_inspections_by_restaurant_route(
    restaurant_id: str,
    startDate: str = Query(None),
    endDate: str = Query(None)
):
    return get_inspections_by_restaurant(
        restaurant_id,
        startDate,
        endDate
    )