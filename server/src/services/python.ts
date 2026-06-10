import { spawn } from "node:child_process";
import path from "node:path";

import { config } from "../config.js";

export const scriptPath = (name: string) => path.join(config.SCRIPTS_DIR, name);

// Run a python3 script, resolving with its stdout (rejecting on non-zero exit).
export function runPython(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", args, { cwd: config.SCRIPTS_DIR });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`python exited ${code}: ${stderr.trim()}`));
    });
  });
}
