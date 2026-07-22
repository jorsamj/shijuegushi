import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

class FakeElement {
  constructor() {
    this.children = [];
    this.dataset = {};
    this.style = { setProperty() {} };
    this.classList = {
      add() {},
      remove() {},
      toggle() { return false; },
      contains(token) { return token === "hidden"; },
    };
  }

  addEventListener() {}
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); return item; }
  setAttribute() {}
  removeAttribute() {}
  replaceChildren(...items) { this.children = items; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  remove() {}
}

function createStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

function createRuntime() {
  const elements = new Map();
  const document = {
    hidden: false,
    body: { dataset: {} },
    documentElement: new FakeElement(),
    fullscreenEnabled: false,
    fullscreenElement: null,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement());
      return elements.get(id);
    },
    createElement() { return new FakeElement(); },
    querySelectorAll() { return []; },
    addEventListener() {},
  };
  const localStorage = createStorage();
  let timerId = 0;
  const window = {
    document,
    localStorage,
    location: { hostname: "runtime-check.invalid", search: "" },
    navigator: {},
    setTimeout() { timerId += 1; return timerId; },
    clearTimeout() {},
    setInterval() { timerId += 1; return timerId; },
    clearInterval() {},
    requestAnimationFrame() { timerId += 1; return timerId; },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {} }; },
  };
  window.window = window;

  const rainScript = {
    scriptId: "script_rain_call",
    seriesId: "series_rain_call",
    title: "雨夜来电",
    startNodeId: "rain_start",
    order: 1,
  };
  window.MIST_DATA = {
    schemaVersion: "runtime-check",
    product: { name: "第二人生", subtitle: "runtime check" },
    script: rainScript,
    scripts: [rainScript],
    series: [{ seriesId: "series_rain_call", scriptIds: [rainScript.scriptId] }],
    chapters: [],
    nodes: { rain_start: { nodeId: "rain_start" } },
    clues: {},
    endings: {},
    defaultFlags: {},
    defaultStoryState: {},
  };
  window.SECOND_LIFE_VISUALS = { scenes: {}, characters: {}, characterAliases: {}, clues: {}, chapters: {}, props: {} };
  window.DORMITORY_NAMEFLOOR_ASSET_MAP = {};

  const context = vm.createContext({
    window,
    document,
    localStorage,
    console,
    URL,
    Element: FakeElement,
    structuredClone,
  });
  vm.runInContext(read("assets/stories/dormitory-namefloor/story-data.js"), context, { filename: "story-data.js" });
  vm.runInContext(read("assets/stories/dormitory-namefloor/story-chapters-2-7.js"), context, { filename: "story-chapters-2-7.js" });
  vm.runInContext(read("assets/stories/dormitory-namefloor/story-asset-map.js"), context, { filename: "story-asset-map.js" });

  const exportBlock = `
  window.__NAMEFLOOR_RUNTIME_CHECK__ = {
    activateStory,
    applyInteractionEffects,
    createInitialState,
    getDialogueSpeakerLabel,
    getNodeSceneEffects,
    getRestoredStoryView,
    getState: () => structuredCloneSafe(state),
    getTransientState: () => ({
      feedbackCount: feedbackQueue.length,
      hasDialoguePointer: dialoguePointerStart !== null,
      nodeActionLocked,
      timedChoiceActive: activeTimedChoice !== null,
    }),
    getVisibleChoiceText,
    normalizePhoneScreen,
    normalizeState,
    renderEndingReport,
    renderPhoneScreen,
    renderSaveSlot,
    resetStorySessionTransients,
    resolveEnding,
    seedTransientState: () => {
      feedbackQueue.push({ type: "choice" });
      dialoguePointerStart = { x: 1, y: 1 };
      nodeActionLocked = true;
      activeTimedChoice = { nodeId: state.nodeId, intervalId: 1, timeoutId: 2, expiresAt: Date.now() + 1000 };
    },
    setState: (input) => { state = normalizeState(input); return structuredCloneSafe(state); },
    snapshotState,
  };
`;
  const source = read("script.js");
  const instrumented = source.replace(/\n  init\(\);\r?\n\}\)\(\);\s*$/, `${exportBlock}\n})();`);
  assert.notEqual(instrumented, source, "Unable to instrument script.js before init().");
  vm.runInContext(instrumented, context, { filename: "script.js" });

  const runtime = window.__NAMEFLOOR_RUNTIME_CHECK__;
  assert.ok(runtime, "Runtime checker export was not created.");
  runtime.activateStory("script_dormitory_namefloor");
  return { data: window.MIST_DORMITORY_NAMEFLOOR_DATA, runtime };
}

function visibleText(html) {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:#39|quot|amp|lt|gt);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function choiceItems(node) {
  return node?.choices?.length ? node.choices : node?.phoneScreen?.actions || [];
}

function replayRoute(runtime, data, plan) {
  runtime.setState({
    ...runtime.createInitialState("script_dormitory_namefloor"),
    scriptId: "script_dormitory_namefloor",
    nodeId: plan.startNodeId,
  });
  let nodeId = plan.startNodeId;
  const seen = new Set();
  for (let step = 0; step < 800; step += 1) {
    assert.ok(!seen.has(nodeId), `Route looped at ${nodeId}.`);
    seen.add(nodeId);
    const node = data.nodes[nodeId];
    assert.ok(node, `Route references missing node ${nodeId}.`);
    runtime.applyInteractionEffects(node);
    const items = choiceItems(node);
    if (items.length) {
      const requested = plan.choices?.[nodeId] || plan.actions?.[nodeId];
      const choice = items.find((item) => item.choiceId === requested || item.actionId === requested);
      assert.ok(choice, `Route has no action for ${nodeId}.`);
      runtime.applyInteractionEffects(choice);
      nodeId = choice.nextNodeId || node.nextNodeId;
      continue;
    }
    if (node.resolveEnding === true) return runtime.resolveEnding();
    assert.ok(node.nextNodeId, `Route stopped before the resolver at ${nodeId}.`);
    nodeId = node.nextNodeId;
  }
  assert.fail("Route exceeded 800 steps.");
}

const { data, runtime } = createRuntime();
const scriptId = "script_dormitory_namefloor";
const initialNamefloorState = runtime.createInitialState(scriptId);
assert.equal(initialNamefloorState.storyState.flags, undefined, "Envelope flags must not be duplicated inside storyState.");
assert.equal(initialNamefloorState.storyState.clues, undefined, "Envelope clues must not be duplicated inside storyState.");

runtime.setState({ ...initialNamefloorState, scriptId, nodeId: "nf02_001" });
const mappedSceneEffects = runtime.getNodeSceneEffects(data.nodes.nf02_001);
assert.ok(mappedSceneEffects.length > 0, "A name-floor scene without node-local effects must receive bounded mapped scene cues.");
assert.ok(mappedSceneEffects.length <= 2, "Mapped scene cues must remain bounded to avoid effect overload.");
assert.ok(mappedSceneEffects.every((effect) => effect?.type && effect?.durationMs > 0), "Mapped scene cues must be lifecycle-ready.");

runtime.setState({
  ...initialNamefloorState,
  scriptId,
  nodeId: data.script.startNodeId,
  storyState: { ...data.defaultStoryState, nested: { written: false } },
});
const patch = {
  storyState: { namePollutionStage: 2, nested: { written: true } },
  stateUpdates: [
    { key: "namePollutionStage", value: 5 },
    { key: "nested.anchor", value: "paper" },
    { key: "__proto__.polluted", value: true },
  ],
};
runtime.applyInteractionEffects(patch);
patch.storyState.nested.written = false;
let current = runtime.getState();
assert.equal(current.storyState.namePollutionStage, 5, "Ordered stateUpdates must apply after storyState.");
assert.deepEqual(current.storyState.nested, { written: true, anchor: "paper" }, "Story state must deep-merge and clone nested values.");
assert.equal({}.polluted, undefined, "Story state paths must reject prototype pollution.");

const snapshot = runtime.snapshotState();
snapshot.storyState.nested.anchor = "mutated outside runtime";
assert.equal(runtime.getState().storyState.nested.anchor, "paper", "Snapshots must deep-clone storyState.");
current = runtime.setState({ ...snapshot, storyState: { ...snapshot.storyState, namePollutionStage: 99 } });
assert.equal(current.storyState.namePollutionStage, 9, "Loaded pollution state must normalize to the canonical range.");

runtime.setState({ ...runtime.createInitialState(scriptId), scriptId, storyState: { ...data.defaultStoryState, namePollutionStage: 1 } });
let phone = runtime.normalizePhoneScreen({ view: "members", memberCount: 42, members: [{ name: "林峰" }] });
assert.notEqual(phone.members[0].name, "林峰", "The first visible carrier must alter Lin Feng's contact/member name.");
runtime.setState({ ...runtime.createInitialState(scriptId), scriptId, storyState: { ...data.defaultStoryState, namePollutionStage: 2 } });
phone = runtime.normalizePhoneScreen({ view: "members", memberCount: 42, members: [{ name: "林峰" }] });
assert.equal(phone.memberCount, 42, "Black-avatar replacement must not increase the member count.");
assert.equal(phone.members[0].isBlackAvatar, true, "The black avatar must occupy Lin Feng's existing member slot.");
runtime.setState({ ...runtime.createInitialState(scriptId), scriptId, storyState: { ...data.defaultStoryState, namePollutionStage: 4 } });
let rendered = visibleText(runtime.renderPhoneScreen({ kind: "system", title: "个人账号", systemNotice: "正在读取资料" }));
assert.match(rendered, /用户不存在/, "Account loss must be visible in the phone carrier.");
assert.doesNotMatch(rendered, /namePollutionStage|第\s*4\s*阶段|污染值|\b4\s*\/\s*9\b/i, "Phone carriers must not expose internal or numeric state.");
runtime.setState({ ...runtime.createInitialState(scriptId), scriptId, storyState: { ...data.defaultStoryState, namePollutionStage: 7 } });
assert.notEqual(runtime.getDialogueSpeakerLabel({ speaker: "林峰" }), "林峰", "The dialogue name carrier must reflect self-name blockage.");
assert.match(runtime.getVisibleChoiceText("完整说出“林峰”"), /林.*峰/, "Choice text must retain a readable but incomplete name carrier.");
assert.notEqual(runtime.getVisibleChoiceText("完整说出“林峰”"), "完整说出“林峰”", "Choice text must visibly reflect self-name blockage.");

const reached = [];
for (const [routeName, plan] of Object.entries(data.routePlans || {})) {
  const first = replayRoute(runtime, data, plan);
  const before = JSON.stringify(runtime.getState());
  const second = runtime.resolveEnding();
  const after = JSON.stringify(runtime.getState());
  const directEnding = data.profile.endingResolver(runtime.getState());
  assert.equal(directEnding, plan.expectedEnding, `${routeName} must preserve the story resolver's ${plan.expectedEnding} result.`);
  assert.equal(first, plan.expectedEnding, `${routeName} must resolve ${plan.expectedEnding}.`);
  assert.equal(second, first, `${routeName} must resolve deterministically when repeated.`);
  assert.equal(after, before, `${routeName} ending resolution must not mutate story state.`);
  assert.ok(data.endings[first], `${routeName} resolved an unknown ending ${first}.`);
  const reportText = visibleText(runtime.renderEndingReport(data.endings[first]));
  assert.match(reportText, new RegExp(data.endings[first].title), `${routeName} report must name its canonical ending.`);
  assert.match(reportText, new RegExp(data.endings[first].finalLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${routeName} report must render its final line.`);
  assert.doesNotMatch(reportText, /许知晚|周屿|最终推理|关系变化|namePollutionStage|\b(?:E[1-8]|c\d+_[a-z]+)\b|\b\d+\s*\/\s*\d+\b/i, `${routeName} report exposed legacy, numeric, or internal state.`);
  reached.push(first);
}
assert.deepEqual(new Set(reached), new Set(["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"]), "All eight endings must remain reachable.");

runtime.setState({
  ...runtime.createInitialState(scriptId),
  scriptId,
  nodeId: "E3",
  endingId: "E3",
  storyState: { ...data.defaultStoryState, namePollutionStage: 9 },
});
current = runtime.getState();
assert.equal(JSON.stringify(runtime.getRestoredStoryView()), JSON.stringify({ type: "ending", endingId: "E3" }), "Ending saves must restore the ending view.");
const saveText = visibleText(runtime.renderSaveSlot({ ...current, savedAt: "2026-07-22T00:00:00.000Z" }, 0, "load"));
assert.match(saveText, /黑色头像/, "Late pollution must visibly alter the save title.");
assert.doesNotMatch(saveText, /第\s*9\s*阶段|污染值|namePollutionStage|\b9\s*\/\s*9\b/i, "Save titles must not expose internal or numeric state.");

runtime.seedTransientState();
runtime.resetStorySessionTransients({ preserveTimedChoice: false, resetVisual: true });
assert.equal(JSON.stringify(runtime.getTransientState()), JSON.stringify({
  feedbackCount: 0,
  hasDialoguePointer: false,
  nodeActionLocked: false,
  timedChoiceActive: false,
}), "Story lifecycle cleanup must clear queued feedback, gesture state, action locks, and timers.");

console.log("Dormitory name-floor state/runtime check passed.");
console.log(`routes=${reached.length}; endings=${new Set(reached).size}; pollutionCarriers=phone/dialogue/choice/save`);
