from fastapi import APIRouter
from app.database import students_collection

router = APIRouter()

@router.get("/")
def branch_stats():
    pipeline = [
        {
            "$group": {
                "_id": "$branch",
                "totalStudents": {"$sum": 1},
                "placed": {
                    "$sum": {
                        "$cond": ["$placed", 1, 0]
                    }
                }
            }
        }
    ]

    return list(students_collection.aggregate(pipeline))