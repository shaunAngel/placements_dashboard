from fastapi import APIRouter
from app.database import students_collection  # ✅ correct name

router = APIRouter()

@router.get("/")
def get_students():
    students = list(students_collection.find({}, {"_id": 0}))
    return students