import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "assets/stories/dormitory-namefloor/formal/visual-manifest.js");
const mapPath = path.join(root, "assets/stories/dormitory-namefloor/story-asset-map.js");
const endingIds = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"];
const bannedLegacy = /(?:xutang|linsui|zhaoqing|chenlu|shenyan|zhouwanning|dormitory-rollcall)/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadBrowserScript(filePath, key) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), context, { filename: filePath });
  return context.window[key];
}

assert(fs.existsSync(manifestPath), "formal visual manifest is missing");
const manifest = loadBrowserScript(manifestPath, "DORMITORY_NAMEFLOOR_FORMAL_VISUALS");
assert(manifest?.version, "formal visual manifest is invalid");
assert(manifest?.generation?.model === "gpt-image-2", "formal generation model must be gpt-image-2");
assert(Array.isArray(manifest.assets) && manifest.assets.length >= 20, "full formal visual contract incomplete: character expression variants, remaining reusable backgrounds, phone/prop media, and E2-E8 key art are not yet generated");

const ids = new Set();
const paths = new Set();
for (const asset of manifest.assets) {
  assert(asset?.id && /^[a-z0-9][a-z0-9_-]*$/.test(asset.id), `invalid formal asset id: ${asset?.id}`);
  assert(!ids.has(asset.id), `duplicate formal asset id: ${asset.id}`);
  ids.add(asset.id);
  assert(typeof asset.path === "string" && asset.path.startsWith("assets/stories/dormitory-namefloor/formal/"), `asset outside formal namespace: ${asset.id}`);
  assert(!bannedLegacy.test(asset.path) && !bannedLegacy.test(asset.id), `legacy reference in formal asset: ${asset.id}`);
  assert(!paths.has(asset.path), `duplicate formal asset path: ${asset.path}`);
  paths.add(asset.path);
  const absolute = path.join(root, asset.path);
  assert(fs.existsSync(absolute) && fs.statSync(absolute).size > 0, `missing or empty formal asset: ${asset.path}`);
  assert(asset.phoneTextPolicy === "media-only" || asset.category !== "phone", `phone asset must be media-only: ${asset.id}`);
}

for (const endingId of endingIds) {
  const ending = manifest.endings?.[endingId];
  assert(ending && ids.has(ending.assetId), `missing ending formal asset mapping: ${endingId}`);
}
assert(new Set(endingIds.map((id) => manifest.endings[id].assetId)).size === endingIds.length, "ending formal images must be independent");

const visualMap = loadBrowserScript(mapPath, "DORMITORY_NAMEFLOOR_ASSET_MAP");
for (const endingId of endingIds) {
  const formal = visualMap?.endings?.[endingId]?.formalImage;
  assert(formal?.status === "formal-image" && paths.has(formal.path), `ending map does not use formal image: ${endingId}`);
}
for (const name of ["林峰", "周朝阳", "谷雨", "宋明", "吴阿姨", "红色马甲宿管"]) {
  const formal = visualMap?.characters?.[name]?.formalImage;
  assert(formal?.status === "formal-image" && paths.has(formal.path), `character map does not use formal image: ${name}`);
}
for (const sceneId of ["namefloor_dorm_midnight", "namefloor_manager_room", "namefloor_floor_four", "namefloor_fixed_count_archives", "namefloor_final_two_lins"]) {
  const formal = visualMap?.scenes?.[sceneId]?.formalImage;
  assert(formal?.status === "formal-image" && paths.has(formal.path), `scene map does not use formal image: ${sceneId}`);
}

console.log(`formal visuals OK: ${manifest.assets.length} assets, ${endingIds.length} independent ending images`);
