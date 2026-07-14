import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "scripts/refresh-voice-runtime.mjs"), "utf8");
const failures = [];

if (!source.includes('entry.model === "seed-tts-2.0"')) failures.push("Runtime refresh must reject entries from another model.");
if (!source.includes('entry.voiceType.endsWith("_uranus_bigtts")')) failures.push("Runtime refresh must reject non-uranus voice entries.");
if (!source.includes('entry.kind !== "broadcast-cue"')) failures.push("Runtime refresh must build documented in-world broadcast cues from the formal manifest.");
if (!source.includes("nodeIds: entry.nodeIds")) failures.push("Runtime refresh must retain every documented cue playback anchor.");

if (failures.length) {
  console.error("Voice runtime promotion safety check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Voice runtime promotion safety check passed.");
