import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "scripts/generate-volcengine-story-voices.mjs"), "utf8");
const failures = [];

if (!source.includes('const stage = process.argv.includes("--stage")')) failures.push("Formal generation must require an explicit staging mode.");
if (!source.includes('if (!stage) throw new Error("Formal generation must use --stage before promotion.")')) failures.push("Formal generation must refuse direct runtime writes.");
if (source.includes("refreshRuntime();")) failures.push("Generation must not refresh the runtime before both stories are promoted.");
if (!source.includes("voice-staging-manifest.json")) failures.push("Formal generation must write a separate staging manifest.");
if (!source.includes("broadcast-audio-contract.js")) failures.push("Dormitory staging must include the documented broadcast delivery contract.");
if (!source.includes('const model = "seed-tts-2.0"') || !source.includes("model,")) failures.push("Generated entries must declare the formal Model 2.0 model.");
if (!source.includes("voiceType")) failures.push("Generated entries must declare their verified Model 2.0 voiceType.");
if (source.includes("VOLC_TTS_SPEAKER_MAP")) failures.push("Formal casting must come from the committed verified casting manifest, not an environment speaker map.");

if (failures.length) {
  console.error("Volcengine generation safety check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Volcengine generation safety check passed.");
