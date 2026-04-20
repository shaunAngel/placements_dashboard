from fastapi import APIRouter, UploadFile, File, HTTPException
from app.database import db
from datetime import datetime
import json
import io

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


# ── Batch Management ─────────────────────────────────

@router.get("/batches")
def get_batches():
    """Get all batches."""
    batches = list(db.batch_settings.find({}, {"_id": 0}))
    if not batches:
        # Return a default batch
        default = {"name": "2024-2028", "active": True, "archived": False}
        db.batch_settings.insert_one(default)
        return [default]
    return batches


@router.post("/batches")
def create_batch(data: dict):
    """Create a new batch."""
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Batch name is required")
    
    # Check duplicate
    if db.batch_settings.find_one({"name": name}):
        raise HTTPException(status_code=409, detail="Batch already exists")
    
    batch_doc = {"name": name, "active": False, "archived": False, "createdAt": datetime.now()}
    db.batch_settings.insert_one(batch_doc)
    return {"message": f"Batch '{name}' created"}


@router.put("/batches/{name}/activate")
def activate_batch(name: str):
    """Set a batch as active (deactivate all others)."""
    db.batch_settings.update_many({}, {"$set": {"active": False}})
    result = db.batch_settings.update_one({"name": name}, {"$set": {"active": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    return {"message": f"Batch '{name}' is now active"}


@router.put("/batches/archive")
def archive_batches():
    """Archive all non-active batches."""
    db.batch_settings.update_many({"active": False}, {"$set": {"archived": True}})
    return {"message": "Non-active batches archived"}


# ── Branch Management ────────────────────────────────

@router.get("/branches")
def get_branches():
    """Get all branches."""
    branches = list(db.branch_settings.find({}, {"_id": 0}))
    if not branches:
        defaults = [
            {"name": "CSE", "createdAt": datetime.now()},
            {"name": "CSBS", "createdAt": datetime.now()},
        ]
        db.branch_settings.insert_many(defaults)
        return [{"name": "CSE"}, {"name": "CSBS"}]
    return branches


@router.post("/branches")
def add_branch(data: dict):
    """Add a new branch."""
    name = data.get("name", "").strip().upper()
    if not name:
        raise HTTPException(status_code=400, detail="Branch name is required")
    
    if db.branch_settings.find_one({"name": name}):
        raise HTTPException(status_code=409, detail="Branch already exists")
    
    db.branch_settings.insert_one({"name": name, "createdAt": datetime.now()})
    return {"message": f"Branch '{name}' added"}


@router.put("/branches/{old_name}")
def edit_branch(old_name: str, data: dict):
    """Edit a branch name."""
    new_name = data.get("name", "").strip().upper()
    if not new_name:
        raise HTTPException(status_code=400, detail="New branch name is required")
    
    result = db.branch_settings.update_one({"name": old_name}, {"$set": {"name": new_name}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Branch not found")
    return {"message": f"Branch renamed to '{new_name}'"}


@router.delete("/branches/{name}")
def delete_branch(name: str):
    """Delete a branch."""
    result = db.branch_settings.delete_one({"name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Branch not found")
    return {"message": f"Branch '{name}' deleted"}


# ── Data Export ──────────────────────────────────────

@router.get("/export/students")
def export_students_data():
    """Return all student data for export."""
    students = list(db.students_data.find({}, {"_id": 0}))
    return students


@router.get("/export/companies")
def export_companies_data():
    """Return all company data for export."""
    companies = list(db.company_details.find({}, {"_id": 0}))
    return companies


@router.get("/export/offers")
def export_offers_data():
    """Return all offer data for export."""
    offers = list(db.offer_letters.find({}, {"_id": 0}))
    # Convert datetime objects to strings
    for o in offers:
        if "createdAt" in o and isinstance(o["createdAt"], datetime):
            o["createdAt"] = o["createdAt"].isoformat()
    return offers


# ── Purge Test Data ──────────────────────────────────

@router.delete("/purge-test")
def purge_test_data():
    """Remove all test/dummy data."""
    result = db.offer_letters.delete_many({"isTest": True})
    return {"message": f"Purged {result.deleted_count} test records"}