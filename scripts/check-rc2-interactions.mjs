import fs from "node:fs";
import vm from "node:vm";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

function loadJs(path, key) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[key];
}

const story = loadJs("story-data.js", "MIST_DATA");
const external = loadJs("assets/external-audio-manifest.js", "SECOND_LIFE_EXTERNAL_AUDIO");
const script = read("script.js");

const nodes = Object.values(story.nodes || {});
const objectiveNodes = nodes.filter((node) => node.objectiveId && node.objectiveText);
const completedObjectives = new Set(nodes.filter((node) => node.objectiveComplete).map((node) => node.objectiveId));
assert(objectiveNodes.length >= 12, `RC2 should define at least 12 objective nodes, got ${objectiveNodes.length}`);
["obj_dead_call", "obj_door_woman", "obj_photo_shadow", "obj_old_phone", "obj_final_deduction"].forEach((id) => {
  assert(objectiveNodes.some((node) => node.objectiveId === id), `missing objective ${id}`);
  assert(completedObjectives.has(id), `objective ${id} must have a completion node`);
});

const hotspotNodes = nodes.filter((node) => (node.investigationHotspots || []).length);
const hotspots = hotspotNodes.flatMap((node) => (node.investigationHotspots || []).map((hotspot) => ({ node, hotspot })));
assert(hotspotNodes.length >= 6, `RC2 should define at least 6 hotspot nodes, got ${hotspotNodes.length}`);
["phone_screen", "door_chain", "peephole", "old_photo", "old_phone", "archive_folder"].forEach((id) => {
  assert(hotspots.some(({ hotspot }) => hotspot.hotspotId === id), `missing hotspot ${id}`);
});
assert(hotspots.some(({ hotspot }) => (hotspot.gainClues || []).length), "at least one hotspot must grant a clue");
assert(hotspots.some(({ hotspot }) => (hotspot.relationshipEffects || []).length), "at least one hotspot must affect relationships");

const links = new Map();
for (const node of nodes) {
  for (const link of node.evidenceLinks || []) links.set(link.linkId, link);
}
assert(links.size === 3, `RC2 evidence board should expose exactly 3 links, got ${links.size}`);
["link_call_mechanism", "link_photo_timeline", "link_motive_chain"].forEach((id) => assert(links.has(id), `missing evidence link ${id}`));

const choices = nodes.flatMap((node) => (node.choices || []).map((choice) => ({ node, choice })));
assert(choices.length > 0, "choices must exist");
assert(choices.every(({ choice }) => typeof choice.choiceIntent === "string" && choice.choiceIntent.length > 0), "every choice must expose a non-spoiler choiceIntent");

[
  "renderObjectivePanel",
  "inspectHotspot",
  "openEvidenceBoardModal",
  "openAudioSettingsModal",
  "openReadingSettingsModal",
  "openArchiveModal",
  "renderEndingRoadmap",
].forEach((symbol) => assert(script.includes(symbol), `runtime missing ${symbol}`));

const allAssets = ["bgm", "ambience", "sfx", "stingers"].flatMap((category) =>
  Object.values(external?.[category] || {}).map((asset) => ({ category, asset }))
);
assert(allAssets.length >= 20, "external audio manifest should still expose active assets");
assert(allAssets.every(({ asset }) => ["final", "demo", "reject"].includes(asset.productionGrade)), "every audio asset needs productionGrade");
assert(allAssets.some(({ asset }) => /taira komori/i.test(asset.sourceSite || "")), "RC2 must include the user-provided Taira Komori replacement audio set");
assert(
  allAssets
    .filter(({ asset }) => asset.productionGrade === "reject")
    .every(({ asset }) => asset.replacementNeeded === true && Boolean(asset.rejectedReason)),
  "any rejected audio asset must remain silent and explain the replacement need"
);
assert(script.includes('asset.productionGrade !== "reject"'), "runtime must silence productionGrade=reject audio");

if (errors.length) {
  console.error("RC2 interaction check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("RC2 interaction check passed.");
