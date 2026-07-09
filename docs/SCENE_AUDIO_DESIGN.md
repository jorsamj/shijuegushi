# Scene Audio Design

Scope: Rain Call first-story polish. This document explains which sound should follow each key story action, so future audio swaps do not drift back into generic UI bleeps or repeated character stingers.

Runtime rules:

- Ordinary narration and ordinary dialogue stay silent.
- SFX follows the visible action in the current node.
- Stingers are sparse, non-verbal, and role-specific.
- Xu Zhiwan and Xu Zhixia must not share the same stinger file. Xu Zhiwan should sound like a real person at the door; Xu Zhixia should sound like a damaged old-phone recording.
- Previous node SFX and stingers stop when the node changes.
- BGM and ambience are low-volume support, not foreground performance.

| Node | Story action | Required audio | Current mapping | Notes |
|---|---|---|---|---|
| ch01_001 | Rainy rental room opening | `rain_night_loop`, `room_night_loop`, `rain_window_soft` | BGM + room ambience + window rain | Establish rainy room, no narration. |
| ch01_003 | Dead call arrives | `phone_screen_wake`, `phone_vibrate`, `phone_ring_dead_call` | Phone wake, tabletop vibration, cold phone ring | Must sound like a phone, not a game alert. |
| ch01_004 | Lin Zhou realizes something is wrong | `room_silence_drop`, `linzhou_gasp_short` | Low tension drop + short male gasp | No spoken "impossible" line. |
| ch01_005 | Xu Zhixia old-phone recording | `phone_call_connect`, `recording_static_short`, `xuzhixia_weak_static_exhale` | Phone pickup + old record/static + bristle/static exhale | Xu Zhixia uses recording texture, not Xu Zhiwan's breath file. |
| ch01_006 | Call ends, doorbell arrives | `phone_call_end`, `doorbell_rain_night` | Phone disconnect + apartment doorbell | Doorbell plays here once, not repeated at ch01_007. |
| ch01_007 | Woman outside the door moves | `footstep_corridor_wet`, `xuzhiwan_low_breath` | Wet footsteps + quiet female breath | Xu Zhiwan has the physical breath cue. |
| ch01_008 | Door chain and corridor light | `door_chain_close`, `corridor_light_flicker` | Chain/metal + light flicker | Must not sound like generic lock/stamp. |
| ch01_009 | Chen Yan message | `message_pop_cold` | Cold notification | No Chen Yan voice. |
| ch01_018 | Zhou Yu message pressure | `message_pop_cold`, `zhouyu_phone_silence` | Notification + phone silence | Quiet pressure, no spoken line. |
| ch01_020 | Xu Zhiwan controlled exhale | `corridor_light_flicker`, `xuzhiwan_cold_exhale` | Light flicker + windy/cold breath | Different from first-door breath. |
| ch02_003 | Xu Zhiwan pressure line | `corridor_light_flicker`, `xuzhiwan_low_breath` | Corridor flicker + restrained female breath | Keep sparse; do not read the line. |
| ch03_011 | Zhou Yu first pressure | `message_pop_cold`, `zhouyu_phone_silence` | Notification + phone silence | Should feel watched, not rewarded. |
| ch04_010 | Photo zoom inspection | `photo_zoom`, `choice_confirm_soft` | Camera/zoom + soft choice | Keep low, not puzzle reward. |
| ch04_020 | Zhou Yu knows about the photo | `message_pop_cold`, `zhouyu_tiny_smile` | Notification + low chuckle | Must remain subtle. |
| ch05_005 | Old phone wakes | `old_phone_start`, `recording_static_short`, `xuzhixia_weak_static_exhale` | Device switch + static + frayed recording | Old-phone texture, not sci-fi boot. |
| ch05_011 | Recording restored | `old_phone_start`, `recording_static_short`, `xuzhixia_weak_static_exhale` | Device/static/recording residue | No spoken full recording. |
| ch05_016 | Zhou Yu pressure peak | `message_pop_cold`, `zhouyu_pressure_breath` | Notification + windy/near breath | Different from Xu Zhiwan/Xu Zhixia cues. |
| ch06_020 | Ending archive | `ending_archive`, `room_night_loop`, `archive_stamp` | Ending drone + room ambience + stamp | Closure, not victory jingle. |

## 2026-07-09 Role Stinger Split

The prior mapping reused `stinger_female_quiet_breath_freesound_554735.mp3` for both Xu Zhiwan and Xu Zhixia. That made the two characters feel like the same sonic identity. The current split is:

| Character | Key | Source texture |
|---|---|---|
| Xu Zhiwan | `xuzhiwan_low_breath` | Real quiet female breath, physical presence at the door |
| Xu Zhiwan | `xuzhiwan_cold_exhale` | Wind/breath texture, colder and less intimate |
| Xu Zhixia | `xuzhixia_static_breath` | Old record/static texture |
| Xu Zhixia | `xuzhixia_weak_static_exhale` | Crackle/bristle recording texture |

Validation now fails if Xu Zhiwan and Xu Zhixia share the same stinger file.
