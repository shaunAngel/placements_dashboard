# VNR Placements Chatbot — FastAPI

RAG-based placements assistant converted from CLI to a production-ready REST API.

---

## Project Structure

```
ARChatBot-fastapi/
├── main.py               ← FastAPI app + lifespan startup
├── config.py             ← Loads credentials from .env
├── requirements.txt
├── .env                  ← Your secrets (never commit this)
│
├── api/
│   ├── routes.py         ← HTTP endpoints
│   ├── schemas.py        ← Pydantic request/response models
│   ├── service.py        ← Business logic (chat handler)
│   └── state.py          ← Singleton: holds FAISS + analytics agent
│
└── core/                 ← Unchanged from original chatbot
    ├── loader.py
    ├── vector_db.py
    ├── retriever.py
    ├── embedder.py
    ├── llm.py
    ├── router.py
    └── analyzer.py
```

---

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure secrets
Edit `.env`:
```env
GROQ_API_KEY=your_groq_key_here
MONGO_URI=your_mongo_connection_string
```

### 3. Run the server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

On first run the FAISS index is built automatically from MongoDB.
Subsequent runs load it from disk instantly.

---

## API Endpoints

### `POST /api/v1/chat`
Send a placement query.

**Request:**
```json
{ "query": "Which company gave the highest package?" }
```

**Response:**
```json
{
  "query":  "Which company gave the highest package?",
  "answer": "Microsoft offered the highest package of 45 LPA.",
  "route":  "ANALYTICAL"
}
```

`route` will be one of: `GREETING` | `ANALYTICAL` | `SEMANTIC`

---

### `GET /api/v1/health`
Liveness + readiness probe.

```json
{
  "status": "ok",
  "rag_ready": true,
  "analytics_ready": true
}
```

---

### `POST /api/v1/rebuild-index`
Force rebuild the FAISS vector index from MongoDB (admin use).

**Request:**
```json
{ "confirm": true }
```

---

## Interactive Docs
FastAPI auto-generates Swagger UI at:
```
http://localhost:8000/docs
```

---

## Integrating into your Main Project

```python
import httpx

async def ask_placements_bot(question: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "http://localhost:8000/api/v1/chat",
            json={"query": question},
            timeout=30,
        )
        return resp.json()["answer"]
```
