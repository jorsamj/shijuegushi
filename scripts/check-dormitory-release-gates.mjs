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

if (production.broadcastVoiceStatus !== "xfyun-generated-awaiting-listening-signoff" && production.broadcastVoiceStatus !== "xfyun-generated-ready") {
  failures.push("Formal dormitory broadcasts must be generated through the authorised XFYUN delivery pipeline before release.");
}
if (!production.broadcastVoiceLicense || !production.broadcastVoiceSource) {
  failures.push("Formal dormitory broadcasts need source and distribution-permission records before release.");
}
const manualGates = [
  ["headphoneListeningSignoff", "Headphone listening sign-off is incomplete."],
  ["desktopSpeakerListeningSignoff", "Desktop-speaker listening sign-off is incomplete."],
  ["phoneSpeakerListeningSignoff", "Phone-speaker listening sign-off is incomplete."],
  ["broadcastCadenceSignoff", "All 14 institutional-broadcast order and cadence sign-off is incomplete."],
  ["crossStorySaveSignoff", "Manual cross-story save/load isolation sign-off is incomplete."],
  ["dormitoryMobilePlaythroughSignoff", "Dormitory mobile six-chapter and four-ending playthrough sign-off is incomplete."],
  ["rainCallRegressionSignoff", "Rain Call full manual regression sign-off is incomplete."],
  ["mobileBackgroundRestoreSignoff", "Mobile background-restore sign-off is incomplete."],
  ["consoleErrorSignoff", "Console no-error verification sign-off is incomplete."],
];

for (const [field, message] of manualGates) {
  if (production[field] !== "complete") failures.push(message);
}

if (failures.length) {
  console.error("Dormitory release gate blocked:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory release gate passed.");
