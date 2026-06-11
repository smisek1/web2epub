import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

import { pool } from "../db/pool.js";
import { config } from "../config.js";
import { scriptPath } from "./python.js";

export interface ScrapeJob {
  id: string;
  status: "running" | "done" | "failed";
  startedAt: string;
  finishedAt?: string;
  articlesBefore: number;
  articlesAdded?: number;
  error?: string;
}

// In-memory job registry. Fine for a single-instance personal tool.
const jobs = new Map<string, ScrapeJob>();

// Only one scrape may run at a time; a second request gets the running job back.
let runningJob: ScrapeJob | null = null;

async function countArticles(): Promise<number> {
  const res = await pool.query<{ c: number }>("SELECT count(*)::int AS c FROM clanky");
  return res.rows[0]?.c ?? 0;
}

// Start a background scrape of all enabled sources; return the job id immediately.
export async function startScrape(): Promise<ScrapeJob> {
  if (runningJob && runningJob.status === "running") return runningJob;

  const before = await countArticles();
  const job: ScrapeJob = {
    id: randomUUID(),
    status: "running",
    startedAt: new Date().toISOString(),
    articlesBefore: before,
  };
  jobs.set(job.id, job);
  runningJob = job;

  const child = spawn("python3", [scriptPath("scrape_cli.py")], { cwd: config.SCRIPTS_DIR });
  let stderr = "";
  child.stderr.on("data", (d) => (stderr += d.toString()));

  child.on("close", async (code) => {
    job.finishedAt = new Date().toISOString();
    if (code === 0) {
      const after = await countArticles();
      job.articlesAdded = after - job.articlesBefore;
      job.status = "done";
    } else {
      job.status = "failed";
      job.error = stderr.trim().slice(-500);
    }
    runningJob = null;
  });
  child.on("error", (err) => {
    job.status = "failed";
    job.error = err.message;
    job.finishedAt = new Date().toISOString();
    runningJob = null;
  });

  return job;
}

export function getJob(id: string): ScrapeJob | undefined {
  return jobs.get(id);
}
