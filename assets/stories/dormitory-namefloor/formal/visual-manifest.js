(function () {
  "use strict";

  const root = "assets/stories/dormitory-namefloor/formal";
  const asset = (id, assetType, path, descriptionZh, extra = {}) => ({
    id,
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
    version: "dormitory-namefloor-formal/v1-phase1",
    phase: "phase-1",
    generation: {
      model: "gpt-image-2",
      referenceImagesUsed: false,
      playerVisibleTextPolicy: "phone-and-document-text-remain-html-css",
      runtimeIntegration: "not-runtime-integrated",
    },
    assets: [
      asset("char_linfeng_master_upper_neutral", "character-master", "characters/char_linfeng_master_upper_neutral.png", "林峰：灰色旧短袖、黑色运动短裤的大学男生中性上半身母版。", { characterId: "linfeng", gender: "male", transparent: true, phase: "master-approved", masterType: "upper-neutral", reusableScenes: ["1107手机冷光", "四楼身份验证", "校长室"], plannedReuseNodes: ["namefloor_phone_glow", "namefloor_two_linfengs", "namefloor_final_two_lins"] }),
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
