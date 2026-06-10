import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";

import { config } from "./config.js";
import { articleRoutes } from "./routes/articles.js";
import { bookRoutes } from "./routes/books.js";
import { maintenanceRoutes } from "./routes/maintenance.js";
import { scrapeRoutes } from "./routes/scrape.js";
import { siteRoutes } from "./routes/sites.js";
import { xpathRoutes } from "./routes/xpath.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Turn validation errors into clean 400s.
app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) {
    return reply.code(400).send({ error: "validation failed", detail: err.flatten() });
  }
  app.log.error(err);
  const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
  const message = err instanceof Error ? err.message : "internal error";
  return reply.code(statusCode).send({ error: message });
});

app.get("/api/health", async () => ({ status: "ok" }));

await app.register(articleRoutes);
await app.register(bookRoutes);
await app.register(siteRoutes);
await app.register(xpathRoutes);
await app.register(scrapeRoutes);
await app.register(maintenanceRoutes);

try {
  await app.listen({ host: "0.0.0.0", port: config.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
