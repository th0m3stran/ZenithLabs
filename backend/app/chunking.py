#Splitting long string into smaller pieces
def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap

    return chunks

# Takes documents, chunks them and keeps metadata
def chunk_documents(documents: list[dict]) -> list[dict]:
    all_chunks = []

    for doc in documents:
        chunks = chunk_text(doc["text"])
        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "id": f'{doc["source"]}-{i}',
                "source": doc["source"],
                "text": chunk,

            })
        return all_chunks
