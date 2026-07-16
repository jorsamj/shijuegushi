# Dormitory Broadcast Sequence Review

Generated from the formal broadcast contract by `node scripts/generate-broadcast-sequence-review.mjs`.

This is a **manual review order**, not a runtime sign-off and not evidence that the game automatically chains every cue. Rows 1-10 follow the common story chronology. Rows 11-14 are mutually exclusive ending branches and must never play back-to-back in the game. The listener must confirm audible sequence, pauses, exits, environmental masking, and the absence of overlap during the three-device sign-off.

## Review order

| # | Audio ID | Formal WAV | Story node | Previous | Next | Suggested gap | Skippable | Exit handling | Knock / BGM / ambience review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `dorm_broadcast_lockdown_rule` | MISSING | `dorm_01_002` | Its matching ending scene | None (mutually exclusive ending branch) | 0ms (sequence start) | Yes | Stop and fade within 160ms on node exit; never overlap another voice. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 2 | `dorm_broadcast_cleanup_complete` | MISSING | `dorm_01_006` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop within 120ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 3 | `dorm_broadcast_full_name_call` | MISSING | `dorm_01_010` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop within 100ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 4 | `dorm_broadcast_hold_position` | MISSING | `dorm_05_002` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop within 120ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 5 | `dorm_broadcast_false_east_route` | MISSING | `dorm_05_003` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop within 120ms on node exit. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 6 | `dorm_broadcast_ninety_second_window` | MISSING | `dorm_06_001` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop within 140ms on node exit; no loop. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 7 | `dorm_broadcast_final_rollcall_start` | MISSING | `dorm_06_008` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Fade within 120ms when leaving the node. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 8 | `dorm_broadcast_final_names` | MISSING | `dorm_06_009` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop immediately when the player leaves or makes a choice. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 9 | `dorm_broadcast_control_room_prompt` | MISSING | `dorm_06_010` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Stop within 120ms after the choice is made. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 10 | `dorm_broadcast_gate_archive` | MISSING | `dorm_06_011` | Its matching ending scene | None (mutually exclusive ending branch) | 300ms | Yes | Fade within 220ms before ending audio or report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 11 | `dorm_broadcast_ending_dawn` | MISSING | `dorm_ending_true_dawn` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 12 | `dorm_broadcast_ending_legal_count` | MISSING | `dorm_ending_legal_count` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 13 | `dorm_broadcast_ending_second_xutang` | MISSING | `dorm_ending_second_xutang` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |
| 14 | `dorm_broadcast_ending_broken` | MISSING | `dorm_ending_broken_broadcast` | Its matching ending scene | None (mutually exclusive ending branch) | 500ms after ending scene settles | Yes | Play once, then stop before ending report. | No intentional overlap; duck ambience only if manual listening shows masking. |

## Listening rules

- Listen in this order from the local voice-review page's **试听全部制度广播** action, then replay every cue in its actual story node.
- Do not let two broadcast cues run together. Node exit follows the contract stop or fade policy.
- The `dorm_broadcast_bed_call` cue must not mask either the correct or incorrect knock rhythm.
- Keep BGM and ambience below intelligibility threshold; they should be ducked only when the listener confirms masking.
- This document does not record a pass. Fill the separate human sign-off only after headphones, desktop speakers, and phone speakers are each reviewed.
