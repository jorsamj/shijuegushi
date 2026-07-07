import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const exists = (path) => fs.existsSync(new URL(path, root));
const failures = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function loadJs(path, globalName) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[globalName];
}

const manifestPath = "assets/external-audio-manifest.js";
assert(exists(manifestPath), "assets/external-audio-manifest.js is missing");
assert(exists("docs/EXTERNAL_AUDIO_CANDIDATES.md"), "docs/EXTERNAL_AUDIO_CANDIDATES.md is missing");
assert(exists("docs/AUDIO_CREDITS.md"), "docs/AUDIO_CREDITS.md is missing");
assert(exists("docs/LICENSES_AUDIO.md"), "docs/LICENSES_AUDIO.md is missing");

const manifest = exists(manifestPath) ? loadJs(manifestPath, "SECOND_LIFE_EXTERNAL_AUDIO") : null;
const candidatesText = exists("docs/EXTERNAL_AUDIO_CANDIDATES.md") ? read("docs/EXTERNAL_AUDIO_CANDIDATES.md") : "";
const creditsText = exists("docs/AUDIO_CREDITS.md") ? read("docs/AUDIO_CREDITS.md") : "";
const licensesText = exists("docs/LICENSES_AUDIO.md") ? read("docs/LICENSES_AUDIO.md") : "";

assert(manifest && typeof manifest === "object", "window.SECOND_LIFE_EXTERNAL_AUDIO must exist");

const blockedSourcePatterns = [
  /youtube/i,
  /bilibili/i,
  /douyin/i,
  /tiktok/i,
  /xiaohongshu/i,
  /netease/i,
  /qq\s*music/i,
];
const forbiddenLicensePatterns = [/NC/i, /NonCommercial/i, /Sampling\+/i, /unknown/i, /unclear/i, /NoDerivatives/i];
const requiredP0StoryKeys = [
  "knock_soft",
  "phone_vibrate",
  "phone_ring_dead_call",
  "doorbell_rain_night",
  "rain_heavy_loop",
  "recording_static_short",
  "door_chain_close",
  "door_lock_turn",
];
const requiredFields = [
  "id",
  "storyKey",
  "category",
  "path",
  "fallbackPath",
  "sourceSite",
  "sourceUrl",
  "author",
  "license",
  "attributionRequired",
  "commercialAllowed",
  "redistributionAllowed",
  "status",
];

const selected = [];
for (const category of ["bgm", "ambience", "sfx", "stingers"]) {
  const bucket = manifest?.[category] || {};
  assert(bucket && typeof bucket === "object", `external manifest category missing: ${category}`);
  for (const [key, asset] of Object.entries(bucket)) {
    selected.push(asset);
    for (const field of requiredFields) {
      assert(asset[field] !== undefined && asset[field] !== "", `${category}.${key} is missing required field: ${field}`);
    }
    assert(asset.category === category, `${asset.id || key} category mismatch: ${asset.category} !== ${category}`);
    assert(!/^https?:\/\//i.test(asset.path || ""), `${asset.id || key} path must be local, not URL`);
    assert(exists(asset.path), `${asset.id || key} path does not exist: ${asset.path}`);
    assert(exists(asset.fallbackPath), `${asset.id || key} fallbackPath does not exist: ${asset.fallbackPath}`);
    assert(String(asset.sourceUrl || "").startsWith("http"), `${asset.id || key} sourceUrl must be a traceable URL`);
    assert(!forbiddenLicensePatterns.some((pattern) => pattern.test(asset.license || "")), `${asset.id || key} has forbidden license: ${asset.license}`);
    assert(!blockedSourcePatterns.some((pattern) => pattern.test(`${asset.sourceSite} ${asset.sourceUrl}`)), `${asset.id || key} uses a forbidden source`);
    assert(asset.commercialAllowed === true, `${asset.id || key} must be commercialAllowed=true`);
    assert(asset.redistributionAllowed === true, `${asset.id || key} must be redistributionAllowed=true`);
    assert(["demo-usable", "final-candidate"].includes(asset.status), `${asset.id || key} must be demo-usable or final-candidate`);
    assert(creditsText.includes(asset.id), `${asset.id || key} must be recorded in AUDIO_CREDITS.md`);
    assert(licensesText.includes(asset.path), `${asset.id || key} local file must be recorded in LICENSES_AUDIO.md`);
    if (asset.attributionRequired === true) {
      assert(
        creditsText.includes(asset.attributionText || "__missing_attribution__"),
        `${asset.id} requires attribution text but it is missing from AUDIO_CREDITS.md`
      );
    }
    assert(candidatesText.includes(asset.id) || candidatesText.includes(asset.storyKey), `${asset.id || key} must be recorded in EXTERNAL_AUDIO_CANDIDATES.md`);
  }
}

assert(selected.length >= 8, `selectedExternalAudio must be at least 8, got ${selected.length}`);
assert(Number(manifest?.meta?.selectedExternalAudio || 0) >= 8, "manifest.meta.selectedExternalAudio must be at least 8");
assert(manifest?.meta?.status === "active", "external manifest status must be active after selecting real assets");
for (const storyKey of requiredP0StoryKeys) {
  assert(selected.some((asset) => asset.storyKey === storyKey), `missing required P0 external story key: ${storyKey}`);
}

if (failures.length) {
  console.error("External audio asset check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("External audio asset check warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("External audio asset check passed.");
console.log(`selectedExternalAudio=${selected.length}`);
