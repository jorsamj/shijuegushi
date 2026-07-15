import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const failures = [];
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

function loadScript(file, globalName) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context.window[globalName];
}

function normaliseForSpeech(text) {
  return String(text || "")
    .replace(/00:17/g, "零点十七分")
    .replace(/00:44/g, "零点四十四分")
    .replace(/01:13/g, "一点十三分")
    .replace(/2014/g, "二零一四年")
    .replace(/417/g, "四一七")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidWav(webPath) {
  const absolutePath = path.join(root, webPath || "");
  if (!fs.existsSync(absolutePath)) return false;
  const audio = fs.readFileSync(absolutePath);
  return audio.length >= 256 && audio.subarray(0, 4).toString() === "RIFF" && audio.subarray(8, 12).toString() === "WAVE";
}

const stories = [
  { id: "script_rain_call", dataFile: "story-data.js", global: "MIST_DATA", manifestFile: "assets/stories/rain-call/audio/voice-manifest.json" },
  { id: "script_dormitory_rollcall", dataFile: "assets/stories/dormitory-rollcall/story-data.js", global: "MIST_DORMITORY_DATA", manifestFile: "assets/stories/dormitory-rollcall/audio/voice-manifest.json" },
];

for (const story of stories) {
  const data = loadScript(story.dataFile, story.global);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, story.manifestFile), "utf8"));
  const targets = Object.values(data.nodes || {}).filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true);
  let valid = 0;
  const invalid = [];

  for (const node of targets) {
    const entry = manifest.entries?.[node.nodeId];
    const expectedHash = hash(normaliseForSpeech(node.spokenText));
    const validEntry = entry
      && entry.status === "generated"
      && entry.provider === "volcengine-doubao-tts-unidirectional"
      && entry.textHash === expectedHash
      && isValidWav(entry.webPath);
    if (validEntry) valid += 1;
    else invalid.push(node.nodeId);
  }

  if (invalid.length) {
    failures.push(`${story.id} Volcengine dialogue delivery is incomplete: ${valid}/${targets.length} current audible nodes are valid. Missing or stale IDs: ${invalid.slice(0, 12).join(", ")}${invalid.length > 12 ? ` (+${invalid.length - 12} more)` : ""}.`);
  }
}

const dormManifest = JSON.parse(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/audio/voice-manifest.json"), "utf8"));
const broadcastCues = Object.values(dormManifest.entries || {}).filter((entry) => entry.kind === "broadcast-cue");
if (broadcastCues.length !== 14 || broadcastCues.some((entry) => entry.status !== "generated" || !isValidWav(entry.webPath))) {
  failures.push("Dormitory broadcast archive must retain 14 valid WAV cue masters while Volcengine replacement delivery is pending.");
}

if (failures.length) {
  console.error("Voice asset check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Voice asset check passed. All current audible nodes have valid Volcengine WAV coverage.");
