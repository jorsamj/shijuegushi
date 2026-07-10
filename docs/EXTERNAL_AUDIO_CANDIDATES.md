# Audio Source Policy

The runtime source policy is `library-plus-three-cc0-exceptions`.

- Default: selected files from `D:\lab\gushi\音效`, copied to `assets/library/audio/reconstructed`.
- Allowed exceptions only: rain, modern phone call/vibration, and message notification.
- Rejected: `game01`, `openclose01 (1)`, legacy processed assets, generated fallback assets, browser narration, character imitation, UI reward sounds, and semantic substitutions.
- If a cue has no precise source, the scene uses visual feedback and silence.
