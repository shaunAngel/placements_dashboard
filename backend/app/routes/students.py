import os
import shutil
from app.database import students_collection
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

router = APIRouter()

# Ensure an uploads directory exists
UPLOAD_DIR = "uploads/profiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_students():
    students = list(students_collection.find({}, {"_id": 0}))
    return students

@router.patch("/{rollNo}")
async def update_student_profile(
    rollNo: str,
    email: str = Form(...),
    mobile: str = Form(...),
    profilePhoto: Optional[UploadFile] = File(None)
):
    # Prepare the update object
    update_data = {
        "email": email,
        "mobile": mobile
    }

    if profilePhoto:
        # Save file to your 'uploads' folder (use rollNo for the filename)
        file_ext = profilePhoto.filename.split(".")[-1]
        file_path = f"uploads/profiles/{rollNo}.{file_ext}"
        
        with open(file_path, "wb") as f:
            f.write(await profilePhoto.read())
            
        # Save the URL/path in the database
        update_data["profileImage"] = f"/{file_path}"
    
    students_collection.update_one(
        {"rollNo": rollNo}, 
        {"$set": update_data}
    )
    # Update MongoDB
    updated_student = students_collection.find_one({"rollNo": rollNo}, {"_id": 0})
    return updated_student # Ensure this is the WHOLE object

@router.delete("/{rollNo}/clear-pfp")
async def clear_profile_picture(rollNo: str):
    # 1. Find student
    student = students_collection.find_one({"rollNo": rollNo})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Delete physical file if it exists
    old_image_path = student.get("profileImage")
    if old_image_path:
        # Strip the leading slash to get the local path
        local_path = old_image_path.lstrip("/") 
        if os.path.exists(local_path):
            os.remove(local_path)

    # 3. Update MongoDB to null
    students_collection.update_one(
        {"rollNo": rollNo}, 
        {"$set": {"profileImage": None}}
    )

    # 4. Return updated student
    updated_student = students_collection.find_one({"rollNo": rollNo}, {"_id": 0})
    return updated_student