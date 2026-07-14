# Dormitory Broadcast Sequence Review

Generated from the formal broadcast contract by `node scripts/generate-broadcast-sequence-review.mjs`.

This is a **manual review order**, not a runtime sign-off and not evidence that the game automatically chains every cue. Rows 1-10 follow the common story chronology. Rows 11-14 are mutually exclusive ending branches and must never play back-to-back in the game. The listener must confirm audible sequence, pauses, exits, environmental masking, and the absence of overlap during the three-device sign-off.

## Review order

| # | Audio ID | Formal WAV | Story node | Previous | Next | Suggested gap | Skippable | Exit handling | Knock / BGM / ambience review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `dorm_broadcast_rollcall_start` | `dorm_broadcast__dorm_broadcast_rollcall_start__dorm_broadcast.wav` | `dorm_01_002` | None | `dorm_broadcast_public_rules` | 0ms (sequence start) | Yes | Fade out within 120ms when leaving the node or beginning the rules. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 2 | `dorm_broadcast_public_rules` | `dorm_broadcast__dorm_broadcast_public_rules__dorm_broadcast.wav` | `dorm_01_002` | `dorm_broadcast_rollcall_start` | `dorm_broadcast_current_count` | 350ms | Yes | Stop and fade within 180ms on node exit; never overlap another broadcast cue. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 3 | `dorm_broadcast_current_count` | `dorm_broadcast__dorm_broadcast_current_count__dorm_broadcast.wav` | `dorm_01_006` | `dorm_broadcast_public_rules` | `dorm_broadcast_bed_call` | 300ms | Yes | Stop within 120ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 4 | `dorm_broadcast_bed_call` | `dorm_broadcast__dorm_broadcast_bed_call__dorm_broadcast.wav` | `dorm_02_002` | `dorm_broadcast_current_count` | `dorm_broadcast_unlisted_person` | 300ms | Yes | Stop within 120ms on node exit. | No. Keep the knock pattern separate; test at least 700ms of clear space. |
| 5 | `dorm_broadcast_unlisted_person` | `dorm_broadcast__dorm_broadcast_unlisted_person__dorm_broadcast.wav` | `dorm_04_012`, `dorm_05_009` | `dorm_broadcast_bed_call` | `dorm_broadcast_deadline_0113` | 300ms | Yes | Use once per scene; stop within 120ms when the node changes. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 6 | `dorm_broadcast_deadline_0113` | `dorm_broadcast__dorm_broadcast_deadline_0113__dorm_broadcast.wav` | `dorm_04_012` | `dorm_broadcast_unlisted_person` | `dorm_broadcast_correction_prompt` | 300ms | Yes | Stop within 120ms on node exit; no loop. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 7 | `dorm_broadcast_correction_prompt` | `dorm_broadcast__dorm_broadcast_correction_prompt__dorm_broadcast.wav` | `dorm_06_007` | `dorm_broadcast_deadline_0113` | `dorm_broadcast_restore_zhou` | 300ms | Yes | Fade within 140ms when player chooses or leaves the node. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 8 | `dorm_broadcast_restore_zhou` | `dorm_broadcast__dorm_broadcast_restore_zhou__dorm_broadcast.wav` | `dorm_06_009` | `dorm_broadcast_correction_prompt` | `dorm_broadcast_restore_xutang` | 450ms | Yes | Stop within 160ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 9 | `dorm_broadcast_restore_xutang` | `dorm_broadcast__dorm_broadcast_restore_xutang__dorm_broadcast.wav` | `dorm_06_009` | `dorm_broadcast_restore_zhou` | `dorm_broadcast_rollcall_complete` | 450ms | Yes | Stop within 160ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 10 | `dorm_broadcast_rollcall_complete` | `dorm_broadcast__dorm_broadcast_rollcall_complete__dorm_broadcast.wav` | `dorm_06_011` | `dorm_broadcast_restore_xutang` | One matching ending branch | 300ms | Yes | Fade within 220ms before ending music begins. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 11 | `dorm_broadcast_ending_a` | `dorm_broadcast__dorm_broadcast_ending_a__dorm_broadcast.wav` | `dorm_ending_a` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 12 | `dorm_broadcast_ending_b` | `dorm_broadcast__dorm_broadcast_ending_b__dorm_broadcast.wav` | `dorm_ending_b` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 13 | `dorm_broadcast_ending_c` | `dorm_broadcast__dorm_broadcast_ending_c__dorm_broadcast.wav` | `dorm_ending_c` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 14 | `dorm_broadcast_ending_d` | `dorm_broadcast__dorm_broadcast_ending_d__dorm_broadcast.wav` | `dorm_ending_d` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |

## Listening rules

- Listen in this order from the local voice-review page's **试听全部制度广播** action, then replay every cue in its actual story node.
- Do not let two broadcast cues run together. Node exit follows the contract stop or fade policy.
- The `dorm_broadcast_bed_call` cue must not mask either the correct or incorrect knock rhythm.
- Keep BGM and ambience below intelligibility threshold; they should be ducked only when the listener confirms masking.
- This document does not record a pass. Fill the separate human sign-off only after headphones, desktop speakers, and phone speakers are each reviewed.
