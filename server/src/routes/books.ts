import fs from "node:fs";

import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { createBook, listBooks, bookExists } from "../db/queries/books.js";
import { generateEpub } from "../services/epub.js";

const idsBodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  jmeno: z.string().trim().min(1).max(200).optional(),
});
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export async function bookRoutes(app: FastifyInstance) {
  app.post("/api/books", async (req) => {
    const { ids, jmeno } = idsBodySchema.parse(req.body);
    return createBook(ids, jmeno);
  });

  app.get("/api/books", async () => {
    return listBooks();
  });

  app.get("/api/books/:id/download", async (req, reply) => {
    const { id } = idParamSchema.parse(req.params);
    if (!(await bookExists(id))) return reply.code(404).send({ error: "book not found" });

    const epub = await generateEpub(id);
    const stream = fs.createReadStream(epub.path);
    // Delete the temp file once it has been fully sent.
    stream.on("close", () => fs.unlink(epub.path, () => {}));

    // Book names may contain diacritics, which are illegal in raw header
    // values — send an ASCII fallback plus the RFC 5987 encoded full name.
    const ascii = epub.filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
    reply.header("Content-Type", "application/epub+zip");
    reply.header(
      "Content-Disposition",
      `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(epub.filename)}`,
    );
    return reply.send(stream);
  });
}
