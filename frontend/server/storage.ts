import { type User, type InsertUser, type Device, type OpenPort, type CVE, type ScanResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Device management
  getAllDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  
  // Security data
  getAllOpenPorts(): Promise<OpenPort[]>;
  getAllCVEs(): Promise<CVE[]>;
  
  // Scan management
  createScan(target: string): Promise<ScanResult>;
  updateScanProgress(id: string, progress: number): Promise<ScanResult | undefined>;
  completeScan(id: string, results: string): Promise<ScanResult | undefined>;
  getScan(id: string): Promise<ScanResult | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private devices: Map<string, Device>;
  private openPorts: Map<string, OpenPort>;
  private cves: Map<string, CVE>;
  private scans: Map<string, ScanResult>;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.openPorts = new Map();
    this.cves = new Map();
    this.scans = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Create default admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@cyberguard.com",
      password: "admin123",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Initialize devices
    const devices: Device[] = [
      {
        id: randomUUID(),
        deviceId: "solar-web",
        ipAddress: "192.168.100.10",
        deviceType: "Router - Gateway",
        manufacturer: "growmore",
        firmware: "N/A",
        riskScore: 87,
        status: "online",
        lastScan: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        deviceId: "sma-logger",
        ipAddress: "192.168.100.11",
        deviceType: "Web Server",
        manufacturer: "SMA",
        firmware: "N/A",
        riskScore: 90,
        status: "offline",
        lastScan: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        deviceId: "sungrow-modbus",
        ipAddress: "192.168.100.12",
        deviceType: "IoT Sensor",
        manufacturer: "Sungrow",
        firmware: "N/A",
        riskScore: 55,
        status: "offline",
        lastScan: new Date(Date.now() - 47* 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        deviceId: "huawei-mqtt",
        ipAddress: "192.168.100.13",
        deviceType: "IoT Sensor",
        manufacturer: "Huawei",
        firmware: "N/A",
        riskScore: 61,
        status: "offline",
        lastScan:new Date(Date.now() - 46 * 60 * 60 * 1000),
      }
    ];

    devices.forEach(device => this.devices.set(device.id, device));

    // Initialize open ports
    const openPorts: OpenPort[] = [
      {
        id: randomUUID(),
        deviceId: "solar-web",
        ports: "8080",
        suspicious: true,
        severity: "high",
      },
      {
        id: randomUUID(),
        deviceId: "sma-logger",
        ports: "9522, 23",
        suspicious: true,
        severity: "High",
      },
       {
        id: randomUUID(),
        deviceId: "sungrow-modbus",
        ports: "1502",
        suspicious: true,
        severity: "Medium",
      },
      {
        id: randomUUID(),
        deviceId: "huawei-mqtt",
        ports: "2883, 8883",
        suspicious: true,
        severity: "medium",
      },
    ];

    openPorts.forEach(port => this.openPorts.set(port.id, port));

    // Initialize CVEs
    const cves: CVE[] = [
      {
        id: randomUUID(),
        cveId: "CVE-2025-0731",
        description: "RCE via file upload (SMA Solar Inverter Web Portals)",
        severity: "high",
        cvssScore: "8.8",
        publishedDate: new Date(),
      },
      {
        id: randomUUID(),
        cveId: "CVE-2024-50691",
        description: "Improper Certificate Validation (Sungrow MQTT)",
        severity: "medium",
        cvssScore: "6.5",
        publishedDate: new Date(),
      },
      {
        id: randomUUID(),
        cveId: "CVE-2024-50684",
        description: "Weak crypto in authentication systems",
        severity: "medium",
        cvssScore: "5.9",
        publishedDate: new Date(),
      },
      {
        id: randomUUID(),
        cveId: "CVE-2019-19229",
        description: "Command Injection (Fronius Solar Inverter)",
        severity: "high",
        cvssScore: "8.1",
        publishedDate: new Date(),
      },{
        id: randomUUID(),
        cveId: "CVE-2018-12735",
        description: "CSRF (SMA Sunny WebBox Devices)",
        severity: "medium",
        cvssScore: "6.8",
        publishedDate: new Date(),
      },
    ];

    cves.forEach(cve => this.cves.set(cve.id, cve));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getAllOpenPorts(): Promise<OpenPort[]> {
    return Array.from(this.openPorts.values());
  }

  async getAllCVEs(): Promise<CVE[]> {
    return Array.from(this.cves.values());
  }

  async createScan(target: string): Promise<ScanResult> {
    const id = randomUUID();
    const scan: ScanResult = {
      id,
      target,
      status: "pending",
      progress: 0,
      results: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.scans.set(id, scan);
    return scan;
  }

  async updateScanProgress(id: string, progress: number): Promise<ScanResult | undefined> {
    const scan = this.scans.get(id);
    if (scan) {
      scan.progress = progress;
      scan.status = "running";
      this.scans.set(id, scan);
    }
    return scan;
  }

  async completeScan(id: string, results: string): Promise<ScanResult | undefined> {
    const scan = this.scans.get(id);
    if (scan) {
      scan.status = "completed";
      scan.progress = 100;
      scan.results = results;
      scan.completedAt = new Date();
      this.scans.set(id, scan);
    }
    return scan;
  }

  async getScan(id: string): Promise<ScanResult | undefined> {
    return this.scans.get(id);
  }
}

export const storage = new MemStorage();
