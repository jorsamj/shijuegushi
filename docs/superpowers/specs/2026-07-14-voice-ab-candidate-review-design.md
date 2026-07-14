# Voice A/B Candidate Review Design

## Purpose

Create a local-only comparison workflow for existing XFYUN dialogue masters and
new Doubao Voice Synthesis Model 2.0 candidates. The workflow is for human
casting review only. It must not alter a story's runtime voice manifest,
replace a production WAV, or change playback behavior.

## Provider Boundary

- Legacy baseline: existing XFYUN WAV masters and their existing manifests.
- Candidate provider: only official Doubao Model 2.0 standard voices whose
  `voice_type` ends in `_uranus_bigtts` and is marked `verified` in
  `assets/volcengine-tts2-voice-catalog.json`.
- Excluded: all Model 1.0 `mars_bigtts` voices, Model 1.0 emotion enums, ICL
  rows, browser speech, and guessed speaker IDs.
- Model 2.0 requests use the verified `context_texts` direction mechanism.
  They do not include an `emotion` field unless a later, separately verified
  official Model 2.0 API reference authorizes it.

## Candidate Scope

Each major voiced role receives up to three real, already-pure dialogue lines:

1. calm or restrained;
2. uncertainty, suspicion, or early anomaly;
3. pressure, fear, conflict, grief, or a key decision.

Phone, recording, voice-message, and dormitory-broadcast sources are selected
separately because their in-world acoustics are part of the casting decision.
Narration, environment description, actions, system text, and any mixed node
are excluded.

## Candidate Data and Files

Candidate audio is written outside production masters:

`assets/voice-candidates/<story-id>/<role-id>/<node-id>/<provider>-<voice>.wav`

The accompanying candidate manifest records the story, role, node, source
type, spoken text hash, provider, model/resource ID, official `voice_type`,
context direction, adjacent-node context, duration, and generation status.
It never stores credentials. A candidate manifest is not imported by
`assets/voice-runtime-manifest.js`.

The existing XFYUN master is displayed as a baseline reference only. It is not
copied, deleted, overwritten, or promoted automatically.

## Casting and Performance Direction

Each role has one proposed Model 2.0 base voice for all of its candidate lines.
The same role does not switch voice providers or base timbres line by line.
The candidate request varies only its verified Model 2.0 contextual direction:
current chapter, known facts, relationship pressure, danger level, adjacent
line, and sound source. This supports natural pauses and restrained escalation
without inventing an API emotion parameter.

Dormitory broadcast remains calm, clear, institutional, and without newsreader
cadence. Rain Call emphasizes real phone exchange, old-recording pressure, and
urban suspicion rather than a universal horror delivery.

## Local A/B Review

The local-only `tools/voice-review/` page gains a candidate mode. For each
selected line it presents the XFYUN baseline and one or more Model 2.0
candidates side by side, stopping the previous track before a new one plays.
It exposes text, spoken text, role, node, chapter, source type, provider,
voice type, direction, and adjacent context.

Reviewers can locally record a recommendation, confidence, and notes about
character fit, scene fit, conversational naturalness, excessive restraint,
overacting, continuity, and source credibility. Review data stays in browser
storage or an exported JSON file. It does not write a release sign-off or alter
runtime assets.

## Failure Handling

- Missing Volcengine environment variables stop candidate generation before a
  request is made.
- An unverified, non-Model-2.0, or duplicate candidate voice stops generation.
- A node that is not a pure audible line is rejected.
- A failed request leaves the baseline untouched and records only a safe error
  status without credentials or request headers.
- No candidate file is served by production navigation or GitHub Pages entry
  points.

## Verification

Automated checks must confirm:

- every candidate `voice_type` is a verified `_uranus_bigtts` catalog entry;
- no Model 1.0 `mars_bigtts` or `emotion` parameter reaches a candidate
  request;
- every candidate line maps to one pure audible node and its current
  `spokenText` hash;
- candidate paths are separate from voice-original and the runtime manifest;
- the review page remains local-only and does not promote a score;
- narration remains excluded.

Human review is still required before selecting a provider for any role. The
current Draft PR remains Draft, with no main merge or Pages publication.
