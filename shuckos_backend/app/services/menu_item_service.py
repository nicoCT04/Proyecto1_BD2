from app.database import db
from bson import ObjectId
import gridfs

fs = gridfs.GridFS(db)

def create_menu_item(data: dict):
    # Mapear 'restaurant' a 'restaurantId' para consistencia en la base de datos
    restaurant_id = data.pop("restaurant", None) or data.get("restaurantId")
    if restaurant_id:
        data["restaurantId"] = ObjectId(restaurant_id)
    
    # Convertir imageId string a ObjectId si existe
    if data.get("imageId"):
        try:
            data["imageId"] = ObjectId(data["imageId"])
        except:
            # Si no es un ObjectId válido, quitar el campo
            data.pop("imageId", None)
    
    result = db.menu_items.insert_one(data)
    return str(result.inserted_id)

def get_menu_items():
    items = list(db.menu_items.find())
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item.get("restaurantId", ""))
        # Convertir imageId de ObjectId a string si existe
        if item.get("imageId"):
            item["imageId"] = str(item["imageId"])
        # Agregar URL de imagen si tiene imageId
        if item.get("imageId"):
            item["imageUrl"] = f"/api/files/download/{item['imageId']}"
    return items

def get_menu_items_by_restaurant(restaurant_id: str):
    items = list(
        db.menu_items.find({"restaurantId": ObjectId(restaurant_id)})
    )
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item.get("restaurantId", ""))
        # Convertir imageId de ObjectId a string si existe
        if item.get("imageId"):
            item["imageId"] = str(item["imageId"])
        # Agregar URL de imagen si tiene imageId
        if item.get("imageId"):
            item["imageUrl"] = f"/api/files/download/{item['imageId']}"
    return items


def update_menu_item_image(menu_item_id: str, image_id: str):
    """
    Asocia una imagen (GridFS) con un menu item.
    """
    try:
        result = db.menu_items.update_one(
            {"_id": ObjectId(menu_item_id)},
            {"$set": {"imageId": ObjectId(image_id)}}
        )
        return {
            "success": result.modified_count > 0,
            "message": "Imagen asociada al menu item" if result.modified_count > 0 else "Menu item no encontrado"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


def get_menu_items_with_images():
    """
    Obtiene solo los menu items que tienen imagen asociada.
    """
    items = list(db.menu_items.find({"imageId": {"$exists": True, "$ne": None}}))
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item.get("restaurantId", ""))
        item["imageId"] = str(item["imageId"])
        item["imageUrl"] = f"/api/files/download/{item['imageId']}"
        
        # Verificar si el archivo existe en GridFS
        try:
            fs.get(ObjectId(item["imageId"]))
            item["imageExists"] = True
        except:
            item["imageExists"] = False
    
    return items