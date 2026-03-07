from app.database import client, db
from bson import ObjectId
from datetime import datetime

def create_inspection(data: dict):

    with client.start_session() as session:
        with session.start_transaction():

            restaurant_id = ObjectId(data["restaurantId"])
            inspector_id = ObjectId(data["inspectorId"])

            score = data["score"]

            inspection = {
                "restaurantId": restaurant_id,
                "inspectorId": inspector_id,
                "score": score,
                "observations": data.get("observations"),
                "inspectionDate": datetime.utcnow()
            }

            db.quality_inspections.insert_one(inspection, session=session)

            # Recalcular promedio de calidad
            pipeline = [
                {"$match": {"restaurantId": restaurant_id}},
                {
                    "$group": {
                        "_id": "$restaurantId",
                        "avgScore": {"$avg": "$score"}
                    }
                }
            ]

            result = list(db.quality_inspections.aggregate(pipeline))

            if result:
                db.restaurants.update_one(
                    {"_id": restaurant_id},
                    {"$set": {"averageQualityScore": result[0]["avgScore"]}},
                    session=session
                )

            return {"message": "Inspection registrada correctamente"}
        
def serialize_inspection(inspection: dict):
    return {
        "_id": str(inspection["_id"]),
        "restaurantId": str(inspection["restaurantId"]),
        "inspectorId": str(inspection["inspectorId"]),
        "score": inspection["score"],
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