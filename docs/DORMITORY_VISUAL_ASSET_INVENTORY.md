# Dormitory Rollcall Visual Asset Inventory

## V2 Contract

- Asset set: `dormitory-rework-v2`
- Canvas: `1080x1920`, portrait, `9:16`
- Mobile safe zone: `x=96`, `y=128`, `width=888`, `height=1184`; the dialogue surface begins at `y=1376`
- Production namespace: `assets/stories/dormitory-rollcall/`
- Candidate source: `project-generated`
- Runtime contract: `story-asset-map.js` retains the existing scene, speaker, clue, cover and ending lookup surfaces

`candidate` means the path belongs to the production contract. It does not mean the file exists or has passed visual QA. Run `node scripts/check-dormitory-asset-library.mjs` for the current missing-file and dimension report.

## Text Policy

Phone assets contain only media: avatars, call previews, video frames, evidence thumbnails, route previews and waveforms. The phone shell, player-visible names, labels, messages, timestamps, battery, signal, notices and controls are rendered by HTML/CSS from `phoneScreen` data. No player-visible text may be baked into files under `phone-v2`.

## Backgrounds

All formal story scene IDs map to portrait files under `backgrounds-v2`.

| Scene ID | File |
| --- | --- |
| `dorm_417_normal` | `backgrounds-v2/bg_dorm_417_normal.webp` |
| `dorm_417_lights_out` | `backgrounds-v2/bg_dorm_417_lights_out.webp` |
| `dorm_417_blackout` | `backgrounds-v2/bg_dorm_417_blackout.webp` |
| `dorm_415_room` | `backgrounds-v2/bg_dorm_415_room.webp` |
| `dorm_419_room` | `backgrounds-v2/bg_dorm_419_room.webp` |
| `dorm_floor4_corridor` | `backgrounds-v2/bg_dorm_floor4_corridor.webp` |
| `dorm_floor4_red` | `backgrounds-v2/bg_dorm_floor4_red.webp` |
| `dorm_corridor_peephole` | `backgrounds-v2/bg_dorm_corridor_peephole.webp` |
| `dorm_door_blood` | `backgrounds-v2/bg_dorm_door_blood.webp` |
| `dorm_stairwell` | `backgrounds-v2/bg_dorm_stairwell.webp` |
| `dorm_east_passage` | `backgrounds-v2/bg_dorm_east_passage.webp` |
| `dorm_west_stairs` | `backgrounds-v2/bg_dorm_west_stairs.webp` |
| `dorm_manager_office` | `backgrounds-v2/bg_dorm_manager_office.webp` |
| `dorm_broadcast_room` | `backgrounds-v2/bg_dorm_broadcast_room.webp` |
| `dorm_exit_gate` | `backgrounds-v2/bg_dorm_exit_gate.webp` |
| `dorm_outside_dawn` | `backgrounds-v2/bg_dorm_outside_dawn.webp` |
| `dorm_fire_memory_2014` | `backgrounds-v2/bg_dorm_2014_fire_memory.webp` |

Legacy keys `dorm_417_night`, `dorm_washroom_mirror` and `dorm_ending_archive` remain mapped for old saves and generic engine compatibility. They are not substitutes for formal v2 scenes.

## Character Variants

The locked cast has 27 portrait variants across seven characters. Every manifest entry includes a continuity profile, a state delta, framing, an eye anchor and a face anchor. Allowed framing values are `bust`, `half`, `close` and `full`; this set does not require a `full` portrait because the current formal beats are better served by upper-body acting, while full-body action is composed into scene or ending art.

| Character ID | Locked variants | Framing |
| --- | --- | --- |
| `xutang` | `base`, `alert`, `fear`, `exhausted`, `determined` | half, bust, close, half, bust |
| `linsui` | `base`, `fear`, `grief`, `exhausted`, `mimic` | half, close, bust, half, close |
| `zhaoqing` | `base`, `alert`, `injured`, `determined` | half, bust, half, bust |
| `chenlu` | `base`, `fear`, `mimic`, `video_glitch` | half, close, close, bust |
| `shenyan` | `base`, `suspicious`, `distressed` | half, bust, close |
| `manager_wu` | `base`, `serious`, `wounded` | half, bust, half |
| `zhouwanning` | `memory`, `warning`, `restored` | half, bust, close |

Portrait paths follow `characters-v2/char_<characterId>_<variant>.webp`. The map exposes both canonical IDs and Chinese speaker aliases. Mimic states preserve the locked face, hair and wardrobe; anomalies are limited to gaze, mouth timing, reflection or local alignment.

## Phone Media

| Media key | File | Story beat mapping |
| --- | --- | --- |
| `dead_account_avatar` | `phone-v2/phone_dead_account_avatar.webp` | `dorm_01_007`, `dorm_01_009` |
| `room_415_video` | `phone-v2/phone_room_415_video.webp` | `dorm_02_001` |
| `chenlu_real_avatar` | `phone-v2/phone_chenlu_real_avatar.webp` | `dorm_02_010`, `dorm_03_001` |
| `chenlu_mimic_avatar` | `phone-v2/phone_chenlu_mimic_avatar.webp` | `dorm_02_010`, `dorm_03_001` |
| `chenlu_mirror_video` | `phone-v2/phone_chenlu_mirror_video.webp` | `dorm_03_003` |
| `shenyan_avatar` | `phone-v2/phone_shenyan_avatar.webp` | `dorm_03_006` |
| `mother_call_preview` | `phone-v2/phone_mother_call_preview.webp` | `dorm_03_010`, `dorm_04_001`, `dorm_04_002` |
| `linsui_sister_avatar` | `phone-v2/phone_linsui_sister_avatar.webp` | `dorm_03_010`, `dorm_04_005` |
| `manager_wu_avatar` | `phone-v2/phone_manager_wu_avatar.webp` | `dorm_04_007` |
| `record_2014_thumbnail` | `phone-v2/phone_record_2014_thumbnail.webp` | `dorm_04_010`, `dorm_05_006` |
| `broadcast_waveform_true` | `phone-v2/phone_broadcast_waveform_true.webp` | `dorm_05_001` |
| `broadcast_waveform_false` | `phone-v2/phone_broadcast_waveform_false.webp` | `dorm_05_001` |
| `route_east_preview` | `phone-v2/phone_route_east_preview.webp` | `dorm_05_003`, `dorm_06_007` |
| `route_west_preview` | `phone-v2/phone_route_west_preview.webp` | `dorm_06_007` |
| `gate_identity_scan` | `phone-v2/phone_gate_identity_scan.webp` | `dorm_06_008` |

## Ending Scenes

Each ending has one unique file under `endings-v2`; shared background fallbacks are retained only for compatibility.

| Ending image key | File |
| --- | --- |
| `dorm_ending_true_dawn` | `endings-v2/ending_true_dawn.webp` |
| `dorm_ending_linsui_door` | `endings-v2/ending_linsui_door.webp` |
| `dorm_ending_left_behind` | `endings-v2/ending_left_behind.webp` |
| `dorm_ending_legal_count` | `endings-v2/ending_legal_count.webp` |
| `dorm_ending_second_xutang` | `endings-v2/ending_second_xutang.webp` |
| `dorm_ending_three_online` | `endings-v2/ending_three_online.webp` |
| `dorm_ending_east_passage` | `endings-v2/ending_east_passage.webp` |
| `dorm_ending_broken_broadcast` | `endings-v2/ending_broken_broadcast.webp` |

## Effects

The effects group lives under `effects-v2` and contains transparent portrait overlays unless a future asset explicitly documents otherwise.

| Effect key | File |
| --- | --- |
| `lights_out_vignette` | `effects-v2/fx_lights_out_vignette.webp` |
| `blood_edge` | `effects-v2/fx_blood_edge.webp` |
| `peephole_distortion` | `effects-v2/fx_peephole_distortion.webp` |
| `signal_tear` | `effects-v2/fx_signal_tear.webp` |
| `shadow_misalignment` | `effects-v2/fx_shadow_misalignment.webp` |
| `double_exposure` | `effects-v2/fx_double_exposure.webp` |
| `drag_smear` | `effects-v2/fx_drag_smear.webp` |
| `gate_scan` | `effects-v2/fx_gate_scan.webp` |

## Validation

Run:

```powershell
node --check assets/stories/dormitory-rollcall/asset-manifest.js
node --check assets/stories/dormitory-rollcall/story-asset-map.js
node --check scripts/check-dormitory-asset-library.mjs
node scripts/check-dormitory-asset-library.mjs
node scripts/check-dormitory-visual-world.mjs
```

The owned asset-library check verifies contract shape, exact `1080x1920` PNG dimensions, namespace isolation, all live story scene IDs, all live `visualCast` variant keys, phone beat assignments, unique ending paths, effects, and preserved clue/cover assets. Missing expected files remain release-blocking failures.
