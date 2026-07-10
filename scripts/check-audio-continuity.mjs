import fs from "node:fs";
const text = fs.readFileSync("script.js", "utf8");
const failures = [];
for (const token of ["crossfadeAudioLayer", "fadeInAudio", "fadeOutAudio", "duckBgmForSfx", "suppressMs"]) if (!text.includes(token)) failures.push(`continuity control missing: ${token}`);
if (/game01|synthetic-dev-only|generated-dev-only/.test(text)) failures.push("disallowed synthetic or game audio route remains");
if (failures.length) { console.error("Audio continuity check failed:"); failures.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log("Audio continuity check passed.");
