import faiss
import numpy as np

class VectorStore:
    def __init__(self, dimension: int):
        self.index = faiss.IndexFlatL2(dimension)
        self.metadata: list[dict] = []

    #Stores embeddings in FAISS and corresponding metadata in list
    def add(self, embeddings: np.ndarray, metadata: list[dict]) -> None:
        self.index.add(embeddings)
        self.metadata.extend(metadata)

    #Finds most similar chunks to query
    def search(self, query_embedding: np.ndarray, top_k: int = 3) -> list[dict]:
        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx == -1:
                continue
            item = self.metadata[idx].copy()
            item["distance"] = float(dist)
            results.append(item)

        return results
