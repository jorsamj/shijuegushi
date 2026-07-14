import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalogPath = resolve(root, "assets/volcengine-tts2-voice-catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const failures = [];

if (catalog.summary?.verifiedVoiceCount !== catalog.voices?.length) failures.push("Catalog summary count does not match voices.");
if ((catalog.voices || []).length === 0) failures.push("No verified Model 2.0 voice records found.");

for (const voice of catalog.voices || []) {
  if (voice.model !== "Doubao Voice Synthesis Model 2.0" || voice.modelStatus !== "verified") {
    failures.push(`${voice.voiceType}: not verified as Model 2.0.`);
  }
  if (!/^(zh|en)_(female|male)_[a-z0-9-]+_uranus_bigtts$/.test(voice.voiceType || "")) {
    failures.push(`${voice.voiceType}: not an official standard Model 2.0 voice_type.`);
  }
  if (voice.voiceType.includes("ICL_") || voice.voiceType.includes("_mars_")) {
    failures.push(`${voice.voiceType}: forbidden non-standard scope.`);
  }
  if (voice.emotion?.status !== "unavailable" || voice.emotion?.supportedValues?.length) {
    failures.push(`${voice.voiceType}: must not invent an emotion enum from this evidence.`);
  }
  if (voice.evidence?.verificationStatus !== "verified" || !voice.evidence?.page) {
    failures.push(`${voice.voiceType}: missing official evidence location.`);
  }
}

if (failures.length) {
  console.error("Volcengine TTS 2.0 catalog check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Volcengine TTS 2.0 catalog passed: ${catalog.voices.length} verified standard voices; emotion API enums intentionally unavailable.`);
