import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/external-audio-manifest.js"), "utf8"), context, { filename: "external-audio-manifest.js" });
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-asset-map.js"), "utf8"), context, { filename: "dormitory-asset-map.js" });
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8"), context, { filename: "dormitory-story-data.js" });
const manifest = context.window.SECOND_LIFE_EXTERNAL_AUDIO;
const map = context.window.DORMITORY_ROLLCALL_ASSET_MAP;
const data = context.window.MIST_DORMITORY_DATA;
const voiceManifest = JSON.parse(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/audio/voice-manifest.json"), "utf8"));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(map?.audio?.scenes, "Dormitory asset map needs scene-owned audio direction.");
for (const scene of ["dorm_417_night", "dorm_floor4_corridor", "dorm_manager_office", "dorm_broadcast_room"]) {
  assert(map?.audio?.scenes?.[scene]?.bgm, `${scene} needs a restrained BGM key.`);
}

const usedKeys = new Set();
for (const sceneCue of Object.values(map?.audio?.scenes || {})) {
  if (sceneCue.bgm) usedKeys.add(`bgm:${sceneCue.bgm}`);
  if (sceneCue.ambience) usedKeys.add(`ambience:${sceneCue.ambience}`);
  for (const cue of sceneCue.sfx || []) usedKeys.add(`sfx:${typeof cue === "string" ? cue : cue.key}`);
}
for (const node of Object.values(data?.nodes || {})) {
  for (const cue of node.sfxOnEnter || []) usedKeys.add(`sfx:${typeof cue === "string" ? cue : cue.key}`);
  for (const choice of node.choices || []) for (const cue of choice.sfxOnChoice || []) usedKeys.add(`sfx:${typeof cue === "string" ? cue : cue.key}`);
}

for (const entry of usedKeys) {
  const [category, key] = entry.split(":");
  const asset = manifest?.[category]?.[key];
  assert(asset, `Dormitory audio key ${entry} is missing from the approved manifest.`);
  assert(asset?.sourceFamily === "Taira Komori", `${entry} must use the selected sound library, not an unrelated fallback.`);
  assert(asset?.productionGrade === "demo" && asset?.qualityStatus === "approved", `${entry} must be demo-approved until device listening is signed off.`);
  assert(asset?.path?.startsWith("assets/library/audio/reconstructed/"), `${entry} must use a reconstructed local library file.`);
  if (asset?.path) assert(fs.existsSync(path.join(root, asset.path)), `${entry} local file is missing.`);
}

const broadcastNodes = Object.values(data?.nodes || {}).filter((node) => node.speaker === "广播");
assert(broadcastNodes.length > 0, "Dormitory story must retain broadcast nodes.");
assert(broadcastNodes.every((node) => !node.voiceAudio && !node.narrationAudio && !node.voiceStinger), "Broadcast must never fall back to browser or role-play voice audio.");
assert(data?.audioProduction?.broadcastVoiceStatus === "xfyun-generated-awaiting-listening-signoff", "Broadcast voice must be generated through the authorised XFYUN pipeline and remain awaiting listening sign-off.");
const broadcastEntries = Object.values(voiceManifest.entries || {}).filter((entry) => entry.kind === "broadcast-cue");
assert(broadcastEntries.length === 14, `Broadcast delivery must contain 14 independent generated cues; got ${broadcastEntries.length}.`);
assert(broadcastEntries.every((entry) => entry.status === "generated" && entry.provider === "xfyun-super-smart-tts-webapi"), "Every broadcast cue must use the authorised XFYUN source.");
assert(!/creepy_breath|heartbeats|gasp|scream|white_noise|game01/.test(JSON.stringify({ map, data })), "Dormitory audio must not reintroduce breath, heartbeat, scream, white-noise, or game UI cues.");

const knockDelays = (data?.nodes?.dorm_03_003?.sfxOnEnter || []).map((cue) => Number(cue.delayMs || 0));
assert(JSON.stringify(knockDelays) === JSON.stringify([0, 240, 480, 1500]), "The verified knock must play three knocks, pause, then one knock.");

if (failures.length) {
  console.error("Dormitory audio check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory audio check passed.");
console.log(`approved-cues=${[...usedKeys].sort().join(",")}`);
console.log(`broadcast=${data.audioProduction.broadcastVoiceStatus}`);
