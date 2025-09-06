import jwt
from datetime import datetime, timedelta, timezone
from config import JWT_SECRET, JWT_ALGO


def create_token(payload: dict, expires_in: int = 3600) -> str:
    """
    Create a JWT token with an expiration time (default: 1 hour).
    Uses timezone-aware datetime to avoid utcnow deprecation.
    """
    exp = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    payload.update({"exp": exp})
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return token


def verify_token(token: str) -> dict | None:
    """
    Verify a JWT token and return its decoded payload if valid.
    Returns None if expired or invalid.
    """
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return decoded
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token
