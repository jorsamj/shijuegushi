window.MIST_DATA = (() => {
  "use strict";

  const product = {
    name: "第二人生",
    subtitle: "欢迎来体验别人的人生。",
  };

  const series = [
    {
      seriesId: "series_rain_call",
      title: "雨夜来电",
      status: "open",
      summary: "一个暴雨夜，一通来自死者的电话，把你带回三年前的旧案。",
      scriptIds: ["script_rain_call", "script_no_answer", "script_third_voice"],
    },
    {
      seriesId: "series_old_building",
      title: "旧楼档案",
      status: "locked",
      summary: "每一栋旧楼，都住着不愿被提起的人生。",
      scriptIds: [],
    },
    {
      seriesId: "series_missing_people",
      title: "消失的人",
      status: "locked",
      summary: "有人从生活里消失，也有人从记忆里回来。",
      scriptIds: [],
    },
  ];

  const scripts = [
    {
      scriptId: "script_rain_call",
      seriesId: "series_rain_call",
      title: "雨夜来电",
      status: "open",
      order: 1,
      startNodeId: "ch01_001",
      summary: "暴雨夜，林舟接到来自已故室友许知夏的电话，门外却站着一个和她极像的女人。",
    },
    {
      scriptId: "script_no_answer",
      seriesId: "series_rain_call",
      title: "无人接听",
      status: "coming",
      order: 2,
      summary: "旧号码再次响起，但这一次没有人敢接。",
    },
    {
      scriptId: "script_third_voice",
      seriesId: "series_rain_call",
      title: "第三个声音",
      status: "coming",
      order: 3,
      summary: "通话录音里，出现了不属于任何人的第三个声音。",
    },
  ];

  const chapters = [
    { chapterId: "chapter_01", title: "第 1 章：雨夜来电", order: 1 },
    { chapterId: "chapter_02", title: "第 2 章：门外的许知晚", order: 2 },
    { chapterId: "chapter_03", title: "第 3 章：三年前的裂缝", order: 3 },
    { chapterId: "chapter_04", title: "第 4 章：最后一张合照", order: 4 },
    { chapterId: "chapter_05", title: "第 5 章：旧手机的声音", order: 5 },
    { chapterId: "chapter_06", title: "第 6 章：无人接听", order: 6 },
  ];

  const clues = {
    clue_dead_call: {
      clueId: "clue_dead_call",
      title: "死者来电",
      category: "通话",
      description: "许知夏已在三年前死亡，她的旧号码却在暴雨夜打进林舟手机。",
      isKey: true,
    },
    clue_sister_mark: {
      clueId: "clue_sister_mark",
      title: "许知晚身份细节",
      category: "人物",
      description: "门外的女人说出许知夏只告诉过亲近之人的细节，证明她并非随便冒名。",
      isKey: true,
    },
    clue_gray_loan: {
      clueId: "clue_gray_loan",
      title: "灰色借贷",
      category: "旧案",
      description: "许知夏死亡前发现自己的身份信息被冒用借贷，并试图寻求帮助。",
      isKey: true,
    },
    clue_zhou_left: {
      clueId: "clue_zhou_left",
      title: "周屿离城",
      category: "人物",
      description: "周屿在旧案新闻公开前一天离开城市，时间点与他的说法不一致。",
      isKey: true,
    },
    clue_photo_background: {
      clueId: "clue_photo_background",
      title: "照片背景人影",
      category: "照片",
      description: "最后合照的背景里出现了疑似周屿的身影，位置与三年前证词矛盾。",
      isKey: true,
    },
    clue_timed_voice: {
      clueId: "clue_timed_voice",
      title: "旧手机语音触发记录",
      category: "通话",
      description: "许知晚重新开机旧手机后，云端语音备忘被触发，解释了死者来电的来源。",
      isKey: true,
    },
  };

  const defaultFlags = {
    trusted_zhuwan_early: false,
    verified_zhuwan_identity: false,
    found_gray_loan: false,
    suspected_zhou: false,
    found_last_photo: false,
    backed_up_photo: false,
    found_photo_background: false,
    understood_dead_call: false,
    deleted_evidence: false,
    chose_reopen_case: false,
    kept_door_closed: false,
    called_chenyan: false,
    answered_zhou_call: false,
    refused_zhou_pressure: false,
    gave_original_photo: false,
    checked_peephole: false,
    final_backup_reviewed: false,
  };

  const endings = {
    ending_a: {
      endingId: "ending_a",
      title: "A 结局：真相重启",
      text: "林舟没有再把手机扣回桌面。\n\n她把照片、旧手机记录、陈妍查到的资料一起发给了新的邮箱，又发给了许知晚。\n\n雨停之前，许知晚在门外低声说：姐姐等这一天等了三年。\n\n旧案不会立刻结束，但它终于重新开始。",
    },
    ending_b: {
      endingId: "ending_b",
      title: "B 结局：证据失控",
      text: "林舟把原始照片交给了许知晚。\n\n许知晚没有骗她，可证据离开林舟手里后，周屿比她们更快一步行动。\n\n第二天，网上出现了剪碎的照片、互相矛盾的说法，还有周屿轻描淡写的一句：她们太想要一个凶手了。\n\n真相还在，但证据链断了。",
    },
    ending_c: {
      endingId: "ending_c",
      title: "C 结局：删除证据",
      text: "删除键按下去时，屏幕只闪了一下。\n\n林舟盯着空白相册，忽然想起许知夏三年前也是这样从所有人的生活里消失的。\n\n雨声慢慢小了。\n\n这一次，是她亲手关上了那通迟到的求救。",
    },
    ending_d: {
      endingId: "ending_d",
      title: "D 结局：无人接听",
      text: "天亮以后，楼道恢复安静。\n\n门外没有人，桌上的手机也不再亮起。林舟照常去上班，照常把昨晚当成一个太累之后的梦。\n\n三天后，那个旧号码再次打来。\n\n屏幕亮了很久，最后只剩四个字：无人接听。",
    },
  };

  const nodes = {};

  function rel(id, delta, reason) {
    return { id, delta, reason };
  }

  function choice(choiceId, text, nextNodeId, options = {}) {
    return {
      choiceId,
      text,
      nextNodeId,
      setFlags: options.setFlags || [],
      gainClues: options.gainClues || [],
      relationshipEffects: options.relationshipEffects || [],
      endingPathTags: options.endingPathTags || [],
      choiceImpactText: options.choiceImpactText || text,
      feedbackTitle: options.feedbackTitle,
      feedbackTone: options.feedbackTone,
      choiceIntent: options.choiceIntent,
      sfxOnChoice: options.sfxOnChoice || [],
      isCorrect: options.isCorrect === true,
    };
  }

  function add(chapterNo, index, data) {
    const nodeId = `ch${String(chapterNo).padStart(2, "0")}_${String(index).padStart(3, "0")}`;
    nodes[nodeId] = {
      nodeId,
      chapterId: `chapter_${String(chapterNo).padStart(2, "0")}`,
      scene: data.scene || "rental_room_rain_night",
      type: data.type || "dialogue",
      speaker: data.speaker || "旁白",
      text: data.text,
      nextNodeId: data.nextNodeId || `ch${String(chapterNo).padStart(2, "0")}_${String(index + 1).padStart(3, "0")}`,
      gainClues: data.gainClues || [],
      setFlags: data.setFlags || [],
      choices: data.choices || [],
      question: data.question,
      correctChoiceId: data.correctChoiceId,
      visualMood: data.visualMood,
      visualCharacter: data.visualCharacter,
      characterVariant: data.characterVariant,
      characterScale: data.characterScale,
      characterPosition: data.characterPosition,
      characterFraming: data.characterFraming,
      characterHeadSafe: data.characterHeadSafe,
      characterFocus: data.characterFocus,
      overlayPreset: data.overlayPreset,
      visualFocus: data.visualFocus,
      highlightProps: data.highlightProps || [],
      shotTone: data.shotTone,
      objectiveId: data.objectiveId,
      objectiveText: data.objectiveText,
      objectiveComplete: data.objectiveComplete === true,
      investigationHotspots: data.investigationHotspots || [],
      evidenceLinks: data.evidenceLinks || [],
      chapterRecap: data.chapterRecap,
      bgm: data.bgm,
      ambience: data.ambience,
      sfxOnEnter: data.sfxOnEnter || [],
      sfxOnChoice: data.sfxOnChoice || [],
      narrationAudio: data.narrationAudio,
      voiceAudio: data.voiceAudio,
      voiceStinger: data.voiceStinger,
      voiceCharacter: data.voiceCharacter,
      voiceProfile: data.voiceProfile,
      voiceEmotion: data.voiceEmotion,
      voiceDirection: data.voiceDirection,
      voiceSpeed: data.voiceSpeed,
      voicePitch: data.voicePitch,
      audioMood: data.audioMood,
      audioPolicy: data.audioPolicy,
      resolveEnding: data.resolveEnding || false,
    };
    if (data.nextNodeId === null) delete nodes[nodeId].nextNodeId;
  }

  const cue = (key, options = {}) => ({ key, ...options });

  // 第 1 章：雨夜来电
  add(1, 1, { speaker: "旁白", text: "暴雨把窗户拍得发白。林舟盯着电脑里还没写完的周报，泡面汤已经凉透，杯沿留着半圈咖啡渍。\n\n她把许知夏的名字从联系人里删过一次，又在备份里看见过一次。三年了，那个名字一直像一枚没拔出来的刺。", bgm: "rain_night_loop", ambience: "room_night_loop", sfxOnEnter: ["rain_window_soft"], audioPolicy: { bgmMode: "replace", ambienceMode: "replace" } });
  add(1, 2, { speaker: "林舟", text: "再改一版……就睡。", scene: "rental_room_table" });
  add(1, 3, { speaker: "旁白", text: "手机突然震动。屏幕在桌面水渍里亮起来，来电显示跳出一个三年前就不该再出现的名字。\n\n许知夏。\n\n林舟没有立刻接。雨声像贴在窗外的手，手机却一下一下震得更急。", scene: "phone_call_ui", type: "clue", gainClues: ["clue_dead_call"], visualMood: "tense", bgm: "rain_night_loop", ambience: "rain_heavy_loop", sfxOnEnter: ["phone_screen_wake", "phone_vibrate", "phone_ring_dead_call"], audioMood: "tense", audioPolicy: { bgmMode: "keep", ambienceMode: "keep" } });
  add(1, 4, { speaker: "林舟", text: "不可能。", scene: "phone_call_ui", voiceStinger: "linzhou_gasp_short", audioMood: "tense", sfxOnEnter: ["room_silence_drop"], audioPolicy: { bgmMode: "keep", ambienceMode: "keep" } });
  add(1, 5, { speaker: "许知夏的声音", text: "别开门……她不是我。\n\n最后一个字被电流撕碎。林舟听见自己的呼吸撞在听筒上，像另一个人正贴着她耳边发抖。", scene: "phone_call_ui", visualCharacter: "许知夏", visualMood: "horror", characterVariant: "recording", characterScale: "impact", characterPosition: "center", characterFraming: "halfbody", characterHeadSafe: true, characterFocus: "face", bgm: "rain_night_loop", ambience: "rain_heavy_loop", sfxOnEnter: ["phone_call_connect", "recording_static_short"], voiceStinger: "xuzhixia_weak_static_exhale", audioMood: "horror", audioPolicy: { bgmMode: "keep", ambienceMode: "keep" } });
  add(1, 6, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "电话断了。林舟还握着手机，屏幕上的通话时长停在 7 秒。\n\n下一秒，门铃响起。走廊里有水滴落在地上的声音，一滴，一滴，像有人站在门外很久了。",
    sfxOnEnter: ["phone_call_end", "doorbell_rain_night"],
    sfxOnChoice: ["choice_confirm_soft"],
    audioPolicy: { bgmMode: "keep", ambienceMode: "keep" },
    choices: [
      choice("a", "你没靠近门，只隔着客厅问：外面是谁？", "ch01_007", {
        setFlags: ["kept_door_closed"],
        relationshipEffects: [rel("courage_linzou", 5, "你没有立刻被恐惧推着开门")],
        endingPathTags: ["kept_boundary"],
      }),
      choice("b", "你屏住呼吸，走到猫眼前确认门外的人", "ch01_008", {
        relationshipEffects: [rel("courage_linzou", 5, "你逼自己确认门外的现实")],
        endingPathTags: ["checked_peephole"],
      }),
      choice("c", "你先给陈妍发消息：十分钟后没回，就报警", "ch01_009", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你第一时间让陈妍成为外部见证")],
        endingPathTags: ["chenyan_witness"],
      }),
    ],
  });
  add(1, 7, { speaker: "女人", text: "林舟？我是许知晚。许知夏的妹妹。\n\n门外的女人声音很低，像怕惊动楼道里的什么东西。\n\n雨太大了，你先别怕。", scene: "corridor_door", visualCharacter: "许知晚", visualMood: "tense", characterVariant: "wet", characterScale: "impact", characterPosition: "center", characterFraming: "three-quarter", characterHeadSafe: true, characterFocus: "upperBody", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["footstep_corridor_wet"], voiceStinger: "xuzhiwan_low_breath", audioMood: "tense", audioPolicy: { bgmMode: "replace", ambienceMode: "replace" } });
  add(1, 8, { speaker: "旁白", text: "猫眼外站着一个浑身湿透的女人。楼道灯闪了一下，镜片里的脸被拉得微微变形。\n\n她抬头时，林舟差点后退。\n\n不是像。那一瞬间，林舟几乎以为三年前死去的人站回了门外。", scene: "corridor_door", visualMood: "tense", visualCharacter: "许知晚", characterVariant: "fullbody", characterScale: "large", characterPosition: "center", characterFraming: "fullbody", characterHeadSafe: true, characterFocus: "fullBody", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["door_chain_close", "corridor_light_flicker"], audioMood: "tense", audioPolicy: { bgmMode: "keep", ambienceMode: "keep" } });
  add(1, 9, { speaker: "陈妍", text: "你最好别开门。先把门链扣上，手机别离手。\n\n还有，别急着信任何人。死去三年的人给你打电话，这事要么是恶作剧，要么是有人知道你怕什么。", scene: "old_chat_memory", sfxOnEnter: ["message_pop_cold"] });
  add(1, 10, {
    type: "choice",
    scene: "corridor_door",
    speaker: "林舟",
    text: "门外的女人没有催。她把手掌贴在门上，像是在确认屋里的人还活着。\n\n雨水顺着她袖口往下滴，门缝下的地垫很快湿了一小片。林舟忽然意识到，自己必须问一个只有许知夏知道答案的问题。",
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你问她：许知夏大学时最怕什么？", "ch01_011", {
        setFlags: ["verified_zhuwan_identity"],
        relationshipEffects: [rel("trust_zhuwan", 5, "你选择隔门核验许知晚身份")],
        endingPathTags: ["identity_check"],
      }),
      choice("b", "你先拨回许知夏的号码，想证明那通电话不是幻觉", "ch01_012", {
        relationshipEffects: [rel("courage_linzou", 5, "你试图确认死者来电来源")],
        endingPathTags: ["called_dead_number"],
      }),
      choice("c", "你打开录音，把门铃后的呼吸声留证", "ch01_013", {
        relationshipEffects: [rel("courage_linzou", 3, "你选择先保留现场痕迹")],
        endingPathTags: ["recorded_doorbell"],
      }),
    ],
  });
  add(1, 11, { speaker: "许知晚", text: "她怕黑。不是夜灯那种黑，是楼梯间突然停电的黑。\n\n她说你会笑她，可还是会陪她走完那段楼梯。许知晚说完这句，声音轻了一点：她还说，你其实比她更怕一个人留下。", scene: "corridor_door" });
  add(1, 12, { speaker: "旁白", text: "回拨没有接通。运营商提示音平稳得像一盆冷水，把那个名字重新按回三年前。\n\n可林舟看见通话记录还在。那不是梦。许知夏的号码，确实在这个雨夜打进来过。", scene: "phone_call_ui", sfxOnEnter: ["phone_call_end"] });
  add(1, 13, { speaker: "旁白", text: "录音里，门铃之后有一声很轻的吸气。像门外的人在忍着哭，也像有人站在更远处听。\n\n林舟把音量调高。那一瞬间，门外忽然安静，仿佛走廊也在听她回放。", scene: "corridor_door", sfxOnEnter: ["recording_static_short"] });
  add(1, 14, {
    type: "choice",
    scene: "corridor_door",
    speaker: "许知晚",
    text: "许知晚压低声音：我不是来吓你的。我姐三年前不是意外。\n\n她说这句话时没有哭，甚至没有抬高声音。可林舟听出来，那不是请求，是她已经在心里重复过无数次的判决。",
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你让她把证件从门缝递进来，先别靠近门锁", "ch01_015", {
        setFlags: ["verified_zhuwan_identity"],
        relationshipEffects: [rel("trust_zhuwan", 8, "你要求证明，但没有把她拒之门外")],
        endingPathTags: ["requested_proof"],
      }),
      choice("b", "你告诉她：我会报警，让警察来听你说", "ch01_016", {
        relationshipEffects: [rel("courage_linzou", 5, "你试图把恐惧转为现实处理")],
        endingPathTags: ["police_option"],
      }),
      choice("c", "你问她：为什么偏偏是今晚，偏偏来找我？", "ch01_017", {
        relationshipEffects: [rel("trust_zhuwan", 4, "你开始追问许知晚的真实目的")],
        endingPathTags: ["asked_timing"],
      }),
    ],
  });
  add(1, 15, { speaker: "旁白", text: "门缝里滑进来一张塑封证件。名字是许知晚。\n\n照片上的她笑得很浅，和门外湿透的狼狈判若两人。林舟没有立刻捡，只盯着那张证件边缘的水迹，看它慢慢渗进地毯。", scene: "corridor_door" });
  add(1, 16, { speaker: "许知晚", text: "你可以报警。但在他们来之前，你先看一眼我发给你的东西。\n\n许知晚顿了顿，像终于把最危险的名字放到门缝里：别让周屿知道。", scene: "corridor_door" });
  add(1, 17, { speaker: "许知晚", text: "因为今晚，我姐的旧手机亮了。\n\n它先拨给你，然后才把记录同步给我。像她等了三年，终于等到你还愿意接电话。", scene: "corridor_door" });
  add(1, 18, { speaker: "旁白", text: "手机又震了一下。这一次不是旧号码，是周屿。\n\n【这么晚了，别随便给陌生女人开门。】\n\n林舟盯着那行字，胃里忽然沉下去。她没有告诉任何人，门外站着一个女人。", scene: "phone_call_ui", sfxOnEnter: ["message_pop_cold"], voiceStinger: "zhouyu_phone_silence" });
  add(1, 19, { speaker: "林舟", text: "周屿怎么会知道门外有人？\n\n这句话出口后，屋里连雨声都像被压低了。林舟第一次觉得，那通来自死者的电话也许不是最可怕的事。", scene: "rental_room_rain_night" });
  add(1, 20, { speaker: "旁白", text: "门外的许知晚也看见了那条消息。她没有解释，只把手从门上慢慢放下。\n\n楼道灯闪了一下，把猫眼里的她切成一张潮湿的旧照片。\n\n她隔着门低声说：他已经开始了。", scene: "corridor_door", nextNodeId: "ch02_001", sfxOnEnter: ["corridor_light_flicker"], voiceStinger: "xuzhiwan_cold_exhale" });

  // 第 2 章：门外的许知晚
  add(2, 1, { speaker: "许知晚", text: "他给你发消息了，对不对？\n\n许知晚没有问是谁。她的眼睛越过猫眼，像能看见林舟握着手机的手。那种确定，比她刚才说自己是许知夏妹妹更让人不安。", scene: "corridor_door", voiceStinger: "xuzhiwan_cold_exhale" });
  add(2, 2, { speaker: "林舟", text: "你怎么知道？\n\n林舟没有把手机贴近猫眼。她忽然害怕门外的女人不是在猜，而是在等这条消息出现。", scene: "corridor_door" });
  add(2, 3, { speaker: "许知晚", text: "因为三年前，他也是这样先让所有人闭嘴。\n\n他说“别让事情变难看”。他说“知夏只是太累了”。他说到最后，所有人都开始替他重复那句话。", scene: "corridor_door", visualCharacter: "许知晚", visualMood: "tense", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", ambience: "rain_heavy_loop", sfxOnEnter: ["corridor_light_flicker"], voiceStinger: "xuzhiwan_low_breath", audioMood: "tense" });
  add(2, 4, {
    type: "choice",
    scene: "corridor_door",
    speaker: "旁白",
    text: "门链扣着。林舟只能看见她湿透的鞋尖和一截黑色外套。\n\n楼道尽头那盏灯忽亮忽灭，每亮一次，许知晚的影子就被拉长一次。她没有催门，只在等林舟决定要不要继续听。",
    choices: [
      choice("a", "你继续隔门问她：你凭什么证明你是她妹妹？", "ch02_005", {
        relationshipEffects: [rel("trust_zhuwan", 6, "你给了许知晚解释空间，但仍保持距离")],
        endingPathTags: ["slow_identity_check"],
      }),
      choice("b", "你让她进玄关，但手机录音一直开着", "ch02_006", {
        setFlags: ["trusted_zhuwan_early"],
        relationshipEffects: [rel("trust_zhuwan", 15, "你选择提前相信许知晚"), rel("suspicion_zhou", 5, "关键人物进入房间增加证据风险")],
        endingPathTags: ["trusted_zhuwan_early"],
      }),
      choice("c", "你把周屿那条消息截给陈妍，让外面有人知道", "ch02_007", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你把周屿异常消息交给陈妍保存")],
        endingPathTags: ["zhou_message_saved"],
      }),
    ],
  });
  add(2, 5, { speaker: "许知晚", text: "她高三那年离家出走，躲在图书馆天台。那天家里人找疯了，她却只给我发了一句：别让他们等我。\n\n后来她跟你说过吧？她最怕让别人等。", scene: "corridor_door", type: "clue", gainClues: ["clue_sister_mark"] });
  add(2, 6, { speaker: "旁白", text: "许知晚进门后没有坐。她站在玄关最靠近门的位置，像随时准备离开，也像不想让林舟离开。\n\n水从袖口滴到地垫上，她的眼睛一直盯着林舟的手机。", scene: "rental_room_rain_night", type: "clue", gainClues: ["clue_sister_mark"] });
  add(2, 7, { speaker: "陈妍", text: "截图收到了。周屿？你大学那个老好人？\n\n陈妍停了两秒，语气冷下来：林舟，他为什么半夜知道你家门口站着谁？你先别信任何人，包括门口那个。", scene: "old_chat_memory", sfxOnEnter: ["message_pop_cold"] });
  add(2, 8, {
    type: "choice",
    scene: "rental_room_rain_night",
    speaker: "许知晚",
    text: "许知晚把手机举到胸前。屏幕上是一张照片，角落里能看见裂开的旧手机。\n\n我可以给你看，但你不能转给周屿。她说这句时，第一次露出明显的害怕。",
    choices: [
      choice("a", "你没有接手机，先逼她说清旧手机怎么到她手里", "ch02_009", {
        relationshipEffects: [rel("trust_zhuwan", 5, "你没有盲信许知晚的旧手机说法")],
        endingPathTags: ["asked_old_phone_source"],
      }),
      choice("b", "你先看那张照片，但不把手机递给她", "ch02_010", {
        relationshipEffects: [rel("trust_zhuwan", 8, "你愿意先看证据再判断")],
        endingPathTags: ["looked_old_phone_photo"],
      }),
      choice("c", "你让她发给你，同时转给陈妍留底", "ch02_011", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 8, "你让陈妍加入证据备份链")],
        endingPathTags: ["backup_mind"],
      }),
    ],
  });
  add(2, 9, { speaker: "许知晚", text: "我在她旧云盘里找了三个月。今晚它自己同步了一条提醒，像她终于等到有人开机。", scene: "old_phone_view" });
  add(2, 10, { speaker: "旁白", text: "照片里是一部旧手机。屏幕裂开一角，通知栏停着一行字：语音备忘恢复完成。\n\n下面有林舟的名字。不是备注，不是聊天记录，是一条等待被拨出的提醒。", scene: "old_phone_view" });
  add(2, 11, { speaker: "陈妍", text: "我帮你存了。还有，别把原图随便给任何人，包括门口那个。", scene: "old_chat_memory" });
  add(2, 12, { speaker: "林舟", text: "你为什么不直接报警？", scene: "rental_room_rain_night" });
  add(2, 13, { speaker: "许知晚", text: "我报过。没人愿意为了一个三年前的意外，听一个妹妹讲旧手机和雨夜电话。", scene: "rental_room_rain_night" });
  add(2, 14, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "周屿又发来消息。\n\n【你最近是不是又失眠了？别被过去的事吓到。】\n\n下一条隔了三秒才跳出来。\n\n【她如果在你门口，别听她说完。】",
    choices: [
      choice("a", "你回复周屿：你怎么知道她在我门外？", "ch02_015", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你直接追问周屿不该知道的信息"), rel("courage_linzou", 5, "你开始正面回应周屿异常")],
        endingPathTags: ["questioned_zhou_knowledge"],
      }),
      choice("b", "你不回，把手机屏幕转给许知晚看", "ch02_016", {
        relationshipEffects: [rel("trust_zhuwan", 8, "你把周屿的干扰公开给许知晚")],
        endingPathTags: ["shared_zhou_message"],
      }),
      choice("c", "你让陈妍立刻查周屿最近的联系方式和位置", "ch02_017", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你请陈妍追踪周屿的现实动向")],
        endingPathTags: ["chenyan_tracks_zhou"],
      }),
    ],
  });
  add(2, 15, { speaker: "周屿", text: "我只是担心你。你以前就容易心软，知夏出事那晚也是。\n\n他把“心软”两个字说得很轻，像不是责备，而是一把已经放在林舟手腕上的手。", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "tense", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["message_pop_cold"], audioMood: "tense", voiceStinger: "zhouyu_phone_silence" });
  add(2, 16, { speaker: "许知晚", text: "他说你心软？他最会用这个词了。说得像所有犹豫都是别人的错。", scene: "rental_room_rain_night" });
  add(2, 17, { speaker: "陈妍", text: "查到了，他号码换过，但社交账号还在。三年前以后，他几乎删掉了所有和许知夏同框的照片。", scene: "old_chat_memory" });
  add(2, 18, { speaker: "旁白", text: "许知晚擦了擦手，终于坐下。她没有靠近沙发，只坐在门边，像随时准备被赶出去。", scene: "rental_room_rain_night" });
  add(2, 19, { speaker: "许知晚", text: "我来找你，是因为你手里可能有最后一张合照。背景里有他。", scene: "rental_room_rain_night" });
  add(2, 20, { speaker: "旁白", text: "手机屏幕暗下去前，旧手机照片里的通知又跳出一行：三年前的今日，23:40。\n\n许知晚盯着那串时间，喉咙动了一下：知夏出事前，也收到过一条几乎一样的消息。\n\n楼道灯在这句话后彻底暗了下去。", scene: "old_phone_view", nextNodeId: "ch03_001" });

  // 第 3 章：三年前的裂缝
  add(3, 1, { speaker: "旁白", text: "林舟把旧移动硬盘从抽屉底翻出来。灰尘扬起时，她闻到一股很淡的潮味。\n\n这东西她搬过三次家，却一次也没丢。不是舍不得，是每次拿起来，都像有人在里面敲门。", scene: "rental_room_table" });
  add(3, 2, { speaker: "许知晚", text: "你要是还觉得我疯，我现在就走。\n\n但你看一眼三年前。只要一眼。", scene: "rental_room_table" });
  add(3, 3, { speaker: "林舟", text: "我不是不想看。\n\n我是不敢。", scene: "old_chat_memory" });
  add(3, 4, {
    type: "choice",
    scene: "old_chat_memory",
    speaker: "旁白",
    text: "硬盘转得很慢，像从水里捞出一段坏掉的时间。\n\n文件夹弹出来：照片、聊天截图、新闻缓存。每一个名字都像一扇没关紧的门。",
    choices: [
      choice("a", "你先点开许知夏发给自己的最后几条消息", "ch03_005", {
        relationshipEffects: [rel("courage_linzou", 6, "你开始面对自己逃避三年的聊天记录")],
        endingPathTags: ["old_chat_review"],
      }),
      choice("b", "你把旧新闻截图发给陈妍，让她查发布时间", "ch03_006", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你让陈妍从现实资料入手")],
        endingPathTags: ["old_news_search"],
      }),
      choice("c", "你盯着许知晚：你查到哪一步了，别再藏", "ch03_007", {
        relationshipEffects: [rel("trust_zhuwan", 7, "你要求许知晚交代她掌握的边界")],
        endingPathTags: ["zhuwan_investigation_scope"],
      }),
    ],
  });
  add(3, 5, { speaker: "许知夏", text: "林舟，如果有人用你的名字借钱，你会先骂人还是先报警？\n\n三年前的林舟回了一个表情包：先骂，骂完请你吃饭。\n\n现在的林舟盯着那句话，喉咙像被雨水堵住。", scene: "old_chat_memory" });
  add(3, 6, { speaker: "陈妍", text: "新闻标题很普通：女大学生雨夜坠楼。\n\n普通到像有人专门把它写得普通。没有同行人，没有通话记录，连‘疑点’两个字都没有。", scene: "old_chat_memory" });
  add(3, 7, { speaker: "许知晚", text: "我查到她出事前一周在搜身份信息被冒用。\n\n再往下查，账号注销，客服记录没了，连她当时常用的邮箱都被改过密码。", scene: "rental_room_rain_night" });
  add(3, 8, { speaker: "旁白", text: "屏幕里，三年前的聊天停在许知夏最后一个表情：一只缩在雨伞下的小猫。\n\n那天之后，她再也没有回复。林舟当时以为她只是心情不好。她甚至没有再追问。", scene: "old_chat_memory" });
  add(3, 9, {
    type: "choice",
    scene: "old_chat_memory",
    speaker: "陈妍",
    text: "陈妍发来语音：你要我继续查，就别半路装死。\n\n我先说清楚，这不是八卦。这东西往下挖，会有人不想让你看见。",
    choices: [
      choice("a", "你让陈妍继续查那笔异常借贷", "ch03_010", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 12, "你让陈妍继续追查灰色借贷")],
        endingPathTags: ["gray_loan_search"],
      }),
      choice("b", "你给周屿发消息：知夏当年是不是欠过钱？", "ch03_011", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你用借贷问题试探周屿")],
        endingPathTags: ["asked_zhou_loan"],
      }),
      choice("c", "你问许知晚：除了怀疑，你手里有什么？", "ch03_012", {
        relationshipEffects: [rel("trust_zhuwan", 5, "你要求许知晚拿出可核验资料")],
        endingPathTags: ["asked_evidence"],
      }),
    ],
  });
  add(3, 10, { speaker: "陈妍", text: "有了。\n\n不是正规借款，是套身份的灰色平台。截图里，借款人一栏写着许知夏的名字。证件号是真的，签名却不像她。\n\n更怪的是，借款时间就在她准备报警前两天。", scene: "old_chat_memory", type: "clue", gainClues: ["clue_gray_loan"], setFlags: ["found_gray_loan"], sfxOnEnter: ["evidence_reveal"] });
  add(3, 11, { speaker: "周屿", text: "知夏那时候压力很大，你现在翻这些，只会让所有人更难堪。\n\n林舟，你一直是最会替别人着想的人。别到最后，连你自己都下不了台。", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "tense", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], audioMood: "tense", voiceStinger: "zhouyu_phone_silence" });
  add(3, 12, { speaker: "许知晚", text: "我有平台截图，但不完整。\n\n完整的东西，可能在你那张合照里。不是因为照片能证明借贷，是因为它能证明那晚谁在撒谎。", scene: "rental_room_rain_night", type: "clue", gainClues: ["clue_gray_loan"], setFlags: ["found_gray_loan"] });
  add(3, 13, { speaker: "林舟", text: "合照为什么能证明借贷？", scene: "rental_room_rain_night" });
  add(3, 14, { speaker: "许知晚", text: "不能证明借贷。\n\n但能证明周屿那晚不在他说的位置。一个人说谎，总不是只为了一件事。", scene: "rental_room_rain_night" });
  add(3, 15, { speaker: "旁白", text: "雨声忽然变密，窗缝里漏进一线冷风。\n\n电脑屏幕上，旧新闻的发布时间停在凌晨四点。可陈妍发来的内部截图显示，周屿的离职流程，早在新闻发出前就已经走完。", scene: "rental_room_rain_night" });
  add(3, 16, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "陈妍",
    text: "陈妍又发来一条：周屿当年离职时间不对。\n\n你要现在听，还是先确认他会怎么解释？",
    choices: [
      choice("a", "你让陈妍直接说完，不再绕开时间线", "ch03_017", {
        relationshipEffects: [rel("support_chenyan", 10, "你信任陈妍继续给出关键现实资料")],
        endingPathTags: ["zhou_left_found"],
      }),
      choice("b", "你打给周屿：你到底哪天离开的？", "ch03_018", {
        setFlags: ["suspected_zhou", "answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 12, "你正面追问周屿离城时间")],
        endingPathTags: ["confronted_zhou_left"],
      }),
      choice("c", "你示意许知晚别出声，打开录音等周屿开口", "ch03_019", {
        relationshipEffects: [rel("courage_linzou", 8, "你开始用证据而不是情绪回应周屿")],
        endingPathTags: ["recorded_zhou_reaction"],
      }),
    ],
  });
  add(3, 17, { speaker: "陈妍", text: "他不是案发后走的。\n\n是新闻出来前一天。他递了离职，买了最早离开本市的票。理由写的是回老家处理急事，可那天，他根本没有请假记录。", scene: "old_chat_memory", type: "clue", gainClues: ["clue_zhou_left"], setFlags: ["suspected_zhou"], sfxOnEnter: ["evidence_reveal"] });
  add(3, 18, { speaker: "周屿", text: "我离开是因为受不了。\n\n林舟，不是每个人都能像你一样假装三年没事。你现在把自己演成正义的人，是不是太晚了？", scene: "phone_call_ui", type: "clue", gainClues: ["clue_zhou_left"], setFlags: ["suspected_zhou"], visualCharacter: "周屿", visualMood: "tense", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], audioMood: "tense", voiceStinger: "zhouyu_tiny_smile" });
  add(3, 19, { speaker: "旁白", text: "录音里，周屿停顿了两秒。\n\n那两秒没有雨声，只有他压住呼吸的声音。像一个人差点说漏了什么，又立刻把门关上。", scene: "phone_call_ui", type: "clue", gainClues: ["clue_zhou_left"], setFlags: ["suspected_zhou"], voiceStinger: "zhouyu_phone_silence" });
  add(3, 20, { speaker: "陈妍", text: "林舟，新闻出来前一天，他为什么要跑？\n\n还有一件事。许知夏那晚的报警记录，被撤回过一次。", scene: "old_chat_memory", nextNodeId: "ch04_001" });

  // 第 4 章：最后一张合照
  add(4, 1, { speaker: "旁白", text: "纸箱被拖出来时，胶带粘着地板发出刺耳的声音。\n\n林舟手指停在箱盖上，像停在三年前那通没接的电话前。她忽然不确定，自己到底是在找证据，还是在找一个可以原谅自己的理由。", scene: "rental_room_table", sfxOnEnter: ["old_photo_pickup"] });
  add(4, 2, { speaker: "许知晚", text: "如果你不想找，我不会逼你。\n\n但我姐姐可能就只剩这一张东西，还能让他说不出话。", scene: "rental_room_table" });
  add(4, 3, { speaker: "林舟", text: "你已经来了。电话也已经打了。\n\n现在说不逼，太晚了。", scene: "rental_room_table" });
  add(4, 4, {
    type: "choice",
    scene: "rental_room_table",
    speaker: "旁白",
    text: "箱子里有旧书、拍立得、票根和几张没洗干净的证件照。\n\n每翻一层，林舟都觉得许知夏会从某张照片里抬头问她：你现在才来？",
    choices: [
      choice("a", "你先把所有照片拍照备份，不让原件成为唯一证据", "ch04_005", {
        setFlags: ["backed_up_photo"],
        relationshipEffects: [rel("support_chenyan", 5, "你先建立证据备份意识"), rel("courage_linzou", 10, "你选择保护可能的关键证据")],
        endingPathTags: ["backed_up_photo"],
      }),
      choice("b", "你直接翻找最后一次聚会那张合照", "ch04_006", {
        setFlags: ["found_last_photo"],
        relationshipEffects: [rel("courage_linzou", 6, "你直奔旧案核心物证")],
        endingPathTags: ["found_last_photo"],
      }),
      choice("c", "你让许知晚说清楚：照片里到底该看哪里？", "ch04_007", {
        relationshipEffects: [rel("trust_zhuwan", 7, "你让许知晚给出具体可核验目标")],
        endingPathTags: ["zhuwan_photo_hint"],
      }),
    ],
  });
  add(4, 5, { speaker: "陈妍", text: "收到。你终于有点证据意识了。\n\n别笑，我现在真想给你发面锦旗：三年后终于知道截图不是备份。", scene: "old_chat_memory" });
  add(4, 6, { speaker: "旁白", text: "照片被夹在一本旧笔记里。\n\n四个人站在校门口，许知夏笑得最大声，周屿站得离她最近。林舟看着自己那张年轻得有些陌生的脸，忽然想不起拍照后，他们去了哪里。", scene: "photo_zoom_view", setFlags: ["found_last_photo"], sfxOnEnter: ["old_photo_pickup"] });
  add(4, 7, { speaker: "许知晚", text: "别看他们的脸。\n\n看背景。右后方那栋楼的入口。你们每个人都在笑，只有那里没有。", scene: "photo_zoom_view" });
  add(4, 8, { speaker: "旁白", text: "照片背面有一行很淡的字：别相信他说的那晚。\n\n字迹被潮气晕开，像有人写完后又后悔，又像有人写得太急，来不及把纸吹干。", scene: "photo_zoom_view" });
  add(4, 9, { speaker: "林舟", text: "这句话不是证据。\n\n但如果她写下它，就说明那晚她已经开始怕了。", scene: "photo_zoom_view" });
  add(4, 10, {
    type: "choice",
    scene: "photo_zoom_view",
    speaker: "旁白",
    text: "屏幕上的照片被放大。\n\n雨声像一层噪点压在耳边，照片里的笑脸开始变形。林舟第一次觉得，合照不是为了记住快乐，也可能是为了把谎言留下。",
    sfxOnEnter: ["photo_zoom"],
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你先看玻璃反光，确认拍照时楼道里还有谁", "ch04_011", {
        relationshipEffects: [rel("courage_linzou", 4, "你检查照片里的反光细节")],
        endingPathTags: ["checked_reflection"],
      }),
      choice("b", "你先看楼道门牌，核对照片里的位置", "ch04_012", {
        relationshipEffects: [rel("courage_linzou", 4, "你核对照片背景的空间位置")],
        endingPathTags: ["checked_doorplate"],
      }),
      choice("c", "你先放大右下角阴影，盯住那个不该出现的人影", "ch04_013", {
        relationshipEffects: [rel("suspicion_zhou", 8, "你注意到照片边缘的不自然人影")],
        endingPathTags: ["checked_shadow"],
      }),
    ],
  });
  add(4, 11, { speaker: "旁白", text: "玻璃反光里有一截蓝色伞柄。\n\n颜色和周屿大学时常用的那把很像，但还不够。林舟记得他总说蓝色显得干净，像什么都没发生过。", scene: "photo_zoom_view", sfxOnEnter: ["photo_reflection_find"] });
  add(4, 12, { speaker: "旁白", text: "门牌号模糊，却能看出那不是宿舍正门，而是旧楼后侧楼梯。\n\n许知夏坠楼的地方，就在那栋楼后。", scene: "photo_zoom_view" });
  add(4, 13, { speaker: "旁白", text: "右下角阴影里，有半个人影。\n\n深色外套，左肩一道浅色反光。林舟记得周屿那件外套，也记得他说那晚他不在学校。", scene: "photo_zoom_view", sfxOnEnter: ["photo_reflection_find"] });
  add(4, 14, { speaker: "许知晚", text: "他说那晚他在外地。\n\n可这张照片拍摄时间，是出事前两个小时。一个在外地的人，不该站在旧楼后门。", scene: "photo_zoom_view" });
  add(4, 15, { speaker: "旁白", text: "林舟把照片再放大一格。\n\n人影不再像影子，像一个终于被雨水冲出来的人。那一刻，照片安静得可怕。", scene: "photo_zoom_view", type: "clue", gainClues: ["clue_photo_background"], setFlags: ["found_photo_background"], sfxOnEnter: ["evidence_reveal", "marker_circle"] });
  add(4, 16, { speaker: "房东老太", text: "你门口那个姑娘？来过。\n\n还有个男的也来问过你住几楼，戴口罩，声音挺客气。越客气的人，越不像只是问路。", scene: "corridor_door" });
  add(4, 17, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "周屿的电话打进来。\n\n屏幕亮着，像一只不肯闭上的眼。林舟忽然意识到，这通电话来得太准了。",
    choices: [
      choice("a", "你接电话，假装还没找到照片", "ch04_018", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你试探周屿对照片的反应")],
        endingPathTags: ["tested_zhou_photo"],
      }),
      choice("b", "你挂断，把照片先发给陈妍备份", "ch04_019", {
        setFlags: ["backed_up_photo", "refused_zhou_pressure"],
        relationshipEffects: [rel("support_chenyan", 12, "你优先保护照片证据链"), rel("courage_linzou", 8, "你拒绝周屿的节奏")],
        endingPathTags: ["photo_backed_to_chenyan"],
      }),
      choice("c", "你直接问周屿：你为什么知道我在找照片？", "ch04_020", {
        setFlags: ["suspected_zhou", "answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 12, "你正面触碰周屿最害怕的证据")],
        endingPathTags: ["confronted_zhou_photo"],
      }),
    ],
  });
  add(4, 18, { speaker: "周屿", text: "你没找到就好。\n\n我的意思是，别再翻那些东西了。它们只会害你，也会害那个站在你门外的人。", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "tense", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], audioMood: "tense" });
  add(4, 19, { speaker: "陈妍", text: "照片收到了。我也看见右下角了。\n\n林舟，这不是你一个人能扛的事。还有，别把原件交给任何人，包括门外那个姑娘。", scene: "old_chat_memory" });
  add(4, 20, { speaker: "周屿", text: "林舟。\n\n你刚刚找到那张合照，对吗？\n\n电话那头没有雨声。可林舟却听见门外的楼道灯又闪了一下，像有人正抬头看她的门牌。", scene: "phone_call_ui", nextNodeId: "ch05_001", visualCharacter: "周屿", visualMood: "horror", characterVariant: "horror", characterScale: "fullscreen", characterPosition: "center", characterFraming: "face", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], voiceStinger: "zhouyu_tiny_smile", audioMood: "horror" });

  // 第 5 章：旧手机的声音
  add(5, 1, { speaker: "旁白", text: "房间里所有人都没说话。\n\n周屿那句话还停在听筒里，像他不是打来电话，而是把耳朵贴在门上。", scene: "phone_call_ui", sfxOnEnter: ["room_silence_drop"] });
  add(5, 2, { speaker: "许知晚", text: "他知道。\n\n不是猜的。有人告诉他，或者他一直在看着这间屋子。", scene: "rental_room_rain_night" });
  add(5, 3, { speaker: "陈妍", text: "我建议你现在别单独出门。\n\n还有，手机别关机。你要是突然没声，我真的会报警，别嫌我烦。", scene: "old_chat_memory" });
  add(5, 4, {
    type: "choice",
    scene: "old_phone_view",
    speaker: "许知晚",
    text: "许知晚发来旧手机录屏。\n\n屏幕上，语音备忘列表正在一点点恢复。每跳出一个文件名，林舟都觉得那部旧手机像在重新呼吸。",
    sfxOnEnter: ["old_phone_start"],
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你让许知晚继续播放录屏，不再暂停", "ch05_005", {
        relationshipEffects: [rel("trust_zhuwan", 8, "你愿意继续接收许知晚提供的旧手机记录")],
        endingPathTags: ["old_phone_records"],
      }),
      choice("b", "你把录屏发给陈妍，让她判断这是不是现实触发", "ch05_006", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你让陈妍验证旧手机机制")],
        endingPathTags: ["timed_voice_verify"],
      }),
      choice("c", "你故意问周屿：你知道那部旧手机吗？", "ch05_007", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你用旧手机试探周屿")],
        endingPathTags: ["asked_zhou_old_phone"],
      }),
    ],
  });
  add(5, 5, { speaker: "许知夏的声音", text: "如果这段被恢复，说明我没来得及见到林舟。\n\n她的声音很轻，像隔着一层潮湿的棉布。最后一个字被电流噪声吞掉，林舟却听得比任何时候都清楚。", scene: "old_phone_view", visualCharacter: "许知夏", visualMood: "horror", characterVariant: "recording", characterScale: "impact", characterPosition: "center", characterFraming: "halfbody", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", ambience: "room_night_loop", sfxOnEnter: ["old_phone_start", "recording_static_short"], voiceStinger: "xuzhixia_weak_static_exhale", audioMood: "horror" });
  add(5, 6, { speaker: "陈妍", text: "可能。\n\n旧手机开机，云端恢复，语音备忘提醒被重新触发。它会像一次主动来电。吓人，但不是鬼。\n\n真正吓人的是，有人知道它什么时候响。", scene: "old_chat_memory" });
  add(5, 7, { speaker: "周屿", text: "旧手机？\n\n她妹妹连这个都告诉你了？林舟，你知道她这些年怎么查你的吗？你就这么容易把门开给一个陌生人？", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "tense", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], audioMood: "tense" });
  add(5, 8, { speaker: "林舟", text: "所以你知道那部手机。\n\n你刚刚没有问是哪部。", scene: "phone_call_ui" });
  add(5, 9, { speaker: "旁白", text: "周屿没有立刻回答。\n\n沉默里，楼道灯忽然灭了。门缝下那条冷白色的光，也跟着断掉。", scene: "corridor_door", sfxOnEnter: ["corridor_light_flicker"] });
  add(5, 10, {
    type: "choice",
    scene: "old_phone_view",
    speaker: "许知晚",
    text: "录音还剩一段。\n\n许知晚的手指停在播放键上：听完，你就回不了头了。\n\n林舟看见她指尖在抖。不是冷，是恨。",
    choices: [
      choice("a", "你让她播放完整录音，哪怕门外有人", "ch05_011", {
        relationshipEffects: [rel("trust_zhuwan", 6, "你选择继续听完许知夏留下的声音"), rel("courage_linzou", 8, "你更接近真相核心")],
        endingPathTags: ["played_voice"],
      }),
      choice("b", "你先把录音发给陈妍备份，再播放", "ch05_012", {
        setFlags: ["backed_up_photo"],
        relationshipEffects: [rel("support_chenyan", 10, "你在播放前先保护语音记录")],
        endingPathTags: ["voice_backed_up"],
      }),
      choice("c", "你让她暂停，先确认门外是不是只有一个人", "ch05_013", {
        relationshipEffects: [rel("courage_linzou", 5, "你在压力下仍确认现实危险")],
        endingPathTags: ["checked_corridor"],
      }),
    ],
  });
  add(5, 11, { speaker: "许知夏的声音", text: "周屿他……如果我出事，不要相信他说那晚不在。照片——\n\n录音在“照片”两个字后突然断掉，像有人从她手里夺走了手机。", scene: "old_phone_view", visualCharacter: "许知夏", visualMood: "horror", characterVariant: "fear", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", ambience: "room_night_loop", sfxOnEnter: ["old_phone_start", "recording_static_short"], voiceStinger: "xuzhixia_weak_static_exhale", audioMood: "horror" });
  add(5, 12, { speaker: "陈妍", text: "备份到了。\n\n林舟，这段足够说明她生前在防一个熟人。别再让任何人单独拿走原件。", scene: "old_chat_memory", sfxOnEnter: ["backup_success"] });
  add(5, 13, { speaker: "旁白", text: "猫眼外一片黑。\n\n只有楼梯间传来第二个人的脚步声，慢，不急，像故意让屋里的人听见。林舟忽然明白，恐惧不是不知道外面有什么，是知道它正在靠近。", scene: "corridor_door", sfxOnEnter: ["footstep_corridor_wet"] });
  add(5, 14, { speaker: "许知晚", text: "他来了。\n\n别开门。哪怕他说自己是来帮你的。", scene: "corridor_door" });
  add(5, 15, { speaker: "旁白", text: "录屏最后弹出恢复记录。\n\n旧手机重新开机后，三年前的语音备忘被云端提醒触发。死者来电终于有了现实解释。\n\n它不是鬼魂回拨，是许知夏迟到三年的求救。", scene: "old_phone_view", type: "clue", gainClues: ["clue_timed_voice"], setFlags: ["understood_dead_call"], visualMood: "horror", visualCharacter: "许知夏", characterVariant: "recording", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", ambience: "room_night_loop", sfxOnEnter: ["old_phone_start", "recording_static_short"], voiceStinger: "xuzhixia_memory_fade", audioMood: "horror" });
  add(5, 16, { speaker: "周屿", text: "林舟。\n\n你听到录音了？", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "horror", characterVariant: "horror", characterScale: "fullscreen", characterPosition: "center", characterFraming: "face", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["message_pop_cold"], voiceStinger: "zhouyu_pressure_breath", audioMood: "horror" });
  add(5, 17, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "周屿的声音很轻。\n\n他不是在问。他在确认你手里还有多少东西，也在确认你敢不敢继续拿着它们。",
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你假装录音损坏，诱导他说漏嘴", "ch05_018", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 12, "你开始反向试探周屿")],
        endingPathTags: ["baited_zhou"],
      }),
      choice("b", "你直接告诉他：我会重启旧案", "ch05_019", {
        relationshipEffects: [rel("courage_linzou", 12, "你第一次正面说出重启旧案")],
        endingPathTags: ["declared_reopen"],
      }),
      choice("c", "你挂断，先把门反锁，再整理证据", "ch05_020", {
        setFlags: ["refused_zhou_pressure"],
        relationshipEffects: [rel("courage_linzou", 8, "你拒绝被周屿控制节奏")],
        endingPathTags: ["secured_room"],
      }),
    ],
  });
  add(5, 18, { speaker: "周屿", text: "损坏就别修了。\n\n知夏已经死了，别再让她把活人也拖下去。你看，连她妹妹都只会把你拖到门边。", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "horror", characterVariant: "pressure", characterScale: "closeup", characterPosition: "center", characterFraming: "bust", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], audioMood: "horror" });
  add(5, 19, { speaker: "周屿", text: "你以为你在救她？\n\n你当年要是接她电话，她也许根本不会死。现在装成不怕，是不是太迟了？", scene: "phone_call_ui", visualCharacter: "周屿", visualMood: "horror", characterVariant: "horror", characterScale: "fullscreen", characterPosition: "center", characterFraming: "face", characterHeadSafe: true, characterFocus: "face", bgm: "horror_corridor", sfxOnEnter: ["message_pop_cold"], voiceStinger: "zhouyu_low_laugh", audioMood: "horror" });
  add(5, 20, { speaker: "旁白", text: "门锁孔里传来轻轻一声响。\n\n像有人把钥匙插了进去。\n\n许知晚猛地抬头，林舟第一次在她脸上看见真正的恐惧。", scene: "corridor_door", nextNodeId: "ch06_001", sfxOnEnter: ["door_lock_turn"] });

  // 第 6 章：无人接听
  add(6, 1, { speaker: "旁白", text: "林舟把桌上的东西摊开：照片、聊天记录、旧手机录屏、陈妍发来的新闻截图。\n\n它们终于不再是散落的雨声。每一件都指向同一个人，也指向林舟这三年一直绕开的那个夜晚。\n\n门外的钥匙声还没有消失。", scene: "rental_room_table" });
  add(6, 2, { speaker: "许知晚", text: "你可以现在停下。你没有欠我。\n\n但如果你继续，我不会再一个人查下去。", scene: "rental_room_table" });
  add(6, 3, { speaker: "林舟", text: "我欠她。\n\n至少欠一个没有挂掉的电话。", scene: "rental_room_table" });
  add(6, 4, {
    type: "choice",
    scene: "rental_room_table",
    speaker: "陈妍",
    text: "陈妍发来最后一条提醒：先决定证据怎么保住，再决定要不要相信谁。\n\n屏幕另一边，她没有催林舟勇敢，只催她别犯蠢。",
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你把照片、录音和截图都备份到陈妍那里", "ch06_005", {
        setFlags: ["backed_up_photo"],
        relationshipEffects: [rel("support_chenyan", 10, "你把关键证据交给陈妍形成外部备份"), rel("courage_linzou", 10, "你保护证据而不是逃避")],
        endingPathTags: ["final_backup"],
      }),
      choice("b", "你把原始照片交给许知晚保管", "ch06_006", {
        setFlags: ["gave_original_photo", "trusted_zhuwan_early"],
        relationshipEffects: [rel("trust_zhuwan", 10, "你把原始照片交给许知晚"), rel("courage_linzou", -5, "证据控制权离开你手中")],
        endingPathTags: ["gave_original_photo"],
      }),
      choice("c", "你先删掉手机里的照片，免得周屿找到", "ch06_007", {
        setFlags: ["deleted_evidence"],
        relationshipEffects: [rel("courage_linzou", -20, "你在恐惧下删除证据")],
        endingPathTags: ["deleted_evidence"],
      }),
    ],
  });
  add(6, 5, { speaker: "陈妍", text: "收到。别逞强，我这边也会留一份。\n\n你现在可以开始拼答案了。记住，不是猜谁可怜，是看谁留下了痕迹。", scene: "old_chat_memory", sfxOnEnter: ["backup_success"] });
  add(6, 6, { speaker: "许知晚", text: "我会保管好。\n\n但如果只有我拿着，他一定会说这是我伪造的。林舟，信任不是把证据交出去。", scene: "rental_room_table", sfxOnEnter: ["backup_start"] });
  add(6, 7, { speaker: "旁白", text: "删除提示弹出时，林舟的指尖悬在屏幕上。\n\n雨声忽然变轻，像整个夜晚都在等她犯错。", scene: "rental_room_table", sfxOnEnter: ["delete_warning"] });
  add(6, 8, { speaker: "旁白", text: "门外钥匙声停了。\n\n周屿没有敲门，只发来一条消息：你还来得及。\n\n这一次，林舟没有立刻颤抖。", scene: "phone_call_ui", sfxOnEnter: ["door_lock_turn", "message_pop_cold"] });
  add(6, 9, { speaker: "林舟", text: "不。\n\n是他来不及了。", scene: "rental_room_table" });
  add(6, 10, {
    type: "choice",
    scene: "rental_room_table",
    speaker: "旁白",
    text: "林舟把所有声音调低，只留下自己的呼吸和屏幕上的五个问题。\n\n门外有人，电话里有人，三年前也有人。推理开始前，她必须先决定从哪条线把所有东西串起来。",
    sfxOnEnter: ["room_silence_drop"],
    sfxOnChoice: ["choice_confirm_soft"],
    choices: [
      choice("a", "你先把死者来电和旧手机录音放在一起", "ch06_011", {
        relationshipEffects: [rel("courage_linzou", 4, "你从最恐惧的声音开始整理真相")],
        endingPathTags: ["reviewed_call_chain"],
        choiceImpactText: "你先确认：恐怖不是鬼魂，而是有人害怕那段迟到的声音。",
      }),
      choice("b", "你先把合照和周屿离城时间线放在一起", "ch06_011", {
        relationshipEffects: [rel("suspicion_zhou", 5, "你把周屿的位置谎言放到推理核心")],
        endingPathTags: ["reviewed_photo_timeline"],
        choiceImpactText: "你把照片里的影子和新闻前一天的车票放在同一页。",
      }),
      choice("c", "你先把灰色借贷和许知夏报警记录放在一起", "ch06_011", {
        relationshipEffects: [rel("support_chenyan", 4, "你依靠陈妍查到的现实资料整理证据")],
        endingPathTags: ["reviewed_loan_chain"],
        choiceImpactText: "你先确认：许知夏生前不是沉默，她已经准备自救。",
      }),
    ],
  });
  add(6, 11, { speaker: "旁白", text: "最终推理开始。\n\n每一个答案，都会决定这场雨夜如何归档。", scene: "ending_screen" });
  add(6, 12, {
    type: "deduction",
    scene: "ending_screen",
    speaker: "推理题 Q1",
    text: "死去三年的许知夏为什么会来电？",
    choices: [
      choice("a", "周屿伪装成她打来电话", "ch06_013"),
      choice("b", "旧手机开机后，云端语音备忘触发提醒", "ch06_013", { isCorrect: true, setFlags: ["understood_dead_call"], endingPathTags: ["deduced_timed_voice"] }),
      choice("c", "许知晚用变声软件制造恐惧", "ch06_013"),
    ],
  });
  add(6, 13, {
    type: "deduction",
    scene: "ending_screen",
    speaker: "推理题 Q2",
    text: "门外的许知晚最可能是谁？",
    choices: [
      choice("a", "许知夏的妹妹，但她隐瞒了部分调查方式", "ch06_014", { isCorrect: true, setFlags: ["verified_zhuwan_identity"], endingPathTags: ["deduced_zhuwan"] }),
      choice("b", "周屿安排来骗照片的人", "ch06_014"),
      choice("c", "许知夏本人，她没有死", "ch06_014"),
    ],
  });
  add(6, 14, {
    type: "deduction",
    scene: "ending_screen",
    speaker: "推理题 Q3",
    text: "三年前许知夏为什么会死？",
    choices: [
      choice("a", "她因为感情问题选择离开", "ch06_015"),
      choice("b", "她误入旧楼，被雨夜困住", "ch06_015"),
      choice("c", "她发现周屿冒用身份借贷，并准备报警", "ch06_015", { isCorrect: true, endingPathTags: ["deduced_gray_loan"] }),
    ],
  });
  add(6, 15, {
    type: "deduction",
    scene: "ending_screen",
    speaker: "推理题 Q4",
    text: "最后合照真正的价值是什么？",
    choices: [
      choice("a", "证明许知夏当晚心情很好", "ch06_016"),
      choice("b", "背景拍到周屿出现在案发楼道附近", "ch06_016", { isCorrect: true, endingPathTags: ["deduced_photo_background"] }),
      choice("c", "证明许知晚也在现场", "ch06_016"),
    ],
  });
  add(6, 16, {
    type: "deduction",
    scene: "ending_screen",
    speaker: "推理题 Q5",
    text: "周屿当前最想阻止什么？",
    choices: [
      choice("a", "阻止照片、录音和借贷资料形成完整证据链", "ch06_017", { isCorrect: true, endingPathTags: ["deduced_zhou_goal"] }),
      choice("b", "阻止林舟见到房东老太", "ch06_017"),
      choice("c", "阻止许知晚离开这栋楼", "ch06_017"),
    ],
  });
  add(6, 17, { speaker: "旁白", text: "答案提交后，屏幕暗了一瞬。\n\n门外的呼吸、电话里的沉默、照片里的影子，同时收紧。林舟忽然发现，最难的不是知道真相，而是决定让真相去哪里。", scene: "ending_screen", sfxOnEnter: ["evidence_reveal"] });
  add(6, 18, {
    type: "choice",
    scene: "ending_screen",
    speaker: "旁白",
    text: "最后一步，不是推理题。\n\n是林舟要把自己放进哪一种人生里。她可以保护证据，也可以交出证据；可以结束这个雨夜，也可以让三年前重新开口。",
    choices: [
      choice("a", "你备份所有证据，选择重启旧案", "ch06_019", {
        setFlags: ["backed_up_photo", "chose_reopen_case"],
        relationshipEffects: [rel("support_chenyan", 5, "你选择带着备份证据重启旧案"), rel("courage_linzou", 20, "你决定直面三年前的逃避")],
        endingPathTags: ["chose_reopen_case"],
      }),
      choice("b", "你把原始照片交给许知晚，让她带走这份证据", "ch06_019", {
        setFlags: ["gave_original_photo"],
        relationshipEffects: [rel("trust_zhuwan", 8, "你最后选择相信许知晚保管原件")],
        endingPathTags: ["gave_original_photo"],
      }),
      choice("c", "你删除照片，结束这一切", "ch06_019", {
        setFlags: ["deleted_evidence"],
        relationshipEffects: [rel("courage_linzou", -20, "你选择结束追查")],
        endingPathTags: ["deleted_evidence"],
      }),
      choice("d", "你什么都不做，挂断所有电话", "ch06_019", {
        relationshipEffects: [rel("courage_linzou", -10, "你选择不再向前")],
        endingPathTags: ["avoid_truth"],
      }),
    ],
  });
  add(6, 19, { speaker: "旁白", text: "林舟按下确认。\n\n门外安静了半秒。半秒之后，手机屏幕里的光照亮她的手。\n\n这一次，没有系统替她逃避。", scene: "ending_screen", sfxOnEnter: ["archive_stamp"] });
  add(6, 20, { speaker: "旁白", text: "雨声退到窗外。\n\n所有被挂断、删除、备份、保留下来的选择，都开始结算。", scene: "ending_screen", visualMood: "ending", bgm: "ending_archive", ambience: "room_night_loop", resolveEnding: true, nextNodeId: null, sfxOnEnter: ["archive_stamp"] });
  nodes.ch06_019.nextNodeId = "ch06_020";

  const nodeDirection = {
    ch01_001: { visualFocus: "rain-window", highlightProps: ["prop_laptop", "prop_noodle_bowl"], shotTone: "cold-room" },
    ch01_003: {
      visualFocus: "incoming-call",
      highlightProps: ["prop_phone_modern"],
      shotTone: "phone-glow",
      sfxOnEnter: [
        cue("phone_screen_wake", { volume: 0.34, fadeInMs: 60 }),
        cue("phone_vibrate", { delayMs: 80, volume: 0.42, duckBgmMs: 500 }),
        cue("phone_ring_dead_call", { delayMs: 260, volume: 0.36, duckBgmMs: 900 }),
      ],
    },
    ch01_005: { visualFocus: "dead-call", highlightProps: ["prop_phone_modern"], shotTone: "signal-horror" },
    ch01_006: { visualFocus: "doorbell", highlightProps: ["prop_phone_modern"], shotTone: "door-pressure" },
    ch01_008: { visualFocus: "peephole", highlightProps: ["prop_door_chain"], shotTone: "corridor-flash" },
    ch01_010: { visualFocus: "door-chain", highlightProps: ["prop_door_chain"], shotTone: "threshold", sfxOnEnter: [cue("knock_soft", { volume: 0.18, delayMs: 180 })] },
    ch01_014: { visualFocus: "door-chain", highlightProps: ["prop_door_chain"], shotTone: "threshold", sfxOnEnter: [cue("door_chain_close", { volume: 0.28 })] },
    ch01_018: { visualFocus: "message", highlightProps: ["prop_phone_modern"], shotTone: "phone-glow" },
    ch02_004: { visualFocus: "id-proof", highlightProps: ["prop_phone_modern"], shotTone: "evidence", sfxOnEnter: [cue("message_pop_cold", { volume: 0.28 })] },
    ch02_005: { visualFocus: "wet-visitor", highlightProps: ["prop_door_chain"], shotTone: "corridor-close", sfxOnEnter: [cue("footstep_corridor_wet", { volume: 0.28, delayMs: 120 })] },
    ch02_006: { visualFocus: "door-lock", highlightProps: ["prop_door_chain"], shotTone: "threshold", sfxOnEnter: [cue("door_chain_close", { volume: 0.26 })] },
    ch02_008: { visualFocus: "voice-record", highlightProps: ["prop_phone_modern"], shotTone: "signal-horror", sfxOnEnter: [cue("recording_static_short", { volume: 0.25 })] },
    ch02_014: { visualFocus: "door-open", highlightProps: ["prop_door_chain"], shotTone: "threshold", sfxOnEnter: [cue("door_open_slow", { volume: 0.3, duckBgmMs: 500 })] },
    ch03_004: { visualFocus: "chat-log", highlightProps: ["prop_laptop"], shotTone: "evidence", sfxOnEnter: [cue("chat_typing_short", { volume: 0.24 })] },
    ch03_009: { visualFocus: "loan-record", highlightProps: ["prop_laptop", "prop_loan_document"], shotTone: "evidence", sfxOnEnter: [cue("evidence_reveal", { volume: 0.28 })] },
    ch03_012: { visualFocus: "message", highlightProps: ["prop_phone_modern"], shotTone: "phone-glow", sfxOnEnter: [cue("message_pop_cold", { volume: 0.26 })] },
    ch03_016: { visualFocus: "timeline", highlightProps: ["prop_laptop"], shotTone: "evidence", sfxOnEnter: [cue("chat_typing_short", { volume: 0.2 })] },
    ch03_019: { visualFocus: "incoming-call", highlightProps: ["prop_phone_modern"], shotTone: "phone-glow", sfxOnEnter: [cue("phone_vibrate", { volume: 0.28 })] },
    ch04_001: { visualFocus: "photo-box", highlightProps: ["prop_photo_box"], shotTone: "evidence", sfxOnEnter: [cue("box_drag_soft", { volume: 0.2, duckBgmMs: 360 })] },
    ch04_004: { visualFocus: "photo-box", highlightProps: ["prop_photo_box"], shotTone: "evidence", sfxOnEnter: [cue("old_photo_pickup", { volume: 0.26 })] },
    ch04_006: { visualFocus: "group-photo", highlightProps: ["prop_photo_polaroid"], shotTone: "photo-evidence" },
    ch04_010: { visualFocus: "photo-inspect", highlightProps: ["prop_photo_polaroid"], shotTone: "photo-evidence" },
    ch04_015: { visualFocus: "background-shadow", highlightProps: ["prop_photo_polaroid"], shotTone: "photo-reveal" },
    ch04_017: { visualFocus: "incoming-call", highlightProps: ["prop_phone_modern", "prop_photo_polaroid"], shotTone: "phone-glow", sfxOnEnter: [cue("phone_vibrate", { volume: 0.28 }), cue("message_pop_cold", { delayMs: 240, volume: 0.24 })] },
    ch05_004: { visualFocus: "old-phone", highlightProps: ["prop_phone_old_cracked", "prop_recording_file"], shotTone: "device-wake" },
    ch05_010: { visualFocus: "recording", highlightProps: ["prop_phone_old_cracked", "prop_recording_file"], shotTone: "signal-horror", sfxOnEnter: [cue("old_phone_start", { volume: 0.28 }), cue("recording_static_short", { delayMs: 220, volume: 0.24 })] },
    ch05_015: { visualFocus: "voice-trigger", highlightProps: ["prop_phone_old_cracked", "prop_recording_file"], shotTone: "device-reveal" },
    ch05_017: { visualFocus: "incoming-call", highlightProps: ["prop_phone_modern", "prop_recording_file"], shotTone: "phone-glow", sfxOnEnter: [cue("phone_vibrate", { volume: 0.25 })] },
    ch06_004: { visualFocus: "evidence-table", highlightProps: ["prop_photo_polaroid", "prop_hard_drive"], shotTone: "decision", sfxOnEnter: ["room_silence_drop"] },
    ch06_010: { visualFocus: "deduction-board", highlightProps: ["prop_photo_polaroid", "prop_recording_file", "prop_archive_folder"], shotTone: "deduction", sfxOnEnter: [cue("deduction_tension", { volume: 0.16, fadeInMs: 120, duckBgmMs: 520 })] },
    ch06_011: { visualFocus: "deduction-board", highlightProps: ["prop_archive_folder"], shotTone: "deduction", sfxOnEnter: ["evidence_reveal"] },
    ch06_012: { visualFocus: "dead-call", highlightProps: ["prop_archive_folder"], shotTone: "deduction", sfxOnEnter: ["choice_confirm_soft"] },
    ch06_013: { visualFocus: "identity", highlightProps: ["prop_archive_folder"], shotTone: "deduction", sfxOnEnter: ["choice_confirm_soft"] },
    ch06_014: { visualFocus: "loan-record", highlightProps: ["prop_archive_folder"], shotTone: "deduction", sfxOnEnter: ["choice_confirm_soft"] },
    ch06_015: { visualFocus: "background-shadow", highlightProps: ["prop_archive_folder"], shotTone: "deduction" },
    ch06_016: { visualFocus: "evidence-chain", highlightProps: ["prop_archive_folder"], shotTone: "deduction" },
    ch06_018: { visualFocus: "archive-choice", highlightProps: ["prop_archive_folder"], shotTone: "ending-choice", sfxOnEnter: ["room_silence_drop"] },
  };
  Object.keys(nodeDirection).forEach((nodeId) => nodes[nodeId] && Object.assign(nodes[nodeId], nodeDirection[nodeId]));

  const rc2Objectives = {
    ch01_001: ["obj_dead_call", "确认来电是否真实"],
    ch01_003: ["obj_dead_call", "确认来电是否真实"],
    ch01_005: ["obj_dead_call", "确认来电是否真实", true],
    ch01_007: ["obj_door_woman", "判断门外女人是否可信"],
    ch01_008: ["obj_door_woman", "判断门外女人是否可信"],
    ch02_003: ["obj_door_woman", "判断门外女人是否可信"],
    ch02_008: ["obj_door_woman", "判断门外女人是否可信", true],
    ch03_004: ["obj_loan_chain", "查清旧案里的借贷动机"],
    ch03_009: ["obj_loan_chain", "查清旧案里的借贷动机"],
    ch03_017: ["obj_loan_chain", "查清旧案里的借贷动机", true],
    ch04_004: ["obj_photo_shadow", "找到照片里的异常"],
    ch04_010: ["obj_photo_shadow", "找到照片里的异常"],
    ch04_015: ["obj_photo_shadow", "找到照片里的异常", true],
    ch05_004: ["obj_old_phone", "确认旧手机如何触发来电"],
    ch05_010: ["obj_old_phone", "确认旧手机如何触发来电"],
    ch05_015: ["obj_old_phone", "确认旧手机如何触发来电", true],
    ch06_010: ["obj_final_deduction", "完成最终推理"],
    ch06_016: ["obj_final_deduction", "完成最终推理", true],
    ch06_018: ["obj_archive_choice", "决定如何保存真相"],
  };

  Object.entries(rc2Objectives).forEach(([nodeId, [objectiveId, objectiveText, objectiveComplete]]) => {
    if (!nodes[nodeId]) return;
    Object.assign(nodes[nodeId], { objectiveId, objectiveText, objectiveComplete: objectiveComplete === true });
  });

  const hotspot = (hotspotId, label, text, options = {}) => ({
    hotspotId,
    label,
    text,
    detailTitle: options.detailTitle || label,
    gainClues: options.gainClues || [],
    setFlags: options.setFlags || [],
    relationshipEffects: options.relationshipEffects || [],
    sfxOnInspect: options.sfxOnInspect || [],
    zoomAsset: options.zoomAsset || "",
    evidenceLinkId: options.evidenceLinkId || "",
  });

  const rc2Hotspots = {
    ch01_003: [
      hotspot("phone_screen", "手机屏幕", "来电记录没有号码，只有许知夏的名字。屏幕边缘的水渍让它像从雨里亮起来。", { gainClues: ["clue_dead_call"], sfxOnInspect: [cue("phone_screen_wake", { volume: 0.22 })], zoomAsset: "prop_phone_modern" }),
      hotspot("window_rain", "窗户", "雨声很密，窗外没有脚步声。真正靠近房间的，只有手机震动。", { sfxOnInspect: [cue("rain_window_soft", { volume: 0.16 })] }),
    ],
    ch01_008: [
      hotspot("peephole", "猫眼", "楼道灯闪了一下，门外女人低着头，湿发挡住半张脸。她没有急着敲门。", { setFlags: ["checked_peephole"], sfxOnInspect: [cue("corridor_light_flicker", { volume: 0.18 })] }),
      hotspot("door_chain", "门链", "门链还扣着。金属没有完全合拢，像给恐惧留了一条窄缝。", { setFlags: ["kept_door_closed"], sfxOnInspect: [cue("door_chain_close", { volume: 0.18 })] }),
    ],
    ch02_004: [
      hotspot("id_message", "身份信息", "她发来的证件照片是真的，但发送时间被刻意裁掉了。她在证明身份，也在隐藏路径。", { setFlags: ["verified_zhuwan_identity"], sfxOnInspect: [cue("message_pop_cold", { volume: 0.18 })] }),
    ],
    ch03_009: [
      hotspot("loan_document", "借贷截图", "借款人是许知夏，签名却像被人摹过。报警前两天，这条记录突然出现。", { gainClues: ["clue_gray_loan"], sfxOnInspect: [cue("evidence_reveal", { volume: 0.2 })], evidenceLinkId: "link_motive_chain" }),
      hotspot("chat_log", "聊天记录", "陈妍把截图来源单独保存了一份。她开始把这件事当成旧案，而不是怪谈。", { relationshipEffects: [rel("support_chenyan", 4, "你给了陈妍可以继续查的方向")], sfxOnInspect: [cue("chat_typing_short", { volume: 0.16 })] }),
    ],
    ch04_010: [
      hotspot("old_photo", "旧照片", "合照里所有人的笑都停在三年前。只有背景的那个人，像是不该被拍进去。", { sfxOnInspect: [cue("photo_zoom", { volume: 0.2 })], zoomAsset: "prop_photo_polaroid" }),
      hotspot("background_shadow", "背景人影", "楼道入口的反光里有一道人影。位置和周屿声称的时间线对不上。", { gainClues: ["clue_photo_background"], setFlags: ["found_photo_background"], sfxOnInspect: [cue("marker_circle", { volume: 0.18 })], evidenceLinkId: "link_photo_timeline" }),
    ],
    ch05_010: [
      hotspot("old_phone", "旧手机", "旧手机没有灵异，它只是一直保存着一条没被及时听见的语音备忘。", { gainClues: ["clue_timed_voice"], setFlags: ["understood_dead_call"], sfxOnInspect: [cue("old_phone_start", { volume: 0.2 })], evidenceLinkId: "link_call_mechanism" }),
      hotspot("recording_file", "录音文件", "文件名被系统改写过，触发时间却和今晚的来电重合。", { sfxOnInspect: [cue("recording_static_short", { volume: 0.16 })] }),
    ],
    ch06_010: [
      hotspot("archive_folder", "档案袋", "六条线索已经足够拼出旧案轮廓。缺的不是证据，而是你敢不敢把它们连起来。", { sfxOnInspect: [cue("archive_stamp", { volume: 0.18 })] }),
      hotspot("backup_file", "备份文件", "备份保留着照片、语音和借贷资料的时间顺序。它会决定真相能否被重新打开。", { setFlags: ["final_backup_reviewed"], sfxOnInspect: [cue("backup_success", { volume: 0.16 })] }),
    ],
  };

  Object.entries(rc2Hotspots).forEach(([nodeId, items]) => {
    if (nodes[nodeId]) nodes[nodeId].investigationHotspots = items;
  });

  const rc2EvidenceLinks = [
    {
      linkId: "link_call_mechanism",
      title: "伪灵异机制",
      clueIds: ["clue_dead_call", "clue_timed_voice"],
      result: "死者来电不是鬼魂回拨，而是旧手机恢复后触发的迟到语音。",
    },
    {
      linkId: "link_photo_timeline",
      title: "周屿时间线异常",
      clueIds: ["clue_photo_background", "clue_zhou_left"],
      result: "照片背景和离城记录互相印证：周屿在撒谎。",
    },
    {
      linkId: "link_motive_chain",
      title: "旧案动机",
      clueIds: ["clue_gray_loan", "clue_sister_mark"],
      result: "灰色借贷和许知夏的求救痕迹连在一起，旧案动机浮出水面。",
    },
  ];

  ["ch06_010", "ch06_011", "ch06_012", "ch06_013", "ch06_014", "ch06_015", "ch06_016"].forEach((nodeId) => {
    if (nodes[nodeId]) nodes[nodeId].evidenceLinks = rc2EvidenceLinks;
  });

  const chapterRecaps = {
    ch01_020: { completed: "你确认来电异常，并把门外女人的问题留到了下一章。", missed: "若没有检查猫眼，门外信息仍然不完整。", next: "下一章要判断许知晚到底是不是可信的人。" },
    ch02_015: { completed: "你完成了身份核验，知道许知晚并不只是陌生访客。", missed: "旧手机来源仍需要继续追问。", next: "陈妍会把旧案资料拉回现实。" },
    ch03_019: { completed: "你找到灰色借贷和周屿离城两条关键线。", missed: "借贷动机还需要照片证据补强。", next: "下一章从最后一张合照开始。" },
    ch04_020: { completed: "你在照片背景里找到周屿时间线的裂缝。", missed: "照片必须备份，否则证据可能被夺走。", next: "旧手机会解释死者来电的现实机制。" },
    ch05_020: { completed: "你确认旧手机语音触发了所谓死者来电。", missed: "如果没有备份录音，最后证据链会变弱。", next: "最终推理需要把六条线索连成一张网。" },
  };
  Object.entries(chapterRecaps).forEach(([nodeId, chapterRecap]) => {
    if (nodes[nodeId]) nodes[nodeId].chapterRecap = chapterRecap;
  });

  function inferChoiceIntent(item) {
    const text = `${item.text || ""} ${(item.endingPathTags || []).join(" ")}`;
    if (/backup|backed|recorded|evidence|photo|保留|备份|证据|录/.test(text)) return "保全证据";
    if (/trust|trusted|gave_original|相信|交给/.test(text)) return "偏信任";
    if (/confront|question|tested|asked_zhou|对质|追问|质问/.test(text)) return "偏对抗";
    if (/police|chenyan|witness|shared|报警|陈妍|求助/.test(text)) return "寻求协助";
    if (/delete|avoid|nothing|删除|不做|挂断/.test(text)) return "回避风险";
    if (/check|look|review|old_phone|photo|查|看|检查|推理/.test(text)) return "调查推进";
    return "谨慎判断";
  }

  Object.values(nodes).forEach((node) => {
    if (!Array.isArray(node.choices)) return;
    node.choices = node.choices.map((item) => ({ ...item, choiceIntent: item.choiceIntent || inferChoiceIntent(item) }));
  });

  function setChoiceFeedback(nodeId, feedbackByChoiceId) {
    const node = nodes[nodeId];
    if (!node) return;
    node.choices = (node.choices || []).map((item) => ({ ...item, ...(feedbackByChoiceId[item.choiceId] || {}) }));
  }

  setChoiceFeedback("ch06_012", {
    a: { choiceImpactText: "这个答案把恐怖归给了人，但解释不了旧手机恢复记录。", feedbackTitle: "推理偏差", feedbackTone: "wrong" },
    b: { choiceImpactText: "你把死者来电从灵异拉回现实：旧手机、云端提醒、迟到的求救。", feedbackTitle: "推理成立", feedbackTone: "correct" },
    c: { choiceImpactText: "这个答案把怀疑压到许知晚身上，却避开了手机记录本身。", feedbackTitle: "推理偏差", feedbackTone: "wrong" },
  });
  setChoiceFeedback("ch06_013", {
    a: { choiceImpactText: "你承认她是妹妹，也保留了她调查方式里的不透明。", feedbackTitle: "推理成立", feedbackTone: "correct" },
    b: { choiceImpactText: "周屿确实在施压，但这不能解释许知晚掌握的私人细节。", feedbackTitle: "推理偏差", feedbackTone: "wrong" },
    c: { choiceImpactText: "死而复生会让雨夜更恐怖，却不符合证件和旧案记录。", feedbackTitle: "推理偏差", feedbackTone: "wrong" },
  });
  setChoiceFeedback("ch06_014", {
    a: { choiceImpactText: "情感矛盾太轻，遮不住借贷资料和报警前的准备。", feedbackTitle: "推理偏差", feedbackTone: "wrong" },
    b: { choiceImpactText: "旧楼困住的是当晚的真相，不是许知夏死亡的动机。", feedbackTitle: "推理偏差", feedbackTone: "wrong" },
    c: { choiceImpactText: "灰色借贷把许知夏的求救、周屿的离城和后续威胁连了起来。", feedbackTitle: "推理成立", feedbackTone: "correct" },
  });
  setChoiceFeedback("ch06_015", { a: { choiceImpactText: "合照不只是怀旧，它的价值在背景，不在笑容。", feedbackTitle: "推理偏差", feedbackTone: "wrong" }, b: { choiceImpactText: "你抓住了照片最危险的地方：周屿在他声称不在场的位置。", feedbackTitle: "推理成立", feedbackTone: "correct" }, c: { choiceImpactText: "许知晚像许知夏，但照片里真正动摇证词的是另一个人。", feedbackTitle: "推理偏差", feedbackTone: "wrong" } });
  setChoiceFeedback("ch06_016", { a: { choiceImpactText: "你看见了周屿真正怕的东西：完整证据链，而不是单张照片。", feedbackTitle: "推理成立", feedbackTone: "correct" }, b: { choiceImpactText: "房东老太也许能作证，但不是周屿今晚最急着阻止的核心。", feedbackTitle: "推理偏差", feedbackTone: "wrong" }, c: { choiceImpactText: "他不在乎许知晚离不离开，他在乎证据会不会留下。", feedbackTitle: "推理偏差", feedbackTone: "wrong" } });

  const approvedSfx = new Set([
    "rain_window_soft", "phone_vibrate", "phone_ring_dead_call", "message_pop_cold",
    "recording_static_short", "room_silence_drop", "doorbell_rain_night", "knock_soft",
    "footstep_corridor_wet", "door_chain_close", "old_phone_start", "old_photo_pickup",
    "backup_start", "backup_success", "delete_warning", "door_lock_turn", "door_open_slow",
    "box_drag_soft", "deduction_tension",
  ]);
  const approvedStingers = new Set(["linzhou_gasp_short", "linzhou_swallow_tense", "linzhou_heartbeat_soft"]);
  const soundAliases = {
    linzhou_breath_tense: "linzhou_swallow_tense",
    photo_zoom: "old_photo_pickup",
  };
  const remapCues = (cues = []) => (Array.isArray(cues) ? cues : [cues])
    .map((cue) => {
      const key = typeof cue === "string" ? cue : cue?.key;
      const mapped = soundAliases[key] || key;
      if (!approvedSfx.has(mapped)) return null;
      return typeof cue === "string" ? mapped : { ...cue, key: mapped };
    })
    .filter(Boolean);

  Object.values(nodes).forEach((node) => {
    if (!["rain_night_loop", "horror_corridor", "ending_archive"].includes(node.bgm)) delete node.bgm;
    if (node.ambience !== "rain_heavy_loop") delete node.ambience;
    node.sfxOnEnter = remapCues(node.sfxOnEnter);
    if (!approvedStingers.has(node.voiceStinger)) delete node.voiceStinger;
    (node.investigationHotspots || []).forEach((hotspot) => {
      hotspot.sfxOnInspect = remapCues(hotspot.sfxOnInspect);
    });
  });

  const continuityRuns = [
    [1, 1, 2, "rental_room_rain_night", "room-settle"], [1, 3, 6, "phone_call_ui", "dead-call"], [1, 7, 11, "corridor_door", "door-pressure"], [1, 12, 12, "phone_call_ui", "call-record"], [1, 13, 20, "corridor_door", "threshold"],
    [2, 1, 5, "corridor_door", "door-interview"], [2, 6, 8, "rental_room_rain_night", "room-trust"], [2, 9, 10, "old_phone_view", "old-phone"], [2, 11, 13, "rental_room_rain_night", "room-trust"], [2, 14, 15, "phone_call_ui", "phone-pressure"], [2, 16, 20, "rental_room_rain_night", "room-evidence"],
    [3, 1, 10, "rental_room_table", "evidence-table"], [3, 11, 11, "phone_call_ui", "phone-pressure"], [3, 12, 15, "rental_room_table", "evidence-table"], [3, 16, 19, "phone_call_ui", "phone-pressure"], [3, 20, 20, "rental_room_table", "evidence-table"],
    [4, 1, 5, "rental_room_table", "photo-box"], [4, 6, 15, "photo_zoom_view", "photo-inspect"], [4, 16, 16, "corridor_door", "outside-warning"], [4, 17, 20, "phone_call_ui", "phone-pressure"],
    [5, 1, 3, "rental_room_rain_night", "room-pressure"], [5, 4, 6, "old_phone_view", "old-phone"], [5, 7, 8, "phone_call_ui", "phone-pressure"], [5, 9, 15, "old_phone_view", "recording-reveal"], [5, 16, 19, "phone_call_ui", "phone-pressure"], [5, 20, 20, "corridor_door", "door-lock"],
    [6, 1, 10, "rental_room_table", "evidence-table"], [6, 11, 20, "ending_screen", "archive-resolution"],
  ];
  Object.values(nodes).forEach((node) => {
    const match = node.nodeId.match(/^ch0(\d)_(\d{3})$/);
    const chapter = Number(match?.[1] || 0);
    const index = Number(match?.[2] || 0);
    const run = continuityRuns.find(([runChapter, start, end]) => runChapter === chapter && index >= start && index <= end);
    if (!run) return;
    const [, , , scene, visualBeat] = run;
    node.scene = scene;
    node.visualBeat = visualBeat;
    node.focusTarget = node.visualFocus || visualBeat;
    node.sceneHold = index > run[1];
    node.transitionStyle = index === run[1] && index !== 1 ? "dissolve" : "hold";
  });

  const sparseNodeCues = {
    ch01_001: [cue("rain_window_soft", { volume: 0.12, suppressMs: 3000 })],
    ch01_003: [cue("phone_vibrate", { volume: 0.2, suppressMs: 2600 }), cue("phone_ring_dead_call", { delayMs: 180, volume: 0.18, duckBgmMs: 520, suppressMs: 4000 })],
    ch01_005: [cue("recording_static_short", { volume: 0.12, duckBgmMs: 280 })],
    ch01_006: [cue("doorbell_rain_night", { volume: 0.18, duckBgmMs: 420 })],
    ch01_007: [cue("footstep_corridor_wet", { volume: 0.16, suppressMs: 3000 })],
    ch01_010: [cue("knock_soft", { volume: 0.13, suppressMs: 3000 })],
    ch01_018: [cue("message_pop_cold", { volume: 0.14, suppressMs: 3000 })],
    ch02_005: [cue("footstep_corridor_wet", { volume: 0.13, suppressMs: 3000 })],
    ch02_014: [cue("message_pop_cold", { volume: 0.14, suppressMs: 3000 })],
    ch04_001: [cue("box_drag_soft", { volume: 0.15, duckBgmMs: 260 })],
    ch04_004: [cue("old_photo_pickup", { volume: 0.15, suppressMs: 3000 })],
    ch04_017: [cue("phone_vibrate", { volume: 0.15, suppressMs: 3000 })],
    ch05_004: [cue("old_phone_start", { volume: 0.17, suppressMs: 3000 })],
    ch05_005: [cue("recording_static_short", { volume: 0.11, duckBgmMs: 240 })],
    ch05_011: [cue("recording_static_short", { volume: 0.1, duckBgmMs: 240 })],
    ch05_013: [cue("footstep_corridor_wet", { volume: 0.14, suppressMs: 3000 })],
    ch05_020: [cue("door_lock_turn", { volume: 0.16, duckBgmMs: 320 })],
    ch06_006: [cue("backup_start", { volume: 0.14, duckBgmMs: 260 })],
    ch06_008: [cue("message_pop_cold", { volume: 0.13, suppressMs: 3000 })],
    ch06_010: [cue("deduction_tension", { volume: 0.1, fadeInMs: 180, duckBgmMs: 360 })],
  };
  Object.values(nodes).forEach((node) => {
    node.sfxOnEnter = sparseNodeCues[node.nodeId] || [];
    node.sfxOnChoice = [];
    node.choices = (node.choices || []).map((choice) => ({ ...choice, sfxOnChoice: [] }));
    if (node.nodeId !== "ch01_004") delete node.voiceStinger;
    (node.investigationHotspots || []).forEach((hotspot) => {
      hotspot.sfxOnInspect = ["old_phone", "recording_file", "door_chain", "old_photo"].includes(hotspot.hotspotId)
        ? remapCues(hotspot.sfxOnInspect).slice(0, 1)
        : [];
    });
  });

  return {
    schemaVersion: "0.6",
    product,
    series,
    scripts,
    chapters,
    clues,
    defaultFlags,
    nodes,
    endings,
  };
})();
