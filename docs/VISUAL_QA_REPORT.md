# Visual QA Report

Date: 2026-07-06

Scope: page experience, visual presentation, readability, story detail cleanup, and static UI flow checks. Story structure, ending logic, clues, and audio system were not changed.

## Fixed This Pass

| Area | Issue | Treatment | Status |
|---|---|---|---|
| Story detail page | The detail page could feel like a list page instead of a pure life file. | Reworked `showSeries()` into a clean LIFE FILE page with story hook, tags, core props, start/continue/restart, and sealed future-story notes. | fixed |
| Story detail page | Large hero, cover strip, or chapter directory should not appear. | Static check fails if `showSeries()` renders chapter preview, chapter cover, series hero cover, story main visual, or splash hero art. | fixed |
| Modal defaults | `index.html` had unreadable default title/close labels. | Replaced visible defaults with readable Chinese labels. | fixed |
| Mobile game layout | Scene and dialogue areas could compete for vertical space. | Protected more vertical room for the scene, reduced dialogue max-height, and tightened choices. | fixed |
| Choice readability | Mobile choice buttons could feel too tall or awkward for long choices. | Adjusted mobile choice padding, radius, spacing, and line-height. | fixed |
| Character framing | Key visual nodes need explicit head-safe framing. | Added `scripts/check-ui-flow.mjs` checks for important nodes and strong scales. | auto checked |
| Clue interruption | Feedback should not dominate story reading. | Static check ensures focused clue reveal modals stay sparse. | auto checked |

## Key Nodes Checked

| Node | Expected Visual Result | Status |
|---|---|---|
| ch01_005 | Xu Zhixia recording/memory image, impact scale, head-safe halfbody, face focus | auto checked, needs manual visual confirm |
| ch01_007 | Xu Zhiwan wet entrance, centered, impact scale, three-quarter framing | auto checked, needs manual visual confirm |
| ch01_008 | Xu Zhiwan fullbody entrance, large scale, head-safe fullbody framing | auto checked, needs manual visual confirm |
| ch02_003 | Xu Zhiwan pressure closeup, bust framing, face focus | auto checked, needs manual visual confirm |
| ch03_011 | Zhou Yu pressure node should resolve a visible character | auto checked, needs manual visual confirm |
| ch04_020 | Zhou Yu horror/fullscreen pressure node, face framing | auto checked, needs manual visual confirm |
| ch05_011 | Xu Zhixia fear/recording closeup, head-safe bust framing | auto checked, needs manual visual confirm |
| ch05_016 | Zhou Yu horror fullscreen face framing | auto checked, needs manual visual confirm |
| ch06_020 | Ending archive scene and report entry point | auto checked, needs manual visual confirm |

## Remaining Manual Checks

- Verify on 375px, 390px, and 430px widths that character heads are not cropped.
- Verify the dialogue box does not cover core facial expressions on pressure shots.
- Verify story detail page feels quiet and pure, not like a marketing hero page.
- Verify clue reveal modals still feel sparse during a normal path.
- Verify wide desktop does not stretch reading text too far.

## Recommendation

Use `node scripts/check-ui-flow.mjs` before UI commits. For the next visual pass, capture screenshots from mobile and desktop viewports and compare against this report.

## Full Flow QA Addendum

The next QA layer is full story-flow playability. This pass does not change the audio system, does not restore TTS, and does not restore the story-detail hero image or chapter list. Use `node scripts/check-story-flow.mjs` together with the UI and data validators to confirm that the visual-novel shell still supports a complete start-to-ending playthrough.

## Reusable Asset Library

Visual assets now have a reusable-library index in `assets/asset-manifest.js`. Generic backgrounds and props are marked reusable, while named character portraits and story covers stay story-specific. `assets/visual-assets.js` keeps the existing scene keys and also exposes generic background keys so future stories can reuse location-style assets without binding to Rain Call node IDs.

## 2026-07-07 Rain Call First Story Focus

New story expansion is paused. This pass keeps the existing reusable asset library structure intact and focuses manual visual QA on `雨夜来电` only.

Priority visual checks:

- ch01_005, ch01_007, ch01_008, ch02_003, ch03_011, ch04_020, ch05_011, ch05_016, and ch06_020 must remain head-safe.
- Xu Zhiwan entrance and pressure shots should feel mature, cold, and visually forceful.
- Zhou Yu pressure nodes should not look like ordinary avatar cards.
- Xu Zhixia recording nodes should feel like old-case residue, not a normal standing portrait.
- Mobile 375px, 390px, and 430px widths still need human screenshot confirmation.
