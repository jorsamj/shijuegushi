import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const readScript = (file, global) => { const context = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context); return context.window[global]; };
const story = readScript("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA");
const contract = readScript("assets/stories/dormitory-rollcall/broadcast-audio-contract.js", "DORMITORY_BROADCAST_AUDIO_CONTRACT");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/audio/voice-manifest.json"), "utf8"));
const rainManifest = JSON.parse(fs.readFileSync(path.join(root, "assets/stories/rain-call/audio/voice-manifest.json"), "utf8"));
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const spoken = (text) => String(text || "").replace(/[“”]/g, "").replace(/00:17/g, "零点十七分").replace(/00:44/g, "零点四十四分").replace(/01:13/g, "一点十三分").replace(/2014/g, "二零一四年").replace(/417/g, "四一七").replace(/\s+/g, " ").trim();
const failures = [];
const expected = [
  ...Object.values(story.nodes).filter((node) => node.text && node.type !== "choice").map((node) => [node.nodeId, spoken(node.text)]),
  ...Object.values(story.endings).map((ending) => [ending.endingId, spoken(ending.text)]),
  ...(contract.cues || []).map((cue) => [`broadcast__${cue.audioId}`, spoken(cue.line)]),
];
for (const [id, text] of expected) {
  const entry = manifest.entries?.[id];
  if (!entry || entry.status !== "generated") { failures.push(`${id} is missing a generated voice entry.`); continue; }
  if (entry.textHash !== hash(text)) failures.push(`${id} has a stale text hash.`);
  const absolutePath = path.join(root, entry.webPath || "");
  if (!fs.existsSync(absolutePath)) { failures.push(`${id} audio path does not exist.`); continue; }
  const audio = fs.readFileSync(absolutePath);
  if (audio.length < 256 || audio.subarray(0, 4).toString() !== "RIFF" || audio.subarray(8, 12).toString() !== "WAVE") failures.push(`${id} is not a valid non-empty WAV master.`);
}
const rainEntries = Object.values(rainManifest.entries || {});
if (rainEntries.length !== 138) failures.push(`Rain-call voice manifest must contain 138 entries; got ${rainEntries.length}.`);
for (const entry of rainEntries) {
  if (entry.status !== "generated") { failures.push(`${entry.id} is not generated.`); continue; }
  const absolutePath = path.join(root, entry.webPath || "");
  if (!fs.existsSync(absolutePath)) { failures.push(`${entry.id} rain-call audio path does not exist.`); continue; }
  const audio = fs.readFileSync(absolutePath);
  if (audio.length < 256 || audio.subarray(0, 4).toString() !== "RIFF" || audio.subarray(8, 12).toString() !== "WAVE") failures.push(`${entry.id} rain-call asset is not a valid non-empty WAV master.`);
}
if (failures.length) { console.error("Voice asset check failed:"); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Voice asset check passed. dormitoryEntries=${expected.length}; rainEntries=${rainEntries.length}; broadcastCues=${contract.cues.length}; endings=${Object.keys(story.endings).length}`);
