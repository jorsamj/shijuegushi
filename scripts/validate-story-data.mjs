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

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
  return context.window.MIST_DATA;
}

function loadVisuals() {
  const context = { window: {} };
  vm.runInNewContext(read("assets/visual-assets.js"), context, { filename: "assets/visual-assets.js" });
  return context.window.SECOND_LIFE_VISUALS;
}

function loadAudio() {
  const context = { window: {} };
  vm.runInNewContext(read("assets/audio/audio-assets.js"), context, { filename: "assets/audio/audio-assets.js" });
  return context.window.SECOND_LIFE_AUDIO;
}

function parseCoreClues(scriptText) {
  const match = scriptText.match(/const CORE_CLUE_IDS = \[([\s\S]*?)\];/);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function countMilestones(scriptText) {
  const match = scriptText.match(/const MILESTONES = \[([\s\S]*?)\];/);
  if (!match) return 0;
  return [...match[1].matchAll(/milestoneId:/g)].length;
}

function resolveEnding(snapshot) {
  const clues = new Set(snapshot.clues || []);
  const flags = snapshot.flags || {};

  if (flags.deleted_evidence === true && flags.backed_up_photo !== true) return "ending_c";

  const hasAClues = [
    "clue_gray_loan",
    "clue_zhou_left",
    "clue_photo_background",
    "clue_timed_voice",
  ].every((id) => clues.has(id));

  if (
    hasAClues &&
    flags.backed_up_photo === true &&
    flags.chose_reopen_case === true &&
    Number(snapshot.deductionScore || 0) >= 4
  ) {
    return "ending_a";
  }

  if (
    flags.gave_original_photo === true &&
    (flags.verified_zhuwan_identity !== true ||
      flags.backed_up_photo !== true ||
      flags.understood_dead_call !== true)
  ) {
    return "ending_b";
  }

  return "ending_d";
}

const DATA = loadData();
const VISUALS = loadVisuals();
const AUDIO = loadAudio();
const scriptText = read("script.js");
const indexText = read("index.html");
const runtimeTextPaths = [
  "README.md",
  "story-data.js",
  "script.js",
  "style.css",
  "index.html",
  "assets/visual-assets.js",
  "assets/audio/audio-assets.js",
];
const allText = runtimeTextPaths.map((path) => `${path}\n${read(path)}`).join("\n\n");

const coreClueIds = parseCoreClues(scriptText);
const clueIds = new Set(Object.keys(DATA.clues || {}));
const nodeIds = new Set(Object.keys(DATA.nodes || {}));
const endingIds = new Set(Object.keys(DATA.endings || {}));
const defaultFlagIds = new Set(Object.keys(DATA.defaultFlags || {}));
const relationshipIds = new Set([
  "trust_zhuwan",
  "support_chenyan",
  "suspicion_zhou",
  "courage_linzou",
]);
const characterScaleIds = new Set(["normal", "large", "impact", "closeup", "fullscreen"]);
const characterFramingIds = new Set(["fullbody", "three-quarter", "halfbody", "bust", "face"]);
const characterPositionIds = new Set(["left", "center", "right"]);
const characterFocusIds = new Set(["face", "upperBody", "fullBody"]);
const audioKeySets = {
  bgm: new Set(Object.keys(AUDIO.bgm || {})),
  ambience: new Set(Object.keys(AUDIO.ambience || {})),
  sfx: new Set(Object.keys(AUDIO.sfx || {})),
  narration: new Set(Object.keys(AUDIO.narration || {})),
  voice: new Set(Object.keys(AUDIO.voice || {})),
};
const requiredSceneIds = new Set(Object.values(DATA.nodes || {}).map((node) => node.scene).filter(Boolean));
const requiredCharacterIds = new Set(["linzhou", "zhuwan", "zhouyu", "chenyan", "zhixia"]);

function assertAssetPath(path, label) {
  assert(typeof path === "string" && path.length > 0, `${label} must provide an asset path`);
  if (typeof path !== "string" || !path.length) return;
  assert(!/^https?:\/\//i.test(path), `${label} must not use external URL: ${path}`);
  assert(exists(path), `${label} references missing file: ${path}`);
}

function fileSize(path) {
  try {
    return fs.statSync(new URL(path, root)).size;
  } catch (error) {
    return 0;
  }
}

function getVisualCharacter(node) {
  const speaker = node.visualCharacter || node.speaker || "旁白";
  const rawName = String(speaker).split(/[：:]/)[0].trim() || "旁白";
  const characterNames = Object.keys(VISUALS.characters || {});
  const matchedName = characterNames.find((name) => rawName.includes(name));
  const aliasName = VISUALS.characterAliases?.[rawName] || matchedName || rawName;
  return VISUALS.characters?.[aliasName];
}

function assertOptionalString(value, label) {
  if (value !== undefined) assert(typeof value === "string", `${label} must be a string`);
}

function assertOptionalStringList(value, label) {
  if (value === undefined) return;
  const items = Array.isArray(value) ? value : [value];
  items.forEach((item) => assert(typeof item === "string", `${label} must contain strings`));
}

assert(DATA.chapters?.length === 6, `chapters must be 6, got ${DATA.chapters?.length}`);
assert(clueIds.size === 6, `clues must be 6, got ${clueIds.size}`);
assert(coreClueIds.length === 6, `CORE_CLUE_IDS must be 6, got ${coreClueIds.length}`);
coreClueIds.forEach((id) => assert(clueIds.has(id), `CORE_CLUE_IDS contains missing clue: ${id}`));
assert(nodeIds.has("ch01_001"), "start node ch01_001 is missing");
assert(
  Object.values(DATA.nodes || {}).some((node) => node.chapterId === "chapter_06" && node.resolveEnding === true),
  "chapter_06 must contain a resolveEnding node"
);
["ending_a", "ending_b", "ending_c", "ending_d"].forEach((id) => assert(endingIds.has(id), `missing ending: ${id}`));
assert(countMilestones(scriptText) <= 4, "MILESTONES must be at most 4");
assert(VISUALS && typeof VISUALS === "object", "visual assets config is missing");
assert(exists("assets/audio/audio-assets.js"), "audio assets config file is missing");
assert(exists("scripts/generate-voice-assets.mjs"), "voice generation script is missing");
assert(exists(".env.example"), ".env.example is missing");
assert(AUDIO && typeof AUDIO === "object", "window.SECOND_LIFE_AUDIO is missing");
assert(indexText.includes("assets/audio/audio-assets.js"), "index.html must load assets/audio/audio-assets.js");
assert(AUDIO.voiceProfiles && typeof AUDIO.voiceProfiles === "object", "audio-assets.js must define voiceProfiles");
["narrator", "linzhou", "xuzhiwan", "zhouyu", "chenyan", "xuzhixia"].forEach((profileId) => {
  assert(AUDIO.voiceProfiles?.[profileId], `missing voice profile: ${profileId}`);
});
assert(scriptText.includes('voiceMode: ["real", "fallback", "off"].includes(saved.voiceMode) ? saved.voiceMode : "fallback"'), "voiceMode must default to profiled fallback while real voice assets are pending");
assert(scriptText.includes('settings.voiceMode === "fallback" || settings.voiceMode === "real"'), "real voice mode must fall back to profiled narration when mp3 assets are missing");
assert(scriptText.includes("function chooseSpeechVoice"), "script.js must choose a speech voice by profile for fallback narration");
assert(scriptText.includes("function prepareSpeechText"), "script.js must prepare text pauses for fallback narration");
["bgm", "ambience", "sfx", "narration", "voice"].forEach((category) => {
  assert(AUDIO[category] && typeof AUDIO[category] === "object", `audio category missing: ${category}`);
  for (const [key, path] of Object.entries(AUDIO[category] || {})) {
    assert(typeof key === "string" && key.length > 0, `audio ${category} has invalid key`);
    assert(typeof path === "string" && path.length > 0, `audio ${category}.${key} must provide a path`);
    assert(!/^https?:\/\//i.test(path), `audio ${category}.${key} must not use external URL: ${path}`);
    if (category === "voice" || category === "narration") {
      assert(exists(path), `audio ${category}.${key} references missing file: ${path}`);
    }
  }
});

const requiredVoiceFiles = [
  "assets/audio/narration/narration_ch01_001.mp3",
  "assets/audio/narration/narration_ch01_003.mp3",
  "assets/audio/narration/narration_ch01_008.mp3",
  "assets/audio/narration/narration_ch01_020.mp3",
  "assets/audio/narration/narration_ch05_015.mp3",
  "assets/audio/voice/xuzhixia/voice_xuzhixia_ch01_005.mp3",
  "assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_005.mp3",
  "assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_011.mp3",
  "assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_015.mp3",
  "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_007.mp3",
  "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_011.mp3",
  "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_016.mp3",
  "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_001.mp3",
  "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_003.mp3",
  "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_005.mp3",
  "assets/audio/voice/zhouyu/voice_zhouyu_ch04_020.mp3",
  "assets/audio/voice/chenyan/voice_chenyan_ch01_009.mp3",
  "assets/audio/voice/chenyan/voice_chenyan_ch02_007.mp3",
  "assets/audio/voice/linzhou/voice_linzhou_ch01_002.mp3",
  "assets/audio/voice/linzhou/voice_linzhou_ch01_004.mp3",
  "assets/audio/voice/linzhou/voice_linzhou_ch01_019.mp3",
  "assets/audio/voice/linzhou/voice_linzhou_ch02_002.mp3",
];
requiredVoiceFiles.forEach((assetPath) => {
  assert(exists(assetPath), `first-batch voice file is missing: ${assetPath}`);
});

const requiredImage2Assets = [
  ["character", "assets/characters/char_xuzhixia_recording.webp"],
  ["character", "assets/characters/char_xuzhiwan_wet.webp"],
  ["character", "assets/characters/char_xuzhiwan_pressure.webp"],
  ["character", "assets/characters/char_xuzhiwan_closeup.webp"],
  ["character", "assets/characters/char_zhouyu_pressure.webp"],
  ["background", "assets/bg/bg_rental_room_rain_night.webp"],
  ["background", "assets/bg/bg_corridor_door.webp"],
  ["background", "assets/bg/bg_phone_call_ui.webp"],
  ["background", "assets/bg/bg_old_phone_view.webp"],
  ["background", "assets/covers/cover_home_hero.webp"],
];
for (const [kind, assetPath] of requiredImage2Assets) {
  assert(exists(assetPath), `first-batch image2 asset is missing: ${assetPath}`);
  const size = fileSize(assetPath);
  if (kind === "character") warn(size >= 120000, `character asset may still be low quality placeholder: ${assetPath} (${size} bytes)`);
  if (kind === "background") warn(size >= 250000, `background/cover asset may still be low quality placeholder: ${assetPath} (${size} bytes)`);
}

for (const sceneId of requiredSceneIds) {
  const scene = VISUALS.scenes?.[sceneId];
  assert(scene, `missing visual scene config: ${sceneId}`);
  assertAssetPath(scene?.bg, `scene ${sceneId} background`);
  for (const overlay of scene?.overlays || []) assertAssetPath(overlay, `scene ${sceneId} overlay`);
  for (const propId of scene?.props || []) assert(VISUALS.props?.[propId], `scene ${sceneId} references missing prop: ${propId}`);
}

for (const clueId of clueIds) {
  const clueVisual = VISUALS.clues?.[clueId];
  assert(clueVisual, `missing clue icon config: ${clueId}`);
  assertAssetPath(clueVisual?.image, `clue ${clueId} image`);
}

for (const chapter of DATA.chapters || []) {
  const chapterVisual = VISUALS.chapters?.[chapter.chapterId];
  assert(chapterVisual, `missing chapter cover config: ${chapter.chapterId}`);
  assertAssetPath(chapterVisual?.image, `chapter ${chapter.chapterId} cover`);
}

for (const characterId of requiredCharacterIds) {
  const characterVisual = Object.values(VISUALS.characters || {}).find((item) => item.id === characterId);
  assert(characterVisual, `missing character visual config: ${characterId}`);
  assertAssetPath(characterVisual?.image, `character ${characterId} image`);
  for (const [variantId, variantPath] of Object.entries(characterVisual?.variants || {})) {
    assertAssetPath(variantPath, `character ${characterId} variant ${variantId}`);
  }
}

const zhuwanVisual = Object.values(VISUALS.characters || {}).find((item) => item.id === "zhuwan");
[
  "base",
  "wet",
  "suspicious",
  "pressure",
  "angry",
  "fear",
  "horror",
  "closeup",
  "fullbody",
].forEach((variant) => {
  assert(zhuwanVisual?.variants?.[variant], `许知晚 missing required variant: ${variant}`);
});

for (const aliasTarget of Object.values(VISUALS.characterAliases || {})) {
  assert(VISUALS.characters?.[aliasTarget], `character alias references missing character: ${aliasTarget}`);
}

for (const prop of Object.values(VISUALS.props || {})) assertAssetPath(prop.image, `prop ${prop.id} image`);
for (const endingId of ["ending_a", "ending_b", "ending_c", "ending_d"]) assertAssetPath(VISUALS.endings?.[endingId]?.image, `ending ${endingId} image`);
for (const cover of Object.entries(VISUALS.covers || {})) assertAssetPath(cover[1], `cover ${cover[0]}`);

const visualText = JSON.stringify(VISUALS);
assert(!/https?:\/\//i.test(visualText), "visual assets must not use external image URLs");


for (const chapter of DATA.chapters || []) {
  const nodes = Object.values(DATA.nodes || {}).filter((node) => node.chapterId === chapter.chapterId);
  const choices = nodes.filter((node) => node.type === "choice" || node.type === "deduction");
  assert(nodes.length >= 18, `${chapter.chapterId} has fewer than 18 nodes`);
  assert(nodes.length <= 25, `${chapter.chapterId} has more than 25 nodes`);
  assert(choices.length >= 3, `${chapter.chapterId} has fewer than 3 choice/deduction nodes`);
}

const requiredVisualStateNodes = {
  ch01_003: { visualMood: true, bgm: "rain_night_loop", sfxOnEnter: ["phone_ring"] },
  ch01_005: { visualMood: true, visualCharacter: "许知夏", characterVariant: "recording", characterScale: "impact", characterFraming: "halfbody", characterFocus: "face", headSafe: true, voiceAudio: true },
  ch01_007: { visualMood: true, visualCharacter: "许知晚", characterVariant: "wet", characterScale: "impact", characterPosition: "center", characterFraming: "three-quarter", characterFocus: "upperBody", headSafe: true },
  ch01_008: { visualMood: true, visualCharacter: "许知晚", characterVariant: "fullbody", characterScale: "large", characterPosition: "center", characterFraming: "fullbody", characterFocus: "fullBody", headSafe: true },
  ch02_003: { visualMood: true, visualCharacter: "许知晚", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterFocus: "face", headSafe: true },
  ch05_011: { visualMood: true, visualCharacter: "许知夏", characterVariant: "fear", characterScale: "closeup", characterFraming: "bust", characterFocus: "face", headSafe: true, sfxOnEnter: ["recording_play", "static_noise"] },
  ch05_015: { visualMood: true, visualCharacter: "许知夏", characterVariant: "recording", characterScale: "closeup", characterFraming: "bust", characterFocus: "face", headSafe: true, sfxOnEnter: ["recording_play", "static_noise"] },
  ch05_016: { visualMood: true, visualCharacter: "周屿", characterVariant: "horror", characterScale: "fullscreen", characterFraming: "face", characterFocus: "face", headSafe: true },
  ch06_020: { visualMood: true, bgm: "ending_archive" },
};

for (const [nodeId, requirement] of Object.entries(requiredVisualStateNodes)) {
  const node = DATA.nodes?.[nodeId];
  assert(node, `required visual state node is missing: ${nodeId}`);
  if (!node) continue;
  if (requirement.visualMood) assert(typeof node.visualMood === "string" && node.visualMood.length > 0, `${nodeId} must define visualMood`);
  if (requirement.visualCharacter) assert(node.visualCharacter === requirement.visualCharacter, `${nodeId} must use visualCharacter=${requirement.visualCharacter}`);
  if (requirement.characterVariant) assert(node.characterVariant === requirement.characterVariant, `${nodeId} must use characterVariant=${requirement.characterVariant}`);
  if (requirement.characterScale) assert(node.characterScale === requirement.characterScale, `${nodeId} must use characterScale=${requirement.characterScale}`);
  if (requirement.characterPosition) assert(node.characterPosition === requirement.characterPosition, `${nodeId} must use characterPosition=${requirement.characterPosition}`);
  if (requirement.characterFraming) assert(node.characterFraming === requirement.characterFraming, `${nodeId} must use characterFraming=${requirement.characterFraming}`);
  if (requirement.characterFocus) assert(node.characterFocus === requirement.characterFocus, `${nodeId} must use characterFocus=${requirement.characterFocus}`);
  if (requirement.headSafe) assert(node.characterHeadSafe === true, `${nodeId} must set characterHeadSafe=true`);
  if (requirement.bgm) assert(node.bgm === requirement.bgm, `${nodeId} must use bgm=${requirement.bgm}`);
  if (requirement.voiceAudio) assert(typeof node.voiceAudio === "string" && node.voiceAudio.length > 0, `${nodeId} must define voiceAudio`);
  for (const sfx of requirement.sfxOnEnter || []) {
    assert((node.sfxOnEnter || []).includes(sfx), `${nodeId} must include sfxOnEnter=${sfx}`);
  }
}

for (const node of Object.values(DATA.nodes || {})) {
  assert(
    DATA.chapters.some((chapter) => chapter.chapterId === node.chapterId),
    `${node.nodeId} references missing chapter ${node.chapterId}`
  );
  if (node.nextNodeId) assert(nodeIds.has(node.nextNodeId), `${node.nodeId}.nextNodeId missing: ${node.nextNodeId}`);
  for (const clueId of node.gainClues || []) assert(clueIds.has(clueId), `${node.nodeId}.gainClues missing clue: ${clueId}`);
  for (const flagId of node.setFlags || []) assert(defaultFlagIds.has(flagId), `${node.nodeId}.setFlags missing flag: ${flagId}`);

  assertOptionalString(node.visualMood, `${node.nodeId}.visualMood`);
  assertOptionalString(node.visualCharacter, `${node.nodeId}.visualCharacter`);
  assertOptionalString(node.characterVariant, `${node.nodeId}.characterVariant`);
  assertOptionalString(node.characterScale, `${node.nodeId}.characterScale`);
  assertOptionalString(node.characterPosition, `${node.nodeId}.characterPosition`);
  assertOptionalString(node.characterFraming, `${node.nodeId}.characterFraming`);
  if (node.characterHeadSafe !== undefined) assert(typeof node.characterHeadSafe === "boolean", `${node.nodeId}.characterHeadSafe must be boolean`);
  assertOptionalString(node.characterFocus, `${node.nodeId}.characterFocus`);
  assertOptionalString(node.overlayPreset, `${node.nodeId}.overlayPreset`);
  assertOptionalString(node.bgm, `${node.nodeId}.bgm`);
  assertOptionalString(node.ambience, `${node.nodeId}.ambience`);
  assertOptionalString(node.narrationAudio, `${node.nodeId}.narrationAudio`);
  assertOptionalString(node.voiceAudio, `${node.nodeId}.voiceAudio`);
  assertOptionalString(node.voiceCharacter, `${node.nodeId}.voiceCharacter`);
  assertOptionalString(node.voiceProfile, `${node.nodeId}.voiceProfile`);
  assertOptionalString(node.voiceEmotion, `${node.nodeId}.voiceEmotion`);
  assertOptionalString(node.voiceDirection, `${node.nodeId}.voiceDirection`);
  if (node.voiceSpeed !== undefined) assert(typeof node.voiceSpeed === "number", `${node.nodeId}.voiceSpeed must be a number`);
  if (node.voicePitch !== undefined) assert(typeof node.voicePitch === "number", `${node.nodeId}.voicePitch must be a number`);
  assertOptionalString(node.audioMood, `${node.nodeId}.audioMood`);
  assertOptionalStringList(node.sfxOnEnter, `${node.nodeId}.sfxOnEnter`);
  assertOptionalStringList(node.sfxOnChoice, `${node.nodeId}.sfxOnChoice`);
  if (node.characterScale) assert(characterScaleIds.has(node.characterScale), `${node.nodeId}.characterScale is invalid: ${node.characterScale}`);
  if (node.characterPosition) assert(characterPositionIds.has(node.characterPosition), `${node.nodeId}.characterPosition is invalid: ${node.characterPosition}`);
  if (node.characterFraming) assert(characterFramingIds.has(node.characterFraming), `${node.nodeId}.characterFraming is invalid: ${node.characterFraming}`);
  if (node.characterFocus) assert(characterFocusIds.has(node.characterFocus), `${node.nodeId}.characterFocus is invalid: ${node.characterFocus}`);
  if (node.characterScale === "closeup" || node.characterScale === "fullscreen") {
    assert(Boolean(node.characterFraming), `${node.nodeId}.${node.characterScale} must define characterFraming`);
    assert(node.characterHeadSafe === true, `${node.nodeId}.${node.characterScale} must set characterHeadSafe=true`);
    assert(Boolean(node.visualCharacter || getVisualCharacter(node)), `${node.nodeId}.${node.characterScale} must resolve a visible character`);
  }
  if (node.characterVariant) {
    const visualCharacter = getVisualCharacter(node);
    assert(visualCharacter, `${node.nodeId}.characterVariant cannot resolve visual character`);
    assert(visualCharacter?.variants?.[node.characterVariant], `${node.nodeId}.characterVariant missing variant ${node.characterVariant}`);
  }
  if (node.bgm) assert(audioKeySets.bgm.has(node.bgm), `${node.nodeId}.bgm references missing audio key: ${node.bgm}`);
  if (node.ambience) assert(audioKeySets.ambience.has(node.ambience), `${node.nodeId}.ambience references missing audio key: ${node.ambience}`);
  for (const sfx of node.sfxOnEnter || []) assert(audioKeySets.sfx.has(sfx), `${node.nodeId}.sfxOnEnter references missing audio key: ${sfx}`);
  for (const sfx of node.sfxOnChoice || []) assert(audioKeySets.sfx.has(sfx), `${node.nodeId}.sfxOnChoice references missing audio key: ${sfx}`);
  if (node.voiceAudio) assert(audioKeySets.voice.has(node.voiceAudio), `${node.nodeId}.voiceAudio references missing audio key: ${node.voiceAudio}`);
  if (node.narrationAudio) assert(audioKeySets.narration.has(node.narrationAudio), `${node.nodeId}.narrationAudio references missing audio key: ${node.narrationAudio}`);
  if (node.voiceProfile) assert(AUDIO.voiceProfiles?.[node.voiceProfile], `${node.nodeId}.voiceProfile references missing profile: ${node.voiceProfile}`);
  if (node.voiceAudio || node.narrationAudio) {
    assert(Boolean(node.voiceProfile), `${node.nodeId} voice node must define voiceProfile`);
    assert(Boolean(node.voiceEmotion), `${node.nodeId} voice node must define voiceEmotion`);
    assert(Boolean(node.voiceDirection), `${node.nodeId} voice node must define voiceDirection`);
  }

  for (const choice of node.choices || []) {
    if (choice.nextNodeId) {
      assert(nodeIds.has(choice.nextNodeId), `${node.nodeId}.${choice.choiceId}.nextNodeId missing: ${choice.nextNodeId}`);
    }
    for (const clueId of choice.gainClues || []) {
      assert(clueIds.has(clueId), `${node.nodeId}.${choice.choiceId}.gainClues missing clue: ${clueId}`);
    }
    for (const flagId of choice.setFlags || []) {
      assert(defaultFlagIds.has(flagId), `${node.nodeId}.${choice.choiceId}.setFlags missing flag: ${flagId}`);
    }
    for (const effect of choice.relationshipEffects || []) {
      assert(relationshipIds.has(effect.id), `${node.nodeId}.${choice.choiceId}.relationshipEffects has invalid id: ${effect.id}`);
    }
    assert(Array.isArray(choice.endingPathTags || []), `${node.nodeId}.${choice.choiceId}.endingPathTags must be an array`);
    for (const tag of choice.endingPathTags || []) {
      assert(typeof tag === "string", `${node.nodeId}.${choice.choiceId}.endingPathTags must contain strings`);
    }
    assertOptionalStringList(choice.sfxOnChoice, `${node.nodeId}.${choice.choiceId}.sfxOnChoice`);
    for (const sfx of choice.sfxOnChoice || []) {
      assert(audioKeySets.sfx.has(sfx), `${node.nodeId}.${choice.choiceId}.sfxOnChoice references missing audio key: ${sfx}`);
    }
    assert(
      (choice.setFlags || []).length ||
        (choice.relationshipEffects || []).length ||
        (choice.endingPathTags || []).length ||
        (choice.gainClues || []).length ||
        choice.choiceImpactText ||
        node.type === "deduction",
      `${node.nodeId}.${choice.choiceId} has no effective impact`
    );
  }
}

const reachable = new Set();
const stack = ["ch01_001"];
while (stack.length) {
  const nodeId = stack.pop();
  if (!nodeId || reachable.has(nodeId) || !nodeIds.has(nodeId)) continue;
  reachable.add(nodeId);
  const node = DATA.nodes[nodeId];
  if (node.nextNodeId) stack.push(node.nextNodeId);
  for (const choice of node.choices || []) if (choice.nextNodeId) stack.push(choice.nextNodeId);
}
assert(reachable.has("ch06_020"), "final resolve node ch06_020 is not reachable from ch01_001");

const allKeyClues = [
  "clue_dead_call",
  "clue_sister_mark",
  "clue_gray_loan",
  "clue_zhou_left",
  "clue_photo_background",
  "clue_timed_voice",
];
assert(
  resolveEnding({
    clues: allKeyClues,
    flags: { backed_up_photo: true, chose_reopen_case: true, verified_zhuwan_identity: true, understood_dead_call: true },
    deductionScore: 4,
  }) === "ending_a",
  "A ending scenario failed"
);
assert(
  resolveEnding({
    clues: ["clue_dead_call", "clue_sister_mark", "clue_photo_background"],
    flags: { gave_original_photo: true, verified_zhuwan_identity: false, backed_up_photo: false, understood_dead_call: false },
    deductionScore: 2,
  }) === "ending_b",
  "B ending scenario failed"
);
assert(
  resolveEnding({
    clues: ["clue_dead_call"],
    flags: { deleted_evidence: true, backed_up_photo: false },
    deductionScore: 1,
  }) === "ending_c",
  "C ending scenario failed"
);
assert(
  resolveEnding({
    clues: ["clue_dead_call", "clue_gray_loan"],
    flags: { backed_up_photo: false, chose_reopen_case: false },
    deductionScore: 2,
  }) === "ending_d",
  "D ending scenario failed"
);

const forbidden = [
  "????",
  "?????",
  "??????",
  "未知线索",
  "？？？？？",
  "?????????",
  "\uFFFD",
  "迷雾剧本馆",
  "剧本馆",
  "x/15",
  "10 条核心线索",
  "12 章中短篇",
  "锛",
  "绾跨储",
  "鐪熺浉",
  "鍛借繍",
  "浜虹敓",
];
for (const text of forbidden) {
  assert(!allText.includes(text), `forbidden text found: ${text}`);
}

if (failures.length) {
  console.error("Story data validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("Story data validation warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("Story data validation passed.");
console.log(`chapters=${DATA.chapters.length}, clues=${clueIds.size}, nodes=${nodeIds.size}, coreClues=${coreClueIds.length}`);
