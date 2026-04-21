import pandas as pd
import pymongo
from groq import Groq
import config

_dfs = None


def get_dfs():
    global _dfs
    if _dfs is not None:
        return _dfs

    client = pymongo.MongoClient(config.MONGO_URI)
    db = client["placementsDB"]

    _dfs = {
        'batch':   pd.DataFrame(list(db["batch_reports"].find({}, {"_id": 0}))),
        'branch':  pd.DataFrame(list(db["branch_reports"].find({}, {"_id": 0}))),
        'company': pd.DataFrame(list(db["company_records"].find({}, {"_id": 0}))),
    }

    details_raw = list(db["company_details"].find({}, {"_id": 0}))
    _dfs['company_details'] = pd.DataFrame(details_raw) if details_raw else pd.DataFrame(
        columns=["companyID", "companyName", "companySector", "companyDesc"]
    )

    company_df = _dfs['company']
    details_df = _dfs['company_details']

    if not details_df.empty and 'companyID' in details_df.columns and 'companyName' in details_df.columns:
        id_to_name = dict(zip(details_df['companyID'], details_df['companyName']))
    else:
        id_to_name = {}

    rows = []
    for _, row in company_df.iterrows():
        cid = row.get('companyID')
        cname = id_to_name.get(cid, cid)
        roles = row.get('roles') or []
        if isinstance(roles, list) and len(roles) > 0:
            for r in roles:
                ctc_raw = r.get('roleCTC', None)
                if ctc_raw is None:
                    ctc_num = None
                else:
                    import re
                    m = re.search(r'[\d.]+', str(ctc_raw))
                    ctc_num = float(m.group()) if m else None

                rows.append({
                    'companyID':     cid,
                    'companyName':   cname,
                    'year':          row.get('year'),
                    'totalOffers':   row.get('totalOffers'),
                    'totalSelected': row.get('totalSelected'),
                    'roleType':      r.get('roleType', 'Unknown'),
                    'roleCTC':       ctc_raw,
                    'roleCTC_num':   ctc_num,
                    'CSE': pd.to_numeric(r.get('CSE', 0), errors='coerce'),
                    'CSBS': pd.to_numeric(r.get('CSBS', 0), errors='coerce')
                })
        else:
            rows.append({
                'companyID':     cid,
                'companyName':   cname,
                'year':          str(row.get('year')),
                'totalOffers':   row.get('totalOffers'),
                'totalSelected': row.get('totalSelected'),
                'roleType':      None,
                'roleCTC':       None,
                'roleCTC_num':   None,
            })

    _dfs['company_roles'] = pd.DataFrame(rows)
    _dfs['_company_names'] = list(
        _dfs['company_roles']['companyName'].dropna().unique()
    )

    # ── Pre-compute company-level selection ratio ────────────────────────────
    # selection_ratio = totalSelected / totalOffers  (values 0–1)
    # We aggregate at company level across all years/roles
    cr = _dfs['company_roles'].copy()
    cr['totalOffers']   = pd.to_numeric(cr['totalOffers'],   errors='coerce')
    cr['totalSelected'] = pd.to_numeric(cr['totalSelected'], errors='coerce')

    company_agg = (
        cr.groupby('companyName', as_index=False)
          .agg(total_offers=('totalOffers', 'sum'),
               total_selected=('totalSelected', 'sum'))
    )
    company_agg = company_agg[company_agg['total_offers'] > 0].copy()
    company_agg['selection_ratio'] = (
        company_agg['total_selected'] / company_agg['total_offers']
    ).round(4)
    # selection_ratio_pct: what % of students who applied got selected
    company_agg['selection_ratio_pct'] = (company_agg['selection_ratio'] * 100).round(2)
    _dfs['company_selection'] = company_agg

    # ── Pre-compute branch-level selection ratio ─────────────────────────────
    # For a branch: selection_ratio = placed / eligible  (eligible > 0)
    # placementPercent already exists but may be wrong; recompute cleanly here
    br = _dfs['branch'].copy()
    for col in ['placed', 'eligible', 'registered', 'totalOffers']:
        if col in br.columns:
            br[col] = pd.to_numeric(br[col], errors='coerce')

    if 'eligible' in br.columns and 'placed' in br.columns:
        br['selection_ratio'] = (
            br['placed'] / br['eligible'].replace(0, float('nan'))
        ).round(4)
        br['selection_ratio_pct'] = (br['selection_ratio'] * 100).round(2)
    _dfs['branch'] = br

    return _dfs


groq_client = Groq(api_key=config.GROQ_API_KEY)


def get_pandas_code(user_query: str, dfs: dict) -> str:
    known_names = dfs.get('_company_names', [])
    names_sample = ", ".join(f'"{n}"' for n in known_names[:80])

    prompt = f"""You are a Python/pandas code generator for VNR college placements database.

You have a dictionary of Pandas DataFrames called `dfs`. Here are ALL available DataFrames:

1. dfs['batch']
   columns: batch (str, e.g. '2022-26', '2023-27'), total_students (int),
            placed (int), placement_percentage (float),
            avg_package (float, in LPA), highest_package (float, in LPA)

2. dfs['branch']
   columns: branch (str), onRolls (int), registered (int), eligible (int),
            notEligible (int), placed (int), unplaced (int), multiple (int),
            noOfStudentsMultiple (int), totalOffers (int),
            placementPercent (float), highestSalary (float),
            lowestSalary (float), averageSalary (float),
            selection_ratio (float, 0–1),  ← placed / eligible
            selection_ratio_pct (float)    ← selection_ratio × 100
   DEFINITION: selection_ratio for a branch = placed / eligible students.
   A value of 0.85 means 85% of eligible students got placed.
   NEVER divide totalOffers by anything to get branch selection ratio.

3. dfs['company']
   columns: companyID (str), totalOffers (int), totalSelected (int), year (str)
   NOTE: companyID is internal — NEVER show it to the user.

4. dfs['company_details']
   columns: companyID (str), companyName (str), companySector (str), companyDesc (str)

5. dfs['company_roles']   ← USE for salary/package/CTC queries AND per-role offer counts
   columns: companyID (str), companyName (str), year (str),
            totalOffers (int), totalSelected (int),
            roleType (str), roleCTC (str), roleCTC_num (float),
            CSE (float), CSBS (float)

6. dfs['company_selection']   ← USE for ALL company selection ratio queries
   columns: companyName (str),
            total_offers (int)    — total students who applied/were offered across all years
            total_selected (int)  — total students selected across all years
            selection_ratio (float, 0–1)  ← total_selected / total_offers
            selection_ratio_pct (float)   ← selection_ratio × 100
   DEFINITION: selection_ratio = total_selected / total_offers.
   A value of 0.30 means 30% of applicants were selected.
   ALWAYS use dfs['company_selection'] for any question about company selection ratio.
   NEVER compute selection ratio manually from company_roles — use this pre-computed table.

KNOWN company names: {names_sample}

STRICT RULES:
1. NEVER show companyID. Always use companyName.
2. COMPANY MATCHING — use case-insensitive substring match:
   df_f = dfs['company_selection'][dfs['company_selection']['companyName'].str.lower().str.contains('keyword', na=False)]
   For TCS: also try 'tata consultancy'. Use OR logic for aliases.
3. BRANCH MATCHING — use case-insensitive match on dfs['branch']:
   df_b = dfs['branch'][dfs['branch']['branch'].str.upper() == 'CSE']
   OR: dfs['branch'][dfs['branch']['branch'].str.lower().str.contains('cse', na=False)]
4. SELECTION RATIO RULES:
   - For a BRANCH: use dfs['branch']['selection_ratio_pct'] — it is placed/eligible × 100.
     Print as: "CSE selection ratio: 78.50% (312 placed out of 397 eligible)"
   - For a COMPANY: use dfs['company_selection']['selection_ratio_pct'].
     Print as: "TCS selection ratio: 45.20% (226 selected out of 500 who applied)"
   - For RANKING companies by selection ratio: sort dfs['company_selection'] by selection_ratio descending.
5. Always drop NaN before numeric operations.
6. If a filter returns empty DataFrame, print: "I don't have data for that in the current database."
7. Do NOT import pandas or redefine dfs. Both are already available.
8. Output ONLY executable Python code. No markdown, no triple backticks.

Query: {user_query}
"""
    response = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=config.GROQ_SMART_MODEL,
        temperature=0.0,
    )
    code = response.choices[0].message.content.strip()
    if code.startswith("```"):
        code = "\n".join(code.split("\n")[1:])
    if code.endswith("```"):
        code = "\n".join(code.split("\n")[:-1])
    return code.strip()


def run_code_safely(code: str, dfs: dict) -> str:
    import io, contextlib
    stdout_capture = io.StringIO()
    try:
        with contextlib.redirect_stdout(stdout_capture):
            exec(code, {"dfs": dfs, "pd": pd})
        result = stdout_capture.getvalue().strip()
        return result if result else "No output was produced."
    except Exception as e:
        return f"Code execution error: {e}"


def get_data_agent():
    dfs = get_dfs()

    def agent(query: str) -> str:
        code = get_pandas_code(query, dfs)
        print(f"[Debug] Generated code:\n{code}\n")
        result = run_code_safely(code, dfs)

        if result.startswith("Code execution error") or result == "No output was produced.":
            print(f"[Debug] First attempt failed ({result}), retrying with fallback...")
            fallback_code = get_pandas_code_fallback(query, dfs)
            print(f"[Debug] Fallback code:\n{fallback_code}\n")
            result = run_code_safely(fallback_code, dfs)

        return result

    return agent


def get_pandas_code_fallback(user_query: str, dfs: dict) -> str:
    known_names = dfs.get('_company_names', [])
    names_sample = ", ".join(f'"{n}"' for n in known_names[:80])

    prompt = f"""Write simple Python/pandas code to answer this placement query.

Available DataFrames:
- dfs['company_selection']: companyName, total_offers, total_selected, selection_ratio (0-1), selection_ratio_pct
  selection_ratio = total_selected / total_offers  (use this for all company selection ratio questions)
- dfs['branch']: branch, placed, eligible, registered, averageSalary, highestSalary, lowestSalary,
                 placementPercent, selection_ratio (placed/eligible, 0-1), selection_ratio_pct
- dfs['company_roles']: companyName, roleCTC, roleCTC_num, roleType, year, totalOffers, totalSelected, CSE, CSBS
- dfs['batch']: batch, placed, avg_package, highest_package, placement_percentage

Known company names: {names_sample}

Rules:
- For company selection ratio → use dfs['company_selection'], sort by selection_ratio descending
- For branch selection ratio → use dfs['branch']['selection_ratio_pct'] (placed/eligible × 100)
- Use .str.lower().str.contains() for company name matching
- Drop NaN before numeric operations
- Print a clear human-readable answer with context (e.g., "X selected out of Y applied")
- Output ONLY runnable Python, no markdown

Query: {user_query}"""

    response = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=config.GROQ_SMART_MODEL,
        temperature=0.2,
    )
    code = response.choices[0].message.content.strip()
    if code.startswith("```"):
        code = "\n".join(code.split("\n")[1:])
    if code.endswith("```"):
        code = "\n".join(code.split("\n")[:-1])
    return code.strip()
