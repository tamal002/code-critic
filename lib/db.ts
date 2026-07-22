import { PrismaClient } from "./generated/prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";


const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma;