import pymongo
import config
from langchain_core.documents import Document


def load_and_chunk_data():
    """
    Load from MongoDB — company_details, company_records, branch_reports, AND batch_reports.
    Builds one Document per company, one per branch, one per batch.
    """
    client = pymongo.MongoClient(config.MONGO_URI)
    db = client["placementsDB"]

    documents = []

    # ── 1. Company documents (company_details + company_records) ─────────────
    companies = list(db["company_details"].find({}))

    for company in companies:
        cid    = company.get("companyID", "")
        name   = company.get("companyName", cid)
        sector = company.get("companySector", "N/A")
        desc   = company.get("companyDesc", "N/A")

        content = (
            f"Company: {name}\n"
            f"Sector: {sector}\n"
            f"About: {desc}\n"
        )

        records = list(db["company_records"].find({"companyID": cid}, {"_id": 0}))
        for record in records:
            year   = record.get("year", "Unknown Year")
            offers = record.get("totalOffers", 0)

            role_parts = []
            for r in record.get("roles", []):
                r_type   = r.get("roleType", "Unknown Role")
                r_ctc    = r.get("roleCTC", "N/A")
                r_offers = r.get("totalOffers", 0)
                r_cse    = r.get("CSE", 0)
                r_csbs   = r.get("CSBS", 0)
                role_parts.append(
                    f"{r_type} (Package: {r_ctc} LPA) | "
                    f"Offers for this role: {r_offers} | "
                    f"CSE Hired: {r_cse} | CSBS Hired: {r_csbs}"
                )

            roles_str = ", ".join(role_parts) if role_parts else "No role details available"
            content += f"In {year}, {name} made {offers} total offer(s): {roles_str}.\n"

        doc = Document(page_content=content, metadata={"type": "company", "company": name})
        documents.append(doc)

    # ── 2. Branch documents ───────────────────────────────────────────────────
    branches = list(db["branch_reports"].find({}, {"_id": 0}))
    for branch in branches:
        name = branch.get("branch", "Unknown Branch")
        content = (
            f"Branch: {name}\n"
            f"Students on Rolls: {branch.get('onRolls', 'N/A')}\n"
            f"Registered for Placements: {branch.get('registered', 'N/A')}\n"
            f"Eligible: {branch.get('eligible', 'N/A')}\n"
            f"Not Eligible: {branch.get('notEligible', 'N/A')}\n"
            f"Placed: {branch.get('placed', 'N/A')}\n"
            f"Unplaced: {branch.get('unplaced', 'N/A')}\n"
            f"Total Offers: {branch.get('totalOffers', 'N/A')}\n"
            f"Placement Percentage: {branch.get('placementPercent', 'N/A')}%\n"
            f"Highest Salary: {branch.get('highestSalary', 'N/A')} LPA\n"
            f"Lowest Salary: {branch.get('lowestSalary', 'N/A')} LPA\n"
            f"Average Salary: {branch.get('averageSalary', 'N/A')} LPA\n"
        )
        doc = Document(page_content=content, metadata={"type": "branch", "branch": name})
        documents.append(doc)

    # ── 3. Batch documents ────────────────────────────────────────────────────
    batches = list(db["batch_reports"].find({}, {"_id": 0}))
    for batch in batches:
        name = batch.get("batch", "Unknown Batch")
        content = (
            f"Batch: {name}\n"
            f"Total Students: {batch.get('total_students', 'N/A')}\n"
            f"Placed: {batch.get('placed', 'N/A')}\n"
            f"Placement Percentage: {batch.get('placement_percentage', 'N/A')}%\n"
            f"Average Package: {batch.get('avg_package', 'N/A')} LPA\n"
            f"Highest Package: {batch.get('highest_package', 'N/A')} LPA\n"
        )
        doc = Document(page_content=content, metadata={"type": "batch", "batch": name})
        documents.append(doc)

    print(f"[Loader] Loaded {len(documents)} documents "
          f"({len(companies)} companies, {len(branches)} branches, {len(batches)} batches).")
    return documents
