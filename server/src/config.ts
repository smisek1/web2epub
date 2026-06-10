import { z } from "zod";

// Validate the environment once at startup; fail fast if something is missing.
const schema = z.object({
  DB_HOST: z.string().default("postgres"),
  DB_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string().default("conversion"),
  PORT: z.coerce.number().default(3000),
  // Where the Python CLIs (epub/xpath/scrape) are mounted in this container.
  SCRIPTS_DIR: z.string().default("/app/scripts"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
