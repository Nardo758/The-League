import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.core.ai_config import ai_settings
from app.core.limiter import limiter
from app.core.logging import log_ai_request
from app.db import get_session
from app.deps import get_current_user
from app.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=10000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=20)
    max_tokens: int = Field(default=1024, ge=1, le=4096)


class ChatResponse(BaseModel):
    message: str
    model: str
    usage: dict[str, int] | None = None


class AIDataPolicy(BaseModel):
    policy_version: str = "1.0"
    data_sent: list[str]
    data_never_sent: list[str]
    retention: str
    third_party: str


def get_openai_client() -> Any:
    if not ai_settings.openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Please set OPENAI_API_KEY."
        )
    try:
        from openai import OpenAI
        return OpenAI(api_key=ai_settings.openai_api_key)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI client not available"
        )


@router.get("/policy", response_model=AIDataPolicy)
def get_ai_data_policy() -> AIDataPolicy:
    return AIDataPolicy(
        policy_version="1.0",
        data_sent=[
            "User-provided message content",
            "League/team/game public names (if referenced)",
            "Anonymized statistics"
        ],
        data_never_sent=[
            "User email addresses",
            "Passwords or authentication tokens",
            "Private user profile data",
            "Payment information"
        ],
        retention="AI requests are logged for 30 days for debugging and audit purposes. Message content is not stored.",
        third_party="Requests are processed by OpenAI. See OpenAI's privacy policy for their data handling."
    )


@router.post("/chat", response_model=ChatResponse)
@limiter.limit(f"{ai_settings.ai_requests_per_hour}/hour")
def chat_completion(
    request: Request,
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> ChatResponse:
    client = get_openai_client()

    messages = [{"role": m.role, "content": m.content} for m in payload.messages]

    try:
        response = client.chat.completions.create(
            model=ai_settings.openai_model,
            messages=messages,
            max_tokens=min(payload.max_tokens, ai_settings.ai_max_tokens)
        )

        result = response.choices[0].message.content or ""
        usage = None
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            log_ai_request(
                user_id=current_user.id,
                endpoint="/ai/chat",
                model=ai_settings.openai_model,
                input_tokens=response.usage.prompt_tokens,
                output_tokens=response.usage.completion_tokens,
                status="success"
            )
        else:
            log_ai_request(
                user_id=current_user.id,
                endpoint="/ai/chat",
                model=ai_settings.openai_model,
                status="success"
            )

        return ChatResponse(
            message=result,
            model=ai_settings.openai_model,
            usage=usage
        )

    except Exception as e:
        log_ai_request(
            user_id=current_user.id,
            endpoint="/ai/chat",
            model=ai_settings.openai_model,
            status="error",
            error=str(e)
        )
        logger.exception("AI chat completion failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service temporarily unavailable"
        )


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000)
    max_length: int = Field(default=200, ge=50, le=500)


class SummarizeResponse(BaseModel):
    summary: str
    model: str


@router.post("/summarize", response_model=SummarizeResponse)
@limiter.limit(f"{ai_settings.ai_requests_per_hour}/hour")
def summarize_text(
    request: Request,
    payload: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> SummarizeResponse:
    client = get_openai_client()

    try:
        response = client.chat.completions.create(
            model=ai_settings.openai_model,
            messages=[
                {"role": "system", "content": f"Summarize the following text in {payload.max_length} words or less. Be concise and capture the key points."},
                {"role": "user", "content": payload.text}
            ],
            max_tokens=ai_settings.ai_max_tokens
        )

        result = response.choices[0].message.content or ""

        log_ai_request(
            user_id=current_user.id,
            endpoint="/ai/summarize",
            model=ai_settings.openai_model,
            input_tokens=response.usage.prompt_tokens if response.usage else None,
            output_tokens=response.usage.completion_tokens if response.usage else None,
            status="success"
        )

        return SummarizeResponse(summary=result, model=ai_settings.openai_model)

    except Exception as e:
        log_ai_request(
            user_id=current_user.id,
            endpoint="/ai/summarize",
            model=ai_settings.openai_model,
            status="error",
            error=str(e)
        )
        logger.exception("AI summarize failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service temporarily unavailable"
        )
