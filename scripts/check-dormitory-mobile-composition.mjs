import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8"),
  context,
  { filename: "dormitory-story-data.js" },
);

const data = context.window.MIST_DORMITORY_DATA;
const css = `${fs.readFileSync(path.join(root, "style.css"), "utf8")}\n${fs.readFileSync(path.join(root, "mobile-story.css"), "utf8")}`;
const nodes = data?.nodes || {};
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const castNodes = Object.values(nodes).filter((node) => Array.isArray(node.visualCast) && node.visualCast.length > 0);
const importantNodeIds = new Set();

for (const beat of Object.values(data?.chapterBeats || {})) {
  for (const nodeId of [...(beat.investigationNodeIds || []), ...(beat.choiceNodeIds || [])]) importantNodeIds.add(nodeId);
}
for (const event of data?.phonePlaybook?.events || []) importantNodeIds.add(event.nodeId);
if (data?.script?.startNodeId) importantNodeIds.add(data.script.startNodeId);

assert(castNodes.length > 0, "Dormitory story must declare directed visualCast nodes.");
for (const node of castNodes) {
  for (const [index, member] of node.visualCast.entries()) {
    assert(member?.characterId, `${node.nodeId} visualCast member ${index} needs characterId.`);
    assert(typeof member?.mobileFraming === "string" && member.mobileFraming.trim().length > 0, `${node.nodeId}/${member?.characterId || index} needs mobileFraming.`);
    assert(Number.isFinite(member?.focusX) && Number.isFinite(member?.focusY), `${node.nodeId}/${member?.characterId || index} needs numeric focusX and focusY.`);
    assert(member.focusX >= 0 && member.focusX <= 100 && member.focusY >= 0 && member.focusY <= 100, `${node.nodeId}/${member?.characterId || index} focus coordinates must be percentages from 0 to 100.`);
  }
}

let importantCastCount = 0;
for (const nodeId of importantNodeIds) {
  const node = nodes[nodeId];
  assert(node, `Directed-cast target ${nodeId} is missing from dormitory nodes.`);
  if (Array.isArray(node?.visualCast) && node.visualCast.length > 0) importantCastCount += 1;
  else failures.push(`${nodeId} is a重点节点 and needs directed visualCast data.`);
}

assert(/env\(safe-area-inset-top\)/u.test(css), "Mobile CSS must reserve the top safe area.");
assert(/env\(safe-area-inset-bottom\)/u.test(css), "Mobile CSS must reserve the bottom safe area.");
assert(/env\(safe-area-inset-left\)/u.test(css) && /env\(safe-area-inset-right\)/u.test(css), "Mobile CSS must reserve both horizontal safe areas.");
assert(/\.dialogue-panel[\s\S]*?(?:max-height|padding-bottom|bottom\s*:)/u.test(css), "Mobile CSS must reserve space for the dialogue panel.");
assert(/--character-face-y\s*:/u.test(css), "Mobile CSS must expose a face-y focal point for character composition.");

if (failures.length) {
  console.error("Dormitory mobile composition check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory mobile composition check passed.");
console.log(`directedCastNodes=${castNodes.length}`);
console.log(`importantNodes=${importantNodeIds.size}`);
console.log(`importantCastNodes=${importantCastCount}`);
