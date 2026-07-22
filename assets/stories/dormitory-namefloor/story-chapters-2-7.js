(function () {
  "use strict";

  const base = window.MIST_DORMITORY_NAMEFLOOR_DATA || {};
  const nodes = {};
  const decisionRegistry = [];
  const expansionFlagIds = new Set();
  const audibleContentTypes = new Set(["dialogue", "world-audio", "door-voice", "phone-call", "recording", "broadcast"]);

  const chapterIds = {
    2: "namefloor_chapter_02",
    3: "namefloor_chapter_03",
    4: "namefloor_chapter_04",
    5: "namefloor_chapter_05",
    6: "namefloor_chapter_06",
    7: "namefloor_chapter_07",
  };

  function normalizeNode(node) {
    const isNarrator = !node.speaker || node.speaker === "旁白";
    const isSilentChoice = isNarrator && (node.type === "choice" || node.type === "deduction" || Array.isArray(node.choices));
    const contentType = node.contentType || (node.type === "phone-interaction" || (isNarrator && node.phoneScreen) ? "phone-text" : isSilentChoice ? "system" : !isNarrator ? "dialogue" : "narration");
    const voiceEnabled = audibleContentTypes.has(contentType);
    return {
      feedbackMode: "none",
      ...node,
      contentType,
      voiceEnabled,
      ...(voiceEnabled ? {
        spokenText: node.spokenText || node.text,
        voiceSource: node.voiceSource || node.speaker,
      } : {}),
    };
  }

  function add(node) {
    nodes[node.nodeId] = normalizeNode(node);
  }

  function line(nodeId, chapterId, scene, speaker, text, nextNodeId, extra = {}) {
    add({ nodeId, chapterId, scene, speaker, text, nextNodeId, ...extra });
  }

  function option(key, text, result, extra = {}) {
    return { key, text, result, ...extra };
  }

  function mutationFields(entry, decisionCode) {
    const setFlags = [`${decisionCode.toLowerCase()}_${entry.key.toLowerCase()}`, ...(entry.flags || [])];
    setFlags.forEach((flagId) => expansionFlagIds.add(flagId));
    const state = entry.state || {};
    return {
      setFlags,
      ...(entry.clues?.length ? { gainClues: entry.clues } : {}),
      ...(entry.relationships?.length ? { relationshipEffects: entry.relationships } : {}),
      ...(Object.keys(state).length ? {
        stateUpdates: Object.entries(state).map(([key, value]) => ({ key, value })),
        storyState: { ...state },
      } : {}),
      delayedConsequences: entry.delayed || [],
    };
  }

  function decision(config) {
    const choices = config.options.map((entry) => {
      const choiceId = `${config.code.toLowerCase()}_${entry.key.toLowerCase()}`;
      const resultNodeId = `${config.nodeId}_${entry.key.toLowerCase()}`;
      add({
        nodeId: resultNodeId,
        chapterId: config.chapterId,
        scene: config.scene,
        blueprintSceneId: config.blueprintSceneId,
        speaker: "旁白",
        text: entry.result,
        nextNodeId: config.nextNodeId,
        delayedConsequenceText: entry.delayedText || "这个决定会在后面的身份核验中留下痕迹。",
      });
      return {
        choiceId,
        text: entry.text,
        nextNodeId: resultNodeId,
        feedbackMode: "none",
        ...(entry.timeoutOnly ? { timeoutOnly: true } : {}),
        ...mutationFields(entry, config.code),
      };
    });

    decisionRegistry.push({
      code: config.code,
      nodeId: config.nodeId,
      defaultChoiceId: `${config.code.toLowerCase()}_${(config.defaultKey || config.options[0].key).toLowerCase()}`,
    });

    add({
      nodeId: config.nodeId,
      chapterId: config.chapterId,
      scene: config.scene,
      blueprintSceneId: config.blueprintSceneId,
      speaker: config.speaker || "旁白",
      text: config.text,
      type: "choice",
      contentType: config.contentType,
      choices,
      ...(config.phoneScreen ? { phoneScreen: config.phoneScreen } : {}),
      ...(config.effectTags ? { effectTags: config.effectTags } : {}),
      ...(config.effects ? { effects: config.effects } : {}),
      ...(config.durationMs ? {
        timedChoice: {
          durationMs: config.durationMs,
          fallbackChoiceId: `${config.code.toLowerCase()}_${config.fallbackKey.toLowerCase()}`,
        },
      } : {}),
      ...(config.extra || {}),
    });
  }

  const clue = (number) => `namefloor_clue_k${String(number).padStart(2, "0")}`;
  const trust = (id, delta, reason) => ({ id, delta, reason });
  const studentRuleCards = (base.rules || []).map((rule) => ({ ...rule }));
  const managerRuleCards = [
    { ruleId: "namefloor_manager_rule_inspection", number: 1, title: "一点至三点查房", text: "每天一点至三点是查房时间，请穿绿色马甲查房。", status: "canonical" },
    { ruleId: "namefloor_manager_rule_outside_student", number: 2, title: "不与逗留学生交谈", text: "如遇在外逗留的学生，请不要与他说话，立即回到宿舍。", status: "canonical" },
    { ruleId: "namefloor_manager_rule_feather", number: 3, title: "递交左抽屉羽毛", text: "如果有学生来到宿管宿舍，请将左侧抽屉里的羽毛递给他，并让他立即前往四楼。", status: "canonical" },
    { ruleId: "namefloor_manager_rule_red_vest", number: 4, title: "避开红色马甲", text: "我校宿管一律身着绿色马甲。如看到红色马甲，请不要与其对视，立即回到宿舍。", status: "canonical" },
    { ruleId: "namefloor_manager_rule_no_four", number: 5, title: "没有四楼", text: "我校宿舍楼没有四楼。", status: "canonical" },
    { ruleId: "namefloor_manager_rule_window", number: 6, title: "三楼窗外只有天空", text: "宿管宿舍位于三楼，所以窗外只能看到天空。如果看到其他东西，那一定是幻觉。", status: "canonical" },
    { ruleId: "namefloor_manager_rule_missing_roster", number: 7, title: "名单消失时前往校长室", text: "桌子左侧放着学生名单。如果学生名单突然消失，请立即前往校长室，在那里可以得到解决办法。", status: "canonical", note: "我校宿管聘用制度为三年一次，请务必严格遵守安全守则，从而保障您的安全。" },
  ];

  function phoneScreen({ kind = "system", view = "system", title, time, battery = 56, signal = "weak", messages = [], members = [], rules = [], actions = [], systemNotice = "", extra = {} } = {}) {
    return {
      kind,
      view,
      title,
      time,
      battery,
      signal,
      messages,
      members,
      rules,
      actions,
      systemNotice,
      ...extra,
    };
  }

  const chapterOneEnd = base.nodes?.nf01_040 || {
    nodeId: "nf01_040",
    chapterId: "namefloor_chapter_01",
    scene: "namefloor_floor_four",
    speaker: "旁白",
    text: "楼梯平台亮起一个本不该存在的数字。",
  };
  add({
    ...chapterOneEnd,
    nodeId: "nf01_040",
    chapterId: "namefloor_chapter_01",
    blueprintSceneId: "DR-C1-S10",
    nextNodeId: "nf02_001",
    namePollutionHistory: [
      { stage: 1, visibleCarrier: "通讯录中的姓名第一次缺字" },
      { stage: 2, visibleCarrier: "班群成员位置被黑色头像占据，人数仍是四十二" },
    ],
    chapterEnding: {
      title: "第一章结束",
      subtitle: "下一章：门外的人",
      cta: "进入三楼宿管宿舍",
      nextNodeId: "nf02_001",
    },
  });

  line("nf02_001", chapterIds[2], "namefloor_stair_echo", "旁白", "数字“4”在身后熄灭。林峰、周朝阳和谷雨沿着湿冷的楼梯退到三楼，宿管宿舍的门半掩着，门缝里没有人声。", "nf02_c12_enter", { blueprintSceneId: "DR-C2-S01", effectTags: ["time-jump", "name-headache"], effects: [{ type: "signal-glitch", durationMs: 900, intensity: 0.34 }] });
  decision({
    code: "C12A", nodeId: "nf02_c12_enter", chapterId: chapterIds[2], scene: "namefloor_manager_threshold", blueprintSceneId: "DR-C2-S01",
    text: "红马甲的脚步停在楼梯转角，没有继续靠近。半掩的门后很安静，安静得像有人特意空出一间房给他们进去。",
    nextNodeId: "nf02_c12_door", defaultKey: "B",
    options: [
      option("A", "立刻进入宿管宿舍", "三个人冲进门内。桌上的搪瓷杯还有余温，床边却没有鞋，像住在这里的人刚刚被整间房间删除。", { flags: ["entered_manager_room_fast"], state: { managerRoomEntry: "fast", zhouTrustSignal: "urgent" } }),
      option("B", "先让周朝阳确认门槛", "周朝阳把笔尖探过门缝，墨水没有变色。谷雨低声数楼层，确认他们确实停在三楼。", { flags: ["tested_manager_room_threshold"], state: { managerRoomEntry: "tested", zhouTrustSignal: "methodical" }, clues: [clue(8)], relationships: [trust("trust_zhouchaoyang", 5, "先确认安全区边界")] }),
      option("C", "留在门外听十秒", "十秒里，楼梯下方每一盏灯都暗了一次。没有人追上来，反而像是在等他们错过进入的时机。", { flags: ["waited_outside_manager_room"], state: { managerRoomEntry: "delayed", namePollutionStage: 2 } }),
      option("D", "先处理林峰的头痛和手伤", "谷雨把林峰按在门边，确认他还能说出自己的姓。处理伤口耽误了几秒，却让他的呼吸没有立刻断档。", { flags: ["treated_linfeng_before_entry"], state: { managerRoomEntry: "treated", guyuRemembersLinfeng: true }, relationships: [trust("trust_guyu", 5, "先确认林峰的状态")] }),
    ],
  });
  decision({
    code: "C12B", nodeId: "nf02_c12_door", chapterId: chapterIds[2], scene: "namefloor_manager_room", blueprintSceneId: "DR-C2-S01",
    text: "进门后，现实时间停在 01:18，手机却跳到 03:30。门可以合上，但锁舌每次都会差半指。",
    nextNodeId: "nf02_c13", defaultKey: "C",
    phoneScreen: phoneScreen({
      kind: "system", view: "message", title: "时间校准失败", time: "03:30", signal: "none",
      systemNotice: "现实墙钟 01:18；手机系统 03:30；宿舍群显示 42 人。",
      messages: [
        { sender: "系统", text: "网络时间不可用，已使用本机时间。" },
        { sender: "宿舍群", text: "群成员列表刷新失败：林峰所在位置无头像。", side: "other" },
      ],
    }),
    options: [
      option("A", "用椅子顶住门", "椅背卡住门缝，门外脚步声不再靠近，锁舌却仍悬在半指之外。", { flags: ["barricaded_manager_room"], state: { managerDoorState: "barricaded", managerRulesTrust: "door-untestable" } }),
      option("B", "强行把门完全关上", "门缝闭合的一瞬，屋内灯光暗到只剩手机屏。周朝阳马上让所有人离开门轴。", { flags: ["forced_manager_room_door"], state: { managerDoorState: "forced", namePollutionStage: 2 }, relationships: [trust("trust_zhouchaoyang", -3, "强行触碰不稳定门锁")] }),
      option("C", "保持半掩，只遮住姓名载体", "他们没有挑战那道差半指的缝，只把名册和亮屏翻扣。门外脚步失去方向，慢慢退回楼梯。", { flags: ["kept_manager_room_door_ajar"], state: { managerDoorState: "ajar", managerRulesTrust: "partially-tested" }, clues: [clue(8)] }),
      option("D", "开启飞行模式再搜索", "飞行模式亮起，手机时间仍旧不动。黑色头像的撤回红点却在无网络状态下闪了一次。", { flags: ["airplane_mode_time_anomaly"], state: { managerDoorState: "ajar", blackAvatarStage: "networkless-pulse" }, clues: [clue(1), clue(9)] }),
    ],
  });
  decision({
    code: "C13", nodeId: "nf02_c13", chapterId: chapterIds[2], scene: "namefloor_stair_echo", blueprintSceneId: "DR-C2-S01",
    text: "周朝阳盯着林峰的嘴：“说一遍。你叫什么？”那个熟悉的名字卡成了两截。",
    nextNodeId: "nf02_010", durationMs: 4000, fallbackKey: "E", defaultKey: "B",
    options: [
      option("A", "完整说出“林峰”", "名字落地的一瞬，眩晕退开了。下一秒，整条走廊都用他的声音复述：“林峰。”", { flags: ["lin_full_name_echoed"], state: { namePollutionStage: 2 }, clues: [clue(9)] }),
      option("B", "让周朝阳写在纸上", "周朝阳没有让他再开口，只在笔记角落写下“林峰”。墨迹没有跟着灯光闪烁。", { flags: ["zhou_paper_name_anchor"], state: { namePollutionStage: 1 }, clues: [clue(5), clue(9)], relationships: [trust("trust_zhouchaoyang", 8, "用纸质姓名锚共同核验")] }),
      option("C", "只说“峰”", "姓氏被留在喉咙里。走廊没有回声，周朝阳却把这次残缺也记进了时间线。", { flags: ["lin_partial_name_anchor"], clues: [clue(9)] }),
      option("D", "让谷雨替自己回答", "谷雨几乎没有停顿：“林峰。我们宿舍的林峰。”那句话把他从楼梯的黑暗里拽回了一步。", { flags: ["guyu_spoken_name_anchor"], state: { namePollutionStage: 1 }, relationships: [trust("trust_guyu", 10, "谷雨主动为林峰锚名")] }),
      option("E", "拒绝回答", "林峰沉默得太久。手机亮起时，输入框里连“你叫什么”都少了一个字。", { flags: ["refused_name_anchor"], state: { namePollutionStage: 3 } }),
    ],
  });

  line("nf02_010", chapterIds[2], "namefloor_manager_room", "旁白", "三楼宿管宿舍没有人。左侧抽屉半开，里面挤满一模一样的白羽毛；桌边压着学生名单，林峰那一行像被橡皮反复磨过。", "nf02_c14", { blueprintSceneId: "DR-C2-S02" });
  decision({
    code: "C14", nodeId: "nf02_c14", chapterId: chapterIds[2], scene: "namefloor_manager_room", blueprintSceneId: "DR-C2-S02",
    text: "规则墙、左抽屉、学生名单、撕页日记和异常的窗都在等他们先看。安全区只给一次从容搜索的机会。", nextNodeId: "nf02_020", defaultKey: "A",
    phoneScreen: phoneScreen({
      kind: "system", view: "members", title: "三楼宿管宿舍搜索", time: "03:30", signal: "weak",
      members: [
        { name: "宋明", isOnline: true },
        { name: "周朝阳", isOnline: true },
        { name: "谷雨", isOnline: true },
        { name: "林峰", isOnline: false, isGlitched: true },
      ],
      systemNotice: "同一房间内，手机与墙钟显示不同时间。",
    }),
    options: [
      option("A", "先读七条宿管规则", "周朝阳把两套规则并排抄下。它们像两只手，各自把学生推向对方。", { flags: ["read_manager_rules_first"], clues: [clue(6), clue(7)] }),
      option("B", "打开左侧抽屉", "抽屉比桌子更深。林峰抽走一根羽毛，下面立刻又浮起一根，像水面补平缺口。", { flags: ["found_infinite_feathers"], state: { featherState: "available" }, clues: [clue(11)] }),
      option("C", "检查学生名单", "名单上的其他名字都很清楚，唯独“林峰”被擦成一团灰。纸背却凸着完整的笔画。", { flags: ["found_erased_roster_name"], state: { rosterState: "rewriting" }, clues: [clue(15)] }),
      option("D", "先读撕页日记", "日记每隔三年换一种笔压，最后几页只剩同一句：别把羽毛交给下一个人。", { flags: ["read_manager_diary_first"], clues: [clue(7), clue(12)] }),
      option("E", "守门，让周朝阳和谷雨搜索", "林峰守住门缝。周朝阳拿到规则，谷雨取出日记，退路也始终没有从视野里消失。", { flags: ["guarded_manager_room", "secured_three_searches"], relationships: [trust("trust_zhouchaoyang", 6, "主动守住共同退路"), trust("trust_guyu", 6, "主动守住共同退路")] }),
      option("F", "先看窗外", "三楼窗外没有地面，只有一轮大得贴住玻璃的月亮。月面上，一枚手印正缓慢张开。", { flags: ["saw_giant_moon_early"], state: { namePollutionStage: 3 }, clues: [clue(8)] }),
    ],
  });

  line("nf02_020", chapterIds[2], "namefloor_dual_rules", "周朝阳", "学生规则说三点可以进食，宿管规则却要把拿到羽毛的学生送去不存在的四楼。这里没有一句话写明，谁在吃。", "nf02_c15", { blueprintSceneId: "DR-C2-S03", contentType: "dialogue" });
  decision({
    code: "C15", nodeId: "nf02_c15", chapterId: chapterIds[2], scene: "namefloor_dual_rules", blueprintSceneId: "DR-C2-S03",
    text: "两套规则并排显示。玩家需要先标记一个假设，但不能把假设当成答案。三点以后，究竟是谁可以进食？", nextNodeId: "nf02_c16", defaultKey: "E",
    phoneScreen: phoneScreen({
      kind: "system", view: "rules", title: "规则对照：学生 / 宿管", time: "03:32", signal: "weak",
      rules: managerRuleCards,
      systemNotice: "已调出七条宿管守则；学生规则八条保留在规则面板，可并排标记。",
      extra: { compareWith: studentRuleCards.map((rule) => rule.ruleId) },
    }),
    options: [
      option("A", "学生可以进食", "谷雨下意识看向空荡的储物柜。纸上的“学生”二字却像刚被什么舔湿。", { flags: ["food_subject_students"], state: { namePollutionStage: 3 } }),
      option("B", "红马甲可以进食", "三个人重新检查门锁。这个判断能防住门，却解释不了四楼门牌正在掉字。", { flags: ["food_subject_red_vest"], clues: [clue(6)] }),
      option("C", "四楼里的东西可以进食", "所有显示完整姓名的界面被立刻关掉。远处传来一声失望似的咀嚼。", { flags: ["food_subject_fourth_floor", "closed_visible_names"], state: { studentRulesFoodSubject: "fourth-floor-entities", managerRulesTrust: "contradictory" }, clues: [clue(6)] }),
      option("D", "宿管可以进食学生", "周朝阳没有划掉这个推断，只在旁边写下：证据不足，可能被规则诱导。", { flags: ["food_subject_manager"], state: { namePollutionStage: 3 }, relationships: [trust("trust_zhouchaoyang", -4, "把未经验证的推断当成答案")] }),
      option("E", "保留歧义，等声音出现再修正", "周朝阳画出四条并列箭头。谁都没有因为一句规则就先被当成怪物。", { flags: ["food_subject_open_hypotheses"], state: { studentRulesFoodSubject: "unresolved", managerRulesTrust: "contradictory" }, clues: [clue(6)], relationships: [trust("trust_zhouchaoyang", 8, "保留可修正的规则假设")] }),
    ],
  });

  decision({
    code: "C16", nodeId: "nf02_c16", chapterId: chapterIds[2], scene: "namefloor_feather_drawer", blueprintSceneId: "DR-C2-S02",
    text: "左抽屉里的羽毛让被擦掉的名字短暂浮回纸面，也让墙后传来更近的脚步。谁来拿？", nextNodeId: "nf02_030", defaultKey: "C",
    options: [
      option("A", "林峰持有", "羽毛贴上掌心，“林峰”完整出现了三秒。周朝阳同时看见墙里的影子转过头。", { flags: ["feather_with_linfeng"], state: { featherHolder: "林峰", featherState: "clean" }, clues: [clue(11)] }),
      option("B", "周朝阳持有", "周朝阳把羽毛压在笔记上。电子屏掉字时，纸页上的名字会晚半拍改变。", { flags: ["feather_with_zhou"], state: { featherHolder: "周朝阳", featherState: "clean" }, clues: [clue(11)] }),
      option("C", "谷雨持有", "谷雨攥紧羽毛，一遍遍低声叫林峰。每叫一次，羽尖就多一缕灰。", { flags: ["feather_with_guyu"], state: { featherHolder: "谷雨", featherState: "clean" }, relationships: [trust("trust_guyu", 8, "把姓名锚交给谷雨")] }),
      option("D", "不取羽毛", "抽屉自行合上，墙后的脚步慢了。可名单上的凹痕也随之重新变平。", { flags: ["left_feather_in_drawer"], state: { featherHolder: null, featherState: "untouched" } }),
      option("E", "折成两片，交给林峰和谷雨", "羽轴断开的声音很轻。两片羽毛同时发灰，窗外的手印却一下多了十几枚。", { flags: ["split_feather_linfeng_guyu"], state: { featherHolder: "林峰与谷雨", featherState: "split-tainted" }, clues: [clue(11)] }),
    ],
  });

  add({
    nodeId: "nf02_030",
    chapterId: chapterIds[2],
    scene: "namefloor_torn_diary",
    blueprintSceneId: "DR-C2-S04",
    speaker: "旁白",
    type: "phone-interaction",
    contentType: "phone-text",
    text: "宿管日记被分成几段拍进手机。林峰没有一次性读完，而是按页边日期逐条核对。",
    nextNodeId: "nf02_c17",
    phoneScreen: phoneScreen({
      kind: "private", view: "message", title: "宿管日记散页", time: "03:43", signal: "weak",
      messages: [
        { sender: "4月13日", text: "红马甲会停在门外。只要宿管宿舍还有名字，它就不能进来。" },
        { sender: "4月23日", text: "左抽屉的羽毛能把学生的名字临时钉回纸上，也会把四楼的注意引过来。" },
        { sender: "5月15日", text: "学生名单不是点名册，它像账本。少一个名字，就会找另一个名字补上。" },
        { sender: "6月15日", text: "三年聘用期到了。别把羽毛交给下一个人，除非你已经想好谁替你还账。" },
      ],
      actions: [
        { actionId: "diary_keep_reading", label: "收起分段日记", nextNodeId: "nf02_c17", storyState: { keptDiary: true } },
      ],
    }),
    stateUpdates: [{ key: "keptDiary", value: true }],
  });
  decision({
    code: "C17", nodeId: "nf02_c17", chapterId: chapterIds[2], scene: "namefloor_torn_diary", blueprintSceneId: "DR-C2-S04",
    text: "钟停在三点三十分。笔记、日记和手机扫描件只能选一种最可信的携带方式。", nextNodeId: "nf02_040", defaultKey: "A",
    options: [
      option("A", "坚持让周朝阳带原笔记", "周朝阳不耐烦地看了林峰一眼，还是把原件贴身收好。纸页会替他继续说话。", { flags: ["zhou_kept_original_notes"], state: { keptDiary: true, diaryCarrier: "周朝阳", zhouTrustSignal: "entrusted" }, clues: [clue(7), clue(16)], relationships: [trust("trust_zhouchaoyang", 6, "托付原始时间线")] }),
      option("B", "林峰自己携带", "笔记落进林峰口袋。封面上的姓名随他的呼吸一明一暗。", { flags: ["lin_kept_zhou_notes"], state: { keptDiary: true, diaryCarrier: "林峰" }, clues: [clue(16)] }),
      option("C", "只拍照，原件放回", "扫描件看起来最轻便。保存完成时，日记作者的姓已经在照片里换了一个偏旁。", { flags: ["notes_photo_only"], state: { namePollutionStage: 4 }, clues: [clue(13)] }),
      option("D", "交给谷雨", "谷雨先读到页边那些买饭、借伞和忘带钥匙的批注。他记住的不是档案，是人的语气。", { flags: ["guyu_kept_notes"], state: { keptDiary: true, diaryCarrier: "谷雨", guyuRemembersLinfeng: true }, clues: [clue(7), clue(16)], relationships: [trust("trust_guyu", 8, "把生活化证据交给谷雨")] }),
      option("E", "撕下关键页单独带走", "林峰保住了两页，却把前后笔压撕断。门外有人用宿管的声音叹了口气。", { flags: ["tore_diary_key_pages", "wu_hostility_seed"], state: { keptDiary: true, diaryCarrier: "散页", zhouTrustSignal: "angered" }, relationships: [trust("trust_zhouchaoyang", -6, "破坏原始证据时间线")] }),
    ],
  });

  line("nf02_040", chapterIds[2], "namefloor_stopped_clock", "旁白", "他们搜索了很久，墙钟仍停在三点三十分。门缝外每隔十分钟经过同一双布鞋，连鞋底带水的位置都一模一样。周朝阳忽然又问了一遍林峰叫什么。", "nf02_050", { blueprintSceneId: "DR-C2-S05", clues: [clue(8)], effectTags: ["time-jump", "name-headache"], effects: [{ type: "focus-pulse", durationMs: 1100, intensity: 0.38 }] });
  line("nf02_050", chapterIds[2], "namefloor_moon_window", "旁白", "巨大月亮压满整扇窗。玻璃外的手印一枚接一枚增加，像有人从不存在的楼层沿墙爬了下来。", "nf02_051", { blueprintSceneId: "DR-C2-S06", effectTags: ["giant-moon", "third-floor-handprints"], effects: [{ type: "scene-shake", durationMs: 1200, intensity: 0.36 }, { type: "blood-edge", durationMs: 1000, intensity: 0.18 }] });
  line("nf02_051", chapterIds[2], "namefloor_moon_window", "谷雨", "这里可是三楼。", "nf02_c18", { blueprintSceneId: "DR-C2-S06", contentType: "dialogue" });
  decision({
    code: "C18", nodeId: "nf02_c18", chapterId: chapterIds[2], scene: "namefloor_moon_window", blueprintSceneId: "DR-C2-S06",
    text: "玻璃开始向内鼓起。手印在找羽毛，也在找一个能被完整叫出的名字。", nextNodeId: "nf03_001", durationMs: 6000, fallbackKey: "T", defaultKey: "D",
    options: [
      option("A", "用羽毛贴住玻璃", "羽毛瞬间烧成墨色，手印被挡在一条细缝外。持有者的手臂却浮出一排陌生姓名。", { flags: ["sealed_window_with_feather", "feather_holder_wounded"], state: { featherState: "blackened", featherUsedOnWindow: true }, clues: [clue(8), clue(11)] }),
      option("B", "关灯，遮住所有姓名", "屏幕、名单和笔记被同时压住。失去目标的手印在黑暗中摸索，队伍从门边悄然撤开。", { flags: ["hid_all_names_from_hands", "team_intact_after_window"], clues: [clue(8)] }),
      option("C", "指着规则，坚持那只是幻觉", "周朝阳还没读完第六条，玻璃便向屋内爆开。没有羽毛保护、又最不被信任的人被月光拖走。", { flags: ["trusted_window_hallucination", "lowest_trust_person_lost"], state: { namePollutionStage: 6 } }),
      option("D", "带笔记和名单冲向数字“4”", "周朝阳抱住笔记，谷雨卷起名单。林峰提醒周朝阳带笔记时，他慢了半拍才回答。三个人踏上那级从规则中被删掉的台阶。", { flags: ["team_reached_fourth_floor", "team_intact_after_window"], state: { keptDiary: true, enteredFourthFloor: true }, clues: [clue(8), clue(11)], relationships: [trust("trust_zhouchaoyang", 6, "共同带走证据"), trust("trust_guyu", 6, "共同带走证据")] }),
      option("E", "留一人守门，其余人先走", "门被留在身后的那个人顶住。遗物从缝下滑来时，上面只剩一句新写的话：别回来。", { flags: ["left_guard_at_manager_room", "trusted_person_abandoned"], relationships: [trust("trust_guyu", -10, "把一名同伴留在宿管室")] }),
      option("T", "迟疑到玻璃彻底碎裂", "冰冷的手掌盖住林峰的脸。视野黑了一次，再亮起时，他已经站在数字“4”后面，谁也说不清中间那具身体去了哪里。", { timeoutOnly: true, flags: ["lin_continuity_broken", "player_linfeng_replaced", "body_interruption"], state: { namePollutionStage: 6 } }),
    ],
  });

  line("nf03_001", chapterIds[3], "namefloor_endless_floor", "旁白", "从三楼到四楼的台阶比正常楼层长得多。数字“4”后仍是十一楼：同样的铁门、同样的水泥墙，却没有一块门牌保留完整姓名。", "nf03_c19", { blueprintSceneId: "DR-C3-S01", effectTags: ["stair-stretch", "fourth-floor-blur", "space-loop"], effects: [{ type: "focus-pulse", durationMs: 1300, intensity: 0.42 }, { type: "signal-glitch", durationMs: 1000, intensity: 0.3 }] });
  decision({
    code: "C19", nodeId: "nf03_c19", chapterId: chapterIds[3], scene: "namefloor_endless_floor", blueprintSceneId: "DR-C3-S01",
    text: "撤回前，林峰只看清半句：不要在这里叫全名。走廊正等他们决定如何互相称呼。", nextNodeId: "nf03_c20", defaultKey: "E",
    phoneScreen: phoneScreen({
      kind: "private", view: "message", title: "黑色头像", time: "02:59", signal: "none",
      messages: [
        { sender: "黑色头像", text: "不要在四楼叫出完整姓名。" },
        { sender: "系统", text: "上一条消息已自动消失。" },
      ],
      systemNotice: "对方头像为空，群成员人数未变化。",
    }),
    options: [
      option("A", "遵守警告，只用代号", "门牌的灯暂时没有亮。四个人的称呼被压缩成单字，像在黑暗里打结。", { flags: ["used_fourth_floor_aliases"], clues: [clue(9)] }),
      option("B", "截图后质问黑色头像", "截图只留下半句。黑色头像回复“你已经……”，最后两个字在发送前消失。", { flags: ["questioned_black_avatar_time"], clues: [clue(9), clue(13)] }),
      option("C", "大声报出“林峰”", "复制宿舍的灯逐级亮起。最深处那扇门先学会了林峰的声线。", { flags: ["lin_full_name_leaked_on_fourth", "song_full_name_leaked"], state: { namePollutionStage: 4, calledFullNameOnFourth: true, blackAvatarStage: "ignored-warning" } }),
      option("D", "把四人全名发到群里", "发送键落下，走廊两侧所有门同时弹开。每个房间都有人开始练习四种呼吸。", { flags: ["all_names_leaked_on_fourth", "song_full_name_leaked"], state: { namePollutionStage: 5, calledFullNameOnFourth: true, blackAvatarStage: "names-posted" }, clues: [clue(9)] }),
      option("E", "用无声手势前进", "谷雨打出今晚才约定的手势。黑色头像准确回了一遍，像比他们更早经历过这一刻。", { flags: ["black_avatar_knew_new_gesture", "used_fourth_floor_aliases"], clues: [clue(9), clue(10), clue(13)], relationships: [trust("trust_guyu", 6, "延续无声新约定")] }),
    ],
  });

  decision({
    code: "C20", nodeId: "nf03_c20", chapterId: chapterIds[3], scene: "namefloor_endless_floor", blueprintSceneId: "DR-C3-S01",
    text: "三点后的咀嚼声从四面靠近。它们没有吃东西，只把门牌上的名字一笔一笔咬掉。", nextNodeId: "nf03_010", durationMs: 8000, fallbackKey: "T", defaultKey: "E",
    extra: { effectTags: ["sound-drop", "doors-opening", "lights-blackout", "name-letters-fall", "hunt-impact-drag"], effects: [{ type: "blackout", durationMs: 900, intensity: 0.45 }, { type: "door-impact", durationMs: 900, intensity: 0.42 }] },
    options: [
      option("A", "熄屏，按无声手势移动", "屏幕全部熄灭。队伍贴墙绕过第一阵咀嚼声，谷雨的手势在黑暗中没有错一次。", { flags: ["silent_hunt_escape", "song_rescue_on_time"], clues: [clue(6), clue(10)], relationships: [trust("trust_guyu", 5, "用共同手势避开进食者")] }),
      option("B", "扔出显示死亡账号的手机", "亮屏沿走廊滑远，咀嚼声追了过去。手机被咬碎前，死亡账号又上线了一次。", { flags: ["sacrificed_phone_to_hunt", "paper_evidence_only"], clues: [clue(14)] }),
      option("C", "躲进写有熟人姓名的房间", "房门在身后反锁。墙里传来宋明的求救，而门牌正从最后一笔开始消失。救援被迫延后。", { flags: ["song_rescue_delayed", "trapped_in_named_room"], state: { namePollutionStage: 6 } }),
      option("D", "追着咀嚼声找被困者", "林峰在声音最密的地方看见复制宿舍，宋明被绑在床架后。位置找到了，救援却也因此晚了一步。", { flags: ["found_true_song_location", "song_rescue_delayed"], clues: [clue(3), clue(6), clue(10)] }),
      option("E", "让周朝阳按规则矛盾推路", "周朝阳选择每次都让两套规则同时最少成立的方向，最后一扇门停在复制宿舍前。", { flags: ["zhou_rule_route", "team_intact_after_hunt", "song_rescue_on_time"], clues: [clue(6)], relationships: [trust("trust_zhouchaoyang", 8, "采用可校验的规则路线")] }),
      option("T", "没能在名字消失前移动", "咀嚼声越过所有人，抓住姓名污染最深的那一个。林峰的视野再次断开，地上只剩一串没有主人的脚印。", { timeoutOnly: true, flags: ["hunt_timeout_body_interruption", "lin_continuity_broken", "song_rescue_delayed"], state: { namePollutionStage: 7 } }),
    ],
  });

  line("nf03_010", chapterIds[3], "namefloor_copy_dorm", "旁白", "1107 宿舍门缝里亮着微弱手机光。一个宋明坐在原床位上，手腕有勒痕。他说自己早就回来了，也从没有敲过门。", "nf03_c21", { blueprintSceneId: "DR-C3-S02", effectTags: ["phone-glow-1107", "account-missing", "group-name-missing"], effects: [{ type: "signal-glitch", durationMs: 1000, intensity: 0.32 }], namePollutionHistory: [{ stage: 3, visibleCarrier: "宋明忘记了与林峰共同经历" }, { stage: 4, visibleCarrier: "复制宿舍记录只承认另一个林峰" }] });
  decision({
    code: "C21", nodeId: "nf03_c21", chapterId: chapterIds[3], scene: "namefloor_copy_dorm", blueprintSceneId: "DR-C3-S02",
    text: "旧记忆、账号和羽毛都可能被骗。要确认眼前的宋明，至少需要一段设备没有记录的新事实。", nextNodeId: "nf03_020", defaultKey: "A",
    phoneScreen: phoneScreen({
      kind: "group", view: "members", title: "1107 宿舍群", time: "03:01", signal: "none",
      memberCount: 42,
      members: [
        { name: "宋明", isOnline: true },
        { name: "周朝阳", isOnline: true },
        { name: "谷雨", isOnline: true },
        { name: "黑色头像", isOnline: true, isBlackAvatar: true },
      ],
      systemNotice: "林峰不在群成员列表；黑色头像占据原位置，人数未增加。",
    }),
    options: [
      option("A", "问今晚毛巾被放在什么位置", "他低头看向床脚，说出毛巾被谷雨踢到暖气管后的细节。那件事没有被任何设备拍到。", { flags: ["song_new_memory_verified"], state: { songIdentityJudgment: "new-memory-supported" }, clues: [clue(3), clue(10), clue(16)] }),
      option("B", "使用临时口令", "宋明接上了只有屋内人听过的后半句。周朝阳仍提醒：知道新事实，还要看他接下来怎么选择。", { flags: ["song_new_memory_verified"], state: { songIdentityJudgment: "temporary-code-supported" }, clues: [clue(10), clue(16)] }),
      option("C", "只查学籍和账号", "两部手机同时登录“宋明”，学籍照片也完全一致。完整记录没有回答眼前的人是谁。", { flags: ["song_checked_records_only"], clues: [clue(16)] }),
      option("D", "让谷雨判断生活习惯", "谷雨故意把宋明最讨厌的饮料递过去。他皱眉推开，随后说出今晚才发生的玩笑。", { flags: ["song_new_memory_verified", "guyu_verified_song_habit"], clues: [clue(10), clue(16)], relationships: [trust("trust_guyu", 6, "用生活细节参与验真")] }),
      option("E", "用羽毛碰触他", "羽毛朝他的胸口弯去，却在靠近时一半变白、一半变黑。它只承认姓名的稳定，不承认人格的真假。", { flags: ["tested_song_with_feather_only"], clues: [clue(11), clue(16)] }),
      option("F", "请他自愿替最弱者试门", "宋明看了一眼伤得最重的人，自己把手按上门锁。门后的东西咬伤他，却没能让他松手。", { flags: ["song_voluntary_risk", "song_new_choice_verified"], clues: [clue(10), clue(16)] }),
      option("G", "喊出宋明全名", "名字在复制宿舍里获得了第二道回声。床下另一个喉咙也学会用相同声线宣告自己仍在。", { flags: ["song_full_name_leaked", "song_copy_completed"], state: { namePollutionStage: 5, calledFullNameOnFourth: true, songIdentityJudgment: "damaged-by-full-name" } }),
    ],
  });

  line("nf03_020", chapterIds[3], "namefloor_two_linfengs", "旁白", "上铺帘子忽然滑开。另一个林峰坐起身，手机、学籍和家庭信息一项不缺；玩家林峰的屏幕却只剩“用户不存在”。", "nf03_c22", { blueprintSceneId: "DR-C3-S03", effectTags: ["account-missing", "mimic-desync", "identity-slip"], effects: [{ type: "face-dislocate", durationMs: 1000, intensity: 0.38 }] });
  decision({
    code: "C22", nodeId: "nf03_c22", chapterId: chapterIds[3], scene: "namefloor_two_linfengs", blueprintSceneId: "DR-C3-S03",
    text: "两个林峰有同样的旧记忆。只有今晚没有被记录的新选择，可能证明谁连续走到了这里。", nextNodeId: "nf03_c22_feather", defaultKey: "B",
    phoneScreen: phoneScreen({
      kind: "system", view: "system", title: "个人账号", time: "03:02", signal: "none",
      systemNotice: "用户不存在。群成员列表中未找到林峰；合法账号位于 1107 上铺。",
    }),
    options: [
      option("A", "追问今晚未上网的新事件", "两个林峰对旧事答得一样，只有一个记得无声手势改过一次。差异被写进周朝阳的笔记。", { flags: ["lin_new_memory_test"], clues: [clue(10), clue(16)] }),
      option("B", "订立并立即执行临时承诺", "他们约定谁听见三下敲击就先护住谷雨。敲击真的响起时，玩家林峰先动了。", { flags: ["lin_temporary_promise", "player_linfeng_continuity_evidence"], clues: [clue(10), clue(16)] }),
      option("C", "让谷雨判断习惯", "谷雨能指出握杯和皱眉的细节，却也承认四楼已经看过他们太多次。习惯只能作旁证。", { flags: ["guyu_compared_two_lins"], clues: [clue(16)] }),
      option("D", "检查双方影子", "一个影子连续，另一个中间少了一截。周朝阳只写下“身体中断”，没有擅自写“伪人”。", { flags: ["two_lins_shadow_gap"], clues: [clue(16)] }),
      option("E", "用羽毛分别测试", "羽毛只朝有合法姓名的一边弯。它能证明谁被记录承认，不能证明谁作出了今晚的选择。", { flags: ["two_lins_feather_test"], clues: [clue(11), clue(16)] }),
      option("F", "只查学籍和账号", "另一个林峰的资料毫无破绽。玩家林峰的联系人却在众人眼前彻底空白。", { flags: ["legal_linfeng_records_stronger"], state: { namePollutionStage: 5 }, clues: [clue(16)] }),
      option("G", "问谁愿意承担开门风险", "两个人都伸了手，但只有一个先问门后会不会伤到其他人。动机比动作多留下了一层证据。", { flags: ["lin_risk_choice_test"], clues: [clue(10), clue(16)] }),
    ],
  });

  decision({
    code: "C22F", nodeId: "nf03_c22_feather", chapterId: chapterIds[3], scene: "namefloor_two_linfengs", blueprintSceneId: "DR-C3-S03",
    text: "羽毛能参与验证，却不能替任何人给出绝对答案。它更像一枚会吸引猎食者的临时钉子。",
    nextNodeId: "nf03_030", defaultKey: "D",
    phoneScreen: phoneScreen({
      kind: "system", view: "rules", title: "羽毛验证记录", time: "03:03", signal: "none",
      rules: [
        { number: 1, title: "旧记录不足", text: "学籍、账号、家庭档案只能证明过去被记录过。" },
        { number: 2, title: "新选择优先", text: "午夜后、未通过设备传播的新事实优先进入身份判断。" },
        { number: 3, title: "羽毛不是答案", text: "羽毛稳定姓名，也会把四楼的注意转向持有人。" },
      ],
    }),
    options: [
      option("A", "把羽毛交给玩家林峰", "羽毛钉住了玩家林峰的半个名字，也让门外脚步重新对准他。", { flags: ["feather_to_player_linfeng_in_ch3"], state: { featherHolder: "林峰", featherState: "warming", songIdentityJudgment: "still-observed" }, clues: [clue(11), clue(16)] }),
      option("B", "把羽毛交给另一个林峰", "合法记录那一侧短暂更亮，周朝阳却提醒：亮起的是姓名，不是今晚的选择。", { flags: ["feather_to_other_linfeng"], state: { featherHolder: "另一个林峰", featherState: "warming" }, clues: [clue(11), clue(16)] }),
      option("C", "把羽毛交给宋明", "宋明没有立刻收下，先确认这会不会让其他人被找到。这个犹豫比羽毛本身更像证据。", { flags: ["feather_to_song_during_verification"], state: { featherHolder: "宋明", featherState: "warming", songIdentityJudgment: "voluntary-risk-observed" }, clues: [clue(10), clue(11), clue(16)] }),
      option("D", "让谷雨暂时保管", "谷雨把羽毛压在掌心，继续用生活习惯和今晚细节分辨两个人。她仍能准确叫出林峰。", { flags: ["feather_to_guyu_during_verification"], state: { featherHolder: "谷雨", featherState: "warming", guyuRemembersLinfeng: true }, clues: [clue(11), clue(16)], relationships: [trust("trust_guyu", 6, "让谷雨继续承担姓名锚")] }),
      option("E", "暂时不用羽毛", "他们没有把危险交给任何一个被怀疑的人。代价是验证速度变慢，走廊的三点声已经靠近。", { flags: ["feather_not_used_in_linfeng_test"], state: { featherState: "held-back" }, clues: [clue(16)] }),
    ],
    extra: { effectTags: ["feather-surge"], effects: [{ type: "focus-pulse", durationMs: 1000, intensity: 0.34 }] },
  });

  line("nf03_030", chapterIds[3], "namefloor_era_doors", "旁白", "走廊的门一扇扇打开，里面叠着不同时代的同一间宿舍。有人忘了姓名，有人死亡多年仍在等点名。", "nf03_c23", { blueprintSceneId: "DR-C3-S04" });
  decision({
    code: "C23", nodeId: "nf03_c23", chapterId: chapterIds[3], scene: "namefloor_era_doors", blueprintSceneId: "DR-C3-S04",
    text: "复制宿舍正在合拢。队伍必须先决定，谁能跨出这扇门。", nextNodeId: "nf03_c24", defaultKey: "A",
    options: [
      option("A", "带同行宋明，暂缓定性", "宋明跟进队伍，没有人把“暂时无法证明”偷换成“必须处死”。", { flags: ["song_travels_with_group", "no_wrong_exile"], relationships: [trust("recognition_songming", 8, "暂缓定性并继续观察新选择")] }),
      option("B", "锁住同行宋明", "铁门合上时，宋明没有求饶，只问谷雨还记不记得毛巾放在哪里。救援窗口随之关闭。", { flags: ["song_locked_in_copy_dorm", "song_rescue_delayed", "misjudged_human"], relationships: [trust("recognition_songming", -12, "在证据未完备时锁住同行宋明")] }),
      option("C", "同时释放另一个林峰，给他临时代号", "两个林峰都走出宿舍。临时代号保住了身体，也在队伍脚下添出尚未定性的第五个位置。", { flags: ["second_linfeng_released", "fifth_seed", "identity_unresolved"], clues: [clue(16), clue(18)] }),
      option("D", "攻击另一个林峰", "另一个林峰被推回床架，血迹是真的。家庭档案从他口袋滑出时，谷雨没有再看玩家林峰。", { flags: ["other_linfeng_attacked", "possible_wrong_exile"], relationships: [trust("trust_guyu", -12, "在验真未完成时攻击另一个林峰")] }),
      option("E", "驱逐玩家林峰", "视野落进手机屏幕。林峰仍能看见队伍，却再也无法让他们听见自己的呼吸。", { flags: ["player_linfeng_exiled", "lin_continuity_broken", "possible_wrong_exile"], state: { namePollutionStage: 7 } }),
      option("F", "允许通过双重验真的自我伪人加入", "那个承认自己并非原人的学生没有借用任何姓名，只请求一次自行选择的机会。队伍多了一道无名脚步。", { flags: ["self_aware_mimic_joined", "fifth_seed", "identity_unresolved"], state: { acceptedAwareMimic: true }, clues: [clue(10), clue(16), clue(18)] }),
    ],
  });

  decision({
    code: "C24", nodeId: "nf03_c24", chapterId: chapterIds[3], scene: "namefloor_era_doors", blueprintSceneId: "DR-C3-S04",
    text: "门后的人都说自己还活着。要救谁，不能只看校服年代和学籍是否存在。", nextNodeId: "nf03_c24_rules", defaultKey: "A",
    extra: { effectTags: ["doors-opening", "mimic-desync"], effects: [{ type: "door-impact", durationMs: 800, intensity: 0.34 }] },
    options: [
      option("A", "救出两名能说出新记忆的学生", "两名学生各自说出进入四楼后才发生的事。散页上多了两个不属于固定人数的请求。", { flags: ["rescued_trapped_student", "fifth_seed", "cross_era_witnesses"], clues: [clue(12), clue(15), clue(16)], relationships: [trust("trust_guyu", 8, "先救仍能形成新记忆的人")] }),
      option("B", "只交换规则，不放人", "门里的人告诉他们：恢复一个名字，名册就会挤掉另一个。门关上后，至少一张脸永远停在了里面。", { flags: ["traded_rules_without_rescue", "trapped_student_died"], state: { chapterThreeIrreversible: "trapped-student-died" }, clues: [clue(15)] }),
      option("C", "公开队伍全名求协助", "所有门里的脸同时转来。片刻后，名单首位的学生倒下，走廊开始用四个完整姓名互相呼喊。", { flags: ["team_names_public_on_fourth", "first_roster_student_died"], state: { namePollutionStage: 7, calledFullNameOnFourth: true, chapterThreeIrreversible: "first-roster-student-died" } }),
      option("D", "只救有学籍的人", "获救者的档案完整得令人安心。下一扇门却证明，同一份学籍曾被三张不同的脸使用。", { flags: ["rescued_records_only", "rescued_empty_shell"], clues: [clue(15), clue(16)] }),
      option("E", "保护承认自己是伪人的学生", "他没有索要旧人的位置，只交出一段刚刚形成的恐惧和选择。名册边缘留下无名湿手印。", { flags: ["protected_self_aware_mimic", "fifth_seed", "identity_unresolved"], state: { acceptedAwareMimic: true }, clues: [clue(15), clue(16), clue(18)], relationships: [trust("trust_guyu", 8, "承认新形成的主体选择")] }),
      option("F", "关门继续前进", "求救声被铁门切断。名单最上方的忘名学生停止敲门，脚步却开始跟在队伍后面。", { flags: ["abandoned_trapped_students", "forgotten_student_pursuer"], relationships: [trust("trust_guyu", -8, "放弃被困学生")] }),
    ],
  });

  decision({
    code: "C24R", nodeId: "nf03_c24_rules", chapterId: chapterIds[3], scene: "namefloor_era_doors", blueprintSceneId: "DR-C3-S04",
    text: "不同年份的求救声叠在一起。继续安静能保住队伍，公开规则可能多救人，也可能把姓名交出去。",
    nextNodeId: "nf03_040", durationMs: 7000, fallbackKey: "F", defaultKey: "A",
    phoneScreen: phoneScreen({
      kind: "group", view: "message", title: "临时口令", time: "03:06", signal: "none",
      messages: [
        { sender: "周朝阳", text: "只发代号，不发完整姓名。" },
        { sender: "谷雨", text: "能形成新记忆的人优先救。" },
      ],
      systemNotice: "所有公开文本都可能被四楼读取。",
    }),
    options: [
      option("A", "公开临时口令，不公开姓名", "几个仍能理解口令的人跟上队伍，门牌没有立刻亮起完整姓名。", { flags: ["shared_temp_code_without_names"], state: { studentRulesFoodSubject: "fourth-floor-entities" }, clues: [clue(10), clue(15)] }),
      option("B", "只把规则写给最近的求救者", "规则被传进最近的门缝，远处的求救声同时小了一截。这个选择救得有限，却没有扩大姓名暴露。", { flags: ["shared_rules_to_nearest_only"], state: { managerRulesTrust: "situational" }, clues: [clue(15)] }),
      option("C", "公开全部姓名和规则", "群消息发送后，走廊灯逐段熄灭。第一名有完整姓名的学生被拖进门内，再也没有回应。", { flags: ["published_full_names_and_rules", "first_roster_student_died"], state: { calledFullNameOnFourth: true, chapterThreeIrreversible: "named-student-dragged-away", namePollutionStage: 7 }, relationships: [trust("trust_guyu", -10, "公开完整姓名导致不可逆伤亡")] }),
      option("D", "让自我伪人携带口令", "它确认自己不会借用任何旧姓名，带着口令跑向另一段走廊。它可能活下来，也可能成为第五道影子。", { flags: ["mimic_carried_temp_code", "fifth_seed"], state: { acceptedAwareMimic: true }, clues: [clue(10), clue(18)] }),
      option("E", "保持绝对安静，只救眼前人", "队伍没有再发出声音。远处至少一扇门停止敲击，谷雨把嘴唇咬出血也没有开口。", { flags: ["absolute_silence_chosen", "distant_rescue_abandoned"], state: { chapterThreeIrreversible: "distant-student-lost" }, relationships: [trust("trust_guyu", -4, "在安静与救人之间选择安静")] }),
      option("F", "迟疑到口令窗口关闭", "手机输入框自行清空。一个忘了半个姓名的人跟错队伍，转角后再也没有脚步声。", { timeoutOnly: true, flags: ["temp_code_window_missed", "forgotten_student_lost"], state: { chapterThreeIrreversible: "forgotten-student-lost" } }),
    ],
  });

  line("nf03_040", chapterIds[3], "namefloor_name_feast", "旁白", "一名学生扑到门缝前，脸上的五官还在，姓名却正从衣领、手机和记忆里一起剥落。四楼里的东西终于开始真正进食。", "nf03_c25", { blueprintSceneId: "DR-C3-S05", effectTags: ["sound-drop", "name-letters-fall", "hunt-impact-drag", "identity-slip"], effects: [{ type: "blackout", durationMs: 700, intensity: 0.4 }, { type: "scene-shake", durationMs: 1100, intensity: 0.45 }, { type: "blood-edge", durationMs: 1200, intensity: 0.28 }] });
  decision({
    code: "C25", nodeId: "nf03_c25", chapterId: chapterIds[3], scene: "namefloor_name_feast", blueprintSceneId: "DR-C3-S05",
    text: "进食者逼近。交出一个名字，或许能换回一条命，也可能只替它制造新的身体。", nextNodeId: "nf03_050", durationMs: 6000, fallbackKey: "T", defaultKey: "D",
    phoneScreen: phoneScreen({
      kind: "system", view: "rules", title: "三点规则高亮", time: "03:00", signal: "none",
      rules: [
        { number: 7, title: "三点可以进食", text: "当前验证：进食者不是学生，而是四楼中的东西。" },
        { number: 3, title: "宿管羽毛规则", text: "羽毛能引开进食者，也会转移持有者身上的债。" },
      ],
      systemNotice: "环境声骤降；门牌姓名正在掉字。",
    }),
    options: [
      option("A", "在空白纸上写一个假名", "假名被咬走，学生得以喘息。被揉成团的纸后面，却慢慢站起一道没有五官的影子。", { flags: ["fake_name_shadow", "fifth_seed", "identity_unresolved"], clues: [clue(15), clue(18)] }),
      option("B", "交出自己的姓", "进食者叼走“林”字。林峰张口时，只能说出后半个名字，学生则从门缝里跌了出来。", { flags: ["lin_surname_sacrificed", "rescued_trapped_student"], state: { namePollutionStage: 7 }, relationships: [trust("trust_guyu", 8, "用自己的姓换回学生")] }),
      option("C", "交出被困学生的姓名", "门开了，走出来的身体会笑、会道谢，只有名册把原来的那个人划成了死亡。", { flags: ["student_name_sacrificed", "roster_replacement_seed", "original_person_lost"], state: { rosterState: "quota-maintained", chapterThreeIrreversible: "student-replaced-by-name" }, relationships: [trust("trust_guyu", -10, "用被困学生的姓名支付安全")] }),
      option("D", "用羽毛引开进食者", "发黑的羽毛在半空亮起姓名。持有者被扑倒重伤，学生和其余人趁机穿过门口。", { flags: ["feather_drew_name_eater", "rescued_trapped_student"], state: { featherState: "tainted", chapterThreeIrreversible: "feather-holder-severely-wounded", studentRulesFoodSubject: "fourth-floor-entities" }, clues: [clue(11), clue(15)] }),
      option("E", "让有自我的伪人自愿断后", "他先确认所有人都已越过门线，才转身迎向咀嚼声。这次行动不在任何旧记录里。", { flags: ["mimic_voluntary_risk", "song_mimic_self_aware", "fifth_seed"], state: { acceptedAwareMimic: true, chapterThreeIrreversible: "aware-mimic-voluntary-loss" }, clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 8, "承认自愿承担风险的新选择")] }),
      option("T", "没能在姓名被吃尽前决定", "求救者最后一个字从名册上消失。身体像断线一样倒下，死亡账号却在林峰手机里亮起。", { timeoutOnly: true, flags: ["trapped_student_name_consumed", "trapped_student_died"], state: { rosterState: "quota-maintained", chapterThreeIrreversible: "trapped-student-died" } }),
    ],
  });

  add({
    nodeId: "nf03_050",
    chapterId: chapterIds[3],
    scene: "namefloor_green_vest",
    blueprintSceneId: "DR-C3-S06",
    speaker: "旁白",
    text: "咀嚼声忽然退开。走廊尽头，一件绿色马甲从黑暗里缓慢靠近。胸牌被划得只剩姓氏，她没有先看他们的脸，只看谁手里拿着羽毛。",
    type: "chapter-ending",
    contentType: "narration",
    nextNodeId: "nf04_001",
    chapterEnding: {
      title: "第三章结束",
      subtitle: "三年聘用制和羽毛债被摆到队伍面前。",
      cta: "继续前往值班室",
      nextNodeId: "nf04_001",
    },
    effectTags: ["feather-surge", "space-loop"],
    effects: [{ type: "focus-pulse", durationMs: 1000, intensity: 0.28 }],
  });

  line("nf04_001", chapterIds[4], "namefloor_green_vest", "旁白", "他们跟着羽毛的冷光绕过原本的三楼宿管宿舍，来到一间年份互相叠压的值班室。墙钟在三个年份之间跳动，合同、照片、名单和羽毛柜同时发出纸张翻页声。", "nf04_c25w", {
    blueprintSceneId: "DR-C4-S01",
    effectTags: ["year-overlap-duty-room", "contract-date-shift", "manager-photo-fade", "name-record-fade", "three-year-flashback"],
    effects: [{ type: "signal-glitch", durationMs: 1100, intensity: 0.32 }, { type: "focus-pulse", durationMs: 1200, intensity: 0.34 }],
  });
  decision({
    code: "C25W", nodeId: "nf04_c25w", chapterId: chapterIds[4], scene: "namefloor_green_vest", blueprintSceneId: "DR-C4-S01",
    text: "值班室只允许先碰一处记录。先碰的东西会决定宿管愿意从哪里开始说真话。", nextNodeId: "nf04_c26", defaultKey: "A",
    phoneScreen: phoneScreen({
      kind: "system", view: "documents", title: "叠年值班室", time: "03:33", signal: "none",
      messages: [
        { sender: "合同柜", text: "三年聘用合同：姓名、照片、社会关系逐年褪色。" },
        { sender: "羽毛柜", text: "羽毛可暂锚姓名，也会转移注意力与污染。" },
        { sender: "值班牌", text: "当前宿管：吴阿姨；稳定状态不足一年。" },
        { sender: "旧路线", text: "名单消失时前往校长室。" },
      ],
      systemNotice: "不同年份的纸张正在同一页上翻动。",
    }),
    options: [
      option("A", "先对齐三份合同日期", "合同日期从高薪招聘、第一年稳定、第三年缺名依次对齐。林峰确认这不是普通轮岗，而是姓名被岗位磨损。", { flags: ["checked_three_year_contracts", "three_year_cycle_confirmed"], state: { managerTrueName: "吴阿姨", managerNameStability: "waning", managerTrustSignal: "document-first" }, clues: [clue(12)] }),
      option("B", "先检查历任宿管照片", "照片里的人从脸到姓名逐年消失，最后只剩一件还在摆姿势的绿色马甲。周朝阳把照片顺序抄进笔记。", { flags: ["checked_manager_photos", "manager_photo_fade_seen"], state: { managerNameStability: "waning", managerTrustSignal: "evidence-first" }, clues: [clue(12), clue(16)], relationships: [trust("trust_zhouchaoyang", 4, "先保留照片证据")] }),
      option("C", "先翻学生名单缺口", "名单缺口旁压着三枚黑羽，几个被送上四楼的学生姓名被折进同一行。固定人数规则开始露出代价。", { flags: ["checked_roster_gaps", "roster_debt_seen"], state: { rosterState: "manager-debt-marked", managerRulesTrust: "partial-trust" }, clues: [clue(7), clue(15)] }),
      option("D", "先打开羽毛柜", "羽毛柜没有护身符的摆法，每一缕都夹着学生姓名残片。持有者掌心的羽轴短暂分裂，又迅速发黑。", { flags: ["checked_feather_cabinet", "feather_debt_seen"], state: { featherState: "tainted", featherPollutionSource: "manager-debt" }, clues: [clue(11), clue(12)] }),
      option("E", "先寻找校长室路线", "服务电梯按钮下方写着两种开门条件：宿管旧钥匙，或被名单主动删除的学生账号。林峰的手机亮了一下，又显示用户不存在。", { flags: ["checked_principal_route_early", "principal_route_hint"], state: { principalOfficeRoute: "hinted-by-duty-room", namePollutionStage: 6 }, clues: [clue(7), clue(14)] }),
    ],
  });

  decision({
    code: "C26", nodeId: "nf04_c26", chapterId: chapterIds[4], scene: "namefloor_green_vest", blueprintSceneId: "DR-C4-S01",
    text: "胸牌上的姓氏恢复成“吴”。她停在三步之外：“把日记给我看。羽毛先别动。”绿色马甲可信，不代表穿它的人没有旧账。", nextNodeId: "nf04_010", defaultKey: "A",
    phoneScreen: phoneScreen({
      kind: "system", view: "documents", title: "宿管聘用材料", time: "03:34", signal: "none",
      messages: [
        { sender: "招聘启事", text: "高工资，包住宿，三年合同。" },
        { sender: "合同备注", text: "三年后姓名、照片、社会关系进入交接。" },
        { sender: "值班记录", text: "绿色马甲相对可信，但不代表绝对善意。" },
      ],
      systemNotice: "合同日期在眼前连续改写。",
    }),
    options: [
      option("A", "出示日记，但不交羽毛", "吴阿姨看见字迹后闭了闭眼：“是我写的。最后两页不是。”她指出了通往校长室的旧门。", { flags: ["wu_admitted_diary", "wu_route_available"], state: { managerTrueName: "吴阿姨", managerTrustSignal: "guarded-cooperation", principalOfficeRoute: "wu-old-door" }, clues: [clue(7), clue(12)], relationships: [trust("trust_wu", 8, "用日记核对身份但保留羽毛")] }),
      option("B", "指责她牺牲学生", "吴阿姨没有否认，只把手缩回马甲口袋：“那你来做这个位置，看看能救几个。”", { flags: ["accused_wu_sacrifice", "wu_wants_successor"], state: { managerTrueName: "吴阿姨", managerTrustSignal: "accused", managerSuccessorIntent: true }, relationships: [trust("trust_wu", -10, "只指责而拒绝了解旧账")] }),
      option("C", "保持沉默，只看马甲颜色", "她按规则避开对视，也不解释任何动机。绿色只能排除一条危险，不能替她证明全部选择。", { flags: ["trusted_wu_vest_only"], state: { managerRulesTrust: "partial-trust", managerTrustSignal: "withheld" }, clues: [clue(16)], relationships: [trust("trust_zhouchaoyang", 3, "暂缓向吴阿姨泄露信息")] }),
      option("D", "请她解释三年聘用制度", "吴阿姨掀开历任宿管照片：每三年一张，照片里的人都从姓名最后一笔开始褪色。", { flags: ["learned_three_year_contract", "wu_route_available"], state: { managerTrueName: "吴阿姨", managerNameStability: "waning", managerTrustSignal: "explained-contract", principalOfficeRoute: "wu-old-door" }, clues: [clue(12)], relationships: [trust("trust_wu", 8, "要求吴阿姨说明制度真相")] }),
      option("E", "假称已经见过校长", "吴阿姨下意识摸向腰间的旧钥匙。她很快识破谎话，却也暴露了校长室确有另一条入口。", { flags: ["bluffed_wu_about_principal", "saw_principal_key"], state: { namePollutionStage: 6, managerTrustSignal: "lied-to", principalOfficeRoute: "principal-key-seen" }, clues: [clue(12)] }),
    ],
  });

  line("nf04_010", chapterIds[4], "namefloor_feather_debt", "吴阿姨", "羽毛不是护身符。拿得越久，四楼越快找到你；交给别人，债也跟着过去。现在，把它还给我。", "nf04_c27", { blueprintSceneId: "DR-C4-S02", contentType: "dialogue", effectTags: ["feather-blacken-shed-split"], effects: [{ type: "focus-pulse", durationMs: 950, intensity: 0.3 }] });
  decision({
    code: "C27", nodeId: "nf04_c27", chapterId: chapterIds[4], scene: "namefloor_feather_debt", blueprintSceneId: "DR-C4-S02",
    contentType: "phone-text", text: "羽毛柜把每个持有人和债的去向并排显示。现在必须决定这笔债落在谁身上。", nextNodeId: "nf04_020", defaultKey: "D",
    phoneScreen: phoneScreen({
      kind: "system", view: "documents", title: "羽毛柜登记", time: "03:37", signal: "none",
      messages: [
        { sender: "羽毛柜", text: "锚定姓名：短效。" },
        { sender: "羽毛柜", text: "污染转移：立即生效。" },
        { sender: "羽毛柜", text: "四楼注意力：随持有人移动。" },
      ],
      systemNotice: "羽轴边缘发黑，绒毛正在脱落。",
    }),
    effectTags: ["feather-blacken-shed-split"],
    options: [
      option("A", "把羽毛原样归还", "吴阿姨的姓名在胸牌上短暂恢复，原持有者手腕却多出一道合同般的墨线。", { flags: ["feather_returned_to_wu", "feather_debt_transferred"], state: { featherHolder: "吴阿姨", featherState: "tainted", featherPollutionSource: "original-holder", managerNameStability: "briefly-stabilized" }, clues: [clue(11), clue(12)] }),
      option("B", "拒绝归还", "吴阿姨不再伸手。她看羽毛持有者的眼神，像在看三年前的自己。", { flags: ["refused_wu_feather"], state: { featherPollutionSource: "kept-by-team", managerTrustSignal: "refused-feather" }, relationships: [trust("trust_wu", -10, "拒绝讨论羽毛污染的去向")] }),
      option("C", "折下一缕给她", "一缕羽毛让吴阿姨的姓多撑了一会儿，剩下的羽轴却同时在两个人掌心发烫。", { flags: ["shared_feather_with_wu", "feather_debt_shared"], state: { featherState: "split-tainted", featherPollutionSource: "shared-manager-debt", managerNameStability: "shared-anchor" }, clues: [clue(11), clue(12)] }),
      option("D", "让周朝阳记录交换条件后归还", "周朝阳写下只有在场人知道的条件：吴阿姨带路，羽毛暂归她，离门后必须归还。这成为无法从旧日记复制的新事实。", { flags: ["private_wu_exchange", "feather_returned_conditionally"], state: { featherHolder: "吴阿姨", featherState: "tainted", featherPollutionSource: "conditional-exchange", managerTrustSignal: "conditional-cooperation" }, clues: [clue(10), clue(11), clue(12)], relationships: [trust("trust_zhouchaoyang", 6, "记录未公开交换条件"), trust("trust_wu", 8, "以可验证条件交换羽毛")] }),
      option("E", "把羽毛交给伤得最重的人", "伤口停止渗血，墙后的脚步却立刻加快。那个人活了下来，终局钉住名册的机会少了一次。", { flags: ["feather_saved_wounded", "feather_final_use_spent"], state: { featherHolder: "重伤者", featherState: "spent-tainted", featherPollutionSource: "wounded-student", rosterState: "quota-tightened" }, clues: [clue(11)], relationships: [trust("trust_guyu", 6, "优先救治重伤者")] }),
    ],
  });

  line("nf04_020", chapterIds[4], "namefloor_wu_old_accounts", "旁白", "历任宿管照片墙后藏着一叠三年合同。吴阿姨的签名从完整、缺笔到只剩一个墨点；每张合同背面都有被送上四楼的学生名字。", "nf04_c28", { blueprintSceneId: "DR-C4-S03", effectTags: ["contract-date-shift", "manager-photo-fade", "name-record-fade", "three-year-flashback"] });
  decision({
    code: "C28", nodeId: "nf04_c28", chapterId: chapterIds[4], scene: "namefloor_wu_old_accounts", blueprintSceneId: "DR-C4-S03",
    text: "吴阿姨承认自己救过人，也按规则送过人。她把钥匙横在掌心，等林峰决定怎样处理这份旧账。", nextNodeId: "nf04_c29", defaultKey: "A",
    phoneScreen: phoneScreen({
      kind: "system", view: "documents", title: "旧账分段记录", time: "03:42", signal: "none",
      messages: [
        { sender: "救援记录", text: "她确实曾把学生从四楼门缝前拉回。" },
        { sender: "处分空白", text: "她也曾按羽毛规则送走学生，换取自己姓名延续。" },
        { sender: "未归档路线", text: "校长室路线可由旧钥匙或删除账号触发。" },
      ],
      systemNotice: "录音、人影和照片没有完全同步。",
    }),
    options: [
      option("A", "理解旧账，但要求她带路赎罪", "吴阿姨掰开旧钥匙，把带齿的一半交给林峰：“另一半在校长室。我带你们到门口。”", { flags: ["wu_redemption_route", "half_principal_key"], state: { managerTrustSignal: "redemption-route", principalOfficeRoute: "wu-half-key", managerSuccessorIntent: false }, clues: [clue(12)], relationships: [trust("trust_wu", 10, "要求以行动偿还旧账")] }),
      option("B", "只指责，拒绝合作", "吴阿姨收回钥匙。她没有争辩，也没有再告诉他们名册回廊的捷径。", { flags: ["rejected_wu_cooperation"], state: { managerTrustSignal: "rejected", principalOfficeRoute: "unknown" }, relationships: [trust("trust_wu", -12, "拒绝与吴阿姨继续合作")] }),
      option("C", "强迫她走在最危险的位置", "吴阿姨走到最前面，绿色马甲却始终没有背对学生。她的沉默比服从更像告别。", { flags: ["forced_wu_front", "wu_high_risk"], state: { managerTrustSignal: "coerced", managerSaved: false }, relationships: [trust("trust_wu", -12, "强迫吴阿姨承担危险")] }),
      option("D", "自愿提出接任宿管", "羽毛无风转向林峰，合同空白处浮出他的姓。吴阿姨第一次真正慌了：“别替我签。”", { flags: ["lin_offered_manager_succession", "lin_continuity_broken"], state: { namePollutionStage: 7, promisedManagerSuccession: true, managerSuccessorIntent: true }, clues: [clue(12), clue(16)] }),
      option("E", "抛下吴阿姨", "她独自留在照片墙前。走出很远后，钥匙落地的声音才从后方传来。", { flags: ["abandoned_wu", "wu_high_risk"], state: { managerSaved: false, managerTrustSignal: "abandoned" }, relationships: [trust("trust_wu", -14, "抛下吴阿姨")] }),
      option("F", "承诺把她的真名带出去", "吴阿姨在所有设备都关掉后说出未记录的本名，并把另一条校长室路线画在林峰掌心。", { flags: ["promised_remember_wu", "wu_new_name_anchor", "wu_route_available"], state: { managerTrueName: "吴阿姨", managerNameStability: "outside-record-anchor", managerTrustSignal: "trusted", principalOfficeRoute: "palm-route" }, clues: [clue(10), clue(12), clue(16)], relationships: [trust("trust_wu", 12, "承诺在制度外记住吴阿姨")] }),
    ],
  });

  decision({
    code: "C29", nodeId: "nf04_c29", chapterId: chapterIds[4], scene: "namefloor_double_wu", blueprintSceneId: "DR-C4-S03",
    text: "转角同时走出两个吴阿姨。两件马甲起初一红一绿，眨眼后却都变成了绿色。", nextNodeId: "nf04_030", durationMs: 5000, fallbackKey: "T", defaultKey: "A",
    effectTags: ["green-vest-red-shift", "wu-voice-image-desync"],
    options: [
      option("A", "问刚才未公开的羽毛交换条件", "真吴阿姨答出归还羽毛的时机，另一个只会背诵抽屉规则。周朝阳立刻指向真正的带路者。", { flags: ["verified_real_wu_private_exchange", "real_wu_identified"], clues: [clue(10), clue(12), clue(16)], relationships: [trust("trust_zhouchaoyang", 6, "使用未公开新事实验真")] }),
      option("B", "只看马甲颜色", "两件马甲同时变绿，布料纤维甚至一样磨损。颜色规则无法处理复制之后的第二层问题。", { flags: ["wu_tested_by_vest_only"], clues: [clue(16)] }),
      option("C", "询问旧日记里的往事", "两个吴阿姨逐字说出同一段旧事，连哽咽的位置都一样。过去已经被复制。", { flags: ["wu_tested_by_old_memory_only"], clues: [clue(12), clue(16)] }),
      option("D", "让两人各承担一次开门风险", "真吴阿姨先把学生挡到身后，伪装者只会机械背诵返回宿舍的规则。选择把它们分开了。", { flags: ["verified_real_wu_new_choice", "real_wu_identified"], clues: [clue(10), clue(16)], relationships: [trust("trust_zhouchaoyang", 6, "用自愿承担风险区分双吴")] }),
      option("E", "直接攻击先靠近的人", "靠近者倒下。只有信任已经建立时，林峰才击中了伪装者；否则，钥匙从真正的吴阿姨手中滑落。", { flags: ["attacked_wu_without_test", "possible_real_wu_killed", "misjudged_human"], state: { managerSaved: false, managerTrustSignal: "attacked-untested" }, relationships: [trust("trust_guyu", -10, "未验真便攻击靠近者")] }),
      option("T", "跟随最先伸手的人", "最先伸手的“吴阿姨”把队伍领进名册回廊。身后的真吴没有追上来，绿色马甲在门缝里慢慢染红。", { timeoutOnly: true, flags: ["followed_fake_wu", "wu_may_die_behind", "roster_corridor_detour"], state: { namePollutionStage: 7, managerSaved: false, managerTrustSignal: "followed-fake" } }),
    ],
  });

  line("nf04_030", chapterIds[4], "namefloor_successor_door", "旁白", "旋转铁门上没有把手，只有一圈扫描姓名的冷光。它允许队伍通过，却要求一个人最后留下，听完整个名字。", "nf04_c30", { blueprintSceneId: "DR-C4-S04", effectTags: ["name-record-fade", "fourth-floor-reality-cover"] });
  decision({
    code: "C30", nodeId: "nf04_c30", chapterId: chapterIds[4], scene: "namefloor_successor_door", blueprintSceneId: "DR-C4-S04",
    text: "门开始旋转。最后通过的人会被叫出全名，可能被锁住、复制，或写成下一任宿管。", nextNodeId: "nf04_040", durationMs: 7000, fallbackKey: "T", defaultKey: "D",
    phoneScreen: phoneScreen({
      kind: "system", view: "documents", title: "身份门扫描", time: "03:51", signal: "none",
      messages: [
        { sender: "门禁", text: "最后通过者将被完整姓名扫描。" },
        { sender: "名册", text: "可登记下一任宿管，也可锁定被删除学生。" },
      ],
      systemNotice: "冷光正在擦淡门牌上的姓名。",
    }),
    options: [
      option("A", "林峰最后通过", "冷光读出“林峰”，又在最后一笔停顿。门后走出的人呼吸连续，影子却断过一次。", { flags: ["lin_last_through_identity_door", "lin_continuity_broken"], state: { namePollutionStage: 7, promisedManagerSuccession: true }, clues: [clue(16)] }),
      option("B", "周朝阳最后通过", "周朝阳把笔记先扔过门，自己留在最后。扫描光割开他的肩，纸页却完整落到林峰脚边。", { flags: ["zhou_last_through_identity_door", "zhou_severely_wounded"], clues: [clue(16)] }),
      option("C", "谷雨最后通过", "谷雨一边后退一边叫林峰的名字。门记住了他的声音，也从他自己的名字上刮走一笔。", { flags: ["guyu_last_through_identity_door", "guyu_anchor_burden"], relationships: [trust("trust_guyu", 8, "谷雨自愿最后通过")] }),
      option("D", "同行宋明最后通过", "宋明等所有人越门才松手。扫描光叫出他的全名时，他没有回头，只催其他人先走。", { flags: ["song_last_through_identity_door", "song_voluntary_risk"], clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 10, "宋明自愿承担最后通过风险")] }),
      option("E", "吴阿姨最后通过", "吴阿姨把绿色马甲卡进门轴。她的姓名被读到只剩一个音，钥匙却从缝里抛给了学生。", { flags: ["wu_last_through_identity_door", "wu_severely_wounded"], state: { managerSaved: false, managerNameStability: "near-erased" }, clues: [clue(12)] }),
      option("F", "让有自我的伪人自愿最后通过", "他先确认这不是命令，才站到门后。旧记录里没有这次选择，门因此迟疑了整整一秒。", { flags: ["mimic_last_through_identity_door", "mimic_voluntary_risk", "song_mimic_self_aware"], clues: [clue(10), clue(16)] }),
      option("T", "来不及安排，当前羽毛持有者最后通过", "门循着羽毛锁定持有者，完整叫出他的名字。黑羽护住身体一次，姓名却被推进了两层。", { timeoutOnly: true, flags: ["feather_holder_forced_last", "feather_holder_severely_wounded"], state: { featherState: "burned", featherPollutionSource: "identity-door", namePollutionStage: 8 } }),
    ],
  });

  line("nf04_040", chapterIds[4], "namefloor_green_no_answer", "旁白", "门合拢后，吴阿姨或她留下的钥匙和录音躺在地上。绿色马甲没有回答身份问题，它只把一任宿管的余债留给活人。", "nf04_c31", { blueprintSceneId: "DR-C4-S05", effectTags: ["manager-photo-fade", "name-record-fade", "wu-voice-image-desync"] });
  decision({
    code: "C31", nodeId: "nf04_c31", chapterId: chapterIds[4], scene: "namefloor_green_no_answer", blueprintSceneId: "DR-C4-S05",
    text: "校长室钥匙和最后两页日记还在。救吴阿姨、留下她，或只带走遗物，都会决定三年循环怎样结束。", nextNodeId: "nf05_001", defaultKey: "C",
    phoneScreen: phoneScreen({
      kind: "system", view: "documents", title: "校长室路线", time: "03:58", signal: "none",
      messages: [
        { sender: "旧钥匙", text: "钥匙转两次，第三次不要念任何人的名字。" },
        { sender: "最后日记", text: "名单开始主动删除学生时，必须进校长室。" },
        { sender: "录音", text: "如果我不在了，别让羽毛替学校找下一个人。" },
      ],
      systemNotice: "林峰所在行正在从名单边缘褪色。",
    }),
    options: [
      option("A", "用羽毛救她", "羽毛替吴阿姨补回姓名，她从门边站了起来。污染沿羽轴转进原持有者掌心。", { flags: ["wu_saved_with_feather"], state: { managerSaved: true, managerNameStability: "feather-stabilized", featherHolder: "原持有者", featherState: "spent-tainted", featherPollutionSource: "saved-manager", principalOfficeRoute: "wu-led-route" }, clues: [clue(11), clue(12)] }),
      option("B", "只拿钥匙离开", "吴阿姨没有追来。学校随后会把这条走廊上的一切责任重新写到学生名下。", { flags: ["wu_abandoned_for_key", "wu_dead_or_trapped"], state: { managerSaved: false, managerTrustSignal: "abandoned-at-key", principalOfficeRoute: "key-only", rosterState: "linfeng-erasing" }, relationships: [trust("trust_guyu", -10, "只取钥匙而放弃吴阿姨")] }),
      option("C", "记录她完整姓名，并承诺公开", "林峰把她的姓名写在校规背面。吴阿姨交出名单缺口：每恢复一个学生，另一个位置就会被挤掉。", { flags: ["wu_name_preserved", "wu_roster_gap_revealed"], state: { managerSaved: true, managerNameStability: "remembered-outside-record", managerTrustSignal: "name-preserved", principalOfficeRoute: "roster-gap-route", rosterState: "linfeng-erasing" }, clues: [clue(7), clue(12), clue(15)], relationships: [trust("trust_wu", 10, "在学校记录外保留吴阿姨姓名")] }),
      option("D", "让她自愿留守封门", "吴阿姨主动穿回绿色马甲，反锁旋转门。她留下的不是命令，而是一次不再把债推给学生的选择。", { flags: ["wu_voluntary_last_guard", "wu_redemption_complete"], state: { managerSaved: false, managerTrustSignal: "voluntary-guard", principalOfficeRoute: "wu-recording-route", rosterState: "linfeng-erasing" }, clues: [clue(7), clue(12)], relationships: [trust("trust_wu", 10, "尊重吴阿姨自愿赎罪")] }),
      option("E", "若她已死，播放定时录音", "录音在她无法开口后继续：“钥匙转两次，第三次不要念任何人的名字。”死者仍把路线送到了校长室。", { flags: ["played_wu_timed_recording", "principal_password_known"], state: { managerSaved: false, managerTrustSignal: "recording-only", principalOfficeRoute: "timed-recording", rosterState: "linfeng-erasing" }, clues: [clue(7), clue(12)] }),
    ],
  });

  line("nf05_001", chapterIds[5], "namefloor_blank_contacts", "旁白", "林峰的手机震动。通讯录里没有他，班群里也查不到他发过的消息；四十二名成员中，黑色头像仍占着原来的位置。", "nf05_c32", {
    blueprintSceneId: "DR-C5-S01",
    effectTags: ["contact-name-drop", "group-member-replaced", "phone-record-attribution-shift"],
    phoneScreen: phoneScreen({
      kind: "group", view: "members", title: "宿舍群", time: "04:06", memberCount: 42,
      members: [
        { name: "周朝阳" },
        { name: "谷雨" },
        { name: "宋明" },
        { name: "黑色头像", isBlackAvatar: true },
      ],
      messages: [
        { sender: "系统", text: "林峰：用户不存在。" },
        { sender: "黑色头像", text: "这句话本来是你会说的。" },
      ],
      systemNotice: "原始短信已保存时可读取镜像时间戳；原始短信已删除时只能从他人手机找残留。",
    }),
  });
  decision({
    code: "C32", nodeId: "nf05_c32", chapterId: chapterIds[5], scene: "namefloor_blank_contacts", blueprintSceneId: "DR-C5-S01",
    text: "电子记录已经拒绝林峰。接下来用谁的记忆把他留在队伍里？", nextNodeId: "nf05_c33", defaultKey: "B",
    effectTags: ["contact-name-drop", "group-member-replaced", "phone-record-attribution-shift"],
    options: [
      option("A", "从开场截图恢复联系人", "号码恢复了，头像却变成另一个林峰的脸。截图只能证明这台手机曾认识一个号码。", { flags: ["restored_contact_from_screenshot"], state: { namePollutionStage: 4, linfengPhotoState: "second-face-linked", teamAcceptsLinfeng: true }, clues: [clue(1), clue(14), clue(16)] }),
      option("B", "让周朝阳在纸上重复写名", "周朝阳把“林峰”写进每一段时间线。即使他不能继续走，笔记也会替他保留这个判断。", { flags: ["zhou_repeated_linfeng_on_paper", "lin_logic_anchor"], state: { namePollutionStage: 4, zhouTrustSignal: "paper-anchor", nameAnchorCompleted: true, teamAcceptsLinfeng: true }, clues: [clue(14), clue(16)], relationships: [trust("trust_zhouchaoyang", 8, "周朝阳用纸质时间线锚名")] }),
      option("C", "让谷雨不断口头重复", "谷雨每喊一次，林峰的联系人就亮回一秒；谷雨自己的名字则从未发送语音里少一笔。", { flags: ["guyu_oral_anchor", "guyu_anchor_seed"], state: { guyuMemoryDegree: "strained-anchor", nameAnchorCompleted: true, teamAcceptsLinfeng: true }, relationships: [trust("trust_guyu", 10, "谷雨持续以声音锚定林峰")] }),
      option("D", "让同行宋明描述林峰", "宋明说出林峰今晚挡门时的动作，却说不出入学时的床位。缺口本身成为判断双宋明的证据。", { flags: ["song_described_linfeng", "song_recognition_test"], state: { songIdentityJudgment: "recognizes-new-actions", teamAcceptsLinfeng: true }, clues: [clue(10), clue(16)] }),
      option("E", "暂不处理，以免泄露姓名", "没有人再叫他。短短十步后，谷雨转身问周朝阳：‘刚才是不是还有个人？’", { flags: ["left_linfeng_unanchored"], state: { namePollutionStage: 6, guyuMemoryDegree: "missing-recent-detail", teamAcceptsLinfeng: false } }),
    ],
  });

  decision({
    code: "C33", nodeId: "nf05_c33", chapterId: chapterIds[5], scene: "namefloor_blank_contacts", blueprintSceneId: "DR-C5-S01",
    contentType: "phone-text", text: "存档标题自行变成《□□□□》。输入框要求重新命名这段经历。", nextNodeId: "nf05_010", durationMs: 6000, fallbackKey: "T", defaultKey: "D",
    phoneScreen: { kind: "system", view: "save", title: "存档标题", time: "06:00", messages: [{ sender: "系统", text: "《□□□□》" }] },
    effectTags: ["written-name-erased", "name-anchor-recovery-backlash", "speaker-name-controlled-loss"],
    options: [
      option("A", "手动输入“林峰”", "标题恢复了一秒，随即出现两个同名存档。另一份存档开始补全今晚的行为记录。", { flags: ["typed_linfeng_save_title", "second_linfeng_save_created"], state: { namePollutionStage: 6, nameAnchorCompleted: true, blackAvatarStage: "imitating-linfeng" }, clues: [clue(13), clue(14)] }),
      option("B", "只保存为“峰”", "不完整的名字避开了复制，仍足够让林峰记住自己被谁叫过。", { flags: ["saved_as_feng_only"], state: { nameAnchorCompleted: true }, clues: [clue(13)] }),
      option("C", "保存到谷雨名下", "存档留下了，谷雨的姓名却在标题栏里少了一笔。他没有抱怨，只把手机还给林峰。", { flags: ["saved_under_guyu", "guyu_anchor_burden"], state: { namePollutionStage: 5, guyuMemoryDegree: "pollution-transferred", nameAnchorCompleted: true }, relationships: [trust("trust_guyu", 8, "谷雨承接存档污染")] }),
      option("D", "保存为周朝阳的笔记编号", "无名编号保留了因果，却没有向四楼再喂一个姓名。周朝阳把编号写进原笔记。", { flags: ["saved_under_zhou_note_number"], state: { zhouTrustSignal: "numbered-anchor", nameAnchorCompleted: true }, clues: [clue(13), clue(14)], relationships: [trust("trust_zhouchaoyang", 8, "使用无名编号保存因果")] }),
      option("E", "取消保存", "这一段无法回看。队伍继续前进，手机里的时间线却留下一个干净得可疑的空洞。", { flags: ["cancelled_corrupted_save"], state: { namePollutionStage: 6, nameAnchorCompleted: false } }),
      option("T", "让系统自动保存", "黑色头像出现在标题栏，接管了这份存档。林峰看见一枚来自未来的阅读标记。", { timeoutOnly: true, flags: ["black_avatar_owns_save", "future_linfeng_reads_choices"], state: { namePollutionStage: 7, blackAvatarStage: "save-owner", nameAnchorCompleted: false }, clues: [clue(13), clue(14)] }),
    ],
  });

  line("nf05_010", chapterIds[5], "namefloor_changed_photo", "旁白", "班级合照在刷新。林峰原本站的位置被另一张相同的脸覆盖；群成员人数仍是四十二，没有任何新增提示。", "nf05_c34", {
    blueprintSceneId: "DR-C5-S02",
    effectTags: ["photo-blur-misaligned", "identity-overlap", "group-member-replaced"],
    phoneScreen: phoneScreen({
      kind: "system", view: "gallery", title: "班级合照", time: "06:04",
      messages: [
        { sender: "相册", text: "合照：林峰位置模糊，边缘出现另一张相同的脸。" },
        { sender: "名单", text: "学生名单中林峰所在行正被归到黑色头像名下。" },
      ],
      systemNotice: "合照和名单正在互相覆盖。",
    }),
    namePollutionHistory: [{ stage: 5, visibleCarrier: "班级合照中的林峰被另一张相同的脸替换" }],
  });
  decision({
    code: "C34", nodeId: "nf05_c34", chapterId: chapterIds[5], scene: "namefloor_changed_photo", blueprintSceneId: "DR-C5-S02",
    contentType: "phone-text", text: "黑色头像发来私聊：别再证明你是谁。消息正在逐字撤回。", nextNodeId: "nf05_020", defaultKey: "B",
    phoneScreen: { kind: "private", view: "message", title: "黑色头像", time: "06:05", memberCount: 42, messages: [{ sender: "黑色头像", text: "别再证明你是谁。" }] },
    effectTags: ["black-avatar-linfeng-language", "phone-record-attribution-shift", "identity-overlap"],
    options: [
      option("A", "不报姓名，只问它在哪个时间", "对方回复“十二点”。手机显示发送于未来，接收于今晚的开场时刻。", { flags: ["asked_black_avatar_time_safely"], state: { blackAvatarStage: "loop-time-hinted", linfengPhotoState: "second-face-visible" }, clues: [clue(2), clue(13)] }),
      option("B", "发送开场短信截图", "两张相同短信的时间戳互成镜像。警告不是外来入侵，而是从这条夜晚的另一端返回。", { flags: ["matched_loop_timestamps", "black_avatar_future_linfeng_evidence"], state: { blackAvatarStage: "failed-loop-linfeng", linfengPhotoState: "loop-linked" }, clues: [clue(1), clue(13)] }),
      option("C", "发送无声手势", "黑色头像正确回了今晚临时改过的手势。它不是只会复制旧记录的东西。", { flags: ["black_avatar_new_memory_verified", "black_avatar_future_linfeng_evidence"], state: { namePollutionStage: 5, blackAvatarStage: "new-memory-verified", linfengPhotoState: "new-choice-linked" }, clues: [clue(10), clue(13)] }),
      option("D", "质问它为何占据群位置", "一张成员变更记录闪过：黑色头像没有加入群，它覆盖的正是林峰原来的位置。总人数始终是四十二。", { flags: ["black_avatar_slot_truth", "black_avatar_future_linfeng_evidence"], state: { blackAvatarStage: "slot-revealed", rosterState: "black-avatar-in-linfeng-row" }, clues: [clue(2), clue(14)] }),
      option("E", "再次拉黑", "会话消失，手机仍在掌心震动。没有窗口显示消息，也没有办法证明是谁在敲。", { flags: ["blocked_black_avatar_again"], state: { namePollutionStage: 6, blackAvatarStage: "blocked-but-present" } }),
    ],
  });

  line("nf05_020", chapterIds[5], "namefloor_guyu_forgets", "谷雨", "峰哥，我们是不是……今天才认识？我知道我信你，可我想不起为什么。", "nf05_c35", { blueprintSceneId: "DR-C5-S03", contentType: "dialogue", effectTags: ["speaker-name-controlled-loss", "name-anchor-recovery-backlash"], namePollutionHistory: [{ stage: 6, visibleCarrier: "谷雨开始忘记与林峰的共同经历" }, { stage: 7, visibleCarrier: "林峰无法完整说出自己的姓名" }] });
  decision({
    code: "C35", nodeId: "nf05_c35", chapterId: chapterIds[5], scene: "namefloor_guyu_forgets", blueprintSceneId: "DR-C5-S03",
    text: "周朝阳的笔记夹层掉出一页：他早就发现林峰从名单消失，却一直没有说。", nextNodeId: "nf05_c36", defaultKey: "A",
    options: [
      option("A", "让周朝阳完整解释", "周朝阳承认反复问名不是审讯，是锚定。他怕说破后，四楼会更快学会林峰。", { flags: ["zhou_explained_hidden_notes", "zhou_timeline_available"], state: { zhouTrustSignal: "explained-hidden-anchor", teamAcceptsLinfeng: true }, clues: [clue(7), clue(16)], relationships: [trust("trust_zhouchaoyang", 10, "允许周朝阳完整说明隐瞒动机")] }),
      option("B", "指责并夺走笔记", "笔记到了林峰手里，周朝阳却不再为他的连续性作证。证据还在，证人之间的信任断了。", { flags: ["seized_zhou_notes", "zhou_trust_broken"], state: { zhouTrustSignal: "broken", teamAcceptsLinfeng: false }, relationships: [trust("trust_zhouchaoyang", -18, "指责并夺走笔记")] }),
      option("C", "让谷雨调解", "谷雨说出周朝阳今晚每次挡在门前的细节。就算记忆缺字，人的行动仍能把动机补回来。", { flags: ["guyu_mediated_zhou_conflict"], state: { guyuMemoryDegree: "partial-but-defending", zhouTrustSignal: "mediated", teamAcceptsLinfeng: true }, clues: [clue(16)], relationships: [trust("trust_zhouchaoyang", 6, "接受谷雨调解"), trust("trust_guyu", 6, "让谷雨参与修复信任")] }),
      option("D", "只核对时间线，不谈动机", "三个人把每个时间戳重新排好，维持了协作，却把那道情绪裂口留到了出口。", { flags: ["zhou_working_trust_only", "zhou_timeline_available"], state: { zhouTrustSignal: "working-only", teamAcceptsLinfeng: true }, clues: [clue(7), clue(16)] }),
      option("E", "当众承诺不会因证据不利先放逐同伴", "林峰让所有人听清：“记录可以错。我会先看你今晚怎么选，不会先把你留下。”这句承诺没有被设备录下。", { flags: ["explicit_trust_promise"], state: { teamAcceptsLinfeng: true, nameAnchorCompleted: true }, clues: [clue(10), clue(16)], relationships: [trust("trust_zhouchaoyang", 10, "作出不先放逐同伴的承诺"), trust("trust_guyu", 10, "作出不先放逐同伴的承诺")] }),
    ],
  });

  decision({
    code: "C36", nodeId: "nf05_c36", chapterId: chapterIds[5], scene: "namefloor_guyu_forgets", blueprintSceneId: "DR-C5-S03",
    speaker: "谷雨", contentType: "dialogue", text: "我记得害怕，也记得不想丢下你。可共同经历全乱了。现在怎么办？", nextNodeId: "nf05_030", defaultKey: "B",
    effectTags: ["name-anchor-recovery-backlash", "speaker-name-controlled-loss"],
    options: [
      option("A", "让谷雨反复背诵旧经历", "谷雨越背越熟，走廊深处另一个声音也越背越像。旧经历正在变成四楼的教材。", { flags: ["forced_guyu_old_memories"], state: { namePollutionStage: 7, guyuMemoryDegree: "old-memory-contaminated", nameAnchorCompleted: false }, relationships: [trust("trust_guyu", -8, "强迫谷雨背诵受污染的旧记忆")] }),
      option("B", "创造一个不拍摄的新约定", "他们约定天亮后谁先喊饿，另一个就去买最难吃的早餐。这句话没有进入任何设备，谷雨终于笑了一下。", { flags: ["guyu_new_unrecorded_memory", "guyu_trust_stable"], state: { namePollutionStage: 6, guyuMemoryDegree: "new-memory-anchor", nameAnchorCompleted: true }, clues: [clue(10), clue(16)], relationships: [trust("trust_guyu", 12, "与谷雨创造不可复制的新记忆")] }),
      option("C", "把羽毛交给谷雨，让他继续喊林峰", "谷雨把羽毛贴在胸口，一声声叫回林峰。每一次锚定，都有一笔墨从林峰名字移到谷雨身上。", { flags: ["guyu_anchor_burden", "guyu_trust_stable", "guyu_new_unrecorded_memory"], state: { featherHolder: "谷雨", featherState: "tainted", featherPollutionSource: "linfeng-name-anchor", namePollutionStage: 6, guyuMemoryDegree: "bearing-pollution", nameAnchorCompleted: true }, clues: [clue(10), clue(11)], relationships: [trust("trust_guyu", 14, "谷雨主动承接林峰的姓名污染")] }),
      option("D", "纠正细节并录音", "录音保存了正确说法，也把它送给了走廊。播放第二遍时，背景里多了一个谷雨的声音。", { flags: ["recorded_corrected_guyu_memory"], state: { namePollutionStage: 7, guyuMemoryDegree: "recorded-and-copied", nameAnchorCompleted: false }, clues: [clue(13)] }),
      option("E", "接受他忘记，停止锚定", "谷雨不再被逼着回忆，呼吸慢慢稳定。可下一次回头，他已经叫不出“峰哥”。", { flags: ["stopped_guyu_anchor"], state: { namePollutionStage: 7, guyuMemoryDegree: "forgotten-by-choice", nameAnchorCompleted: false }, relationships: [trust("trust_guyu", -4, "停止让谷雨参与锚名")] }),
    ],
  });

  line("nf05_030", chapterIds[5], "namefloor_two_songmings", "旁白", "同行宋明的手机响了。来电显示也是“宋明”，声音从复制宿舍深处传来；两端共享旧记忆，却只有一端经历了刚才的选择。", "nf05_c37", {
    blueprintSceneId: "DR-C5-S04",
    effectTags: ["identity-overlap", "phone-record-attribution-shift"],
    phoneScreen: phoneScreen({
      kind: "private", view: "incoming-call", title: "宋明", time: "06:21",
      messages: [
        { sender: "来电", text: "同名账号正在复制宿舍深处呼叫。" },
        { sender: "账号提示", text: "旧经历相同，今晚选择不同。" },
      ],
      systemNotice: "两端呼吸不同步。",
    }),
  });
  decision({
    code: "C37", nodeId: "nf05_c37", chapterId: chapterIds[5], scene: "namefloor_two_songmings", blueprintSceneId: "DR-C5-S04",
    text: "同行宋明看着林峰：“我的账号认识你，可我不认识。到底是你被删了，还是我不是原来的宋明？”", nextNodeId: "nf05_040", defaultKey: "A",
    options: [
      option("A", "提醒复制宿舍里的新事件", "他想起那条没被设备记录的毛巾位置。记忆不是旧档案，却确实在今晚共同发生。", { flags: ["song_new_memory_verified", "song_recognition_restored"], state: { songIdentityJudgment: "new-event-recognized", teamAcceptsLinfeng: true }, clues: [clue(10), clue(16)] }),
      option("B", "出示学籍", "宋明只认得档案里的另一个林峰。合法记录越完整，玩家林峰在他眼里越像闯入者。", { flags: ["song_trusted_legal_records", "legal_linfeng_records_stronger"], state: { namePollutionStage: 7, songIdentityJudgment: "legal-records-over-current-lin", teamAcceptsLinfeng: false } }),
      option("C", "问他是否愿意替林峰承担一次风险", "他先问林峰愿不愿意换回来，再走到最危险的位置。这个回答不是旧宋明留给他的。", { flags: ["song_voluntary_risk", "song_mimic_self_aware", "song_new_choice_verified"], state: { songIdentityJudgment: "voluntary-risk-recognized", teamAcceptsLinfeng: true }, clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 10, "以自愿承担风险确认主体选择")] }),
      option("D", "让谷雨判断语气", "谷雨说，词句像宋明，停顿却不像。他没有因此判死刑，只把差异保留下来。", { flags: ["guyu_noted_song_voice_difference"], state: { songIdentityJudgment: "voice-difference-kept", guyuMemoryDegree: "tone-judge-stable" }, clues: [clue(16)], relationships: [trust("trust_guyu", 6, "保留双宋明的语气差异")] }),
      option("E", "因恐惧把他锁在门外", "铁门隔开同行宋明。他在另一侧提醒林峰曾答应不会先放逐他，随后真正的人声被追赶者淹没。", { flags: ["song_exiled_after_promise", "trusted_then_abandoned", "misjudged_human", "wrong_exile_proven"], state: { songIdentityJudgment: "exiled", teamAcceptsLinfeng: false }, relationships: [trust("recognition_songming", -18, "因恐惧放逐可能是真人的同行宋明")] }),
      option("F", "让他自己选择一个新名字", "他没有从学籍里挑，也没有借用死者的姓名，只选了一个今晚才有意义的称呼。这是模仿者第一次不按模板作答。", { flags: ["song_chose_new_name", "song_mimic_self_aware", "song_new_memory_verified"], state: { songIdentityJudgment: "new-name-self-aware", teamAcceptsLinfeng: true }, clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 12, "承认同行者自行选择新名字")] }),
    ],
  });

  line("nf05_040", chapterIds[5], "namefloor_black_avatar_truth", "旁白", "两个“林峰”账号同时来电。屏幕倒影里，黑色头像短暂显出林峰失去五官后的轮廓；它占据的仍是他的原群位置。", "nf05_c38", { blueprintSceneId: "DR-C5-S05", effectTags: ["black-avatar-linfeng-language", "identity-overlap", "fourth-floor-reality-cover"], namePollutionHistory: [{ stage: 8, visibleCarrier: "不存在的四楼开始覆盖现实出口，黑色头像显出未来林峰轮廓" }] });
  decision({
    code: "C38", nodeId: "nf05_c38", chapterId: chapterIds[5], scene: "namefloor_black_avatar_truth", blueprintSceneId: "DR-C5-S05",
    contentType: "phone-text", text: "一个来电来自林峰手中的手机，另一个来自四楼深处。接通任何一端，都可能让两份身份开始同步。", nextNodeId: "nf05_050", durationMs: 8000, fallbackKey: "T", defaultKey: "C",
    phoneScreen: { kind: "system", view: "incoming-calls", title: "同名来电", time: "06:35", memberCount: 42, messages: [{ sender: "系统", text: "林峰 · 两个来电同时接入" }, { sender: "黑色头像", text: "你会选录屏，因为我当时也是。" }] },
    effectTags: ["identity-overlap", "fourth-floor-reality-cover", "black-avatar-linfeng-language"],
    options: [
      option("A", "接听手中手机", "听筒里只有林峰自己的呼吸，慢半拍重复。手中这份身份因此变得更稳，也更像一段回放。", { flags: ["answered_handset_linfeng_call"], state: { namePollutionStage: 7, blackAvatarStage: "failed-loop-linfeng", principalOfficeRoute: "handset-call-clue" }, clues: [clue(13), clue(16)] }),
      option("B", "接听深处来电", "家人的声音从深处叫出“林峰”。另一个林峰在走廊尽头睁开眼，合法记录随之更加牢固。", { flags: ["answered_deep_linfeng_call", "legal_linfeng_records_stronger"], state: { namePollutionStage: 7, blackAvatarStage: "legal-life-overlap", principalOfficeRoute: "deep-call-clue" }, clues: [clue(13), clue(16)] }),
      option("C", "同时录屏，但不接听", "录屏保住两个同号来电并存的证据。谁都没有获得交换另一端身份的机会。", { flags: ["recorded_dual_linfeng_calls"], state: { blackAvatarStage: "dual-call-recorded", principalOfficeRoute: "dual-call-evidence" }, clues: [clue(13), clue(16)] }),
      option("D", "让周朝阳接听", "周朝阳只听三秒便挂断，记下两个呼吸之间固定的时间差。差异没有被任何一端吞掉。", { flags: ["zhou_measured_dual_call_gap"], state: { zhouTrustSignal: "dual-call-measured", principalOfficeRoute: "zhou-call-gap" }, clues: [clue(13), clue(16)], relationships: [trust("trust_zhouchaoyang", 8, "由周朝阳记录双来电时间差")] }),
      option("E", "让谷雨只听语气", "谷雨没有回应，只听出一端在害怕失去名字，另一端在害怕失去合法生活。两种恐惧都是真的。", { flags: ["guyu_heard_dual_linfeng_fear"], state: { guyuMemoryDegree: "dual-fear-recognized", principalOfficeRoute: "guyu-tone-route" }, clues: [clue(13), clue(16)], relationships: [trust("trust_guyu", 8, "让谷雨保留双林的情绪差异")] }),
      option("F", "关机，循声寻找实体", "屏幕熄灭后，深处的铃声仍在响。队伍沿实体声源找到了校长室方向。", { flags: ["found_principal_route_by_call"], state: { principalOfficeRoute: "physical-ringtone" }, clues: [clue(13), clue(16)] }),
      option("T", "任由两个来电自动接通", "两端同时传出“喂”。旧记忆开始逐句同步，双林唯一可见的差异被四楼抹平。", { timeoutOnly: true, flags: ["dual_linfeng_memories_synchronized", "identity_unresolved"], state: { namePollutionStage: 8, blackAvatarStage: "identity-synchronized", principalOfficeRoute: "forced-by-sync" }, clues: [clue(13), clue(16)] }),
    ],
  });

  add({
    nodeId: "nf05_050",
    chapterId: chapterIds[5],
    scene: "namefloor_black_avatar_truth",
    blueprintSceneId: "DR-C5-S05",
    speaker: "旁白",
    text: "铃声停下后，走廊墙皮剥落成校长室门牌的形状。黑色头像撤回最后一条消息，只留下林峰常用的句式：别让名册先替你决定。队伍沿着门牌方向继续，但真正的校长室仍在更深处。",
    type: "chapter-ending",
    contentType: "narration",
    chapterEnding: {
      title: "第五章结束",
      subtitle: "林峰正在被班群和名单主动删除，校长室成为唯一明确方向。",
      cta: "保存并返回书架",
    },
    effectTags: ["fourth-floor-reality-cover", "black-avatar-linfeng-language", "speaker-name-controlled-loss"],
    effects: [{ type: "signal-glitch", durationMs: 900, intensity: 0.34 }, { type: "focus-pulse", durationMs: 1100, intensity: 0.28 }],
  });

  line("nf06_001", chapterIds[6], "namefloor_archive_corridors", "旁白", "校长室藏在四楼最深处。五条走廊分别由宿管档案、失踪姓名、黑头像、另一个林峰和死亡账号复制，没有一条能同时保住全部证据。", "nf06_c39", { blueprintSceneId: "DR-C6-S01" });
  decision({
    code: "C39", nodeId: "nf06_c39", chapterId: chapterIds[6], scene: "namefloor_archive_corridors", blueprintSceneId: "DR-C6-S01",
    text: "钥匙已经发烫。第一条选择的走廊，会决定哪组记录最先抵达校长室。", nextNodeId: "nf06_010", defaultKey: "A",
    options: [
      option("A", "用吴阿姨的钥匙开旧门", "旧门后是历任宿管档案。吴阿姨逐年缺字的姓名成为第一份未被改写的证据。", { flags: ["principal_route_manager_archive", "manager_archive_baseline"], clues: [clue(12), clue(16)] }),
      option("B", "沿被刮掉的姓名前进", "墙面像墓碑一样列着失踪学生。每个被恢复的名字旁，都有另一个新刮痕。", { flags: ["principal_route_erased_names", "missing_student_baseline"], state: { namePollutionStage: 7 }, clues: [clue(15), clue(16)] }),
      option("C", "跟随黑头像撤回前的箭头", "箭头把队伍领进时间错位的走廊。开场短信的发送时刻和现在在同一块玻璃上重叠。", { flags: ["principal_route_black_avatar", "loop_timeline_baseline"], clues: [clue(13), clue(16)] }),
      option("D", "跟随另一个林峰的账号定位", "定位尽头先出现家庭档案。每一项都承认合法林峰，却没有记录今晚玩家林峰救过谁。", { flags: ["principal_route_legal_linfeng", "legal_linfeng_records_stronger"], state: { namePollutionStage: 8 }, clues: [clue(16)], relationships: [trust("trust_guyu", -6, "把合法记录置于今晚选择之前")] }),
      option("E", "沿死亡账号的脚步声前进", "死亡账号把他们带过红马甲残影。隔壁学生最后一段脚步被保留下来，重伤者却差点被影子截走。", { flags: ["principal_route_dead_account", "dead_account_evidence_recovered"], clues: [clue(14), clue(16)] }),
    ],
  });

  line("nf06_010", chapterIds[6], "namefloor_fixed_count_archives", "旁白", "校长室里没有校长，只有四组档案柜和一张会自行改写的学生名册。柜门注明：第一份打开的档案将暂时免于改写。", "nf06_c40", { blueprintSceneId: "DR-C6-S02" });
  decision({
    code: "C40", nodeId: "nf06_c40", chapterId: chapterIds[6], scene: "namefloor_fixed_count_archives", blueprintSceneId: "DR-C6-S02",
    text: "失踪名单、班群备份、历年合照、宿管姓名和双林家庭学籍，只能先保住一组不可污染的基准。", nextNodeId: "nf06_c41", defaultKey: "B",
    options: [
      option("A", "先看历届失踪名单", "名单显示：每恢复一名失踪学生，另一行就会被固定人数挤掉。这不是故障，是制度本身。", { flags: ["missing_roster_clean_baseline"], state: { rosterState: "fixed-quota-revealed" }, clues: [clue(15), clue(17)] }),
      option("B", "先看班群服务器备份", "备份证明黑色头像没有增加成员数。它覆盖了林峰原来的群位置，四十二这个总数从未改变。", { flags: ["group_backup_clean_baseline", "black_avatar_slot_truth"], state: { blackAvatarStage: "slot-revealed" }, clues: [clue(2), clue(14)] }),
      option("C", "先看不同年份的合照", "同一张床位在不同年份长着不同的脸，照片位置却从未空过。合照忠于名额，不忠于人。", { flags: ["photo_archive_clean_baseline", "identity_unresolved"], clues: [clue(15), clue(16)] }),
      option("D", "先看历任宿管姓名", "吴阿姨的名字从照片、合同到名牌逐年缺字，三年制度把宿管也当成可替换的岗位。", { flags: ["manager_names_clean_baseline"], clues: [clue(12), clue(16)] }),
      option("E", "先看两个林峰的家庭与学籍", "另一个林峰拥有完整家庭和学籍记录。玩家林峰只有今晚新形成的证据，谷雨握紧了手里的纸条。", { flags: ["legal_linfeng_clean_baseline", "legal_linfeng_records_stronger"], state: { namePollutionStage: 8 }, clues: [clue(16)], relationships: [trust("trust_guyu", -6, "独自优先查看双林合法记录")] }),
    ],
  });

  decision({
    code: "C41", nodeId: "nf06_c41", chapterId: chapterIds[6], scene: "namefloor_restoration_roster", blueprintSceneId: "DR-C6-S03",
    text: "名册忽然翻页，名字像虫群一样从一行爬向另一行。现在停住它，可能也会冻结一份错误的现实。", nextNodeId: "nf06_020", durationMs: 7000, fallbackKey: "F", defaultKey: "B",
    options: [
      option("A", "徒手按住页面", "墨字钻进林峰掌纹，把一个被删姓名暂时转到他身上。玩家林峰的原身体记录同时变得更薄。", { flags: ["lin_pressed_rewriting_roster"], state: { namePollutionStage: 8, rosterState: "pressed-by-hand" }, clues: [clue(15), clue(17)] }),
      option("B", "用羽毛钉住名册", "羽毛从中裂开，页面停在交换完成之前。几行待恢复姓名被保留下来。", { flags: ["roster_pinned_with_feather", "restorable_names_preserved"], state: { featherState: "half-broken", rosterState: "pinned" }, clues: [clue(11), clue(15), clue(17)] }),
      option("C", "立即拍照", "照片每秒都不同，却完整记录了名字移动的过程。它能证明篡改，不能替任何一行作最终锚。", { flags: ["photographed_rewriting_roster", "identity_unresolved"], clues: [clue(13), clue(15), clue(17)] }),
      option("D", "让周朝阳逐行朗读", "周朝阳把变化读成一条连续时间线。即使页面改完，纸质笔记仍保住改写前的顺序。", { flags: ["zhou_read_roster_changes", "restorable_names_preserved"], clues: [clue(15), clue(17)], relationships: [trust("trust_zhouchaoyang", 8, "用连续朗读保留改写前顺序")] }),
      option("E", "让谷雨喊出所有认识的人", "每个被叫到的人都在页面上停了一瞬。口头群体锚抢回几行名字，也把污染分给了谷雨。", { flags: ["guyu_group_name_anchor", "restorable_names_preserved", "guyu_anchor_burden"], clues: [clue(15), clue(17)], relationships: [trust("trust_guyu", 10, "谷雨为被删者建立群体锚")] }),
      option("F", "任由名册写完", "校章自行落下，“正确人数”完成。名单外的重伤者立刻失去姓名，只剩遗物继续被带往出口。", { flags: ["roster_finished_correct_count", "roster_intact", "original_person_lost"], state: { namePollutionStage: 9, rosterState: "quota-maintained" }, clues: [clue(17)], relationships: [trust("trust_guyu", -12, "任由名册固定牺牲后的正确人数")] }),
    ],
  });

  line("nf06_020", chapterIds[6], "namefloor_restore_one_name", "旁白", "页面停住后，只剩一个空白位置。恢复死者只恢复姓名和历史，不会让身体复活；恢复活人则必然发出一个占位请求。", "nf06_c42", { blueprintSceneId: "DR-C6-S03" });
  decision({
    code: "C42", nodeId: "nf06_c42", chapterId: chapterIds[6], scene: "namefloor_restore_one_name", blueprintSceneId: "DR-C6-S03",
    text: "名册要求选择一个名字恢复。光标停在空白行，等待新的笔画。", nextNodeId: "nf06_030", defaultKey: "D",
    options: [
      option("A", "恢复林峰", "通讯录里“林峰”重新出现。另一行随即亮起交换提示，提醒他们这次恢复尚未支付。", { flags: ["linfeng_restored", "roster_slot_request_linfeng"], state: { namePollutionStage: 6, rosterState: "restoration-pending" }, clues: [clue(15), clue(16)] }),
      option("B", "恢复真正宋明", "两份“宋明”记录在名册上重叠。死亡事实没有消失，同行者的当前选择也没有被自动否定。", { flags: ["true_song_name_restored", "roster_slot_request_song"], state: { rosterState: "restoration-pending" }, clues: [clue(15), clue(16)] }),
      option("C", "恢复谷雨", "一段没有联系人的语音重新显示“谷雨”。它保住了他的历史，却仍要求另一个名字退出。", { flags: ["guyu_name_restored", "roster_slot_request_guyu"], state: { rosterState: "restoration-pending" }, clues: [clue(15), clue(16)] }),
      option("D", "恢复一名被牺牲学生", "失踪墙亮起一盏灯。那个学生没有复活，但终于不再被写成从未存在。", { flags: ["sacrificed_student_name_restored", "roster_slot_request_student"], state: { rosterState: "restoration-pending" }, clues: [clue(15), clue(16)] }),
      option("E", "恢复吴阿姨", "三年合同续写出吴阿姨的完整姓名。绿色马甲的债也重新回到名册前。", { flags: ["wu_name_restored", "roster_slot_request_wu"], state: { rosterState: "restoration-pending" }, clues: [clue(12), clue(15)] }),
      option("F", "登记已经有自我的模仿者", "名册拒绝“无名”，却无法删除那段新记忆和自愿风险。空白行第一次停在制度无法分类的主体前。", { flags: ["self_aware_mimic_registration_attempt", "song_mimic_self_aware"], state: { rosterState: "restoration-pending" }, clues: [clue(15), clue(16)] }),
      option("G", "暂不恢复", "空位被保留，名册开始自行寻找支付者。把决定交给制度，也是一种决定。", { flags: ["left_restoration_to_roster"], state: { namePollutionStage: 8, rosterState: "auto-selection-pending" } }),
    ],
  });

  line("nf06_030", chapterIds[6], "namefloor_name_exchange", "旁白", "空白行下方渗出一句校务提示：恢复一名，移除一名。装订钉像牙齿一样锁住所有散页。", "nf06_c43", { blueprintSceneId: "DR-C6-S04" });
  decision({
    code: "C43", nodeId: "nf06_c43", chapterId: chapterIds[6], scene: "namefloor_name_exchange", blueprintSceneId: "DR-C6-S04",
    text: "名册要求一个名字换一个名字。拒绝支付也许能打破制度，也可能让所有人的记录一起崩塌。", nextNodeId: "nf06_c44", defaultKey: "G",
    options: [
      option("A", "林峰主动退出名册", "林峰按下自己的名字。联系人、学籍和群位置同时空白，身体仍站在原地。", { flags: ["lin_self_removed_from_roster", "player_linfeng_escaped_nameless"], state: { namePollutionStage: 8, rosterState: "exchange-paid" }, clues: [clue(15), clue(17)] }),
      option("B", "由谷雨主动代位", "谷雨把羽毛按在林峰名字上：“这次我自己选。”林峰那行恢复，谷雨所在的位置开始变白。", { flags: ["guyu_voluntary_substitution", "guyu_anchor_burden", "linfeng_restored"], state: { namePollutionStage: 6, rosterState: "exchange-paid" }, clues: [clue(11), clue(15), clue(17)], relationships: [trust("trust_guyu", 14, "谷雨自愿为林峰代位")] }),
      option("C", "由吴阿姨代位", "旧合同在吴阿姨姓名下碎裂。她失去学校承认，却第一次不再把岗位传给下一个学生。", { flags: ["wu_voluntary_substitution", "wu_redemption_complete"], state: { rosterState: "exchange-paid" }, clues: [clue(12), clue(15), clue(17)] }),
      option("D", "由同行宋明或有自我的模仿者代位", "同行者没有立即按下名字，先问这是请求还是命令。只有自愿的回答，才被周朝阳记作一次主体选择。", { flags: ["song_offered_roster_substitution", "song_voluntary_risk"], state: { rosterState: "exchange-paid" }, clues: [clue(10), clue(15), clue(17)] }),
      option("E", "移除一名已经死亡的被困学生", "死者那行彻底消失，连失踪墙上的空钉都被填平。固定人数保住了，人的历史没有。", { flags: ["dead_student_erased_for_quota", "roster_intact", "mechanical_compliance"], state: { rosterState: "quota-maintained" }, clues: [clue(17)] }),
      option("F", "让名册自动选择", "墨迹爬向当前最不被信任的人。没有抽签，也没有犹豫，制度只沿着他们亲手留下的裂缝结算。", { flags: ["roster_auto_selected_lowest_trust", "roster_intact", "mechanical_compliance", "original_person_lost"], state: { rosterState: "quota-maintained" }, relationships: [trust("trust_guyu", -10, "把牺牲对象交给名册选择")] }),
      option("G", "拒绝支付，卡住装订", "周朝阳把钥匙插进装订钉，林峰压住渗墨的页面。名册流出暗红墨水，交换第一次没有完成。", { flags: ["refused_roster_exchange", "roster_break_entry"], state: { rosterState: "jammed" }, clues: [clue(15), clue(17)] }),
    ],
  });

  decision({
    code: "C44", nodeId: "nf06_c44", chapterId: chapterIds[6], scene: "namefloor_break_roster", blueprintSceneId: "DR-C6-S04",
    text: "固定人数的装订钉已经松动。毁掉名册、保留名册，或让黑色头像补空位，会决定谁还能被学校承认。", nextNodeId: "nf06_040", defaultKey: "A",
    options: [
      option("A", "砸断装订钉，保留散页", "固定配额断开，姓名散成可以分别携带的纸页。此后它们只能靠活人记忆，而不能靠学校总数维持。", { flags: ["roster_quota_broken", "loose_roster_pages"], state: { rosterState: "quota-broken" }, clues: [clue(15), clue(17)], relationships: [trust("trust_guyu", 8, "打断固定人数牺牲机制")] }),
      option("B", "焚毁整本名册", "火焰吞掉所有装订。两个林峰的学籍同时抖动，谁是最初者变得无法由记录证明。", { flags: ["roster_burned", "identity_unresolved", "fifth_seed"], state: { rosterState: "burned", namePollutionStage: 8 }, clues: [clue(15), clue(16)] }),
      option("C", "保持完整并接受交换", "校章重新压稳四个位置。被写入的人获得现实，被删除的人从合照边缘慢慢褪去。", { flags: ["roster_intact", "mechanical_compliance", "original_person_lost"], state: { rosterState: "quota-maintained" }, clues: [clue(15), clue(17)] }),
      option("D", "只撕掉宿管合同页", "吴阿姨的姓名从合同里获释，学生名册的固定配额却原封不动。", { flags: ["manager_contract_removed", "roster_intact", "mechanical_compliance"], state: { rosterState: "quota-maintained" }, clues: [clue(12), clue(17)] }),
      option("E", "用黑色头像账号覆盖空位", "黑色头像落进林峰的空白行。它没有增加人数，只把未来失败的林峰和当前姓名叠在同一位置。", { flags: ["black_avatar_roster_slot", "black_avatar_overwrote_linfeng"], state: { blackAvatarStage: "roster-slot", namePollutionStage: 8, rosterState: "black-avatar-filled" }, clues: [clue(2), clue(13), clue(17)] }),
      option("F", "把名册锁回柜中", "柜门暂时停止渗墨，固定人数仍在里面呼吸。问题被推迟到了出口，不是被解决。", { flags: ["roster_locked_intact", "roster_intact", "mechanical_compliance"], state: { rosterState: "quota-maintained" }, clues: [clue(17)] }),
    ],
  });

  line("nf06_040", chapterIds[6], "namefloor_deep_cabinet", "旁白", "校长室最深的柜门自行打开。散页或原册立刻成为四楼追踪的目标，死者的遗物也能继续完成携带。", "nf06_c45", { blueprintSceneId: "DR-C6-S05" });
  decision({
    code: "C45", nodeId: "nf06_c45", chapterId: chapterIds[6], scene: "namefloor_deep_cabinet", blueprintSceneId: "DR-C6-S05",
    text: "谁带走名册，谁就会成为名册回廊首先袭击的人。", nextNodeId: "nf06_c46", defaultKey: "F",
    options: [
      option("A", "由林峰携带", "纸页贴住林峰胸口，他的姓名和墨迹开始重叠。追踪声也立刻锁定了他。", { flags: ["roster_carrier_linfeng"], state: { rosterCarrier: "林峰", namePollutionStage: 8 }, clues: [clue(15), clue(17)] }),
      option("B", "由周朝阳携带", "周朝阳把散页夹进原笔记。逻辑证据与姓名证据终于由同一条时间线携带。", { flags: ["roster_carrier_zhou"], state: { rosterCarrier: "周朝阳" }, clues: [clue(15), clue(17)], relationships: [trust("trust_zhouchaoyang", 8, "周朝阳主动携带名册证据")] }),
      option("C", "由谷雨携带", "谷雨边走边按住林峰那页，防止它再次变白。他的呼吸和叫名节奏绑在了一起。", { flags: ["roster_carrier_guyu", "guyu_anchor_burden"], state: { rosterCarrier: "谷雨" }, clues: [clue(15), clue(17)], relationships: [trust("trust_guyu", 8, "谷雨主动携带姓名散页")] }),
      option("D", "由同行宋明携带", "宋明把散页收进衣内：“到门口我最后走。”这句话给了他一个不来自旧记录的守门动机。", { flags: ["roster_carrier_song", "song_voluntary_risk"], state: { rosterCarrier: "同行宋明" }, clues: [clue(10), clue(15), clue(17)] }),
      option("E", "由吴阿姨携带", "吴阿姨接过原册，追踪墨迹从学生脚下转向绿色马甲。宿管循环最后一次聚焦在她身上。", { flags: ["roster_carrier_wu"], state: { rosterCarrier: "吴阿姨" }, clues: [clue(12), clue(15), clue(17)] }),
      option("F", "密封后交给获救学生", "获救学生主动背起密封袋。他不再只是被救者，也成为固定人数制度之外的证人。", { flags: ["roster_carrier_rescued_student", "rescued_trapped_student"], state: { rosterCarrier: "获救学生" }, clues: [clue(15), clue(17)], relationships: [trust("trust_guyu", 6, "让获救者成为主动证人")] }),
      option("G", "把名册留在校长室", "追逐声减弱了，出口却失去可以核对被删者的纸证。黑色头像保存了最后一张模糊照片。", { flags: ["roster_left_in_principal_room"], state: { rosterCarrier: null }, clues: [clue(13), clue(17)] }),
    ],
  });

  decision({
    code: "C46", nodeId: "nf06_c46", chapterId: chapterIds[6], scene: "namefloor_deep_cabinet", blueprintSceneId: "DR-C6-S05",
    speaker: "校园广播", contentType: "world-audio", text: "请确认本层学生全员到齐。确认后，出口将按正确人数开放。", nextNodeId: "nf07_001", durationMs: 5000, fallbackKey: "A", defaultKey: "B",
    options: [
      option("A", "确认“全员到齐”", "校章重重盖在名册上。广播没有数人，只把当前版本写成了现实，并要求出口留下一个位置。", { flags: ["confirmed_all_present", "roster_intact", "mechanical_compliance"], state: { rosterState: "quota-sealed" }, clues: [clue(4), clue(17)], relationships: [trust("trust_guyu", -10, "接受学校的正确人数结算")] }),
      option("B", "否认，并说有人失踪", "所有走廊门同时打开。广播第一次无法用“正常”覆盖那些空床位。", { flags: ["rejected_all_present", "missing_students_acknowledged"], clues: [clue(4), clue(14), clue(17)], relationships: [trust("trust_guyu", 8, "拒绝抹去失踪者")] }),
      option("C", "逐个念被删除者，不念现队伍", "失踪姓名从喇叭里短暂回声，死亡账号一个接一个上线。现队伍的名字没有被广播获取。", { flags: ["named_deleted_students_only", "rejected_all_present"], clues: [clue(14), clue(17)], relationships: [trust("trust_guyu", 8, "只为被删除者恢复公共回声")] }),
      option("D", "让黑色头像回答", "喇叭里响起林峰自己的声线：“全员……到齐。”黑色头像从群位置移向出口计数器。", { flags: ["black_avatar_answered_broadcast", "no_live_anchor"], state: { blackAvatarStage: "speaking", namePollutionStage: 8 }, clues: [clue(2), clue(13), clue(17)] }),
      option("E", "保持沉默，切断喇叭", "周朝阳扯断线路，谷雨压住名册。广播卡在“全员”二字，出口获得一道没有盖章的缝。", { flags: ["cut_broadcast", "rejected_all_present"], clues: [clue(4), clue(17)], relationships: [trust("trust_guyu", 8, "切断正确人数广播")] }),
    ],
  });

  line("nf07_001", chapterIds[7], "namefloor_final_two_lins", "旁白", "校长室深处，两个林峰隔着散页相对而立。一人拥有完整身份，一人拥有今晚行动的连续性；若身体曾经中断，合法身份的另一个林峰可能正是被困的原身。", "nf07_c47", { blueprintSceneId: "DR-C7-S01" });
  decision({
    code: "C47", nodeId: "nf07_c47", chapterId: chapterIds[7], scene: "namefloor_final_two_lins", blueprintSceneId: "DR-C7-S01",
    text: "最后验真不能只问过去。周朝阳摊开新记忆、临时承诺、学籍、羽毛和风险选择，等林峰决定证据权重。", nextNodeId: "nf07_010", defaultKey: "A",
    options: [
      option("A", "用无声手势和谷雨的新约定验真", "只有连续经历今晚的人能补完约定的变化。结论指向行动连续者，却仍不假装能证明灵魂来源。", { flags: ["lin_verified_by_new_memory", "player_linfeng_continuity_evidence"], clues: [clue(10), clue(16)] }),
      option("B", "用复制宿舍订立的临时承诺验真", "三下敲击再次响起，履行承诺的人先护住谷雨。选择第二次得到验证。", { flags: ["lin_verified_by_temporary_promise", "player_linfeng_continuity_evidence"], clues: [clue(10), clue(16)] }),
      option("C", "只采信学籍和家庭记录", "学校承认另一个林峰。周朝阳把“合法”写进结论，却没有把“最初”写进去。", { flags: ["legal_linfeng_confirmed", "legal_linfeng_evidence_only"], state: { namePollutionStage: 8 }, clues: [clue(16)] }),
      option("D", "让周朝阳综合全部时间线", "周朝阳把身体中断、新记忆与合法记录分层标注。若替换发生，合法林峰更可能是被困原身；否则连续行动更支持玩家林峰。", { flags: ["zhou_integrated_linfeng_timeline", "legal_linfeng_confirmed"], clues: [clue(10), clue(16)], relationships: [trust("trust_zhouchaoyang", 8, "使用多来源时间线验真")] }),
      option("E", "让谷雨判断谁愿承担后果", "谷雨不问谁背得出旧事，只问谁愿意为站错的人负责。两个回答不同，却都没有让恐惧消失。", { flags: ["guyu_judged_linfeng_choice"], clues: [clue(10), clue(16)], relationships: [trust("trust_guyu", 8, "以当前承担而非旧档案参与判断")] }),
      option("F", "只用羽毛判断", "羽毛朝姓名更稳定的一方弯去。它选出了被记录承认的人，没有回答人格真伪。", { flags: ["legal_linfeng_confirmed", "lin_verified_by_feather_only"], clues: [clue(11), clue(16)] }),
      option("G", "承认无法证明最初者，只比较今晚选择", "两个林峰都被允许成为选择的承担者。队伍不再用一个不可证明的答案替制度完成处刑。", { flags: ["dual_linfeng_subjects_acknowledged", "identity_unresolved"], clues: [clue(10), clue(16)] }),
    ],
  });

  line("nf07_010", chapterIds[7], "namefloor_linfeng_positions", "旁白", "名册仍只肯承认一个“林峰”，但被砸断的装订钉允许散页暂时并列。出口不会替他们决定谁拿走名字。", "nf07_c48", { blueprintSceneId: "DR-C7-S02" });
  decision({
    code: "C48", nodeId: "nf07_c48", chapterId: chapterIds[7], scene: "namefloor_linfeng_positions", blueprintSceneId: "DR-C7-S02",
    text: "两个林峰都看向那一行姓名。如何分配名字与离开的位置？", nextNodeId: "nf07_020", defaultKey: "E",
    options: [
      option("A", "两人都走，暂称“林峰”和“无名同行者”", "冲突被带向出口，没有人被立即封死。路灯还未出现，地面已经多出一处无法归属的站位。", { flags: ["both_linfengs_leave", "fifth_seed", "identity_unresolved"], clues: [clue(15), clue(16), clue(18)] }),
      option("B", "让玩家林峰占名，封住合法另林", "玩家林峰的联系人恢复，另一个林峰被铁门隔开。若合法记录指向原身，这就是一场迟到的错误放逐。", { flags: ["player_linfeng_named", "legal_linfeng_exiled", "trusted_then_abandoned", "misjudged_human"], relationships: [trust("trust_guyu", -12, "封住拥有合法身份的另一个林峰")] }),
      option("C", "让合法另林占名，玩家林峰无名同行", "周朝阳和谷雨迎向拥有完整身份的林峰。玩家林峰也越过门线，却失去账号、学籍和同学认知。", { flags: ["legal_linfeng_named", "player_linfeng_escaped_nameless", "legal_linfeng_confirmed"], state: { namePollutionStage: 8 }, clues: [clue(15), clue(16)] }),
      option("D", "在散页写“林峰甲”和“林峰乙”", "两个称呼撑住了几步，随后同时从末字开始掉色。并列没有解决身份，只生成了第五道未定影子。", { flags: ["dual_linfeng_temp_names", "fifth_seed", "identity_unresolved"], clues: [clue(15), clue(16), clue(18)] }),
      option("E", "让周朝阳和谷雨依据验真共同决定", "他们把合法记录与今晚选择并列，不用单一证据判死。结论保护证据胜者，也保留另一人的人格资格。", { flags: ["companions_decided_linfeng_by_evidence", "no_wrong_exile"], clues: [clue(10), clue(15), clue(16)], relationships: [trust("trust_zhouchaoyang", 6, "共同承担双林判断"), trust("trust_guyu", 6, "共同承担双林判断")] }),
      option("F", "两人都放弃名字", "名册空出林峰那一行。黑色头像同时弹出两个输入框，等待其中一个人完成闭环。", { flags: ["both_linfengs_nameless", "no_live_anchor", "identity_unresolved"], state: { namePollutionStage: 8, blackAvatarStage: "dual-input" } }),
    ],
  });

  line("nf07_020", chapterIds[7], "namefloor_exit_threshold", "旁白", "名册回廊从校长室后方坍塌。出口已经亮起，但散页、伤者和被困学生被飞落的柜门分在不同方向。", "nf07_c49", { blueprintSceneId: "DR-C7-S03" });
  decision({
    code: "C49", nodeId: "nf07_c49", chapterId: chapterIds[7], scene: "namefloor_exit_threshold", blueprintSceneId: "DR-C7-S03",
    text: "只能先救一个目标。其他人不会立刻消失，但既重伤又没有羽毛的人会被追赶者截断。", nextNodeId: "nf07_c50", durationMs: 6000, fallbackKey: "T", defaultKey: "G",
    options: [
      option("A", "先救周朝阳", "林峰把周朝阳从档案柜下拖出。原笔记得以继续，却让另一名重伤者暴露在回廊后方。", { flags: ["rescued_zhou_first"], clues: [clue(15), clue(16)], relationships: [trust("trust_zhouchaoyang", 10, "在坍塌中先救周朝阳")] }),
      option("B", "先救谷雨", "谷雨被拉过门线时还在喊林峰。这个声音为姓名多争取了一段距离。", { flags: ["rescued_guyu_first", "guyu_exit_anchor"], state: { namePollutionStage: 6 }, relationships: [trust("trust_guyu", 12, "在坍塌中先救谷雨")] }),
      option("C", "先救同行宋明", "同行宋被拉出追赶者的手。他把出口让给别人前，先确认林峰还记得刚才的新约定。", { flags: ["rescued_song_first", "song_witness_survives"], clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 10, "在坍塌中先救同行宋明")] }),
      option("D", "先救另一个林峰", "合法身份的另一个林峰越过柜门。他的家庭档案和身体痕迹都得以带到出口。", { flags: ["rescued_legal_linfeng_first", "legal_linfeng_confirmed"], clues: [clue(15), clue(16)] }),
      option("E", "先救被困学生", "获救学生被推出回廊，抱紧密封散页。固定人数之外终于有了一名活着的证人。", { flags: ["rescued_trapped_student", "rescued_student_witness_survives"], clues: [clue(15), clue(16)] }),
      option("F", "先救名册携带者", "姓名证据被保住，人名却仍在掉。后方最重的脚步声停了一次，随后少了一道呼吸。", { flags: ["rescued_roster_carrier_first", "roster_evidence_survives"], clues: [clue(15), clue(17)] }),
      option("G", "回身，所有人共同撑门", "林峰没有替别人决定谁该被放弃。两名仍愿意互相信任的人同时顶住门轴，核心四人和被救者一起挤过裂口。", { flags: ["all_core_escape", "no_one_lost_in_collapse", "collective_door_hold"], clues: [clue(10), clue(16)], relationships: [trust("trust_zhouchaoyang", 8, "共同承担坍塌风险"), trust("trust_guyu", 8, "共同承担坍塌风险")] }),
      option("T", "迟疑到回廊自行选择", "回廊先把当前最被信任的人推向林峰，再按固定顺序截走一名无羽毛的重伤者。这个结果没有任何随机性。", { timeoutOnly: true, flags: ["collapse_saved_highest_trust", "fixed_order_casualty"], clues: [clue(15), clue(16)] }),
    ],
  });

  decision({
    code: "C50", nodeId: "nf07_c50", chapterId: chapterIds[7], scene: "namefloor_exit_threshold", blueprintSceneId: "DR-C7-S03",
    text: "两份宋明记录终于分开：若全名曾泄露且救援迟到，真正宋明已经死亡，同行者是继承旧记忆后形成新选择的模仿者；否则，同行者就是真正宋明。", nextNodeId: "nf07_c51", defaultKey: "C",
    options: [
      option("A", "若是模仿者，允许它保留“宋明”", "林峰承认姓名也可以由当下选择继续承担。同行者没有借此要求挤掉真正宋明的死亡记录。", { flags: ["song_mimic_allowed_song_name", "song_mimic_self_aware"], clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 10, "允许有自我的同行者承担宋明之名")] }),
      option("B", "请它选择一个新名字", "同行者再次作出不在模板里的选择。新名字写在学校格式之外，没有覆盖任何死者。", { flags: ["song_chose_new_name", "song_mimic_self_aware"], clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 10, "让同行者自行选择新名字")] }),
      option("C", "无论真伪，都带它离开", "身份问题没有被回避，也没有被用来取消当前人格。同行宋跟上队伍，继续为自己的下一步负责。", { flags: ["song_brought_to_exit", "no_wrong_exile"], clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 8, "依据当前选择带同行宋离开")] }),
      option("D", "请它自愿守住追赶者", "若真正宋明仍活着，他只是共同守门并能被救回；若同行者已有自我，他主动关上追逐门，把出口留给其他人。", { flags: ["song_voluntary_final_guard", "song_mimic_sacrificed", "song_witness_survives"], clues: [clue(10), clue(16)], relationships: [trust("recognition_songming", 12, "尊重同行宋自愿承担最后风险")] }),
      option("E", "因它可能不是原身而放逐", "同行宋被留在门后。新的选择、恐惧和承诺都没有被制度承认；如果目标是真正宋明，这次误判将在楼外得到证明。", { flags: ["song_exiled_for_origin", "trusted_then_abandoned", "misjudged_human", "wrong_exile_proven"], relationships: [trust("recognition_songming", -18, "因来源不纯而放逐同行宋")] }),
      option("F", "把羽毛交给它自行决定", "同行者若已拥有新记忆和自愿风险，便用羽毛稳定最后一次选择后转身断后；否则，污染先吞掉了它借来的姓名。", { flags: ["song_received_final_feather", "song_mimic_sacrificed", "song_mimic_self_aware"], state: { featherHolder: "同行宋明", featherState: "burned" }, clues: [clue(10), clue(11), clue(16)] }),
    ],
  });

  decision({
    code: "C51", nodeId: "nf07_c51", chapterId: chapterIds[7], scene: "namefloor_exit_threshold", blueprintSceneId: "DR-C7-S03",
    text: "人数闸门亮出最后条件：留下一人，当前人数才能被判定为“全员到齐”。", nextNodeId: "nf07_c52", defaultKey: "A",
    options: [
      option("A", "拒绝留人，所有人共同破门", "警报响起，所有还能行动的人一起撞向门轴。制度没有得到一名被指定的牺牲者。", { flags: ["no_one_left", "all_core_escape", "rejected_quota_gate"], clues: [clue(16), clue(17)], relationships: [trust("trust_zhouchaoyang", 8, "拒绝由人数闸门指定牺牲"), trust("trust_guyu", 8, "拒绝由人数闸门指定牺牲")] }),
      option("B", "留下同行宋明", "闸门接受了“宋明”这个位置。若被留下的是真人，出口外恢复的账号会把这次背叛写回所有手机。", { flags: ["song_left_for_quota", "sacrificed_for_quota", "trusted_then_abandoned", "misjudged_human"], state: { rosterState: "quota-maintained" }, clues: [clue(16), clue(17)] }),
      option("C", "留下周朝阳", "周朝阳把笔记从门缝推出去，自己留在正确人数的另一侧。定时消息仍会继续核验这次选择。", { flags: ["zhou_left_for_quota", "sacrificed_for_quota", "trusted_then_abandoned", "misjudged_human"], state: { rosterState: "quota-maintained" }, clues: [clue(7), clue(16), clue(17)] }),
      option("D", "留下另一个林峰", "合法身份被锁在门内。若他是身体中断后的原身，这个选择把学校承认的人再次交还给四楼。", { flags: ["legal_linfeng_left_for_quota", "sacrificed_for_quota", "trusted_then_abandoned", "misjudged_human"], state: { rosterState: "quota-maintained" }, clues: [clue(16), clue(17)] }),
      option("E", "让已有自我的模仿者自愿留守", "它确认门外的人都已越线，才从里面按下闸门。这个牺牲不服从旧记录，也没有替学校填补原人的位置。", { flags: ["self_aware_mimic_voluntary_guard", "song_mimic_sacrificed", "song_mimic_self_aware"], clues: [clue(10), clue(16)] }),
      option("F", "留下名册指定的最低信任者", "名册沿着队伍内部最深的裂口选人。校章恢复光泽，正确人数得以维持。", { flags: ["lowest_trust_left_for_quota", "sacrificed_for_quota", "roster_intact", "mechanical_compliance", "original_person_lost"], state: { rosterState: "quota-maintained" }, clues: [clue(17)] }),
      option("G", "玩家林峰自己留下", "门从林峰面前合拢。同伴继续奔向出口，他的视角沉进手机和黑色头像，只能隔着屏幕看他们逃生。", { flags: ["player_stayed", "no_live_anchor", "black_avatar_viewpoint"], state: { namePollutionStage: 8, blackAvatarStage: "viewpoint" }, clues: [clue(13), clue(17)] }),
    ],
  });

  decision({
    code: "C52", nodeId: "nf07_c52", chapterId: chapterIds[7], scene: "namefloor_exit_threshold", blueprintSceneId: "DR-C7-S03",
    speaker: "谷雨", contentType: "dialogue", text: "我可以一直叫你的名字。可吴阿姨说过，喊得越久，污染越会转到我身上。", nextNodeId: "nf07_c53", defaultKey: "B",
    options: [
      option("A", "接受，让谷雨不停喊", "“林峰”被谷雨一声声拉回。谷雨自己的姓名从名册和联系人里同步变白，但这是他在知情后主动作出的选择。", { flags: ["guyu_continuous_anchor", "guyu_trust_stable", "linfeng_restored"], state: { namePollutionStage: 6 }, clues: [clue(10), clue(11)], relationships: [trust("trust_guyu", 14, "接受谷雨知情后的持续锚名")] }),
      option("B", "让周朝阳、谷雨和宋明轮换", "三种声音轮流接住林峰，污染无法只压垮一个人。活着的锚至少保留两处。", { flags: ["rotating_live_name_anchors", "two_live_anchors"], state: { namePollutionStage: 6 }, clues: [clue(10), clue(11)], relationships: [trust("trust_guyu", 8, "分担持续锚名风险")] }),
      option("C", "循环播放谷雨未发送的语音", "录音替活人喊了一段路。出口另一侧很快也出现完全一样的谷雨声线。", { flags: ["looped_guyu_recording", "fake_guyu_voice_seed", "identity_unresolved"], state: { namePollutionStage: 7 }, clues: [clue(10), clue(13)] }),
      option("D", "拒绝牺牲谷雨，改用纸条", "纸条上的“林峰”每走一步少一笔。没有活人姓名锚时，它无法阻止最后一次消失。", { flags: ["paper_anchor_only", "no_live_anchor"], state: { namePollutionStage: 8 }, relationships: [trust("trust_guyu", 6, "拒绝强迫谷雨独自承担污染")] }),
      option("E", "只在林峰忘名时让谷雨喊", "谷雨保住了自己的姓名，林峰则在每次断档后被及时叫回。代价被控制在两个人都能继续走的范围。", { flags: ["guyu_emergency_anchor", "two_live_anchors"], state: { namePollutionStage: 6 }, relationships: [trust("trust_guyu", 8, "只在姓名断档时使用活人锚")] }),
    ],
  });

  decision({
    code: "C53", nodeId: "nf07_c53", chapterId: chapterIds[7], scene: "namefloor_exit_threshold", blueprintSceneId: "DR-C7-S03",
    text: "发黑的羽毛只剩最后一次稳定姓名的力量。它也可以钉住一页救援名单，或归还给三年宿管循环。", nextNodeId: "nf07_c54", defaultKey: "E",
    options: [
      option("A", "交给玩家林峰", "羽毛让玩家林峰的名字亮到出口，谷雨却看见一段共同记忆从他眼里熄灭。", { flags: ["final_feather_linfeng"], state: { featherHolder: "林峰", featherState: "spent", namePollutionStage: 6 }, clues: [clue(11)] }),
      option("B", "交给谷雨", "谷雨的姓名在空白行上重新亮起，也让他有力量把林峰最后一次叫出。羽轴从中裂开。", { flags: ["final_feather_guyu", "guyu_name_stabilized"], state: { featherHolder: "谷雨", featherState: "spent" }, clues: [clue(11), clue(15)], relationships: [trust("trust_guyu", 10, "把羽毛最后一次稳定交给谷雨")] }),
      option("C", "交给同行宋明", "羽毛在同行宋手中一半发白、一半烧黑。它稳定了他的最后一次自主选择，而非替他证明原身。", { flags: ["final_feather_song", "song_mimic_self_aware"], state: { featherHolder: "同行宋明", featherState: "spent" }, clues: [clue(11), clue(16)] }),
      option("D", "交给另一个林峰", "合法林峰的姓名被稳定，玩家林峰在手机里变成“用户不存在”。两人仍都保留今晚的行动后果。", { flags: ["final_feather_legal_linfeng", "legal_linfeng_confirmed"], state: { featherHolder: "另一个林峰", featherState: "spent", namePollutionStage: 8 }, clues: [clue(11), clue(16)] }),
      option("E", "钉住救援名单", "羽毛穿过散页，获救学生的姓名不再被固定人数挤走。它从个人护身符变成一枚公共证据钉。", { flags: ["final_feather_rescue_roster", "rescued_student_name_stable"], state: { featherHolder: null, featherState: "roster-pin" }, clues: [clue(11), clue(15)] }),
      option("F", "归还吴阿姨", "羽毛回到绿色马甲，终止一任宿管的姓名侵蚀。吴阿姨没有再把它放回左抽屉。", { flags: ["final_feather_returned_wu", "wu_redemption_complete"], state: { featherHolder: "吴阿姨", featherState: "returned" }, clues: [clue(11), clue(12)] }),
      option("G", "折断，丢回四楼", "四楼的注意被断羽引开一瞬，随后全部压向姓名污染最深的人。黑色头像的输入框提前亮起。", { flags: ["final_feather_broken_into_fourth", "identity_unresolved"], state: { featherHolder: null, featherState: "destroyed", namePollutionStage: 8 }, clues: [clue(11), clue(13)] }),
    ],
  });

  decision({
    code: "C54", nodeId: "nf07_c54", chapterId: chapterIds[7], scene: "namefloor_exit_threshold", blueprintSceneId: "DR-C7-S03",
    text: "出口光幕显示的人数没有增加，地面影子却可能多出一道。第五道影子是谁，屏幕拒绝回答。", nextNodeId: "nf07_c55", durationMs: 4000, fallbackKey: "C", defaultKey: "A",
    options: [
      option("A", "等所有人逐个报代号再开门", "代号与脚步逐一对应，多出的同行者被识别却不被强行命名。队伍为有自我的人明确安排了位置。", { flags: ["exit_audited", "fifth_resolved"], clues: [clue(2), clue(15), clue(18)], relationships: [trust("trust_zhouchaoyang", 8, "逐个核对出口代号")] }),
      option("B", "四道影子出现就推门", "第四道影子刚越过光幕，第五道便贴着它滑了出去。没有人回头确认那是谁。", { flags: ["fifth_released", "identity_unresolved"], clues: [clue(2), clue(18)] }),
      option("C", "手机显示人数未变就推门", "群成员仍是四十二。门被推开时，地上明明有五道影子，屏幕却没有任何新增提示。", { flags: ["fifth_released", "identity_unresolved", "group_count_unchanged"], clues: [clue(2), clue(18)] }),
      option("D", "先让无名同行者通过", "无名者越界后，门的焦点短暂丢失。额外影子趁那一刻跟上了四个身体。", { flags: ["fifth_released", "identity_unresolved", "nameless_crossed_first"], clues: [clue(15), clue(18)], relationships: [trust("trust_guyu", 6, "让无名同行者先获得位置")] }),
      option("E", "用散页逐个核对脚印", "每一枚脚印都被散页接住。多出的那一个被看见、被安排，却没有被错误写成任何已死者。", { flags: ["exit_audited", "fifth_resolved", "roster_evidence_survives"], clues: [clue(15), clue(18)], relationships: [trust("trust_zhouchaoyang", 8, "用散页逐个核对出口脚印")] }),
    ],
  });

  decision({
    code: "C55", nodeId: "nf07_c55", chapterId: chapterIds[7], scene: "namefloor_midnight_return", blueprintSceneId: "DR-C7-S03",
    contentType: "phone-text", text: "出口前，林峰的手机重现午夜界面。它允许向零点的自己发送一条信息。", nextNodeId: "nf07_resolve", defaultKey: "E",
    phoneScreen: { kind: "private", view: "message", title: "发送给零点的自己", time: "08:08", memberCount: 42, messages: [{ sender: "系统", text: "仅可发送一次" }] },
    options: [
      option("A", "发送“不要忘记你的名字”", "信息穿过时间，落回第一幕的手机。若姓名已彻底消失且没有活人锚，黑色头像便从这里永远占住林峰的位置。", { flags: ["sent_loop_warning", "name_stage_9"], state: { namePollutionStage: 9, blackAvatarStage: "loop-closed" }, clues: [clue(1), clue(9), clue(13), clue(18)] }),
      option("B", "发送所有幸存者姓名和新约定", "过去收到了完整姓名，也让四楼获得下一轮复制种子。第五道影子在发送进度里闪了一次。", { flags: ["sent_survivor_names", "fifth_released", "identity_unresolved"], state: { namePollutionStage: 8 }, clues: [clue(1), clue(10), clue(18)] }),
      option("C", "发送名册照片后砸碎手机", "照片留在过去，当前账号彻底断开。玩家林峰再也无法用手机证明自己，却阻止了追踪继续同步。", { flags: ["sent_roster_photo", "smashed_phone", "player_linfeng_escaped_nameless"], clues: [clue(1), clue(13), clue(15)] }),
      option("D", "不发送，保留黑色头像会话", "循环没有闭合，黑色头像仍显示在线。它和当前幸存者隔着一个未发送的输入框互相凝视。", { flags: ["kept_black_avatar_conversation"], clues: [clue(1), clue(13)] }),
      option("E", "让同伴各说一句未记录的话再发送", "过去只收到一段残缺语音，听不清姓名，却保留了几个人在同一时刻作出的新选择。", { flags: ["sent_unrecorded_companion_words", "all_core_escape"], clues: [clue(1), clue(10), clue(13)], relationships: [trust("trust_zhouchaoyang", 6, "共同留下未记录的新话"), trust("trust_guyu", 6, "共同留下未记录的新话")] }),
    ],
    extra: { namePollutionHistory: [{ stage: 9, visibleCarrier: "姓名彻底消失，黑色头像占据林峰原群位置并向零点发送警告" }] },
  });

  add({
    nodeId: "nf07_resolve",
    chapterId: chapterIds[7],
    scene: "namefloor_ending_resolve",
    blueprintSceneId: "DR-C7-S03",
    speaker: "旁白",
    text: "天光穿过出口。名册、手机、羽毛与活人的记忆同时停止改写，所有选择按固定顺序结算。",
    type: "ending-resolver",
    resolveEnding: true,
  });

  const chapters = [
    { chapterId: chapterIds[2], title: "第二章：门外的人", order: 2, status: "runtime", startNodeId: "nf02_001", sceneCount: 6, decisionCount: 8, timedDecisionCount: 2 },
    { chapterId: chapterIds[3], title: "第三章：三点可以进食", order: 3, status: "runtime", startNodeId: "nf03_001", sceneCount: 6, decisionCount: 9, timedDecisionCount: 3 },
    { chapterId: chapterIds[4], title: "第四章：宿管的三年", order: 4, status: "runtime", startNodeId: "nf04_001", sceneCount: 6, decisionCount: 7, timedDecisionCount: 2 },
    { chapterId: chapterIds[5], title: "第五章：班群里被删除的人", order: 5, status: "runtime", startNodeId: "nf05_001", sceneCount: 5, decisionCount: 7, timedDecisionCount: 2 },
    { chapterId: chapterIds[6], title: "第六章：校长室", order: 6, status: "blueprint-only", sceneCount: 5, decisionCount: 0, timedDecisionCount: 0 },
    { chapterId: chapterIds[7], title: "第七章：谁是林峰", order: 7, status: "blueprint-only", sceneCount: 11, decisionCount: 0, timedDecisionCount: 0 },
  ];

  const managerRules = managerRuleCards;

  const clueDefinitions = {
    [clue(1)]: { clueId: clue(1), title: "零点警告与镜像时间戳", category: "手机", description: "开场短信、截图和时间戳最终指向闭环后的林峰。", isKey: true },
    [clue(2)]: { clueId: clue(2), title: "没有增加的群成员", category: "身份", description: "黑色头像没有加入班群，而是占据林峰原来的位置；群成员一直是四十二。", isKey: true },
    [clue(3)]: { clueId: clue(3), title: "门外宋明的多重声源", category: "身份", description: "不完整模仿只能复制旧称呼，无法自然回答今晚的新事实。", isKey: true },
    [clue(4)]: { clueId: clue(4), title: "红马甲只确认人数", category: "规则", description: "红马甲不会独立计数，它通过对话和广播把当前版本登记为现实。", isKey: true },
    [clue(5)]: { clueId: clue(5), title: "数字四与姓名回声", category: "空间", description: "不存在的四楼会随着姓名污染显现，并复制熟悉空间。", isKey: true },
    [clue(6)]: { clueId: clue(6), title: "进食主语的空白", category: "规则", description: "三点以后被进食的是姓名；规则故意不写谁有资格进食。", isKey: true },
    [clue(7)]: { clueId: clue(7), title: "宿管日记与定时录音", category: "人物", description: "吴阿姨的旧账、路线和死后录音共同保存三年循环。", isKey: true },
    [clue(8)]: { clueId: clue(8), title: "停滞时间与巨大月亮", category: "空间", description: "三楼安全区已被四楼贴近，窗外手印并非普通幻觉。", isKey: true },
    [clue(9)]: { clueId: clue(9), title: "黑色头像的撤回警告", category: "手机", description: "不要在四楼报完整姓名的警告来自失败后的林峰。", isKey: true },
    [clue(10)]: { clueId: clue(10), title: "未记录的新记忆", category: "身份", description: "新事实、新约定与自愿风险共同构成人格连续性的核心验真。", isKey: true },
    [clue(11)]: { clueId: clue(11), title: "羽毛的双重作用", category: "规则", description: "羽毛能短暂稳定姓名，也会吸引四楼并转移宿管污染。", isKey: true },
    [clue(12)]: { clueId: clue(12), title: "三年宿管制度", category: "人物", description: "宿管姓名按三年合同被侵蚀，岗位以继任者延续。", isKey: true },
    [clue(13)]: { clueId: clue(13), title: "错位存档与双来电", category: "手机", description: "未来黑色头像、双林来电和镜像时间共同证明闭环存在。", isKey: true },
    [clue(14)]: { clueId: clue(14), title: "死亡账号与用户不存在", category: "手机", description: "账号在线不等于身体存活，记录删除也不等于人格不存在。", isKey: true },
    [clue(15)]: { clueId: clue(15), title: "固定人数名册", category: "名册", description: "名册通过恢复一人、挤掉一人来维持固定位置。", isKey: true },
    [clue(16)]: { clueId: clue(16), title: "选择证明现在", category: "身份", description: "旧记忆、合法记录和羽毛都不能单独验真，当前选择必须进入证据链。", isKey: true },
    [clue(17)]: { clueId: clue(17), title: "正确人数的牺牲机制", category: "规则", description: "学校所谓秩序正常，只要求位置被填满，不保证原人仍在。", isKey: true },
    [clue(18)]: { clueId: clue(18), title: "四人五影", category: "身份", description: "出口可能出现第五道影子，而班群人数仍不增加。", isKey: true },
  };

  const endings = {
    E1: {
      endingId: "E1", title: "记得回宿舍", blueprintSceneId: "DR-C7-S04", scene: "namefloor_ending_breakfast",
      tone: "希望、温情、劫后余生",
      text: "固定人数的装订钉被砸断。林峰、周朝阳、谷雨和真正宋明带着散页与获救学生走进清晨，黑色头像退出原群位置。早餐店门口，谷雨已经在抱怨谁去买最难吃的那份早餐。",
      finalLine: "林峰，走了，回宿舍。",
      phoneState: "联系人四人恢复，名册成为可分离散页。",
    },
    E2: {
      endingId: "E2", title: "它也叫宋明", blueprintSceneId: "DR-C7-S05", scene: "namefloor_ending_song_guard",
      tone: "温情、难受、身份反转",
      text: "真正宋明已经死亡。同行宋明模仿者却凭一段新记忆和一次自愿风险成为新的主体。他从里面关上追逐门，把出口和最后一线羽毛的光让给林峰。学校格式之外，散页上留下一个手写名字。",
      finalLine: "我不是宋明。可我记得，他不想让你们死。",
      phoneState: "宋明账号上传一段无发送者语音后离线。",
    },
    E3: {
      endingId: "E3", title: "请记住谷雨", blueprintSceneId: "DR-C7-S06", scene: "namefloor_ending_guyu_voice",
      tone: "牺牲、悲伤、温情",
      text: "谷雨主动承接污染、代替林峰支付名额，又在出口持续喊名。林峰的联系人恢复，谷雨那一行却成为学校无法补回的空白。清晨只剩一段没有联系人的语音，仍在准确叫出林峰。",
      finalLine: "峰哥，你别忘了你是谁。",
      phoneState: "谷雨联系人和名册行同时为空，林峰保留无联系人语音。",
    },
    E4: {
      endingId: "E4", title: "你明明说过相信我", blueprintSceneId: "DR-C7-S07", scene: "namefloor_ending_betrayal_message",
      tone: "悔恨、愤怒、指责",
      text: "林峰曾当众承诺不会先放逐同伴，最后却把真人留在四楼。天亮以后，未污染基准和新记忆同时证明误判；被留下者的合法账号这时才恢复在线，消息越过封闭的出口抵达。",
      finalLine: "你明明说过相信我。",
      phoneState: "被留者账号恢复实名并显示在线。",
    },
    E5: {
      endingId: "E5", title: "全员到齐", blueprintSceneId: "DR-C7-S08", scene: "namefloor_ending_all_present_notice",
      tone: "制度讽刺、寒意、愤怒",
      text: "名册、校章和广播维持了四个位置，至少一名原人却已死亡、失名或被记录替换。公告栏里的四张脸都很清楚，其中一张的眼神与影子不一致。学校只统计位置，从不统计谁还在里面。",
      finalLine: "昨夜宿舍秩序正常，无人员失踪。",
      phoneState: "四个账号全部在线，名册四行盖有校章。",
    },
    E6: {
      endingId: "E6", title: "第二个林峰", blueprintSceneId: "DR-C7-S09", scene: "namefloor_ending_second_linfeng",
      tone: "身份恐怖、孤独、强反转",
      text: "玩家林峰跟着队伍走出宿舍楼，却没有账号、学籍和同学认知。合法林峰拥有家庭档案、姓名和朋友的迎接。玩家也许是真人被偷走身份，也许早已是替身；无论来源，他记得自己今晚作过的全部选择。",
      finalLine: "他们叫走了林峰，却没有一个人回头。",
      phoneState: "玩家手机显示用户不存在，名册只承认合法林峰。",
    },
    E7: {
      endingId: "E7", title: "还有一个人", blueprintSceneId: "DR-C7-S10", scene: "namefloor_ending_fifth_shadow",
      tone: "开放悬疑、不安",
      text: "林峰、周朝阳、谷雨和同行宋四个身体走进晨光，路灯下却投出五道不同步的影子。第五者可能是另一个林峰、自我伪人、假名或获救学生，也可能早已在四人之中。答案没有被强行揭晓。",
      finalLine: "群成员人数未发生变化。",
      phoneState: "班群仍显示四十二人，名册页边多出无名湿手印。",
    },
    E8: {
      endingId: "E8", title: "不要忘记你的名字", blueprintSceneId: "DR-C7-S11", scene: "namefloor_ending_midnight_loop",
      tone: "绝望、时间闭环、终极反转",
      text: "林峰进入姓名污染第九阶段，没有存活且可信的姓名锚，或黑色头像已经占据名册位置。他失去可辨认的面孔，成为占据自己原群位置的黑色头像，向零点的过去发出唯一还记得的警告。群人数从未增加，因为他占的一直是自己的位置。",
      finalLine: "不要忘记你的名字。",
      phoneState: "黑色头像永久占位，名册删除林峰，时间回到零点。",
    },
  };

  const endingPriority = ["E8", "E3", "E2", "E4", "E5", "E6", "E7", "E1"];
  const endingPreconditions = {
    E1: ["真正宋明及时获救并通过新事实验证", "至少一名被困学生获救", "砸断固定人数装订钉", "拒绝全员到齐与留人", "核对出口额外同行者"],
    E2: ["宋明全名泄露", "救援迟到导致真宋死亡", "同行模仿者拥有新记忆和自愿风险", "同行者自愿断后"],
    E3: ["谷雨承接姓名污染", "谷雨主动代位", "谷雨持续喊名", "林峰姓名恢复"],
    E4: ["曾明确承诺信任", "随后放逐真人", "楼外证据证明误判"],
    E5: ["保留固定人数制度", "确认全员到齐", "按配额留下一人", "至少一名原人被替代"],
    E6: ["玩家林身体连续性中断或姓名证据被夺", "合法林峰得到综合或合法证据", "合法林峰获名，玩家无名离开"],
    E7: ["制造第五人种子", "四个身体离开", "放行额外影子", "第五者身份保持未定"],
    E8: ["硬门槛：姓名污染第九阶段", "无活人姓名锚或黑色头像占据林峰名册位置", "向零点发送警告；亦为所有其他结局未命中时的固定兜底"],
  };

  function endingResolver(inputState = {}) {
    const state = inputState.storyState && typeof inputState.storyState === "object"
      ? { ...inputState, ...inputState.storyState }
      : inputState;
    const flags = state.flags || {};
    const has = (flagId) => flags[flagId] === true || state[flagId] === true;
    const stage = Math.max(Number(state.namePollutionStage || 0), has("name_stage_9") ? 9 : 0);
    const trueSongDied = (has("song_full_name_leaked") || has("said_songming_full_name")) && has("song_rescue_delayed");

    if (stage >= 9 && (has("no_live_anchor") || has("black_avatar_roster_slot") || has("player_stayed")) && has("sent_loop_warning")) return "E8";
    if (has("guyu_anchor_burden") && has("guyu_voluntary_substitution") && has("guyu_continuous_anchor") && has("guyu_trust_stable") && has("linfeng_restored")) return "E3";
    if (trueSongDied && has("song_new_memory_verified") && has("song_mimic_self_aware") && has("song_mimic_sacrificed")) return "E2";
    if (has("explicit_trust_promise") && has("trusted_then_abandoned") && has("misjudged_human")) return "E4";
    if (has("roster_intact") && has("confirmed_all_present") && has("sacrificed_for_quota") && has("mechanical_compliance") && has("original_person_lost")) return "E5";
    if (has("lin_continuity_broken") && has("legal_linfeng_confirmed") && has("legal_linfeng_named") && has("player_linfeng_escaped_nameless")) return "E6";
    if (has("fifth_seed") && has("fifth_released") && has("identity_unresolved")) return "E7";
    if (has("song_rescue_on_time") && has("song_new_memory_verified") && has("song_voluntary_risk") && has("rescued_trapped_student") && has("roster_quota_broken") && has("rejected_all_present") && has("no_one_left") && has("exit_audited") && has("all_core_escape")) return "E1";
    return "E8";
  }

  const defaultChoices = Object.fromEntries(decisionRegistry.map(({ nodeId, defaultChoiceId }) => [nodeId, defaultChoiceId]));
  const decisionByCode = Object.fromEntries(decisionRegistry.map((entry) => [entry.code, entry]));

  function route(expectedEnding, overrides = {}) {
    const choices = { ...defaultChoices };
    Object.entries(overrides).forEach(([code, key]) => {
      const entry = decisionByCode[code];
      if (entry) choices[entry.nodeId] = `${code.toLowerCase()}_${String(key).toLowerCase()}`;
    });
    return { startNodeId: "nf02_001", expectedEnding, choices };
  }

  const routePlans = {
    rememberedDormitory: route("E1"),
    itIsAlsoSongMing: route("E2", { C19: "C", C20: "C", C21: "A", C25: "E", C37: "F", C50: "D" }),
    rememberGuYu: route("E3", { C32: "C", C36: "C", C42: "A", C43: "B", C52: "A", C53: "B" }),
    promisedTrust: route("E4", { C35: "E", C37: "E", C50: "E" }),
    allPresent: route("E5", { C43: "E", C44: "C", C46: "A", C51: "F", C54: "C" }),
    secondLinFeng: route("E6", { C18: "T", C47: "C", C48: "C", C53: "A", C55: "C" }),
    oneMorePerson: route("E7", { C23: "C", C25: "A", C48: "A", C54: "B", C55: "D" }),
    doNotForgetYourName: route("E8", { C18: "T", C44: "E", C46: "D", C48: "F", C51: "G", C52: "D", C55: "A" }),
  };

  const blueprintSceneMap = [
    ...Array.from({ length: 10 }, (_, index) => `DR-C1-S${String(index + 1).padStart(2, "0")}`),
    ...Array.from({ length: 6 }, (_, index) => `DR-C2-S${String(index + 1).padStart(2, "0")}`),
    ...Array.from({ length: 6 }, (_, index) => `DR-C3-S${String(index + 1).padStart(2, "0")}`),
    ...Array.from({ length: 5 }, (_, index) => `DR-C4-S${String(index + 1).padStart(2, "0")}`),
    ...Array.from({ length: 5 }, (_, index) => `DR-C5-S${String(index + 1).padStart(2, "0")}`),
  ];

  const defaultStoryState = {
    ...(base.defaultStoryState || {}),
    namePollutionStage: Number(base.defaultStoryState?.namePollutionStage || 0),
    blackAvatarStage: base.defaultStoryState?.blackAvatarStage || "warning",
    strangerSmsKept: base.defaultStoryState?.strangerSmsKept ?? null,
    keptDiary: false,
    diaryCarrier: null,
    featherHolder: base.defaultStoryState?.featherHolder || null,
    featherState: "unseen",
    zhouTrustSignal: "guarded",
    guyuRemembersLinfeng: true,
    songIdentityJudgment: "unresolved",
    studentRulesFoodSubject: "unresolved",
    managerRulesTrust: "unread",
    calledFullNameOnFourth: false,
    acceptedAwareMimic: false,
    chapterThreeIrreversible: "unresolved",
    rosterState: base.defaultStoryState?.rosterState || "unseen",
    rosterCarrier: null,
    managerTrueName: base.defaultStoryState?.managerTrueName || null,
    managerNameStability: base.defaultStoryState?.managerNameStability || "unknown",
    managerSaved: base.defaultStoryState?.managerSaved ?? null,
    managerTrustSignal: base.defaultStoryState?.managerTrustSignal || "unmet",
    managerSuccessorIntent: base.defaultStoryState?.managerSuccessorIntent || false,
    promisedManagerSuccession: base.defaultStoryState?.promisedManagerSuccession || false,
    principalOfficeRoute: base.defaultStoryState?.principalOfficeRoute || null,
    featherPollutionSource: base.defaultStoryState?.featherPollutionSource || null,
    guyuMemoryDegree: base.defaultStoryState?.guyuMemoryDegree || "accurate",
    linfengPhotoState: base.defaultStoryState?.linfengPhotoState || "normal",
    nameAnchorCompleted: base.defaultStoryState?.nameAnchorCompleted || false,
    teamAcceptsLinfeng: base.defaultStoryState?.teamAcceptsLinfeng ?? true,
  };

  const defaultFlags = {
    ...(base.defaultFlags || {}),
    ...Object.fromEntries([...expansionFlagIds].map((flagId) => [flagId, false])),
  };

  const namePollutionStages = [
    { stage: 1, title: "通讯录缺字", visibleCarrier: "林峰的联系人姓名第一次缺字" },
    { stage: 2, title: "群聊消失", visibleCarrier: "林峰从群成员位置消失，黑色头像占位且人数不变" },
    { stage: 3, title: "共同经历松动", visibleCarrier: "熟人开始忘记与林峰共同发生的新事" },
    { stage: 4, title: "名单与账号缺失", visibleCarrier: "学籍、名单和账号不再承认玩家林峰" },
    { stage: 5, title: "合照替换", visibleCarrier: "合照里的林峰被另一张相同的脸覆盖" },
    { stage: 6, title: "他人忘名", visibleCarrier: "谷雨等同伴开始叫不出林峰" },
    { stage: 7, title: "自述阻塞", visibleCarrier: "林峰无法完整说出自己的姓名" },
    { stage: 8, title: "四楼进入现实", visibleCarrier: "不存在的四楼覆盖出口与现实记录" },
    { stage: 9, title: "身份被穿走", visibleCarrier: "姓名彻底消失，林峰成为占据原群位置的黑色头像" },
  ];

  const runtimeChapterIds = new Set(["namefloor_chapter_01", chapterIds[2], chapterIds[3], chapterIds[4], chapterIds[5]]);
  const runtimeNodes = Object.fromEntries(
    Object.entries(nodes).filter(([, node]) => runtimeChapterIds.has(node.chapterId)),
  );
  const runtimeFlagIds = new Set();
  Object.values(runtimeNodes).forEach((node) => {
    (node.setFlags || []).forEach((flagId) => runtimeFlagIds.add(flagId));
    (node.choices || []).forEach((choice) => (choice.setFlags || []).forEach((flagId) => runtimeFlagIds.add(flagId)));
    (node.phoneScreen?.actions || []).forEach((action) => (action.setFlags || []).forEach((flagId) => runtimeFlagIds.add(flagId)));
  });

  const allClues = { ...(base.clues || {}), ...clueDefinitions };
  const expansion = {
    schemaVersion: "namefloor-chapters-2-7-1.0",
    chapters,
    chapterMetadata: chapters,
    managerRules,
    rules: base.rules || [],
    clues: allClues,
    endings: {},
    endingPriority: [],
    endingPreconditions: {},
    endingConditions: {},
    routePlans: {},
    blueprintSceneMap,
    defaultFlags: {
      ...(base.defaultFlags || {}),
      ...Object.fromEntries([...runtimeFlagIds].map((flagId) => [flagId, false])),
    },
    defaultStoryState,
    nodes: runtimeNodes,
    profile: {
      ...(base.profile || {}),
      coreClueIds: Object.keys(allClues),
      endingPriority: [],
      endingResolver: () => null,
      namePollutionStages,
      identityEvidenceModel: {
        publicOldEvidence: "学籍、账号、家庭记录与旧记忆只能证明过去被记录过",
        unrecordedNewEvidence: "今晚没有进入设备的新事实与临时约定证明经历连续性",
        voluntaryRiskEvidence: "知情后的自愿承担证明当前主体能够作出自己的选择",
      },
      featherStateKeys: ["featherHolder", "featherState"],
      rosterStateKeys: ["rosterState", "rosterCarrier"],
      relationshipDefs: [
        ...((base.profile && base.profile.relationshipDefs) || []),
        { id: "recognition_songming", character: "宋明", label: "身份认知", levels: ["排斥", "观察", "承认", "托付"] },
        { id: "trust_wu", character: "吴阿姨", label: "信任", levels: ["敌对", "试探", "合作", "赎罪"] },
      ],
    },
  };

  window.MIST_DORMITORY_NAMEFLOOR_CHAPTERS_2_7 = expansion;
})();
