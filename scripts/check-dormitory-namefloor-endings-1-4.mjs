import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const window = { MIST_DATA: { script: {}, scripts: [], series: [], chapters: [], nodes: {}, clues: {}, endings: {}, defaultFlags: {}, defaultStoryState: {} } };
const context = vm.createContext({ window, console, structuredClone });
vm.runInContext(read("assets/stories/dormitory-namefloor/story-data.js"), context);
vm.runInContext(read("assets/stories/dormitory-namefloor/story-chapters-2-7.js"), context);
const base = window.MIST_DORMITORY_NAMEFLOOR_DATA;
const expansion = window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7;
const data = { ...base, ...expansion, nodes: { ...base.nodes, ...expansion.nodes }, endings: { ...base.endings, ...expansion.endings } };

assert.deepEqual(Object.keys(data.endingConditions || {}).sort(), ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"], "All eight candidate conditions must live in the single resolver source.");
assert.deepEqual([...data.endingPriority], ["E8", "E3", "E2", "E4", "E5", "E6", "E7", "E1"], "Priority must match the approved branch matrix.");
assert.deepEqual(Object.keys(data.endings || {}).sort(), ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"], "The shared resolver must export all formal ending metadata.");
assert.equal(data.nodes.nf07_decision_entry?.nextNodeId, "nf_end_resolve", "Chapter 7 must continue through the deterministic ending resolver.");
assert.ok(data.nodes.nf_end_draft_stop?.type === "chapter-ending", "The abnormal unresolved state needs a controlled stop node.");

for (const [endingId, finalLine] of Object.entries({
  E1: "林峰，走了，回宿舍。",
  E2: "我不是宋明。可我记得，他不想让你们死。",
  E3: "峰哥，你别忘了你是谁。",
  E4: "你明明说过相信我。",
})) {
  const nodes = Object.values(data.nodes).filter((node) => node.endingId === endingId || node.endingRouteId === endingId);
  assert.ok(nodes.length >= 6, `${endingId} needs an independent complete runtime node chain.`);
  assert.ok(nodes.some((node) => node.text === finalLine || node.phoneScreen?.messages?.some((message) => message.text === finalLine)), `${endingId} must retain its canonical final line.`);
}

function followEndingRoute(startNodeId) {
  const visited = new Set();
  let nodeId = startNodeId;
  for (let step = 0; step < 20; step += 1) {
    assert.ok(!visited.has(nodeId), `Ending route looped at ${nodeId}.`);
    visited.add(nodeId);
    const node = data.nodes[nodeId];
    assert.ok(node, `Ending route references missing node ${nodeId}.`);
    if (node.resolveEnding === true) return node;
    assert.ok(node.nextNodeId, `Ending route stopped early at ${nodeId}.`);
    nodeId = node.nextNodeId;
  }
  assert.fail(`Ending route from ${startNodeId} exceeded the traversal guard.`);
}
for (const endingId of ["E1", "E2", "E3", "E4"]) {
  const finalNode = followEndingRoute(data.profile.endingRouteResolver({}, endingId));
  assert.equal(finalNode.endingId, endingId, `${endingId} may not cross into another ending.`);
}
assert.notEqual(data.profile.endingRouteResolver({}, "E5"), "nf_end_draft_stop", "Formal later endings must have their own route.");

const resolve = data.profile.endingResolver;
const cases = {
  E1: { flags: { song_rescue_on_time: true, song_new_memory_verified: true, song_voluntary_risk: true, rescued_trapped_student: true, roster_quota_broken: true, rejected_all_present: true, no_one_left: true, exit_audited: true, all_core_escape: true } },
  E2: { flags: { said_songming_full_name: true, song_rescue_delayed: true, song_new_memory_verified: true, song_mimic_self_aware: true, song_mimic_sacrificed: true } },
  E3: { flags: { guyu_anchor_burden: true, guyu_voluntary_substitution: true, guyu_continuous_anchor: true, guyu_trust_stable: true, linfeng_restored: true } },
  E4: { flags: { explicit_trust_promise: true, trusted_then_abandoned: true, misjudged_human: true } },
  E5: { flags: { roster_intact: true, confirmed_all_present: true, sacrificed_for_quota: true, mechanical_compliance: true, original_person_lost: true } },
};
for (const [expected, state] of Object.entries(cases)) assert.equal(resolve(state), expected, `${expected} must resolve deterministically.`);
assert.equal(resolve({ flags: { fifth_seed: true, fifth_released: true, identity_unresolved: true } }), "E7", "The fifth-shadow route must remain distinct from the first four endings.");
assert.equal(resolve({ flags: {} }), "UNRESOLVED", "No-match fallback must be controlled without pretending to have earned a formal ending.");
console.log("Dormitory endings 1-4 check passed.");
