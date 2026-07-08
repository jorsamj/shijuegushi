import fs from "node:fs";
import vm from "node:vm";

const errors = [];
const warn = [];
const read = (path) => fs.readFileSync(path, "utf8");
const exists = (path) => fs.existsSync(path);
function assert(condition, message) {
  if (!condition) errors.push(message);
}

function loadWindowJs(path, key) {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[key];
}

const external = loadWindowJs("assets/external-audio-manifest.js", "SECOND_LIFE_EXTERNAL_AUDIO");
const story = loadWindowJs("story-data.js", "MIST_DATA");
const allAssets = [];
for (const category of ["bgm", "ambience", "sfx", "stingers"]) {
  for (const [key, asset] of Object.entries(external?.[category] || {})) {
    allAssets.push({ category, key, asset });
  }
}

function hay(asset) {
  return [
    asset.id,
    asset.storyKey,
    asset.path,
    asset.sourceSite,
    asset.sourceUrl,
    asset.originalFileUrl,
    asset.qualityNotes,
    ...(asset.usage || []),
  ].join(" ").toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function rejectAny(asset, terms, message) {
  const text = hay(asset);
  assert(!includesAny(text, terms), `${asset.category}.${asset.storyKey}: ${message}`);
}

function requireAny(asset, terms, message) {
  const text = hay(asset);
  assert(includesAny(text, terms), `${asset.category}.${asset.storyKey}: ${message}`);
}

for (const { category, key, asset } of allAssets) {
  assert(asset.status === "demo-approved" || asset.status === "final-approved", `${category}.${key} must be approved`);
  assert(asset.qualityStatus === "approved", `${category}.${key} must have approved quality`);
  assert(asset.path && exists(asset.path), `${category}.${key} missing local file ${asset.path}`);

  if (/footstep/i.test(key)) {
    requireAny(asset, ["footstep", "shoe", "shoes", "walking", "wet"], "footstep cue must use a footstep/wet-shoe source");
    rejectAny(asset, ["rain_against", "rain_window"], "footstep cue must not use rain/window ambience");
  }
  if (/archive_stamp/i.test(key)) {
    requireAny(asset, ["stamp", "paper", "archive"], "archive stamp cue must use stamp/paper/archive source");
    rejectAny(asset, ["door_lock", "tight_door_lock"], "archive stamp cue must not use door lock source");
  }
  if (/phone_vibrate/i.test(key)) {
    requireAny(asset, ["phone", "vibrat", "buzz"], "phone_vibrate must use phone vibration/buzz source");
    rejectAny(asset, ["razor", "rasur", "shaver"], "phone_vibrate must not use shaver/razor source");
  }
  if (/phone_call_connect/i.test(key)) {
    requireAny(asset, ["phone", "telephone", "pickup", "connect", "hook"], "phone_call_connect must use telephone pickup/connect source");
  }
  if (/door_chain/i.test(key)) {
    requireAny(asset, ["chain", "door", "lock", "metal"], "door_chain cue must use door/chain/lock/metal source");
    rejectAny(asset, ["knocker"], "door_chain cue must not use door knocker source");
  }
  if (/message/i.test(key)) {
    requireAny(asset, ["message", "notification", "pop", "phone", "soft"], "message cue must use message/notification-like source");
  }
  if (/recording_static/i.test(key)) {
    requireAny(asset, ["record", "radio", "static", "tape"], "recording cue must use recording/radio/static/tape source");
    rejectAny(asset, ["dial_up", "dial-up", "dialup"], "recording cue must not use dial-up source");
  }
  if (category === "bgm") {
    rejectAny(asset, ["air_conditioner"], "BGM must not directly use air-conditioner hum as final runtime source");
  }
  if (key === "horror_corridor") {
    requireAny(asset, ["corridor", "hall", "ambience", "tension"], "horror_corridor must be corridor/tension ambience");
  }
}

const pathUse = new Map();
for (const { category, key, asset } of allAssets) {
  const list = pathUse.get(asset.path) || [];
  list.push(`${category}.${key}`);
  pathUse.set(asset.path, list);
}
for (const [path, keys] of pathUse.entries()) {
  const categorySet = new Set(keys.map((item) => item.split(".")[0]));
  if (keys.length > 3 && !categorySet.has("ambience")) {
    warn.push(`${path} is reused by ${keys.length} keys: ${keys.join(", ")}`);
  }
}

const used = new Set();
for (const node of Object.values(story.nodes || {})) {
  for (const key of node.sfxOnEnter || []) used.add(`sfx.${key}`);
  for (const key of node.sfxOnChoice || []) used.add(`sfx.${key}`);
  if (node.voiceStinger) used.add(`stingers.${node.voiceStinger}`);
  if (node.bgm) used.add(`bgm.${node.bgm}`);
  if (node.ambience) used.add(`ambience.${node.ambience}`);
}
for (const item of used) {
  const [category, key] = item.split(".");
  assert(external?.[category]?.[key], `used story audio key missing external mapping: ${item}`);
}

if (errors.length) {
  console.error("Audio semantic check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Audio semantic check passed.");
if (warn.length) {
  console.warn("Audio semantic check warnings:");
  for (const item of warn) console.warn(`- ${item}`);
}
