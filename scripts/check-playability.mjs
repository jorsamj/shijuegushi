import fs from "node:fs";
import vm from "node:vm";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function loadStory() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

const story = loadStory();
const script = read("script.js");
const nodes = Object.values(story.nodes || {});
const choiceNodes = nodes.filter((node) => node.type === "choice");
const deductionNodes = nodes.filter((node) => node.type === "deduction");

assert(choiceNodes.length >= 13, `choice node count should stay substantial, got ${choiceNodes.length}`);
assert(deductionNodes.length === 5, `final deduction must contain 5 questions, got ${deductionNodes.length}`);
assert(script.includes("openChoiceFeedback"), "runtime must show choice feedback");
assert(script.includes("renderEndingReport"), "runtime must render ending report");
assert(script.includes("buildEndingPathReport"), "runtime must explain ending path");

for (const node of [...choiceNodes, ...deductionNodes]) {
  assert((node.choices || []).length >= 2, `${node.nodeId} must offer at least two choices`);
  for (const choice of node.choices || []) {
    const hasImpact =
      (choice.setFlags || []).length ||
      (choice.relationshipEffects || []).length ||
      (choice.endingPathTags || []).length ||
      (choice.gainClues || []).length ||
      choice.choiceImpactText ||
      node.type === "deduction";
    assert(hasImpact, `${node.nodeId}.${choice.choiceId} needs perceptible impact`);
    assert(typeof choice.choiceIntent === "string" && choice.choiceIntent.length > 0, `${node.nodeId}.${choice.choiceId} needs a non-spoiler choiceIntent`);
  }
}

assert(nodes.some((node) => node.objectiveId && node.objectiveText), "runtime data must include current objectives");
assert(nodes.some((node) => (node.investigationHotspots || []).length), "runtime data must include investigation hotspots");
assert(nodes.some((node) => (node.evidenceLinks || []).length), "runtime data must include evidence board links");

for (const node of deductionNodes) {
  assert(node.choices.filter((choice) => choice.isCorrect).length === 1, `${node.nodeId} must have exactly one correct answer`);
  assert(node.choices.every((choice) => choice.feedbackTitle && choice.feedbackTone), `${node.nodeId} choices must include feedback title/tone`);
}

const coreClues = Object.keys(story.clues || {}).filter((id) => story.clues[id].isKey);
assert(coreClues.length === 6, `core clue chain must contain 6 key clues, got ${coreClues.length}`);
for (const clueId of coreClues) {
  assert(nodes.some((node) => (node.gainClues || []).includes(clueId) || (node.choices || []).some((choice) => (choice.gainClues || []).includes(clueId))), `${clueId} must be obtainable`);
}

for (const endingId of ["ending_a", "ending_b", "ending_c", "ending_d"]) {
  assert(story.endings?.[endingId], `${endingId} must exist`);
  assert(script.includes(endingId), `${endingId} must be referenced by runtime ending report`);
}

if (errors.length) {
  console.error("Playability check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Playability check passed.");
