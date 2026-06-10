import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  listSites,
  getSite,
  createSite,
  updateSite,
  setSiteEnabled,
  deleteSite,
} from "../db/queries/sites.js";

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const nullableXpath = z.string().nullable().optional().transform((v) => v ?? null);

const siteBodySchema = z.object({
  jmeno: z.string().min(1),
  link: z.string().min(1),
  xpath_links: nullableXpath,
  xpath_nadpis: nullableXpath,
  xpath_clanek: nullableXpath,
  xpath_datum: nullableXpath,
  xpath_uvodni_odstavec: nullableXpath,
  xpath_autor: nullableXpath,
  enabled: z.boolean().default(true),
});

const enabledBodySchema = z.object({ enabled: z.boolean() });

export async function siteRoutes(app: FastifyInstance) {
  app.get("/api/sites", async () => listSites());

  app.get("/api/sites/:id", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const site = await getSite(id);
    if (!site) return reply.code(404).send({ error: "site not found" });
    return site;
  });

  app.post("/api/sites", async (req, reply) => {
    const body = siteBodySchema.parse(req.body);
    return reply.code(201).send(await createSite(body));
  });

  app.put("/api/sites/:id", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const body = siteBodySchema.parse(req.body);
    const site = await updateSite(id, body);
    if (!site) return reply.code(404).send({ error: "site not found" });
    return site;
  });

  app.patch("/api/sites/:id/enabled", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const { enabled } = enabledBodySchema.parse(req.body);
    const site = await setSiteEnabled(id, enabled);
    if (!site) return reply.code(404).send({ error: "site not found" });
    return site;
  });

  app.delete("/api/sites/:id", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const ok = await deleteSite(id);
    if (!ok) return reply.code(404).send({ error: "site not found" });
    return reply.code(204).send();
  });
}
