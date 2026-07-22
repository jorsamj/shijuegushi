import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const stylePath = path.join(root, "style.css");
const dataPath = path.join(root, "assets", "stories", "dormitory-namefloor", "story-data.js");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function loadBrowserGlobal(filePath, globalName) {
  const window = {};
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), { window, console }, { filename: filePath });
  return window[globalName];
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hexToHsl(hex) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}

function collectSelectorBodies(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, "g");
  return [...css.matchAll(pattern)].map((match) => match[1]).join("\n");
}

const styles = fs.readFileSync(stylePath, "utf8");
const data = loadBrowserGlobal(dataPath, "MIST_DORMITORY_NAMEFLOOR_DATA");
const nodes = data?.nodes || {};
const chapterOneNodes = Object.values(nodes).filter((node) => node.chapterId === "namefloor_chapter_01");

const phoneLayerStyles = collectSelectorBodies(styles, ".is-namefloor-slice .dorm-phone-layer")
  + collectSelectorBodies(styles, ".is-namefloor-slice.is-phone-node .dorm-phone-layer");
const phoneScreenStyles = collectSelectorBodies(styles, ".is-namefloor-slice .dorm-phone-screen")
  + collectSelectorBodies(styles, ".is-namefloor-slice.is-phone-node .dorm-phone-screen");

assert(/inset:\s*max\(4px,\s*env\(safe-area-inset-top\)\)/.test(phoneLayerStyles), "phone layer must use near-full safe-area top inset on phone nodes");
assert(!/right:\s*clamp/.test(phoneLayerStyles), "name-floor phone layer must not inherit the right-side mini-card layout");
assert(/width:\s*min\(560px,\s*calc\(100vw - 32px\)\)/.test(phoneScreenStyles), "desktop phone screen must be the primary centered content");
assert(/height:\s*min\(100%,\s*calc\(100dvh - 8px\)\)/.test(phoneScreenStyles), "mobile phone screen must fully use portrait height");
assert(styles.includes(".is-namefloor-slice.is-phone-node .dialogue-panel") && /display:\s*none/.test(collectSelectorBodies(styles, ".is-namefloor-slice.is-phone-node .dialogue-panel")), "dialogue panel must stay hidden while phone UI is the active node");

const narratorSpeakers = new Set(["旁白", "narrator", "Narrator"]);
const realSpeakers = new Set(["林峰", "周朝阳", "谷雨", "宋明"]);
for (const node of chapterOneNodes) {
  const contentType = node.contentType;
  if (contentType === "dialogue") {
    assert(realSpeakers.has(node.speaker), `${node.nodeId} dialogue speaker must be a real chapter-one speaker, not ${node.speaker}`);
    assert(normalize(node.text) === normalize(node.spokenText), `${node.nodeId} displayed dialogue must exactly match spokenText`);
    assert(node.voiceEnabled === true, `${node.nodeId} real dialogue must be voiced`);
  }
  if (narratorSpeakers.has(node.speaker)) {
    assert(!node.spokenText, `${node.nodeId} narration must not carry spokenText`);
    assert(node.voiceEnabled === false, `${node.nodeId} narration must stay silent`);
  }
  if (contentType === "phone-text" || contentType === "phone-ui" || contentType === "phone-message") {
    assert(Boolean(node.phoneScreen), `${node.nodeId} phone text must remain inside the phone UI`);
    assert(node.voiceEnabled === false, `${node.nodeId} phone text must stay silent`);
  }
  if (contentType === "door-voice") {
    assert(/^门外/.test(String(node.speaker || "")), `${node.nodeId} door voice must keep an outside/unknown speaker label`);
    assert(!node.visualCharacter && !node.characterId && !node.actorId, `${node.nodeId} early door voice must not carry identity metadata`);
  }
}

const shelfSurfaceStyles = [
  collectSelectorBodies(styles, ".book-detail"),
  collectSelectorBodies(styles, ".book-page"),
].join("\n");
const warmBrightHexes = [...shelfSurfaceStyles.matchAll(/#[0-9a-f]{6}\b/gi)]
  .map((match) => match[0].toLowerCase())
  .filter((hex) => {
    const hsl = hexToHsl(hex);
    return hsl.hue >= 30 && hsl.hue <= 70 && hsl.saturation >= 10 && hsl.lightness >= 60;
  });
assert(warmBrightHexes.length === 0, `opened book surface still uses bright warm paper colors: ${[...new Set(warmBrightHexes)].join(", ")}`);
assert(/book-cover-open/.test(styles) && /book-page-reveal/.test(styles), "book selection must preserve cover-open and page-reveal transitions");

if (failures.length) {
  console.error("Current-round dormitory regression check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Current-round dormitory regression check passed.");
console.log(`chapterOneNodes=${chapterOneNodes.length}; checked phone layout, dialogue ownership, and bookshelf theme`);
