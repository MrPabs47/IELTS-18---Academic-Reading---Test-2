# Reading Study Mode shell foundation

This folder contains reusable, static Study Mode assets for Academic Reading pages.

## Shared ownership

The shared shell owns common chrome and styling: the Score guide / Study mode / Study time toolbar, compact strategy button, Show answers & feedback control, strategy panels, task result lines, feedback cards, neutral clue buttons, evidence highlight focus/pulse states, and passage clue toolbar styling.

## Page ownership

Each test page keeps passages, questions, answer controls, answer keys, scoring, task-group mappings, feedback copy, exact evidence strings, and question-type-specific answer logic local to that test.

## Adapter contract for future Reading tests

A page integrating the shared shell should provide these stable hooks or equivalent data:

- `getMode()` returns `"study"` or `"test"`.
- `getTaskGroups()` returns group IDs, passage numbers, labels and question numbers.
- `showGroupFeedback(groupId)` and `hideGroupFeedback(groupId)` reveal or hide local feedback cards.
- `getEvidenceText(questionNumber)` returns the exact passage clue string for that question.
- `focusQuestionClue(questionNumber)` ensures a single clue is visible, scrolls to it and pulses it without clearing existing visible clues.
- `getScore()` returns current score data for score-guide rendering.
- `getActivePassage()` returns the passage/part whose clue toolbar is active.

No build system, framework, external dependency or CDN is required.
