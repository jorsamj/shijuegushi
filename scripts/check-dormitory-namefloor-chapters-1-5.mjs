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
    schemaVersion: "chapter-1-5-check",
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
  assert.ok(expansion, "Chapter 2-5 expansion must load.");
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
  return choices.find((choice) => choice.choiceId?.endsWith("_d")) || choices[0];
}

function walkDefaultRoute(data, startNodeId) {
  const route = [];
  const seen = new Set();
  let nodeId = startNodeId;
  for (let step = 0; step < 420; step += 1) {
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
  return [
    node.speaker,
    node.text,
    node.chapterEnding?.title,
    node.chapterEnding?.subtitle,
    ...(node.choices || []).map((choice) => choice.text),
  ].filter(Boolean).join(" ");
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

function collectChoiceStateKeys(nodes, chapterId) {
  const keys = new Set();
  nodes
    .filter((node) => node.chapterId === chapterId)
    .flatMap((node) => choicesFor(node))
    .forEach((choice) => {
      Object.keys(choice.storyState || {}).forEach((key) => keys.add(key));
      (choice.stateUpdates || []).forEach((update) => keys.add(update.key || update.path));
    });
  return keys;
}

function containsPhoneText(nodes, chapterId, pattern) {
  return nodes
    .filter((node) => node.chapterId === chapterId && node.phoneScreen)
    .some((node) => pattern.test(JSON.stringify(node.phoneScreen)));
}

const data = runStoryData();
const nodes = Object.values(data.nodes || {});
const chapterIds = {
  chapter1: "namefloor_chapter_01",
  chapter2: "namefloor_chapter_02",
  chapter3: "namefloor_chapter_03",
  chapter4: "namefloor_chapter_04",
  chapter5: "namefloor_chapter_05",
  chapter6: "namefloor_chapter_06",
  chapter7: "namefloor_chapter_07",
};

assert.equal(data.nodes.nf01_040?.nextNodeId, "nf02_001", "Chapter 1 ending must continue into Chapter 2.");
const defaultRoute = walkDefaultRoute(data, "nf01_040");
[
  chapterIds.chapter1,
  chapterIds.chapter2,
  chapterIds.chapter3,
  chapterIds.chapter4,
  chapterIds.chapter5,
].forEach((chapterId) => assert.ok(defaultRoute.some((node) => node.chapterId === chapterId), `${chapterId} must be reachable on the default route.`));
assert.equal(defaultRoute.at(-1)?.chapterId, chapterIds.chapter5, "Current formal runtime must stop at the Chapter 5 hook.");
assert.equal(defaultRoute.at(-1)?.type, "chapter-ending", "Chapter 5 hook must be a chapter-ending node.");
assert.ok(!defaultRoute.some((node) => [chapterIds.chapter6, chapterIds.chapter7].includes(node.chapterId)), "Chapters 6-7 must not be reachable this round.");

[
  [chapterIds.chapter4, 7, 2],
  [chapterIds.chapter5, 7, 2],
].forEach(([chapterId, minimumDecisions, minimumTimed]) => {
  const chapter = data.chapters.find((item) => item.chapterId === chapterId);
  assert.equal(chapter?.status, "runtime", `${chapterId} must be marked runtime.`);
  const decisions = countDecisionNodes(nodes, chapterId);
  assert.ok(decisions.length >= minimumDecisions, `${chapterId} needs at least ${minimumDecisions} effective choice nodes; found ${decisions.length}.`);
  assert.ok(decisions.filter((node) => node.timedChoice).length >= minimumTimed, `${chapterId} needs at least ${minimumTimed} timed choices.`);
  assertPlayableChapterChoices(nodes, chapterId, data);
});

[chapterIds.chapter6, chapterIds.chapter7].forEach((chapterId) => {
  const chapter = data.chapters.find((item) => item.chapterId === chapterId);
  assert.ok(!chapter || chapter.status !== "runtime", `${chapterId} must remain blueprint-only or absent.`);
  assert.equal(nodes.some((node) => node.chapterId === chapterId), false, `${chapterId} must not export runtime nodes this round.`);
});

const chapter4PhoneNodes = nodes.filter((node) => node.chapterId === chapterIds.chapter4 && node.phoneScreen);
const chapter5PhoneNodes = nodes.filter((node) => node.chapterId === chapterIds.chapter5 && node.phoneScreen);
assert.ok(chapter4PhoneNodes.length >= 4, `Chapter 4 needs segmented document/phone carriers; found ${chapter4PhoneNodes.length}.`);
assert.ok(chapter5PhoneNodes.length >= 5, `Chapter 5 needs at least 5 phone carriers; found ${chapter5PhoneNodes.length}.`);
assert.ok(containsPhoneText(nodes, chapterIds.chapter4, /三年|合同|羽毛|校长室/), "Chapter 4 must render contracts, feather debt, and route clues in document/phone UI.");
assert.ok(containsPhoneText(nodes, chapterIds.chapter5, /用户不存在|黑色头像|四十二|□□□□|合照/), "Chapter 5 must render account, group, save, and photo anomalies in phone UI.");
assert.ok(containsPhoneText(nodes, chapterIds.chapter5, /原始短信已保存|原始短信已删除/), "Chapter 5 must show saved/deleted first-SMS differences through the phone UI.");

[
  "managerTrueName",
  "managerNameStability",
  "managerSaved",
  "managerTrustSignal",
  "managerSuccessorIntent",
  "principalOfficeRoute",
  "promisedManagerSuccession",
  "featherPollutionSource",
  "linfengPhotoState",
  "nameAnchorCompleted",
  "teamAcceptsLinfeng",
  "guyuMemoryDegree",
  "blackAvatarStage",
  "rosterState",
].forEach((key) => assert.ok(Object.hasOwn(data.defaultStoryState || {}, key), `defaultStoryState must include ${key}.`));

const ch4Keys = collectChoiceStateKeys(nodes, chapterIds.chapter4);
[
  "managerTrueName",
  "managerNameStability",
  "managerSaved",
  "managerTrustSignal",
  "managerSuccessorIntent",
  "principalOfficeRoute",
  "promisedManagerSuccession",
  "featherHolder",
  "featherState",
  "featherPollutionSource",
  "namePollutionStage",
  "rosterState",
].forEach((key) => assert.ok(ch4Keys.has(key), `Chapter 4 choices must mutate ${key}.`));

const ch5Keys = collectChoiceStateKeys(nodes, chapterIds.chapter5);
[
  "namePollutionStage",
  "blackAvatarStage",
  "guyuMemoryDegree",
  "zhouTrustSignal",
  "songIdentityJudgment",
  "linfengPhotoState",
  "rosterState",
  "nameAnchorCompleted",
  "teamAcceptsLinfeng",
  "principalOfficeRoute",
].forEach((key) => assert.ok(ch5Keys.has(key), `Chapter 5 choices must mutate ${key}.`));

const effectTags = new Set(nodes.flatMap((node) => node.effectTags || []));
[
  "year-overlap-duty-room",
  "contract-date-shift",
  "manager-photo-fade",
  "green-vest-red-shift",
  "feather-blacken-shed-split",
  "name-record-fade",
  "three-year-flashback",
  "wu-voice-image-desync",
  "contact-name-drop",
  "group-member-replaced",
  "photo-blur-misaligned",
  "black-avatar-linfeng-language",
  "speaker-name-controlled-loss",
  "written-name-erased",
  "phone-record-attribution-shift",
  "identity-overlap",
  "fourth-floor-reality-cover",
  "name-anchor-recovery-backlash",
].forEach((tag) => assert.ok(effectTags.has(tag), `Missing effect tag ${tag}.`));

nodes
  .filter((node) => [chapterIds.chapter1, chapterIds.chapter2, chapterIds.chapter3, chapterIds.chapter4, chapterIds.chapter5].includes(node.chapterId))
  .forEach((node) => {
    const text = visibleNodeText(node);
    assert.doesNotMatch(text, /\b(?:Lin Feng|Song Ming|Gu Yu|Zhou Chaoyang|roleId|nodeId|namePollutionStage|blackAvatarStage|managerNameStability|C\d+|E[1-8])\b/i, `${node.nodeId} exposes internal or English text.`);
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

assert.equal(Object.keys(data.endings || {}).length, 0, "Current phase must not export final endings.");
assert.equal(Object.keys(data.routePlans || {}).length, 0, "Current phase must not export final route plans.");

console.log("Dormitory name-floor Chapter 1-5 runtime check passed.");
console.log(`chapter4Nodes=${nodes.filter((node) => node.chapterId === chapterIds.chapter4).length}; chapter5Nodes=${nodes.filter((node) => node.chapterId === chapterIds.chapter5).length}; chapter4Decisions=${countDecisionNodes(nodes, chapterIds.chapter4).length}; chapter5Decisions=${countDecisionNodes(nodes, chapterIds.chapter5).length}`);
