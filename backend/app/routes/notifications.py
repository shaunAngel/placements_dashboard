from fastapi import APIRouter
from datetime import datetime
from app.database import db

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


# 🔔 GET NOTIFICATIONS
@router.get("/{role}")
def get_notifications(role: str):
    notifications = list(
        db.notifications.find({"role": role}).sort("time", -1)
    )

    for n in notifications:
        n["_id"] = str(n["_id"])

    return notifications


# 🔔 MARK ALL AS READ (optional)
@router.put("/read/{role}")
def mark_read(role: str):
    db.notifications.update_many(
        {"role": role},
        {"$set": {"read": True}}
    )

    return {"message": "Marked as read"}