import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const dataSource = fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(dataSource, context, { filename: "dormitory-story-data.js" });
const data = context.window.MIST_DORMITORY_DATA;
const engine = fs.readFileSync(path.join(root, "script.js"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
const mobileCss = fs.readFileSync(path.join(root, "mobile-story.css"), "utf8");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(engine.includes("DATA.rulePlaybook"), "Rule board must read the story-owned rule playbook.");
assert(engine.includes("data-rule-detail"), "Rule board must expose a tappable detail action for every rule.");
assert(engine.includes("规则状态"), "Rule board must use player-facing Chinese status copy.");
assert(engine.includes("我知道啦"), "Rule detail must use the standard acknowledgement action.");
assert(css.includes(".rule-board-row"), "Rule board rows need dedicated desktop styling.");
assert(css.includes(".rule-detail"), "Rule detail needs dedicated visual styling.");
assert(mobileCss.includes(".rule-board-row"), "Rule board requires a mobile layout rule.");

for (const rule of [...(data.rules || []), ...(data.hiddenRules || [])]) {
  assert(data.rulePlaybook?.[rule.ruleId], `${rule.ruleId} must be available to the rule board.`);
}

if (failures.length) {
  console.error("Dormitory rule board check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory rule board check passed.");
console.log(`rules=${Object.keys(data.rulePlaybook || {}).join(",")}`);
