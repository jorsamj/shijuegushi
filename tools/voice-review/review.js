(() => {
  "use strict";

  const ROOT = "../../";
  const REVIEW_KEY = "secondLife.voiceReview.v1";
  const state = { all: [], visible: [], currentIndex: -1, queue: [], queueIndex: -1, timer: null, audio: null };
  const $ = (selector) => document.querySelector(selector);
  const list = $("#voice-list");
  const template = $("#voice-item-template");
  const filters = {
    story: $("#story-filter"), chapter: $("#chapter-filter"), role: $("#role-filter"), node: $("#node-filter"),
    broadcast: $("#broadcast-filter"), ending: $("#ending-filter"),
  };
  const reviewStore = () => JSON.parse(localStorage.getItem(REVIEW_KEY) || "{}");
  const saveReview = (id, patch) => {
    const next = reviewStore();
    next[id] = { ...(next[id] || { status: "pending", note: "" }), ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
  };
  const spoken = (text) => String(text || "")
    .replace(/[“”]/g, "")
    .replace(/00:17/g, "零点十七分")
    .replace(/00:44/g, "零点四十四分")
    .replace(/01:13/g, "一点十三分")
    .replace(/2014/g, "二零一四年")
    .replace(/417/g, "四一七")
    .replace(/319/g, "三百一十九")
    .replace(/320/g, "三百二十")
    .replace(/\s+/g, " ").trim();
  const storyData = {
    "script_rain_call": { title: "雨夜来电", data: window.MIST_DATA },
    "script_dormitory_rollcall": { title: "宿舍规则怪谈", data: window.MIST_DORMITORY_DATA },
  };
  const fetchManifest = (url) => fetch(url).then((response) => {
    if (!response.ok) throw new Error(`无法读取 ${url}: ${response.status}`);
    return response.json();
  });
  const sourceFor = (story, entry) => entry.kind === "ending" ? story.endings?.[entry.endingId] : story.nodes?.[entry.nodeId];
  const load = async () => {
    const [rainManifest, dormManifest] = await Promise.all([
      fetchManifest(`${ROOT}assets/stories/rain-call/audio/voice-manifest.json`),
      fetchManifest(`${ROOT}assets/stories/dormitory-rollcall/audio/voice-manifest.json`),
    ]);
    const manifests = { script_rain_call: rainManifest, script_dormitory_rollcall: dormManifest };
    const broadcastLines = new Map((window.DORMITORY_BROADCAST_AUDIO_CONTRACT?.cues || []).map((cue) => [`broadcast__${cue.audioId}`, cue.line]));
    state.all = Object.entries(manifests).flatMap(([storyId, manifest]) => {
      const story = storyData[storyId].data;
      return Object.values(manifest.entries || {}).map((entry) => {
        const source = sourceFor(story, entry);
        const displayText = entry.kind === "broadcast-cue" ? broadcastLines.get(entry.id) || "" : source?.text || "";
        return {
          ...entry,
          storyId,
          storyTitle: storyData[storyId].title,
          displayText,
          spokenText: spoken(displayText),
        };
      });
    }).sort((a, b) => `${a.storyId}:${a.chapterId}:${a.id}`.localeCompare(`${b.storyId}:${b.chapterId}:${b.id}`));
    populateFilters();
    applyFilters();
  };
  const appendOptions = (select, values) => values.forEach(([value, label]) => {
    const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option);
  });
  const populateFilters = () => {
    appendOptions(filters.story, Object.entries(storyData).map(([id, value]) => [id, value.title]));
    appendOptions(filters.chapter, [...new Map(state.all.map((item) => [item.chapterId, item.chapterId])).entries()]);
    appendOptions(filters.role, [...new Map(state.all.map((item) => [item.roleId, `${item.speaker} (${item.roleId})`])).entries()]);
  };
  const applyFilters = () => {
    const query = filters.node.value.trim().toLowerCase();
    state.visible = state.all.filter((item) => {
      if (filters.story.value !== "all" && item.storyId !== filters.story.value) return false;
      if (filters.chapter.value !== "all" && item.chapterId !== filters.chapter.value) return false;
      if (filters.role.value !== "all" && item.roleId !== filters.role.value) return false;
      if (filters.broadcast.checked && item.kind !== "broadcast-cue") return false;
      if (filters.ending.checked && item.kind !== "ending") return false;
      return !query || `${item.id} ${item.nodeId || ""} ${item.displayText} ${item.spokenText}`.toLowerCase().includes(query);
    });
    state.currentIndex = state.visible.findIndex((item) => item.id === state.all[state.currentIndex]?.id);
    render();
  };
  const stop = () => {
    clearTimeout(state.timer); state.timer = null;
    if (state.audio) { state.audio.pause(); state.audio.currentTime = 0; state.audio = null; }
    document.querySelectorAll(".voice-item.is-playing").forEach((item) => item.classList.remove("is-playing"));
  };
  const play = (item, queue = null, queueIndex = 0) => {
    if (!item) return;
    stop();
    state.queue = queue || [item]; state.queueIndex = queueIndex;
    state.currentIndex = state.visible.findIndex((entry) => entry.id === item.id);
    const audio = new Audio(`${ROOT}${item.webPath}`);
    state.audio = audio;
    document.querySelector(`[data-entry-id="${CSS.escape(item.id)}"]`)?.classList.add("is-playing");
    audio.addEventListener("ended", () => {
      document.querySelector(`[data-entry-id="${CSS.escape(item.id)}"]`)?.classList.remove("is-playing");
      const next = state.queue[state.queueIndex + 1];
      if (!next) { state.audio = null; return; }
      state.timer = setTimeout(() => play(next, state.queue, state.queueIndex + 1), Number($("#gap-input").value));
    }, { once: true });
    audio.play().catch((error) => { $("#summary").textContent = `播放失败：${error.message}`; stop(); });
  };
  const playAdjacent = (offset) => {
    const index = Math.max(0, Math.min(state.visible.length - 1, (state.currentIndex < 0 ? 0 : state.currentIndex + offset)));
    play(state.visible[index]);
  };
  const render = () => {
    list.replaceChildren();
    $("#summary").textContent = `当前筛选 ${state.visible.length} 条；审听标记仅保存在本浏览器。`;
    const reviews = reviewStore();
    state.visible.forEach((entry) => {
      const fragment = template.content.cloneNode(true);
      const article = fragment.querySelector("article"); article.dataset.entryId = entry.id;
      fragment.querySelector(".voice-item__id").textContent = `${entry.storyTitle} / ${entry.id}`;
      fragment.querySelector(".voice-item__meta").textContent = `${entry.chapterId} · ${entry.speaker} · ${entry.roleId} · ${entry.kind}`;
      fragment.querySelector(".voice-item__text").textContent = entry.displayText || "[无剧情正文：请检查 manifest 映射]";
      const formalStatus = entry.status === "generated" ? "原始 WAV 即当前正式 master；未使用浏览器 TTS 回退" : entry.status;
      const details = [["spokenText", entry.spokenText], ["nodeId", entry.nodeId || "-"], ["roleId", entry.roleId], ["VCN", entry.vcn], ["时长", `${entry.durationHintSeconds ?? "-"}s`], ["原始文件", entry.webPath], ["正式文件状态", formalStatus]];
      const dl = fragment.querySelector(".voice-item__details");
      details.forEach(([name, value]) => { const dt = document.createElement("dt"); dt.textContent = name; const dd = document.createElement("dd"); dd.textContent = value; dl.append(dt, dd); });
      fragment.querySelector(".item-play").addEventListener("click", () => play(entry));
      fragment.querySelector(".item-stop").addEventListener("click", stop);
      const review = reviews[entry.id] || { status: "pending", note: "" };
      fragment.querySelectorAll(".review-state input").forEach((input) => { input.checked = input.value === review.status; input.addEventListener("change", () => saveReview(entry.id, { status: input.value })); });
      const note = fragment.querySelector(".review-note"); note.value = review.note || ""; note.addEventListener("change", () => saveReview(entry.id, { note: note.value }));
      list.append(fragment);
    });
  };
  const broadcastQueue = () => {
    const order = window.DORMITORY_BROADCAST_AUDIO_CONTRACT.cues.map((cue) => `broadcast__${cue.audioId}`);
    return order.map((id) => state.all.find((item) => item.id === id)).filter(Boolean);
  };
  const exportReviews = () => {
    const payload = { exportedAt: new Date().toISOString(), warning: "Local review only. Not a production release sign-off.", reviews: reviewStore() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "second-life-voice-review-local.json"; link.click(); URL.revokeObjectURL(url);
  };
  [filters.story, filters.chapter, filters.role, filters.node, filters.broadcast, filters.ending].forEach((element) => element.addEventListener("input", applyFilters));
  $("#play-button").addEventListener("click", () => play(state.visible[Math.max(0, state.currentIndex)]));
  $("#pause-button").addEventListener("click", () => state.audio?.pause());
  $("#previous-button").addEventListener("click", () => playAdjacent(-1));
  $("#next-button").addEventListener("click", () => playAdjacent(1));
  $("#play-filtered-button").addEventListener("click", () => play(state.visible[0], state.visible, 0));
  $("#play-broadcast-button").addEventListener("click", () => { const queue = broadcastQueue(); play(queue[0], queue, 0); });
  $("#gap-input").addEventListener("input", (event) => { $("#gap-output").textContent = `${event.target.value}ms`; });
  $("#export-button").addEventListener("click", exportReviews);
  load().catch((error) => { $("#summary").textContent = `无法加载 voice manifest：${error.message}`; });
})();
