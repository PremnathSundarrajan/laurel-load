# backend/services/scanner/version_detector.py
import requests
import subprocess
import re

def detect_version(ip: str, port: int = 80) -> dict | None:
    """
    Detect vendor, product, and version of a device.
    Returns {vendor, product, version} or None.
    """

    result = {"vendor": None, "product": None, "version": None}

    # --- 1. Try HTTP endpoints ---
    try:
        for endpoint in ["/status", "/about", "/info"]:
            url = f"http://{ip}:{port}{endpoint}"
            resp = requests.get(url, timeout=3)
            if resp.status_code == 200:
                match = re.search(r"(firmware|version)[:\s]+([\w\.\-]+)", resp.text, re.I)
                if match:
                    result["product"] = "UnknownDevice"
                    result["version"] = match.group(2)
                    return result
    except requests.RequestException:
        pass

    # --- 2. Check HTTP headers ---
    try:
        resp = requests.get(f"http://{ip}:{port}", timeout=3)
        server_header = resp.headers.get("Server")
        if server_header:
            match = re.match(r"([\w\-]+)[/ ]([\w\.\-]+)", server_header)
            if match:
                result["vendor"] = match.group(1)
                result["product"] = "Webserver"
                result["version"] = match.group(2)
                return result
    except requests.RequestException:
        pass

    # --- 3. Fallback: Nmap banner detection ---
    try:
        cmd = ["nmap", "-sV", "-p", str(port), ip]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        output = proc.stdout
        match = re.search(r"\d+/tcp\s+open\s+\w+\s+([\w\-]+)[^\d]*(\d[\w\.\-]+)", output)
        if match:
            result["vendor"] = match.group(1)
            result["product"] = "Service"
            result["version"] = match.group(2)
            return result
    except Exception:
        pass

    return None
