# Laurel — A Solar Sentinel

Laurel is a real-time security monitoring system for IoT devices and Distributed Energy Resources (DERs) like solar inverters.  
It performs network discovery, port scanning, vulnerability analysis, and CVE fetching. It also includes full authentication for secure access.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features

- Discover alive devices on the local network or given subnet
- Identify IoT/DER devices using heuristics (ports, MAC vendors)
- Port scanning and service detection
- OS fingerprinting
- Vulnerability scanning with Nmap scripts
- CVE fetching from NVD database
- JWT-based user authentication
- MongoDB storage for users, devices, scans, and CVEs

---

## Tech Stack

- **Backend**: Python, Flask
- **Database**: MongoDB
- **Network Scanning**: Nmap (`python-nmap`)
- **Authentication**: JWT
- **Front-end**: HTML/CSS/JS (for dashboards)
- **CVE API**: NVD REST API

---

## Setup Instructions

1. **Clone repository**
```bash
git clone <repo_url>
cd Laurel

    Create virtual environment

python -m venv env
source env/bin/activate   # Linux/Mac
env\Scripts\activate      # Windows

    Install dependencies

pip install -r backend/requirements.txt

    MongoDB setup

    Install MongoDB locally or use MongoDB Atlas.

    Create a .env file in backend/:

MONGO_URI=mongodb://localhost:27017/laurel
JWT_SECRET=your_secret_key
JWT_ALGO=HS256
DEBUG=True

    Run Flask backend

cd backend
python -m app
