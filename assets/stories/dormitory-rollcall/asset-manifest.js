(function () {
  "use strict";

  const A = "assets/stories/dormitory-rollcall";
  const DIMENSIONS = Object.freeze({ width: 1080, height: 1920 });
  const MOBILE_SAFE_ZONE = Object.freeze({
    x: 96,
    y: 128,
    width: 888,
    height: 1184,
    dialogueReservedFromY: 1376,
  });

  function productionAsset(assetId, relativePath, metadata = {}) {
    return {
      assetId,
      path: `${A}/${relativePath}`,
      dimensions: DIMENSIONS,
      orientation: "portrait",
      productionStatus: "candidate",
      source: "project-generated",
      visualQa: "pending",
      ...metadata,
    };
  }

  function background(sceneId, fileName, state, location) {
    return productionAsset(`dorm_bg_v2_${sceneId}`, `backgrounds-v2/${fileName}`, {
      type: "background",
      sceneId,
      state,
      location,
      transparent: false,
      mobileSafeZone: MOBILE_SAFE_ZONE,
    });
  }

  const continuityProfiles = {
    xutang: {
      face: "soft square face, straight brows, narrow double eyelids",
      hair: "black shoulder-length straight hair with a silver clip on the right",
      wardrobe: "pale blue zip hoodie over a white sleep shirt",
      build: "slim, average height",
      age: "19-year-old student",
    },
    linsui: {
      face: "heart-shaped face, soft brows, attentive eyes",
      hair: "short black bob with outward ends",
      wardrobe: "white cardigan over a charcoal dormitory shirt",
      build: "slender, slightly shorter than Xutang",
      age: "20-year-old student",
    },
    zhaoqing: {
      face: "angular face, rectangular glasses, focused eyes",
      hair: "chin-length black bob with a straight fringe",
      wardrobe: "olive zip hoodie over a dark dormitory shirt, black flashlight",
      build: "athletic, tall",
      age: "20-year-old student",
    },
    chenlu: {
      face: "soft oval face, wide-set eyes, beauty mark below the left eye",
      hair: "long wavy dark-brown hair",
      wardrobe: "burgundy cardigan over a black dormitory shirt, black phone",
      build: "petite",
      age: "19-year-old student",
    },
    shenyan: {
      face: "long oval face, downturned eyes, thin lips",
      hair: "shoulder-length black hair with a wispy fringe",
      wardrobe: "army-green sleep robe over a navy dormitory shirt",
      build: "lean, average height",
      age: "20-year-old student",
    },
    manager_wu: {
      face: "broad square face, tired eyes, faint smile lines",
      hair: "short grey-black curls",
      wardrobe: "navy duty cardigan, plain grey blouse, brass key ring",
      build: "stocky, medium height",
      age: "56-year-old dormitory manager",
    },
    zhouwanning: {
      face: "inverted-triangle face, tired almond eyes",
      hair: "long black hair in a low 2014-era ponytail",
      wardrobe: "light blue cardigan over a plain white campus shirt, old small phone",
      build: "slim, average height",
      age: "20-year-old student in the 2014 record",
    },
  };

  function characterVariant(characterId, variant, framing, anchors, stateDelta) {
    return productionAsset(
      `dorm_char_v2_${characterId}_${variant}`,
      `characters-v2/char_${characterId}_${variant}.webp`,
      {
        type: "character",
        characterId,
        variant,
        framing,
        transparent: true,
        mobileSafeZone: MOBILE_SAFE_ZONE,
        eyeAnchor: anchors.eye,
        faceAnchor: anchors.face,
        continuity: {
          profileId: characterId,
          ...continuityProfiles[characterId],
          stateDelta,
        },
      },
    );
  }

  const halfAnchors = { eye: { x: 0.5, y: 0.235 }, face: { x: 0.36, y: 0.13, width: 0.28, height: 0.25 } };
  const bustAnchors = { eye: { x: 0.5, y: 0.205 }, face: { x: 0.34, y: 0.09, width: 0.32, height: 0.29 } };
  const closeAnchors = { eye: { x: 0.5, y: 0.27 }, face: { x: 0.27, y: 0.105, width: 0.46, height: 0.41 } };

  const backgrounds = {
    dorm_417_normal: background("dorm_417_normal", "bg_dorm_417_normal.webp", "fluorescent-night", "room-417"),
    dorm_417_lights_out: background("dorm_417_lights_out", "bg_dorm_417_lights_out.webp", "lights-out", "room-417"),
    dorm_417_blackout: background("dorm_417_blackout", "bg_dorm_417_blackout.webp", "total-blackout", "room-417"),
    dorm_415_room: background("dorm_415_room", "bg_dorm_415_room.webp", "phone-lit-night", "room-415"),
    dorm_419_room: background("dorm_419_room", "bg_dorm_419_room.webp", "abandoned-night", "room-419"),
    dorm_floor4_corridor: background("dorm_floor4_corridor", "bg_dorm_floor4_corridor.webp", "fluorescent-night", "floor-4-corridor"),
    dorm_floor4_red: background("dorm_floor4_red", "bg_dorm_floor4_red.webp", "red-emergency", "floor-4-corridor"),
    dorm_corridor_peephole: background("dorm_corridor_peephole", "bg_dorm_corridor_peephole.webp", "peephole-view", "room-417-door"),
    dorm_door_blood: background("dorm_door_blood", "bg_dorm_door_blood.webp", "blood-under-door", "room-417-door"),
    dorm_stairwell: background("dorm_stairwell", "bg_dorm_stairwell.webp", "emergency-night", "central-stairwell"),
    dorm_east_passage: background("dorm_east_passage", "bg_dorm_east_passage.webp", "false-safe-route", "east-passage"),
    dorm_west_stairs: background("dorm_west_stairs", "bg_dorm_west_stairs.webp", "delayed-safe-route", "west-stairs"),
    dorm_manager_office: background("dorm_manager_office", "bg_dorm_manager_office.webp", "records-night", "floor-1-duty-office"),
    dorm_broadcast_room: background("dorm_broadcast_room", "bg_dorm_broadcast_room.webp", "broadcast-active", "broadcast-control-room"),
    dorm_exit_gate: background("dorm_exit_gate", "bg_dorm_exit_gate.webp", "identity-scan", "floor-1-exit-gate"),
    dorm_outside_dawn: background("dorm_outside_dawn", "bg_dorm_outside_dawn.webp", "blue-dawn", "dormitory-exterior"),
    dorm_fire_memory_2014: background("dorm_fire_memory_2014", "bg_dorm_2014_fire_memory.webp", "archival-fire-memory", "floor-4-corridor-2014"),
  };

  const characterVariants = {
    xutang_base: characterVariant("xutang", "base", "half", halfAnchors, "alert but controlled"),
    xutang_alert: characterVariant("xutang", "alert", "bust", bustAnchors, "eyes tracking a sound off-frame"),
    xutang_fear: characterVariant("xutang", "fear", "close", closeAnchors, "contained panic, damp skin"),
    xutang_exhausted: characterVariant("xutang", "exhausted", "half", halfAnchors, "sweat, disordered hair, tense shoulders"),
    xutang_determined: characterVariant("xutang", "determined", "bust", bustAnchors, "steady gaze, jaw set"),

    linsui_base: characterVariant("linsui", "base", "half", halfAnchors, "guarded neutral posture"),
    linsui_fear: characterVariant("linsui", "fear", "close", closeAnchors, "wet eyes, lips held tight"),
    linsui_grief: characterVariant("linsui", "grief", "bust", bustAnchors, "tear tracks, lowered chin"),
    linsui_exhausted: characterVariant("linsui", "exhausted", "half", halfAnchors, "dust on hoodie, uneven breathing"),
    linsui_mimic: characterVariant("linsui", "mimic", "close", closeAnchors, "mouth timing and reflected gaze subtly misaligned"),

    zhaoqing_base: characterVariant("zhaoqing", "base", "half", halfAnchors, "upright protective stance"),
    zhaoqing_alert: characterVariant("zhaoqing", "alert", "bust", bustAnchors, "focused gaze toward the door"),
    zhaoqing_injured: characterVariant("zhaoqing", "injured", "half", halfAnchors, "scraped forearm, weight shifted from one leg"),
    zhaoqing_determined: characterVariant("zhaoqing", "determined", "bust", bustAnchors, "resolved expression, shoulders squared"),

    chenlu_base: characterVariant("chenlu", "base", "half", halfAnchors, "uneasy neutral posture"),
    chenlu_fear: characterVariant("chenlu", "fear", "close", closeAnchors, "wide eyes, shallow breath"),
    chenlu_mimic: characterVariant("chenlu", "mimic", "close", closeAnchors, "lip movement and eye focus subtly desynchronized"),
    chenlu_video_glitch: characterVariant("chenlu", "video_glitch", "bust", bustAnchors, "mirror-direction inconsistency without baked interface text"),

    shenyan_base: characterVariant("shenyan", "base", "half", halfAnchors, "withdrawn posture"),
    shenyan_suspicious: characterVariant("shenyan", "suspicious", "bust", bustAnchors, "side gaze, tightly crossed arms"),
    shenyan_distressed: characterVariant("shenyan", "distressed", "close", closeAnchors, "frayed composure, braid loosened"),

    manager_wu_base: characterVariant("manager_wu", "base", "half", halfAnchors, "watchful, key ring visible"),
    manager_wu_serious: characterVariant("manager_wu", "serious", "bust", bustAnchors, "direct warning gaze"),
    manager_wu_wounded: characterVariant("manager_wu", "wounded", "half", halfAnchors, "minor forehead wound, keys still secured"),

    zhouwanning_memory: characterVariant("zhouwanning", "memory", "half", halfAnchors, "soft archival contrast, identity still clear"),
    zhouwanning_warning: characterVariant("zhouwanning", "warning", "bust", bustAnchors, "urgent gaze toward the west route"),
    zhouwanning_restored: characterVariant("zhouwanning", "restored", "close", closeAnchors, "clear record portrait, calm direct gaze"),
  };

  function phoneMedia(key, fileName, purpose) {
    return productionAsset(`dorm_phone_v2_${key}`, `phone-v2/${fileName}`, {
      type: "phone-media",
      mediaKey: key,
      purpose,
      transparent: false,
      bakedText: false,
      renderingContract: "media-only; shell, labels, messages, timestamps and status indicators are DOM",
    });
  }

  const phoneMediaAssets = {
    dead_account_avatar: phoneMedia("dead_account_avatar", "phone_dead_account_avatar.webp", "unknown-account avatar"),
    room_415_video: phoneMedia("room_415_video", "phone_room_415_video.webp", "415 verification video frame"),
    chenlu_real_avatar: phoneMedia("chenlu_real_avatar", "phone_chenlu_real_avatar.webp", "real Chenlu account avatar"),
    chenlu_mimic_avatar: phoneMedia("chenlu_mimic_avatar", "phone_chenlu_mimic_avatar.webp", "mimic Chenlu account avatar"),
    chenlu_mirror_video: phoneMedia("chenlu_mirror_video", "phone_chenlu_mirror_video.webp", "mirrored Chenlu video frame"),
    shenyan_avatar: phoneMedia("shenyan_avatar", "phone_shenyan_avatar.webp", "Shenyan private-contact avatar"),
    mother_call_preview: phoneMedia("mother_call_preview", "phone_mother_call_preview.webp", "mother mimic call preview"),
    linsui_sister_avatar: phoneMedia("linsui_sister_avatar", "phone_linsui_sister_avatar.webp", "sister mimic contact avatar"),
    manager_wu_avatar: phoneMedia("manager_wu_avatar", "phone_manager_wu_avatar.webp", "Manager Wu verified contact avatar"),
    record_2014_thumbnail: phoneMedia("record_2014_thumbnail", "phone_record_2014_thumbnail.webp", "2014 evidence thumbnail"),
    broadcast_waveform_true: phoneMedia("broadcast_waveform_true", "phone_broadcast_waveform_true.webp", "authentic broadcast waveform"),
    broadcast_waveform_false: phoneMedia("broadcast_waveform_false", "phone_broadcast_waveform_false.webp", "false broadcast waveform"),
    route_east_preview: phoneMedia("route_east_preview", "phone_route_east_preview.webp", "east passage camera preview"),
    route_west_preview: phoneMedia("route_west_preview", "phone_route_west_preview.webp", "west stair camera preview"),
    gate_identity_scan: phoneMedia("gate_identity_scan", "phone_gate_identity_scan.webp", "identity gate camera crop"),
  };

  function endingScene(endingId, fileName, composition) {
    return productionAsset(`dorm_ending_v2_${endingId}`, `endings-v2/${fileName}`, {
      type: "ending-scene",
      endingId,
      composition,
      transparent: false,
      mobileSafeZone: MOBILE_SAFE_ZONE,
    });
  }

  const endingScenes = {
    dorm_ending_true_dawn: endingScene("dorm_ending_true_dawn", "ending_true_dawn.webp", "verified survivors outside at dawn"),
    dorm_ending_linsui_door: endingScene("dorm_ending_linsui_door", "ending_linsui_door.webp", "Linsui behind a closing fire door"),
    dorm_ending_left_behind: endingScene("dorm_ending_left_behind", "ending_left_behind.webp", "real survivor isolated behind the gate"),
    dorm_ending_legal_count: endingScene("dorm_ending_legal_count", "ending_legal_count.webp", "four silhouettes pass while one shadow lags"),
    dorm_ending_second_xutang: endingScene("dorm_ending_second_xutang", "ending_second_xutang.webp", "two Xutang figures divided by the identity gate"),
    dorm_ending_three_online: endingScene("dorm_ending_three_online", "ending_three_online.webp", "two survivors at dawn with an unseen third presence"),
    dorm_ending_east_passage: endingScene("dorm_ending_east_passage", "ending_east_passage.webp", "sealed east passage after signal loss"),
    dorm_ending_broken_broadcast: endingScene("dorm_ending_broken_broadcast", "ending_broken_broadcast.webp", "destroyed broadcast room with open locks"),
  };

  function effect(key, fileName, transparent = true) {
    return productionAsset(`dorm_fx_v2_${key}`, `effects-v2/${fileName}`, {
      type: "effect",
      effectKey: key,
      transparent,
      mobileSafeZone: MOBILE_SAFE_ZONE,
    });
  }

  const effects = {
    lights_out_vignette: effect("lights_out_vignette", "fx_lights_out_vignette.webp"),
    blood_edge: effect("blood_edge", "fx_blood_edge.webp"),
    peephole_distortion: effect("peephole_distortion", "fx_peephole_distortion.webp"),
    signal_tear: effect("signal_tear", "fx_signal_tear.webp"),
    shadow_misalignment: effect("shadow_misalignment", "fx_shadow_misalignment.webp"),
    double_exposure: effect("double_exposure", "fx_double_exposure.webp"),
    drag_smear: effect("drag_smear", "fx_drag_smear.webp"),
    gate_scan: effect("gate_scan", "fx_gate_scan.webp"),
  };

  window.SECOND_LIFE_DORMITORY_ASSETS = {
    storyId: "script_dormitory_rollcall",
    status: "asset-production-in-progress",
    assetSet: "dormitory-rework-v2",
    productionSet: "dormitory-rework-v2",
    canvas: { width: 1080, height: 1920, aspectRatio: "9:16" },
    orientation: "portrait",
    mobileSafeZone: MOBILE_SAFE_ZONE,
    phoneRendering: {
      shell: "dom",
      text: "dom",
      statusIndicators: "dom",
      assetPolicy: "phone-v2 images contain media only and no player-visible text",
    },
    backgrounds,
    characterVariants,
    characters: characterVariants,
    phoneMedia: phoneMediaAssets,
    endingScenes,
    effects,
    clues: {
      broadcast_recording: { assetId: "dorm_clue_broadcast_recording", path: `${A}/clues/clue_broadcast_recording.png`, type: "clue", visualQa: "manual-confirmed" },
      roster_417: { assetId: "dorm_clue_417_roster", path: `${A}/clues/clue_417_roster.png`, type: "clue", visualQa: "manual-confirmed" },
      pre_blackout_video: { assetId: "dorm_clue_pre_blackout_video", path: `${A}/clues/clue_pre_blackout_video.png`, type: "clue", visualQa: "manual-confirmed" },
      mirror_name: { assetId: "dorm_clue_mirror_name", path: `${A}/clues/clue_mirror_name.png`, type: "clue", visualQa: "manual-confirmed" },
      fire_record_2014: { assetId: "dorm_clue_2014_fire_record", path: `${A}/clues/clue_2014_fire_record.png`, type: "clue", visualQa: "manual-confirmed" },
      handwritten_rule: { assetId: "dorm_clue_handwritten_rule", path: `${A}/clues/clue_handwritten_rule.png`, type: "clue", visualQa: "manual-confirmed" },
    },
    covers: {
      dormitory_rollcall: { assetId: "dorm_cover_rollcall", path: `${A}/covers/cover_dormitory_rollcall.png`, type: "cover", visualQa: "manual-confirmed" },
    },
  };
})();
