import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const provider = "volcengine-doubao-tts-websocket";
const model = "seed-tts-2.0";
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const stories = [
  { scriptId: "script_rain_call", dataFile: "story-data.js", global: "MIST_DATA", manifestFile: "assets/stories/rain-call/audio/voice-manifest.json" },
  { scriptId: "script_dormitory_rollcall", dataFile: "assets/stories/dormitory-rollcall/story-data.js", global: "MIST_DORMITORY_DATA", manifestFile: "assets/stories/dormitory-rollcall/audio/voice-manifest.json" },
];

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

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

function isValidWav(webPath) {
  const file = path.join(root, webPath || "");
  if (!fs.existsSync(file)) return false;
  const data = fs.readFileSync(file);
  return data.length >= 256 && data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WAVE";
}

const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/volcengine-tts2-voice-catalog.json"), "utf8"));
const verifiedVoiceTypes = new Set((catalog.voices || [])
  .filter((voice) => voice.model === "Doubao Voice Synthesis Model 2.0" && voice.modelStatus === "verified")
  .map((voice) => voice.voiceType));
const broadcastContract = loadScript("assets/stories/dormitory-rollcall/broadcast-audio-contract.js", "DORMITORY_BROADCAST_AUDIO_CONTRACT");
const contractCues = new Map((broadcastContract?.cues || []).map((cue) => [cue.audioId, cue]));

function isFormalEntry(entry) {
  return entry?.status === "generated"
    && entry.provider === provider
    && entry.model === "seed-tts-2.0"
    && typeof entry.voiceType === "string"
    && entry.voiceType.endsWith("_uranus_bigtts")
    && verifiedVoiceTypes.has(entry.voiceType)
    && !Object.hasOwn(entry, "emotion")
    && !Object.hasOwn(entry, "emotionIntensity")
    && isValidWav(entry.webPath);
}

function runtimeEntry(entry) {
  return {
    path: entry.webPath,
    roleId: entry.roleId,
    textHash: entry.textHash,
    provider: entry.provider,
    model: entry.model,
    voiceType: entry.voiceType,
  };
}

const runtime = { version: 4, stories: {} };
const failures = [];

for (const story of stories) {
  const data = loadScript(story.dataFile, story.global);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, story.manifestFile), "utf8"));
  const next = { nodes: {}, endings: {}, cues: {} };
  const expectedNodes = Object.values(data.nodes || {}).filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true && node.spokenText);

  for (const node of expectedNodes) {
    const entry = manifest.entries?.[node.nodeId];
    const expectedHash = hash(normaliseForSpeech(node.spokenText));
    if (!isFormalEntry(entry) || entry.kind !== "node" || entry.textHash !== expectedHash) {
      failures.push(`${story.scriptId}:${node.nodeId} is not a complete formal Model 2.0 delivery.`);
      continue;
    }
    next.nodes[node.nodeId] = runtimeEntry(entry);
  }

  if (story.scriptId === "script_dormitory_rollcall") {
    for (const [cueId, cue] of contractCues) {
      const entry = manifest.entries?.[cueId];
      const sameAnchors = Array.isArray(entry?.nodeIds) && entry.nodeIds.length === cue.nodeIds.length && entry.nodeIds.every((nodeId) => cue.nodeIds.includes(nodeId));
      if (!isFormalEntry(entry) || entry.kind !== "broadcast-cue" || entry.textHash !== hash(normaliseForSpeech(cue.line)) || !sameAnchors) {
        failures.push(`${story.scriptId}:cue:${cueId} is not a complete formal Model 2.0 broadcast delivery.`);
        continue;
      }
      next.cues[cueId] = {
        ...runtimeEntry(entry),
        cueId,
        nodeId: entry.nodeId,
        nodeIds: entry.nodeIds,
      };
    }
  }

  runtime.stories[story.scriptId] = next;
}

if (failures.length) {
  console.error("Voice runtime refresh refused incomplete delivery:");
  failures.slice(0, 20).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 20) console.error(`- (+${failures.length - 20} more)`);
  process.exit(1);
}

const output = path.join(root, "assets/voice-runtime-manifest.js");
const temporary = `${output}.${process.pid}.${Date.now()}.tmp`;
fs.writeFileSync(temporary, `(function () {\n  "use strict";\n  window.SECOND_LIFE_VOICE_MANIFEST = ${JSON.stringify(runtime, null, 2)};\n})();\n`);
fs.renameSync(temporary, output);
for (const story of stories) {
  const next = runtime.stories[story.scriptId];
  console.log(`${story.scriptId}: nodes=${Object.keys(next.nodes).length}; broadcast-cues=${Object.keys(next.cues).length}`);
}
