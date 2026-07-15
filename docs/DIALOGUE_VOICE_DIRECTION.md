# Dialogue And Voice Direction Audit

## Scope

This audit separates every playable node into one content type: narration,
dialogue, broadcast, phone, recording, system, or inner monologue. Narration
and system content are intentionally silent. Existing legacy WAV files remain
as auditable masters, but only an audible node with an exact current-text hash
may enter the runtime voice map.

## Current Split

- `script_rain_call`: 208 nodes; 110 audible single-speaker nodes; 67 narration
  nodes; 31 system nodes.
- `script_dormitory_rollcall`: 68 nodes; 19 audible single-speaker nodes; 39
  narration nodes; 10 system nodes.
- Seven mixed dormitory boxes were split into 21 single-type beats. The split
  adds 14 continuity beats without changing routes, clues, rules, or endings.
- Two rain-call character lines were rewritten where narration or quoted
  recollection had been embedded in spoken text: `ch02_003` and `ch05_011`.

## Dormitory Performance Direction

| Role | Direction |
| --- | --- |
| Xu Tang | Begins dazed and uncertain. In the middle she is frightened but fights to explain herself. At the end she is quietly brave, never a constant crying voice. |
| Lin Sui | Natural and gentle. Protective urgency is real; fear appears as careful repetition and a hard-won decision to trust. |
| Zhao Qing | A dorm leader trying to impose order. Pressure is strong, but she is not cruel or a villain. |
| Chen Lu | Starts lively and uses humor to hide nerves. After the video she speaks faster, then cannot finish a thought. |
| Shen Yan | Slow and quiet, with measured pauses. Her loss of calm is the signal of danger; never make her a ghost voice. |
| Manager Wu | Direct residential-manager speech. The old case brings avoidance and long-contained guilt. |
| Zhou Wanning | A young woman on a genuine old record: tired, frightened, and restrained. Never use a scream or supernatural treatment. |
| Dorm broadcast | Calm, precise, institutional. The more dangerous the instruction, the more normal it sounds. No whisper, ghost performance, or exaggerated electrical distortion. |

### Dormitory Chapter Curve

1. Chapters 1-2: uncertainty, reasonable attempts to explain the abnormal.
2. Chapters 3-4: confirmation, lowered voices, more pauses, rising suspicion.
3. Chapter 5: direct danger, short interrupted exchanges and conflict over Xu Tang.
4. Chapter 6: fatigue, fear, and decisions. Each ending must diverge into
   relief, numb survival, guilt, or recurrence rather than one shared horror tone.

## Rain Call Performance Direction

| Role | Direction |
| --- | --- |
| Lin Zhou | Tired and guarded. Danger makes lines shorter; she can regain control at key decisions. |
| Xu Zhiwan | Restrained on the surface, with trust and anger audible beneath it. Do not make her emotionally blank. |
| Xu Zhixia | A real young person on an old recording: hesitant and frightened, never an apparition or constant sobbing. |
| Zhou Yu | Polite first. Pressure remains controlled until he is confronted, when control begins to show. |
| Chen Yan | Clear-headed and practical; tension does not remove her judgement. |

Telephone speech should have light close-call compression. Old recordings should
feel recorded in the moment, not narrated. Neither treatment changes the
speaker's underlying voiceprint.

## Required Human Listening

The following items require focused listening after authorised Volcengine audio
has been generated:

- Names: Zhou Wanning, Xu Tang, Xu Zhiwan, Xu Zhixia, Lin Zhou, Zhou Yu, Chen Yan.
- Numbers and times: 417, 00:17, 00:44, 01:13, 2014, 319, and 320.
- Dormitory broadcast order and pauses, especially the roll call, correction,
  Zhou Wanning restoration, Xu Tang restoration, and completion cues.
- Rain-call phone and recording lines, especially `ch02_003` and `ch05_011`.
- The final spoken line before each ending, checking that it carries the
  route-specific release, numbness, guilt, or recurrence without melodrama.

## Generation Status

The Volcengine HTTP unidirectional generator is implemented in
`scripts/generate-volcengine-story-voices.mjs`, using only verified Doubao
Model 2.0 `uranus_bigtts` speaker IDs and the `seed-tts-2.0` resource. Formal
WAVs have been generated and promoted to the runtime manifest; browser TTS,
legacy XFYUN runtime fallback, and unapproved single-speaker fallback are not
permitted. Manual listening remains required before release.
