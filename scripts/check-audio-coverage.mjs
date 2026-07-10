import fs from "node:fs";
import vm from "node:vm";
const load = (file, key) => { const c = { window: {} }; vm.runInNewContext(fs.readFileSync(file, "utf8"), c); return c.window[key]; };
const data = load("story-data.js", "MIST_DATA");
const visuals = load("assets/visual-assets.js", "SECOND_LIFE_VISUALS");
const manifest = load("assets/external-audio-manifest.js", "SECOND_LIFE_EXTERNAL_AUDIO");
const failures = [];
const cue = (item) => typeof item === "string" ? item : item?.key;
for (const category of ["bgm", "ambience", "sfx", "stingers"]) {
  const keys = new Set(Object.keys(manifest[category] || {}));
  const used = [];
  for (const node of Object.values(data.nodes)) {
    if (category === "bgm" && node.bgm) used.push([node.nodeId, node.bgm]);
    if (category === "ambience" && node.ambience) used.push([node.nodeId, node.ambience]);
    if (category === "sfx") { (node.sfxOnEnter || []).forEach((item) => used.push([node.nodeId, cue(item)])); (node.sfxOnChoice || []).forEach((item) => used.push([node.nodeId, cue(item)])); }
    if (category === "stingers" && node.voiceStinger) used.push([node.nodeId, node.voiceStinger]);
  }
  for (const scene of Object.values(visuals.audio?.scenes || {})) if (scene[category === "stingers" ? "voice" : category]) used.push(["visual", scene[category === "stingers" ? "voice" : category]]);
  for (const [nodeId, key] of used) if (key && !keys.has(key)) failures.push(`${category}.${key} used by ${nodeId} has no approved asset`);
}
if (failures.length) { console.error("Audio coverage check failed:"); failures.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log("Audio coverage check passed.");
