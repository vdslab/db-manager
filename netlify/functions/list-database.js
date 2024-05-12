import pg from "pg";

const pool = new pg.Pool();

export async function handler() {
  const result = await pool.query("SELECT * FROM pg_database");
  return {
    body: JSON.stringify(result.rows),
    statusCode: 200,
  };
}
