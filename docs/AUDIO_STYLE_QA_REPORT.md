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
