# Audio Style QA Report

## Current Problem

The previous procedural audio pass produced usable files, but several cues could read as small-game UI sounds: too bright, too short, too melodic, and too reward-like.

Chinese QA note: 上一版声音偏游戏感，容易让人联想到超级马里奥、像素游戏、道具提示音、金币音或奖励音，这不符合《雨夜来电》的都市悬疑气质。

## This Pass Goal

Move procedural audio toward realistic foley and restrained cinematic suspense:

- urban suspense
- rainy night
- old case archive
- pseudo-supernatural realism
- low-frequency pressure
- muted physical objects
- no bright reward cues

本轮目标：真实拟音 + 都市悬疑 + 雨夜压迫。声音应该像真实敲门、真实手机铃声、真实下雨声、阴森背景音乐和旧录音质感，而不是游戏提示音。

## Rewritten Sound Direction

| Category | Target Style | Treatment |
|---|---|---|
| Rain ambience | Soft rain outside a window | Lowered high frequencies, reduced noise gain, added quieter droplet pulses |
| BGM | Low dark drone, not melody | Lower peaks, reduced bright tones, slower movement |
| Knock | Real wooden-door knock | Low wood resonance and short filtered noise |
| Doorbell | Muted apartment doorbell | Lower dual-tone, no bright upward cue |
| Phone vibration | Phone on tabletop | Low vibration pulses and table resonance |
| Dead-call ring | Cold phone call | Lower tones, tremor texture, no cheerful ringtone |
| Message notification | Cold short message | Muted click and low tail, no system-copy sound |
| Door chain / lock | Metal object foley | Short metal ticks and friction, not coin-like |
| Photo / evidence | Case discovery | Low restrained cue, not a reward sound |
| Choice confirm | Very soft UI tick | Kept subtle, low, and non-celebratory |

## 2026-07-07 Rain Call First Story Polish

This pass focuses only on the first story, `第二人生：雨夜来电`. New-story expansion is paused.

Changes made in `scripts/generate-procedural-audio.mjs`:

- Lowered BGM, ambience, stinger, SFX, and evidence cue peak targets.
- Re-tuned knock into two low wooden-door impacts with door-panel resonance.
- Re-tuned doorbell into a muted apartment corridor bell with lower tones.
- Re-tuned phone vibration into tabletop low pulses.
- Re-tuned dead-call ring into a colder, lower, less melodic phone ring.
- Re-tuned rain ambience and rain-window hits to avoid white-noise and TV-static feeling.
- Re-tuned evidence, photo, marker, backup, and choice sounds to avoid reward cues.

Manual listening is still required, but every cue should now be checked against this standard:

- 不能像游戏
- 不能像超级马里奥
- 不能像像素游戏
- 不能像金币音
- 不能像通关奖励
- 必须像真实敲门
- 手机铃声必须偏真实来电
- 下雨声必须柔和
- 阴森背景音乐必须低频克制

## Prohibited Style

- 8-bit or chiptune style
- cute game reward cues
- coin-like metal sounds
- bright upward menu beeps
- victory jingle feeling
- Mario-like
- pixel-game feeling
- arcade UI prompt feeling
- game reward sound
- harsh white noise
- cheap haunted-house effects
- excessive jump-scare hits

## Manual QA Needed

The files are procedurally generated and can be regenerated deterministically. They still require manual listening on:

- laptop speakers
- phone speakers
- headphones

Any cue that feels playful, bright, toy-like, or reward-like should be marked `needs-retake` in the manifest.

## Full External Audio Replacement Pass

This pass changes the formal runtime direction:

1. Generated procedural audio is no longer the formal playtest default.
2. Runtime lookup now uses `external-approved-only`.
3. If a key has no `demo-approved` or `final-approved` external asset with `qualityStatus: "approved"`, the runtime stays silent and records `silent-no-approved-external` in `window.SECOND_LIFE_AUDIO_DEBUG`.
4. Generated fallback is only available through explicit developer mode: `audioSourceMode = "generated-dev-only"`.
5. TTS, ordinary narration reading, and ordinary dialogue reading remain disabled.

Removed from active runtime:

- `phone_vibrate_real_01` / electric shaver source: rejected-style, not acceptable as phone vibration.
- `recording_static_short_real_01` / dial-up failure source: rejected-style, not acceptable as old recording texture.
- `door_chain_close_real_01` / door-knocker source: rejected-quality for door-chain use, replaced by real lock mechanism.
- Procedural generated audio as default runtime source: rejected-style for formal playtest.

Current approved coverage:

- All `story-data.js` used BGM keys have approved external mappings.
- All `story-data.js` used ambience keys have approved external mappings.
- All `story-data.js` used `sfxOnEnter` and `sfxOnChoice` keys have approved external mappings.
- All `story-data.js` used `voiceStinger` keys have approved external mappings.

Remaining human QA risks:

- `phone_ring_dead_call` uses a real old telephone ring. It is demo-approved for cold dead-call atmosphere, but a final pass should replace it with a non-branded modern phone ring if the old-phone tone feels wrong.
- `footstep_corridor_wet` uses rain/window wet texture because no clean licensed wet hallway footstep was found. It needs human listening before final approval.
- `old_photo_pickup` uses a real keyboard/mechanical interaction because no clean paper/photo pickup source was found. It should be replaced with real paper foley later.
- Character stingers use real breath/heartbeat/hum sources but are not role-specific recordings yet.

Formal QA rule:

- No white-noise source may enter active manifest.
- No electric razor, dial-up failure, or unrelated mechanical source may be used when the scene demands a clear phone vibration or old recording.
- No active audio key may be `pending-download`, `fallback only`, `generated only`, or `silent only`.

## 2026-07-09 Character Stinger De-Repetition

Issue found during playtest: Xu Zhiwan and Xu Zhixia reused the same quiet female-breath source, making the door visitor and the dead roommate feel too similar.

Fix:

- `xuzhiwan_low_breath` keeps the real quiet female breath, so Xu Zhiwan still feels physically present outside the door.
- `xuzhiwan_cold_exhale` now uses a colder wind/breath texture, so her later pressure cue does not repeat the first-door cue exactly.
- `xuzhixia_static_breath` now uses an old-record/static source.
- `xuzhixia_weak_static_exhale` now uses a crackle/bristle recording texture.
- `scripts/check-audio-semantics.mjs` now fails if Xu Zhiwan and Xu Zhixia share the same stinger file.

Remaining human QA risk: these are still curated demo assets, not role-specific recorded performances. The two characters are now separated sonically, but final production should record bespoke short breaths for Xu Zhiwan and damaged old-phone residue for Xu Zhixia.
