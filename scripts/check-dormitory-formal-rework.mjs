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
const nodes = Object.values(data?.nodes || {});
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const choicesOf = (node) => node.choices?.length ? node.choices : node.question?.choices || [];
const visibleEnglishNames = /\b(?:Chen Lu|Shen Yan|Broadcast|Manager Wu|Xu Tang|Lin Sui|Zhao Qing|Zhou Wanning)\b/;

assert(data?.productionRework?.version === 2, "Dormitory production rework contract must be version 2.");
assert(data?.chapters?.length === 6, "Dormitory story must retain six chapters.");
assert(Object.keys(data?.endings || {}).length === 8, "Dormitory story must retain eight endings.");

const choiceCount = nodes.reduce((sum, node) => sum + choicesOf(node).length, 0);
assert(choiceCount >= 30 && choiceCount <= 40, `Dormitory story needs 30-40 effective choices; got ${choiceCount}.`);

for (const chapter of data?.chapters || []) {
  const chapterNodes = nodes.filter((node) => node.chapterId === chapter.chapterId);
  const causalChain = data?.chapterBeats?.[chapter.chapterId]?.causalChain;
  assert(chapterNodes.length >= 9, `${chapter.chapterId} needs at least nine formal beats after the rewrite.`);
  assert(Array.isArray(causalChain) && causalChain.length >= 4, `${chapter.chapterId} needs a four-step causal chain.`);
  assert(causalChain?.every((beat) => beat?.cause && beat?.action && beat?.consequence), `${chapter.chapterId} causal beats need cause, action and consequence.`);
}

const phoneNodes = nodes.filter((node) => node.phoneScreen);
assert(phoneNodes.length >= 16, `At least 16 story beats must use the structured phone surface; got ${phoneNodes.length}.`);
for (const node of phoneNodes) {
  const phone = node.phoneScreen;
  assert(/^\d{2}:\d{2}$/.test(phone.time || ""), `${node.nodeId} phone time must use HH:MM.`);
  assert(Number.isInteger(phone.battery) && phone.battery >= 0 && phone.battery <= 100, `${node.nodeId} phone battery must be 0-100.`);
  assert(typeof phone.signal === "string" && phone.signal, `${node.nodeId} phone signal is required.`);
  assert(!visibleEnglishNames.test(JSON.stringify(phone)), `${node.nodeId} phone surface contains a player-visible English name.`);
}

const castNodes = nodes.filter((node) => Array.isArray(node.visualCast) && node.visualCast.length);
assert(castNodes.length >= 28, `At least 28 beats need directed visualCast data; got ${castNodes.length}.`);
for (const node of castNodes) {
  for (const member of node.visualCast) {
    assert(member.characterId && member.variant, `${node.nodeId} visual cast members need characterId and variant.`);
    assert(member.framing && member.mobileFraming, `${node.nodeId}/${member.characterId} needs desktop and mobile framing.`);
    assert(Number.isFinite(member.focusX) && Number.isFinite(member.focusY), `${node.nodeId}/${member.characterId} needs a stable focal point.`);
  }
}

const effectCounts = { light: 0, medium: 0, heavy: 0 };
for (const node of nodes) {
  for (const effect of node.effects || []) {
    if (effectCounts[effect.level] !== undefined) effectCounts[effect.level] += 1;
    assert(effect.type && effect.durationMs > 0 && effect.cleanup === "node-exit", `${node.nodeId} effect cues need type, duration and node-exit cleanup.`);
  }
}
assert(effectCounts.light >= 4, `Dormitory story needs at least four light effects; got ${effectCounts.light}.`);
assert(effectCounts.medium >= 6, `Dormitory story needs at least six medium effects; got ${effectCounts.medium}.`);
assert(effectCounts.heavy >= 5, `Dormitory story needs at least five heavy effects; got ${effectCounts.heavy}.`);

for (const node of nodes) {
  const compactText = String(node.text || "").replace(/\s+/g, "");
  assert(!visibleEnglishNames.test(JSON.stringify(node)), `${node.nodeId} contains a player-visible English name.`);
  if (node.contentType === "narration" && compactText.length < 10) {
    failures.push(`${node.nodeId} is a low-value narration fragment: ${compactText}`);
  }
  if (node.contentType === "narration" || node.contentType === "system") {
    assert(node.voiceEnabled === false && !node.spokenText, `${node.nodeId} silent content must not have a runtime voice.`);
  }
}

for (const [endingId, ending] of Object.entries(data?.endings || {})) {
  assert(ending.scene && ending.imageKey, `${endingId} needs an independent scene and imageKey.`);
  assert(ending.phoneFinalState, `${endingId} needs a phone final state.`);
  assert(Array.isArray(ending.foreshadowingIds) && ending.foreshadowingIds.length >= 2, `${endingId} needs at least two foreshadowing references.`);
  assert(ending.finalLine && ending.text && ending.report?.pathSummary, `${endingId} needs a complete ending scene and review.`);
}

if (failures.length) {
  console.error("Dormitory formal rework check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory formal rework check passed.");
console.log(`nodes=${nodes.length}`);
console.log(`choices=${choiceCount}`);
console.log(`phoneNodes=${phoneNodes.length}`);
console.log(`directedCastNodes=${castNodes.length}`);
console.log(`effects=${JSON.stringify(effectCounts)}`);
