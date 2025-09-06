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
        deviceId: "RTR-001",
        ipAddress: "192.168.1.1",
        deviceType: "Router - Gateway",
        manufacturer: "Cisco",
        firmware: "IOS 15.9.3",
        riskScore: 87,
        status: "online",
        lastScan: new Date(Date.now() - 13 * 60 * 1000),
      },
      {
        id: randomUUID(),
        deviceId: "SRV-002",
        ipAddress: "192.168.1.50",
        deviceType: "Web Server",
        manufacturer: "Dell",
        firmware: "Ubuntu 22.04",
        riskScore: 53,
        status: "warning",
        lastScan: new Date(Date.now() - 26 * 60 * 1000),
      },
      {
        id: randomUUID(),
        deviceId: "IOT-003",
        ipAddress: "192.168.1.250",
        deviceType: "IoT Sensor",
        manufacturer: "Raspberry Pi",
        firmware: "Raspbian 11",
        riskScore: 21,
        status: "online",
        lastScan: new Date(Date.now() - 60 * 60 * 1000),
      },
    ];

    devices.forEach(device => this.devices.set(device.id, device));

    // Initialize open ports
    const openPorts: OpenPort[] = [
      {
        id: randomUUID(),
        deviceId: "DEV-001",
        ports: "22, 80, 443, 3389",
        suspicious: true,
        severity: "high",
      },
      {
        id: randomUUID(),
        deviceId: "DEV-002",
        ports: "80, 443",
        suspicious: false,
        severity: "low",
      },
    ];

    openPorts.forEach(port => this.openPorts.set(port.id, port));

    // Initialize CVEs
    const cves: CVE[] = [
      {
        id: randomUUID(),
        cveId: "CVE-2024-0001",
        description: "Remote code execution in Apache server",
        severity: "critical",
        cvssScore: "9.8",
        publishedDate: new Date(),
      },
      {
        id: randomUUID(),
        cveId: "CVE-2024-0002",
        description: "SQL injection vulnerability in MySQL",
        severity: "high",
        cvssScore: "8.5",
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
