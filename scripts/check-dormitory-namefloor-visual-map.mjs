import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const storyDir = path.join(root, "assets", "stories", "dormitory-namefloor");
const dataPath = path.join(storyDir, "story-data.js");
const chaptersPath = path.join(storyDir, "story-chapters-2-7.js");
const mapPath = path.join(storyDir, "story-asset-map.js");
const cssPath = path.join(storyDir, "runtime-visuals.css");
const failures = [];
const formalImageGaps = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

function loadBrowserFile(filePath, context) {
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), context, { filename: filePath });
}

function mergeRuntime(base, expansion) {
  return {
    ...base,
    ...expansion,
    nodes: { ...(base?.nodes || {}), ...(expansion?.nodes || {}) },
    endings: { ...(base?.endings || {}), ...(expansion?.endings || {}) },
  };
}

function phoneViewIds(nodes) {
  return new Set(nodes
    .filter((node) => node.phoneScreen)
    .map((node) => `${node.phoneScreen.kind || "system"}:${node.phoneScreen.view || "main"}`));
}

function inspectFormalImage(entry, label) {
  const image = entry?.formalImage;
  assert(image && typeof image === "object", `${label} needs formalImage metadata.`);
  if (!image || typeof image !== "object") return;
  assert(image.status === "missing-formal-image" || image.status === "ready", `${label} formalImage.status must be missing-formal-image or ready.`);
  assert(typeof image.brief === "string" && image.brief.length >= 12, `${label} needs a usable formal-image brief.`);
  if (image.status === "ready") {
    assert(typeof image.path === "string" && image.path.startsWith("assets/stories/dormitory-namefloor/"), `${label} ready image must stay in the namefloor namespace.`);
    assert(fs.existsSync(path.join(root, image.path)), `${label} declares a missing formal image: ${image.path}`);
  } else {
    formalImageGaps.push(label);
  }
}

const context = { window: {}, console };
assert(fs.existsSync(dataPath), "Missing Chapter 1 runtime data.");
assert(fs.existsSync(chaptersPath), "Missing Chapters 2-7 runtime data.");
assert(fs.existsSync(mapPath), "Missing dormitory name-floor visual map.");
assert(fs.existsSync(cssPath), "Missing dormitory name-floor runtime CSS fallback file.");

if (fs.existsSync(dataPath) && fs.existsSync(chaptersPath) && fs.existsSync(mapPath)) {
  loadBrowserFile(dataPath, context);
  loadBrowserFile(chaptersPath, context);
  loadBrowserFile(mapPath, context);
}

const runtime = mergeRuntime(
  context.window.MIST_DORMITORY_NAMEFLOOR_DATA,
  context.window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7,
);
const map = context.window.DORMITORY_NAMEFLOOR_ASSET_MAP;
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";
const mapSource = fs.existsSync(mapPath) ? fs.readFileSync(mapPath, "utf8") : "";
const runtimeNodes = Object.values(runtime.nodes || {});
const runtimeSceneIds = [...new Set(runtimeNodes.map((node) => node.scene).filter(Boolean))].sort();
const runtimeEndingIds = Object.keys(runtime.endings || {}).sort();

assert(runtimeSceneIds.length > 0, "No runtime scene IDs were discovered.");
assert(runtimeEndingIds.length === 8, `Expected eight canonical endings; found ${runtimeEndingIds.length}.`);
assert(map?.version === "seven-chapter-visual-map-v1", "Visual map version must identify the seven-chapter mapping.");
assert(map?.world?.setting === "中国大学男生宿舍", "Visual map must identify the Chinese male university dormitory world.");
assert(map?.world?.primaryFormat === "portrait-9:16", "Visual map must declare portrait-first 9:16 framing.");
assert(mapSource.includes("runtime-visuals.css"), "Visual map must load its scoped runtime CSS without changing the shared entry page.");

const legacyTokens = ["dormitory-rollcall", "许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁", "女生宿舍", "417", "415", "419"];
const serializedMap = JSON.stringify(map || {});
for (const token of legacyTokens) assert(!serializedMap.includes(token), `Visual map contains forbidden legacy token: ${token}.`);
assert(!/\.(?:png|jpe?g|webp|avif|gif)(?:\?|\\")/i.test(serializedMap), "Visual map must not claim fake bitmap files while formal images are absent.");

const mappedSceneIds = Object.keys(map?.scenes || {}).sort();
assert(JSON.stringify(mappedSceneIds) === JSON.stringify(runtimeSceneIds), `Scene map must exactly cover all runtime scene IDs. expected=${runtimeSceneIds.length}; mapped=${mappedSceneIds.length}.`);

const runtimePhoneViews = [...phoneViewIds(runtimeNodes)].sort();
const mappedPhoneViews = Object.keys(map?.phoneViews || {}).sort();
assert(JSON.stringify(mappedPhoneViews) === JSON.stringify(runtimePhoneViews), `Phone UI map must exactly cover runtime phone views. expected=${runtimePhoneViews.join(",")}; mapped=${mappedPhoneViews.join(",")}.`);
for (const phoneViewId of runtimePhoneViews) {
  const phoneView = map?.phoneViews?.[phoneViewId];
  assert(phoneView && typeof phoneView === "object", `Missing phone UI metadata: ${phoneViewId}.`);
  if (!phoneView) continue;
  assert(typeof phoneView.title === "string" && phoneView.title.length >= 4, `${phoneViewId} needs a Chinese UI title.`);
  assert(typeof phoneView.layout === "string", `${phoneViewId} needs a portrait phone layout token.`);
  assert(typeof phoneView.anomaly === "string" && phoneView.anomaly.length >= 4, `${phoneViewId} needs an in-world anomaly direction.`);
}

for (const sceneId of runtimeSceneIds) {
  const scene = map?.scenes?.[sceneId];
  const sceneNodes = runtimeNodes.filter((node) => node.scene === sceneId);
  const expectedPhoneViews = [...phoneViewIds(sceneNodes)].sort();
  assert(scene && typeof scene === "object", `Missing scene metadata: ${sceneId}.`);
  if (!scene) continue;
  assert(typeof scene.title === "string" && scene.title.length >= 4, `${sceneId} needs a Chinese scene title.`);
  assert(typeof scene.cssClass === "string" && /^nf-scene-/.test(scene.cssClass), `${sceneId} needs an nf-scene CSS fallback class.`);
  assert(css.includes(`.${scene.cssClass}`), `${sceneId} CSS fallback class is not defined in runtime-visuals.css.`);
  assert(scene.portrait?.aspectRatio === "9:16", `${sceneId} must declare 9:16 portrait framing.`);
  assert(typeof scene.portrait?.mobileSafeZone === "string", `${sceneId} needs a mobile dialogue safe-zone declaration.`);
  assert(typeof scene.audio?.ambience === "string" && typeof scene.audio?.cue === "string", `${sceneId} needs ambience and cue metadata.`);
  assert(Array.isArray(scene.effects) && scene.effects.length > 0, `${sceneId} needs at least one visual/effect cue.`);
  const phoneViews = Array.isArray(scene.phoneViews) ? scene.phoneViews : null;
  assert(Boolean(phoneViews), `${sceneId} needs phoneViews metadata, even when empty.`);
  if (phoneViews) assert(JSON.stringify([...phoneViews].sort()) === JSON.stringify(expectedPhoneViews), `${sceneId} phoneViews must match its runtime phone UI views. expected=${expectedPhoneViews.join(",") || "none"}.`);
  inspectFormalImage(scene, `scene:${sceneId}`);
}

const mappedEndingIds = Object.keys(map?.endings || {}).sort();
assert(JSON.stringify(mappedEndingIds) === JSON.stringify(runtimeEndingIds), `Ending map must exactly cover all canonical endings. expected=${runtimeEndingIds.join(",")}; mapped=${mappedEndingIds.join(",")}.`);
for (const endingId of runtimeEndingIds) {
  const ending = map?.endings?.[endingId];
  assert(ending && typeof ending === "object", `Missing ending metadata: ${endingId}.`);
  if (!ending) continue;
  assert(ending.title === runtime.endings[endingId].title, `${endingId} title must match canonical runtime data.`);
  assert(typeof ending.cssClass === "string" && /^nf-ending-/.test(ending.cssClass), `${endingId} needs an nf-ending CSS class.`);
  assert(css.includes(`.${ending.cssClass}`), `${endingId} CSS class is not defined in runtime-visuals.css.`);
  assert(ending.portrait?.aspectRatio === "9:16", `${endingId} must declare 9:16 portrait framing.`);
  assert(typeof ending.audio?.ambience === "string" && typeof ending.audio?.cue === "string", `${endingId} needs audio metadata.`);
  assert(Array.isArray(ending.effects) && ending.effects.length > 0, `${endingId} needs effect metadata.`);
  inspectFormalImage(ending, `ending:${endingId}`);
}

if (failures.length) {
  console.error("Dormitory name-floor visual-map check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory name-floor visual-map check passed.");
console.log(`runtimeScenes=${runtimeSceneIds.length}; endings=${runtimeEndingIds.length}; cssFallbacks=${runtimeSceneIds.length + runtimeEndingIds.length}`);
console.warn(`FORMAL IMAGE GAPS (${formalImageGaps.length}): ${formalImageGaps.join(", ")}`);
