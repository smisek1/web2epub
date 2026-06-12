import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { listArticles, listAuthors, getArticle, trashArticles, removeLinks } from "../db/queries/articles.js";
import { runPython, scriptPath } from "../services/python.js";

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

// "autor" may arrive as ?autor=A&autor=B — normalise to string[] (no comma
// splitting: author names may legitimately contain commas).
const toStrArray = (v: string | string[] | undefined): string[] | undefined => {
  if (v === undefined) return undefined;
  const arr = (Array.isArray(v) ? v : [v]).filter((s) => s.length > 0);
  return arr.length ? arr : undefined;
};

const listQuerySchema = z.object({
  web: z.union([z.string(), z.array(z.string())]).optional().transform(toIntArray),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  autor: z.union([z.string(), z.array(z.string())]).optional().transform(toStrArray),
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

  // Distinct authors for the filter dropdown (static route wins over /:id).
  // Optional ?web=… scopes authors to the selected sites so the two filters chain.
  app.get("/api/articles/authors", async (req) => {
    const { web } = z
      .object({ web: z.union([z.string(), z.array(z.string())]).optional().transform(toIntArray) })
      .parse(req.query);
    return listAuthors(web ?? null);
  });

  app.get("/api/articles/:id", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    const article = await getArticle(id);
    if (!article) return reply.code(404).send({ error: "article not found" });
    return article;
  });

  // #33: fetch an arbitrary URL and store it as an 'ad-hoc' article via
  // generic extraction (trafilatura) — no per-site XPath config needed.
  app.post("/api/articles/from-url", async (req, reply) => {
    const { url } = z.object({ url: z.string().url() }).parse(req.body);
    const { stdout } = await runPython([scriptPath("fetch_url_cli.py"), "--url", url]);
    const result = JSON.parse(stdout.trim()) as
      | { id: number; nadpis: string; autor: string; datum: string | null }
      | { error: string };
    if ("error" in result) return reply.code(422).send(result);
    return result;
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
