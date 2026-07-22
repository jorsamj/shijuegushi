import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const storyId = "script_dormitory_namefloor";
const stagingManifestFile = path.join(root, "assets/stories/dormitory-namefloor/voice-staging-manifest.json");
const expectedVoices = {
  "林峰": "zh_male_kailangxuezhang_uranus_bigtts",
  "周朝阳": "zh_male_qingshuangnanda_uranus_bigtts",
  "谷雨": "zh_male_wenrouxiaoge_uranus_bigtts",
  "宋明": "zh_male_yangguangqingnian_uranus_bigtts",
  "门外的声音": "zh_male_yangguangqingnian_uranus_bigtts",
  "吴阿姨": "zh_female_wenroumama_uranus_bigtts",
  "门外的女声": "zh_female_gaolengyujie_uranus_bigtts",
  "红色马甲宿管": "zh_female_gaolengyujie_uranus_bigtts",
  "校园广播": "zh_female_zhixingnv_uranus_bigtts",
};
const audibleTypes = new Set(["dialogue", "door-voice", "world-audio"]);
const provider = "volcengine-doubao-tts-unidirectional";
const model = "seed-tts-2.0";
const failures = [];

function loadNamefloorData() {
  const context = { window: {} };
  for (const file of [
    "assets/stories/dormitory-namefloor/story-data.js",
    "assets/stories/dormitory-namefloor/story-chapters-2-7.js",
  ]) {
    vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  }
  const base = context.window.MIST_DORMITORY_NAMEFLOOR_DATA;
  const expansion = context.window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7;
  return { ...base, nodes: { ...(base?.nodes || {}), ...(expansion?.nodes || {}) } };
}

function loadCasting() {
  const context = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "assets/voice-casting-manifest.js"), "utf8"),
    context,
    { filename: "assets/voice-casting-manifest.js" },
  );
  return context.window.SECOND_LIFE_VOICE_CASTING;
}

function normaliseForSpeech(text) {
  return String(text || "")
    .replace(/[\u201c\u201d"]/g, "")
    .replace(/00:17/g, "零点十七分")
    .replace(/00:44/g, "零点四十四分")
    .replace(/01:13/g, "一点十三分")
    .replace(/2014/g, "二零一四年")
    .replace(/417/g, "四一七")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isWav(file) {
  if (!fs.existsSync(file)) return false;
  const audio = fs.readFileSync(file);
  return audio.subarray(0, 4).toString() === "RIFF" && audio.subarray(8, 12).toString() === "WAVE";
}

const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/volcengine-tts2-voice-catalog.json"), "utf8"));
const verifiedVoiceTypes = new Set((catalog.voices || [])
  .filter((voice) => voice.model === "Doubao Voice Synthesis Model 2.0" && voice.modelStatus === "verified")
  .map((voice) => voice.voiceType));
const casting = loadCasting();
const storyCasting = casting?.stories?.[storyId];
if (!storyCasting) {
  failures.push(`Missing casting for ${storyId}.`);
} else {
  for (const [speaker, voiceType] of Object.entries(expectedVoices)) {
    const roleId = storyCasting.speakerAliases?.[speaker];
    const role = storyCasting.roles?.[roleId];
    if (!role) failures.push(`Missing role for ${speaker}.`);
    else if (role.voiceType !== voiceType) failures.push(`Unexpected voice mapping for ${speaker}.`);
    else if (!verifiedVoiceTypes.has(role.voiceType) || !role.voiceType.endsWith("_uranus_bigtts")) failures.push(`Unverified voice mapping for ${speaker}.`);
  }
}

const data = loadNamefloorData();
const targets = Object.values(data.nodes || {}).filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true && node.spokenText);
if (targets.length !== 21) failures.push(`Expected 21 audible namefloor targets, found ${targets.length}.`);

let stagingManifest;
try {
  stagingManifest = JSON.parse(fs.readFileSync(stagingManifestFile, "utf8"));
} catch {
  failures.push("Missing namefloor staging manifest.");
}

if (stagingManifest) {
  if (stagingManifest.storyId !== storyId || stagingManifest.provider !== provider || stagingManifest.model !== model) {
    failures.push("Namefloor staging manifest has an invalid story or provider contract.");
  }
  const entries = stagingManifest.entries || {};
  if (Object.keys(entries).length !== targets.length) failures.push("Namefloor staging manifest target count does not match the canonical audible set.");
  for (const node of targets) {
    const entry = entries[node.nodeId];
    const expectedVoice = expectedVoices[node.speaker];
    if (!entry) {
      failures.push(`Missing staged entry for ${node.nodeId}.`);
      continue;
    }
    if (entry.speaker !== node.speaker || entry.voiceType !== expectedVoice) failures.push(`Speaker or voice mismatch for ${node.nodeId}.`);
    if (entry.textHash !== hash(normaliseForSpeech(node.spokenText))) failures.push(`Text hash mismatch for ${node.nodeId}.`);
    if (!isWav(path.join(root, entry.webPath || ""))) failures.push(`Invalid staged WAV for ${node.nodeId}.`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Namefloor staging voice contract check passed: 21 audited targets.");
