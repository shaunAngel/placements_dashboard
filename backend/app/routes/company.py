from fastapi import APIRouter, HTTPException
from app.database import company_collection, drive_collection

router = APIRouter()

# --- HELPER TO CALCULATE STATS ---
def calculate_company_stats(company_id: str):
    # Fetch all drive records for this company
    drives = list(drive_collection.find({"companyID": company_id}))
    
    total_weighted_ctc = 0
    total_placed = 0
    all_ctcs = []
    branches = set()

    for drive in drives:
        for role in drive.get("roles", []):
            ctc = float(role.get("roleCTC", 0))
            placed_in_role = int(role.get("totalSelected", 0)) #
            
            if ctc > 0:
                all_ctcs.append(ctc)
                # Weighted Formula: Sum of (Package * Students)
                total_weighted_ctc += (ctc * placed_in_role)
                total_placed += placed_in_role

            # Identify eligible branches
            for b in ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "CHEM", "CSBS"]:
                if role.get(b, 0) > 0:
                    branches.add(b)

    return {
        # Weighted Average calculation
        "avgPackage": round(total_weighted_ctc / total_placed, 2) if total_placed > 0 else 0,
        "highestPackage": max(all_ctcs) if all_ctcs else 0,
        "placedCount": total_placed,
        "branches": list(branches)
    }

# --- ROUTES ---

from fastapi import APIRouter
from app.database import company_collection, drive_collection

router = APIRouter()

@router.get("/")
def get_all_companies():
    # Fetch all data from both collections
    companies = list(company_collection.find({}, {"_id": 0}))
    all_drives = list(drive_collection.find({}, {"_id": 0}))
    
    # Map drives to companyIDs for fast access
    drive_map = {}
    for d in all_drives:
        c_id = d.get("companyID")
        if c_id not in drive_map:
            drive_map[c_id] = []
        drive_map[c_id].append(d)

    for comp in companies:
        c_id = comp.get("companyID")
        comp_drives = drive_map.get(c_id, [])
        
        all_ctcs = []
        branches = set()
        total_package_value = 0
        total_placed = 0
        
        for d in comp_drives:
            for role in d.get("roles", []):
                ctc = float(role.get("roleCTC", 0))
                placed_in_role = int(role.get("totalSelected", 0)) #
                
                if ctc > 0:
                    all_ctcs.append(ctc)
                    # ✅ Weighted calculation: Package * Students
                    total_package_value += (ctc * placed_in_role)
                    total_placed += placed_in_role

        # ✅ Calculate Weighted Average
        comp["avgPackage"] = round(total_package_value / total_placed, 2) if total_placed > 0 else 0
        comp["highestPackage"] = max(all_ctcs) if all_ctcs else 0
        comp["placedCount"] = total_placed
        comp["branches"] = list(branches)
        comp["status"] = "Active" if total_placed > 0 else "Inactive"

    # Sort alphabetically
    companies.sort(key=lambda x: x.get("companyName", "").upper())
    return companies

@router.get("/{company_id}/full")
def get_company_full(company_id: str):
    # 1. Fetch basic company info
    company = company_collection.find_one({"companyID": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # 2. Get the proper Weighted stats for the header boxes
    stats = calculate_company_stats(company_id)

    # 3. Fetch detailed hiring records for the table
    records = list(drive_collection.aggregate([
        { "$match": {"companyID": company_id} },
        { "$unwind": "$roles" },
        {
            "$project": {
                "_id": 0,
                "year": "$year",
                "roleType": "$roles.roleType",
                "roleCTC": "$roles.roleCTC",
                "totalOffers": "$roles.totalOffers",
                "totalSelected": "$roles.totalSelected"
            }
        }
    ]))

    # Merge the basic info with the calculated stats
    return {
        "company": {**company, **stats},
        "records": records
    }