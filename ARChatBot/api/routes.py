"""
API Routes
  POST /api/v1/chat          — main chat endpoint
  GET  /api/v1/health        — liveness + readiness probe
  POST /api/v1/rebuild-index — force rebuild of FAISS index (admin use)
"""

import asyncio
from fastapi import APIRouter, HTTPException, status

from api.schemas import (
    ChatRequest, ChatResponse,
    HealthResponse,
    RebuildRequest, RebuildResponse,
)
from api.service import handle_chat
from api.state import AppState
from core.loader import load_and_chunk_data
from core.vector_db import create_and_save_index, load_index
from core.retriever import get_retriever
import config

router = APIRouter()


# ── POST /chat ────────────────────────────────────────────────────────────────

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a placement query and receive an answer",
    status_code=status.HTTP_200_OK,
)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.

    - Routes the query to **ANALYTICAL** (pandas/MongoDB) or **SEMANTIC** (vector DB).
    - Greetings are handled instantly without an LLM call.
    - Pass `history` to enable multi-turn conversation memory.
    """
    if AppState.retriever is None or AppState.analytical_agent is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="System is still initialising. Please retry in a few seconds.",
        )

    # Convert Pydantic ChatMessage objects to plain dicts for the service layer
    history_dicts = None
    if request.history:
        history_dicts = [{"role": m.role, "content": m.content} for m in request.history]

    result = await handle_chat(request.query, history=history_dicts)
    return ChatResponse(query=request.query, **result)


# ── GET /health ───────────────────────────────────────────────────────────────

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health / readiness check",
)
async def health():
    return HealthResponse(
        status="ok",
        rag_ready=AppState.retriever is not None,
        analytics_ready=AppState.analytical_agent is not None,
    )


# ── POST /rebuild-index ───────────────────────────────────────────────────────

@router.post(
    "/rebuild-index",
    response_model=RebuildResponse,
    summary="Force rebuild the FAISS vector index (admin)",
)
async def rebuild_index(body: RebuildRequest):
    """
    Drops and rebuilds the FAISS index from MongoDB.
    Pass `{ "confirm": true }` to proceed.
    Heavy operation — may take 30–60 seconds.
    """
    if not body.confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Set "confirm": true to trigger rebuild.',
        )

    def _rebuild():
        docs = load_and_chunk_data()
        create_and_save_index(docs, config.FAISS_INDEX_PATH)
        new_db = load_index(config.FAISS_INDEX_PATH)
        AppState.vector_db = new_db
        AppState.retriever = get_retriever(new_db)
        return len(docs)

    loop = asyncio.get_event_loop()
    try:
        count = await loop.run_in_executor(None, _rebuild)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rebuild failed: {e}",
        )

    return RebuildResponse(
        message="FAISS index rebuilt successfully.",
        docs_indexed=count,
    )
