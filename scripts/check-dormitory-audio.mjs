import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
for (const file of [
  "assets/external-audio-manifest.js",
  "assets/stories/dormitory-rollcall/story-asset-map.js",
  "assets/stories/dormitory-rollcall/story-data.js",
  "assets/voice-runtime-manifest.js",
]) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const manifest = context.window.SECOND_LIFE_EXTERNAL_AUDIO;
const map = context.window.DORMITORY_ROLLCALL_ASSET_MAP;
const data = context.window.MIST_DORMITORY_DATA;
const runtime = context.window.SECOND_LIFE_VOICE_MANIFEST;
const archiveVoiceManifestPath = path.join(root, "assets/stories/dormitory-rollcall/audio/voice-manifest.json");
const archiveVoiceManifest = fs.existsSync(archiveVoiceManifestPath) ? JSON.parse(fs.readFileSync(archiveVoiceManifestPath, "utf8")) : { entries: {} };
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

const broadcastNodes = Object.values(data?.nodes || {}).filter((node) => node.contentType === "broadcast" || node.speaker === "宿舍广播");
assert(broadcastNodes.length > 0, "Dormitory story must retain broadcast nodes.");
assert(broadcastNodes.every((node) => !node.voiceAudio && !node.narrationAudio && !node.voiceStinger), "Broadcast must never fall back to browser or role-play voice audio.");
assert(data?.audioProduction?.status === "story-restructured-needs-dormitory-voice-regeneration", "Dormitory audio production must explicitly mark voice regeneration as pending after restructuring.");
assert(data?.audioProduction?.broadcastVoiceStatus === "stale-after-story-restructure", "Broadcast voice status must mark old masters stale after restructuring.");
assert(Object.keys(runtime?.stories?.script_dormitory_rollcall?.nodes || {}).length === 0, "Dormitory runtime must not reference stale dialogue voices.");
assert(Object.keys(runtime?.stories?.script_dormitory_rollcall?.cues || {}).length === 0, "Dormitory runtime must not reference stale broadcast cues.");

const archivedBroadcastEntries = Object.values(archiveVoiceManifest.entries || {}).filter((entry) => entry.kind === "broadcast-cue");
assert(archivedBroadcastEntries.length === 14, `Archived broadcast delivery should retain 14 rollback cues; got ${archivedBroadcastEntries.length}.`);
assert(!/creepy_breath|heartbeats|gasp|scream|white_noise|game01/.test(JSON.stringify({ map, data })), "Dormitory audio must not reintroduce breath, heartbeat, scream, white-noise, or game UI cues.");

const knockCues = JSON.stringify({ map, data });
assert(/dorm_knock/.test(knockCues), "Dormitory audio must retain semantically named knock cues for later exact rhythm staging.");

if (failures.length) {
  console.error("Dormitory audio check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory audio check passed.");
console.log(`approved-cues=${[...usedKeys].sort().join(",")}`);
console.log(`voiceStatus=${data.audioProduction.broadcastVoiceStatus}; archivedBroadcastCues=${archivedBroadcastEntries.length}`);
