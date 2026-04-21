from groq import Groq
import config
from typing import List, Optional

client = Groq(api_key=config.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a helpful and friendly college placements assistant for VNR Vignana Jyothi Institute of Engineering and Technology.

Answer the student's question using ONLY the provided context below.
- Use company names exactly as they appear in the context — never use internal IDs.
- If the answer is not in the context, reply: "I don't have that information in my current placements database."
- For greetings (Hi, Hello, etc.), respond warmly and explain how you can help with placement queries.
- Be concise and student-friendly.
- When discussing packages, always mention if they are in LPA (Lakhs Per Annum)."""


def generate_response(
    user_query: str,
    retrieved_context: str,
    history: Optional[List[dict]] = None,
) -> str:
    """
    Generate a response using retrieved context.
    history: list of {"role": "user"/"assistant", "content": "..."} dicts
    """
    messages = []

    # Inject conversation history (last 6 turns max to stay within token limits)
    if history:
        for turn in history[-6:]:
            messages.append({"role": turn["role"], "content": turn["content"]})

    # Build the final user message with context
    user_content = f"""Context from placements database:
{retrieved_context}

Question: {user_query}

Answer (use only the context above):"""

    messages.append({"role": "user", "content": user_content})

    response = client.chat.completions.create(
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        model=config.GROQ_SMART_MODEL,
        temperature=0.0,
    )
    return response.choices[0].message.content
