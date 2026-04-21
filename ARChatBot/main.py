"""
ARChatBot — FastAPI Entry Point
Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from api.state import AppState
import config

# ── Startup / Shutdown (runs once) ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load heavy resources once at startup; release on shutdown."""
    print("[Startup] Initialising RAG system...")
    await AppState.initialise()
    print("[Startup] ✅ System ready.")
    yield
    print("[Shutdown] Cleaning up resources...")
    AppState.cleanup()


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VNR Placements Chatbot API",
    description="RAG-based placements assistant with semantic + analytical routing.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (allow your frontend origin) ────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(router, prefix="/api/v1")
