(function () {
  "use strict";

  window.DORMITORY_NAMEFLOOR_ASSET_MAP = {
    version: "chapter1-vertical-slice-v1",
    covers: { story: "" },
    scenes: {
      namefloor_dorm_midnight: { title: "午夜十一楼男生宿舍", cssClass: "nf-scene-dorm-midnight", focus: "room" },
      namefloor_phone_glow: { title: "手机光下的宿舍", cssClass: "nf-scene-phone-glow", focus: "phone" },
      namefloor_dorm_door: { title: "1107宿舍门内侧", cssClass: "nf-scene-dorm-door", focus: "door" },
      namefloor_peephole: { title: "猫眼中的十一楼走廊", cssClass: "nf-scene-peephole", focus: "peephole" },
      namefloor_corridor_attack: { title: "隔壁宿舍门口", cssClass: "nf-scene-corridor-attack", focus: "corridor" },
      namefloor_red_inspection: { title: "红色马甲查房", cssClass: "nf-scene-red-inspection", focus: "door" },
      namefloor_stairwell: { title: "失焦的楼梯间", cssClass: "nf-scene-stairwell", focus: "stairs" },
      namefloor_floor_four: { title: "不存在的四楼", cssClass: "nf-scene-floor-four", focus: "sign" },
    },
    characters: {
      林峰: { id: "linfeng", name: "林峰", role: "1107宿舍学生", sampleStyle: "linfeng" },
      周朝阳: { id: "zhouchaoyang", name: "周朝阳", role: "冷静的规则观察者", sampleStyle: "zhouchaoyang" },
      谷雨: { id: "guyu", name: "谷雨", role: "敏感而重感情的舍友", sampleStyle: "guyu" },
      宋明: { id: "songming", name: "宋明", role: "午夜离开宿舍的舍友", sampleStyle: "songming" },
      红色马甲宿管: { id: "red_manager", name: "红色马甲宿管", role: "不应对话的查房者", sampleStyle: "red-manager" },
      旁白: { id: "narrator", name: "旁白", role: "静音叙事" },
    },
    characterAliases: {
      "门外的宋明": "宋明",
      "门外女声": "红色马甲宿管",
      "查房者": "红色马甲宿管",
    },
    clues: {},
    chapters: {},
    props: {},
    audio: {
      scenes: {
        namefloor_dorm_midnight: { bgm: "dormitory_room_air" },
        namefloor_phone_glow: { bgm: "dormitory_room_air" },
        namefloor_dorm_door: { bgm: "dormitory_room_air" },
        namefloor_peephole: { bgm: "dormitory_corridor_air" },
        namefloor_corridor_attack: { bgm: "dormitory_corridor_air" },
        namefloor_red_inspection: { bgm: "dormitory_corridor_air" },
        namefloor_stairwell: { bgm: "dormitory_corridor_air" },
        namefloor_floor_four: { bgm: "dormitory_corridor_air" },
      },
    },
    endings: {},
  };
})();
