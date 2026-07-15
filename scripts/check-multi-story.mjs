import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function loadWindowData(relativePath, globalName) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: relativePath });
  return context.window[globalName];
}

const dormitory = loadWindowData("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA");
const rainCall = loadWindowData("story-data.js", "MIST_DATA");
const engine = fs.readFileSync(path.join(root, "script.js"), "utf8");

assert(dormitory?.script?.scriptId === "script_dormitory_rollcall", "Dormitory story data lacks the independent script id.");
assert(dormitory?.series?.seriesId === "series_dormitory_rollcall", "Dormitory story data lacks the independent series id.");
assert(dormitory?.script?.title === "宿舍规则怪谈", "Dormitory visible title must be 宿舍规则怪谈.");
assert(!JSON.stringify(dormitory).includes("熄灯后，请勿点名"), "Dormitory player-facing data must not use the retired subtitle.");
assert((dormitory?.chapters || []).length === 6, "Dormitory story must contain six chapters.");
assert(dormitory?.series?.status === "open" && dormitory?.script?.status === "open", "Dormitory story must be accessible from the public archive.");
assert((dormitory?.rules || []).length === 6, "Dormitory story must contain six public rules.");
assert((dormitory?.hiddenRules || []).length === 1 && dormitory.hiddenRules[0]?.ruleId === "dorm_rule_correction", "Dormitory story must contain one hidden correction rule.");
assert(Object.keys(dormitory?.clues || {}).length === 6, "Dormitory story must contain six core clues.");
assert(Object.keys(dormitory?.endings || {}).length === 8, "Dormitory story must contain eight endings.");

const rainScript = rainCall?.scripts?.[0] || rainCall?.script;
const scriptIds = new Set([rainScript?.scriptId, dormitory?.script?.scriptId]);
assert(scriptIds.size === 2, "The two stories must use distinct script ids.");
assert(rainScript?.scriptId === "script_rain_call", "Rain Call story data lacks the expected script id.");
assert(rainScript?.startNodeId !== dormitory?.script?.startNodeId, "The two stories must use distinct start nodes.");

const rainClueIds = new Set(Object.keys(rainCall?.clues || {}));
for (const clueId of Object.keys(dormitory?.clues || {})) assert(!rainClueIds.has(clueId), `Clue id conflicts with rain-call story: ${clueId}`);
const rainEndingIds = new Set(Object.keys(rainCall?.endings || {}));
for (const endingId of Object.keys(dormitory?.endings || {})) assert(!rainEndingIds.has(endingId), `Ending id conflicts with rain-call story: ${endingId}`);
for (const chapter of dormitory?.chapters || []) assert(!String(chapter.chapterId).startsWith("ch"), `Dormitory chapter id must stay namespaced: ${chapter.chapterId}`);

const nodes = dormitory?.nodes || {};
const startNodeId = dormitory?.script?.startNodeId;
assert(Boolean(nodes[startNodeId]), "Dormitory story start node is missing.");
for (const node of Object.values(nodes)) {
  assert((dormitory.chapters || []).some((chapter) => chapter.chapterId === node.chapterId), `${node.nodeId} has an unknown chapter.`);
  if (node.nextNodeId) assert(Boolean(nodes[node.nextNodeId] || dormitory.endings?.[node.nextNodeId]), `${node.nodeId} points to a missing node.`);
  for (const clueId of node.gainClues || []) assert(Boolean(dormitory.clues?.[clueId]), `${node.nodeId} grants an unknown clue ${clueId}.`);
  for (const choice of node.choices || []) if (choice.nextNodeId) assert(Boolean(nodes[choice.nextNodeId] || dormitory.endings?.[choice.nextNodeId]), `${node.nodeId}/${choice.choiceId} points to a missing node.`);
}

const correctionRule = dormitory?.hiddenRules?.find((rule) => rule.ruleId === "dorm_rule_correction");
assert(Boolean(correctionRule), "Hidden correction rule is missing.");
assert(Object.values(nodes).some((node) => [node, ...(node.investigationHotspots || [])].some((source) => (source.ruleUpdates || []).some((update) => update.ruleId === "dorm_rule_correction" && update.status === "hidden-correction"))), "Hidden correction rule never becomes discoverable in the story flow.");

for (const token of ["STORY_DATASETS", "STORY_CATALOG", "getStoryStorageKeys", "activateStory", "script_dormitory_rollcall"]) {
  assert(engine.includes(token), `Shared engine lacks multi-story integration token: ${token}.`);
}
for (const token of ["archive-bookshelf", "story-book", "book-progress", "data-series-id"]) {
  assert(engine.includes(token), `Archive bookshelf interaction is missing token: ${token}.`);
}
assert(engine.includes("getStoryStorageKeys(scriptId)") || engine.includes("getStoryStorageKeys(activeScriptId)"), "Shared engine must derive state keys by script id.");
assert(engine.includes("getStoryVoiceEntry") && engine.includes("generated-story-voice"), "Shared engine should keep generated voice playback separate from story data.");

if (failures.length) {
  console.error("Multi-story check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Multi-story check passed.");
console.log(`stories=${[rainScript?.scriptId, dormitory?.script?.scriptId].join(",")}`);
console.log(`dormitoryTitle=${dormitory.script.title}; endings=${Object.keys(dormitory.endings).length}; nodes=${Object.keys(dormitory.nodes).length}`);
