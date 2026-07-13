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
    { ruleId: "dorm_rule_02", number: 2, text: "每间宿舍的官方人数为四人。不得说出或追问未登记者的名字。", status: "unverified" },
    { ruleId: "dorm_rule_03", number: 3, text: "真正的查寝者会敲三下，停两秒，再敲一下。", status: "unverified" },
    { ruleId: "dorm_rule_04", number: 4, text: "床号被叫到时，当事人保持安静，由另一人回答“已经休息”。", status: "unverified" },
    { ruleId: "dorm_rule_05", number: 5, text: "00:44 红灯亮起时闭眼十秒，不得使用手机照明。", status: "unverified" },
    { ruleId: "dorm_rule_06", number: 6, text: "有人从洗手间回来时，先查看她原来的床位；若床上有人，不得开门。", status: "unverified" },
    { ruleId: "dorm_rule_07", number: 7, text: "镜中出现陌生姓名时，不得擦去，也不得念出。", status: "unverified" },
    { ruleId: "dorm_rule_08", number: 8, text: "01:13 前，未登记者必须独自前往一楼值班室。", status: "unverified" },
  ];

  const clues = {
    dorm_clue_broadcast_recording: { clueId: "dorm_clue_broadcast_recording", title: "00:17 广播录音", category: "广播", description: "宿舍广播念出了八条规则，而其中一条从一开始就自相矛盾。", isKey: true },
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
    named_xutang: false,
    named_zhouwanning: false,
    sent_unregistered_downstairs: false,
    accused_wrong_person: false,
    cut_broadcast: false,
  };

  const endings = {
    dorm_ending_a: { endingId: "dorm_ending_a", title: "A 结局：记录被更正", text: "你在广播室念出了记录抹去的名字。417 没有被缩减成四人。天亮前，周婉宁与许棠被重新写回人数记录。" },
    dorm_ending_b: { endingId: "dorm_ending_b", title: "B 结局：四人宿舍", text: "你把许棠送往值班室。天亮后名册变得整齐，第五张床消失了，只有你记得自己的手为什么一直在发抖。" },
    dorm_ending_c: { endingId: "dorm_ending_c", title: "C 结局：交错的第五人", text: "你交出了错误的室友来让人数看起来正确。扬声器念出另一个名字。系统并不满足，它只是重新开始点名。" },
    dorm_ending_d: { endingId: "dorm_ending_d", title: "D 结局：下一次点名", text: "你切断广播，躲到天亮。第二天 00:17，扬声器再次响起。这一次，最后的声音是许棠。" },
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
      choiceIntent: options.choiceIntent || "Careful investigation",
      ruleUpdates: options.ruleUpdates || [],
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
      audioPolicy: { bgmMode: "keep", ambienceMode: "keep" },
      sfxOnEnter: [],
    };
    if (data.nextNodeId === null) delete nodes[nodeId].nextNodeId;
  }

  add("dorm_01_001", { chapterId: "dorm_chapter_01", text: "00:17。417 的灯同时熄灭。天花板扬声器发出一声干涩的轻响。", objectiveId: "hear-the-rules", objectiveText: "确认广播究竟要宿舍做什么。", visualFocus: "speaker", sceneHold: false, transitionStyle: "fade" });
  add("dorm_01_002", { chapterId: "dorm_chapter_01", speaker: "Broadcast", text: "校园女声平静地念完八条规则。第八条说：01:13 前，未登记者必须独自下楼。", nextNodeId: "dorm_01_003", setFlags: ["heard_broadcast"], gainClues: ["dorm_clue_broadcast_recording"], ruleUpdates: [{ ruleId: "dorm_rule_01", status: "partly-credible" }, { ruleId: "dorm_rule_02", status: "partly-credible" }, { ruleId: "dorm_rule_08", status: "unverified" }] });
  add("dorm_01_003", { chapterId: "dorm_chapter_01", speaker: "Chen Lu", visualCharacter: "Chen Lu", text: "陈露数了一遍屋里的人，在第五个数字上停住。没有人念出那个数字。", nextNodeId: "dorm_01_004", visualFocus: "temporary-bed" });
  add("dorm_01_004", { chapterId: "dorm_chapter_01", text: "门外响起三下敲门声。停顿开始了。最后一下还没落下，木门上先擦过第四道声音。", nextNodeId: "dorm_01_005", visualFocus: "door" });
  add("dorm_01_005", { chapterId: "dorm_chapter_01", type: "choice", text: "敲门节奏不对。你怎么做？", choices: [
    choice("listen", "保持安静，数清间隔。", "dorm_01_006", { setFlags: ["checked_knock_pattern"], choiceImpactText: "你记下矛盾，没有回应门外。", ruleUpdates: [{ ruleId: "dorm_rule_03", status: "verified" }] }),
    choice("answer", "隔着门问外面是谁。", "dorm_01_006", { choiceImpactText: "走廊只用沉默回答。屋里的人听见你给了它一个声音。", ruleUpdates: [{ ruleId: "dorm_rule_03", status: "partly-credible" }] }),
  ] });
  add("dorm_01_006", { chapterId: "dorm_chapter_01", text: "扬声器开始第一次点名。林穗抓紧床栏，指节白得没有血色。", nextNodeId: "dorm_02_001", visualCharacter: "Lin Sui", objectiveComplete: true, chapterRecap: { title: "广播有规则，但门外已经违背了一条。", next: "查清宿舍的第四张床究竟藏着什么。" } });

  add("dorm_02_001", { chapterId: "dorm_chapter_02", text: "床位编号从一到四。书桌和窗之间，却摆着一张没有编号的折叠床。", objectiveId: "verify-the-count", objectiveText: "找出宿舍漏登的是谁。", visualFocus: "temporary-bed", sceneHold: false, transitionStyle: "hold" });
  add("dorm_02_002", { chapterId: "dorm_chapter_02", text: "二号床被叫到时，当事人没有出声。赵晴从黑暗里回答：已经休息。", nextNodeId: "dorm_02_003", visualCharacter: "Zhao Qing", ruleUpdates: [{ ruleId: "dorm_rule_04", status: "verified" }] });
  add("dorm_02_003", { chapterId: "dorm_chapter_02", text: "夹在门上的官方名册有四个名字。折叠床上却多出一条被子。", nextNodeId: "dorm_02_004", gainClues: ["dorm_clue_417_roster"], visualFocus: "roster" });
  add("dorm_02_004", { chapterId: "dorm_chapter_02", type: "choice", text: "门外的声音自称吴阿姨。全屋都在等你决定。", choices: [
    choice("protect", "不开门，让大家继续藏好折叠床。", "dorm_02_005", { setFlags: ["protected_fourth_bed"], choiceImpactText: "无编号的床还留在宿舍的人数里。", ruleUpdates: [{ ruleId: "dorm_rule_06", status: "partly-credible" }] }),
    choice("check", "不解门链，只从猫眼确认。", "dorm_02_005", { choiceImpactText: "猫眼里只有一串钥匙，没有脸。", ruleUpdates: [{ ruleId: "dorm_rule_03", status: "contradiction" }] }),
  ] });
  add("dorm_02_005", { chapterId: "dorm_chapter_02", text: "走廊监控明明是黑的，镜头指示灯却闪了一下，正对着 417。", nextNodeId: "dorm_02_006", scene: "dorm_floor4_corridor", sceneHold: false, transitionStyle: "fade", visualFocus: "peephole" });
  add("dorm_02_006", { chapterId: "dorm_chapter_02", text: "没有人开门。屋里的第五个人依旧没有说出自己的名字。", nextNodeId: "dorm_03_001", objectiveComplete: true, chapterRecap: { title: "名册错了，但宿舍并没有空。", next: "镜子知道一个 417 没人愿意念出的名字。" } });

  add("dorm_03_001", { chapterId: "dorm_chapter_03", scene: "dorm_washroom_mirror", text: "00:44，应急灯变成红色。没人放水，洗手间的镜子却先蒙上了雾。", objectiveId: "read-the-mirror", objectiveText: "判断镜中的名字是警告，还是陷阱。", sceneHold: false, transitionStyle: "fade", visualFocus: "mirror" });
  add("dorm_03_002", { chapterId: "dorm_chapter_03", text: "雾气里浮出一个名字：周婉宁。它比周围的玻璃更旧。", nextNodeId: "dorm_03_003", gainClues: ["dorm_clue_mirror_name"], setFlags: ["saw_mirror_name"], ruleUpdates: [{ ruleId: "dorm_rule_07", status: "verified" }] });
  add("dorm_03_003", { chapterId: "dorm_chapter_03", speaker: "Shen Yan", visualCharacter: "Shen Yan", text: "沈妍本该躺在四号床。她的床是空的。紧接着，洗手间门外有人轻轻敲门。", nextNodeId: "dorm_03_004" });
  add("dorm_03_004", { chapterId: "dorm_chapter_03", type: "choice", text: "门外的人说自己是沈妍。半开的宿舍门外，能看到她原来的床。", choices: [
    choice("verify-bed", "先确认床位，再决定要不要开门。", "dorm_03_005", { choiceImpactText: "床上有一道熟睡的人影。你没有打开洗手间门。", ruleUpdates: [{ ruleId: "dorm_rule_06", status: "verified" }] }),
    choice("open-door", "替她打开洗手间门。", "dorm_03_005", { choiceImpactText: "冷气涌进来。镜雾散开，门外却没有任何人。", ruleUpdates: [{ ruleId: "dorm_rule_06", status: "contradiction" }] }),
  ] });
  add("dorm_03_005", { chapterId: "dorm_chapter_03", text: "十秒后红灯熄灭。沈妍回到了 417，盯着一个她说从未听过的名字。", nextNodeId: "dorm_03_006", visualCharacter: "Shen Yan" });
  add("dorm_03_006", { chapterId: "dorm_chapter_03", text: "这条规则不是用来保护宿舍里的人。它只是让某个名字永远说不出口。", nextNodeId: "dorm_04_001", objectiveComplete: true, chapterRecap: { title: "周婉宁曾经被抹去过。", next: "一段视频和旧火灾记录，会告诉你抹除从哪里开始。" } });

  add("dorm_04_001", { chapterId: "dorm_chapter_04", scene: "dorm_manager_office", text: "陈露在手机缓存里找到断电前的视频。灯灭之前，417 已经站着五道身影。", objectiveId: "trace-the-old-case", objectiveText: "把今晚的第五人和 2014 年的记录对照。", sceneHold: false, transitionStyle: "fade", gainClues: ["dorm_clue_pre_blackout_video"], setFlags: ["reviewed_video"], visualFocus: "phone" });
  add("dorm_04_002", { chapterId: "dorm_chapter_04", text: "吴阿姨办公室的 2014 年档案写着，火灾起于 319。楼层图标出的受损房间却是 320。", nextNodeId: "dorm_04_003", gainClues: ["dorm_clue_2014_fire_record"], setFlags: ["found_fire_discrepancy"], visualFocus: "fire-record" });
  add("dorm_04_003", { chapterId: "dorm_chapter_04", text: "文件夹背后压着一张手写纸：从名单上消失的人，必须写回名单。绝不能被交出去。", nextNodeId: "dorm_04_004", gainClues: ["dorm_clue_handwritten_rule"], ruleUpdates: [{ ruleId: "dorm_rule_08", status: "forged" }] });
  add("dorm_04_004", { chapterId: "dorm_chapter_04", type: "choice", text: "The broadcast calls the handwritten note an unauthorized modification. Who do you trust?", choices: [
    choice("note", "Trust the note and preserve the six records.", "dorm_04_005", { setFlags: ["understood_rule_eight_forged"], choiceImpactText: "Rule eight is no longer a threat. It is evidence of who wrote the system.", ruleUpdates: [{ ruleId: "dorm_rule_08", status: "forged" }] }),
    choice("broadcast", "Treat the note as another trap.", "dorm_04_005", { choiceImpactText: "The broadcast grows calmer, as if it has won a small argument.", ruleUpdates: [{ ruleId: "dorm_rule_08", status: "contradiction" }] }),
  ] });
  add("dorm_04_005", { chapterId: "dorm_chapter_04", scene: "dorm_fire_memory_2014", text: "The old corridor does not show flames. It shows a girl waiting beside room 320 while the report insists she was never there.", nextNodeId: "dorm_04_006", visualCharacter: "Zhou Wanning", sceneHold: false, transitionStyle: "fade" });
  add("dorm_04_006", { chapterId: "dorm_chapter_04", text: "Tonight's fifth person may not be a ghost. The danger is the system that turns unregistered people into missing ones.", nextNodeId: "dorm_05_001", objectiveComplete: true, chapterRecap: { title: "The fire record erased Zhou Wanning. Rule eight repeats the same crime.", next: "The room must decide whom the record is trying to take tonight." } });

  add("dorm_05_001", { chapterId: "dorm_chapter_05", text: "Back in 417, every official bed is occupied. Xu Tang has the temporary cot and the only name not printed anywhere.", objectiveId: "protect-the-unlisted", objectiveText: "Keep the record from reducing a real person to an error.", visualCharacter: "Xu Tang", visualFocus: "temporary-bed", sceneHold: false, transitionStyle: "fade" });
  add("dorm_05_002", { chapterId: "dorm_chapter_05", speaker: "Xu Tang", visualCharacter: "Xu Tang", text: "Xu Tang says she was moved in after a leak, just for one night. The speaker calls her a discrepancy.", nextNodeId: "dorm_05_003" });
  add("dorm_05_003", { chapterId: "dorm_chapter_05", type: "choice", text: "The duty-room deadline is close. What do you tell the room?", choices: [
    choice("protect-xutang", "No one goes downstairs alone. Keep the fifth bed visible.", "dorm_05_004", { setFlags: ["named_xutang"], choiceImpactText: "Xu Tang is no longer allowed to be a blank line.", endingPathTags: ["protect-unlisted"] }),
    choice("send-xutang", "Tell Xu Tang to report before 01:13.", "dorm_05_004", { setFlags: ["sent_unregistered_downstairs"], choiceImpactText: "The count becomes easier to explain, and harder to live with.", endingPathTags: ["hand-over-unlisted"] }),
  ] });
  add("dorm_05_004", { chapterId: "dorm_chapter_05", scene: "dorm_stairwell", text: "The stairwell door opens by itself. Downstairs, the duty room sign is lit. No other floor has power.", nextNodeId: "dorm_05_005", sceneHold: false, transitionStyle: "fade", visualFocus: "stairs" });
  add("dorm_05_005", { chapterId: "dorm_chapter_05", type: "choice", text: "Zhao Qing asks whether Zhou Wanning was the first fifth person. How do you answer?", choices: [
    choice("restore-name", "Say Zhou Wanning's name and connect her to the 2014 count.", "dorm_05_006", { setFlags: ["named_zhouwanning"], choiceImpactText: "The stairs stop leading down. They lead back to the broadcast room.", endingPathTags: ["restore-erased-name"] }),
    choice("blame-shen", "Say Shen Yan must be the anomaly instead.", "dorm_05_006", { setFlags: ["accused_wrong_person"], choiceImpactText: "The speaker repeats Shen Yan's bed number until the room starts to doubt her.", endingPathTags: ["wrong-fifth-person"] }),
  ] });
  add("dorm_05_006", { chapterId: "dorm_chapter_05", text: "A new route appears on the floor map: broadcast room, fourth floor. The only way forward is to correct the count where it was made.", nextNodeId: "dorm_06_001", objectiveComplete: true, chapterRecap: { title: "A name is not an error because a form cannot hold it.", next: "Reach the broadcast room and decide what the roll call is really for." } });

  add("dorm_06_001", { chapterId: "dorm_chapter_06", scene: "dorm_broadcast_room", text: "The broadcast room is already open. A microphone waits beside a console with five active room lights and one erased channel.", objectiveId: "correct-the-roll-call", objectiveText: "Use the evidence to stop the system from deleting another person.", sceneHold: false, transitionStyle: "fade", visualFocus: "microphone" });
  add("dorm_06_002", { chapterId: "dorm_chapter_06", type: "deduction", text: "Final deduction: what is rule eight designed to do?", question: { prompt: "What does the false rule accomplish?", choices: [
    { choiceId: "delete", text: "It isolates an unregistered person so the system can delete her.", isCorrect: true },
    { choiceId: "protect", text: "It protects the room by sending the fifth person to safety.", isCorrect: false },
    { choiceId: "punish", text: "It punishes the person who broke the knock pattern.", isCorrect: false },
  ] }, correctChoiceId: "delete", nextNodeId: "dorm_06_003" });
  add("dorm_06_003", { chapterId: "dorm_chapter_06", text: "The six records form one answer: the system protects a clean roster, not the people sleeping behind the door.", nextNodeId: "dorm_06_004", visualFocus: "floor-map" });
  add("dorm_06_004", { chapterId: "dorm_chapter_06", type: "choice", text: "The microphone opens. What do you say?", choices: [
    choice("correct-record", "Read out Zhou Wanning and Xu Tang, then correct the 319/320 record.", "dorm_06_005", { setFlags: ["named_xutang", "named_zhouwanning", "understood_rule_eight_forged"], choiceImpactText: "The record receives the names it tried to remove.", endingPathTags: ["correct-record"] }),
    choice("four-person", "Confirm that 417 has only four registered residents.", "dorm_06_005", { setFlags: ["sent_unregistered_downstairs"], choiceImpactText: "The console accepts the number immediately.", endingPathTags: ["confirm-four"] }),
    choice("cut", "Cut the broadcast and hide the evidence.", "dorm_06_005", { setFlags: ["cut_broadcast"], choiceImpactText: "The room goes dark, but the roll call has not ended.", endingPathTags: ["cut-broadcast"] }),
  ] });
  add("dorm_06_005", { chapterId: "dorm_chapter_06", scene: "dorm_ending_archive", text: "The console waits for the final count. Every choice has made one future easier for it to keep.", nextNodeId: "dorm_06_006", sceneHold: false, transitionStyle: "fade" });
  add("dorm_06_006", { chapterId: "dorm_chapter_06", type: "choice", text: "Choose the final record.", choices: [
    choice("finish", "Submit the record you have built.", "dorm_06_007", { choiceImpactText: "The archive records what you were willing to name." }),
  ] });
  add("dorm_06_007", { chapterId: "dorm_chapter_06", type: "ending", text: "The speaker makes one last click.", nextNodeId: null, resolveEnding: true, objectiveComplete: true });

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
    clues,
    defaultFlags,
    endings,
    nodes,
    profile: {
      coreClueIds: Object.keys(clues),
      relationshipDefs: [
        { id: "trust_linsui", character: "Lin Sui", label: "Trust", levels: ["Distant", "Listening", "Mutual", "Entrusted"] },
        { id: "trust_zhaoqing", character: "Zhao Qing", label: "Trust", levels: ["Distant", "Watching", "Mutual", "Entrusted"] },
        { id: "support_chenlu", character: "Chen Lu", label: "Support", levels: ["Hesitant", "Helping", "Committed", "Unshakable"] },
        { id: "protect_xutang", character: "Xu Tang", label: "Protection", levels: ["Uncertain", "Seen", "Protected", "Restored"] },
      ],
      evidenceLinks: [
        { linkId: "dorm_link_count", title: "417 roster + pre-blackout video", clueIds: ["dorm_clue_417_roster", "dorm_clue_pre_blackout_video"] },
        { linkId: "dorm_link_erasure", title: "Mirror name + 2014 fire record", clueIds: ["dorm_clue_mirror_name", "dorm_clue_2014_fire_record"] },
        { linkId: "dorm_link_forged_rule", title: "Broadcast recording + handwritten rule", clueIds: ["dorm_clue_broadcast_recording", "dorm_clue_handwritten_rule"] },
      ],
      endingResolver(state) {
        if (state.flags.cut_broadcast) return "dorm_ending_d";
        if (state.flags.accused_wrong_person) return "dorm_ending_c";
        if (state.flags.sent_unregistered_downstairs) return "dorm_ending_b";
        const allClues = Object.keys(clues).every((id) => state.clues.includes(id));
        if (allClues && state.flags.named_xutang && state.flags.named_zhouwanning && state.flags.understood_rule_eight_forged) return "dorm_ending_a";
        return "dorm_ending_d";
      },
    },
  };
})();
