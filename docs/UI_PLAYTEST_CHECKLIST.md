# UI Playtest Checklist

This checklist is for the current playable visual novel prototype. Audio is frozen for this pass.

| Page / Flow | Check Item | Pass Standard | Status |
|---|---|---|---|
| Home | Brand and story archive entry | Shows Second Life / life archive feeling, no old brand wording | pending manual confirm |
| Home | Story cards | Open story is clear; sealed stories look intentional, not broken | pending manual confirm |
| Story detail | Top hero image | No large top hero image, no carousel, no chapter cover strip | auto checked |
| Story detail | Content scope | Shows LIFE FILE, story name, one-line hook, tags, props, start/continue/restart | auto checked |
| Story detail | Chapter directory | No chapter list or chapter preview row appears here | auto checked |
| Start game | Entry action | Start/continue enters the story cleanly | pending manual confirm |
| Chapter 1 opening | Reading comfort | Text is readable and not cramped | pending manual confirm |
| Dead call | Visual impact | ch01_005 shows Xu Zhixia as a strong memory/recording image without cropped head | auto checked, pending visual confirm |
| Xu Zhiwan entrance | Character framing | ch01_007/ch01_008 use centered, head-safe large/impact framing | auto checked, pending visual confirm |
| Chapter 2 door conflict | Pressure shot | ch02_003 uses closeup/bust/head-safe framing | auto checked, pending visual confirm |
| Chapter 4 photo | Photo investigation | ch04 photo nodes use photo scene and investigation pacing | pending manual confirm |
| Chapter 5 old phone | Recording pressure | ch05_011 and ch05_016 use strong visual character framing | auto checked, pending visual confirm |
| Chapter 6 ending | Ending readability | Ending report is readable and explains path | pending manual confirm |
| Clue library | Interrupt level | Focused clue reveal count stays sparse; regular clues enter library | auto checked |
| Mobile 375px | Layout | No text overflow, choices tap comfortably, characters do not lose heads | pending manual confirm |
| Mobile 390px | Game screen | Topbar is compact; dialogue box does not consume the whole screen | pending manual confirm |
| Mobile 430px | Story detail | No large image or chapter carousel; actions are easy to tap | pending manual confirm |
| Desktop 1366x768 | Game screen | Scene, character, and dialogue are balanced | pending manual confirm |
| Desktop 1440x900 | Game screen | Reading width and character scale stay visual-novel-like | pending manual confirm |
| Desktop 1920x1080 | Wide layout | Content does not feel like a backend dashboard or stretch too wide | pending manual confirm |

Run:

```bash
node scripts/check-ui-flow.mjs
node scripts/validate-story-data.mjs
```

## Full Flow QA Addendum

This project is now in full playability QA. Audio remains frozen, ordinary story text still does not auto-read, and the story detail page must stay in the clean LIFE FILE style without a large hero image or chapter directory.

Additional command:

```bash
node scripts/check-story-flow.mjs
```
