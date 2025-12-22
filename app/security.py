from datetime import datetime, timedelta, timezone
import hashlib

import bcrypt
from jose import jwt

from app.core.config import settings


ALGORITHM = "HS256"


def _pw_bytes(password: str) -> bytes:
    """
    bcrypt only uses the first 72 bytes. For longer passwords we pre-hash to
    a fixed-length digest to avoid silent truncation.
    """

    raw = password.encode("utf-8")
    if len(raw) <= 72:
        return raw
    return hashlib.sha256(raw).digest()


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(_pw_bytes(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_pw_bytes(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(*, subject: str, minutes: int | None = None) -> str:
    expire_minutes = minutes if minutes is not None else settings.access_token_exp_minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])

