import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { listArticles, getArticle, trashArticles, removeLinks } from "../db/queries/articles.js";

// "web" may arrive as ?web=2&web=7 or ?web=2,7 — normalise to int[].
const toIntArray = (v: string | string[] | undefined): number[] | undefined => {
  if (v === undefined) return undefined;
  const arr = Array.isArray(v) ? v : [v];
  const nums = arr
    .flatMap((s) => s.split(","))
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
  return nums.length ? nums : undefined;
};

const listQuerySchema = z.object({
  web: z.union([z.string(), z.array(z.string())]).optional().transform(toIntArray),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  autor: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(["datum", "nadpis"]).default("datum"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
const idsBodySchema = z.object({ ids: z.array(z.number().int().positive()).min(1) });

export async function articleRoutes(app: FastifyInstance) {
  app.get("/api/articles", async (req) => {
    const q = listQuerySchema.parse(req.query);
    return listArticles({
      web: q.web ?? null,
      dateFrom: q.dateFrom ?? null,
      dateTo: q.dateTo ?? null,
      autor: q.autor ?? null,
      q: q.q ?? null,
      page: q.page,
      pageSize: q.pageSize,
      sortBy: q.sortBy,
      sortDir: q.sortDir,
    });
  });

  app.get("/api/articles/:id", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const article = await getArticle(id);
    if (!article) return reply.code(404).send({ error: "article not found" });
    return article;
  });

  app.post("/api/articles/trash", async (req) => {
    const { ids } = idsBodySchema.parse(req.body);
    const moved = await trashArticles(ids);
    return { moved };
  });

  app.delete("/api/articles/:id/links", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const clanek = await removeLinks(id);
    if (clanek === null) return reply.code(404).send({ error: "article not found" });
    return { id, clanek };
  });
}
