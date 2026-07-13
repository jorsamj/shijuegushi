import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/asset-manifest.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "asset-manifest.js" });
const manifest = context.window.SECOND_LIFE_DORMITORY_ASSETS;
const mapSource = fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-asset-map.js"), "utf8");
vm.runInNewContext(mapSource, context, { filename: "story-asset-map.js" });
const assetMap = context.window.DORMITORY_ROLLCALL_ASSET_MAP;
const failures = [];

if (!manifest || manifest.storyId !== "script_dormitory_rollcall") failures.push("Dormitory asset manifest is missing its story identity.");
const requiredGroups = {
  backgrounds: 9,
  characters: 7,
  clues: 6,
  covers: 1,
};

for (const [groupName, minimumCount] of Object.entries(requiredGroups)) {
  const count = Object.keys(manifest?.[groupName] || {}).length;
  if (count < minimumCount) failures.push(`Dormitory ${groupName} has ${count} assets; at least ${minimumCount} are required before story mapping.`);
}

for (const group of Object.values(manifest || {})) {
  if (!group || typeof group !== "object" || Array.isArray(group)) continue;
  for (const asset of Object.values(group)) {
    if (!asset?.path) continue;
    if (!asset.path.startsWith("assets/stories/dormitory-rollcall/")) failures.push(`${asset.assetId} escapes the independent dormitory asset namespace.`);
    if (!fs.existsSync(path.join(root, asset.path))) failures.push(`${asset.assetId} is missing: ${asset.path}`);
    if (asset.visualQa !== "manual-confirmed") failures.push(`${asset.assetId} lacks a visual QA disposition.`);
  }
}

if (!assetMap || assetMap.scriptId !== "script_dormitory_rollcall") {
  failures.push("Dormitory story asset map is missing its script identity.");
}

function collectPaths(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectPaths);
}

for (const assetPath of collectPaths(assetMap)) {
  if (!assetPath.startsWith("assets/stories/dormitory-rollcall/")) continue;
  if (!fs.existsSync(path.join(root, assetPath))) failures.push(`Asset map references a missing file: ${assetPath}`);
}

for (const clueId of [
  "dorm_clue_broadcast_recording",
  "dorm_clue_417_roster",
  "dorm_clue_pre_blackout_video",
  "dorm_clue_mirror_name",
  "dorm_clue_2014_fire_record",
  "dorm_clue_handwritten_rule",
]) {
  if (!assetMap?.clues?.[clueId]?.image) failures.push(`Dormitory asset map lacks ${clueId}.`);
}

if (failures.length) {
  console.error("Dormitory asset library check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory asset library check passed.");
