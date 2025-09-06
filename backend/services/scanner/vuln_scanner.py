import nmap

scanner = nmap.PortScanner()

def vuln_scan(ip):
    """
    Run nmap vuln scripts on a given host.
    Returns a dictionary of vulnerabilities.
    """
    result = {
        "ip": ip,
        "vulnerabilities": []
    }

    try:
        scanner.scan(ip, arguments='--script vuln')

        for proto in scanner[ip].all_protocols():
            for port, info in scanner[ip][proto].items():
                scripts = info.get('script', {})
                if scripts:
                    for script_name, output in scripts.items():
                        result["vulnerabilities"].append({
                            "port": port,
                            "protocol": proto,
                            "script": script_name,
                            "output": output
                        })
    except Exception as e:
        result["error"] = str(e)

    return result
