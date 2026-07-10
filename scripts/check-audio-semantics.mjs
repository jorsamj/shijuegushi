import fs from "node:fs";
import vm from "node:vm";
const context = { window: {} }; vm.runInNewContext(fs.readFileSync("story-data.js", "utf8"), context);
const nodes = context.window.MIST_DATA.nodes;
const required = { ch01_001: "rain_window_soft", ch01_003: "phone_ring_dead_call", ch01_006: "doorbell_rain_night", ch01_007: "footstep_corridor_wet", ch05_004: "old_phone_start", ch06_010: "deduction_tension" };
const keyOf = (cue) => typeof cue === "string" ? cue : cue?.key;
const failures = [];
for (const [nodeId, cue] of Object.entries(required)) if (!(nodes[nodeId]?.sfxOnEnter || []).some((item) => keyOf(item) === cue)) failures.push(`${nodeId} must retain semantic cue ${cue}`);
for (const node of Object.values(nodes)) {
  for (const cue of node.sfxOnEnter || []) if (["choice_confirm_soft", "evidence_reveal", "archive_stamp", "corridor_light_flicker", "room_silence_drop", "delete_warning", "chat_typing_short"].includes(keyOf(cue))) failures.push(`${node.nodeId} uses a forbidden clutter cue`);
  if (node.voiceStinger && node.nodeId !== "ch01_004") failures.push(`${node.nodeId} uses an unnecessary non-verbal reaction`);
}
if (failures.length) { console.error("Audio semantics check failed:"); failures.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log("Audio semantics check passed.");
