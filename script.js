(() => {
  "use strict";

  const RAIN_DATA = window.MIST_DATA;
  let DATA = RAIN_DATA;
  const RAIN_VISUALS = window.SECOND_LIFE_VISUALS || {
    scenes: {},
    characters: {},
    characterAliases: {},
    clues: {},
    chapters: {},
    props: {},
  };
  let VISUALS = RAIN_VISUALS;
  const DORMITORY_DATA = window.MIST_DORMITORY_DATA;
  const DORMITORY_VISUALS = window.DORMITORY_ROLLCALL_ASSET_MAP || {};
  const STORY_DATASETS = {
    script_rain_call: RAIN_DATA,
    ...(DORMITORY_DATA ? { script_dormitory_rollcall: DORMITORY_DATA } : {}),
  };
  const STORY_CATALOG = {
    series: [...(RAIN_DATA?.series || []), ...(DORMITORY_DATA?.series ? [DORMITORY_DATA.series] : [])],
    scripts: [...(RAIN_DATA?.scripts || []), ...(DORMITORY_DATA?.script ? [DORMITORY_DATA.script] : [])],
  };

  function createDormitoryVisualAdapter(map) {
    const archiveImage = map?.endings?.sharedArchive || "";
    return {
      scenes: map?.scenes || {},
      characters: map?.characters || {},
      characterAliases: map?.characterAliases || {},
      clues: map?.clues || {},
      chapters: {},
      props: {},
      audio: map?.audio || { scenes: {} },
      covers: { home: map?.covers?.story || "" },
      endings: Object.fromEntries(["dorm_ending_a", "dorm_ending_b", "dorm_ending_c", "dorm_ending_d"].map((id) => [id, { image: map?.endings?.[id] || archiveImage }])),
    };
  }

  const STORY_VISUALS = {
    script_rain_call: RAIN_VISUALS,
    ...(DORMITORY_DATA ? { script_dormitory_rollcall: createDormitoryVisualAdapter(DORMITORY_VISUALS) } : {}),
  };

  const STORAGE_KEYS = {
    progress: "mist.currentProgress",
    saves: "mist.saveSlots",
    history: "mist.history",
    settings: "mist.settings",
    schema: "mist.schemaVersion",
    achievements: "secondLife.achievements",
    collection: "secondLife.collection",
  };

  let CORE_CLUE_IDS = [
    "clue_dead_call",
    "clue_sister_mark",
    "clue_gray_loan",
    "clue_zhou_left",
    "clue_photo_background",
    "clue_timed_voice",
  ];
  let FOCUSED_CLUE_REVEALS = new Set(["clue_dead_call", "clue_photo_background", "clue_timed_voice"]);

  let CLUE_FILTERS = ["全部", "关键线索", "通话", "人物", "照片", "旧案"];

  let MILESTONES = [
    {
      milestoneId: "dead_call",
      title: "命运节点开启",
      text: "你接起了来自三年前的电话。这个夜晚已经无法回到原来的轨道。",
      test: () => state.clues.includes("clue_dead_call"),
    },
    {
      milestoneId: "gray_loan",
      title: "旧案裂缝出现",
      text: "许知夏不是意外坠入黑暗，她曾经试图自救。",
      test: () => state.clues.includes("clue_gray_loan"),
    },
    {
      milestoneId: "photo_background",
      title: "谎言被拍下",
      text: "照片不会说话，但它记住了周屿不该出现的位置。",
      test: () => state.clues.includes("clue_photo_background"),
    },
    {
      milestoneId: "timed_voice",
      title: "灵异被现实撕开",
      text: "这不是鬼魂来电，而是一段迟到三年的提醒。",
      test: () => state.clues.includes("clue_timed_voice") || state.flags.understood_dead_call === true,
    },
  ];

  let ACHIEVEMENTS = [
    { achievementId: "rain_line", title: "雨夜接线人", test: () => state.clues.includes("clue_dead_call") },
    { achievementId: "careful_one", title: "谨慎的人", test: () => state.flags.kept_door_closed === true },
    { achievementId: "first_trust", title: "第一次相信", test: () => state.flags.trusted_zhuwan_early === true },
    { achievementId: "evidence_mind", title: "证据意识", test: () => state.flags.backed_up_photo === true },
    { achievementId: "old_case_crack", title: "旧案裂缝", test: () => state.clues.includes("clue_gray_loan") },
    { achievementId: "photo_speaks", title: "照片会说话", test: () => state.clues.includes("clue_photo_background") },
    { achievementId: "reality_reader", title: "现实解释者", test: () => state.flags.understood_dead_call === true },
    { achievementId: "truth_restart", title: "真相重启", test: () => state.endingId === "ending_a" },
    { achievementId: "no_answer", title: "无人接听", test: () => state.endingId === "ending_d" },
  ];

  let ENDING_REPORT = {
    ending_a: {
      label: "结局 A：真相重启",
      type: "最佳进展",
      comment: "你保住了证据，也完成了推理。旧案不会立刻结束，但它终于重新开始。",
    },
    ending_b: {
      label: "结局 B：证据失控",
      type: "证据失控",
      comment: "你选择相信，但没有建立完整证据链。善意并不足以保护真相。",
    },
    ending_c: {
      label: "结局 C：删除证据",
      type: "证据删除",
      comment: "你结束了这个雨夜，也亲手关上了许知夏最后一次求救。",
    },
    ending_d: {
      label: "结局 D：无人接听",
      type: "逃避真相",
      comment: "你没有犯错，但你也没有继续向前。真相仍停在无人接听的电话里。",
    },
  };

  let RELATIONSHIP_DEFS = [
    { id: "trust_zhuwan", character: "许知晚", label: "信任", levels: ["疏离", "试探", "信任", "托付"] },
    { id: "support_chenyan", character: "陈妍", label: "协助", levels: ["微弱", "有限协助", "积极协助", "全力协助"] },
    { id: "suspicion_zhou", character: "周屿", label: "警觉", levels: ["未察觉", "警觉", "高度警觉", "失控施压"] },
    { id: "courage_linzou", character: "林舟", label: "直面", levels: ["逃避", "动摇", "面对", "直面真相"] },
  ];
  const RAIN_PROFILE = {
    coreClueIds: [...CORE_CLUE_IDS],
    focusedClueReveals: new Set(FOCUSED_CLUE_REVEALS),
    clueFilters: [...CLUE_FILTERS],
    milestones: MILESTONES,
    achievements: ACHIEVEMENTS,
    endingReport: ENDING_REPORT,
    relationshipDefs: RELATIONSHIP_DEFS,
  };
  const DORMITORY_PROFILE = DORMITORY_DATA?.profile
    ? {
        coreClueIds: [...DORMITORY_DATA.profile.coreClueIds],
        focusedClueReveals: new Set(DORMITORY_DATA.profile.coreClueIds),
        clueFilters: ["全部", "关键线索", "广播", "登记", "视频", "镜面", "旧案"],
        milestones: [],
        achievements: [],
        endingReport: Object.fromEntries(Object.values(DORMITORY_DATA.endings).map((ending) => [ending.endingId, { label: ending.title, type: ending.report?.type || "宿舍记录", comment: ending.report?.pathSummary || "这份名单决定谁会被保留下来。" }])),
        relationshipDefs: DORMITORY_DATA.profile.relationshipDefs || [],
        evidenceLinks: DORMITORY_DATA.profile.evidenceLinks || [],
        endingResolver: DORMITORY_DATA.profile.endingResolver,
        deductionTotal: DORMITORY_DATA.profile.deductionTotal || 2,
      }
    : null;
  let activeProfile = RAIN_PROFILE;

  function getDataset(scriptId = "script_rain_call") {
    return STORY_DATASETS[scriptId] || RAIN_DATA;
  }

  function getProfile(scriptId = "script_rain_call") {
    return scriptId === "script_dormitory_rollcall" && DORMITORY_PROFILE ? DORMITORY_PROFILE : RAIN_PROFILE;
  }

  function activateStory(scriptId = "script_rain_call") {
    DATA = getDataset(scriptId);
    VISUALS = STORY_VISUALS[scriptId] || RAIN_VISUALS;
    activeProfile = getProfile(scriptId);
    CORE_CLUE_IDS = [...(activeProfile.coreClueIds || [])];
    FOCUSED_CLUE_REVEALS = new Set(activeProfile.focusedClueReveals || []);
    CLUE_FILTERS = [...(activeProfile.clueFilters || [])];
    MILESTONES = activeProfile.milestones || [];
    ACHIEVEMENTS = activeProfile.achievements || [];
    ENDING_REPORT = activeProfile.endingReport || {};
    RELATIONSHIP_DEFS = activeProfile.relationshipDefs || [];
  }

  const app = document.getElementById("app");
  const toastHost = document.getElementById("toastHost");
  const modalRoot = document.getElementById("modalRoot");
  const modalTitle = document.getElementById("modalTitle");
  const modalKicker = document.getElementById("modalKicker");
  const modalBody = document.getElementById("modalBody");

  let storageAvailable = true;
  let modalCloseHandler = null;
  let modalMode = "notice";
  let currentView = "splash";
  let feedbackQueue = [];
  let visualState = { current: null };
  let nodeActionLocked = false;
  let immersiveAttempted = false;
  let dialoguePointerStart = null;
  const preloadedVisuals = new Set();
  let state = createInitialState();
  let audioState = {
    context: null,
    master: null,
    bgm: null,
    ambience: null,
    realBgm: null,
    realEntryBgm: null,
    realAmbience: null,
    realVoice: null,
    activeSfx: [],
    activeStingers: [],
    pendingSfxTimers: [],
    recentSfx: {},
    duckRestoreTimer: null,
    currentDialogueAudio: null,
    currentDialogueAbortController: null,
    currentBgm: "",
    currentEntryBgm: "",
    currentAmbience: "",
    unlocked: false,
    lastVoiceNodeId: "",
    voiceFallbackNoticeShown: false,
    voiceMissingNoticeShown: false,
    placeholderVoiceNoticeShown: false,
    dialogueToken: 0,
    dialogueSessionId: 0,
    currentNodeId: "",
    debugLog: [],
  };

  function getStoryStorageKeys(scriptId = state?.scriptId || "script_rain_call") {
    if (scriptId === "script_rain_call") return STORAGE_KEYS;
    const prefix = `mist.story.${scriptId}`;
    return {
      ...STORAGE_KEYS,
      progress: `${prefix}.currentProgress`,
      saves: `${prefix}.saveSlots`,
      history: `${prefix}.history`,
      achievements: `${prefix}.achievements`,
      collection: `${prefix}.collection`,
    };
  }

  function createInitialState(scriptId = "script_rain_call") {
    activateStory(scriptId);
    const startNodeId = DATA.script?.startNodeId || getScript(scriptId)?.startNodeId || "ch01_001";
    return {
      scriptId,
      nodeId: startNodeId,
      clues: [],
      flags: { ...DATA.defaultFlags },
      history: [],
      endingId: null,
      deductionScore: 0,
      unreadClues: [],
      chapterStats: {},
      triggeredMilestones: [],
      achievements: loadStoredAchievements(scriptId),
      sessionAchievements: [],
      importantChoices: [],
      truthNotices: [],
      relationships: createDefaultRelationships(),
      relationshipEvents: [],
      endingPathTags: [],
      completedObjectives: [],
      checkedHotspots: [],
      evidenceConnections: [],
      ruleStatuses: {},
      endingCollection: loadStoredCollection(scriptId).endings,
      galleryUnlocks: loadStoredCollection(scriptId).gallery,
      readNodes: [],
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
    bindAssetFallbacks();
    bindPageLifecycle();
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

  function loadStoredAchievements(scriptId = state?.scriptId || "script_rain_call") {
    try {
      const raw = localStorage.getItem(getStoryStorageKeys(scriptId).achievements);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function loadStoredCollection(scriptId = state?.scriptId || "script_rain_call") {
    try {
      const raw = localStorage.getItem(getStoryStorageKeys(scriptId).collection);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        endings: Array.isArray(parsed.endings) ? parsed.endings : [],
        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
        recordings: Array.isArray(parsed.recordings) ? parsed.recordings : [],
      };
    } catch (error) {
      return { endings: [], gallery: [], recordings: [] };
    }
  }

  function saveStoredCollection(collection = {}, scriptId = state?.scriptId || "script_rain_call") {
    const current = loadStoredCollection(scriptId);
    saveJSON(getStoryStorageKeys(scriptId).collection, {
      endings: Array.from(new Set([...(current.endings || []), ...(collection.endings || [])])),
      gallery: Array.from(new Set([...(current.gallery || []), ...(collection.gallery || [])])),
      recordings: Array.from(new Set([...(current.recordings || []), ...(collection.recordings || [])])),
    });
  }

  function getScript(scriptId = state?.scriptId || "script_rain_call") {
    return STORY_CATALOG.scripts.find((item) => item.scriptId === scriptId);
  }

  function getSeries(seriesId = "series_rain_call") {
    return STORY_CATALOG.series.find((item) => item.seriesId === seriesId);
  }

  function getNode(nodeId = state.nodeId) {
    return DATA.nodes[nodeId];
  }

  function getChapter(chapterId) {
    return DATA.chapters.find((chapter) => chapter.chapterId === chapterId);
  }

  function getVisualCharacter(speaker = "旁白") {
    const rawName = String(speaker).split(/[：:]/)[0].trim() || "旁白";
    const characterNames = Object.keys(VISUALS.characters || {});
    const matchedName = characterNames.find((name) => rawName.includes(name));
    const aliasName = VISUALS.characterAliases?.[rawName] || matchedName || rawName;
    return VISUALS.characters?.[aliasName] || VISUALS.characters?.旁白 || {
      name: rawName,
      role: "人生记录",
      avatar: "avatar-narrator",
    };
  }

  function renderCharacterBadge(speaker) {
    const character = getVisualCharacter(speaker);
    return `
      <aside class="character-presence character-${escapeHTML(character.id || "narrator")}" aria-label="${escapeHTML(character.name)}">
        <div class="character-portrait">
          <img src="${escapeHTML(character.image || "")}" alt="${escapeHTML(character.name)}" loading="lazy" />
        </div>
        <div>
          <strong>${escapeHTML(character.name)}</strong>
          <span>${escapeHTML(character.role)}</span>
        </div>
      </aside>
    `;
  }

  function renderCharacterLayer(speaker, node) {
    const visualSpeaker = node?.visualCharacter || speaker;
    const character = getVisualCharacter(visualSpeaker);
    if (!character?.image || character.id === "narrator") return "";
    const rawSpeaker = String(visualSpeaker || speaker || "");
    const explicitVariant = node?.characterVariant;
    const variant = explicitVariant && character.variants?.[explicitVariant]
      ? explicitVariant
      : resolveCharacterVariant(character, rawSpeaker, node);
    const image = character.variants?.[variant] || character.image;
    const mode = rawSpeaker.includes("声音")
      ? "is-memory"
      : rawSpeaker.includes("消息")
        ? "is-message"
        : "is-present";
    const scene = node?.scene || "rental_room_rain_night";
    const scale = node?.characterScale || "normal";
    const position = node?.characterPosition || "center";
    const framing = node?.characterFraming || (scale === "fullscreen" ? "face" : scale === "closeup" ? "bust" : "halfbody");
    const focus = node?.characterFocus || (framing === "fullbody" ? "fullBody" : framing === "face" ? "face" : "upperBody");
    const headSafe = node?.characterHeadSafe !== false;
    const mood = node?.visualMood || "normal";
    return `
      <div class="vn-character-layer character-${escapeHTML(character.id)} variant-${escapeHTML(variant)} scale-${escapeHTML(scale)} position-${escapeHTML(position)} framing-${escapeHTML(framing)} focus-${escapeHTML(focus)} ${headSafe ? "head-safe" : ""} mood-${escapeHTML(mood)} ${mode}" data-speaker="${escapeHTML(character.name)}" data-scene="${escapeHTML(scene)}">
        <figure class="vn-character-standee">
          <img src="${escapeHTML(image)}" alt="${escapeHTML(character.name)}" loading="eager" decoding="async" />
          <figcaption>
            <strong>${escapeHTML(character.name)}</strong>
            <span>${escapeHTML(character.role)}</span>
          </figcaption>
        </figure>
      </div>
    `;
  }

  function resolveCharacterVariant(character, rawSpeaker, node = {}) {
    const text = `${node.text || ""} ${rawSpeaker} ${node.scene || ""}`;
    const has = (...words) => words.some((word) => text.includes(word));
    if (character.id === "zhuwan") {
      if (has("钥匙", "脚步", "楼道灯灭", "阴影", "门缝")) return "horror";
      if (has("发抖", "害怕", "惊", "别开门")) return "fear";
      if (has("闭嘴", "够了", "周屿", "压低", "逼")) return "pressure";
      if (has("生气", "愤怒", "吼", "骗")) return "angry";
      if (has("证明", "核验", "你怎么知道", "隐瞒")) return "suspicious";
      if ((node.scene || "") === "corridor_door") return "wet";
      if ((node.scene || "") === "photo_zoom_view") return "closeup";
      return "base";
    }
    if (character.id === "linzhou") {
      if (has("死者", "来电", "许知夏", "不可能")) return "shocked";
      if (has("害怕", "冷", "门外", "猫眼", "心跳")) return "fear";
      if (has("质问", "报警", "重启", "不能再逃")) return "angry";
      if (has("犹豫", "旧案", "三年", "愧疚")) return "worried";
      return "base";
    }
    if (character.id === "zhouyu") {
      if (has("听到录音", "钥匙", "楼下", "你刚找到", "别再查")) return "horror";
      if (has("照片", "证据", "别让", "停下")) return "pressure";
      if (has("怒", "闭嘴", "威胁")) return "angry";
      return "calm";
    }
    if (character.id === "chenyan") {
      if (has("等等", "不对", "怎么会", "新闻出来前")) return "shocked";
      if (has("查到", "借贷", "备份", "新闻", "离职")) return "serious";
      return "base";
    }
    if (character.id === "zhixia") {
      if (has("周屿他", "救", "别开门")) return "fear";
      if (has("录音", "声音", "语音", "旧手机")) return "recording";
      if (has("阴影", "无人接听", "黑屏")) return "horror";
      return "memory";
    }
    return "base";
  }

  function renderClueIcon(clueId, extraClass = "") {
    const visual = VISUALS.clues?.[clueId];
    if (!visual) return `<span class="visual-icon icon-sealed ${extraClass}" aria-hidden="true"></span>`;
    return `<span class="visual-icon ${extraClass}" title="${escapeHTML(visual.label)}" aria-hidden="true"><img src="${escapeHTML(visual.image)}" alt="" loading="lazy" /></span>`;
  }

  function renderChapterCover(chapterId, compact = false) {
    const chapter = getChapter(chapterId);
    const visual = VISUALS.chapters?.[chapterId];
    if (!visual) return "";
    return `
      <figure class="chapter-cover ${compact ? "is-compact" : ""}">
        <img src="${escapeHTML(visual.image)}" alt="${escapeHTML(chapter?.title || visual.title)}" loading="lazy" />
        <figcaption>
          <strong>${escapeHTML(chapter?.title || visual.title)}</strong>
          <small>${escapeHTML(visual.motif)}</small>
        </figcaption>
      </figure>
    `;
  }

  function renderPropStrip(ids = []) {
    const rows = ids
      .map((id) => VISUALS.props?.[id])
      .filter(({ prop }) => Boolean(prop))
      .map((prop) => `<span class="prop-token"><img src="${escapeHTML(prop.image)}" alt="" loading="lazy" />${escapeHTML(prop.label)}</span>`)
      .join("");
    return rows ? `<div class="prop-strip">${rows}</div>` : "";
  }

  function prepareAudioCue(node) {
    const sceneCue = VISUALS.audio?.scenes?.[node.scene || "rental_room_rain_night"] || {};
    const speakerProfile = getVisualCharacter(node.speaker).id || "narrator";
    const sfxList = []
      .concat(sceneCue.sfx || [])
      .concat(node.sfxOnEnter || [])
      .filter(Boolean);
    const resolvedCue = {
      bgm: node.bgm || sceneCue.bgm || "",
      ambience: node.ambience || sceneCue.ambience || "",
      sfx: sfxList,
    };
    app.dataset.audioScene = node.scene || "rental_room_rain_night";
    app.dataset.audioBgm = resolvedCue.bgm || "";
    app.dataset.audioAmbience = resolvedCue.ambience || "";
    app.dataset.audioSfx = sfxList.map(cueKey).filter(Boolean).join(",");
    app.dataset.audioVoice = speakerProfile;
    updateAudioForNode(node, resolvedCue);
  }

  function getAudioSettings() {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    return {
      audioEnabled: saved.audioEnabled !== false,
      voiceEnabled: saved.voiceEnabled !== false,
      bgmEnabled: saved.bgmEnabled !== false,
      ambienceEnabled: saved.ambienceEnabled !== false,
      sfxEnabled: saved.sfxEnabled !== false,
      masterVolume: clampNumber(saved.masterVolume ?? 0.72, 0, 1),
      bgmVolume: clampNumber(saved.bgmVolume ?? 0.4, 0, 1),
      ambienceVolume: clampNumber(saved.ambienceVolume ?? 0.5, 0, 1),
      sfxVolume: clampNumber(saved.sfxVolume ?? 0.68, 0, 1),
      stingerVolume: clampNumber(saved.stingerVolume ?? 0.58, 0, 1),
      devAudioDebug: saved.devAudioDebug === true,
    };
  }

  function saveAudioSettings(settings) {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    saveJSON(STORAGE_KEYS.settings, { ...saved, ...settings });
  }

  function isAudioEnabled() {
    return getAudioSettings().audioEnabled;
  }

  function getReadingSettings() {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    return {
      textSpeed: ["slow", "normal", "fast", "instant"].includes(saved.textSpeed) ? saved.textSpeed : "normal",
      instantText: saved.instantText === true,
      autoPlay: saved.autoPlay === true,
      skipRead: saved.skipRead === true,
      fontScale: clampNumber(saved.fontScale ?? 1, 0.9, 1.22),
      deepDarkMode: saved.deepDarkMode === true,
      hideUi: saved.hideUi === true,
    };
  }

  function saveReadingSettings(settings) {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    saveJSON(STORAGE_KEYS.settings, { ...saved, ...settings });
  }

  function scaledVolume(base, channel = "sfx") {
    const settings = getAudioSettings();
    const channelMap = {
      bgm: settings.bgmVolume,
      ambience: settings.ambienceVolume,
      sfx: settings.sfxVolume,
      stingers: settings.stingerVolume,
      voice: settings.stingerVolume,
      narration: settings.stingerVolume,
    };
    return clampNumber((Number(base) || 0) * settings.masterVolume * (channelMap[channel] ?? 1), 0, 1);
  }

  function ensureAudioContext() {
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    if (!audioState.context) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioState.context = new Ctx();
      audioState.master = audioState.context.createGain();
      audioState.master.gain.value = 0.22;
      audioState.master.connect(audioState.context.destination);
    }
    return audioState.context;
  }

  function unlockAudio() {
    const settings = getAudioSettings();
    if (!settings.audioEnabled) return;
    const context = ensureAudioContext();
    if (context?.state === "suspended") context.resume();
    audioState.unlocked = true;
  }

  function stopAudioHandle(handle) {
    if (!handle) return;
    try {
      handle.gain?.gain?.setTargetAtTime(0, audioState.context.currentTime, 0.08);
      setTimeout(() => {
        try { handle.nodes?.forEach((node) => node.stop?.()); } catch (error) {}
      }, 180);
    } catch (error) {}
  }

  function stopRealAudio(audio) {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.load?.();
    } catch (error) {}
  }

  function removeActiveAudio(listName, audio) {
    const list = audioState[listName];
    if (!Array.isArray(list) || !audio) return;
    const index = list.indexOf(audio);
    if (index >= 0) list.splice(index, 1);
  }

  function cueKey(cue) {
    return typeof cue === "string" ? cue : cue?.key || "";
  }

  function normalizeAudioCue(cue, defaults = {}) {
    if (typeof cue === "string") return { key: cue, ...defaults };
    if (!cue || typeof cue !== "object") return null;
    const key = cue.key || "";
    if (!key) return null;
    return { ...defaults, ...cue, key };
  }

  function clearPendingSfxTimers() {
    (audioState.pendingSfxTimers || []).forEach((timer) => window.clearTimeout(timer));
    audioState.pendingSfxTimers = [];
  }

  function stopTrackedAudioList(listName, reason = "node-change") {
    const list = Array.isArray(audioState[listName]) ? [...audioState[listName]] : [];
    audioState[listName] = [];
    list.forEach((audio) => {
      logAudioEvent(audio.dataset?.audioCategory || listName, audio.dataset?.audioKey || "", audio.dataset?.sourceType || "external-approved", audio.currentSrc || audio.src || "", "stopped", "", "stopped", reason);
      stopRealAudio(audio);
    });
  }

  function stopNodeTransientAudio(reason = "node-change") {
    clearPendingSfxTimers();
    stopTrackedAudioList("activeSfx", reason);
    stopTrackedAudioList("activeStingers", reason);
    stopAllDialogueAudio();
  }

  function fadeOutAudio(audio, fadeOutMs = 300, reason = "fadeout") {
    if (!audio) return;
    const startVolume = Number.isFinite(audio.volume) ? audio.volume : 0.5;
    const startedAt = Date.now();
    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / Math.max(1, fadeOutMs));
      try {
        audio.volume = Math.max(0, startVolume * (1 - progress));
      } catch (error) {}
      if (progress < 1) {
        window.setTimeout(tick, 40);
        return;
      }
      logAudioEvent(audio.dataset?.audioCategory || "audio", audio.dataset?.audioKey || "", audio.dataset?.sourceType || "external-approved", audio.currentSrc || audio.src || "", "fadeout", "", "fadeout", reason);
      stopRealAudio(audio);
    };
    tick();
  }

  function logAudioEvent(category, key, sourceType, src, status, qualityStatus = "", eventType = "source", reason = "") {
    audioState.debugLog.push({
      time: new Date().toISOString(),
      nodeId: state?.nodeId || audioState.currentNodeId || "",
      category,
      key,
      eventType,
      reason,
      sourceType,
      src,
      status,
      qualityStatus,
      fallbackUsed: false,
    });
    if (audioState.debugLog.length > 50) audioState.debugLog.splice(0, audioState.debugLog.length - 50);
    window.SECOND_LIFE_AUDIO_DEBUG = audioState.debugLog;
  }

  function isApprovedExternalAsset(asset) {
    return Boolean(
      asset?.path &&
      ["demo-approved", "final-approved"].includes(asset.status) &&
      asset.qualityStatus === "approved" &&
      asset.productionGrade !== "reject"
    );
  }

  function getAudioSource(category, key) {
    if (!key) return null;
    const manifest = window.SECOND_LIFE_EXTERNAL_AUDIO;
    const asset = manifest?.[category]?.[key] || Object.values(manifest?.[category] || {}).find((item) => item?.storyKey === key);
    if (isApprovedExternalAsset(asset)) {
      const sourceType = asset.sourceFamily === "CC0 exception" ? "cc0-exception" : "sound-library";
      logAudioEvent(category, key, sourceType, asset.path, asset.status, asset.qualityStatus);
      return { src: asset.path, externalId: asset.id || key, sourceType };
    }
    logAudioEvent(category, key, "silent", "", "silent", "missing-or-rejected");
    if (getAudioSettings().devAudioDebug) console.warn(`[Second Life Audio] Silent cue: ${category}:${key}`);
    return null;
  }

  function playRealAudio(source, options = {}) {
    if (!source || typeof Audio !== "function") return null;
    const descriptor = typeof source === "string" ? { src: source } : source;
    if (!descriptor?.src) return null;
    const audio = new Audio(descriptor.src);
    audio.loop = options.loop === true;
    audio.volume = options.volume ?? 0.72;
    audio.dataset.audioCategory = options.category || "";
    audio.dataset.audioKey = options.key || "";
    audio.dataset.sourceType = descriptor.sourceType || options.sourceType || "external-approved";
    logAudioEvent(options.category || "unknown", options.key || "", audio.dataset.sourceType, descriptor.src, "start", "", "start", options.reason || "node-enter");
    audio.addEventListener("error", () => {
      console.warn(`[Second Life Audio] Unable to load ${descriptor.src}`);
      logAudioEvent(options.category || "unknown", options.key || "", audio.dataset.sourceType, descriptor.src, "silent-load-failure", "", "error", options.reason || "node-enter");
    }, { once: true });
    audio.addEventListener("ended", () => {
      logAudioEvent(options.category || "unknown", options.key || "", audio.dataset.sourceType, descriptor.src, "ended", "", "ended", options.reason || "natural-end");
    }, { once: true });
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.warn(`[Second Life Audio] Unable to play ${descriptor.src}`, error);
        logAudioEvent(options.category || "unknown", options.key || "", audio.dataset.sourceType, descriptor.src, "silent-play-failure", "", "error", options.reason || "node-enter");
      });
    }
    return audio;
  }

  function stopCurrentVoice() {
    const current = audioState.currentDialogueAudio;
    stopRealAudio(current);
    audioState.currentDialogueAudio = null;
    audioState.currentDialogueAbortController = null;
    if (audioState.realVoice && audioState.realVoice !== current) {
      stopRealAudio(audioState.realVoice);
    }
    audioState.realVoice = null;
    audioState.lastVoiceNodeId = "";
  }

  function stopCurrentNarration() {
    stopCurrentVoice();
  }

  function stopSyntheticSpeech() {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {}
    }
  }

  function stopAllDialogueAudio() {
    audioState.dialogueToken += 1;
    audioState.dialogueSessionId += 1;
    if (audioState.currentDialogueAbortController) {
      try {
        audioState.currentDialogueAbortController.abort();
      } catch (error) {}
      audioState.currentDialogueAbortController = null;
    }
    stopCurrentVoice();
    stopSyntheticSpeech();
    audioState.lastVoiceNodeId = "";
  }

  function getBgmFreqs(name = "") {
    if (name.includes("dead_call")) return [73.42, 110, 146.83];
    if (name.includes("corridor")) return [55, 82.41, 123.47];
    if (name.includes("evidence")) return [98, 130.81, 196];
    if (name.includes("voice")) return [65.41, 98, 130.81];
    if (name.includes("ending")) return [82.41, 123.47, 164.81];
    return [65.41, 98, 146.83];
  }

  function startBgm(name) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.bgmEnabled || !audioState.unlocked || !name) return;
    if (audioState.currentBgm === name) return;
    const src = getAudioSource("bgm", name);
    stopAudioHandle(audioState.bgm);
    audioState.bgm = null;
    audioState.currentBgm = "";
    if (src) {
      audioState.currentBgm = name;
      const targetVolume = scaledVolume(0.055, "bgm");
      const nextAudio = playRealAudio(src, {
        category: "bgm",
        key: name,
        loop: true,
        volume: 0,
      });
      if (nextAudio) crossfadeAudioLayer("realBgm", nextAudio, targetVolume, 800, "bgm-crossfade");
      return;
    }
    audioState.currentBgm = "";
  }

  function startEntryMusic(name = "life_archive_theme") {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.bgmEnabled || !audioState.unlocked || !name) return;
    if (audioState.currentEntryBgm === name && audioState.realEntryBgm) return;
    const src = getAudioSource("bgm", name);
    if (!src) return;
    audioState.currentEntryBgm = name;
    const nextAudio = playRealAudio(src, {
      category: "bgm",
      key: name,
      loop: true,
      volume: 0,
      reason: "entry-archive",
    });
    if (nextAudio) crossfadeAudioLayer("realEntryBgm", nextAudio, scaledVolume(0.072, "bgm"), 1000, "entry-theme-crossfade");
  }

  function stopEntryMusic(reason = "leave-entry") {
    if (audioState.realEntryBgm) fadeOutAudio(audioState.realEntryBgm, 1000, reason);
    audioState.realEntryBgm = null;
    audioState.currentEntryBgm = "";
  }

  function startAmbience(name) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.ambienceEnabled || !audioState.unlocked || !name) return;
    if (audioState.currentAmbience === name) return;
    const src = getAudioSource("ambience", name);
    stopAudioHandle(audioState.ambience);
    audioState.ambience = null;
    audioState.currentAmbience = "";
    if (src) {
      audioState.currentAmbience = name;
      const targetVolume = scaledVolume(0.08, "ambience");
      const nextAudio = playRealAudio(src, {
        category: "ambience",
        key: name,
        loop: true,
        volume: 0,
      });
      if (nextAudio) crossfadeAudioLayer("realAmbience", nextAudio, targetVolume, 700, "ambience-crossfade");
      return;
    }
    audioState.currentAmbience = "";
  }

  function getNodeAudioPolicy(node = {}) {
    return {
      stopPreviousSfx: node.audioPolicy?.stopPreviousSfx !== false,
      stopPreviousStingers: node.audioPolicy?.stopPreviousStingers !== false,
      bgmMode: ["replace", "keep", "fadeout"].includes(node.audioPolicy?.bgmMode) ? node.audioPolicy.bgmMode : "keep",
      ambienceMode: ["replace", "keep", "fadeout"].includes(node.audioPolicy?.ambienceMode) ? node.audioPolicy.ambienceMode : "keep",
      fadeOutMs: Number.isFinite(Number(node.audioPolicy?.fadeOutMs)) ? Number(node.audioPolicy.fadeOutMs) : 300,
    };
  }

  function stopBgm(reason = "policy") {
    if (audioState.realBgm) fadeOutAudio(audioState.realBgm, 300, reason);
    stopAudioHandle(audioState.bgm);
    audioState.realBgm = null;
    audioState.bgm = null;
    audioState.currentBgm = "";
  }

  function stopAmbience(reason = "policy") {
    if (audioState.realAmbience) fadeOutAudio(audioState.realAmbience, 300, reason);
    stopAudioHandle(audioState.ambience);
    audioState.realAmbience = null;
    audioState.ambience = null;
    audioState.currentAmbience = "";
  }

  function transitionAudioForNode(prevNode, nextNode, sceneCue = {}) {
    const policy = getNodeAudioPolicy(nextNode);
    if (policy.stopPreviousSfx) stopTrackedAudioList("activeSfx", "node-leave");
    if (policy.stopPreviousStingers) {
      stopTrackedAudioList("activeStingers", "node-leave");
      stopAllDialogueAudio();
    }

    if (policy.bgmMode === "fadeout") {
      stopBgm("policy-fadeout");
    } else if (policy.bgmMode === "replace") {
      if (sceneCue.bgm) startBgm(sceneCue.bgm);
      else stopBgm("missing-next-bgm");
    } else if (policy.bgmMode === "keep" && sceneCue.bgm && audioState.currentBgm !== sceneCue.bgm) {
      startBgm(sceneCue.bgm);
    }

    if (policy.ambienceMode === "fadeout") {
      stopAmbience("policy-fadeout");
    } else if (policy.ambienceMode === "replace") {
      if (sceneCue.ambience) startAmbience(sceneCue.ambience);
      else stopAmbience("missing-next-ambience");
    } else if (policy.ambienceMode === "keep" && sceneCue.ambience && audioState.currentAmbience !== sceneCue.ambience) {
      startAmbience(sceneCue.ambience);
    }

    audioState.currentNodeId = nextNode?.nodeId || "";
    logAudioEvent("node", nextNode?.nodeId || "", "lifecycle", "", "transitioned", "", "start", prevNode?.nodeId ? "node-change" : "node-enter");
  }

  function duckBgmForSfx(durationMs = 0) {
    if (!durationMs || durationMs < 80) return;
    window.clearTimeout(audioState.duckRestoreTimer);
    const bgm = audioState.realBgm;
    const ambience = audioState.realAmbience;
    try {
      if (bgm) bgm.volume = Math.min(bgm.volume, 0.08);
      if (ambience) ambience.volume = Math.min(ambience.volume, 0.05);
    } catch (error) {}
    audioState.duckRestoreTimer = window.setTimeout(() => {
      try {
        if (bgm && audioState.realBgm === bgm) bgm.volume = scaledVolume(0.055, "bgm");
        if (ambience && audioState.realAmbience === ambience) ambience.volume = scaledVolume(0.08, "ambience");
      } catch (error) {}
    }, durationMs);
  }

  function fadeInAudio(audio, targetVolume = 0.46, fadeInMs = 0) {
    if (!audio || !fadeInMs) return;
    const startedAt = Date.now();
    try { audio.volume = 0; } catch (error) {}
    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / Math.max(1, fadeInMs));
      try { audio.volume = targetVolume * progress; } catch (error) {}
      if (progress < 1) window.setTimeout(tick, 40);
    };
    tick();
  }

  function crossfadeAudioLayer(layerName, nextAudio, targetVolume, fadeMs = 720, reason = "layer-crossfade") {
    const previousAudio = audioState[layerName];
    audioState[layerName] = nextAudio || null;
    if (nextAudio) fadeInAudio(nextAudio, targetVolume, fadeMs);
    if (previousAudio && previousAudio !== nextAudio) fadeOutAudio(previousAudio, fadeMs, reason);
  }

  function playSfx(cue = "") {
    const settings = getAudioSettings();
    const normalized = normalizeAudioCue(cue);
    const name = normalized?.key || "";
    if (!settings.audioEnabled || !settings.sfxEnabled || !audioState.unlocked || !name) return;
    const now = Date.now();
    const suppressMs = Number(normalized.suppressMs ?? 180);
    if (audioState.recentSfx[name] && now - audioState.recentSfx[name] < suppressMs) return;
    audioState.recentSfx[name] = now;
    const playNow = () => playSfxNow(normalized);
    const delayMs = Math.max(0, Number(normalized.delayMs || 0));
    if (delayMs > 0) {
      const timer = window.setTimeout(() => {
        removePendingSfxTimer(timer);
        playNow();
      }, delayMs);
      audioState.pendingSfxTimers.push(timer);
      return;
    }
    playNow();
  }

  function removePendingSfxTimer(timer) {
    const index = audioState.pendingSfxTimers.indexOf(timer);
    if (index >= 0) audioState.pendingSfxTimers.splice(index, 1);
  }

  function playSfxNow(cue = {}) {
    const name = cue.key || "";
    const src = getAudioSource("sfx", name);
    if (src) {
      const volume = scaledVolume(clampNumber(cue.volume ?? 0.46, 0.02, 1), "sfx");
      duckBgmForSfx(Number(cue.duckBgmMs || 0));
      const audio = playRealAudio(src, {
        category: "sfx",
        key: name,
        loop: false,
        volume,
        reason: cue.reason || "node-enter",
      });
      if (audio) {
        fadeInAudio(audio, volume, Number(cue.fadeInMs || 0));
        audioState.activeSfx.push(audio);
        audio.addEventListener("ended", () => removeActiveAudio("activeSfx", audio), { once: true });
        audio.addEventListener("error", () => removeActiveAudio("activeSfx", audio), { once: true });
      }
      return;
    }
  }

  function speakNode(node) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.voiceEnabled || !audioState.unlocked) return;
    if (audioState.lastVoiceNodeId === node.nodeId) return;
    stopAllDialogueAudio();
    const token = audioState.dialogueToken;
    const sessionId = audioState.dialogueSessionId;
    const realVoiceKey = node.voiceStinger || "";
    const realVoiceCategory = node.voiceStinger ? "stingers" : "";
    if (!realVoiceKey || !realVoiceCategory) return;
    const realVoiceSrc = getAudioSource(realVoiceCategory, realVoiceKey);
    if (realVoiceCategory !== "stingers" && realVoiceSrc && isPlaceholderDialogueAsset(node) && !settings.allowPlaceholderVoices) {
      if (!audioState.placeholderVoiceNoticeShown) {
        showToast("当前语音仍是临时 TTS，占位音已默认关闭，避免破坏体验。", "warn");
        audioState.placeholderVoiceNoticeShown = true;
      }
      audioState.lastVoiceNodeId = node.nodeId;
      return;
    }
    if (realVoiceSrc) {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      audioState.currentDialogueAbortController = controller;
      const audio = playRealAudio(realVoiceSrc, {
        category: realVoiceCategory,
        key: realVoiceKey,
        loop: false,
        volume: scaledVolume(realVoiceCategory === "stingers" ? 0.52 : 0.82, realVoiceCategory),
        reason: "node-enter",
        onFallbackAudio: (fallbackAudio) => {
          if (sessionId !== audioState.dialogueSessionId || token !== audioState.dialogueToken) {
            stopRealAudio(fallbackAudio);
            return;
          }
          audioState.currentDialogueAudio = fallbackAudio;
          audioState.realVoice = fallbackAudio;
        },
        onFallback: () => {
          if (sessionId === audioState.dialogueSessionId && token === audioState.dialogueToken) handleMissingRealVoice(node, settings);
        },
      });
      if (!audio) {
        handleMissingRealVoice(node, settings);
        return;
      }
      const abortPlayback = () => stopRealAudio(audio);
      controller?.signal?.addEventListener("abort", abortPlayback, { once: true });
      audio.addEventListener("ended", () => {
        if (sessionId !== audioState.dialogueSessionId) return;
        audioState.currentDialogueAudio = null;
        audioState.realVoice = null;
        audioState.currentDialogueAbortController = null;
        if (realVoiceCategory === "stingers") removeActiveAudio("activeStingers", audio);
      }, { once: true });
      audio.addEventListener("error", () => {
        if (realVoiceCategory === "stingers") removeActiveAudio("activeStingers", audio);
      }, { once: true });
      audioState.currentDialogueAudio = audio;
      audioState.realVoice = audio;
      if (realVoiceCategory === "stingers") audioState.activeStingers.push(audio);
      audioState.lastVoiceNodeId = node.nodeId;
      return;
    }
    handleMissingRealVoice(node, settings);
  }

  function handleMissingRealVoice(node, settings = getAudioSettings()) {
    if (settings.voiceMode === "fallback") {
      if (!audioState.voiceFallbackNoticeShown) {
        showToast("当前为开发用临时合成语音，正式体验不会自动朗读普通文本。", "warn");
        audioState.voiceFallbackNoticeShown = true;
      }
      speakSyntheticNode(node);
      return;
    }
    if ((node.voiceAudio || node.narrationAudio || node.voiceStinger) && !audioState.voiceMissingNoticeShown) {
      showToast("当前关键声音缺少真实音频，已跳过机械朗读。", "warn");
      audioState.voiceMissingNoticeShown = true;
    }
  }

  function speakSyntheticNode(node) {
    if (!("speechSynthesis" in window)) return;
    const raw = String(node.text || "").replace(/\s+/g, " ").trim();
    if (!raw || node.type === "choice" || node.type === "deduction" || node.type === "ending") return;
    stopSyntheticSpeech();
    const token = audioState.dialogueToken;
    const sessionId = audioState.dialogueSessionId;
    const profile = getVoiceProfile(node);
    const speechText = prepareSpeechText(raw, node, profile).slice(0, 220);
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "zh-CN";
    const selectedVoice = chooseSpeechVoice(profile);
    if (selectedVoice) utterance.voice = selectedVoice;
    const prosody = getSpeechProsody(node, profile);
    utterance.rate = prosody.rate;
    utterance.pitch = prosody.pitch;
    utterance.volume = prosody.volume;
    utterance.onstart = () => {
      if (sessionId !== audioState.dialogueSessionId || token !== audioState.dialogueToken) stopSyntheticSpeech();
    };
    utterance.onend = () => {
      if (sessionId !== audioState.dialogueSessionId) return;
      audioState.lastVoiceNodeId = "";
    };
    window.speechSynthesis.speak(utterance);
    audioState.lastVoiceNodeId = node.nodeId;
  }

  function getVoiceProfile(node) {
    const profileId = node.voiceProfile || getVisualCharacter(node.visualCharacter || node.speaker).id || "narrator";
    const profile = AUDIO.voiceProfiles?.[profileId] || {};
    const defaults = {
      narrator: { rate: 0.84, pitch: 0.88 },
      linzhou: { rate: 0.92, pitch: 0.94 },
      zhuwan: { rate: 0.88, pitch: 0.9 },
      xuzhiwan: { rate: 0.88, pitch: 0.9 },
      zhouyu: { rate: 0.84, pitch: 0.78 },
      chenyan: { rate: 1.02, pitch: 1.02 },
      zhixia: { rate: 0.82, pitch: 0.92 },
      xuzhixia: { rate: 0.82, pitch: 0.92 },
    };
    return { id: profileId, ...(defaults[profileId] || defaults.narrator), ...profile };
  }

  function clampNumber(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(max, Math.max(min, numeric));
  }

  function chooseSpeechVoice(profile = {}) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices?.() || [];
    if (!voices.length) return null;
    const zhVoices = voices.filter((voice) =>
      /^zh/i.test(voice.lang || "") || /Chinese|Mandarin|中文|普通话|國語/i.test(voice.name || "")
    );
    const pool = zhVoices.length ? zhVoices : voices;
    const hints = profile.voiceHints || getDefaultVoiceHints(profile.id, profile.gender);
    const hinted = pool.find((voice) => hints.some((hint) => new RegExp(hint, "i").test(voice.name || "")));
    if (hinted) return hinted;
    const gender = String(profile.gender || "");
    if (gender.includes("female")) {
      return pool.find((voice) => /female|xia|hui|yao|han|female/i.test(voice.name || "")) || pool[0];
    }
    if (gender.includes("male")) {
      return pool.find((voice) => /male|yun|kang|zhi|male/i.test(voice.name || "")) || pool[0];
    }
    return pool[0];
  }

  function getDefaultVoiceHints(profileId = "", gender = "") {
    const hintMap = {
      narrator: ["Yunyang", "Yunjian", "Kangkang", "Male", "Huihui"],
      linzhou: ["Yunxi", "Yunyang", "Kangkang", "Male"],
      zhouyu: ["Yunyang", "Yunjian", "Kangkang", "Male"],
      xuzhiwan: ["Xiaoxiao", "Xiaoyi", "Huihui", "Female"],
      zhuwan: ["Xiaoxiao", "Xiaoyi", "Huihui", "Female"],
      chenyan: ["Xiaoyi", "Xiaoxiao", "Huihui", "Female"],
      xuzhixia: ["Xiaoxiao", "Huihui", "Female"],
      zhixia: ["Xiaoxiao", "Huihui", "Female"],
    };
    return hintMap[profileId] || (String(gender).includes("female") ? hintMap.xuzhiwan : hintMap.narrator);
  }

  function getSpeechProsody(node, profile = {}) {
    const emotion = `${node.voiceEmotion || ""} ${node.audioMood || ""} ${profile.emotion || ""}`.toLowerCase();
    let rate = Number(node.voiceSpeed || profile.rate || 0.92);
    let pitch = Number(node.voicePitch || profile.pitch || 0.95);
    let volume = Number(profile.volume || 0.74);
    if (/horror|fear|whisper|recording|memory/.test(emotion)) {
      rate -= 0.07;
      pitch -= 0.04;
      volume -= 0.05;
    }
    if (/pressure|threat|angry|cold/.test(emotion)) {
      rate -= 0.05;
      pitch -= 0.08;
      volume += 0.03;
    }
    if (/fast|urgent|shocked/.test(emotion)) rate += 0.06;
    return {
      rate: clampNumber(rate, 0.68, 1.18),
      pitch: clampNumber(pitch, 0.65, 1.25),
      volume: clampNumber(volume, 0.46, 0.9),
    };
  }

  function prepareSpeechText(raw, node, profile = {}) {
    let text = raw
      .replace(/【([^】]+)】/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    const emotion = `${node.voiceEmotion || ""} ${node.audioMood || ""} ${profile.emotion || ""}`.toLowerCase();
    text = text.replace(/。/g, "。 ").replace(/，/g, "， ").replace(/；/g, "； ");
    if (/horror|fear|whisper|recording|memory/.test(emotion)) {
      text = text.replace(/。/g, "…… ").replace(/！/g, "。 ");
    }
    if (/pressure|threat|cold/.test(emotion)) {
      text = text.replace(/，/g, "，…… ").replace(/。/g, "。 ");
    }
    if (node.voiceDirection && /旧手机|录音|电流|噪声/.test(node.voiceDirection)) {
      text = `……${text}`;
    }
    return text;
  }

  function updateAudioForNode(node, sceneCue = {}) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !audioState.unlocked) return;
    const prevNode = audioState.currentNodeId ? DATA.nodes?.[audioState.currentNodeId] : null;
    transitionAudioForNode(prevNode, node, sceneCue);
    const sfxList = Array.isArray(sceneCue.sfx) ? sceneCue.sfx : sceneCue.sfx ? [sceneCue.sfx] : [];
    sfxList.forEach((name) => playSfx(name));
    speakNode(node);
  }

  function stopAllAudio() {
    stopNodeTransientAudio("all-audio-stop");
    stopAllDialogueAudio();
    stopAudioHandle(audioState.bgm);
    stopAudioHandle(audioState.ambience);
    stopRealAudio(audioState.realBgm);
    stopRealAudio(audioState.realEntryBgm);
    stopRealAudio(audioState.realAmbience);
    audioState.bgm = null;
    audioState.ambience = null;
    audioState.realBgm = null;
    audioState.realEntryBgm = null;
    audioState.realAmbience = null;
    audioState.currentBgm = "";
    audioState.currentEntryBgm = "";
    audioState.currentAmbience = "";
  }

  function toggleAudio() {
    const next = !isAudioEnabled();
    saveAudioSettings({ audioEnabled: next });
    if (next) {
      unlockAudio();
      const node = getNode();
      if (currentView === "hall" || currentView === "series") startEntryMusic("life_archive_theme");
      else if (node) prepareAudioCue(node);
      showToast("声音已开启", "clue");
    } else {
      stopAllAudio();
      showToast("声音已关闭", "warn");
    }
    refreshGameMeta();
  }

  function getTotalClueCount() {
    return Object.keys(DATA.clues).length;
  }

  function getCoreClueCount() {
    return CORE_CLUE_IDS.filter((clueId) => state.clues.includes(clueId)).length;
  }

  function createDefaultRelationships() {
    return RELATIONSHIP_DEFS.reduce((result, item) => {
      result[item.id] = 0;
      return result;
    }, {});
  }

  function normalizeRelationships(input) {
    const base = createDefaultRelationships();
    if (!input || typeof input !== "object") return base;
    RELATIONSHIP_DEFS.forEach((item) => {
      const value = Number(input[item.id]);
      base[item.id] = Number.isFinite(value) ? clampRelationship(value) : 0;
    });
    return base;
  }

  function clampRelationship(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
  }

  function getRelationshipDef(id) {
    return RELATIONSHIP_DEFS.find((item) => item.id === id);
  }

  function getRelationshipLevel(def, value) {
    if (value <= 20) return def.levels[0];
    if (value <= 50) return def.levels[1];
    if (value <= 80) return def.levels[2];
    return def.levels[3];
  }

  function getLastRelationshipEvent(id) {
    return [...(state.relationshipEvents || [])].reverse().find((event) => event.id === id);
  }
  function renderTruthMeter() {
    const count = getCoreClueCount();
    const pieces = CORE_CLUE_IDS
      .map((clueId) => `<i class="${state.clues.includes(clueId) ? "is-lit" : ""}"></i>`)
      .join("");
    return `
      <div class="truth-meter ${count ? "has-progress" : ""}">
        <span>真相进度</span>
        <strong>${count}/${CORE_CLUE_IDS.length}</strong>
        <div class="truth-pieces" aria-hidden="true">${pieces}</div>
      </div>
    `;
  }

  function getCurrentObjective(node = getNode()) {
    if (!node?.objectiveId || !node?.objectiveText) return null;
    const done = (state.completedObjectives || []).includes(node.objectiveId);
    return { id: node.objectiveId, text: node.objectiveText, done };
  }

  function renderObjectivePanel(node) {
    const objective = getCurrentObjective(node);
    if (!objective) return "";
    return `
      <section class="objective-panel ${objective.done ? "is-done" : ""}">
        <span>当前目标</span>
        <strong>${escapeHTML(objective.text)}</strong>
      </section>
    `;
  }

  function completeObjective(node) {
    if (!node?.objectiveId || node.objectiveComplete !== true) return;
    state.completedObjectives ||= [];
    if (state.completedObjectives.includes(node.objectiveId)) return;
    state.completedObjectives.push(node.objectiveId);
    showToast(`目标完成：${node.objectiveText || node.objectiveId}`, "clue");
  }

  function markNodeRead(node) {
    if (!node?.nodeId) return;
    state.readNodes ||= [];
    if (!state.readNodes.includes(node.nodeId)) state.readNodes.push(node.nodeId);
  }

  function unlockGalleryForNode(node) {
    const ids = [node?.scene, node?.visualCharacter, ...(node?.highlightProps || [])].filter(Boolean);
    state.galleryUnlocks ||= [];
    ids.forEach((id) => {
      if (!state.galleryUnlocks.includes(id)) state.galleryUnlocks.push(id);
    });
    saveStoredCollection({ gallery: state.galleryUnlocks });
  }

  function ensureChapterStats(chapterId) {
    if (!chapterId) return null;
    if (!state.chapterStats[chapterId]) {
      state.chapterStats[chapterId] = {
        clues: [],
        choices: [],
        summaryShown: false,
      };
    }
    state.chapterStats[chapterId].clues ||= [];
    state.chapterStats[chapterId].choices ||= [];
    state.chapterStats[chapterId].summaryShown ||= false;
    return state.chapterStats[chapterId];
  }

  function hasProgress(scriptId = state?.scriptId || "script_rain_call") {
    const progress = readJSON(getStoryStorageKeys(scriptId).progress, null);
    return Boolean(progress && progress.scriptId === scriptId && progress.nodeId);
  }

  function loadProgress(scriptId = state?.scriptId || "script_rain_call") {
    const progress = readJSON(getStoryStorageKeys(scriptId).progress, null);
    if (!progress || progress.scriptId !== scriptId) return false;
    state = normalizeState(progress);
    return true;
  }

  function normalizeState(input) {
    const scriptId = getDataset(input?.scriptId) === RAIN_DATA && input?.scriptId !== "script_rain_call"
      ? "script_rain_call"
      : input?.scriptId || "script_rain_call";
    activateStory(scriptId);
    const validClueIds = new Set(Object.keys(DATA.clues));
    const normalizedClues = Array.isArray(input.clues)
      ? input.clues.filter((clueId) => validClueIds.has(clueId))
      : [];
    const normalizedUnreadClues = Array.isArray(input.unreadClues)
      ? input.unreadClues.filter((clueId) => validClueIds.has(clueId))
      : [];
    const normalizedNodeId = DATA.nodes[input.nodeId] ? input.nodeId : (DATA.script?.startNodeId || getScript(scriptId)?.startNodeId || "ch01_001");
    const normalizedEndingId = input.endingId && DATA.endings[input.endingId] ? input.endingId : null;
    return {
      ...createInitialState(scriptId),
      ...input,
      nodeId: normalizedNodeId,
      endingId: normalizedEndingId,
      flags: { ...DATA.defaultFlags, ...(input.flags || {}) },
      clues: normalizedClues,
      history: Array.isArray(input.history) ? input.history : [],
      deductionScore: Number(input.deductionScore || 0),
      unreadClues: normalizedUnreadClues,
      chapterStats: input.chapterStats && typeof input.chapterStats === "object" ? input.chapterStats : {},
      triggeredMilestones: Array.isArray(input.triggeredMilestones) ? input.triggeredMilestones : [],
      achievements: Array.from(new Set([...(loadStoredAchievements(scriptId) || []), ...((Array.isArray(input.achievements) && input.achievements) || [])])),
      sessionAchievements: Array.isArray(input.sessionAchievements) ? input.sessionAchievements : [],
      importantChoices: Array.isArray(input.importantChoices) ? input.importantChoices : [],
      truthNotices: Array.isArray(input.truthNotices) ? input.truthNotices : [],
      relationships: normalizeRelationships(input.relationships),
      relationshipEvents: Array.isArray(input.relationshipEvents) ? input.relationshipEvents : [],
      endingPathTags: Array.isArray(input.endingPathTags) ? input.endingPathTags : [],
      completedObjectives: Array.isArray(input.completedObjectives) ? input.completedObjectives : [],
      checkedHotspots: Array.isArray(input.checkedHotspots) ? input.checkedHotspots : [],
      evidenceConnections: Array.isArray(input.evidenceConnections) ? input.evidenceConnections : [],
      ruleStatuses: input.ruleStatuses && typeof input.ruleStatuses === "object" ? input.ruleStatuses : {},
      endingCollection: Array.from(new Set([...(loadStoredCollection(scriptId).endings || []), ...((Array.isArray(input.endingCollection) && input.endingCollection) || [])])),
      galleryUnlocks: Array.from(new Set([...(loadStoredCollection(scriptId).gallery || []), ...((Array.isArray(input.galleryUnlocks) && input.galleryUnlocks) || [])])),
      readNodes: Array.isArray(input.readNodes) ? input.readNodes : [],
    };
  }

  function snapshotState() {
    return {
      ...state,
      flags: { ...state.flags },
      clues: [...state.clues],
      history: [...state.history],
      relationships: { ...state.relationships },
      relationshipEvents: [...(state.relationshipEvents || [])],
      endingPathTags: [...(state.endingPathTags || [])],
      completedObjectives: [...(state.completedObjectives || [])],
      checkedHotspots: [...(state.checkedHotspots || [])],
      evidenceConnections: [...(state.evidenceConnections || [])],
      ruleStatuses: { ...(state.ruleStatuses || {}) },
      endingCollection: [...(state.endingCollection || [])],
      galleryUnlocks: [...(state.galleryUnlocks || [])],
      readNodes: [...(state.readNodes || [])],
      updatedAt: new Date().toISOString(),
    };
  }

  function autoSave() {
    state.updatedAt = new Date().toISOString();
    const keys = getStoryStorageKeys(state.scriptId);
    saveJSON(keys.progress, snapshotState());
    saveJSON(keys.history, state.history);
  }

  function setView(name, html) {
    currentView = name;
    app.className = `app-shell view-${name}`;
    app.dataset.view = name;
    document.body.dataset.view = name;
    app.innerHTML = html;
    window.requestAnimationFrame(() => app.classList.add("is-view-ready"));
  }

  function isStandaloneMode() {
    return window.matchMedia?.("(display-mode: standalone)").matches === true || window.navigator.standalone === true;
  }

  function isMobileViewport() {
    return window.matchMedia?.("(max-width: 700px)").matches === true || window.matchMedia?.("(pointer: coarse)").matches === true;
  }

  function requestImmersiveMode() {
    if (immersiveAttempted || isStandaloneMode() || !isMobileViewport()) return;
    immersiveAttempted = true;
    const root = document.documentElement;
    if (!document.fullscreenEnabled || document.fullscreenElement || typeof root.requestFullscreen !== "function") return;
    root.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  }

  function maybeOfferInstallGuide() {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    if (!isMobileViewport() || isStandaloneMode() || saved.installGuideDismissed === true) return;
    window.setTimeout(() => {
      if (currentView !== "hall" || !modalRoot.classList.contains("hidden")) return;
      openModal(
        "更沉浸地阅读",
        "MOBILE EXPERIENCE",
        `<p class="notice-text">将《第二人生》添加到主屏幕后，可以像独立应用一样打开。iPhone 请在 Safari 的分享菜单中选择“添加到主屏幕”；安卓可在浏览器菜单中选择“安装应用”或“添加到主屏幕”。</p>`
      );
      saveAudioSettings({ installGuideDismissed: true });
    }, 700);
  }

  function bindPageLifecycle() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopNodeTransientAudio("backgrounded");
    });
  }

  function showSplash() {
    setView(
      "splash",
      `
      <section class="splash-screen">
        <img class="splash-hero-art" src="${escapeHTML(VISUALS.covers?.home || "")}" alt="" aria-hidden="true" />
        <div class="splash-veil" aria-hidden="true"></div>
        <div class="splash-content">
          <p class="brand-mark">SECOND LIFE / 人生档案计划</p>
          <p class="splash-index">ARCHIVE ACCESS 0001</p>
          <h1>${escapeHTML(DATA.product.name)}</h1>
          <p class="splash-subtitle">${escapeHTML(DATA.product.subtitle)}</p>
          <p class="splash-intro">每一次选择，都会走向另一种人生。</p>
          <div class="splash-action">
            <button class="primary-cta" type="button" data-action="enter-hall"><span>进入人生档案</span><i aria-hidden="true">&#8594;</i></button>
            <small>首次操作后轻柔开启声音，可随时关闭。</small>
          </div>
        </div>
        <footer class="splash-footer"><span>01 / PUBLIC ARCHIVE</span><span>请妥善保管你的选择</span></footer>
      </section>
      `
    );
    app.querySelector("[data-action='enter-hall']").addEventListener("click", () => {
      requestImmersiveMode();
      unlockAudio();
      showHall();
    });
  }

  function showHall() {
    stopNodeTransientAudio("leave-game");
    stopBgm("return-to-archive");
    stopAmbience("return-to-archive");
    startEntryMusic("life_archive_theme");
    const availableSeries = STORY_CATALOG.series.filter((series) => series.status === "open");
    const openSeries = availableSeries[0];
    const ledgerSeries = STORY_CATALOG.series
      .filter((series) => series !== openSeries)
      .sort((left, right) => {
        const leftScript = left.scriptIds?.[0] ? getScript(left.scriptIds[0]) : null;
        const rightScript = right.scriptIds?.[0] ? getScript(right.scriptIds[0]) : null;
        const leftOrder = Number(leftScript?.order || 99);
        const rightOrder = Number(rightScript?.order || 99);
        return leftOrder - rightOrder;
      });
    const lockedRows = ledgerSeries.map((series, index) => {
      const seriesScript = series.scriptIds?.[0] ? getScript(series.scriptIds[0]) : null;
      const storyOrder = Number(seriesScript?.order || index + 2);
      return `
      <button class="archive-ledger-row" type="button" data-series-id="${series.seriesId}">
        <span class="archive-ledger-index">${String(storyOrder).padStart(2, "0")}</span>
        <strong>${escapeHTML(series.title)}</strong>
        <span>${series.status === "open" ? "可读取" : "档案封存中"}</span>
        <i aria-hidden="true">&#8594;</i>
      </button>
    `;
    }).join("");

    setView(
      "hall",
      `
      <section class="hall-screen">
        <header class="page-header archive-header">
          <p class="eyebrow">SECOND LIFE / LIFE ARCHIVE</p>
          <h1>人生档案</h1>
          <p>这里保存着尚未结束的人生。选择一份档案，接过其中的秘密、选择与结局。</p>
        </header>
        ${openSeries ? `
          <article class="archive-feature" data-series-id="${openSeries.seriesId}">
            <img src="${escapeHTML(VISUALS.covers?.home || "")}" alt="《${escapeHTML(openSeries.title)}》故事封面" />
            <div class="archive-feature-scrim" aria-hidden="true"></div>
            <div class="archive-feature-copy">
              <p class="archive-status">开放档案 / 01</p>
              <span class="story-kind">悬疑人生</span>
              <h2>${escapeHTML(openSeries.title)}</h2>
              <p>${escapeHTML(openSeries.summary)}</p>
              <button class="case-button" type="button">查看档案 <i aria-hidden="true">&#8594;</i></button>
            </div>
          </article>
        ` : `<div class="archive-empty-state"><p>暂时没有可读取的档案。</p></div>`}
        <section class="archive-ledger" aria-label="更多档案">
          <div class="archive-ledger-head"><p>更多人生</p><span>${ledgerSeries.filter((series) => series.status === "open").length} 份可读取，${ledgerSeries.filter((series) => series.status !== "open").length} 份仍在等待</span></div>
          ${lockedRows}
        </section>
      </section>
      `
    );

    app.querySelectorAll("[data-series-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const series = getSeries(card.dataset.seriesId);
        if (series.status !== "open") {
          openNotice("未开放", "这组档案仍在封存中。请等下一次雨夜。");
          return;
        }
        showSeries(series.seriesId);
      });
    });
    maybeOfferInstallGuide();
  }

  function showSeries(seriesId) {
    const series = getSeries(seriesId);
    const scripts = series.scriptIds.map((id) => getScript(id)).filter(Boolean);
    const openScript = scripts.find((script) => script.status === "open") || scripts[0];
    const sealedScripts = scripts.filter((script) => script.scriptId !== openScript.scriptId);
    const hasLocalProgress = hasProgress(openScript.scriptId);
    const previewData = getDataset(openScript.scriptId);
    const previewVisuals = STORY_VISUALS[openScript.scriptId] || RAIN_VISUALS;
    const sealedRows = sealedScripts
      .map((script) => `
        <article class="sealed-story-note">
          <span>\u6863\u6848\u5c01\u5b58\u4e2d</span>
          <strong>\u300a${escapeHTML(script.title)}\u300b</strong>
          <p>${escapeHTML(script.summary || "\u8fd9\u6bb5\u4eba\u751f\u8fd8\u6ca1\u6709\u5411\u4f60\u6253\u5f00\u3002")}</p>
        </article>
      `)
      .join("");
    const primaryActionText = hasLocalProgress ? "\u7ee7\u7eed\u4f53\u9a8c" : "\u5f00\u59cb\u4f53\u9a8c";

    setView(
      "series",
      `
      <section class="series-screen story-file-screen">
        <button class="back-link" type="button" data-action="back-hall">\u2190 \u8fd4\u56de\u4eba\u751f\u6863\u6848</button>
        <header class="series-brief story-file-brief">
          <img class="story-file-cover" src="${escapeHTML(previewVisuals.covers?.home || "")}" alt="" aria-hidden="true" />
          <div class="story-file-cover-scrim" aria-hidden="true"></div>
          <div class="story-file-copy">
            <p class="eyebrow">LIFE FILE</p>
            <p class="story-file-number">ARCHIVE / ${String(openScript.order || 1).padStart(2, "0")} / AVAILABLE</p>
            <h1>${escapeHTML(openScript.title)}</h1>
            <p>${escapeHTML(previewData.script?.summary || openScript.summary || "")}</p>
            <div class="story-file-tags"><span>互动悬疑</span><span>${escapeHTML(openScript.seriesId === "series_dormitory_rollcall" ? "校园规则" : "都市雨夜")}</span><span>多结局</span></div>
            <p class="story-file-intro">${escapeHTML(openScript.summary)}</p>
            <div class="story-file-actions">
              <button class="case-button" type="button" data-action="start-script">${primaryActionText}</button>
              ${hasLocalProgress ? `<button class="ghost-button" type="button" data-action="restart-script">\u91cd\u65b0\u5f00\u59cb</button>` : ""}
            </div>
          </div>
        </header>
        <aside class="story-file-sealed" aria-label="\u540e\u7eed\u6545\u4e8b">
          <p>\u540e\u7eed\u4eba\u751f</p>
          ${sealedRows}
        </aside>
      </section>
      `
    );
    startEntryMusic("life_archive_theme");

    app.querySelector("[data-action='back-hall']").addEventListener("click", showHall);
    app.querySelector("[data-action='start-script']").addEventListener("click", () => {
      requestImmersiveMode();
      if (hasLocalProgress) {
        openConfirm("\u7ee7\u7eed\u4f53\u9a8c", "\u68c0\u6d4b\u5230\u672c\u5730\u8fdb\u5ea6\u3002\u8981\u4ece\u4e0a\u6b21\u4fdd\u5b58\u7684\u4eba\u751f\u8282\u70b9\u7ee7\u7eed\u5417\uff1f", () => {
          loadProgress(openScript.scriptId);
          showGame();
        }, () => startNewGame(openScript.scriptId));
      } else {
        startNewGame(openScript.scriptId);
      }
    });
    app.querySelector("[data-action='restart-script']")?.addEventListener("click", () => {
      openConfirm("重新开始", `将从《${openScript.title}》的第一个节点重新进入。`, () => startNewGame(openScript.scriptId));
    });
  }


  function startNewGame(scriptId = state?.scriptId || "script_rain_call") {
    stopNodeTransientAudio("restart");
    stopEntryMusic("story-start");
    visualState = { current: null };
    unlockAudio();
    state = createInitialState(scriptId);
    autoSave();
    showGame();
  }

  function showGame() {
    stopEntryMusic("story-enter");
    activateStory(state.scriptId || "script_rain_call");
    const node = getNode();
    if (!node) {
      showToast("剧情节点缺失，已返回人生档案。", "warn");
      showHall();
      return;
    }
    applyNodeEffects(node);
    prepareAudioCue(node);

    const chapter = getChapter(node.chapterId);
    const sceneClass = `scene-${node.scene || "rental_room_rain_night"}`;
    const gameModeClass = (node.type === "choice" || node.type === "deduction") ? "is-choice-node" : "is-reading-node";
    const readingSettings = getReadingSettings();
    const previousVisual = visualState.current;
    const sceneMarkup = renderSceneVisual(node, previousVisual);
    visualState.current = getSceneSnapshot(node);
    setView(
      "game",
      `
      <section class="game-screen mobile-story-root ${sceneClass} ${gameModeClass} ${readingSettings.deepDarkMode ? "is-deep-dark" : ""} ${readingSettings.hideUi ? "is-ui-hidden" : ""}" style="--reader-scale: ${readingSettings.fontScale}">
        <header class="game-topbar">
          <div class="game-title">
            <span>${escapeHTML(getScript().title)}</span>
            <strong>${escapeHTML(chapter?.title || node.chapterTitle || "")}</strong>
          </div>
          ${renderTruthMeter()}
          <button class="game-menu-button" type="button" data-tool="menu" aria-expanded="false">菜单</button>
          <nav class="toolbox" aria-label="游戏工具栏">
            ${state.scriptId === "script_dormitory_rollcall" ? `<button type="button" data-tool="rules">规则</button>` : ""}
            <button type="button" data-tool="clues" class="clue-tool ${state.unreadClues.length ? "has-unread" : ""}">
              线索 <span>${state.clues.length}/${getTotalClueCount()}</span>
            </button>
            <button type="button" data-tool="evidence">证据板</button>
            <button type="button" data-tool="relationships">人物</button>
            <button type="button" data-tool="audio">声音</button>
            <button type="button" data-tool="reader">阅读</button>
            <button type="button" data-tool="archive">档案馆</button>

            <button type="button" data-tool="save">存档</button>
            <button type="button" data-tool="load">读档</button>
            <button type="button" data-tool="history">历史</button>
            <button type="button" data-tool="hall">返回人生档案</button>
          </nav>
        </header>
        ${renderObjectivePanel(node)}
        <div class="scene-stage">
          ${sceneMarkup}
        </div>
        <section class="dialogue-panel" data-dialogue-advance tabindex="0" aria-label="剧情对话，点击此处继续阅读">
          <div class="speaker-tag">${escapeHTML(node.speaker || "旁白")}</div>
          <div class="dialogue-text">${formatText(node.text)}</div>
          <div id="choiceArea" class="choice-area"></div>
          <div class="dialogue-actions">
            <span class="node-id" aria-hidden="true">${escapeHTML(node.nodeId)}</span>
            <button id="continueButton" class="continue-button" type="button">继续</button>
          </div>
        </section>
      </section>
      `
    );

    bindGameToolbar();
    bindSceneInteractions();
    renderNodeControls(node);
    bindDialogueAdvance(node);
    bindSceneVisualReadiness();
    preloadUpcomingVisuals(node);
    autoSave();
    processFeedbackQueue();
  }

  function applyNodeEffects(node) {
    markNodeRead(node);
    completeObjective(node);
    unlockGalleryForNode(node);
    gainClues(node.gainClues || []);
    setFlags(node.setFlags || []);
    applyRuleUpdates(node.ruleUpdates || []);
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
    nodeActionLocked = false;

    if (node.resolveEnding === true) {
      continueButton.textContent = "查看结局";
      continueButton.addEventListener("click", () => {
        if (!lockNodeAction(continueButton)) return;
        stopNodeTransientAudio("continue");
        state.endingId = resolveEnding();
        autoSave();
        showEnding(state.endingId);
      });
      return;
    }

    if (node.type === "choice" || node.type === "deduction") {
      continueButton.classList.add("hidden");
      const nodeChoices = (node.choices && node.choices.length ? node.choices : node.question?.choices || []);
      choiceArea.innerHTML = nodeChoices
        .map((choice) => `
          <button class="choice-button" type="button" data-choice-id="${choice.choiceId}">
            ${choice.choiceIntent ? `<small>${escapeHTML(choice.choiceIntent)}</small>` : ""}
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
      continueButton.addEventListener("click", () => {
        if (!lockNodeAction(continueButton)) return;
        stopAllDialogueAudio();
        showEnding(node.nodeId);
      });
      return;
    }

    continueButton.addEventListener("click", () => advanceStoryNode(node, continueButton));
  }

  function advanceStoryNode(node, control = null) {
    if (!lockNodeAction(control)) return;
    stopNodeTransientAudio("continue");
    if (node.nextNodeId) {
      goToNode(node.nextNodeId);
    } else {
      state.endingId = resolveEnding();
      showEnding(state.endingId);
    }
  }

  function bindDialogueAdvance(node) {
    if (node.type === "choice" || node.type === "deduction" || node.resolveEnding === true || node.type === "ending") return;
    const panel = app.querySelector("[data-dialogue-advance]");
    const continueButton = document.getElementById("continueButton");
    if (!panel || !continueButton) return;
    const isInteractiveTarget = (target) => target instanceof Element && Boolean(target.closest("button, a, input, select, textarea, label, [data-tool], [data-hotspot-id]"));
    const canAdvance = (event) => {
      if (nodeActionLocked || !modalRoot.classList.contains("hidden") || isInteractiveTarget(event.target)) return false;
      if (window.getSelection?.().toString().trim()) return false;
      return true;
    };
    panel.addEventListener("pointerdown", (event) => {
      if (!canAdvance(event)) {
        dialoguePointerStart = null;
        return;
      }
      dialoguePointerStart = { x: event.clientX, y: event.clientY };
    });
    panel.addEventListener("pointerup", (event) => {
      if (!dialoguePointerStart || !canAdvance(event)) return;
      const distance = Math.hypot(event.clientX - dialoguePointerStart.x, event.clientY - dialoguePointerStart.y);
      dialoguePointerStart = null;
      if (distance > 10) return;
      advanceStoryNode(node, continueButton);
    });
    panel.addEventListener("keydown", (event) => {
      if ((event.key !== "Enter" && event.key !== " ") || !canAdvance(event)) return;
      event.preventDefault();
      advanceStoryNode(node, continueButton);
    });
  }

  function lockNodeAction(button = null) {
    if (nodeActionLocked) return false;
    nodeActionLocked = true;
    button?.setAttribute("aria-busy", "true");
    document.querySelectorAll("#continueButton, #choiceArea .choice-button").forEach((control) => {
      control.disabled = true;
    });
    return true;
  }

  function handleChoice(node, choiceId) {
    if (!lockNodeAction()) return;
    const choice = (node.choices && node.choices.length ? node.choices : node.question?.choices || []).find((item) => item.choiceId === choiceId);
    if (!choice) return;
    stopNodeTransientAudio("choice");
    recordChoice(node, choice);
    addHistory({
      type: "choice",
      speaker: "你的选择",
      text: choice.text,
      nodeId: node.nodeId,
    });
    gainClues(choice.gainClues || []);
    setFlags(choice.setFlags || []);
    applyRuleUpdates(choice.ruleUpdates || []);
    applyRelationshipEffects(choice.relationshipEffects || []);
    recordEndingPathTags(choice.endingPathTags || []);
    if (node.type === "deduction" && choice.isCorrect === true) {
      state.deductionScore += 1;
    }
    const choiceSfx = []
      .concat(choice.sfxOnChoice || [])
      .concat(node.sfxOnChoice || [])
      .filter(Boolean);
    enqueueFeedback({
      type: "choice",
      title: choice.feedbackTitle || (node.type === "deduction" ? (choice.isCorrect ? "推理成立" : "推理偏差") : "选择留下痕迹"),
      tone: choice.feedbackTone || (node.type === "deduction" ? (choice.isCorrect ? "correct" : "wrong") : "neutral"),
      isDeduction: node.type === "deduction",
      choiceText: choice.text,
      text: choice.choiceImpactText || "这个选择已被记录。",
      relationshipEffects: choice.relationshipEffects || [],
      gainClues: choice.gainClues || [],
    });
    evaluateProgressTriggers();
    evaluateAchievements();
    autoSave();
    if (choice.nextNodeId) {
      goToNode(choice.nextNodeId);
    } else {
      state.endingId = resolveEnding();
      showEnding(state.endingId);
    }
    choiceSfx.forEach((item) => playSfx(item));
  }

  function applyRuleUpdates(updates) {
    if (!Array.isArray(updates) || updates.length === 0) return;
    state.ruleStatuses ||= {};
    updates.forEach((update) => {
      if (update?.ruleId && update.status) state.ruleStatuses[update.ruleId] = update.status;
    });
  }

  function applyRelationshipEffects(effects) {
    if (!Array.isArray(effects) || effects.length === 0) return;
    effects.forEach((effect) => {
      const def = getRelationshipDef(effect.id);
      if (!def) return;
      const before = state.relationships[effect.id] || 0;
      const after = clampRelationship(before + Number(effect.delta || 0));
      state.relationships[effect.id] = after;
      const event = {
        id: effect.id,
        delta: after - before,
        before,
        after,
        reason: effect.reason || "关键选择影响",
        nodeId: state.nodeId,
        time: new Date().toISOString(),
      };
      state.relationshipEvents.push(event);
      if (event.delta !== 0) {
        showToast(`人物关系变化：${def.character}${def.label} ${event.delta > 0 ? "+" : ""}${event.delta}`, "relationship");
      }
    });
  }

  function recordEndingPathTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return;
    state.endingPathTags ||= [];
    tags.forEach((tag) => {
      if (tag && !state.endingPathTags.includes(tag)) state.endingPathTags.push(tag);
    });
  }
  function goToNode(nodeId) {
    stopNodeTransientAudio("node-change");
    if (DATA.endings[nodeId]) {
      showEnding(nodeId);
      return;
    }
    const previousNode = getNode();
    const nextNode = DATA.nodes[nodeId];
    const chapterFeedback =
      previousNode && nextNode && previousNode.chapterId !== nextNode.chapterId
        ? buildChapterSummaryFeedback(previousNode.chapterId, nextNode.chapterId, previousNode.chapterRecap)
        : null;
    state.nodeId = nodeId;
    showGame();
    if (chapterFeedback) {
      enqueueFeedback(chapterFeedback, true);
    }
  }

  function gainClues(clueIds) {
    clueIds.forEach((clueId) => {
      if (!clueId || !DATA.clues[clueId] || state.clues.includes(clueId)) return;
      state.clues.push(clueId);
      if (!state.unreadClues.includes(clueId)) state.unreadClues.push(clueId);
      recordChapterClue(clueId);
      showToast(`线索已归档：${DATA.clues[clueId].title}`, "clue");
      if (FOCUSED_CLUE_REVEALS.has(clueId)) {
        enqueueFeedback({ type: "clue", clueId });
      }
      maybeShowTruthNotice();
    });
    evaluateProgressTriggers();
    evaluateAchievements();
  }

  function setFlags(flagIds) {
    flagIds.forEach((flagId) => {
      if (!flagId) return;
      state.flags[flagId] = true;
    });
    evaluateProgressTriggers();
    evaluateAchievements();
  }

  function recordChapterClue(clueId) {
    const node = getNode();
    const stats = ensureChapterStats(node?.chapterId);
    if (stats && !stats.clues.includes(clueId)) stats.clues.push(clueId);
  }

  function recordChoice(node, choice) {
    const stats = ensureChapterStats(node.chapterId);
    const entry = {
      chapterId: node.chapterId,
      nodeId: node.nodeId,
      text: choice.text,
      flags: [...(choice.setFlags || [])],
      time: new Date().toISOString(),
    };
    if (stats) stats.choices.push(entry);
    if ((choice.setFlags || []).length || node.type === "choice") {
      state.importantChoices.push(entry);
      if (state.importantChoices.length > 80) state.importantChoices.shift();
    }
  }

  function buildChapterSummaryFeedback(chapterId, nextChapterId, recap = null) {
    const stats = ensureChapterStats(chapterId);
    if (!stats || stats.summaryShown) return null;
    stats.summaryShown = true;
    const chapter = getChapter(chapterId);
    const nextChapter = getChapter(nextChapterId);
    return {
      type: "chapter",
      chapterId,
      nextChapterId,
      title: `${chapter?.title || "本章"}完成`,
      nextTitle: nextChapter?.title || "下一章",
      clues: [...stats.clues],
      choices: [...stats.choices],
      recap,
    };
  }

  function evaluateProgressTriggers() {
    MILESTONES.forEach((milestone) => {
      if (state.triggeredMilestones.includes(milestone.milestoneId)) return;
      if (!milestone.test()) return;
      state.triggeredMilestones.push(milestone.milestoneId);
      showToast(`${milestone.title}：${milestone.text}`, "clue");
    });
  }

  function evaluateAchievements() {
    ACHIEVEMENTS.forEach((achievement) => {
      if (state.achievements.includes(achievement.achievementId)) return;
      if (!achievement.test()) return;
      state.achievements.push(achievement.achievementId);
      state.sessionAchievements.push(achievement.achievementId);
      saveJSON(getStoryStorageKeys(state.scriptId).achievements, state.achievements);
      showToast(`成就解锁：${achievement.title}`, "achievement");
    });
  }

  function maybeShowTruthNotice() {
    const count = getCoreClueCount();
    if (![3, 5, 6].includes(count) || state.truthNotices.includes(count)) return;
    state.truthNotices.push(count);
  }

  function enqueueFeedback(item, first = false) {
    if (!item) return;
    if (first) {
      feedbackQueue.unshift(item);
    } else {
      feedbackQueue.push(item);
    }
    window.setTimeout(processFeedbackQueue, 0);
  }

  function processFeedbackQueue() {
    if (!feedbackQueue.length || !modalRoot.classList.contains("hidden")) return;
    const item = feedbackQueue.shift();
    if (!item) return;
    if (item.type === "clue") {
      openClueRevealFeedback(item.clueId);
      return;
    }
    if (item.type === "chapter") {
      openChapterSummaryFeedback(item);
      return;
    }
    if (item.type === "choice") {
      openChoiceFeedback(item);
      return;
    }
    if (item.type === "milestone") {
      openMilestoneFeedback(item);
    }
  }

  function continueFeedbackQueue() {
    window.setTimeout(processFeedbackQueue, 80);
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
    if (typeof activeProfile.endingResolver === "function") {
      return activeProfile.endingResolver(state);
    }
    const clues = new Set(state.clues);
    const flags = state.flags;
    if (flags.deleted_evidence === true && flags.backed_up_photo !== true) {
      return "ending_c";
    }
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
    stopNodeTransientAudio("ending");
    const ending = DATA.endings[endingId] || DATA.endings.ending_d || Object.values(DATA.endings)[0];
    state.endingId = ending.endingId;
    state.nodeId = ending.endingId;
    state.endingCollection ||= [];
    if (!state.endingCollection.includes(ending.endingId)) state.endingCollection.push(ending.endingId);
    saveStoredCollection({ endings: state.endingCollection, gallery: state.galleryUnlocks });
    evaluateAchievements();
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
          ${renderEndingReport(ending)}
          <div class="ending-actions">
            <button class="case-button" type="button" data-action="restart">重新开始</button>
            <button class="case-button secondary" type="button" data-action="load">读取存档</button>
            <button class="case-button secondary" type="button" data-action="clues">查看本次线索</button>
            <button class="case-button secondary" type="button" data-action="archive">档案馆</button>
            <button class="ghost-button" type="button" data-action="hall">返回人生档案</button>
          </div>
        </div>
      </section>
      `
    );

    app.querySelector("[data-action='restart']").addEventListener("click", () => {
      openConfirm("重新开始", `会从《${getScript(state.scriptId)?.title || "当前故事"}》开头重新进入。当前自动进度会被覆盖。`, () => startNewGame(state.scriptId));
    });
    app.querySelector("[data-action='load']").addEventListener("click", () => openLoadModal());
    app.querySelector("[data-action='clues']").addEventListener("click", () => openClueModal());
    app.querySelector("[data-action='archive']").addEventListener("click", () => openArchiveModal());
    app.querySelector("[data-action='hall']").addEventListener("click", showHall);
  }

  function renderEndingReport(ending) {
    const report = ENDING_REPORT[ending.endingId] || ENDING_REPORT.ending_d || Object.values(ENDING_REPORT)[0] || { label: ending.title, type: "Ending", comment: "This life has been archived." };
    const coreCount = getCoreClueCount();
    const keyClues = Object.values(DATA.clues).filter((clue) => clue.isKey && state.clues.includes(clue.clueId)).length;
    const auxClues = Object.values(DATA.clues).filter((clue) => !clue.isKey && state.clues.includes(clue.clueId)).length;
    const missing = getTotalClueCount() - state.clues.length;
    const unlocked = state.sessionAchievements
      .map((id) => ACHIEVEMENTS.find((item) => item.achievementId === id)?.title)
      .filter(Boolean);
    return `
      <section class="ending-report">
        <figure class="ending-art">
          <img src="${escapeHTML(VISUALS.endings?.[ending.endingId]?.image || "")}" alt="${escapeHTML(report.label)}" loading="lazy" />
        </figure>
        <div class="report-head">
          <p class="eyebrow">LIFE REPORT</p>
          <h2>本次人生报告</h2>
          <span>${escapeHTML(report.label)} · ${escapeHTML(report.type)}</span>
        </div>
        <div class="report-metrics">
          <article><span>核心线索</span><strong>${coreCount}/${CORE_CLUE_IDS.length}</strong></article>
          <article><span>最终推理</span><strong>${state.deductionScore}/${activeProfile.deductionTotal || 5}</strong></article>
          <article><span>关键线索</span><strong>${keyClues}</strong></article>
          <article><span>辅助线索</span><strong>${auxClues}</strong></article>
          <article><span>缺失线索</span><strong>${Math.max(missing, 0)}</strong></article>
        </div>
        <div class="report-grid">
          <article>
            <h3>关键选择</h3>
            <ul>${renderKeyChoiceReport()}</ul>
          </article>
          <article>
            <h3>本次解锁成就</h3>
            <ul>${unlocked.length ? unlocked.map((title) => `<li>${escapeHTML(title)}</li>`).join("") : "<li>本次暂无新成就</li>"}</ul>
          </article>
        </div>
        ${renderRelationshipReport()}
        <article class="ending-path-report">
          <h3>你如何走到这个结局</h3>
          <ol class="evidence-chain">${buildEndingPathReport(ending.endingId).map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${escapeHTML(item)}</li>`).join("")}</ol>
        </article>
        ${renderEndingRoadmap(ending.endingId)}
        <blockquote>${escapeHTML(report.comment)}</blockquote>
      </section>
    `;
  }

  function renderEndingRoadmap(currentEndingId) {
    const links = getEvidenceLinks();
    const connectedRows = links.map((link) => {
      const connected = hasEvidenceConnection(link.linkId);
      return `<li class="${connected ? "is-connected" : "is-missing"}"><span>${escapeHTML(link.title)}</span><strong>${connected ? "已连线" : "未连线"}</strong></li>`;
    }).join("");
    const collection = loadStoredCollection();
    const endingRows = Object.keys(DATA.endings || {}).map((endingId) => {
      const unlocked = endingId === currentEndingId || (collection.endings || []).includes(endingId) || (state.endingCollection || []).includes(endingId);
      const title = unlocked ? DATA.endings[endingId]?.title || endingId : "未解锁结局";
      return `<li class="${unlocked ? "is-unlocked" : "is-locked"}">${escapeHTML(title)}</li>`;
    }).join("");
    return `
      <article class="ending-roadmap">
        <h3>路线图回溯</h3>
        <div class="roadmap-columns">
          <section><h4>证据链</h4><ul>${connectedRows}</ul></section>
          <section><h4>结局收藏</h4><ul>${endingRows}</ul></section>
        </div>
      </article>
    `;
  }

  function renderRelationshipReport() {
    const cards = RELATIONSHIP_DEFS.map((def) => {
      const value = state.relationships?.[def.id] || 0;
      const last = getLastRelationshipEvent(def.id);
      return [
        '<article class="relationship-report-card">',
        renderCharacterBadge(def.character),
        '<div>',
        `<span>${escapeHTML(def.character)}</span>`,
        `<strong>${escapeHTML(def.label)} · ${escapeHTML(getRelationshipLevel(def, value))}</strong>`,
        '</div>',
        `<div class="relationship-bar"><i style="width: ${value}%"></i></div>`,
        `<p>${value}/100</p>`,
        `<small>${escapeHTML(last?.reason || "本次暂无明显变化")}</small>`,
        '</article>',
      ].join("");
    }).join("");
    return `<section class="relationship-report"><h3>人物关系</h3><div class="relationship-report-grid">${cards}</div></section>`;
  }
  function buildEndingPathReport(endingId) {
    if (state.scriptId === "script_dormitory_rollcall") {
      const missing = CORE_CLUE_IDS.filter((id) => !state.clues.includes(id));
      const rows = [
        `You restored ${getCoreClueCount()} of ${CORE_CLUE_IDS.length} core records.`,
        state.flags.understood_rule_eight_forged ? "You identified rule eight as a forged instruction." : "You did not fully identify rule eight as forged.",
        state.flags.named_xutang ? "Xu Tang was named in the final count." : "Xu Tang remained exposed to the system's blank line.",
        state.flags.named_zhouwanning ? "Zhou Wanning was restored to the old record." : "Zhou Wanning's erasure remained unresolved.",
      ];
      if (missing.length) rows.push(`Missing records: ${missing.map((id) => DATA.clues[id]?.title || id).join(", ")}.`);
      rows.push(`This led to ${DATA.endings[endingId]?.title || endingId}.`);
      return rows;
    }
    const has = (clueId) => state.clues.includes(clueId);
    const rows = [];
    if (endingId === "ending_c") {
      rows.push("你选择删除证据。");
      rows.push(state.flags.backed_up_photo ? "虽然曾经建立过备份，但关键路径仍被删除选择打断。" : "你没有建立有效备份。");
      rows.push("关键证据从当前证据链中消失。");
      rows.push("因此进入 C 结局：删除证据。");
      return rows;
    }
    if (endingId === "ending_a") {
      if (has("clue_gray_loan")) rows.push("你查到了许知夏信息被冒用借贷。");
      if (has("clue_zhou_left")) rows.push("你发现周屿案发后离城。");
      if (has("clue_photo_background")) rows.push("你在照片背景里发现了周屿。");
      if (has("clue_timed_voice")) rows.push("你理解了死者来电的现实机制。");
      if (state.flags.backed_up_photo) rows.push("你保留并备份了关键证据。");
      if (state.flags.chose_reopen_case) rows.push("你选择重启旧案。");
      rows.push(`最终推理达到 ${state.deductionScore}/5。`);
      rows.push("因此进入 A 结局：真相重启。");
      return rows;
    }
    if (endingId === "ending_b") {
      rows.push("你选择把原始照片交给许知晚。");
      if (!state.flags.verified_zhuwan_identity) rows.push("你没有完成足够的身份核验。");
      if (!state.flags.backed_up_photo) rows.push("你没有在交出前建立稳定备份。");
      if (!state.flags.understood_dead_call) rows.push("你没有完全理解死者来电机制。");
      rows.push("证据链在善意和仓促之间流转失控。");
      rows.push("因此进入 B 结局：证据失控。");
      return rows;
    }
    rows.push("你没有满足重启旧案的全部关键条件。");
    rows.push(`核心线索进度为 ${getCoreClueCount()}/${CORE_CLUE_IDS.length}，最终推理为 ${state.deductionScore}/5。`);
    if (!state.flags.chose_reopen_case) rows.push("你没有明确选择重启旧案。");
    if (!state.flags.backed_up_photo) rows.push("关键证据没有形成稳定备份。");
    rows.push("真相仍停在无人接听的电话里。");
    rows.push("因此进入 D 结局：无人接听。");
    return rows;
  }
  function renderKeyChoiceReport() {
    if (state.scriptId === "script_dormitory_rollcall") {
      const rows = (state.importantChoices || []).slice(-6).map((entry) => entry.text || entry.choiceText).filter(Boolean);
      return (rows.length ? rows : ["No critical decision was recorded."]).map((row) => `<li>${escapeHTML(row)}</li>`).join("");
    }
    const rows = [
      `许知晚：${state.flags.trusted_zhuwan_early || state.flags.verified_zhuwan_identity ? "选择接近并核验她" : "保持距离或尚未完全确认"}`,
      `照片备份：${state.flags.backed_up_photo ? "已备份关键照片" : "未形成稳定备份"}`,
      `原始照片：${state.flags.gave_original_photo ? "交出原始照片" : "未交出原始照片"}`,
      `证据处理：${state.flags.deleted_evidence ? "删除证据" : "保留证据"}`,
      `旧案方向：${state.flags.chose_reopen_case ? "选择重启旧案" : "没有推动重启旧案"}`,
    ];
    return rows.map((row) => `<li>${escapeHTML(row)}</li>`).join("");
  }

  function bindGameToolbar() {
    const toolbox = app.querySelector(".toolbox");
    const menuButton = app.querySelector("[data-tool='menu']");
    menuButton?.addEventListener("click", () => {
      const isOpen = toolbox?.classList.toggle("is-open") || false;
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    const bindTool = (tool, handler) => {
      app.querySelector(`[data-tool='${tool}']`)?.addEventListener("click", (event) => {
        if (tool !== "menu") {
          toolbox?.classList.remove("is-open");
          menuButton?.setAttribute("aria-expanded", "false");
        }
        handler(event);
      });
    };
    bindTool("clues", openClueModal);
    bindTool("rules", openRulesModal);
    bindTool("evidence", openEvidenceBoardModal);
    bindTool("relationships", openRelationshipModal);
    bindTool("audio", openAudioSettingsModal);
    bindTool("reader", openReadingSettingsModal);
    bindTool("archive", openArchiveModal);
    bindTool("save", openSaveModal);
    bindTool("load", openLoadModal);
    bindTool("history", openHistoryModal);
    bindTool("hall", () => {
        openConfirm("返回人生档案", "返回前会自动保存当前进度。要离开当前故事吗？", () => {
        stopNodeTransientAudio("leave-game");
        autoSave();
        showHall();
      });
    });
  }

  function openRulesModal() {
    const rules = [
      ...(DATA.rules || []),
      ...(state.clues.includes("dorm_clue_handwritten_rule") ? (DATA.hiddenRules || []) : []),
    ];
    const labels = {
      "unverified": "未验证",
      "partly-credible": "基本可信",
      "verified": "已验证",
      "contradiction": "存在矛盾",
      "forged": "确认伪造",
      "hidden-correction": "隐藏修正",
    };
    const rows = rules.map((rule) => {
      const status = state.ruleStatuses?.[rule.ruleId] || rule.status || "unverified";
      return `
        <button class="rule-board-row rule-status-${escapeHTML(status)}" type="button" data-rule-detail="${escapeHTML(rule.ruleId)}">
          <span>${String(rule.number).padStart(2, "0")}</span>
          <div><strong>${escapeHTML(rule.text)}</strong><small>规则状态：${escapeHTML(labels[status] || status)}</small></div>
          <i aria-hidden="true">查看</i>
        </button>
      `;
    }).join("");
    openModal("417 夜间规则", "规则板", `<section class="rule-board"><p class="panel-note">规则是证据，不是命令。只有经过现场验证，它们才值得相信。</p>${rows}</section>`);
    modalBody.querySelectorAll("[data-rule-detail]").forEach((button) => {
      button.addEventListener("click", () => openRuleDetail(button.dataset.ruleDetail));
    });
  }

  function openRuleDetail(ruleId) {
    const rule = [...(DATA.rules || []), ...(DATA.hiddenRules || [])].find((item) => item.ruleId === ruleId);
    const detail = DATA.rulePlaybook?.[ruleId];
    if (!rule || !detail) return;
    const statusLabels = {
      "unverified": "未验证",
      "partly-credible": "基本可信",
      "verified": "已验证",
      "contradiction": "存在矛盾",
      "forged": "确认伪造",
      "hidden-correction": "隐藏修正",
    };
    const status = state.ruleStatuses?.[rule.ruleId] || rule.status || "unverified";
    const clueRows = (detail.clueIds || [])
      .map((clueId) => DATA.clues?.[clueId])
      .filter(Boolean)
      .map((clue) => `<li class="${state.clues.includes(clue.clueId) ? "is-owned" : "is-locked"}">${escapeHTML(state.clues.includes(clue.clueId) ? clue.title : "尚未获得的证据")}</li>`)
      .join("");
    const nodeLabel = (nodeId) => DATA.nodes?.[nodeId]?.text || "尚未发生";
    openModal(
      `规则 ${rule.number}`,
      "规则详情",
      `<section class="rule-detail">
        <p class="rule-detail-status">规则状态：<strong>${escapeHTML(statusLabels[status] || status)}</strong></p>
        <blockquote>${escapeHTML(rule.text)}</blockquote>
        <dl>
          <div><dt>相关证据</dt><dd><ul>${clueRows || "<li>暂无</li>"}</ul></dd></div>
          <div><dt>验证事件</dt><dd>${escapeHTML(nodeLabel(detail.verificationNodeId))}</dd></div>
          <div><dt>矛盾事件</dt><dd>${escapeHTML(nodeLabel(detail.contradictionNodeId))}</dd></div>
          <div><dt>当前判断</dt><dd>${escapeHTML(detail.playerJudgment || "尚待判断")}</dd></div>
          <div><dt>最终真实性</dt><dd>${escapeHTML(detail.finalTruth || "尚待确认")}</dd></div>
          <div><dt>最终推理</dt><dd>${escapeHTML(detail.endingImpact || "尚未影响结局")}</dd></div>
        </dl>
        <button class="case-button" type="button" data-rule-detail-close>我知道啦</button>
      </section>`
    );
    modalBody.querySelector("[data-rule-detail-close]")?.addEventListener("click", closeModal);
  }

  function openRelationshipModal() {
    const cards = RELATIONSHIP_DEFS.map((def) => {
      const value = state.relationships?.[def.id] || 0;
      const last = getLastRelationshipEvent(def.id);
      return [
        '<article class="relationship-card">',
        renderCharacterBadge(def.character),
        '<header>',
        `<span>${escapeHTML(def.character)}</span>`,
        `<strong>${escapeHTML(def.label)}</strong>`,
        '</header>',
        `<div class="relationship-value"><b>${value}</b><small>/100 · ${escapeHTML(getRelationshipLevel(def, value))}</small></div>`,
        `<div class="relationship-bar"><i style="width: ${value}%"></i></div>`,
        `<p>${escapeHTML(last?.reason || "尚未因关键选择产生明显变化")}</p>`,
        '</article>',
      ].join("");
    }).join("");
    openModal(
      "人物关系",
      "LIFE RELATION",
      `<div class="relationship-panel"><p class="panel-note">这些数值不是单纯好感，而是林舟在这个雨夜里与他人、与旧案之间的关系变化。</p><div class="relationship-grid">${cards}</div></div>`
    );
  }
  function refreshGameMeta() {
    const clueButton = app.querySelector("[data-tool='clues']");
    if (clueButton) {
      clueButton.classList.toggle("has-unread", state.unreadClues.length > 0);
      clueButton.innerHTML = `线索 <span>${state.clues.length}/${getTotalClueCount()}</span>`;
    }
    const meter = app.querySelector(".truth-meter");
    if (meter) meter.outerHTML = renderTruthMeter();
    const audioButton = app.querySelector("[data-tool='audio']");
    if (audioButton) audioButton.textContent = isAudioEnabled() ? "声音 开" : "声音 关";
  }

  function bindClueFilters() {
    modalBody.querySelectorAll("[data-clue-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.clueFilter;
        modalBody.querySelectorAll("[data-clue-filter]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        modalBody.querySelectorAll("[data-clue-tags]").forEach((card) => {
          const tags = card.dataset.clueTags || "";
          card.classList.toggle("hidden", !tags.split("|").includes(filter));
        });
      });
    });
  }

  function getEvidenceLinks() {
    if (Array.isArray(activeProfile.evidenceLinks) && activeProfile.evidenceLinks.length) {
      return activeProfile.evidenceLinks;
    }
    const nodeLinks = Object.values(DATA.nodes || {}).flatMap((node) => node.evidenceLinks || []);
    const byId = {};
    nodeLinks.forEach((link) => {
      if (link?.linkId) byId[link.linkId] = link;
    });
    return Object.values(byId);
  }

  function hasEvidenceConnection(linkId) {
    return (state.evidenceConnections || []).includes(linkId);
  }

  function canConnectEvidence(link) {
    return (link.clueIds || []).every((clueId) => state.clues.includes(clueId));
  }

  function connectEvidence(linkId) {
    const link = getEvidenceLinks().find((item) => item.linkId === linkId);
    if (!link || !canConnectEvidence(link)) return;
    state.evidenceConnections ||= [];
    if (!state.evidenceConnections.includes(linkId)) {
      state.evidenceConnections.push(linkId);
      showToast(`证据链成立：${link.title}`, "clue");
      autoSave();
    }
    openEvidenceBoardModal();
  }

  function maybeConnectEvidenceFromHotspot(linkId) {
    const link = getEvidenceLinks().find((item) => item.linkId === linkId);
    if (!link || !canConnectEvidence(link) || hasEvidenceConnection(linkId)) return;
    state.evidenceConnections ||= [];
    state.evidenceConnections.push(linkId);
    showToast(`证据链可用：${link.title}`, "clue");
  }

  function openEvidenceBoardModal() {
    const links = getEvidenceLinks();
    const rows = links.map((link) => {
      const connected = hasEvidenceConnection(link.linkId);
      const ready = canConnectEvidence(link);
      const clueList = (link.clueIds || []).map((clueId) => {
        const clue = DATA.clues[clueId];
        const owned = state.clues.includes(clueId);
        return `<span class="${owned ? "is-owned" : "is-locked"}">${escapeHTML(clue?.title || clueId)}</span>`;
      }).join("");
      return `
        <article class="evidence-link-card ${connected ? "is-connected" : ""}">
          <header>
            <strong>${escapeHTML(link.title)}</strong>
            <span>${connected ? "已连线" : ready ? "可连线" : "缺线索"}</span>
          </header>
          <div class="evidence-link-clues">${clueList}</div>
          <p>${escapeHTML(connected ? link.result : "收齐两端线索后，可以把它们连成推理链。")}</p>
          <button class="case-button" type="button" data-evidence-link="${escapeHTML(link.linkId)}" ${(!ready || connected) ? "disabled" : ""}>${connected ? "已成立" : "连接证据"}</button>
        </article>
      `;
    }).join("");
    openModal(
      "证据板",
      "EVIDENCE BOARD",
      `
      <section class="evidence-board-panel">
        <div class="feedback-progress">
          <span>证据链</span>
          <strong>${(state.evidenceConnections || []).length}/${links.length}</strong>
        </div>
        <div class="evidence-link-grid">${rows}</div>
      </section>
      `
    );
    modalBody.querySelectorAll("[data-evidence-link]").forEach((button) => {
      button.addEventListener("click", () => connectEvidence(button.dataset.evidenceLink));
    });
  }

  function openArchiveModal() {
    const collection = loadStoredCollection();
    const endings = Object.keys(DATA.endings || {}).map((endingId) => {
      const unlocked = (collection.endings || []).includes(endingId) || (state.endingCollection || []).includes(endingId);
      const ending = DATA.endings[endingId];
      return `<article class="archive-card ${unlocked ? "is-owned" : "is-locked"}"><strong>${unlocked ? escapeHTML(ending?.title || endingId) : "未解锁结局"}</strong><p>${unlocked ? "已收入人生档案。" : "继续调查不同分歧，解锁这条人生。"}</p></article>`;
    }).join("");
    const clues = Object.values(DATA.clues).map((clue) => {
      const owned = state.clues.includes(clue.clueId);
      return `<article class="archive-card ${owned ? "is-owned" : "is-locked"}"><strong>${owned ? escapeHTML(clue.title) : "未归档线索"}</strong><p>${owned ? escapeHTML(clue.description) : "这条记录还藏在雨声里。"}</p></article>`;
    }).join("");
    const gallery = Array.from(new Set([...(collection.gallery || []), ...(state.galleryUnlocks || [])]))
      .slice(0, 18)
      .map((id) => `<span>${escapeHTML(id)}</span>`)
      .join("");
    openModal(
      "人生档案馆",
      "LIFE ARCHIVE",
      `
      <section class="archive-panel">
        <h3>结局收藏</h3>
        <div class="archive-grid">${endings}</div>
        <h3>线索收藏</h3>
        <div class="archive-grid">${clues}</div>
        <h3>已解锁 CG / 道具 / 录音</h3>
        <div class="archive-token-list">${gallery || "<p>继续推进剧情，档案馆会自动记录关键画面和道具。</p>"}</div>
      </section>
      `
    );
  }

  function renderRangeControl(id, label, value) {
    return `
      <label class="settings-row">
        <span>${escapeHTML(label)}</span>
        <input type="range" min="0" max="1" step="0.05" value="${escapeHTML(value)}" data-setting="${escapeHTML(id)}" />
      </label>
    `;
  }

  function openAudioSettingsModal() {
    const settings = getAudioSettings();
    openModal(
      "声音设置",
      "AUDIO MIX",
      `
      <section class="settings-panel">
        <label class="settings-toggle"><input type="checkbox" data-setting="audioEnabled" ${settings.audioEnabled ? "checked" : ""} /> 启用声音</label>
        <label class="settings-toggle"><input type="checkbox" data-setting="bgmEnabled" ${settings.bgmEnabled ? "checked" : ""} /> 背景音乐</label>
        <label class="settings-toggle"><input type="checkbox" data-setting="ambienceEnabled" ${settings.ambienceEnabled ? "checked" : ""} /> 环境音</label>
        <label class="settings-toggle"><input type="checkbox" data-setting="sfxEnabled" ${settings.sfxEnabled ? "checked" : ""} /> 音效</label>
        <label class="settings-toggle"><input type="checkbox" data-setting="voiceEnabled" ${settings.voiceEnabled ? "checked" : ""} /> 人物非语言声音</label>
        ${renderRangeControl("masterVolume", "总音量", settings.masterVolume)}
        ${renderRangeControl("bgmVolume", "背景音乐", settings.bgmVolume)}
        ${renderRangeControl("ambienceVolume", "环境音", settings.ambienceVolume)}
        ${renderRangeControl("sfxVolume", "音效", settings.sfxVolume)}
        ${renderRangeControl("stingerVolume", "人物非语言", settings.stingerVolume)}
        <div class="modal-actions">
          <button class="case-button" type="button" data-replay-node-audio>重播当前节点声音</button>
          <button class="ghost-button" type="button" data-mute-audio>${settings.audioEnabled ? "静音" : "取消静音"}</button>
        </div>
      </section>
      `
    );
    modalBody.querySelectorAll("[data-setting]").forEach((control) => {
      control.addEventListener("input", () => {
        const key = control.dataset.setting;
        const value = control.type === "checkbox" ? control.checked : Number(control.value);
        saveAudioSettings({ [key]: value });
        if (["masterVolume", "bgmVolume"].includes(key) && audioState.realBgm) audioState.realBgm.volume = scaledVolume(0.055, "bgm");
        if (["masterVolume", "ambienceVolume"].includes(key) && audioState.realAmbience) audioState.realAmbience.volume = scaledVolume(0.08, "ambience");
        refreshGameMeta();
      });
    });
    modalBody.querySelector("[data-replay-node-audio]").addEventListener("click", () => {
      unlockAudio();
      stopNodeTransientAudio("replay-node-audio");
      const node = getNode();
      if (node) prepareAudioCue(node);
    });
    modalBody.querySelector("[data-mute-audio]").addEventListener("click", () => {
      const next = !getAudioSettings().audioEnabled;
      saveAudioSettings({ audioEnabled: next });
      if (!next) stopAllAudio();
      else {
        unlockAudio();
        const node = getNode();
        if (node) prepareAudioCue(node);
      }
      closeModal();
      refreshGameMeta();
    });
  }

  function openReadingSettingsModal() {
    const settings = getReadingSettings();
    openModal(
      "阅读设置",
      "READING",
      `
      <section class="settings-panel">
        <label class="settings-row">
          <span>文字速度</span>
          <select data-reading-setting="textSpeed">
            ${["slow", "normal", "fast", "instant"].map((value) => `<option value="${value}" ${settings.textSpeed === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="settings-toggle"><input type="checkbox" data-reading-setting="instantText" ${settings.instantText ? "checked" : ""} /> 立即显示全文</label>
        <label class="settings-toggle"><input type="checkbox" data-reading-setting="autoPlay" ${settings.autoPlay ? "checked" : ""} /> 自动播放</label>
        <label class="settings-toggle"><input type="checkbox" data-reading-setting="skipRead" ${settings.skipRead ? "checked" : ""} /> 跳过已读</label>
        <label class="settings-toggle"><input type="checkbox" data-reading-setting="deepDarkMode" ${settings.deepDarkMode ? "checked" : ""} /> 更深色阅读模式</label>
        <label class="settings-toggle"><input type="checkbox" data-reading-setting="hideUi" ${settings.hideUi ? "checked" : ""} /> 隐藏部分 UI 看画面</label>
        <label class="settings-row">
          <span>字号</span>
          <input type="range" min="0.9" max="1.22" step="0.04" value="${settings.fontScale}" data-reading-setting="fontScale" />
        </label>
      </section>
      `
    );
    modalBody.querySelectorAll("[data-reading-setting]").forEach((control) => {
      control.addEventListener("input", () => {
        const key = control.dataset.readingSetting;
        const value = control.type === "checkbox" ? control.checked : control.type === "range" ? Number(control.value) : control.value;
        saveReadingSettings({ [key]: value });
        if (currentView === "game") showGame();
      });
    });
  }

  function bindSceneInteractions() {
    app.querySelectorAll("[data-scene-feedback]").forEach((element) => {
      element.addEventListener("click", () => {
        element.classList.add("is-checked");
        showToast(element.dataset.sceneFeedback || "已检查", "clue");
      });
    });
    app.querySelectorAll("[data-hotspot-id]").forEach((button) => {
      button.addEventListener("click", () => inspectHotspot(button.dataset.hotspotId));
    });
  }

  function inspectHotspot(hotspotId) {
    const node = getNode();
    const hotspot = (node?.investigationHotspots || []).find((item) => item.hotspotId === hotspotId);
    if (!node || !hotspot) return;
    const key = getHotspotKey(node.nodeId, hotspot.hotspotId);
    const firstInspect = !(state.checkedHotspots || []).includes(key);
    state.checkedHotspots ||= [];
    if (firstInspect) state.checkedHotspots.push(key);
    (hotspot.sfxOnInspect || []).forEach((cue) => playSfx(cue));
    gainClues(hotspot.gainClues || []);
    setFlags(hotspot.setFlags || []);
    applyRelationshipEffects(hotspot.relationshipEffects || []);
    if (hotspot.evidenceLinkId) maybeConnectEvidenceFromHotspot(hotspot.evidenceLinkId);
    autoSave();
    openHotspotModal(hotspot, firstInspect);
  }

  function getZoomAsset(hotspot) {
    const assetId = hotspot?.zoomAsset;
    if (!assetId) return null;
    return VISUALS.props?.[assetId] || VISUALS.clues?.[assetId] || VISUALS.scenes?.[assetId] || null;
  }

  function openHotspotModal(hotspot, firstInspect) {
    const asset = getZoomAsset(hotspot);
    const clueRows = (hotspot.gainClues || [])
      .map((clueId) => DATA.clues[clueId])
      .filter(Boolean)
      .map((clue) => `<li>线索归档：${escapeHTML(clue.title)}</li>`)
      .join("");
    const relationRows = (hotspot.relationshipEffects || [])
      .map((effect) => {
        const def = getRelationshipDef(effect.id);
        if (!def) return "";
        return `<li>${escapeHTML(def.character)}${escapeHTML(def.label)} ${Number(effect.delta || 0) > 0 ? "+" : ""}${Number(effect.delta || 0)}</li>`;
      })
      .filter(Boolean)
      .join("");
    openModal(
      hotspot.detailTitle || hotspot.label,
      firstInspect ? "INVESTIGATION" : "REVIEWED",
      `
      <article class="feedback-card investigation-card">
        ${asset?.image ? `<figure><img src="${escapeHTML(asset.image)}" alt="${escapeHTML(asset.label || hotspot.label)}" loading="lazy" /></figure>` : ""}
        <span class="feedback-badge">${firstInspect ? "已调查" : "已复查"}</span>
        <h3>${escapeHTML(hotspot.label)}</h3>
        <p>${escapeHTML(hotspot.text)}</p>
        ${(clueRows || relationRows) ? `<ul class="choice-impact-list">${clueRows}${relationRows}</ul>` : ""}
        <button class="case-button" type="button" data-feedback-close>我知道啦</button>
      </article>`
    );
    modalBody.querySelector("[data-feedback-close]").addEventListener("click", closeModal);
  }

  function openClueModal() {
    state.unreadClues = [];
    autoSave();
    refreshGameMeta();
    const clueItems = Object.values(DATA.clues);
    const ownedClues = clueItems.filter((clue) => state.clues.includes(clue.clueId));
    const lockedCount = Math.max(clueItems.length - ownedClues.length, 0);
    const tabs = CLUE_FILTERS.map((filter, index) => `
      <button class="${index === 0 ? "is-active" : ""}" type="button" data-clue-filter="${filter}">
        ${filter}
      </button>
    `).join("");
    const rows = ownedClues
      .map((clue) => {
        const filterTags = ["全部", clue.category, clue.isKey ? "关键线索" : ""].filter(Boolean).join("|");
        return `
          <article class="clue-card is-owned ${clue.isKey ? "is-key" : ""}" data-clue-tags="${escapeHTML(filterTags)}">
            ${renderClueIcon(clue.clueId)}
            <span class="clue-pin">${clue.isKey ? "关键线索" : "已归档"}</span>
            <h3>${escapeHTML(clue.title)}</h3>
            <p>${escapeHTML(clue.description)}</p>
          </article>
        `;
      })
      .join("");
    const lockedPanel = lockedCount
      ? `
        <details class="sealed-clues">
          <summary>未归档线索 ${lockedCount} 条</summary>
          <div class="sealed-clue-list">
            ${Array.from({ length: lockedCount }, (_, index) => `
              <article class="sealed-clue">
                <strong>未归档线索 ${String(index + 1).padStart(2, "0")}</strong>
                <p>这条记录还藏在雨声里。</p>
              </article>
            `).join("")}
          </div>
        </details>
      `
      : `<p class="archive-complete">所有关键线索已经归档。</p>`;
    openModal(
      "人生线索板",
      "LIFE CLUES",
      `
      <section class="truth-board">
        <div>
          <h3>真相拼图</h3>
          <p>已拼出 ${getCoreClueCount()} / ${CORE_CLUE_IDS.length}</p>
        </div>
        <div class="truth-pieces large">${CORE_CLUE_IDS.map((id) => `<i class="${state.clues.includes(id) ? "is-lit" : ""}"></i>`).join("")}</div>
      </section>
      <div class="clue-tabs">${tabs}</div>
      <div class="clue-grid clue-library">${rows || `<p class="empty-archive">还没有正式归档的关键线索。先回到雨夜里，听完那通电话。</p>`}</div>
      ${lockedPanel}
      `
    );
    bindClueFilters();
  }

  function openSaveModal() {
    const saveKeys = getStoryStorageKeys(state.scriptId);
    const slots = readJSON(saveKeys.saves, [null, null, null]);
    const html = `
      <div class="save-grid">
        ${slots.map((slot, index) => renderSaveSlot(slot, index, "save")).join("")}
      </div>
    `;
    openModal("保存人生节点", "SAVE NODE", html);
    modalBody.querySelectorAll("[data-save-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.saveSlot);
        const writeSlot = () => {
          const nextSlots = readJSON(saveKeys.saves, [null, null, null]);
          nextSlots[index] = {
            ...snapshotState(),
            savedAt: new Date().toISOString(),
          };
          saveJSON(saveKeys.saves, nextSlots);
          showToast(`已保存到人生节点 ${index + 1}`, "clue");
          openSaveModal();
        };
        if (slots[index]) {
          openConfirm("覆盖存档", `人生节点 ${index + 1} 已有记录，确认覆盖吗？`, writeSlot, openSaveModal);
        } else {
          writeSlot();
        }
      });
    });
  }

  function openLoadModal() {
    const saveKeys = getStoryStorageKeys(state.scriptId);
    const slots = readJSON(saveKeys.saves, [null, null, null]);
    const html = `
      <div class="save-grid">
        ${slots.map((slot, index) => renderSaveSlot(slot, index, "load")).join("")}
      </div>
    `;
    openModal("读取人生节点", "LOAD NODE", html);
    modalBody.querySelectorAll("[data-load-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.loadSlot);
        const slot = slots[index];
        if (!slot) return;
        openConfirm("读取存档", "读取后会覆盖当前临时进度。确认继续吗？", () => {
          stopNodeTransientAudio("load-save");
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
          <h3>人生节点 ${index + 1}</h3>
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
          <h3>人生节点 ${index + 1}</h3>
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
    openModal("回忆记录", "MEMORY LOG", rows || "<p>还没有对白记录。</p>");
  }

  function openNotice(title, text) {
    openModal(title, "NOTICE", `<p class="notice-text">${escapeHTML(text)}</p>`);
  }

  function openChoiceFeedback(item) {
    const relationRows = (item.relationshipEffects || [])
      .map((effect) => {
        const def = getRelationshipDef(effect.id);
        const delta = Number(effect.delta || 0);
        if (!def || delta === 0) return "";
        return `<li>${escapeHTML(def.character)}${escapeHTML(def.label)} ${delta > 0 ? "+" : ""}${delta}：${escapeHTML(effect.reason || "关键选择影响")}</li>`;
      })
      .filter(Boolean)
      .join("");
    const clueRows = (item.gainClues || [])
      .map((clueId) => DATA.clues[clueId])
      .filter(Boolean)
      .map((clue) => `<li>线索归档：${escapeHTML(clue.title)}</li>`)
      .join("");
    const deduction = item.isDeduction
      ? `<div class="feedback-progress"><span>推理进度</span><strong>${state.deductionScore}/5</strong></div>`
      : "";
    openModal(
      item.title || "选择留下痕迹",
      item.isDeduction ? "DEDUCTION TRACE" : "CHOICE TRACE",
      `<article class="feedback-card choice-feedback-card tone-${escapeHTML(item.tone || "neutral")}">
        <span class="feedback-badge">${item.isDeduction ? (item.tone === "correct" ? "推理成立" : "推理偏差") : "人生分歧"}</span>
        <h3>${escapeHTML(item.choiceText || "")}</h3>
        <p>${escapeHTML(item.text || "这个选择已被记录。")}</p>
        ${(relationRows || clueRows) ? `<ul class="choice-impact-list">${relationRows}${clueRows}</ul>` : ""}
        ${deduction}
        <button class="case-button" type="button" data-feedback-close>我知道啦</button>
      </article>`,
      continueFeedbackQueue
    );
    modalBody.querySelector("[data-feedback-close]").addEventListener("click", closeModal);
  }

  function openClueRevealFeedback(clueId) {
    const clue = DATA.clues[clueId];
    if (!clue) {
      continueFeedbackQueue();
      return;
    }
    const total = getTotalClueCount();
    openModal(
      "发现线索",
      "CLUE FOUND",
      `
      <article class="feedback-card clue-reveal-card">
        ${renderClueIcon(clue.clueId, "is-large")}
        <span class="feedback-badge">${clue.isKey ? "关键线索" : "辅助线索"}</span>
        <h3>${escapeHTML(clue.title)}</h3>
        <p class="feedback-meta">分类：${escapeHTML(clue.category)}</p>
        <p>${escapeHTML(clue.description)}</p>
        <div class="feedback-progress">
          <span>线索进度</span>
          <strong>${state.clues.length} / ${total}</strong>
        </div>
        <button class="case-button" type="button" data-feedback-close>我知道啦</button>
      </article>
      `,
      continueFeedbackQueue
    );
    modalBody.querySelector("[data-feedback-close]").addEventListener("click", closeModal);
  }

  function openMilestoneFeedback(item) {
    openModal(
      item.title,
      "MILESTONE",
      `
      <article class="feedback-card milestone-card">
        <div class="milestone-ring" aria-hidden="true"></div>
        <p>${escapeHTML(item.text)}</p>
        <div class="feedback-progress">
          <span>真相进度</span>
          <strong>${getCoreClueCount()} / ${CORE_CLUE_IDS.length}</strong>
        </div>
        <button class="case-button" type="button" data-feedback-close>我知道啦</button>
      </article>
      `,
      continueFeedbackQueue
    );
    modalBody.querySelector("[data-feedback-close]").addEventListener("click", closeModal);
  }

  function openChapterSummaryFeedback(item) {
    const clueList = item.clues.length
      ? item.clues
          .map((clueId) => `<li>${escapeHTML(DATA.clues[clueId]?.title || clueId)}</li>`)
          .join("")
      : "<li>本章暂无新线索</li>";
    const choices = item.choices.length
      ? item.choices.slice(-4).map((choice) => `<li>你选择了：${escapeHTML(choice.text)}</li>`).join("")
      : "<li>本章暂无关键选择记录</li>";
    const recap = item.recap
      ? `
        <section class="chapter-recap-block">
          <h3>本章复盘</h3>
          <p><strong>完成：</strong>${escapeHTML(item.recap.completed || "你推进了案件。")}</p>
          <p><strong>可能错过：</strong>${escapeHTML(item.recap.missed || "仍有细节可以二刷确认。")}</p>
          <p><strong>下一章：</strong>${escapeHTML(item.recap.next || item.nextTitle)}</p>
        </section>
      `
      : "";
    openModal(
      item.title,
      "CHAPTER CLEAR",
      `
      <article class="feedback-card chapter-summary-card">
        ${renderChapterCover(item.chapterId, true)}
        <section>
          <h3>本章获得</h3>
          <ul>${clueList}</ul>
        </section>
        <section>
          <h3>本章关键选择</h3>
          <ul>${choices}</ul>
        </section>
        ${recap}
        <div class="feedback-progress">
          <span>真相进度</span>
          <strong>${getCoreClueCount()} / ${CORE_CLUE_IDS.length}</strong>
        </div>
        <button class="case-button" type="button" data-feedback-close>我知道啦</button>
      </article>
      `,
      continueFeedbackQueue
    );
    modalBody.querySelector("[data-feedback-close]").addEventListener("click", closeModal);
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
      `,
      null,
      { mode: "confirm" }
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

  function openModal(title, kicker, html, onClose, options = {}) {
    modalTitle.textContent = title;
    modalKicker.textContent = kicker;
    modalMode = options.mode || "notice";
    const needsAcknowledgement = modalMode === "notice" && !/data-feedback-close/.test(html);
    modalBody.innerHTML = `${html}${needsAcknowledgement ? '<div class="modal-actions modal-acknowledgement"><button class="case-button" type="button" data-modal-ack>我知道啦</button></div>' : ""}`;
    modalCloseHandler = onClose;
    modalRoot.classList.remove("hidden");
    modalRoot.setAttribute("aria-hidden", "false");
    modalBody.querySelector("[data-modal-ack]")?.addEventListener("click", closeModal);
  }

  function closeModal() {
    modalRoot.classList.add("hidden");
    modalRoot.setAttribute("aria-hidden", "true");
    const handler = modalCloseHandler;
    modalCloseHandler = null;
    modalMode = "notice";
    if (typeof handler === "function") handler();
    window.setTimeout(processFeedbackQueue, 80);
  }

  function bindGlobalModalEvents() {
    modalRoot.addEventListener("click", (event) => event.stopPropagation());
  }

  function bindAssetFallbacks() {
    document.addEventListener("error", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      target.classList.add("is-missing");
      target.alt ||= "资源暂未加载";
      target.removeAttribute("src");
    }, true);
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastHost.appendChild(toast);
    window.setTimeout(() => toast.classList.add("is-leaving"), 2400);
    window.setTimeout(() => toast.remove(), 3000);
  }

  function renderFocusLabel(focus = "") {
    const labels = {
      "incoming-call": "来电",
      "dead-call": "旧号",
      "doorbell": "门外",
      "door-chain": "门链",
      "peephole": "猫眼",
      "id-proof": "核验",
      "wet-visitor": "湿痕",
      "voice-record": "录音",
      "chat-log": "聊天",
      "loan-record": "借贷",
      "timeline": "时间线",
      "photo-box": "照片盒",
      "group-photo": "合照",
      "photo-inspect": "放大",
      "background-shadow": "背景人影",
      "old-phone": "旧手机",
      "recording": "语音",
      "voice-trigger": "触发记录",
      "evidence-table": "证据桌",
      "deduction-board": "推理板",
      "evidence-chain": "证据链",
      "archive-choice": "归档选择",
      "rain-window": "雨窗",
      message: "消息",
    };
    return labels[focus] || "现场";
  }

  function getSceneSnapshot(node) {
    const scene = node.scene || "rental_room_rain_night";
    const visual = VISUALS.scenes?.[scene] || VISUALS.scenes?.rental_room_rain_night;
    return { scene, bg: visual?.bg || "", visual };
  }

  function getNodeVisualSources(node) {
    if (!node) return [];
    const sources = [];
    const snapshot = getSceneSnapshot(node);
    if (snapshot.bg) sources.push(snapshot.bg);
    const visualSpeaker = node.visualCharacter || node.speaker;
    const character = getVisualCharacter(visualSpeaker);
    if (character?.image && character.id !== "narrator") {
      const variant = node.characterVariant && character.variants?.[node.characterVariant]
        ? node.characterVariant
        : resolveCharacterVariant(character, String(visualSpeaker || ""), node);
      sources.push(character.variants?.[variant] || character.image);
    }
    return sources.filter(Boolean);
  }

  function preloadVisualSource(src) {
    if (!src || preloadedVisuals.has(src)) return;
    preloadedVisuals.add(src);
    const image = new Image();
    image.decoding = "async";
    image.src = src;
  }

  function preloadUpcomingVisuals(node) {
    const nextIds = [node?.nextNodeId, ...(node?.choices || []).map((choice) => choice.nextNodeId)].filter(Boolean);
    getNodeVisualSources(node).forEach(preloadVisualSource);
    nextIds.slice(0, 4).forEach((nodeId) => getNodeVisualSources(DATA.nodes?.[nodeId]).forEach(preloadVisualSource));
  }

  function bindSceneVisualReadiness() {
    const shell = app.querySelector(".scene-asset-shell");
    const images = [...app.querySelectorAll(".scene-bg-image, .vn-character-standee img")];
    if (!shell || !images.length) return;
    shell.classList.add("is-asset-pending");
    let remaining = images.length;
    const complete = () => {
      remaining -= 1;
      if (remaining > 0) return;
      shell.classList.remove("is-asset-pending");
      shell.classList.add("is-asset-ready");
    };
    images.forEach((image) => {
      if (image.complete) complete();
      else {
        image.addEventListener("load", complete, { once: true });
        image.addEventListener("error", complete, { once: true });
      }
    });
  }

  function renderSceneVisual(node, previousVisual = null) {
    const snapshot = getSceneSnapshot(node);
    const { scene, visual } = snapshot;
    const chapter = getChapter(node.chapterId);
    const stateClass = node.type ? `visual-state-${node.type}` : "visual-state-dialogue";
    const title = visual?.title || chapter?.title || "未知场景";
    const focus = node.visualFocus || visual?.focus || "center";
    const focusTarget = node.focusTarget || focus;
    const shotTone = node.shotTone || node.visualMood || "normal";
    const isHeld = node.sceneHold === true && previousVisual?.scene === scene;
    const showPreviousBackground = !isHeld && previousVisual?.bg && previousVisual.bg !== snapshot.bg;
    const highlightedProps = new Set(node.highlightProps || []);
    const overlays = (visual?.overlays || [])
      .map((src) => `<img class="scene-overlay" src="${escapeHTML(src)}" alt="" aria-hidden="true" loading="lazy" />`)
      .join("");
    const props = (visual?.props || [])
      .map((id) => ({ id, prop: VISUALS.props?.[id] }))
      .filter(Boolean)
      .map(({ id, prop }) => `<img class="scene-prop ${highlightedProps.has(id) ? "is-highlighted" : ""}" data-prop-id="${escapeHTML(id)}" src="${escapeHTML(prop.image)}" alt="${escapeHTML(prop.label)}" loading="lazy" />`)
      .join("");
    const hotspots = renderInvestigationHotspots(node);
    return `
      <div class="scene-asset-shell ${stateClass} focus-${escapeHTML(focus)} focus-target-${escapeHTML(focusTarget)} shot-${escapeHTML(shotTone)} ${isHeld ? "is-scene-held" : "is-scene-entering"}" data-scene-id="${escapeHTML(scene)}" data-visual-focus="${escapeHTML(focus)}" data-focus-target="${escapeHTML(focusTarget)}" data-transition-style="${escapeHTML(node.transitionStyle || "hold")}">
        ${showPreviousBackground ? `<img class="scene-bg-previous" src="${escapeHTML(previousVisual.bg)}" alt="" aria-hidden="true" />` : ""}
        <img class="scene-bg-image" src="${escapeHTML(visual?.bg || "")}" alt="${escapeHTML(title)}" loading="eager" decoding="async" />
        ${renderCharacterLayer(node.speaker, node)}
        <div class="scene-overlay-layer">${overlays}</div>
        <div class="scene-prop-layer">${props}</div>
        ${hotspots}
        <div class="scene-focus-tag">${escapeHTML(renderFocusLabel(focus))}</div>
        <div class="scene-asset-label">
          <span>${escapeHTML(title)}</span>
          <small>${escapeHTML(chapter?.title || node.chapterTitle || "")}</small>
        </div>
      </div>
    `;
  }

  function getHotspotKey(nodeId, hotspotId) {
    return `${nodeId}:${hotspotId}`;
  }

  function renderInvestigationHotspots(node) {
    const items = Array.isArray(node.investigationHotspots) ? node.investigationHotspots : [];
    if (!items.length) return "";
    return `
      <div class="scene-hotspot-layer" aria-label="可调查区域">
        ${items.map((item, index) => {
          const checked = (state.checkedHotspots || []).includes(getHotspotKey(node.nodeId, item.hotspotId));
          return `
            <button class="scene-hotspot hotspot-${index + 1} ${checked ? "is-checked" : ""}" type="button" data-hotspot-id="${escapeHTML(item.hotspotId)}">
              <span>${escapeHTML(item.label)}</span>
            </button>
          `;
        }).join("")}
      </div>
    `;
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
