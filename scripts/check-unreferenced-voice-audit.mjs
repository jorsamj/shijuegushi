import { spawnSync } from "node:child_process";

const result = spawnSync("node", ["scripts/audit-unreferenced-voices.mjs", "--check"], {
  encoding: "utf8",
  shell: false,
});

if (result.status !== 0) {
  console.error(result.stdout || "");
  console.error(result.stderr || "");
  process.exit(result.status || 1);
}

process.stdout.write(result.stdout);
