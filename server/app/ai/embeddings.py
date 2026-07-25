import numpy as np
from typing import List

_model = None

def get_model():
    """Lazily load the Sentence Transformers embedding model on first call."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print("Initializing SentenceTransformer 'all-MiniLM-L6-v2'...")
        # Will fetch the model (~90MB) from Hugging Face on first execution and cache it locally
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def embed_text(text: str) -> List[float]:
    """Generate a 384-dimensional dense vector representing the input text."""
    if not text.strip():
        return [0.0] * 384
    model = get_model()
    embeddings = model.encode([text])
    return embeddings[0].tolist()

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate the cosine similarity between two numeric vectors."""
    arr_a = np.array(a)
    arr_b = np.array(b)
    dot_val = np.dot(arr_a, arr_b)
    norm_a = np.linalg.norm(arr_a)
    norm_b = np.linalg.norm(arr_b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(dot_val / (norm_a * norm_b))

def find_best_semantic_matches(query: str, items: List[str], threshold: float = 0.5) -> List[tuple]:
    """
    Search list of items and return a list of (item, similarity_score) 
    filtered by a similarity threshold, sorted by score descending.
    """
    if not items:
        return []
        
    query_vector = embed_text(query)
    matches = []
    
    for item in items:
        item_vector = embed_text(item)
        similarity = cosine_similarity(query_vector, item_vector)
        if similarity >= threshold:
            matches.append((item, similarity))
            
    return sorted(matches, key=lambda x: x[1], reverse=True)
