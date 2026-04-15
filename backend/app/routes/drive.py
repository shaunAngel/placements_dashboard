from fastapi import APIRouter
from app.database import drive_collection

router = APIRouter()

@router.get("/")
def get_drives():
    drives = list(drive_collection.find({}, {"_id": 0}))
    return drives

@router.get("/year/{year}")
def get_drives_by_year(year: int):
    drives = list(drive_collection.find({"year": year}, {"_id": 0}))
    return drives