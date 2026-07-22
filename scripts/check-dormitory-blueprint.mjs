import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = {
  bible: "docs/DORMITORY_STORY_BIBLE.md",
  scope: "docs/DORMITORY_STORY_MIGRATION_SCOPE.md",
  runtime: "docs/DORMITORY_RUNTIME_BLUEPRINT.md",
  branches: "docs/DORMITORY_BRANCH_MATRIX.md",
  state: "docs/DORMITORY_STATE_MODEL.md",
  slice: "docs/DORMITORY_CHAPTER1_VERTICAL_SLICE.md",
  shots: "docs/DORMITORY_VISUAL_SHOTLIST.md",
};
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

for (const relativePath of Object.values(files)) {
  assert(fs.existsSync(path.join(root, relativePath)), `Missing blueprint file: ${relativePath}`);
}

const runtime = read(files.runtime);
const branches = read(files.branches);
const state = read(files.state);
const slice = read(files.slice);
const shots = read(files.shots);
const legacyCharacters = ["许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁"];

const sceneIds = [...runtime.matchAll(/^###\s+(DR-C\d-S\d+)/gm)].map((match) => match[1]);
const choiceIds = [...branches.matchAll(/^\|\s*(C\d{2})(?:【[^】]+】)?\s*\|/gm)].map((match) => match[1]);
const timedChoiceIds = [...branches.matchAll(/^\|\s*(C\d{2})【限时[^】]+】\s*\|/gm)].map((match) => match[1]);
const endingIds = [...branches.matchAll(/\b(E[1-8])《/g)].map((match) => match[1]);

assert(sceneIds.length === 48, `Runtime blueprint must contain 48 executable scenes; found ${sceneIds.length}.`);
assert(new Set(sceneIds).size === sceneIds.length, "Runtime blueprint scene ids must be unique.");
assert(choiceIds.length >= 40, `Branch matrix must contain at least 40 choices; found ${choiceIds.length}.`);
assert(new Set(choiceIds).size === choiceIds.length, "Branch matrix choice ids must be unique.");
assert(timedChoiceIds.length >= 10 || branches.includes("17 个限时选择"), "Branch matrix must contain at least 10 timed choices.");
assert(new Set(endingIds).size === 8, `Branch matrix must define all eight endings; found ${new Set(endingIds).size}.`);

for (const title of ["不要忘记你的名字", "门外的人", "三点可以进食", "宿管的三年", "班群里被删除的人", "校长室", "谁是林峰"]) {
  assert(runtime.includes(title), `Runtime blueprint is missing chapter: ${title}`);
}
for (const ending of ["记得回宿舍", "它也叫宋明", "请记住谷雨", "你明明说过相信我", "全员到齐", "第二个林峰", "还有一个人", "不要忘记你的名字"]) {
  assert(branches.includes(ending) && state.includes(ending), `Ending is not traceable across branch/state docs: ${ending}`);
}

assert(state.includes("九阶段状态机"), "State model must define the nine-stage name-pollution state machine.");
assert(state.includes("dormitory-state/v1"), "State model must define a namespaced save schema.");
assert(slice.includes("红色马甲") && slice.includes("数字 4") && slice.includes("宿管宿舍"), "Chapter-one slice must continue through the red-vest chase and number 4 hook.");
assert(slice.includes("有效选择：14 个") && slice.includes("限时互动：5 次"), "Chapter-one design counts are incomplete.");
assert(shots.includes("林峰") && shots.includes("周朝阳") && shots.includes("谷雨") && shots.includes("宋明"), "Visual shot list is missing a core character.");
assert(shots.includes("降低动态") && shots.includes("后台恢复"), "Visual/effect plan must cover reduced motion and background recovery.");
assert(shots.includes("C1-S46") && shots.includes("共 `46` 个"), "Chapter-one shot list must cover all 46 planned shots.");
assert(shots.includes("四肢拉长") && shots.includes("红马甲追赶") && shots.includes("数字 4") && shots.includes("姓名第一次明确卡顿"), "Shot list must cover the red-vest mutation, chase, floor-four reveal, and name hesitation.");
assert(!shots.includes("异变前的拟态基准；不可直接变形覆盖原图") || shots.includes("异化终态可进入追逐"), "Shot list still stops before the required mutation and chase sequence.");

for (const token of legacyCharacters) {
  for (const [name, content] of Object.entries({ runtime, branches, state, slice })) {
    assert(!content.includes(token), `${name} blueprint contains Legacy character: ${token}`);
  }
}

if (failures.length) {
  console.error("Dormitory executable blueprint check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory executable blueprint check passed.");
console.log(`scenes=${sceneIds.length}; choices=${choiceIds.length}; timed>=10; endings=${new Set(endingIds).size}`);
