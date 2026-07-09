import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function loadStory() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

function cueKey(cue) {
  return typeof cue === "string" ? cue : cue?.key || "";
}

const story = loadStory();
const script = read("script.js");

for (const required of [
  "normalizeAudioCue",
  "pendingSfxTimers",
  "recentSfx",
  "duckBgmForSfx",
  "fadeInAudio",
  "clearPendingSfxTimers",
]) {
  assert(script.includes(required), `script.js must include ${required}`);
}

assert(script.includes('playSfx("choice_confirm_soft")') || script.includes('["choice_confirm_soft"]'), "choice fallback SFX must be present");
assert(script.includes("choice.nextNodeId") && script.includes("goToNode(choice.nextNodeId)"), "choice navigation must remain explicit");

for (const [nodeId, node] of Object.entries(story.nodes || {})) {
  const enterKeys = (node.sfxOnEnter || []).map(cueKey).filter(Boolean);
  const duplicate = enterKeys.find((key, index) => enterKeys.indexOf(key) !== index);
  assert(!duplicate, `${nodeId} repeats sfxOnEnter=${duplicate}`);
  assert(enterKeys.length <= 4, `${nodeId} has too many simultaneous SFX cues (${enterKeys.length})`);
  if (node.type === "deduction") {
    assert(node.choices?.every((choice) => choice.choiceImpactText), `${nodeId} deduction choices must have feedback text`);
  }
  if (node.type === "choice" || node.type === "deduction") {
    assert(script.includes("type: \"choice\""), "runtime must enqueue choice feedback");
  }
}

const requiredActionSounds = {
  ch01_003: ["phone_screen_wake", "phone_vibrate", "phone_ring_dead_call"],
  ch01_006: ["phone_call_end", "doorbell_rain_night"],
  ch02_014: ["door_open_slow"],
  ch04_015: ["evidence_reveal", "marker_circle"],
  ch05_010: ["old_phone_start", "recording_static_short"],
  ch06_018: ["room_silence_drop"],
  ch06_020: ["archive_stamp"],
};

for (const [nodeId, keys] of Object.entries(requiredActionSounds)) {
  const node = story.nodes?.[nodeId];
  const actual = (node?.sfxOnEnter || []).map(cueKey);
  for (const key of keys) assert(actual.includes(key), `${nodeId} must include action SFX ${key}`);
}

if (errors.length) {
  console.error("Audio continuity check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Audio continuity check passed.");
