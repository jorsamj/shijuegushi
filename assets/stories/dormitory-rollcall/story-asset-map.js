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
      "许棠": { id: "xutang", name: "许棠", image: `${A}/characters/char_xutang_base.png`, variants: { base: `${A}/characters/char_xutang_base.png` } },
      "林穗": { id: "linsui", name: "林穗", image: `${A}/characters/char_linsui_base.png`, variants: { base: `${A}/characters/char_linsui_base.png` } },
      "赵晴": { id: "zhaoqing", name: "赵晴", image: `${A}/characters/char_zhaoqing_base.png`, variants: { base: `${A}/characters/char_zhaoqing_base.png` } },
      "陈露": { id: "chenlu", name: "陈露", image: `${A}/characters/char_chenlu_base.png`, variants: { base: `${A}/characters/char_chenlu_base.png` } },
      "沈妍": { id: "shenyan", name: "沈妍", image: `${A}/characters/char_shenyan_base.png`, variants: { base: `${A}/characters/char_shenyan_base.png` } },
      "吴阿姨": { id: "manager-wu", name: "吴阿姨", image: `${A}/characters/char_manager_wu_base.png`, variants: { base: `${A}/characters/char_manager_wu_base.png` } },
      "周婉宁": { id: "zhouwanning", name: "周婉宁", image: `${A}/characters/char_zhouwanning_memory.png`, variants: { memory: `${A}/characters/char_zhouwanning_memory.png` } },
      narrator: { id: "narrator", name: "旁白", image: "" },
    },
    characterAliases: {
      "许棠": "许棠",
      "林穗": "林穗",
      "赵晴": "赵晴",
      "陈露": "陈露",
      "沈妍": "沈妍",
      "吴阿姨": "吴阿姨",
      "周婉宁": "周婉宁",
      "旁白": "narrator",
      "宿舍广播": "narrator",
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
      dorm_ending_true_dawn: `${A}/backgrounds/bg_dorm_outside_dawn.png`,
      dorm_ending_linsui_door: `${A}/backgrounds/bg_dorm_stairwell.png`,
      dorm_ending_left_behind: `${A}/backgrounds/bg_dorm_stairwell.png`,
      dorm_ending_legal_count: `${A}/backgrounds/bg_dorm_ending_archive.png`,
      dorm_ending_second_xutang: `${A}/backgrounds/bg_dorm_outside_dawn.png`,
      dorm_ending_three_online: `${A}/backgrounds/bg_dorm_outside_dawn.png`,
      dorm_ending_east_passage: `${A}/backgrounds/bg_dorm_stairwell.png`,
      dorm_ending_broken_broadcast: `${A}/backgrounds/bg_dorm_broadcast_room.png`,
      sharedArchive: `${A}/backgrounds/bg_dorm_ending_archive.png`,
      dawn: `${A}/backgrounds/bg_dorm_outside_dawn.png`,
    },
  };
})();
