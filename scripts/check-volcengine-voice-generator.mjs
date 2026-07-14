import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "scripts", "generate-volcengine-story-voices.mjs");
const failures = [];

if (!fs.existsSync(file)) {
  failures.push("Volcengine voice generator is missing.");
} else {
  const source = fs.readFileSync(file, "utf8");
  for (const token of [
    "wss://openspeech.bytedance.com/api/v3/tts/bidirection",
    "X-Api-Key",
    "X-Api-Resource-Id",
    "StartConnection",
    "StartSession",
    "TaskRequest",
    "FinishSession",
  "context_texts",
  "seed-icl-2.0",
    "VOLC_TTS_API_KEY",
    "VOLC_TTS_SPEAKER_MAP",
    "refresh-voice-runtime.mjs",
  ]) {
    if (!source.includes(token)) failures.push(`Volcengine generator is missing ${token}.`);
  }
  if (source.includes("xfyun") || source.includes("XFYUN")) failures.push("Volcengine generator must not fall back to XFYUN.");
}

if (failures.length) {
  console.error("Volcengine voice generator check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Volcengine voice generator check passed.");
