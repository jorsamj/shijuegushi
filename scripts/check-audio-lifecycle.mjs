import fs from "node:fs";
import vm from "node:vm";

const errors = [];
function assert(condition, message) {
  if (!condition) errors.push(message);
}
const read = (path) => fs.readFileSync(path, "utf8");
function loadStory() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

const script = read("script.js");
const story = loadStory();

function cueKey(cue) {
  return typeof cue === "string" ? cue : cue?.key || "";
}

function hasCue(list, key) {
  return (list || []).map(cueKey).includes(key);
}

for (const required of [
  "function stopNodeTransientAudio",
  "function fadeOutAudio",
  "function transitionAudioForNode",
  "activeSfx",
  "activeStingers",
  "stopTrackedAudioList",
  "eventType",
  "reason",
]) {
  assert(script.includes(required), `script.js must include ${required}`);
}

assert(/audioState\.activeSfx\.push\(audio\)/.test(script), "playSfx must add real SFX to audioState.activeSfx");
assert(/audioState\.activeStingers\.push\(audio\)/.test(script), "voice stingers must be tracked in audioState.activeStingers");
assert(script.includes('stopNodeTransientAudio("continue")'), "continue button must stop previous transient audio");
assert(script.includes('stopNodeTransientAudio("choice")'), "choice handler must stop previous transient audio");
assert(script.includes('stopNodeTransientAudio("node-change")'), "goToNode must stop previous transient audio");
assert(script.includes("policy.bgmMode"), "script.js must apply audioPolicy.bgmMode");
assert(script.includes("policy.ambienceMode"), "script.js must apply audioPolicy.ambienceMode");
assert(script.includes('node.audioPolicy.bgmMode : "keep"'), "default bgmMode must keep current story bed");
assert(script.includes('node.audioPolicy.ambienceMode : "keep"'), "default ambienceMode must keep current story ambience");

const lifecycleNodes = {
  ch01_001: { bgm: "rain_night_loop", ambience: "room_night_loop", policy: ["replace", "replace"] },
  ch01_003: { sfxOnEnter: ["phone_screen_wake", "phone_vibrate", "phone_ring_dead_call"], policy: ["keep", "keep"] },
  ch01_004: { sfxOnEnter: ["room_silence_drop"], voiceStinger: "linzhou_gasp_short", policy: ["keep", "keep"] },
  ch01_005: { sfxOnEnter: ["phone_call_connect", "recording_static_short"], voiceStinger: "xuzhixia_weak_static_exhale", policy: ["keep", "keep"] },
  ch01_006: { sfxOnEnter: ["phone_call_end", "doorbell_rain_night"], policy: ["keep", "keep"] },
  ch01_007: { sfxOnEnter: ["footstep_corridor_wet"], voiceStinger: "xuzhiwan_low_breath", policy: ["replace", "replace"], forbiddenSfx: ["doorbell_rain_night"] },
  ch01_008: { sfxOnEnter: ["door_chain_close", "corridor_light_flicker"], policy: ["keep", "keep"] },
};

for (const [nodeId, rule] of Object.entries(lifecycleNodes)) {
  const node = story.nodes?.[nodeId];
  assert(node, `${nodeId} is missing`);
  if (!node) continue;
  for (const key of rule.sfxOnEnter || []) {
    assert(hasCue(node.sfxOnEnter, key), `${nodeId} must include sfxOnEnter=${key}`);
  }
  for (const key of rule.forbiddenSfx || []) {
    assert(!hasCue(node.sfxOnEnter, key), `${nodeId} must not include sfxOnEnter=${key}`);
  }
  if (rule.voiceStinger) assert(node.voiceStinger === rule.voiceStinger, `${nodeId} must use voiceStinger=${rule.voiceStinger}`);
  if (rule.bgm) assert(node.bgm === rule.bgm, `${nodeId} must use bgm=${rule.bgm}`);
  if (rule.ambience) assert(node.ambience === rule.ambience, `${nodeId} must use ambience=${rule.ambience}`);
  if (rule.policy) {
    assert(node.audioPolicy?.bgmMode === rule.policy[0], `${nodeId} audioPolicy.bgmMode must be ${rule.policy[0]}`);
    assert(node.audioPolicy?.ambienceMode === rule.policy[1], `${nodeId} audioPolicy.ambienceMode must be ${rule.policy[1]}`);
  }
}

const logTerms = ["start", "stopped", "fadeout", "ended", "node-enter", "node-leave"];
for (const term of logTerms) assert(script.includes(term), `audio debug log must include ${term}`);

if (errors.length) {
  console.error("Audio lifecycle check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Audio lifecycle check passed.");
