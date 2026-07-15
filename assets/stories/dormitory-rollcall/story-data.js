(function () {
  "use strict";

  const nodes = {};
  const chapters = [
    { chapterId: "dorm_chapter_01", title: "第一章：00:17", order: 1 },
    { chapterId: "dorm_chapter_02", title: "第二章：第四张床", order: 2 },
    { chapterId: "dorm_chapter_03", title: "第三章：镜中的名字", order: 3 },
    { chapterId: "dorm_chapter_04", title: "第四章：319 的人", order: 4 },
    { chapterId: "dorm_chapter_05", title: "第五章：谁不在名单上", order: 5 },
    { chapterId: "dorm_chapter_06", title: "第六章：说出她的名字", order: 6 },
  ];

  const rules = [
    { ruleId: "dorm_rule_01", number: 1, text: "00:17 后，点名结束前不得离开宿舍。", status: "unverified" },
    { ruleId: "dorm_rule_02", number: 2, text: "真正的查寝者会敲三下，停两秒，再敲一下。", status: "unverified" },
    { ruleId: "dorm_rule_03", number: 3, text: "床号被叫到时，当事人保持安静，由另一人回答“已经休息”。", status: "unverified" },
    { ruleId: "dorm_rule_04", number: 4, text: "00:44 红灯亮起时闭眼十秒，不得使用手机照明。", status: "unverified" },
    { ruleId: "dorm_rule_05", number: 5, text: "有人从洗手间回来时，先查看她原来的床位；若床上有人，不得开门。", status: "unverified" },
    { ruleId: "dorm_rule_06", number: 6, text: "镜中出现陌生姓名时，不得擦去，也不得念出。", status: "unverified" },
  ];
  const hiddenRules = [
    { ruleId: "dorm_rule_correction", number: "修正", text: "以上规则只能让你活到 01:13。不要减少人数。让广播承认被删除的人，纠正名单。", status: "hidden-correction" },
  ];

  const clues = {
    dorm_clue_broadcast_recording: { clueId: "dorm_clue_broadcast_recording", title: "00:17 广播录音", category: "广播", description: "广播只念了六条公开规则，却把“交出第五人”伪装成了后来追加的命令。", isKey: true },
    dorm_clue_417_roster: { clueId: "dorm_clue_417_roster", title: "417 登记名册", category: "登记", description: "名册上只有四行名字，但今晚的 417 里明明有五个人。", isKey: true },
    dorm_clue_pre_blackout_video: { clueId: "dorm_clue_pre_blackout_video", title: "陈露的断电前视频", category: "视频", description: "断电前的画面里，417 已经站着五道身影。", isKey: true },
    dorm_clue_mirror_name: { clueId: "dorm_clue_mirror_name", title: "镜中的周婉宁", category: "镜面", description: "一条从记录里被擦掉的名字，却留在了镜子的雾气上。", isKey: true },
    dorm_clue_2014_fire_record: { clueId: "dorm_clue_2014_fire_record", title: "2014 火灾人数记录", category: "旧案", description: "官方记录写着 319，楼层图却指向相邻的 320。", isKey: true },
    dorm_clue_handwritten_rule: { clueId: "dorm_clue_handwritten_rule", title: "手写补充规则", category: "旧案", description: "手写的那一行警告：被抹去的名字必须被写回，绝不能被交出去。", isKey: true },
  };

  const defaultFlags = {
    heard_broadcast: false,
    checked_knock_pattern: false,
    protected_fourth_bed: false,
    saw_red_light: false,
    saw_mirror_name: false,
    reviewed_video: false,
    found_fire_discrepancy: false,
    understood_rule_eight_forged: false,
    trusted_correction: false,
    corrected_2014_count: false,
    corrected_417_count: false,
    witnessed_double_roster: false,
    refused_reduction: false,
    named_xutang: false,
    named_zhouwanning: false,
    sent_unregistered_downstairs: false,
    accused_wrong_person: false,
    cut_broadcast: false,
  };

  const endings = {
    dorm_ending_a: { endingId: "dorm_ending_a", title: "A 结局：补录完成", text: "你没有交出任何人。周婉宁被写回 2014 年 320 人的记录，许棠被写进 417 的第五张床。天亮前，广播第一次报出了没有删减的名单。", report: { type: "名单已更正", pathSummary: "你找齐记录、相信修正规则，并让所有人一起承认被删去的名字。" } },
    dorm_ending_b: { endingId: "dorm_ending_b", title: "B 结局：四个人的寝室", text: "你让许棠去值班室报到。天亮后，417 的名册整齐得只剩四行，第五张床也不见了。只有你还记得，她昨晚说过一句“别把我交出去”。", report: { type: "人数被缩减", pathSummary: "你接受了广播给出的最省事答案，把未登记的人交给了错误的系统。" } },
    dorm_ending_c: { endingId: "dorm_ending_c", title: "C 结局：错误的第五人", text: "你把另一位室友推到名单外。广播短暂地安静了，随后念出下一个床号。人数没有变正确，它只是换了一次要被抹掉的名字。", report: { type: "错误指认", pathSummary: "你把异常归到某个人身上，忽略了真正被篡改的是名单本身。" } },
    dorm_ending_d: { endingId: "dorm_ending_d", title: "D 结局：下一次点名", text: "你切断广播，熬到天亮。第二天 00:17，整栋楼的扬声器重新亮起。这一次，最后一条规则是用许棠自己的声音念出来的。", report: { type: "循环未止", pathSummary: "你避开了当夜的选择，却没有纠正名单；点名只会在下一晚继续。" } },
  };

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
      choiceIntent: options.choiceIntent || "谨慎调查",
      ruleUpdates: options.ruleUpdates || [],
      isCorrect: options.isCorrect === true,
      sfxOnChoice: [],
    };
  }

  function add(nodeId, data) {
    nodes[nodeId] = {
      nodeId,
      chapterId: data.chapterId,
      scene: data.scene || "dorm_417_night",
      type: data.type || "dialogue",
      speaker: data.speaker || "Narrator",
      text: data.text,
      nextNodeId: data.nextNodeId,
      choices: data.choices || [],
      question: data.question,
      bgm: data.bgm,
      ambience: data.ambience,
      gainClues: data.gainClues || [],
      setFlags: data.setFlags || [],
      ruleUpdates: data.ruleUpdates || [],
      visualCharacter: data.visualCharacter,
      characterVariant: data.characterVariant,
      characterPosition: data.characterPosition,
      characterFraming: data.characterFraming,
      characterHeadSafe: true,
      visualFocus: data.visualFocus,
      sceneHold: data.sceneHold !== false,
      transitionStyle: data.transitionStyle || "hold",
      objectiveId: data.objectiveId,
      objectiveText: data.objectiveText,
      objectiveComplete: data.objectiveComplete === true,
      investigationHotspots: data.investigationHotspots || [],
      chapterRecap: data.chapterRecap,
      resolveEnding: data.resolveEnding === true,
      audioPolicy: data.audioPolicy || { bgmMode: "keep", ambienceMode: "keep" },
      sfxOnEnter: data.sfxOnEnter || [],
      contentType: data.contentType,
      voiceEnabled: data.voiceEnabled,
      spokenText: data.spokenText,
      voiceDirection: data.voiceDirection,
    };
    if (data.nextNodeId === null) delete nodes[nodeId].nextNodeId;
  }

  add("dorm_01_001", { chapterId: "dorm_chapter_01", text: "00:17。417 的灯同时熄灭。天花板扬声器发出一声干涩的轻响。", nextNodeId: "dorm_01_002", objectiveId: "hear-the-rules", objectiveText: "确认广播究竟要宿舍做什么。", visualFocus: "speaker", sceneHold: false, transitionStyle: "fade", sfxOnEnter: [{ key: "dorm_broadcast_start", volume: 0.18, fadeInMs: 80, duckBgmMs: 260 }], investigationHotspots: [{ hotspotId: "speaker-grille", label: "扬声器", detailTitle: "广播孔", text: "灰尘堵住了孔眼，声音却像刚有人擦过一样清楚。规则来自这里，但不一定都该被服从。" }] });
  add("dorm_01_002", { chapterId: "dorm_chapter_01", speaker: "Broadcast", contentType: "broadcast", text: "零点十七分，开始点名。请遵守宿舍夜间规则。", nextNodeId: "dorm_01_003", setFlags: ["heard_broadcast"], gainClues: ["dorm_clue_broadcast_recording"], ruleUpdates: [{ ruleId: "dorm_rule_01", status: "partly-credible" }, { ruleId: "dorm_rule_02", status: "unverified" }] });
  add("dorm_01_003", { chapterId: "dorm_chapter_01", speaker: "Chen Lu", visualCharacter: "Chen Lu", text: "等一下。这里……有五个人。", nextNodeId: "dorm_01_004", visualFocus: "temporary-bed" });
  add("dorm_01_004", { chapterId: "dorm_chapter_01", text: "门外响起三下敲门声。停顿开始了。最后一下还没落下，木门上先擦过第四道声音。", nextNodeId: "dorm_01_005", visualFocus: "door", sfxOnEnter: [{ key: "dorm_knock_wood", volume: 0.26, suppressMs: 0 }, { key: "dorm_knock_wood", volume: 0.26, delayMs: 240, suppressMs: 0 }, { key: "dorm_knock_wood", volume: 0.26, delayMs: 480, suppressMs: 0 }, { key: "dorm_knock_wood", volume: 0.26, delayMs: 720, suppressMs: 0, duckBgmMs: 650 }] });
  add("dorm_01_005", { chapterId: "dorm_chapter_01", type: "choice", text: "敲门节奏不对。你怎么做？", choices: [
    choice("listen", "保持安静，数清间隔。", "dorm_01_006", { setFlags: ["checked_knock_pattern"], choiceImpactText: "你记下矛盾，没有回应门外。", ruleUpdates: [{ ruleId: "dorm_rule_02", status: "verified" }] }),
    choice("answer", "隔着门问外面是谁。", "dorm_01_006", { choiceImpactText: "走廊只用沉默回答。屋里的人听见你给了它一个声音。", ruleUpdates: [{ ruleId: "dorm_rule_02", status: "partly-credible" }] }),
  ] });
  add("dorm_01_006", { chapterId: "dorm_chapter_01", text: "扬声器开始第一次点名。林穗抓紧床栏，指节白得没有血色。", nextNodeId: "dorm_02_001", visualCharacter: "Lin Sui", objectiveComplete: true, chapterRecap: { title: "广播有规则，但门外已经违背了一条。", next: "查清宿舍的第四张床究竟藏着什么。" } });

  add("dorm_02_001", { chapterId: "dorm_chapter_02", text: "床位编号从一到四。书桌和窗之间，却摆着一张没有编号的折叠床。", nextNodeId: "dorm_02_002", objectiveId: "verify-the-count", objectiveText: "找出宿舍漏登的是谁。", visualFocus: "temporary-bed", sceneHold: false, transitionStyle: "hold", investigationHotspots: [{ hotspotId: "folding-bed", label: "折叠床", detailTitle: "第五张床", text: "床脚没有宿管贴的编号。有人只打算让它存在一个晚上。" }] });
  add("dorm_02_002", { chapterId: "dorm_chapter_02", text: "二号床被叫到时，当事人没有出声。赵晴从黑暗里回答：已经休息。", nextNodeId: "dorm_02_003", visualCharacter: "Zhao Qing", ruleUpdates: [{ ruleId: "dorm_rule_03", status: "verified" }] });
  add("dorm_02_003", { chapterId: "dorm_chapter_02", text: "夹在门上的官方名册有四个名字。折叠床上却多出一条被子。", nextNodeId: "dorm_02_004", gainClues: ["dorm_clue_417_roster"], visualFocus: "roster" });
  add("dorm_02_004", { chapterId: "dorm_chapter_02", type: "choice", text: "门外的声音自称吴阿姨。全屋都在等你决定。", choices: [
    choice("protect", "不开门，让大家继续藏好折叠床。", "dorm_02_005", { setFlags: ["protected_fourth_bed"], choiceImpactText: "无编号的床还留在宿舍的人数里。", ruleUpdates: [{ ruleId: "dorm_rule_05", status: "partly-credible" }] }),
    choice("check", "不解门链，只从猫眼确认。", "dorm_02_005", { choiceImpactText: "猫眼里只有一串钥匙，没有脸。", ruleUpdates: [{ ruleId: "dorm_rule_02", status: "contradiction" }] }),
  ] });
  add("dorm_02_005", { chapterId: "dorm_chapter_02", text: "走廊监控明明是黑的，镜头指示灯却闪了一下，正对着 417。", nextNodeId: "dorm_02_006", scene: "dorm_floor4_corridor", sceneHold: false, transitionStyle: "fade", visualFocus: "peephole" });
  add("dorm_02_006", { chapterId: "dorm_chapter_02", text: "没有人开门。屋里的第五个人依旧没有说出自己的名字。", nextNodeId: "dorm_03_001", objectiveComplete: true, chapterRecap: { title: "名册错了，但宿舍并没有空。", next: "镜子知道一个 417 没人愿意念出的名字。" } });

  add("dorm_03_001", { chapterId: "dorm_chapter_03", scene: "dorm_washroom_mirror", text: "00:44，应急灯变成红色。没人放水，洗手间的镜子却先蒙上了雾。", nextNodeId: "dorm_03_002", objectiveId: "read-the-mirror", objectiveText: "判断镜中的名字是警告，还是陷阱。", sceneHold: false, transitionStyle: "fade", visualFocus: "mirror", setFlags: ["saw_red_light"], ruleUpdates: [{ ruleId: "dorm_rule_04", status: "verified" }], investigationHotspots: [{ hotspotId: "red-light", label: "应急灯", detailTitle: "十秒红灯", text: "红灯亮起时，走廊的广播停了十秒。它不是催促你逃，而是在等谁先暴露。" }] });
  add("dorm_03_002", { chapterId: "dorm_chapter_03", text: "雾气里浮出一个名字：周婉宁。它比周围的玻璃更旧。", nextNodeId: "dorm_03_003", gainClues: ["dorm_clue_mirror_name"], setFlags: ["saw_mirror_name"], ruleUpdates: [{ ruleId: "dorm_rule_06", status: "verified" }] });
  add("dorm_03_003", { chapterId: "dorm_chapter_03", speaker: "Shen Yan", visualCharacter: "Shen Yan", text: "四号床是空的。门外不是我。别开。", nextNodeId: "dorm_03_004", sfxOnEnter: [{ key: "dorm_knock_wood", volume: 0.22, suppressMs: 0 }, { key: "dorm_knock_wood", volume: 0.22, delayMs: 240, suppressMs: 0 }, { key: "dorm_knock_wood", volume: 0.22, delayMs: 480, suppressMs: 0 }, { key: "dorm_knock_wood", volume: 0.22, delayMs: 1500, suppressMs: 0, duckBgmMs: 500 }] });
  add("dorm_03_004", { chapterId: "dorm_chapter_03", type: "choice", text: "门外的人说自己是沈妍。半开的宿舍门外，能看到她原来的床。", choices: [
    choice("verify-bed", "先确认床位，再决定要不要开门。", "dorm_03_005", { choiceImpactText: "床上有一道熟睡的人影。你没有打开洗手间门。", ruleUpdates: [{ ruleId: "dorm_rule_05", status: "verified" }] }),
    choice("open-door", "替她打开洗手间门。", "dorm_03_005", { choiceImpactText: "冷气涌进来。镜雾散开，门外却没有任何人。", ruleUpdates: [{ ruleId: "dorm_rule_05", status: "contradiction" }] }),
  ] });
  add("dorm_03_005", { chapterId: "dorm_chapter_03", text: "十秒后红灯熄灭。沈妍回到了 417，盯着一个她说从未听过的名字。", nextNodeId: "dorm_03_006", visualCharacter: "Shen Yan" });
  add("dorm_03_006", { chapterId: "dorm_chapter_03", text: "这条规则不是用来保护宿舍里的人。它只是让某个名字永远说不出口。", nextNodeId: "dorm_04_001", objectiveComplete: true, chapterRecap: { title: "周婉宁曾经被抹去过。", next: "一段视频和旧火灾记录，会告诉你抹除从哪里开始。" } });

  add("dorm_04_001", { chapterId: "dorm_chapter_04", scene: "dorm_manager_office", text: "陈露把手机贴到桌灯下。断电前的视频还停在 00:16:52。", nextNodeId: "dorm_04_002", objectiveId: "trace-the-old-case", objectiveText: "把今晚的第五人和 2014 年的记录对照。", sceneHold: false, transitionStyle: "fade", visualFocus: "phone", sfxOnEnter: [{ key: "dorm_video_phone", volume: 0.2, duckBgmMs: 220 }], investigationHotspots: [{ hotspotId: "video-timeline", label: "视频时间轴", detailTitle: "断电前的视频", text: "画面冻结前，417 里已经有五道身影。许棠不是断电后才出现的。", gainClues: ["dorm_clue_pre_blackout_video"], setFlags: ["reviewed_video"], relationshipEffects: [{ id: "support_chenlu", delta: 12, reason: "你相信陈露留下的视频。" }] }] });
  add("dorm_04_002", { chapterId: "dorm_chapter_04", speaker: "陈露", visualCharacter: "Chen Lu", text: "“我没拍到奇怪的东西。”她把进度条往前推了一格，“我拍到的是我们五个人。”", nextNodeId: "dorm_04_003" });
  add("dorm_04_003", { chapterId: "dorm_chapter_04", text: "吴阿姨的办公室没有锁。门里没有灯，档案柜最下层却漏出一条白纸边。", nextNodeId: "dorm_04_004", visualFocus: "archive" });
  add("dorm_04_004", { chapterId: "dorm_chapter_04", text: "文件夹封面写着：2014 年女生宿舍火灾。统计人数：319。", nextNodeId: "dorm_04_005", investigationHotspots: [{ hotspotId: "fire-floorplan", label: "楼层图", detailTitle: "2014 年楼层图", text: "受损房间从 319 一路标到 320。最后一间被红笔圈过，名单上却没有对应的人。", gainClues: ["dorm_clue_2014_fire_record"], setFlags: ["found_fire_discrepancy"], evidenceLinkId: "dorm_link_erasure" }] });
  add("dorm_04_005", { chapterId: "dorm_chapter_04", speaker: "吴阿姨", visualCharacter: "Manager Wu", text: "“当年报上去就是 319。”吴阿姨站在门口，钥匙串垂在手里，“少一张表，不代表少一个人。”", nextNodeId: "dorm_04_006" });
  add("dorm_04_006", { chapterId: "dorm_chapter_04", text: "她没有解释为什么档案柜里还留着一张被撕过的点名表。", nextNodeId: "dorm_04_007", visualFocus: "torn-roster" });
  add("dorm_04_007", { chapterId: "dorm_chapter_04", text: "点名表背面有一行铅笔字，笔迹被反复擦过。", nextNodeId: "dorm_04_008", sfxOnEnter: [{ key: "dorm_archive_paper", volume: 0.16 }], investigationHotspots: [{ hotspotId: "handwritten-correction", label: "手写修正", detailTitle: "被留下的修正", text: "以上规则只能让你活到 01:13。不要减少人数。让广播承认被删除的人，纠正名单。", gainClues: ["dorm_clue_handwritten_rule"], setFlags: ["understood_rule_eight_forged"], ruleUpdates: [{ ruleId: "dorm_rule_correction", status: "hidden-correction" }], evidenceLinkId: "dorm_link_forged_rule" }] });
  add("dorm_04_008", { chapterId: "dorm_chapter_04", type: "choice", text: "广播把那行字称作“未经授权的修改”。你信谁？", choices: [
    choice("trust-correction", "相信修正规则，先保住纸和视频。", "dorm_04_009", { setFlags: ["trusted_correction", "refused_reduction"], choiceIntent: "保全证据", choiceImpactText: "你拒绝把“减少人数”当成解决办法。", relationshipEffects: [{ id: "trust_linsui", delta: 16, reason: "你没有让恐惧替大家做决定。" }, { id: "support_chenlu", delta: 8, reason: "陈露把视频备份到了你的手机。" }], ruleUpdates: [{ ruleId: "dorm_rule_correction", status: "hidden-correction" }] }),
    choice("doubt-correction", "先不表态，把纸放回原处。", "dorm_04_009", { choiceIntent: "暂缓判断", choiceImpactText: "广播没有催促，像是早就知道你会犹豫。", relationshipEffects: [{ id: "trust_linsui", delta: -6, reason: "林穗不确定你会不会站在她们这一边。" }], ruleUpdates: [{ ruleId: "dorm_rule_correction", status: "contradiction" }] }),
  ] });
  add("dorm_04_009", { chapterId: "dorm_chapter_04", scene: "dorm_fire_memory_2014", speaker: "周婉宁", contentType: "recording", visualCharacter: "Zhou Wanning", text: "我在三百二十门外。等他们把我的名字念完。", nextNodeId: "dorm_04_010", sceneHold: false, transitionStyle: "fade" });
  add("dorm_04_010", { chapterId: "dorm_chapter_04", speaker: "周婉宁", visualCharacter: "Zhou Wanning", text: "“那晚不是少了一个人。”她说，“是有人把我从人数里划掉了。”", nextNodeId: "dorm_04_011" });
  add("dorm_04_011", { chapterId: "dorm_chapter_04", text: "319 和 320 的差，不是档案笔误。它第一次证明，名单可以比活着的人更有权力。", nextNodeId: "dorm_04_012", visualFocus: "fire-record" });
  add("dorm_04_012", { chapterId: "dorm_chapter_04", text: "417 的扬声器忽然换成许棠的声音：请未登记人员，前往值班室。", nextNodeId: "dorm_05_001", objectiveComplete: true, chapterRecap: { title: "2014 年被删去的是周婉宁；今晚，轮到许棠。", next: "在 01:13 前，宿舍必须决定是否把一个真实的人交给名单。" } });

  add("dorm_05_001", { chapterId: "dorm_chapter_05", text: "回到 417，四张正式床位都亮着。许棠坐在没有编号的折叠床上，没有抬头。", nextNodeId: "dorm_05_002", objectiveId: "protect-the-unlisted", objectiveText: "阻止广播把真实的人变成登记错误。", visualCharacter: "Xu Tang", visualFocus: "temporary-bed", sceneHold: false, transitionStyle: "fade" });
  add("dorm_05_002", { chapterId: "dorm_chapter_05", speaker: "许棠", visualCharacter: "Xu Tang", text: "“我只是借住一晚。”她说，“漏水修好我就走。可我现在下楼，是不是就真的回不来了？”", nextNodeId: "dorm_05_003" });
  add("dorm_05_003", { chapterId: "dorm_chapter_05", text: "门缝下塞进一张新纸。上面只写着：四人，或空白。", nextNodeId: "dorm_05_004", investigationHotspots: [{ hotspotId: "new-notice", label: "新通知", detailTitle: "被篡改的通知", text: "公开的六条规则里没有“交出第五人”。这条命令是广播自己加上的。", ruleUpdates: [{ ruleId: "dorm_rule_01", status: "contradiction" }, { ruleId: "dorm_rule_correction", status: "hidden-correction" }] }] });
  add("dorm_05_004", { chapterId: "dorm_chapter_05", type: "choice", text: "值班室的门铃正在楼下响。你对许棠说什么？", choices: [
    choice("keep-xutang", "谁也不下楼。许棠留在 417，名字先由我们记住。", "dorm_05_005", { setFlags: ["named_xutang", "refused_reduction"], choiceIntent: "保护同伴", choiceImpactText: "许棠第一次抬起头，报出了自己的全名。", relationshipEffects: [{ id: "protect_xutang", delta: 28, reason: "你没有把许棠交给广播。" }, { id: "trust_linsui", delta: 10, reason: "林穗听见你把许棠算进了宿舍。" }] }),
    choice("send-xutang", "让许棠先去值班室，至少名册会恢复正常。", "dorm_05_005", { setFlags: ["sent_unregistered_downstairs"], choiceIntent: "服从广播", choiceImpactText: "门外立刻静了下来，像是在等她独自走出去。", relationshipEffects: [{ id: "protect_xutang", delta: -30, reason: "你接受了广播给出的交换。" }], endingPathTags: ["hand-over-unlisted"] }),
  ] });
  add("dorm_05_005", { chapterId: "dorm_chapter_05", speaker: "赵晴", visualCharacter: "Zhao Qing", text: "“也许它只要一个人。”赵晴盯着门锁，“我们不能五个都耗在这里。”", nextNodeId: "dorm_05_006" });
  add("dorm_05_006", { chapterId: "dorm_chapter_05", speaker: "林穗", visualCharacter: "Lin Sui", text: "“上次也是这样。”林穗说，“先让一个人消失，再假装剩下的人都安全。”", nextNodeId: "dorm_05_007" });
  add("dorm_05_007", { chapterId: "dorm_chapter_05", text: "陈露重新播放断电前的视频。画面里，许棠已经在折叠床边整理被子。", nextNodeId: "dorm_05_008", visualCharacter: "Chen Lu", visualFocus: "phone" });
  add("dorm_05_008", { chapterId: "dorm_chapter_05", type: "choice", text: "赵晴问：周婉宁是不是当年的“第五人”？", choices: [
    choice("name-zhou", "说出周婉宁，告诉大家 320 才是当年的真实人数。", "dorm_05_009", { setFlags: ["named_zhouwanning"], choiceIntent: "纠正旧案", choiceImpactText: "赵晴没有再看门。她把钥匙递给了你。", relationshipEffects: [{ id: "trust_zhaoqing", delta: 26, reason: "你没有用另一个人替代周婉宁。" }, { id: "trust_linsui", delta: 8, reason: "林穗终于听到那个名字被完整说出。" }], endingPathTags: ["restore-erased-name"] }),
    choice("blame-shen", "说沈妍才是多出来的人，先让广播停下来。", "dorm_05_009", { setFlags: ["accused_wrong_person"], choiceIntent: "错误指认", choiceImpactText: "扬声器开始反复念沈妍的床号。她没有辩解。", relationshipEffects: [{ id: "trust_zhaoqing", delta: -18, reason: "你把恐惧落在了一个具体的人身上。" }], endingPathTags: ["wrong-fifth-person"] }),
  ] });
  add("dorm_05_009", { chapterId: "dorm_chapter_05", speaker: "广播", text: "请未登记人员，重复姓名。", nextNodeId: "dorm_05_010", visualFocus: "speaker" });
  add("dorm_05_010", { chapterId: "dorm_chapter_05", text: "许棠的声音从扬声器里传出，又从她身边传出。两个声音没有一个在发抖。", nextNodeId: "dorm_05_011" });
  add("dorm_05_011", { chapterId: "dorm_chapter_05", text: "赵晴的钥匙背面刻着一行很浅的字：广播室，四楼尽头。", nextNodeId: "dorm_05_012", sfxOnEnter: [{ key: "dorm_keys", volume: 0.16 }], investigationHotspots: [{ hotspotId: "key-engraving", label: "钥匙背面", detailTitle: "广播室钥匙", text: "钥匙不是用来打开值班室的。它一直在等有人去改那台机器。", relationshipEffects: [{ id: "support_chenlu", delta: 6, reason: "陈露决定带着视频一起去。" }] }] });
  add("dorm_05_012", { chapterId: "dorm_chapter_05", scene: "dorm_floor4_corridor", text: "走廊尽头的红灯熄灭。广播室的门自己亮了起来。", nextNodeId: "dorm_06_001", objectiveComplete: true, chapterRecap: { title: "广播想让你减少人数；证据指向了另一件事：改回名单。", next: "广播室里有两套主机，等着你决定要承认哪一份记录。" } });

  add("dorm_06_001", { chapterId: "dorm_chapter_06", scene: "dorm_broadcast_room", text: "广播室的门没有锁。桌上有两套主机，一台亮着四盏房间灯，一台亮着五盏。", nextNodeId: "dorm_06_002", objectiveId: "correct-the-roll-call", objectiveText: "让广播承认被删除的人，纠正两份名单。", sceneHold: false, transitionStyle: "fade", visualFocus: "microphone", sfxOnEnter: [{ key: "dorm_console_signal", volume: 0.16, fadeInMs: 80 }] });
  add("dorm_06_002", { chapterId: "dorm_chapter_06", text: "旧主机的卡槽里压着 2014 年的磁带，新主机的屏幕上只有 417 的四个编号。", nextNodeId: "dorm_06_003", investigationHotspots: [{ hotspotId: "dual-console", label: "两套主机", detailTitle: "两份名单", text: "旧主机缺的是周婉宁；新主机缺的是许棠。它们用同一种方式，把多出来的人变成空白。", setFlags: ["witnessed_double_roster"], relationshipEffects: [{ id: "support_chenlu", delta: 5, reason: "陈露把两段记录并排放了出来。" }] }] });
  add("dorm_06_003", { chapterId: "dorm_chapter_06", type: "deduction", text: "第一步：那条“交出第五人”的命令，真正想做什么？", nextNodeId: "dorm_06_004", question: { prompt: "伪造命令的作用是？", choices: [
    choice("rule-delete", "把未登记的人单独送走，再从名单和记忆里删掉。", "dorm_06_004", { isCorrect: true, choiceIntent: "识别机制", choiceImpactText: "你看见了广播真正保护的不是人，而是整齐的表格。" }),
    choice("rule-protect", "把第五个人送到安全的值班室。", "dorm_06_004", { choiceIntent: "误信命令", choiceImpactText: "值班室的灯仍亮着，却没有任何人的回应。" }),
    choice("rule-punish", "惩罚没有遵守敲门规则的人。", "dorm_06_004", { choiceIntent: "错误归因", choiceImpactText: "敲门声早已停了，名单却还在索要一个人。" }),
  ] } });
  add("dorm_06_004", { chapterId: "dorm_chapter_06", type: "deduction", text: "第二步：你要提交的真实人数是什么？", nextNodeId: "dorm_06_005", question: { prompt: "两份记录应如何被更正？", choices: [
    choice("count-correct", "2014 年为 320 人；今晚 417 为五人。", "dorm_06_005", { isCorrect: true, setFlags: ["corrected_2014_count"], choiceIntent: "纠正人数", choiceImpactText: "旧主机的一盏灰灯重新亮了。" }),
    choice("count-319", "2014 年 319 人；今晚 417 四人。", "dorm_06_005", { choiceIntent: "服从档案", choiceImpactText: "新主机立刻显示“人数匹配”。" }),
    choice("count-unknown", "人数无法确认，先把两份档案封存。", "dorm_06_005", { choiceIntent: "回避判断", choiceImpactText: "屏幕继续倒计时，像没有听见你。" }),
  ] } });
  add("dorm_06_005", { chapterId: "dorm_chapter_06", speaker: "沈妍", visualCharacter: "Shen Yan", text: "“念名字之前，”沈妍说，“先决定我们是不是每个人都愿意站在这里。”", nextNodeId: "dorm_06_006" });
  add("dorm_06_006", { chapterId: "dorm_chapter_06", text: "林穗握住许棠的手。赵晴站到麦克风另一边。陈露把视频的音量调到最大。", nextNodeId: "dorm_06_007", visualCharacter: "Lin Sui" });
  add("dorm_06_007", { chapterId: "dorm_chapter_06", type: "choice", text: "麦克风接通。你要提交哪一份名单？", sfxOnEnter: [{ key: "dorm_record_tension", volume: 0.14, duckBgmMs: 380 }], choices: [
    choice("submit-correction", "补录周婉宁与许棠，提交 320 人与 417 五人。", "dorm_06_008", { setFlags: ["corrected_417_count", "named_xutang", "named_zhouwanning"], choiceIntent: "补录名单", choiceImpactText: "你没有要求任何人离开。两份名单第一次同时出现了空白以外的答案。", endingPathTags: ["correct-record"] }),
    choice("submit-four", "确认 417 只有四名登记住户。", "dorm_06_008", { setFlags: ["sent_unregistered_downstairs"], choiceIntent: "缩减人数", choiceImpactText: "新主机先给出通过提示，旧主机却沉默得更久。", endingPathTags: ["confirm-four"] }),
    choice("submit-cut", "拔掉主机电源，谁的名字都不再念。", "dorm_06_008", { setFlags: ["cut_broadcast"], choiceIntent: "切断广播", choiceImpactText: "黑暗吞掉了灯，也吞掉了还没来得及被纠正的名字。", endingPathTags: ["cut-broadcast"] }),
  ] });
  add("dorm_06_008", { chapterId: "dorm_chapter_06", scene: "dorm_ending_archive", text: "录音带转到尽头。两台主机都在等一声最终确认。", nextNodeId: "dorm_06_009", sceneHold: false, transitionStyle: "fade" });
  add("dorm_06_009", { chapterId: "dorm_chapter_06", text: "你听见自己的声音从扬声器里传出来。它不是命令，只是在读一份本该存在的名单。", nextNodeId: "dorm_06_010" });
  add("dorm_06_010", { chapterId: "dorm_chapter_06", type: "choice", text: "最后一次确认。", choices: [
    choice("confirm-record", "确认提交。", "dorm_06_011", { choiceIntent: "确认归档", choiceImpactText: "广播开始归档你今晚做出的判断。" }),
    choice("withdraw-record", "撤回，离开广播室。", "dorm_06_011", { setFlags: ["cut_broadcast"], choiceIntent: "放弃纠正", choiceImpactText: "你没有按下确认，倒计时却没有停止。" }),
  ] });
  add("dorm_06_011", { chapterId: "dorm_chapter_06", scene: "dorm_outside_dawn", text: "天快亮了。宿舍楼的窗户一格一格变白，只有扬声器还留着一点余温。", nextNodeId: "dorm_06_012", sceneHold: false, transitionStyle: "fade" });
  add("dorm_06_012", { chapterId: "dorm_chapter_06", type: "ending", text: "名单终于等到了回答。", nextNodeId: null, resolveEnding: true, objectiveComplete: true });

  const chapterBeats = {
    dorm_chapter_01: { question: "广播为什么只在 00:17 启动？", confirmedFact: "广播给出的规则并不完全可信。", newQuestion: "417 里为什么会有第五个人？", investigationNodeIds: ["dorm_01_001"], choiceNodeIds: ["dorm_01_005"], hook: "第一次点名即将开始。" },
    dorm_chapter_02: { question: "没有编号的折叠床属于谁？", confirmedFact: "官方名册只有四人，现场却有五人。", newQuestion: "门外自称吴阿姨的声音是谁？", investigationNodeIds: ["dorm_02_001"], choiceNodeIds: ["dorm_02_004"], hook: "镜子里留下了一个旧名字。" },
    dorm_chapter_03: { question: "周婉宁是谁？", confirmedFact: "镜中的名字来自一条被擦掉的记录。", newQuestion: "为什么规则要求不能念出她？", investigationNodeIds: ["dorm_03_001"], choiceNodeIds: ["dorm_03_004"], hook: "旧火灾记录出现了人数差。" },
    dorm_chapter_04: { question: "319 与 320 的差额从哪里来？", confirmedFact: "周婉宁曾被从火灾记录中删除。", newQuestion: "广播为什么开始索要许棠？", investigationNodeIds: ["dorm_04_001", "dorm_04_004", "dorm_04_007"], choiceNodeIds: ["dorm_04_008"], hook: "许棠的声音出现在扬声器里。" },
    dorm_chapter_05: { question: "许棠是错误，还是名单的受害者？", confirmedFact: "“交出第五人”不在六条公开规则里。", newQuestion: "谁会在压力下替广播完成删减？", investigationNodeIds: ["dorm_05_003", "dorm_05_011"], choiceNodeIds: ["dorm_05_004", "dorm_05_008"], hook: "两套广播主机正在等一份最终名单。" },
    dorm_chapter_06: { question: "怎样让广播停止删人？", confirmedFact: "两套系统用相同的机制抹除了周婉宁和许棠。", newQuestion: "同伴能否一起承认被删除的人？", investigationNodeIds: ["dorm_06_002"], choiceNodeIds: ["dorm_06_007", "dorm_06_010"], hook: "名单将在天亮前归档。" },
  };

  const rulePlaybook = {
    dorm_rule_01: { firstNodeId: "dorm_01_002", initialStatus: "未验证", verificationNodeId: "dorm_01_006", contradictionNodeId: "dorm_05_003", clueIds: ["dorm_clue_broadcast_recording", "dorm_clue_handwritten_rule"], playerJudgment: "留在宿舍是暂时安全策略，不等于服从广播的一切命令。", finalTruth: "基本可信，但被广播拿来制造封闭感。", endingImpact: "若把“不得离开”理解成必须交人，会走向 B 或 D。" },
    dorm_rule_02: { firstNodeId: "dorm_01_004", initialStatus: "未验证", verificationNodeId: "dorm_01_005", contradictionNodeId: "dorm_02_004", clueIds: ["dorm_clue_broadcast_recording", "dorm_clue_417_roster"], playerJudgment: "节奏是辨认门外伪装的证据，不是开门许可。", finalTruth: "基本可信。", endingImpact: "错误回应会削弱对广播与走廊的判断，不直接决定结局。" },
    dorm_rule_03: { firstNodeId: "dorm_01_006", initialStatus: "未验证", verificationNodeId: "dorm_02_002", contradictionNodeId: "dorm_05_009", clueIds: ["dorm_clue_417_roster", "dorm_clue_pre_blackout_video"], playerJudgment: "规则只覆盖编号床位，恰好暴露了折叠床没有位置。", finalTruth: "基本可信，但故意回避未登记者。", endingImpact: "看见它的盲区，才能拒绝把许棠变成空白。" },
    dorm_rule_04: { firstNodeId: "dorm_03_001", initialStatus: "未验证", verificationNodeId: "dorm_03_001", contradictionNodeId: "dorm_04_012", clueIds: ["dorm_clue_mirror_name", "dorm_clue_handwritten_rule"], playerJudgment: "红灯要求闭眼，是为了让人错过被删除的声音。", finalTruth: "存在矛盾；它延缓危险，却阻止调查。", endingImpact: "若只求熬过红灯，会错过修正规则的方向。" },
    dorm_rule_05: { firstNodeId: "dorm_03_003", initialStatus: "未验证", verificationNodeId: "dorm_03_004", contradictionNodeId: "dorm_03_005", clueIds: ["dorm_clue_mirror_name", "dorm_clue_417_roster"], playerJudgment: "先看床位能避免开错门，但床位本身可能被记录篡改。", finalTruth: "基本可信，不能单独作为身份判断。", endingImpact: "它训练玩家先核对现场，再给他人下结论。" },
    dorm_rule_06: { firstNodeId: "dorm_03_002", initialStatus: "未验证", verificationNodeId: "dorm_03_002", contradictionNodeId: "dorm_05_008", clueIds: ["dorm_clue_mirror_name", "dorm_clue_2014_fire_record"], playerJudgment: "不念陌生名字保护了当下，却让周婉宁继续被抹去。", finalTruth: "确认伪造；最终必须被修正规则推翻。", endingImpact: "A 结局必须主动念出周婉宁的名字。" },
    dorm_rule_correction: { firstNodeId: "dorm_04_007", initialStatus: "隐藏修正", verificationNodeId: "dorm_06_002", contradictionNodeId: "dorm_06_007", clueIds: ["dorm_clue_handwritten_rule", "dorm_clue_2014_fire_record", "dorm_clue_pre_blackout_video"], playerJudgment: "不减少人数，让广播承认被删去的人。", finalTruth: "hidden-correction", endingImpact: "A 结局的必要条件；不信或不执行只能走向 B、C 或 D。" },
  };

  const routePlans = {
    a: {
      hotspots: ["dorm_04_001/video-timeline", "dorm_04_004/fire-floorplan", "dorm_04_007/handwritten-correction", "dorm_05_003/new-notice", "dorm_05_011/key-engraving", "dorm_06_002/dual-console"],
      choices: { dorm_01_005: "listen", dorm_02_004: "protect", dorm_03_004: "verify-bed", dorm_04_008: "trust-correction", dorm_05_004: "keep-xutang", dorm_05_008: "name-zhou", dorm_06_003: "rule-delete", dorm_06_004: "count-correct", dorm_06_007: "submit-correction", dorm_06_010: "confirm-record" },
    },
    b: {
      hotspots: ["dorm_04_001/video-timeline", "dorm_04_004/fire-floorplan", "dorm_04_007/handwritten-correction"],
      choices: { dorm_01_005: "listen", dorm_02_004: "protect", dorm_03_004: "verify-bed", dorm_04_008: "trust-correction", dorm_05_004: "send-xutang", dorm_05_008: "name-zhou", dorm_06_003: "rule-delete", dorm_06_004: "count-correct", dorm_06_007: "submit-four", dorm_06_010: "confirm-record" },
    },
    c: {
      hotspots: ["dorm_04_001/video-timeline", "dorm_04_004/fire-floorplan", "dorm_04_007/handwritten-correction"],
      choices: { dorm_01_005: "listen", dorm_02_004: "protect", dorm_03_004: "verify-bed", dorm_04_008: "trust-correction", dorm_05_004: "keep-xutang", dorm_05_008: "blame-shen", dorm_06_003: "rule-delete", dorm_06_004: "count-correct", dorm_06_007: "submit-correction", dorm_06_010: "confirm-record" },
    },
    d: {
      hotspots: ["dorm_04_001/video-timeline", "dorm_04_004/fire-floorplan", "dorm_04_007/handwritten-correction"],
      choices: { dorm_01_005: "listen", dorm_02_004: "protect", dorm_03_004: "verify-bed", dorm_04_008: "trust-correction", dorm_05_004: "keep-xutang", dorm_05_008: "name-zhou", dorm_06_003: "rule-delete", dorm_06_004: "count-correct", dorm_06_007: "submit-cut", dorm_06_010: "withdraw-record" },
    },
  };

  const narratorSpeakers = new Set(["Narrator", "旁白"]);
  const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);

  function contentTypeFor(node, speaker, forceNarration = false) {
    if (node.type === "choice" || node.type === "deduction") return "system";
    if (forceNarration || narratorSpeakers.has(speaker)) return "narration";
    if (speaker === "Broadcast" || speaker === "广播") return "broadcast";
    return node.contentType || "dialogue";
  }

  function performanceDirection(node, contentType, speaker) {
    if (!audibleTypes.has(contentType)) return "";
    if (contentType === "broadcast") return "制度化、平静、准确，越危险越正常；不要鬼声、耳语或夸张电流。";
    if (contentType === "recording") return "像来自旧记录的真实年轻女声，疲惫、克制、带恐惧；不要鬼叫。";
    const chapter = Number(String(node.chapterId || "").slice(-2)) || 1;
    const stage = chapter <= 2 ? "异常初现，疑惑里带一点不安。" : chapter <= 4 ? "异常确认后更谨慎，停顿更多但不故意颤抖。" : "真相逼近，疲惫、害怕且必须决定，短句清楚。";
    const roles = {
      "陈露": "起初用轻快压住紧张，发现异常后说得更快又不敢说完。",
      "Chen Lu": "起初用轻快压住紧张，发现异常后说得更快又不敢说完。",
      "许棠": "害怕但努力让自己说清楚；后期有克制的勇气，不是哭腔。",
      "林穗": "温和、保护人；害怕时更谨慎、反复确认，决定相信前能听见挣扎。",
      "赵晴": "习惯用秩序自救；压力很强但不是恶毒反派。",
      "沈妍": "平时安静、语速偏慢；真正害怕时失去原有平静。",
      "Shen Yan": "平时安静、语速偏慢；真正害怕时失去原有平静。",
      "吴阿姨": "直接的宿管口吻；提到旧案时有长期压住的愧疚。",
      "周婉宁": "来自过去的真实记录，年轻、疲惫、恐惧但不演成鬼声。",
    };
    return `${roles[speaker] || "像现场交流，不像朗读。"}${stage}`;
  }

  function semanticFragmentsFor(node) {
    const text = String(node.text || "").trim();
    if (narratorSpeakers.has(node.speaker) || node.type === "choice" || node.type === "deduction" || !/[“”]/.test(text)) {
      return [{ text, speaker: node.speaker || "Narrator", forceNarration: narratorSpeakers.has(node.speaker) }];
    }
    const fragments = [];
    const quote = /“([^”]+)”/g;
    let cursor = 0;
    let match;
    while ((match = quote.exec(text))) {
      const narration = text.slice(cursor, match.index).replace(/[，、]\s*$/, "").trim();
      if (narration) fragments.push({ text: narration, speaker: "Narrator", forceNarration: true });
      fragments.push({ text: match[1].trim(), speaker: node.speaker, forceNarration: false });
      cursor = match.index + match[0].length;
    }
    const tail = text.slice(cursor).replace(/^[，、]\s*/, "").trim();
    if (tail) fragments.push({ text: tail, speaker: "Narrator", forceNarration: true });
    return fragments.length ? fragments : [{ text, speaker: node.speaker, forceNarration: false }];
  }

  function normaliseDialogueNodes() {
    const expanded = {};
    Object.values(nodes).forEach((node) => {
      const fragments = semanticFragmentsFor(node);
      const ids = fragments.slice(1).map((_, index) => `${node.nodeId}__beat${String(index + 2).padStart(2, "0")}`);
      const apply = (base, fragment, nodeId, nextNodeId, derived) => {
        const contentType = contentTypeFor(node, fragment.speaker, fragment.forceNarration);
        return {
          ...base,
          nodeId,
          nextNodeId,
          speaker: contentType === "narration" ? "Narrator" : fragment.speaker,
          text: fragment.text,
          contentType,
          voiceEnabled: audibleTypes.has(contentType),
          spokenText: audibleTypes.has(contentType) ? fragment.text : undefined,
          voiceDirection: performanceDirection(node, contentType, fragment.speaker),
          ...(derived ? {
            gainClues: [], setFlags: [], choices: [], ruleUpdates: [], objectiveId: undefined, objectiveText: undefined,
            objectiveComplete: false, investigationHotspots: [], chapterRecap: undefined, sfxOnEnter: [],
            sceneHold: true, transitionStyle: "hold", resolveEnding: false,
          } : {}),
        };
      };
      const originalNext = node.nextNodeId;
      expanded[node.nodeId] = apply(node, fragments[0], node.nodeId, ids[0] || originalNext, false);
      ids.forEach((id, index) => {
        expanded[id] = apply(node, fragments[index + 1], id, ids[index + 1] || originalNext, true);
      });
      if (originalNext === undefined && !ids.length) delete expanded[node.nodeId].nextNodeId;
    });
    Object.keys(nodes).forEach((id) => delete nodes[id]);
    Object.assign(nodes, expanded);
  }

  normaliseDialogueNodes();

  window.MIST_DORMITORY_DATA = {
    schemaVersion: "1.0",
    script: {
      scriptId: "script_dormitory_rollcall",
      seriesId: "series_dormitory_rollcall",
      title: "熄灯后，请勿点名",
      status: "open",
      order: 2,
      startNodeId: "dorm_01_001",
      summary: "00:17，五人宿舍收到了只为四个人写下的规则。最安全的答案，未必是让人数看起来正确的答案。",
    },
    series: {
      seriesId: "series_dormitory_rollcall",
      title: "宿舍规则怪谈",
      status: "open",
      summary: "417 多出一张临时床。广播要求宿舍交出那个不该存在的人。",
      scriptIds: ["script_dormitory_rollcall"],
    },
    chapters,
    rules,
    hiddenRules,
    chapterBeats,
    rulePlaybook,
    routePlans,
    audioProduction: {
      status: "volcengine-generated-awaiting-listening-signoff",
      broadcastVoiceStatus: "volcengine-generated-awaiting-listening-signoff",
      broadcastVoiceSource: "Volcengine Doubao Voice Synthesis Model 2.0 HTTP unidirectional API; generated with project-owned API key and seed-tts-2.0 resource.",
      broadcastVoiceLicense: "account-authorised synthesis for project runtime; public and commercial distribution allowed by the project owner, pending manual listening sign-off before release",
      broadcastVoiceNote: "正式广播已由授权的 Volcengine Doubao TTS 2.0 生成并接入 voice manifest。当前不使用浏览器朗读、未授权回退或旧供应商文件作为运行时替代；发布仍需耳机、桌面外放、手机外放、广播节奏、移动端通关、双故事存读档、雨夜回归、后台恢复和控制台无错误的人工签核。",
      approvedCuePolicy: "只有明确动作使用拟音；无准确来源时保持静默。",
      headphoneListeningSignoff: "pending",
      desktopSpeakerListeningSignoff: "pending",
      phoneSpeakerListeningSignoff: "pending",
      broadcastCadenceSignoff: "pending",
      crossStorySaveSignoff: "pending",
      dormitoryMobilePlaythroughSignoff: "pending",
      rainCallRegressionSignoff: "pending",
      mobileBackgroundRestoreSignoff: "pending",
      consoleErrorSignoff: "pending",
    },
    clues,
    defaultFlags,
    endings,
    nodes,
    profile: {
      coreClueIds: Object.keys(clues),
      relationshipDefs: [
        { id: "trust_linsui", character: "林穗", label: "信任", levels: ["疏离", "倾听", "同意", "托付"] },
        { id: "trust_zhaoqing", character: "赵晴", label: "信任", levels: ["疏离", "观望", "同意", "托付"] },
        { id: "support_chenlu", character: "陈露", label: "协作", levels: ["犹豫", "帮忙", "投入", "共同承担"] },
        { id: "protect_xutang", character: "许棠", label: "保护", levels: ["不确定", "被看见", "被保护", "被补录"] },
      ],
      deductionTotal: 2,
      evidenceLinks: [
        { linkId: "dorm_link_count", title: "417 名册 + 断电前视频", clueIds: ["dorm_clue_417_roster", "dorm_clue_pre_blackout_video"] },
        { linkId: "dorm_link_erasure", title: "镜中姓名 + 2014 火灾记录", clueIds: ["dorm_clue_mirror_name", "dorm_clue_2014_fire_record"] },
        { linkId: "dorm_link_forged_rule", title: "广播录音 + 手写修正规则", clueIds: ["dorm_clue_broadcast_recording", "dorm_clue_handwritten_rule"] },
      ],
      endingResolver(state) {
        if (state.flags.cut_broadcast) return "dorm_ending_d";
        if (state.flags.accused_wrong_person) return "dorm_ending_c";
        if (state.flags.sent_unregistered_downstairs) return "dorm_ending_b";
        const allClues = Object.keys(clues).every((id) => state.clues.includes(id));
        const relationships = state.relationships || {};
        const hasCompanionTrust = Number(relationships.trust_linsui || 0) >= 20
          && Number(relationships.trust_zhaoqing || 0) >= 15
          && Number(relationships.support_chenlu || 0) >= 15
          && Number(relationships.protect_xutang || 0) >= 20;
        if (
          allClues
          && hasCompanionTrust
          && state.flags.trusted_correction
          && state.flags.corrected_2014_count
          && state.flags.corrected_417_count
          && state.flags.named_xutang
          && state.flags.named_zhouwanning
        ) return "dorm_ending_a";
        return "dorm_ending_d";
      },
    },
  };
})();
