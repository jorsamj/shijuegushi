(() => {
  "use strict";

  const DATA = window.MIST_DATA;
  const VISUALS = window.SECOND_LIFE_VISUALS || {
    scenes: {},
    characters: {},
    characterAliases: {},
    clues: {},
    chapters: {},
    props: {},
  };
  const AUDIO = window.SECOND_LIFE_AUDIO || {
    bgm: {},
    ambience: {},
    sfx: {},
    stingers: {},
    narration: {},
    voice: {},
    voiceProfiles: {},
  };
  const STORAGE_KEYS = {
    progress: "mist.currentProgress",
    saves: "mist.saveSlots",
    history: "mist.history",
    settings: "mist.settings",
    schema: "mist.schemaVersion",
    achievements: "secondLife.achievements",
  };

  const CORE_CLUE_IDS = [
    "clue_dead_call",
    "clue_sister_mark",
    "clue_gray_loan",
    "clue_zhou_left",
    "clue_photo_background",
    "clue_timed_voice",
  ];
  const FOCUSED_CLUE_REVEALS = new Set(["clue_dead_call", "clue_photo_background", "clue_timed_voice"]);

  const CLUE_FILTERS = ["全部", "关键线索", "通话", "人物", "照片", "旧案"];

  const MILESTONES = [
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

  const ACHIEVEMENTS = [
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

  const ENDING_REPORT = {
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

  const RELATIONSHIP_DEFS = [
    { id: "trust_zhuwan", character: "许知晚", label: "信任", levels: ["疏离", "试探", "信任", "托付"] },
    { id: "support_chenyan", character: "陈妍", label: "协助", levels: ["微弱", "有限协助", "积极协助", "全力协助"] },
    { id: "suspicion_zhou", character: "周屿", label: "警觉", levels: ["未察觉", "警觉", "高度警觉", "失控施压"] },
    { id: "courage_linzou", character: "林舟", label: "直面", levels: ["逃避", "动摇", "面对", "直面真相"] },
  ];
  const app = document.getElementById("app");
  const toastHost = document.getElementById("toastHost");
  const modalRoot = document.getElementById("modalRoot");
  const modalTitle = document.getElementById("modalTitle");
  const modalKicker = document.getElementById("modalKicker");
  const modalBody = document.getElementById("modalBody");

  let storageAvailable = true;
  let modalCloseHandler = null;
  let currentView = "splash";
  let feedbackQueue = [];
  let state = createInitialState();
  let audioState = {
    context: null,
    master: null,
    bgm: null,
    ambience: null,
    realBgm: null,
    realAmbience: null,
    realVoice: null,
    currentDialogueAudio: null,
    currentDialogueAbortController: null,
    currentBgm: "",
    currentAmbience: "",
    unlocked: false,
    lastVoiceNodeId: "",
    voiceFallbackNoticeShown: false,
    voiceMissingNoticeShown: false,
    placeholderVoiceNoticeShown: false,
    dialogueToken: 0,
    dialogueSessionId: 0,
  };

  function createInitialState() {
    return {
      scriptId: "script_rain_call",
      nodeId: "ch01_001",
      clues: [],
      flags: { ...DATA.defaultFlags },
      history: [],
      endingId: null,
      deductionScore: 0,
      unreadClues: [],
      chapterStats: {},
      triggeredMilestones: [],
      achievements: loadStoredAchievements(),
      sessionAchievements: [],
      importantChoices: [],
      truthNotices: [],
      relationships: createDefaultRelationships(),
      relationshipEvents: [],
      endingPathTags: [],
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

  function loadStoredAchievements() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.achievements);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
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
          <img src="${escapeHTML(image)}" alt="${escapeHTML(character.name)}" loading="lazy" />
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
      .filter(Boolean)
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
    app.dataset.audioSfx = sfxList.join(",");
    app.dataset.audioVoice = speakerProfile;
    updateAudioForNode(node, resolvedCue);
  }

  function getAudioSettings() {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    return {
      audioEnabled: saved.audioEnabled !== false,
      voiceEnabled: saved.voiceEnabled !== false,
      voiceMode: ["real", "fallback", "off"].includes(saved.voiceMode) ? saved.voiceMode : "real",
      allowPlaceholderVoices: saved.allowPlaceholderVoices === true,
      bgmEnabled: saved.bgmEnabled !== false,
      sfxEnabled: saved.sfxEnabled !== false,
    };
  }

  function saveAudioSettings(settings) {
    const saved = readJSON(STORAGE_KEYS.settings, {});
    saveJSON(STORAGE_KEYS.settings, { ...saved, ...settings });
  }

  function isAudioEnabled() {
    return getAudioSettings().audioEnabled;
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

  function getAudioSource(category, key) {
    if (!key) return "";
    const src = AUDIO?.[category]?.[key] || "";
    if (!src) console.warn(`[Second Life Audio] Missing ${category}: ${key}`);
    return src;
  }

  function isPlaceholderDialogueAsset(node) {
    const profileId = node.voiceProfile || getVisualCharacter(node.visualCharacter || node.speaker).id || "narrator";
    const profile = AUDIO.voiceProfiles?.[profileId];
    return profile?.productionStatus === "need-retake" || profile?.productionStatus === "placeholder";
  }

  function playRealAudio(src, options = {}) {
    if (!src || typeof Audio !== "function") return null;
    const audio = new Audio(src);
    audio.loop = options.loop === true;
    audio.volume = options.volume ?? 0.72;
    audio.addEventListener("error", () => {
      console.warn(`[Second Life Audio] Unable to load ${src}`);
      options.onFallback?.();
    }, { once: true });
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.warn(`[Second Life Audio] Unable to play ${src}`, error);
        options.onFallback?.();
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

  function startSyntheticBgm(name) {
    if (name) console.warn(`[Second Life Audio] BGM missing, skip synthetic bgm in production mode: ${name}`);
  }

  function startBgm(name) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.bgmEnabled || !audioState.unlocked || !name) return;
    if (audioState.currentBgm === name) return;
    const src = getAudioSource("bgm", name);
    stopRealAudio(audioState.realBgm);
    audioState.realBgm = null;
    stopAudioHandle(audioState.bgm);
    audioState.bgm = null;
    audioState.currentBgm = "";
    if (src) {
      audioState.currentBgm = name;
      audioState.realBgm = playRealAudio(src, {
        loop: true,
        volume: 0.14,
        onFallback: () => {
          if (audioState.currentBgm === name) {
            audioState.currentBgm = "";
            startSyntheticBgm(name);
          }
        },
      });
      return;
    }
    startSyntheticBgm(name);
  }

  function startSyntheticAmbience(name) {
    if (name) console.warn(`[Second Life Audio] Ambience missing, skip synthetic noise ambience: ${name}`);
  }

  function startAmbience(name) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.bgmEnabled || !audioState.unlocked || !name) return;
    if (audioState.currentAmbience === name) return;
    const src = getAudioSource("ambience", name);
    stopRealAudio(audioState.realAmbience);
    audioState.realAmbience = null;
    stopAudioHandle(audioState.ambience);
    audioState.ambience = null;
    audioState.currentAmbience = "";
    if (src) {
      audioState.currentAmbience = name;
      audioState.realAmbience = playRealAudio(src, {
        loop: true,
        volume: 0.08,
        onFallback: () => {
          if (audioState.currentAmbience === name) {
            audioState.currentAmbience = "";
            startSyntheticAmbience(name);
          }
        },
      });
      return;
    }
    startSyntheticAmbience(name);
  }

  function playSyntheticSfx(name = "") {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.sfxEnabled || !audioState.unlocked) return;
    const context = ensureAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.value = 0.0001;
    gain.connect(audioState.master);
    const osc = context.createOscillator();
    const isDoor = /door|lock|chain|knock|footstep/.test(name);
    const isPhone = /phone|call|vibrate/.test(name);
    const isMessage = /message/.test(name);
    osc.type = isDoor ? "sine" : "triangle";
    osc.frequency.value = isPhone ? 172 : isMessage ? 620 : isDoor ? 118 : 330;
    osc.connect(gain);
    osc.start(now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(isDoor ? 0.08 : 0.11, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isPhone ? 0.26 : 0.16));
    osc.stop(now + 0.32);
  }

  function playSfx(name = "") {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.sfxEnabled || !audioState.unlocked || !name) return;
    const src = getAudioSource("sfx", name);
    if (src) {
      playRealAudio(src, {
        loop: false,
        volume: 0.46,
        onFallback: () => playSyntheticSfx(name),
      });
      return;
    }
    if (name === "static_noise") {
      console.warn("[Second Life Audio] static_noise missing, skip synthetic noise fallback.");
      return;
    }
    playSyntheticSfx(name);
  }

  function speakNode(node) {
    const settings = getAudioSettings();
    if (!settings.audioEnabled || !settings.voiceEnabled || !audioState.unlocked || settings.voiceMode === "off") return;
    if (audioState.lastVoiceNodeId === node.nodeId) return;
    stopAllDialogueAudio();
    const token = audioState.dialogueToken;
    const sessionId = audioState.dialogueSessionId;
    const realVoiceKey = node.voiceAudio || node.narrationAudio || node.voiceStinger || "";
    const realVoiceCategory = node.voiceAudio ? "voice" : node.narrationAudio ? "narration" : node.voiceStinger ? "stingers" : "";
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
        loop: false,
        volume: realVoiceCategory === "stingers" ? 0.52 : 0.82,
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
      }, { once: true });
      audioState.currentDialogueAudio = audio;
      audioState.realVoice = audio;
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
    startBgm(sceneCue.bgm);
    startAmbience(sceneCue.ambience);
    const sfxList = Array.isArray(sceneCue.sfx) ? sceneCue.sfx : sceneCue.sfx ? [sceneCue.sfx] : [];
    sfxList.forEach((name) => playSfx(name));
    if (node.type === "clue") playSfx("clue_reveal");
    speakNode(node);
  }

  function stopAllAudio() {
    stopAllDialogueAudio();
    stopAudioHandle(audioState.bgm);
    stopAudioHandle(audioState.ambience);
    stopRealAudio(audioState.realBgm);
    stopRealAudio(audioState.realAmbience);
    audioState.bgm = null;
    audioState.ambience = null;
    audioState.realBgm = null;
    audioState.realAmbience = null;
    audioState.currentBgm = "";
    audioState.currentAmbience = "";
  }

  function toggleAudio() {
    const next = !isAudioEnabled();
    saveAudioSettings({ audioEnabled: next });
    if (next) {
      unlockAudio();
      const node = getNode();
      if (node) prepareAudioCue(node);
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
    const validClueIds = new Set(Object.keys(DATA.clues));
    const normalizedClues = Array.isArray(input.clues)
      ? input.clues.filter((clueId) => validClueIds.has(clueId))
      : [];
    const normalizedUnreadClues = Array.isArray(input.unreadClues)
      ? input.unreadClues.filter((clueId) => validClueIds.has(clueId))
      : [];
    const normalizedNodeId = DATA.nodes[input.nodeId] ? input.nodeId : "ch01_001";
    const normalizedEndingId = input.endingId && DATA.endings[input.endingId] ? input.endingId : null;
    return {
      ...createInitialState(),
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
      achievements: Array.from(new Set([...(loadStoredAchievements() || []), ...((Array.isArray(input.achievements) && input.achievements) || [])])),
      sessionAchievements: Array.isArray(input.sessionAchievements) ? input.sessionAchievements : [],
      importantChoices: Array.isArray(input.importantChoices) ? input.importantChoices : [],
      truthNotices: Array.isArray(input.truthNotices) ? input.truthNotices : [],
      relationships: normalizeRelationships(input.relationships),
      relationshipEvents: Array.isArray(input.relationshipEvents) ? input.relationshipEvents : [],
      endingPathTags: Array.isArray(input.endingPathTags) ? input.endingPathTags : [],
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
        <img class="splash-hero-art" src="${escapeHTML(VISUALS.covers?.home || "")}" alt="" aria-hidden="true" />
        <div class="life-orbit" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="brand-mark">SECOND LIFE</div>
        <h1>${escapeHTML(DATA.product.name)}</h1>
        <p>${escapeHTML(DATA.product.subtitle)}</p>
        <small>每一次选择，都会走向另一种人生。</small>
        <button class="primary-cta" type="button" data-action="enter-hall">开始体验</button>
      </section>
      `
    );
    app.querySelector("[data-action='enter-hall']").addEventListener("click", () => {
      unlockAudio();
      showHall();
    });
  }

  function showHall() {
    stopAllDialogueAudio();
    const cards = DATA.series
      .map((series) => {
        const isOpen = series.status === "open";
        const coverImage = series.seriesId === "series_rain_call"
          ? VISUALS.covers?.home
          : series.seriesId === "series_old_building"
            ? VISUALS.covers?.oldBuilding
            : VISUALS.covers?.missingPerson;
        return `
          <article class="case-folder ${isOpen ? "is-open" : "is-locked"}" data-series-id="${series.seriesId}">
            <div class="folder-cover ${isOpen ? "cover-rain-call" : "cover-sealed"}">
              <img src="${escapeHTML(coverImage || VISUALS.covers?.lockedArchive || "")}" alt="" loading="lazy" />
            </div>
            <div class="folder-tab">${isOpen ? "已开放" : "未开放"}</div>
            <div class="folder-lines" aria-hidden="true"></div>
            <span class="story-kind">${isOpen ? "悬疑人生" : "待解锁人生"}</span>
            <h2>${escapeHTML(series.title)}</h2>
            <p>${escapeHTML(series.summary)}</p>
            <button class="ghost-button" type="button">${isOpen ? "查看档案" : "未开放"}</button>
          </article>
        `;
      })
      .join("");

    setView(
      "hall",
      `
      <section class="hall-screen">
        <header class="page-header">
          <p class="eyebrow">LIFE ARCHIVE</p>
          <h1>人生档案</h1>
          <p>选择一个人生故事，进入别人的秘密、选择与结局。</p>
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
    const openScript = scripts.find((script) => script.status === "open") || scripts[0];
    const sealedScripts = scripts.filter((script) => script.scriptId !== openScript.scriptId);
    const hasLocalProgress = hasProgress();
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
          <div class="story-file-copy">
            <p class="eyebrow">LIFE FILE</p>
            <h1>${escapeHTML(openScript.title)}</h1>
            <p>\u66b4\u96e8\u591c\uff0c\u6797\u821f\u63a5\u5230\u6765\u81ea\u5df2\u6545\u5ba4\u53cb\u8bb8\u77e5\u590f\u7684\u7535\u8bdd\uff1b\u95e8\u5916\u5374\u7ad9\u7740\u4e00\u4e2a\u548c\u5979\u6781\u50cf\u7684\u5973\u4eba\u3002</p>
            <div class="story-file-tags"><span>\u60ac\u7591\u4eba\u751f</span><span>\u90fd\u5e02\u96e8\u591c</span><span>\u4f2a\u7075\u5f02\u65e7\u6848</span></div>
            ${renderPropStrip([
              "prop_phone_old_cracked",
              "prop_photo_polaroid",
              "prop_recording_file",
            ])}
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

    app.querySelector("[data-action='back-hall']").addEventListener("click", showHall);
    app.querySelector("[data-action='start-script']").addEventListener("click", () => {
      if (hasLocalProgress) {
        openConfirm("\u7ee7\u7eed\u4f53\u9a8c", "\u68c0\u6d4b\u5230\u672c\u5730\u8fdb\u5ea6\u3002\u8981\u4ece\u4e0a\u6b21\u4fdd\u5b58\u7684\u4eba\u751f\u8282\u70b9\u7ee7\u7eed\u5417\uff1f", () => {
          loadProgress();
          showGame();
        }, () => startNewGame());
      } else {
        startNewGame();
      }
    });
    app.querySelector("[data-action='restart-script']")?.addEventListener("click", () => {
      openConfirm("\u91cd\u65b0\u5f00\u59cb", "\u5c06\u4ece\u300a\u96e8\u591c\u6765\u7535\u300b\u7684\u7b2c\u4e00\u4e2a\u8282\u70b9\u91cd\u65b0\u8fdb\u5165\u3002", startNewGame);
    });
  }


  function startNewGame() {
    stopAllDialogueAudio();
    unlockAudio();
    state = createInitialState();
    autoSave();
    showGame();
  }

  function showGame() {
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
    setView(
      "game",
      `
      <section class="game-screen ${sceneClass}">
        <header class="game-topbar">
          <div class="game-title">
            <span>${escapeHTML(getScript().title)}</span>
            <strong>${escapeHTML(chapter?.title || node.chapterTitle || "")}</strong>
          </div>
          ${renderTruthMeter()}
          <button class="game-menu-button" type="button" data-tool="menu" aria-expanded="false">菜单</button>
          <nav class="toolbox" aria-label="游戏工具栏">
            <button type="button" data-tool="clues" class="clue-tool ${state.unreadClues.length ? "has-unread" : ""}">
              线索 <span>${state.clues.length}/${getTotalClueCount()}</span>
            </button>
            <button type="button" data-tool="relationships">人物</button>
            <button type="button" data-tool="audio">${isAudioEnabled() ? "声音 开" : "声音 关"}</button>

            <button type="button" data-tool="save">存档</button>
            <button type="button" data-tool="load">读档</button>
            <button type="button" data-tool="history">历史</button>
            <button type="button" data-tool="hall">返回人生档案</button>
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
    autoSave();
    processFeedbackQueue();
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

    if (node.resolveEnding === true) {
      continueButton.textContent = "查看结局";
      continueButton.addEventListener("click", () => {
        stopAllDialogueAudio();
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
      continueButton.addEventListener("click", () => {
        stopAllDialogueAudio();
        showEnding(node.nodeId);
      });
      return;
    }

    continueButton.addEventListener("click", () => {
      stopAllDialogueAudio();
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
    stopAllDialogueAudio();
    recordChoice(node, choice);
    addHistory({
      type: "choice",
      speaker: "你的选择",
      text: choice.text,
      nodeId: node.nodeId,
    });
    gainClues(choice.gainClues || []);
    setFlags(choice.setFlags || []);
    applyRelationshipEffects(choice.relationshipEffects || []);
    recordEndingPathTags(choice.endingPathTags || []);
    if (node.type === "deduction" && choice.isCorrect === true) {
      state.deductionScore += 1;
    }
    const choiceSfx = []
      .concat(choice.sfxOnChoice || [])
      .concat(node.sfxOnChoice || [])
      .filter(Boolean);
    if (choiceSfx.length) {
      choiceSfx.forEach((name) => playSfx(name));
    } else {
      playSfx("choice_confirm_soft");
    }
    evaluateProgressTriggers();
    evaluateAchievements();
    autoSave();
    if (choice.nextNodeId) {
      goToNode(choice.nextNodeId);
    } else {
      state.endingId = resolveEnding();
      showEnding(state.endingId);
    }
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
    stopAllDialogueAudio();
    if (DATA.endings[nodeId]) {
      showEnding(nodeId);
      return;
    }
    const previousNode = getNode();
    const nextNode = DATA.nodes[nodeId];
    const chapterFeedback =
      previousNode && nextNode && previousNode.chapterId !== nextNode.chapterId
        ? buildChapterSummaryFeedback(previousNode.chapterId, nextNode.chapterId)
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

  function buildChapterSummaryFeedback(chapterId, nextChapterId) {
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
      saveJSON(STORAGE_KEYS.achievements, state.achievements);
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
    stopAllDialogueAudio();
    const ending = DATA.endings[endingId] || DATA.endings.ending_d;
    state.endingId = ending.endingId;
    state.nodeId = ending.endingId;
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
            <button class="ghost-button" type="button" data-action="hall">返回人生档案</button>
          </div>
        </div>
      </section>
      `
    );

    app.querySelector("[data-action='restart']").addEventListener("click", () => {
      openConfirm("重新开始", "会从《雨夜来电》开头重新进入。当前自动进度会被覆盖。", startNewGame);
    });
    app.querySelector("[data-action='load']").addEventListener("click", () => openLoadModal());
    app.querySelector("[data-action='clues']").addEventListener("click", () => openClueModal());
    app.querySelector("[data-action='hall']").addEventListener("click", showHall);
  }

  function renderEndingReport(ending) {
    const report = ENDING_REPORT[ending.endingId] || ENDING_REPORT.ending_d;
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
          <article><span>最终推理</span><strong>${state.deductionScore}/5</strong></article>
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
        <blockquote>${escapeHTML(report.comment)}</blockquote>
      </section>
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
    bindTool("relationships", openRelationshipModal);
    bindTool("audio", toggleAudio);
    bindTool("save", openSaveModal);
    bindTool("load", openLoadModal);
    bindTool("history", openHistoryModal);
    bindTool("hall", () => {
        openConfirm("返回人生档案", "返回前会自动保存当前进度。要离开当前故事吗？", () => {
        stopAllDialogueAudio();
        autoSave();
        showHall();
      });
    });
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

  function bindSceneInteractions() {
    app.querySelectorAll("[data-scene-feedback]").forEach((element) => {
      element.addEventListener("click", () => {
        element.classList.add("is-checked");
        showToast(element.dataset.sceneFeedback || "已检查", "clue");
      });
    });
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
    const slots = readJSON(STORAGE_KEYS.saves, [null, null, null]);
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
          const nextSlots = readJSON(STORAGE_KEYS.saves, [null, null, null]);
          nextSlots[index] = {
            ...snapshotState(),
            savedAt: new Date().toISOString(),
          };
          saveJSON(STORAGE_KEYS.saves, nextSlots);
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
    const slots = readJSON(STORAGE_KEYS.saves, [null, null, null]);
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
          stopAllDialogueAudio();
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
        <button class="case-button" type="button" data-feedback-close>收入线索库</button>
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
        <button class="case-button" type="button" data-feedback-close>继续</button>
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
        <div class="feedback-progress">
          <span>真相进度</span>
          <strong>${getCoreClueCount()} / ${CORE_CLUE_IDS.length}</strong>
        </div>
        <button class="case-button" type="button" data-feedback-close>进入${escapeHTML(item.nextTitle)}</button>
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
    window.setTimeout(processFeedbackQueue, 80);
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
    const visual = VISUALS.scenes?.[scene] || VISUALS.scenes?.rental_room_rain_night;
    const chapter = getChapter(node.chapterId);
    const stateClass = node.type ? `visual-state-${node.type}` : "visual-state-dialogue";
    const title = visual?.title || chapter?.title || "未知场景";
    const overlays = (visual?.overlays || [])
      .map((src) => `<img class="scene-overlay" src="${escapeHTML(src)}" alt="" aria-hidden="true" loading="lazy" />`)
      .join("");
    const props = (visual?.props || [])
      .map((id) => VISUALS.props?.[id])
      .filter(Boolean)
      .map((prop) => `<img class="scene-prop" src="${escapeHTML(prop.image)}" alt="${escapeHTML(prop.label)}" loading="lazy" />`)
      .join("");
    return `
      <div class="scene-asset-shell ${stateClass} focus-${escapeHTML(visual?.focus || "center")}" data-scene-id="${escapeHTML(scene)}">
        <img class="scene-bg-image" src="${escapeHTML(visual?.bg || "")}" alt="${escapeHTML(title)}" loading="lazy" />
        ${renderCharacterLayer(node.speaker, node)}
        <div class="scene-overlay-layer">${overlays}</div>
        <div class="scene-prop-layer">${props}</div>
        <div class="scene-asset-label">
          <span>${escapeHTML(title)}</span>
          <small>${escapeHTML(chapter?.title || node.chapterTitle || "")}</small>
        </div>
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
