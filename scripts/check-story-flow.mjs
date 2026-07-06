import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const exists = (path) => fs.existsSync(new URL(path, root));

const failures = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

const DATA = loadData();
const scriptText = read("script.js");
const nodes = DATA.nodes || {};
const nodeIds = new Set(Object.keys(nodes));
const chapterIds = new Set((DATA.chapters || []).map((chapter) => chapter.chapterId));
const clueIds = new Set(Object.keys(DATA.clues || {}));
const endingIds = new Set(Object.keys(DATA.endings || {}));
const flagIds = new Set(Object.keys(DATA.defaultFlags || {}));
const relationshipIds = new Set([
  "trust_zhuwan",
  "support_chenyan",
  "suspicion_zhou",
  "courage_linzou",
]);

function uniqueList(items) {
  return [...new Set(items)];
}

function listNodeEdges(node) {
  const edges = [];
  if (node.nextNodeId) edges.push(node.nextNodeId);
  for (const choice of node.choices || []) {
    if (choice.nextNodeId) edges.push(choice.nextNodeId);
  }
  return uniqueList(edges);
}

function getChoiceEdges(node) {
  return (node.choices || []).map((choice) => choice.nextNodeId).filter(Boolean);
}

function collectReachable(startNodeId) {
  const reachable = new Set();
  const stack = [startNodeId];
  while (stack.length) {
    const nodeId = stack.pop();
    if (reachable.has(nodeId)) continue;
    reachable.add(nodeId);
    const node = nodes[nodeId];
    if (!node) continue;
    for (const nextId of listNodeEdges(node)) {
      if (!reachable.has(nextId)) stack.push(nextId);
    }
  }
  return reachable;
}

function hasPathTo(fromNodeId, predicate) {
  const seen = new Set();
  const stack = [fromNodeId];
  while (stack.length) {
    const nodeId = stack.pop();
    if (seen.has(nodeId)) continue;
    seen.add(nodeId);
    const node = nodes[nodeId];
    if (!node) continue;
    if (predicate(node, nodeId)) return true;
    for (const nextId of listNodeEdges(node)) {
      if (!seen.has(nextId)) stack.push(nextId);
    }
  }
  return false;
}

function resolveEndingSnapshot(snapshot) {
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

function createSimulationState() {
  return {
    nodeId: "ch01_001",
    clues: [],
    flags: { ...(DATA.defaultFlags || {}) },
    relationships: {
      trust_zhuwan: 0,
      support_chenyan: 0,
      suspicion_zhou: 0,
      courage_linzou: 0,
    },
    endingPathTags: [],
    deductionScore: 0,
    history: [],
  };
}

function clampRelationship(value) {
  return Math.max(-100, Math.min(100, Number(value || 0)));
}

function applyEffects(state, source) {
  for (const clueId of source.gainClues || []) {
    if (!state.clues.includes(clueId)) state.clues.push(clueId);
  }
  for (const flagId of source.setFlags || []) {
    state.flags[flagId] = true;
  }
  for (const effect of source.relationshipEffects || []) {
    state.relationships[effect.id] = clampRelationship((state.relationships[effect.id] || 0) + Number(effect.delta || 0));
  }
  for (const tag of source.endingPathTags || []) {
    if (!state.endingPathTags.includes(tag)) state.endingPathTags.push(tag);
  }
}

function selectChoiceForRoute(routeName, node) {
  const choices = node.choices || [];
  if (!choices.length) return null;

  if (node.type === "deduction") {
    if (routeName === "d") return choices.find((choice) => choice.isCorrect !== true) || choices[0];
    return choices.find((choice) => choice.isCorrect === true) || choices[0];
  }

  const byFlag = (flagId) => choices.find((choice) => (choice.setFlags || []).includes(flagId));
  const byTag = (tag) => choices.find((choice) => (choice.endingPathTags || []).includes(tag));

  if (node.nodeId === "ch06_004") {
    if (routeName === "a") return byFlag("backed_up_photo") || choices[0];
    if (routeName === "b") return byFlag("gave_original_photo") || choices[0];
    if (routeName === "c") return byFlag("deleted_evidence") || choices[0];
    if (routeName === "d") return byFlag("backed_up_photo") || choices[0];
  }

  if ((routeName === "b" || routeName === "c") && node.nodeId === "ch04_004") {
    return choices.find((choice) => !(choice.setFlags || []).includes("backed_up_photo")) || choices[0];
  }

  if ((routeName === "b" || routeName === "c") && node.nodeId === "ch04_017") {
    return choices.find((choice) => !(choice.setFlags || []).includes("backed_up_photo")) || choices[0];
  }

  if (node.nodeId === "ch06_018") {
    if (routeName === "a") return byFlag("chose_reopen_case") || byTag("chose_reopen_case") || choices[0];
    if (routeName === "b") return byFlag("gave_original_photo") || choices[1] || choices[0];
    if (routeName === "c") return byFlag("deleted_evidence") || choices[2] || choices[0];
    if (routeName === "d") return byTag("avoid_truth") || choices.at(-1) || choices[0];
  }

  if (routeName === "c") {
    return choices.find((choice) => (choice.endingPathTags || []).includes("avoid_truth")) || choices.at(-1) || choices[0];
  }

  return choices[0];
}

function simulateRoute(routeName) {
  const state = createSimulationState();
  const visited = [];
  const seen = new Set();
  let safety = 0;

  while (state.nodeId && safety < 500) {
    safety += 1;
    const node = nodes[state.nodeId];
    if (!node) return { endingId: null, state, visited, error: `missing node ${state.nodeId}` };
    visited.push(node.nodeId);
    if (seen.has(`${node.nodeId}:${routeName}:${state.deductionScore}`)) {
      return { endingId: null, state, visited, error: `route ${routeName} entered a loop at ${node.nodeId}` };
    }
    seen.add(`${node.nodeId}:${routeName}:${state.deductionScore}`);

    applyEffects(state, node);

    if (node.resolveEnding === true) {
      return { endingId: resolveEndingSnapshot(state), state, visited, error: null };
    }
    if (node.type === "ending") {
      return { endingId: node.endingId || node.nodeId, state, visited, error: null };
    }
    if (node.type === "choice" || node.type === "deduction") {
      const choice = selectChoiceForRoute(routeName, node);
      if (!choice) return { endingId: null, state, visited, error: `${node.nodeId} has no selectable choice` };
      applyEffects(state, choice);
      if (node.type === "deduction" && choice.isCorrect === true) state.deductionScore += 1;
      state.nodeId = choice.nextNodeId || node.nextNodeId;
    } else {
      state.nodeId = node.nextNodeId;
    }
  }

  return { endingId: null, state, visited, error: `route ${routeName} exceeded traversal safety limit` };
}

function findNoExitCycles() {
  const indexById = new Map();
  const lowlink = new Map();
  const stack = [];
  const onStack = new Set();
  const components = [];
  let index = 0;

  function strongConnect(nodeId) {
    indexById.set(nodeId, index);
    lowlink.set(nodeId, index);
    index += 1;
    stack.push(nodeId);
    onStack.add(nodeId);

    for (const nextId of listNodeEdges(nodes[nodeId] || {})) {
      if (!nodeIds.has(nextId)) continue;
      if (!indexById.has(nextId)) {
        strongConnect(nextId);
        lowlink.set(nodeId, Math.min(lowlink.get(nodeId), lowlink.get(nextId)));
      } else if (onStack.has(nextId)) {
        lowlink.set(nodeId, Math.min(lowlink.get(nodeId), indexById.get(nextId)));
      }
    }

    if (lowlink.get(nodeId) === indexById.get(nodeId)) {
      const component = [];
      let current;
      do {
        current = stack.pop();
        onStack.delete(current);
        component.push(current);
      } while (current !== nodeId);
      components.push(component);
    }
  }

  for (const nodeId of nodeIds) {
    if (!indexById.has(nodeId)) strongConnect(nodeId);
  }

  return components.filter((component) => {
    const hasCycle = component.length > 1 || listNodeEdges(nodes[component[0]] || {}).includes(component[0]);
    if (!hasCycle) return false;
    const componentSet = new Set(component);
    return !component.some((nodeId) => {
      const node = nodes[nodeId];
      if (node?.resolveEnding === true || node?.type === "ending") return true;
      return listNodeEdges(node || {}).some((nextId) => !componentSet.has(nextId));
    });
  });
}

for (const [nodeId, node] of Object.entries(nodes)) {
  assert(node.nodeId === nodeId, `${nodeId} nodeId field does not match object key`);
  assert(chapterIds.has(node.chapterId), `${nodeId} has missing chapterId: ${node.chapterId}`);
  assert(typeof node.speaker === "string" && node.speaker.trim().length > 0, `${nodeId} must provide speaker`);
  assert(typeof node.text === "string" && node.text.trim().length > 0, `${nodeId} must provide text`);

  if (node.nextNodeId) assert(nodeIds.has(node.nextNodeId), `${nodeId}.nextNodeId points to missing node ${node.nextNodeId}`);
  if (node.type === "choice" || node.type === "deduction") {
    assert(Array.isArray(node.choices) && node.choices.length >= 2, `${nodeId} must have at least 2 choices`);
    const choiceIds = new Set();
    for (const choice of node.choices || []) {
      assert(choice.choiceId && !choiceIds.has(choice.choiceId), `${nodeId} has duplicate or missing choiceId ${choice.choiceId}`);
      choiceIds.add(choice.choiceId);
      assert(typeof choice.text === "string" && choice.text.trim().length > 0, `${nodeId}.${choice.choiceId} must provide choice text`);
      assert(choice.nextNodeId, `${nodeId}.${choice.choiceId} must provide nextNodeId`);
      if (choice.nextNodeId) assert(nodeIds.has(choice.nextNodeId), `${nodeId}.${choice.choiceId} points to missing node ${choice.nextNodeId}`);
      for (const flagId of choice.setFlags || []) assert(flagIds.has(flagId), `${nodeId}.${choice.choiceId} sets unknown flag ${flagId}`);
      for (const clueId of choice.gainClues || []) assert(clueIds.has(clueId), `${nodeId}.${choice.choiceId} gains unknown clue ${clueId}`);
      for (const effect of choice.relationshipEffects || []) {
        assert(relationshipIds.has(effect.id), `${nodeId}.${choice.choiceId} uses unknown relationship ${effect.id}`);
        assert(Number.isFinite(Number(effect.delta)), `${nodeId}.${choice.choiceId} relationship delta must be numeric`);
      }
      for (const tag of choice.endingPathTags || []) assert(typeof tag === "string" && tag.trim().length > 0, `${nodeId}.${choice.choiceId} has empty endingPathTag`);
      assert(uniqueList(choice.setFlags || []).length === (choice.setFlags || []).length, `${nodeId}.${choice.choiceId} repeats a flag`);
      assert(uniqueList(choice.endingPathTags || []).length === (choice.endingPathTags || []).length, `${nodeId}.${choice.choiceId} repeats an endingPathTag`);
    }
  }

  for (const clueId of node.gainClues || []) assert(clueIds.has(clueId), `${nodeId} gains unknown clue ${clueId}`);
  for (const flagId of node.setFlags || []) assert(flagIds.has(flagId), `${nodeId} sets unknown flag ${flagId}`);
  for (const tag of node.endingPathTags || []) assert(typeof tag === "string" && tag.trim().length > 0, `${nodeId} has empty endingPathTag`);

  const hasExit =
    node.nextNodeId ||
    getChoiceEdges(node).length > 0 ||
    node.resolveEnding === true ||
    node.type === "ending" ||
    node.endingId;
  assert(hasExit, `${nodeId} is a dead-end node without next, choices, ending, or resolveEnding`);
}

for (const [endingId, ending] of Object.entries(DATA.endings || {})) {
  assert(ending.endingId === endingId, `${endingId} endingId field does not match object key`);
  assert(typeof ending.title === "string" && ending.title.trim().length > 0, `${endingId} must provide title`);
  assert(typeof ending.text === "string" && ending.text.trim().length > 0, `${endingId} must provide text`);
}
["ending_a", "ending_b", "ending_c", "ending_d"].forEach((endingId) => {
  assert(endingIds.has(endingId), `missing required ending ${endingId}`);
});

const reachable = collectReachable("ch01_001");
const unreachable = [...nodeIds].filter((nodeId) => !reachable.has(nodeId));
assert(nodeIds.has("ch01_001"), "start node ch01_001 must exist");
assert(unreachable.length === 0, `unreachable non-reserved nodes: ${unreachable.join(", ")}`);

for (let chapterNo = 1; chapterNo <= 6; chapterNo += 1) {
  const entryId = `ch${String(chapterNo).padStart(2, "0")}_001`;
  assert(nodeIds.has(entryId), `chapter ${chapterNo} entry node is missing: ${entryId}`);
  assert(reachable.has(entryId), `chapter ${chapterNo} entry is not reachable: ${entryId}`);
}
for (let chapterNo = 1; chapterNo <= 5; chapterNo += 1) {
  const from = `chapter_${String(chapterNo).padStart(2, "0")}`;
  const to = `chapter_${String(chapterNo + 1).padStart(2, "0")}`;
  const chapterNodes = Object.values(nodes).filter((node) => node.chapterId === from);
  assert(
    chapterNodes.some((node) => listNodeEdges(node).some((nextId) => nodes[nextId]?.chapterId === to)),
    `${from} must naturally advance to ${to}`
  );
}
assert(
  Object.values(nodes).some((node) => node.chapterId === "chapter_06" && node.resolveEnding === true),
  "chapter_06 must reach a resolveEnding node"
);

for (const component of findNoExitCycles()) {
  assert(false, `cycle has no exit: ${component.join(" -> ")}`);
}
for (const node of Object.values(nodes)) {
  warn(!listNodeEdges(node).includes(node.nodeId), `${node.nodeId} self-references itself`);
}

const clueReachability = {};
for (const clueId of clueIds) clueReachability[clueId] = false;
for (const node of Object.values(nodes)) {
  for (const clueId of node.gainClues || []) clueReachability[clueId] = true;
  for (const choice of node.choices || []) {
    for (const clueId of choice.gainClues || []) clueReachability[clueId] = true;
  }
}
const unreachableClues = Object.entries(clueReachability).filter(([, isReachable]) => !isReachable).map(([clueId]) => clueId);
assert(unreachableClues.length === 0, `clues cannot be obtained: ${unreachableClues.join(", ")}`);
for (const [clueId, clue] of Object.entries(DATA.clues || {})) {
  assert(clue.clueId === clueId, `${clueId} clueId field does not match object key`);
  assert(clue.title && clue.description && clue.category, `${clueId} must provide title, description, and category`);
  assert(typeof clue.isKey === "boolean", `${clueId} must define isKey`);
}

assert(!/trust_xuzhiwan/.test(read("story-data.js")), "relationship key trust_xuzhiwan must not be mixed with trust_zhuwan");
assert(!/createNoiseBuffer|Math\.random\(\)\s*\*\s*2\s*-\s*1/.test(scriptText), "runtime must not reintroduce random white-noise fallback");
const voiceAudioNodes = Object.values(nodes).filter((node) => node.voiceAudio || node.narrationAudio);
assert(voiceAudioNodes.length === 0, `ordinary nodes must not use voiceAudio/narrationAudio; got ${voiceAudioNodes.map((node) => node.nodeId).join(", ")}`);
assert(/if \(state\.history\.length > 240\) state\.history\.shift\(\);/.test(scriptText), "history must keep a maximum length");
for (const requiredSnippet of [
  "nodeId: normalizedNodeId",
  "clues: normalizedClues",
  "unreadClues: normalizedUnreadClues",
  "relationships: normalizeRelationships",
  "relationshipEvents:",
  "endingPathTags:",
  "endingId: normalizedEndingId",
]) {
  assert(scriptText.includes(requiredSnippet), `normalizeState/snapshot must preserve ${requiredSnippet}`);
}

const routeExpectations = {
  a: "ending_a",
  b: "ending_b",
  c: "ending_c",
  d: "ending_d",
};
const routeResults = {};
for (const [routeName, expectedEnding] of Object.entries(routeExpectations)) {
  const result = simulateRoute(routeName);
  routeResults[routeName] = result;
  assert(!result.error, `route ${routeName} failed: ${result.error}`);
  assert(result.endingId === expectedEnding, `route ${routeName} expected ${expectedEnding}, got ${result.endingId}`);
  assert(result.visited.includes("ch06_020"), `route ${routeName} must reach ch06_020 before ending`);
  for (const value of Object.values(result.state.relationships)) {
    assert(Number.isFinite(value), `route ${routeName} relationship contains NaN`);
    assert(value >= -100 && value <= 100, `route ${routeName} relationship out of range: ${value}`);
  }
}
assert(new Set(Object.values(routeResults).map((result) => result.endingId)).size === 4, "route simulations must cover all four endings");

assert(exists("docs/STORY_FLOW_QA_REPORT.md"), "STORY_FLOW_QA_REPORT.md is missing");
assert(exists("docs/ENDING_PATHS_QA.md"), "ENDING_PATHS_QA.md is missing");
assert(exists("docs/SAVE_LOAD_QA_CHECKLIST.md"), "SAVE_LOAD_QA_CHECKLIST.md is missing");

if (failures.length) {
  console.error("Story flow check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("Story flow check warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("Story flow check passed.");
console.log(`nodes=${nodeIds.size}, reachable=${reachable.size}, unreachable=${unreachable.length}`);
console.log(`choices=${Object.values(nodes).filter((node) => node.type === "choice").length}, deductions=${Object.values(nodes).filter((node) => node.type === "deduction").length}`);
console.log(`clues=${clueIds.size}, obtainable=${clueIds.size - unreachableClues.length}, unobtainable=${unreachableClues.length}`);
console.log(`routes: A=${routeResults.a.endingId}, B=${routeResults.b.endingId}, C=${routeResults.c.endingId}, D=${routeResults.d.endingId}`);
