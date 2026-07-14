import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const loadScript = (relativePath, globalName) => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context);
  return context.window[globalName];
};
const contract = loadScript("assets/stories/dormitory-rollcall/broadcast-audio-contract.js", "DORMITORY_BROADCAST_AUDIO_CONTRACT");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/audio/voice-manifest.json"), "utf8"));
const cues = contract.cues || [];
const gapFor = (cue, index) => {
  if (index === 0) return "0ms (sequence start)";
  if (cue.audioId === "dorm_broadcast_public_rules") return "350ms";
  if (cue.audioId.startsWith("dorm_broadcast_ending_")) return "500ms after ending scene settles";
  if (cue.audioId.includes("restore_")) return "450ms";
  return "300ms";
};
const overlap = (cue) => cue.audioId.includes("bed_call") ? "No. Keep the knock pattern separate; test at least 700ms of clear space." : "No intentional overlap; duck ambience only if manual listening shows masking.";
const firstEndingIndex = cues.findIndex((cue) => cue.audioId === "dorm_broadcast_ending_a");
const rows = cues.map((cue, index) => {
  const entry = manifest.entries?.[`broadcast__${cue.audioId}`];
  const isEndingBranch = index >= firstEndingIndex;
  const previous = isEndingBranch ? "Its matching ending scene" : (index ? `\`${cues[index - 1].audioId}\`` : "None");
  const next = isEndingBranch ? "None (mutually exclusive ending branch)" : (index < firstEndingIndex - 1 ? `\`${cues[index + 1].audioId}\`` : "One matching ending branch");
  const file = entry?.fileName ? `\`${entry.fileName}\`` : "MISSING";
  return `| ${index + 1} | \`${cue.audioId}\` | ${file} | ${cue.nodeIds.map((id) => `\`${id}\``).join(", ")} | ${previous} | ${next} | ${gapFor(cue, index)} | ${cue.skippable ? "Yes" : "No"} | ${cue.stopPolicy} | ${overlap(cue)} |`;
}).join("\n");

const report = `# Dormitory Broadcast Sequence Review

Generated from the formal broadcast contract by \`node scripts/generate-broadcast-sequence-review.mjs\`.

This is a **manual review order**, not a runtime sign-off and not evidence that the game automatically chains every cue. Rows 1-10 follow the common story chronology. Rows 11-14 are mutually exclusive ending branches and must never play back-to-back in the game. The listener must confirm audible sequence, pauses, exits, environmental masking, and the absence of overlap during the three-device sign-off.

## Review order

| # | Audio ID | Formal WAV | Story node | Previous | Next | Suggested gap | Skippable | Exit handling | Knock / BGM / ambience review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Listening rules

- Listen in this order from the local voice-review page's **试听全部制度广播** action, then replay every cue in its actual story node.
- Do not let two broadcast cues run together. Node exit follows the contract stop or fade policy.
- The \`dorm_broadcast_bed_call\` cue must not mask either the correct or incorrect knock rhythm.
- Keep BGM and ambience below intelligibility threshold; they should be ducked only when the listener confirms masking.
- This document does not record a pass. Fill the separate human sign-off only after headphones, desktop speakers, and phone speakers are each reviewed.
`;

const output = path.join(root, "docs/DORMITORY_BROADCAST_SEQUENCE_REVIEW.md");
fs.writeFileSync(output, report, "utf8");
console.log(`Wrote ${path.relative(root, output)} with ${cues.length} broadcast cues.`);
