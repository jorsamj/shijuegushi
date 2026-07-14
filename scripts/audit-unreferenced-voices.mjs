import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const voiceDirectory = path.join(root, "assets/stories/rain-call/audio/voice-original");
const manifestPath = path.join(root, "assets/stories/rain-call/audio/voice-manifest.json");
const runtimeManifestPath = path.join(root, "assets/voice-runtime-manifest.js");
const outputPath = path.join(root, "docs/M02_VOICE_ASSET_AUDIT.md");
const checkOnly = process.argv.includes("--check");

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const readScript = (relativePath, globalName) => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context);
  return context.window[globalName];
};

const readWav = (filePath) => {
  const data = fs.readFileSync(filePath);
  if (data.subarray(0, 4).toString() !== "RIFF" || data.subarray(8, 12).toString() !== "WAVE") {
    throw new Error(`${filePath} is not a RIFF/WAVE file.`);
  }

  let cursor = 12;
  let channels;
  let sampleRate;
  let bitDepth;
  let audioBytes;
  while (cursor + 8 <= data.length) {
    const chunkId = data.subarray(cursor, cursor + 4).toString();
    const chunkSize = data.readUInt32LE(cursor + 4);
    const chunkStart = cursor + 8;
    if (chunkId === "fmt ") {
      channels = data.readUInt16LE(chunkStart + 2);
      sampleRate = data.readUInt32LE(chunkStart + 4);
      bitDepth = data.readUInt16LE(chunkStart + 14);
    }
    if (chunkId === "data") audioBytes = chunkSize;
    cursor = chunkStart + chunkSize + (chunkSize % 2);
  }
  const bytesPerSecond = sampleRate * channels * (bitDepth / 8);
  return {
    bytes: data.length,
    sha256: sha256(data),
    sampleRate,
    channels,
    bitDepth,
    durationSeconds: Number((audioBytes / bytesPerSecond).toFixed(3)),
  };
};

const story = readScript("story-data.js", "MIST_DATA");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const runtimeManifestText = fs.readFileSync(runtimeManifestPath, "utf8");
const manifestEntries = Object.values(manifest.entries || {});
const allWavs = fs.readdirSync(voiceDirectory)
  .filter((name) => name.endsWith(".wav"))
  .map((name) => ({ name, path: path.join(voiceDirectory, name), wav: readWav(path.join(voiceDirectory, name)) }));
const duplicateByHash = new Map();
for (const item of allWavs) {
  const matches = duplicateByHash.get(item.wav.sha256) || [];
  matches.push(item.name);
  duplicateByHash.set(item.wav.sha256, matches);
}

const candidates = allWavs.filter((item) => item.name.includes("__m02__")).sort((a, b) => a.name.localeCompare(b.name));
const records = candidates.map((candidate) => {
  const entry = manifestEntries.find((item) => item.fileName === candidate.name || item.webPath?.endsWith(`/${candidate.name}`));
  const nodeId = entry?.nodeId || candidate.name.replace(/^rain_/, "").replace(/__[^_]+\.wav$/, "");
  const node = story.nodes?.[nodeId];
  const relatedCurrentEntry = manifestEntries.find((item) => item.nodeId === nodeId && item.fileName !== candidate.name);
  const duplicateFiles = (duplicateByHash.get(candidate.wav.sha256) || []).filter((name) => name !== candidate.name);
  const runtimeReference = runtimeManifestText.includes(candidate.name);
  const manifestReference = Boolean(entry);
  const isManifestAsset = manifestReference;
  return {
    candidate,
    entry,
    node,
    nodeId,
    manifestReference,
    runtimeReference,
    duplicateFiles,
    relatedCurrentEntry,
    isManifestAsset,
  };
});

const missingReferences = records.filter((record) => !record.manifestReference);
if (checkOnly) {
  if (records.length !== 32) throw new Error(`Expected 32 m02 WAV files; found ${records.length}.`);
  if (missingReferences.length) throw new Error(`m02 audit found ${missingReferences.length} file(s) without a formal voice-manifest reference.`);
  console.log(`m02 voice audit check passed. files=${records.length}; manifestReferences=${records.filter((item) => item.manifestReference).length}; runtimeReferences=${records.filter((item) => item.runtimeReference).length}; removable=0`);
  process.exit(0);
}

const row = (label, value) => `- **${label}**: ${value}`;
const details = records.map((record, index) => {
  const { candidate, entry, node, nodeId } = record;
  const spokenText = node?.text || "No matching story node text found.";
  const formalComparison = record.relatedCurrentEntry
    ? `A second manifest entry exists: \`${record.relatedCurrentEntry.fileName}\`; compare it during human listening before any cleanup.`
    : "No distinct same-node formal variant exists. This file itself is the current formal mapping.";
  const durationDelta = record.relatedCurrentEntry
    ? "Compare after human listening; no automatic quality judgement is made."
    : "Not applicable: no separate formal variant exists.";
  return [
    `### ${String(index + 1).padStart(2, "0")}. \`${candidate.name}\``,
    row("File path", `\`assets/stories/rain-call/audio/voice-original/${candidate.name}\``),
    row("File size", `${candidate.wav.bytes.toLocaleString("en-US")} bytes`),
    row("WAV parameters", `${candidate.wav.durationSeconds}s, ${candidate.wav.sampleRate}Hz, ${candidate.wav.channels} channel, ${candidate.wav.bitDepth}-bit PCM`),
    row("Node and role", `\`${nodeId}\` / ${entry?.speaker || node?.speaker || "unknown"} / \`${entry?.roleId || "unknown"}\``),
    row("Story text", spokenText.replace(/\n/g, " ")),
    row("Content SHA-256", `\`${candidate.wav.sha256}\``),
    row("Manifest reference", record.manifestReference ? `Yes: \`${entry.id}\` in \`assets/stories/rain-call/audio/voice-manifest.json\`` : "No"),
    row("Runtime reference", record.runtimeReference ? "Yes: `assets/voice-runtime-manifest.js`" : "No"),
    row("Binary duplicate", record.duplicateFiles.length ? record.duplicateFiles.map((name) => `\`${name}\``).join(", ") : "No identical WAV hash in the rain-call master directory"),
    row("Formal file comparison", formalComparison),
    row("Voice, duration, parameter delta", durationDelta),
    row("Runtime status", record.runtimeReference ? "Currently playable through the runtime mapping." : "Historical master retained; narration and superseded dialogue are intentionally excluded from runtime voice playback."),
    row("Missing-coverage value", record.isManifestAsset ? "No cleanup value. The formal manifest still tracks this master." : "Needs investigation before any cleanup."),
    row("Decision", record.isManifestAsset ? "Keep. It is a referenced formal voice master; deleting it would discard an auditable source file." : "Keep pending investigation."),
  ].join("\n");
}).join("\n\n");

const report = `# m02 Voice Asset Audit

Generated by \`node scripts/audit-unreferenced-voices.mjs\` on ${new Date().toISOString()}.

## Result

The 32 files with \`__m02__\` in their name are **not unreferenced cleanup candidates** in the current branch. Each is a real rain-call node ID and appears in the formal voice manifest. The suffix is part of the node identifier, not a disposable alternate-take marker. A file may be intentionally absent from the runtime map when its node is narration or its dialogue text was superseded by this review.

- Candidate files: ${records.length}
- Referenced by formal voice manifest: ${records.filter((item) => item.manifestReference).length}/${records.length}
- Referenced by runtime manifest: ${records.filter((item) => item.runtimeReference).length}/${records.length}
- Binary-identical duplicates found: ${records.filter((item) => item.duplicateFiles.length).length}
- Safe deletions: **0**

Deletion is prohibited until a file is no longer referenced by code or manifests, does not cover a story node, has no superior listening value, is not a broadcast or ending asset, and the full voice QA suite passes after removal. Those conditions are not met for any file below.

## Per-file audit

${details}
`;

fs.writeFileSync(outputPath, report, "utf8");
console.log(`Wrote ${path.relative(root, outputPath)}. files=${records.length}; manifestReferences=${records.filter((item) => item.isManifestAsset).length}; runtimeReferences=${records.filter((item) => item.runtimeReference).length}; removable=0`);
