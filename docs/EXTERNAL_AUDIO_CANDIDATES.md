# External Audio Candidates

Current status: `selectedExternalAudio=8`.

The first real external-audio pass selected only traceable Wikimedia Commons assets with commercial use and redistribution allowed. Generated procedural audio remains the fallback for every selected story key.

Forbidden sources remain:

- YouTube, Bilibili, Douyin/TikTok, Xiaohongshu, NetEase Cloud Music, QQ Music.
- Pirated commercial SFX packs.
- CC BY-NC, NC, Sampling+, unknown, unclear, untraceable, or NoDerivatives licenses.

## Selected Assets

| Usage | Asset ID | Source | URL | Author | License | Commercial | Attribution | Result | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `rain_heavy_loop` | `rain_heavy_loop_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Rain_drops_(Gravity_Sound).wav | Gravity Sound | CC BY 4.0 | Yes | Yes | selected | Real rain layer. Large WAV; later pass should trim or transcode. |
| `phone_vibrate` | `phone_vibrate_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Elektrorasur-01.ogg | Priwo | Public domain | Yes | No | selected | Physical low buzzing source repurposed for phone-on-table vibration. |
| `phone_ring_dead_call` | `phone_ring_dead_call_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:WWS_AutomatictelephoneIskraEta80ringing.ogg | Work With Sounds / Technical Museum of Slovenia | CC BY 4.0 | Yes | Yes | selected | Real old telephone ringing; colder than generated fallback. |
| `doorbell_rain_night` | `doorbell_rain_night_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Doorbell-old-tring.ogg | Unknown Wikimedia Commons contributor | Public domain | Yes | No | selected | Old doorbell tone for rainy corridor entry. |
| `knock_soft` | `knock_soft_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Knocking_on_wood_or_door.ogg | stephan | Public domain | Yes | No | selected | Real wood/door knock. |
| `door_chain_close` | `door_chain_close_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Door_knocker_audio.ogg | Mx. Granger | CC0 | Yes | No | selected | Real metal door sound used as chain/metal layer. |
| `door_lock_turn` | `door_lock_turn_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Tight_door_lock_(Gravity_Sound).wav | Gravity Sound | CC BY 4.0 | Yes | Yes | selected | Real lock mechanism. |
| `recording_static_short` | `recording_static_short_real_01` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Dial_up_connection_failed.ogg | ezwa | Public domain | Yes | No | selected | Old-device failure/glitch layer for recording static beats. |

## Rejected / Deferred Assets

| Candidate | Source | License / Issue | Result |
|---|---|---|---|
| `Sound of rain.ogg` | Wikimedia Commons | CC BY-SA 3.0 | rejected, share-alike outside this pass |
| `Shave and a Haircut Door Knock.ogg` | Wikimedia Commons | CC BY-SA 4.0 and comedic rhythm | rejected |
| `FREE real VHS static.webm` | Wikimedia Commons | CC0 but over 100 MB original | deferred, too large for current demo |
| `Automatic telephone Siemens & Halske - ringing.webm` | Wikimedia Commons | CC BY 3.0 | rejected in favor of CC BY 4.0 WWS file |

## Remaining Future Search Targets

- A shorter, loop-ready rain ambience under 5 MB.
- A true smartphone vibration recording with CC0 or CC BY 4.0.
- A more exact door-chain latch recording.
- A shorter old recording static click that does not require post-trimming.
