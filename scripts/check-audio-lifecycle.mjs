import fs from "node:fs";
const text = fs.readFileSync("script.js", "utf8");
const failures = [];
for (const token of ["transitionAudioForNode", "stopTrackedAudioList(\"activeSfx\"", "crossfadeAudioLayer", "duckBgmForSfx", "fadeOutAudio"]) if (!text.includes(token)) failures.push(`missing lifecycle mechanism: ${token}`);
for (const token of ["generated-dev-only", "fallbackSrc", "audioSourceMode"]) if (text.includes(token)) failures.push(`legacy lifecycle route remains: ${token}`);
if (failures.length) { console.error("Audio lifecycle check failed:"); failures.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log("Audio lifecycle check passed.");
