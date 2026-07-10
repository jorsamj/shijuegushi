import fs from "node:fs";
import vm from "node:vm";

const context = { window: {} };
vm.runInNewContext(fs.readFileSync("story-data.js", "utf8"), context, { filename: "story-data.js" });
const nodes = context.window.MIST_DATA.nodes || {};
const failures = [];
const cueKey = (cue) => typeof cue === "string" ? cue : cue?.key || "";
const forbidden = new Set(["room_silence_drop", "delete_warning", "choice_confirm_soft", "evidence_reveal", "archive_stamp", "corridor_light_flicker", "chat_typing_short"]);
const budgets = { 1: 6, 2: 5, 3: 4, 4: 4, 5: 6, 6: 4 };

for (let chapter = 1; chapter <= 6; chapter += 1) {
  const prefix = `ch0${chapter}_`;
  const chapterNodes = Object.entries(nodes).filter(([id]) => id.startsWith(prefix)).map(([, node]) => node);
  let changes = 0;
  let sfxCount = 0;
  let previousScene = "";
  for (const node of chapterNodes) {
    if (!node.visualBeat || typeof node.sceneHold !== "boolean" || !node.transitionStyle || !node.focusTarget) failures.push(`${node.nodeId} needs continuity direction fields`);
    if (previousScene && node.scene !== previousScene) changes += 1;
    previousScene = node.scene;
    const cues = node.sfxOnEnter || [];
    sfxCount += cues.length;
    for (const cue of cues) if (forbidden.has(cueKey(cue))) failures.push(`${node.nodeId} uses an excluded clutter cue: ${cueKey(cue)}`);
    if (node.voiceStinger && node.nodeId !== "ch01_004") failures.push(`${node.nodeId} must not use a non-verbal stinger`);
  }
  if (changes > budgets[chapter]) failures.push(`chapter ${chapter} has ${changes} scene changes, budget is ${budgets[chapter]}`);
  if (sfxCount > 8) failures.push(`chapter ${chapter} has ${sfxCount} entry sounds, budget is 8`);
}

if (failures.length) {
  console.error("Scene continuity check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Scene continuity check passed.");
