import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { startScrape, getJob } from "../services/scrape.js";

const jobParamSchema = z.object({ jobId: z.string().uuid() });

export async function scrapeRoutes(app: FastifyInstance) {
  // Kick off a scrape of all enabled sources; returns immediately.
  app.post("/api/scrape", async () => {
    const job = await startScrape();
    return { jobId: job.id, status: job.status };
  });

  app.get("/api/scrape/:jobId", async (req, reply) => {
    const { jobId } = jobParamSchema.parse(req.params);
    const job = getJob(jobId);
    if (!job) return reply.code(404).send({ error: "job not found" });
    return job;
  });
}
