# Formal Voice And Dialogue Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace unsuitable formal dialogue voices in both stories with scene-appropriate Doubao Model 2.0 deliveries, while narration remains silent and PR #6 stays Draft.

**Architecture:** Story data remains the source of truth for pure dialogue and `spokenText`. A formal delivery manifest owns only verified Model 2.0 `uranus_bigtts` WAVs. The runtime manifest is rebuilt exclusively from that delivery manifest, so legacy XFYUN masters remain archival and cannot become hidden playback fallbacks.

**Tech Stack:** Static JavaScript story data, Node.js, WebSocket Doubao TTS 2.0, WAV assets, browser runtime manifests, Node QA scripts.

---

## File Structure

- Modify `story-data.js` for Rain Call dialogue purity and performance directions.
- Modify `assets/stories/dormitory-rollcall/story-data.js` for Dormitory pure dialogue, tension, and character exchanges without new routes, rules, or endings.
- Modify `assets/voice-casting-manifest.js` for one verified Model 2.0 base voice per speaking role.
- Modify `scripts/generate-volcengine-story-voices.mjs` to validate formal casting and emit formal delivery records.
- Modify `scripts/refresh-voice-runtime.mjs` and generated `assets/voice-runtime-manifest.js` for strict runtime promotion.
- Modify `scripts/check-dialogue-purity.mjs`, `scripts/check-voice-assets.mjs`, and `scripts/check-voice-lifecycle.mjs`.
- Create `scripts/check-formal-volcengine-voice-contract.mjs` for Model 2.0-only formal validation.
- Create `docs/FORMAL_VOICE_CASTING.md` for final casting, source treatment, and factual manual sign-off state.

### Task 1: Add Formal-Voice Contract Tests

**Files:** Create `scripts/check-formal-volcengine-voice-contract.mjs`; modify `scripts/check-dialogue-purity.mjs`.

- [ ] Write a failing contract assertion that accepts only a `voiceType` present in `assets/volcengine-tts2-voice-catalog.json`, ending in `_uranus_bigtts`, with `model: "seed-tts-2.0"`.
- [ ] Reject `mars_bigtts`, `emotion`, `emotionIntensity`, unknown voice IDs, narration records, and runtime entries without a matching pure audible node.
- [ ] Run `node scripts/check-formal-volcengine-voice-contract.mjs` before delivery exists. Expected: failure because no formal delivery is available.
- [ ] Preserve `node scripts/check-dialogue-purity.mjs` assertions: narration and system nodes use `voiceEnabled: false` without `spokenText`; an audible node has one allowed content type and matching displayed/spoken text.
- [ ] Commit: `git add scripts/check-formal-volcengine-voice-contract.mjs scripts/check-dialogue-purity.mjs && git commit -m "test: enforce formal voice contract"`.

### Task 2: Clean Dialogue And Escalate Existing Dramatic Beats

**Files:** Modify `story-data.js` and `assets/stories/dormitory-rollcall/story-data.js`.

- [ ] Run `node scripts/check-dialogue-purity.mjs` and use its explicit node IDs as the rewrite checklist.
- [ ] Split every mixed beat into adjacent nodes: narration carries action/environment and is silent; each dialogue, phone, recording, or broadcast node carries exactly one source's spoken words and matching `spokenText`.
- [ ] Keep every Dormitory rule, clue, choice, route, ending, 319/320 fact, five/four conflict, Xu Tang, Zhou Wanning, and hidden correction rule. Improve only existing beats using short exchanges, interruption, hesitation, correction, memory loss, and unresolved questions.
- [ ] Keep Rain Call plot logic, phone distance, recording pressure, and gradual suspicion. Do not reveal Zhou Yu early or convert every line into horror delivery.
- [ ] After each batch run `node scripts/validate-story-data.mjs`, `node scripts/check-story-flow.mjs`, `node scripts/check-dialogue-purity.mjs`, and `node scripts/check-multi-story.mjs`. Expected: exit 0.
- [ ] Commit: `git add story-data.js assets/stories/dormitory-rollcall/story-data.js scripts/check-dialogue-purity.mjs && git commit -m "refactor: separate spoken dialogue from narration"`.

### Task 3: Define One Formal Model 2.0 Base Voice Per Role

**Files:** Modify `assets/voice-casting-manifest.js`; create `docs/FORMAL_VOICE_CASTING.md`.

- [ ] Map every real speaking role, but never a narrator, to exactly one verified formal record: provider `volcengine-doubao-tts-websocket`, model `seed-tts-2.0`, and one verified `uranus_bigtts` `voiceType`.
- [ ] Write a role-specific `contextProfile`: Dormitory begins with everyday uncertainty, escalates through conflict into restrained decision; the broadcast stays calm, clear, institutional, local-PA-like, and not newsreader-like. Rain Call stays urban, telephone-grounded, and pressure-driven.
- [ ] Treat telephone, recording, message, and broadcast as source context rather than a new actor voice. The base timbre remains identifiable across the role's chapters and endings.
- [ ] Do not select a voice by its display name alone. Check its verified catalog scene/language, role age/identity, and actual dialogue constraints.
- [ ] Run `node scripts/check-formal-volcengine-voice-contract.mjs`. Expected: valid maps pass; any guessed, Model 1.0, or unverified map fails.
- [ ] Commit: `git add assets/voice-casting-manifest.js docs/FORMAL_VOICE_CASTING.md scripts/check-formal-volcengine-voice-contract.mjs && git commit -m "feat: define formal story voice casting"`.

### Task 4: Generate Formal Model 2.0 Delivery

**Files:** Modify `scripts/generate-volcengine-story-voices.mjs`; modify both story `audio/voice-manifest.json` files; generate WAVs under their existing `audio/voice-original/` directories.

- [ ] Make the generator load the catalog and reject a role whose `voiceType` is not verified `uranus_bigtts`.
- [ ] Build Model 2.0 requests with only `speaker`, existing formal resource/model fields, audio fields, language, and verified `context_texts` carrying role profile, current direction, scene state, known information, danger level, and adjacent context.
- [ ] Do not serialize, send, or infer `emotion`, emotion strength, Model 1.0 fields, browser TTS, or XFYUN fallback.
- [ ] Require local environment credentials. Run `node scripts/generate-volcengine-story-voices.mjs --story=rain-call --force` then `node scripts/generate-volcengine-story-voices.mjs --story=dormitory --force`.
- [ ] If API credentials, model authorization, a required speaker map, or a synthesis request fails, stop before refreshing runtime mappings and report exact node IDs without credentials or headers.
- [ ] Run `node scripts/check-voice-assets.mjs`. Expected: all pure audible nodes have matching formal Model 2.0 WAVs and spoken-text hashes.
- [ ] Commit: `git add scripts/generate-volcengine-story-voices.mjs assets/stories/rain-call/audio assets/stories/dormitory-rollcall/audio && git commit -m "feat: generate formal model2 story voices"`.

### Task 5: Promote Only Valid Formal Assets

**Files:** Modify `scripts/refresh-voice-runtime.mjs`, generated `assets/voice-runtime-manifest.js`, and `scripts/check-voice-lifecycle.mjs`.

- [ ] Promote an entry only when it is generated, belongs to the correct story, has a verified formal Model 2.0 provider/model/voice type, matches the current `spokenText` hash, and its WAV exists.
- [ ] Rebuild with `node scripts/refresh-voice-runtime.mjs`. The result must omit narration, ending narration, XFYUN entries, stale text, and missing files.
- [ ] Run `node scripts/check-voice-lifecycle.mjs`, `node scripts/check-dialogue-purity.mjs`, and `node scripts/check-formal-volcengine-voice-contract.mjs`.
- [ ] Confirm that node changes, story changes, save/load, restart, and archive return stop old dialogue audio; an audio error never blocks progression.
- [ ] Commit: `git add scripts/refresh-voice-runtime.mjs assets/voice-runtime-manifest.js scripts/check-voice-lifecycle.mjs scripts/check-formal-volcengine-voice-contract.mjs && git commit -m "feat: promote formal model2 voices at runtime"`.

### Task 6: Regression And Draft Gate

**Files:** Modify `docs/FORMAL_VOICE_CASTING.md` only for factual delivery status.

- [ ] Run `node --check script.js`, `node --check story-data.js`, `node --check assets/stories/dormitory-rollcall/story-data.js`, `node scripts/check-story-flow.mjs`, `node scripts/check-multi-story.mjs`, `node scripts/check-dialogue-purity.mjs`, `node scripts/check-formal-volcengine-voice-contract.mjs`, `node scripts/check-voice-assets.mjs`, `node scripts/check-voice-lifecycle.mjs`, and `node scripts/check-production-readiness.mjs`.
- [ ] Browser-check voiced nodes in both stories, story switch, save/load, restart, and shelf return. Confirm old audio stops and failures do not block play.
- [ ] Keep headphone, desktop-speaker, mobile-speaker, mobile background-resume, two-story save/load, and console-error proof pending until a human records them. Never infer manual sign-off from automated checks.
- [ ] Commit factual documentation and push only `codex/dormitory-rules-story`. Do not merge `main`, publish GitHub Pages, or mark PR #6 ready.

## Plan Self-Review

- The plan covers dialogue purity, existing-story dramatic improvements, formal casting, generation, runtime promotion, and release gates.
- It forbids Model 1.0 `mars_bigtts` and its `emotion` parameters from Model 2.0 `uranus_bigtts` requests.
- It never adds rules, characters, endings, scenes, gameplay, a main merge, or a Pages release.

