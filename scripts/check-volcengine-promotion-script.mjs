import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "scripts/promote-volcengine-voice-delivery.mjs");
if (!fs.existsSync(file)) {
  console.error("Formal Volcengine promotion script is missing.");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");
const failures = [];
if (!source.includes("voice-staging-manifest.json")) failures.push("Promotion must consume staging manifests only.");
if (!source.includes("check-formal-volcengine-voice-contract.mjs")) failures.push("Promotion must require the strict formal delivery contract after activation.");
if (!source.includes("refresh-voice-runtime.mjs")) failures.push("Promotion must refresh runtime only after staged deliveries are validated.");
if (!source.includes("restore")) failures.push("Promotion must restore the prior runtime and assets when activation validation fails.");
if (!source.includes("voice-legacy-xfyun")) failures.push("Promotion must preserve legacy voice masters outside formal runtime paths.");
if (source.indexOf("records.push") > source.indexOf("if (legacyDirectory) {")) failures.push("Promotion must register rollback state before moving live assets.");

if (failures.length) {
  console.error("Volcengine promotion script check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Volcengine promotion script check passed.");
