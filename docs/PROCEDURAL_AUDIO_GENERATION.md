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

