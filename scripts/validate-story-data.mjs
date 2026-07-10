import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const exists = (path) => fs.existsSync(new URL(path, root));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function load(path, key) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[key];
}

const data = load("story-data.js", "MIST_DATA");
const visuals = load("assets/visual-assets.js", "SECOND_LIFE_VISUALS");
const manifest = load("assets/external-audio-manifest.js", "SECOND_LIFE_EXTERNAL_AUDIO");
const index = read("index.html");
const script = read("script.js");
const keySet = (category) => new Set(Object.keys(manifest?.[category] || {}));
const cueKey = (cue) => typeof cue === "string" ? cue : cue?.key || "";
const audio = { bgm: keySet("bgm"), ambience: keySet("ambience"), sfx: keySet("sfx"), stingers: keySet("stingers") };

assert(data?.chapters?.length === 6, "story must contain six chapters");
assert(Object.keys(data?.clues || {}).length === 6, "story must contain six core clues");
assert(Object.keys(data?.endings || {}).length === 4, "story must contain four endings");
assert(data?.nodes?.ch01_001, "opening node ch01_001 is missing");
assert(manifest?.meta?.playbackPolicy === "library-plus-three-cc0-exceptions", "manifest policy must be library-plus-three-cc0-exceptions");
assert(index.includes("assets/external-audio-manifest.js"), "index must load the audio manifest");
assert(!index.includes("assets/audio/audio-assets.js"), "index must not load legacy audio assets");
assert(!script.includes("audioSourceMode"), "runtime must not expose generated audio mode");

for (const category of ["bgm", "ambience", "sfx", "stingers"]) {
  for (const [key, asset] of Object.entries(manifest?.[category] || {})) {
    assert(exists(asset.path), `${category}.${key} points to missing local audio: ${asset.path}`);
    assert(["Taira Komori", "CC0 exception"].includes(asset.sourceFamily), `${category}.${key} has an unapproved source family`);
    assert(["demo", "final"].includes(asset.productionGrade), `${category}.${key} must be demo or final grade`);
    assert(!asset.fallbackPath, `${category}.${key} must not contain a fallback path`);
  }
}

for (const node of Object.values(data?.nodes || {})) {
  if (node.bgm) assert(audio.bgm.has(node.bgm), `${node.nodeId}.bgm is unknown: ${node.bgm}`);
  if (node.ambience) assert(audio.ambience.has(node.ambience), `${node.nodeId}.ambience is unknown: ${node.ambience}`);
  (node.sfxOnEnter || []).forEach((cue) => assert(audio.sfx.has(cueKey(cue)), `${node.nodeId}.sfxOnEnter is unknown: ${cueKey(cue)}`));
  if (node.voiceStinger) assert(audio.stingers.has(node.voiceStinger), `${node.nodeId}.voiceStinger is unknown: ${node.voiceStinger}`);
  (node.investigationHotspots || []).forEach((hotspot) => {
    (hotspot.sfxOnInspect || []).forEach((cue) => assert(audio.sfx.has(cueKey(cue)), `${node.nodeId}.${hotspot.hotspotId} has unknown inspect sound: ${cueKey(cue)}`));
  });
  assert(visuals?.scenes?.[node.scene], `${node.nodeId} references unknown scene: ${node.scene}`);
}

if (failures.length) {
  console.error("Story data validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Story data validation passed. nodes=${Object.keys(data.nodes).length}, audio=${[...audio.bgm, ...audio.ambience, ...audio.sfx, ...audio.stingers].length}`);
