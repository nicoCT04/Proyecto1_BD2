from fastapi import APIRouter
from app.utils.index_creator import create_indexes

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/create-indexes")
def create_indexes_route():
    create_indexes()
    return {"message": "Indexes created successfully"}