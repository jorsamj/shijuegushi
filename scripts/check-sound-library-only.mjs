import fs from "node:fs";
import vm from "node:vm";

const failures = [];
const read = (path) => fs.readFileSync(path, "utf8");
const exists = (path) => fs.existsSync(path);
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

function loadManifest() {
  const context = { window: {} };
  vm.runInNewContext(read("assets/external-audio-manifest.js"), context, { filename: "assets/external-audio-manifest.js" });
  return context.window.SECOND_LIFE_EXTERNAL_AUDIO;
}

const manifest = loadManifest();
const script = read("script.js");
const index = read("index.html");
const allowedSourceFamilies = new Set(["Taira Komori", "CC0 exception"]);

assert(!exists("assets/audio/generated"), "generated audio directory must be removed");
assert(!index.includes("assets/audio/audio-assets.js"), "index.html must not load legacy audio-assets.js");

for (const forbidden of ["generated-dev-only", "audioSourceMode", "fallbackSrc", "fallbackPath", "window.SECOND_LIFE_AUDIO ||"]) {
  assert(!script.includes(forbidden), `script.js must not contain legacy runtime token: ${forbidden}`);
}

assert(manifest?.meta?.playbackPolicy === "library-plus-three-cc0-exceptions", "manifest must declare library-plus-three-cc0-exceptions");

for (const category of ["bgm", "ambience", "sfx", "stingers"]) {
  for (const [key, asset] of Object.entries(manifest?.[category] || {})) {
    assert(asset.path && exists(asset.path), `${category}.${key} must reference a local file`);
    assert(!asset.fallbackPath, `${category}.${key} must not provide a legacy fallbackPath`);
    assert(allowedSourceFamilies.has(asset.sourceFamily), `${category}.${key} must declare an approved sourceFamily`);
    assert(!/game01|openclose01 \(1\)|freesound|wikimedia|generated/i.test(`${asset.path} ${asset.sourceSite}`), `${category}.${key} must not use a blocked source`);
  }
}

if (failures.length) {
  console.error("Sound-library-only check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Sound-library-only check passed.");
