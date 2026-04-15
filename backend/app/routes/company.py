from fastapi import APIRouter
from app.database import company_collection, drive_collection

router = APIRouter()

@router.get("/")
def get_all_companies():
    companies = list(company_collection.find({}, {"_id": 0}))
    return companies

# ✅ GET SINGLE COMPANY (basic info)
@router.get("/{company_id}")
def get_company(company_id: str):
    company = company_collection.find_one(
        {"companyID": company_id},
        {"_id": 0}
    )
    return company


# ✅ GET FULL COMPANY DETAILS (THIS IS WHAT FRONTEND USES)
@router.get("/{company_id}/full")
def get_company_full(company_id: str):

    # 1. Company basic info
    company = company_collection.find_one(
        {"companyID": company_id},
        {"_id": 0}
    )

    if not company:
        return {"error": "Company not found"}

    # 2. Hiring records (FIXED FOR YOUR DB STRUCTURE)
    records = list(drive_collection.aggregate([
        {"$unwind": "$roles"},
        {"$match": {"roles.companyID": company_id}},
        {
            "$project": {
                "_id": 0,
                "roleType": "$roles.roleType",
                "roleCTC": "$roles.roleCTC",
                "totalOffers": "$roles.totalOffers",
                "totalSelected": "$roles.totalSelected"
            }
        }
    ]))

    return {
        "company": company,
        "records": records
    }