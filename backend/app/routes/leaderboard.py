from fastapi import APIRouter
from app.database import leaderboard_collection

router = APIRouter()

@router.get("/")
def get_leaderboard():
    data = list(leaderboard_collection.find().sort("score", -1).limit(10))

    for d in data:
        d["_id"] = str(d["_id"])

    return data