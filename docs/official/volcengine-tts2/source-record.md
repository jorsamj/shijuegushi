# Official Source Record: Volcengine TTS 2.0 Voices

## Source

- Official URL: `https://docs.volcengine.com/docs/6561/1257544?lang=zh`
- Evidence supplied by the project owner: official page PDF export.
- Retrieval date: 2026-07-14.
- Update timestamp displayed in the PDF: 2026-07-13 10:25:43.
- Scope retained in the catalog: standard `voice_type` rows under the official
  Doubao Voice Synthesis Model 2.0 heading only.

## Saved Evidence

- Original official PDF export: used locally for extraction but not committed,
  because page chrome can contain account identity.
- `raw-official-content.txt`: UTF-8 extraction of all eight PDF pages.
- `page-full.png`: sanitized document-content crop showing the Model 2.0
  heading and table. Browser account chrome is excluded.
- `voice-table.png`: readable crop of the official Model 2.0 table.
- `emotion-section.png`: official evidence that the fixed emotion parameter
  list appears beneath the Model 1.0 heading, not the Model 2.0 heading.

## Verification Outcome

The exported PDF provides 93 standard Model 2.0 voice types, including 90
Chinese voice types. It explicitly provides their display names, `voice_type`,
official scene, language, and instruction-following capability.

The PDF does not provide a Model 2.0 fixed emotion enum, request-body field
location, intensity range, or per-voice emotion compatibility. The visible
fixed emotion list belongs to the Model 1.0 section. It is deliberately not
carried into the Model 2.0 catalog.

No credentials, browser cookies, account information, or request headers were
saved in this directory.
