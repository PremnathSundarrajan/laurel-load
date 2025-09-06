import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull().unique(),
  ipAddress: text("ip_address").notNull(),
  deviceType: text("device_type").notNull(),
  manufacturer: text("manufacturer").notNull(),
  firmware: text("firmware").notNull(),
  riskScore: integer("risk_score").notNull(),
  status: text("status").notNull(), // online, offline, warning
  lastScan: timestamp("last_scan").defaultNow(),
});

export const openPorts = pgTable("open_ports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull(),
  ports: text("ports").notNull(),
  suspicious: boolean("suspicious").notNull().default(false),
  severity: text("severity").notNull(), // low, medium, high, critical
});

export const cves = pgTable("cves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cveId: text("cve_id").notNull().unique(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  cvssScore: text("cvss_score").notNull(),
  publishedDate: timestamp("published_date").defaultNow(),
});

export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  target: text("target").notNull(),
  status: text("status").notNull(), // pending, running, completed, failed
  progress: integer("progress").notNull().default(0),
  results: text("results"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const scanSchema = z.object({
  target: z.string().min(1, "Scan target is required").regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/[0-9]{1,2})?$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Enter a valid IP address, network range, or domain"
  ),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type OpenPort = typeof openPorts.$inferSelect;
export type CVE = typeof cves.$inferSelect;
export type ScanResult = typeof scanResults.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ScanRequest = z.infer<typeof scanSchema>;
