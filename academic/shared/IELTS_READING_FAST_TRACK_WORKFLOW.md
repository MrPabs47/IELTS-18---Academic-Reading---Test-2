# IELTS Academic Reading Fast-Track Production Workflow

## Purpose

This workflow converts the lessons from IELTS 17 Academic Reading Test 1 into a repeatable process for all remaining Reading tests. Use it together with `academic/shared/READING_TEST_PARITY_CHECKLIST.md`.

## Core rule

**Lock parity first, then build content.** Do not begin test-specific strategies, feedback or clues until the target page, evaluator, mode lifecycle and shared capability contract have been audited once.

## Fixed source hierarchy

1. Target test HTML and local Passage/Questions/Answers files.
2. Target page `answerKey`, `correctAnswerText`, `getUserAnswer()` and evaluator.
3. `academic/shared/READING_TEST_PARITY_CHECKLIST.md`.
4. IELTS 16 Academic Reading Test 4 for visible parity.
5. IELTS 16 Tests 3 and 4 for shared-shell configuration patterns.
6. Shared Reading regression tests.

## Definition of Done

### Fresh Study
- Score guide, Answer Key, strategies, 40 neutral Why/Skill/Evidence cards, 40 clues and active-Passage map are available.
- No correctness, points, score, band, Passage totals or task-performance ranking.

### Submitted Study
- Evaluator runs once.
- Correctness, points, score, Academic band, 13/13/14 Passage totals and task feedback appear.
- Live edits do not change the submitted snapshot until resubmission.
- No duplicate controls, cards, marks or badges.

### New Study attempt
- Previous official result and review are cleared.
- General learning resources remain available.

### Fresh Test
- Candidate start, timer, fullscreen/focus and leave/reload protection work.
- No Answer Key, Score guide, strategies, details, clues, maps or scores.

### Completed Test
- Evaluator once; answers locked; both submit controls disabled; timer stopped; result immutable.
- Answer Key, Score guide, strategies, details, clues and maps become available.
- Leave/reload protection remains active.

## Standard workflow

1. **Branch and baseline** — update main, create one feature branch, confirm clean worktree.
2. **Read-only audit** — inventory page assets, scoring, ranges, tasks, lifecycle and shell gaps.
3. **Engine + shell integration** — authoritative snapshot, part totals, mode gating and parity.
4. **Student content** — all task strategies, Q1–40 Why/Skill/Evidence and explicit clue targets.
5. **Browser and parity QA** — all Study/Test states, maps, header order, responsive layout and console.
6. **Release** — full matrix, exact staging, one commit, push, PR, squash merge, pull main, delete branch.

## Architecture rules

- The page owns scoring and the immutable submitted snapshot.
- Never parse score or band from rendered DOM text.
- Textual Evidence is separate from exact clue targets.
- Clues activate only through complete explicit clue coverage.
- Shared code must be capability-based, never test-title or question-range specific.
- Malformed optional data disables only its capability.
- Shared core is frozen for normal tests; change it only after a focused failing test proves a generic blocker.

## Lean testing

Reuse the shared/reference matrix. Add only five target modules:

- engine protection
- reading feature integration
- strategy data
- question detail data
- passage clue data

Do not create a new large mutation framework for each test. Use focused negative checks and existing shared behavioural mutants.

## Student-content standard

- Strategies: concise, practical, task-specific and faithful to the exact page instruction.
- Why: explain the passage logic, not just repeat the answer.
- Skill: learner-friendly and question-specific.
- Evidence: accurate, readable and passage-grounded.
- Clue: guides attention without revealing the answer.
- Target: exact distinctive passage fragment that resolves after whitespace normalisation.

Special rules:
- Choose TWO remains one unordered set.
- NOT GIVEN identifies related information present and the missing required detail.
- FALSE/NO must show the contradiction; NO concerns the writer’s view.
- Phrase-list answers require meaning and grammatical fit.

## Codex rules

- Use 5.6 Sol / Medium / Standard for audits and implementation.
- Use 5.6 Sol / Light / Standard for branch, commit and tiny parity tasks.
- Goal off.
- Explicit allowed paths and stop rules in every prompt.
- Ask for approval for audits/shared changes; Approve for me for tightly scoped implementation.
- Do not begin long tasks when usage is nearly exhausted.

## Visual approval script

1. Fresh Study: immediate neutral learning resources, no official results.
2. Submitted Study: controlled score, band, 13/13/14 totals, edit freeze and resubmission.
3. Passage maps: 13/13/14, switching, retained intent and explicit-close behaviour.
4. Fresh Test: privacy of learning resources and lifecycle protections.
5. Completed Test: locks, stopped timer, immutable result, review and leave warning.
6. Desktop and narrow-width layout, header order and clean console.

## Header order

`Score guide → Answer Key → Study mode (Study only) → Study time / Time left → connection → notifications → Full screen → menu`

## Release workflow

Audit → edit → focused tests → full matrix → browser approval → exact staging → one commit → GitHub Desktop push/publish → PR → squash merge → pull main → delete local/remote branch.

## Anti-patterns

- Content before contract audit.
- Submission-gated Study learning resources.
- DOM score parsing.
- Evidence used as clue target.
- Test-specific shared fallbacks.
- Token-only mutation claims.
- Reopening architecture for small content changes.
- Treating unchanged browser-environment failures as product defects.
- Committing before visual approval.

## Success target for each remaining test

- One audit task.
- Two implementation passes.
- One final QA task.
- Zero shared-core changes in the normal case.
- One commit and one pull request.
