from fastapi import APIRouter
from app.database import batch_collection

router = APIRouter()

@router.get("/")
def year_stats():
    pipeline = [
        {
            "$group": {
                "_id": "$year",
                "totalOffers": {"$sum": "$totalOffers"},
                "totalSelected": {"$sum": "$totalSelected"}
            }
        }
    ]

    return list(batch_collection.aggregate(pipeline))