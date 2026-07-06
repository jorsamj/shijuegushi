import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const exists = (file) => fs.existsSync(new URL(file, root));
const failures = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return "";
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, i);
  }
  return "";
}

const DATA = loadData();
const scriptText = read("script.js");
const styleText = read("style.css");
const indexText = read("index.html");
const showSeriesBody = extractFunctionBody(scriptText, "showSeries");
const keyNodes = [
  "ch01_005",
  "ch01_007",
  "ch01_008",
  "ch02_003",
  "ch03_011",
  "ch04_020",
  "ch05_011",
  "ch05_016",
  "ch06_020",
];

assert(indexText.includes("<title>第二人生</title>"), "index.html title must be 第二人生");
assert(indexText.includes("aria-label=\"关闭弹窗\""), "modal close button must have readable Chinese aria-label");

assert(showSeriesBody, "showSeries function is missing");
for (const forbidden of [
  "chapter-preview",
  "chapter-cover",
  "renderChapterCover",
  "story-main-visual",
  "series-hero-cover",
  "splash-hero-art",
]) {
  assert(!showSeriesBody.includes(forbidden), `story detail page must not render ${forbidden}`);
}
assert(showSeriesBody.includes("LIFE FILE"), "story detail page must show LIFE FILE");
assert(showSeriesBody.includes("start-script"), "story detail page must expose a start/continue action");
assert(showSeriesBody.includes("story-file-sealed"), "story detail page should show future stories as sealed notes only");

for (const nodeId of keyNodes) {
  const node = DATA.nodes[nodeId];
  assert(node, `missing key visual node ${nodeId}`);
  if (!node) continue;
  if (nodeId !== "ch06_020") {
    assert(node.visualCharacter || node.speaker, `${nodeId} must resolve a visible character or speaker`);
    assert(node.characterHeadSafe === true, `${nodeId} must protect character head framing`);
    assert(["large", "impact", "closeup", "fullscreen"].includes(node.characterScale), `${nodeId} should use a strong character scale`);
    assert(["center", "left", "right", undefined].includes(node.characterPosition), `${nodeId} has invalid characterPosition`);
    assert(node.characterFraming, `${nodeId} must define characterFraming`);
    assert(node.characterFocus, `${nodeId} must define characterFocus`);
  }
}

for (const node of Object.values(DATA.nodes || {})) {
  if (node.type === "choice" || node.type === "deduction") {
    assert(Array.isArray(node.choices) && node.choices.length >= 2, `${node.nodeId} choice/deduction node must have at least two choices`);
    for (const choice of node.choices || []) {
      assert(choice.text && choice.text.length <= 48, `${node.nodeId}.${choice.choiceId} choice text is too long for mobile: ${choice.text}`);
      assert(choice.nextNodeId || node.type === "deduction", `${node.nodeId}.${choice.choiceId} must have nextNodeId`);
    }
  }
}

const voiceAudioNodes = Object.values(DATA.nodes || {}).filter((node) => node.voiceAudio || node.narrationAudio);
assert(voiceAudioNodes.length === 0, `ordinary story nodes must not trigger voiceAudio/narrationAudio; got ${voiceAudioNodes.length}`);

const focusedMatch = scriptText.match(/const FOCUSED_CLUE_REVEALS = new Set\(\[([\s\S]*?)\]\);/);
const focusedCount = focusedMatch ? [...focusedMatch[1].matchAll(/"([^"]+)"/g)].length : 0;
assert(focusedCount <= 3, `focused clue reveal modals should stay sparse, got ${focusedCount}`);
assert(scriptText.includes("MILESTONES") && (scriptText.match(/milestoneId:/g) || []).length <= 4, "milestones must stay at most 4");

assert(styleText.includes("@media (max-width: 700px)"), "mobile breakpoint is missing");
assert(styleText.includes(".position-center .vn-character-standee"), "center character positioning is missing");
assert(styleText.includes(".head-safe .vn-character-standee"), "head-safe character CSS is missing");
assert(styleText.includes(".story-file-sealed"), "sealed story detail CSS is missing");
assert(exists("docs/UI_PLAYTEST_CHECKLIST.md"), "UI playtest checklist is missing");
assert(exists("docs/VISUAL_QA_REPORT.md"), "visual QA report is missing");

warn(!styleText.includes(".story-main-visual"), "legacy story-main-visual CSS is still present but should not be used by showSeries");

if (failures.length) {
  console.error("UI flow check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("UI flow check warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("UI flow check passed.");
console.log(`checked key visual nodes=${keyNodes.length}, choice nodes=${Object.values(DATA.nodes).filter((node) => node.type === "choice" || node.type === "deduction").length}`);
