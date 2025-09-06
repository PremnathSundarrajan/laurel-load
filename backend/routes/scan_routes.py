# routes/scan_routes.py
from flask import Blueprint, request, jsonify
from services.scan_service import (
    run_discovery,
    run_port_scan_all,
    run_version_and_cve_all,
    run_os_fingerprint_all
)
from Schemas.scan_model import ScanResult
from routes.middlewares.auth_middleware import require_auth

scan_bp = Blueprint("scan", __name__, url_prefix="/api/scan")

# Discover: GET automatically scan local subnet, POST manual ip/subnet
@scan_bp.route("/discover", methods=["GET", "POST"])
@require_auth
def discover():
    if request.method == "GET":
        # Try to get IP from query param; else default
        ip = request.args.get("ip")
        subnet = f"{ip}/24" if ip else "192.168.1.0/24"
    else:
        data = request.get_json(silent=True) or {}
        ip = data.get("ip")
        subnet = f"{ip}/24" if ip else "192.168.1.0/24"

    result = run_discovery(subnet)

    # Save
    ScanResult.save_result("discover", {"subnet": subnet, "result": result})
    return jsonify(result), 200


# Ports: GET - scan ports for all discovered IoT hosts (from in-memory/cache)
@scan_bp.route("/ports", methods=["GET"])
@require_auth
def ports():
    result = run_port_scan_all()
    ScanResult.save_result("ports", {"result": result})
    return jsonify(result), 200


# Version + CVE pipeline: GET - runs version detection, vuln scan and CVE lookup for all IoT hosts
@scan_bp.route("/version", methods=["GET"])
@require_auth
def version_and_cve():
    result = run_version_and_cve_all()
    ScanResult.save_result("version_cve", {"result": result})
    return jsonify(result), 200


# OS fingerprinting: GET - run OS fingerprinting for all IoT hosts
@scan_bp.route("/os", methods=["GET"])
@require_auth
def os_scan():
    result = run_os_fingerprint_all()
    ScanResult.save_result("os", {"result": result})
    return jsonify(result), 200
