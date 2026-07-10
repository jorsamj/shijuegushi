(function () {
  "use strict";
  const reconstructed = "assets/library/audio/reconstructed";
  const exceptions = "assets/library/audio/exceptions";
  const taira = (id, storyKey, file, mixRole, loudnessNote, usage) => ({
    id, storyKey, path: `${reconstructed}/${file}`,
    sourceFamily: "Taira Komori", sourceSite: "Taira Komori / Free Sound Effects", sourceUrl: "https://taira-komori.jpn.org/", author: "Taira Komori",
    license: "Royalty-free site terms", attributionRequired: false, attributionText: "", commercialAllowed: true, redistributionAllowed: false,
    status: "demo-approved", qualityStatus: "approved", productionGrade: "demo", mixRole, loudnessNote, replacementNeeded: false, usage,
  });
  const exception = (id, storyKey, file, author, sourceUrl, license, allowedException, mixRole, loudnessNote, usage) => ({
    id, storyKey, path: `${exceptions}/${file}`,
    sourceFamily: "CC0 exception", sourceSite: "Approved public-domain / CC0 exception", sourceUrl, author, license,
    attributionRequired: false, attributionText: "", commercialAllowed: true, redistributionAllowed: true,
    status: "demo-approved", qualityStatus: "approved", productionGrade: "demo", mixRole, loudnessNote, replacementNeeded: false, allowedException, usage,
  });
  window.SECOND_LIFE_EXTERNAL_AUDIO = {
    meta: { version: "1.0.0", playbackPolicy: "library-plus-three-cc0-exceptions", sourcePolicy: "Taira Komori library only, plus public-domain rain, CC0 modern phone call/vibration, and CC0 message notification.", noSemanticSubstitution: true, forbidden: ["game01", "openclose01 (1)", "generated audio", "legacy fallback", "browser narration"] },
    bgm: {
      life_archive_theme: taira("bgm_life_archive_theme", "life_archive_theme", "horror_piano4.mp3", "life archive entry theme", "-33 LUFS target in runtime", "Sparse piano motif for the product entry, archive lobby, and story file only. It must fade before the first story cue."),
      urban_suspense_air: taira("bgm_urban_suspense_air", "urban_suspense_air", "in_dream.mp3", "restrained urban suspense air", "-35 LUFS target in runtime", "Slow, non-percussive urban suspense bed for the active investigation."),
      rain_night_loop: taira("bgm_rain_night", "rain_night_loop", "in_dream.mp3", "restrained rainy-room air", "-35 LUFS target in runtime", "Compatibility alias for quiet rainy-room investigation."),
      horror_corridor: taira("bgm_corridor", "horror_corridor", "in_dream.mp3", "restrained corridor air", "-36 LUFS target in runtime", "Compatibility alias for corridor pressure without rhythmic pulses."),
      ending_archive: taira("bgm_ending_archive", "ending_archive", "horror_piano4.mp3", "ending release bed", "-28 LUFS target in runtime", "Quiet ending archive only."),
    },
    ambience: {
      rain_heavy_loop: exception("ambience_rain_public_domain", "rain_heavy_loop", "ambience_rain_public_domain_cori_01.ogg", "cori", "https://commons.wikimedia.org/wiki/File:Rain_against_the_window.ogg", "Public domain", "rain", "rain exterior", "-30 LUFS target in runtime", "Rain explicitly present in text or image."),
    },
    sfx: {
      rain_window_soft: exception("sfx_rain_window_public_domain", "rain_window_soft", "ambience_rain_public_domain_cori_01.ogg", "cori", "https://commons.wikimedia.org/wiki/File:Rain_against_the_window.ogg", "Public domain", "rain", "rain foreground", "-32 LUFS target in runtime", "Opening rain beat only."),
      phone_vibrate: exception("sfx_phone_vibrate_cc0", "phone_vibrate", "sfx_phone_vibrate_cc0_breviceps_515295.mp3", "Breviceps", "https://freesound.org/people/Breviceps/sounds/515295/", "CC0", "phone", "phone vibration", "-20 LUFS target in runtime", "Modern phone vibration on the desk."),
      phone_ring_dead_call: exception("sfx_phone_ring_cc0", "phone_ring_dead_call", "sfx_phone_ring_cc0_thezero_273540.mp3", "TheZero", "https://freesound.org/people/TheZero/sounds/273540/", "CC0", "phone", "modern phone ring", "-19 LUFS target in runtime", "Dead caller's modern incoming call."),
      message_pop_cold: exception("sfx_message_cc0", "message_pop_cold", "sfx_message_notification_cc0_qubodup_782969.mp3", "qubodup", "https://freesound.org/people/qubodup/sounds/782969/", "CC0", "message", "phone message", "-24 LUFS target in runtime", "Incoming chat message only."),
      recording_static_short: taira("sfx_recording_air_leak", "recording_static_short", "air_leak1.mp3", "recording degradation", "-34 LUFS target in runtime", "Subtle signal loss around recovered recordings."),
      doorbell_rain_night: taira("sfx_doorbell_dark", "doorbell_rain_night", "dark_bell.mp3", "apartment doorbell", "-22 LUFS target in runtime", "Doorbell at the rainy apartment."),
      knock_soft: taira("sfx_knock_wall", "knock_soft", "wall_pounding1.mp3", "door knock", "-28 LUFS target in runtime", "One low knock, never a jump scare flourish."),
      footstep_corridor_wet: taira("sfx_corridor_footstep", "footstep_corridor_wet", "walk_floor_slowly1.mp3", "slow corridor footsteps", "-30 LUFS target in runtime", "Wet visitor approaching the door."),
      door_chain_close: taira("sfx_door_keys", "door_chain_close", "put_ring_of_keys.mp3", "keys and lock hardware", "-31 LUFS target in runtime", "Door-chain-adjacent locking gesture; sparse use."),
      old_phone_start: taira("sfx_old_phone_flip", "old_phone_start", "op_flip_phone.mp3", "old phone handling", "-26 LUFS target in runtime", "Opening the old phone."),
      old_photo_pickup: taira("sfx_photo_pickup", "old_photo_pickup", "put_light_object.mp3", "paper object handling", "-32 LUFS target in runtime", "Picking up or setting down a photograph."),
      backup_start: taira("sfx_backup_drive_insert", "backup_start", "put_disc_in_drive1.mp3", "physical backup media", "-29 LUFS target in runtime", "Starting the evidence backup."),
      backup_success: taira("sfx_backup_drive_eject", "backup_success", "eject_disk1.mp3", "physical backup media", "-30 LUFS target in runtime", "Backup completion without reward chime."),
      door_lock_turn: taira("sfx_door_lock_keys", "door_lock_turn", "put_ring_of_keys.mp3", "keys and lock hardware", "-31 LUFS target in runtime", "Deliberate lock turn."),
      door_open_slow: taira("sfx_door_open", "door_open_slow", "open_bedroom_door.mp3", "door movement", "-25 LUFS target in runtime", "Opening the apartment door."),
      box_drag_soft: taira("sfx_photo_box", "box_drag_soft", "put_cardboard_box.mp3", "cardboard box handling", "-31 LUFS target in runtime", "Pulling the photo box into view."),
      deduction_tension: taira("sfx_deduction_suspicion", "deduction_tension", "suspicion3.mp3", "deduction transition", "-28 LUFS target in runtime", "Final reasoning transition, not answer feedback."),
    },
    stingers: {
      linzhou_gasp_short: taira("stinger_linzou_gasp", "linzhou_gasp_short", "gasp1.mp3", "non-verbal reaction", "-28 LUFS target in runtime", "Only when Linzhou visibly gasps."),
    },
  };
})();
