# Procedural Audio Generation

## Purpose

This project now uses a local procedural audio workflow for the playable demo sound design.

The goal is not full voice acting. The goal is a restrained audio layer that supports suspense without forcing the player to listen to every line.

## What The Script Generates

`scripts/generate-procedural-audio.mjs` generates WAV files into:

- `assets/audio/generated/bgm/`
- `assets/audio/generated/ambience/`
- `assets/audio/generated/sfx/`
- `assets/audio/generated/stingers/`

Generated categories:

- BGM: low-volume suspense pads for rain night, corridor tension, and ending archive.
- Ambience: soft rain, room night bed, and corridor low hum.
- SFX: phone vibration, dead-call ring, message pop, doorbell, knock, door chain, lock, slow door open, wet footsteps, light flicker, old phone start, recording static, photo zoom, marker, and soft choice confirm.
- Stingers: non-verbal character sounds such as gasp, tense breath, low breath, wet step, low laugh, pressure breath, weak static breath, and recording cut.

## What It Does Not Do

- It does not download third-party audio.
- It does not use unknown-license assets.
- It does not use Edge TTS as formal audio.
- It does not use browser `speechSynthesis` for ordinary story text.
- It does not narrate normal prose.
- It does not read ordinary character dialogue.
- It does not generate spoken lines such as "不可能" or "别开门，她不是我".

## Technical Notes

- Output format: mono WAV.
- Sample rate: 44100 Hz.
- Implementation: pure Node.js, no network and no external dependency.
- Audio tools implemented in script:
  - sine / triangle / limited square wave
  - filtered noise
  - pulse / impulse layers
  - envelope control
  - fade in / fade out
  - simple lowpass / highpass style filtering
  - mix and normalize

## Quality Position

These sounds are suitable for the current visual novel demo. They are intentionally quiet, short, and non-intrusive.

They are not final cinematic audio. If the project moves toward commercial release, replace them with professionally produced SFX, ambience, and BGM, or run a dedicated audio post-production pass.

## Commands

```bash
node scripts/generate-procedural-audio.mjs
node scripts/validate-story-data.mjs
```

## 2026-07-06 Coverage Expansion

The second procedural pass adds more action-focused cues:

- phone call end, phone screen wake, cold chat typing
- evidence reveal, old photo pickup, photo reflection find
- backup start/success, delete warning, archive stamp
- rain-on-window and room-silence-drop pressure cues
- extra non-verbal stingers for Linzhou, Xuzhiwan, Zhouyu, and Xuzhixia

The generator also lowers BGM and ambience peaks so the project stays restrained:

- BGM is generated with lower peak targets and should play around 0.14 in the frontend.
- Ambience is generated softer and should play around 0.08 in the frontend.
- SFX and stingers remain clearer than ambience but should never become jump-scare loud.

Validation now checks the generated second-pass files, the audio asset mappings,
and the playtest checklist.

## 2026-07-06 Realistic Suspense Style Pass

The third procedural pass moves away from playful synthesized prompts and toward restrained foley:

- wooden-door knocks use low body resonance and filtered impact noise
- door chain and lock cues use short muted metal ticks, not bright reward-like metal
- phone vibration uses low tabletop pulses instead of electronic beeps
- the dead-call ring uses lower cold tones and a tremor texture
- message and choice cues are intentionally very soft
- evidence and backup cues are low, restrained, and non-celebratory
- rain and ambience are darker and less noisy

The generator still produces demo-grade procedural audio, not final cinematic sound. Any cue that feels playful, bright, toy-like, or reward-like should be retuned or replaced.

## 2026-07-07 Rain Call First Story Polish

New story expansion is paused for this pass. The generator is tuned for the first complete demo story: `第二人生：雨夜来电`.

The priority is no longer "more sounds"; the priority is that existing sounds do not break the urban suspense mood.

Adjustments:

- BGM peaks lowered again so rain-night, corridor, and ending beds stay under the scene.
- Ambience peaks lowered to avoid white-noise and TV-static feeling.
- Knock, doorbell, phone vibration, and phone ring were rebalanced around lower physical resonance.
- Evidence, photo, backup, marker, archive, and choice cues were made less bright and less reward-like.
- UI-style tones were reduced in favor of low hits, filtered friction, and physical-object noise.

Manual QA phrases that must remain true:

- 不能像游戏。
- 不能像超级马里奥。
- 真实敲门要像木门的咚、咚。
- 手机铃声要像真实来电，但偏冷、异常、压迫。
- 下雨声要柔和，不是白噪音。
- 阴森背景音乐要低频、克制、无明显旋律。

## Reusable Asset Position

Generated audio is now also indexed through:

- `assets/asset-manifest.js`
- `assets/stories/rain-call/story-asset-map.js`
- `docs/REUSABLE_ASSET_INDEX.md`

New stories should reuse library IDs first, then add story-specific aliases only when needed.

## External Audio Fallback Policy

External licensed audio can now be layered on top of generated audio through:

- `assets/external-audio-manifest.js`
- `docs/EXTERNAL_AUDIO_CANDIDATES.md`
- `docs/AUDIO_CREDITS.md`
- `scripts/check-external-audio-assets.mjs`

The generated WAV files in `assets/audio/generated/` must remain in the project as fallback. If an external Freesound/Pixabay file fails to load, runtime audio should fall back to the generated file instead of crashing or restoring synthetic white noise.

Current status: no external audio has been downloaded or committed. The manifest is marked `pending-download`.
