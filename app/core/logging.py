import logging
import sys
import uuid
from contextvars import ContextVar
from datetime import datetime
from typing import Any

from pythonjsonlogger.json import JsonFormatter

request_id_var: ContextVar[str] = ContextVar("request_id", default="")


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


def get_json_formatter() -> JsonFormatter:
    return JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(request_id)s %(message)s",
        rename_fields={"asctime": "timestamp", "levelname": "level"},
        datefmt="%Y-%m-%dT%H:%M:%S%z"
    )


def setup_logging(log_level: str = "INFO") -> None:
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(get_json_formatter())
    console_handler.addFilter(RequestIdFilter())
    root_logger.addHandler(console_handler)

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def generate_request_id() -> str:
    return str(uuid.uuid4())[:8]


def log_ai_request(
    user_id: int | None,
    endpoint: str,
    model: str,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    status: str = "success",
    error: str | None = None,
    extra: dict[str, Any] | None = None
) -> None:
    logger = logging.getLogger("ai_audit")
    log_data = {
        "event": "ai_request",
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "endpoint": endpoint,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "status": status,
        "request_id": request_id_var.get(),
    }
    if error:
        log_data["error"] = error
    if extra:
        log_data.update(extra)

    if status == "success":
        logger.info("AI request completed", extra=log_data)
    else:
        logger.warning("AI request failed", extra=log_data)
