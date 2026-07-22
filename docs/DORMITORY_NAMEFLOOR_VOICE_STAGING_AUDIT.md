# Dormitory Namefloor Voice Staging Audit

Audit date: 2026-07-22

## Frozen Target Set

The canonical input is the union of `story-data.js` chapter 1 nodes and the
separate `story-chapters-2-7.js` expansion nodes. It contains 21 audible
targets: 16 dialogue lines, 4 door voices, and 1 in-world campus broadcast.

Silent material excluded from the target set: 305 narration nodes, 8 phone-text
nodes, and 41 system/choice nodes. No phone display text, narrator text, action
description, or UI copy was admitted as speech.

The complete line-by-line frozen mapping, source labels, and SHA-256 text hashes
are in `assets/stories/dormitory-namefloor/voice-staging/voice-audit.json`.

## Speaker And Source Mapping

| Speaker | Source label | Targets |
| --- | --- | ---: |
| 宋明 | 现场对白 | 1 |
| 林峰 | 现场对白 | 2 |
| 周朝阳 | 现场对白 / 周朝阳 | 6 |
| 谷雨 | 现场对白 / 谷雨 | 4 |
| 门外的声音 | 门外的声音 | 2 |
| 门外的女声 | 门外的女声 | 2 |
| 红色马甲宿管 | 现场对白 | 1 |
| 吴阿姨 | 吴阿姨 | 2 |
| 校园广播 | 校园广播 | 1 |

## Staging Gate Result

`VOLC_TTS_API_KEY` and `VOLC_TTS_RESOURCE_ID` were present, but generation was
not invoked. The committed SeedTTS2 generator only accepts the legacy
`dormitory` and `rain-call` stories, and the committed casting manifest contains
no `script_dormitory_namefloor` casting or source-to-`uranus_bigtts` mapping.

The local catalog contains verified `uranus_bigtts` voices, but none are safely
assigned to the nine namefloor speaker sources. Assigning one here would invent
a formal casting; reusing a legacy female-dorm casting would violate canon.

Generation result: 0 generated, 0 failed, 0 retry. No WAV files were created,
so audio-file validation is correctly not applicable. The audit validates all
21 target IDs, content types, spoken text values, source labels, and text hashes
against the two canonical source modules.
