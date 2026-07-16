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
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const compact = (value) => String(value || "").replace(/\s+/g, "");
const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const replacementCharacter = /\uFFFD/u;
const visibleEnglishCharacterName = /\b(?:Chen Lu|Shen Yan|Manager Wu|Xu Tang|Lin Sui|Zhao Qing|Zhou Wanning|Chen Yan|Zhou Yu)\b/i;

function collectStrings(value, label, result = []) {
  if (typeof value === "string") {
    result.push({ label, value });
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${label}[${index}]`, result));
    return result;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => collectStrings(item, `${label}.${key}`, result));
  }
  return result;
}

const visibleStrings = collectStrings({
  chapters: data?.chapters,
  rules: data?.rules,
  clues: data?.clues,
  nodes: data?.nodes,
  endings: data?.endings,
}, "dormitory");

assert(data, "Dormitory story data could not be loaded.");
for (const { label, value } of visibleStrings) {
  assert(!value.includes("???"), `${label} contains the forbidden ??? placeholder.`);
  assert(!replacementCharacter.test(value), `${label} contains U+FFFD replacement text.`);
  assert(!controlCharacters.test(value), `${label} contains a disallowed control character.`);
  assert(!visibleEnglishCharacterName.test(value), `${label} contains a visible English character name.`);
}

const nodes = Object.values(data?.nodes || {});
const shortNarrations = nodes.filter((node) => {
  const isNarration = node.contentType === "narration" || node.speaker === "旁白";
  return isNarration && compact(node.text).length > 0 && compact(node.text).length < 12;
});
assert(shortNarrations.length === 0, `Short narration budget exceeded: ${shortNarrations.map((node) => node.nodeId).join(", ") || "none"}.`);

for (const node of nodes) {
  const isNarration = node.contentType === "narration" || node.speaker === "旁白";
  if (!isNarration) continue;
  assert(node.voiceEnabled === false, `${node.nodeId} narration must be silent with voiceEnabled=false.`);
  assert(!node.spokenText && !node.voiceAudio && !node.narrationAudio, `${node.nodeId} narration must not carry spoken audio text or audio.`);
}

if (failures.length) {
  console.error("Dormitory copy integrity check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory copy integrity check passed.");
console.log(`visibleStrings=${visibleStrings.length}`);
console.log(`shortNarrations=${shortNarrations.length}`);
