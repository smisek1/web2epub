import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { purge } from "../db/queries/maintenance.js";

const purgeBodySchema = z.object({ confirm: z.literal(true) });

export async function maintenanceRoutes(app: FastifyInstance) {
  app.post("/api/maintenance/purge", async (req) => {
    purgeBodySchema.parse(req.body);
    return purge();
  });
}
