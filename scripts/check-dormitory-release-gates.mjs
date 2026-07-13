import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8"),
  context,
  { filename: "dormitory-story-data.js" }
);

const production = context.window.MIST_DORMITORY_DATA?.audioProduction || {};
const failures = [];

if (production.broadcastVoiceStatus !== "licensed-recording-ready") {
  failures.push("Formal dormitory broadcasts still require an authorised Chinese recording. Expected audioProduction.broadcastVoiceStatus=licensed-recording-ready.");
}
if (!production.broadcastVoiceLicense || !production.broadcastVoiceSource) {
  failures.push("Formal dormitory broadcasts need source and distribution-permission records before release.");
}
if (production.manualDeviceSignoff !== "complete") {
  failures.push("Headphones, desktop speakers, and phone-speaker listening sign-off is incomplete.");
}
if (production.crossStorySaveSignoff !== "complete") {
  failures.push("Manual cross-story save/load isolation sign-off is incomplete.");
}
if (production.mobilePlaythroughSignoff !== "complete") {
  failures.push("Manual mobile six-chapter and ending-route playthrough sign-off is incomplete.");
}

if (failures.length) {
  console.error("Dormitory release gate blocked:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory release gate passed.");
