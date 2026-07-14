import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const reviewFiles = [
  "tools/voice-review/index.html",
  "tools/voice-review/review.js",
  "tools/voice-review/review.css",
];
const productionEntrypoints = ["index.html", "script.js", "style.css"];
const failures = [];

for (const file of reviewFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file} is missing.`);
}

const page = fs.readFileSync(path.join(root, "tools/voice-review/index.html"), "utf8");
if (!page.includes("本页面仅用于本地配音审听，不构成正式发布签核。")) {
  failures.push("Voice review page is missing its local-only sign-off warning.");
}
if (!page.includes("noindex,nofollow")) failures.push("Voice review page must remain noindex.");

for (const file of productionEntrypoints) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  if (content.includes("tools/voice-review")) failures.push(`${file} must not link to the local voice review tool.`);
}

if (failures.length) {
  console.error("Voice review tool check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Voice review tool check passed. localOnly=true; productionNavigationReferences=0");
