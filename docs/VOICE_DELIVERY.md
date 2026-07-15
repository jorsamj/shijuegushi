# Story Voice Delivery

Provider: Volcengine Doubao Voice Synthesis Model 2.0, HTTP unidirectional API.

Sensitive configuration is read from local environment variables at generation
time and is never written to source, logs, manifests, or documentation.

## Delivery Layout

| Story | Formal manifest | Formal master directory | Runtime mapping |
|---|---|---|---|
| Rain Call | `assets/stories/rain-call/audio/voice-manifest.json` | `assets/stories/rain-call/audio/voice-original/` | `assets/voice-runtime-manifest.js` |
| Dormitory Rules | `assets/stories/dormitory-rollcall/audio/voice-manifest.json` | `assets/stories/dormitory-rollcall/audio/voice-original/` | `assets/voice-runtime-manifest.js` |

Generated formal assets:

- Rain Call: 105 current audible node WAVs
- Dormitory Rules: 19 current audible node WAVs
- Dormitory institutional broadcasts: 14 independent WAV cues
- Total runtime-formal Volcengine WAVs: 138

All formal files are 24 kHz mono PCM WAV masters with no baked-in background
music. Source treatment such as telephone, old recording, or broadcast is
controlled by per-line `context_texts` and runtime mixing/lifecycle rules.

## Legacy Archive

Previous XFYUN voice masters are retained in timestamped
`voice-legacy-xfyun-*` directories as rollback evidence. They are not referenced
by the formal runtime manifest.

## Release State

The formal runtime switch is complete, but release remains blocked until these
manual gates are filled with real results:

1. Headphone listening sign-off.
2. Desktop-speaker listening sign-off.
3. Phone-speaker listening sign-off.
4. All 14 institutional-broadcast order and cadence confirmation.
5. Cross-story save/load isolation test.
6. Dormitory mobile six-chapter and four-ending playthrough.
7. Rain Call full manual regression.
8. Mobile background restore.
9. Console no-error verification.

Do not mark PR #6 ready, merge `main`, or publish GitHub Pages until those
manual records are complete.
