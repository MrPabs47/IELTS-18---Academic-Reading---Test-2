# General Training Reading Test Parity Checklist

**Use with:** `general-training/shared/IELTS_GT_READING_FAST_TRACK_WORKFLOW.md`  
**Cambridge 19 + IELTS 18 Test 1 regression update:** lifecycle, interaction, scoring, layout, logo, self-contained feedback and internal modal-overflow parity through 8 August 2026

This is the short pass/fail specification for every General Training Reading production branch. The target HTML, local source files, answer key, accepted variants and evaluator remain authoritative for test-specific content.

> **Dialog rule:** A Score guide, Answer Key or feedback button merely existing is not a pass. Open every available shared Reading dialog and verify its complete visible layout after any header, toolbar, mount or responsive CSS change. The outer dialog fitting the viewport is not enough: verify internal dialog/scroll/body/card geometry, including `scrollWidth <= clientWidth + 1`, normal wrapping for long feedback, and title/table/card containment.

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
- [ ] Target is compared against the validated Cambridge 19 GT Tests 1–4 behavioural reference set; Test 2 is the direct-integration reference and Test 1 the legacy-adapter reference.
- [ ] Shared-shell mount ancestry is recorded, including whether dialogs are mounted inside a header or toolbar container.
- [ ] Header, toolbar and responsive selectors that may affect nested shared-shell UI are inventoried.
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
- [ ] Test-specific header and toolbar rules are scoped to their direct controls rather than broad descendants.
- [ ] Shared-dialog backdrops and dialogs explicitly escape inherited `white-space`, text alignment, overflow and sizing rules where necessary.
- [ ] Fixed overlays remain viewport-centred even when their DOM mount is nested inside a header or transformed ancestor.
- [ ] A header or toolbar visual change triggers a smoke test of Score guide, Answer Key and score-feedback dialogs.

## E. Fresh Study

- [ ] Study Mode header shell is visible.
- [ ] General Training score guide is available and neutral.
- [ ] Score guide opens with its full title, introduction, table columns and all rows readable across the dialog width.
- [ ] Answer Key has Q1–40 entries.
- [ ] Answer Key opens at normal width without clipping, squeezed columns or inherited one-line layout.
- [ ] Every exact task group has visible strategy information/ⓘ controls in Study Mode.
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
- [ ] Score-feedback dialog opens at its intended width and all section cards remain readable.
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
- [ ] Strategies, feedback cards and all Study information/ⓘ controls are hidden; zero such controls are visually present during the active Test.
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
- [ ] Study information/ⓘ controls, Answer Key, score guide, feedback and clues become available again.
- [ ] Newly available completed-Test dialogs open without clipping or inherited header layout.
- [ ] Feedback derives from the submitted result, not mutable live answers.
- [ ] A blank/low-score submission initialises completed-Test feedback and displays `Submitted band: Below 3.` under the current contract.
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
- [ ] Every Q1–40 clue/Why/Skill trio passes the self-contained Aha test: question + displayed/highlighted clue(s) + Why are enough to understand why the answer is correct without the rest of the passage.
- [ ] Why explicitly bridges question wording to source wording and then to the answer.
- [ ] Why identifies the decisive contrast, paraphrase, missing detail or logical relationship.
- [ ] Why addresses the likely distractor or misunderstanding where useful.
- [ ] Skill is concise, actionable and tells the learner what to do differently next time.
- [ ] Skill names the specific reading operation and the feature to check, not a generic instruction such as `look carefully` or `scan for keywords`.
- [ ] Correct-answer display does not imply unaccepted synonyms.
- [ ] TRUE explains agreement.
- [ ] FALSE identifies the contradiction.
- [ ] NOT GIVEN shows the closest relevant stated information and identifies the exact required detail missing; it never invents evidence for absence.
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
- [ ] Every clue highlights the minimum sufficient evidence span, not merely an isolated answer word.
- [ ] Every clue includes enough context to preserve the subject, action and logical relationship.
- [ ] Decisive negation, qualifier, comparison, condition, cause, time marker or reference word is included when relevant.
- [ ] No hard clue-length target is used; one complete sentence is the default, two connected sentences are allowed when necessary, and clarity/logical completeness determine the span.
- [ ] A learner can understand why the evidence matters without guessing the omitted context.
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
- [ ] Under the current project contract, 0–8 returns/displays `Below 3` and 9–11 returns/displays Band 3.
- [ ] `Below 3` round-trips through evaluator, result overlay, submitted-result snapshot/parser, Score guide and submitted Score feedback.
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
- [ ] Established per-letter logo hover animation works without breaking the home route and honours reduced-motion preferences.

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
- [ ] Hidden/unrevealed feedback hosts contribute zero unexplained vertical gap; revealing feedback expands normally and hiding it contracts normally.
- [ ] Matching, tables, flow charts and drag/drop controls do not overflow.
- [ ] Approximately 390 px width passes.
- [ ] Black-on-white theme passes.
- [ ] White-on-black theme passes.
- [ ] Yellow-on-black theme passes.
- [ ] Normal, large and extra-large text pass.
- [ ] Visible focus treatment exists.
- [ ] Dialogs, Answer Key, clues and icon controls have accessible names/roles.
- [ ] Score guide, Answer Key and score-feedback dialogs are each opened at desktop width.
- [ ] Score guide, Answer Key and score-feedback dialogs are each opened at approximately 390 px or the narrowest supported width.
- [ ] Representative dialog checks pass with extra-large text and all three themes.
- [ ] Dialog titles, introductions, tables, cards and close controls remain inside the visible dialog.
- [ ] Dialog content is not squeezed into a narrow column by inherited `white-space: nowrap`, flex sizing or text alignment.
- [ ] Header and toolbar changes are audited for inherited `white-space`, `font-size`, `line-height`, `text-align`, `overflow`, `min-width`, `max-width`, `position`, `transform`, `z-index`, flex and grid properties.
- [ ] Meaning does not rely on colour alone.
- [ ] No unexpected console errors occur.

## P. Testing gate

- [ ] Focused target module passes during each implementation phase.
- [ ] Target suite remains lean and production-linked.
- [ ] Existing shared Reading regression suite passes at phase gates.
- [ ] JavaScript syntax checks pass.
- [ ] Q1–40 detail validator passes.
- [ ] Human editorial review covers all 40 clue/Why/Skill trios.
- [ ] The reviewer checks each trio from the perspective of a plausible learner who chose the wrong answer.
- [ ] No trio leaves the reasonable questions `But why?`, `Which words matter?` or `What do I do next time?` unanswered.
- [ ] Task-group coverage validator passes.
- [ ] Text-root and clue-target validator passes.
- [ ] Browser lifecycle test covers Fresh/checked Study and Fresh/completed Test, explicitly asserting Study-info visible → active-Test hidden → submitted-Test visible.
- [ ] A blank/low-score completed-Test case verifies `Below 3` feedback initialises successfully.
- [ ] Browser test verifies 40 cards, 40 Why, 40 Skill, zero visible Evidence and 40 enabled clues.
- [ ] Any test-specific header, toolbar or responsive CSS change triggers the shared-dialog smoke matrix.
- [ ] Shared-dialog smoke matrix opens Score guide, Answer Key and score feedback and verifies complete visible content rather than button presence only.
- [ ] Where present, matching/drag-drop QA exercises real drag, click-to-place, keyboard placement, repeated-letter reuse and Clear/reset before verifying submitted locking.
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
- [ ] Highlighted clue spans are neither misleadingly short nor unnecessarily broad, and representative clues pass the self-contained question + clue(s) + Why test.
- [ ] Section-level clue control checked in each section/context.
- [ ] Where present, matching/drag-drop is actually used via its supported drag/click/keyboard/reuse/Clear paths before submitted locking is checked.
- [ ] Active Test shows zero visible Study information/ⓘ controls; completed Test restores them.
- [ ] Blank/low-score submission shows `Below 3` in results and submitted Score feedback.
- [ ] Hidden feedback hosts show no dead vertical space before reveal.
- [ ] Score guide opened and fully inspected in Fresh Study.
- [ ] Answer Key opened and fully inspected in Fresh Study.
- [ ] Score-feedback dialog opened and fully inspected after a Study check or final Test submission.
- [ ] Dialog inspection is repeated after any header, toolbar, mount or responsive CSS change.
- [ ] Desktop checked.
- [ ] Approximately 390 px checked.
- [ ] Extra-large text checked.
- [ ] All three themes checked.
- [ ] Home route, leave warning, keyboard activation and logo hover animation checked.
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
- [ ] Live Hub Safety Guard passes.
- [ ] Public dist guard / least-privilege public build validation passes.
- [ ] Protected reference fingerprints are refreshed only after the relevant Reading validation passes and only for deliberately changed reference files.
- [ ] Unrelated Live Hub contract repair, activation or seasonal work is kept in a separate PR.
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

## S. Cambridge 19 reference-set + IELTS 18 Test 1 mandatory parity gate

These checks capture regressions found while stabilising Cambridge 19 GT Tests 1–4 and are mandatory for Cambridge 18 onward.

### S1. Reference set and lifecycle

- [ ] Target is compared against the validated Cambridge 19 GT Tests 1–4 behavioural reference set.
- [ ] Test 2 is used as the preferred direct-integration reference and Test 1 as the legacy-adapter reference; Tests 3–4 are used for regression behaviour, not copied as new templates.
- [ ] Study Mode shows task-specific strategy/ⓘ controls.
- [ ] Active Test Mode shows zero visible strategy/ⓘ controls, even if their DOM remains attached.
- [ ] Submitted Test review restores strategy/ⓘ controls, Answer Key, score guide, feedback and clues while all submitted answers stay locked.
- [ ] Browser QA verifies computed/visible state rather than trusting `hidden` alone.

### S2. Low-score round trip

- [ ] Current GT contract is 0–8 = `Below 3` and 9–11 = Band 3.
- [ ] `Below 3` agrees across evaluator, result overlay, submitted-result snapshot/parser, Score guide and submitted Score feedback.
- [ ] A blank/low-score Test submission still initialises completed-Test feedback and displays `Submitted band: Below 3.`

### S3. Matching and custom interaction

- [ ] Where present, matching/drag-drop is exercised through real drag, click-to-place, keyboard placement, repeated-letter reuse and Clear/reset as supported by the target.
- [ ] Interaction initialisation order is validated; visible answer boxes alone are not a pass.
- [ ] After Test submission, sources, zones, backing controls and Clear/reset remain locked.

### S4. Self-contained feedback quality

- [ ] For every Q1–40 item, question + clue(s) + Why are sufficient to understand the answer with surrounding passage context mentally hidden.
- [ ] One complete clue sentence is the default; two short connected sentences are used only when the reasoning genuinely crosses a sentence boundary.
- [ ] Shorter fragments are used only when genuinely self-contained; clues are not lengthened mechanically.
- [ ] Why explicitly bridges question wording to source wording/paraphrase/logic and the correct answer.
- [ ] A likely distractor is explained when that resolves a realistic learner misunderstanding.
- [ ] NOT GIVEN uses the closest relevant stated information and identifies the exact missing detail without inventing evidence.
- [ ] Matching-headings clues represent the paragraph’s main idea rather than an isolated detail.

### S5. Layout and logo parity

- [ ] Hidden/unrevealed feedback hosts contribute zero unexplained padding, margin or vertical gap.
- [ ] Revealing feedback expands the block normally and hiding it contracts normally.
- [ ] IELTS Pabs logo routes to the top-level Live Hub and uses the active-Test leave warning.
- [ ] Logo is operable by mouse, Enter and Space.
- [ ] Established per-letter hover animation works and honours reduced-motion preferences.
- [ ] Header/logo changes do not break or squeeze Score guide, Answer Key or score-feedback dialogs.

### S6. Browser and release safety

- [ ] Browser lifecycle QA covers Fresh Study, checked/submitted Study, Fresh Test and completed Test/locked review.
- [ ] Browser QA includes a blank/low-score submission, real custom interaction where present, hidden-host spacing and logo animation/navigation.
- [ ] A newly discovered regression class receives the smallest permanent production-linked regression that would have caught it.
- [ ] Live Hub Safety Guard passes before merge.
- [ ] Protected reference fingerprints are refreshed only after the relevant Reading validation passes and only for deliberately changed reference files.
- [ ] Unrelated Live Hub contract repair, activation or seasonal work is kept in a separate PR.


### S7. IELTS 18 Test 1 internal modal-overflow regression

- [ ] Header no-wrap/truncation is scoped to the exact title/candidate/control that needs it; no whole header/right-header ancestor forces nested shell content to `white-space: nowrap`.
- [ ] Shell mount ancestry is recorded and target CSS inheritance into fixed backdrops is understood before changing header/toolbar layout.
- [ ] Score guide, Answer Key and score feedback are actually opened; outer-modal visibility alone is not a pass.
- [ ] Score guide dialog and its scroll container satisfy `scrollWidth <= clientWidth + 1` at desktop width.
- [ ] Score-feedback dialog, body, representative cards and long learner-facing text satisfy `scrollWidth <= clientWidth + 1`.
- [ ] Long `Focus next`/feedback advice has computed `white-space: normal` (or equivalent intended wrapping) and wraps to multiple lines when required by available width.
- [ ] Dialog titles, introductions, table headings/content, cards and close controls remain within the dialog bounding box.
- [ ] Flex/grid descendants that need to shrink have a valid shrink path (for example `min-width: 0`) rather than forcing horizontal expansion.
- [ ] The internal-overflow matrix is repeated at approximately 390 px with extra-large text.
- [ ] A target-specific permanent regression protects the discovered inheritance/overflow failure class when the target required a repair.
- [ ] A Playwright pointer-interception quirk is not confused with a layout defect: interaction is tested separately with real clicks where practical; layout geometry may be measured after a documented programmatic open only when the interaction itself is already proven.

### S8. Cambridge 18 continuation gate

- [ ] IELTS 18 GT Test 2 starts from current `main` and re-runs S1–S7 rather than assuming Test 1 implementation details transfer.
- [ ] The target’s own HTML, evaluator, accepted variants, source roots and control shapes remain authoritative.
- [ ] Any local defect is fixed locally unless a focused generic failing test proves a shared-shell blocker.

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
