# Academic Reading parity checklist

Every future Academic Reading test must be compared with this checklist before content implementation begins and again before commit.

## A. Source and data integrity

- [ ] Exactly 40 questions.
- [ ] Exact answers and accepted variants.
- [ ] Exact passage ranges.
- [ ] Exact task instructions and word limits.
- [ ] Academic Reading band conversion verified.

## B. Fresh Study Mode

- [ ] All nine strategies, Answer Key, and Score guide are visible.
- [ ] Score guide is neutral: no submitted score, band, or highlighted row.
- [ ] Neutral Why, Skill, and Evidence cards are visible.
- [ ] Clues and the active-Passage map are available.
- [ ] No correctness, points, score, band, Passage totals, or ranking appears.
- [ ] No duplicate controls, warnings, or console errors.

## C. Submitted Study Mode

- [ ] Evaluator runs once.
- [ ] Correctness, points, score, band, and 13/13/14 Passage totals appear.
- [ ] Task-performance feedback appears.
- [ ] Learning resources remain visible.
- [ ] Live edits do not change the submitted result until resubmission.
- [ ] Resubmission is clean and creates a new submission ID.

## D. New Study attempt

- [ ] Old result and review are cleared while learning resources remain.
- [ ] No stale cards, marks, badges, or task feedback remain.

## E. Fresh Test Mode

- [ ] Candidate-name/start flow, timer, fullscreen, and focus handling work.
- [ ] Answer Key, Score guide, details, clues, maps, and scores are hidden.
- [ ] Leave/reload protection is active after the Test starts.

## F. Completed Test Mode

- [ ] Evaluator runs once; all answers are locked.
- [ ] Both submit controls are disabled and the timer is stopped.
- [ ] The result is immutable.
- [ ] Answer Key, Score guide, details, and clues are available.
- [ ] Score guide remains open and stable when review state syncs; its submitted row stays highlighted.
- [ ] Leave/reload protection remains active after submission.

## G. Passage clues

- [ ] Ranges are Q1–13, Q14–26, and Q27–40.
- [ ] Marks and badges use 13/13/14 totals.
- [ ] Inactive marks clear.
- [ ] Retained intent restores.
- [ ] An explicitly closed map stays closed.
- [ ] No duplicate marks, badges, clues, or maps.

## H. Accessibility and layout

- [ ] IDs are unique.
- [ ] Controls are keyboard-operable and restore focus.
- [ ] Meaning does not rely on colour alone.
- [ ] Desktop and mobile layouts are readable with no overlapping controls.

## I. Final repository workflow

- [ ] Complete test matrix and syntax checks pass.
- [ ] `git diff --check` passes.
- [ ] Manual visual approval is recorded.
- [ ] One intentional commit, push, pull request, merge, and branch cleanup are completed.
