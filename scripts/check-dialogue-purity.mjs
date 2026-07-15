import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
const contentTypes = new Set(["narration", "dialogue", "broadcast", "phone", "recording", "system", "inner-monologue"]);
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const narrators = new Set(["??", "??", "Narrator", "\u65c1\u767d"]);
const scriptSource = fs.readFileSync(path.join(root, "script.js"), "utf8");

function load(file, property) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context.window[property];
}

function normalise(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

const stories = [
  ["script_rain_call", load("story-data.js", "MIST_DATA")],
  ["script_dormitory_rollcall", load("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA")],
];
const expectedSilentNarrativeNodes = {
  script_rain_call: new Set(["ch01_005__m02", "ch01_019__m02", "ch03_005__m03", "ch04_020__m03", "ch05_005__m02"]),
};
const runtime = load("assets/voice-runtime-manifest.js", "SECOND_LIFE_VOICE_MANIFEST");

for (const [scriptId, data] of stories) {
  for (const node of Object.values(data.nodes || {})) {
    const label = `${scriptId}:${node.nodeId}`;
    if (!contentTypes.has(node.contentType)) {
      failures.push(`${label} must declare one contentType.`);
      continue;
    }
    const narrator = narrators.has(node.speaker);
    if ((node.type === "choice" || node.type === "deduction") && node.contentType !== "system") {
      failures.push(`${label} choice and deduction nodes must be system content.`);
    }
    if (node.contentType === "narration") {
      if (!narrator) failures.push(`${label} narration must use the narrator speaker.`);
      if (node.voiceEnabled !== false) failures.push(`${label} narration must explicitly disable voice.`);
      if (node.spokenText) failures.push(`${label} narration cannot carry spokenText.`);
      continue;
    }
    if (node.contentType === "system") {
      if (node.voiceEnabled !== false) failures.push(`${label} system content must explicitly disable voice.`);
      if (node.spokenText) failures.push(`${label} system content cannot carry spokenText.`);
      continue;
    }
    if (narrator) failures.push(`${label} ${node.contentType} cannot use the narrator speaker.`);
    if (node.voiceEnabled !== audibleTypes.has(node.contentType)) {
      failures.push(`${label} voiceEnabled must match its content type.`);
    }
    if (audibleTypes.has(node.contentType)) {
      if (!normalise(node.spokenText)) failures.push(`${label} audible content requires spokenText.`);
      if (/[“”]/.test(node.text || "")) failures.push(`${label} dialogue text must not mix quoted speech with narration.`);
      if (normalise(node.text) !== normalise(node.spokenText)) failures.push(`${label} displayed dialogue and spokenText must match.`);
    }
  }

  for (const nodeId of expectedSilentNarrativeNodes[scriptId] || []) {
    const node = data.nodes?.[nodeId];
    if (!node || node.contentType !== "narration" || node.voiceEnabled !== false || node.spokenText) {
      failures.push(`${scriptId}:${nodeId} must remain a silent narration beat.`);
    }
  }

  const voiceNodes = runtime?.stories?.[scriptId]?.nodes || {};
  if (scriptId === "script_dormitory_rollcall" && data.audioProduction?.status === "story-restructured-needs-dormitory-voice-regeneration") {
    if (Object.keys(voiceNodes).length) failures.push(`${scriptId} must not keep stale runtime voices after story restructuring.`);
    if (Object.keys(runtime?.stories?.[scriptId]?.cues || {}).length) failures.push(`${scriptId} must not keep stale runtime broadcast cues after story restructuring.`);
    continue;
  }
  for (const nodeId of Object.keys(voiceNodes)) {
    const node = data.nodes?.[nodeId];
    if (!node) failures.push(`${scriptId}:${nodeId} is referenced by voice runtime but missing from story data.`);
    else if (!audibleTypes.has(node.contentType) || node.voiceEnabled !== true) failures.push(`${scriptId}:${nodeId} is not audible dialogue but remains in the voice runtime.`);
    else if (voiceNodes[nodeId]?.provider !== "volcengine-doubao-tts-unidirectional") failures.push(`${scriptId}:${nodeId} is not a Volcengine runtime voice entry.`);
    else if (voiceNodes[nodeId]?.model !== "seed-tts-2.0") failures.push(`${scriptId}:${nodeId} must declare the formal seed-tts-2.0 runtime model.`);
    else if (!String(voiceNodes[nodeId]?.voiceType || "").endsWith("_uranus_bigtts")) failures.push(`${scriptId}:${nodeId} must declare a standard Model 2.0 voiceType.`);
    else if (Object.hasOwn(voiceNodes[nodeId], "emotion") || Object.hasOwn(voiceNodes[nodeId], "emotionIntensity")) failures.push(`${scriptId}:${nodeId} must not carry Model 1.0 emotion fields at runtime.`);
  }

  if (Object.keys(runtime?.stories?.[scriptId]?.endings || {}).length) {
    failures.push(`${scriptId} still references narrated ending audio at runtime.`);
  }

  const voiceCues = runtime?.stories?.[scriptId]?.cues || {};
  for (const [cueId, cue] of Object.entries(voiceCues)) {
    if (cue?.provider !== "volcengine-doubao-tts-unidirectional") {
      failures.push(`${scriptId}:${cueId} is a non-Volcengine runtime broadcast cue.`);
    }
    if (cue?.model !== "seed-tts-2.0") failures.push(`${scriptId}:${cueId} must declare the formal seed-tts-2.0 runtime model.`);
    if (!String(cue?.voiceType || "").endsWith("_uranus_bigtts")) failures.push(`${scriptId}:${cueId} must declare a standard Model 2.0 voiceType.`);
    if (Object.hasOwn(cue || {}, "emotion") || Object.hasOwn(cue || {}, "emotionIntensity")) failures.push(`${scriptId}:${cueId} must not carry Model 1.0 emotion fields at runtime.`);
  }
}

if (!/function speakNode\(node, kind = "nodes"\) \{[\s\S]{0,300}?node\?\.voiceEnabled !== true/.test(scriptSource)) {
  failures.push("script.js must refuse voice playback unless node.voiceEnabled is true.");
}
if (/const realVoiceKey = generatedVoice \? node\.nodeId : \(node\.voiceStinger \|\| ""\)/.test(scriptSource)) {
  failures.push("script.js must not substitute a voice stinger when a formal dialogue file is unavailable.");
}

if (failures.length) {
  console.error("Dialogue purity check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dialogue purity check passed.");
