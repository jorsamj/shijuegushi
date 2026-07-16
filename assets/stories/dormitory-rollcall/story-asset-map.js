(function () {
  "use strict";

  const A = "assets/stories/dormitory-rollcall";
  const backgroundPath = (fileName) => `${A}/backgrounds-v2/${fileName}`;
  const characterPath = (characterId, variant) => `${A}/characters-v2/char_${characterId}_${variant}.webp`;
  const phonePath = (fileName) => `${A}/phone-v2/${fileName}`;
  const effectPath = (fileName) => `${A}/effects-v2/${fileName}`;
  const endingPath = (fileName) => `${A}/endings-v2/${fileName}`;

  // The current runtime coerces ending values to strings, while the v2 gate reads
  // the structured image field. This reference intentionally supports both APIs.
  function endingReference(image) {
    return {
      image,
      toString() { return image; },
      [Symbol.toPrimitive]() { return image; },
    };
  }

  const continuity = {
    xutang: {
      face: "oval face, straight brows, narrow double eyelids",
      hair: "black shoulder-length straight hair, center-right part",
      wardrobe: "white sleep shirt under a dark green campus jacket",
    },
    linsui: {
      face: "soft square face, low straight brows, mole below left eye",
      hair: "black collarbone-length hair with blunt fringe",
      wardrobe: "pale blue hoodie over grey dormitory clothes",
    },
    zhaoqing: {
      face: "angular face, high brows, defined cheekbones",
      hair: "high black ponytail with loose temple strands",
      wardrobe: "red varsity jacket over a black T-shirt",
    },
    chenlu: {
      face: "round face, wide-set eyes, shallow right cheek dimple",
      hair: "short black bob tucked behind the right ear",
      wardrobe: "cream knit cardigan over a striped sleep top",
    },
    shenyan: {
      face: "long face, hooded eyes, thin lips",
      hair: "long black hair tied in a low loose braid",
      wardrobe: "charcoal zip hoodie over a muted lavender shirt",
    },
    manager_wu: {
      face: "broad face, arched brows, faint smile lines",
      hair: "short dark hair with grey temples",
      wardrobe: "navy duty cardigan, checked shirt, brass key ring",
    },
    zhouwanning: {
      face: "heart-shaped face, straight brows, small scar at right jaw",
      hair: "long black hair in a low 2014-era ponytail",
      wardrobe: "faded white campus blouse and dark track trousers",
    },
  };

  function character(id, name, baseVariant, variantKeys) {
    return {
      id,
      name,
      image: characterPath(id, baseVariant),
      continuity: continuity[id],
      variants: Object.fromEntries(variantKeys.map((variant) => [variant, characterPath(id, variant)])),
    };
  }

  const canonicalCharacters = {
    xutang: character("xutang", "许棠", "base", ["base", "alert", "fear", "exhausted", "determined"]),
    linsui: character("linsui", "林穗", "base", ["base", "fear", "grief", "exhausted", "mimic"]),
    zhaoqing: character("zhaoqing", "赵晴", "base", ["base", "alert", "injured", "determined"]),
    chenlu: character("chenlu", "陈露", "base", ["base", "fear", "mimic", "video_glitch"]),
    shenyan: character("shenyan", "沈妍", "base", ["base", "suspicious", "distressed"]),
    manager_wu: character("manager_wu", "吴阿姨", "base", ["base", "serious", "wounded"]),
    zhouwanning: character("zhouwanning", "周婉宁", "memory", ["memory", "warning", "restored"]),
  };

  const scenes = {
    dorm_417_normal: { bg: backgroundPath("bg_dorm_417_normal.webp"), focus: "center" },
    dorm_417_lights_out: { bg: backgroundPath("bg_dorm_417_lights_out.webp"), focus: "center" },
    dorm_417_blackout: { bg: backgroundPath("bg_dorm_417_blackout.webp"), focus: "center" },
    dorm_415_room: { bg: backgroundPath("bg_dorm_415_room.webp"), focus: "center" },
    dorm_419_room: { bg: backgroundPath("bg_dorm_419_room.webp"), focus: "center" },
    dorm_floor4_corridor: { bg: backgroundPath("bg_dorm_floor4_corridor.webp"), focus: "center" },
    dorm_floor4_red: { bg: backgroundPath("bg_dorm_floor4_red.webp"), focus: "center" },
    dorm_corridor_peephole: { bg: backgroundPath("bg_dorm_corridor_peephole.webp"), focus: "center" },
    dorm_door_blood: { bg: backgroundPath("bg_dorm_door_blood.webp"), focus: "center" },
    dorm_stairwell: { bg: backgroundPath("bg_dorm_stairwell.webp"), focus: "center" },
    dorm_east_passage: { bg: backgroundPath("bg_dorm_east_passage.webp"), focus: "center" },
    dorm_west_stairs: { bg: backgroundPath("bg_dorm_west_stairs.webp"), focus: "center" },
    dorm_manager_office: { bg: backgroundPath("bg_dorm_manager_office.webp"), focus: "center" },
    dorm_broadcast_room: { bg: backgroundPath("bg_dorm_broadcast_room.webp"), focus: "center" },
    dorm_exit_gate: { bg: backgroundPath("bg_dorm_exit_gate.webp"), focus: "center" },
    dorm_outside_dawn: { bg: backgroundPath("bg_dorm_outside_dawn.webp"), focus: "center" },
    dorm_fire_memory_2014: { bg: backgroundPath("bg_dorm_2014_fire_memory.webp"), focus: "center" },

    // Legacy scene keys remain resolvable while old saves and generic engine code migrate.
    dorm_417_night: { bg: backgroundPath("bg_dorm_417_normal.webp"), focus: "center" },
    dorm_washroom_mirror: { bg: `${A}/backgrounds/bg_dorm_washroom_mirror.png`, focus: "center" },
    dorm_ending_archive: { bg: `${A}/backgrounds/bg_dorm_ending_archive.png`, focus: "center" },
  };

  const phoneMedia = {
    dead_account_avatar: phonePath("phone_dead_account_avatar.webp"),
    room_415_video: phonePath("phone_room_415_video.webp"),
    chenlu_real_avatar: phonePath("phone_chenlu_real_avatar.webp"),
    chenlu_mimic_avatar: phonePath("phone_chenlu_mimic_avatar.webp"),
    chenlu_mirror_video: phonePath("phone_chenlu_mirror_video.webp"),
    shenyan_avatar: phonePath("phone_shenyan_avatar.webp"),
    mother_call_preview: phonePath("phone_mother_call_preview.webp"),
    linsui_sister_avatar: phonePath("phone_linsui_sister_avatar.webp"),
    manager_wu_avatar: phonePath("phone_manager_wu_avatar.webp"),
    record_2014_thumbnail: phonePath("phone_record_2014_thumbnail.webp"),
    broadcast_waveform_true: phonePath("phone_broadcast_waveform_true.webp"),
    broadcast_waveform_false: phonePath("phone_broadcast_waveform_false.webp"),
    route_east_preview: phonePath("phone_route_east_preview.webp"),
    route_west_preview: phonePath("phone_route_west_preview.webp"),
    gate_identity_scan: phonePath("phone_gate_identity_scan.webp"),
  };

  const effects = {
    lights_out_vignette: effectPath("fx_lights_out_vignette.webp"),
    blood_edge: effectPath("fx_blood_edge.webp"),
    peephole_distortion: effectPath("fx_peephole_distortion.webp"),
    signal_tear: effectPath("fx_signal_tear.webp"),
    shadow_misalignment: effectPath("fx_shadow_misalignment.webp"),
    double_exposure: effectPath("fx_double_exposure.webp"),
    drag_smear: effectPath("fx_drag_smear.webp"),
    gate_scan: effectPath("fx_gate_scan.webp"),
  };

  const endingImages = {
    dorm_ending_true_dawn: endingPath("ending_true_dawn.webp"),
    dorm_ending_linsui_door: endingPath("ending_linsui_door.webp"),
    dorm_ending_left_behind: endingPath("ending_left_behind.webp"),
    dorm_ending_legal_count: endingPath("ending_legal_count.webp"),
    dorm_ending_second_xutang: endingPath("ending_second_xutang.webp"),
    dorm_ending_three_online: endingPath("ending_three_online.webp"),
    dorm_ending_east_passage: endingPath("ending_east_passage.webp"),
    dorm_ending_broken_broadcast: endingPath("ending_broken_broadcast.webp"),
  };

  window.DORMITORY_ROLLCALL_ASSET_MAP = {
    scriptId: "script_dormitory_rollcall",
    assetSet: "dormitory-rework-v2",
    canvas: { width: 1080, height: 1920, aspectRatio: "9:16", orientation: "portrait" },
    backgroundAliases: {
      dorm_417_night: "dorm_417_normal",
      dorm_floor4_corridor: "dorm_floor4_corridor",
      dorm_washroom_mirror: "dorm_washroom_mirror",
      dorm_stairwell: "dorm_stairwell",
      dorm_manager_office: "dorm_manager_office",
      dorm_broadcast_room: "dorm_broadcast_room",
      dorm_fire_memory_2014: "dorm_fire_memory_2014",
      dorm_outside_dawn: "dorm_outside_dawn",
      dorm_ending_archive: "dorm_ending_archive",
    },
    scenes,
    characters: {
      ...canonicalCharacters,
      "许棠": canonicalCharacters.xutang,
      "林穗": canonicalCharacters.linsui,
      "赵晴": canonicalCharacters.zhaoqing,
      "陈露": canonicalCharacters.chenlu,
      "沈妍": canonicalCharacters.shenyan,
      "吴阿姨": canonicalCharacters.manager_wu,
      "周婉宁": canonicalCharacters.zhouwanning,
      narrator: { id: "narrator", name: "旁白", image: "", variants: {} },
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
    phoneMedia,
    phoneScreenMedia: {
      dorm_01_007: ["dead_account_avatar"],
      dorm_01_009: ["dead_account_avatar"],
      dorm_02_001: ["room_415_video"],
      dorm_02_010: ["chenlu_real_avatar", "chenlu_mimic_avatar"],
      dorm_03_001: ["chenlu_real_avatar", "chenlu_mimic_avatar"],
      dorm_03_003: ["chenlu_mirror_video"],
      dorm_03_006: ["shenyan_avatar"],
      dorm_03_010: ["mother_call_preview", "linsui_sister_avatar"],
      dorm_04_001: ["mother_call_preview"],
      dorm_04_002: ["mother_call_preview"],
      dorm_04_005: ["linsui_sister_avatar"],
      dorm_04_007: ["manager_wu_avatar"],
      dorm_04_010: ["record_2014_thumbnail"],
      dorm_05_001: ["broadcast_waveform_true", "broadcast_waveform_false"],
      dorm_05_003: ["route_east_preview"],
      dorm_05_006: ["record_2014_thumbnail"],
      dorm_06_007: ["route_east_preview", "route_west_preview"],
      dorm_06_008: ["gate_identity_scan"],
    },
    effects,
    audio: {
      scenes: Object.fromEntries(Object.keys(scenes).map((sceneId) => [sceneId, {
        bgm: ["dorm_manager_office", "dorm_fire_memory_2014"].includes(sceneId)
          ? "dormitory_archive_air"
          : sceneId === "dorm_broadcast_room"
            ? "dormitory_broadcast_air"
            : sceneId.includes("417") || sceneId.includes("415") || sceneId.includes("419")
              ? "dormitory_room_air"
              : "dormitory_corridor_air",
      }])),
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
      ...Object.fromEntries(Object.entries(endingImages).map(([endingId, image]) => [endingId, endingReference(image)])),
      sharedArchive: `${A}/backgrounds/bg_dorm_ending_archive.png`,
      dawn: endingImages.dorm_ending_true_dawn,
    },
    endingImages,
  };
})();
