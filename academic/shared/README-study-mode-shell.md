# Reading Study Mode shell foundation

This folder contains reusable, static Study Mode assets for Academic Reading pages.

## Shared ownership

The shared shell owns common chrome and styling: the Score guide / Study mode / Study time header chrome, compact strategy button, Show answers & feedback control, strategy panels, task result lines, feedback cards, neutral clue buttons, evidence highlight focus/pulse states, and passage clue toolbar styling.

## Page ownership

Each test page keeps passages, questions, answer controls, answer keys, scoring, task-group mappings, feedback copy, exact evidence strings, and question-type-specific answer logic local to that test.

## Adapter contract for future Reading tests

A page integrating the shared shell calls `ReadingStudyShell.init(adapter)` and uses the returned controller for Study chrome, group evidence, Show all / Hide all passage clues, and clue focus lifecycle. The adapter should provide these stable hooks or equivalent data:

- `getMode()` returns `"study"` or `"test"`.
- `getTaskGroups()` returns group IDs, passage numbers, labels and question numbers.
- `showGroupFeedback(groupId)` and `hideGroupFeedback(groupId)` reveal or hide local feedback cards.
- `markEvidence(questionNumber)` marks the exact passage clue string for that question.
- `clearEvidence()` clears visible passage clue marks before a controller re-render.
- `focusQuestionClue(questionNumber)` focuses/pulses a single clue without clearing existing visible group clues.
- The returned controller owns Show all / Hide all passage-clue state and restores only currently revealed group evidence when a full map is hidden.
- `getActivePassage()` returns the passage/part whose clue toolbar is active.
- `isSubmitted()` and `isStudyMode()` keep Study-only controls inert in active Test Mode.

No build system, framework, external dependency or CDN is required.
