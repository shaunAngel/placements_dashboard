from pydantic import BaseModel, Field
from typing import Optional, List


class ChatMessage(BaseModel):
    role: str          # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[ChatMessage]] = Field(
        default=None,
        description="Optional list of previous turns for multi-turn memory."
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Client session ID for server-side memory (future use)."
    )


class ChatResponse(BaseModel):
    query:   str
    answer:  str
    route:   str


class HealthResponse(BaseModel):
    status:           str
    rag_ready:        bool
    analytics_ready:  bool


class RebuildRequest(BaseModel):
    confirm: bool = False


class RebuildResponse(BaseModel):
    message:      str
    docs_indexed: int
