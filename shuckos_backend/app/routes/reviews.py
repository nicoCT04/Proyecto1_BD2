from fastapi import APIRouter, Body
from app.services.review_service import create_review

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/")
def create_review_route(data: dict = Body(...)):
    return create_review(data)