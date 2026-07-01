import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

function parseCoreClues(scriptText) {
  const match = scriptText.match(/const CORE_CLUE_IDS = \[([\s\S]*?)\];/);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function countMilestones(scriptText) {
  const match = scriptText.match(/const MILESTONES = \[([\s\S]*?)\];/);
  if (!match) return 0;
  return [...match[1].matchAll(/milestoneId:/g)].length;
}

function resolveEnding(snapshot) {
  const clues = new Set(snapshot.clues || []);
  const flags = snapshot.flags || {};

  if (flags.deleted_evidence === true && flags.backed_up_photo !== true) return "ending_c";

  const hasAClues = [
    "clue_gray_loan",
    "clue_zhou_left",
    "clue_photo_background",
    "clue_timed_voice",
  ].every((id) => clues.has(id));

  if (
    hasAClues &&
    flags.backed_up_photo === true &&
    flags.chose_reopen_case === true &&
    Number(snapshot.deductionScore || 0) >= 4
  ) {
    return "ending_a";
  }

  if (
    flags.gave_original_photo === true &&
    (flags.verified_zhuwan_identity !== true ||
      flags.backed_up_photo !== true ||
      flags.understood_dead_call !== true)
  ) {
    return "ending_b";
  }

  return "ending_d";
}

const DATA = loadData();
const scriptText = read("script.js");
const docPaths = [
  "README.md",
  "docs/PRD_SOFTWARE.md",
  ...fs
    .readdirSync(new URL("docs/", root))
    .filter((name) => name.startsWith("PRD_STORY_") || name.startsWith("STORY_SCRIPT_"))
    .map((name) => `docs/${name}`),
  "story-data.js",
  "script.js",
  "style.css",
  "index.html",
];
const allText = docPaths.map((path) => `${path}\n${read(path)}`).join("\n\n");

const coreClueIds = parseCoreClues(scriptText);
const clueIds = new Set(Object.keys(DATA.clues || {}));
const nodeIds = new Set(Object.keys(DATA.nodes || {}));
const endingIds = new Set(Object.keys(DATA.endings || {}));
const defaultFlagIds = new Set(Object.keys(DATA.defaultFlags || {}));
const relationshipIds = new Set([
  "trust_zhuwan",
  "support_chenyan",
  "suspicion_zhou",
  "courage_linzou",
]);

assert(DATA.chapters?.length === 6, `chapters must be 6, got ${DATA.chapters?.length}`);
assert(clueIds.size === 6, `clues must be 6, got ${clueIds.size}`);
assert(coreClueIds.length === 6, `CORE_CLUE_IDS must be 6, got ${coreClueIds.length}`);
coreClueIds.forEach((id) => assert(clueIds.has(id), `CORE_CLUE_IDS contains missing clue: ${id}`));
assert(nodeIds.has("ch01_001"), "start node ch01_001 is missing");
assert(
  Object.values(DATA.nodes || {}).some((node) => node.chapterId === "chapter_06" && node.resolveEnding === true),
  "chapter_06 must contain a resolveEnding node"
);
["ending_a", "ending_b", "ending_c", "ending_d"].forEach((id) => assert(endingIds.has(id), `missing ending: ${id}`));
assert(countMilestones(scriptText) <= 4, "MILESTONES must be at most 4");

for (const chapter of DATA.chapters || []) {
  const nodes = Object.values(DATA.nodes || {}).filter((node) => node.chapterId === chapter.chapterId);
  const choices = nodes.filter((node) => node.type === "choice" || node.type === "deduction");
  assert(nodes.length >= 18, `${chapter.chapterId} has fewer than 18 nodes`);
  assert(nodes.length <= 25, `${chapter.chapterId} has more than 25 nodes`);
  assert(choices.length >= 3, `${chapter.chapterId} has fewer than 3 choice/deduction nodes`);
}

for (const node of Object.values(DATA.nodes || {})) {
  assert(
    DATA.chapters.some((chapter) => chapter.chapterId === node.chapterId),
    `${node.nodeId} references missing chapter ${node.chapterId}`
  );
  if (node.nextNodeId) assert(nodeIds.has(node.nextNodeId), `${node.nodeId}.nextNodeId missing: ${node.nextNodeId}`);
  for (const clueId of node.gainClues || []) assert(clueIds.has(clueId), `${node.nodeId}.gainClues missing clue: ${clueId}`);
  for (const flagId of node.setFlags || []) assert(defaultFlagIds.has(flagId), `${node.nodeId}.setFlags missing flag: ${flagId}`);

  for (const choice of node.choices || []) {
    if (choice.nextNodeId) {
      assert(nodeIds.has(choice.nextNodeId), `${node.nodeId}.${choice.choiceId}.nextNodeId missing: ${choice.nextNodeId}`);
    }
    for (const clueId of choice.gainClues || []) {
      assert(clueIds.has(clueId), `${node.nodeId}.${choice.choiceId}.gainClues missing clue: ${clueId}`);
    }
    for (const flagId of choice.setFlags || []) {
      assert(defaultFlagIds.has(flagId), `${node.nodeId}.${choice.choiceId}.setFlags missing flag: ${flagId}`);
    }
    for (const effect of choice.relationshipEffects || []) {
      assert(relationshipIds.has(effect.id), `${node.nodeId}.${choice.choiceId}.relationshipEffects has invalid id: ${effect.id}`);
    }
    assert(Array.isArray(choice.endingPathTags || []), `${node.nodeId}.${choice.choiceId}.endingPathTags must be an array`);
    for (const tag of choice.endingPathTags || []) {
      assert(typeof tag === "string", `${node.nodeId}.${choice.choiceId}.endingPathTags must contain strings`);
    }
    assert(
      (choice.setFlags || []).length ||
        (choice.relationshipEffects || []).length ||
        (choice.endingPathTags || []).length ||
        (choice.gainClues || []).length ||
        choice.choiceImpactText ||
        node.type === "deduction",
      `${node.nodeId}.${choice.choiceId} has no effective impact`
    );
  }
}

const reachable = new Set();
const stack = ["ch01_001"];
while (stack.length) {
  const nodeId = stack.pop();
  if (!nodeId || reachable.has(nodeId) || !nodeIds.has(nodeId)) continue;
  reachable.add(nodeId);
  const node = DATA.nodes[nodeId];
  if (node.nextNodeId) stack.push(node.nextNodeId);
  for (const choice of node.choices || []) if (choice.nextNodeId) stack.push(choice.nextNodeId);
}
assert(reachable.has("ch06_020"), "final resolve node ch06_020 is not reachable from ch01_001");

const allKeyClues = [
  "clue_dead_call",
  "clue_sister_mark",
  "clue_gray_loan",
  "clue_zhou_left",
  "clue_photo_background",
  "clue_timed_voice",
];
assert(
  resolveEnding({
    clues: allKeyClues,
    flags: { backed_up_photo: true, chose_reopen_case: true, verified_zhuwan_identity: true, understood_dead_call: true },
    deductionScore: 4,
  }) === "ending_a",
  "A ending scenario failed"
);
assert(
  resolveEnding({
    clues: ["clue_dead_call", "clue_sister_mark", "clue_photo_background"],
    flags: { gave_original_photo: true, verified_zhuwan_identity: false, backed_up_photo: false, understood_dead_call: false },
    deductionScore: 2,
  }) === "ending_b",
  "B ending scenario failed"
);
assert(
  resolveEnding({
    clues: ["clue_dead_call"],
    flags: { deleted_evidence: true, backed_up_photo: false },
    deductionScore: 1,
  }) === "ending_c",
  "C ending scenario failed"
);
assert(
  resolveEnding({
    clues: ["clue_dead_call", "clue_gray_loan"],
    flags: { backed_up_photo: false, chose_reopen_case: false },
    deductionScore: 2,
  }) === "ending_d",
  "D ending scenario failed"
);

const forbidden = [
  "??????",
  "？？？？？",
  "?????????",
  "\uFFFD",
  "迷雾剧本馆",
  "剧本馆",
  "x/15",
  "10 条核心线索",
  "12 章中短篇",
  "锛",
  "绾跨储",
  "鐪熺浉",
  "鍛借繍",
  "浜虹敓",
];
for (const text of forbidden) {
  assert(!allText.includes(text), `forbidden text found: ${text}`);
}

if (failures.length) {
  console.error("Story data validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Story data validation passed.");
console.log(`chapters=${DATA.chapters.length}, clues=${clueIds.size}, nodes=${nodeIds.size}, coreClues=${coreClueIds.length}`);
