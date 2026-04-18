from fastapi import APIRouter
from app.database import db

router = APIRouter(prefix="/settings", tags=["Settings"])

# default settings
DEFAULT_SETTINGS = {
    "new_offer_alert": True,
    "submission_confirmation": True,
    "verification_update": True,
    "deadline_reminder": True,
    "admin_alerts": True
}

@router.get("/")
def get_settings():
    settings = db.settings.find_one()
    
    if not settings:
        db.settings.insert_one(DEFAULT_SETTINGS)
        return DEFAULT_SETTINGS
    
    settings.pop("_id")
    return settings


@router.put("/")
def update_settings(data: dict):
    db.settings.update_one({}, {"$set": data}, upsert=True)
    return {"message": "Settings updated"}