import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, scanSchema } from "@shared/schema";

// Extend Express Session type to include custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.email !== email || user.password !== password || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check authentication status
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  });

  // Get dashboard data
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    const devices = await storage.getAllDevices();
    const openPorts = await storage.getAllOpenPorts();
    const cves = await storage.getAllCVEs();
    
    const criticalCVEs = cves.filter(cve => cve.severity === "critical");
    
    res.json({
      deviceCount: devices.length,
      openPortsCount: openPorts.length,
      criticalCVECount: criticalCVEs.length,
      securityItemsCount: devices.length + openPorts.length + criticalCVEs.length,
    });
  });

  // Get devices
  app.get("/api/devices", requireAuth, async (req, res) => {
    const devices = await storage.getAllDevices();
    res.json({ devices });
  });

  // Get open ports
  app.get("/api/open-ports", requireAuth, async (req, res) => {
    const openPorts = await storage.getAllOpenPorts();
    res.json({ openPorts });
  });

  // Get CVEs
  app.get("/api/cves", requireAuth, async (req, res) => {
    const cves = await storage.getAllCVEs();
    res.json({ cves });
  });

  // Get users (admin only)
  app.get("/api/users", requireAuth, async (req, res) => {
    const currentUser = await storage.getUser(req.session.userId);
    if (currentUser?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const users = await storage.getAllUsers();
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    }));
    
    res.json({ users: sanitizedUsers });
  });

  // Start scan
  app.post("/api/scan", requireAuth, async (req, res) => {
    try {
      const { target } = scanSchema.parse(req.body);
      
      const scan = await storage.createScan(target);
      
      // Simulate scan progress
      setTimeout(async () => {
        for (let progress = 10; progress <= 100; progress += 10) {
          await storage.updateScanProgress(scan.id, progress);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await storage.completeScan(scan.id, `Scan completed for ${target}. No critical vulnerabilities found.`);
      }, 1000);
      
      res.json({ scan });
    } catch (error) {
      res.status(400).json({ message: "Invalid scan target" });
    }
  });

  // Get scan status
  app.get("/api/scan/:id", requireAuth, async (req, res) => {
    const scan = await storage.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }
    
    res.json({ scan });
  });

  const httpServer = createServer(app);
  return httpServer;
}
