import { Pool } from "pg";

let pool;

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Create a .env.local file first.");
  }

  const config = {
    connectionString,
  };

  if (process.env.POSTGRES_SSL === "true") {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  return new Pool(config);
}

export function getPool() {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}
