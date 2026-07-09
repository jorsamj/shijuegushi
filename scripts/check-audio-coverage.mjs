import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const exists = (path) => fs.existsSync(new URL(path, root));
const stat = (path) => fs.statSync(new URL(path, root));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function loadWindowJs(path, globalName) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[globalName];
}

const DATA = loadWindowJs("story-data.js", "MIST_DATA");
const EXTERNAL = loadWindowJs("assets/external-audio-manifest.js", "SECOND_LIFE_EXTERNAL_AUDIO");
const VISUALS = loadWindowJs("assets/visual-assets.js", "SECOND_LIFE_VISUALS");
const scriptText = read("script.js");

assert(DATA?.nodes, "story-data.js must expose window.MIST_DATA.nodes");
assert(EXTERNAL?.meta?.status === "active", "external audio manifest must be active");
assert(VISUALS?.audio?.scenes, "visual scene audio config must be present");
assert(EXTERNAL?.meta?.playbackPolicy === "external-approved-only", "manifest playbackPolicy must be external-approved-only");
assert(EXTERNAL?.meta?.generatedRuntimeDefault === false, "generatedRuntimeDefault must be false");
assert(scriptText.includes("external-approved-only"), "script.js must default to external-approved-only");
assert(scriptText.includes("silent-no-approved-external"), "script.js must silently skip missing approved external audio");

const used = {
  bgm: new Map(),
  ambience: new Map(),
  sfx: new Map(),
  stingers: new Map(),
};

function add(category, key, nodeId) {
  if (!key) return;
  if (!used[category].has(key)) used[category].set(key, new Set());
  used[category].get(key).add(nodeId);
}

function cueKey(cue) {
  return typeof cue === "string" ? cue : cue?.key || "";
}

for (const [nodeId, node] of Object.entries(DATA.nodes || {})) {
  add("bgm", node.bgm, nodeId);
  add("ambience", node.ambience, nodeId);
  add("stingers", node.voiceStinger, nodeId);
  for (const cue of node.sfxOnEnter || []) add("sfx", cueKey(cue), nodeId);
  for (const cue of node.sfxOnChoice || []) add("sfx", cueKey(cue), nodeId);
  for (const choice of node.choices || []) {
    for (const cue of choice.sfxOnChoice || []) add("sfx", cueKey(cue), nodeId);
  }
}

for (const [sceneId, cue] of Object.entries(VISUALS?.audio?.scenes || {})) {
  add("bgm", cue.bgm, `visual:${sceneId}`);
  add("ambience", cue.ambience, `visual:${sceneId}`);
  const sceneSfx = Array.isArray(cue.sfx) ? cue.sfx : cue.sfx ? [cue.sfx] : [];
  for (const cue of sceneSfx) add("sfx", cueKey(cue), `visual:${sceneId}`);
}

function getExternalAsset(category, key) {
  const bucket = EXTERNAL?.[category] || {};
  return bucket[key] || Object.values(bucket).find((asset) => asset?.storyKey === key);
}

const rows = [];
for (const category of Object.keys(used)) {
  for (const [key, nodeSet] of [...used[category]].sort(([a], [b]) => a.localeCompare(b))) {
    const asset = getExternalAsset(category, key);
    const minBytes = category === "bgm" || category === "ambience" ? 50_000 : 2_000;
    assert(asset, `${category}.${key} is used but has no external asset`);
    if (asset) {
      assert(asset.status === "demo-approved" || asset.status === "final-approved", `${category}.${key} status must be demo-approved/final-approved`);
      assert(asset.qualityStatus === "approved", `${category}.${key} qualityStatus must be approved`);
      assert(asset.path && exists(asset.path), `${category}.${key} localPath missing: ${asset.path}`);
      if (asset.path && exists(asset.path)) {
        assert(stat(asset.path).size >= minBytes, `${category}.${key} file too small: ${asset.path}`);
      }
      assert(!/^https?:\/\//i.test(asset.path || ""), `${category}.${key} path must be local`);
      assert(asset.commercialAllowed === true, `${category}.${key} must be commercialAllowed=true`);
      assert(asset.redistributionAllowed === true, `${category}.${key} must be redistributionAllowed=true`);
    }
    rows.push({
      category,
      key,
      usedNodes: [...nodeSet].join(","),
      externalAsset: asset?.id || "",
      localPath: asset?.path || "",
      status: asset?.status || "missing",
      qualityStatus: asset?.qualityStatus || "missing",
    });
  }
}

const totalUsed = rows.length;
const totalCovered = rows.filter((row) => row.status === "demo-approved" || row.status === "final-approved").length;

if (failures.length) {
  console.error("Audio coverage check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(JSON.stringify(rows, null, 2));
  process.exit(1);
}

console.log("Audio coverage check passed.");
console.log(`usedAudioKeys=${totalUsed}, approvedExternalCoverage=${totalCovered}`);
console.table(rows);
