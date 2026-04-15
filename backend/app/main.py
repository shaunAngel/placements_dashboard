from fastapi import FastAPI
from app.routes import company, drive, stats
from app.routes import students, branch, batch, leaderboard
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now (dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(company.router, prefix="/api/companies")
app.include_router(drive.router, prefix="/api/drives")
app.include_router(stats.router, prefix="/api/stats")

# NEW ROUTES
app.include_router(students.router, prefix="/api/students")
app.include_router(branch.router, prefix="/api/branches")
app.include_router(batch.router, prefix="/api/batch")
app.include_router(leaderboard.router, prefix="/api/leaderboard")


@app.get("/")
def root():
    return {"message": "API running"}