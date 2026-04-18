from app.routes.auth import hash_password
from app.database import users_collection
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import users_collection  # Your MongoDB collection

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    branch: Optional[str] = ""
    rollNo: Optional[str] = ""

router = APIRouter()

# users.py

@router.get("")
async def get_users():
    # Fetch all users and exclude the _id to avoid JSON errors
    users = list(users_collection.find({}, {"_id": 0}))
    return users

@router.post("/register")
async def register_user(user: UserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = hash_password("Welcome@123")

    new_user = {
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "branch": user.branch or "None", # ✅ Ensure a value exists
        "status": "Active",              # ✅ Ensure a value exists
        "rollNo": user.rollNo if user.role == "Student" else "", 
        "password": hashed_pwd
    }

    # 1. Save to MongoDB
    users_collection.insert_one(new_user)
    
    # 2. ✅ FETCH AND RETURN the user object for the frontend store
    # We exclude the password for security
    saved_user = users_collection.find_one({"email": user.email}, {"_id": 0, "password": 0})
    
    return {"message": "User created successfully", "user": saved_user}

@router.delete("/{email}")
async def delete_user(email: str):
    """Permanently remove a user from the database."""
    result = users_collection.delete_one({"email": email})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    return {"message": f"User {email} deleted successfully"}

@router.patch("/{email}")
async def update_user(email: str, updates: dict):
    # Only update the fields provided in the request body
    result = users_collection.update_one(
        {"email": email}, 
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}