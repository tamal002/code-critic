import { PrismaClient } from "./generated/prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dns from "node:dns";

// Force IPv4-first resolution for Neon hosts to prevent connection timeouts
// caused by local/ISP network environment issues with IPv6
const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, options: any, callback: any) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (hostname.includes("neon.tech")) {
    options = { ...options, family: 4 };
  }
  return originalLookup(hostname, options, callback);
} as any;

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma;