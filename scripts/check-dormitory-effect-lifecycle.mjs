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
const runtime = fs.readFileSync(path.join(root, "script.js"), "utf8");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const allowedTypes = new Set([
  "lights-out", "phone-vibrate", "noise", "lighting-change", "hallway-shake", "door-impact",
  "black-screen", "signal-tear", "blood-trace", "blood-edge", "character-misalign",
  "double-character", "drag", "attack", "chase", "doppelganger-reveal", "bad-ending",
  "stairwell-flicker", "final-freeze",
]);
const allowedLevels = new Set(["light", "medium", "heavy"]);
const nodes = Object.values(data?.nodes || {});
let effectCount = 0;
const levelCounts = { light: 0, medium: 0, heavy: 0 };

for (const node of nodes) {
  if (node.effect && !Array.isArray(node.effects)) {
    failures.push(`${node.nodeId} still has a legacy effect without lifecycle-managed effects[].`);
  }
  if (node.effects === undefined) continue;
  assert(Array.isArray(node.effects), `${node.nodeId} effects must be an array.`);
  if (!Array.isArray(node.effects)) continue;
  let heavyCount = 0;
  for (const effect of node.effects) {
    effectCount += 1;
    assert(allowedTypes.has(effect?.type), `${node.nodeId} uses a non-whitelisted effect type: ${effect?.type || "missing"}.`);
    assert(allowedLevels.has(effect?.level), `${node.nodeId} effect ${effect?.type || "unknown"} needs level light, medium, or heavy.`);
    assert(Number.isFinite(effect?.durationMs) && effect.durationMs > 0, `${node.nodeId} effect ${effect?.type || "unknown"} needs a positive durationMs.`);
    assert(effect?.cleanup === "node-exit", `${node.nodeId} effect ${effect?.type || "unknown"} must clean up at node-exit.`);
    if (effect?.level === "heavy") heavyCount += 1;
    if (levelCounts[effect?.level] !== undefined) levelCounts[effect.level] += 1;
  }
  assert(heavyCount <= 1, `${node.nodeId} declares ${heavyCount} heavy effects; at most one is allowed.`);
}

assert(effectCount > 0, "Dormitory story must declare lifecycle-managed effects[].");
assert(runtime.includes("SceneEffectController"), "Shared runtime must expose SceneEffectController for effect ownership.");
assert(runtime.includes("clearStoryTransientVisuals"), "Shared runtime must expose clearStoryTransientVisuals for node/story exit cleanup.");
assert(/\b(?:effectCleanupToken|cleanupToken|transientEffectToken)\b/u.test(runtime), "Shared runtime must carry an effect cleanup token for stale effect cancellation.");

if (failures.length) {
  console.error("Dormitory effect lifecycle check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory effect lifecycle check passed.");
console.log(`effects=${effectCount}`);
console.log(`levels=${JSON.stringify(levelCounts)}`);
