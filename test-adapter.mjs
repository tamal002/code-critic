import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const { PrismaClient } = await import("./lib/generated/prisma/client/client.js");
const prisma = new PrismaClient({ adapter });

try {
  const r1 = await prisma.user.findFirst();
  console.log("user findFirst:", r1 ? "found" : "no users");
  const r2 = await prisma.session.findFirst();
  console.log("session findFirst:", r2 ? "found" : "no sessions");
} catch (e) {
  console.error("Error type:", e.constructor.name);
  console.error("Message:", e.message?.substring(0, 500));
  if (e.code) console.error("Code:", e.code);
  if (e.meta) console.error("Meta:", JSON.stringify(e.meta));
}

await prisma.$disconnect();
await pool.end();
