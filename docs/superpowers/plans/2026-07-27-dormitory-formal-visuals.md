# Dormitory Formal Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and safely integrate the first formal visual asset library for the completed new dormitory story.

**Architecture:** Generated assets live in an isolated `formal` namespace and are catalogued by a manifest and generation audit. Existing map/CSS surfaces select formal images when they load and retain procedural fallbacks on failure. A focused static validator guards namespace, mapping and ending uniqueness.

**Tech Stack:** Static HTML/CSS/JavaScript, WebP/PNG image assets, Node.js QA, Git Data API.

---

### Task 1: Formal visual contract

**Files:**
- Create: `assets/stories/dormitory-namefloor/formal/visual-manifest.js`
- Create: `docs/DORMITORY_FORMAL_VISUAL_ASSET_AUDIT.md`
- Create: `scripts/check-dormitory-namefloor-formal-visuals.mjs`

- [ ] Write a failing validator that expects a manifest, unique E1–E8 ending images, non-empty formal paths, new-story-only identifiers and no player-visible phone text baked into assets.
- [ ] Run the validator and confirm it fails because the manifest and asset entries do not exist.
- [ ] Create the manifest/audit contract with stable English IDs, required asset metadata, generation model/source record, image dimensions and runtime mapping slots.
- [ ] Run the validator and confirm it reaches only the expected missing-bitmap failure.

### Task 2: Produce and audit visual assets

**Files:**
- Create: `assets/stories/dormitory-namefloor/formal/characters/*`
- Create: `assets/stories/dormitory-namefloor/formal/backgrounds/*`
- Create: `assets/stories/dormitory-namefloor/formal/props/*`
- Create: `assets/stories/dormitory-namefloor/formal/phone/*`
- Create: `assets/stories/dormitory-namefloor/formal/endings/*`

- [ ] Generate reusable new-story character masters and controlled variants using the approved visual brief; remove chroma keys only for character/prop transparency and record alpha verification.
- [ ] Generate clean reusable backgrounds, physical props and media-only phone components without names, rules or messages.
- [ ] Generate eight independent ending tableaus without title or dialogue text.
- [ ] Verify each asset has expected dimensions, nonzero byte size, no empty alpha frame, stable ID and audit record.

### Task 3: Runtime integration

**Files:**
- Modify: `assets/stories/dormitory-namefloor/story-asset-map.js`
- Modify: `assets/stories/dormitory-namefloor/runtime-visuals.css`
- Modify: `script.js` only if an image load fallback cannot be expressed in the map/CSS

- [ ] Add failing map assertions to the validator for character variants, representative chapter scenes, phone media and E1–E8 image paths.
- [ ] Wire the manifest into the asset map while preserving all scene IDs, effects, content and fallback paths.
- [ ] Add formal-image layer styles that honor current safe zones, reduced motion and image-error fallback without altering phone/dialogue controls.
- [ ] Run the validator and confirm formal map checks pass.

### Task 4: Verification and handoff

**Files:**
- Modify: `docs/DORMITORY_FORMAL_VISUAL_ASSET_AUDIT.md`

- [ ] Run syntax, formal visual, seven-chapter, eight-ending, content-purity, mobile composition, lifecycle and multi-story checks.
- [ ] Run a local browser at 360×640, 390×844, 430×932 and 1440×900; capture development verification screenshots and list any remaining human visual-signoff gaps.
- [ ] Confirm `git diff --check`, file hashes, clean isolation of Rainy Night Call and no formal audio assets.
- [ ] Commit and atomically publish with Git Data API only after remote head re-verification and blob equality checks.
