import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const dataPath = path.join(root, "assets", "stories", "dormitory-namefloor", "story-data.js");
const enginePath = path.join(root, "script.js");
const stylePath = path.join(root, "style.css");
const mobileStylePath = path.join(root, "mobile-story.css");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function loadBrowserGlobal(filePath, globalName) {
  const window = {};
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), { window, console }, { filename: filePath });
  return window[globalName];
}

const data = loadBrowserGlobal(dataPath, "MIST_DORMITORY_NAMEFLOOR_DATA");
const nodes = data?.nodes || {};
const nodeList = Object.values(nodes);
const engine = fs.readFileSync(enginePath, "utf8");
const styles = fs.readFileSync(stylePath, "utf8");
const mobileStyles = fs.readFileSync(mobileStylePath, "utf8");
const visibleCopy = nodeList.flatMap((node) => [
  node.speaker,
  node.text,
  node.chapterEnding?.title,
  node.chapterEnding?.text,
  node.chapterEnding?.ctaLabel,
  ...(node.choices || []).map((choice) => choice.text),
  ...(node.phoneScreen?.actions || []).map((action) => action.label),
  ...(node.phoneScreen?.messages || []).flatMap((message) => [message.sender, message.text, message.status]),
  ...(node.phoneScreen?.members || []).map((member) => member.name),
  node.phoneScreen?.systemNotice,
]).filter(Boolean).join("\n");

const forbiddenVisibleTokens = [
  "basic-credible", "internal state", "rule-state", "roleId", "nodeId", "debug",
  "vertical-slice", "blueprint-only",
];
for (const token of forbiddenVisibleTokens) {
  assert(!visibleCopy.includes(token), `Player copy exposes internal token: ${token}`);
}
assert(!/nf01_03(?:1|4)[\s\S]{0,360}contentType:\s*"broadcast"/.test(fs.readFileSync(dataPath, "utf8")), "door-side red-vest voice must not be labelled as dormitory broadcast");
assert(!/is-reduced-motion\s+\.scene-effect-layer\s*\{\s*display:\s*none/.test(mobileStyles), "mobile reduced-motion mode must retain the static effect cue");

const fragmentPatterns = [
  /^(他|她|我)(说|问|回头|点头)。?$/,
  /^(门响了|手机震动|停了一下)。?$/,
];
const suspiciousFragments = nodeList.filter((node) => fragmentPatterns.some((pattern) => pattern.test(String(node.text || "").trim())));
assert(suspiciousFragments.length === 0, `Fragment dialogue boxes remain: ${suspiciousFragments.map((node) => node.nodeId).join(", ")}`);

for (const node of nodeList) {
  assert(node.chapterId === "namefloor_chapter_01", `${node.nodeId} escapes the frozen chapter-one scope.`);
  if (node.speaker === "旁白") assert(node.voiceEnabled !== true, `${node.nodeId} enables narration voice.`);
  for (const effect of node.effects || []) {
    assert(engine.includes(`"${effect.type}"`), `${node.nodeId} uses an unregistered effect: ${effect.type}`);
    assert(styles.includes(`effect-${effect.type}`), `${node.nodeId} effect has no visible CSS treatment: ${effect.type}`);
  }
}

const noSendAction = nodes.nf01_015?.phoneScreen?.actions?.find((action) => action.actionId === "send_nothing");
assert(noSendAction && !String(nodes[noSendAction.nextNodeId]?.text || "").includes("未送达"), "Choosing not to send must not show a failed outgoing message.");
assert(!String(nodes.nf01_030?.text || "").includes("我叫林"), "The first explicit self-name blockage must remain at the fourth-floor hook.");
assert(/锁舌|门卡|舍友|开门/.test(String(nodes.nf01_024?.text || "")), "The neighboring dorm needs a credible reason for opening its door.");
assert(/谷雨|林峰|周朝阳/.test(String(nodes.nf01_026?.text || "")), "The neighboring attack needs an immediate character reaction.");
assert(/01:00|一点/.test(String(nodes.nf01_030?.text || "")), "The red-vest inspection needs a visible time transition.");
assert(nodeList.some((node) => /周朝阳.*(靠近|走向|迈向|观察)/.test(String(node.text || ""))), "Zhou Chaoyang needs an explicit action before Lin Feng challenges him at floor four.");
assert(!(nodes.nf01_023?.effects || []).some((effect) => effect.type === "blood-edge"), "The door-scratch beat must not show blood before the neighboring attack.");
assert(data.profile?.capabilities?.hideTruthMeter === true, "The chapter-one player UI must hide the generic truth meter.");
assert(data.profile?.capabilities?.hideRelationshipNumbers === true, "The chapter-one player UI must not expose relationship values.");
assert(engine.includes("is-reduced-cue"), "Reduced-motion mode must retain a static visual cue instead of silently dropping every effect.");
assert(engine.includes("NODE_ACTION_GUARD_MS"), "A cross-node rapid-tap guard must prevent one double tap from skipping two beats.");

let nodeId = data.script?.startNodeId;
const visited = new Set();
const route = [];
const metrics = {
  ordinaryContinue: 0,
  phoneOperations: 0,
  effectiveDecisions: 0,
  timedDecisions: 0,
  maxContinueStreak: 0,
};
let continueStreak = 0;

while (nodeId && nodes[nodeId] && !visited.has(nodeId)) {
  visited.add(nodeId);
  const node = nodes[nodeId];
  route.push(nodeId);
  if (node.type === "chapter-ending") break;
  if (node.type === "phone-interaction" && node.phoneScreen?.actions?.length > 1) {
    continueStreak = 0;
    metrics.phoneOperations += 1;
    metrics.effectiveDecisions += 1;
    nodeId = node.phoneScreen.actions[0].nextNodeId;
  } else if ((node.choices || []).length > 1) {
    continueStreak = 0;
    metrics.effectiveDecisions += 1;
    if (node.phoneScreen) metrics.phoneOperations += 1;
    if (node.timedChoice) metrics.timedDecisions += 1;
    nodeId = node.choices[0].nextNodeId;
  } else if (node.phoneScreen && node.nextNodeId) {
    continueStreak = 0;
    metrics.phoneOperations += 1;
    nodeId = node.nextNodeId;
  } else {
    metrics.ordinaryContinue += 1;
    continueStreak += 1;
    metrics.maxContinueStreak = Math.max(metrics.maxContinueStreak, continueStreak);
    nodeId = node.nextNodeId;
  }
}

assert(nodes[route.at(-1)]?.type === "chapter-ending", "The acceptance route must reach the chapter-ending hook.");
assert(metrics.effectiveDecisions >= 8, `Expected at least 8 effective decisions; found ${metrics.effectiveDecisions}.`);
assert(metrics.timedDecisions >= 2, `Expected at least 2 timed decisions; found ${metrics.timedDecisions}.`);
assert(metrics.maxContinueStreak <= 4, `Too many uninterrupted continue-only beats: ${metrics.maxContinueStreak}.`);
assert(metrics.phoneOperations >= 2, `Expected at least 2 phone operations; found ${metrics.phoneOperations}.`);

if (failures.length) {
  console.error("Dormitory chapter-one acceptance check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory chapter-one acceptance check passed.");
console.log(`nodes=${nodeList.length}; reachableRoute=${route.length}; ordinaryContinue=${metrics.ordinaryContinue}; phoneOperations=${metrics.phoneOperations}; effectiveDecisions=${metrics.effectiveDecisions}; timedDecisions=${metrics.timedDecisions}; maxContinueStreak=${metrics.maxContinueStreak}`);
console.log(`route=${route.join(" -> ")}`);
