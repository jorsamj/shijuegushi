import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const script = read("script.js");
const css = read("style.css");
const mobileCss = read("mobile-story.css");
const index = read("index.html");
const manifestSource = read("assets/external-audio-manifest.js");
const context = { window: {} };
vm.runInNewContext(manifestSource, context);
const bgm = context.window.SECOND_LIFE_EXTERNAL_AUDIO?.bgm || {};

expect(script.includes("is-choice-node"), "Choice nodes must expose a dedicated fullscreen layout state.");
expect(script.includes("is-reading-node"), "Reading nodes must expose a dedicated fullscreen layout state.");
expect(script.includes("lockNodeAction"), "Story controls must ignore rapid duplicate taps.");
expect(index.includes("mobile-story.css"), "The final mobile story cascade must load after the legacy stylesheet.");
expect(mobileCss.includes("overscroll-behavior: none"), "Mobile game viewport must not become a scrolling document.");
expect(mobileCss.includes(".mobile-story-root.is-choice-node .dialogue-panel"), "Choice panel needs a mobile-safe layout.");
expect(mobileCss.includes(".head-safe .vn-character-standee"), "Character head-safe framing must be explicitly preserved on mobile.");
expect(mobileCss.includes("env(safe-area-inset-bottom)"), "Dialogue panel must honor the mobile bottom safe area.");
expect(bgm.urban_suspense_air, "A restrained urban suspense bed must exist.");
expect(bgm.rain_night_loop?.path?.endsWith("in_dream.mp3"), "Rain-room BGM must not retain the rhythmic haunted-area bed.");
expect(bgm.horror_corridor?.path?.endsWith("in_dream.mp3"), "Corridor BGM must not retain the rhythmic haunted-area bed.");
expect(fs.existsSync(path.join(root, bgm.urban_suspense_air?.path || "")), "The restrained suspense music asset must exist.");

if (failures.length) {
  console.error("Mobile fullscreen check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Mobile fullscreen check passed.");
