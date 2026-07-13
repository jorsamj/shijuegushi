import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/broadcast-audio-contract.js"), "utf8"),
  context,
  { filename: "broadcast-audio-contract.js" }
);

const contract = context.window.DORMITORY_BROADCAST_AUDIO_CONTRACT;
const storyContext = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8"),
  storyContext,
  { filename: "dormitory-story-data.js" }
);
const story = storyContext.window.MIST_DORMITORY_DATA;
const manifestPath = path.join(root, "docs/DORMITORY_BROADCAST_DELIVERY_MANIFEST.md");
const signoffPath = path.join(root, "docs/DORMITORY_RELEASE_SIGNOFF.md");
const manifest = fs.readFileSync(manifestPath, "utf8");
const signoff = fs.readFileSync(signoffPath, "utf8");
const failures = [];
const requiredIds = [
  "dorm_broadcast_rollcall_start",
  "dorm_broadcast_public_rules",
  "dorm_broadcast_current_count",
  "dorm_broadcast_bed_call",
  "dorm_broadcast_unlisted_person",
  "dorm_broadcast_deadline_0113",
  "dorm_broadcast_correction_prompt",
  "dorm_broadcast_restore_zhou",
  "dorm_broadcast_restore_xutang",
  "dorm_broadcast_rollcall_complete",
  "dorm_broadcast_ending_a",
  "dorm_broadcast_ending_b",
  "dorm_broadcast_ending_c",
  "dorm_broadcast_ending_d",
];

const idsIn = (text) => [...text.matchAll(/`(dorm_broadcast_[a-z0-9_]+)`/g)].map((match) => match[1]);
const exactSet = (values) => new Set(values).size === values.length && values.length === requiredIds.length && requiredIds.every((id) => values.includes(id));
const contractIds = contract?.cues?.map((cue) => cue.audioId) || [];

if (!contract?.cues?.length) failures.push("Dormitory broadcast delivery contract is missing.");
if (!exactSet(contractIds)) failures.push("The formal contract must contain exactly the required 14 unique audio IDs.");
if (!exactSet(idsIn(manifest))) failures.push("The delivery manifest must list exactly the 14 contract audio IDs, one per slot.");
if (!exactSet(idsIn(signoff))) failures.push("The release sign-off must contain exactly the 14 contract audio IDs, one per slot.");
for (const audioId of requiredIds) {
  const cue = contract?.cues?.find((item) => item.audioId === audioId);
  if (!cue) {
    failures.push(`Missing required broadcast slot: ${audioId}.`);
    continue;
  }
  for (const field of ["chapterIds", "nodeIds", "line", "tone", "durationSeconds", "recommendedFileName", "skippable", "stopPolicy", "deliveryStatus", "licenceSource", "publicDistributionAllowed", "commercialDistributionAllowed", "listeningSignoff"]) {
    if (!(field in cue)) failures.push(`${audioId} is missing ${field}.`);
  }
  if (cue.deliveryStatus === "awaiting-authorised-human-recording" && cue.filePath !== null) failures.push(`${audioId} must not point at an unapproved file.`);
  if (cue.loop !== false) failures.push(`${audioId} must be a non-looping broadcast cue.`);
  if (cue.recommendedFileName !== `${audioId}_zh-CN.mp3`) failures.push(`${audioId} must use its canonical recommended filename.`);
  if (typeof cue.skippable !== "boolean") failures.push(`${audioId} must explicitly declare whether playback is skippable.`);
  for (const nodeId of cue.nodeIds || []) {
    const node = story?.nodes?.[nodeId];
    const ending = story?.endings?.[nodeId];
    if (!node && !ending) failures.push(`${audioId} targets missing story node or ending ${nodeId}.`);
    if (node && !(cue.chapterIds || []).includes(node.chapterId)) failures.push(`${audioId} chapter mapping does not include ${node.chapterId}.`);
    if (ending && !(cue.chapterIds || []).includes("ending")) failures.push(`${audioId} must use the ending chapter marker.`);
  }
}

const textExtensions = new Set([".js", ".mjs", ".html", ".md", ".json", ".css"]);
function scanText(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "library") return [];
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return scanText(file);
    if (!textExtensions.has(path.extname(entry.name))) return [];
    return [{ file, content: fs.readFileSync(file, "utf8") }];
  });
}
const prohibitedName = ["周", "晚", "宁"].join("");
const nameErrors = scanText(root).filter((item) => item.content.includes(prohibitedName));
if (nameErrors.length) failures.push(`The formal Chinese name is 周婉宁; found the prohibited variant in ${nameErrors.map((item) => path.relative(root, item.file)).join(", ")}.`);
if (!contract?.cues?.some((cue) => cue.line.includes("周婉宁"))) failures.push("The broadcast contract must use the formal name 周婉宁.");

if (failures.length) {
  console.error("Dormitory broadcast contract check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory broadcast contract check passed.");
console.log(`slots=${contract.cues.length}; awaiting=${contract.cues.filter((cue) => cue.deliveryStatus === "awaiting-authorised-human-recording").length}`);
