import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const chapters = fs.readFileSync(path.join(root, "assets/stories/dormitory-namefloor/story-chapters-2-7.js"), "utf8");

assert.match(script, /dormitoryAcceptance/, "Acceptance mode must require an explicit query parameter.");
assert.match(script, /127\.0\.0\.1[\s\S]*localhost|localhost[\s\S]*127\.0\.0\.1/, "Acceptance mode must be restricted to localhost.");
assert.match(script, /function renderDormitoryAcceptanceHub/, "Acceptance mode needs a dedicated non-player hub.");
assert.match(script, /function runDormitoryAcceptanceRoute/, "Acceptance mode needs a legal route replayer.");
assert.match(script, /DATA\.script\?\.startNodeId \|\| plan\.startNodeId/, "Acceptance runs must begin from the official first-chapter start node.");
assert.match(script, /if \(isDormitoryAcceptanceMode\) return;/, "Acceptance mode must not write normal player storage.");
assert.match(script, /routeResolvedEnding/, "Acceptance routes must stop at the shared ending resolver entry.");
assert.match(script, /resetStorySessionTransients\(\{ preserveTimedChoice: false, resetVisual: true \}\)/, "Leaving acceptance mode must clean transient state.");
assert.match(chapters, /routePlans[\s\S]*rememberedDormitory[\s\S]*doNotForgetYourName/, "All eight legal ending routes must remain available to acceptance mode.");

console.log("Dormitory full-runtime acceptance harness check passed.");
