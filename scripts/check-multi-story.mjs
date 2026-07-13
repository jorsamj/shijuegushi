import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "dormitory-story-data.js" });
const data = context.window.MIST_DORMITORY_DATA;
const failures = [];

if (!data || data.script?.scriptId !== "script_dormitory_rollcall") failures.push("Dormitory story data lacks the independent script id.");
if (data?.series?.seriesId !== "series_dormitory_rollcall") failures.push("Dormitory story data lacks the independent series id.");
if ((data?.chapters || []).length !== 6) failures.push("Dormitory story must contain six chapters.");
if ((data?.rules || []).length !== 8) failures.push("Dormitory story must contain all eight rules.");
if (Object.keys(data?.clues || {}).length !== 6) failures.push("Dormitory story must contain six core clues.");
if (Object.keys(data?.endings || {}).length !== 4) failures.push("Dormitory story must contain four endings.");

const expectedEndings = ["dorm_ending_a", "dorm_ending_b", "dorm_ending_c", "dorm_ending_d"];
for (const endingId of expectedEndings) {
  if (!data?.endings?.[endingId]) failures.push(`Missing dormitory ending ${endingId}.`);
}

const nodes = data?.nodes || {};
const startNodeId = data?.script?.startNodeId;
if (!nodes[startNodeId]) failures.push("Dormitory story start node is missing.");
for (const node of Object.values(nodes)) {
  if (!data?.chapters?.some((chapter) => chapter.chapterId === node.chapterId)) failures.push(`${node.nodeId} has an unknown chapter.`);
  if (node.nextNodeId && !nodes[node.nextNodeId] && !data?.endings?.[node.nextNodeId]) failures.push(`${node.nodeId} points to a missing node.`);
  for (const clueId of node.gainClues || []) if (!data?.clues?.[clueId]) failures.push(`${node.nodeId} grants an unknown clue ${clueId}.`);
  for (const choice of node.choices || []) {
    if (choice.nextNodeId && !nodes[choice.nextNodeId] && !data?.endings?.[choice.nextNodeId]) failures.push(`${node.nodeId}/${choice.choiceId} points to a missing node.`);
  }
}

const ruleEight = data?.rules?.find((rule) => rule.ruleId === "dorm_rule_08");
if (!ruleEight) failures.push("Rule eight is missing.");
if (!Object.values(nodes).some((node) => (node.ruleUpdates || []).some((update) => update.ruleId === "dorm_rule_08" && update.status === "forged"))) {
  failures.push("Rule eight never becomes forged in the story flow.");
}

const engine = fs.readFileSync(path.join(root, "script.js"), "utf8");
for (const token of ["STORY_DATASETS", "STORY_CATALOG", "getStoryStorageKeys", "activateStory", "script_dormitory_rollcall"]) {
  if (!engine.includes(token)) failures.push(`Shared engine lacks multi-story integration token: ${token}.`);
}

if (failures.length) {
  console.error("Multi-story check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Multi-story check passed.");
