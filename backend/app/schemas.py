from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    top_k: int = 3

class QueryResult(BaseModel):
    source: str
    text: str
    distance: float

class QueryResponse(BaseModel):
    query: str
    answer: str
    results: list[QueryResult]

