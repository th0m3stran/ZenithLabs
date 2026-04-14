from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ingestion import load_documents
from app.chunking import chunk_documents
from app.embeddings import EmbeddingModel
from app.retrieval import VectorStore
from app.generator import generate_response
from app.schemas import QueryResponse, QueryRequest

app = FastAPI(title="MyTrainer.AI API")

#Allow frontend requests for later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def build_pipeline():
    BASE_DIR = Path(__file__).resolve().parent.parent
    DOCS_DIR = BASE_DIR / "data" / "documents"

    docs = load_documents(str(DOCS_DIR))

    chunks = chunk_documents(docs)

    if not chunks:
        raise ValueError("No text chunks created. Make sure document files contain text. ")

    embedding_model = EmbeddingModel()
    texts = [chunk["text"] for chunk in chunks]
    embeddings = embedding_model.encode_texts(texts)

    dimension = embeddings.shape[1]
    vector_store = VectorStore(dimension=dimension)
    vector_store.add(embeddings, chunks)

    return embedding_model, vector_store

# Build once when app starts
embedding_model, vector_store = build_pipeline()


@app.get("/")
def root():
    return {"message": "MyTrainer.AI API is running"}

@app.post("/query", response_model=QueryResponse)
def query_docs(request: QueryRequest):
    query_embedding = embedding_model.encode_query(request.query)
    results = vector_store.search(query_embedding, top_k=request.top_k)

    contexts = [result["text"] for result in results]
    answer = generate_response(request.query, contexts)

    return QueryResponse(
        query=request.query,
        answer=answer,
    )

