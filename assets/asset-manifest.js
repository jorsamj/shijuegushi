(function () {
  "use strict";

  const A = "assets";
  const audio = (id, category, path, fields = {}) => ({
    id,
    type: "audio",
    category,
    path,
    reusable: fields.reusable ?? true,
    scope: fields.scope || "library",
    genre: fields.genre || ["suspense", "urban"],
    mood: fields.mood || ["tense", "quiet"],
    usage: fields.usage || [category],
    description: fields.description || id,
    source: "procedural",
    license: "project-generated",
    status: fields.status || "demo-usable",
  });

  const image = (id, category, path, fields = {}) => ({
    id,
    type: "image",
    category,
    path,
    reusable: fields.reusable ?? true,
    scope: fields.scope || "library",
    genre: fields.genre || ["suspense", "urban"],
    mood: fields.mood || ["tense"],
    usage: fields.usage || [category],
    description: fields.description || id,
    semanticQa: fields.semanticQa,
    source: fields.source || "image2-generated",
    license: fields.license || "project-generated",
    status: fields.status || "demo-usable",
  });

  window.SECOND_LIFE_ASSET_MANIFEST = {
    audio: {
      bgm_dark_rain_room_loop: audio("bgm_dark_rain_room_loop", "bgm", `${A}/audio/generated/bgm/bgm_rain_night_loop.wav`, {
        mood: ["rain", "low-frequency", "suspense"],
        usage: ["rain_room", "night_interior", "suspense_background"],
        description: "Low, restrained rainy-room suspense bed for urban night scenes.",
      }),
      bgm_tension_corridor_loop: audio("bgm_tension_corridor_loop", "bgm", `${A}/audio/generated/bgm/bgm_horror_corridor.wav`, {
        mood: ["corridor", "pressure", "cold"],
        usage: ["corridor", "door_scene", "pressure_background"],
        description: "Cold corridor tension bed for old-apartment pressure scenes.",
      }),
      bgm_archive_low_loop: audio("bgm_archive_low_loop", "bgm", `${A}/audio/generated/bgm/bgm_ending_archive.wav`, {
        mood: ["archive", "regret", "low"],
        usage: ["ending", "report", "case_archive"],
        description: "Restrained low archive bed for ending and report pages.",
      }),
      amb_rain_heavy_loop: audio("amb_rain_heavy_loop", "ambience", `${A}/audio/generated/ambience/amb_rain_heavy_loop.wav`, {
        mood: ["rain", "soft", "cold"],
        usage: ["rain_scene", "window", "night"],
        description: "Soft heavy rain ambience for rainy urban interiors.",
      }),
      amb_room_night_low_loop: audio("amb_room_night_low_loop", "ambience", `${A}/audio/generated/ambience/amb_room_night_loop.wav`, {
        mood: ["room", "quiet", "late-night"],
        usage: ["interior", "quiet_room"],
        description: "Very quiet room-night bed that should stay barely perceptible.",
      }),
      amb_corridor_old_hum_loop: audio("amb_corridor_old_hum_loop", "ambience", `${A}/audio/generated/ambience/amb_corridor_hum.wav`, {
        mood: ["old-building", "low-hum", "cold"],
        usage: ["corridor", "old_apartment"],
        description: "Low old-building corridor hum without harsh noise.",
      }),
      phone_vibrate_table_short: audio("phone_vibrate_table_short", "sfx", `${A}/audio/generated/sfx/sfx_phone_vibrate.wav`, {
        usage: ["phone", "table", "incoming_call"],
        description: "Muted phone vibration on a tabletop.",
      }),
      phone_ring_dark_call: audio("phone_ring_dark_call", "sfx", `${A}/audio/generated/sfx/sfx_phone_ring_dead_call.wav`, {
        usage: ["phone", "incoming_call", "suspense_hook"],
        description: "Cold dark phone ring for disturbing calls.",
      }),
      message_notification_cold_soft: audio("message_notification_cold_soft", "sfx", `${A}/audio/generated/sfx/sfx_message_pop_cold.wav`, {
        usage: ["message", "notification"],
        description: "Short cold notification that avoids bright system tones.",
      }),
      doorbell_apartment_dark: audio("doorbell_apartment_dark", "sfx", `${A}/audio/generated/sfx/sfx_doorbell_rain_night.wav`, {
        usage: ["doorbell", "apartment", "night_visitor"],
        description: "Muted apartment doorbell for a rainy-night visitor.",
      }),
      door_knock_wood_soft: audio("door_knock_wood_soft", "sfx", `${A}/audio/generated/sfx/sfx_knock_soft.wav`, {
        usage: ["door", "visitor", "wood_knock"],
        description: "Soft realistic wooden-door knock with room resonance.",
      }),
      door_chain_metal_close: audio("door_chain_metal_close", "sfx", `${A}/audio/generated/sfx/sfx_door_chain_close.wav`, {
        usage: ["door_chain", "lock", "metal"],
        description: "Short metal chain close sound.",
      }),
      door_lock_metal_turn: audio("door_lock_metal_turn", "sfx", `${A}/audio/generated/sfx/sfx_door_lock_turn.wav`, {
        usage: ["door_lock", "key", "metal"],
        description: "Muted metal lock turning sound.",
      }),
      door_open_wood_slow: audio("door_open_wood_slow", "sfx", `${A}/audio/generated/sfx/sfx_door_open_slow.wav`, {
        usage: ["door", "open", "slow"],
        description: "Slow restrained wooden-door open sound.",
      }),
      footstep_wet_corridor_short: audio("footstep_wet_corridor_short", "sfx", `${A}/audio/generated/sfx/sfx_footstep_corridor_wet.wav`, {
        usage: ["footstep", "wet", "corridor"],
        description: "Short wet shoe steps in a corridor.",
      }),
      light_flicker_corridor_short: audio("light_flicker_corridor_short", "sfx", `${A}/audio/generated/sfx/sfx_corridor_light_flicker.wav`, {
        usage: ["corridor_light", "flicker"],
        description: "Short restrained old corridor light flicker.",
      }),
      old_device_power_on_soft: audio("old_device_power_on_soft", "sfx", `${A}/audio/generated/sfx/sfx_old_phone_start.wav`, {
        usage: ["old_phone", "device_start"],
        description: "Old device startup texture without sci-fi brightness.",
      }),
      recording_static_soft_cut: audio("recording_static_soft_cut", "sfx", `${A}/audio/generated/sfx/sfx_recording_static_short.wav`, {
        usage: ["recording", "old_audio", "static"],
        description: "Short low-volume recording static.",
      }),
      photo_zoom_inspect_soft: audio("photo_zoom_inspect_soft", "sfx", `${A}/audio/generated/sfx/sfx_photo_zoom.wav`, {
        usage: ["photo", "inspect", "zoom"],
        description: "Soft photo inspection cue.",
      }),
      marker_circle_paper_soft: audio("marker_circle_paper_soft", "sfx", `${A}/audio/generated/sfx/sfx_marker_circle.wav`, {
        usage: ["evidence", "marker", "paper"],
        description: "Soft paper marker circle cue.",
      }),
      ui_choice_confirm_soft: audio("ui_choice_confirm_soft", "sfx", `${A}/audio/generated/sfx/sfx_choice_confirm_soft.wav`, {
        usage: ["choice", "ui_confirm"],
        description: "Very soft choice confirmation tick.",
      }),
      evidence_reveal_dark: audio("evidence_reveal_dark", "sfx", `${A}/audio/generated/sfx/sfx_evidence_reveal.wav`, {
        usage: ["evidence", "clue", "case"],
        description: "Low, restrained evidence reveal cue.",
      }),
      archive_stamp_low: audio("archive_stamp_low", "sfx", `${A}/audio/generated/sfx/sfx_archive_stamp.wav`, {
        usage: ["archive", "ending", "report"],
        description: "Low archive stamp confirmation.",
      }),
      room_silence_drop_low: audio("room_silence_drop_low", "sfx", `${A}/audio/generated/sfx/sfx_room_silence_drop.wav`, {
        usage: ["shock", "pressure", "silence"],
        description: "Short low pressure drop for sudden realization.",
      }),
      male_gasp_short_tense: audio("male_gasp_short_tense", "stinger", `${A}/audio/generated/stingers/linzhou_gasp_short.wav`, {
        usage: ["character_reaction", "fear"],
        description: "Short tense male gasp prototype.",
      }),
      female_low_breath_cold: audio("female_low_breath_cold", "stinger", `${A}/audio/generated/stingers/xuzhiwan_low_breath.wav`, {
        usage: ["character_reaction", "door_scene"],
        description: "Cold low female breath prototype.",
      }),
      male_phone_silence_pressure: audio("male_phone_silence_pressure", "stinger", `${A}/audio/generated/stingers/zhouyu_phone_silence.wav`, {
        usage: ["phone", "pressure", "character_reaction"],
        description: "Phone-side pressure silence and breath.",
      }),
      female_weak_static_exhale: audio("female_weak_static_exhale", "stinger", `${A}/audio/generated/stingers/xuzhixia_weak_static_exhale.wav`, {
        usage: ["old_recording", "memory", "character_reaction"],
        description: "Weak static exhale for old-recording memory scenes.",
      }),
    },
    backgrounds: {
      bg_rental_room_rain_night: image("bg_rental_room_rain_night", "background", `${A}/bg/bg_rental_room_rain_night.webp`, {
        usage: ["rental_room", "rain_night", "urban_interior"],
        description: "Rainy rental-room background reusable for urban suspense interiors.",
      }),
      bg_apartment_corridor_night_tense: image("bg_apartment_corridor_night_tense", "background", `${A}/bg/bg_corridor_door.webp`, {
        usage: ["corridor", "door", "peephole"],
        description: "Old apartment corridor / door background for tense visitor scenes.",
      }),
      bg_phone_call_dark_ui: image("bg_phone_call_dark_ui", "background", `${A}/bg/bg_phone_call_ui.webp`, {
        usage: ["phone_call", "dark_ui"],
        description: "Dark phone-call scene background reusable for call-based suspense.",
      }),
      bg_old_chat_memory: image("bg_old_chat_memory", "background", `${A}/bg/bg_old_chat_memory.webp`, {
        usage: ["chat", "memory", "digital_record"],
        description: "Old chat memory background for digital evidence scenes.",
      }),
      bg_rental_room_table_archive: image("bg_rental_room_table_archive", "background", `${A}/bg/bg_rental_room_table.webp`, {
        usage: ["table", "old_objects", "evidence_search"],
        description: "Tabletop old-object search background.",
      }),
      bg_photo_zoom_evidence: image("bg_photo_zoom_evidence", "background", `${A}/bg/bg_photo_zoom_view.webp`, {
        usage: ["photo", "evidence", "inspection"],
        description: "Photo inspection background reusable for evidence zoom scenes.",
      }),
      bg_old_phone_closeup: image("bg_old_phone_closeup", "background", `${A}/bg/bg_old_phone_view.webp`, {
        usage: ["old_phone", "recording", "device"],
        description: "Old phone closeup background for device and recording scenes.",
      }),
      bg_archive_ending_dark: image("bg_archive_ending_dark", "background", `${A}/bg/bg_ending_screen.webp`, {
        usage: ["ending", "archive", "report"],
        description: "Dark archive ending background.",
      }),
    },
    props: {
      prop_old_phone_cracked: image("prop_old_phone_cracked", "prop", `${A}/props/prop_phone_old_cracked.webp`, {
        usage: ["old_phone", "recording", "evidence"],
        description: "Cracked old phone prop reusable for old-device evidence.",
      }),
      prop_polaroid_old_photo: image("prop_polaroid_old_photo", "prop", `${A}/props/prop_photo_polaroid.webp`, {
        usage: ["photo", "group-photo", "memory", "evidence"],
        description: "Old group-photo / polaroid evidence prop with marked background silhouette.",
        semanticQa: "manual-confirmed: last group photo, background shadow, evidence marker",
        status: "final-candidate",
      }),
      prop_recording_file: image("prop_recording_file", "prop", `${A}/props/prop_recording_file.webp`, {
        usage: ["recording", "file", "evidence"],
        description: "Recording file prop.",
      }),
      prop_archive_folder: image("prop_archive_folder", "prop", `${A}/props/prop_archive_folder.webp`, {
        usage: ["archive", "case_file"],
        description: "Archive folder prop for story files and endings.",
      }),
      prop_door_chain: image("prop_door_chain", "prop", `${A}/props/prop_door_chain.webp`, {
        usage: ["door", "chain", "lock"],
        description: "Door chain prop reusable for apartment door scenes.",
      }),
    },
    clues: {
      clue_photo_background_evidence: image("clue_photo_background_evidence", "clue", `${A}/clues/clue_photo_background.webp`, {
        usage: ["photo", "background_shadow", "deduction", "evidence_chain"],
        description: "Photo-background clue image showing a marked suspicious silhouette and position conflict.",
        semanticQa: "manual-confirmed: suspicious figure, red marker, position contradiction",
        status: "final-candidate",
      }),
    },
    characters: {
      char_xuzhiwan_wet_story: image("char_xuzhiwan_wet_story", "character", `${A}/characters/char_xuzhiwan_wet.webp`, {
        reusable: false,
        scope: "story:rain-call",
        character: "xuzhiwan",
        status: "story-only",
        description: "Xu Zhiwan wet entrance character art, story-specific.",
      }),
      char_zhouyu_pressure_story: image("char_zhouyu_pressure_story", "character", `${A}/characters/char_zhouyu_pressure.webp`, {
        reusable: false,
        scope: "story:rain-call",
        character: "zhouyu",
        status: "story-only",
        description: "Zhou Yu pressure character art, story-specific.",
      }),
      char_xuzhixia_recording_story: image("char_xuzhixia_recording_story", "character", `${A}/characters/char_xuzhixia_recording.webp`, {
        reusable: false,
        scope: "story:rain-call",
        character: "xuzhixia",
        status: "story-only",
        description: "Xu Zhixia old-recording character image, story-specific.",
      }),
    },
    propsStatus: {},
    ui: {},
  };
})();
