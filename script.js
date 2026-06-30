(() => {
  "use strict";

  const DATA = window.MIST_DATA;
  const STORAGE_KEYS = {
    progress: "mist.currentProgress",
    saves: "mist.saveSlots",
    history: "mist.history",
    settings: "mist.settings",
    schema: "mist.schemaVersion",
  };

  const app = document.getElementById("app");
  const toastHost = document.getElementById("toastHost");
  const modalRoot = document.getElementById("modalRoot");
  const modalTitle = document.getElementById("modalTitle");
  const modalKicker = document.getElementById("modalKicker");
  const modalBody = document.getElementById("modalBody");

  let storageAvailable = true;
  let modalCloseHandler = null;
  let currentView = "splash";
  let state = createInitialState();

  function createInitialState() {
    return {
      scriptId: "script_rain_call",
      nodeId: "ch01_001",
      clues: [],
      flags: { ...DATA.defaultFlags },
      history: [],
      endingId: null,
      deductionScore: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function init() {
    storageAvailable = checkStorage();
    if (storageAvailable) {
      localStorage.setItem(STORAGE_KEYS.schema, DATA.schemaVersion);
      if (!localStorage.getItem(STORAGE_KEYS.saves)) {
        saveJSON(STORAGE_KEYS.saves, [null, null, null]);
      }
    }
    bindGlobalModalEvents();
    showSplash();
    if (!storageAvailable) {
      showToast("本地存储不可用，本次进度只会保留在当前页面。", "warn");
    }
  }

  function checkStorage() {
    try {
      const probe = "__mist_probe__";
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  }

  function readJSON(key, fallback) {
    if (!storageAvailable) return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    if (!storageAvailable) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      showToast("保存失败：浏览器本地空间不可用。", "warn");
    }
  }

  function getScript(scriptId = "script_rain_call") {
    return DATA.scripts.find((item) => item.scriptId === scriptId);
  }

  function getSeries(seriesId = "series_rain_call") {
    return DATA.series.find((item) => item.seriesId === seriesId);
  }

  function getNode(nodeId = state.nodeId) {
    return DATA.nodes[nodeId];
  }

  function getChapter(chapterId) {
    return DATA.chapters.find((chapter) => chapter.chapterId === chapterId);
  }

  function hasProgress() {
    const progress = readJSON(STORAGE_KEYS.progress, null);
    return Boolean(progress && progress.scriptId === "script_rain_call" && progress.nodeId);
  }

  function loadProgress() {
    const progress = readJSON(STORAGE_KEYS.progress, null);
    if (!progress || progress.scriptId !== "script_rain_call") return false;
    state = normalizeState(progress);
    return true;
  }

  function normalizeState(input) {
    return {
      ...createInitialState(),
      ...input,
      flags: { ...DATA.defaultFlags, ...(input.flags || {}) },
      clues: Array.isArray(input.clues) ? input.clues : [],
      history: Array.isArray(input.history) ? input.history : [],
      deductionScore: Number(input.deductionScore || 0),
    };
  }

  function snapshotState() {
    return {
      ...state,
      flags: { ...state.flags },
      clues: [...state.clues],
      history: [...state.history],
      updatedAt: new Date().toISOString(),
    };
  }

  function autoSave() {
    state.updatedAt = new Date().toISOString();
    saveJSON(STORAGE_KEYS.progress, snapshotState());
    saveJSON(STORAGE_KEYS.history, state.history);
  }

  function setView(name, html) {
    currentView = name;
    app.className = `app-shell view-${name}`;
    app.innerHTML = html;
  }

  function showSplash() {
    setView(
      "splash",
      `
      <section class="splash-screen">
        <div class="phone-glow" aria-hidden="true">
          <span class="call-dot"></span>
          <span class="call-line"></span>
          <span class="call-line short"></span>
        </div>
        <div class="brand-mark">MIST CASE LIBRARY</div>
        <h1>迷雾剧本馆</h1>
        <p>每一个选择，都可能改变真相</p>
        <button class="primary-cta" type="button" data-action="enter-hall">进入剧本馆</button>
      </section>
      `
    );
    app.querySelector("[data-action='enter-hall']").addEventListener("click", showHall);
  }

  function showHall() {
    const cards = DATA.series
      .map((series) => {
        const isOpen = series.status === "open";
        return `
          <article class="case-folder ${isOpen ? "is-open" : "is-locked"}" data-series-id="${series.seriesId}">
            <div class="folder-tab">${isOpen ? "已开放" : "未开放"}</div>
            <div class="folder-lines" aria-hidden="true"></div>
            <h2>${escapeHTML(series.title)}</h2>
            <p>${escapeHTML(series.summary)}</p>
            <button class="ghost-button" type="button">${isOpen ? "查看系列" : "敬请期待"}</button>
          </article>
        `;
      })
      .join("");

    setView(
      "hall",
      `
      <section class="hall-screen">
        <header class="page-header">
          <p class="eyebrow">CASE ARCHIVE</p>
          <h1>迷雾剧本馆</h1>
          <p>选择一组案件剧本，进入雨夜、旧照片与未接来电之间。</p>
        </header>
        <div class="series-shelf">${cards}</div>
      </section>
      `
    );

    app.querySelectorAll(".case-folder").forEach((card) => {
      card.addEventListener("click", () => {
        const series = getSeries(card.dataset.seriesId);
        if (series.status !== "open") {
          openNotice("未开放", "这组档案仍在封存中。请等下一次雨夜。");
          return;
        }
        showSeries(series.seriesId);
      });
    });
  }

  function showSeries(seriesId) {
    const series = getSeries(seriesId);
    const scripts = series.scriptIds.map((id) => getScript(id)).filter(Boolean);
    const hasLocalProgress = hasProgress();
    const rows = scripts
      .map((script) => {
        const isOpen = script.status === "open";
        const actionText = isOpen ? (hasLocalProgress ? "继续游戏" : "开始游戏") : "未完待续";
        return `
          <article class="script-dossier ${isOpen ? "is-playable" : "is-coming"}" data-script-id="${script.scriptId}">
            <span class="script-order">第 ${script.order} 本</span>
            <div>
              <h3>《${escapeHTML(script.title)}》</h3>
              <p>${escapeHTML(script.summary)}</p>
            </div>
            <button class="case-button" type="button">${actionText}</button>
          </article>
        `;
      })
      .join("");

    setView(
      "series",
      `
      <section class="series-screen">
        <button class="back-link" type="button" data-action="back-hall">← 返回剧本馆</button>
        <header class="series-brief">
          <p class="eyebrow">RAIN CALL FILE</p>
          <h1>${escapeHTML(series.title)}</h1>
          <p>${escapeHTML(series.summary)}第一版开放《雨夜来电》，其余剧本以未完待续状态展示。</p>
        </header>
        <div class="script-stack">${rows}</div>
      </section>
      `
    );

    app.querySelector("[data-action='back-hall']").addEventListener("click", showHall);
    app.querySelectorAll(".script-dossier").forEach((card) => {
      card.addEventListener("click", () => {
        const script = getScript(card.dataset.scriptId);
        if (script.status !== "open") {
          openNotice("未完待续", `《${script.title}》的档案还没有打开。`);
          return;
        }
        if (hasLocalProgress) {
          openConfirm("继续游戏", "检测到本地进度。要从上次保存的位置继续吗？", () => {
            loadProgress();
            showGame();
          }, () => startNewGame());
        } else {
          startNewGame();
        }
      });
    });
  }

  function startNewGame() {
    state = createInitialState();
    autoSave();
    showGame();
  }

  function showGame() {
    const node = getNode();
    if (!node) {
      showToast("剧情节点缺失，已返回剧本馆。", "warn");
      showHall();
      return;
    }
    applyNodeEffects(node);

    const chapter = getChapter(node.chapterId);
    const sceneClass = `scene-${node.scene || "rental_room_rain_night"}`;
    setView(
      "game",
      `
      <section class="game-screen ${sceneClass}">
        <header class="game-topbar">
          <div class="game-title">
            <span>${escapeHTML(getScript().title)}</span>
            <strong>${escapeHTML(chapter?.title || node.chapterTitle || "")}</strong>
          </div>
          <nav class="toolbox" aria-label="游戏工具栏">
            <button type="button" data-tool="clues">线索</button>
            <button type="button" data-tool="save">存档</button>
            <button type="button" data-tool="load">读档</button>
            <button type="button" data-tool="history">历史</button>
            <button type="button" data-tool="hall">返回剧本馆</button>
          </nav>
        </header>
        <div class="scene-stage">
          ${renderSceneVisual(node)}
        </div>
        <section class="dialogue-panel">
          <div class="speaker-tag">${escapeHTML(node.speaker || "旁白")}</div>
          <div class="dialogue-text">${formatText(node.text)}</div>
          <div id="choiceArea" class="choice-area"></div>
          <div class="dialogue-actions">
            <span class="node-id">${escapeHTML(node.nodeId)}</span>
            <button id="continueButton" class="continue-button" type="button">继续</button>
          </div>
        </section>
      </section>
      `
    );

    bindGameToolbar();
    renderNodeControls(node);
    autoSave();
  }

  function applyNodeEffects(node) {
    gainClues(node.gainClues || []);
    setFlags(node.setFlags || []);
    if (node.type !== "choice" && node.type !== "deduction") {
      addHistory({
        type: node.type === "ending" ? "system" : "dialogue",
        speaker: node.speaker || "旁白",
        text: node.text,
        nodeId: node.nodeId,
      });
    }
  }

  function renderNodeControls(node) {
    const continueButton = document.getElementById("continueButton");
    const choiceArea = document.getElementById("choiceArea");

    if (node.nodeId === "ch12_008") {
      continueButton.textContent = "查看结局";
      continueButton.addEventListener("click", () => {
        state.endingId = resolveEnding();
        autoSave();
        showEnding(state.endingId);
      });
      return;
    }

    if (node.type === "choice" || node.type === "deduction") {
      continueButton.classList.add("hidden");
      choiceArea.innerHTML = (node.choices || [])
        .map((choice) => `
          <button class="choice-button" type="button" data-choice-id="${choice.choiceId}">
            <span>${escapeHTML(choice.text)}</span>
          </button>
        `)
        .join("");
      choiceArea.querySelectorAll(".choice-button").forEach((button) => {
        button.addEventListener("click", () => handleChoice(node, button.dataset.choiceId));
      });
      return;
    }

    if (node.type === "ending" && DATA.endings[node.nodeId]) {
      continueButton.textContent = "查看结局";
      continueButton.addEventListener("click", () => showEnding(node.nodeId));
      return;
    }

    continueButton.addEventListener("click", () => {
      if (node.nextNodeId) {
        goToNode(node.nextNodeId);
      } else {
        state.endingId = resolveEnding();
        showEnding(state.endingId);
      }
    });
  }

  function handleChoice(node, choiceId) {
    const choice = (node.choices || []).find((item) => item.choiceId === choiceId);
    if (!choice) return;
    addHistory({
      type: "choice",
      speaker: "你的选择",
      text: choice.text,
      nodeId: node.nodeId,
    });
    gainClues(choice.gainClues || []);
    setFlags(choice.setFlags || []);
    if (node.type === "deduction" && choice.isCorrect === true) {
      state.deductionScore += 1;
    }
    autoSave();
    if (choice.nextNodeId) {
      goToNode(choice.nextNodeId);
    } else {
      state.endingId = resolveEnding();
      showEnding(state.endingId);
    }
  }

  function goToNode(nodeId) {
    if (DATA.endings[nodeId]) {
      showEnding(nodeId);
      return;
    }
    state.nodeId = nodeId;
    showGame();
  }

  function gainClues(clueIds) {
    clueIds.forEach((clueId) => {
      if (!clueId || !DATA.clues[clueId] || state.clues.includes(clueId)) return;
      state.clues.push(clueId);
      showToast(`获得线索：${DATA.clues[clueId].title}`, "clue");
    });
  }

  function setFlags(flagIds) {
    flagIds.forEach((flagId) => {
      if (!flagId) return;
      state.flags[flagId] = true;
    });
  }

  function addHistory(entry) {
    const text = String(entry.text || "").trim();
    if (!text) return;
    const last = state.history[state.history.length - 1];
    if (last && last.nodeId === entry.nodeId && last.type === entry.type && last.text === text) return;
    state.history.push({
      ...entry,
      time: new Date().toISOString(),
    });
    if (state.history.length > 240) state.history.shift();
  }

  function resolveEnding() {
    const clues = new Set(state.clues);
    const flags = state.flags;
    if (flags.deleted_evidence === true && flags.backed_up_photo !== true) {
      return "ending_c";
    }
    const hasAClues = [
      "clue_last_photo",
      "clue_photo_background",
      "clue_gray_loan",
      "clue_zhou_left",
      "clue_timed_voice",
    ].every((id) => clues.has(id));
    if (
      hasAClues &&
      flags.backed_up_photo === true &&
      flags.chose_reopen_case === true &&
      state.deductionScore >= 4
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

  function showEnding(endingId) {
    const ending = DATA.endings[endingId] || DATA.endings.ending_d;
    state.endingId = ending.endingId;
    state.nodeId = ending.endingId;
    addHistory({
      type: "system",
      speaker: `结局：${ending.title}`,
      text: ending.text,
      nodeId: ending.endingId,
    });
    autoSave();

    setView(
      "ending",
      `
      <section class="ending-screen ending-${ending.endingId.slice(-1)}">
        <div class="ending-file">
          <p class="eyebrow">CASE ENDING</p>
          <h1>${escapeHTML(ending.title)}</h1>
          <div class="ending-text">${formatText(ending.text)}</div>
          <div class="ending-actions">
            <button class="case-button" type="button" data-action="restart">重新开始</button>
            <button class="case-button secondary" type="button" data-action="load">读取存档</button>
            <button class="ghost-button" type="button" data-action="hall">返回剧本馆</button>
          </div>
        </div>
      </section>
      `
    );

    app.querySelector("[data-action='restart']").addEventListener("click", () => {
      openConfirm("重新开始", "会从《雨夜来电》开头重新进入。当前自动进度会被覆盖。", startNewGame);
    });
    app.querySelector("[data-action='load']").addEventListener("click", () => openLoadModal());
    app.querySelector("[data-action='hall']").addEventListener("click", showHall);
  }

  function bindGameToolbar() {
    app.querySelector("[data-tool='clues']").addEventListener("click", openClueModal);
    app.querySelector("[data-tool='save']").addEventListener("click", openSaveModal);
    app.querySelector("[data-tool='load']").addEventListener("click", openLoadModal);
    app.querySelector("[data-tool='history']").addEventListener("click", openHistoryModal);
    app.querySelector("[data-tool='hall']").addEventListener("click", () => {
      openConfirm("返回剧本馆", "返回前会自动保存当前进度。要离开当前剧情页吗？", () => {
        autoSave();
        showHall();
      });
    });
  }

  function openClueModal() {
    const categories = ["通话", "人物", "物件", "旧案", "照片", "地点"];
    const clueItems = Object.values(DATA.clues);
    const html = categories
      .map((category) => {
        const items = clueItems.filter((clue) => clue.category === category);
        if (!items.length) return "";
        const rows = items
          .map((clue) => {
            const owned = state.clues.includes(clue.clueId);
            return `
              <article class="clue-card ${owned ? "is-owned" : "is-hidden"}">
                <span class="clue-pin">${owned ? "已记录" : "？？？"}</span>
                <h3>${owned ? escapeHTML(clue.title) : "？？？"}</h3>
                <p>${owned ? escapeHTML(clue.description) : "这条线索还藏在雨声里。"}</p>
              </article>
            `;
          })
          .join("");
        return `
          <section class="clue-category">
            <h3>${category}</h3>
            <div class="clue-grid">${rows}</div>
          </section>
        `;
      })
      .join("");
    openModal("案件线索板", "CLUE BOARD", html || "<p>还没有线索。</p>");
  }

  function openSaveModal() {
    const slots = readJSON(STORAGE_KEYS.saves, [null, null, null]);
    const html = `
      <div class="save-grid">
        ${slots.map((slot, index) => renderSaveSlot(slot, index, "save")).join("")}
      </div>
    `;
    openModal("保存进度", "SAVE FILE", html);
    modalBody.querySelectorAll("[data-save-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.saveSlot);
        const writeSlot = () => {
          const nextSlots = readJSON(STORAGE_KEYS.saves, [null, null, null]);
          nextSlots[index] = {
            ...snapshotState(),
            savedAt: new Date().toISOString(),
          };
          saveJSON(STORAGE_KEYS.saves, nextSlots);
          showToast(`已保存到存档槽 ${index + 1}`, "clue");
          openSaveModal();
        };
        if (slots[index]) {
          openConfirm("覆盖存档", `存档槽 ${index + 1} 已有记录，确认覆盖吗？`, writeSlot, openSaveModal);
        } else {
          writeSlot();
        }
      });
    });
  }

  function openLoadModal() {
    const slots = readJSON(STORAGE_KEYS.saves, [null, null, null]);
    const html = `
      <div class="save-grid">
        ${slots.map((slot, index) => renderSaveSlot(slot, index, "load")).join("")}
      </div>
    `;
    openModal("读取存档", "LOAD FILE", html);
    modalBody.querySelectorAll("[data-load-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.loadSlot);
        const slot = slots[index];
        if (!slot) return;
        openConfirm("读取存档", "读取后会覆盖当前临时进度。确认继续吗？", () => {
          state = normalizeState(slot);
          closeModal();
          if (state.endingId && DATA.endings[state.endingId]) {
            showEnding(state.endingId);
          } else {
            showGame();
          }
        }, openLoadModal);
      });
    });
  }

  function renderSaveSlot(slot, index, mode) {
    if (!slot) {
      return `
        <article class="save-slot is-empty">
          <h3>存档槽 ${index + 1}</h3>
          <p>空存档</p>
          <button class="case-button" type="button" ${mode === "load" ? "disabled" : `data-save-slot="${index}"`}>
            ${mode === "load" ? "不可读取" : "保存到这里"}
          </button>
        </article>
      `;
    }
    const node = DATA.nodes[slot.nodeId] || DATA.endings[slot.endingId] || {};
    const chapter = node.chapterTitle || getChapter(node.chapterId)?.title || "结局记录";
    const summary = String(node.text || "").replace(/\s+/g, " ").slice(0, 52);
    const clueCount = Array.isArray(slot.clues) ? slot.clues.length : 0;
    return `
      <article class="save-slot">
        <h3>存档槽 ${index + 1}</h3>
        <p class="save-title">《${escapeHTML(getScript(slot.scriptId).title)}》</p>
        <p>${escapeHTML(chapter)}</p>
        <p>${escapeHTML(summary || "剧情节点记录")}</p>
        <p>${clueCount} 条线索 · ${formatDate(slot.savedAt || slot.updatedAt)}</p>
        <button class="case-button" type="button" data-${mode}-slot="${index}">
          ${mode === "save" ? "覆盖存档" : "读取存档"}
        </button>
      </article>
    `;
  }

  function openHistoryModal() {
    const rows = state.history
      .map((item) => `
        <article class="history-item history-${item.type}">
          <span>${escapeHTML(item.speaker || "旁白")}</span>
          <div class="history-copy">${formatText(item.text)}</div>
        </article>
      `)
      .join("");
    openModal("历史记录", "BACKLOG", rows || "<p>还没有对白记录。</p>");
  }

  function openNotice(title, text) {
    openModal(title, "NOTICE", `<p class="notice-text">${escapeHTML(text)}</p>`);
  }

  function openConfirm(title, text, onConfirm, onCancel) {
    openModal(
      title,
      "CONFIRM",
      `
      <p class="notice-text">${escapeHTML(text)}</p>
      <div class="modal-actions">
        <button class="case-button" type="button" data-confirm-yes>确认</button>
        <button class="ghost-button" type="button" data-confirm-no>取消</button>
      </div>
      `
    );
    modalBody.querySelector("[data-confirm-yes]").addEventListener("click", () => {
      closeModal();
      if (typeof onConfirm === "function") onConfirm();
    });
    modalBody.querySelector("[data-confirm-no]").addEventListener("click", () => {
      closeModal();
      if (typeof onCancel === "function") onCancel();
    });
  }

  function openModal(title, kicker, html, onClose) {
    modalTitle.textContent = title;
    modalKicker.textContent = kicker;
    modalBody.innerHTML = html;
    modalCloseHandler = onClose;
    modalRoot.classList.remove("hidden");
    modalRoot.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modalRoot.classList.add("hidden");
    modalRoot.setAttribute("aria-hidden", "true");
    const handler = modalCloseHandler;
    modalCloseHandler = null;
    if (typeof handler === "function") handler();
  }

  function bindGlobalModalEvents() {
    modalRoot.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal]")) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modalRoot.classList.contains("hidden")) closeModal();
    });
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastHost.appendChild(toast);
    window.setTimeout(() => toast.classList.add("is-leaving"), 2400);
    window.setTimeout(() => toast.remove(), 3000);
  }

  function renderSceneVisual(node) {
    const scene = node.scene || "rental_room_rain_night";
    const label = escapeHTML(node.chapterTitle || getChapter(node.chapterId)?.title || "雨夜来电");
    const sceneMap = {
      rental_room_rain_night: `
        <div class="scene-visual room-visual">
          <div class="window-frame"><span></span><span></span></div>
          <div class="desk-light"></div>
          <div class="room-table"><i></i><b></b></div>
          <p>${label}</p>
        </div>`,
      corridor_door: `
        <div class="scene-visual peephole-visual">
          <div class="peephole"><span></span></div>
          <div class="door-line"></div>
          <p>门外的雨水，把楼道灯拖成一条冷白的线。</p>
        </div>`,
      phone_call_ui: `
        <div class="scene-visual phone-visual">
          <div class="phone-shell">
            <span class="phone-time">22:47</span>
            <strong>许知夏</strong>
            <small>三年前的旧号码</small>
            <div class="phone-pulse"></div>
          </div>
        </div>`,
      old_chat_memory: `
        <div class="scene-visual chat-visual">
          <div class="chat-bubble left">知夏：那天你会来吧？</div>
          <div class="chat-bubble right">林舟：会。</div>
          <div class="photo-stain"></div>
        </div>`,
      rental_room_table: `
        <div class="scene-visual table-visual">
          <div class="paper-stack"></div>
          <div class="coffee-ring"></div>
          <div class="old-photo"></div>
          <p>泡面碗旁边，旧纸箱的胶带已经发黄。</p>
        </div>`,
      photo_zoom_view: `
        <div class="scene-visual photo-visual">
          <div class="photo-frame"><span></span><b></b></div>
          <div class="magnifier"></div>
          <p>照片边缘的颗粒里，藏着一个不该出现的人影。</p>
        </div>`,
      old_phone_view: `
        <div class="scene-visual old-phone-visual">
          <div class="cracked-phone">
            <strong>语音备忘</strong>
            <div class="waveform"><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>`,
      ending_screen: `
        <div class="scene-visual archive-visual">
          <div class="archive-folder"></div>
          <p>案件记录正在归档。</p>
        </div>`,
    };
    return sceneMap[scene] || sceneMap.rental_room_rain_night;
  }

  function formatText(text) {
    const paragraphs = escapeHTML(String(text || "").trim())
      .split(/\n{2,}/)
      .filter(Boolean);
    if (!paragraphs.length) return "";
    return paragraphs.map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("");
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "未知时间";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "未知时间";
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  init();
})();
