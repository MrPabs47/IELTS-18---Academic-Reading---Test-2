# Reading feedback parity contract

This contract protects a single, recognisable Reading experience across all IELTS Academic Reading tests.

## Source of truth

- Test 1 and Test 2 are the visual and behavioural references.
- The reusable implementation is `reading-study-shell.css` and `reading-study-shell.js`.
- A future test may provide different passages, questions, answers, explanations and evidence strings, but it must not invent a different feedback flow.

## Ownership

### Shared shell owns

- Study Mode chrome and visibility rules.
- Compact `ⓘ` strategy control.
- `Show answers & feedback` / `Hide answers & feedback` control.
- Strategy panel layout.
- Group result-line layout.
- Correct, incorrect and unanswered feedback-card styling.
- Passage-clue button, evidence highlights, focus/pulse state and numbered return badges.
- Score-guide and review-chrome styling.

### Individual test owns

- Passage and question markup.
- Question-group mapping.
- Answer keys and accepted alternatives.
- The existing scoring engine and partial-credit rules.
- A single page-owned answer reader and correctness evaluator.
- Explanations, skill labels and exact evidence snippets.

The shared layer must never create a second scoring implementation that can disagree with the test engine.

## Required Study Mode behaviour

### Fresh Study Mode

- Study Mode pill and elapsed Study timer are visible.
- Strategy and reveal controls are visible beside the existing instruction text.
- No feedback cards, group scores, inline correct-answer text or top-bar score are visible.

### Revealing one group

- Clicking `Show answers & feedback` shows the group result and one card per question.
- The button changes to `Hide answers & feedback` and remains available in Study Mode.
- Clicking `Hide answers & feedback` removes the group cards and result.
- A later `Show answers & feedback` rebuilds the cards using the student's current answers.
- Feedback cards must always use the test-owned answer reader. A blank answer is always `Not answered · 0 points`.

### Full Study check

- The page-owned scoring engine evaluates all answers once.
- The overall score and band appear only after that full check.
- All task-group feedback is revealed.
- Individual reveal controls are hidden because review is now complete.
- Duplicate inline `Correct answer:` feedback must not appear alongside the cards.

## Required Test Mode behaviour

### Before submission

- No Study timer, Study pill, strategy control, reveal control, feedback card, score guide, answer key or score feedback.

### After submission

- The page-owned scoring engine remains the source of the final result.
- Review chrome becomes available only after the standard result flow.
- Full review cards are visible.
- Study Mode pill and Study timer remain hidden.

## Feedback-card contract

Each question card contains only the established fields:

1. Question number
2. Your answer
3. Correct answer
4. Why
5. Skill
6. Passage clue button

Status treatment:

- Correct: green card and green status text.
- Incorrect: red card and red status text.
- Unanswered: neutral card and muted status text.

## Feedback content quality

Length is a guide, not the goal. The explanation must help a student see exactly why the answer is right and how to repeat the method next time.

### Why

- Normally aim for about **28–55 words**.
- A very direct gap-fill answer may be shorter, but it must still identify the exact passage wording and explain the relevant grammar, paraphrase, contrast, word limit or distractor where useful.
- Avoid bare statements such as `The answer is in paragraph B.`
- Prefer a complete explanation: what the question needs, what the passage says, and why that wording produces the answer.

### Skill

- Normally use a specific, actionable phrase of about **6–14 words**.
- Name the reading action and the feature that matters, for example: `Using comparison grammar to select the exact word form`.
- Avoid generic labels such as `Reading for detail` or `Locating an exact word` unless they are expanded into a more precise skill.

### Content review rule

- Improve explanation and Skill text one approved question group at a time.
- Before merge, complete a final content pass across every Test 3 group so earlier approved UI groups also reach the same explanation quality.

## Passage clue contract

- A clue button marks only the configured evidence text in the relevant passage.
- Evidence uses the established pale-green highlight and focused outline.
- The numbered badge returns the student to the relevant question or feedback card.
- Existing group evidence is preserved when another clue is focused.

### Passage clue quality

- The clue must contain enough continuous wording to show **why** the answer is correct, not merely repeat the answer word.
- Normally highlight a meaningful clause or sentence of about **10–30 words**. A shorter phrase is acceptable only when it is fully self-explanatory; a full paragraph is normally too broad.
- For matching-information questions, the highlight should include the specific detail that matches the statement, not just a topic word from the paragraph.
- For completion tasks, the highlight should include enough grammar around the answer to show why the exact word form and word limit fit.
- For True / False / Not Given and choose-two tasks, the highlight should include the wording that proves agreement, contradiction, missing information, or the writer’s precise claim.
- Evidence must be a contiguous, visible excerpt from the passage. It must remain legible after highlighting and must not be cut so tightly that the relationship becomes unclear.
- Before approving a group, test the clue visually: it scrolls to the right passage location, the highlighted span is understandable in context, and the numbered badge returns to the relevant question.

## Delivery workflow

1. Work on one question group at a time.
2. Compare the group against Test 1 and Test 2 before adding the next group.
3. Test these states for every group: blank, correct, incorrect, hide/show refresh, full Study check, Test Mode before submission, Test Mode after submission.
4. Keep the PR as a draft until the tested group matches the contract.
5. Do not add new feedback controls, permanent task-type headers, alternative card layouts or new scoring paths unless Pablo explicitly requests them.
