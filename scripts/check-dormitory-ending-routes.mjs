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

assert(data?.routePlans, "Dormitory data must define QA route plans for all four endings.");

function apply(state, source) {
  for (const clueId of source?.gainClues || []) if (!state.clues.includes(clueId)) state.clues.push(clueId);
  for (const flagId of source?.setFlags || []) state.flags[flagId] = true;
  for (const effect of source?.relationshipEffects || []) state.relationships[effect.id] = Math.max(-100, Math.min(100, (state.relationships[effect.id] || 0) + Number(effect.delta || 0)));
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

  while (nodeId && safety < 120) {
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

const expected = { a: "dorm_ending_a", b: "dorm_ending_b", c: "dorm_ending_c", d: "dorm_ending_d" };
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

assert(results.a?.state?.clues.length === Object.keys(data.clues || {}).length, "A route must obtain all six clues.");
assert(results.a?.state?.flags?.trusted_correction, "A route must trust the hidden correction rule.");
assert(results.a?.state?.flags?.corrected_2014_count && results.a?.state?.flags?.corrected_417_count, "A route must correct both historical and current counts.");
assert(results.b?.state?.flags?.sent_unregistered_downstairs, "B route must hand over Xu Tang.");
assert(results.c?.state?.flags?.accused_wrong_person, "C route must accuse another roommate.");
assert(results.d?.state?.flags?.cut_broadcast, "D route must cut or abandon the broadcast.");

if (failures.length) {
  console.error("Dormitory ending-route check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory ending-route check passed.");
for (const [name, result] of Object.entries(results)) {
  console.log(`${name.toUpperCase()} => ${result.endingId}; nodes=${result.visited.length}; clues=${result.state.clues.length}; flags=${Object.entries(result.state.flags).filter(([, value]) => value).map(([key]) => key).join(",")}`);
}
