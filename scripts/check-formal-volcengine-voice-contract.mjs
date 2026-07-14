import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const provider = "volcengine-doubao-tts-websocket";
const model = "seed-tts-2.0";
const requireDelivery = process.argv.includes("--require-delivery");

if (process.argv.some((argument) => argument !== process.argv[0] && argument !== process.argv[1] && argument !== "--require-delivery")) {
  throw new Error("Usage: node scripts/check-formal-volcengine-voice-contract.mjs [--require-delivery]");
}

function loadScript(file, globalName) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context.window[globalName];
}

function normaliseForSpeech(text) {
  return String(text || "")
    .replace(/[\u201c\u201d"]/g, "")
    .replace(/00:17/g, "\u96f6\u70b9\u5341\u4e03\u5206")
    .replace(/00:44/g, "\u96f6\u70b9\u56db\u5341\u56db\u5206")
    .replace(/01:13/g, "\u4e00\u70b9\u5341\u4e09\u5206")
    .replace(/2014/g, "\u4e8c\u96f6\u4e00\u56db\u5e74")
    .replace(/417/g, "\u56db\u4e00\u4e03")
    .replace(/\s+/g, " ")
    .trim();
}

const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/volcengine-tts2-voice-catalog.json"), "utf8"));
const verifiedVoiceTypes = new Set((catalog.voices || [])
  .filter((voice) => voice.model === "Doubao Voice Synthesis Model 2.0" && voice.modelStatus === "verified")
  .map((voice) => voice.voiceType));
const runtime = loadScript("assets/voice-runtime-manifest.js", "SECOND_LIFE_VOICE_MANIFEST") || { stories: {} };
const stories = [
  ["script_rain_call", loadScript("story-data.js", "MIST_DATA")],
  ["script_dormitory_rollcall", loadScript("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA")],
];

function hash(text) {
  return crypto.createHash("sha256").update(normaliseForSpeech(text)).digest("hex");
}

function isValidWav(webPath) {
  if (typeof webPath !== "string" || !webPath) return false;
  const absolutePath = path.join(root, webPath);
  if (!fs.existsSync(absolutePath)) return false;
  const audio = fs.readFileSync(absolutePath);
  return audio.length >= 256 && audio.subarray(0, 4).toString() === "RIFF" && audio.subarray(8, 12).toString() === "WAVE";
}

function hasForbiddenValue(entry) {
  return JSON.stringify(entry).toLowerCase().match(/xfyun|mars_bigtts/);
}

function validateEntry(label, entry, node) {
  if (!entry || typeof entry !== "object") {
    failures.push(`${label} must use an object runtime voice entry.`);
    return;
  }
  if (hasForbiddenValue(entry)) failures.push(`${label} contains forbidden XFYUN or Model 1.0 mars_bigtts metadata.`);
  if (entry.provider !== provider) failures.push(`${label} provider must be ${provider}.`);
  if (entry.model !== model) failures.push(`${label} model must be ${model}.`);
  if (Object.hasOwn(entry, "emotion") || Object.hasOwn(entry, "emotionIntensity")) {
    failures.push(`${label} must not carry Model 1.0 emotion or emotionIntensity fields.`);
  }
  if (typeof entry.voiceType !== "string" || !entry.voiceType.endsWith("_uranus_bigtts")) {
    failures.push(`${label} voiceType must be a standard Model 2.0 _uranus_bigtts value.`);
  } else if (!verifiedVoiceTypes.has(entry.voiceType)) {
    failures.push(`${label} voiceType ${entry.voiceType} is not verified by assets/volcengine-tts2-voice-catalog.json.`);
  }
  if (!node || !audibleTypes.has(node.contentType) || node.voiceEnabled !== true) {
    failures.push(`${label} must map to one current audible story node.`);
    return;
  }
  if (entry.textHash !== hash(node.spokenText)) failures.push(`${label} textHash is stale for the current spokenText.`);
  if (!isValidWav(entry.path)) failures.push(`${label} path must point to an existing RIFF/WAVE master.`);
}

for (const [scriptId, story] of stories) {
  const storyRuntime = runtime.stories?.[scriptId] || {};
  const entries = storyRuntime.nodes || {};
  const expectedNodes = Object.fromEntries(Object.values(story.nodes || {})
    .filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true)
    .map((node) => [node.nodeId, node]));

  for (const [nodeId, entry] of Object.entries(entries)) {
    validateEntry(`${scriptId}:${nodeId}`, entry, expectedNodes[nodeId]);
  }
  for (const [cueId, entry] of Object.entries(storyRuntime.cues || {})) {
    const node = expectedNodes[entry?.nodeId];
    validateEntry(`${scriptId}:cue:${cueId}`, entry, node);
    if (node && node.contentType !== "broadcast") {
      failures.push(`${scriptId}:cue:${cueId} must map to a broadcast node, not ${node.contentType}.`);
    }
  }
  if (Object.keys(storyRuntime.endings || {}).length) {
    failures.push(`${scriptId} must not map ending narration to a formal runtime voice.`);
  }

  if (requireDelivery) {
    const missingNodeIds = Object.keys(expectedNodes).filter((nodeId) => !Object.hasOwn(entries, nodeId));
    if (missingNodeIds.length) {
      failures.push(`${scriptId} formal delivery is incomplete: ${Object.keys(entries).length}/${Object.keys(expectedNodes).length} audible nodes are mapped. Missing IDs: ${missingNodeIds.slice(0, 12).join(", ")}${missingNodeIds.length > 12 ? ` (+${missingNodeIds.length - 12} more)` : ""}.`);
    }
  }
}

if (failures.length) {
  console.error("Formal Volcengine voice contract check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Formal Volcengine voice contract check passed (${requireDelivery ? "delivery required" : "Draft structural mode"}).`);
