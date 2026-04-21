"""
Chat service — core logic invoked by the route handlers.
Keeps all business logic out of the route layer.
Supports optional conversation history for multi-turn memory.
"""

import asyncio
from typing import List, Optional
from api.state import AppState
from core.llm import generate_response
from core.router import route_query

GREETINGS = {
    "hi", "hello", "hey", "hii", "helo", "heya", "howdy",
    "good morning", "good afternoon", "good evening", "good night",
    "what's up", "whats up", "sup", "yo",
}

GREETING_RESPONSE = (
    "Hello! 👋 I'm the VNR Placements Assistant.\n\n"
    "I can help you with:\n"
    "  • Company-wise placement details (roles, packages, offers)\n"
    "  • Branch-wise placement statistics\n"
    "  • Highest & average salary data\n"
    "  • Analytical queries like 'which company gave the most offers?'\n"
    "  • Follow-up questions — just keep chatting!\n\n"
    "Ask me anything about VNR placements!"
)


def _is_greeting(query: str) -> bool:
    return query.lower().strip().rstrip("!.,?") in GREETINGS


def _resolve_query_with_history(query: str, history: Optional[List[dict]]) -> str:
    """
    If the query is vague (e.g. 'what about their package?'), rewrite it
    using recent history context so the router and agents get a clear query.
    """
    if not history:
        return query

    # Only resolve if the current query seems to reference something earlier
    vague_triggers = [
        "what about", "and them", "their", "that company", "same company",
        "for them", "how about", "tell me more", "what else", "also",
        "what about its", "for that"
    ]
    query_lower = query.lower()
    if not any(t in query_lower for t in vague_triggers):
        return query

    # Build a short context from the last 4 messages
    recent = "\n".join(
        f"{m['role'].capitalize()}: {m['content']}"
        for m in history[-4:]
    )

    from groq import Groq
    import config
    c = Groq(api_key=config.GROQ_API_KEY)
    resolution_prompt = f"""Given this conversation history:
{recent}

The user now asks: "{query}"

Rewrite the user's question as a fully self-contained query that includes all necessary context (company name, metric, etc.) from the history. Output ONLY the rewritten question, nothing else."""

    resp = c.chat.completions.create(
        messages=[{"role": "user", "content": resolution_prompt}],
        model=config.GROQ_SMART_MODEL,
        temperature=0.0,
    )
    resolved = resp.choices[0].message.content.strip().strip('"')
    print(f"[Debug] Resolved query: '{query}' → '{resolved}'")
    return resolved


def _handle_query_sync(query: str, history: Optional[List[dict]] = None) -> dict:
    """Synchronous work — called in a thread pool to avoid blocking."""
    if _is_greeting(query):
        return {"answer": GREETING_RESPONSE, "route": "GREETING"}

    # Resolve vague follow-up questions using conversation history
    resolved_query = _resolve_query_with_history(query, history)

    route = route_query(resolved_query)
    print(f"[Debug] Route: {route} | Query: {resolved_query}")

    if route == "ANALYTICAL":
        try:
            answer = AppState.analytical_agent(resolved_query)
        except Exception as e:
            answer = f"I had trouble calculating that. Could you rephrase? (detail: {e})"
    else:
        relevant_docs  = AppState.retriever.invoke(resolved_query)
        context_string = "\n\n".join([doc.page_content for doc in relevant_docs])
        answer = generate_response(resolved_query, context_string, history=history)

    return {"answer": answer, "route": route}


async def handle_chat(query: str, history: Optional[List[dict]] = None) -> dict:
    """Async wrapper — runs the sync chain in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _handle_query_sync, query, history)
