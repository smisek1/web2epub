import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";

import { runPython, scriptPath } from "./python.js";

export interface GeneratedEpub {
  path: string;
  filename: string;
}

// Generate an EPUB for a book id into a temp file. Caller streams it and deletes it.
export async function generateEpub(bookId: number): Promise<GeneratedEpub> {
  const out = path.join(os.tmpdir(), `${randomUUID()}.epub`);
  const { stdout } = await runPython([
    scriptPath("epub_cli.py"),
    "--book-id",
    String(bookId),
    "--out",
    out,
  ]);
  const parsed = JSON.parse(stdout.trim()) as GeneratedEpub;
  return parsed;
}
