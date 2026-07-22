import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const dataPath = path.join(root, "assets", "stories", "dormitory-namefloor", "story-data.js");
const expansionCandidates = [
  path.join(root, "assets", "stories", "dormitory-namefloor", "story-chapters-2-7.js"),
  path.join(root, "assets", "stories", "dormitory-namefloor", "story-chapters-2-7-expansion.js"),
];
const blueprintPath = path.join(root, "docs", "DORMITORY_RUNTIME_BLUEPRINT.md");
const failures = [];
const notes = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadStoryData() {
  assert(fs.existsSync(dataPath), "Missing canonical Chapter 1 data: assets/stories/dormitory-namefloor/story-data.js.");
  if (!fs.existsSync(dataPath)) return { data: null, expansionPath: null };

  const window = {};
  const context = { window, console };
  vm.createContext(context);
  vm.runInContext(readUtf8(dataPath), context, { filename: dataPath });
  const baseData = window.MIST_DORMITORY_NAMEFLOOR_DATA;

  const expansionPath = expansionCandidates.find((candidate) => fs.existsSync(candidate)) || null;
  if (!expansionPath) {
    failures.push(
      "Missing Chapters 2-7 expansion. Add assets/stories/dormitory-namefloor/story-chapters-2-7.js "
      + "and expose MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7, MIST_DORMITORY_NAMEFLOOR_EXPANSION, or an updated MIST_DORMITORY_NAMEFLOOR_DATA.",
    );
    return { data: baseData, expansionPath: null };
  }

  vm.runInContext(readUtf8(expansionPath), context, { filename: expansionPath });
  const runtimeData = window.MIST_DORMITORY_NAMEFLOOR_DATA || baseData;
  const expansion = window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7
    || window.MIST_DORMITORY_NAMEFLOOR_EXPANSION
    || window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_TO_7;
  return { data: mergeExpansion(runtimeData, expansion), expansionPath };
}

function mergeById(base = [], addition = [], idKey) {
  const result = [];
  const indexById = new Map();
  for (const item of [...base, ...addition]) {
    const id = item?.[idKey];
    if (id && indexById.has(id)) result[indexById.get(id)] = item;
    else {
      if (id) indexById.set(id, result.length);
      result.push(item);
    }
  }
  return result;
}

function mergeExpansion(data, expansion) {
  if (!data || !expansion || expansion === data) return data;
  return {
    ...data,
    ...expansion,
    nodes: { ...(data.nodes || {}), ...(expansion.nodes || {}) },
    chapters: mergeById(data.chapters, expansion.chapters, "chapterId"),
    rules: expansion.rules || data.rules,
    managerRules: expansion.managerRules || data.managerRules,
    endings: { ...(data.endings || {}), ...(expansion.endings || {}) },
    endingPreconditions: { ...(data.endingPreconditions || {}), ...(expansion.endingPreconditions || {}) },
    routePlans: { ...(data.routePlans || {}), ...(expansion.routePlans || {}) },
  };
}

function choicesFor(node) {
  return [
    ...(node?.choices || []),
    ...(node?.question?.choices || []),
    ...(node?.phoneScreen?.actions || []),
  ];
}

function nodeReferences(node) {
  const references = [];
  const visit = (value, trail = "node") => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const childTrail = `${trail}.${key}`;
      if (typeof child === "string" && /(?:next|target|timeout|fallback|entry|start)NodeId$/i.test(key)) {
        references.push({ id: child, trail: childTrail });
      } else if (child && typeof child === "object") visit(child, childTrail);
    }
  };
  visit(node);
  return references;
}

function visibleStrings(value, trail = "data", result = []) {
  const visibleKeys = new Set([
    "speaker", "text", "title", "label", "body", "content", "description", "name",
    "sender", "systemnotice", "identitydisplay", "finalline", "ctalabel", "placeholder",
  ]);
  const visit = (item, currentTrail) => {
    if (Array.isArray(item)) {
      item.forEach((entry, index) => visit(entry, `${currentTrail}[${index}]`));
      return;
    }
    if (!item || typeof item !== "object") return;
    for (const [key, child] of Object.entries(item)) {
      const childTrail = `${currentTrail}.${key}`;
      if (typeof child === "string" && visibleKeys.has(key.toLowerCase())) result.push({ trail: childTrail, value: child });
      else if (child && typeof child === "object") visit(child, childTrail);
    }
  };
  visit(value, trail);
  return result;
}

function collectStrings(value, result = []) {
  if (typeof value === "string") result.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectStrings(entry, result));
  else if (value && typeof value === "object") Object.values(value).forEach((entry) => collectStrings(entry, result));
  return result;
}

function findRuleSet(data, names) {
  for (const name of names) {
    const direct = data?.[name];
    if (Array.isArray(direct)) return direct;
    const nested = data?.ruleSets?.[name] || data?.manager?.[name] || data?.rules?.[name];
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function canonicalEndingId(value) {
  const match = String(value || "").match(/^E0?([1-8])$/i);
  return match ? `E${match[1]}` : null;
}

function collectBlueprintSceneIds(value, result = new Set()) {
  for (const text of collectStrings(value)) {
    for (const match of text.matchAll(/\bDR-C[1-7]-S\d{2}\b/g)) result.add(match[0]);
  }
  return result;
}

function hasStateMutation(choice) {
  return Object.keys(choice || {}).some((key) => /(?:set|clear|gain|lose|update|effect|state|flag|clue|relationship|rule)/i.test(key));
}

function meaningfulDecisionPoints(nodes) {
  const points = [];
  for (const node of Object.values(nodes)) {
    const choices = choicesFor(node);
    const signatures = new Set(choices.map((choice) => JSON.stringify({
      next: choice.nextNodeId,
      text: choice.text || choice.label,
      mutation: hasStateMutation(choice),
    })));
    if (choices.length >= 2 && signatures.size >= 2) {
      points.push({ node, choices, meaningful: choices.some(hasStateMutation) || new Set(choices.map((choice) => choice.nextNodeId)).size > 1 });
    }
  }
  return points.filter((point) => point.meaningful);
}

function stageNumbers(value, result = new Set(), parentKey = "") {
  if (!value || typeof value !== "object") return result;
  if (Array.isArray(value)) {
    value.forEach((item) => stageNumbers(item, result, parentKey));
    return result;
  }
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "number" && ((/(?:name|pollution).*stage|stage.*(?:name|pollution)/i.test(key)) || (key === "stage" && /name|pollution/i.test(parentKey))) && item >= 1 && item <= 9) result.add(item);
    if (/^(?:stage[_-]?)?([1-9])$/i.test(key) && /name|pollution/i.test(parentKey)) result.add(Number(key.match(/([1-9])$/)[1]));
    if (typeof item === "string") {
      for (const match of `${key}:${item}`.matchAll(/(?:name|pollution)[_-]?stage[_-]?([1-9])|第([1-9])阶段/gi)) {
        result.add(Number(match[1] || match[2]));
      }
    }
    if (item && typeof item === "object") stageNumbers(item, result, key);
  }
  return result;
}

function chapterNumbersFor(nodes, pattern) {
  const chapters = new Set();
  for (const node of Object.values(nodes)) {
    if (pattern.test(JSON.stringify(node))) {
      const match = String(node.chapterId || "").match(/(\d{2})$/);
      if (match) chapters.add(Number(match[1]));
    }
  }
  return chapters;
}

function allObjectKeys(value, result = []) {
  if (Array.isArray(value)) value.forEach((entry) => allObjectKeys(entry, result));
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      result.push(key);
      allObjectKeys(entry, result);
    }
  }
  return result;
}

function apply(state, source) {
  if (!source) return;
  for (const clueId of source.gainClues || []) if (!state.clues.includes(clueId)) state.clues.push(clueId);
  for (const clueId of source.loseClues || []) state.clues = state.clues.filter((entry) => entry !== clueId);
  for (const flagId of source.setFlags || []) state.flags[flagId] = true;
  for (const flagId of source.clearFlags || []) delete state.flags[flagId];
  for (const effect of source.relationshipEffects || []) {
    state.relationships[effect.id] = (state.relationships[effect.id] || 0) + Number(effect.delta || 0);
  }
  for (const update of source.stateUpdates || []) {
    if (update?.key) state[update.key] = update.value;
  }
  if (source.setState && typeof source.setState === "object") Object.assign(state, source.setState);
}

function routeState(data, plan) {
  const base = data.defaultState || data.defaultStoryState || data.initialState || {};
  const state = JSON.parse(JSON.stringify(base));
  Object.assign(state, plan.state || plan.initialState || {});
  state.clues = [...(state.clues || [])];
  state.flags = { ...(data.defaultFlags || {}), ...(state.flags || {}) };
  state.relationships = { ...(state.relationships || {}) };
  let nodeId = plan.startNodeId || data.script?.startNodeId;
  const visited = [];
  const seen = new Set();

  for (let step = 0; step < 800; step += 1) {
    const node = data.nodes?.[nodeId];
    if (!node) return { error: `references missing node ${nodeId}`, state, visited };
    if (seen.has(nodeId)) return { error: `loops at ${nodeId}`, state, visited };
    seen.add(nodeId);
    visited.push(nodeId);
    apply(state, node);
    const choices = choicesFor(node);
    if (choices.length) {
      const requested = plan.choices?.[nodeId] || plan.actions?.[nodeId];
      const choice = choices.find((item) => item.choiceId === requested || item.actionId === requested);
      if (!choice) return { error: `has no declared action for ${nodeId}`, state, visited };
      apply(state, choice);
      nodeId = choice.nextNodeId || node.nextNodeId;
      continue;
    }
    if (node.endingId) return { endingId: canonicalEndingId(node.endingId), state, visited };
    if (node.resolveEnding === true) {
      const resolved = data.profile?.endingResolver?.(state);
      return { endingId: canonicalEndingId(resolved), state, visited };
    }
    if (!node.nextNodeId) return { error: `ends at non-ending node ${node.nodeId}`, state, visited };
    nodeId = node.nextNodeId;
  }
  return { error: "exceeded 800 traversal steps", state, visited };
}

function stronglyConnectedComponents(nodes, edges) {
  const indexById = new Map();
  const lowLink = new Map();
  const stack = [];
  const onStack = new Set();
  const components = [];
  let index = 0;
  const visit = (nodeId) => {
    indexById.set(nodeId, index);
    lowLink.set(nodeId, index);
    index += 1;
    stack.push(nodeId);
    onStack.add(nodeId);
    for (const nextNodeId of edges.get(nodeId) || []) {
      if (!indexById.has(nextNodeId)) {
        visit(nextNodeId);
        lowLink.set(nodeId, Math.min(lowLink.get(nodeId), lowLink.get(nextNodeId)));
      } else if (onStack.has(nextNodeId)) lowLink.set(nodeId, Math.min(lowLink.get(nodeId), indexById.get(nextNodeId)));
    }
    if (lowLink.get(nodeId) === indexById.get(nodeId)) {
      const component = [];
      let member;
      do {
        member = stack.pop();
        onStack.delete(member);
        component.push(member);
      } while (member !== nodeId);
      components.push(component);
    }
  };
  Object.keys(nodes).forEach((nodeId) => { if (!indexById.has(nodeId)) visit(nodeId); });
  return components;
}

const { data, expansionPath } = loadStoryData();
if (data) {
  const nodes = data.nodes || {};
  const nodeList = Object.values(nodes);
  const serialized = JSON.stringify(data);
  const chapterIds = new Set((data.chapters || []).map((chapter) => chapter.chapterId));
  const expectedChapterIds = Array.from({ length: 7 }, (_, index) => `namefloor_chapter_${String(index + 1).padStart(2, "0")}`);
  const expectedScenes = fs.existsSync(blueprintPath)
    ? [...readUtf8(blueprintPath).matchAll(/^###\s+(DR-C\d-S\d+)/gm)].map((match) => match[1])
    : [];

  assert(data.script?.scriptId === "script_dormitory_namefloor", "Full runtime must retain isolated script id script_dormitory_namefloor.");
  assert(data.script?.startNodeId && nodes[data.script.startNodeId], "The full runtime startNodeId must reference an existing node.");
  assert((data.chapters || []).length === 7, `Expected exactly 7 chapters; found ${(data.chapters || []).length}.`);
  for (const chapterId of expectedChapterIds) {
    assert(chapterIds.has(chapterId), `Missing canonical chapter metadata: ${chapterId}.`);
    assert(nodeList.some((node) => node.chapterId === chapterId), `No playable runtime node belongs to ${chapterId}.`);
  }
  assert(Boolean(expansionPath), "Chapters 2-7 cannot be certified while the expansion file is absent.");

  const representedScenes = collectBlueprintSceneIds({ nodes, blueprintSceneMap: data.blueprintSceneMap, sceneMap: data.sceneMap });
  const missingScenes = expectedScenes.filter((sceneId) => !representedScenes.has(sceneId));
  assert(expectedScenes.length === 48, `Blueprint parsing expected 48 scenes; found ${expectedScenes.length}.`);
  assert(!missingScenes.length, `Blueprint scenes are not represented by runtime node blueprintSceneId/scene map: ${missingScenes.join(", ")}.`);

  const decisionPoints = meaningfulDecisionPoints(nodes);
  const meaningfulOptions = decisionPoints.reduce((count, point) => count + point.choices.length, 0);
  assert(decisionPoints.length >= 55, `Expected at least 55 meaningful decision points; found ${decisionPoints.length} (${meaningfulOptions} selectable options).`);
  const timedPoints = decisionPoints.filter(({ node, choices }) => node.timedChoice?.durationMs > 0 || node.timed?.durationMs > 0 || choices.some((choice) => choice.timedChoice?.durationMs > 0 || choice.timed?.durationMs > 0));
  assert(timedPoints.length >= 17, `Expected at least 17 timed decisions; found ${timedPoints.length}.`);

  const committedStages = stageNumbers(data);
  const stageNodes = new Map();
  for (const node of nodeList) for (const stage of stageNumbers(node)) {
    if (!stageNodes.has(stage)) stageNodes.set(stage, []);
    stageNodes.get(stage).push(node);
  }
  for (let stage = 1; stage <= 9; stage += 1) {
    const matches = stageNodes.get(stage) || [];
    const hasVisibleCarrier = matches.some((node) => visibleStrings(node).some(({ value }) => String(value).trim().length > 0));
    assert(committedStages.has(stage) && hasVisibleCarrier, `Name-pollution stage ${stage} needs a committed runtime state and a player-visible carrier, not only an internal number.`);
  }

  const studentRules = data.rules || [];
  const managerRules = findRuleSet(data, ["managerRules", "dormManagerRules", "manager", "dormManager"]);
  const studentRuleText = collectStrings(studentRules).join("\n");
  const managerRuleText = collectStrings(managerRules).join("\n");
  assert(studentRules.length === 8, `Expected exactly 8 student rules; found ${studentRules.length}.`);
  assert(managerRules.length === 7, `Expected exactly 7 dorm-manager rules; found ${managerRules.length}.`);
  for (const text of ["十二点以后不准在寝室外逗留", "宿管宿舍一定在三楼", "我校宿舍楼没有四楼", "请不要给任何人开门", "我校宿管查房时间为一点至三点", "宿管阿姨穿绿色马甲", "三点可以进食", "再次重申"]) {
    assert(studentRuleText.includes(text), `Student-rule payload is missing canonical text: ${text}.`);
  }
  for (const text of ["每天一点至三点是查房时间", "如遇在外逗留的学生", "左侧抽屉里的羽毛", "一律身着绿色马甲", "宿舍楼没有四楼", "窗外只能看到天空", "学生名单突然消失"]) {
    assert(managerRuleText.includes(text), `Dorm-manager rule payload is missing canonical text: ${text}.`);
  }

  const blackAvatarNodes = nodeList.filter((node) => JSON.stringify(node).includes("isBlackAvatar"));
  const blackAvatarCountIsStable = blackAvatarNodes.some((node) => node.phoneScreen?.memberCount === 42);
  const endingEight = Object.entries(data.endings || {}).find(([id]) => canonicalEndingId(id) === "E8")?.[1];
  assert(blackAvatarNodes.length > 0, "Black avatar must appear in the playable phone/group runtime data.");
  assert(blackAvatarCountIsStable, "Black-avatar group UI must keep the canonical unchanged memberCount of 42.");
  assert(/黑色头像/.test(serialized) && /林峰/.test(JSON.stringify(endingEight || {})) && /(?:第九阶段|nameStage.?9|姓名彻底消失)/.test(serialized), "Black-avatar truth must resolve to the name-lost Lin Feng at stage 9.");

  const songTruth = /(?:真.?宋明|宋明.{0,6}(?:已死|死亡))/s.test(serialized);
  const songMimic = /(?:(?:模仿|复制|同行).{0,6}宋明|宋明.{0,6}(?:模仿|复制|同行))/s.test(serialized);
  const linPlayer = /玩家.{0,8}林峰|玩家林峰/s.test(serialized);
  const linLegal = /(?:另一个|另一|合法).{0,6}林峰|林峰.{0,6}(?:另一个|另一|合法)/s.test(serialized);
  assert(songTruth && songMimic, "Dual Song Ming needs both the true/dead Song Ming and an independent mimic/travelling Song Ming representation.");
  assert(linPlayer && linLegal, "Dual Lin Feng needs both the player Lin Feng and a separately legal/other Lin Feng representation.");

  const featherChapters = chapterNumbersFor(nodes, /羽毛|feather/i);
  const rosterChapters = chapterNumbersFor(nodes, /名册|学生名单|名单|roster/i);
  const stateKeys = allObjectKeys(data.profile || data.stateModel || data).join(" ");
  assert(featherChapters.size >= 3 && /羽毛|feather/i.test(stateKeys), `Feather state needs runtime coverage across at least three chapters and a named state field; chapters found: ${[...featherChapters].join(", ") || "none"}.`);
  assert(rosterChapters.size >= 3 && /名册|名单|roster/i.test(stateKeys), `Roster state needs runtime coverage across at least three chapters and a named state field; chapters found: ${[...rosterChapters].join(", ") || "none"}.`);

  const endingIds = Object.keys(data.endings || {}).map(canonicalEndingId).filter(Boolean);
  const expectedEndings = Array.from({ length: 8 }, (_, index) => `E${index + 1}`);
  assert(new Set(endingIds).size === 8 && expectedEndings.every((id) => endingIds.includes(id)), `Expected exactly E1-E8 endings; found ${endingIds.join(", ") || "none"}.`);
  const priority = data.endingPriority || data.profile?.endingPriority || data.endingResolution?.priority || [];
  const canonicalPriority = priority.map((entry) => canonicalEndingId(entry?.endingId || entry)).filter(Boolean);
  const expectedPriority = ["E8", "E3", "E2", "E4", "E5", "E6", "E7", "E1"];
  assert(JSON.stringify(canonicalPriority) === JSON.stringify(expectedPriority), `Ending priority must be ${expectedPriority.join(" -> ")}; found ${canonicalPriority.join(" -> ") || "none"}.`);
  assert(typeof data.profile?.endingResolver === "function", "Full runtime must expose a deterministic profile.endingResolver(state).");
  assert(!/Math\.random|Date\.now|new Date/.test(String(data.profile?.endingResolver || "")), "endingResolver must be deterministic and cannot use random or wall-clock input.");

  const routePlans = data.routePlans || {};
  assert(Object.keys(routePlans).length === 8, `Provide 8 deterministic routePlans (one per ending); found ${Object.keys(routePlans).length}.`);
  const routeResults = [];
  for (const [routeName, plan] of Object.entries(routePlans)) {
    const result = routeState(data, plan || {});
    const expectedEnding = canonicalEndingId(plan?.expectedEnding);
    routeResults.push({ routeName, expectedEnding, result });
    assert(Boolean(expectedEnding), `Route ${routeName} needs expectedEnding E1-E8.`);
    assert(!result.error, `Route ${routeName} ${result.error || "failed without a result"}.`);
    assert(result.endingId === expectedEnding, `Route ${routeName} should resolve ${expectedEnding}; got ${result.endingId || "none"}.`);
  }
  const routeEndings = routeResults.map(({ result }) => result.endingId).filter(Boolean);
  assert(new Set(routeEndings).size === 8 && expectedEndings.every((id) => routeEndings.includes(id)), "Route plans must reach all eight endings exactly once, proving mutually exclusive priority handling.");

  const edges = new Map();
  for (const node of nodeList) {
    const references = nodeReferences(node);
    for (const reference of references) assert(Boolean(nodes[reference.id]), `${node.nodeId} ${reference.trail} references missing node ${reference.id}.`);
    const localChoices = choicesFor(node);
    if (node.timedChoice?.fallbackChoiceId) assert(localChoices.some((choice) => choice.choiceId === node.timedChoice.fallbackChoiceId || choice.actionId === node.timedChoice.fallbackChoiceId), `${node.nodeId} timed fallback ${node.timedChoice.fallbackChoiceId} is not a local choice/action.`);
    edges.set(node.nodeId, references.map((reference) => reference.id).filter((id) => nodes[id]));
    const isFormalEnding = node.resolveEnding === true || Boolean(node.endingId) || ["ending", "formal-ending"].includes(String(node.type || ""));
    assert(edges.get(node.nodeId).length > 0 || isFormalEnding, `${node.nodeId} is a dead end without a formal ending resolver.`);
  }
  const reachable = new Set();
  const stack = [data.script?.startNodeId];
  while (stack.length) {
    const nodeId = stack.pop();
    if (!nodeId || reachable.has(nodeId) || !nodes[nodeId]) continue;
    reachable.add(nodeId);
    for (const nextNodeId of edges.get(nodeId) || []) stack.push(nextNodeId);
  }
  assert(reachable.size === nodeList.length, `All runtime nodes must be reachable; unreachable: ${nodeList.filter((node) => !reachable.has(node.nodeId)).map((node) => node.nodeId).join(", ")}.`);
  for (const component of stronglyConnectedComponents(nodes, edges)) {
    const hasSelfLoop = component.length === 1 && (edges.get(component[0]) || []).includes(component[0]);
    if (component.length === 1 && !hasSelfLoop) continue;
    const componentSet = new Set(component);
    const hasExit = component.some((nodeId) => (edges.get(nodeId) || []).some((nextNodeId) => !componentSet.has(nextNodeId)));
    assert(hasExit, `Cycle has no exit: ${component.join(" -> ")}.`);
  }

  const legacyTokens = ["许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁", "417", "四楼夜间互助群", "女生宿舍"];
  for (const token of legacyTokens) assert(!serialized.includes(token), `Runtime data contains Legacy female-dormitory token: ${token}.`);
  assert(!/dormitory-rollcall|female-dorm|girls?-dorm/i.test(serialized), "Runtime data references a Legacy female-dormitory asset/path.");

  const playerCopy = visibleStrings({ chapters: data.chapters, rules: data.rules, managerRules, nodes, endings: data.endings });
  const internalToken = /\b(?:basic-credible|internal[-_ ]state|rule-state|roleId|nodeId|chapterId|sceneId|blueprint-only|vertical-slice|debug|pending-regeneration)\b/i;
  const englishRoleName = /\b(?:Chen Lu|Shen Yan|Manager Wu|Xu Tang|Lin Sui|Zhao Qing|Zhou Wanning|Broadcast|Narrator)\b/i;
  for (const { trail, value } of playerCopy) {
    assert(!internalToken.test(value), `${trail} exposes player-visible internal enum/token: ${value}.`);
    assert(!englishRoleName.test(value), `${trail} exposes player-visible English role/name: ${value}.`);
  }
  for (const node of nodeList) {
    const silent = node.speaker === "旁白" || ["narration", "phone-text"].includes(node.contentType);
    if (silent) assert(node.voiceEnabled !== true && !node.spokenText && !node.voiceKey, `${node.nodeId} is narration/phone text and must not enable voice or a spoken payload.`);
  }

  notes.push(`chapters=${chapterIds.size}; nodes=${nodeList.length}; blueprintScenes=${representedScenes.size}/${expectedScenes.length}`);
  notes.push(`meaningfulDecisionPoints=${decisionPoints.length}; meaningfulOptions=${meaningfulOptions}; timed=${timedPoints.length}`);
  notes.push(`routes=${routeResults.length}; reachable=${reachable.size}/${nodeList.length}`);
}

if (failures.length) {
  console.error("Dormitory name-floor full-runtime check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory name-floor full-runtime check passed.");
notes.forEach((note) => console.log(note));
