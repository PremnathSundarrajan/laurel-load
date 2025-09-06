from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user
from utils.jwt_utils import verify_token
from routes.middlewares.auth_middleware import require_auth

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ---- User Signup ----
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    return jsonify(register_user(
        data.get("username"),
        data.get("email"),
        data.get("password")
    ))

# ---- User Login ----
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    return jsonify(login_user(
        data.get("email"),
        data.get("password")
    ))

# ---- Get Current User ----
@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    return jsonify({"user": request.user}), 200
