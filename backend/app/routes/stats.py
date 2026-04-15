from fastapi import APIRouter
from app.database import drive_collection, company_collection

router = APIRouter()

# -------------------------------
# ✅ COMPANY-WISE STATS
# -------------------------------
@router.get("/company-wise")
def company_wise_stats():
    pipeline = [
    {
        "$group": {
            "_id": "$companyID",   # ✅ FIXED
            "totalOffers": {"$sum": "$totalOffers"},
            "totalSelected": {"$sum": "$totalSelected"}
        }
    },

    {
        "$lookup": {
            "from": "company_details",
            "localField": "_id",
            "foreignField": "companyID",
            "as": "company_info"
        }
    },

    {
        "$unwind": {
            "path": "$company_info",
            "preserveNullAndEmptyArrays": True
        }
    },

    {
        "$project": {
            "_id": 0,
            "companyID": "$_id",
            "companyName": "$company_info.companyName",
            "totalOffers": 1,
            "totalSelected": 1
        }
    },

    {"$sort": {"totalOffers": -1}},
    {"$limit": 10}
]

    result = list(drive_collection.aggregate(pipeline))
    return result

@router.get("/overview")
def overview():
    pipeline = [
        {
            "$group": {
                "_id": None,
                "totalOffers": {"$sum": "$totalOffers"},
                "totalSelected": {"$sum": "$totalSelected"}
            }
        },
        {
            "$project": {
                "_id": 0,
                "totalOffers": 1,
                "totalSelected": 1,
                "placementPercentage": {
                    "$cond": [
                        {"$eq": ["$totalOffers", 0]},
                        0,
                        {
                            "$multiply": [
                                {"$divide": ["$totalSelected", "$totalOffers"]},
                                100
                            ]
                        }
                    ]
                }
            }
        }
    ]

    result = list(drive_collection.aggregate(pipeline))

    return result[0] if result else {
        "totalOffers": 0,
        "totalSelected": 0,
        "placementPercentage": 0
    }
# -------------------------------
# ✅ DEBUG: CHECK DATA
# -------------------------------
@router.get("/debug")
def debug():
    data = list(drive_collection.find().limit(3))

    for doc in data:
        doc["_id"] = str(doc["_id"])

    return data


# -------------------------------
# ✅ TEST: CHECK COMPANY DETAILS
# -------------------------------
@router.get("/test")
def test():
    data = list(company_collection.find().limit(2))

    for doc in data:
        doc["_id"] = str(doc["_id"])

    return data

@router.get("/check")
def check():
    data = list(drive_collection.find({}, {"roles": 1}).limit(5))

    for doc in data:
        doc["_id"] = str(doc["_id"])

    return data

@router.get("/companies")
def get_companies():
    data = list(company_collection.find())

    for d in data:
        d["_id"] = str(d["_id"])

    return data