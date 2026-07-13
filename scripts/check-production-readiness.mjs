import { spawnSync } from "node:child_process";
import fs from "node:fs";

const checks = [
  ["node", ["--check", "script.js"]],
  ["node", ["--check", "story-data.js"]],
  ["node", ["--check", "assets/visual-assets.js"]],
  ["node", ["scripts/validate-story-data.mjs"]],
  ["node", ["scripts/check-story-flow.mjs"]],
  ["node", ["scripts/check-ui-flow.mjs"]],
  ["node", ["scripts/check-audio-coverage.mjs"]],
  ["node", ["scripts/check-audio-lifecycle.mjs"]],
  ["node", ["scripts/check-audio-semantics.mjs"]],
  ["node", ["scripts/check-audio-continuity.mjs"]],
  ["node", ["scripts/check-scene-continuity.mjs"]],
  ["node", ["scripts/check-sound-library-only.mjs"]],
  ["node", ["scripts/check-external-audio-assets.mjs"]],
  ["node", ["scripts/check-asset-library.mjs"]],
  ["node", ["scripts/check-visual-semantics.mjs"]],
  ["node", ["scripts/check-playability.mjs"]],
  ["node", ["scripts/check-rc2-interactions.mjs"]],
  ["node", ["scripts/check-mobile-ui.mjs"]],
  ["node", ["scripts/check-entry-experience.mjs"]],
  ["node", ["scripts/check-mobile-fullscreen.mjs"]],
  ["node", ["scripts/check-mobile-release-experience.mjs"]],
  ["node", ["scripts/check-dormitory-story-flow.mjs"]],
  ["node", ["scripts/check-dormitory-ending-routes.mjs"]],
  ["node", ["scripts/check-dormitory-rule-board.mjs"]],
  ["node", ["scripts/check-dormitory-audio.mjs"]],
  ["node", ["scripts/check-dormitory-release-gates.mjs"]],
  ["node", ["scripts/check-dormitory-asset-library.mjs"]],
  ["node", ["scripts/check-multi-story.mjs"]],
];

const requiredDocs = [
  "docs/AUDIO_CREDITS.md",
  "docs/LICENSES_AUDIO.md",
  "docs/EXTERNAL_AUDIO_CANDIDATES.md",
  "docs/AUDIO_PLAYTEST_CHECKLIST.md",
  "docs/PRODUCTION_READINESS_CHECKLIST.md",
];

const failures = [];

for (const doc of requiredDocs) {
  if (!fs.existsSync(doc)) failures.push(`${doc} is missing`);
}

for (const [cmd, args] of checks) {
  const label = `${cmd} ${args.join(" ")}`;
  const result = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8", shell: false });
  if (result.status !== 0) {
    failures.push(`${label} failed\n${result.stdout || ""}${result.stderr || ""}`.trim());
  }
}

if (failures.length) {
  console.error("Production readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production readiness check passed.");
