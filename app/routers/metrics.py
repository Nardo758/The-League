from fastapi import APIRouter, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

router = APIRouter(tags=["metrics"])

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"]
)

AI_REQUEST_COUNT = Counter(
    "ai_requests_total",
    "Total AI API requests",
    ["endpoint", "status"]
)

AI_TOKEN_COUNT = Counter(
    "ai_tokens_total",
    "Total AI tokens used",
    ["type"]
)


@router.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
