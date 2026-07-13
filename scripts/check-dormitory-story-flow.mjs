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

function assert(condition, message) {
  if (!condition) failures.push(message);
}

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

assert(data?.script?.startNodeId && nodes[data.script.startNodeId], "The dormitory story start node must exist.");
assert(publicRules.length === 6, "The dormitory story must retain exactly six public rules.");
assert(data?.hiddenRules?.length === 1, "The dormitory story must retain one hidden correction rule.");

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

for (let chapter = 1; chapter <= 6; chapter += 1) {
  const chapterId = `dorm_chapter_${String(chapter).padStart(2, "0")}`;
  const chapterNodes = Object.values(nodes).filter((node) => node.chapterId === chapterId);
  assert(chapterNodes.length >= 6, `${chapterId} must have at least six formal story beats.`);
  if (chapter >= 4) assert(chapterNodes.length >= 10, `${chapterId} must have at least ten mobile-readable formal beats.`);
}

for (const node of Object.values(nodes)) {
  assert(typeof node.text === "string" && node.text.trim(), `${node.nodeId} must have formal copy.`);
  assert(!/\b(TODO|TBD|placeholder|lorem ipsum)\b/i.test(node.text), `${node.nodeId} contains placeholder copy.`);
  assert(nodeEdges(node).every((nodeId) => nodeIds.has(nodeId)), `${node.nodeId} points to a missing node.`);
  if (node.type === "deduction") {
    assert(allChoices(node).length >= 3, `${node.nodeId} must retain its deduction choices at runtime.`);
    assert(allChoices(node).some((choice) => choice.isCorrect === true), `${node.nodeId} must have a correct deduction answer.`);
  }
}

for (const chapterId of data?.chapters?.map((chapter) => chapter.chapterId) || []) {
  const beat = data?.chapterBeats?.[chapterId];
  assert(beat?.question && beat?.confirmedFact && beat?.newQuestion && beat?.hook, `${chapterId} must document its suspense structure.`);
  assert(Array.isArray(beat?.investigationNodeIds) && beat.investigationNodeIds.length > 0, `${chapterId} must document an investigation beat.`);
  assert(Array.isArray(beat?.choiceNodeIds) && beat.choiceNodeIds.length > 0, `${chapterId} must document a consequential choice.`);
}

for (const rule of publicRules) {
  const detail = data?.rulePlaybook?.[rule.ruleId];
  assert(detail, `${rule.ruleId} needs a rule-playbook entry.`);
  assert(detail?.firstNodeId && nodes[detail.firstNodeId], `${rule.ruleId} needs a first appearance node.`);
  assert(detail?.verificationNodeId && nodes[detail.verificationNodeId], `${rule.ruleId} needs a verification event.`);
  assert(detail?.contradictionNodeId && nodes[detail.contradictionNodeId], `${rule.ruleId} needs a contradiction event.`);
  assert(Array.isArray(detail?.clueIds) && detail.clueIds.length > 0, `${rule.ruleId} needs evidence links.`);
  assert(detail?.playerJudgment && detail?.finalTruth && detail?.endingImpact, `${rule.ruleId} needs a player judgment, truth, and ending impact.`);
}

assert(data?.rulePlaybook?.dorm_rule_correction?.finalTruth === "hidden-correction", "The hidden correction rule must be explicitly identified as the final correction.");
assert(
  Object.values(nodes).some((node) => [node, ...(node.investigationHotspots || [])].some((source) => (source.ruleUpdates || []).some((update) => update.ruleId === "dorm_rule_correction"))),
  "The hidden correction rule must unlock in play."
);

const resolver = data?.profile?.endingResolver;
assert(typeof resolver === "function", "The dormitory profile needs an ending resolver.");
const completeAState = {
  clues: allClueIds,
  flags: {
    corrected_2014_count: true,
    corrected_417_count: true,
    trusted_correction: true,
    named_xutang: true,
    named_zhouwanning: true,
  },
  relationships: { trust_linsui: 35, trust_zhaoqing: 25, support_chenlu: 25, protect_xutang: 40 },
};
if (typeof resolver === "function") {
  assert(resolver(completeAState) === "dorm_ending_a", "A route must require a completed correction, not a final-answer guess.");
  assert(resolver({ ...completeAState, relationships: { ...completeAState.relationships, trust_zhaoqing: 0 } }) !== "dorm_ending_a", "A route must fail without the required companion trust.");
  assert(resolver({ ...completeAState, flags: { ...completeAState.flags, sent_unregistered_downstairs: true } }) === "dorm_ending_b", "Handing over Xu Tang must resolve to ending B.");
  assert(resolver({ ...completeAState, flags: { ...completeAState.flags, accused_wrong_person: true } }) === "dorm_ending_c", "Accusing another roommate must resolve to ending C.");
  assert(resolver({ ...completeAState, flags: { ...completeAState.flags, cut_broadcast: true } }) === "dorm_ending_d", "Cutting the broadcast must resolve to ending D.");
}

const clueGrantNodes = new Map(allClueIds.map((clueId) => [clueId, []]));
for (const node of Object.values(nodes)) {
  for (const clueId of node.gainClues || []) clueGrantNodes.get(clueId)?.push(node.nodeId);
  for (const hotspot of node.investigationHotspots || []) {
    for (const clueId of hotspot.gainClues || []) clueGrantNodes.get(clueId)?.push(`${node.nodeId}/${hotspot.hotspotId}`);
  }
}
for (const [clueId, grantNodes] of clueGrantNodes) assert(grantNodes.length > 0, `${clueId} must be obtainable.`);

for (const endingId of ["dorm_ending_a", "dorm_ending_b", "dorm_ending_c", "dorm_ending_d"]) {
  assert(data?.endings?.[endingId]?.report?.pathSummary, `${endingId} needs a player-facing ending report.`);
}

if (failures.length) {
  console.error("Dormitory story flow check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

notes.push(`nodes=${nodeIds.size}`);
notes.push(`reachable=${reached.size}`);
notes.push(`chapter-4-6=${[4, 5, 6].map((chapter) => Object.values(nodes).filter((node) => node.chapterId === `dorm_chapter_${String(chapter).padStart(2, "0")}`).length).join("/")}`);
notes.push(`clue-routes=${[...clueGrantNodes.entries()].map(([id, entries]) => `${id}:${entries.join("|")}`).join("; ")}`);
notes.push("ending-routes=A=complete correction+trust; B=hand over Xu Tang; C=accuse another roommate; D=cut or evade broadcast");
console.log("Dormitory story flow check passed.");
notes.forEach((note) => console.log(note));
