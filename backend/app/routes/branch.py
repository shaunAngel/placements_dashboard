from fastapi import APIRouter
from app.database import branch_collection

router = APIRouter()

@router.get("/")
def branch_stats():
    data = list(branch_collection.find({}, {"_id": 0}))

    return [
        {
            "branch": d["branch"],
            "totalStudents": d.get("onRolls", 0),
            "placed": d.get("placed", 0),
            "placementPercentage": d.get("placementPercent", 0)
        }
        for d in data
    ]