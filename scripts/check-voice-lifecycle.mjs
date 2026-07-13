import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const failures = [];
if (!source.includes("function getStoryVoiceEntry")) failures.push("Runtime does not resolve the generated story-voice manifest.");
if (!source.includes("stopAllDialogueAudio();\n    const token")) failures.push("A new node must stop its previous dialogue voice before starting another.");
if (!source.includes('speakNode({ nodeId: ending.endingId }, "endings")')) failures.push("Ending narration is not connected to the voice lifecycle.");
if (source.includes("speakSyntheticNode(node);")) failures.push("Browser speech synthesis must not be a formal voice fallback.");
if (failures.length) { console.error("Voice lifecycle check failed:"); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log("Voice lifecycle check passed. Node changes, ending entry, and browser-TTS exclusion are covered.");
