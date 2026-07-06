# Ending Paths QA

This document records the expected route shape for the four current endings. It is paired with `scripts/check-story-flow.mjs`, which simulates one representative route for each ending.

| Ending | Theme | Key Conditions | Choice Tendency | Reachability | Notes |
|---|---|---|---|---|---|
| ending_a | Truth Restart | Evidence chain includes gray loan, Zhou leaving, photo background, timed voice; evidence is backed up; case is reopened; deduction score is at least 4 | Preserve evidence, answer final deductions correctly, choose to reopen the case | auto checked | Best-progress route. C ending still has priority if evidence is deleted without backup. |
| ending_b | Evidence Out Of Control | Original photo is handed away while identity verification, backup, or timed-call understanding has a gap | Trust transfer of evidence more than evidence control | auto checked | Representative route gives away the original photo and reaches automatic B resolution. |
| ending_c | Deleted Evidence | `deleted_evidence = true` and `backed_up_photo !== true` | Delete evidence under pressure | auto checked | Highest-priority failure route before A and B checks. |
| ending_d | Unanswered | Does not satisfy A/B/C, or deduction / final action is insufficient | Avoid final action, answer deductions poorly, or do not reopen the case | auto checked | Default route for incomplete truth or avoidance. |

## Simulated Route Notes

| Route | Representative Behavior | Expected Result |
|---|---|---|
| A route | Choose backup, answer all deduction questions correctly, choose to reopen the case | ending_a |
| B route | Give away the original photo and preserve a gap in evidence control | ending_b |
| C route | Delete evidence before a valid backup exists | ending_c |
| D route | Avoid the final truth path and fail deduction pressure | ending_d |

## Manual Confirmation

Manual playtesting should confirm that the final report text remains understandable and does not feel like a raw system log.
