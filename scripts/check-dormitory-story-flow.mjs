import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "dormitory-story-data.js" });
const data = context.window.MIST_DORMITORY_DATA;
const failures = [];
const notes = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function allChoices(node) {
  return node.choices?.length ? node.choices : node.question?.choices || [];
}

function nodeEdges(node) {
  return [node.nextNodeId, ...allChoices(node).map((choice) => choice.nextNodeId)].filter(Boolean);
}

const nodes = data?.nodes || {};
const nodeIds = new Set(Object.keys(nodes));
const publicRules = data?.rules || [];
const allClueIds = Object.keys(data?.clues || {});
const endingIds = Object.keys(data?.endings || {});

assert(data?.script?.title === "宿舍规则怪谈", "Player-facing dormitory story title must be 宿舍规则怪谈.");
assert(data?.series?.title === "宿舍规则怪谈", "Player-facing dormitory series title must be 宿舍规则怪谈.");
assert(data?.script?.startNodeId && nodes[data.script.startNodeId], "The dormitory story start node must exist.");
assert(publicRules.length === 6, "The dormitory story must retain exactly six public rules.");
assert(data?.hiddenRules?.length === 1, "The dormitory story must retain one hidden correction rule.");
assert(allClueIds.length === 6, "The restructured dormitory story must define six core clues.");
assert(endingIds.length === 8, `The restructured dormitory story must define eight endings; got ${endingIds.length}.`);
assert(data?.phonePlaybook?.events?.length >= 6, "Phone playbook must include group, private, image/video, broadcast and escape-team events.");

const reached = new Set();
const stack = [data?.script?.startNodeId];
while (stack.length) {
  const nodeId = stack.pop();
  if (!nodeId || reached.has(nodeId)) continue;
  reached.add(nodeId);
  const node = nodes[nodeId];
  if (!node) continue;
  for (const nextNodeId of nodeEdges(node)) stack.push(nextNodeId);
}
assert(reached.size === nodeIds.size, `All dormitory nodes must be reachable; missing: ${[...nodeIds].filter((id) => !reached.has(id)).join(", ")}`);

const effectiveChoices = Object.values(nodes).reduce((sum, node) => sum + allChoices(node).length, 0);
assert(effectiveChoices >= 30 && effectiveChoices <= 40, `The story must contain 30-40 effective choices; got ${effectiveChoices}.`);

for (let chapter = 1; chapter <= 6; chapter += 1) {
  const chapterId = `dorm_chapter_${String(chapter).padStart(2, "0")}`;
  const chapterNodes = Object.values(nodes).filter((node) => node.chapterId === chapterId);
  const choiceNodes = chapterNodes.filter((node) => allChoices(node).length > 0);
  assert(chapterNodes.length >= 8, `${chapterId} must have at least eight formal mobile-readable beats.`);
  assert(choiceNodes.length >= 2, `${chapterId} must include at least two consequential interaction beats.`);
}

for (const node of Object.values(nodes)) {
  assert(typeof node.text === "string" && node.text.trim(), `${node.nodeId} must have formal copy.`);
  assert(!/\b(TODO|TBD|placeholder|lorem ipsum)\b/i.test(node.text), `${node.nodeId} contains placeholder copy.`);
  assert(nodeEdges(node).every((nodeId) => nodeIds.has(nodeId)), `${node.nodeId} points to a missing node.`);
  assert(!/\b(Chen Lu|Shen Yan|Broadcast|Manager Wu|Xu Tang|Lin Sui|Zhou Wanning|Zhao Qing)\b/.test(JSON.stringify(node)), `${node.nodeId} contains a player-visible English character name.`);
  if (node.contentType === "dialogue" || node.contentType === "broadcast" || node.contentType === "recording") {
    assert(node.speaker !== "旁白" && node.voiceEnabled === true && node.spokenText === node.text, `${node.nodeId} audible node must map exactly to its spoken text.`);
  }
  if (node.contentType === "narration" || node.contentType === "system") {
    assert(node.voiceEnabled === false && !node.spokenText, `${node.nodeId} ${node.contentType} must remain silent.`);
  }
}

for (const chapterId of data?.chapters?.map((chapter) => chapter.chapterId) || []) {
  const beat = data?.chapterBeats?.[chapterId];
  assert(beat?.question && beat?.confirmedFact && beat?.newQuestion && beat?.hook, `${chapterId} must document its suspense structure.`);
  assert(Array.isArray(beat?.investigationNodeIds) && beat.investigationNodeIds.length > 0, `${chapterId} must document an investigation beat.`);
  assert(Array.isArray(beat?.choiceNodeIds) && beat.choiceNodeIds.length > 0, `${chapterId} must document consequential choices.`);
}

for (const rule of [...publicRules, ...(data?.hiddenRules || [])]) {
  const detail = data?.rulePlaybook?.[rule.ruleId];
  assert(detail, `${rule.ruleId} needs a rule-playbook entry.`);
  assert(detail?.firstNodeId && nodes[detail.firstNodeId], `${rule.ruleId} needs a first appearance node.`);
  assert(detail?.verificationNodeId && nodes[detail.verificationNodeId], `${rule.ruleId} needs a verification event.`);
  assert(detail?.contradictionNodeId && nodes[detail.contradictionNodeId], `${rule.ruleId} needs a contradiction event.`);
  assert(Array.isArray(detail?.clueIds) && detail.clueIds.length > 0, `${rule.ruleId} needs evidence links.`);
  assert(detail?.playerJudgment && detail?.finalTruth && detail?.endingImpact, `${rule.ruleId} needs a player judgment, truth, and ending impact.`);
}

const resolver = data?.profile?.endingResolver;
assert(typeof resolver === "function", "The dormitory profile needs an ending resolver.");
const clueGrantNodes = new Map(allClueIds.map((clueId) => [clueId, []]));
for (const node of Object.values(nodes)) {
  for (const clueId of node.gainClues || []) clueGrantNodes.get(clueId)?.push(node.nodeId);
  for (const choice of allChoices(node)) for (const clueId of choice.gainClues || []) clueGrantNodes.get(clueId)?.push(`${node.nodeId}/${choice.choiceId}`);
  for (const hotspot of node.investigationHotspots || []) {
    for (const clueId of hotspot.gainClues || []) clueGrantNodes.get(clueId)?.push(`${node.nodeId}/${hotspot.hotspotId}`);
  }
}
for (const [clueId, grantNodes] of clueGrantNodes) assert(grantNodes.length > 0, `${clueId} must be obtainable.`);

for (const endingId of endingIds) {
  const ending = data.endings[endingId];
  assert(ending.title && ending.text && ending.finalLine && ending.report?.pathSummary, `${endingId} needs title, full scene, final line and review report.`);
  assert(data?.endingPreconditions?.[endingId]?.length > 0, `${endingId} needs documented entry conditions.`);
}
assert(Object.keys(data?.inversionForeshadowing || {}).length >= 3, "At least three twist endings need documented foreshadowing.");

if (failures.length) {
  console.error("Dormitory story flow check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

notes.push(`nodes=${nodeIds.size}`);
notes.push(`reachable=${reached.size}`);
notes.push(`choices=${effectiveChoices}`);
notes.push(`endings=${endingIds.join(",")}`);
notes.push(`clue-routes=${[...clueGrantNodes.entries()].map(([id, entries]) => `${id}:${entries.join("|")}`).join("; ")}`);
console.log("Dormitory story flow check passed.");
notes.forEach((note) => console.log(note));
