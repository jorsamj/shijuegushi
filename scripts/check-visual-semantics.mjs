import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const exists = (path) => fs.existsSync(new URL(path, root));
const size = (path) => fs.statSync(new URL(path, root)).size;
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function loadWindowJs(path, key) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[key];
}

const story = loadWindowJs("story-data.js", "MIST_DATA");
const visuals = loadWindowJs("assets/visual-assets.js", "SECOND_LIFE_VISUALS");
const manifest = loadWindowJs("assets/asset-manifest.js", "SECOND_LIFE_ASSET_MANIFEST");

const p0Assets = [
  ["prop_polaroid_old_photo", manifest.props?.prop_polaroid_old_photo, "group-photo"],
  ["clue_photo_background_evidence", manifest.clues?.clue_photo_background_evidence, "background_shadow"],
];

for (const [id, asset, term] of p0Assets) {
  assert(asset, `${id} must be registered in asset-manifest.js`);
  assert(asset?.path && exists(asset.path), `${id} file is missing: ${asset?.path}`);
  if (asset?.path && exists(asset.path)) assert(size(asset.path) > 20_000, `${id} looks too small for production candidate`);
  assert(asset?.status === "final-candidate", `${id} must be marked final-candidate`);
  assert(/manual-confirmed/i.test(asset?.semanticQa || ""), `${id} must include manual-confirmed semanticQa`);
  assert((asset?.usage || []).join(" ").includes(term), `${id} usage must include ${term}`);
}

const requiredFocusNodes = {
  ch01_003: "incoming-call",
  ch01_008: "peephole",
  ch04_006: "group-photo",
  ch04_015: "background-shadow",
  ch05_015: "voice-trigger",
  ch06_010: "deduction-board",
};

for (const [nodeId, focus] of Object.entries(requiredFocusNodes)) {
  const node = story.nodes?.[nodeId];
  assert(node, `${nodeId} is missing`);
  assert(node?.visualFocus === focus, `${nodeId} must use visualFocus=${focus}`);
  assert(Array.isArray(node?.highlightProps) && node.highlightProps.length > 0, `${nodeId} must highlight at least one prop`);
}

for (const [sceneId, scene] of Object.entries(visuals.scenes || {})) {
  assert(scene.bg && exists(scene.bg), `${sceneId} background missing: ${scene.bg}`);
  for (const propId of scene.props || []) {
    const prop = visuals.props?.[propId];
    assert(prop, `${sceneId} references missing prop ${propId}`);
    assert(prop?.image && exists(prop.image), `${sceneId}.${propId} image missing: ${prop?.image}`);
  }
}

if (errors.length) {
  console.error("Visual semantic check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Visual semantic check passed.");
