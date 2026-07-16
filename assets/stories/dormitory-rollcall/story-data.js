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
    verification_discredited: false,
    private_data_leaked: false,
    recovered_2014_record: false,
    west_route: false,
    corrected_rollcall: false,
  };

  function finalPhone(endingId, title, notice, members, options = {}) {
    return {
      kind: options.kind || "system",
      time: options.time || "01:16",
      battery: options.battery ?? 9,
      signal: options.signal || "1",
      title,
      members,
      messages: options.message ? [{ id: `${endingId}_message`, sender: options.sender || "系统通知", text: options.message }] : [],
      typing: options.typing || "",
      call: options.call || null,
      video: options.video || null,
      systemNotice: notice,
    };
  }

  const endings = {
    dorm_ending_true_dawn: {
      endingId: "dorm_ending_true_dawn",
      title: "真正的天亮",
      emotion: "希望、温情、释然",
      scene: "dorm_outside_dawn",
      imageKey: "dorm_ending_true_dawn",
      text: "天亮后，许棠、林穗和被确认的幸存者站在宿舍楼外。互助群第一次显示：在线人数与现场人数一致。她们没有立刻拥抱，只是一个一个确认名字，像重新学会相信活着的人。",
      finalLine: "这一次，回应她们的不是广播，是彼此的声音。",
      phoneFinalState: finalPhone("dorm_ending_true_dawn", "四楼夜间互助群", "现场六人，在线六人，名单已纠正。", ["许棠", "林穗", "赵晴", "陈露", "沈妍", "获救同学"], { battery: 11, signal: "4", message: "人数核对完成。", sender: "赵晴" }),
      foreshadowingIds: ["f_dead_account_online", "f_deleted_wanning", "f_offline_secret", "f_final_rollcall"],
      characterResults: ["许棠保住姓名", "林穗与许棠互相验真", "周婉宁重新进入名单", "获救者通过闸机"],
      report: { type: "完整逃生", pathSummary: "你保存规则、识别真广播、没有泄露最终口令，并在最后点名时阻止了所有人回应。" },
    },
    dorm_ending_linsui_door: {
      endingId: "dorm_ending_linsui_door",
      title: "她替我关上门",
      emotion: "温情、牺牲、悲伤",
      scene: "dorm_stairwell",
      imageKey: "dorm_ending_linsui_door",
      text: "防火门最后一次回弹时，林穗把许棠推出门外。她没有解释自己是不是还值得相信，只把门从里面合上。逃出后，许棠收到她未发出的文字：如果你看见两个我，记得选那个会怕的人。",
      finalLine: "最被怀疑的人，留下了最像人的选择。",
      phoneFinalState: finalPhone("dorm_ending_linsui_door", "林穗的未发送草稿", "草稿停在01:14，发送者已离线。", ["许棠", "林穗"], { kind: "private", battery: 7, signal: "1", message: "如果你看见两个我，记得选那个会怕的人。", sender: "林穗" }),
      foreshadowingIds: ["f_family_mimic", "f_offline_secret", "f_fire_door", "f_final_rollcall"],
      characterResults: ["许棠通过闸机", "林穗留在防火门内", "赵晴带队离开西侧楼梯"],
      report: { type: "牺牲逃生", pathSummary: "你保护过林穗，也怀疑过她；最终她用自己的选择证明了身份。" },
    },
    dorm_ending_left_behind: {
      endingId: "dorm_ending_left_behind",
      title: "被留下的人",
      emotion: "愤怒、悔恨、指责",
      scene: "dorm_stairwell",
      imageKey: "dorm_ending_left_behind",
      text: "你在闸机前把一名真正的幸存者挡回楼里。门锁落下后，迟到的视频才证明她的影子一直正常。其他人不再替你找理由。她的账号重新上线，只发来一句话：你明明说过会等我。",
      finalLine: "错误判断没有杀死所有人，却杀死了信任。",
      phoneFinalState: finalPhone("dorm_ending_left_behind", "身份复核", "门内账号重新上线，现场少一人。", ["许棠", "被留下的同学"], { kind: "private", battery: 8, signal: "2", message: "你明明说过会等我。", sender: "被留下的同学" }),
      foreshadowingIds: ["f_verification_collapse", "f_dead_account_online", "f_rescue_promise"],
      characterResults: ["被留下的同学未通过闸机", "许棠失去队伍信任", "林穗拒绝替错误辩解"],
      report: { type: "误判真人", pathSummary: "你把存疑当成证据，把真人留在了门内。" },
    },
    dorm_ending_legal_count: {
      endingId: "dorm_ending_legal_count",
      title: "合法人数",
      emotion: "愤怒、制度讽刺、寒意",
      scene: "dorm_ending_archive",
      imageKey: "dorm_ending_legal_count",
      text: "广播宣布当前人数符合登记要求。你们以为它终于放行。可天亮后，名单上的四个人整齐通过系统，其中一个人的影子慢了半拍；真正的人因为没有登记，被系统判定为不存在。",
      finalLine: "制度只确认数字正确，不确认出去的还是不是人。",
      phoneFinalState: finalPhone("dorm_ending_legal_count", "宿舍人数登记", "登记四人，通过四人，身份复核关闭。", ["许棠", "林穗", "赵晴", "登记成员"], { battery: 10, signal: "3", message: "当前人数合法。", sender: "宿舍系统" }),
      foreshadowingIds: ["f_legal_count", "f_deleted_wanning", "f_dead_account_online"],
      characterResults: ["未登记真人被系统删除", "一名伪人占用合法名额", "周婉宁仍未被承认"],
      report: { type: "机械服从", pathSummary: "你为了让人数合法，牺牲了一个未登记的真人。" },
    },
    dorm_ending_second_xutang: {
      endingId: "dorm_ending_second_xutang",
      title: "第二个许棠",
      emotion: "身份恐惧、强反转",
      scene: "dorm_outside_dawn",
      imageKey: "dorm_ending_second_xutang",
      text: "许棠跑出宿舍楼，却无法通过校门的人脸识别。老师、同学和系统都叫不出她的名字。正门那边，另一个许棠走出来，林穗迟疑一秒后迎向了她。手机亮起：你已被移出群聊。",
      finalLine: "她活着出来了，只是名字先一步离开了她。",
      phoneFinalState: finalPhone("dorm_ending_second_xutang", "四楼夜间互助群", "你已被移出群聊。", ["林穗", "赵晴", "陈露", "另一个许棠"], { battery: 6, signal: "4", message: "许棠已通过身份闸机。", sender: "宿舍系统" }),
      foreshadowingIds: ["f_name_echo", "f_private_archive", "f_family_mimic", "f_final_rollcall"],
      characterResults: ["真实许棠失去姓名", "替代者通过身份闸机", "林穗无法仅凭记忆确认许棠"],
      report: { type: "身份被窃", pathSummary: "你多次说出完整姓名或接触亲近影像，使伪人完成了替代。" },
    },
    dorm_ending_three_online: {
      endingId: "dorm_ending_three_online",
      title: "三人在线",
      emotion: "开放式恐惧、不安",
      scene: "dorm_outside_dawn",
      imageKey: "dorm_ending_three_online",
      text: "许棠和林穗确认现场只有两个人。手机却显示三人在线，第三个账号沿着她们的位置同步移动，始终不说话。她们走到校门口时，互助群忽然跳出：陈露正在输入……",
      finalLine: "没有人知道第三个在线的人，是逃出来了，还是一直没出来。",
      phoneFinalState: finalPhone("dorm_ending_three_online", "四楼夜间互助群", "现场两人，在线三人。", ["许棠", "林穗", "未命名账号"], { kind: "group", battery: 5, signal: "3", typing: "陈露正在输入……" }),
      foreshadowingIds: ["f_dead_account_online", "f_dynamic_code", "f_double_chenlu", "f_third_online"],
      characterResults: ["许棠与林穗离开宿舍楼", "第三账号身份未明", "陈露的在线状态无法核实"],
      report: { type: "开放不安", pathSummary: "你救出了核心同伴，但没有彻底核清所有账号。" },
    },
    dorm_ending_east_passage: {
      endingId: "dorm_ending_east_passage",
      title: "东侧安全通道",
      emotion: "绝望、欺骗、群体覆灭",
      scene: "dorm_stairwell",
      imageKey: "dorm_ending_east_passage",
      text: "你相信了东侧通道的广播。防火门关闭后，所有手机同时失去信号。片刻后，互助群中所有账号一起发送：我们已经安全离开。第二天，没有任何学生真正走出宿舍楼。",
      finalLine: "最整齐的报平安，来自已经不会呼吸的人。",
      phoneFinalState: finalPhone("dorm_ending_east_passage", "四楼夜间互助群", "消息已排队，设备无服务。", ["许棠", "林穗", "赵晴", "陈露", "沈妍"], { kind: "group", battery: 12, signal: "无", message: "我们已经安全离开。", sender: "全体成员" }),
      foreshadowingIds: ["f_false_east_route", "f_fixed_chime", "f_dead_account_online"],
      characterResults: ["逃生队伍被困东侧通道", "所有账号继续代替本人报平安", "吴阿姨未等到任何人"],
      report: { type: "伪广播误导", pathSummary: "你忽略了伪广播的用词、时间和完整姓名线索，带队进入了埋伏。" },
    },
    dorm_ending_broken_broadcast: {
      endingId: "dorm_ending_broken_broadcast",
      title: "砸碎广播",
      emotion: "愤怒、失控、灾难性反转",
      scene: "dorm_broadcast_room",
      imageKey: "dorm_ending_broken_broadcast",
      text: "你砸碎了广播控制室。门锁全部打开，点名停止，伪广播也消失了。所有人都以为终于自由。天亮后学校照常上课，只是走进教室的人，已经没人能确认是否还是本人。",
      finalLine: "你毁掉了规则，也毁掉了最后一道笼门。",
      phoneFinalState: finalPhone("dorm_ending_broken_broadcast", "宿舍控制服务", "广播、门锁与身份复核均不可用。", ["系统通知"], { battery: 4, signal: "无", message: "无法连接宿舍服务。", sender: "系统通知" }),
      foreshadowingIds: ["f_broadcast_lock", "f_deleted_wanning", "f_final_rollcall"],
      characterResults: ["宿舍门锁全部失效", "幸存者与伪人同时离楼", "周婉宁的纠正记录永久中断"],
      report: { type: "系统失效", pathSummary: "你的愤怒有理由，但未经验证的破坏让伪人离开了宿舍楼。" },
    },
  };

  function phone(nodeId, kind, time, battery, signal, title, options = {}) {
    return {
      kind,
      time,
      battery,
      signal,
      title,
      members: options.members || [],
      messages: (options.messages || []).map((message, index) => ({
        id: `${nodeId}_message_${index + 1}`,
        ...message,
      })),
      typing: options.typing || "",
      call: options.call || null,
      video: options.video || null,
      systemNotice: options.systemNotice || "",
    };
  }

  const phoneTimeline = {
    dorm_01_001: phone("dorm_01_001", "system", "00:17", 83, "4", "紧急通知", { members: ["许棠", "林穗"], systemNotice: "宿舍楼临时管控，等待广播。" }),
    dorm_01_002: phone("dorm_01_002", "system", "00:17", 82, "4", "规则记录", { members: ["许棠", "林穗"], systemNotice: "第一条：三十秒内回到床铺。" }),
    dorm_01_007: phone("dorm_01_007", "group", "00:19", 80, "4", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "失联学生"], messages: [{ sender: "赵晴", text: "走廊里的人已经不动了。" }, { sender: "失联学生", text: "我没死。" }], typing: "失联学生正在输入……", systemNotice: "在线人数十一人。" }),
    dorm_01_008: phone("dorm_01_008", "group", "00:20", 79, "4", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "失联学生"], messages: [{ sender: "赵晴", text: "各宿舍只报平安，不报人数。" }], systemNotice: "有人询问417人数。" }),
    dorm_01_009: phone("dorm_01_009", "private", "00:21", 78, "4", "失联学生", { members: ["许棠", "失联学生"], messages: [{ sender: "失联学生", text: "刚才只是摔了一跤。" }], systemNotice: "该账号的身体状态无法确认。" }),
    dorm_01_010: phone("dorm_01_010", "system", "00:22", 77, "4", "点名提示", { members: ["许棠"], systemNotice: "扬声器正在呼叫完整姓名。" }),

    dorm_02_001: phone("dorm_02_001", "video", "00:27", 74, "4", "415视频", { members: ["赵晴", "陈露"], video: { caption: "画面内有赵晴和陈露，门外同时出现陈露的声音。" }, systemNotice: "视频位置：415室内。" }),
    dorm_02_003: phone("dorm_02_003", "private", "00:28", 73, "4", "415私聊", { members: ["许棠", "赵晴", "陈露"], messages: [{ sender: "赵晴", text: "门外的人答对了昨晚的钥匙位置。" }], systemNotice: "旧记忆验证失效。" }),
    dorm_02_006: phone("dorm_02_006", "group", "00:30", 71, "3", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "失联学生"], messages: [{ sender: "失联学生", text: "是你们的验证把她留在门外。" }], typing: "多个账号正在输入……", systemNotice: "419一名真人失联。" }),
    dorm_02_008: phone("dorm_02_008", "group", "00:32", 69, "3", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], messages: [{ sender: "赵晴", text: "改用只在当晚生成的动态口令。" }], systemNotice: "验证体系正在重建。" }),
    dorm_02_009: phone("dorm_02_009", "private", "00:33", 68, "3", "动态口令分发", { members: ["许棠", "赵晴", "陈露"], messages: [{ sender: "赵晴", text: "每次验证后立刻作废。" }], systemNotice: "公开群聊中仍有死亡账号。" }),
    dorm_02_010: phone("dorm_02_010", "group", "00:34", 67, "3", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "另一个陈露"], messages: [{ sender: "陈露", text: "别信另一个账号。" }, { sender: "另一个陈露", text: "别信另一个账号。" }], systemNotice: "同名账号同时在线。" }),

    dorm_03_001: phone("dorm_03_001", "group", "00:37", 65, "3", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "另一个陈露", "沈妍"], messages: [{ sender: "陈露", text: "我在415。" }, { sender: "另一个陈露", text: "我在415。" }], systemNotice: "两个陈露账号等待验证。" }),
    dorm_03_003: phone("dorm_03_003", "video", "00:39", 63, "3", "陈露的视频", { members: ["陈露"], video: { caption: "嘴唇慢半秒，417门牌方向相反。" }, systemNotice: "视频帧存在镜像矛盾。" }),
    dorm_03_004: phone("dorm_03_004", "group", "00:40", 62, "3", "身份标记", { members: ["陈露", "另一个陈露"], systemNotice: "请选择需要标记的账号。" }),
    dorm_03_006: phone("dorm_03_006", "private", "00:42", 60, "3", "沈妍", { members: ["许棠", "沈妍"], messages: [{ sender: "沈妍", text: "不要让它学会你们怎么说话。" }], systemNotice: "发送习惯与沈妍平时不同。" }),
    dorm_03_008: phone("dorm_03_008", "system", "00:44", 58, "3", "第五条规则", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], systemNotice: "死亡或失联账号重新上线后不得立即信任。" }),
    dorm_03_009: phone("dorm_03_009", "system", "00:45", 57, "3", "隐私访问记录", { members: ["许棠", "林穗"], systemNotice: "家庭相册与旧语音刚被陌生设备读取。" }),
    dorm_03_010: phone("dorm_03_010", "call", "00:46", 56, "2", "连续来电", { members: ["许棠母亲", "林穗姐姐"], call: { name: "许棠母亲", status: "视频来电" }, systemNotice: "林穗的手机同时收到姐姐语音。" }),

    dorm_04_001: phone("dorm_04_001", "call", "00:48", 54, "2", "母亲视频来电", { members: ["许棠", "许棠母亲"], call: { name: "许棠母亲", status: "预览位置显示417门外" }, systemNotice: "真正的母亲应在外地。" }),
    dorm_04_002: phone("dorm_04_002", "call", "00:49", 53, "2", "母亲视频来电", { members: ["许棠", "许棠母亲"], call: { name: "许棠母亲", status: "持续来电" }, systemNotice: "接通会暴露实时面部与反应。" }),
    dorm_04_005: phone("dorm_04_005", "private", "00:51", 51, "2", "林穗姐姐", { members: ["林穗", "林穗姐姐"], messages: [{ sender: "林穗姐姐", text: "我在楼梯口，来接你。" }], systemNotice: "该联系人已于两年前停用。" }),
    dorm_04_007: phone("dorm_04_007", "private", "00:54", 49, "2", "吴阿姨", { members: ["许棠", "吴阿姨"], messages: [{ sender: "吴阿姨", text: "2014年也有人听见亲人叫门。" }], systemNotice: "旧案姓名：周婉宁。" }),
    dorm_04_008: phone("dorm_04_008", "private", "00:55", 48, "2", "吴阿姨", { members: ["许棠", "吴阿姨"], messages: [{ sender: "吴阿姨", text: "路线不能发进公开群。" }], systemNotice: "等待是否接收旧记录。" }),
    dorm_04_010: phone("dorm_04_010", "system", "00:57", 46, "2", "证据归档", { members: ["许棠", "周婉宁", "吴阿姨"], systemNotice: "亲人模仿记录与2014旧录音已保存。" }),

    dorm_05_001: phone("dorm_05_001", "system", "00:58", 45, "2", "广播比对", { members: ["许棠", "吴阿姨"], systemNotice: "走廊扬声器与群语音出现两种提示音。" }),
    dorm_05_003: phone("dorm_05_003", "group", "00:59", 44, "2", "四楼夜间互助群", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], messages: [{ sender: "宿舍广播", text: "东侧安全通道已经开放。" }], systemNotice: "消息来源：群语音转发。" }),
    dorm_05_004: phone("dorm_05_004", "system", "01:00", 43, "2", "广播证据", { members: ["许棠", "吴阿姨", "周婉宁"], systemNotice: "固定提示音、完整姓名与路线用词互相矛盾。" }),
    dorm_05_006: phone("dorm_05_006", "private", "01:04", 40, "2", "2014值班记录", { members: ["许棠", "吴阿姨", "周婉宁"], messages: [{ sender: "吴阿姨", text: "周婉宁发现了伪广播，却被删出名单。" }], systemNotice: "01:13后门锁将短暂解除。" }),
    dorm_05_009: phone("dorm_05_009", "system", "01:10", 36, "2", "逃生队伍确认", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "待核同学"], systemNotice: "现场人数随前序选择变化。" }),
    dorm_05_010: phone("dorm_05_010", "system", "01:12", 34, "2", "撤离倒计时", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], systemNotice: "01:13起，门锁解除九十秒。" }),

    dorm_06_001: phone("dorm_06_001", "system", "01:13", 33, "1", "九十秒撤离", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], systemNotice: "剩余九十秒。" }),
    dorm_06_003: phone("dorm_06_003", "system", "01:13", 31, "1", "逃生队伍", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "待核同学"], systemNotice: "现场脚步比登记人数多一个。" }),
    dorm_06_007: phone("dorm_06_007", "system", "01:14", 27, "1", "通道指示", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], systemNotice: "东侧立即开启；西侧延迟两秒。" }),
    dorm_06_008: phone("dorm_06_008", "system", "01:14", 25, "1", "身份闸机", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍"], systemNotice: "系统要求登记人数与通过人数一致。" }),
    dorm_06_009: phone("dorm_06_009", "system", "01:14", 23, "1", "最终点名", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁"], systemNotice: "完整姓名正在依次播报。" }),
    dorm_06_011: phone("dorm_06_011", "system", "01:14", 18, "1", "名单纠正", { members: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "周婉宁"], systemNotice: "闸机将在倒计时结束时锁定结果。" }),
  };

  function fx(type, level, durationMs, target = "scene", delayMs = 0) {
    return { type, level, durationMs, target, delayMs, cleanup: "node-exit" };
  }

  const effectCues = {
    dorm_01_001: [fx("lights-out", "light", 520, "background")],
    dorm_01_003: [fx("hallway-shake", "medium", 900, "door")],
    dorm_01_005: [fx("blood-edge", "medium", 1100, "door-gap")],
    dorm_01_007: [fx("phone-vibrate", "light", 420, "phone")],
    dorm_02_001: [fx("noise", "light", 620, "phone")],
    dorm_02_003: [fx("signal-tear", "medium", 780, "phone")],
    dorm_02_005: [fx("drag", "heavy", 1600, "corridor")],
    dorm_02_006: [fx("black-screen", "medium", 850, "phone")],
    dorm_02_010: [fx("phone-vibrate", "light", 460, "phone")],
    dorm_03_001: [fx("phone-vibrate", "light", 450, "phone")],
    dorm_03_003: [fx("signal-tear", "medium", 820, "phone")],
    dorm_03_006: [fx("character-misalign", "medium", 900, "phone")],
    dorm_03_009: [fx("doppelganger-reveal", "heavy", 1500, "phone")],
    dorm_04_001: [fx("phone-vibrate", "light", 600, "phone")],
    dorm_04_003: [fx("door-impact", "medium", 980, "door")],
    dorm_04_005: [fx("doppelganger-reveal", "heavy", 1550, "corridor")],
    dorm_04_007: [fx("signal-tear", "medium", 760, "phone")],
    dorm_05_001: [fx("lighting-change", "light", 680, "speaker")],
    dorm_05_003: [fx("signal-tear", "medium", 820, "phone")],
    dorm_05_006: [fx("black-screen", "heavy", 1450, "archive")],
    dorm_06_001: [fx("lighting-change", "light", 640, "stairwell")],
    dorm_06_002: [fx("stairwell-flicker", "medium", 1200, "background")],
    dorm_06_004: [fx("double-character", "heavy", 1650, "cast")],
    dorm_06_008: [fx("final-freeze", "medium", 980, "gate")],
    dorm_06_011: [fx("chase", "heavy", 1750, "scene")],
  };

  const sceneOverrides = {
    dorm_01_001: "dorm_417_lights_out",
    dorm_01_002: "dorm_417_lights_out",
    dorm_01_003: "dorm_floor4_corridor",
    dorm_01_004: "dorm_417_lights_out",
    dorm_01_005: "dorm_door_blood",
    dorm_01_010: "dorm_floor4_red",
    dorm_02_001: "dorm_415_room",
    dorm_02_002: "dorm_415_room",
    dorm_02_003: "dorm_415_room",
    dorm_02_004: "dorm_415_room",
    dorm_02_005: "dorm_floor4_corridor",
    dorm_02_006: "dorm_419_room",
    dorm_02_007: "dorm_415_room",
    dorm_02_008: "dorm_415_room",
    dorm_02_009: "dorm_415_room",
    dorm_02_010: "dorm_415_room",
    dorm_03_003: "dorm_417_normal",
    dorm_03_005: "dorm_419_room",
    dorm_03_006: "dorm_419_room",
    dorm_03_009: "dorm_floor4_red",
    dorm_04_001: "dorm_417_blackout",
    dorm_04_002: "dorm_417_blackout",
    dorm_04_003: "dorm_corridor_peephole",
    dorm_04_004: "dorm_corridor_peephole",
    dorm_04_005: "dorm_417_blackout",
    dorm_04_006: "dorm_417_blackout",
    dorm_04_007: "dorm_manager_office",
    dorm_04_009: "dorm_fire_memory_2014",
    dorm_05_001: "dorm_manager_office",
    dorm_05_003: "dorm_east_passage",
    dorm_05_005: "dorm_manager_office",
    dorm_05_006: "dorm_manager_office",
    dorm_05_008: "dorm_floor4_corridor",
    dorm_05_010: "dorm_floor4_corridor",
    dorm_06_001: "dorm_west_stairs",
    dorm_06_002: "dorm_stairwell",
    dorm_06_003: "dorm_stairwell",
    dorm_06_004: "dorm_stairwell",
    dorm_06_005: "dorm_stairwell",
    dorm_06_006: "dorm_stairwell",
    dorm_06_007: "dorm_stairwell",
    dorm_06_008: "dorm_exit_gate",
    dorm_06_009: "dorm_exit_gate",
    dorm_06_010: "dorm_broadcast_room",
    dorm_06_011: "dorm_outside_dawn",
    dorm_06_012: "dorm_outside_dawn",
  };

  const transitionCues = {
    dorm_01_001: { type: "fade", reason: "管控开始，417熄灯。" },
    dorm_01_003: { type: "fade", reason: "视线转向四楼走廊。" },
    dorm_01_004: { type: "fade", reason: "视线回到417床铺。" },
    dorm_01_005: { type: "fade", reason: "门缝血迹成为现场焦点。" },
    dorm_01_010: { type: "fade", reason: "走廊红灯与点名同时启动。" },
    dorm_02_001: { type: "fade", reason: "时间推进到415视频求救。" },
    dorm_02_005: { type: "fade", reason: "错误验证造成走廊伤亡。" },
    dorm_02_006: { type: "fade", reason: "419失联现场进入手机记录。" },
    dorm_02_007: { type: "fade", reason: "视线回到415重建验证。" },
    dorm_03_001: { type: "fade", reason: "两个陈露账号同时出现。" },
    dorm_03_005: { type: "fade", reason: "419的沈妍加入验证。" },
    dorm_03_009: { type: "fade", reason: "威胁从账号转向私人档案。" },
    dorm_04_001: { type: "fade", reason: "亲人模仿在417开始。" },
    dorm_04_003: { type: "fade", reason: "视线移向417猫眼。" },
    dorm_04_005: { type: "fade", reason: "视线回到林穗的来电。" },
    dorm_04_007: { type: "fade", reason: "吴阿姨从值班室接入。" },
    dorm_04_009: { type: "fade", reason: "旧录音带回2014年。" },
    dorm_04_010: { type: "fade", reason: "旧案证据回到当前手机。" },
    dorm_05_001: { type: "fade", reason: "时间推进到两段广播冲突。" },
    dorm_05_003: { type: "fade", reason: "伪广播展示东侧通道。" },
    dorm_05_005: { type: "fade", reason: "吴阿姨开始比对值班记录。" },
    dorm_05_008: { type: "fade", reason: "逃生队伍在四楼合流。" },
    dorm_06_001: { type: "fade", reason: "01:13九十秒窗口开启。" },
    dorm_06_008: { type: "fade", reason: "队伍抵达一楼身份闸机。" },
    dorm_06_010: { type: "fade", reason: "广播控制室成为最后选择。" },
    dorm_06_011: { type: "fade", reason: "倒计时结束，视线转向楼外。" },
  };

  function castMember(characterId, variant, position, focusX, focusY, zIndex) {
    return { characterId, variant, position, framing: "halfbody", mobileFraming: "bust", focusX, focusY, zIndex };
  }

  const speakerCharacterIds = {
    "许棠": "xutang",
    "林穗": "linsui",
    "赵晴": "zhaoqing",
    "陈露": "chenlu",
    "沈妍": "shenyan",
    "吴阿姨": "manager_wu",
    "周婉宁": "zhouwanning",
  };

  const castOverrides = {
    dorm_02_001: [castMember("zhaoqing", "alert", "left", 30, 20, 4), castMember("chenlu", "fear", "right", 70, 20, 5)],
    dorm_03_001: [castMember("chenlu", "fear", "left", 30, 20, 4), castMember("chenlu", "mimic", "right", 70, 20, 5)],
    dorm_04_005: [castMember("linsui", "grief", "center", 50, 18, 5)],
    dorm_06_004: [castMember("linsui", "fear", "left", 30, 20, 4), castMember("linsui", "mimic", "right", 70, 20, 5)],
    dorm_06_008: [castMember("xutang", "exhausted", "left", 30, 20, 5), castMember("linsui", "exhausted", "right", 70, 20, 4)],
  };

  const chapterCast = {
    dorm_chapter_01: [castMember("xutang", "fear", "left", 30, 20, 5), castMember("linsui", "fear", "right", 70, 20, 4)],
    dorm_chapter_02: [castMember("zhaoqing", "alert", "left", 30, 20, 5), castMember("chenlu", "fear", "right", 70, 20, 4)],
    dorm_chapter_03: [castMember("xutang", "alert", "left", 30, 20, 5), castMember("shenyan", "suspicious", "right", 70, 20, 4)],
    dorm_chapter_04: [castMember("xutang", "fear", "left", 30, 20, 5), castMember("linsui", "grief", "right", 70, 20, 4)],
    dorm_chapter_05: [castMember("manager_wu", "serious", "left", 30, 20, 5), castMember("zhaoqing", "alert", "right", 70, 20, 4)],
    dorm_chapter_06: [castMember("xutang", "exhausted", "left", 30, 20, 5), castMember("linsui", "exhausted", "right", 70, 20, 4)],
  };

  function directedCastFor(nodeId, data) {
    if (castOverrides[nodeId]) return castOverrides[nodeId];
    const characterId = speakerCharacterIds[data.visualCharacter] || speakerCharacterIds[data.speaker];
    if (characterId) {
      const variant = data.characterVariant || (characterId === "zhouwanning" ? "memory" : "base");
      return [castMember(characterId, variant, "center", 50, 18, 5)];
    }
    return chapterCast[data.chapterId] || [];
  }

  const foreshadowingByNode = {
    dorm_01_005: ["f_dead_account_online"],
    dorm_01_007: ["f_dead_account_online", "f_third_online"],
    dorm_01_010: ["f_name_echo", "f_final_rollcall"],
    dorm_01_011: ["f_name_echo"],
    dorm_02_003: ["f_old_memory_compromised"],
    dorm_02_005: ["f_verification_collapse", "f_rescue_promise"],
    dorm_02_008: ["f_dynamic_code"],
    dorm_02_010: ["f_double_chenlu", "f_third_online"],
    dorm_03_003: ["f_double_chenlu", "f_mirror_direction"],
    dorm_03_006: ["f_third_online"],
    dorm_03_009: ["f_private_archive", "f_family_mimic"],
    dorm_04_001: ["f_private_archive", "f_family_mimic"],
    dorm_04_005: ["f_family_mimic", "f_offline_secret"],
    dorm_04_009: ["f_deleted_wanning", "f_fixed_chime"],
    dorm_04_010: ["f_fixed_chime", "f_false_east_route"],
    dorm_05_003: ["f_false_east_route"],
    dorm_05_006: ["f_deleted_wanning", "f_ninety_seconds", "f_broadcast_lock"],
    dorm_05_008: ["f_rescue_promise", "f_legal_count"],
    dorm_05_010: ["f_ninety_seconds", "f_broadcast_lock"],
    dorm_06_004: ["f_offline_secret", "f_fire_door"],
    dorm_06_006: ["f_rescue_promise", "f_fire_door"],
    dorm_06_008: ["f_legal_count", "f_final_rollcall"],
    dorm_06_009: ["f_final_rollcall", "f_name_echo"],
    dorm_06_010: ["f_broadcast_lock", "f_deleted_wanning"],
  };

  const consequenceByNode = {
    dorm_01_005: ["c_first_corridor_death"],
    dorm_01_007: ["c_body_account_split"],
    dorm_02_005: ["c_real_student_misjudged"],
    dorm_02_006: ["c_verification_loses_trust"],
    dorm_02_010: ["c_duplicate_accounts"],
    dorm_03_009: ["c_private_data_exposed"],
    dorm_04_005: ["c_dual_family_mimic"],
    dorm_04_010: ["c_conflicting_broadcasts_begin"],
    dorm_05_006: ["c_2014_case_reconstructed"],
    dorm_05_010: ["c_escape_window_confirmed"],
    dorm_06_011: ["c_gate_judgment_locked"],
  };

  function inferSurvivalUpdates(flags = []) {
    const updates = [];
    if (flags.includes("got_on_bed")) updates.push({ subjectId: "dorm_417_pair", status: "protected-on-beds" });
    if (flags.includes("saved_other_survivor")) updates.push({ subjectId: "other_survivor", status: "rescued" });
    if (flags.includes("sacrificed_unknown")) updates.push({ subjectId: "other_survivor", status: "excluded" });
    if (flags.includes("abandoned_real_survivor")) updates.push({ subjectId: "fallen_survivor", status: "abandoned" });
    if (flags.includes("escaped_with_linsui")) updates.push({ subjectId: "linsui", status: "in-escape-team" });
    if (flags.includes("chose_east_route")) updates.push({ subjectId: "escape_team", status: "east-passage" });
    return updates;
  }

  function inferIdentityUpdates(flags = [], phoneUpdates = []) {
    const updates = phoneUpdates.map((update) => ({ subjectId: update.contact, status: update.status }));
    if (flags.includes("disclosed_417_count")) updates.push({ subjectId: "dorm_417_count", status: "exposed" });
    if (flags.includes("trusted_dead_account")) updates.push({ subjectId: "dead_account", status: "trusted-without-proof" });
    if (flags.includes("leaked_dynamic_code")) updates.push({ subjectId: "dynamic_code", status: "compromised" });
    if (flags.includes("verified_chenlu")) updates.push({ subjectId: "chenlu", status: "cross-verified" });
    if (flags.includes("kicked_real_account")) updates.push({ subjectId: "chenlu", status: "real-account-excluded" });
    if (flags.includes("allowed_mimic_group")) updates.push({ subjectId: "unknown_account", status: "admitted" });
    if (flags.includes("said_full_name")) updates.push({ subjectId: "xutang_name", status: "exposed" });
    if (flags.includes("identity_stolen")) updates.push({ subjectId: "xutang_identity", status: "compromised" });
    if (flags.includes("final_no_response")) updates.push({ subjectId: "escape_team", status: "rollcall-unanswered" });
    return updates;
  }

  function c(id, delta, reason) {
    return { id, delta, reason };
  }

  function choice(choiceId, text, nextNodeId, options = {}) {
    const setFlags = options.setFlags || [];
    const phoneUpdates = options.phoneUpdates || [];
    return {
      choiceId,
      text,
      nextNodeId,
      setFlags,
      gainClues: options.gainClues || [],
      relationshipEffects: options.relationshipEffects || [],
      endingPathTags: options.endingPathTags || [],
      choiceImpactText: options.choiceImpactText || text,
      choiceIntent: options.choiceIntent || "谨慎判断",
      ruleUpdates: options.ruleUpdates || [],
      phoneUpdates,
      survivalEffects: options.survivalEffects || [],
      foreshadowingIds: options.foreshadowingIds || [],
      consequenceIds: options.consequenceIds || setFlags.map((flagId) => `choice:${flagId}`),
      survivalUpdates: options.survivalUpdates || inferSurvivalUpdates(setFlags),
      identityUpdates: options.identityUpdates || inferIdentityUpdates(setFlags, phoneUpdates),
      feedback: options.feedback || "inline",
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
    const transition = data.transition || transitionCues[nodeId];
    const setFlags = data.setFlags || [];
    const phoneUpdates = data.phoneUpdates || [];
    nodes[nodeId] = {
      nodeId,
      chapterId: data.chapterId,
      scene: sceneOverrides[nodeId] || data.scene || "dorm_417_normal",
      type: data.type || "dialogue",
      speaker: data.speaker || (contentType === "system" ? "系统" : "旁白"),
      text: data.text,
      nextNodeId: data.nextNodeId,
      choices: data.choices || [],
      question: data.question,
      bgm: data.bgm,
      ambience: data.ambience,
      gainClues: data.gainClues || [],
      setFlags,
      relationshipEffects: data.relationshipEffects || [],
      ruleUpdates: data.ruleUpdates || [],
      phoneState: data.phoneState,
      phoneScreen: data.phoneScreen || phoneTimeline[nodeId],
      phoneUpdates,
      identityChecks: data.identityChecks || [],
      survivalState: data.survivalState,
      effects: data.effects || effectCues[nodeId] || [],
      visualCharacter: data.visualCharacter,
      visualCast: data.visualCast || directedCastFor(nodeId, data),
      characterVariant: data.characterVariant,
      characterPosition: data.characterPosition,
      characterFraming: data.characterFraming,
      characterHeadSafe: true,
      visualFocus: data.visualFocus,
      sceneHold: transition ? false : data.sceneHold !== false,
      transition,
      transitionStyle: transition?.type || data.transitionStyle || "hold",
      feedback: data.feedback || (data.type === "choice" ? "inline" : data.chapterRecap ? "chapter-card" : "none"),
      foreshadowingIds: data.foreshadowingIds || foreshadowingByNode[nodeId] || [],
      consequenceIds: data.consequenceIds || consequenceByNode[nodeId] || setFlags.map((flagId) => `state:${flagId}`),
      survivalUpdates: data.survivalUpdates || inferSurvivalUpdates(setFlags),
      identityUpdates: data.identityUpdates || inferIdentityUpdates(setFlags, phoneUpdates),
      objectiveId: data.objectiveId,
      objectiveText: data.objectiveText,
      objectiveComplete: data.objectiveComplete === true,
      investigationHotspots: data.investigationHotspots || [],
      chapterRecap: data.chapterRecap,
      resolveEnding: data.resolveEnding === true,
      audioPolicy: data.audioPolicy || { bgmMode: "keep", ambienceMode: "keep" },
      sfxOnEnter: data.sfxOnEnter || [],
      contentType,
      voiceEnabled: audibleTypes.has(contentType),
      spokenText: audibleTypes.has(contentType) ? (data.spokenText || data.text) : undefined,
      voiceStatus: audibleTypes.has(contentType) ? "pending-regeneration" : "silent",
      voicePending: audibleTypes.has(contentType),
      voiceDirection: data.voiceDirection,
    };
    if (data.nextNodeId === null) delete nodes[nodeId].nextNodeId;
  }

  add("dorm_01_001", { chapterId: "dorm_chapter_01", text: "00:17，417的灯同时熄灭。只剩许棠和林穗坐在上铺边，手机屏幕把两个人的脸照得发白。", nextNodeId: "dorm_01_002", objectiveId: "get-on-bed", objectiveText: "弄清第一轮广播规则并确保417有人活下来。", visualFocus: "phone", sceneHold: false, transitionStyle: "fade", effect: "lights-out", effectIntensity: "light" });
  add("dorm_01_002", { chapterId: "dorm_chapter_01", speaker: "宿舍广播", contentType: "broadcast", text: "请所有宿舍人员在三十秒内回到床铺，双脚不得接触地面。未按时归位者将不再被认定为宿舍人员。", spokenText: "请所有宿舍人员在三十秒内回到床铺，双脚不得接触地面。未按时归位者将不再被认定为宿舍人员。", voiceEnabled: true, nextNodeId: "dorm_01_003", setFlags: ["saved_broadcast_rules"], gainClues: ["dorm_clue_first_cleaning"], ruleUpdates: [{ ruleId: "dorm_rule_bed", status: "basic-credible" }, { ruleId: "dorm_rule_door", status: "unverified" }, { ruleId: "dorm_rule_name", status: "unverified" }, { ruleId: "dorm_rule_media", status: "unverified" }], visualFocus: "speaker", sfxOnEnter: [{ key: "dorm_broadcast_start", volume: 0.16, duckBgmMs: 260 }] });
  add("dorm_01_003", { chapterId: "dorm_chapter_01", text: "走廊尽头传来赤脚奔跑声。有人撞门，喊着让里面的人开一下。", nextNodeId: "dorm_01_004", scene: "dorm_floor4_corridor", visualFocus: "door-gap", effect: "hallway-shake", effectIntensity: "medium" });
  add("dorm_01_004", { chapterId: "dorm_chapter_01", type: "choice", text: "三十秒快到了。你要怎么处理417的第一反应？", choices: [
    choice("bed_quiet", "拉林穗一起上床，先不要回门外。", "dorm_01_005", { setFlags: ["got_on_bed"], relationshipEffects: [c("trust_linsui", 8, "你优先保证两个人活下来。")], ruleUpdates: [{ ruleId: "dorm_rule_bed", status: "verified" }], choiceIntent: "保命优先", choiceImpactText: "417没有发出声音。门外的撞击在最后三秒停止。" }),
    choice("open_voice", "隔门问她是哪间宿舍的人。", "dorm_01_005", { relationshipEffects: [c("trust_linsui", -5, "林穗听见你把声音给了走廊。")], choiceIntent: "冒险确认", choiceImpactText: "走廊里的声音立刻换成了你的语气，重复了一遍问题。" }),
  ] });
  add("dorm_01_005", { chapterId: "dorm_chapter_01", text: "拖拽声从门口经过。门缝里渗进一道短短的血线，一只带血拖鞋停在417门外。", nextNodeId: "dorm_01_006", scene: "dorm_floor4_corridor", visualFocus: "bloody-slipper", effect: "blood-edge", effectIntensity: "medium", gainClues: ["dorm_clue_first_cleaning"], ruleUpdates: [{ ruleId: "dorm_rule_bed", status: "verified" }] });
  add("dorm_01_006", { chapterId: "dorm_chapter_01", speaker: "宿舍广播", contentType: "broadcast", text: "一名违规人员已完成清理，当前楼层秩序正常。", spokenText: "一名违规人员已完成清理，当前楼层秩序正常。", voiceEnabled: true, nextNodeId: "dorm_01_007", visualFocus: "speaker" });
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
  add("dorm_02_002", { chapterId: "dorm_chapter_02", speaker: "陈露", text: "我就在房里。门外那个如果是我，让她说昨晚我把钥匙放哪了。", spokenText: "我就在房里。门外那个如果是我，让她说昨晚我把钥匙放哪了。", voiceEnabled: true, nextNodeId: "dorm_02_003", visualCharacter: "陈露" });
  add("dorm_02_003", { chapterId: "dorm_chapter_02", text: "门外的人准确说出昨晚钥匙藏在泡面箱里。这个答案只证明旧记忆已经外泄，不能证明她是陈露。", nextNodeId: "dorm_02_004", visualFocus: "peephole" });
  add("dorm_02_004", { chapterId: "dorm_chapter_02", type: "choice", text: "旧记忆已经不可靠。你提议哪种验证？", choices: [
    choice("new_secret", "让房内陈露现场指定一个动作，门外不得听见。", "dorm_02_005", { relationshipEffects: [c("support_chenlu", 8, "陈露开始相信你不是只靠猜。"), c("trust_zhaoqing", 4, "赵晴接受了新的验证流程。")], choiceIntent: "临时秘密", choiceImpactText: "你把验证放在事件之后，伪人不能只靠旧聊天记录通过。" }),
    choice("old_memory", "继续追问只有陈露知道的旧事。", "dorm_02_005", { setFlags: ["verification_discredited"], relationshipEffects: [c("support_chenlu", -6, "陈露意识到旧事可能已经被读过。")], choiceIntent: "旧记忆验证", choiceImpactText: "门外的人答得越来越顺，旧记忆彻底失去验真价值。" }),
  ] });
  add("dorm_02_005", { chapterId: "dorm_chapter_02", text: "419照搬群里的旧事问答，把答错的真实室友关在门外。她刚拍出正常影子，走廊里的东西已经把她拖离镜头。", nextNodeId: "dorm_02_006", sfxOnEnter: [{ key: "dorm_knock_wood", volume: 0.26 }], survivalUpdates: [{ subjectId: "dorm_419_real_student", status: "dragged-after-misjudgment" }] });
  add("dorm_02_006", { chapterId: "dorm_chapter_02", text: "失联者的账号立刻把责任推给验证流程。四楼群里再也没人愿意只凭一次问答替别人开门。", nextNodeId: "dorm_02_007", setFlags: ["verification_discredited"], gainClues: ["dorm_clue_dead_account_typing"], phoneUpdates: [{ contact: "419失联同学", status: "已经失联" }], visualFocus: "phone" });
  add("dorm_02_007", { chapterId: "dorm_chapter_02", speaker: "赵晴", text: "以后所有验证，先问今晚才发生的事。旧事不能算。", spokenText: "以后所有验证，先问今晚才发生的事。旧事不能算。", voiceEnabled: true, nextNodeId: "dorm_02_008", visualCharacter: "赵晴" });
  add("dorm_02_008", { chapterId: "dorm_chapter_02", type: "choice", text: "赵晴要求共享一个动态口令，方便四楼互相确认。", choices: [
    choice("share_code_private", "只发给已确认真人的私聊，不发群里。", "dorm_02_009", { relationshipEffects: [c("trust_zhaoqing", 6, "赵晴认同你限制口令传播。")], choiceIntent: "限制传播", choiceImpactText: "口令没有出现在公开群聊里。", foreshadowingIds: ["f_dynamic_code"] }),
    choice("share_code_group", "发到互助群，先让大家都活过这一轮。", "dorm_02_009", { setFlags: ["leaked_dynamic_code"], relationshipEffects: [c("trust_zhaoqing", -4, "赵晴盯着群里的已读人数，没再说话。")], choiceIntent: "快速协作", choiceImpactText: "群里十一个头像全部显示已读，包括一个确认死亡的账号。", foreshadowingIds: ["f_dynamic_code", "f_third_online"] }),
  ] });
  add("dorm_02_009", { chapterId: "dorm_chapter_02", text: "赵晴把动态口令设成一次一换，并要求每次验证同时核对影子、时间和当晚动作。验证重新有了边界，却没有恢复公信力。", nextNodeId: "dorm_02_010", ruleUpdates: [{ ruleId: "dorm_rule_verify", status: "basic-credible" }] });
  add("dorm_02_010", { chapterId: "dorm_chapter_02", text: "新口令刚完成第一次分发，群里便同时亮起两个陈露账号。它们发出相同的头像、相同的求救，也都声称另一个是假的。", nextNodeId: "dorm_03_001", objectiveComplete: true, chapterRecap: { title: "一次误判让全楼不再相信单一验证。", next: "两个陈露账号会把验证逼回手机画面本身。" } });

  add("dorm_03_001", { chapterId: "dorm_chapter_03", text: "互助群里出现第二个陈露。两个头像、两个昵称、两条几乎一样的求救。", nextNodeId: "dorm_03_002", objectiveId: "mark-accounts", objectiveText: "通过手机界面标记真人、失联者和疑似伪人。", phoneState: { view: "group", title: "四楼夜间互助群", anomaly: "两个陈露账号" }, visualFocus: "phone", gainClues: ["dorm_clue_double_chenlu"] });
  add("dorm_03_002", { chapterId: "dorm_chapter_03", speaker: "陈露", text: "左边那个不是我。她不敢开视频。", spokenText: "左边那个不是我。她不敢开视频。", voiceEnabled: true, nextNodeId: "dorm_03_003", visualCharacter: "陈露" });
  add("dorm_03_003", { chapterId: "dorm_chapter_03", text: "文字账号立刻发来一段视频。画面里的人在笑，嘴唇却慢了半秒。门牌417的方向也反了。", nextNodeId: "dorm_03_004", phoneState: { view: "video", title: "陈露的视频", anomaly: "嘴唇不同步、门牌镜像" }, visualFocus: "phone", gainClues: ["dorm_clue_double_chenlu"], effect: "signal-tear", effectIntensity: "medium" });
  add("dorm_03_004", { chapterId: "dorm_chapter_03", type: "choice", text: "你要如何处理两个陈露账号？", choices: [
    choice("mark_text_mimic", "把只发文字的账号标记为疑似伪人。", "dorm_03_005", { setFlags: ["verified_chenlu"], relationshipEffects: [c("support_chenlu", 10, "真正的陈露开始把视频证据交给你保存。")], phoneUpdates: [{ contact: "陈露-文字账号", status: "疑似伪人" }], choiceIntent: "标记伪人", choiceImpactText: "被标记的账号停止发言，但头像换成了许棠的照片。" }),
    choice("kick_video", "踢掉视频账号，认为视频更容易伪造。", "dorm_03_005", { setFlags: ["kicked_real_account"], relationshipEffects: [c("support_chenlu", -18, "陈露的真实视频被你踢出群聊。")], phoneUpdates: [{ contact: "陈露-视频账号", status: "已被踢出" }], choiceIntent: "错误踢出", choiceImpactText: "415那边的视频断了，赵晴只发来一句：你踢错了。" }),
  ] });
  add("dorm_03_005", { chapterId: "dorm_chapter_03", speaker: "沈妍", text: "别只看账号。看影子。", spokenText: "别只看账号。看影子。", voiceEnabled: true, nextNodeId: "dorm_03_006", visualCharacter: "沈妍" });
  add("dorm_03_006", { chapterId: "dorm_chapter_03", text: "沈妍平时只用短句和句号。今晚的账号连续输入三行又全部撤回，句式习惯与她本人相反。", nextNodeId: "dorm_03_007", phoneState: { view: "private", title: "沈妍", anomaly: "聊天习惯改变" }, visualFocus: "phone" });
  add("dorm_03_007", { chapterId: "dorm_chapter_03", type: "choice", text: "沈妍请求加入最终逃生队伍。", choices: [
    choice("verify_shenyan", "让她拍窗户倒影和床位，暂列身份存疑。", "dorm_03_008", { relationshipEffects: [c("trust_shenyan", 8, "你没有马上相信，也没有马上抛下沈妍。")], phoneUpdates: [{ contact: "沈妍", status: "身份存疑" }], choiceIntent: "多证据验证", choiceImpactText: "她发来的图里，窗户倒影有她，门外没有。" }),
    choice("allow_shenyan", "直接让她进互助群。", "dorm_03_008", { setFlags: ["allowed_mimic_group"], relationshipEffects: [c("trust_shenyan", -4, "沈妍没有反对，但赵晴质疑你的判断。")], choiceIntent: "快速接纳", choiceImpactText: "群里在线人数从十一变成十二，又变回十一。" }),
  ] });
  add("dorm_03_008", { chapterId: "dorm_chapter_03", text: "第五条规则推送到所有手机：死亡或失联账号重新上线后不得立即信任，不同宿舍必须交叉验证。", nextNodeId: "dorm_03_009", ruleUpdates: [{ ruleId: "dorm_rule_verify", status: "verified" }] });
  add("dorm_03_009", { chapterId: "dorm_chapter_03", text: "身份标记完成后，陌生设备读取了许棠的家庭相册和林穗姐姐的纪念动态。伪人已经从公开口令摸到私人关系。", nextNodeId: "dorm_03_010", setFlags: ["private_data_leaked"], identityUpdates: [{ subjectId: "xutang_family_archive", status: "accessed" }, { subjectId: "linsui_family_archive", status: "accessed" }] });
  add("dorm_03_010", { chapterId: "dorm_chapter_03", text: "许棠母亲的视频来电与林穗姐姐的旧语音同时出现。两个手机都把声音定位在417门外。", nextNodeId: "dorm_04_001", objectiveComplete: true, chapterRecap: { title: "账号之争泄露了最私人的称呼和牵挂。", next: "伪人将用亲人的样子同时敲两个人的门。" } });

  add("dorm_04_001", { chapterId: "dorm_chapter_04", text: "许棠的手机响了。屏幕上是母亲的视频来电。接通前，预览画面里的人站在417门外。", nextNodeId: "dorm_04_002", objectiveId: "resist-close-voice", objectiveText: "判断亲近关系是否已经被伪人利用。", phoneState: { view: "call", title: "妈妈", anomaly: "视频位置在417门外" }, visualCharacter: "许棠", visualFocus: "phone", effect: "phone-vibration", effectIntensity: "light", gainClues: ["dorm_clue_mother_call"] });
  add("dorm_04_002", { chapterId: "dorm_chapter_04", type: "choice", text: "母亲来电一直震动。", choices: [
    choice("reject_call", "不接视频，只用另一部手机确认母亲位置。", "dorm_04_003", { relationshipEffects: [c("protect_xutang", 8, "许棠没有把自己的脸交给门外。")], choiceIntent: "拒绝影像", choiceImpactText: "真正的母亲在外地接起电话，声音发抖地问你怎么了。" }),
    choice("answer_call", "接通，确认她是不是真的在门外。", "dorm_04_003", { setFlags: ["identity_stolen"], relationshipEffects: [c("protect_xutang", -8, "门外看见了许棠完整的脸和反应。")], choiceIntent: "直面确认", choiceImpactText: "屏幕里的母亲没有眨眼，却喊出了你的乳名。" }),
  ] });
  add("dorm_04_003", { chapterId: "dorm_chapter_04", text: "门外的人复述许棠童年的私事。第三章出现的相册访问记录，解释了这些记忆从何而来。", nextNodeId: "dorm_04_004", visualFocus: "peephole" });
  add("dorm_04_004", { chapterId: "dorm_chapter_04", type: "choice", text: "你要不要看猫眼？", choices: [
    choice("peephole_check", "看猫眼，但不说话、不贴近门。", "dorm_04_005", { relationshipEffects: [c("protect_xutang", 5, "你确认了门外轮廓，却没有给它新的声音。")], choiceIntent: "低风险观察", choiceImpactText: "猫眼里是母亲的背影，鞋尖却朝着相反方向。" }),
    choice("call_full_name", "隔门喊出母亲完整姓名，要求她回答。", "dorm_04_005", { setFlags: ["said_full_name"], relationshipEffects: [c("protect_xutang", -10, "完整姓名被走廊记录。")], choiceIntent: "错误验真", choiceImpactText: "门外的人停了停，用同样完整的名字喊回了你。" }),
  ], ruleUpdates: [{ ruleId: "dorm_rule_name", status: "verified" }] });
  add("dorm_04_005", { chapterId: "dorm_chapter_04", text: "林穗忽然捂住耳朵。她说，她听见已经去世的姐姐在楼梯口叫她。", nextNodeId: "dorm_04_006", visualCharacter: "林穗", gainClues: ["dorm_clue_mother_call"] });
  add("dorm_04_006", { chapterId: "dorm_chapter_04", type: "choice", text: "林穗快要下床。", choices: [
    choice("comfort_linsui", "握住她，承认你也害怕，但让她先别回应。", "dorm_04_007", { setFlags: ["comforted_linsui"], relationshipEffects: [c("trust_linsui", 14, "你没有否定她的恐惧，只帮她守住规则。")], choiceIntent: "安抚同伴", choiceImpactText: "林穗的手还在抖，但她坐回了床边。" }),
    choice("deny_linsui", "直接告诉她那一定是假的，别添乱。", "dorm_04_007", { setFlags: ["doubted_linsui"], relationshipEffects: [c("trust_linsui", -14, "林穗开始把恐惧藏起来，不再第一时间告诉你。")], choiceIntent: "强硬否认", choiceImpactText: "她点头，却把手机屏幕扣了下去。" }),
  ] });
  add("dorm_04_007", { chapterId: "dorm_chapter_04", text: "吴阿姨从一楼值班室发来2014年的同类记录。记录中的周婉宁也曾在门外听见亲人。", nextNodeId: "dorm_04_008", phoneState: { view: "private", title: "吴阿姨", anomaly: "旧案线索" }, gainClues: ["dorm_clue_2014_wanning"], visualCharacter: "吴阿姨", ruleUpdates: [{ ruleId: "dorm_rule_correction", status: "hidden-correction" }] });
  add("dorm_04_008", { chapterId: "dorm_chapter_04", type: "choice", text: "吴阿姨愿意发旧记录，但要求你不要把路线公开到群里。", choices: [
    choice("trust_wu", "相信吴阿姨，私下保存2014记录。", "dorm_04_009", { setFlags: ["trusted_wu"], relationshipEffects: [c("trust_wu", 12, "吴阿姨发来了旧广播记录和楼层图。")], gainClues: ["dorm_clue_2014_wanning"], choiceIntent: "采信旧案", choiceImpactText: "旧记录里，周婉宁标注过伪广播用词。" }),
    choice("distrust_wu", "让她先把所有资料发到群里公开。", "dorm_04_009", { setFlags: ["leaked_escape_route"], relationshipEffects: [c("trust_wu", -10, "吴阿姨停止发送路线细节。")], choiceIntent: "公开透明", choiceImpactText: "群里立刻出现三个账号催她说出安全通道。" }),
  ] });
  add("dorm_04_009", { chapterId: "dorm_chapter_04", speaker: "周婉宁", contentType: "recording", text: "它不是我妈妈。它只是知道我希望妈妈来接我。", spokenText: "它不是我妈妈。它只是知道我希望妈妈来接我。", voiceEnabled: true, nextNodeId: "dorm_04_010", scene: "dorm_fire_memory_2014", visualCharacter: "周婉宁", voiceDirection: "真实旧录音，疲惫、克制，不做鬼声。" });
  add("dorm_04_010", { chapterId: "dorm_chapter_04", text: "亲人模仿与周婉宁旧录音保存完成时，手机录到两种不同的广播提示音。下一轮指令将彼此冲突。", nextNodeId: "dorm_05_001", gainClues: ["dorm_clue_mother_call", "dorm_clue_2014_wanning"], objectiveComplete: true, chapterRecap: { title: "伪人不只学声音，也会学你最想听见谁。", next: "真正的广播和伪造的广播将同时出现。" } });

  add("dorm_05_001", { chapterId: "dorm_chapter_05", text: "00:58，广播提示音响了两次。第一段来自走廊扬声器，第二段从群语音里传出。", nextNodeId: "dorm_05_002", scene: "dorm_manager_office", objectiveId: "choose-broadcast", objectiveText: "根据前期线索判断哪段广播可信。", visualFocus: "speaker", gainClues: ["dorm_clue_true_false_broadcast"] });
  add("dorm_05_002", { chapterId: "dorm_chapter_05", speaker: "宿舍广播", contentType: "broadcast", text: "所有人员继续留在床铺，不得进入楼梯间。", spokenText: "所有人员继续留在床铺，不得进入楼梯间。", voiceEnabled: true, nextNodeId: "dorm_05_003", ruleUpdates: [{ ruleId: "dorm_rule_escape", status: "unverified" }] });
  add("dorm_05_003", { chapterId: "dorm_chapter_05", speaker: "宿舍广播", contentType: "broadcast", text: "东侧安全通道已经开放，请立即撤离。", spokenText: "东侧安全通道已经开放，请立即撤离。", voiceEnabled: true, nextNodeId: "dorm_05_004", visualFocus: "phone" });
  add("dorm_05_004", { chapterId: "dorm_chapter_05", type: "choice", text: "两段广播互相冲突。你先信哪一段？", choices: [
    choice("trust_hold", "相信固定提示音的留守广播，先核对吴阿姨记录。", "dorm_05_005", { setFlags: ["trusted_true_broadcast"], relationshipEffects: [c("trust_wu", 8, "吴阿姨确认提示音一致。")], choiceIntent: "识别真广播", choiceImpactText: "你注意到东侧广播称呼了具体学生姓名，格式不对。" }),
    choice("trust_east", "相信东侧通道开放，准备撤离。", "dorm_05_005", { setFlags: ["chose_east_route"], relationshipEffects: [c("trust_zhaoqing", 4, "赵晴也希望尽快离开。")], choiceIntent: "急切撤离", choiceImpactText: "东侧通道的账号开始催促各宿舍报人数。" }),
  ], ruleUpdates: [{ ruleId: "dorm_rule_escape", status: "contradiction" }] });
  add("dorm_05_005", { chapterId: "dorm_chapter_05", speaker: "吴阿姨", text: "真广播不会叫完整姓名。它只报规则，不替你选人。", spokenText: "真广播不会叫完整姓名。它只报规则，不替你选人。", voiceEnabled: true, nextNodeId: "dorm_05_006", visualCharacter: "吴阿姨" });
  add("dorm_05_006", { chapterId: "dorm_chapter_05", text: "固定提示音、旧群聊和值班记录拼回2014年：周婉宁识破伪广播后被删出名单；真正的门锁只在01:13解除九十秒。", nextNodeId: "dorm_05_007", setFlags: ["recovered_2014_record", "used_wanning_clue"], gainClues: ["dorm_clue_2014_wanning", "dorm_clue_true_false_broadcast"], visualFocus: "archive" });
  add("dorm_05_007", { chapterId: "dorm_chapter_05", type: "choice", text: "最终逃生队伍需要确认。沈妍和一个身份存疑的学生请求加入。", choices: [
    choice("team_verified", "只带多证据验证过的人，拒绝泄露路线。", "dorm_05_008", { relationshipEffects: [c("trust_shenyan", 6, "沈妍接受继续验证。"), c("trust_linsui", 4, "林穗认可你没有把恐惧变成抛弃。")], choiceIntent: "谨慎组队", choiceImpactText: "队伍人数少，但每个人都有至少两条验证。" }),
    choice("team_all", "把路线发群里，能走的都来。", "dorm_05_008", { setFlags: ["leaked_escape_route"], relationshipEffects: [c("trust_zhaoqing", -8, "赵晴意识到伪人也看见了路线。")], choiceIntent: "公开救援", choiceImpactText: "群里所有账号同时显示已读，包括确认死亡的账号。" }),
  ] });
  add("dorm_05_008", { chapterId: "dorm_chapter_05", type: "choice", text: "身份存疑者在门外敲暖气管，节奏和你们约定的一样。", choices: [
    choice("save_unknown", "不开门，但用跨宿舍视频和影子二次确认后接纳。", "dorm_05_009", { setFlags: ["saved_other_survivor"], relationshipEffects: [c("trust_linsui", 6, "林穗看见你愿意冒险救一个不确定的人。")], choiceIntent: "多证据救援", choiceImpactText: "你救下了另一个宿舍的真人，也保留了风险。" }),
    choice("sacrifice_unknown", "拒绝接纳，要求她离开门口。", "dorm_05_009", { setFlags: ["sacrificed_unknown"], relationshipEffects: [c("trust_linsui", -8, "林穗没有反驳，但她把视线移开了。")], choiceIntent: "牺牲存疑者", choiceImpactText: "门外的人安静下来。几分钟后，她的账号发来谢谢。" }),
  ] });
  add("dorm_05_009", { chapterId: "dorm_chapter_05", text: "手机把逃生队伍分成已验证、待核和被排除三栏。前面的信任与误判，已经变成闸机前的真实人数。", nextNodeId: "dorm_05_010", phoneState: { view: "team", title: "逃生队伍确认", anomaly: "人数随选择变化" }, visualFocus: "phone" });
  add("dorm_05_010", { chapterId: "dorm_chapter_05", text: "01:12，固定提示音从楼道响起，没有叫任何人的名字。西侧楼梯会延迟两秒开门，01:13后的九十秒是唯一窗口。", nextNodeId: "dorm_06_001", setFlags: ["used_wanning_clue"], objectiveComplete: true, chapterRecap: { title: "真广播冷漠，伪广播热心。真正危险的是太想被带走的声音。", next: "九十秒内，所有判断都会变成行动。" } });

  add("dorm_06_001", { chapterId: "dorm_chapter_06", speaker: "宿舍广播", contentType: "broadcast", text: "应急照明将在九十秒后失效，所有宿舍门将在此期间解除锁定。", spokenText: "应急照明将在九十秒后失效，所有宿舍门将在此期间解除锁定。", voiceEnabled: true, nextNodeId: "dorm_06_002", objectiveId: "escape-90", objectiveText: "在九十秒内带队逃出宿舍楼，并阻止最终点名回应。", scene: "dorm_stairwell", transitionStyle: "fade", ruleUpdates: [{ ruleId: "dorm_rule_escape", status: "verified" }] });
  add("dorm_06_002", { chapterId: "dorm_chapter_06", text: "各宿舍同步开门。楼梯灯一亮一灭，每次亮起，走廊里相同的人影都更近一点。", nextNodeId: "dorm_06_003", scene: "dorm_stairwell", effect: "stairwell-flicker", effectIntensity: "medium" });
  add("dorm_06_003", { chapterId: "dorm_chapter_06", text: "赵晴按第五章的名单逐个报手势，不报姓名。队伍只有六个人，楼梯上却响起第七组脚步。", nextNodeId: "dorm_06_004", relationshipEffects: [c("trust_zhaoqing", 4, "赵晴把验证流程变成了撤离动作。")], visualFocus: "timer", identityUpdates: [{ subjectId: "seventh_footstep", status: "unverified" }] });
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
    choice("west_route", "走吴阿姨记录里的西侧路线。", "dorm_06_008", { setFlags: ["west_route"], relationshipEffects: [c("trust_wu", 6, "旧记录和真广播对上了。")], choiceIntent: "按证据撤离", choiceImpactText: "西侧门按记录延迟两秒开启，时间线完全吻合。" }),
    choice("east_route", "走东侧安全通道，那里灯更亮。", "dorm_06_008", { setFlags: ["chose_east_route"], choiceIntent: "误信亮处", choiceImpactText: "东侧门开得太快，门后没有脚步声。" }),
  ] });
  add("dorm_06_008", { chapterId: "dorm_chapter_06", text: "一楼闸机前，广播开始最终点名。它不命令你们跑，只平静地读出一个又一个完整姓名。", nextNodeId: "dorm_06_009", scene: "dorm_broadcast_room", effect: "final-freeze", effectIntensity: "medium", visualFocus: "gate" });
  add("dorm_06_009", { chapterId: "dorm_chapter_06", type: "choice", text: "有人本能地想回应。你怎么做？", choices: [
    choice("stop_response", "按住她，提醒所有人不要回应最终点名。", "dorm_06_010", { setFlags: ["final_no_response"], relationshipEffects: [c("trust_zhaoqing", 6, "赵晴帮你拦住另一边的人。")], choiceIntent: "阻止回应", choiceImpactText: "广播读完名单，没有得到任何人的声音。" }),
    choice("answer_final", "替大家回应：都在。", "dorm_06_010", { setFlags: ["identity_stolen"], choiceIntent: "错误承担", choiceImpactText: "你说完后，闸机识别到两个许棠。" }),
  ] });
  add("dorm_06_010", { chapterId: "dorm_chapter_06", type: "choice", text: "广播控制室的门半开。有人说只要砸掉它，一切就结束。", choices: [
    choice("leave_system", "保留广播，把周婉宁和被删者提交到闸机名单。", "dorm_06_011", { setFlags: ["corrected_rollcall"], choiceIntent: "纠正名单", choiceImpactText: "广播没有停止，但被删除的人重新出现在通过名单里。" }),
    choice("break_system", "砸碎广播，让它再也不能点名。", "dorm_06_011", { setFlags: ["broke_broadcast"], choiceIntent: "破坏管控", choiceImpactText: "所有门锁同时打开。整栋楼发出一声松动的响。" }),
  ] });
  add("dorm_06_011", { chapterId: "dorm_chapter_06", text: "闸机亮起。手机、影子、脚步和呼吸声在最后一秒全部错开。", nextNodeId: "dorm_06_012", scene: "dorm_outside_dawn", transitionStyle: "fade", effect: "signal-tear", effectIntensity: "heavy" });
  add("dorm_06_012", { chapterId: "dorm_chapter_06", type: "ending", text: "天亮前，系统给出这一夜的最后判定。", nextNodeId: null, resolveEnding: true, objectiveComplete: true, chapterRecap: { title: "九十秒结束。真正需要结算的不是路线，而是你相信过谁、抛下过谁。", next: "查看结局回顾，确认关键选择链。" } });

  const chapterBeats = {
    dorm_chapter_01: {
      question: "广播为什么要求所有人立即上床？",
      confirmedFact: "不按时归位会被猎杀，死亡账号仍可能发言。",
      unresolved: "账号重新上线后是否还属于本人？",
      newQuestion: "同一个人能否同时出现在门内和门外？",
      investigationNodeIds: ["dorm_01_005", "dorm_01_007"],
      choiceNodeIds: ["dorm_01_004", "dorm_01_008", "dorm_01_009", "dorm_01_011"],
      hook: "415室内与门外同时出现陈露。",
      causalChain: [
        { cause: "广播宣布三十秒归床规则。", action: "玩家决定是否先让417两人上床。", consequence: "走廊违规者被拖走，床位规则得到验证。" },
        { cause: "门缝出现血迹和拖鞋。", action: "417继续保持门锁并观察群聊。", consequence: "被拖走者的账号重新上线。" },
        { cause: "死亡账号追问417人数。", action: "玩家选择隐藏或公开人数，并决定是否信任账号。", consequence: "伪人获得不同程度的人数与语言信息。" },
        { cause: "广播呼叫许棠完整姓名。", action: "玩家选择沉默或回应。", consequence: "名字暴露风险进入后续身份替代线，415发来双重陈露视频。" },
      ],
    },
    dorm_chapter_02: {
      question: "门外陈露和房内陈露谁是真的？",
      confirmedFact: "旧记忆可以被读取，单次问答不能验真。",
      unresolved: "验证流程失去公信力后，四楼如何重新协作？",
      newQuestion: "动态口令泄露后还能不能用？",
      investigationNodeIds: ["dorm_02_001", "dorm_02_003", "dorm_02_006"],
      choiceNodeIds: ["dorm_02_004", "dorm_02_008"],
      hook: "新口令分发后，群里出现两个陈露账号。",
      causalChain: [
        { cause: "415室内外同时出现陈露。", action: "玩家选择当晚动作或旧记忆进行验证。", consequence: "旧记忆被证实已经外泄。" },
        { cause: "419照搬旧事问答。", action: "419依据单次答案排除一名室友。", consequence: "真实学生被留在门外并遭拖走。" },
        { cause: "失联账号把死亡归咎于验证。", action: "赵晴改用多证据与一次性口令。", consequence: "验证有了边界，却失去全楼公信力。" },
        { cause: "玩家决定口令私发或群发。", action: "口令完成第一次分发。", consequence: "两个陈露账号同时出现，手机成为下一章战场。" },
      ],
    },
    dorm_chapter_03: {
      question: "两个陈露账号中哪个可信？",
      confirmedFact: "视频、镜像、门牌和聊天习惯只能组成交叉证据。",
      unresolved: "手机标记能否阻止伪人读取私人关系？",
      newQuestion: "亲人模仿会如何利用泄露的称呼与影像？",
      investigationNodeIds: ["dorm_03_003", "dorm_03_006", "dorm_03_009"],
      choiceNodeIds: ["dorm_03_004", "dorm_03_007"],
      hook: "许棠母亲与林穗姐姐同时从417门外来电。",
      causalChain: [
        { cause: "两个陈露账号给出相同求救。", action: "玩家比对视频嘴唇、门牌方向与影子。", consequence: "身份判断从单一账号转为多源交叉。" },
        { cause: "沈妍的用词习惯发生矛盾。", action: "玩家选择继续验证或直接接纳。", consequence: "逃生队伍留下可信度或第三账号隐患。" },
        { cause: "第五条规则确认失联账号不得立即信任。", action: "系统完成身份标记。", consequence: "陌生设备趁机读取许棠与林穗的家庭档案。" },
        { cause: "私人称呼和旧语音已经泄露。", action: "伪人发起两路亲人来电。", consequence: "威胁从手机身份转入最亲近的人。" },
      ],
    },
    dorm_chapter_04: {
      question: "最亲近的人是否已经被模仿？",
      confirmedFact: "亲人影像和旧记忆都可被家庭档案重组。",
      unresolved: "周婉宁当年为何被误判并删除？",
      newQuestion: "真广播和伪广播如何区分？",
      investigationNodeIds: ["dorm_04_001", "dorm_04_005", "dorm_04_007", "dorm_04_009"],
      choiceNodeIds: ["dorm_04_002", "dorm_04_004", "dorm_04_006", "dorm_04_008"],
      hook: "亲人模仿记录中出现两种互相冲突的广播提示音。",
      causalChain: [
        { cause: "许棠母亲的视频定位在417门外。", action: "玩家选择拒接或暴露实时面部。", consequence: "许棠的身份防线被保护或进一步泄露。" },
        { cause: "林穗同时听见已故姐姐呼唤。", action: "玩家选择安慰或否定林穗。", consequence: "林穗信任长期改变，影响楼梯验真与牺牲结局。" },
        { cause: "吴阿姨提供2014相似事件。", action: "玩家选择私下保存或公开路线。", consequence: "周婉宁记录得以保留，或路线被伪人读到。" },
        { cause: "旧录音证明亲人声音会利用愿望。", action: "手机归档当前视频与旧案。", consequence: "两种提示音进入第五章的真假广播比对。" },
      ],
    },
    dorm_chapter_05: {
      question: "留守广播和撤离广播谁是真的？",
      confirmedFact: "伪广播热心指定路线，真广播只给固定格式与时间。",
      unresolved: "名单中的待核者是否应该进入逃生队伍？",
      newQuestion: "九十秒内如何让现场人数、账号和登记名单重新一致？",
      investigationNodeIds: ["dorm_05_001", "dorm_05_006", "dorm_05_009"],
      choiceNodeIds: ["dorm_05_004", "dorm_05_007", "dorm_05_008"],
      hook: "01:13到来，西侧楼梯按记录延迟两秒开启。",
      causalChain: [
        { cause: "走廊广播与群语音给出冲突指令。", action: "玩家先信固定提示音或东侧撤离。", consequence: "真假路线倾向被写入最终撤离。" },
        { cause: "吴阿姨提供固定提示音、旧群聊和值班记录。", action: "玩家重建2014事件。", consequence: "确认周婉宁被删除以及01:13九十秒窗口。" },
        { cause: "最终队伍包含沈妍与待核学生。", action: "玩家决定路线保密范围与是否二次确认待核者。", consequence: "幸存者、牺牲者和第三账号状态固定。" },
        { cause: "固定提示音在01:12响起。", action: "队伍按名单准备同步开门。", consequence: "第六章只剩连续逃生和即时判断。" },
      ],
    },
    dorm_chapter_06: {
      question: "九十秒内能否带真人逃出？",
      confirmedFact: "未通过电子设备传播的信息仍可短暂验真。",
      unresolved: "通过闸机的身份是否仍属于现场的人？",
      newQuestion: "广播系统保护的是人，还是登记秩序？",
      investigationNodeIds: ["dorm_06_003", "dorm_06_004", "dorm_06_008"],
      choiceNodeIds: ["dorm_06_005", "dorm_06_006", "dorm_06_007", "dorm_06_009", "dorm_06_010"],
      hook: "闸机根据整夜积累的信任、泄露、幸存者和路线给出八种判定。",
      causalChain: [
        { cause: "01:13门锁解除九十秒。", action: "队伍用手势与现场脚步核对人数。", consequence: "第七组脚步和两个林穗同时出现。" },
        { cause: "电子验证已经不可信。", action: "玩家用线下暗号判断林穗，并决定是否救援倒地者。", consequence: "同伴身份、救援承诺与剩余时间被回收。" },
        { cause: "东侧立即开门，西侧延迟两秒。", action: "玩家根据第五章证据选择路线。", consequence: "队伍抵达真实闸机或进入伪广播通道。" },
        { cause: "闸机执行最终点名与合法人数校验。", action: "玩家选择沉默、纠正名单或砸毁广播。", consequence: "八个结局按身份泄露、人数、信任、路线和系统状态分别成立。" },
      ],
    },
  };

  const productionRework = {
    version: 2,
    lockedScope: {
      chapterCount: 6,
      publicRuleCount: 6,
      hiddenCorrectionCount: 1,
      endingCount: 8,
      principalCharacters: ["许棠", "林穗", "赵晴", "陈露", "沈妍", "吴阿姨", "周婉宁"],
    },
    chapterCausalChains: Object.fromEntries(
      Object.entries(chapterBeats).map(([chapterId, beat]) => [chapterId, beat.causalChain]),
    ),
    mobileBeatPolicy: "每个节点只承载一个动作、信息或即时判断；角色节点只显示口语，对应叙述独立静音。",
    stateContracts: ["foreshadowingIds", "consequenceIds", "survivalUpdates", "identityUpdates"],
    phoneContract: "structured-dom",
    visualCastContract: "directed-layers",
    effectBudget: { lightMinimum: 4, mediumMinimum: 6, heavyMinimum: 5, heavyPerNodeMaximum: 1 },
    voiceRuntime: {
      status: "pending-empty-after-formal-rewrite",
      enabledNodeIds: [],
      staleMappingsRetained: false,
      regenerationRequested: false,
    },
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
    status: "formal-voice-delivered-awaiting-manual-signoff",
    broadcastVoiceStatus: "volcengine-generated-awaiting-listening-signoff",
    runtimeVoiceStatus: "volcengine-model2-active",
    activeRuntimeVoiceMappings: "11 audible story nodes and 14 institutional broadcast cues",
    broadcastVoiceSource: "Volcengine Doubao Voice Synthesis Model 2.0 HTTP unidirectional API using the project-authorised seed-tts-2.0 resource.",
    broadcastVoiceLicense: "Project-authorised synthesis with public and commercial distribution recorded in the broadcast delivery contract; manual listening approval remains pending.",
    broadcastVoiceNote: "第二故事重构后的世界内对白与14段制度广播已从staging完成原子化切换。纯旁白、动作、环境和手机文字继续静音。",
    approvedCuePolicy: "只有明确剧情动作使用拟音；手机文字消息默认静音；旁白继续静音。",
    pendingRegeneration: {
      dialogue: "none",
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
    productionRework,
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
