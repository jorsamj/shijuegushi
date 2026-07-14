import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const stories = [
  { scriptId: "script_rain_call", dataFile: "story-data.js", global: "MIST_DATA", manifestFile: "assets/stories/rain-call/audio/voice-manifest.json" },
  { scriptId: "script_dormitory_rollcall", dataFile: "assets/stories/dormitory-rollcall/story-data.js", global: "MIST_DORMITORY_DATA", manifestFile: "assets/stories/dormitory-rollcall/audio/voice-manifest.json" },
];

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normaliseForSpeech = (text) => String(text || "")
  .replace(/[“”]/g, "")
  .replace(/00:17/g, "零点十七分")
  .replace(/00:44/g, "零点四十四分")
  .replace(/01:13/g, "一点十三分")
  .replace(/2014/g, "二零一四年")
  .replace(/417/g, "四一七")
  .replace(/\s+/g, " ")
  .trim();

function loadScript(file, property) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context.window[property];
}

function loadRuntime() {
  const context = { window: {} };
  const file = path.join(root, "assets/voice-runtime-manifest.js");
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.SECOND_LIFE_VOICE_MANIFEST || { version: 1, stories: {} };
}

const runtime = loadRuntime();
runtime.version = 3;
runtime.stories ||= {};
const reports = [];

for (const story of stories) {
  const data = loadScript(story.dataFile, story.global);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, story.manifestFile), "utf8"));
  const previousCues = runtime.stories[story.scriptId]?.cues || {};
  const approvedCues = Object.fromEntries(Object.entries(previousCues)
    .filter(([cueId]) => manifest.entries?.[cueId]?.provider === "volcengine-doubao-tts-websocket")
    .map(([cueId, cue]) => [cueId, { ...cue, provider: manifest.entries[cueId].provider }]));
  const next = { nodes: {}, endings: {}, cues: approvedCues };
  let retained = 0;
  let removed = 0;
  for (const node of Object.values(data.nodes || {})) {
    const entry = manifest.entries?.[node.nodeId];
    if (!entry || entry.status !== "generated") continue;
    const expectedHash = hash(normaliseForSpeech(node.spokenText));
    if (audibleTypes.has(node.contentType) && node.voiceEnabled === true && entry.provider === "volcengine-doubao-tts-websocket" && entry.textHash === expectedHash && fs.existsSync(path.join(root, entry.webPath))) {
      next.nodes[node.nodeId] = { path: entry.webPath, roleId: entry.roleId, textHash: entry.textHash, provider: entry.provider || manifest.provider || "unknown" };
      retained += 1;
    } else {
      removed += 1;
    }
  }
  runtime.stories[story.scriptId] = next;
  reports.push({ scriptId: story.scriptId, retained, removed, cues: Object.keys(approvedCues).length });
}

fs.writeFileSync(
  path.join(root, "assets/voice-runtime-manifest.js"),
  `(function () {\n  "use strict";\n  window.SECOND_LIFE_VOICE_MANIFEST = ${JSON.stringify(runtime, null, 2)};\n})();\n`,
);
reports.forEach((report) => console.log(`${report.scriptId}: retained=${report.retained}, removed=${report.removed}, broadcast-cues=${report.cues}`));
