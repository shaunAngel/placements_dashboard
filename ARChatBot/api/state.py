"""
AppState — singleton that holds all heavy objects loaded at startup.
Every request reads from here instead of re-loading models.
"""

import asyncio
from typing import Optional

from core.loader import load_and_chunk_data
from core.vector_db import create_and_save_index, load_index
from core.retriever import get_retriever
from core.analyzer import get_data_agent
import config


class AppState:
    vector_db = None
    retriever  = None
    analytical_agent = None

    @classmethod
    async def initialise(cls):
        """
        Build or load FAISS index and warm up the analytics agent.
        Runs in a thread so it doesn't block the event loop.
        """
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, cls._load_sync)

    @classmethod
    def _load_sync(cls):
        import os
        if not os.path.exists(config.FAISS_INDEX_PATH):
            print("[State] First-time setup — building FAISS index from MongoDB...")
            docs = load_and_chunk_data()
            create_and_save_index(docs, config.FAISS_INDEX_PATH)
            print(f"[State] Indexed {len(docs)} documents.")

        print("[State] Loading FAISS index...")
        cls.vector_db  = load_index(config.FAISS_INDEX_PATH)
        cls.retriever  = get_retriever(cls.vector_db)

        print("[State] Warming up analytics agent (loading DataFrames from MongoDB)...")
        cls.analytical_agent = get_data_agent()
        print("[State] Analytics agent ready.")

    @classmethod
    def cleanup(cls):
        cls.vector_db        = None
        cls.retriever        = None
        cls.analytical_agent = None
