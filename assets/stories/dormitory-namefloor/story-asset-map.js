(function () {
  "use strict";

  if (typeof document !== "undefined" && document.head && !document.querySelector("link[data-namefloor-runtime-visuals]")) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "assets/stories/dormitory-namefloor/runtime-visuals.css";
    stylesheet.dataset.namefloorRuntimeVisuals = "true";
    document.head.appendChild(stylesheet);
  }

  const missingFormalImage = (brief) => ({
    status: "missing-formal-image",
    brief,
    path: "",
    fallback: "css-procedural",
  });

  const scene = (title, cssClass, framing, ambience, cue, effects, phoneViews, brief, focus = "center") => ({
    title,
    cssClass,
    focus,
    portrait: { aspectRatio: "9:16", framing, mobileSafeZone: "bottom-34% dialogue / bottom-48% choices" },
    audio: { ambience, cue, voicePolicy: "world-audio-and-dialogue-only" },
    effects,
    phoneViews,
    formalImage: missingFormalImage(brief),
  });

  const ending = (title, cssClass, ambience, cue, effects, brief) => ({
    title,
    cssClass,
    portrait: { aspectRatio: "9:16", framing: "vertical-ending-tableau", mobileSafeZone: "bottom-30% ending copy" },
    audio: { ambience, cue, voicePolicy: "final-line-only" },
    effects,
    formalImage: missingFormalImage(brief),
  });

  const scenes = {
    namefloor_archive_corridors: scene("校长室档案回廊", "nf-scene-archive-corridors", "vertical-archive-depth", "dormitory_archive_air", "cabinet-hum", ["archive-flicker", "paper-drift"], [], "校长室深处五条档案回廊，男生宿舍记录与失踪姓名分向延伸，前景档案柜形成竖向压迫。", "corridor"),
    namefloor_black_avatar_truth: scene("黑色头像真相", "nf-scene-black-avatar", "phone-reflection-closeup", "dormitory_phone_silence", "delayed-breath", ["reflection-lag", "avatar-pulse"], ["system:incoming-calls"], "林峰手持手机，两个林峰账号来电，黑色头像在屏幕反光中短暂呈现失去五官的轮廓。", "phone"),
    namefloor_blank_contacts: scene("空白通讯录", "nf-scene-blank-contacts", "phone-interface-closeup", "dormitory_phone_silence", "single-vibration", ["name-erasure", "signal-static"], ["system:save"], "深夜宿舍床位旁的手机通讯录，林峰条目为空，班群四十二人不变，屏幕冷光照出手指。", "phone"),
    namefloor_break_roster: scene("砸碎名册", "nf-scene-roster-break", "low-angle-action", "dormitory_archive_air", "staple-snap", ["paper-scatter", "ember-fall"], [], "校长室内固定人数名册被砸断装订钉，散页向上翻起，两个林峰的档案在背景错位。", "roster"),
    namefloor_changed_photo: scene("被替换的合照", "nf-scene-changed-photo", "phone-photo-closeup", "dormitory_phone_silence", "future-message-tone", ["photo-replace", "timestamp-glitch"], ["private:message"], "手机上的班级合照中林峰位置被相同面孔覆盖，四十二人群人数保持不变，未来时间戳清晰可读。", "phone"),
    namefloor_copy_dorm: scene("复制的1107", "nf-scene-copy-dorm", "dormitory-two-plane", "dormitory_fourth_floor_air", "bedframe-creak", ["double-exposure", "curtain-shift"], [], "不存在四楼的复制1107，宋明坐在原床位，手腕勒痕可见，男生宿舍床铺与门位保持连续。", "room"),
    namefloor_corridor_attack: scene("隔壁开门后的走廊", "nf-scene-corridor-attack", "doorway-void", "dormitory_corridor_air", "dragging-fade", ["blackout", "blood-edge", "doorway-shake"], [], "十一楼男生宿舍走廊，隔壁门外仅留一道血迹和熄灭的暖光，1107门内三人处于安全区。", "door"),
    namefloor_deep_cabinet: scene("深柜与遗物", "nf-scene-deep-cabinet", "cabinet-vertical", "dormitory_archive_air", "lock-click", ["cabinet-open", "ink-crawl"], [], "校长室最深处的高柜自行开启，散页贴向林峰胸口，遗物与名册被冷光框住。", "cabinet"),
    namefloor_dorm_door: scene("1107铁门内侧", "nf-scene-dorm-door", "door-slit-closeup", "dormitory_room_air", "metal-scratch", ["door-impact", "shadow-slide", "light-cut"], [], "男生宿舍1107铁门内侧，门缝冷光切入，三名男学生保持在门内，门外只留不可辨认的影子。", "door"),
    namefloor_dorm_midnight: scene("午夜十一楼男生宿舍", "nf-scene-dorm-midnight", "bedroom-wide-vertical", "dormitory_room_air", "pipe-drip", ["light-flicker", "low-exposure"], [], "中国大学十一楼男生四人宿舍，四张上床下桌，宋明披毛巾离开，门缝透入走廊冷光。", "room"),
    namefloor_double_wu: scene("两个吴阿姨", "nf-scene-double-wu", "paired-figure-vertical", "dormitory_manager_air", "fabric-rustle", ["duplicate-align", "vest-color-shift"], [], "三楼走廊内两位绿色马甲宿管并立，衣料磨损相同，周朝阳从纸质证据辨认真正带路者。", "figures"),
    namefloor_dual_rules: scene("两套规则", "nf-scene-dual-rules", "desk-document-closeup", "dormitory_manager_air", "paper-turn", ["ink-wet", "rule-underline"], [], "宿管宿舍桌面上学生规则与宿管规则并排，羽毛和笔记压住纸角，男生宿舍环境保持低光。", "rules"),
    namefloor_ending_resolve: scene("出口前的结算", "nf-scene-ending-resolve", "threshold-wide-vertical", "dormitory_exit_air", "daybreak-hum", ["light-open", "paper-settle"], [], "校长室出口透入清晨，名册、手机、羽毛与几名男学生在竖向画面中等待最后选择。", "exit"),
    namefloor_endless_floor: scene("无名层走廊", "nf-scene-endless-floor", "corridor-vanishing-point", "dormitory_fourth_floor_air", "fluorescent-buzz", ["sign-erasure", "depth-loop"], [], "不存在的四楼复制十一楼走廊，铁门排列到竖幅深处，门牌姓名全部缺字。", "corridor"),
    namefloor_era_doors: scene("不同时代的门", "nf-scene-era-doors", "layered-door-depth", "dormitory_fourth_floor_air", "old-door-knock", ["era-crossfade", "door-breath"], [], "同一条男生宿舍走廊的门依次打开，门内叠映不同年代的1107与被困男学生。", "doors"),
    namefloor_exit_threshold: scene("出口坍塌", "nf-scene-exit-threshold", "escape-action-vertical", "dormitory_exit_air", "cabinet-collapse", ["dust-fall", "exit-flare"], [], "校长室后方出口亮起，飞落档案柜把周朝阳、伤者和散页分隔在三条可选路径。", "exit"),
    namefloor_feather_debt: scene("羽毛的代价", "nf-scene-feather-debt", "hand-and-feather-closeup", "dormitory_manager_air", "feather-scorch", ["ink-vein", "feather-ash"], [], "吴阿姨在三楼走廊伸手索回白羽毛，持有者手腕浮现墨线，绿色马甲保持真实老旧质地。", "feather"),
    namefloor_feather_drawer: scene("左侧羽毛抽屉", "nf-scene-feather-drawer", "drawer-closeup", "dormitory_manager_air", "drawer-slide", ["feather-rise", "name-return"], [], "宿管桌左侧抽屉塞满相同白羽毛，一根羽毛贴住男学生掌心，纸上林峰姓名短暂完整。", "drawer"),
    namefloor_final_two_lins: scene("最后的两个林峰", "nf-scene-final-two-lins", "confrontation-vertical", "dormitory_archive_air", "shared-breath", ["mirror-offset", "paper-lift"], [], "校长室深处，两个男性大学生林峰隔散页相对而立，一个资料完整，一个保有当夜伤痕与行动连续性。", "figures"),
    namefloor_fixed_count_archives: scene("固定人数档案", "nf-scene-fixed-count", "roster-and-lockers", "dormitory_archive_air", "roster-scratch", ["row-rewrite", "cabinet-flicker"], [], "校长室四组档案柜围住自动改写的学生名册，每恢复一个姓名便有另一行被挤出。", "roster"),
    namefloor_floor_four: scene("不存在的四楼", "nf-scene-floor-four", "floor-sign-vertical", "dormitory_fourth_floor_air", "sign-hum", ["number-lock", "name-glitch"], [], "楼梯平台上数字4清晰定格，周朝阳想靠近，林峰与谷雨从两侧阻止，后方是复制十一楼走廊。", "sign"),
    namefloor_green_no_answer: scene("绿色马甲未作答", "nf-scene-green-no-answer", "doorway-aftermath", "dormitory_manager_air", "key-drop", ["key-glint", "ink-transfer"], [], "旋转铁门合上后，绿色马甲宿管留下钥匙与录音，羽毛污染沿掌心墨线转移。", "door"),
    namefloor_green_vest: scene("绿色马甲宿管", "nf-scene-green-vest", "manager-approach", "dormitory_manager_air", "cloth-step", ["green-approach", "feather-react"], [], "三楼或四楼走廊尽头，可信但不绝对安全的绿色马甲吴阿姨先观察羽毛，再观察学生姓名。", "manager"),
    namefloor_guyu_forgets: scene("谷雨忘记名字", "nf-scene-guyu-forgets", "bust-reaction", "dormitory_fourth_floor_air", "memory-hiss", ["soft-focus", "name-fade"], [], "谷雨在冷白走廊近景中试图叫出林峰却停住，周朝阳在后景持纸质笔记准备再次锚定。", "face"),
    namefloor_linfeng_positions: scene("林峰的两个站位", "nf-scene-linfeng-positions", "exit-shadow-tableau", "dormitory_exit_air", "streetlamp-buzz", ["shadow-extra", "paper-parallel"], [], "宿舍楼出口前两个林峰的站位与散页并列，晨光未完全驱散第五处无法归属的影子。", "exit"),
    namefloor_manager_room: scene("三楼宿管宿舍", "nf-scene-manager-room", "room-investigation-vertical", "dormitory_manager_air", "clock-tick", ["drawer-open", "moon-glow"], [], "三楼宿管宿舍内有桌、左抽屉、学生名单、撕页日记与异常窗，所有陈设属于中国大学男生宿舍体系。", "room"),
    namefloor_midnight_return: scene("回到零点的消息", "nf-scene-midnight-return", "phone-time-loop", "dormitory_phone_silence", "send-pulse", ["time-rewind", "avatar-lock"], ["private:message"], "黑色头像以林峰身份向零点发送短信，手机进度条与五道影子反光构成竖向闭环。", "phone"),
    namefloor_moon_window: scene("月亮与窗外手印", "nf-scene-moon-window", "window-vertical", "dormitory_manager_air", "glass-bulge", ["handprint-spread", "moon-pressure"], [], "宿管宿舍窗外巨大月亮贴住玻璃，多枚湿手印向内爬，羽毛在前景可用于封窗或引路。", "window"),
    namefloor_name_exchange: scene("姓名交换", "nf-scene-name-exchange", "roster-hand-closeup", "dormitory_archive_air", "staple-grind", ["name-transfer", "contact-blank"], [], "林峰手按名册中的自己，通讯录和学籍同步空白，装订钉像牙齿锁住散页。", "roster"),
    namefloor_name_feast: scene("姓名被吞食", "nf-scene-name-feast", "victim-doorway", "dormitory_fourth_floor_air", "distant-chew", ["collar-erasure", "faceless-rise"], [], "无名层门缝前一名男学生五官尚在而姓名正从衣领、手机和记忆里剥落，避免血腥特写。", "door"),
    namefloor_peephole: scene("猫眼里的走廊", "nf-scene-peephole", "peephole-pov", "dormitory_corridor_air", "held-breath", ["lens-breathe", "split-shadow"], [], "1107猫眼主观镜头，毛巾肩膀占据圆形边缘，影子同时向两个方向延伸。", "peephole"),
    namefloor_phone_glow: scene("手机光下的1107", "nf-scene-phone-glow", "phone-and-beds", "dormitory_phone_silence", "notification-vibrate", ["phone-vibrate", "signal-static", "name-glitch"], ["group:group", "group:members", "private:message", "system:rules"], "男生宿舍1107被手机冷光照亮，短信、班群规则、成员列表和宋明私聊均以可读手机界面呈现。", "phone"),
    namefloor_red_inspection: scene("红色马甲查房", "nf-scene-red-inspection", "doorframe-vertical", "dormitory_corridor_air", "three-knocks", ["vest-reveal", "face-dislocate", "light-flicker"], [], "十一楼1107门框内先出现正常红色马甲查房者，后续可无缝切到眼部血丝、面部错位和长肢异化。", "door"),
    namefloor_restoration_roster: scene("待恢复名册", "nf-scene-restoration-roster", "paper-split-closeup", "dormitory_archive_air", "feather-crack", ["page-split", "ink-hold"], [], "羽毛从中裂开，名册页停在姓名交换完成前，几行待恢复姓名与林峰掌纹同框。", "roster"),
    namefloor_restore_one_name: scene("恢复一个名字", "nf-scene-restore-one", "single-slot-closeup", "dormitory_archive_air", "row-illuminate", ["slot-glow", "exchange-prompt"], [], "自动名册只剩一个空白位置，恢复死者或活人的选择在纸面与手机联系人之间产生可见代价。", "roster"),
    namefloor_stair_echo: scene("楼梯间的姓名回声", "nf-scene-stair-echo", "stair-landing-closeup", "dormitory_stair_air", "name-echo", ["voice-echo", "paper-anchor"], [], "数字4熄灭后的三楼平台，周朝阳按住林峰肩膀要求说出姓名，纸笔成为安静的锚点。", "stairs"),
    namefloor_stairwell: scene("失焦楼梯间", "nf-scene-stairwell", "stairwell-vertical-depth", "dormitory_stair_air", "running-steps", ["depth-shift", "floor-number-glitch", "controlled-shake"], [], "消防门后的折返楼梯纵向延伸，11与3残影退去，三名男学生向下逃离红马甲。", "stairs"),
    namefloor_stopped_clock: scene("停在三点半的钟", "nf-scene-stopped-clock", "clock-room-detail", "dormitory_manager_air", "looped-footsteps", ["clock-freeze", "wet-footprint-loop"], [], "宿管宿舍停在三点三十分的墙钟与门缝外重复经过的湿鞋印同框，空间时间停滞可读。", "clock"),
    namefloor_successor_door: scene("接任者铁门", "nf-scene-successor-door", "scanning-door-vertical", "dormitory_manager_air", "scanner-sweep", ["name-scan", "shadow-break"], [], "没有把手的旋转铁门以冷光扫描姓名，门后人物呼吸连续而影子中断，暗示接任代价。", "door"),
    namefloor_torn_diary: scene("撕页宿管日记", "nf-scene-torn-diary", "diary-and-notes", "dormitory_manager_air", "paper-rustle", ["page-lift", "ink-fade"], [], "撕页日记与周朝阳旧笔记并置在宿管桌上，手写生活细节比电子扫描更可靠。", "diary"),
    namefloor_two_linfengs: scene("复制宿舍的两个林峰", "nf-scene-two-linfengs", "bunk-bed-confrontation", "dormitory_fourth_floor_air", "curtain-slide", ["identity-split", "screen-denial"], [], "复制1107上铺帘子滑开，合法林峰坐起，玩家林峰手机显示用户不存在，二人均为男性大学生。", "figures"),
    namefloor_two_songmings: scene("两个宋明", "nf-scene-two-songmings", "phone-and-door-depth", "dormitory_fourth_floor_air", "duplicate-ringtone", ["call-overlap", "memory-flash"], [], "同行宋明拿着响铃手机，复制宿舍深处另一名宋明的声音传来，两人共享旧记忆而拥有不同当夜经历。", "phone"),
    namefloor_wu_old_accounts: scene("历任宿管合同", "nf-scene-wu-accounts", "contract-wall-vertical", "dormitory_manager_air", "key-split", ["signature-fade", "photo-wall-shift"], [], "历任宿管照片墙后藏三年合同，吴阿姨签名逐年缺字，旧钥匙被掰开交给林峰。", "contracts"),
  };

  window.DORMITORY_NAMEFLOOR_ASSET_MAP = {
    version: "seven-chapter-visual-map-v1",
    world: {
      setting: "中国大学男生宿舍",
      primaryFormat: "portrait-9:16",
      visualPolicy: "正式位图缺失时仅使用CSS程序化备用构图；不使用迁移前素材。",
    },
    covers: { story: "" },
    scenes,
    phoneViews: {
      "group:group": { title: "班级群禁言记录", layout: "portrait-chat-thread", anomaly: "黑色头像占位而群人数不增加" },
      "group:members": { title: "班群成员列表", layout: "portrait-member-list", anomaly: "林峰位置缺失，黑色头像仍占原成员槽" },
      "private:message": { title: "宋明与时间错位私聊", layout: "portrait-private-thread", anomaly: "未送达、未来时间戳或回到零点的消息" },
      "system:incoming-calls": { title: "双林峰来电", layout: "portrait-call-panel", anomaly: "两个同名账号同时来电，反光中的头像慢半拍呼吸" },
      "system:rules": { title: "学生规则全文", layout: "portrait-scroll-document", anomaly: "八条规则必须一次完整可读，黑色头像资料不可查看" },
      "system:save": { title: "空白联系人与存档", layout: "portrait-system-record", anomaly: "联系人、班群和存档标题同步发生姓名缺字" },
    },
    characters: {
      林峰: { id: "linfeng", name: "林峰", role: "1107宿舍学生", sampleStyle: "linfeng", formalImage: missingFormalImage("中国男大学生林峰，深夜宿舍低光胸像与手持手机近景。") },
      周朝阳: { id: "zhouchaoyang", name: "周朝阳", role: "规则与证据观察者", sampleStyle: "zhouchaoyang", formalImage: missingFormalImage("中国男大学生周朝阳，冷静观察，笔记与侧向手机冷光。") },
      谷雨: { id: "guyu", name: "谷雨", role: "重感情的1107舍友", sampleStyle: "guyu", formalImage: missingFormalImage("中国男大学生谷雨，紧张但愿意锚定同伴姓名的低光近景。") },
      宋明: { id: "songming", name: "宋明", role: "存在身份分歧的舍友", sampleStyle: "songming", formalImage: missingFormalImage("中国男大学生宋明，毛巾、手腕勒痕与复制宿舍两种状态可连续对照。") },
      吴阿姨: { id: "wu_manager", name: "吴阿姨", role: "绿色马甲宿管", sampleStyle: "green-manager", formalImage: missingFormalImage("年长女性宿管吴阿姨，旧绿色马甲、钥匙与克制的复杂神情。") },
      红色马甲宿管: { id: "red_manager", name: "红色马甲宿管", role: "不应对话的查房者", sampleStyle: "red-manager", formalImage: missingFormalImage("红色马甲查房者，先正常拟态后眼部血丝、面部错位、长肢异化的连续竖幅素材。") },
      旁白: { id: "narrator", name: "旁白", role: "静音叙事" },
    },
    characterAliases: {
      "门外的宋明": "宋明",
      "门外的声音": "宋明",
      "门外女声": "红色马甲宿管",
      "红色马甲宿管": "红色马甲宿管",
      "校园广播": "旁白",
      "查房者": "红色马甲宿管",
    },
    clues: {},
    chapters: {},
    props: {},
    audio: { scenes: Object.fromEntries(Object.entries(scenes).map(([id, item]) => [id, { bgm: item.audio.ambience, cue: item.audio.cue }])) },
    endings: {
      E1: ending("记得回宿舍", "nf-ending-breakfast", "dormitory_dawn_air", "breakfast-ambience", ["warm-rise", "avatar-release"], "清晨校外早餐店，林峰、周朝阳、谷雨与真正宋明均为男性大学生，名字恢复后的自然并肩。"),
      E2: ending("它也叫宋明", "nf-ending-song-guard", "dormitory_exit_air", "door-close", ["feather-glow", "door-seal"], "复制体宋明在追逐门内自愿留下，出口一侧的林峰回望，手写名字留在散页上。"),
      E3: ending("请记住谷雨", "nf-ending-guyu-voice", "dormitory_dawn_air", "unlisted-voice", ["contact-erase", "soft-dawn"], "清晨手机播放无联系人语音，谷雨姓名从联系人与名册中消失，林峰仍握住录音。"),
      E4: ending("你明明说过相信我", "nf-ending-betrayal-message", "dormitory_exit_air", "late-notification", ["message-arrival", "cold-hold"], "天亮后的手机显示被留者实名账号恢复在线，出口外林峰面对迟到的证据与指责。"),
      E5: ending("全员到齐", "nf-ending-all-present", "dormitory_school_air", "notice-speaker", ["notice-flicker", "shadow-mismatch"], "学校公告栏展示四张清晰男学生照片与秩序正常通知，其中一人的影子与眼神不一致。"),
      E6: ending("第二个林峰", "nf-ending-second-linfeng", "dormitory_dawn_air", "crowd-pass", ["identity-fade", "focus-isolate"], "宿舍楼外合法林峰被同学迎走，玩家林峰留在画面边缘，手机显示用户不存在。"),
      E7: ending("还有一个人", "nf-ending-fifth-shadow", "dormitory_dawn_air", "streetlight-buzz", ["fifth-shadow", "wet-handprint"], "四名男性大学生走进清晨，路灯下投出五道不同步影子，班群仍显示四十二人。"),
      E8: ending("不要忘记你的名字", "nf-ending-midnight-loop", "dormitory_phone_silence", "midnight-vibrate", ["avatar-lock", "time-rewind"], "林峰失去面孔成为黑色头像，在零点手机上向过去发送不要忘记你的名字。"),
    },
  };
})();
