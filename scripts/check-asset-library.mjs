import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const exists = (path) => fs.existsSync(new URL(path, root));
const failures = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function loadJs(path, globalName) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[globalName];
}

const manifest = loadJs("assets/asset-manifest.js", "SECOND_LIFE_ASSET_MANIFEST");
const storyMap = loadJs("assets/stories/rain-call/story-asset-map.js", "RAIN_CALL_ASSET_MAP");
const audioAssets = loadJs("assets/audio/audio-assets.js", "SECOND_LIFE_AUDIO");
const visuals = loadJs("assets/visual-assets.js", "SECOND_LIFE_VISUALS");

const allowedStatus = new Set([
  "generated-demo",
  "demo-usable",
  "needs-retake",
  "final-candidate",
  "story-only",
  "reusable",
  "deprecated",
]);

const requiredDocs = [
  "docs/REUSABLE_ASSET_INDEX.md",
  "docs/ASSET_LIBRARY_GUIDE.md",
  "docs/IMAGE_ASSET_REUSE_GUIDE.md",
  "docs/AUDIO_STYLE_QA_REPORT.md",
];

for (const doc of requiredDocs) assert(exists(doc), `${doc} is missing`);
assert(manifest && typeof manifest === "object", "asset manifest is missing");
assert(storyMap && typeof storyMap === "object", "rain-call story asset map is missing");

const flatAssets = [];
for (const [sectionName, section] of Object.entries(manifest || {})) {
  if (!section || typeof section !== "object") continue;
  for (const [key, asset] of Object.entries(section)) {
    if (!asset || typeof asset !== "object") continue;
    flatAssets.push({ key, sectionName, ...asset });
  }
}

const idCounts = new Map();
for (const asset of flatAssets) idCounts.set(asset.id, (idCounts.get(asset.id) || 0) + 1);

for (const asset of flatAssets) {
  assert(asset.id && typeof asset.id === "string", `${asset.key} must define id`);
  assert(idCounts.get(asset.id) === 1, `${asset.id} is duplicated in manifest`);
  assert(asset.type && typeof asset.type === "string", `${asset.id} must define type`);
  assert(asset.category && typeof asset.category === "string", `${asset.id} must define category`);
  assert(asset.path && typeof asset.path === "string", `${asset.id} must define path`);
  assert(asset.reusable !== undefined && typeof asset.reusable === "boolean", `${asset.id} must define boolean reusable`);
  assert(asset.scope && typeof asset.scope === "string", `${asset.id} must define scope`);
  assert(asset.description && typeof asset.description === "string", `${asset.id} must define description`);
  assert(asset.source && typeof asset.source === "string", `${asset.id} must define source`);
  assert(asset.status && allowedStatus.has(asset.status), `${asset.id} has invalid status ${asset.status}`);
  assert(!/^https?:\/\//i.test(asset.path), `${asset.id} must not use external URL`);
  assert(exists(asset.path), `${asset.id} path does not exist: ${asset.path}`);
  if (asset.scope.startsWith("story:")) assert(asset.reusable === false || asset.status === "story-only", `${asset.id} story-scoped assets should not be marked reusable`);
}

const reusableAudio = flatAssets.filter((asset) => asset.type === "audio" && asset.reusable === true);
const reusableVisual = flatAssets.filter((asset) => asset.type === "image" && asset.reusable === true);
const storyOnlyAssets = flatAssets.filter((asset) => asset.status === "story-only" || asset.scope.startsWith("story:"));
const deprecatedAssets = flatAssets.filter((asset) => asset.status === "deprecated");

assert(reusableAudio.length >= 20, `at least 20 audio assets must be reusable, got ${reusableAudio.length}`);
assert(reusableVisual.length >= 5, `at least 5 visual assets must be reusable, got ${reusableVisual.length}`);
assert(storyOnlyAssets.length >= 3, "story-specific character assets should be explicitly marked");
assert(storyOnlyAssets.length < flatAssets.length, "not all assets may be story-only");

const allAudioKeys = new Set([
  ...Object.keys(audioAssets.bgm || {}),
  ...Object.keys(audioAssets.ambience || {}),
  ...Object.keys(audioAssets.sfx || {}),
  ...Object.keys(audioAssets.stingers || {}),
]);
const manifestIds = new Set(flatAssets.map((asset) => asset.id));

for (const [storyKey, libraryKey] of Object.entries(storyMap.audioAliases || {})) {
  assert(allAudioKeys.has(storyKey), `story audio alias source key is missing from audio-assets.js: ${storyKey}`);
  assert(manifestIds.has(libraryKey), `story audio alias target is missing from manifest: ${libraryKey}`);
}
for (const [storyKey, libraryKey] of Object.entries(storyMap.backgroundAliases || {})) {
  assert(visuals.scenes?.[storyKey] || visuals.backgrounds?.[storyKey], `story background alias source key is missing from visual assets: ${storyKey}`);
  assert(manifestIds.has(libraryKey), `story background alias target is missing from manifest: ${libraryKey}`);
}
for (const libraryKey of Object.values(storyMap.characterAliases || {})) {
  assert(manifestIds.has(libraryKey), `story character alias target is missing from manifest: ${libraryKey}`);
}

const storyDataText = read("story-data.js");
for (const asset of deprecatedAssets) {
  assert(!storyDataText.includes(asset.id), `deprecated asset is directly referenced by story-data.js: ${asset.id}`);
}

const prohibitedAssetTerms = [/mario/i, /coin/i, /chiptune/i, /arcade/i, /8bit/i, /game_reward/i, /victory_jingle/i];
for (const asset of flatAssets) {
  for (const pattern of prohibitedAssetTerms) {
    assert(!pattern.test(asset.id), `${asset.id} uses prohibited playful audio wording`);
    assert(!pattern.test(asset.path), `${asset.id} path uses prohibited playful audio wording`);
  }
}

warn(flatAssets.some((asset) => asset.status === "needs-retake"), "no assets are currently marked needs-retake; confirm this is intentional");

if (failures.length) {
  console.error("Asset library check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("Asset library check warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("Asset library check passed.");
console.log(`assets=${flatAssets.length}, reusableAudio=${reusableAudio.length}, reusableVisual=${reusableVisual.length}, storyOnly=${storyOnlyAssets.length}`);
