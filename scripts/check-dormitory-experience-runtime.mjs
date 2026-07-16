import fs from "node:fs";

const script = fs.readFileSync("script.js", "utf8");
const css = `${fs.readFileSync("style.css", "utf8")}\n${fs.readFileSync("mobile-story.css", "utf8")}`;
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

for (const token of [
  "renderVisualCast",
  "renderPhoneScreen",
  "SceneEffectController",
  "renderInlineStoryFeedback",
  "clearStoryTransientVisuals",
  "getReducedMotionPreference",
]) {
  assert(script.includes(token), `Shared runtime is missing ${token}.`);
}

assert(script.includes('scriptId === "script_dormitory_rollcall"') && script.includes("feedbackMode"), "Dormitory feedback must branch to a non-blocking mode.");
assert(script.includes("visibilitychange") && script.includes("clearStoryTransientVisuals"), "Backgrounding must clear transient visual effects.");
assert(script.includes("preloadUpcomingVisuals") && script.includes("visualCast") && script.includes("phoneScreen"), "Preloading must include cast and phone media.");
assert(script.includes("reducedMotion"), "Reduced-motion preference must be persisted in reading settings.");

for (const selector of [
  ".vn-visual-cast",
  ".dorm-phone-layer",
  ".story-inline-feedback",
  ".scene-effect-layer",
  ".effect-level-heavy",
  ".is-reduced-motion",
]) {
  assert(css.includes(selector), `Missing required runtime selector: ${selector}.`);
}

assert(css.includes("safe-area-inset-bottom") && css.includes("--character-face-y"), "Mobile framing must use safe areas and a face focal point.");
assert(css.includes("prefers-reduced-motion: reduce"), "System reduced-motion fallback must remain available.");

if (failures.length) {
  console.error("Dormitory experience runtime check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory experience runtime check passed.");
