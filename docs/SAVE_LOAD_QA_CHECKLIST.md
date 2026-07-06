# Save / Load QA Checklist

| Scenario | Operation | Expected Result | Status |
|---|---|---|---|
| New game start | Start from the story detail page | State resets to `ch01_001`; no old ending remains | pending manual confirm |
| Chapter 1 autosave | Reach the first choice in Chapter 1 | Current node, history, clues, flags, and relationships are saved | pending manual confirm |
| Refresh continuation | Refresh the browser mid-chapter and continue | The same node and current state are restored | pending manual confirm |
| Choice branch then load | Save before a choice, choose another branch, then load | Loaded slot restores the saved node and previous state | pending manual confirm |
| Clue then load | Save before a clue, gain the clue, then load | Clue list and unread clues match the save slot | pending manual confirm |
| Relationship restore | Make a relationship-changing choice, save, reload | Relationship values and recent events are restored | pending manual confirm |
| Ending restart | Reach any ending, then restart | Node returns to `ch01_001`; old ending state is cleared | pending manual confirm |
| Sound setting persistence | Toggle sound setting and refresh | Sound setting follows local settings without forcing narration | pending manual confirm |
| History restore | Save and load after several dialogue nodes | History reflects the loaded route and does not duplicate entries | pending manual confirm |
| Manual save slots | Save into all three slots and load each | Each slot shows its own node summary and clue count | pending manual confirm |

## Static Coverage

`scripts/check-story-flow.mjs` checks that normalized progress includes node, ending, clues, unread clues, relationships, relationship events, ending path tags, and history. It also checks the runtime history cap.
