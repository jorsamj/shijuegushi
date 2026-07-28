(function () {
  "use strict";

  const root = "assets/stories/dormitory-namefloor/formal";
  const asset = (id, assetType, path, descriptionZh, extra = {}) => ({
    id,
    assetId: id,
    assetType,
    path: `${root}/${path}`,
    descriptionZh,
    model: "gpt-image-2",
    width: 1024,
    height: 1536,
    format: "png",
    inspected: true,
    qualityStatus: "approved",
    runtimeIntegrated: false,
    ...extra,
  });

  window.DORMITORY_NAMEFLOOR_FORMAL_VISUALS = {
    version: "dormitory-namefloor-formal/v1-phase2",
    phase: "phase-2",
    generation: {
      model: "gpt-image-2",
      referenceImagesUsed: true,
      playerVisibleTextPolicy: "phone-and-document-text-remain-html-css",
      runtimeIntegration: "not-runtime-integrated",
    },
    assets: [
      asset("char_linfeng_master_upper_neutral", "character-master", "characters/char_linfeng_master_upper_neutral.png", "林峰：灰色旧短袖、黑色运动短裤的大学男生中性上半身母版。", { characterId: "linfeng", gender: "male", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["1107手机冷光", "四楼身份验证", "校长室"], plannedReuseNodes: ["namefloor_phone_glow", "namefloor_two_linfengs", "namefloor_final_two_lins"] }),
      asset("char_linfeng_upper_phone_alert", "character-state", "characters/char_linfeng_upper_phone_alert.png", "林峰：看向空白手机屏幕的警觉状态，冷光照面，尚未完全恐惧。", { characterId: "linfeng", stateId: "phone_alert", transparent: true, alpha: true, phase: "state-approved", sourceMaster: "assets/stories/dormitory-namefloor/formal/characters/char_linfeng_master_upper_neutral.png", framing: "头部至大腿上方，手机靠近胸前，底部保留 UI 安全区", reuseScenes: ["开场陌生短信", "黑色头像", "群成员异常", "联系人异常", "深夜来电"], plannedNodeCount: 8, consistencyStatus: "master-reference-approved" }),
      asset("char_linfeng_upper_door_fear", "character-state", "characters/char_linfeng_upper_door_fear.png", "林峰：门外异响时的惊恐状态，微后撤、汗水和冷光阴影。", { characterId: "linfeng", stateId: "door_fear", transparent: true, alpha: true, phase: "state-approved", sourceMaster: "assets/stories/dormitory-namefloor/formal/characters/char_linfeng_master_upper_neutral.png", framing: "头部至大腿上方的近景，面部为焦点，底部保留 UI 安全区", reuseScenes: ["宋明敲门", "猫眼异常", "隔壁宿舍被袭", "红色马甲接近"], plannedNodeCount: 7, consistencyStatus: "master-reference-approved" }),
      asset("char_linfeng_upper_exhausted", "character-state", "characters/char_linfeng_upper_exhausted.png", "林峰：逃跑后弯腰喘息，衣物有合理灰尘与轻微擦伤，仍在观察危险。", { characterId: "linfeng", stateId: "exhausted", transparent: true, alpha: true, phase: "state-approved", sourceMaster: "assets/stories/dormitory-namefloor/formal/characters/char_linfeng_master_upper_neutral.png", framing: "头部至大腿上方，微前倾，底部保留 UI 安全区", reuseScenes: ["走廊追逐后", "四楼逃亡", "校长室前", "四楼崩塌前"], plannedNodeCount: 7, consistencyStatus: "master-reference-approved" }),
      asset("char_linfeng_upper_self_doubt", "character-state", "characters/char_linfeng_upper_self_doubt.png", "林峰：触碰太阳穴、眼神游离的自我怀疑状态，人物仍是正常林峰。", { characterId: "linfeng", stateId: "self_doubt", transparent: true, alpha: true, phase: "state-approved", sourceMaster: "assets/stories/dormitory-namefloor/formal/characters/char_linfeng_master_upper_neutral.png", framing: "上半身大近景，面部完整，底部保留 UI 安全区", reuseScenes: ["名字说不完整", "合照被替换", "名单无自己", "队友遗忘", "双林峰出现前"], plannedNodeCount: 8, consistencyStatus: "master-reference-approved" }),
      asset("char_linfeng_upper_name_eroding", "character-state", "characters/char_linfeng_upper_name_eroding.png", "林峰：一侧轮廓、衣物和面部边缘出现克制的现实删除与颗粒消散。", { characterId: "linfeng", stateId: "name_eroding", transparent: true, alpha: true, phase: "state-approved", sourceMaster: "assets/stories/dormitory-namefloor/formal/characters/char_linfeng_master_upper_neutral.png", framing: "头部至大腿上方，核心面部清晰，底部保留 UI 安全区", reuseScenes: ["姓名污染中后期", "联系人姓名缺字", "说话人异常", "名册反噬", "第七章身份剥离"], plannedNodeCount: 10, consistencyStatus: "master-reference-approved" }),
      asset("char_linfeng_upper_nameless_stage9", "character-state", "characters/char_linfeng_upper_nameless_stage9.png", "林峰：第九阶段无名状态，疲惫克制，轮廓局部脱离现实但未成为黑色头像。", { characterId: "linfeng", stateId: "nameless_stage9", transparent: true, alpha: true, phase: "state-approved", sourceMaster: "assets/stories/dormitory-namefloor/formal/characters/char_linfeng_master_upper_neutral.png", framing: "头部至大腿上方，面部完整，底部保留 UI 安全区", reuseScenes: ["第七章第九阶段", "E6 第二个林峰", "E8 时间闭环前"], plannedNodeCount: 6, consistencyStatus: "master-reference-approved" }),
      asset("char_zhouchaoyang_master_upper_neutral", "character-master", "characters/char_zhouchaoyang_master_upper_neutral.png", "周朝阳：低饱和橄榄色上衣的大学男生中性上半身母版。", { characterId: "zhouchaoyang", gender: "male", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["规则核对", "楼梯间", "校长室"], plannedReuseNodes: ["namefloor_dual_rules", "namefloor_stair_echo", "namefloor_final_two_lins"] }),
      asset("char_guyu_master_upper_neutral", "character-master", "characters/char_guyu_master_upper_neutral.png", "谷雨：褪色姜黄短袖的大学男生中性上半身母版。", { characterId: "guyu", gender: "male", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["1107", "姓名锚定", "结局回收"], plannedReuseNodes: ["namefloor_guyu_forgets", "namefloor_floor_four", "namefloor_ending_guyu_voice"] }),
      asset("char_songming_master_upper_neutral", "character-master", "characters/char_songming_master_upper_neutral.png", "宋明：米白短袖、青绿色条纹毛巾的大学男生中性上半身母版。", { characterId: "songming", gender: "male", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["门外宋明", "复制1107", "双宋明"], plannedReuseNodes: ["namefloor_copy_dorm", "namefloor_two_songmings", "namefloor_ending_song_guard"] }),
      asset("char_manager_wu_master_upper_neutral", "character-master", "characters/char_manager_wu_master_upper_neutral.png", "吴阿姨：深色开衫、钥匙串的中年女性宿管中性上半身母版。", { characterId: "manager_wu", gender: "female", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["宿管三年", "羽毛代价", "历任宿管档案"], plannedReuseNodes: ["namefloor_green_vest", "namefloor_feather_debt", "namefloor_wu_old_accounts"] }),
      asset("char_green_vest_master_upper_neutral", "character-master", "characters/char_green_vest_master_upper_neutral.png", "绿色马甲宿管：绿色旧马甲、钥匙串的中年女性宿管中性上半身母版。", { characterId: "green_vest", gender: "female", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["三楼宿管宿舍", "绿色马甲验证"], plannedReuseNodes: ["namefloor_green_vest", "namefloor_double_wu"] }),
      asset("char_red_vest_master_upper_neutral", "character-master", "characters/char_red_vest_master_upper_neutral.png", "红色马甲查房者：异化前、手持登记板的中年女性拟态母版。", { characterId: "red_vest", gender: "female", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["一点查房", "门内逃离"], plannedReuseNodes: ["namefloor_red_inspection", "namefloor_dorm_door"] }),
      asset("bg_dorm_1107_midnight", "background", "backgrounds/bg_dorm_1107_midnight.png", "1107 男生四人宿舍午夜净版：上床下桌、半开的铁门和手机冷光。", { sceneId: "dorm_1107_midnight", transparent: false, phase: "background-approved", backgroundType: "reusable-location", reusableScenes: ["开场", "手机冷光", "门外宋明"], plannedReuseNodes: ["namefloor_dorm_midnight", "namefloor_phone_glow", "namefloor_dorm_door"] }),
      asset("bg_corridor_11f", "background", "backgrounds/bg_corridor_11f.png", "十一楼男生宿舍走廊净版：潮湿墙面、冷绿荧光灯和消防门纵深。", { sceneId: "corridor_11f", transparent: false, phase: "background-approved", backgroundType: "reusable-location", reusableScenes: ["猫眼", "门外影子", "红马甲追逐"], plannedReuseNodes: ["namefloor_peephole", "namefloor_corridor_attack", "namefloor_red_inspection"] }),
      asset("bg_manager_room", "background", "backgrounds/bg_manager_room.png", "三楼宿管宿舍净版：左侧抽屉、桌面档案、床位与月光窗口。", { sceneId: "manager_room", transparent: false, phase: "background-approved", backgroundType: "reusable-location", reusableScenes: ["双规则", "羽毛抽屉", "宿管日记"], plannedReuseNodes: ["namefloor_manager_room", "namefloor_feather_drawer", "namefloor_torn_diary"] }),
      asset("bg_floor4_corridor", "background", "backgrounds/bg_floor4_corridor.png", "无名四楼走廊净版：复制楼层的冷白灯、重复门与不可能纵深。", { sceneId: "floor4_corridor", transparent: false, phase: "background-approved", backgroundType: "reusable-location", reusableScenes: ["不存在的四楼", "不同年代的门", "身份验证"], plannedReuseNodes: ["namefloor_endless_floor", "namefloor_era_doors", "namefloor_two_linfengs"] }),
      asset("bg_principal_office", "background", "backgrounds/bg_principal_office.png", "校长室档案净版：高档案柜、桌面与无字散页。", { sceneId: "principal_office", transparent: false, phase: "background-approved", backgroundType: "reusable-location", reusableScenes: ["自动名册", "双林峰", "出口坍塌"], plannedReuseNodes: ["namefloor_fixed_count_archives", "namefloor_final_two_lins", "namefloor_exit_threshold"] }),
      asset("ending_e1_remember_return_dorm", "ending-key-art", "endings/ending_e1_remember_return_dorm.png", "E1《记得回宿舍》：四名男性学生在清晨离开宿舍、走向早餐店的独立关键图。", { endingId: "E1", transparent: false, phase: "ending-approved", backgroundType: "ending-tableau", reusableScenes: ["E1 独立结局画面"], plannedReuseNodes: ["namefloor_ending_breakfast"] }),
    ],
  };
})();
