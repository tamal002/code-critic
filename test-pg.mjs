import pg from "pg";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
try {
  const r = await pool.query("SELECT 1 as ok");
  console.log("Connected! Result:", r.rows[0].ok);
  await pool.end();
  process.exit(0);
} catch (e) {
  console.error("Connection failed:", e.constructor.name, e.message?.substring(0, 300));
  await pool.end();
  process.exit(1);
}
