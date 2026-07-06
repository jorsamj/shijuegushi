# Image Asset Reuse Guide

## Backgrounds

Backgrounds should be created as reusable locations whenever possible:

- rainy rental room
- old apartment corridor
- phone-call interface scene
- old chat memory scene
- tabletop evidence search
- photo inspection
- old phone closeup
- archive ending/report scene

Reusable backgrounds should avoid embedding named characters or one-time story text into the image.

## Props

Props are usually reusable:

- cracked old phone
- old photo
- recording file
- archive folder
- door chain
- laptop / cup / hard drive

Props should be generated or cropped cleanly enough to be composited into scenes.

## Characters

Named character art is usually not reusable across stories. It can inform style direction, but should stay story-specific because it carries identity, costume, and relationship context.

Examples currently marked story-specific:

- Xu Zhiwan wet entrance
- Zhou Yu pressure portrait
- Xu Zhixia recording/memory portrait

## Covers

Story covers are story-specific because they communicate the promise and mystery of one story. They should not be used as generic library backgrounds.

## Workflow For New Stories

1. Check `docs/REUSABLE_ASSET_INDEX.md`.
2. Use `assets/asset-manifest.js` to find reusable backgrounds, props, BGM, ambience, SFX, and UI sounds.
3. Create only missing story-specific character art, cover art, and any unique props.
4. Add a story-level alias map like `assets/stories/rain-call/story-asset-map.js`.
5. Update the manifest with status and scope.
