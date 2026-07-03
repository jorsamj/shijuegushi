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
      overlayPreset: data.overlayPreset,
      bgm: data.bgm,
      ambience: data.ambience,
      sfxOnEnter: data.sfxOnEnter || [],
      sfxOnChoice: data.sfxOnChoice || [],
      narrationAudio: data.narrationAudio,
      voiceAudio: data.voiceAudio,
      voiceCharacter: data.voiceCharacter,
      audioMood: data.audioMood,
      resolveEnding: data.resolveEnding || false,
    };
    if (data.nextNodeId === null) delete nodes[nodeId].nextNodeId;
  }

  // 第 1 章：雨夜来电
  add(1, 1, { speaker: "旁白", text: "暴雨把窗户拍得发白。林舟盯着电脑里还没写完的周报，泡面汤已经凉透，杯沿留着半圈咖啡渍。" });
  add(1, 2, { speaker: "林舟", text: "再改一版……就睡。", scene: "rental_room_table" });
  add(1, 3, { speaker: "旁白", text: "手机突然震动。来电显示跳出来的名字，让林舟的手停在键盘上。\n\n许知夏。", scene: "phone_call_ui", type: "clue", gainClues: ["clue_dead_call"], visualMood: "tense", bgm: "rain_night_loop", ambience: "rain_heavy_loop", sfxOnEnter: ["phone_ring"], audioMood: "tense" });
  add(1, 4, { speaker: "林舟", text: "不可能。", scene: "phone_call_ui" });
  add(1, 5, { speaker: "许知夏的声音", text: "别开门，她不是我。", scene: "phone_call_ui", visualMood: "horror", characterVariant: "recording", bgm: "rain_night_loop", ambience: "rain_heavy_loop", sfxOnEnter: ["static_noise"], voiceAudio: "voice_xuzhixia_ch01_005", voiceCharacter: "xuzhixia", audioMood: "horror" });
  add(1, 6, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "电话断了。下一秒，门铃响起。你听见走廊里有水滴落在地上的声音。",
    choices: [
      choice("a", "不靠近门，先隔着屋子问是谁", "ch01_007", {
        setFlags: ["kept_door_closed"],
        relationshipEffects: [rel("courage_linzou", 5, "你没有立刻被恐惧推着开门")],
        endingPathTags: ["kept_boundary"],
      }),
      choice("b", "走到猫眼前，看门外的人", "ch01_008", {
        relationshipEffects: [rel("courage_linzou", 5, "你逼自己确认门外的现实")],
        endingPathTags: ["checked_peephole"],
      }),
      choice("c", "给陈妍发消息：如果我十分钟后没回，报警", "ch01_009", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你第一时间让陈妍成为外部见证")],
        endingPathTags: ["chenyan_witness"],
      }),
    ],
  });
  add(1, 7, { speaker: "女人", text: "林舟？我是许知晚。许知夏的妹妹。雨太大了，你先别怕。", scene: "corridor_door", visualMood: "tense", characterVariant: "wet", characterScale: "large", characterPosition: "right", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["door_chain", "rain_hit_window"], voiceAudio: "voice_xuzhiwan_ch01_007", voiceCharacter: "xuzhiwan", audioMood: "tense" });
  add(1, 8, { speaker: "旁白", text: "猫眼外站着一个浑身湿透的女人。她抬头时，林舟差点后退。\n\n那张脸和许知夏太像了。", scene: "corridor_door", visualMood: "tense", visualCharacter: "许知晚", characterVariant: "fullbody", characterScale: "large", characterPosition: "right", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["door_chain", "rain_hit_window"], audioMood: "tense" });
  add(1, 9, { speaker: "陈妍", text: "你最好别开门。还有，把门链扣上。你这破楼连灯都一闪一闪的。", scene: "old_chat_memory" });
  add(1, 10, {
    type: "choice",
    scene: "corridor_door",
    speaker: "林舟",
    text: "门外的女人没有催，只是把手掌贴在门上。雨水顺着她袖口往下滴。",
    choices: [
      choice("a", "问她：许知夏大学时最怕什么？", "ch01_011", {
        setFlags: ["verified_zhuwan_identity"],
        relationshipEffects: [rel("trust_zhuwan", 5, "你选择隔门核验许知晚身份")],
        endingPathTags: ["identity_check"],
      }),
      choice("b", "先拨回许知夏的号码", "ch01_012", {
        relationshipEffects: [rel("courage_linzou", 5, "你试图确认死者来电来源")],
        endingPathTags: ["called_dead_number"],
      }),
      choice("c", "把门铃声音录下来，继续沉默", "ch01_013", {
        relationshipEffects: [rel("courage_linzou", 3, "你选择先保留现场痕迹")],
        endingPathTags: ["recorded_doorbell"],
      }),
    ],
  });
  add(1, 11, { speaker: "许知晚", text: "她怕黑。不是夜灯那种黑，是楼梯间突然停电的黑。她说你会笑她，可还是会陪她走完那段楼梯。", scene: "corridor_door" });
  add(1, 12, { speaker: "旁白", text: "回拨没有接通。运营商提示音平稳得像一盆冷水，把那个名字重新按回三年前。", scene: "phone_call_ui" });
  add(1, 13, { speaker: "旁白", text: "录音里，门铃之后有一声很轻的吸气。像门外的人在忍着哭，也像有人站在更远处听。", scene: "corridor_door" });
  add(1, 14, {
    type: "choice",
    scene: "corridor_door",
    speaker: "许知晚",
    text: "许知晚压低声音：我不是来吓你的。我姐三年前不是意外。",
    choices: [
      choice("a", "让她把证件和能证明身份的东西从门缝递进来", "ch01_015", {
        setFlags: ["verified_zhuwan_identity"],
        relationshipEffects: [rel("trust_zhuwan", 8, "你要求证明，但没有把她拒之门外")],
        endingPathTags: ["requested_proof"],
      }),
      choice("b", "告诉她：我会报警，让警察来听你说", "ch01_016", {
        relationshipEffects: [rel("courage_linzou", 5, "你试图把恐惧转为现实处理")],
        endingPathTags: ["police_option"],
      }),
      choice("c", "问她为什么偏偏今晚来找你", "ch01_017", {
        relationshipEffects: [rel("trust_zhuwan", 4, "你开始追问许知晚的真实目的")],
        endingPathTags: ["asked_timing"],
      }),
    ],
  });
  add(1, 15, { speaker: "旁白", text: "门缝里滑进来一张塑封证件。名字是许知晚。照片上的她笑得很浅，和门外湿透的狼狈判若两人。", scene: "corridor_door" });
  add(1, 16, { speaker: "许知晚", text: "你可以报警。但在他们来之前，你先看一眼我发给你的东西。别让周屿知道。", scene: "corridor_door" });
  add(1, 17, { speaker: "许知晚", text: "因为今晚，我姐的旧手机亮了。它先拨给你，然后才把记录同步给我。", scene: "corridor_door" });
  add(1, 18, { speaker: "旁白", text: "手机又震了一下。这一次不是旧号码，是周屿。\n\n【别让她进去。】", scene: "phone_call_ui" });
  add(1, 19, { speaker: "林舟", text: "周屿怎么会知道门外有人？", scene: "rental_room_rain_night" });
  add(1, 20, { speaker: "旁白", text: "门外的许知晚听见这个名字，忽然安静了。楼道灯闪了一下，把猫眼里的她切成一张潮湿的旧照片。", scene: "corridor_door", nextNodeId: "ch02_001" });

  // 第 2 章：门外的许知晚
  add(2, 1, { speaker: "许知晚", text: "他给你发消息了，对不对？", scene: "corridor_door" });
  add(2, 2, { speaker: "林舟", text: "你怎么知道？", scene: "corridor_door" });
  add(2, 3, { speaker: "许知晚", text: "因为三年前，他也是这样先让所有人闭嘴。", scene: "corridor_door", visualMood: "tense", characterVariant: "pressure", characterScale: "large", characterPosition: "right", bgm: "horror_corridor", ambience: "rain_heavy_loop", sfxOnEnter: ["door_chain", "rain_hit_window"], voiceAudio: "voice_xuzhiwan_ch02_003", voiceCharacter: "xuzhiwan", audioMood: "tense" });
  add(2, 4, {
    type: "choice",
    scene: "corridor_door",
    speaker: "旁白",
    text: "门链扣着。你能看见她湿透的鞋尖，也能看见楼道尽头那盏灯忽亮忽灭。",
    choices: [
      choice("a", "继续隔门问她和许知夏的关系", "ch02_005", {
        relationshipEffects: [rel("trust_zhuwan", 6, "你给了许知晚解释空间，但仍保持距离")],
        endingPathTags: ["slow_identity_check"],
      }),
      choice("b", "让她先进屋，但手机保持录音", "ch02_006", {
        setFlags: ["trusted_zhuwan_early"],
        relationshipEffects: [rel("trust_zhuwan", 15, "你选择提前相信许知晚"), rel("suspicion_zhou", 5, "关键人物进入房间增加证据风险")],
        endingPathTags: ["trusted_zhuwan_early"],
      }),
      choice("c", "把周屿的消息截图发给陈妍", "ch02_007", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你把周屿异常消息交给陈妍保存")],
        endingPathTags: ["zhou_message_saved"],
      }),
    ],
  });
  add(2, 5, { speaker: "许知晚", text: "她高三那年离家出走，躲在图书馆天台。她说后来再也不想让别人等她。这个你应该听她说过。", scene: "corridor_door", type: "clue", gainClues: ["clue_sister_mark"] });
  add(2, 6, { speaker: "旁白", text: "许知晚进门后没有坐。她站在玄关，水从袖口滴到地垫上，眼睛一直盯着林舟的手机。", scene: "rental_room_rain_night", type: "clue", gainClues: ["clue_sister_mark"] });
  add(2, 7, { speaker: "陈妍", text: "截图收到了。周屿？你大学那个老好人？他为什么半夜盯着你家门口？", scene: "old_chat_memory" });
  add(2, 8, {
    type: "choice",
    scene: "rental_room_rain_night",
    speaker: "许知晚",
    text: "她把手机举到胸前：我可以给你看旧手机照片，但你不能转给周屿。",
    choices: [
      choice("a", "要求她先解释旧手机怎么到她手里", "ch02_009", {
        relationshipEffects: [rel("trust_zhuwan", 5, "你没有盲信许知晚的旧手机说法")],
        endingPathTags: ["asked_old_phone_source"],
      }),
      choice("b", "先看照片，再决定是否相信她", "ch02_010", {
        relationshipEffects: [rel("trust_zhuwan", 8, "你愿意先看证据再判断")],
        endingPathTags: ["looked_old_phone_photo"],
      }),
      choice("c", "把照片同时转发给陈妍备份", "ch02_011", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 8, "你让陈妍加入证据备份链")],
        endingPathTags: ["backup_mind"],
      }),
    ],
  });
  add(2, 9, { speaker: "许知晚", text: "我在她旧云盘里找了三个月。今晚它自己同步了一条提醒，像她终于等到有人开机。", scene: "old_phone_view" });
  add(2, 10, { speaker: "旁白", text: "照片里是一部旧手机。屏幕裂开一角，通知栏停着一行字：语音备忘恢复完成。下面有林舟的名字。", scene: "old_phone_view" });
  add(2, 11, { speaker: "陈妍", text: "我帮你存了。还有，别把原图随便给任何人，包括门口那个。", scene: "old_chat_memory" });
  add(2, 12, { speaker: "林舟", text: "你为什么不直接报警？", scene: "rental_room_rain_night" });
  add(2, 13, { speaker: "许知晚", text: "我报过。没人愿意为了一个三年前的意外，听一个妹妹讲旧手机和雨夜电话。", scene: "rental_room_rain_night" });
  add(2, 14, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "周屿又发来消息。\n\n【她很会骗人。林舟，你别把自己拖进去。】",
    choices: [
      choice("a", "回复周屿：你怎么知道她在我门外", "ch02_015", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你直接追问周屿不该知道的信息"), rel("courage_linzou", 5, "你开始正面回应周屿异常")],
        endingPathTags: ["questioned_zhou_knowledge"],
      }),
      choice("b", "不回，把消息拿给许知晚看", "ch02_016", {
        relationshipEffects: [rel("trust_zhuwan", 8, "你把周屿的干扰公开给许知晚")],
        endingPathTags: ["shared_zhou_message"],
      }),
      choice("c", "让陈妍查周屿最近的联系方式", "ch02_017", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你请陈妍追踪周屿的现实动向")],
        endingPathTags: ["chenyan_tracks_zhou"],
      }),
    ],
  });
  add(2, 15, { speaker: "周屿", text: "我只是担心你。你以前就容易心软，知夏出事那晚也是。", scene: "phone_call_ui", visualMood: "tense", characterVariant: "pressure", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["message_pop"], voiceAudio: "voice_zhouyu_ch02_015", voiceCharacter: "zhouyu", audioMood: "tense" });
  add(2, 16, { speaker: "许知晚", text: "他说你心软？他最会用这个词了。说得像所有犹豫都是别人的错。", scene: "rental_room_rain_night" });
  add(2, 17, { speaker: "陈妍", text: "查到了，他号码换过，但社交账号还在。三年前以后，他几乎删掉了所有和许知夏同框的照片。", scene: "old_chat_memory" });
  add(2, 18, { speaker: "旁白", text: "许知晚擦了擦手，终于坐下。她没有靠近沙发，只坐在门边，像随时准备被赶出去。", scene: "rental_room_rain_night" });
  add(2, 19, { speaker: "许知晚", text: "我来找你，是因为你手里可能有最后一张合照。背景里有他。", scene: "rental_room_rain_night" });
  add(2, 20, { speaker: "旁白", text: "手机屏幕暗下去前，旧手机照片里的通知又跳出一行：三年前的今日，23:40。", scene: "old_phone_view", nextNodeId: "ch03_001" });

  // 第 3 章：三年前的裂缝
  add(3, 1, { speaker: "旁白", text: "林舟把旧移动硬盘从抽屉底翻出来。灰尘扬起时，她忽然想起许知夏总说：旧东西不是没用，是你不敢看。", scene: "rental_room_table" });
  add(3, 2, { speaker: "许知晚", text: "我不需要你马上相信我。你只要看一眼三年前。", scene: "rental_room_table" });
  add(3, 3, { speaker: "林舟", text: "我已经三年没看过这些聊天记录。", scene: "old_chat_memory" });
  add(3, 4, {
    type: "choice",
    scene: "old_chat_memory",
    speaker: "旁白",
    text: "硬盘里有照片、聊天截图、旧新闻缓存。每一个文件名都像一扇没关紧的门。",
    choices: [
      choice("a", "先看许知夏和自己的私聊", "ch03_005", {
        relationshipEffects: [rel("courage_linzou", 6, "你开始面对自己逃避三年的聊天记录")],
        endingPathTags: ["old_chat_review"],
      }),
      choice("b", "先让陈妍查三年前旧新闻", "ch03_006", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你让陈妍从现实资料入手")],
        endingPathTags: ["old_news_search"],
      }),
      choice("c", "先问许知晚：你到底查到了哪一步", "ch03_007", {
        relationshipEffects: [rel("trust_zhuwan", 7, "你要求许知晚交代她掌握的边界")],
        endingPathTags: ["zhuwan_investigation_scope"],
      }),
    ],
  });
  add(3, 5, { speaker: "许知夏", text: "林舟，如果有人用你的名字借钱，你会先骂人还是先报警？", scene: "old_chat_memory" });
  add(3, 6, { speaker: "陈妍", text: "新闻标题很普通：女大学生雨夜坠楼。普通到像有人专门把它写得普通。", scene: "old_chat_memory" });
  add(3, 7, { speaker: "许知晚", text: "我查到她出事前一周在搜身份信息被冒用。再往下查，账号就被注销了。", scene: "rental_room_rain_night" });
  add(3, 8, { speaker: "旁白", text: "屏幕里，三年前的聊天停在许知夏最后一个表情：一只缩在雨伞下的小猫。那天之后，她再也没有回复。", scene: "old_chat_memory" });
  add(3, 9, {
    type: "choice",
    scene: "old_chat_memory",
    speaker: "陈妍",
    text: "陈妍发来语音：你要我继续查，就别半路装死。这个坑不像八卦。",
    choices: [
      choice("a", "让陈妍继续查借贷记录", "ch03_010", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 12, "你让陈妍继续追查灰色借贷")],
        endingPathTags: ["gray_loan_search"],
      }),
      choice("b", "直接问周屿知夏是不是欠过钱", "ch03_011", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你用借贷问题试探周屿")],
        endingPathTags: ["asked_zhou_loan"],
      }),
      choice("c", "先问许知晚有没有实质证据", "ch03_012", {
        relationshipEffects: [rel("trust_zhuwan", 5, "你要求许知晚拿出可核验资料")],
        endingPathTags: ["asked_evidence"],
      }),
    ],
  });
  add(3, 10, { speaker: "陈妍", text: "有了。不是正规借款，是套身份的灰色平台。签名不是她的，但证件号是真的。", scene: "old_chat_memory", type: "clue", gainClues: ["clue_gray_loan"], setFlags: ["found_gray_loan"] });
  add(3, 11, { speaker: "周屿", text: "知夏那时候压力很大，你现在翻这些，只会让所有人更难堪。", scene: "phone_call_ui", visualMood: "tense", characterVariant: "pressure", bgm: "horror_corridor", sfxOnEnter: ["message_pop"], voiceAudio: "voice_zhouyu_ch03_011", voiceCharacter: "zhouyu", audioMood: "tense" });
  add(3, 12, { speaker: "许知晚", text: "我有平台截图，但不完整。完整的东西，可能在你那张合照里。", scene: "rental_room_rain_night", type: "clue", gainClues: ["clue_gray_loan"], setFlags: ["found_gray_loan"] });
  add(3, 13, { speaker: "林舟", text: "合照为什么能证明借贷？", scene: "rental_room_rain_night" });
  add(3, 14, { speaker: "许知晚", text: "不能证明借贷。但能证明周屿那晚不在他说的位置。", scene: "rental_room_rain_night" });
  add(3, 15, { speaker: "旁白", text: "雨声忽然变密，窗缝里漏进一线冷风。电脑屏幕上，旧新闻的发布时间停在凌晨四点。", scene: "rental_room_rain_night" });
  add(3, 16, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "陈妍",
    text: "陈妍又发来一条：周屿当年离职时间不对。你要听吗？",
    choices: [
      choice("a", "立刻听陈妍说完", "ch03_017", {
        relationshipEffects: [rel("support_chenyan", 10, "你信任陈妍继续给出关键现实资料")],
        endingPathTags: ["zhou_left_found"],
      }),
      choice("b", "先问周屿为什么离开城市", "ch03_018", {
        setFlags: ["suspected_zhou", "answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 12, "你正面追问周屿离城时间")],
        endingPathTags: ["confronted_zhou_left"],
      }),
      choice("c", "先让许知晚别出声，录下周屿的反应", "ch03_019", {
        relationshipEffects: [rel("courage_linzou", 8, "你开始用证据而不是情绪回应周屿")],
        endingPathTags: ["recorded_zhou_reaction"],
      }),
    ],
  });
  add(3, 17, { speaker: "陈妍", text: "他不是案发后走的。是新闻出来前一天。他递了离职，火车票也是那天买的。", scene: "old_chat_memory", type: "clue", gainClues: ["clue_zhou_left"], setFlags: ["suspected_zhou"] });
  add(3, 18, { speaker: "周屿", text: "我离开是因为受不了。林舟，不是每个人都能像你一样假装三年没事。", scene: "phone_call_ui", type: "clue", gainClues: ["clue_zhou_left"], setFlags: ["suspected_zhou"], visualMood: "tense", characterVariant: "pressure", bgm: "horror_corridor", sfxOnEnter: ["message_pop"], voiceAudio: "voice_zhouyu_ch03_018", voiceCharacter: "zhouyu", audioMood: "tense" });
  add(3, 19, { speaker: "旁白", text: "录音里，周屿停顿了两秒。那两秒没有雨声，只有他压住呼吸的声音。", scene: "phone_call_ui", type: "clue", gainClues: ["clue_zhou_left"], setFlags: ["suspected_zhou"] });
  add(3, 20, { speaker: "陈妍", text: "林舟，新闻出来前一天，他为什么要跑？", scene: "old_chat_memory", nextNodeId: "ch04_001" });

  // 第 4 章：最后一张合照
  add(4, 1, { speaker: "旁白", text: "纸箱被拖出来时，胶带粘着地板发出刺耳的声音。林舟手指停在箱盖上，像停在三年前的门口。", scene: "rental_room_table" });
  add(4, 2, { speaker: "许知晚", text: "如果你不想找，我不会逼你。", scene: "rental_room_table" });
  add(4, 3, { speaker: "林舟", text: "你已经来了。电话也已经打了。现在说不逼，太晚了。", scene: "rental_room_table" });
  add(4, 4, {
    type: "choice",
    scene: "rental_room_table",
    speaker: "旁白",
    text: "箱子里有旧书、拍立得、票根和几张没洗干净的证件照。",
    choices: [
      choice("a", "先把照片全部拍照备份", "ch04_005", {
        setFlags: ["backed_up_photo"],
        relationshipEffects: [rel("support_chenyan", 5, "你先建立证据备份意识"), rel("courage_linzou", 10, "你选择保护可能的关键证据")],
        endingPathTags: ["backed_up_photo"],
      }),
      choice("b", "直接找许知夏最后一次聚会的合照", "ch04_006", {
        setFlags: ["found_last_photo"],
        relationshipEffects: [rel("courage_linzou", 6, "你直奔旧案核心物证")],
        endingPathTags: ["found_last_photo"],
      }),
      choice("c", "让许知晚说清楚照片里应该有什么", "ch04_007", {
        relationshipEffects: [rel("trust_zhuwan", 7, "你让许知晚给出具体可核验目标")],
        endingPathTags: ["zhuwan_photo_hint"],
      }),
    ],
  });
  add(4, 5, { speaker: "陈妍", text: "收到。你终于有点证据意识了。别笑，我现在真想给你发面锦旗。", scene: "old_chat_memory" });
  add(4, 6, { speaker: "旁白", text: "照片被夹在一本旧笔记里。四个人站在校门口，许知夏笑得最大声，周屿站得离她最近。", scene: "photo_zoom_view", setFlags: ["found_last_photo"] });
  add(4, 7, { speaker: "许知晚", text: "看背景。别看他们的脸，看右后方那栋楼的入口。", scene: "photo_zoom_view" });
  add(4, 8, { speaker: "旁白", text: "照片背面有一行很淡的字：别相信他说的那晚。字迹被潮气晕开，像有人写完后又后悔。", scene: "photo_zoom_view" });
  add(4, 9, { speaker: "林舟", text: "这句话不是证据。", scene: "photo_zoom_view" });
  add(4, 10, {
    type: "choice",
    scene: "photo_zoom_view",
    speaker: "旁白",
    text: "屏幕上的照片被放大。雨声像一层噪点压在耳边。",
    choices: [
      choice("a", "先看玻璃反光", "ch04_011", {
        relationshipEffects: [rel("courage_linzou", 4, "你检查照片里的反光细节")],
        endingPathTags: ["checked_reflection"],
      }),
      choice("b", "先看楼道门牌", "ch04_012", {
        relationshipEffects: [rel("courage_linzou", 4, "你核对照片背景的空间位置")],
        endingPathTags: ["checked_doorplate"],
      }),
      choice("c", "先看右下角阴影", "ch04_013", {
        relationshipEffects: [rel("suspicion_zhou", 8, "你注意到照片边缘的不自然人影")],
        endingPathTags: ["checked_shadow"],
      }),
    ],
  });
  add(4, 11, { speaker: "旁白", text: "玻璃反光里有一截蓝色伞柄，颜色和周屿大学时常用的那把很像，但还不够。", scene: "photo_zoom_view" });
  add(4, 12, { speaker: "旁白", text: "门牌号模糊，却能看出那不是宿舍正门，而是旧楼后侧楼梯。许知夏坠楼的地方，就在那栋楼后。", scene: "photo_zoom_view" });
  add(4, 13, { speaker: "旁白", text: "右下角阴影里，有半个人影。深色外套，左肩一道浅色反光。林舟记得周屿那件外套。", scene: "photo_zoom_view" });
  add(4, 14, { speaker: "许知晚", text: "他说那晚他在外地。可这张照片拍摄时间，是出事前两个小时。", scene: "photo_zoom_view" });
  add(4, 15, { speaker: "旁白", text: "林舟把照片再放大一格。人影不再像影子，像一个终于被雨水冲出来的人。", scene: "photo_zoom_view", type: "clue", gainClues: ["clue_photo_background"], setFlags: ["found_photo_background"] });
  add(4, 16, { speaker: "房东老太", text: "你门口那个姑娘？来过。还有个男的也来问过你住几楼，戴口罩，声音挺客气。", scene: "corridor_door" });
  add(4, 17, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "周屿的电话打进来。屏幕亮着，像一只不肯闭上的眼。",
    choices: [
      choice("a", "接电话，假装没找到照片", "ch04_018", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你试探周屿对照片的反应")],
        endingPathTags: ["tested_zhou_photo"],
      }),
      choice("b", "挂断，把照片发给陈妍备份", "ch04_019", {
        setFlags: ["backed_up_photo", "refused_zhou_pressure"],
        relationshipEffects: [rel("support_chenyan", 12, "你优先保护照片证据链"), rel("courage_linzou", 8, "你拒绝周屿的节奏")],
        endingPathTags: ["photo_backed_to_chenyan"],
      }),
      choice("c", "直接质问周屿为什么知道照片", "ch04_020", {
        setFlags: ["suspected_zhou", "answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 12, "你正面触碰周屿最害怕的证据")],
        endingPathTags: ["confronted_zhou_photo"],
      }),
    ],
  });
  add(4, 18, { speaker: "周屿", text: "你没找到就好。我的意思是，别再翻那些东西了。它们只会害你。", scene: "phone_call_ui", visualMood: "tense", characterVariant: "pressure", bgm: "horror_corridor", sfxOnEnter: ["message_pop"], voiceAudio: "voice_zhouyu_ch04_018", voiceCharacter: "zhouyu", audioMood: "tense" });
  add(4, 19, { speaker: "陈妍", text: "照片收到了。我也看见右下角了。林舟，这不是你一个人能扛的事。", scene: "old_chat_memory" });
  add(4, 20, { speaker: "周屿", text: "林舟，你刚刚找到那张合照，对吗？", scene: "phone_call_ui", nextNodeId: "ch05_001", visualMood: "horror", characterVariant: "horror", characterScale: "large", characterPosition: "right", bgm: "horror_corridor", sfxOnEnter: ["message_pop", "static_noise"], voiceAudio: "voice_zhouyu_ch04_020", voiceCharacter: "zhouyu", audioMood: "horror" });

  // 第 5 章：旧手机的声音
  add(5, 1, { speaker: "旁白", text: "房间里所有人都没说话。周屿那句话还停在听筒里，像他正站在门外。", scene: "phone_call_ui" });
  add(5, 2, { speaker: "许知晚", text: "他知道。不是猜的。", scene: "rental_room_rain_night" });
  add(5, 3, { speaker: "陈妍", text: "我建议你现在别单独出门。还有，手机别关机。", scene: "old_chat_memory" });
  add(5, 4, {
    type: "choice",
    scene: "old_phone_view",
    speaker: "许知晚",
    text: "许知晚发来旧手机录屏。屏幕上，语音备忘列表正在一点点恢复。",
    choices: [
      choice("a", "让许知晚继续播放录屏", "ch05_005", {
        relationshipEffects: [rel("trust_zhuwan", 8, "你愿意继续接收许知晚提供的旧手机记录")],
        endingPathTags: ["old_phone_records"],
      }),
      choice("b", "让陈妍判断这种触发是否可能", "ch05_006", {
        setFlags: ["called_chenyan"],
        relationshipEffects: [rel("support_chenyan", 10, "你让陈妍验证旧手机机制")],
        endingPathTags: ["timed_voice_verify"],
      }),
      choice("c", "先问周屿是否知道旧手机", "ch05_007", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 10, "你用旧手机试探周屿")],
        endingPathTags: ["asked_zhou_old_phone"],
      }),
    ],
  });
  add(5, 5, { speaker: "许知夏的声音", text: "如果这段被恢复，说明我没来得及见到林舟。", scene: "old_phone_view", visualMood: "horror", characterVariant: "recording", bgm: "horror_corridor", ambience: "room_night_loop", sfxOnEnter: ["recording_play", "static_noise"], voiceAudio: "voice_xuzhixia_ch05_005", voiceCharacter: "xuzhixia", audioMood: "horror" });
  add(5, 6, { speaker: "陈妍", text: "可能。旧手机开机、云端恢复、定时提醒叠在一起，会像一次主动来电。吓人，但不是鬼。", scene: "old_chat_memory" });
  add(5, 7, { speaker: "周屿", text: "旧手机？她妹妹连这个都告诉你了？林舟，你知道她这些年怎么查你的吗？", scene: "phone_call_ui", visualMood: "tense", characterVariant: "pressure", bgm: "horror_corridor", sfxOnEnter: ["message_pop"], voiceAudio: "voice_zhouyu_ch05_007", voiceCharacter: "zhouyu", audioMood: "tense" });
  add(5, 8, { speaker: "林舟", text: "所以你知道那部手机。", scene: "phone_call_ui" });
  add(5, 9, { speaker: "旁白", text: "周屿没有立刻回答。沉默里，楼道灯忽然灭了。", scene: "corridor_door" });
  add(5, 10, {
    type: "choice",
    scene: "old_phone_view",
    speaker: "许知晚",
    text: "录音还剩一段。许知晚的手指停在播放键上：听完，你就回不了头了。",
    choices: [
      choice("a", "让她播放完整录音", "ch05_011", {
        relationshipEffects: [rel("trust_zhuwan", 6, "你选择继续听完许知夏留下的声音"), rel("courage_linzou", 8, "你更接近真相核心")],
        endingPathTags: ["played_voice"],
      }),
      choice("b", "先把录音发给陈妍备份", "ch05_012", {
        setFlags: ["backed_up_photo"],
        relationshipEffects: [rel("support_chenyan", 10, "你在播放前先保护语音记录")],
        endingPathTags: ["voice_backed_up"],
      }),
      choice("c", "暂停，先确认门外有没有人", "ch05_013", {
        relationshipEffects: [rel("courage_linzou", 5, "你在压力下仍确认现实危险")],
        endingPathTags: ["checked_corridor"],
      }),
    ],
  });
  add(5, 11, { speaker: "许知夏的声音", text: "周屿他……如果我出事，不要相信他说那晚不在。照片——", scene: "old_phone_view", visualMood: "horror", characterVariant: "fear", bgm: "horror_corridor", ambience: "room_night_loop", sfxOnEnter: ["recording_play", "static_noise"], voiceAudio: "voice_xuzhixia_ch05_011", voiceCharacter: "xuzhixia", audioMood: "horror" });
  add(5, 12, { speaker: "陈妍", text: "备份到了。林舟，这段足够说明她生前在防一个熟人。", scene: "old_chat_memory" });
  add(5, 13, { speaker: "旁白", text: "猫眼外一片黑。只有楼梯间传来第二个人的脚步声，慢，不急，像故意让屋里的人听见。", scene: "corridor_door" });
  add(5, 14, { speaker: "许知晚", text: "他来了。", scene: "corridor_door" });
  add(5, 15, { speaker: "旁白", text: "录屏最后弹出恢复记录：旧手机开机后，三年前的语音备忘被云端提醒触发。死者来电终于有了现实解释。", scene: "old_phone_view", type: "clue", gainClues: ["clue_timed_voice"], setFlags: ["understood_dead_call"], visualMood: "horror", visualCharacter: "许知夏", characterVariant: "recording", bgm: "horror_corridor", ambience: "room_night_loop", sfxOnEnter: ["recording_play", "static_noise"], audioMood: "horror" });
  add(5, 16, { speaker: "周屿", text: "林舟，你听到录音了？", scene: "phone_call_ui", visualMood: "horror", characterVariant: "horror", characterScale: "large", characterPosition: "right", bgm: "horror_corridor", ambience: "corridor_hum", sfxOnEnter: ["message_pop", "static_noise"], voiceAudio: "voice_zhouyu_ch05_016", voiceCharacter: "zhouyu", audioMood: "horror" });
  add(5, 17, {
    type: "choice",
    scene: "phone_call_ui",
    speaker: "旁白",
    text: "周屿的声音很轻，像不是在问，而是在确认你的手里还有多少东西。",
    choices: [
      choice("a", "假装录音损坏，诱导他说漏嘴", "ch05_018", {
        setFlags: ["answered_zhou_call"],
        relationshipEffects: [rel("suspicion_zhou", 12, "你开始反向试探周屿")],
        endingPathTags: ["baited_zhou"],
      }),
      choice("b", "直接告诉他：我会重启旧案", "ch05_019", {
        relationshipEffects: [rel("courage_linzou", 12, "你第一次正面说出重启旧案")],
        endingPathTags: ["declared_reopen"],
      }),
      choice("c", "挂断，先把门反锁并整理证据", "ch05_020", {
        setFlags: ["refused_zhou_pressure"],
        relationshipEffects: [rel("courage_linzou", 8, "你拒绝被周屿控制节奏")],
        endingPathTags: ["secured_room"],
      }),
    ],
  });
  add(5, 18, { speaker: "周屿", text: "损坏就别修了。知夏已经死了，别再让她把活人也拖下去。", scene: "phone_call_ui", visualMood: "horror", characterVariant: "pressure", characterScale: "large", bgm: "horror_corridor", sfxOnEnter: ["message_pop"], voiceAudio: "voice_zhouyu_ch05_018", voiceCharacter: "zhouyu", audioMood: "horror" });
  add(5, 19, { speaker: "周屿", text: "你以为你在救她？你当年要是接她电话，她也许根本不会死。", scene: "phone_call_ui", visualMood: "horror", characterVariant: "horror", characterScale: "large", characterPosition: "right", bgm: "horror_corridor", sfxOnEnter: ["message_pop", "static_noise"], voiceAudio: "voice_zhouyu_ch05_019", voiceCharacter: "zhouyu", audioMood: "horror" });
  add(5, 20, { speaker: "旁白", text: "门锁孔里传来轻轻一声响。\n\n像有人把钥匙插了进去。", scene: "corridor_door", nextNodeId: "ch06_001" });

  // 第 6 章：无人接听
  add(6, 1, { speaker: "旁白", text: "林舟把桌上的东西摊开：照片、聊天记录、旧手机录屏、陈妍发来的新闻截图。它们终于不再是散落的雨声。", scene: "rental_room_table" });
  add(6, 2, { speaker: "许知晚", text: "你可以现在停下。你没有欠我。", scene: "rental_room_table" });
  add(6, 3, { speaker: "林舟", text: "我欠她。至少欠一个没有挂掉的电话。", scene: "rental_room_table" });
  add(6, 4, {
    type: "choice",
    scene: "rental_room_table",
    speaker: "陈妍",
    text: "陈妍发来最后一条提醒：先决定证据怎么保住，再决定要不要相信谁。",
    choices: [
      choice("a", "把照片和录音都备份到陈妍那里", "ch06_005", {
        setFlags: ["backed_up_photo"],
        relationshipEffects: [rel("support_chenyan", 10, "你把关键证据交给陈妍形成外部备份"), rel("courage_linzou", 10, "你保护证据而不是逃避")],
        endingPathTags: ["final_backup"],
      }),
      choice("b", "把原始照片交给许知晚保管", "ch06_006", {
        setFlags: ["gave_original_photo", "trusted_zhuwan_early"],
        relationshipEffects: [rel("trust_zhuwan", 10, "你把原始照片交给许知晚"), rel("courage_linzou", -5, "证据控制权离开你手中")],
        endingPathTags: ["gave_original_photo"],
      }),
      choice("c", "先删掉手机里的照片，免得周屿找到", "ch06_007", {
        setFlags: ["deleted_evidence"],
        relationshipEffects: [rel("courage_linzou", -20, "你在恐惧下删除证据")],
        endingPathTags: ["deleted_evidence"],
      }),
    ],
  });
  add(6, 5, { speaker: "陈妍", text: "收到。别逞强，我这边也会留一份。你现在可以开始拼答案了。", scene: "old_chat_memory" });
  add(6, 6, { speaker: "许知晚", text: "我会保管好。但如果只有我拿着，他一定会说这是我伪造的。", scene: "rental_room_table" });
  add(6, 7, { speaker: "旁白", text: "删除提示弹出时，林舟的指尖悬在屏幕上。雨声忽然变轻，像整个夜晚都在等她犯错。", scene: "rental_room_table" });
  add(6, 8, { speaker: "旁白", text: "门外钥匙声停了。周屿没有敲门，只发来一条消息：你还来得及。", scene: "phone_call_ui" });
  add(6, 9, { speaker: "林舟", text: "不。是他来不及了。", scene: "rental_room_table" });
  add(6, 10, { speaker: "旁白", text: "林舟把所有声音调低，只留下自己的呼吸和屏幕上的五个问题。", scene: "rental_room_table" });
  add(6, 11, { speaker: "旁白", text: "最终推理开始。每一个答案，都会决定这场雨夜如何归档。", scene: "ending_screen" });
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
  add(6, 17, { speaker: "旁白", text: "答案提交后，屏幕暗了一瞬。门外的呼吸、电话里的沉默、照片里的影子，同时收紧。", scene: "ending_screen" });
  add(6, 18, {
    type: "choice",
    scene: "ending_screen",
    speaker: "旁白",
    text: "最后一步，不是推理题。是林舟要把自己放进哪一种人生里。",
    choices: [
      choice("a", "备份所有证据，选择重启旧案", "ch06_019", {
        setFlags: ["backed_up_photo", "chose_reopen_case"],
        relationshipEffects: [rel("support_chenyan", 5, "你选择带着备份证据重启旧案"), rel("courage_linzou", 20, "你决定直面三年前的逃避")],
        endingPathTags: ["chose_reopen_case"],
      }),
      choice("b", "把原始照片交给许知晚，让她带走", "ch06_019", {
        setFlags: ["gave_original_photo"],
        relationshipEffects: [rel("trust_zhuwan", 8, "你最后选择相信许知晚保管原件")],
        endingPathTags: ["gave_original_photo"],
      }),
      choice("c", "删除照片，结束这一切", "ch06_019", {
        setFlags: ["deleted_evidence"],
        relationshipEffects: [rel("courage_linzou", -20, "你选择结束追查")],
        endingPathTags: ["deleted_evidence"],
      }),
      choice("d", "什么都不做，挂断所有电话", "ch06_019", {
        relationshipEffects: [rel("courage_linzou", -10, "你选择不再向前")],
        endingPathTags: ["avoid_truth"],
      }),
    ],
  });
  add(6, 19, { speaker: "旁白", text: "林舟按下确认。\n\n这一次，没有系统替她逃避。", scene: "ending_screen" });
  add(6, 20, { speaker: "旁白", text: "雨声退到窗外。所有选择，都开始结算。", scene: "ending_screen", visualMood: "ending", bgm: "ending_archive", ambience: "room_night_loop", resolveEnding: true, nextNodeId: null });
  nodes.ch06_019.nextNodeId = "ch06_020";

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
