import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/voice-casting-manifest.js"), "utf8"), context);
const casting = context.window.SECOND_LIFE_VOICE_CASTING;
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/volcengine-tts2-voice-catalog.json"), "utf8"));
const verifiedVoiceTypes = new Set((catalog.voices || [])
  .filter((voice) => voice.model === "Doubao Voice Synthesis Model 2.0" && voice.modelStatus === "verified")
  .map((voice) => voice.voiceType));
const failures = [];
const dormitoryRoles = Object.values(casting?.stories?.script_dormitory_rollcall?.roles || {});
const rainRoles = Object.values(casting?.stories?.script_rain_call?.roles || {});
const roles = [...dormitoryRoles, ...rainRoles];

if (casting?.provider !== "volcengine-doubao-tts-websocket" || casting?.model !== "seed-tts-2.0") {
  failures.push("Casting manifest must declare the formal Volcengine Model 2.0 provider and model.");
}
if (dormitoryRoles.length !== 8) failures.push(`Dormitory story needs eight distinct speaking roles; got ${dormitoryRoles.length}.`);
if (rainRoles.length !== 6) failures.push(`Rain-call story needs six distinct character voiceprints; got ${rainRoles.length}.`);
if (casting?.stories?.script_rain_call?.speakerAliases?.["\u5973\u4eba"] !== "xuzhiwan") {
  failures.push("The woman at the door must share Xu Zhiwan's base voiceprint.");
}

const voiceTypes = roles.map((role) => role.voiceType).filter(Boolean);
if (new Set(voiceTypes).size !== roles.length) failures.push("Every distinct character and special voice must have a unique base Model 2.0 voiceType.");
for (const role of roles) {
  if (!verifiedVoiceTypes.has(role.voiceType) || !String(role.voiceType).endsWith("_uranus_bigtts")) {
    failures.push(`${role.label || role.roleId} is not a verified Model 2.0 uranus_bigtts voiceType.`);
  }
  if (!role.sourceProfile || !role.contextProfile) failures.push(`${role.label || role.roleId} lacks formal source and performance context.`);
}

if (failures.length) {
  console.error("Voice casting check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Voice casting check passed. dormitoryRoles=${dormitoryRoles.length}; rainRoles=${rainRoles.length}; uniqueVoiceTypes=${new Set(voiceTypes).size}; provider=${casting.provider}`);
