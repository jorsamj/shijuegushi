import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
for (const file of ["asset-manifest.js", "story-asset-map.js"]) {
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall", file), "utf8"),
    context,
    { filename: file },
  );
}

const manifest = context.window.SECOND_LIFE_DORMITORY_ASSETS;
const map = context.window.DORMITORY_ROLLCALL_ASSET_MAP;
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const requiredScenes = [
  "dorm_417_normal", "dorm_417_lights_out", "dorm_417_blackout", "dorm_415_room", "dorm_419_room",
  "dorm_floor4_corridor", "dorm_floor4_red", "dorm_corridor_peephole", "dorm_door_blood",
  "dorm_stairwell", "dorm_east_passage", "dorm_west_stairs", "dorm_manager_office",
  "dorm_broadcast_room", "dorm_exit_gate", "dorm_outside_dawn",
];
const requiredCharacters = ["xutang", "linsui", "zhaoqing", "chenlu", "shenyan", "manager_wu", "zhouwanning"];
const requiredEndings = [
  "dorm_ending_true_dawn", "dorm_ending_linsui_door", "dorm_ending_left_behind", "dorm_ending_legal_count",
  "dorm_ending_second_xutang", "dorm_ending_three_online", "dorm_ending_east_passage", "dorm_ending_broken_broadcast",
];

assert(manifest?.productionSet === "dormitory-rework-v2", "Asset manifest must identify the v2 production set.");
for (const sceneId of requiredScenes) assert(map?.scenes?.[sceneId]?.bg, `Missing mapped production scene: ${sceneId}.`);
for (const endingId of requiredEndings) assert(map?.endings?.[endingId]?.image, `Missing independent ending image: ${endingId}.`);

for (const characterId of requiredCharacters) {
  const character = map?.characters?.[characterId];
  const variants = Object.keys(character?.variants || {});
  assert(character?.image, `${characterId} needs a production base portrait.`);
  assert(variants.length >= 3, `${characterId} needs at least three directed state variants.`);
  assert(character?.continuity?.face && character?.continuity?.hair && character?.continuity?.wardrobe, `${characterId} needs face, hair and wardrobe continuity metadata.`);
}

function collectAssets(group) {
  return Object.values(manifest?.[group] || {});
}

for (const group of ["backgrounds", "characters", "phoneMedia", "endingScenes", "effects"]) {
  assert(manifest?.[group] && typeof manifest[group] === "object", `Asset manifest needs ${group}.`);
  for (const asset of collectAssets(group)) {
    assert(asset.path?.startsWith("assets/stories/dormitory-rollcall/"), `${asset.assetId || asset.path} escapes the dormitory namespace.`);
    assert(asset.path && fs.existsSync(path.join(root, asset.path)), `${asset.assetId || asset.path} is missing.`);
    assert(asset.productionStatus === "candidate", `${asset.assetId || asset.path} needs candidate status.`);
    assert(asset.source === "project-generated", `${asset.assetId || asset.path} needs a project-generated source record.`);
  }
}

assert(collectAssets("backgrounds").length >= 16, "The v2 world needs at least 16 continuous environment backgrounds.");
assert(collectAssets("characters").length >= 25, "The v2 cast needs at least 25 directed portrait/state assets.");
assert(collectAssets("phoneMedia").length >= 10, "The phone narrative needs at least 10 visual media assets.");
assert(collectAssets("endingScenes").length === 8, "The eight endings need eight independent images.");

if (failures.length) {
  console.error("Dormitory visual world check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory visual world check passed.");
console.log(`backgrounds=${collectAssets("backgrounds").length}`);
console.log(`characters=${collectAssets("characters").length}`);
console.log(`phoneMedia=${collectAssets("phoneMedia").length}`);
console.log(`endingScenes=${collectAssets("endingScenes").length}`);
