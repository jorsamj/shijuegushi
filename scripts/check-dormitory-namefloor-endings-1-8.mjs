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
const endingIds = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"];
const engineSource = read("script.js");

assert.deepEqual(Object.keys(data.endings || {}).sort(), endingIds, "All eight canonical endings must export formal runtime metadata.");
assert.deepEqual(Object.keys(data.endingConditions || {}).sort(), endingIds, "The single resolver source must document all eight ending conditions.");
assert.deepEqual(Object.keys(data.endingPreconditions || {}).sort(), endingIds, "The single resolver source must document all eight ending preconditions.");
assert.deepEqual([...data.endingPriority], ["E8", "E3", "E2", "E4", "E5", "E6", "E7", "E1"], "Ending priority must remain canonical.");
assert.ok(!/Math\.random|Date\.now|new Date/.test(String(data.profile.endingResolver)), "Ending resolver must be deterministic.");
assert.match(engineSource, /endingRouteResolver:\s*dataset\.profile\.endingRouteResolver/, "The runtime profile must retain the formal ending route resolver.");

function followEndingRoute(startNodeId) {
  const visited = new Set();
  let nodeId = startNodeId;
  for (let step = 0; step < 24; step += 1) {
    assert.ok(!visited.has(nodeId), `Ending route looped at ${nodeId}.`);
    visited.add(nodeId);
    const node = data.nodes[nodeId];
    assert.ok(node, `Ending route references missing node ${nodeId}.`);
    if (node.resolveEnding === true) return { node, visited };
    assert.ok(node.nextNodeId, `Ending route stopped early at ${nodeId}.`);
    nodeId = node.nextNodeId;
  }
  assert.fail(`Ending route from ${startNodeId} exceeded the traversal guard.`);
}

const coreText = {
  E1: ["林峰，走了，回宿舍。"],
  E2: ["我不是宋明。", "可我记得，他不想让你们死。"],
  E3: ["峰哥，你别忘了你是谁。"],
  E4: ["你明明说过相信我。"],
  E5: ["昨夜宿舍秩序正常，无人员失踪。", "所有人都在，但不是所有人都回来了。"],
  E6: ["他们叫住了林峰，可回头的人不是我。"],
  E7: ["群成员人数未发生变化。", "我们没有再数第五遍。"],
  E8: ["不要忘记你的名字。"],
};

for (const endingId of endingIds) {
  const routeStart = data.profile.endingRouteResolver({}, endingId);
  assert.notEqual(routeStart, "nf_end_draft_stop", `${endingId} must not enter the Draft stop route.`);
  const { node: finalNode, visited } = followEndingRoute(routeStart);
  assert.equal(finalNode.endingId, endingId, `${endingId} may not cross into another ending.`);
  assert.ok(visited.size >= 6, `${endingId} needs an independent complete ending chain.`);
  const routeNodes = [...visited].map((nodeId) => data.nodes[nodeId]);
  const routeCopy = JSON.stringify(routeNodes);
  for (const text of coreText[endingId]) assert.ok(routeCopy.includes(text), `${endingId} must contain its reachable core text.`);
}

const resolve = data.profile.endingResolver;
const cases = {
  E1: { flags: { song_rescue_on_time: true, song_new_memory_verified: true, song_voluntary_risk: true, rescued_trapped_student: true, roster_quota_broken: true, rejected_all_present: true, no_one_left: true, exit_audited: true, all_core_escape: true } },
  E2: { flags: { said_songming_full_name: true, song_rescue_delayed: true, song_new_memory_verified: true, song_mimic_self_aware: true, song_mimic_sacrificed: true } },
  E3: { flags: { guyu_anchor_burden: true, guyu_voluntary_substitution: true, guyu_continuous_anchor: true, guyu_trust_stable: true, linfeng_restored: true } },
  E4: { flags: { explicit_trust_promise: true, trusted_then_abandoned: true, misjudged_human: true } },
  E5: { flags: { roster_intact: true, confirmed_all_present: true, sacrificed_for_quota: true, mechanical_compliance: true, original_person_lost: true } },
  E6: { flags: { lin_continuity_broken: true, legal_linfeng_confirmed: true, legal_linfeng_named: true, player_linfeng_escaped_nameless: true } },
  E7: { flags: { fifth_seed: true, fifth_released: true, identity_unresolved: true } },
  E8: { namePollutionStage: 9, flags: { black_avatar_roster_slot: true, sent_loop_warning: true } },
};
for (const [expected, state] of Object.entries(cases)) assert.equal(resolve(state), expected, `${expected} must resolve deterministically from its exclusive route.`);
assert.equal(resolve({ flags: {} }), "UNRESOLVED", "A state that earned no ending must enter a controlled abnormal fallback, not pretend to have earned E8.");

const regularRoutes = Object.values(data.routePlans || {});
assert.equal(regularRoutes.length, 8, "All eight endings need a deterministic automatic route plan.");
for (const plan of regularRoutes) assert.ok(endingIds.includes(plan.expectedEnding), "Automatic ending route plan must target a canonical ending.");

console.log("Dormitory endings 1-8 check passed.");
