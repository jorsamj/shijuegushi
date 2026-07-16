import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
function loadStory(relativePath, exportName) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context, { filename: relativePath });
  return context.window[exportName];
}

const firstStory = loadStory("story-data.js", "MIST_DATA");
const dormitoryStory = loadStory("assets/stories/dormitory-rollcall/story-data.js", "MIST_DORMITORY_DATA");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const firstStoryNodeIds = Object.keys(firstStory?.nodes || {});
const dormitoryNodeIds = Object.keys(dormitoryStory?.nodes || {});
const legacyFields = [
  "speaker", "visualCharacter", "visualMood", "characterVariant", "characterScale",
  "characterPosition", "characterFraming", "characterHeadSafe", "characterFocus",
];

const rainSeries = (firstStory?.series || []).find((series) => series.seriesId === "series_rain_call");
const rainScript = (firstStory?.scripts || []).find((script) => script.scriptId === "script_rain_call");
assert(rainSeries?.title === "雨夜来电", "First story must retain the 雨夜来电 series identity.");
assert(rainSeries?.scriptIds?.includes("script_rain_call"), "First story series must still point to script_rain_call.");
assert(rainScript?.title === "雨夜来电", "First story must retain the 雨夜来电 script entry.");
assert(rainScript?.startNodeId === "ch01_001", "First story startNodeId must remain ch01_001.");
assert(firstStory?.nodes?.ch01_001, "First story opening node ch01_001 is missing.");
assert(firstStory?.nodes?.ch01_003 && /手机突然震动/u.test(firstStory.nodes.ch01_003.text || "") && /许知夏/u.test(firstStory.nodes.ch01_003.text || ""), "First story rain-call node ch01_003 regressed.");
assert(firstStory?.nodes?.ch01_005 && /别开门/u.test(firstStory.nodes.ch01_005.text || ""), "First story rain-call warning node ch01_005 regressed.");

const endingIds = Object.keys(firstStory?.endings || {}).sort();
assert(JSON.stringify(endingIds) === JSON.stringify(["ending_a", "ending_b", "ending_c", "ending_d"]), `First story must retain four endings; got ${endingIds.join(", ")}.`);
for (const [endingId, ending] of Object.entries(firstStory?.endings || {})) {
  assert(ending.title && ending.text, `${endingId} must retain its title and ending text.`);
}

for (const node of Object.values(firstStory?.nodes || {})) {
  for (const field of legacyFields) assert(Object.hasOwn(node, field), `First story node ${node.nodeId} lost legacy field ${field}.`);
}
assert(firstStoryNodeIds.some((nodeId) => nodeId.startsWith("ch01_")), "First story legacy chapter node namespace is missing.");
assert(dormitoryNodeIds.length > 0 && dormitoryNodeIds.every((nodeId) => nodeId.startsWith("dorm_")), "Dormitory nodes must remain in the dorm_ namespace.");
assert(!firstStoryNodeIds.some((nodeId) => nodeId.startsWith("dorm_")), "Dormitory node ids leaked into the first story namespace.");
assert(!JSON.stringify(firstStory).includes("script_dormitory_rollcall"), "Dormitory script identity leaked into first story data.");
assert(!JSON.stringify(dormitoryStory).includes("script_rain_call"), "First story script identity leaked into dormitory data.");
assert(!JSON.stringify(dormitoryStory).includes("series_rain_call"), "First story series identity leaked into dormitory data.");
assert(dormitoryStory?.script?.startNodeId === "dorm_01_001", "Dormitory startNodeId must remain isolated from the first story.");

if (failures.length) {
  console.error("First story regression check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("First story regression check passed.");
console.log(`firstStoryNodes=${firstStoryNodeIds.length}`);
console.log(`firstStoryEndings=${endingIds.length}`);
console.log(`dormitoryNodes=${dormitoryNodeIds.length}`);
