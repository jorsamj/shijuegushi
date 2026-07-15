import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "dormitory-story-data.js" });
const data = context.window.MIST_DORMITORY_DATA;
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(data?.routePlans, "Dormitory data must define QA route plans for all endings.");

function apply(state, source) {
  for (const clueId of source?.gainClues || []) if (!state.clues.includes(clueId)) state.clues.push(clueId);
  for (const flagId of source?.setFlags || []) state.flags[flagId] = true;
  for (const effect of source?.relationshipEffects || []) {
    state.relationships[effect.id] = Math.max(-100, Math.min(100, (state.relationships[effect.id] || 0) + Number(effect.delta || 0)));
  }
}

function choicesFor(node) {
  return node.choices?.length ? node.choices : node.question?.choices || [];
}

function runRoute(routeName) {
  const plan = data.routePlans?.[routeName] || { choices: {}, hotspots: [] };
  assert(data.routePlans?.[routeName], `Route ${routeName} is missing.`);
  const state = { clues: [], flags: { ...(data.defaultFlags || {}) }, relationships: {}, deductionScore: 0 };
  let nodeId = data.script.startNodeId;
  const visited = [];
  const seen = new Set();
  let safety = 0;

  while (nodeId && safety < 160) {
    safety += 1;
    const node = data.nodes[nodeId];
    if (!node) return { error: `missing node ${nodeId}`, state, visited };
    if (seen.has(nodeId)) return { error: `loop at ${nodeId}`, state, visited };
    seen.add(nodeId);
    visited.push(nodeId);
    apply(state, node);
    for (const hotspot of node.investigationHotspots || []) {
      if ((plan.hotspots || []).includes(`${node.nodeId}/${hotspot.hotspotId}`)) apply(state, hotspot);
    }
    if (node.resolveEnding === true) return { endingId: data.profile.endingResolver(state), state, visited };
    const choices = choicesFor(node);
    if (choices.length) {
      const choiceId = plan.choices?.[node.nodeId];
      const choice = choices.find((item) => item.choiceId === choiceId);
      if (!choice) return { error: `route ${routeName} has no valid choice for ${node.nodeId}`, state, visited };
      apply(state, choice);
      if (node.type === "deduction" && choice.isCorrect === true) state.deductionScore += 1;
      nodeId = choice.nextNodeId || node.nextNodeId;
    } else {
      nodeId = node.nextNodeId;
    }
  }
  return { error: `route ${routeName} exceeded traversal safety`, state, visited };
}

const expected = Object.fromEntries(Object.entries(data.routePlans || {}).map(([name, plan]) => [name, plan.expectedEnding]));
assert(Object.keys(expected).length === 8, `Dormitory route QA must cover eight endings; got ${Object.keys(expected).length}.`);

const results = {};
for (const [routeName, endingId] of Object.entries(expected)) {
  const result = runRoute(routeName);
  results[routeName] = result;
  assert(!result.error, result.error || "unknown route error");
  assert(result.endingId === endingId, `Route ${routeName} should reach ${endingId}; got ${result.endingId}.`);
  for (let chapter = 1; chapter <= 6; chapter += 1) {
    assert(result.visited.some((nodeId) => data.nodes[nodeId]?.chapterId === `dorm_chapter_${String(chapter).padStart(2, "0")}`), `Route ${routeName} misses chapter ${chapter}.`);
  }
}

const reachedEndings = new Set(Object.values(results).map((result) => result.endingId));
for (const endingId of Object.keys(data.endings || {})) {
  assert(reachedEndings.has(endingId), `Ending ${endingId} is not reached by any QA route.`);
}

assert(results.true_dawn?.state?.clues.length === Object.keys(data.clues || {}).length, "True dawn route must obtain all six clues.");
assert(results.true_dawn?.state?.flags?.trusted_true_broadcast, "True dawn route must identify the true broadcast.");
assert(results.true_dawn?.state?.flags?.final_no_response, "True dawn route must stop the final roll-call response.");
assert(results.second_xutang?.state?.flags?.identity_stolen || results.second_xutang?.state?.flags?.said_full_name, "Second-Xu-Tang route must expose identity theft risk.");
assert(results.east_passage?.state?.flags?.chose_east_route, "East-passage route must choose the east passage.");
assert(results.broken_broadcast?.state?.flags?.broke_broadcast, "Broken-broadcast route must break the broadcast room system.");
assert(results.left_behind?.state?.flags?.abandoned_real_survivor, "Left-behind route must abandon a real survivor.");
assert(results.legal_count?.state?.flags?.sacrificed_unknown, "Legal-count route must sacrifice a doubtful survivor.");

if (failures.length) {
  console.error("Dormitory ending-route check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory ending-route check passed.");
for (const [name, result] of Object.entries(results)) {
  const trueFlags = Object.entries(result.state.flags).filter(([, value]) => value).map(([key]) => key);
  console.log(`${name} => ${result.endingId}; nodes=${result.visited.length}; clues=${result.state.clues.length}; flags=${trueFlags.join(",")}`);
}
