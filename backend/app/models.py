from pydantic import BaseModel
from typing import List, Optional

class Role(BaseModel):
    role: str
    offered: int
    avgPackage: float

class Drive(BaseModel):
    driveId: str
    companyId: str
    academicYear: str
    year: int
    driveStatus: str
    location: str
    eligibleBranches: List[str]
    eligibleBatch: str
    overallAppeared: int
    overallOffered: int
    placementPercentage: float
    avgPackage: float
    highestPackage: float
    roleBreakdown: List[Role]


# ── Auth Models ──────────────────────────────────────

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class UserRegister(BaseModel):
    email: str
    password: str
    role: str  # Admin | Staff | Faculty | Student
    name: Optional[str] = None
    rollNo: Optional[str] = None

class UserOut(BaseModel):
    email: str
    role: str
    name: Optional[str] = None
    rollNo: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut