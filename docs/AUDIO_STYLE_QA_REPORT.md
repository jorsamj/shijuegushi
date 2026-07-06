# Audio Style QA Report

## Current Problem

The previous procedural audio pass produced usable files, but several cues could read as small-game UI sounds: too bright, too short, too melodic, and too reward-like.

## This Pass Goal

Move procedural audio toward realistic foley and restrained cinematic suspense:

- urban suspense
- rainy night
- old case archive
- pseudo-supernatural realism
- low-frequency pressure
- muted physical objects
- no bright reward cues

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

## Prohibited Style

- 8-bit or chiptune style
- cute game reward cues
- coin-like metal sounds
- bright upward menu beeps
- victory jingle feeling
- harsh white noise
- cheap haunted-house effects
- excessive jump-scare hits

## Manual QA Needed

The files are procedurally generated and can be regenerated deterministically. They still require manual listening on:

- laptop speakers
- phone speakers
- headphones

Any cue that feels playful, bright, toy-like, or reward-like should be marked `needs-retake` in the manifest.
