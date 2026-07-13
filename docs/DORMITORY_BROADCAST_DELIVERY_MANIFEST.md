# Dormitory Broadcast Delivery Manifest

Status: `awaiting-authorised-human-recording`. These are delivery slots, not runtime audio assets. They must stay disabled until every licence field and listening sign-off is complete.

Canonical structured mapping: `assets/stories/dormitory-rollcall/broadcast-audio-contract.js`.

| Audio ID | Nodes | Required content | Delivery state |
|---|---|---|---|
| `dorm_broadcast_rollcall_start` | `dorm_01_002` | 00:17 roll-call start | Awaiting file |
| `dorm_broadcast_public_rules` | `dorm_01_002` | Six public rules | Awaiting file |
| `dorm_broadcast_current_count` | `dorm_01_006` | Four registered occupants | Awaiting file |
| `dorm_broadcast_bed_call` | `dorm_02_002` | Bed call | Awaiting file |
| `dorm_broadcast_unlisted_person` | `dorm_04_012`, `dorm_05_009` | Unregistered-person prompt | Awaiting file |
| `dorm_broadcast_deadline_0113` | `dorm_04_012` | 01:13 reminder | Awaiting file |
| `dorm_broadcast_correction_prompt` | `dorm_06_007` | Submit final roster | Awaiting file |
| `dorm_broadcast_restore_zhou` | `dorm_06_009` | Restore Zhou Wanning / 320 | Awaiting file |
| `dorm_broadcast_restore_xutang` | `dorm_06_009` | Restore Xu Tang / five occupants | Awaiting file |
| `dorm_broadcast_rollcall_complete` | `dorm_06_011` | Roll call complete | Awaiting file |
| `dorm_broadcast_ending_a` to `_d` | Ending screens | Outcome-specific broadcast | Awaiting files |

## Intake Rules

For every delivered file, record the source performer or generation service, licence identifier, explicit public-use permission, explicit commercial-distribution permission, final file path, loudness/mix note, and headphones/desktop/phone listening result. The engineer must then map the approved file in the external audio manifest, add the matching node cue, and prove node-exit stop/fade behaviour before changing the delivery state.
