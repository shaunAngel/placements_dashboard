from fastapi import APIRouter
from datetime import datetime
from app.database import db
from bson import ObjectId

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


# 🔔 GET NOTIFICATIONS — only valid event types
@router.get("/")
def get_all_notifications():
    """Return all notifications sorted by newest first, limited to valid types."""
    valid_types = ["NEW_OFFER", "SUBMISSION_STATUS", "DEADLINE", "ANNOUNCEMENT"]
    notifications = list(
        db.notifications
        .find({"type": {"$in": valid_types}})
        .sort("createdAt", -1)
        .limit(20)
    )

    for n in notifications:
        n["_id"] = str(n["_id"])
        # Ensure time field is present for frontend
        if "createdAt" in n and isinstance(n["createdAt"], datetime):
            delta = datetime.now() - n["createdAt"]
            mins = int(delta.total_seconds() / 60)
            if mins < 1:
                n["time"] = "Just now"
            elif mins < 60:
                n["time"] = f"{mins}m ago"
            elif mins < 1440:
                n["time"] = f"{mins // 60}h ago"
            else:
                n["time"] = f"{mins // 1440}d ago"
        else:
            n["time"] = ""

    return notifications


# 🔔 GET NOTIFICATIONS BY ROLE
@router.get("/{role}")
def get_notifications(role: str):
    valid_types = ["NEW_OFFER", "SUBMISSION_STATUS", "DEADLINE", "ANNOUNCEMENT"]
    query = {"type": {"$in": valid_types}}
    # Optionally filter by role if the notification has one
    notifications = list(
        db.notifications
        .find(query)
        .sort("createdAt", -1)
        .limit(20)
    )

    for n in notifications:
        n["_id"] = str(n["_id"])
        if "createdAt" in n and isinstance(n["createdAt"], datetime):
            delta = datetime.now() - n["createdAt"]
            mins = int(delta.total_seconds() / 60)
            if mins < 1:
                n["time"] = "Just now"
            elif mins < 60:
                n["time"] = f"{mins}m ago"
            elif mins < 1440:
                n["time"] = f"{mins // 60}h ago"
            else:
                n["time"] = f"{mins // 1440}d ago"
        else:
            n["time"] = ""

    return notifications


# 🔔 MARK ALL AS READ
@router.put("/read/{role}")
def mark_read(role: str):
    db.notifications.update_many(
        {},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}


# 🔔 MARK SINGLE AS READ
@router.put("/read-one/{notif_id}")
def mark_one_read(notif_id: str):
    try:
        db.notifications.update_one(
            {"_id": ObjectId(notif_id)},
            {"$set": {"read": True}}
        )
    except Exception:
        pass
    return {"message": "Marked as read"}