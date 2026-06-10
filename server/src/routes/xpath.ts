import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { runPython, scriptPath } from "../services/python.js";

const bodySchema = z.object({
  url: z.string().url(),
  xpath_links: z.string().optional(),
  xpath_nadpis: z.string().optional(),
  xpath_clanek: z.string().optional(),
  xpath_datum: z.string().optional(),
  xpath_uvodni_odstavec: z.string().optional(),
  xpath_autor: z.string().optional(),
});

// Map body keys to the CLI's --xpath-* flags.
const FLAGS: Record<string, string> = {
  xpath_links: "--xpath-links",
  xpath_nadpis: "--xpath-nadpis",
  xpath_clanek: "--xpath-clanek",
  xpath_datum: "--xpath-datum",
  xpath_uvodni_odstavec: "--xpath-uvodni-odstavec",
  xpath_autor: "--xpath-autor",
};

export async function xpathRoutes(app: FastifyInstance) {
  app.post("/api/xpath/test", async (req) => {
    const body = bodySchema.parse(req.body);
    const args = [scriptPath("xpath_test_cli.py"), "--url", body.url];
    for (const [key, flag] of Object.entries(FLAGS)) {
      const value = (body as Record<string, string | undefined>)[key];
      if (value) args.push(flag, value);
    }
    const { stdout } = await runPython(args);
    return JSON.parse(stdout.trim());
  });
}
