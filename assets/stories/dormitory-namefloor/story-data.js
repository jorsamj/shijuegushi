(function () {
  "use strict";

  const chapterId = "namefloor_chapter_01";
  const nodes = {};
  const add = (node) => { nodes[node.nodeId] = { chapterId, feedbackMode: "none", ...node }; };
  const choice = (nodeId, scene, speaker, text, choices, extra = {}) => add({ nodeId, scene, speaker, text, type: "choice", choices, ...extra });
  const line = (nodeId, scene, speaker, text, nextNodeId, extra = {}) => add({ nodeId, scene, speaker, text, nextNodeId, ...extra });
  const option = (choiceId, text, nextNodeId, extras = {}) => ({ choiceId, text, nextNodeId, feedbackMode: "none", ...extras });
  const phone = (view, title, time, extras = {}) => ({
    kind: view === "rules" ? "system" : view === "message" ? "private" : "group",
    view,
    title,
    time,
    battery: extras.battery ?? 74,
    signal: extras.signal || "4G",
    members: extras.members || [],
    memberCount: extras.memberCount,
    messages: extras.messages || [],
    systemNotice: extras.systemNotice || "",
    actions: extras.actions || [],
    ...extras,
  });

  const rules = [
    { ruleId: "namefloor_rule_outside", number: 1, title: "午夜后不得逗留", text: "十二点以后不准在寝室外逗留。如果你在宿舍外面，请立即前往三楼宿管宿舍。", status: "unverified" },
    { ruleId: "namefloor_rule_manager_floor", number: 2, title: "宿管宿舍在三楼", text: "宿管宿舍一定在三楼。", status: "unverified" },
    { ruleId: "namefloor_rule_no_four", number: 3, title: "没有四楼", text: "我校宿舍楼没有四楼。", status: "unverified" },
    { ruleId: "namefloor_rule_no_open", number: 4, title: "不要开门", text: "请不要给任何人开门。", status: "unverified" },
    { ruleId: "namefloor_rule_inspection", number: 5, title: "查房时间", text: "我校宿管查房时间为一点至三点。", status: "unverified" },
    { ruleId: "namefloor_rule_vest", number: 6, title: "只认绿色马甲", text: "宿管阿姨穿绿色马甲。如遇穿红色马甲者，请不要与其对话，立即前往三楼宿管宿舍。", status: "unverified" },
    { ruleId: "namefloor_rule_food", number: 7, title: "三点可以进食", text: "宿舍禁止大声喧哗。三点可以进食。", status: "unverified" },
    { ruleId: "namefloor_rule_four_repeat", number: 8, title: "再次重申没有四楼", text: "再次重申，我校宿舍楼没有四楼。如果你看到了四楼，那一定是幻觉，请立即前往宿管宿舍。", status: "unverified" },
  ];

  const chapters = [
    { chapterId, title: "第一章：不要忘记你的名字", order: 1, status: "vertical-slice" },
    { chapterId: "namefloor_chapter_02", title: "第二章：门外的人", order: 2, status: "blueprint-only" },
    { chapterId: "namefloor_chapter_03", title: "第三章：三点可以进食", order: 3, status: "blueprint-only" },
    { chapterId: "namefloor_chapter_04", title: "第四章：宿管的三年", order: 4, status: "blueprint-only" },
    { chapterId: "namefloor_chapter_05", title: "第五章：班群里被删除的人", order: 5, status: "blueprint-only" },
    { chapterId: "namefloor_chapter_06", title: "第六章：校长室", order: 6, status: "blueprint-only" },
    { chapterId: "namefloor_chapter_07", title: "第七章：谁是林峰", order: 7, status: "blueprint-only" },
  ];

  line("nf01_001", "namefloor_dorm_midnight", "旁白", "午夜十二点，十一楼男生宿舍只剩手机屏幕的冷光。宋明披着毛巾下床，林峰以为他又要去洗手间。", "nf01_002", { effects: [{ type: "light-flicker", level: "light", durationMs: 500 }] });
  line("nf01_002", "namefloor_phone_glow", "旁白", "一条没有号码、没有头像的短信压过短视频画面。手机在掌心震了一下。", "nf01_003", { effects: [{ type: "phone-vibrate", level: "light", durationMs: 380 }] });
  add({
    nodeId: "nf01_003", scene: "namefloor_phone_glow", speaker: "旁白", text: "短信只有一句：不要忘记你的名字。", type: "phone-interaction",
    phoneScreen: phone("message", "陌生信息", "00:00", {
      messages: [{ sender: "未知联系人", text: "不要忘记你的名字。", isUnknown: true }],
      actions: [
        { actionId: "sms_save", label: "截图保存", nextNodeId: "nf01_004", setFlags: ["saved_first_message"] },
        { actionId: "sms_reply", label: "回复：你是谁？", nextNodeId: "nf01_004", setFlags: ["replied_first_message", "unknown_sender_heard_linfeng"] },
        { actionId: "sms_block", label: "拉黑并删除", nextNodeId: "nf01_004", setFlags: ["deleted_first_message"] },
        { actionId: "sms_forward", label: "转发给舍友", nextNodeId: "nf01_004", setFlags: ["forwarded_first_message", "saved_first_message"] },
        { actionId: "sms_keep", label: "暂时保留", nextNodeId: "nf01_004", setFlags: ["kept_first_message"] },
      ],
    }),
  });
  line("nf01_004", "namefloor_dorm_midnight", "宋明", "我去趟洗手间。门卡在桌上，别锁死。", "nf01_005", { contentType: "dialogue", visualCharacter: "宋明" });
  line("nf01_005", "namefloor_dorm_door", "旁白", "门没有合严。刺白的走廊灯从缝里切进来，一条瘦得不合比例的影子贴着地面掠过。", "nf01_006", { effects: [{ type: "focus-pulse", level: "medium", durationMs: 850 }] });
  choice("nf01_006", "namefloor_dorm_door", "旁白", "门缝还在扩大。", [
    option("close_now", "立刻把门推上", "nf01_007", { setFlags: ["door_closed_in_time"] }),
    option("call_songming", "先叫住宋明", "nf01_007", { setFlags: ["called_songming_name", "mimic_heard_songming"] }),
    option("freeze_at_door", "盯着影子，没有动", "nf01_007", { setFlags: ["door_closed_late", "mimic_heard_room"] }),
  ], { timedChoice: { durationMs: 5000, fallbackChoiceId: "freeze_at_door" }, effects: [{ type: "door-impact", level: "medium", durationMs: 700 }] });
  line("nf01_007", "namefloor_dorm_door", "旁白", "门终于扣住锁舌。周朝阳和谷雨被声音惊醒，宋明的床已经空了。", "nf01_008", { visualCast: [{ characterId: "周朝阳", position: "left", framing: "bust" }, { characterId: "谷雨", position: "right", framing: "bust" }] });
  choice("nf01_008", "namefloor_dorm_midnight", "林峰", "刚才门外有个影子。", [
    option("trust_zhou_check", "先听周朝阳的，别喊人", "nf01_009", { relationshipEffects: [{ id: "trust_zhouchaoyang", delta: 8, reason: "先让周朝阳检查异常" }] }),
    option("ask_gu_message", "让谷雨马上联系宋明", "nf01_009", { relationshipEffects: [{ id: "trust_guyu", delta: 6, reason: "重视谷雨的办法" }] }),
    option("dismiss_shadow", "可能只是楼道里的同学", "nf01_009", { relationshipEffects: [{ id: "trust_zhouchaoyang", delta: -4, reason: "忽视现场异常" }] }),
  ]);
  line("nf01_009", "namefloor_phone_glow", "旁白", "班群通知突然顶到屏幕最上方。群聊已经全体禁言，一个全黑头像发布了《宿舍文明守则》。", "nf01_010", { effects: [{ type: "phone-vibrate", level: "light", durationMs: 420 }] });
  add({
    nodeId: "nf01_010", scene: "namefloor_phone_glow", speaker: "旁白", text: "八条规则在同一条消息里完整出现。", type: "phone-interaction", ruleReview: true,
    phoneScreen: phone("rules", "班级群 · 宿舍文明守则", "00:08", {
      memberCount: 42,
      members: [{ name: "黑色头像", isBlackAvatar: true }, { name: "周朝阳" }, { name: "谷雨" }, { name: "宋明" }],
      rules,
      systemNotice: "全体成员已被禁言。群成员 42 人。",
      actions: [
        { actionId: "read_rules", label: "读完并保存规则", nextNodeId: "nf01_011", setFlags: ["saved_student_rules"] },
        { actionId: "open_members", label: "检查群人数和成员", nextNodeId: "nf01_012", setFlags: ["checked_group_count"] },
      ],
    }),
  });
  line("nf01_011", "namefloor_phone_glow", "周朝阳", "别只看内容。发消息的人是谁？", "nf01_012", { contentType: "dialogue", visualCharacter: "周朝阳" });
  add({
    nodeId: "nf01_012", scene: "namefloor_phone_glow", speaker: "旁白", text: "群人数仍是四十二。黑色头像占着一个位置，却查不到任何资料；林峰自己的名字从成员列表里闪退了一瞬。", type: "phone-interaction", identityDisplay: "林?",
    phoneScreen: phone("members", "班级群成员", "00:10", {
      memberCount: 42,
      members: [{ name: "黑色头像", isBlackAvatar: true }, { name: "周朝阳" }, { name: "谷雨" }, { name: "宋明" }, { name: "林?", isGlitched: true }],
      actions: [
        { actionId: "capture_member_list", label: "截图成员列表", nextNodeId: "nf01_013", setFlags: ["saved_member_count"] },
        { actionId: "tap_black_avatar", label: "点开黑色头像", nextNodeId: "nf01_013", setFlags: ["checked_black_avatar"] },
        { actionId: "leave_members", label: "返回群聊", nextNodeId: "nf01_013" },
      ],
    }),
  });
  line("nf01_013", "namefloor_dorm_door", "门外的宋明", "林峰，快开门，我忘了带门卡。", "nf01_014", { contentType: "phone", visualCharacter: "宋明", effects: [{ type: "door-impact", level: "light", durationMs: 650 }] });
  choice("nf01_014", "namefloor_dorm_door", "旁白", "三下敲门声很规整。谷雨已经张开嘴，周朝阳先抬手示意安静。", [
    option("stop_guyu", "按住谷雨的手，别回应", "nf01_015", { relationshipEffects: [{ id: "trust_zhouchaoyang", delta: 5, reason: "遵守沉默判断" }], setFlags: ["stopped_guyu_response"] }),
    option("let_guyu_ask", "让谷雨低声问一句", "nf01_015", { setFlags: ["mimic_learned_guyu_voice"] }),
    option("approach_door", "自己靠近门边", "nf01_015", { setFlags: ["linfeng_exposed_near_door"] }),
  ]);
  add({
    nodeId: "nf01_015", scene: "namefloor_phone_glow", speaker: "旁白", text: "宋明的私聊仍停在离开宿舍之前。", type: "phone-interaction",
    phoneScreen: phone("message", "宋明", "00:13", {
      messages: [{ sender: "宋明", text: "我去洗手间，马上回来。", status: "23:58" }],
      actions: [
        { actionId: "send_where", label: "发送：你在哪？", nextNodeId: "nf01_016", setFlags: ["messaged_songming"] },
        { actionId: "send_private_code", label: "发送未公开的约定短句", nextNodeId: "nf01_016", setFlags: ["kept_private_songming_test"] },
        { actionId: "send_full_name", label: "发送宋明的完整姓名", nextNodeId: "nf01_016", setFlags: ["said_songming_full_name", "mimic_heard_songming"] },
        { actionId: "send_nothing", label: "不发送", nextNodeId: "nf01_016" },
      ],
    }),
  });
  line("nf01_016", "namefloor_phone_glow", "旁白", "消息转了很久，最后变成灰色的“未送达”。门外的人却准确地转向了林峰手机亮起的位置。", "nf01_017", { phoneScreen: phone("message", "宋明", "00:14", { messages: [{ sender: "林峰", text: "消息未送达", status: "发送失败" }] }), effects: [{ type: "signal-glitch", level: "light", durationMs: 600 }] });
  choice("nf01_017", "namefloor_peephole", "旁白", "猫眼外只能看见搭着毛巾的肩膀。那道影子却同时朝左右两个方向延伸。", [
    option("inspect_peephole", "继续按住猫眼检查", "nf01_018", { gainClues: ["namefloor_clue_split_shadow"] }),
    option("step_back_silent", "后退，保持沉默", "nf01_018", { setFlags: ["kept_distance_from_door"] }),
    option("ask_unrecorded", "隔着门问今晚没记录过的事", "nf01_018", { setFlags: ["used_unrecorded_test"] }),
  ], { effects: [{ type: "focus-pulse", level: "medium", durationMs: 900 }] });
  choice("nf01_018", "namefloor_dorm_door", "门外的宋明", "林峰。开门。", [
    option("hold_silence", "压低呼吸，保持沉默", "nf01_019", { setFlags: ["kept_silence_at_door"] }),
    option("tap_nonsense", "在门板上敲两下，不说话", "nf01_019", { setFlags: ["used_nonverbal_test"] }),
    option("try_handle", "试着压下门把", "nf01_019", { setFlags: ["door_cracked_open", "mimic_confirmed_room"] }),
    option("speak_songming", "喊出宋明的完整姓名", "nf01_019", { setFlags: ["said_songming_full_name", "mimic_heard_songming"] }),
  ], { timedChoice: { durationMs: 7000, fallbackChoiceId: "speak_songming" }, effects: [{ type: "door-impact", level: "medium", durationMs: 900 }] });
  line("nf01_019", "namefloor_dorm_door", "周朝阳", "别开门，也别再叫他的名字。它在等我们替它补全。", "nf01_020", { contentType: "dialogue", visualCharacter: "周朝阳" });
  choice("nf01_020", "namefloor_phone_glow", "旁白", "周朝阳把第 1、4、5 条规则并排放在屏幕上：门外的人违反了第一条；第四条要求不开门；现在还没到查房时间。", [
    option("mark_door_trusted", "暂时相信“不要开门”", "nf01_021", { ruleUpdates: [{ ruleId: "namefloor_rule_no_open", status: "temporarily-trusted" }] }),
    option("mark_outside_ambiguous", "标记“午夜后逗留”为存在歧义", "nf01_021", { ruleUpdates: [{ ruleId: "namefloor_rule_outside", status: "ambiguous" }] }),
    option("reserve_rule_judgment", "先不下结论", "nf01_021", { setFlags: ["reserved_rule_judgment"] }),
  ], { ruleReview: true, phoneScreen: phone("rules", "个人规则记录", "00:17", { rules: rules.filter((rule) => [1, 4, 5].includes(rule.number)) }) });
  line("nf01_021", "namefloor_dorm_door", "谷雨", "可如果真的是宋明呢？我们就让他一直站在外面？", "nf01_022", { contentType: "dialogue", visualCharacter: "谷雨" });
  line("nf01_022", "namefloor_dorm_door", "旁白", "回答从门缝、窗边和衣柜后同时响起。每一道都是宋明的声音，连喘息的停顿都一样。", "nf01_023", { effects: [{ type: "signal-glitch", level: "medium", durationMs: 1200 }] });
  line("nf01_023", "namefloor_dorm_door", "旁白", "指甲沿着铁皮门缓慢刮过。门板连震三次，灯灭了半秒；再亮起时，影子已经贴到天花板。", "nf01_024", { effects: [{ type: "blackout", level: "severe", durationMs: 700 }, { type: "door-impact", level: "severe", durationMs: 1600 }, { type: "blood-edge", level: "heavy", durationMs: 1000 }] });
  line("nf01_024", "namefloor_dorm_door", "旁白", "十分钟后，声音突然停了。隔壁宿舍却把门打开了。", "nf01_025");
  choice("nf01_025", "namefloor_corridor_attack", "旁白", "墙外传来一句迟疑的询问、几步脚步和一声很轻的笑。", [
    option("warn_neighbor", "隔墙警告他们别开门", "nf01_026", { setFlags: ["warned_neighbor"], relationshipEffects: [{ id: "trust_guyu", delta: 4, reason: "试图救隔壁学生" }] }),
    option("stay_silent_neighbor", "遵守安静，不出声", "nf01_026", { setFlags: ["kept_silent_during_attack"] }),
    option("record_attack", "用手机录下声音", "nf01_026", { gainClues: ["namefloor_clue_neighbor_attack"] }),
  ], { timedChoice: { durationMs: 5500, fallbackChoiceId: "stay_silent_neighbor" } });
  line("nf01_026", "namefloor_corridor_attack", "旁白", "门外先是重物撞墙，随后是被拖远的摩擦声。灯光恢复时，一道血迹停在 1107 门外。", "nf01_027", { effects: [{ type: "blackout", level: "heavy", durationMs: 450 }, { type: "scene-shake", level: "heavy", durationMs: 1450 }, { type: "blood-edge", level: "medium", durationMs: 1250 }] });
  line("nf01_027", "namefloor_phone_glow", "旁白", "禁言的班群里，宋明的在线点亮了一瞬。黑色头像撤回一条消息；群人数仍然没有变化。", "nf01_028", { phoneScreen: phone("group", "班级群", "00:47", { memberCount: 42, members: [{ name: "黑色头像", isBlackAvatar: true }, { name: "宋明", isOnline: true }], messages: [{ sender: "系统", text: "黑色头像撤回了一条消息" }] }) });
  line("nf01_028", "namefloor_phone_glow", "旁白", "成员列表刷新时，林峰的位置变成空白，黑色头像仍留在原处。屏幕顶部只剩两个字：林?。", "nf01_029", { identityDisplay: "林?", effects: [{ type: "name-glitch", level: "medium", durationMs: 900 }] });
  line("nf01_029", "namefloor_dorm_midnight", "周朝阳", "看着我。你叫什么名字？", "nf01_030", { contentType: "dialogue", visualCharacter: "周朝阳" });
  line("nf01_030", "namefloor_dorm_midnight", "林峰", "我叫林……峰。", "nf01_031", { contentType: "dialogue", visualCharacter: "林峰", identityDisplay: "林?" });
  line("nf01_031", "namefloor_red_inspection", "门外女声", "同学，查房时间到了，请打开门。", "nf01_032", { contentType: "broadcast", visualCharacter: "红色马甲宿管", effects: [{ type: "door-impact", level: "light", durationMs: 520 }] });
  choice("nf01_032", "namefloor_red_inspection", "旁白", "猫眼外是一角红色马甲。规则说，正常宿管只穿绿色。", [
    option("stay_silent_red", "保持沉默，示意所有人离门", "nf01_033", { setFlags: ["recognized_red_manager"], ruleUpdates: [{ ruleId: "namefloor_rule_vest", status: "verified" }] }),
    option("ask_vest_color", "隔门问她穿什么颜色", "nf01_033", { setFlags: ["spoke_to_red_manager", "red_manager_learned_linfeng"] }),
    option("answer_all_present", "回答宿舍人员已经到齐", "nf01_033", { setFlags: ["answered_red_manager", "red_manager_learned_room_count"] }),
    option("open_for_inspection", "打开房门接受查房", "nf01_033", { setFlags: ["opened_for_red_manager", "red_manager_inside_threshold"] }),
  ], { timedChoice: { durationMs: 6500, fallbackChoiceId: "answer_all_present" }, ruleReview: true });
  line("nf01_033", "namefloor_red_inspection", "旁白", "温柔的脸在猫眼里停得太久。眼白被血丝填满，嘴角先向两边裂开，四肢随后沿着门框拉长。", "nf01_034", { effects: [{ type: "face-dislocate", level: "severe", durationMs: 1200 }, { type: "light-flicker", level: "heavy", durationMs: 900 }] });
  line("nf01_034", "namefloor_red_inspection", "红色马甲宿管", "同学，你们宿舍都到齐了吗？", "nf01_035", { contentType: "broadcast", visualCharacter: "红色马甲宿管" });
  choice("nf01_035", "namefloor_stairwell", "旁白", "门锁被长指甲顶得向内弯。周朝阳推开消防门，三个人冲进楼梯间。", [
    option("run_down", "沿楼层数字向下跑", "nf01_036", { setFlags: ["followed_floor_numbers"] }),
    option("follow_zhou", "跟紧周朝阳，不看身后", "nf01_036", { relationshipEffects: [{ id: "trust_zhouchaoyang", delta: 8, reason: "追逐中接受周朝阳判断" }] }),
    option("pull_guyu", "拉住落后的谷雨", "nf01_036", { relationshipEffects: [{ id: "trust_guyu", delta: 10, reason: "追逐中没有丢下谷雨" }] }),
  ], { timedChoice: { durationMs: 6000, fallbackChoiceId: "run_down" }, effects: [{ type: "scene-shake", level: "severe", durationMs: 1700 }, { type: "focus-pulse", level: "heavy", durationMs: 1000 }] });
  line("nf01_036", "namefloor_stairwell", "旁白", "向下的一段楼梯比整栋楼还长。墙上的数字一会儿是 11，一会儿是 3，最后在视野中央定格成 4。", "nf01_037", { effects: [{ type: "signal-glitch", level: "heavy", durationMs: 1250 }, { type: "focus-pulse", level: "medium", durationMs: 1000 }] });
  line("nf01_037", "namefloor_floor_four", "林峰", "规则写了学校没有四楼。你到底在干什么？", "nf01_038", { contentType: "dialogue", visualCharacter: "林峰" });
  choice("nf01_038", "namefloor_floor_four", "周朝阳", "先别看门牌。回答我：你叫什么名字？", [
    option("answer_linfeng", "我叫林峰", "nf01_039", { setFlags: ["name_anchor_spoken"] }),
    option("ask_guyu_help", "让谷雨替自己说", "nf01_039", { setFlags: ["guyu_anchored_linfeng"], relationshipEffects: [{ id: "trust_guyu", delta: 6, reason: "把姓名交给谷雨确认" }] }),
    option("cannot_answer", "张了张嘴，名字卡在喉咙里", "nf01_039", { setFlags: ["first_name_block"] }),
  ]);
  line("nf01_039", "namefloor_floor_four", "旁白", "林峰能听见自己的姓，却迟了很久才找回最后一个字。数字 4 后方的走廊，和他们居住的十一楼一模一样。", "nf01_040", { identityDisplay: "林?", effects: [{ type: "name-glitch", level: "heavy", durationMs: 1100 }] });
  add({ nodeId: "nf01_040", scene: "namefloor_floor_four", speaker: "旁白", text: "走廊尽头，三楼宿管宿舍的门牌竟挂在不存在的四楼上。门缝里没有灯，只有翻动纸页的声音。", type: "chapter-ending", chapterEnding: { title: "第一章 · 不要忘记你的名字", text: "他们找到了宿管宿舍，也第一次失去了对楼层和姓名的把握。" }, effects: [{ type: "focus-pulse", level: "medium", durationMs: 900 }] });

  const clues = {
    namefloor_clue_split_shadow: { clueId: "namefloor_clue_split_shadow", title: "分成两道的影子", category: "身份", description: "门外的宋明只有一个轮廓，影子却同时朝两个方向延伸。", isKey: true },
    namefloor_clue_neighbor_attack: { clueId: "namefloor_clue_neighbor_attack", title: "隔壁开门后的录音", category: "规则", description: "开门后出现撞击和拖拽，证明“不要开门”至少在当前时段具有保护作用。", isKey: true },
  };

  const defaultFlags = Object.fromEntries([
    "saved_first_message", "replied_first_message", "deleted_first_message", "forwarded_first_message", "kept_first_message",
    "door_closed_in_time", "door_closed_late", "called_songming_name", "saved_student_rules", "checked_group_count",
    "saved_member_count", "checked_black_avatar", "stopped_guyu_response", "mimic_learned_guyu_voice", "messaged_songming",
    "kept_private_songming_test", "said_songming_full_name", "kept_silence_at_door", "door_cracked_open", "warned_neighbor",
    "recognized_red_manager", "spoke_to_red_manager", "answered_red_manager", "opened_for_red_manager", "name_anchor_spoken",
    "guyu_anchored_linfeng", "first_name_block"
  ].map((flag) => [flag, false]));

  const relationshipDefs = [
    { id: "trust_zhouchaoyang", character: "周朝阳", label: "信任", levels: ["保留", "协作", "互信", "托付"] },
    { id: "trust_guyu", character: "谷雨", label: "信任", levels: ["退缩", "靠近", "互信", "记住"] },
  ];

  window.MIST_DORMITORY_NAMEFLOOR_DATA = {
    schemaVersion: "namefloor-slice-1.0",
    script: {
      scriptId: "script_dormitory_namefloor",
      seriesId: "series_dormitory_namefloor",
      title: "宿舍规则怪谈",
      status: "open",
      order: 2,
      startNodeId: "nf01_001",
      summary: "午夜班群出现不存在的成员。林峰必须在相互矛盾的规则、被删除的姓名与不存在的四楼之间，证明自己仍然是自己。",
      sliceLabel: "第一章纵向样板",
    },
    series: {
      seriesId: "series_dormitory_namefloor",
      title: "宿舍规则怪谈",
      status: "open",
      order: 2,
      summary: "规则不会直接告诉你怎样活下来，它们先问你：谁有资格保留自己的名字。",
      scriptIds: ["script_dormitory_namefloor"],
    },
    chapters,
    rules,
    hiddenRules: [],
    clues,
    defaultFlags,
    defaultStoryState: {
      namePollutionStage: 0,
      blackAvatarStage: "warning",
      featherHolder: null,
      rosterState: "unseen",
    },
    endings: {},
    nodes,
    profile: {
      capabilities: { rulesPanel: true, portraitMaster: true, interactivePhone: true, quietFeedback: true, chapterEnding: true },
      coreClueIds: Object.keys(clues),
      focusedClueReveals: [],
      clueFilters: ["全部", "关键线索", "身份", "规则", "手机"],
      relationshipDefs,
      evidenceLinks: [],
      deductionTotal: 0,
      endingResolver() { return null; },
    },
  };
})();
