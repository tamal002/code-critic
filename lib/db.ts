import dns from "node:dns";

// Force IPv4 resolution specifically for Neon DB hosts across all Wi-Fi networks and runtimes
dns.setDefaultResultOrder?.("ipv4first");

const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, ...args: any[]) {
  if (typeof hostname === "string" && hostname.includes("neon.tech")) {
    if (typeof args[0] === "function") {
      return (originalLookup as any)(hostname, { family: 4 }, args[0]);
    } else if (typeof args[0] === "object" && args[0] !== null) {
      return (originalLookup as any)(hostname, { ...args[0], family: 4 }, args[1]);
    }
  }
  return (originalLookup as any)(hostname, ...args);
} as any;

import { PrismaClient } from "./generated/prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;