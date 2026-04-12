from app.ingestion import load_documents
from app.chunking import chunk_documents
from app.embeddings import EmbeddingModel
from app.retrieval import VectorStore
from pathlib import Path
from app.generator import generate_response

def build_pipeline():
    BASE_DIR = Path(__file__).resolve().parent.parent
    DOCS_DIR = BASE_DIR / "data" / "documents"

    docs = load_documents(str(DOCS_DIR))
    print("Docs loaded:", docs) #Debugging checkpoint 

    chunks = chunk_documents(docs)
    print("Chunks returned:", chunks) #Debugging checkpoint

    if not chunks:
        raise ValueError("No text chunks created. Make sure document files contain text. ")

    embedding_model = EmbeddingModel()
    texts = [chunk["text"] for chunk in chunks]
    embeddings = embedding_model.encode_texts(texts)

    dimension = embeddings.shape[1]
    vector_store = VectorStore(dimension=dimension)
    vector_store.add(embeddings, chunks)

    return embedding_model, vector_store

def test_query(query: str):
    embedding_model, vector_store = build_pipeline()
    query_embedding = embedding_model.encode_query(query)
    results = vector_store.search(query_embedding, top_k=3)

    print(f"\nQuery: {query}\n")
    for i, result in enumerate(results, start=1):
        print(f"Result {i}:")
        print(f"Source:{result['source']}")
        print(result["text"])
        print("-" * 40)

if __name__ == "__main__":
    test_query("What should I eat after a workout?")
