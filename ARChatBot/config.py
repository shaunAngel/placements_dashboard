import os
from dotenv import load_dotenv

load_dotenv()   # reads .env file if present

# ── Credentials (loaded from .env) ───────────────────────────────────────────
GROQ_API_KEY = ""
MONGO_URI    = ""
# ─────────────────────────────────────────────────────────────────────────────

DATA_PATH        = "data/2025-Batch-ALClean2.json"
FAISS_INDEX_PATH = "vector_db_index"
EMBEDDING_MODEL  = "BAAI/bge-small-en-v1.5"
GROQ_SMART_MODEL = "llama-3.3-70b-versatile"