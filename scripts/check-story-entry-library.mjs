import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

function loadData(file, property) {
  const context = { window: {} };
  vm.runInNewContext(read(file), context, { filename: file });
  return context.window[property];
}

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return "";
}

const rain = loadData("story-data.js", "MIST_DATA");
const dormitory = loadData("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA");
const rainScript = rain?.scripts?.find((item) => item.status === "open");
const dormitoryScript = dormitory?.script;
const engine = read("script.js");
const entry = functionBody(engine, "beginStorySession");
const detail = functionBody(engine, "showSeries");

for (const [data, script] of [[rain, rainScript], [dormitory, dormitoryScript]]) {
  assert(script?.scriptId, "Every released story must declare its script id.");
  assert(script?.startNodeId && data?.nodes?.[script.startNodeId], `${script?.scriptId || "unknown"} must enter through a real start node.`);
}

assert(rainScript?.scriptId !== dormitoryScript?.scriptId, "Released stories must retain independent script ids.");
assert(engine.includes("function getStoryStorageKeys"), "Per-story storage key resolver is missing.");
assert(engine.includes("const prefix = `mist.story.${scriptId}`;") && engine.includes("progress: `${prefix}.currentProgress`"), "Dormitory progress must remain namespaced.");
assert(engine.includes("function isPlaceholderDialogueAsset"), "Voice guard must be defined before a story launches.");
assert(engine.includes("Audio cue skipped; story remains playable."), "Audio preparation must never prevent a story from opening.");
assert(entry.includes("mode === \"continue\" && loadProgress(scriptId)"), "Continue must load only matching progress.");
assert(entry.includes("startNewGame(scriptId)"), "Missing or unusable progress must recover by starting the selected story.");
assert(entry.includes("try {") && entry.includes("showHall()"), "Story-entry failures must return the player to the archive with feedback.");
assert(entry.includes("stopAmbience(\"story-entry\")"), "Story entry must stop residual ambience before gameplay begins.");
assert(detail.includes("book-detail"), "Story detail must open as a book page.");
assert(detail.includes("data-restart-confirm"), "Restart confirmation must be rendered inside the book page.");
assert(!detail.includes("openConfirm("), "Story detail must not use a generic confirmation modal.");
assert(detail.includes("stopAmbience(\"browse-story\")"), "Opening a book must not leave story ambience playing.");
assert(!detail.includes("startAmbience(") && !detail.includes("prepareAudioCue(") && !detail.includes("speakNode("), "Opening a book must not start story ambience, cues, or voice playback.");
assert(engine.includes("archive-bookshelf") && engine.includes("story-book"), "Archive must render stories as equal-weight books.");

if (failures.length) {
  console.error("Story entry and bookshelf check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Story entry and bookshelf check passed.");
console.log(`verified=${rainScript.scriptId}, ${dormitoryScript.scriptId}; entry recovery and book-page restart flow are present`);
