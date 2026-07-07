# Story Flow QA Report

## Scope

This pass checks full playability for Second Life: Rain Call without changing the audio system, UI structure, six-chapter story shape, six formal clues, or A/B/C/D ending framework.

## Automated Checks

Command:

```bash
node scripts/check-story-flow.mjs
```

Expected coverage:

| Item | Result |
|---|---|
| Total nodes | 120 |
| Reachable nodes | 120 |
| Unreachable nodes | 0 |
| Chapter count | 6 |
| Formal clue count | 6 |
| Required endings | ending_a, ending_b, ending_c, ending_d |
| Choice nodes | 18 |
| Deduction nodes | 5 |
| Dead-end nodes | 0 expected |
| No-exit cycles | 0 expected |

## Chapter Flow

| Flow | Expected Result | Status |
|---|---|---|
| ch01_001 to chapter_02 | Chapter 1 advances naturally into Chapter 2 | auto checked |
| chapter_02 to chapter_03 | Chapter 2 advances naturally into Chapter 3 | auto checked |
| chapter_03 to chapter_04 | Chapter 3 advances naturally into Chapter 4 | auto checked |
| chapter_04 to chapter_05 | Chapter 4 advances naturally into Chapter 5 | auto checked |
| chapter_05 to chapter_06 | Chapter 5 advances naturally into Chapter 6 | auto checked |
| chapter_06 to resolveEnding | Final chapter reaches automatic ending resolution | auto checked |

## Clue QA

The checker verifies that every `gainClues` reference exists in `DATA.clues`, and that every formal clue can be obtained through the reachable story graph.

| Clue | Expected |
|---|---|
| clue_dead_call | obtainable |
| clue_sister_mark | obtainable |
| clue_gray_loan | obtainable |
| clue_zhou_left | obtainable |
| clue_photo_background | obtainable |
| clue_timed_voice | obtainable |

## Relationship and State QA

The checker verifies:

- `relationshipEffects.id` only uses `trust_zhuwan`, `support_chenyan`, `suspicion_zhou`, or `courage_linzou`.
- Relationship deltas are numeric.
- Simulated relationship values remain within `-100` to `100`.
- `setFlags` references exist in `DATA.defaultFlags`.
- `endingPathTags` are non-empty strings.
- `trust_xuzhiwan` is not mixed with `trust_zhuwan`.

## Save / Load Static QA

The checker verifies that the runtime keeps normalized state fields for:

- Current node
- Ending id
- Clues and unread clues
- Flags
- Relationships and relationship events
- Ending path tags
- History

History is capped at 240 entries in runtime code.

## This Pass

No story rewrite was performed in this QA pass. The new checker is designed to catch regressions before manual playthrough.

## 2026-07-07 Rain Call First Story Focus

New story expansion, story scaffolds, and second-story work are paused. This pass focuses only on making `第二人生：雨夜来电` a complete first playable demo.

Automated QA must continue to prove:

- Chapter 1 through Chapter 6 can be played in order.
- ending_a, ending_b, ending_c, and ending_d remain reachable.
- Six formal clues remain obtainable.
- Relationship values, flags, history, and save/load state stay normalized.
- Ordinary narration and ordinary dialogue do not auto-read.

## Remaining Manual QA

| Area | Manual Check |
|---|---|
| Save slots | Save in Chapter 1, load in Chapter 4, then continue to an ending |
| Refresh recovery | Refresh after a clue and verify current node, clues, unread state, and relationships |
| Ending report | Confirm the displayed path explanation matches the route played |
| Fast clicking | Rapidly click choices and continue buttons to confirm no state duplication |
