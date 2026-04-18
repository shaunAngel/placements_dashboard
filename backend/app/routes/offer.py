from fastapi import APIRouter, UploadFile, File, Form
from app.database import db
import shutil
import os
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/submit")
async def submit_offer(
    name: str = Form(...),
    rollNo: str = Form(...),
    branch: str = Form(...),
    batch: str = Form(...),
    email: str = Form(...),
    mobile: str = Form(...),
    company: str = Form(...),
    package: float = Form(...),
    file: UploadFile = File(...)
):
    try:
        # save file
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # save to DB
        offer = {
            "name": name,
            "rollNo": rollNo,
            "branch": branch,
            "batch": batch,
            "email": email,
            "mobile": mobile,
            "company": company,
            "package": package,
            "file": file_path,
            "status": "pending",
            "createdAt": datetime.now(),
            "isTest": True
        }

        db.offer_letters.insert_one(offer)

        # 🔔 notification
        db.notifications.insert_one({
            "type": "NEW_OFFER",
            "message": f"{name} submitted offer at {company}",
            "createdAt": datetime.now(),
            "read": False
        })

        return {"message": "Offer submitted successfully ✅"}

    except Exception as e:
        return {"error": str(e)}


# ✅ get all offers
@router.get("/")
def get_offers():
    return list(db.offer_letters.find({}, {"_id": 0}))


# ✅ get approved offers
@router.get("/approved")
def get_approved():
    return list(db.offer_letters.find({"status": "approved"}, {"_id": 0}))


# ✅ approve
@router.put("/approve/{rollNo}")
def approve(rollNo: str):
    db.offer_letters.update_one(
        {"rollNo": rollNo},
        {"$set": {"status": "approved"}}
    )
    return {"msg": "Approved"}


# ❌ reject
@router.put("/reject/{rollNo}")
def reject(rollNo: str):
    db.offer_letters.update_one(
        {"rollNo": rollNo},
        {"$set": {"status": "rejected"}}
    )
    return {"msg": "Rejected"}


# 🧹 clear test data
@router.delete("/clear-test")
def clear_test():
    db.offer_letters.delete_many({"isTest": True})
    return {"message": "Test data cleared 🧹"}