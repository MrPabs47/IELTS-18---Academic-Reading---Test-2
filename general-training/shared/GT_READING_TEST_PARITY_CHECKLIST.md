# General Training Reading Test Parity Checklist

**Use with:** `general-training/shared/IELTS_GT_READING_FAST_TRACK_WORKFLOW.md`

This is the short pass/fail specification for every General Training Reading production branch. The target HTML, local source files, answer key, accepted variants and evaluator remain authoritative for test-specific content.

---

## A. Branch and audit gate

- [ ] Branch/worktree starts from current `origin/main`.
- [ ] Worktree is clean and isolated from unrelated Reading, Listening, Writing, Speaking and hub work.
- [ ] Exact target HTML path is confirmed.
- [ ] Current Live Hub route resolves to the canonical target path.
- [ ] Target source files are inventoried.
- [ ] Exactly 40 scored questions are confirmed.
- [ ] Section ranges are confirmed rather than assumed.
- [ ] Every source text in Sections 1–3 is inventoried.
- [ ] Task instructions and word limits are recorded exactly.
- [ ] Answer key, accepted variants, evaluator and GT band conversion are confirmed.
- [ ] Native and custom answer-control shapes are inventoried.
- [ ] Target is compared against GT19 Test 2 direct integration and GT19 Test 1 legacy integration.
- [ ] Read-only audit reports exact gaps, allowed paths and genuine blockers.
- [ ] No implementation begins before the audit gate is complete.

## B. General Training identity and terminology

- [ ] User-facing test type is General Training Reading.
- [ ] Shared configuration explicitly uses `partLabel: "Section"`.
- [ ] Header, footer and result copy say Section rather than Part.
- [ ] Short source items are described as Texts where appropriate.
- [ ] Score feedback says Performance by section.
- [ ] Clue toolbar uses section terminology.
- [ ] No Academic band wording or Academic-specific range copy appears.
- [ ] Accessible labels use the same terminology as visible copy.

## C. Source and data integrity

- [ ] Exact passages/notices/advertisements/reviews/workplace texts match the approved source.
- [ ] Every question appears once.
- [ ] Every answer control maps to the correct question.
- [ ] Accepted variants match the target evaluator.
- [ ] Display answers match the approved answer key.
- [ ] Exact word/letter/number limits are preserved.
- [ ] Letter-reuse rules are preserved.
- [ ] Grouped answers and partial-credit rules are preserved.
- [ ] General Training score guide agrees with the target page evaluator.
- [ ] No content is inferred from memory when the source is silent.

## D. Shared-shell integration

- [ ] Shared Reading stylesheet loads successfully.
- [ ] Shared Reading core loads successfully.
- [ ] Shell mount exists once.
- [ ] Correct target adapter pattern is documented: direct or legacy.
- [ ] Instruction hosts are stable and unique.
- [ ] Every source text has a stable unique root.
- [ ] Section ranges are configured correctly.
- [ ] `completeQuestionCoverage: true` is set only after Q1–40 validation.
- [ ] `completeClueCoverage: true` is set only after all clue targets resolve.
- [ ] `showEvidenceText: false` is set for the canonical GT feedback presentation.
- [ ] Preferred authoritative submitted-result contract is used where available.
- [ ] Any `allowDomSubmittedResult: true` use is explicit, justified and browser-tested.
- [ ] A malformed optional capability disables only itself.
- [ ] Shared code contains no test-title, book, filename or question-specific branch.

## E. Fresh Study

- [ ] Study Mode header shell is visible.
- [ ] General Training score guide is available and neutral.
- [ ] Answer Key has Q1–40 entries.
- [ ] Every exact task group has strategy information.
- [ ] Q1–40 neutral feedback cards are available.
- [ ] Every card shows Correct answer, Why and Skill.
- [ ] No visible Evidence row appears.
- [ ] All 40 magnifying-glass clue buttons are visible and enabled.
- [ ] Section-level clue control is visible and enabled for the active context.
- [ ] Answers are editable.
- [ ] Highlights and notes work only in eligible authored content.
- [ ] No correctness, points, score, band, section totals or task ranking appears.
- [ ] No duplicate controls, warnings, cards, marks or console errors appear.

## F. Checked or submitted Study

- [ ] Explicit check uses the target evaluator.
- [ ] Correct, incorrect and unanswered states render correctly.
- [ ] Any partial-credit state matches the target evaluator.
- [ ] Raw score agrees with the page.
- [ ] GT band agrees with the page.
- [ ] Section totals use the audited ranges and denominators.
- [ ] Task-performance feedback appears only when required outcomes are available.
- [ ] Learning resources remain visible.
- [ ] Answers remain editable.
- [ ] Rechecking refreshes the intended scope cleanly.
- [ ] Submitted-snapshot pages freeze official results until resubmission.
- [ ] Group-check pages invalidate only the affected visible group.
- [ ] No duplicate cards, clue buttons, marks, badges or score UI appear.

## G. New Study attempt

- [ ] Previous score, band, section totals and official status styling are cleared.
- [ ] Previous task ranking is cleared.
- [ ] General learning resources remain available.
- [ ] No stale marks, badges, cards or submission ID remain.
- [ ] Answers return to the target page’s fresh state.

## H. Fresh Test

- [ ] Candidate/start flow works.
- [ ] Timer starts once.
- [ ] Fullscreen/focus protections work where supported.
- [ ] Leave/reload protection starts with the test.
- [ ] Score guide is hidden.
- [ ] Answer Key is hidden.
- [ ] Strategies and feedback cards are hidden.
- [ ] Clue buttons and section clue control are hidden.
- [ ] Scores, band and section totals are hidden.
- [ ] Answer and section navigation work.
- [ ] Submission confirmation appears once.
- [ ] There is one final submission path.
- [ ] Home navigation uses the intended leave warning.

## I. Completed Test / locked review

- [ ] Final result is captured once and frozen.
- [ ] Raw score and GT band match the target evaluator.
- [ ] Native inputs, selects, radios and checkboxes are locked.
- [ ] Custom drag/drop, matching and drop-zone controls are locked.
- [ ] Disabled answers remain legible.
- [ ] Timer stops.
- [ ] Submit controls are disabled.
- [ ] Results reopen without rescoring.
- [ ] Closing results reveals the intended locked review.
- [ ] Answer Key, score guide, feedback and clues become available.
- [ ] Feedback derives from the submitted result, not mutable live answers.
- [ ] Section and question navigation remain available.
- [ ] Highlights and notes remain usable where approved.
- [ ] Answers remain locked through section changes and result reopen.
- [ ] Leave/reload protection follows the target Test contract.

## J. Task groups and feedback content

- [ ] Task groups exactly match target instructions and ranges.
- [ ] Every Q1–40 belongs to exactly one group.
- [ ] Strategy purpose is task-specific.
- [ ] Numbered steps are practical.
- [ ] Trap is realistic.
- [ ] Why explains question-specific text logic.
- [ ] Skill is concise and actionable.
- [ ] Correct-answer display does not imply unaccepted synonyms.
- [ ] TRUE explains agreement.
- [ ] FALSE identifies the contradiction.
- [ ] NOT GIVEN identifies related information present and the required detail missing.
- [ ] Matching explains the exact paraphrase.
- [ ] Completion explains meaning and grammatical fit.
- [ ] Multiple choice addresses the whole idea and useful distractors.
- [ ] Grouped answers do not imply an incorrect order.
- [ ] No answer leakage appears in Fresh Test.

## K. Text roots and clues

- [ ] Every independent source text has a stable unique root.
- [ ] No clue relies on whole-section searching when multiple texts exist.
- [ ] Every Q1–40 has a valid clue target.
- [ ] Every clue target resolves in the correct root.
- [ ] Targets are distinctive and not dependent on brittle positional selectors.
- [ ] Shared targets correctly represent every related question.
- [ ] Clue button highlights the intended passage text.
- [ ] Section-level control renders all valid active-context marks.
- [ ] Marks and badges use the audited section totals.
- [ ] Inactive context marks clear or suspend correctly.
- [ ] Retained open intent restores after section return.
- [ ] Explicit close stays closed.
- [ ] No duplicate marks, badges, clue buttons or maps appear.
- [ ] Hiding the visible Evidence row does not disable clues or highlighting.

## L. Scoring and special controls

- [ ] GT band conversion is used, not Academic conversion.
- [ ] Section denominators match the target ranges.
- [ ] Case and whitespace normalisation match the page evaluator.
- [ ] Alternative spellings and number formats match accepted variants.
- [ ] Choose TWO or grouped multiple-answer scoring is unordered where required.
- [ ] Partial credit matches the page evaluator.
- [ ] Multiple controls representing one scored unit are handled correctly.
- [ ] Drag/drop values and cleared states score correctly.
- [ ] Study score, completed Test score and score guide agree.

## M. Navigation, home route and active question

- [ ] Answer Key has exactly 40 entries.
- [ ] Answer Key navigation targets the correct control or question row.
- [ ] Footer navigation targets the same question contract.
- [ ] Direct answer interaction uses the intended active-question target.
- [ ] Cross-section navigation does not corrupt clue or result state.
- [ ] Only one active-question marker exists where the page uses one.
- [ ] Annotation activity never creates, moves or clears the answer marker.
- [ ] IELTS Pabs logo is mouse and keyboard operable.
- [ ] Logo route returns to `../../../index.html` or the audited canonical relative route.
- [ ] Active Test leave warning appears before home navigation.

## N. Highlights and notes

- [ ] Eligibility is limited to authored question/passage content approved by the page.
- [ ] Inputs, selects, buttons, drag controls, feedback, strategies, header/footer and results are excluded.
- [ ] Selection cannot cross unsafe task/text boundaries.
- [ ] Highlights and notes preserve surrounding DOM.
- [ ] Annotation controls are keyboard accessible.
- [ ] Annotation activity is independent from answer state.
- [ ] Reload clears annotations unless the existing product explicitly persists them.

## O. Layout, themes and accessibility

- [ ] Desktop two-pane layout is usable.
- [ ] Divider drag is bounded.
- [ ] Multiple short texts are visually separated and readable.
- [ ] Long Section 3 text remains readable.
- [ ] Inline completions wrap naturally.
- [ ] Matching, tables, flow charts and drag/drop controls do not overflow.
- [ ] Approximately 390 px width passes.
- [ ] Black-on-white theme passes.
- [ ] White-on-black theme passes.
- [ ] Yellow-on-black theme passes.
- [ ] Normal, large and extra-large text pass.
- [ ] Visible focus treatment exists.
- [ ] Dialogs, Answer Key, clues and icon controls have accessible names/roles.
- [ ] Meaning does not rely on colour alone.
- [ ] No unexpected console errors occur.

## P. Testing gate

- [ ] Focused target module passes during each implementation phase.
- [ ] Target suite remains lean and production-linked.
- [ ] Existing shared Reading regression suite passes at phase gates.
- [ ] JavaScript syntax checks pass.
- [ ] Q1–40 detail validator passes.
- [ ] Task-group coverage validator passes.
- [ ] Text-root and clue-target validator passes.
- [ ] Browser lifecycle test covers Fresh/checked Study and Fresh/completed Test.
- [ ] Browser test verifies 40 cards, 40 Why, 40 Skill, zero visible Evidence and 40 enabled clues.
- [ ] Custom-control locking is executable where present.
- [ ] Native fullscreen/browser limitations are reported separately from product defects.
- [ ] `git diff --check` passes.

## Q. Visual QA gate

- [ ] Fresh Study browser session completed.
- [ ] Checked/submitted Study browser session completed.
- [ ] New Study attempt completed.
- [ ] Fresh Test browser session completed.
- [ ] Completed Test/locked review browser session completed.
- [ ] All sections visited.
- [ ] Every independent source text reviewed.
- [ ] Representative early, middle and late clue buttons checked.
- [ ] Section-level clue control checked in each section/context.
- [ ] Custom matching/drag/drop locking checked.
- [ ] Desktop checked.
- [ ] Approximately 390 px checked.
- [ ] Extra-large text checked.
- [ ] All three themes checked.
- [ ] Home route checked.
- [ ] Live Hub link opens the canonical target page.
- [ ] Console is clean.

## R. Release and cleanup

- [ ] Work remains unstaged until visual approval.
- [ ] Final target/shared test matrix passes.
- [ ] Exact intended paths only are staged.
- [ ] Commit message is descriptive.
- [ ] Branch is pushed after authentication is confirmed.
- [ ] PR targets `main`.
- [ ] PR changed-file list is correct.
- [ ] Validation and environment limitations are documented.
- [ ] Unrelated tests and Live Hub files are unchanged unless explicitly authorised.
- [ ] PR is squash-merged after checks and mergeability review.
- [ ] Squash commit is verified on `origin/main`.
- [ ] Target HTML, sidecars, tests and hub path are verified on `origin/main`.
- [ ] Local servers are stopped before cleanup.
- [ ] Terminals/editors/Explorer no longer hold the worktree.
- [ ] Worktree and local/remote feature branches are removed safely.
- [ ] Fetch/prune completed.
- [ ] Clean main confirmed.
- [ ] Any exception is documented explicitly.

---

## Required exception format

```text
Checklist item:
Reason:
Evidence:
Risk:
Approved deviation:
Follow-up:
```

No silent exceptions.
