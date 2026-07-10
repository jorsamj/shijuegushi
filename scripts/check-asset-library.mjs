import fs from "node:fs";
import vm from "node:vm";
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("assets/external-audio-manifest.js", "utf8"), context);
const manifest = context.window.SECOND_LIFE_EXTERNAL_AUDIO;
const failures = [];
for (const category of ["bgm", "ambience", "sfx", "stingers"]) for (const asset of Object.values(manifest[category] || {})) {
  if (!fs.existsSync(asset.path)) failures.push(`missing ${asset.path}`);
  if (!asset.path.startsWith("assets/library/audio/reconstructed/") && !asset.path.startsWith("assets/library/audio/exceptions/")) failures.push(`outside reconstructed library: ${asset.path}`);
}
if (fs.existsSync("assets/audio/generated")) failures.push("legacy generated audio directory exists");
if (fs.existsSync("assets/library/audio/external/processed")) failures.push("legacy processed audio directory exists");
if (failures.length) { console.error("Asset library check failed:"); failures.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log("Asset library check passed.");
