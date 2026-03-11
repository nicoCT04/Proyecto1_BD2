from app.database import db
from bson import ObjectId
from datetime import datetime

def add_ingredient_to_menu_item(menu_item_id: str, ingredient: str):
    """
    Agrega un ingrediente a un menu item usando $addToSet (no duplica).
    Demuestra operación $addToSet para arrays.
    """
    result = db.menu_items.update_one(
        {"_id": ObjectId(menu_item_id)},
        {"$addToSet": {"ingredients": ingredient}}
    )
    
    if result.modified_count > 0:
        return {"message": f"Ingrediente '{ingredient}' agregado correctamente"}
    else:
        return {"message": f"Ingrediente '{ingredient}' ya existe o item no encontrado"}

def remove_ingredient_from_menu_item(menu_item_id: str, ingredient: str):
    """
    Elimina un ingrediente de un menu item usando $pull.
    Demuestra operación $pull para arrays.
    """
    result = db.menu_items.update_one(
        {"_id": ObjectId(menu_item_id)},
        {"$pull": {"ingredients": ingredient}}
    )
    
    if result.modified_count > 0:
        return {"message": f"Ingrediente '{ingredient}' eliminado correctamente"}
    else:
        return {"message": "Ingrediente no encontrado o item no existe"}

def add_multiple_ingredients(menu_item_id: str, ingredients: list):
    """
    Agrega múltiples ingredientes usando $push con $each.
    Demuestra operación $push para arrays.
    """
    result = db.menu_items.update_one(
        {"_id": ObjectId(menu_item_id)},
        {"$push": {"ingredients": {"$each": ingredients}}}
    )
    
    if result.modified_count > 0:
        return {"message": f"Ingredientes {ingredients} agregados correctamente"}
    else:
        return {"message": "Item no encontrado"}

def add_tag_to_menu_item(menu_item_id: str, tag: str):
    """
    Agrega un tag a un menu item usando $addToSet.
    """
    result = db.menu_items.update_one(
        {"_id": ObjectId(menu_item_id)},
        {"$addToSet": {"tags": tag}}
    )
    
    return {"message": f"Tag '{tag}' agregado", "modified": result.modified_count > 0}

def remove_tag_from_menu_item(menu_item_id: str, tag: str):
    """
    Elimina un tag de un menu item usando $pull.
    """
    result = db.menu_items.update_one(
        {"_id": ObjectId(menu_item_id)},
        {"$pull": {"tags": tag}}
    )
    
    return {"message": f"Tag '{tag}' eliminado", "modified": result.modified_count > 0}

def add_specialty_to_restaurant(restaurant_id: str, specialty: str):
    """
    Agrega una especialidad a un restaurante usando $addToSet.
    """
    result = db.restaurants.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$addToSet": {"specialties": specialty}}
    )
    
    return {"message": f"Especialidad '{specialty}' agregada", "modified": result.modified_count > 0}

def remove_specialty_from_restaurant(restaurant_id: str, specialty: str):
    """
    Elimina una especialidad de un restaurante usando $pull.
    """
    result = db.restaurants.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$pull": {"specialties": specialty}}
    )
    
    return {"message": f"Especialidad '{specialty}' eliminada", "modified": result.modified_count > 0}

def find_menu_items_by_ingredient(ingredient: str):
    """
    Busca menu items que contengan un ingrediente específico.
    Demuestra consulta en arrays con índice multikey.
    """
    items = list(db.menu_items.find(
        {"ingredients": ingredient},
        {"name": 1, "ingredients": 1, "restaurantId": 1}
    ))
    
    # Convertir ObjectIds a strings
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item["restaurantId"])
    
    return items

def find_menu_items_by_multiple_ingredients(ingredients: list):
    """
    Busca menu items que contengan TODOS los ingredientes especificados.
    Demuestra consulta $all en arrays.
    """
    items = list(db.menu_items.find(
        {"ingredients": {"$all": ingredients}},
        {"name": 1, "ingredients": 1, "tags": 1}
    ))
    
    for item in items:
        item["_id"] = str(item["_id"])
        item["restaurantId"] = str(item["restaurantId"])
    
    return items

def find_restaurants_by_specialty(specialty: str):
    """
    Busca restaurantes por especialidad usando índice multikey.
    """
    restaurants = list(db.restaurants.find(
        {"specialties": specialty},
        {"name": 1, "specialties": 1, "averageRating": 1}
    ))
    
    for restaurant in restaurants:
        restaurant["_id"] = str(restaurant["_id"])
    
    return restaurants

def get_array_operations_summary():
    """
    Retorna un resumen de todas las operaciones de arrays disponibles.
    """
    return {
        "operations": {
            "$push": "Agregar elementos al final del array",
            "$addToSet": "Agregar elementos únicos (sin duplicados)",
            "$pull": "Eliminar elementos que coincidan con condición",
            "$pullAll": "Eliminar múltiples elementos específicos",
            "$each": "Modificador para operaciones múltiples"
        },
        "implemented_endpoints": [
            "POST /arrays/menu-items/{id}/ingredients - Agregar ingrediente",
            "DELETE /arrays/menu-items/{id}/ingredients - Eliminar ingrediente", 
            "POST /arrays/menu-items/{id}/ingredients/multiple - Agregar múltiples",
            "POST /arrays/menu-items/{id}/tags - Agregar tag",
            "DELETE /arrays/menu-items/{id}/tags - Eliminar tag",
            "POST /arrays/restaurants/{id}/specialties - Agregar especialidad",
            "DELETE /arrays/restaurants/{id}/specialties - Eliminar especialidad",
            "GET /arrays/menu-items/by-ingredient/{ingredient} - Buscar por ingrediente",
            "GET /arrays/restaurants/by-specialty/{specialty} - Buscar por especialidad"
        ]
    }
