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
const dormitoryBroadcastContract = loadScript(
  "assets/stories/dormitory-rollcall/broadcast-audio-contract.js",
  "DORMITORY_BROADCAST_AUDIO_CONTRACT",
);
const stories = [
  ["script_rain_call", loadScript("story-data.js", "MIST_DATA")],
  ["script_dormitory_rollcall", loadScript("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA")],
];
const storiesById = new Map(stories);
const dormitoryCueContract = new Map((dormitoryBroadcastContract?.cues || []).map((cue) => [cue.audioId, cue]));
const dormitoryEndingBroadcastIds = new Set(["dorm_ending_a", "dorm_ending_b", "dorm_ending_c", "dorm_ending_d"]);

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

function validateEntry(label, entry, expectedSpeech) {
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
  if (!expectedSpeech) {
    failures.push(`${label} must map to current audible story speech or a documented in-world broadcast cue.`);
    return;
  }
  if (entry.textHash !== hash(expectedSpeech)) failures.push(`${label} textHash is stale for the current formal spoken text.`);
  if (!isValidWav(entry.path)) failures.push(`${label} path must point to an existing RIFF/WAVE master.`);
}

function validateBroadcastCue(scriptId, cueId, entry) {
  const before = failures.length;
  const cue = scriptId === "script_dormitory_rollcall" ? dormitoryCueContract.get(cueId) : null;
  if (!cue) {
    failures.push(`${scriptId}:cue:${cueId} is not a documented formal in-world broadcast cue.`);
    return { valid: false, nodeIds: [] };
  }
  if (entry?.cueId && entry.cueId !== cueId) failures.push(`${scriptId}:cue:${cueId} cueId must match its runtime key.`);
  if (entry?.nodeId && !(cue.nodeIds || []).includes(entry.nodeId)) {
    failures.push(`${scriptId}:cue:${cueId} nodeId must match the broadcast contract.`);
  }

  const story = storiesById.get(scriptId);
  const invalidTarget = (cue.nodeIds || []).find((targetId) => {
    const node = story?.nodes?.[targetId];
    if (node) return node.contentType !== "broadcast";
    return !story?.endings?.[targetId] || !dormitoryEndingBroadcastIds.has(targetId);
  });
  if (invalidTarget) failures.push(`${scriptId}:cue:${cueId} must target a broadcast node or one of the four documented in-world ending broadcasts; got ${invalidTarget}.`);

  validateEntry(`${scriptId}:cue:${cueId}`, entry, cue.line);
  return {
    valid: failures.length === before && !invalidTarget,
    nodeIds: (cue.nodeIds || []).filter((targetId) => story?.nodes?.[targetId]?.contentType === "broadcast"),
  };
}

for (const [scriptId, story] of stories) {
  const storyRuntime = runtime.stories?.[scriptId] || {};
  const entries = storyRuntime.nodes || {};
  const expectedNodes = Object.fromEntries(Object.values(story.nodes || {})
    .filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true)
    .map((node) => [node.nodeId, node]));

  const deliveredNodeIds = new Set();
  for (const [nodeId, entry] of Object.entries(entries)) {
    const before = failures.length;
    validateEntry(`${scriptId}:${nodeId}`, entry, expectedNodes[nodeId]?.spokenText);
    if (failures.length === before && expectedNodes[nodeId]) deliveredNodeIds.add(nodeId);
  }

  const requiredCueIds = scriptId === "script_dormitory_rollcall" ? [...dormitoryCueContract.keys()] : [];
  const deliveredCueIds = new Set();
  for (const [cueId, entry] of Object.entries(storyRuntime.cues || {})) {
    const result = validateBroadcastCue(scriptId, cueId, entry);
    if (result.valid) {
      deliveredCueIds.add(cueId);
      result.nodeIds.forEach((nodeId) => deliveredNodeIds.add(nodeId));
    }
  }
  if (Object.keys(storyRuntime.endings || {}).length) {
    failures.push(`${scriptId} must not map ending narration to a formal runtime voice.`);
  }

  if (requireDelivery) {
    const missingNodeIds = Object.keys(expectedNodes).filter((nodeId) => !deliveredNodeIds.has(nodeId));
    if (missingNodeIds.length) {
      failures.push(`${scriptId} formal node delivery is incomplete: ${deliveredNodeIds.size}/${Object.keys(expectedNodes).length} audible nodes are satisfied. Missing IDs: ${missingNodeIds.slice(0, 12).join(", ")}${missingNodeIds.length > 12 ? ` (+${missingNodeIds.length - 12} more)` : ""}.`);
    }
    const missingCueIds = requiredCueIds.filter((cueId) => !deliveredCueIds.has(cueId));
    if (missingCueIds.length) {
      failures.push(`${scriptId} formal broadcast delivery is incomplete: ${deliveredCueIds.size}/${requiredCueIds.length} documented cue deliveries are satisfied. Missing IDs: ${missingCueIds.join(", ")}.`);
    }
  }
}

if (failures.length) {
  console.error("Formal Volcengine voice contract check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Formal Volcengine voice contract check passed (${requireDelivery ? "delivery required" : "Draft structural mode"}).`);
