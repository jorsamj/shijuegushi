# Volcengine TTS 2.0 Official Evidence Import

## Why This File Exists

The official Volcengine voice-list page was opened in a visual browser on
2026-07-14, but its rendered content could not be read reliably from the
browser session. No Model 2.0 speaker ID, emotion enum, or compatibility data
has been copied into this repository.

This is intentionally a safe stop. Do not add speaker IDs from blogs, search
results, screenshots without source context, or guessed names.

Official source page:

`https://docs.volcengine.com/docs/6561/1257544?lang=zh`

## One-Time Import Options

Use either option below while viewing the official page in Chrome. Include only
the section headed `Doubao Voice Synthesis Model 2.0` (or its Chinese official
equivalent) and its official emotion or parameter description.

### Option A: Print The Official Page To PDF

1. Open the official source page in Chrome.
2. Find `Doubao Voice Synthesis Model 2.0`.
3. Expand or scroll through the complete Model 2.0 voice table and emotion
   description so lazy-loaded entries are present.
4. Print the page to PDF and save it exactly here:

   `docs/official/volcengine-tts2/volcengine-tts2-official.pdf`

### Option B: Copy The Official Section

1. Open the official source page in Chrome.
2. Copy the complete Model 2.0 voice table and the exact official text that
   describes emotion, emotion compatibility, intensity, and request fields.
3. Save the copied content as UTF-8 text exactly here:

   `docs/official/volcengine-tts2/manual-official-copy.txt`

## Required Evidence In The Imported Material

- Official voice display name and speaker ID.
- Explicit Model 2.0 attribution.
- Supported language and use-case information, when provided.
- Official emotion field name and exact enum values, when provided.
- Per-speaker emotion restrictions, when provided.
- Intensity or other emotional-control parameters, their request location, and
  allowed ranges, when provided.

Do not include API keys, cookies, authorization headers, console account
details, or user-identifying screenshots.

## Next Step

Once either file exists, the project can generate the official evidence record,
the verified voice catalog, and a compatibility check without guessing any
speaker ID or emotion value. This import alone does not authorize voice
generation or change the production voice runtime.
