(function () {
  "use strict";

  const A = "assets/stories/dormitory-rollcall";

  // This map is deliberately self-contained. The shared engine will select it by scriptId.
  window.DORMITORY_ROLLCALL_ASSET_MAP = {
    scriptId: "script_dormitory_rollcall",
    backgroundAliases: {
      dorm_417_night: "dorm_417_night",
      dorm_floor4_corridor: "floor4_corridor",
      dorm_washroom_mirror: "washroom_mirror",
      dorm_stairwell: "stairwell",
      dorm_manager_office: "manager_office",
      dorm_broadcast_room: "broadcast_room",
      dorm_fire_memory_2014: "fire_memory_2014",
      dorm_outside_dawn: "outside_dawn",
      dorm_ending_archive: "ending_archive",
    },
    scenes: {
      dorm_417_night: { bg: `${A}/backgrounds/bg_dorm_417_night.png`, focus: "center" },
      dorm_floor4_corridor: { bg: `${A}/backgrounds/bg_dorm_floor4_corridor.png`, focus: "center" },
      dorm_washroom_mirror: { bg: `${A}/backgrounds/bg_dorm_washroom_mirror.png`, focus: "center" },
      dorm_stairwell: { bg: `${A}/backgrounds/bg_dorm_stairwell.png`, focus: "center" },
      dorm_manager_office: { bg: `${A}/backgrounds/bg_dorm_manager_office.png`, focus: "center" },
      dorm_broadcast_room: { bg: `${A}/backgrounds/bg_dorm_broadcast_room.png`, focus: "center" },
      dorm_fire_memory_2014: { bg: `${A}/backgrounds/bg_dorm_2014_fire_memory.png`, focus: "center" },
      dorm_outside_dawn: { bg: `${A}/backgrounds/bg_dorm_outside_dawn.png`, focus: "center" },
      dorm_ending_archive: { bg: `${A}/backgrounds/bg_dorm_ending_archive.png`, focus: "center" },
    },
    characters: {
      "Xu Tang": { id: "xutang", name: "Xu Tang", image: `${A}/characters/char_xutang_base.png`, variants: { base: `${A}/characters/char_xutang_base.png` } },
      "Lin Sui": { id: "linsui", name: "Lin Sui", image: `${A}/characters/char_linsui_base.png`, variants: { base: `${A}/characters/char_linsui_base.png` } },
      "Zhao Qing": { id: "zhaoqing", name: "Zhao Qing", image: `${A}/characters/char_zhaoqing_base.png`, variants: { base: `${A}/characters/char_zhaoqing_base.png` } },
      "Chen Lu": { id: "chenlu", name: "Chen Lu", image: `${A}/characters/char_chenlu_base.png`, variants: { base: `${A}/characters/char_chenlu_base.png` } },
      "Shen Yan": { id: "shenyan", name: "Shen Yan", image: `${A}/characters/char_shenyan_base.png`, variants: { base: `${A}/characters/char_shenyan_base.png` } },
      "Manager Wu": { id: "manager-wu", name: "Manager Wu", image: `${A}/characters/char_manager_wu_base.png`, variants: { base: `${A}/characters/char_manager_wu_base.png` } },
      "Zhou Wanning": { id: "zhouwanning", name: "Zhou Wanning", image: `${A}/characters/char_zhouwanning_memory.png`, variants: { memory: `${A}/characters/char_zhouwanning_memory.png` } },
      narrator: { id: "narrator", name: "Narrator", image: "" },
    },
    characterAliases: {
      "许棠": "Xu Tang",
      "林穗": "Lin Sui",
      "赵晴": "Zhao Qing",
      "陈露": "Chen Lu",
      "沈妍": "Shen Yan",
      "吴阿姨": "Manager Wu",
      "周婉宁": "Zhou Wanning",
      "旁白": "narrator",
      "广播": "narrator",
    },
    audio: {
      scenes: {
        dorm_417_night: { bgm: "dormitory_room_air" },
        dorm_floor4_corridor: { bgm: "dormitory_corridor_air" },
        dorm_washroom_mirror: { bgm: "dormitory_room_air" },
        dorm_stairwell: { bgm: "dormitory_corridor_air" },
        dorm_manager_office: { bgm: "dormitory_archive_air" },
        dorm_broadcast_room: { bgm: "dormitory_broadcast_air" },
        dorm_fire_memory_2014: { bgm: "dormitory_archive_air" },
        dorm_outside_dawn: { bgm: "dormitory_archive_air" },
        dorm_ending_archive: { bgm: "dormitory_broadcast_air" },
      },
    },
    clues: {
      dorm_clue_broadcast_recording: { image: `${A}/clues/clue_broadcast_recording.png` },
      dorm_clue_417_roster: { image: `${A}/clues/clue_417_roster.png` },
      dorm_clue_pre_blackout_video: { image: `${A}/clues/clue_pre_blackout_video.png` },
      dorm_clue_mirror_name: { image: `${A}/clues/clue_mirror_name.png` },
      dorm_clue_2014_fire_record: { image: `${A}/clues/clue_2014_fire_record.png` },
      dorm_clue_handwritten_rule: { image: `${A}/clues/clue_handwritten_rule.png` },
    },
    covers: {
      story: `${A}/covers/cover_dormitory_rollcall.png`,
    },
    endings: {
      dorm_ending_a: `${A}/backgrounds/bg_dorm_outside_dawn.png`,
      dorm_ending_b: `${A}/backgrounds/bg_dorm_417_night.png`,
      dorm_ending_c: `${A}/backgrounds/bg_dorm_2014_fire_memory.png`,
      dorm_ending_d: `${A}/backgrounds/bg_dorm_ending_archive.png`,
      sharedArchive: `${A}/backgrounds/bg_dorm_ending_archive.png`,
      dawn: `${A}/backgrounds/bg_dorm_outside_dawn.png`,
    },
  };
})();
