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

function loadNamefloorData() {
  const context = { window: {} };
  for (const relativePath of [
    "assets/stories/dormitory-namefloor/story-data.js",
    "assets/stories/dormitory-namefloor/story-chapters-2-7.js",
  ]) {
    vm.runInNewContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context, { filename: relativePath });
  }
  const base = context.window.MIST_DORMITORY_NAMEFLOOR_DATA;
  const expansion = context.window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7;
  const chapters = new Map((base?.chapters || []).map((chapter) => [chapter.chapterId, chapter]));
  (expansion?.chapters || []).forEach((chapter) => chapters.set(chapter.chapterId, { ...(chapters.get(chapter.chapterId) || {}), ...chapter }));
  return {
    ...base,
    ...expansion,
    chapters: [...chapters.values()],
    rules: [...(base?.rules || []), ...(expansion?.managerRules || [])],
    nodes: { ...(base?.nodes || {}), ...(expansion?.nodes || {}) },
    clues: { ...(base?.clues || {}), ...(expansion?.clues || {}) },
    endings: { ...(base?.endings || {}), ...(expansion?.endings || {}) },
  };
}

const dormitory = loadWindowData("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA");
const rainCall = loadWindowData("story-data.js", "MIST_DATA");
const namefloor = loadNamefloorData();
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
const scriptIds = new Set([rainScript?.scriptId, dormitory?.script?.scriptId, namefloor?.script?.scriptId]);
assert(scriptIds.size === 3, "Rain Call, the legacy rollback, and the canonical dormitory runtime must use distinct script ids.");
assert(rainScript?.scriptId === "script_rain_call", "Rain Call story data lacks the expected script id.");
assert(rainScript?.startNodeId !== dormitory?.script?.startNodeId, "The two stories must use distinct start nodes.");
assert(namefloor?.script?.scriptId === "script_dormitory_namefloor", "Canonical dormitory runtime lacks the expected script id.");
assert(namefloor?.script?.seriesId === "series_dormitory_namefloor", "Canonical dormitory runtime lacks the expected series id.");
assert(namefloor?.script?.title === "宿舍规则怪谈", "Canonical dormitory title must stay player-facing Chinese.");
assert((namefloor?.chapters || []).length === 7, "Canonical dormitory runtime must contain seven chapters.");
assert((namefloor?.rules || []).filter((rule) => rule.ruleId?.startsWith("namefloor_rule_")).length === 8, "Canonical dormitory runtime must contain eight student rules.");
assert((namefloor?.rules || []).filter((rule) => rule.ruleId?.startsWith("namefloor_manager_rule_")).length === 7, "Canonical dormitory runtime must contain seven manager rules.");
const canonicalEndingCount = Object.keys(namefloor?.endings || {}).length;
assert(canonicalEndingCount === 0 || canonicalEndingCount === 8, "Canonical dormitory runtime must either be the current Chapter 1-3 Draft phase or the final eight-ending runtime.");
if (canonicalEndingCount === 8) {
  assert(Object.keys(namefloor?.nodes || {}).length >= 300, "Canonical dormitory runtime is unexpectedly incomplete.");
} else {
  assert(namefloor?.nodes?.nf03_050?.type === "chapter-ending", "Canonical dormitory Chapter 1-3 Draft phase must stop at the Chapter 3 hook.");
  assert(Object.keys(namefloor?.nodes || {}).length >= 160, "Canonical dormitory Chapter 1-3 Draft phase is unexpectedly incomplete.");
  for (const chapterId of ["namefloor_chapter_02", "namefloor_chapter_03"]) {
    const chapter = namefloor.chapters.find((item) => item.chapterId === chapterId);
    assert(chapter?.status === "runtime", `${chapterId} must be runtime in the Chapter 1-3 Draft phase.`);
  }
  for (const chapterId of ["namefloor_chapter_04", "namefloor_chapter_05", "namefloor_chapter_06", "namefloor_chapter_07"]) {
    const chapter = namefloor.chapters.find((item) => item.chapterId === chapterId);
    assert(chapter?.status !== "runtime", `${chapterId} must remain blueprint-only in the Chapter 1-3 Draft phase.`);
    assert(!Object.values(namefloor.nodes || {}).some((node) => node.chapterId === chapterId), `${chapterId} must not export runtime nodes in the Chapter 1-3 Draft phase.`);
  }
}
assert(!JSON.stringify(namefloor).match(/许棠|林穗|赵晴|陈露|沈妍|周婉宁|417宿舍|01:13/u), "Canonical dormitory runtime must not mix legacy female-dormitory content.");
assert(rainScript?.startNodeId !== namefloor?.script?.startNodeId, "Rain Call and the canonical dormitory story must use distinct start nodes.");

const rainClueIds = new Set(Object.keys(rainCall?.clues || {}));
for (const clueId of Object.keys(dormitory?.clues || {})) assert(!rainClueIds.has(clueId), `Clue id conflicts with rain-call story: ${clueId}`);
for (const clueId of Object.keys(namefloor?.clues || {})) assert(!rainClueIds.has(clueId), `Canonical clue id conflicts with rain-call story: ${clueId}`);
const rainEndingIds = new Set(Object.keys(rainCall?.endings || {}));
for (const endingId of Object.keys(dormitory?.endings || {})) assert(!rainEndingIds.has(endingId), `Ending id conflicts with rain-call story: ${endingId}`);
for (const endingId of Object.keys(namefloor?.endings || {})) assert(!rainEndingIds.has(endingId), `Canonical ending id conflicts with rain-call story: ${endingId}`);
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

for (const token of ["STORY_DATASETS", "STORY_CATALOG", "getStoryStorageKeys", "activateStory", "script_dormitory_rollcall", "script_dormitory_namefloor"]) {
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
console.log(`stories=${[rainScript?.scriptId, dormitory?.script?.scriptId, namefloor?.script?.scriptId].join(",")}`);
console.log(`legacyRollback=${dormitory.script.title}; canonical=${namefloor.script.title}; canonicalEndings=${Object.keys(namefloor.endings).length}; canonicalNodes=${Object.keys(namefloor.nodes).length}`);
