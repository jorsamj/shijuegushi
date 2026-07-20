import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const dataPath = path.join(root, "assets", "stories", "dormitory-namefloor", "story-data.js");
const mapPath = path.join(root, "assets", "stories", "dormitory-namefloor", "story-asset-map.js");
const indexPath = path.join(root, "index.html");
const enginePath = path.join(root, "script.js");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function loadBrowserGlobal(filePath, globalName) {
  if (!fs.existsSync(filePath)) return null;
  const window = {};
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), { window, console }, { filename: filePath });
  return window[globalName] || null;
}

const data = loadBrowserGlobal(dataPath, "MIST_DORMITORY_NAMEFLOOR_DATA");
const assetMap = loadBrowserGlobal(mapPath, "DORMITORY_NAMEFLOOR_ASSET_MAP");
const index = fs.readFileSync(indexPath, "utf8");
const engine = fs.readFileSync(enginePath, "utf8");

assert(Boolean(data), "New canonical dormitory data is missing.");
assert(Boolean(assetMap), "New canonical dormitory visual map is missing.");

if (data) {
  const nodes = data.nodes || {};
  const nodeList = Object.values(nodes);
  const serialized = JSON.stringify(data);
  const legacyTokens = ["许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁", "417", "四楼夜间互助群"];
  const internalTokens = ["basic-credible", "internal state", "rule-state"];
  const reachable = new Set();
  const stack = [data.script?.startNodeId];

  while (stack.length) {
    const nodeId = stack.pop();
    if (!nodeId || reachable.has(nodeId) || !nodes[nodeId]) continue;
    reachable.add(nodeId);
    const node = nodes[nodeId];
    if (node.nextNodeId) stack.push(node.nextNodeId);
    for (const choice of node.choices || []) if (choice.nextNodeId) stack.push(choice.nextNodeId);
    for (const action of node.phoneScreen?.actions || []) if (action.nextNodeId) stack.push(action.nextNodeId);
  }

  assert(data.script?.scriptId === "script_dormitory_namefloor", "Canonical story must use an isolated script id.");
  assert(data.series?.seriesId === "series_dormitory_namefloor", "Canonical story must use an isolated series id.");
  assert(data.script?.title === "宿舍规则怪谈", "Canonical visible title is incorrect.");
  assert((data.chapters || []).length === 7, "Blueprint runtime metadata must declare seven chapters.");
  assert((data.rules || []).length === 8, "The first group post must expose all eight student rules.");
  assert(nodeList.every((node) => node.chapterId === "namefloor_chapter_01"), "Only chapter one may be playable in this vertical slice.");
  assert(reachable.size === nodeList.length, `All chapter-one nodes must be reachable (${reachable.size}/${nodeList.length}).`);

  const choiceNodes = nodeList.filter((node) => Array.isArray(node.choices) && node.choices.length > 1);
  const timedNodes = choiceNodes.filter((node) => Number(node.timedChoice?.durationMs) > 0 && node.timedChoice?.fallbackChoiceId);
  const phoneNodes = nodeList.filter((node) => Array.isArray(node.phoneScreen?.actions) && node.phoneScreen.actions.length > 0);
  const ruleViews = nodeList.filter((node) => node.phoneScreen?.view === "rules" || node.ruleReview === true);
  const effects = nodeList.flatMap((node) => node.effects || []);

  assert(choiceNodes.length >= 8, `Chapter one needs at least 8 effective choices; found ${choiceNodes.length}.`);
  assert(timedNodes.length >= 2, `Chapter one needs at least 2 timed choices; found ${timedNodes.length}.`);
  assert(phoneNodes.length >= 2, `Chapter one needs at least 2 interactive phone screens; found ${phoneNodes.length}.`);
  assert(ruleViews.length >= 2, `Chapter one needs at least 2 rule views/comparisons; found ${ruleViews.length}.`);
  assert(effects.some((effect) => ["heavy", "severe"].includes(effect.level)), "Chapter one needs a strong horror performance cue.");
  assert(nodeList.some((node) => node.phoneScreen?.members?.some((member) => member.isBlackAvatar)), "The black avatar must be represented in the phone UI.");
  assert(nodeList.some((node) => node.identityDisplay?.includes("林?")), "The first visible name-pollution beat is missing.");
  assert(nodeList.some((node) => node.type === "chapter-ending"), "The sample must end with a chapter ending, not a formal ending.");

  for (const node of nodeList) {
    if (node.nextNodeId) assert(Boolean(nodes[node.nextNodeId]), `${node.nodeId} points to missing node ${node.nextNodeId}.`);
    for (const choice of node.choices || []) {
      assert(Boolean(nodes[choice.nextNodeId]), `${node.nodeId}/${choice.choiceId} points to a missing node.`);
    }
    for (const action of node.phoneScreen?.actions || []) {
      assert(Boolean(nodes[action.nextNodeId]), `${node.nodeId}/${action.actionId} points to a missing phone-action node.`);
    }
    if (node.speaker === "旁白") assert(node.voiceEnabled !== true, `${node.nodeId} must keep narration silent.`);
  }

  for (const token of legacyTokens) assert(!serialized.includes(token), `Canonical slice contains legacy token: ${token}`);
  const visibleCopy = nodeList.flatMap((node) => [
    node.text,
    node.speaker,
    ...(node.choices || []).map((item) => item.text),
    ...(node.phoneScreen?.actions || []).map((item) => item.label),
    ...(node.phoneScreen?.messages || []).flatMap((item) => [item.sender, item.text]),
    node.phoneScreen?.systemNotice,
  ]).filter(Boolean).join("\n");
  for (const token of internalTokens) assert(!visibleCopy.includes(token), `Player data exposes internal token: ${token}`);
}

if (assetMap) {
  const serialized = JSON.stringify(assetMap);
  assert(!serialized.includes("dormitory-rollcall"), "Canonical map must not reference Legacy asset paths.");
  assert(!/\.(wav|mp3|ogg)(\?|\")/i.test(serialized), "The vertical slice must not introduce generated/formal voice files.");
}

assert(index.includes("assets/stories/dormitory-namefloor/story-data.js"), "index.html does not load the canonical story data.");
assert(index.includes("assets/stories/dormitory-namefloor/story-asset-map.js"), "index.html does not load the canonical visual map.");
assert(engine.includes("script_dormitory_namefloor"), "The shared engine does not register the canonical story.");
assert(engine.includes("timedChoice"), "The shared engine lacks timed-choice support.");
assert(engine.includes("phoneScreen.actions"), "The shared engine lacks interactive phone actions.");
assert(engine.includes("data-phone-continue"), "Read-only phone beats need an in-phone continue control.");
assert(engine.includes("dorm-phone-choice-actions"), "Phone-based rule choices must remain operable inside the phone layer.");
assert(engine.includes('"signal-glitch"'), "The chapter-one signal-glitch effect is not registered by the runtime.");

if (failures.length) {
  console.error("Dormitory name-floor vertical slice check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory name-floor vertical slice check passed.");
console.log(`nodes=${Object.keys(data.nodes).length}; choices=${Object.values(data.nodes).filter((node) => (node.choices || []).length > 1).length}; timed=${Object.values(data.nodes).filter((node) => node.timedChoice).length}`);
