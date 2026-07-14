import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const provider = "volcengine-doubao-tts-websocket";
const model = "seed-tts-2.0";
const dryRun = process.argv.includes("--dry-run");
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const stories = [
  { scriptId: "script_rain_call", dataFile: "story-data.js", global: "MIST_DATA", audioRoot: "assets/stories/rain-call/audio" },
  { scriptId: "script_dormitory_rollcall", dataFile: "assets/stories/dormitory-rollcall/story-data.js", global: "MIST_DORMITORY_DATA", audioRoot: "assets/stories/dormitory-rollcall/audio" },
];

if (process.argv.some((argument) => argument !== process.argv[0] && argument !== process.argv[1] && argument !== "--dry-run")) {
  throw new Error("Usage: node scripts/promote-volcengine-voice-delivery.mjs [--dry-run]");
}

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

function loadScript(file, globalName) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context.window[globalName];
}

function normaliseForSpeech(text) {
  return String(text || "")
    .replace(/[\u201c\u201d"]/g, "")
    .replace(/00:17/g, "\u96f6\u70b9\u5341\u4e03\u5206")
    .replace(/00:44/g, "\u96f6\u70b9\u56db\u5341\u56db\u5206")
    .replace(/01:13/g, "\u4e00\u70b9\u5341\u4e09\u5206")
    .replace(/2014/g, "\u4e8c\u96f6\u4e00\u56db\u5e74")
    .replace(/417/g, "\u56db\u4e00\u4e03")
    .replace(/\s+/g, " ")
    .trim();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isValidWav(file) {
  if (!fs.existsSync(file)) return false;
  const audio = fs.readFileSync(file);
  return audio.length >= 256 && audio.subarray(0, 4).toString() === "RIFF" && audio.subarray(8, 12).toString() === "WAVE";
}

const catalog = readJson(path.join(root, "assets/volcengine-tts2-voice-catalog.json"));
const verifiedVoiceTypes = new Set((catalog.voices || [])
  .filter((voice) => voice.model === "Doubao Voice Synthesis Model 2.0" && voice.modelStatus === "verified")
  .map((voice) => voice.voiceType));
const broadcastContract = loadScript("assets/stories/dormitory-rollcall/broadcast-audio-contract.js", "DORMITORY_BROADCAST_AUDIO_CONTRACT");
const contractCues = new Map((broadcastContract?.cues || []).map((cue) => [cue.audioId, cue]));

function validFormalEntry(entry, sourceRoot, expectedSpeech) {
  const file = path.join(sourceRoot, entry?.fileName || "");
  return entry?.status === "generated"
    && entry.provider === provider
    && entry.model === model
    && typeof entry.voiceType === "string"
    && entry.voiceType.endsWith("_uranus_bigtts")
    && verifiedVoiceTypes.has(entry.voiceType)
    && !Object.hasOwn(entry, "emotion")
    && !Object.hasOwn(entry, "emotionIntensity")
    && entry.textHash === hash(normaliseForSpeech(expectedSpeech))
    && isValidWav(file);
}

function validateStaging() {
  const failures = [];
  const prepared = [];
  for (const story of stories) {
    const stageDirectory = path.join(root, story.audioRoot, "voice-staging");
    const stageManifest = path.join(root, story.audioRoot, "voice-staging-manifest.json");
    if (!fs.existsSync(stageManifest)) {
      failures.push(`${story.scriptId} is missing voice-staging-manifest.json.`);
      continue;
    }
    const manifest = readJson(stageManifest);
    const data = loadScript(story.dataFile, story.global);
    const expectedNodes = Object.values(data.nodes || {}).filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true && node.spokenText);
    for (const node of expectedNodes) {
      const entry = manifest.entries?.[node.nodeId];
      if (!validFormalEntry(entry, stageDirectory, node.spokenText) || entry.kind !== "node") {
        failures.push(`${story.scriptId}:${node.nodeId} is missing or invalid in staging.`);
      }
    }
    if (story.scriptId === "script_dormitory_rollcall") {
      for (const [cueId, cue] of contractCues) {
        const entry = manifest.entries?.[cueId];
        const sameAnchors = Array.isArray(entry?.nodeIds) && entry.nodeIds.length === cue.nodeIds.length && entry.nodeIds.every((nodeId) => cue.nodeIds.includes(nodeId));
        if (!validFormalEntry(entry, stageDirectory, cue.line) || entry.kind !== "broadcast-cue" || !sameAnchors) {
          failures.push(`${story.scriptId}:cue:${cueId} is missing or invalid in staging.`);
        }
      }
    }
    prepared.push({ story, manifest, stageDirectory, stageManifest });
  }
  if (failures.length) throw new Error(`Formal voice staging is incomplete:\n${failures.slice(0, 30).map((failure) => `- ${failure}`).join("\n")}${failures.length > 30 ? `\n- (+${failures.length - 30} more)` : ""}`);
  return prepared;
}

function writeJsonAtomically(file, value) {
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
}

function runNode(script, args = []) {
  const result = childProcess.spawnSync(process.execPath, [script, ...args], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${script} failed.`);
}

function buildPromotedManifest(prepared) {
  const entries = {};
  for (const entry of Object.values(prepared.manifest.entries || {})) {
    if (entry.kind !== "node" && entry.kind !== "broadcast-cue") continue;
    entries[entry.id] = {
      ...entry,
      webPath: `${prepared.story.audioRoot}/voice-original/${entry.fileName}`,
    };
  }
  return {
    version: 4,
    provider,
    model,
    storyId: prepared.story.scriptId,
    entries,
  };
}

function restore(records, runtimeBackup) {
  for (const record of records.reverse()) {
    if (record.liveReplaced && fs.existsSync(record.finalDirectory)) fs.rmSync(record.finalDirectory, { recursive: true, force: true });
    if (record.legacyMoved && record.legacyDirectory && fs.existsSync(record.legacyDirectory)) fs.renameSync(record.legacyDirectory, record.finalDirectory);
    if (record.manifestWritten && record.manifestBackup) fs.writeFileSync(record.finalManifest, record.manifestBackup);
    else if (record.manifestWritten && fs.existsSync(record.finalManifest)) fs.rmSync(record.finalManifest, { force: true });
    if (fs.existsSync(record.temporaryDirectory)) fs.rmSync(record.temporaryDirectory, { recursive: true, force: true });
  }
  fs.writeFileSync(path.join(root, "assets/voice-runtime-manifest.js"), runtimeBackup);
}

function promote(prepared) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runtimeFile = path.join(root, "assets/voice-runtime-manifest.js");
  const runtimeBackup = fs.readFileSync(runtimeFile);
  const records = [];
  try {
    for (const item of prepared) {
      const audioDirectory = path.join(root, item.story.audioRoot);
      const temporaryDirectory = path.join(audioDirectory, `voice-promotion-${process.pid}-${stamp}`);
      const finalDirectory = path.join(audioDirectory, "voice-original");
      const finalManifest = path.join(audioDirectory, "voice-manifest.json");
      const legacyDirectory = fs.existsSync(finalDirectory) ? path.join(audioDirectory, `voice-legacy-xfyun-${stamp}`) : null;
      const manifestBackup = fs.existsSync(finalManifest) ? fs.readFileSync(finalManifest) : null;
      const record = {
        finalDirectory,
        legacyDirectory,
        finalManifest,
        manifestBackup,
        temporaryDirectory,
        legacyMoved: false,
        liveReplaced: false,
        manifestWritten: false,
      };
      records.push(record);
      fs.cpSync(item.stageDirectory, temporaryDirectory, { recursive: true });
      if (legacyDirectory) {
        fs.renameSync(finalDirectory, legacyDirectory);
        record.legacyMoved = true;
      }
      fs.renameSync(temporaryDirectory, finalDirectory);
      record.liveReplaced = true;
      writeJsonAtomically(finalManifest, buildPromotedManifest(item));
      record.manifestWritten = true;
    }
    runNode("scripts/refresh-voice-runtime.mjs");
    runNode("scripts/check-formal-volcengine-voice-contract.mjs", ["--require-delivery"]);
  } catch (error) {
    restore(records, runtimeBackup);
    throw error;
  }
}

const prepared = validateStaging();
if (dryRun) {
  console.log(`Formal Volcengine staging is complete: ${prepared.map((item) => item.story.scriptId).join(", ")}.`);
} else {
  promote(prepared);
  console.log("Formal Volcengine delivery promoted atomically.");
}
