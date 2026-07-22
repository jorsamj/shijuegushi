import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const storyDir = path.join(root, "assets", "stories", "dormitory-namefloor");
const canonicalPath = path.join(storyDir, "story-data.js");
const failures = [];
const seenFailures = new Set();

const narratorSpeakers = new Set(["旁白", "narrator", "Narrator", "??"]);
const audibleTypes = new Set(["dialogue", "door-voice", "broadcast", "recording", "phone-call", "world-audio"]);
const phoneTypes = new Set(["phone-text", "phone-ui", "phone-message"]);
const silentTypes = new Set(["narration", "system", "ui"]);
const visibleKeys = new Set([
  "title", "summary", "text", "spokenText", "displayText", "speaker", "label", "name", "sender",
  "description", "systemNotice", "ctaLabel", "body", "subtitle",
]);
const identityKeys = new Set(["visualCharacter", "characterId", "actorId", "voiceCharacter", "character"]);
const identityNames = ["林峰", "周朝阳", "谷雨", "宋明", "吴阿姨", "红色马甲宿管", "绿色马甲宿管"];
const legacyTokens = ["许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁", "女生宿舍", "417", "415", "419", "dormitory-rollcall", "script_dormitory_rollcall"];
const internalVisiblePatterns = [
  /\b(?:nodeId|chapterId|scriptId|roleId|contentType|basic-credible|rule-state)\b/i,
  /\b(?:unverified|verified|ambiguous|temporary|warning|vertical-slice|blueprint-only|phone-interaction|chapter-ending|door-voice)\b/i,
  /\b(?:nf\d+[_-]\d+|namefloor_[a-z0-9_-]+|script_[a-z0-9_-]+|series_[a-z0-9_-]+)\b/i,
  /\b(?:isBlackAvatar|isGlitched|nextNodeId|setFlags|relationshipEffects)\b/i,
];
const fragmentPatterns = [
  /^(?:他|她|它)(?:说|问)(?:了)?[。！？!?…]*$/,
  /^门响了[。！？!?…]*$/,
  /^手机震动[。！？!?…]*$/,
  /^声音响起[。！？!?…]*$/,
  /^有人(?:说|问)[了：:：]?[。！？!?…]*$/,
];

function fail(kind, source, nodeId, message) {
  const label = nodeId ? `${source}#${nodeId}` : source;
  const key = `${kind}|${label}|${message}`;
  if (seenFailures.has(key)) return;
  seenFailures.add(key);
  failures.push({ kind, label, message });
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hasText(value) {
  return typeof value === "string" && normalize(value).length > 0;
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function isStoryPackage(value) {
  return isObject(value) && isObject(value.nodes) && (isObject(value.script) || Array.isArray(value.chapters) || isObject(value.chapters));
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function findExpansionFiles() {
  if (!fs.existsSync(storyDir)) return [];
  const found = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(filePath);
      } else if (/\.(?:js|mjs)$/i.test(entry.name)
        && filePath !== canonicalPath
        && /(?:expansion|chapters?-\d)/i.test(entry.name)) {
        found.push(filePath);
      }
    }
  };
  visit(storyDir);
  return found.sort();
}

function loadPackages(filePath, required) {
  if (!fs.existsSync(filePath)) {
    if (required) fail("runtime", relative(filePath), null, "canonical runtime file is missing");
    return [];
  }

  const source = fs.readFileSync(filePath, "utf8");
  if (/\\u(?:\{[0-9a-f]+\}|[0-9a-f]{4})/i.test(source)) {
    fail("encoding", relative(filePath), null, "runtime source contains a Unicode escape");
  }

  const window = {};
  try {
    vm.runInNewContext(source, { window, console }, { filename: filePath });
  } catch (error) {
    fail("runtime", relative(filePath), null, `could not load runtime: ${error.message}`);
    return [];
  }

  const packages = Object.entries(window)
    .filter(([, value]) => isStoryPackage(value))
    .map(([globalName, value]) => ({ filePath, globalName, data: value }));
  if (required && !packages.length) fail("runtime", relative(filePath), null, "canonical runtime exposes no story package");
  if (!required && !packages.length) fail("runtime", relative(filePath), null, "expansion file exposes no story package");
  return packages;
}

function explicitAudioSource(node) {
  const candidates = [
    node.audioSource,
    node.worldAudioSource,
    node.voiceSource,
    node.audio?.source,
    node.voice?.source,
  ];
  return candidates.find((value) => hasText(value) || isObject(value)) ?? null;
}

function collectVisibleStrings(value, location, nodeId, output = []) {
  if (typeof value === "string") {
    const key = location.at(-1);
    if (visibleKeys.has(key)) output.push({ value, path: location.join(".") });
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectVisibleStrings(item, [...location, String(index)], nodeId, output));
    return output;
  }
  if (!isObject(value)) return output;
  for (const [key, item] of Object.entries(value)) {
    collectVisibleStrings(item, [...location, key], nodeId, output);
  }
  return output;
}

function collectAllStrings(value, location = [], output = []) {
  if (typeof value === "string") {
    output.push({ value, path: location.join(".") });
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectAllStrings(item, [...location, String(index)], output));
    return output;
  }
  if (!isObject(value)) return output;
  for (const [key, item] of Object.entries(value)) collectAllStrings(item, [...location, key], output);
  return output;
}

function containsIdentityKey(value) {
  if (Array.isArray(value)) return value.some(containsIdentityKey);
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, item]) => identityKeys.has(key) || containsIdentityKey(item));
}

function hasDanglingLink(nodes, target) {
  return !hasText(target) || !Object.hasOwn(nodes, target);
}

function checkLinks(source, data) {
  const nodes = data.nodes || {};
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (node.nextNodeId && hasDanglingLink(nodes, node.nextNodeId)) {
      fail("structure", source, nodeId, `nextNodeId points to missing node ${String(node.nextNodeId)}`);
    }
    for (const choice of node.choices || []) {
      if (choice.nextNodeId && hasDanglingLink(nodes, choice.nextNodeId)) {
        fail("structure", source, nodeId, `${choice.choiceId || "choice"} points to missing node ${String(choice.nextNodeId)}`);
      }
    }
    for (const action of node.phoneScreen?.actions || []) {
      if (action.nextNodeId && hasDanglingLink(nodes, action.nextNodeId)) {
        fail("structure", source, nodeId, `${action.actionId || "phone action"} points to missing node ${String(action.nextNodeId)}`);
      }
    }
  }
}

function reachableNodes(data) {
  const nodes = data.nodes || {};
  const seen = new Set();
  const pending = [data.script?.startNodeId];
  while (pending.length) {
    const nodeId = pending.pop();
    if (!nodeId || seen.has(nodeId) || !nodes[nodeId]) continue;
    seen.add(nodeId);
    const node = nodes[nodeId];
    if (node.nextNodeId) pending.push(node.nextNodeId);
    for (const choice of node.choices || []) pending.push(choice.nextNodeId);
    for (const action of node.phoneScreen?.actions || []) pending.push(action.nextNodeId);
  }
  return seen;
}

function checkVisibleCopy(source, nodeId, value, valuePath) {
  const normalized = normalize(value);
  if (!normalized) return;
  if (/[A-Za-z]{2,}/.test(normalized) && !/^[0-9]+G$/.test(normalized)) {
    fail("copy", source, nodeId, `player-facing field ${valuePath} contains an English token: ${normalized}`);
  }
  for (const pattern of internalVisiblePatterns) {
    if (pattern.test(normalized)) {
      fail("copy", source, nodeId, `player-facing field ${valuePath} exposes an internal ID or enum: ${normalized}`);
      break;
    }
  }
}

function checkNode(source, data, nodeId, node, nodeOrder) {
  const label = `${source}#${nodeId}`;
  const narrator = narratorSpeakers.has(node.speaker);
  const hasPhone = Boolean(node.phoneScreen) || node.type === "phone-interaction" || phoneTypes.has(node.contentType);
  const isPhoneTextNode = node.type === "phone-interaction" || phoneTypes.has(node.contentType);
  const isChoice = node.type === "choice" || node.type === "deduction" || Array.isArray(node.choices);
  const contentType = node.contentType;

  if (!hasText(contentType)) {
    fail("structure", source, nodeId, "node must declare an explicit contentType");
  }

  if (isChoice && narrator && contentType !== "system" && !phoneTypes.has(contentType)) {
    fail("separation", source, nodeId, "choice/deduction content must be silent system content");
  }

  if (narrator) {
    if (isPhoneTextNode && !phoneTypes.has(contentType) && contentType !== "system") {
      fail("separation", source, nodeId, "phone UI text must use phone-text/phone-ui or system content");
    } else if (!hasPhone && !isChoice && node.type !== "chapter-ending" && contentType !== "narration") {
      fail("separation", source, nodeId, "narrator content must be classified as silent narration");
    }
    if (node.voiceEnabled !== false) fail("audio", source, nodeId, "narration/system content must set voiceEnabled=false");
    if (node.spokenText) fail("separation", source, nodeId, "narration cannot carry spokenText");
    if (explicitAudioSource(node)) fail("audio", source, nodeId, "silent narration cannot declare a voice source");
    if (/[“”「」]/.test(node.text || "") && /(?:说|问|喊|回答|重复|叫道)[：:]?[“「]/.test(node.text || "")) {
      fail("heuristic", source, nodeId, "narration appears to embed spoken dialogue; move spoken text to a named dialogue node");
    }
  } else if (hasText(node.speaker)) {
    if (!audibleTypes.has(contentType)) {
      fail("separation", source, nodeId, "named speaker must use an audible dialogue or world-voice contentType");
    } else {
      if (!hasText(node.spokenText)) fail("separation", source, nodeId, "named dialogue must provide spokenText");
      if (hasText(node.spokenText) && normalize(node.text) !== normalize(node.spokenText)) {
        fail("separation", source, nodeId, "displayed dialogue text must exactly match spokenText");
      }
      if (node.voiceEnabled !== true) fail("audio", source, nodeId, "named dialogue must set voiceEnabled=true");
      if (!explicitAudioSource(node)) fail("audio", source, nodeId, "world audio source must be explicit");
      if (/[“”「」]|[\r\n]|[（(].+[）)]/.test(node.text || "")) {
        fail("heuristic", source, nodeId, "named dialogue appears to contain narration or stage direction");
      }
    }
  }

  if (phoneTypes.has(contentType)) {
    if (!node.phoneScreen) fail("separation", source, nodeId, "phone text must remain inside phoneScreen UI");
    if (node.voiceEnabled !== false) fail("audio", source, nodeId, "phone UI text must be silent");
    if (node.spokenText) fail("separation", source, nodeId, "phone UI text cannot carry spokenText");
    if (explicitAudioSource(node)) fail("audio", source, nodeId, "phone UI text cannot declare a voice source");
  }

  if (audibleTypes.has(contentType) && node.phoneScreen) {
    fail("separation", source, nodeId, "audible dialogue cannot place its player-facing text in phoneScreen UI");
  }

  if (contentType === "door-voice") {
    const unknownVoice = narratorSpeakers.has(node.speaker) || !hasText(node.speaker) || /门外|未知|unknown/i.test(String(node.speaker));
    if (unknownVoice && node.identityReveal !== true) {
      if (containsIdentityKey(node)) fail("identity", source, nodeId, "early unknown door voice carries character identity metadata");
    }
  }

  for (const cue of node.sfxOnEnter || []) {
    if (!hasText(cue.key) && !hasText(cue.source) && !hasText(cue.audioSource)) {
      fail("audio", source, nodeId, "world audio cue must declare an explicit source key");
    }
  }

  for (const entry of collectVisibleStrings(node, ["node"], nodeId)) checkVisibleCopy(source, nodeId, entry.value, entry.path);
  for (const pattern of fragmentPatterns) {
    if (pattern.test(normalize(node.text))) {
      fail("heuristic", source, nodeId, "player-facing text is a meaningless fragment");
    }
  }
  if (node.nodeId !== nodeId) fail("structure", source, nodeId, "nodeId does not match its nodes object key");
  if (nodeOrder === 0 && data.script?.startNodeId && data.script.startNodeId !== nodeId) {
    fail("structure", source, nodeId, "first node is not the declared startNodeId");
  }
}

function checkPackage(packageEntry, isCanonical) {
  const { data } = packageEntry;
  const source = `${relative(packageEntry.filePath)}:${packageEntry.globalName}`;
  const nodes = data.nodes || {};
  const nodeList = Object.entries(nodes);

  if (isCanonical) {
    if (data.script?.scriptId !== "script_dormitory_namefloor") fail("runtime", source, null, "canonical package has the wrong scriptId");
    if (data.series?.seriesId !== "series_dormitory_namefloor") fail("runtime", source, null, "canonical package has the wrong seriesId");
  }

  checkLinks(source, data);
  const reachable = reachableNodes(data);
  if (hasText(data.script?.startNodeId) && reachable.size !== nodeList.length) {
    for (const [nodeId] of nodeList) {
      if (!reachable.has(nodeId)) fail("structure", source, nodeId, "node is not reachable from the runtime start node");
    }
  }

  nodeList.forEach(([nodeId, node], index) => checkNode(source, data, nodeId, node, index));

  for (const entry of collectVisibleStrings(data.chapters || [], ["chapters"])) checkVisibleCopy(source, null, entry.value, entry.path);
  for (const entry of collectVisibleStrings(data.rules || [], ["rules"])) checkVisibleCopy(source, null, entry.value, entry.path);
  for (const entry of collectVisibleStrings(data.script || {}, ["script"])) checkVisibleCopy(source, null, entry.value, entry.path);
  for (const entry of collectVisibleStrings(data.series || {}, ["series"])) checkVisibleCopy(source, null, entry.value, entry.path);

  const allStrings = collectAllStrings(data);
  for (const { value, path: valuePath } of allStrings) {
    const legacy = legacyTokens.find((token) => value.includes(token));
    if (legacy) fail("legacy", source, null, `runtime data contains legacy female-dormitory token ${legacy} at ${valuePath}`);
  }
}

const expansionFiles = findExpansionFiles();
const packageEntries = [
  ...loadPackages(canonicalPath, true),
  ...expansionFiles.flatMap((filePath) => loadPackages(filePath, false)),
];

if (!packageEntries.length) {
  fail("runtime", relative(canonicalPath), null, "no canonical runtime package was loaded");
}

const canonicalPackages = packageEntries.filter((entry) => entry.filePath === canonicalPath);
if (canonicalPackages.length > 1) {
  fail("runtime", relative(canonicalPath), null, "canonical runtime exposes more than one story package");
}

for (const entry of packageEntries) checkPackage(entry, entry.filePath === canonicalPath);

const grouped = new Map();
for (const failure of failures) {
  if (!grouped.has(failure.kind)) grouped.set(failure.kind, []);
  grouped.get(failure.kind).push(failure);
}

console.log(`Dormitory name-floor content purity audit: ${failures.length} finding(s).`);
console.log(`runtimePackages=${packageEntries.length}; expansionFiles=${expansionFiles.length}`);
for (const [kind, items] of grouped) {
  console.log(`\n[${kind}]`);
  for (const item of items) console.log(`- ${item.label}: ${item.message}`);
}

if (failures.length) process.exitCode = 1;
