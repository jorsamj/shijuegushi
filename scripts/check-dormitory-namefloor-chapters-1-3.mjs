import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function runStoryData() {
  const window = {};
  window.MIST_DATA = {
    schemaVersion: "chapter-1-3-check",
    product: { name: "第二人生" },
    script: { scriptId: "script_rain_call", startNodeId: "rain_start" },
    scripts: [{ scriptId: "script_rain_call", startNodeId: "rain_start" }],
    series: [],
    chapters: [],
    nodes: { rain_start: { nodeId: "rain_start" } },
    clues: {},
    endings: {},
    defaultFlags: {},
    defaultStoryState: {},
  };
  const context = vm.createContext({ window, console, structuredClone });
  vm.runInContext(read("assets/stories/dormitory-namefloor/story-data.js"), context, { filename: "story-data.js" });
  vm.runInContext(read("assets/stories/dormitory-namefloor/story-chapters-2-7.js"), context, { filename: "story-chapters-2-7.js" });
  const base = window.MIST_DORMITORY_NAMEFLOOR_DATA;
  const expansion = window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7;
  assert.ok(base, "Base name-floor story data must load.");
  assert.ok(expansion, "Chapter 2-3 expansion must load.");
  const chapterMap = new Map((base.chapters || []).map((chapter) => [chapter.chapterId, chapter]));
  (expansion.chapters || []).forEach((chapter) => chapterMap.set(chapter.chapterId, chapter));
  return {
    ...base,
    ...expansion,
    script: { ...base.script, ...(expansion.script || {}) },
    chapters: [...chapterMap.values()].sort((a, b) => (a.order || 0) - (b.order || 0)),
    nodes: { ...(base.nodes || {}), ...(expansion.nodes || {}) },
    clues: { ...(base.clues || {}), ...(expansion.clues || {}) },
    defaultFlags: { ...(base.defaultFlags || {}), ...(expansion.defaultFlags || {}) },
    defaultStoryState: { ...(base.defaultStoryState || {}), ...(expansion.defaultStoryState || {}) },
  };
}

function choicesFor(node) {
  return node?.choices?.length ? node.choices : node?.phoneScreen?.actions || [];
}

function pickDefaultChoice(node) {
  const choices = choicesFor(node).filter((choice) => !choice.timeoutOnly);
  assert.ok(choices.length > 0, `${node.nodeId} has no playable non-timeout choice.`);
  return choices[0];
}

function walkDefaultRoute(data, startNodeId) {
  const route = [];
  const seen = new Set();
  let nodeId = startNodeId;
  for (let step = 0; step < 260; step += 1) {
    assert.ok(!seen.has(nodeId), `Default route looped at ${nodeId}.`);
    seen.add(nodeId);
    const node = data.nodes[nodeId];
    assert.ok(node, `Default route references missing node ${nodeId}.`);
    route.push(node);
    if (node.type === "chapter-ending" && !node.nextNodeId) return route;
    const choices = choicesFor(node);
    if (choices.length) {
      nodeId = pickDefaultChoice(node).nextNodeId || node.nextNodeId;
    } else {
      assert.ok(node.nextNodeId, `Default route stopped early at ${nodeId}.`);
      nodeId = node.nextNodeId;
    }
  }
  assert.fail("Default route exceeded traversal guard.");
}

function countDecisionNodes(nodes, chapterId) {
  return nodes.filter((node) => node.chapterId === chapterId && (node.type === "choice" || node.type === "deduction"));
}

function visibleNodeText(node) {
  return [node.speaker, node.text, ...(node.choices || []).map((choice) => choice.text)].filter(Boolean).join(" ");
}

function assertPlayableChapterChoices(nodes, chapterId, data) {
  countDecisionNodes(nodes, chapterId).forEach((node) => {
    assert.ok(choicesFor(node).length > 0, `${node.nodeId} must expose choices.`);
    choicesFor(node).forEach((choice) => {
      assert.ok(choice.nextNodeId, `${choice.choiceId || choice.actionId} must advance.`);
      assert.ok(data.nodes[choice.nextNodeId], `${choice.choiceId || choice.actionId} points to missing ${choice.nextNodeId}.`);
      assert.ok(
        (choice.setFlags || []).length ||
          (choice.gainClues || []).length ||
          (choice.relationshipEffects || []).length ||
          choice.storyState ||
          (choice.stateUpdates || []).length,
        `${choice.choiceId || choice.actionId} must have an immediate or delayed state consequence.`,
      );
    });
  });
}

const data = runStoryData();
const nodes = Object.values(data.nodes || {});
const chapter2Id = "namefloor_chapter_02";
const chapter3Id = "namefloor_chapter_03";
const laterChapterIds = [
  "namefloor_chapter_04",
  "namefloor_chapter_05",
  "namefloor_chapter_06",
  "namefloor_chapter_07",
];
const activeLaterChapterIds = laterChapterIds.filter((chapterId) => {
  const chapter = data.chapters.find((item) => item.chapterId === chapterId);
  return chapter?.status === "runtime";
});

assert.equal(data.nodes.nf01_040?.nextNodeId, "nf02_001", "Chapter 1 ending must continue into Chapter 2.");
const defaultRoute = walkDefaultRoute(data, "nf01_040");
assert.ok(defaultRoute.some((node) => node.chapterId === chapter2Id), "Chapter 2 must be reachable from Chapter 1.");
assert.ok(defaultRoute.some((node) => node.chapterId === chapter3Id), "Chapter 3 must be reachable from Chapter 2.");
assert.equal(defaultRoute.at(-1)?.type, "chapter-ending", "Current formal runtime must stop on a chapter-ending hook.");
if (activeLaterChapterIds.length === 0) {
  assert.equal(defaultRoute.at(-1)?.chapterId, chapter3Id, "Chapter 1-3 phase must stop at the Chapter 3 hook.");
  assert.ok(!defaultRoute.some((node) => laterChapterIds.includes(node.chapterId)), "Chapters 4-7 must not be reachable during the Chapter 1-3 phase.");
} else {
  activeLaterChapterIds.forEach((chapterId) => {
    assert.ok(defaultRoute.some((node) => node.chapterId === chapterId), `${chapterId} is runtime and must remain reachable after Chapter 3.`);
  });
}

laterChapterIds.forEach((chapterId) => {
  const chapter = data.chapters.find((item) => item.chapterId === chapterId);
  if (chapter?.status === "runtime") {
    assert.equal(nodes.some((node) => node.chapterId === chapterId), true, `${chapterId} is runtime and must export nodes.`);
  } else {
    assert.ok(!chapter || chapter.status !== "runtime", `${chapterId} must remain blueprint-only or absent.`);
    assert.equal(nodes.some((node) => node.chapterId === chapterId), false, `${chapterId} must not export runtime nodes this phase.`);
  }
});

const chapter2Decisions = countDecisionNodes(nodes, chapter2Id);
const chapter3Decisions = countDecisionNodes(nodes, chapter3Id);
assert.ok(chapter2Decisions.length >= 8, `Chapter 2 needs at least 8 effective choice nodes; found ${chapter2Decisions.length}.`);
assert.ok(chapter3Decisions.length >= 9, `Chapter 3 needs at least 9 effective choice nodes; found ${chapter3Decisions.length}.`);
assert.ok(chapter2Decisions.filter((node) => node.timedChoice).length >= 2, "Chapter 2 needs at least 2 timed choices.");
assert.ok(chapter3Decisions.filter((node) => node.timedChoice).length >= 3, "Chapter 3 needs at least 3 timed choices.");
assertPlayableChapterChoices(nodes, chapter2Id, data);
assertPlayableChapterChoices(nodes, chapter3Id, data);

const chapter2PhoneNodes = nodes.filter((node) => node.chapterId === chapter2Id && node.phoneScreen);
const chapter3PhoneNodes = nodes.filter((node) => node.chapterId === chapter3Id && node.phoneScreen);
assert.ok(chapter2PhoneNodes.length >= 3, `Chapter 2 needs at least 3 phone/rule interactions; found ${chapter2PhoneNodes.length}.`);
assert.ok(chapter3PhoneNodes.length >= 4, `Chapter 3 needs phone interactions for warning, identity, account, and rules; found ${chapter3PhoneNodes.length}.`);
assert.equal((data.managerRules || []).length, 7, "Seven manager rules must be available to the runtime.");
assert.equal((data.rules || []).length, 8, "Eight student rules must remain available.");
assert.ok(chapter2PhoneNodes.some((node) => (node.phoneScreen?.rules || []).length >= 7), "Chapter 2 must render manager rules in the phone/rule UI.");
assert.ok(chapter3PhoneNodes.some((node) => /用户不存在/.test(JSON.stringify(node.phoneScreen))), "Chapter 3 must render Lin Feng account loss in phone UI.");
assert.ok(chapter3PhoneNodes.some((node) => /黑色头像|不要在四楼叫出完整姓名/.test(JSON.stringify(node.phoneScreen))), "Black-avatar warning must stay inside the phone UI.");

[
  "namePollutionStage",
  "strangerSmsKept",
  "keptDiary",
  "featherHolder",
  "featherState",
  "zhouTrustSignal",
  "guyuRemembersLinfeng",
  "songIdentityJudgment",
  "blackAvatarStage",
  "studentRulesFoodSubject",
  "managerRulesTrust",
  "calledFullNameOnFourth",
  "acceptedAwareMimic",
  "chapterThreeIrreversible",
].forEach((key) => assert.ok(Object.hasOwn(data.defaultStoryState || {}, key), `defaultStoryState must include ${key}.`));

const allChoiceStateKeys = new Set();
nodes
  .filter((node) => [chapter2Id, chapter3Id].includes(node.chapterId))
  .flatMap((node) => choicesFor(node))
  .forEach((choice) => {
    Object.keys(choice.storyState || {}).forEach((key) => allChoiceStateKeys.add(key));
    (choice.stateUpdates || []).forEach((update) => allChoiceStateKeys.add(update.key || update.path));
  });
[
  "namePollutionStage",
  "keptDiary",
  "featherHolder",
  "songIdentityJudgment",
  "blackAvatarStage",
  "studentRulesFoodSubject",
  "managerRulesTrust",
  "calledFullNameOnFourth",
  "acceptedAwareMimic",
  "chapterThreeIrreversible",
].forEach((key) => assert.ok(allChoiceStateKeys.has(key), `${key} must be mutated by a Chapter 2-3 choice.`));

nodes
  .filter((node) => ["nf02_", "nf03_"].some((prefix) => node.nodeId.startsWith(prefix)))
  .forEach((node) => {
    const text = visibleNodeText(node);
    assert.doesNotMatch(text, /\b(?:Lin Feng|Song Ming|Gu Yu|Zhou Chaoyang|roleId|nodeId|namePollutionStage|blackAvatarStage|C\d+|E[1-8])\b/i, `${node.nodeId} exposes internal or English text.`);
    if (node.contentType === "narration" || node.contentType === "phone-text" || node.contentType === "system") {
      assert.notEqual(node.voiceEnabled, true, `${node.nodeId} must remain silent.`);
    }
    if (node.contentType === "phone-text") {
      assert.ok(node.phoneScreen, `${node.nodeId} phone text must render inside a phone screen.`);
    }
    if (/黑色头像/.test(node.text || "")) {
      assert.ok(node.phoneScreen || node.contentType === "phone-text" || node.contentType === "narration", `${node.nodeId} must not put black-avatar messages in ordinary dialogue.`);
    }
  });

const effectTags = new Set(nodes.flatMap((node) => node.effectTags || []));
[
  "time-jump",
  "giant-moon",
  "third-floor-handprints",
  "stair-stretch",
  "fourth-floor-blur",
  "group-name-missing",
  "account-missing",
  "phone-glow-1107",
  "name-headache",
  "sound-drop",
  "doors-opening",
  "lights-blackout",
  "mimic-desync",
  "name-letters-fall",
  "feather-surge",
  "hunt-impact-drag",
  "space-loop",
  "identity-slip",
].forEach((tag) => assert.ok(effectTags.has(tag), `Missing effect tag ${tag}.`));

console.log("Dormitory name-floor Chapter 1-3 runtime check passed.");
console.log(`chapter2Nodes=${nodes.filter((node) => node.chapterId === chapter2Id).length}; chapter3Nodes=${nodes.filter((node) => node.chapterId === chapter3Id).length}; chapter2Decisions=${chapter2Decisions.length}; chapter3Decisions=${chapter3Decisions.length}`);
