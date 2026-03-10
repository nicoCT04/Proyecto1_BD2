from fastapi import APIRouter, Body, HTTPException
from app.services.review_service import (
    create_review,
    get_all_reviews,
    get_reviews_by_restaurant,
    delete_review,
    delete_many_reviews
)
from app.schemas.all_schemas import ReviewCreate

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/")
def create_review_route(review: ReviewCreate):
    try:
        return create_review(review.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_reviews_route():
    return get_all_reviews()


@router.get("/restaurant/{restaurant_id}")
def get_reviews_by_restaurant_route(restaurant_id: str):
    return get_reviews_by_restaurant(restaurant_id)


@router.delete("/{review_id}")
def delete_review_route(review_id: str):
    return delete_review(review_id)


@router.delete("/")
def delete_many_reviews_route(filter: dict = Body(...)):
    return delete_many_reviews(filter)