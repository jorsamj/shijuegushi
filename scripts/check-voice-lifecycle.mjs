import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const failures = [];
const cueDispatcherStart = source.indexOf("function playRuntimeCue(node)");
const cueDispatcherEnd = source.indexOf("function isPlaceholderDialogueAsset", cueDispatcherStart);
const cueDispatcher = cueDispatcherStart >= 0 && cueDispatcherEnd > cueDispatcherStart
  ? source.slice(cueDispatcherStart, cueDispatcherEnd)
  : "";
if (!source.includes("function getStoryVoiceEntry")) failures.push("Runtime does not resolve the generated story-voice manifest.");
if (!source.includes("stopAllDialogueAudio();\n    const token")) failures.push("A new node must stop its previous dialogue voice before starting another.");
if (source.includes('speakNode({ nodeId: ending.endingId }, "endings")')) failures.push("Pure ending narration must not be sent to the voice lifecycle.");
if (!source.includes("node?.voiceEnabled !== true")) failures.push("Runtime must refuse a voice mapping unless the current node explicitly enables voice.");
if (source.includes("speakSyntheticNode(node);")) failures.push("Browser speech synthesis must not be a formal voice fallback.");
if (!cueDispatcher) failures.push("Runtime does not expose a formal cue dispatcher for documented in-world broadcasts.");
if (!source.includes("function isDocumentedRuntimeCue")) failures.push("Formal cue dispatch must reject cues absent from the documented broadcast contract.");
if (!source.includes("DORMITORY_BROADCAST_AUDIO_CONTRACT")) failures.push("Formal cue dispatch must use the loaded documented broadcast contract as its runtime allowlist.");
if (!cueDispatcher.includes('window.SECOND_LIFE_VOICE_MANIFEST?.stories?.[scriptId]?.cues || {}')) failures.push("Formal cue dispatch must read only the current story cue manifest.");
if (!cueDispatcher.includes('isDocumentedRuntimeCue(scriptId, cueId, runtimeCues[cueId], node.nodeId)')) failures.push("Formal cue dispatch must filter cues by the current entered node.");
if (!cueDispatcher.includes('getStoryVoiceEntry(cueId, "cues")')) failures.push("Formal cue dispatch must resolve cue files through the current story runtime manifest.");
if (!source.includes('cue.provider !== "volcengine-doubao-tts-websocket"')) failures.push("Formal cue dispatch must reject non-Volcengine providers, including legacy XFYUN mappings.");
if (!source.includes('cue.model !== "seed-tts-2.0"') || !source.includes('cue.voiceType.endsWith("_uranus_bigtts")')) failures.push("Formal cue dispatch must only play standard Doubao TTS 2.0 cue mappings.");
if (!source.includes('cue?.nodeId !== nodeId')) failures.push("Formal cue dispatch must require an explicit cue nodeId matching the entered node.");
if (cueDispatcher.indexOf("stopAllDialogueAudio();") < 0 || cueDispatcher.indexOf("stopAllDialogueAudio();") > cueDispatcher.indexOf("playCueAt(0);")) failures.push("Formal cue dispatch must stop prior dialogue audio before beginning cue playback.");
if (!source.includes("if (!playRuntimeCue(node)) speakNode(node);")) failures.push("Entering a node must dispatch documented formal cues before ordinary node speech.");
if (!source.includes("playRuntimeCue(ending);")) failures.push("Documented in-world ending broadcasts must use the formal cue lifecycle, not ending narration playback.");
if (failures.length) { console.error("Voice lifecycle check failed:"); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log("Voice lifecycle check passed. Node changes, formal cues, ending entry, and browser-TTS exclusion are covered.");
