import fs from "node:fs";
import vm from "node:vm";
const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };
const load = () => { const context = { window: {} }; vm.runInNewContext(fs.readFileSync("assets/external-audio-manifest.js", "utf8"), context); return context.window.SECOND_LIFE_EXTERNAL_AUDIO; };
const manifest = load();
assert(manifest?.meta?.playbackPolicy === "library-plus-three-cc0-exceptions", "wrong playback policy");
const exceptionTypes = new Set();
for (const category of ["bgm", "ambience", "sfx", "stingers"]) {
  for (const [key, asset] of Object.entries(manifest?.[category] || {})) {
    assert(fs.existsSync(asset.path), `${category}.${key} is missing: ${asset.path}`);
    assert(["Taira Komori", "CC0 exception"].includes(asset.sourceFamily), `${category}.${key} has unapproved source family`);
    assert(!asset.fallbackPath, `${category}.${key} must not contain fallbackPath`);
    assert(!/game01|openclose01 \(1\)|external\/processed|generated/i.test(asset.path), `${category}.${key} references a blocked path`);
    assert(asset.productionGrade !== "reject", `${category}.${key} is rejected but reachable`);
    if (asset.sourceFamily === "CC0 exception") exceptionTypes.add(asset.allowedException);
  }
}
assert([...exceptionTypes].every((type) => ["rain", "phone", "message"].includes(type)), "only rain, phone, and message exceptions are allowed");
assert(exceptionTypes.has("rain") && exceptionTypes.has("phone") && exceptionTypes.has("message"), "three approved exception classes must be represented");
if (failures.length) { console.error("External audio asset check failed:"); failures.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log("External audio asset check passed.");
