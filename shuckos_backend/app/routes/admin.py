from fastapi import APIRouter, HTTPException
from app.utils.index_creator import create_indexes, configure_no_table_scan, get_index_usage_stats
from app.utils.seed_data import generate_full_dataset
from app.database import db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/create-indexes")
def create_indexes_route():
    try:
        create_indexes()
        return {"message": "All index types created successfully (Simple, Compound, Geospatial, Text, Multikey)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating indexes: {str(e)}")

@router.get("/configure-no-table-scan")
def configure_no_table_scan_route():
    result = configure_no_table_scan()
    return result

@router.get("/index-usage-stats")
def get_index_stats():
    stats = get_index_usage_stats()
    return {"message": "Index usage statistics", "data": stats}

@router.post("/seed-full-dataset")
def seed_full_dataset():
    return generate_full_dataset()

COLLECTIONS_TO_RESET = [
    "restaurant_visits", "orders", "reviews", "quality_inspections",
    "menu_items", "restaurants", "users",
]


@router.delete("/reset-database")
def reset_database():
    deleted = {}
    for name in COLLECTIONS_TO_RESET:
        col = db[name]
        count = col.count_documents({})
        col.delete_many({})
        deleted[name] = count
    return {
        "message": "Base de datos borrada por completo",
        "deleted": deleted,
    }


@router.get("/list-indexes")
def list_indexes_route():
    """
    Lista todos los indices de todas las colecciones.
    Muestra tipo de indice y campos indexados.
    """
    collections = ["restaurants", "users", "orders", "reviews", "menu_items", "quality_inspections", "restaurant_visits"]
    all_indexes = {}
    
    for collection_name in collections:
        collection = db[collection_name]
        indexes = list(collection.list_indexes())
        all_indexes[collection_name] = []
        
        for idx in indexes:
            index_info = {
                "name": idx.get("name"),
                "keys": dict(idx.get("key", {})),
                "unique": idx.get("unique", False)
            }
            
            # Detectar tipo de indice
            keys = idx.get("key", {})
            if "2dsphere" in str(keys.values()):
                index_info["type"] = "Geoespacial (2dsphere)"
            elif "text" in str(keys.values()):
                index_info["type"] = "Texto (Full-text)"
            elif len(keys) > 1:
                index_info["type"] = "Compuesto"
            else:
                index_info["type"] = "Simple"
            
            all_indexes[collection_name].append(index_info)
    
    return {
        "message": "Indices listados correctamente",
        "indexes": all_indexes,
        "resumen": {
            "total_colecciones": len(collections),
            "tipos_implementados": ["Simple", "Compuesto", "Geoespacial (2dsphere)", "Texto", "Multikey"]
        }
    }
