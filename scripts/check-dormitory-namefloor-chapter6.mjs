import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const window = {
  MIST_DATA: {
    script: { scriptId: "script_rain_call", startNodeId: "rain_start" },
    scripts: [{ scriptId: "script_rain_call", startNodeId: "rain_start" }],
    series: [], chapters: [], nodes: { rain_start: { nodeId: "rain_start" } }, clues: {}, endings: {}, defaultFlags: {}, defaultStoryState: {},
  },
};
const context = vm.createContext({ window, console, structuredClone });
vm.runInContext(read("assets/stories/dormitory-namefloor/story-data.js"), context);
vm.runInContext(read("assets/stories/dormitory-namefloor/story-chapters-2-7.js"), context);
const base = window.MIST_DORMITORY_NAMEFLOOR_DATA;
const expansion = window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7;
const chapterMap = new Map(base.chapters.map((chapter) => [chapter.chapterId, chapter]));
expansion.chapters.forEach((chapter) => chapterMap.set(chapter.chapterId, chapter));
const data = { ...base, ...expansion, chapters: [...chapterMap.values()], nodes: { ...base.nodes, ...expansion.nodes } };
const chapter6 = "namefloor_chapter_06";
const chapter7 = "namefloor_chapter_07";
const c6Nodes = Object.values(data.nodes).filter((node) => node.chapterId === chapter6);
const choices = c6Nodes.flatMap((node) => node.choices || []);

assert.equal(data.nodes.nf05_050?.nextNodeId, "nf06_001", "Chapter 5 must continue into the principal's office.");
assert.equal(data.chapters.find((chapter) => chapter.chapterId === chapter6)?.status, "runtime", "Chapter 6 must be runtime.");
assert.ok(c6Nodes.length >= 10, "Chapter 6 must expose the complete principal's office node chain.");
assert.ok(c6Nodes.filter((node) => node.timedChoice).length >= 2, "Chapter 6 must include two timed choices.");
assert.ok(choices.length >= 8, "Chapter 6 must offer at least eight effective choices.");
assert.equal(data.nodes.nf06_050?.nextNodeId, "nf07_001", "Chapter 6 must continue into the identity confrontation.");
assert.ok(Object.values(data.nodes).some((node) => node.chapterId === chapter7), "Chapter 7 must be exported with the completed Chapter 7 runtime.");
assert.ok(choices.some((choice) => choice.setFlags?.includes("lin_self_removed_from_roster")), "The player must be able to delete Lin Feng from the registry.");
assert.ok(choices.some((choice) => choice.setFlags?.includes("guyu_voluntary_substitution")), "Gu Yu's voluntary sacrifice must be playable.");
assert.ok(choices.some((choice) => choice.setFlags?.includes("roster_quota_broken")), "Destroying the registry must be playable.");
assert.ok(choices.some((choice) => choice.setFlags?.includes("song_mimic_self_aware")), "Keeping a self-aware mimic must be playable.");

console.log(`Dormitory Chapter 6 check passed. nodes=${c6Nodes.length}; choices=${choices.length}`);
