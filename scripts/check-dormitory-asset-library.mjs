import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const storyRoot = "assets/stories/dormitory-rollcall";
const context = { window: {} };

for (const file of ["asset-manifest.js", "story-asset-map.js", "story-data.js"]) {
  vm.runInNewContext(
    fs.readFileSync(path.join(root, storyRoot, file), "utf8"),
    context,
    { filename: file },
  );
}

const manifest = context.window.SECOND_LIFE_DORMITORY_ASSETS;
const assetMap = context.window.DORMITORY_ROLLCALL_ASSET_MAP;
const story = context.window.MIST_DORMITORY_DATA;
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const entries = (group) => Object.entries(manifest?.[group] || {});
const values = (group) => entries(group).map(([, asset]) => asset);

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
const allowedFraming = new Set(["bust", "half", "close", "full"]);

function readImageDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    const payload = offset + 8;
    if (type === "VP8X" && payload + 10 <= buffer.length) {
      return {
        width: 1 + buffer.readUIntLE(payload + 4, 3),
        height: 1 + buffer.readUIntLE(payload + 7, 3),
      };
    }
    if (type === "VP8L" && payload + 5 <= buffer.length && buffer[payload] === 0x2f) {
      const bits = buffer.readUInt32LE(payload + 1);
      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff),
      };
    }
    if (type === "VP8 " && payload + 10 <= buffer.length && buffer.toString("hex", payload + 3, payload + 6) === "9d012a") {
      return {
        width: buffer.readUInt16LE(payload + 6) & 0x3fff,
        height: buffer.readUInt16LE(payload + 8) & 0x3fff,
      };
    }
    offset = payload + length + (length % 2);
  }
  return null;
}

function checkAsset(group, key, asset) {
  const label = asset?.assetId || `${group}.${key}`;
  assert(asset?.path?.startsWith(`${storyRoot}/`), `${label} escapes the dormitory namespace.`);
  assert(asset?.productionStatus === "candidate", `${label} needs candidate production status.`);
  assert(asset?.source === "project-generated", `${label} needs a project-generated source record.`);
  assert(["pending", "manual-confirmed"].includes(asset?.visualQa), `${label} needs an honest visual QA disposition.`);
  assert(asset?.dimensions?.width === 1080 && asset?.dimensions?.height === 1920, `${label} must declare 1080x1920 dimensions.`);

  if (!asset?.path) return;
  const absolutePath = path.join(root, asset.path);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${label} is missing: ${asset.path}`);
    return;
  }
  const dimensions = readImageDimensions(absolutePath);
  assert(dimensions, `${label} is not a readable PNG or WebP image.`);
  if (dimensions) {
    assert(dimensions.width === 1080 && dimensions.height === 1920, `${label} is ${dimensions.width}x${dimensions.height}; expected 1080x1920.`);
  }
}

assert(manifest?.storyId === "script_dormitory_rollcall", "Dormitory asset manifest is missing its story identity.");
assert(manifest?.assetSet === "dormitory-rework-v2", "Dormitory manifest must identify assetSet dormitory-rework-v2.");
assert(manifest?.productionSet === manifest?.assetSet, "productionSet must remain a compatibility alias of assetSet.");
assert(manifest?.canvas?.width === 1080 && manifest?.canvas?.height === 1920, "Dormitory canvas must be 1080x1920.");
assert(manifest?.canvas?.aspectRatio === "9:16", "Dormitory canvas must declare a 9:16 aspect ratio.");
assert(manifest?.orientation === "portrait", "Dormitory assets must declare portrait orientation.");
assert(manifest?.mobileSafeZone?.width > 0 && manifest?.mobileSafeZone?.height > 0, "Dormitory manifest needs a mobile safe zone.");
assert(manifest?.phoneRendering?.shell === "dom" && manifest?.phoneRendering?.text === "dom", "Phone shell and player-visible text must remain DOM-rendered.");

for (const group of ["backgrounds", "characterVariants", "phoneMedia", "endingScenes", "effects"]) {
  assert(manifest?.[group] && typeof manifest[group] === "object", `Asset manifest needs ${group}.`);
  for (const [key, asset] of entries(group)) checkAsset(group, key, asset);
}

assert(values("backgrounds").length >= 17, "The v2 world needs all 17 story environment backgrounds.");
for (const sceneId of requiredScenes) {
  assert(manifest?.backgrounds?.[sceneId], `Manifest is missing formal scene ${sceneId}.`);
  assert(assetMap?.scenes?.[sceneId]?.bg === manifest?.backgrounds?.[sceneId]?.path, `Scene ${sceneId} is not mapped to its manifest path.`);
}
const storySceneIds = new Set(Object.values(story?.nodes || {}).map((node) => node.scene).filter(Boolean));
for (const sceneId of storySceneIds) {
  assert(manifest?.backgrounds?.[sceneId], `Story scene ${sceneId} is absent from the v2 manifest.`);
  assert(assetMap?.scenes?.[sceneId]?.bg, `Story scene ${sceneId} has no runtime background mapping.`);
}

assert(values("characterVariants").length >= 25, "The v2 cast needs at least 25 directed portrait variants.");
for (const characterId of requiredCharacters) {
  const character = assetMap?.characters?.[characterId];
  const variantEntries = Object.entries(character?.variants || {});
  assert(character?.image, `${characterId} needs a production base portrait.`);
  assert(variantEntries.length >= 3, `${characterId} needs at least three directed variants.`);
  assert(character?.continuity?.face && character?.continuity?.hair && character?.continuity?.wardrobe, `${characterId} needs face, hair and wardrobe continuity metadata.`);
  for (const [variantKey, variantPath] of variantEntries) {
    const manifestKey = `${characterId}_${variantKey}`;
    const variant = manifest?.characterVariants?.[manifestKey];
    assert(variant?.path === variantPath, `${characterId}.${variantKey} is inconsistent with ${manifestKey}.`);
    assert(variant?.continuity?.profileId === characterId, `${manifestKey} needs per-variant continuity metadata.`);
    assert(allowedFraming.has(variant?.framing), `${manifestKey} uses unsupported framing ${variant?.framing}.`);
    assert(Number.isFinite(variant?.eyeAnchor?.x) && Number.isFinite(variant?.eyeAnchor?.y), `${manifestKey} needs an eye anchor.`);
    assert(Number.isFinite(variant?.faceAnchor?.x) && Number.isFinite(variant?.faceAnchor?.y), `${manifestKey} needs a face anchor.`);
  }
}
for (const node of Object.values(story?.nodes || {})) {
  for (const member of node.visualCast || []) {
    assert(assetMap?.characters?.[member.characterId]?.variants?.[member.variant], `${node.nodeId} references unmapped portrait ${member.characterId}.${member.variant}.`);
  }
}

assert(values("phoneMedia").length >= 12, "The phone narrative needs at least 12 media assets.");
const mappedPhoneKeys = new Set(Object.values(assetMap?.phoneScreenMedia || {}).flat());
for (const [mediaKey, asset] of entries("phoneMedia")) {
  assert(asset.path.startsWith(`${storyRoot}/phone-v2/`), `${mediaKey} must live under phone-v2.`);
  assert(asset.bakedText === false, `${mediaKey} must explicitly prohibit baked player-visible text.`);
  assert(assetMap?.phoneMedia?.[mediaKey] === asset.path, `${mediaKey} is not consistently mapped.`);
  assert(mappedPhoneKeys.has(mediaKey), `${mediaKey} is not assigned to a story phone beat.`);
}

assert(values("endingScenes").length === 8, "The eight endings need exactly eight independent images.");
assert(new Set(values("endingScenes").map((asset) => asset.path)).size === 8, "Ending image paths must be unique.");
for (const endingId of requiredEndings) {
  const manifestAsset = manifest?.endingScenes?.[endingId];
  const mappedEnding = assetMap?.endings?.[endingId];
  assert(manifestAsset, `Manifest is missing ${endingId}.`);
  assert(mappedEnding?.image === manifestAsset?.path, `${endingId} is not mapped to its independent image.`);
  assert(String(mappedEnding || "") === manifestAsset?.path, `${endingId} must remain string-coercible for the generic runtime adapter.`);
  assert(story?.endings?.[endingId]?.imageKey === endingId, `${endingId} story imageKey is inconsistent.`);
}

for (const [effectKey, asset] of entries("effects")) {
  assert(asset.path.startsWith(`${storyRoot}/effects-v2/`), `${effectKey} must live under effects-v2.`);
  assert(assetMap?.effects?.[effectKey] === asset.path, `${effectKey} is not consistently mapped.`);
}

for (const [group, minimum] of [["clues", 6], ["covers", 1]]) {
  assert(entries(group).length >= minimum, `Legacy-compatible ${group} assets must be preserved.`);
  for (const [key, asset] of entries(group)) {
    assert(asset?.path?.startsWith(`${storyRoot}/`), `${group}.${key} escapes the dormitory namespace.`);
    assert(asset?.path && fs.existsSync(path.join(root, asset.path)), `${group}.${key} is missing: ${asset?.path}`);
  }
}

if (failures.length) {
  console.error("Dormitory asset library check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory asset library check passed.");
console.log(`backgrounds=${values("backgrounds").length}`);
console.log(`characterVariants=${values("characterVariants").length}`);
console.log(`phoneMedia=${values("phoneMedia").length}`);
console.log(`endingScenes=${values("endingScenes").length}`);
console.log(`effects=${values("effects").length}`);
