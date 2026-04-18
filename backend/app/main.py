from fastapi import FastAPI
from app.routes import company, drive, stats, users, auth
from fastapi.staticfiles import StaticFiles
from app.routes import students, branch, batch
from fastapi.middleware.cors import CORSMiddleware
from app.routes import offer
from app.routes import settings
from app.routes import notifications

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router) 
app.include_router(offer.router, prefix="/api/offer")
app.include_router(settings.router, prefix="/api")
app.include_router(notifications.router)
app.include_router(company.router, prefix="/api/companies")
app.include_router(drive.router, prefix="/api/drives")
app.include_router(stats.router, prefix="/api/stats")
app.include_router(students.router, prefix="/api/students")
app.include_router(branch.router, prefix="/api/branches")
app.include_router(batch.router, prefix="/api/batch")
app.include_router(users.router, prefix="/api/users")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
def root():
    return {"message": "API running"}