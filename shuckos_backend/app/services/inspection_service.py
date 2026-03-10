from app.database import client, db
from bson import ObjectId
from datetime import datetime
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern

def create_inspection(data: dict):
    def callback(session):
        restaurant_id = ObjectId(data["restaurant"])
        inspector_id = ObjectId(data["inspectorId"]) if data.get("inspectorId") else None
        overall_score = data["overallScore"]

        inspection = {
            "restaurantId": restaurant_id,
            "inspectorId": inspector_id,
            "scores": data["scores"],
            "overallScore": overall_score,
            "observations": data.get("observations"),
            "inspectionDate": data.get("inspectionDate") or datetime.utcnow()
        }

        db.quality_inspections.insert_one(inspection, session=session)

        # Recalcular promedio de calidad de forma consistente
        pipeline = [
            {"$match": {"restaurantId": restaurant_id}},
            {
                "$group": {
                    "_id": "$restaurantId",
                    "avgScore": {"$avg": "$overallScore"}
                }
            }
        ]

        result = list(db.quality_inspections.aggregate(pipeline, session=session))

        if result:
            db.restaurants.update_one(
                {"_id": restaurant_id},
                {"$set": {
                    "averageQualityScore": round(result[0]["avgScore"], 2),
                    "averageCleanliness": round(result[0]["avgScore"], 2) # Sincronizar para el frontend
                }},
                session=session
            )

        return {"message": "Inspection registrada correctamente"}

    with client.start_session() as session:
        try:
            return session.with_transaction(
                callback,
                read_concern=ReadConcern("majority"),
                write_concern=WriteConcern("majority")
            )
        except Exception as e:
            raise Exception(f"Error en inspección: {str(e)}")
        
def serialize_inspection(inspection: dict):
    return {
        "_id": str(inspection["_id"]),
        "restaurantId": str(inspection["restaurantId"]),
        "inspectorId": str(inspection["inspectorId"]) if inspection.get("inspectorId") else None,
        "scores": inspection.get("scores"),
        "overallScore": inspection.get("overallScore"),
        "observations": inspection.get("observations"),
        "inspectionDate": inspection["inspectionDate"].isoformat()
    }


def get_all_inspections():
    inspections = list(db.quality_inspections.find())
    return [serialize_inspection(inspection) for inspection in inspections]


def get_inspections_by_restaurant(
    restaurant_id: str,
    start_date: str = None,
    end_date: str = None
):
    query = {"restaurantId": ObjectId(restaurant_id)}

    if start_date or end_date:
        query["inspectionDate"] = {}

        if start_date:
            query["inspectionDate"]["$gte"] = datetime.fromisoformat(start_date)

        if end_date:
            query["inspectionDate"]["$lte"] = datetime.fromisoformat(end_date)

    inspections = list(
        db.quality_inspections.find(query).sort("inspectionDate", -1)
    )

    return [serialize_inspection(inspection) for inspection in inspections]