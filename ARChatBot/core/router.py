from groq import Groq
import config

client = Groq(api_key=config.GROQ_API_KEY)


def route_query(user_query: str) -> str:
    """
    Route to ANALYTICAL (pandas/MongoDB computation) or SEMANTIC (vector DB).
    Uses a richer prompt with examples to reduce misclassification.
    """
    prompt = f"""You are a routing assistant for a college placements chatbot.

Classify the user query into exactly one of two routes: ANALYTICAL or SEMANTIC.

ANALYTICAL — use when the query needs numbers, math, ranking, or aggregation:
- Highest / lowest / best / worst / max / min package, salary, CTC, LPA
- "What is the highest package from TCS?" → ANALYTICAL
- "Highest package offered by Amazon?" → ANALYTICAL
- "How much does Google pay?" → ANALYTICAL
- Average salary, total offers, placement count
- Comparing companies by salary or offer count
- Top-N companies by package / offers
- Placement percentage, selection rate
- Branch-wise or batch-wise statistics
- "How many students got placed in CSE?"
- Any superlative (highest, lowest, most, least, best, worst) applied to a number

SEMANTIC — use only when the query is purely descriptive and has NO numeric goal:
- "Tell me about Amazon's hiring process"
- "What roles does TCS offer?" (role names, not salary)
- "Which branches are eligible for Google?"
- "What sector does Wipro belong to?"
- "Describe Infosys"
- Skills required, job location, drive type
- Greetings and general conversation

IMPORTANT: If the query mentions a salary/package/CTC/LPA/offer-count alongside a company name, it is ALWAYS ANALYTICAL regardless of how it is phrased.

Query: "{user_query}"

Reply with exactly one word — ANALYTICAL or SEMANTIC:"""

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=config.GROQ_SMART_MODEL,
        temperature=0.0,
    )
    route = response.choices[0].message.content.strip().upper()
    return "ANALYTICAL" if "ANALYTICAL" in route else "SEMANTIC"
