from fastapi import APIRouter, HTTPException
from app.services.array_operations_service import (
    add_ingredient_to_menu_item,
    remove_ingredient_from_menu_item,
    add_multiple_ingredients,
    add_tag_to_menu_item,
    remove_tag_from_menu_item,
    add_specialty_to_restaurant,
    remove_specialty_from_restaurant,
    find_menu_items_by_ingredient,
    find_menu_items_by_multiple_ingredients,
    find_restaurants_by_specialty,
    get_array_operations_summary
)
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/arrays", tags=["Array Operations ($push, $pull, $addToSet)"])

class MultipleIngredientsRequest(BaseModel):
    ingredients: List[str]

class IngredientRequest(BaseModel):
    ingredient: str
    
class TagRequest(BaseModel):
    tag: str
    
class SpecialtyRequest(BaseModel):
    specialty: str

@router.get("/")
def get_operations_summary():
    """Obtiene resumen de operaciones de arrays implementadas."""
    return get_array_operations_summary()

# OPERACIONES EN MENU ITEMS

@router.post("/menu-items/{menu_item_id}/ingredients")
def add_ingredient(menu_item_id: str, request: IngredientRequest):
    """Agregar ingrediente usando $addToSet (sin duplicados)."""
    return add_ingredient_to_menu_item(menu_item_id, request.ingredient)

@router.delete("/menu-items/{menu_item_id}/ingredients")
def remove_ingredient(menu_item_id: str, request: IngredientRequest):
    """Eliminar ingrediente usando $pull."""
    return remove_ingredient_from_menu_item(menu_item_id, request.ingredient)

@router.post("/menu-items/{menu_item_id}/ingredients/multiple")
def add_multiple_ingredients_route(menu_item_id: str, request: MultipleIngredientsRequest):
    """Agregar multiples ingredientes usando $push con $each."""
    return add_multiple_ingredients(menu_item_id, request.ingredients)

@router.post("/menu-items/{menu_item_id}/tags")
def add_tag(menu_item_id: str, request: TagRequest):
    """Agregar tag usando $addToSet."""
    return add_tag_to_menu_item(menu_item_id, request.tag)

@router.delete("/menu-items/{menu_item_id}/tags")
def remove_tag(menu_item_id: str, request: TagRequest):
    """Eliminar tag usando $pull."""
    return remove_tag_from_menu_item(menu_item_id, request.tag)

# OPERACIONES EN RESTAURANTS

@router.post("/restaurants/{restaurant_id}/specialties")
def add_restaurant_specialty(restaurant_id: str, request: SpecialtyRequest):
    """Agregar especialidad a restaurante usando $addToSet."""
    return add_specialty_to_restaurant(restaurant_id, request.specialty)

@router.delete("/restaurants/{restaurant_id}/specialties")
def remove_restaurant_specialty(restaurant_id: str, request: SpecialtyRequest):
    """Eliminar especialidad de restaurante usando $pull."""
    return remove_specialty_from_restaurant(restaurant_id, request.specialty)

# CONSULTAS EN ARRAYS (con indices multikey)

@router.get("/menu-items/by-ingredient/{ingredient}")
def search_by_ingredient(ingredient: str):
    """Buscar menu items por ingrediente (usa indice multikey)."""
    return {
        "ingredient": ingredient,
        "items": find_menu_items_by_ingredient(ingredient)
    }

@router.post("/menu-items/by-multiple-ingredients")
def search_by_multiple_ingredients(request: MultipleIngredientsRequest):
    """Buscar menu items que contengan TODOS los ingredientes ($all)."""
    return {
        "required_ingredients": request.ingredients,
        "items": find_menu_items_by_multiple_ingredients(request.ingredients)
    }

@router.get("/restaurants/by-specialty/{specialty}")
def search_restaurants_by_specialty(specialty: str):
    """Buscar restaurantes por especialidad (usa indice multikey)."""
    return {
        "specialty": specialty,
        "restaurants": find_restaurants_by_specialty(specialty)
    }
