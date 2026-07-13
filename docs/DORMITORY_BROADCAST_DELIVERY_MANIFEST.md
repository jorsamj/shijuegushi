# Dormitory Broadcast Delivery Manifest

Status: `awaiting-authorised-human-recording`. These are delivery slots, not runtime audio assets. They must stay disabled until every licence field and listening sign-off is complete.

Canonical structured mapping: `assets/stories/dormitory-rollcall/broadcast-audio-contract.js`.

| Audio ID | Chapters / nodes | Recommended file | Delivery state |
|---|---|---|---|
| `dorm_broadcast_rollcall_start` | Chapter 1 / `dorm_01_002` | `dorm_broadcast_rollcall_start_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_public_rules` | Chapter 1 / `dorm_01_002` | `dorm_broadcast_public_rules_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_current_count` | Chapter 1 / `dorm_01_006` | `dorm_broadcast_current_count_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_bed_call` | Chapter 2 / `dorm_02_002` | `dorm_broadcast_bed_call_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_unlisted_person` | Chapters 4-5 / `dorm_04_012`, `dorm_05_009` | `dorm_broadcast_unlisted_person_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_deadline_0113` | Chapter 4 / `dorm_04_012` | `dorm_broadcast_deadline_0113_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_correction_prompt` | Chapter 6 / `dorm_06_007` | `dorm_broadcast_correction_prompt_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_restore_zhou` | Chapter 6 / `dorm_06_009` | `dorm_broadcast_restore_zhou_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_restore_xutang` | Chapter 6 / `dorm_06_009` | `dorm_broadcast_restore_xutang_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_rollcall_complete` | Chapter 6 / `dorm_06_011` | `dorm_broadcast_rollcall_complete_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_ending_a` | Ending A / `dorm_ending_a` | `dorm_broadcast_ending_a_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_ending_b` | Ending B / `dorm_ending_b` | `dorm_broadcast_ending_b_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_ending_c` | Ending C / `dorm_ending_c` | `dorm_broadcast_ending_c_zh-CN.mp3` | Awaiting file |
| `dorm_broadcast_ending_d` | Ending D / `dorm_ending_d` | `dorm_broadcast_ending_d_zh-CN.mp3` | Awaiting file |

## Intake Rules

For every delivered file, record the source performer or generation service, licence identifier, explicit public-use permission, explicit commercial-distribution permission, final file path, loudness/mix note, and headphones/desktop/phone listening result. The engineer must then map the approved file in the external audio manifest, add the matching node cue, and prove node-exit stop/fade behaviour before changing the delivery state.
