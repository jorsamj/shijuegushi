import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/broadcast-audio-contract.js"), "utf8"),
  context,
  { filename: "broadcast-audio-contract.js" }
);

const contract = context.window.DORMITORY_BROADCAST_AUDIO_CONTRACT;
const failures = [];
const requiredIds = [
  "dorm_broadcast_rollcall_start",
  "dorm_broadcast_public_rules",
  "dorm_broadcast_current_count",
  "dorm_broadcast_bed_call",
  "dorm_broadcast_unlisted_person",
  "dorm_broadcast_deadline_0113",
  "dorm_broadcast_correction_prompt",
  "dorm_broadcast_restore_zhou",
  "dorm_broadcast_restore_xutang",
  "dorm_broadcast_rollcall_complete",
  "dorm_broadcast_ending_a",
  "dorm_broadcast_ending_b",
  "dorm_broadcast_ending_c",
  "dorm_broadcast_ending_d",
];

if (!contract?.cues?.length) failures.push("Dormitory broadcast delivery contract is missing.");
for (const audioId of requiredIds) {
  const cue = contract?.cues?.find((item) => item.audioId === audioId);
  if (!cue) {
    failures.push(`Missing required broadcast slot: ${audioId}.`);
    continue;
  }
  for (const field of ["nodeIds", "line", "tone", "durationSeconds", "stopPolicy", "deliveryStatus", "licenceSource", "publicDistributionAllowed", "commercialDistributionAllowed", "listeningSignoff"]) {
    if (!(field in cue)) failures.push(`${audioId} is missing ${field}.`);
  }
  if (cue.deliveryStatus === "awaiting-authorised-human-recording" && cue.filePath !== null) failures.push(`${audioId} must not point at an unapproved file.`);
  if (cue.loop !== false) failures.push(`${audioId} must be a non-looping broadcast cue.`);
}

if (failures.length) {
  console.error("Dormitory broadcast contract check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory broadcast contract check passed.");
console.log(`slots=${contract.cues.length}; awaiting=${contract.cues.filter((cue) => cue.deliveryStatus === "awaiting-authorised-human-recording").length}`);
