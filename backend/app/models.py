from pydantic import BaseModel
from typing import List

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