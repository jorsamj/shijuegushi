# Second Life Asset Library Guide

## Goal

Second Life should not rebuild every sound, background, prop, and UI texture for each story. The project now treats reusable media as a shared asset library, while keeping character identity and story covers story-specific.

## Asset Layers

| Layer | Scope | Path Direction | Examples |
|---|---|---|---|
| Core library | Reusable across stories | `assets/library/*` for future assets, current assets indexed through `assets/asset-manifest.js` | rain ambience, phone vibration, wooden knock, old corridor hum |
| Genre library | Reusable within a genre | `assets/library/genres/suspense/*` for future assets | low suspense BGM, urban corridor pressure, pseudo-supernatural audio beds |
| Story assets | Story-specific | `assets/stories/rain-call/*` and existing character/covers | Xu Zhiwan character art, Zhou Yu pressure portrait, Rain Call cover |

This pass does not move existing files. Existing paths remain compatible, and the manifest records how each asset should be reused.

## Naming Rules

Audio:

- `amb_[environment]_[detail]_loop`
- `sfx_[object]_[action]_[style]`
- `bgm_[mood]_[scene]_loop`
- `stinger_[role]_[reaction]`
- `ui_[action]_[style]`

Visual:

- `bg_[location]_[time]_[mood]`
- `char_[role_or_name]_[variant]`
- `prop_[object]_[state]`
- `cover_[story]_[style]`

## Status Values

| Status | Meaning |
|---|---|
| `generated-demo` | Generated locally and suitable for demo iteration |
| `demo-usable` | Usable in the current demo |
| `needs-retake` | Should be remade before final release |
| `final-candidate` | Possible final asset after manual QA |
| `story-only` | Belongs to a specific story identity |
| `reusable` | Can be reused across stories |
| `deprecated` | Do not use in new story content |

## Reuse Rules

- Rain, door, phone, old-device, archive, and soft UI sounds should be reusable unless tied to a named character.
- Backgrounds for generic urban suspense locations can be reusable.
- Props such as old phones, archive folders, photos, and door chains can be reusable.
- Named character portraits are story-specific by default.
- Story covers are story-specific by default.

## Current Files

- `assets/asset-manifest.js` is the source of truth for reusable asset metadata.
- `assets/stories/rain-call/story-asset-map.js` maps current Rain Call story keys to reusable library keys.
- `assets/audio/audio-assets.js` keeps old story keys while adding library-style keys.
