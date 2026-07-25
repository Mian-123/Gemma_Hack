# Sentence Transformers and FAISS index search placeholder
class EmbeddingsEngine:
    def __init__(self):
        pass

    def get_embedding(self, text: str) -> list:
        return [0.0] * 384  # Return a mock 384 dimensional vector

    def search_similar(self, query_text: str, top_k: int = 5) -> list:
        return []
