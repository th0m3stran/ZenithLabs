from sentence_transformers import sentence_transformer, SentenceTransformer
import numpy as np

class EmbeddingModel:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def encode_texts(self, texts: list[str]) -> np.ndarray:
        embeddings = self.model.encode(texts, convert_to_numpy=True) # Each sentence -> Vector
        return embeddings.astype("float32") #FAIIS retrieval conversion

    def encode_query(self, query: str) -> np.ndarray:
        embeddings = self.model.encode([query], convert_to_numpy=True)
        return embeddings.astype("float32")
