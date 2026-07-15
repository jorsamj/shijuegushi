(function () {
  "use strict";

  const TITLE = "宿舍规则怪谈";
  const nodes = {};
  const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);

  const chapters = [
    { chapterId: "dorm_chapter_01", title: "第一章：立即上床", order: 1 },
    { chapterId: "dorm_chapter_02", title: "第二章：门外的室友", order: 2 },
    { chapterId: "dorm_chapter_03", title: "第三章：群里多出来的人", order: 3 },
    { chapterId: "dorm_chapter_04", title: "第四章：最亲近的人", order: 4 },
    { chapterId: "dorm_chapter_05", title: "第五章：两段广播", order: 5 },
    { chapterId: "dorm_chapter_06", title: "第六章：九十秒", order: 6 },
  ];

  const rules = [
    { ruleId: "dorm_rule_bed", number: 1, title: "立即上床", text: "请所有宿舍人员在三十秒内回到床铺，双脚不得接触地面。", status: "unverified" },
    { ruleId: "dorm_rule_door", number: 2, title: "不得开门", text: "管控结束前，不得为任何人员开门，即使门外人员具有熟悉外貌或声音。", status: "unverified" },
    { ruleId: "dorm_rule_name", number: 3, title: "不得回应完整姓名", text: "听见走廊、电话或广播呼叫完整姓名时，不得回应。", status: "unverified" },
    { ruleId: "dorm_rule_media", number: 4, title: "暂停发送语音视频", text: "暂时停止发送语音、视频和正面照片。", status: "unverified" },
    { ruleId: "dorm_rule_verify", number: 5, title: "交叉验证", text: "死亡或失联账号重新上线后不得立即信任，不同宿舍需要交叉验证。", status: "unverified" },
    { ruleId: "dorm_rule_escape", number: 6, title: "九十秒撤离", text: "应急撤离时必须两人同行，抵达出口前不得回应最终点名。", status: "unverified" },
  ];

  const hiddenRules = [
    { ruleId: "dorm_rule_correction", number: "修正", title: "纠正名单", text: "以上规则只能让你活到01:13。不要减少人数。让广播承认被删除的人，纠正名单。", status: "hidden-correction" },
  ];

  const clues = {
    dorm_clue_first_cleaning: { clueId: "dorm_clue_first_cleaning", title: "门缝血迹与带血拖鞋", category: "猎杀", description: "未按时上床的学生被拖走后，账号重新上线，说明身体和手机账号不再等价。", isKey: true },
    dorm_clue_dead_account_typing: { clueId: "dorm_clue_dead_account_typing", title: "死亡账号正在输入", category: "手机", description: "已经被拖走的账号仍在群里输入，且知道公开群聊里出现过的信息。", isKey: true },
    dorm_clue_double_chenlu: { clueId: "dorm_clue_double_chenlu", title: "两个陈露账号", category: "身份", description: "同一个人同时以视频和文字出现，其中一方的门牌方向与影子不一致。", isKey: true },
    dorm_clue_mother_call: { clueId: "dorm_clue_mother_call", title: "门外的母亲视频", category: "伪人", description: "视频中的母亲站在417门外，真正的母亲却在外地，说明伪人可调用亲近关系与旧记忆。", isKey: true },
    dorm_clue_true_false_broadcast: { clueId: "dorm_clue_true_false_broadcast", title: "两段互相冲突的广播", category: "广播", description: "真广播不用完整姓名且有固定提示音；伪广播要求公开路线并诱导进入东侧通道。", isKey: true },
    dorm_clue_2014_wanning: { clueId: "dorm_clue_2014_wanning", title: "2014年周婉宁记录", category: "旧案", description: "周婉宁曾发现伪人，却被误判为异常；广播系统记录了她，也删掉了她。", isKey: true },
  };

  const defaultFlags = {
    got_on_bed: false,
    disclosed_417_count: false,
    trusted_dead_account: false,
    saved_broadcast_rules: false,
    leaked_dynamic_code: false,
    verified_chenlu: false,
    kicked_real_account: false,
    allowed_mimic_group: false,
    said_full_name: false,
    comforted_linsui: false,
    doubted_linsui: false,
    trusted_wu: false,
    leaked_escape_route: false,
    trusted_true_broadcast: false,
    used_wanning_clue: false,
    saved_other_survivor: false,
    sacrificed_unknown: false,
    abandoned_real_survivor: false,
    chose_east_route: false,
    broke_broadcast: false,
    final_no_response: false,
    escaped_with_linsui: false,
    identity_stolen: false,
    third_online: false,
  };

  const endings = {
    dorm_ending_true_dawn: {
      endingId: "dorm_ending_true_dawn",
      title: "真正的天亮",
      emotion: "希望、温情、释然",
      scene: "dorm_outside_dawn",
      text: "天亮后，许棠、林穗和被确认的幸存者站在宿舍楼外。互助群第一次显示：在线人数与现场人数一致。她们没有立刻拥抱，只是一个一个确认名字，像重新学会相信活着的人。",
      finalLine: "这一次，回应她们的不是广播，是彼此的声音。",
      report: { type: "完整逃生", pathSummary: "你保存规则、识别真广播、没有泄露最终口令，并在最后点名时阻止了所有人回应。" },
    },
    dorm_ending_linsui_door: {
      endingId: "dorm_ending_linsui_door",
      title: "她替我关上门",
      emotion: "温情、牺牲、悲伤",
      scene: "dorm_stairwell",
      text: "防火门最后一次回弹时，林穗把许棠推出门外。她没有解释自己是不是还值得相信，只把门从里面合上。逃出后，许棠收到她未发出的文字：如果你看见两个我，记得选那个会怕的人。",
      finalLine: "最被怀疑的人，留下了最像人的选择。",
      report: { type: "牺牲逃生", pathSummary: "你保护过林穗，也怀疑过她；最终她用自己的选择证明了身份。" },
    },
    dorm_ending_left_behind: {
      endingId: "dorm_ending_left_behind",
      title: "被留下的人",
      emotion: "愤怒、悔恨、指责",
      scene: "dorm_stairwell",
      text: "你在闸机前把一名真正的幸存者挡回楼里。门锁落下后，迟到的视频才证明她的影子一直正常。其他人不再替你找理由。她的账号重新上线，只发来一句话：你明明说过会等我。",
      finalLine: "错误判断没有杀死所有人，却杀死了信任。",
      report: { type: "误判真人", pathSummary: "你把存疑当成证据，把真人留在了门内。" },
    },
    dorm_ending_legal_count: {
      endingId: "dorm_ending_legal_count",
      title: "合法人数",
      emotion: "愤怒、制度讽刺、寒意",
      scene: "dorm_ending_archive",
      text: "广播宣布当前人数符合登记要求。你们以为它终于放行。可天亮后，名单上的四个人整齐通过系统，其中一个人的影子慢了半拍；真正的人因为没有登记，被系统判定为不存在。",
      finalLine: "制度只确认数字正确，不确认出去的还是不是人。",
      report: { type: "机械服从", pathSummary: "你为了让人数合法，牺牲了一个未登记的真人。" },
    },
    dorm_ending_second_xutang: {
      endingId: "dorm_ending_second_xutang",
      title: "第二个许棠",
      emotion: "身份恐惧、强反转",
      scene: "dorm_outside_dawn",
      text: "许棠跑出宿舍楼，却无法通过校门的人脸识别。老师、同学和系统都叫不出她的名字。正门那边，另一个许棠走出来，林穗迟疑一秒后迎向了她。手机亮起：你已被移出群聊。",
      finalLine: "她活着出来了，只是名字先一步离开了她。",
      report: { type: "身份被窃", pathSummary: "你多次说出完整姓名或接触亲近影像，使伪人完成了替代。" },
    },
    dorm_ending_three_online: {
      endingId: "dorm_ending_three_online",
      title: "三人在线",
      emotion: "开放式恐惧、不安",
      scene: "dorm_outside_dawn",
      text: "许棠和林穗确认现场只有两个人。手机却显示三人在线，第三个账号沿着她们的位置同步移动，始终不说话。她们走到校门口时，互助群忽然跳出：陈露正在输入……",
      finalLine: "没有人知道第三个在线的人，是逃出来了，还是一直没出来。",
      report: { type: "开放不安", pathSummary: "你救出了核心同伴，但没有彻底核清所有账号。" },
    },
    dorm_ending_east_passage: {
      endingId: "dorm_ending_east_passage",
      title: "东侧安全通道",
      emotion: "绝望、欺骗、群体覆灭",
      scene: "dorm_stairwell",
      text: "你相信了东侧通道的广播。防火门关闭后，所有手机同时失去信号。片刻后，互助群中所有账号一起发送：我们已经安全离开。第二天，没有任何学生真正走出宿舍楼。",
      finalLine: "最整齐的报平安，来自已经不会呼吸的人。",
      report: { type: "伪广播误导", pathSummary: "你忽略了伪广播的用词、时间和完整姓名线索，带队进入了埋伏。" },
    },
    dorm_ending_broken_broadcast: {
      endingId: "dorm_ending_broken_broadcast",
      title: "砸碎广播",
      emotion: "愤怒、失控、灾难性反转",
      scene: "dorm_broadcast_room",
      text: "你砸碎了广播控制室。门锁全部打开，点名停止，伪广播也消失了。所有人都以为终于自由。天亮后学校照常上课，只是走进教室的人，已经没人能确认是否还是本人。",
      finalLine: "你毁掉了规则，也毁掉了最后一道笼门。",
      report: { type: "系统失效", pathSummary: "你的愤怒有理由，但未经验证的破坏让伪人离开了宿舍楼。" },
    },
  };

  function c(id, delta, reason) {
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
      choiceIntent: options.choiceIntent || "谨慎判断",
      ruleUpdates: options.ruleUpdates || [],
      phoneUpdates: options.phoneUpdates || [],
      survivalEffects: options.survivalEffects || [],
      sfxOnChoice: [],
      isCorrect: options.isCorrect === true,
    };
  }

  function contentTypeFor(data) {
    if (data.contentType) return data.contentType;
    if (data.type === "choice" || data.type === "deduction") return "system";
    if (data.speaker === "宿舍广播") return "broadcast";
    if (!data.speaker || data.speaker === "旁白" || data.speaker === "Narrator") return "narration";
    return "dialogue";
  }

  function add(nodeId, data) {
    const contentType = contentTypeFor(data);
    const voiceEnabled = data.voiceEnabled !== undefined ? data.voiceEnabled : audibleTypes.has(contentType);
    nodes[nodeId] = {
      nodeId,
      chapterId: data.chapterId,
      scene: data.scene || "dorm_417_night",
      type: data.type || "dialogue",
      speaker: data.speaker || (contentType === "system" ? "系统" : "旁白"),
      text: data.text,
      nextNodeId: data.nextNodeId,
      choices: data.choices || [],
      question: data.question,
      bgm: data.bgm,
      ambience: data.ambience,
      gainClues: data.gainClues || [],
      setFlags: data.setFlags || [],
      relationshipEffects: data.relationshipEffects || [],
      ruleUpdates: data.ruleUpdates || [],
      phoneState: data.phoneState,
      phoneUpdates: data.phoneUpdates || [],
      identityChecks: data.identityChecks || [],
      survivalState: data.survivalState,
      effect: data.effect,
      effectIntensity: data.effectIntensity,
      effectDurationMs: data.effectDurationMs,
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
      contentType,
      voiceEnabled,
      spokenText: voiceEnabled ? (data.spokenText || data.text) : undefined,
      voiceDirection: data.voiceDirection,
    };
    if (data.nextNodeId === null) delete nodes[nodeId].nextNodeId;
  }

  add("dorm_01_001", { chapterId: "dorm_chapter_01", text: "00:17，417的灯同时熄灭。只剩许棠和林穗坐在上铺边，手机屏幕把两个人的脸照得发白。", nextNodeId: "dorm_01_002", objectiveId: "get-on-bed", objectiveText: "弄清第一轮广播规则并确保417有人活下来。", visualCharacter: "许棠", visualFocus: "phone", sceneHold: false, transitionStyle: "fade", effect: "lights-out", effectIntensity: "light" });
  add("dorm_01_002", { chapterId: "dorm_chapter_01", speaker: "宿舍广播", contentType: "broadcast", text: "请所有宿舍人员在三十秒内回到床铺，双脚不得接触地面。未按时归位者将不再被认定为宿舍人员。", nextNodeId: "dorm_01_003", setFlags: ["saved_broadcast_rules"], gainClues: ["dorm_clue_first_cleaning"], ruleUpdates: [{ ruleId: "dorm_rule_bed", status: "basic-credible" }, { ruleId: "dorm_rule_door", status: "unverified" }, { ruleId: "dorm_rule_name", status: "unverified" }, { ruleId: "dorm_rule_media", status: "unverified" }], visualFocus: "speaker", sfxOnEnter: [{ key: "dorm_broadcast_start", volume: 0.16, duckBgmMs: 260 }] });
  add("dorm_01_003", { chapterId: "dorm_chapter_01", text: "走廊尽头传来赤脚奔跑声。有人撞门，喊着让里面的人开一下。", nextNodeId: "dorm_01_004", scene: "dorm_floor4_corridor", visualFocus: "door-gap", effect: "hallway-shake", effectIntensity: "medium" });
  add("dorm_01_004", { chapterId: "dorm_chapter_01", type: "choice", text: "三十秒快到了。你要怎么处理417的第一反应？", choices: [
    choice("bed_quiet", "拉林穗一起上床，先不要回门外。", "dorm_01_005", { setFlags: ["got_on_bed"], relationshipEffects: [c("trust_linsui", 8, "你优先保证两个人活下来。")], ruleUpdates: [{ ruleId: "dorm_rule_bed", status: "verified" }], choiceIntent: "保命优先", choiceImpactText: "417没有发出声音。门外的撞击在最后三秒停止。" }),
    choice("open_voice", "隔门问她是哪间宿舍的人。", "dorm_01_005", { relationshipEffects: [c("trust_linsui", -5, "林穗听见你把声音给了走廊。")], choiceIntent: "冒险确认", choiceImpactText: "走廊里的声音立刻换成了你的语气，重复了一遍问题。" }),
  ] });
  add("dorm_01_005", { chapterId: "dorm_chapter_01", text: "拖拽声从门口经过。门缝里渗进一道短短的血线，一只带血拖鞋停在417门外。", nextNodeId: "dorm_01_006", scene: "dorm_floor4_corridor", visualFocus: "bloody-slipper", effect: "blood-edge", effectIntensity: "medium", gainClues: ["dorm_clue_first_cleaning"], ruleUpdates: [{ ruleId: "dorm_rule_bed", status: "verified" }] });
  add("dorm_01_006", { chapterId: "dorm_chapter_01", speaker: "宿舍广播", contentType: "broadcast", text: "一名违规人员已完成清理，当前楼层秩序正常。", nextNodeId: "dorm_01_007", visualFocus: "speaker" });
  add("dorm_01_007", { chapterId: "dorm_chapter_01", text: "四楼夜间互助群跳出新消息。刚才被拖走的头像重新亮起，状态显示：正在输入。", nextNodeId: "dorm_01_008", phoneState: { view: "group", title: "四楼夜间互助群", onlineCount: 11, anomaly: "死亡账号正在输入" }, visualFocus: "phone", gainClues: ["dorm_clue_dead_account_typing"] });
  add("dorm_01_008", { chapterId: "dorm_chapter_01", type: "choice", text: "群里有人问417还有几个人。", choices: [
    choice("hide_count", "只说417暂时安全，不公开人数。", "dorm_01_009", { relationshipEffects: [c("trust_linsui", 6, "林穗意识到你没有把人数交给群聊。")], choiceIntent: "隐藏人数", choiceImpactText: "群里安静几秒，没有新的账号追问床位。" }),
    choice("public_count", "公开417只有两个人，并提醒大家别下床。", "dorm_01_009", { setFlags: ["disclosed_417_count"], relationshipEffects: [c("support_chenlu", 4, "陈露感谢你的提醒，但人数也被所有账号看见了。")], choiceIntent: "公开求助", choiceImpactText: "消息刚发出，门外就传来两个脚步声，停在不同高度。" }),
  ] });
  add("dorm_01_009", { chapterId: "dorm_chapter_01", type: "choice", text: "死亡账号发来一句：我没死，刚才是我摔了一跤。", choices: [
    choice("doubt_dead", "标记为身份存疑，要求其他宿舍交叉确认。", "dorm_01_010", { relationshipEffects: [c("support_chenlu", 6, "陈露开始帮你记录账号异常。")], phoneUpdates: [{ contact: "失联学生", status: "身份存疑" }], choiceIntent: "交叉验证", choiceImpactText: "你没有立刻相信它，互助群里第一次出现了身份标记。" }),
    choice("trust_dead", "相信她还活着，提醒她回自己宿舍。", "dorm_01_010", { setFlags: ["trusted_dead_account"], phoneUpdates: [{ contact: "失联学生", status: "暂时可信" }], choiceIntent: "冒险救援", choiceImpactText: "账号回复了一个笑脸。林穗的手慢慢离开了手机。" }),
  ] });
  add("dorm_01_010", { chapterId: "dorm_chapter_01", text: "广播开始点名：许棠。两个字从扬声器里落下来，像有人把她从床铺上拎了起来。", nextNodeId: "dorm_01_011", visualCharacter: "许棠", visualFocus: "speaker", ruleUpdates: [{ ruleId: "dorm_rule_name", status: "basic-credible" }] });
  add("dorm_01_011", { chapterId: "dorm_chapter_01", type: "choice", text: "许棠张了张嘴。", choices: [
    choice("no_answer_name", "捂住自己的嘴，不回应完整姓名。", "dorm_02_001", { relationshipEffects: [c("trust_linsui", 6, "林穗帮你把被子拽住。")], ruleUpdates: [{ ruleId: "dorm_rule_name", status: "verified" }], choiceIntent: "遵守禁令", choiceImpactText: "广播停顿了三秒，没有得到你的声音。" }),
    choice("answer_name", "回答：我在。", "dorm_02_001", { setFlags: ["said_full_name"], relationshipEffects: [c("trust_linsui", -8, "林穗听见走廊模仿了你的回声。")], choiceIntent: "本能回应", choiceImpactText: "你回应之后，门外也有一个声音回答：我在。" }),
  ], objectiveComplete: true, chapterRecap: { title: "第一轮规则证明了：人、账号和名字可以被分开。", next: "门外会出现一个足够像室友的人。" } });

  add("dorm_02_001", { chapterId: "dorm_chapter_02", text: "415发来视频。房间里，赵晴和陈露都在。下一秒，415门外响起陈露的声音。", nextNodeId: "dorm_02_002", objectiveId: "verify-roommate", objectiveText: "判断门外的陈露与房内的陈露谁可信。", phoneState: { view: "video", title: "415视频", anomaly: "房内与门外同时出现陈露" }, visualFocus: "phone", ruleUpdates: [{ ruleId: "dorm_rule_door", status: "basic-credible" }] });
  add("dorm_02_002", { chapterId: "dorm_chapter_02", speaker: "陈露", text: "我就在房里。门外那个如果是我，让她说昨晚我把钥匙放哪了。", nextNodeId: "dorm_02_003", visualCharacter: "陈露" });
  add("dorm_02_003", { chapterId: "dorm_chapter_02", text: "门外的陈露回答得很快：你把钥匙塞进了泡面箱。赵晴的脸色变了。", nextNodeId: "dorm_02_004", scene: "dorm_floor4_corridor", visualFocus: "peephole" });
  add("dorm_02_004", { chapterId: "dorm_chapter_02", type: "choice", text: "旧记忆已经不可靠。你提议哪种验证？", choices: [
    choice("new_secret", "让房内陈露现场指定一个动作，门外不得听见。", "dorm_02_005", { relationshipEffects: [c("support_chenlu", 8, "陈露开始相信你不是只靠猜。"), c("trust_zhaoqing", 4, "赵晴接受了新的验证流程。")], choiceIntent: "临时秘密", choiceImpactText: "你把验证放在事件之后，伪人不能只靠旧聊天记录通过。" }),
    choice("old_memory", "继续追问只有陈露知道的旧事。", "dorm_02_005", { setFlags: ["leaked_dynamic_code"], relationshipEffects: [c("support_chenlu", -6, "陈露意识到旧事可能已经被读过。")], choiceIntent: "旧记忆验证", choiceImpactText: "门外的人答得越来越顺，像在翻一本你们共同写过的笔记。" }),
  ] });
  add("dorm_02_005", { chapterId: "dorm_chapter_02", text: "另一个宿舍有人受不了哭声，偷偷拧开门锁。撞门声、拖拽声和手机落地声挤在一起。", nextNodeId: "dorm_02_006", scene: "dorm_floor4_corridor", effect: "door-impact", effectIntensity: "heavy", sfxOnEnter: [{ key: "dorm_knock_wood", volume: 0.26 }] });
  add("dorm_02_006", { chapterId: "dorm_chapter_02", text: "?????????????????????????????????????????????????", nextNodeId: "dorm_02_007", gainClues: ["dorm_clue_dead_account_typing"], phoneUpdates: [{ contact: "??????", status: "????" }], visualFocus: "phone" });
  add("dorm_02_007", { chapterId: "dorm_chapter_02", speaker: "赵晴", text: "以后所有验证，先问今晚才发生的事。旧事不能算。", nextNodeId: "dorm_02_008", visualCharacter: "赵晴" });
  add("dorm_02_008", { chapterId: "dorm_chapter_02", type: "choice", text: "赵晴要求共享一个动态口令，方便四楼互相确认。", choices: [
    choice("share_code_private", "只发给已确认真人的私聊，不发群里。", "dorm_03_001", { relationshipEffects: [c("trust_zhaoqing", 6, "赵晴认同你限制口令传播。")], choiceIntent: "限制传播", choiceImpactText: "口令没有出现在公开群聊里。" }),
    choice("share_code_group", "发到互助群，先让大家都活过这一轮。", "dorm_03_001", { setFlags: ["leaked_dynamic_code"], relationshipEffects: [c("trust_zhaoqing", -4, "赵晴盯着群里的已读人数，没再说话。")], choiceIntent: "快速协作", choiceImpactText: "群里十一个头像全部显示已读，包括一个确认死亡的账号。" }),
  ], objectiveComplete: true, chapterRecap: { title: "伪人能回答旧问题，也能接管手机账号。", next: "下一次，它会同时扮演同一个人。" } });

  add("dorm_03_001", { chapterId: "dorm_chapter_03", text: "互助群里出现第二个陈露。两个头像、两个昵称、两条几乎一样的求救。", nextNodeId: "dorm_03_002", objectiveId: "mark-accounts", objectiveText: "通过手机界面标记真人、失联者和疑似伪人。", phoneState: { view: "group", title: "四楼夜间互助群", anomaly: "两个陈露账号" }, visualFocus: "phone", gainClues: ["dorm_clue_double_chenlu"] });
  add("dorm_03_002", { chapterId: "dorm_chapter_03", speaker: "陈露", text: "左边那个不是我。她不敢开视频。", nextNodeId: "dorm_03_003", visualCharacter: "陈露" });
  add("dorm_03_003", { chapterId: "dorm_chapter_03", text: "文字账号立刻发来一段视频。画面里的人在笑，嘴唇却慢了半秒。门牌417的方向也反了。", nextNodeId: "dorm_03_004", phoneState: { view: "video", title: "陈露的视频", anomaly: "嘴唇不同步、门牌镜像" }, visualFocus: "phone", gainClues: ["dorm_clue_double_chenlu"], effect: "signal-tear", effectIntensity: "medium" });
  add("dorm_03_004", { chapterId: "dorm_chapter_03", type: "choice", text: "你要如何处理两个陈露账号？", choices: [
    choice("mark_text_mimic", "把只发文字的账号标记为疑似伪人。", "dorm_03_005", { setFlags: ["verified_chenlu"], relationshipEffects: [c("support_chenlu", 10, "真正的陈露开始把视频证据交给你保存。")], phoneUpdates: [{ contact: "陈露-文字账号", status: "疑似伪人" }], choiceIntent: "标记伪人", choiceImpactText: "被标记的账号停止发言，但头像换成了许棠的照片。" }),
    choice("kick_video", "踢掉视频账号，认为视频更容易伪造。", "dorm_03_005", { setFlags: ["kicked_real_account"], relationshipEffects: [c("support_chenlu", -18, "陈露的真实视频被你踢出群聊。")], phoneUpdates: [{ contact: "陈露-视频账号", status: "已被踢出" }], choiceIntent: "错误踢出", choiceImpactText: "415那边的视频断了，赵晴只发来一句：你踢错了。" }),
  ] });
  add("dorm_03_005", { chapterId: "dorm_chapter_03", speaker: "沈妍", text: "别只看账号。看影子。", nextNodeId: "dorm_03_006", visualCharacter: "沈妍" });
  add("dorm_03_006", { chapterId: "dorm_chapter_03", text: "沈妍平时只发句号。今晚她连续打了三行，又全部撤回。最后留下：不要让它学会你们怎么说话。", nextNodeId: "dorm_03_007", phoneState: { view: "private", title: "沈妍", anomaly: "聊天习惯改变" }, visualFocus: "phone" });
  add("dorm_03_007", { chapterId: "dorm_chapter_03", type: "choice", text: "沈妍请求加入最终逃生队伍。", choices: [
    choice("verify_shenyan", "让她拍窗户倒影和床位，暂列身份存疑。", "dorm_03_008", { relationshipEffects: [c("trust_shenyan", 8, "你没有马上相信，也没有马上抛下沈妍。")], phoneUpdates: [{ contact: "沈妍", status: "身份存疑" }], choiceIntent: "多证据验证", choiceImpactText: "她发来的图里，窗户倒影有她，门外没有。" }),
    choice("allow_shenyan", "直接让她进互助群。", "dorm_03_008", { setFlags: ["allowed_mimic_group"], relationshipEffects: [c("trust_shenyan", -4, "沈妍没有反对，但赵晴质疑你的判断。")], choiceIntent: "快速接纳", choiceImpactText: "群里在线人数从十一变成十二，又变回十一。" }),
  ] });
  add("dorm_03_008", { chapterId: "dorm_chapter_03", text: "新的广播规则推送到手机：不同宿舍需要交叉验证；死亡或失联账号重新上线后不得立即信任。", nextNodeId: "dorm_04_001", ruleUpdates: [{ ruleId: "dorm_rule_verify", status: "basic-credible" }], objectiveComplete: true, chapterRecap: { title: "身份不再属于脸，也不再属于手机。", next: "伪人会从最亲近的人开始学习你。" } });

  add("dorm_04_001", { chapterId: "dorm_chapter_04", text: "许棠的手机响了。屏幕上是母亲的视频来电。接通前，预览画面里的人站在417门外。", nextNodeId: "dorm_04_002", objectiveId: "resist-close-voice", objectiveText: "判断亲近关系是否已经被伪人利用。", phoneState: { view: "call", title: "妈妈", anomaly: "视频位置在417门外" }, visualCharacter: "许棠", visualFocus: "phone", effect: "phone-vibration", effectIntensity: "light", gainClues: ["dorm_clue_mother_call"] });
  add("dorm_04_002", { chapterId: "dorm_chapter_04", type: "choice", text: "母亲来电一直震动。", choices: [
    choice("reject_call", "不接视频，只用另一部手机确认母亲位置。", "dorm_04_003", { relationshipEffects: [c("protect_xutang", 8, "许棠没有把自己的脸交给门外。")], choiceIntent: "拒绝影像", choiceImpactText: "真正的母亲在外地接起电话，声音发抖地问你怎么了。" }),
    choice("answer_call", "接通，确认她是不是真的在门外。", "dorm_04_003", { setFlags: ["identity_stolen"], relationshipEffects: [c("protect_xutang", -8, "门外看见了许棠完整的脸和反应。")], choiceIntent: "直面确认", choiceImpactText: "屏幕里的母亲没有眨眼，却喊出了你的乳名。" }),
  ] });
  add("dorm_04_003", { chapterId: "dorm_chapter_04", text: "门外的人开始讲许棠小时候的事。那些事不在任何群聊里，却可能在家庭相册和旧语音里。", nextNodeId: "dorm_04_004", scene: "dorm_floor4_corridor", visualFocus: "peephole" });
  add("dorm_04_004", { chapterId: "dorm_chapter_04", type: "choice", text: "你要不要看猫眼？", choices: [
    choice("peephole_check", "看猫眼，但不说话、不贴近门。", "dorm_04_005", { relationshipEffects: [c("protect_xutang", 5, "你确认了门外轮廓，却没有给它新的声音。")], choiceIntent: "低风险观察", choiceImpactText: "猫眼里是母亲的背影，鞋尖却朝着相反方向。" }),
    choice("call_full_name", "隔门喊出母亲完整姓名，要求她回答。", "dorm_04_005", { setFlags: ["said_full_name"], relationshipEffects: [c("protect_xutang", -10, "完整姓名被走廊记录。")], choiceIntent: "错误验真", choiceImpactText: "门外的人停了停，用同样完整的名字喊回了你。" }),
  ], ruleUpdates: [{ ruleId: "dorm_rule_name", status: "verified" }] });
  add("dorm_04_005", { chapterId: "dorm_chapter_04", text: "林穗忽然捂住耳朵。她说，她听见已经去世的姐姐在楼梯口叫她。", nextNodeId: "dorm_04_006", visualCharacter: "林穗", gainClues: ["dorm_clue_mother_call"] });
  add("dorm_04_006", { chapterId: "dorm_chapter_04", type: "choice", text: "林穗快要下床。", choices: [
    choice("comfort_linsui", "握住她，承认你也害怕，但让她先别回应。", "dorm_04_007", { setFlags: ["comforted_linsui"], relationshipEffects: [c("trust_linsui", 14, "你没有否定她的恐惧，只帮她守住规则。")], choiceIntent: "安抚同伴", choiceImpactText: "林穗的手还在抖，但她坐回了床边。" }),
    choice("deny_linsui", "直接告诉她那一定是假的，别添乱。", "dorm_04_007", { setFlags: ["doubted_linsui"], relationshipEffects: [c("trust_linsui", -14, "林穗开始把恐惧藏起来，不再第一时间告诉你。")], choiceIntent: "强硬否认", choiceImpactText: "她点头，却把手机屏幕扣了下去。" }),
  ] });
  add("dorm_04_007", { chapterId: "dorm_chapter_04", text: "吴阿姨从一楼值班室私聊你：2014年也有人听见亲人叫门。那个女生叫周婉宁。", nextNodeId: "dorm_04_008", phoneState: { view: "private", title: "吴阿姨", anomaly: "旧案线索" }, gainClues: ["dorm_clue_2014_wanning"], visualCharacter: "吴阿姨", ruleUpdates: [{ ruleId: "dorm_rule_correction", status: "hidden-correction" }] });
  add("dorm_04_008", { chapterId: "dorm_chapter_04", type: "choice", text: "吴阿姨愿意发旧记录，但要求你不要把路线公开到群里。", choices: [
    choice("trust_wu", "相信吴阿姨，私下保存2014记录。", "dorm_04_009", { setFlags: ["trusted_wu"], relationshipEffects: [c("trust_wu", 12, "吴阿姨发来了旧广播记录和楼层图。")], gainClues: ["dorm_clue_2014_wanning"], choiceIntent: "采信旧案", choiceImpactText: "旧记录里，周婉宁标注过伪广播用词。" }),
    choice("distrust_wu", "让她先把所有资料发到群里公开。", "dorm_04_009", { setFlags: ["leaked_escape_route"], relationshipEffects: [c("trust_wu", -10, "吴阿姨停止发送路线细节。")], choiceIntent: "公开透明", choiceImpactText: "群里立刻出现三个账号催她说出安全通道。" }),
  ] });
  add("dorm_04_009", { chapterId: "dorm_chapter_04", speaker: "周婉宁", contentType: "recording", text: "它不是我妈妈。它只是知道我希望妈妈来接我。", nextNodeId: "dorm_04_010", scene: "dorm_fire_memory_2014", visualCharacter: "周婉宁", voiceDirection: "真实旧录音，疲惫、克制，不做鬼声。" });
  add("dorm_04_010", { chapterId: "dorm_chapter_04", text: "手机自动保存了两条新证据：门外母亲视频，以及周婉宁旧录音。", nextNodeId: "dorm_05_001", gainClues: ["dorm_clue_mother_call", "dorm_clue_2014_wanning"], objectiveComplete: true, chapterRecap: { title: "伪人不只学声音，也会学你最想听见谁。", next: "真正的广播和伪造的广播将同时出现。" } });

  add("dorm_05_001", { chapterId: "dorm_chapter_05", text: "00:58，广播提示音响了两次。第一段来自走廊扬声器，第二段从群语音里传出。", nextNodeId: "dorm_05_002", scene: "dorm_manager_office", objectiveId: "choose-broadcast", objectiveText: "根据前期线索判断哪段广播可信。", visualFocus: "speaker", gainClues: ["dorm_clue_true_false_broadcast"] });
  add("dorm_05_002", { chapterId: "dorm_chapter_05", speaker: "宿舍广播", contentType: "broadcast", text: "所有人员继续留在床铺，不得进入楼梯间。", nextNodeId: "dorm_05_003", ruleUpdates: [{ ruleId: "dorm_rule_escape", status: "unverified" }] });
  add("dorm_05_003", { chapterId: "dorm_chapter_05", speaker: "宿舍广播", contentType: "broadcast", text: "东侧安全通道已经开放，请立即撤离。", nextNodeId: "dorm_05_004", visualFocus: "phone" });
  add("dorm_05_004", { chapterId: "dorm_chapter_05", type: "choice", text: "两段广播互相冲突。你先信哪一段？", choices: [
    choice("trust_hold", "相信固定提示音的留守广播，先核对吴阿姨记录。", "dorm_05_005", { setFlags: ["trusted_true_broadcast"], relationshipEffects: [c("trust_wu", 8, "吴阿姨确认提示音一致。")], choiceIntent: "识别真广播", choiceImpactText: "你注意到东侧广播称呼了具体学生姓名，格式不对。" }),
    choice("trust_east", "相信东侧通道开放，准备撤离。", "dorm_05_005", { setFlags: ["chose_east_route"], relationshipEffects: [c("trust_zhaoqing", 4, "赵晴也希望尽快离开。")], choiceIntent: "急切撤离", choiceImpactText: "东侧通道的账号开始催促各宿舍报人数。" }),
  ], ruleUpdates: [{ ruleId: "dorm_rule_escape", status: "contradiction" }] });
  add("dorm_05_005", { chapterId: "dorm_chapter_05", speaker: "吴阿姨", text: "真广播不会叫完整姓名。它只报规则，不替你选人。", nextNodeId: "dorm_05_006", visualCharacter: "吴阿姨" });
  add("dorm_05_006", { chapterId: "dorm_chapter_05", text: "吴阿姨发来2014年记录。周婉宁曾标出伪广播，却被其他宿舍当成危险源。", nextNodeId: "dorm_05_007", gainClues: ["dorm_clue_2014_wanning", "dorm_clue_true_false_broadcast"], visualFocus: "archive" });
  add("dorm_05_007", { chapterId: "dorm_chapter_05", type: "choice", text: "最终逃生队伍需要确认。沈妍和一个身份存疑的学生请求加入。", choices: [
    choice("team_verified", "只带多证据验证过的人，拒绝泄露路线。", "dorm_05_008", { relationshipEffects: [c("trust_shenyan", 6, "沈妍接受继续验证。"), c("trust_linsui", 4, "林穗认可你没有把恐惧变成抛弃。")], choiceIntent: "谨慎组队", choiceImpactText: "队伍人数少，但每个人都有至少两条验证。" }),
    choice("team_all", "把路线发群里，能走的都来。", "dorm_05_008", { setFlags: ["leaked_escape_route"], relationshipEffects: [c("trust_zhaoqing", -8, "赵晴意识到伪人也看见了路线。")], choiceIntent: "公开救援", choiceImpactText: "群里所有账号同时显示已读，包括确认死亡的账号。" }),
  ] });
  add("dorm_05_008", { chapterId: "dorm_chapter_05", type: "choice", text: "身份存疑者在门外敲暖气管，节奏和你们约定的一样。", choices: [
    choice("save_unknown", "不开门，但用跨宿舍视频和影子二次确认后接纳。", "dorm_05_009", { setFlags: ["saved_other_survivor"], relationshipEffects: [c("trust_linsui", 6, "林穗看见你愿意冒险救一个不确定的人。")], choiceIntent: "多证据救援", choiceImpactText: "你救下了另一个宿舍的真人，也保留了风险。" }),
    choice("sacrifice_unknown", "拒绝接纳，要求她离开门口。", "dorm_05_009", { setFlags: ["sacrificed_unknown"], relationshipEffects: [c("trust_linsui", -8, "林穗没有反驳，但她把视线移开了。")], choiceIntent: "牺牲存疑者", choiceImpactText: "门外的人安静下来。几分钟后，她的账号发来谢谢。" }),
  ] });
  add("dorm_05_009", { chapterId: "dorm_chapter_05", text: "手机记录生成逃生队伍：许棠、林穗、赵晴、陈露、沈妍，以及一名已验证的其他宿舍幸存者。", nextNodeId: "dorm_05_010", phoneState: { view: "team", title: "逃生队伍确认", anomaly: "人数随选择变化" }, visualFocus: "phone" });
  add("dorm_05_010", { chapterId: "dorm_chapter_05", text: "01:13前一分钟，真正的广播提示音从楼道响起，没有叫任何人的名字。", nextNodeId: "dorm_06_001", setFlags: ["used_wanning_clue"], objectiveComplete: true, chapterRecap: { title: "真广播冷漠，伪广播热心。真正危险的是太想被带走的声音。", next: "九十秒内，所有判断都会变成行动。" } });

  add("dorm_06_001", { chapterId: "dorm_chapter_06", speaker: "宿舍广播", contentType: "broadcast", text: "应急照明将在九十秒后失效，所有宿舍门将在此期间解除锁定。", nextNodeId: "dorm_06_002", objectiveId: "escape-90", objectiveText: "在九十秒内带队逃出宿舍楼，并阻止最终点名回应。", scene: "dorm_stairwell", transitionStyle: "fade", ruleUpdates: [{ ruleId: "dorm_rule_escape", status: "verified" }] });
  add("dorm_06_002", { chapterId: "dorm_chapter_06", text: "各宿舍同步开门。楼梯灯一亮一灭，每次亮起，走廊里相同的人影都更近一点。", nextNodeId: "dorm_06_003", scene: "dorm_stairwell", effect: "stairwell-flicker", effectIntensity: "medium" });
  add("dorm_06_003", { chapterId: "dorm_chapter_06", text: "????????????????????????????????????????????????????", nextNodeId: "dorm_06_004", relationshipEffects: [c("trust_zhaoqing", 4, "????????????")], visualFocus: "timer" });
  add("dorm_06_004", { chapterId: "dorm_chapter_06", text: "楼梯平台上出现两个林穗。一个伸手叫许棠，另一个只看着她的鞋。", nextNodeId: "dorm_06_005", visualCharacter: "林穗", effect: "double-character", effectIntensity: "heavy" });
  add("dorm_06_005", { chapterId: "dorm_chapter_06", type: "choice", text: "不能用手机验证。你只能问从未通过电子设备传播的信息。", choices: [
    choice("ask_offline_secret", "问她刚才在黑暗里握手时留下的暗号。", "dorm_06_006", { setFlags: ["escaped_with_linsui"], relationshipEffects: [c("trust_linsui", 10, "真正的林穗答出了没有被手机记录的细节。")], choiceIntent: "线下验真", choiceImpactText: "答错的那个林穗后退一步，脸像错位的纸。" }),
    choice("follow_louder", "跟着喊得更急的林穗走。", "dorm_06_006", { setFlags: ["identity_stolen"], relationshipEffects: [c("trust_linsui", -10, "你选择了更像恐惧的声音，而不是更真实的证据。")], choiceIntent: "情绪判断", choiceImpactText: "她拉住你的手，掌心冷得没有脉搏。" }),
  ] });
  add("dorm_06_006", { chapterId: "dorm_chapter_06", type: "choice", text: "楼梯口有人倒地，另一个人催你别停。", choices: [
    choice("rescue_fallen", "让两人掩护，救起倒地者。", "dorm_06_007", { setFlags: ["saved_other_survivor"], relationshipEffects: [c("trust_linsui", 6, "林穗跟着你弯下腰，没有争辩。")], choiceIntent: "救援真人", choiceImpactText: "你多带走一个人，也让队伍慢了几秒。" }),
    choice("leave_fallen", "不确认身份，先通过楼梯。", "dorm_06_007", { setFlags: ["abandoned_real_survivor"], relationshipEffects: [c("trust_linsui", -8, "林穗回头看了一眼，什么也没说。")], choiceIntent: "保全队伍", choiceImpactText: "身后的账号发来一句：你明明说过会等我。" }),
  ] });
  add("dorm_06_007", { chapterId: "dorm_chapter_06", type: "choice", text: "东侧和西侧通道同时亮起。", choices: [
    choice("west_route", "走吴阿姨记录里的西侧路线。", "dorm_06_008", { relationshipEffects: [c("trust_wu", 6, "旧记录和真广播对上了。")], choiceIntent: "按证据撤离", choiceImpactText: "西侧门慢了两秒才开，像有人不情愿地放行。" }),
    choice("east_route", "走东侧安全通道，那里灯更亮。", "dorm_06_008", { setFlags: ["chose_east_route"], choiceIntent: "误信亮处", choiceImpactText: "东侧门开得太快，门后没有脚步声。" }),
  ] });
  add("dorm_06_008", { chapterId: "dorm_chapter_06", text: "一楼闸机前，广播开始最终点名。它不命令你们跑，只平静地读出一个又一个完整姓名。", nextNodeId: "dorm_06_009", scene: "dorm_broadcast_room", effect: "final-freeze", effectIntensity: "medium", visualFocus: "gate" });
  add("dorm_06_009", { chapterId: "dorm_chapter_06", type: "choice", text: "有人本能地想回应。你怎么做？", choices: [
    choice("stop_response", "按住她，提醒所有人不要回应最终点名。", "dorm_06_010", { setFlags: ["final_no_response"], relationshipEffects: [c("trust_zhaoqing", 6, "赵晴帮你拦住另一边的人。")], choiceIntent: "阻止回应", choiceImpactText: "广播读完名单，没有得到任何人的声音。" }),
    choice("answer_final", "替大家回应：都在。", "dorm_06_010", { setFlags: ["identity_stolen"], choiceIntent: "错误承担", choiceImpactText: "你说完后，闸机识别到两个许棠。" }),
  ] });
  add("dorm_06_010", { chapterId: "dorm_chapter_06", type: "choice", text: "广播控制室的门半开。有人说只要砸掉它，一切就结束。", choices: [
    choice("leave_system", "不破坏系统，先通过出口。", "dorm_06_011", { choiceIntent: "克制离开", choiceImpactText: "你把愤怒留在门内，带着不完整的答案继续跑。" }),
    choice("break_system", "砸碎广播，让它再也不能点名。", "dorm_06_011", { setFlags: ["broke_broadcast"], choiceIntent: "破坏管控", choiceImpactText: "所有门锁同时打开。整栋楼发出一声松动的响。" }),
  ] });
  add("dorm_06_011", { chapterId: "dorm_chapter_06", text: "闸机亮起。手机、影子、脚步和呼吸声在最后一秒全部错开。", nextNodeId: "dorm_06_012", scene: "dorm_outside_dawn", transitionStyle: "fade", effect: "signal-tear", effectIntensity: "heavy" });
  add("dorm_06_012", { chapterId: "dorm_chapter_06", type: "ending", text: "天亮前，系统给出这一夜的最后判定。", nextNodeId: null, resolveEnding: true, objectiveComplete: true, chapterRecap: { title: "九十秒结束。真正需要结算的不是路线，而是你相信过谁、抛下过谁。", next: "查看结局回顾，确认关键选择链。" } });

  const chapterBeats = {
    dorm_chapter_01: { question: "广播为什么要求所有人立即上床？", confirmedFact: "不按时归位会被猎杀，死亡账号仍可能发言。", unresolved: "账号重新上线后是否还属于本人？", newQuestion: "伪人如何获得人的声音与账号？", investigationNodeIds: ["dorm_01_007"], choiceNodeIds: ["dorm_01_004", "dorm_01_008", "dorm_01_009", "dorm_01_011"], hook: "完整姓名第一次成为危险。" },
    dorm_chapter_02: { question: "门外陈露和房内陈露谁是真的？", confirmedFact: "旧记忆可以被读取，开门会导致猎杀。", unresolved: "死亡账号是否能诱导其他宿舍开门？", newQuestion: "动态口令泄露后还能不能用？", investigationNodeIds: ["dorm_02_001"], choiceNodeIds: ["dorm_02_004", "dorm_02_006", "dorm_02_008"], hook: "群里将出现两个相同账号。" },
    dorm_chapter_03: { question: "两个陈露账号中哪个可信？", confirmedFact: "视频、门牌、影子和聊天习惯都可被部分伪造。", unresolved: "沈妍的异常沉默是恐惧还是替换？", newQuestion: "身份标记会不会阻止真人加入队伍？", investigationNodeIds: ["dorm_03_003", "dorm_03_006"], choiceNodeIds: ["dorm_03_004", "dorm_03_007"], hook: "伪人开始学亲近关系。" },
    dorm_chapter_04: { question: "最亲近的人是否已经被模仿？", confirmedFact: "亲人影像和旧记忆都可被利用。", unresolved: "周婉宁当年为何被误判？", newQuestion: "真广播和伪广播如何区分？", investigationNodeIds: ["dorm_04_001", "dorm_04_007", "dorm_04_009"], choiceNodeIds: ["dorm_04_002", "dorm_04_004", "dorm_04_006", "dorm_04_008"], hook: "两段广播即将互相冲突。" },
    dorm_chapter_05: { question: "留守广播和撤离广播谁是真的？", confirmedFact: "伪广播会热心提供路线，真广播只给冷漠规则。", unresolved: "身份存疑者是否值得救？", newQuestion: "最终队伍里是否混入了不该存在的人？", investigationNodeIds: ["dorm_05_001", "dorm_05_006", "dorm_05_009"], choiceNodeIds: ["dorm_05_004", "dorm_05_007", "dorm_05_008"], hook: "01:13的九十秒撤离开始。" },
    dorm_chapter_06: { question: "九十秒内能否带真人逃出？", confirmedFact: "未通过电子设备传播的信息仍可短暂验真。", unresolved: "逃出去的账号是否仍属于本人？", newQuestion: "广播系统究竟是在保护人，还是保护登记秩序？", investigationNodeIds: ["dorm_06_004", "dorm_06_008"], choiceNodeIds: ["dorm_06_003", "dorm_06_005", "dorm_06_006", "dorm_06_007", "dorm_06_009", "dorm_06_010"], hook: "结局由整夜累积状态自然判定。" },
  };

  const rulePlaybook = {
    dorm_rule_bed: { firstNodeId: "dorm_01_002", verificationNodeId: "dorm_01_005", contradictionNodeId: "dorm_01_007", clueIds: ["dorm_clue_first_cleaning", "dorm_clue_dead_account_typing"], playerJudgment: "先上床保命，但不能把账号上线当作生还。", finalTruth: "basic-survival-rule", endingImpact: "早期是否服从影响林穗信任与伪人获取声音速度。" },
    dorm_rule_door: { firstNodeId: "dorm_01_002", verificationNodeId: "dorm_02_005", contradictionNodeId: "dorm_02_003", clueIds: ["dorm_clue_double_chenlu"], playerJudgment: "门外熟悉外貌和声音不能直接采信。", finalTruth: "verified", endingImpact: "错误开门或劝别人开门会造成死亡账号回流。" },
    dorm_rule_name: { firstNodeId: "dorm_01_010", verificationNodeId: "dorm_04_004", contradictionNodeId: "dorm_06_009", clueIds: ["dorm_clue_mother_call"], playerJudgment: "完整姓名会提高替代完整度。", finalTruth: "verified", endingImpact: "说出完整姓名会提高第二个许棠结局概率。" },
    dorm_rule_media: { firstNodeId: "dorm_01_002", verificationNodeId: "dorm_04_002", contradictionNodeId: "dorm_03_003", clueIds: ["dorm_clue_mother_call", "dorm_clue_double_chenlu"], playerJudgment: "语音、视频和正面照会被学习，但也可能留下证据。", finalTruth: "conditional", endingImpact: "接通亲人视频会导致身份被窃风险。" },
    dorm_rule_verify: { firstNodeId: "dorm_03_008", verificationNodeId: "dorm_06_005", contradictionNodeId: "dorm_02_004", clueIds: ["dorm_clue_double_chenlu", "dorm_clue_true_false_broadcast"], playerJudgment: "单一验证无效，必须使用多条互相独立的证据。", finalTruth: "verified", endingImpact: "影响是否误判真人或带入伪人。" },
    dorm_rule_escape: { firstNodeId: "dorm_05_003", verificationNodeId: "dorm_06_001", contradictionNodeId: "dorm_05_004", clueIds: ["dorm_clue_true_false_broadcast", "dorm_clue_2014_wanning"], playerJudgment: "越主动催促撤离的广播越可疑。", finalTruth: "verified-at-0113", endingImpact: "误信东侧通道会进入群体覆灭结局。" },
    dorm_rule_correction: { firstNodeId: "dorm_04_007", verificationNodeId: "dorm_05_006", contradictionNodeId: "dorm_06_010", clueIds: ["dorm_clue_2014_wanning", "dorm_clue_true_false_broadcast"], playerJudgment: "不要减少人数，要纠正被删除的人。", finalTruth: "hidden-correction", endingImpact: "决定是否进入真正的天亮或合法人数等制度讽刺结局。" },
  };

  const routePlans = {
    true_dawn: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "hide_count", dorm_01_009: "doubt_dead", dorm_01_011: "no_answer_name", dorm_02_004: "new_secret", dorm_02_008: "share_code_private", dorm_03_004: "mark_text_mimic", dorm_03_007: "verify_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "comfort_linsui", dorm_04_008: "trust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_verified", dorm_05_008: "save_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "rescue_fallen", dorm_06_007: "west_route", dorm_06_009: "stop_response", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_true_dawn" },
    linsui_door: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "hide_count", dorm_01_009: "doubt_dead", dorm_01_011: "no_answer_name", dorm_02_004: "new_secret", dorm_02_008: "share_code_private", dorm_03_004: "mark_text_mimic", dorm_03_007: "verify_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "comfort_linsui", dorm_04_008: "trust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_verified", dorm_05_008: "sacrifice_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "leave_fallen", dorm_06_007: "west_route", dorm_06_009: "stop_response", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_linsui_door" },
    left_behind: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "hide_count", dorm_01_009: "doubt_dead", dorm_01_011: "no_answer_name", dorm_02_004: "new_secret", dorm_02_008: "share_code_private", dorm_03_004: "mark_text_mimic", dorm_03_007: "verify_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "comfort_linsui", dorm_04_008: "trust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_verified", dorm_05_008: "save_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "leave_fallen", dorm_06_007: "west_route", dorm_06_009: "stop_response", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_left_behind" },
    legal_count: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "public_count", dorm_01_009: "trust_dead", dorm_01_011: "no_answer_name", dorm_02_004: "old_memory", dorm_02_008: "share_code_group", dorm_03_004: "mark_text_mimic", dorm_03_007: "allow_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "deny_linsui", dorm_04_008: "trust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_verified", dorm_05_008: "sacrifice_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "leave_fallen", dorm_06_007: "west_route", dorm_06_009: "stop_response", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_legal_count" },
    second_xutang: { choices: { dorm_01_004: "open_voice", dorm_01_008: "public_count", dorm_01_009: "trust_dead", dorm_01_011: "answer_name", dorm_02_004: "old_memory", dorm_02_008: "share_code_group", dorm_03_004: "mark_text_mimic", dorm_03_007: "allow_shenyan", dorm_04_002: "answer_call", dorm_04_004: "call_full_name", dorm_04_006: "deny_linsui", dorm_04_008: "distrust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_all", dorm_05_008: "sacrifice_unknown", dorm_06_005: "follow_louder", dorm_06_006: "leave_fallen", dorm_06_007: "west_route", dorm_06_009: "answer_final", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_second_xutang" },
    three_online: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "hide_count", dorm_01_009: "doubt_dead", dorm_01_011: "no_answer_name", dorm_02_004: "new_secret", dorm_02_008: "share_code_group", dorm_03_004: "mark_text_mimic", dorm_03_007: "verify_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "comfort_linsui", dorm_04_008: "trust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_verified", dorm_05_008: "save_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "rescue_fallen", dorm_06_007: "west_route", dorm_06_009: "stop_response", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_three_online" },
    east_passage: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "public_count", dorm_01_009: "trust_dead", dorm_01_011: "no_answer_name", dorm_02_004: "new_secret", dorm_02_008: "share_code_group", dorm_03_004: "mark_text_mimic", dorm_03_007: "verify_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "comfort_linsui", dorm_04_008: "distrust_wu", dorm_05_004: "trust_east", dorm_05_007: "team_all", dorm_05_008: "save_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "rescue_fallen", dorm_06_007: "east_route", dorm_06_009: "stop_response", dorm_06_010: "leave_system" }, expectedEnding: "dorm_ending_east_passage" },
    broken_broadcast: { choices: { dorm_01_004: "bed_quiet", dorm_01_008: "hide_count", dorm_01_009: "doubt_dead", dorm_01_011: "no_answer_name", dorm_02_004: "new_secret", dorm_02_008: "share_code_private", dorm_03_004: "mark_text_mimic", dorm_03_007: "verify_shenyan", dorm_04_002: "reject_call", dorm_04_004: "peephole_check", dorm_04_006: "comfort_linsui", dorm_04_008: "trust_wu", dorm_05_004: "trust_hold", dorm_05_007: "team_verified", dorm_05_008: "save_unknown", dorm_06_005: "ask_offline_secret", dorm_06_006: "rescue_fallen", dorm_06_007: "west_route", dorm_06_009: "stop_response", dorm_06_010: "break_system" }, expectedEnding: "dorm_ending_broken_broadcast" },
  };

  const phonePlaybook = {
    contactStatuses: ["确认真人", "暂时可信", "身份存疑", "已经失联", "确认死亡", "疑似伪人"],
    channels: ["四楼夜间互助群", "415私聊", "419私聊", "吴阿姨私聊", "母亲视频来电"],
    events: [
      { id: "group-initial", nodeId: "dorm_01_007", title: "死亡学生重新上线" },
      { id: "double-chenlu", nodeId: "dorm_03_001", title: "两个陈露账号" },
      { id: "video-mismatch", nodeId: "dorm_03_003", title: "嘴唇和门牌方向异常" },
      { id: "mother-call", nodeId: "dorm_04_001", title: "母亲视频来电" },
      { id: "broadcast-record", nodeId: "dorm_05_001", title: "真假广播记录" },
      { id: "team-confirm", nodeId: "dorm_05_009", title: "逃生队伍确认" },
    ],
  };

  const visualProduction = {
    reusedAssets: ["417宿舍夜景", "四楼走廊", "洗手间镜面", "楼梯间", "值班室", "广播控制室", "2014火灾记忆", "宿舍楼外天亮", "档案结局背景"],
    replacementNeeded: ["415宿舍", "419宿舍", "东侧安全通道", "西侧逃生路线", "身份闸机", "带血拖鞋", "门缝血迹", "拖拽痕迹", "猫眼中的熟人", "两个相同人物", "八个专属结局画面"],
    phoneScreensNeeded: phonePlaybook.events.map((event) => event.title),
    effects: [
      { nodeId: "dorm_01_001", effect: "瞬时熄灯", intensity: "轻度" },
      { nodeId: "dorm_01_005", effect: "门缝血迹", intensity: "中度" },
      { nodeId: "dorm_02_005", effect: "强烈撞门", intensity: "重度" },
      { nodeId: "dorm_03_003", effect: "信号撕裂", intensity: "中度" },
      { nodeId: "dorm_04_001", effect: "手机来电震动", intensity: "轻度" },
      { nodeId: "dorm_06_002", effect: "楼梯灯闪烁", intensity: "中度" },
      { nodeId: "dorm_06_004", effect: "同一人物同时出现", intensity: "重度" },
      { nodeId: "dorm_06_011", effect: "最终信号撕裂", intensity: "重度" },
    ],
  };

  const audioProduction = {
    status: "story-restructured-needs-dormitory-voice-regeneration",
    broadcastVoiceStatus: "stale-after-story-restructure",
    broadcastVoiceSource: "Existing Volcengine masters are retained as rollback assets only until the restructured text is regenerated.",
    broadcastVoiceLicense: "account-authorised synthesis retained; new text requires staging generation and manual listening sign-off",
    broadcastVoiceNote: "本轮重构修改了第二故事正式文本。旧宿舍对白和广播语音不得作为正式运行时依据；文本稳定后只为变化或新增的世界内声音进入staging并原子化切换。",
    approvedCuePolicy: "只有明确剧情动作使用拟音；手机文字消息默认静音；旁白继续静音。",
    pendingRegeneration: {
      dialogue: "all current dormitory dialogue, phone, recording and broadcast nodes in this restructured data",
      narration: "silent; do not generate",
      phoneText: "silent unless explicitly voice message, video call, or broadcast",
    },
    headphoneListeningSignoff: "pending",
    desktopSpeakerListeningSignoff: "pending",
    phoneSpeakerListeningSignoff: "pending",
    broadcastCadenceSignoff: "pending",
    crossStorySaveSignoff: "pending",
    dormitoryMobilePlaythroughSignoff: "pending",
    rainCallRegressionSignoff: "pending",
    mobileBackgroundRestoreSignoff: "pending",
    consoleErrorSignoff: "pending",
  };

  const endingPreconditions = {
    dorm_ending_true_dawn: ["隐藏417人数", "正确识别陈露", "信任吴阿姨记录", "识别真广播", "未泄露最终路线", "救下其他宿舍真人", "最终点名无人回应"],
    dorm_ending_linsui_door: ["保护林穗", "西侧撤离", "最终不破坏广播", "救援不足或耗时过长"],
    dorm_ending_left_behind: ["逃生阶段抛下倒地真人", "后续证据证明其身份"],
    dorm_ending_legal_count: ["牺牲身份存疑者", "机械执行人数合法", "没有纠正被删除者"],
    dorm_ending_second_xutang: ["泄露完整姓名或亲近影像", "最终回应点名或跟错林穗"],
    dorm_ending_three_online: ["核心两人逃出", "额外身份未核清", "未彻底排除第三账号"],
    dorm_ending_east_passage: ["误信东侧伪广播", "公开路线或进入东侧通道"],
    dorm_ending_broken_broadcast: ["砸碎广播控制系统"],
  };

  const inversionForeshadowing = {
    dorm_ending_linsui_door: ["第四章林穗听见亡姐但仍遵守规则", "第六章真正林穗能回答线下暗号"],
    dorm_ending_second_xutang: ["第一章完整姓名会被记录", "第四章门外母亲获得许棠影像和亲昵称呼"],
    dorm_ending_east_passage: ["第五章伪广播称呼具体学生姓名", "第三章死亡账号可同时制造假消息"],
    dorm_ending_broken_broadcast: ["第五章真广播冷漠但格式稳定", "第六章广播系统仍限制门锁解除时间"],
  };

  const relationshipDefs = [
    { id: "trust_linsui", character: "林穗", label: "信任", levels: ["疏离", "动摇", "互信", "托付"] },
    { id: "trust_zhaoqing", character: "赵晴", label: "协作", levels: ["对抗", "观望", "协同", "承担"] },
    { id: "support_chenlu", character: "陈露", label: "证据协作", levels: ["分散", "响应", "主动", "共担"] },
    { id: "trust_shenyan", character: "沈妍", label: "可信度", levels: ["存疑", "保留", "可信", "关键证人"] },
    { id: "protect_xutang", character: "许棠", label: "存在感", levels: ["被忽略", "被看见", "被保护", "被承认"] },
    { id: "trust_wu", character: "吴阿姨", label: "旧案信任", levels: ["回避", "怀疑", "采信", "交托"] },
  ];

  window.MIST_DORMITORY_DATA = {
    schemaVersion: "2.0",
    script: {
      scriptId: "script_dormitory_rollcall",
      seriesId: "series_dormitory_rollcall",
      title: TITLE,
      status: "open",
      order: 2,
      startNodeId: "dorm_01_001",
      summary: "封闭女生宿舍楼内，许棠和分散在各宿舍的幸存者必须通过手机验真、动态广播规则和九十秒撤离，在真人、死亡账号和伪人之间做出判断。",
    },
    series: {
      seriesId: "series_dormitory_rollcall",
      title: TITLE,
      status: "open",
      summary: "分散宿舍求生、手机验真、动态广播规则与伪人模仿交织的多人远程协作怪谈。",
      scriptIds: ["script_dormitory_rollcall"],
    },
    chapters,
    rules,
    hiddenRules,
    chapterBeats,
    rulePlaybook,
    routePlans,
    phonePlaybook,
    visualProduction,
    audioProduction,
    endingPreconditions,
    inversionForeshadowing,
    clues,
    defaultFlags,
    endings,
    nodes,
    profile: {
      coreClueIds: Object.keys(clues),
      relationshipDefs,
      deductionTotal: 0,
      evidenceLinks: [
        { linkId: "dorm_link_phone_identity", title: "死亡账号 + 两个陈露账号", clueIds: ["dorm_clue_dead_account_typing", "dorm_clue_double_chenlu"] },
        { linkId: "dorm_link_mimic_family", title: "母亲视频 + 完整姓名禁令", clueIds: ["dorm_clue_mother_call"] },
        { linkId: "dorm_link_broadcast_truth", title: "真假广播 + 2014周婉宁记录", clueIds: ["dorm_clue_true_false_broadcast", "dorm_clue_2014_wanning"] },
      ],
      endingResolver(state) {
        const flags = state.flags || {};
        const relationships = state.relationships || {};
        const foundClues = state.clues || [];
        const strongTrust = Number(relationships.trust_linsui || 0) >= 30 && Number(relationships.support_chenlu || 0) >= 18;
        const allCoreEvidence = Object.keys(clues).every((id) => foundClues.includes(id));
        if (flags.broke_broadcast) return "dorm_ending_broken_broadcast";
        if (flags.chose_east_route && (flags.leaked_escape_route || !flags.trusted_true_broadcast)) return "dorm_ending_east_passage";
        if (flags.identity_stolen || flags.said_full_name) return "dorm_ending_second_xutang";
        if (flags.abandoned_real_survivor && !flags.sacrificed_unknown) return "dorm_ending_left_behind";
        if (flags.sacrificed_unknown && !flags.saved_other_survivor && !flags.abandoned_real_survivor) return "dorm_ending_legal_count";
        if (flags.sacrificed_unknown && flags.abandoned_real_survivor && flags.escaped_with_linsui && Number(relationships.trust_linsui || 0) >= 25) return "dorm_ending_linsui_door";
        if (flags.sacrificed_unknown && flags.abandoned_real_survivor && Number(relationships.trust_linsui || 0) < 25) return "dorm_ending_legal_count";
        if (flags.abandoned_real_survivor || flags.kicked_real_account) return "dorm_ending_left_behind";
        if (flags.sacrificed_unknown && !flags.saved_other_survivor) return "dorm_ending_legal_count";
        if (flags.third_online || flags.allowed_mimic_group || (flags.leaked_dynamic_code && flags.saved_other_survivor && flags.final_no_response)) return "dorm_ending_three_online";
        if (flags.final_no_response && flags.escaped_with_linsui && flags.trusted_true_broadcast && flags.trusted_wu && flags.saved_other_survivor && strongTrust && allCoreEvidence) return "dorm_ending_true_dawn";
        if (flags.escaped_with_linsui && (flags.comforted_linsui || strongTrust)) return "dorm_ending_linsui_door";
        return "dorm_ending_three_online";
      },
    },
    qa: {
      effectiveChoiceCount: Object.values(nodes).reduce((sum, node) => sum + (node.choices?.length || node.question?.choices?.length || 0), 0),
      choiceNodeCount: Object.values(nodes).filter((node) => (node.choices?.length || node.question?.choices?.length || 0) > 0).length,
      endingIds: Object.keys(endings),
      routeNames: Object.keys(routePlans),
      visibleEnglishNamesExpected: 0,
      fragmentAudit: { suspected: 0, merged: 0, retainedShortDialogue: 0, remaining: 0 },
    },
  };
})();
