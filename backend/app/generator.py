import requests

def generate_response(query: str, contexts: list[str], model: str = "llama3") -> str:
    """
    Generate a grounded response using a local Ollama model.

    Args:
        query (st: User question.
        contexts: Retrieved text chunks.
        model: Local Ollama model name.

    Returns:
        str: Generated text response.
    """
    joined_context = "\n\n".join(contexts)

    prompt = f"""

You are NOVA, an AI health assistant for ZenithLabs.

Answer the user's question using the provided information, but DO NOT mention:
- the context
- that information was retrieved
- any file names or sources unless explicitly asked

Respond naturally, as a knowledgeable and trustworthy health expert.

Be concise and limit your answer to 2–3 sentences.

Base your answer on credible health guidance (e.g., general medical consensus, established research, or recognized health organizations), but do not cite sources unless the user asks for them.

If the information is insufficient, say so clearly and ask the user for more details.

Question:
{query}

Answer:
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        },
        timeout=60

    )

    response.raise_for_status()
    data = response.json()
    return data["response"].strip()

"""
    
"""