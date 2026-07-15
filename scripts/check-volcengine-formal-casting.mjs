import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/volcengine-tts2-voice-catalog.json"), "utf8"));
const verifiedVoiceTypes = new Set((catalog.voices || []).filter((voice) => voice.modelStatus === "verified").map((voice) => voice.voiceType));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/voice-casting-manifest.js"), "utf8"), context, { filename: "assets/voice-casting-manifest.js" });
const casting = context.window.SECOND_LIFE_VOICE_CASTING;

const expectations = {
  script_rain_call: ["linzhou", "xuzhixia", "xuzhiwan", "zhouyu", "chenyan", "landlady"],
  script_dormitory_rollcall: ["dorm_broadcast", "xutang", "linsui", "zhaoqing", "chenlu", "shenyan", "manager_wu", "zhouwanning"],
};

const failures = [];
if (casting?.provider !== "volcengine-doubao-tts-unidirectional") failures.push("Casting provider must be Volcengine Model 2.0.");
if (casting?.model !== "seed-tts-2.0") failures.push("Casting model must be seed-tts-2.0.");

for (const [storyId, roleIds] of Object.entries(expectations)) {
  const story = casting?.stories?.[storyId];
  if (!story) {
    failures.push(`Missing casting story ${storyId}.`);
    continue;
  }
  for (const roleId of roleIds) {
    const role = story.roles?.[roleId];
    if (!role) {
      failures.push(`Missing role ${storyId}/${roleId}.`);
      continue;
    }
    if (!verifiedVoiceTypes.has(role.voiceType) || !String(role.voiceType).endsWith("_uranus_bigtts")) {
      failures.push(`Role ${storyId}/${roleId} must use a verified uranus_bigtts voiceType.`);
    }
    if (!role.contextProfile || !role.sourceProfile) failures.push(`Role ${storyId}/${roleId} needs source and performance context.`);
  }
}

const rainAliases = casting?.stories?.script_rain_call?.speakerAliases || {};
if (rainAliases["女人"] !== "xuzhiwan") failures.push("The woman-at-door alias must share Xu Zhiwan's stable voiceprint.");
if (!String(casting?.stories?.script_rain_call?.identityBasis?.womanAtDoor || "").includes("Xu Zhiwan")) {
  failures.push("The woman-at-door shared voiceprint needs an explicit current-story identity basis.");
}
const dormAliases = casting?.stories?.script_dormitory_rollcall?.speakerAliases || {};
if (dormAliases.Broadcast !== "dorm_broadcast" || dormAliases["广播"] !== "dorm_broadcast") failures.push("Dormitory broadcast aliases must map to the shared broadcast role.");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Formal Volcengine Model 2.0 casting check passed.");
