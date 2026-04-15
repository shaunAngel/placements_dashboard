from fastapi import APIRouter
from app.database import batch_collection

router = APIRouter()

@router.get("/")
def batch_stats():
    data = list(batch_collection.find({}, {"_id": 0}))

    return [
        {
            "batch": d["batch"],
            "totalOffers": d.get("total_students", 0),
            "totalSelected": d.get("placed", 0),
            "placementPercentage": d.get("placement_percentage", 0),
            "avgPackage": d.get("avg_package", 0)
        }
        for d in data
    ]