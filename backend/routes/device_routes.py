from flask import Blueprint, request, jsonify
from services.device_service import add_device, get_devices, delete_device, update_device
from routes.middlewares.auth_middleware import require_auth

device_bp = Blueprint("devices", __name__, url_prefix="/api/devices")

# ---- Add Device ----
@device_bp.route("/", methods=["POST"])
@require_auth
def create_device():
    data = request.get_json()
    name = data.get("name")
    ip = data.get("ip")
    device_type = data.get("type")

    if not name or not ip or not device_type:
        return jsonify({"error": "Missing required fields"}), 400

    device_id = add_device(request.user["user_id"], name, ip, device_type)
    return jsonify({"message": "Device added", "device_id": device_id}), 201

# ---- Get Devices ----
@device_bp.route("/", methods=["GET"])
@require_auth
def list_devices():
    devices = get_devices(request.user["user_id"])
    return jsonify({"devices": devices}), 200

# ---- Delete Device ----
@device_bp.route("/<device_id>", methods=["DELETE"])
@require_auth
def remove_device(device_id):
    if delete_device(request.user["user_id"], device_id):
        return jsonify({"message": "Device deleted"}), 200
    return jsonify({"error": "Device not found or unauthorized"}), 404

# ---- Update Device ----
@device_bp.route("/<device_id>", methods=["PUT"])
@require_auth
def edit_device(device_id):
    data = request.get_json()
    if update_device(request.user["user_id"], device_id, data):
        return jsonify({"message": "Device updated"}), 200
    return jsonify({"error": "Device not found or unauthorized"}), 404
