# Audio Credits

This build uses generated procedural audio as fallback and the following local external audio assets first where mapped in `assets/external-audio-manifest.js`.

All selected files are local project files under `assets/library/audio/external/processed/`. Each entry keeps the original source URL, author, license, and fallback generated file.

## Selected External Audio

| Asset ID | Runtime key | Local file | Source | Author | License | Attribution required | Fallback |
|---|---|---|---|---|---|---|---|
| `rain_heavy_loop_real_01` | `rain_heavy_loop` | `assets/library/audio/external/processed/amb_rain_drops_gravity_real_01.wav` | [Rain drops (Gravity Sound)](https://commons.wikimedia.org/wiki/File:Rain_drops_(Gravity_Sound).wav) | Gravity Sound | CC BY 4.0 | Yes | `assets/audio/generated/ambience/amb_rain_heavy_loop.wav` |
| `phone_vibrate_real_01` | `phone_vibrate` | `assets/library/audio/external/processed/sfx_device_vibration_real_01.ogg` | [Elektrorasur-01](https://commons.wikimedia.org/wiki/File:Elektrorasur-01.ogg) | Priwo | Public domain | No | `assets/audio/generated/sfx/sfx_phone_vibrate.wav` |
| `phone_ring_dead_call_real_01` | `phone_ring_dead_call` | `assets/library/audio/external/processed/sfx_old_telephone_ring_real_01.ogg` | [WWS AutomatictelephoneIskraEta80ringing](https://commons.wikimedia.org/wiki/File:WWS_AutomatictelephoneIskraEta80ringing.ogg) | Work With Sounds / Technical Museum of Slovenia | CC BY 4.0 | Yes | `assets/audio/generated/sfx/sfx_phone_ring_dead_call.wav` |
| `doorbell_rain_night_real_01` | `doorbell_rain_night` | `assets/library/audio/external/processed/sfx_doorbell_old_tring_real_01.ogg` | [Doorbell-old-tring](https://commons.wikimedia.org/wiki/File:Doorbell-old-tring.ogg) | Unknown Wikimedia Commons contributor | Public domain | No | `assets/audio/generated/sfx/sfx_doorbell_rain_night.wav` |
| `knock_soft_real_01` | `knock_soft` | `assets/library/audio/external/processed/sfx_door_knock_wood_real_01.ogg` | [Knocking on wood or door](https://commons.wikimedia.org/wiki/File:Knocking_on_wood_or_door.ogg) | stephan | Public domain | No | `assets/audio/generated/sfx/sfx_knock_soft.wav` |
| `door_chain_close_real_01` | `door_chain_close` | `assets/library/audio/external/processed/sfx_door_metal_knocker_real_01.ogg` | [Door knocker audio](https://commons.wikimedia.org/wiki/File:Door_knocker_audio.ogg) | Mx. Granger | CC0 | No | `assets/audio/generated/sfx/sfx_door_chain_close.wav` |
| `door_lock_turn_real_01` | `door_lock_turn` | `assets/library/audio/external/processed/sfx_door_lock_tight_real_01.wav` | [Tight door lock (Gravity Sound)](https://commons.wikimedia.org/wiki/File:Tight_door_lock_(Gravity_Sound).wav) | Gravity Sound | CC BY 4.0 | Yes | `assets/audio/generated/sfx/sfx_door_lock_turn.wav` |
| `recording_static_short_real_01` | `recording_static_short` | `assets/library/audio/external/processed/sfx_recording_glitch_real_01.ogg` | [Dial up connection failed](https://commons.wikimedia.org/wiki/File:Dial_up_connection_failed.ogg) | ezwa | Public domain | No | `assets/audio/generated/sfx/sfx_recording_static_short.wav` |

## Required Attribution

- `rain_heavy_loop_real_01`: Rain drops (Gravity Sound) by Gravity Sound, licensed under CC BY 4.0 via Wikimedia Commons.
- `phone_ring_dead_call_real_01`: WWS AutomatictelephoneIskraEta80ringing by Work With Sounds / Technical Museum of Slovenia, licensed under CC BY 4.0 via Wikimedia Commons.
- `door_lock_turn_real_01`: Tight door lock (Gravity Sound) by Gravity Sound, licensed under CC BY 4.0 via Wikimedia Commons.

## Processing Notes

- Files were downloaded from their original Wikimedia Commons upload URLs.
- `processed/` currently contains no-transcode copies because `ffmpeg` is not available in the current environment.
- Generated procedural audio remains the fallback for every mapped runtime key.
- Manual listening and final trimming are still recommended before commercial release.
