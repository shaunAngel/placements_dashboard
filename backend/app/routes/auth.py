from fastapi import APIRouter, HTTPException, Depends, status
from app.database import users_collection
from app.models import UserLogin, UserRegister, UserOut, TokenResponse
from app.authentication.jwt import create_access_token, verify_token
from app.authentication.dependencies import get_current_user
import bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── POST /auth/login ─────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    """Authenticate user and return JWT token."""
    user = users_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify the role matches
    if user.get("role") != data.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"You are not registered as {data.role}",
        )

    # Create JWT token
    token = create_access_token(
        data={
            "sub": user["email"],
            "role": user["role"],
            "name": user.get("name", ""),
            "rollNo": user.get("rollNo", ""),
        }
    )

    return TokenResponse(
        access_token=token,
        user=UserOut(
            email=user["email"],
            role=user["role"],
            name=user.get("name"),
            rollNo=user.get("rollNo"),
        ),
    )


# ── POST /auth/register ──────────────────────────────
@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister):
    """Register a new user."""
    # Check if user already exists
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    # Validate role — Staff removed
    valid_roles = ["Admin", "Faculty", "Student"]
    if data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role must be one of: {', '.join(valid_roles)}",
        )

    # Hash password and save
    user_doc = {
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role,
        "name": data.name or "",
        "rollNo": data.rollNo or "",
    }
    users_collection.insert_one(user_doc)

    return UserOut(
        email=data.email,
        role=data.role,
        name=data.name,
        rollNo=data.rollNo,
    )


# ── GET /auth/me ──────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the current user from the JWT token (used for session restore)."""
    return UserOut(
        email=current_user.get("sub", ""),
        role=current_user.get("role", ""),
        name=current_user.get("name"),
        rollNo=current_user.get("rollNo"),
    )


# ── POST /auth/seed ──────────────────────────────────
@router.post("/seed")
def seed_demo_users():
    """
    Seed the 3 demo users that match the Login.jsx quick-login buttons.
    Idempotent — skips users that already exist.
    Staff role removed.
    """
    demo_users = [
        {
            "email": "admin@vnrvjiet.ac.in",
            "password": "vnrvjiet@123",
            "role": "Admin",
            "name": "Admin User",
            "rollNo": "",
        },
        {
            "email": "faculty@vnrvjiet.ac.in",
            "password": "vnrvjiet@123",
            "role": "Faculty",
            "name": "Faculty Member",
            "rollNo": "",
        },
        {
            "email": "student@vnrvjiet.ac.in",
            "password": "vnrvjiet@123",
            "role": "Student",
            "name": "S GAYATHRI",
            "rollNo": "22071A3243",
        },
    ]

    created = []
    skipped = []

    for u in demo_users:
        if users_collection.find_one({"email": u["email"]}):
            skipped.append(u["email"])
            continue

        users_collection.insert_one(
            {
                "email": u["email"],
                "password": hash_password(u["password"]),
                "role": u["role"],
                "name": u["name"],
                "rollNo": u["rollNo"],
            }
        )
        created.append(u["email"])

    return {
        "message": "Seeding complete",
        "created": created,
        "skipped": skipped,
    }
