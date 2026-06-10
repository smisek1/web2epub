import pg from "pg";

import { config } from "../config.js";

// Single shared connection pool for the whole API.
export const pool = new pg.Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
});
