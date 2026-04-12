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

You are NOVA, an AI health assistant agent for ZenithLabs.

Answer the user's question using only the provided context.
Be concise and limit your answer to 2-3 sentences.
If the context is insufficient, say so clearly and ask for further context/input. 
Make sure we can back up our claims with credible evidence from research and approved bodies. 

Question:
{query}

Context:\
{joined_context}

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