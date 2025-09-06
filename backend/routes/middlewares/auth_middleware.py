#auth_middleware.py
from functools import wraps
from flask import request, jsonify
from utils.jwt_utils import verify_token

def require_auth(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "Token expired or invalid"}), 401

        # Attach user info to request context
        request.user = payload
        return f(*args, **kwargs)
    return decorated
