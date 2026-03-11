from fastapi import APIRouter, Body
from app.services.menu_item_service import (
    create_menu_item,
    get_menu_items,
    get_menu_items_by_restaurant,
    update_menu_item_image,
    get_menu_items_with_images
)
from app.schemas.all_schemas import MenuItemCreate

router = APIRouter(prefix="/menu-items", tags=["Menu Items"])

@router.post("/")
def create_item(item: MenuItemCreate):
    return {"id": create_menu_item(item.dict())}

@router.get("/")
def get_items():
    return get_menu_items()

@router.get("/restaurant/{restaurant_id}")
def get_items_by_restaurant(restaurant_id: str):
    return get_menu_items_by_restaurant(restaurant_id)

@router.put("/{menu_item_id}/image")
def associate_image(menu_item_id: str, data: dict = Body(...)):
    """
    Asocia una imagen (GridFS file ID) con un menu item.
    Body: {"imageId": "gridfs_file_id"}
    """
    image_id = data.get("imageId")
    if not image_id:
        return {"success": False, "message": "imageId es requerido"}
    
    return update_menu_item_image(menu_item_id, image_id)

@router.get("/with-images")
def get_items_with_images():
    """
    Obtiene todos los menu items que tienen imagen asociada.
    Demuestra la relación entre colecciones y GridFS.
    """
    return {
        "message": "Menu items con imágenes (GridFS)",
        "items": get_menu_items_with_images()
    }