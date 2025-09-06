# backend/services/scanner/port_scanner.py
import nmap

scanner = nmap.PortScanner()

# -------------------------------
# Core helper functions
# -------------------------------

def discover_hosts(subnet: str) -> list:
    """Discover alive hosts using ping sweep (-sn)."""
    scanner.scan(hosts=subnet, arguments='-sn')
    return [host for host in scanner.all_hosts() if scanner[host].state() == "up"]


def is_iot_device(ip: str) -> bool:
    """
    Heuristic to check if a device looks like IoT/DER hardware.
    - MAC vendor check
    - Typical DER/IoT ports (23, 80, 443, 502, 1883)
    """
    try:
        mac = scanner[ip]['addresses'].get('mac', '')
        vendor = scanner[ip]['vendor'].get(mac, '') if mac else ''
        iot_vendors = ["Huawei", "Sungrow", "Growatt", "SolarEdge", "Siemens"]
        if any(v in vendor for v in iot_vendors):
            return True

        # Check known IoT/DER ports
        common_ports = [23, 80, 443, 502, 1883]
        scanner.scan(ip, arguments='-p ' + ",".join(map(str, common_ports)))
        for proto in scanner[ip].all_protocols():
            for port, info in scanner[ip][proto].items():
                if info['state'] == 'open':
                    return True
    except Exception:
        return False

    return False


def scan_ports(ip: str, port_range: str = "1-1000") -> list:
    """Scan open ports + detect services (-sV)."""
    scanner.scan(ip, port_range, arguments='-sV')
    open_ports = []
    for proto in scanner[ip].all_protocols():
        for port, info in scanner[ip][proto].items():
            if info['state'] == 'open':
                open_ports.append({
                    "port": port,
                    "protocol": proto,
                    "service": info.get('name', ''),
                    "product": info.get('product', ''),
                    "version": info.get('version', '')
                })
    return open_ports


def os_fingerprint(ip: str) -> list:
    """Run OS detection (-O)."""
    try:
        scanner.scan(ip, arguments='-O')
        return scanner[ip].get('osmatch', [])
    except Exception:
        return []
