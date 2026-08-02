# Writing Test Parity Checklist

**Project:** IELTS Website Practice Creation  
**Reference page:** Cambridge IELTS 16 Academic Writing Test 2  
**Use:** Required audit and release checklist for every Academic Writing test

> The target task scans/text and visual assets are authoritative for test-specific content.  
> The reference Writing page is authoritative for reusable behaviour and visible interaction.

---

## 0. Branch, target and source baseline

- [ ] Current `main` is updated before the feature branch is created.
- [ ] One feature branch is used for one Writing test.
- [ ] Working tree is clean before implementation.
- [ ] Exact canonical page path is recorded.
- [ ] Exact Live Hub availability key is recorded.
- [ ] Target Task 1 source page/file is recorded.
- [ ] Target Task 2 source page/file is recorded.
- [ ] Target Task 1 visual source is recorded.
- [ ] No implementation begins before the read-only delta audit is complete.
- [ ] Exact allowed paths are listed.
- [ ] Shared Writing behaviour is frozen unless a generic blocker is proven.

## 1. Identity and route

- [ ] Browser title contains the correct IELTS book, test and Academic Writing identity.
- [ ] Header title contains the correct identity.
- [ ] Canonical route uses the established Academic Writing naming pattern.
- [ ] Canonical route resolves successfully.
- [ ] The page does not depend on a preview-only branch or URL.
- [ ] The hub activates only the exact intended Academic Writing key.
- [ ] Other Writing tests remain unavailable unless completed.
- [ ] Direct route and hub route open the same production page.

## 2. Initial chooser

- [ ] Fresh load shows the chooser.
- [ ] Reload shows the chooser.
- [ ] New tab/new visit shows the chooser.
- [ ] Test Mode is on the left.
- [ ] Study Mode is on the right.
- [ ] Labels match the established tests.
- [ ] No previous answers are restored.
- [ ] No previous submission/report is restored.
- [ ] No timer is visible before a mode starts.
- [ ] Test Mode reveals the candidate-name step.
- [ ] Candidate name is required before timed Test Mode starts.
- [ ] Study Mode starts without candidate-name requirement.

## 3. Shared header and logo

- [ ] IELTS Pabs logo matches the reference size, weight and spacing.
- [ ] Logo characters are split for animation.
- [ ] Logo hover replays the reveal animation.
- [ ] Logo resets after pointer leave.
- [ ] Logo respects reduced-motion preference.
- [ ] Logo returns to the hub through the established confirmation behaviour.
- [ ] Test title appears in the correct location.
- [ ] Candidate name appears only in active Test Mode.
- [ ] Study tools and Study Mode pill appear only in Study Mode.
- [ ] No Test Mode pill appears.
- [ ] Timer appears only in active Test Mode.
- [ ] Connection, notification, full-screen and menu controls match the reference.
- [ ] Visual and keyboard order agree.

## 4. Task source fidelity

- [ ] Task 1 instructions match the source exactly.
- [ ] Task 1 prompt matches the source exactly.
- [ ] Task 1 minimum-word statement matches the source exactly.
- [ ] Task 2 instructions match the source exactly.
- [ ] Task 2 prompt matches the source exactly.
- [ ] Task 2 minimum-word statement matches the source exactly.
- [ ] Paragraph order matches the source.
- [ ] Capitalisation matches the source.
- [ ] Punctuation matches the source.
- [ ] Bold text is source-supported.
- [ ] Italic text is source-supported.
- [ ] No invented advice or explanatory text is inserted into the task pane.
- [ ] No source wording is paraphrased without explicit approval.

## 5. Task 1 visual fidelity

- [ ] Image file is local or from an approved stable source.
- [ ] Image is clear at normal display size.
- [ ] All labels match the source.
- [ ] All numbers and units match the source.
- [ ] All arrows and directions match the source.
- [ ] All categories/stages match the source.
- [ ] No legend, axis, key or assessed detail is cropped.
- [ ] Image enhancement has not invented detail.
- [ ] Alt text accurately describes the visual type and content.
- [ ] Image is fully visible by default.
- [ ] Clicking enlarges the image inside the left pane only.
- [ ] Enter/Space also toggles image enlargement.
- [ ] Right answer pane remains visible during enlargement.
- [ ] Closing/toggling returns to the standard view.

## 6. Typography and options

- [ ] Test content uses the established Arial/Helvetica family.
- [ ] Normal text size visually matches the reference.
- [ ] Question emphasis is bold, not accidentally italic.
- [ ] Normal text-size option works.
- [ ] Large text-size option works.
- [ ] Extra large text-size option works.
- [ ] Task copy changes size.
- [ ] Answer editor changes size.
- [ ] Word count changes size.
- [ ] Footer controls change size where intended.
- [ ] Black on white works.
- [ ] White on black works.
- [ ] Yellow on black works.
- [ ] Active option indicators update correctly.
- [ ] Options close without changing answers.

## 7. Desktop layout and divider

- [ ] Header is fixed and does not cover content.
- [ ] Footer is fixed and does not cover content.
- [ ] Left pane contains task content only.
- [ ] Right pane contains answer editor and word count only.
- [ ] Both panes fill the usable height.
- [ ] Both panes scroll independently where necessary.
- [ ] Divider is visible and reachable.
- [ ] Divider works on the first drag.
- [ ] Pointer tracking continues outside the divider while dragging.
- [ ] Text selection is suppressed during dragging.
- [ ] Divider split stays within safe limits.
- [ ] Keyboard left/right adjustment works.
- [ ] No duplicate divider handlers cause jumping.
- [ ] No horizontal page overflow.

## 8. Task switching and editor

- [ ] Task 1 is active initially.
- [ ] Task 2 opens through the footer button.
- [ ] Previous/next buttons work.
- [ ] Each task retains its own in-memory answer during the live attempt.
- [ ] Switching tasks does not duplicate task content.
- [ ] Switching tasks does not reset the other answer.
- [ ] Answer editor is enabled.
- [ ] Word count updates while typing.
- [ ] Word count is shown as plain `Words: n`.
- [ ] No minimum-word warning appears beside the count.
- [ ] Footer task buttons do not show word counts or minimums.
- [ ] Spellcheck/autocomplete behaviour matches the reference decision.

## 9. Fresh Study Mode

- [ ] Study Mode pill is visible.
- [ ] Study tools control is visible.
- [ ] Candidate name is absent.
- [ ] Timer is absent.
- [ ] Full Writing layout is available.
- [ ] Both answers remain editable.
- [ ] Self-review opens correctly.
- [ ] Study tools do not expose unapproved AI marking.
- [ ] Study interaction does not create a saved attempt.
- [ ] Reload returns to the chooser.

## 10. Fresh Test Mode

- [ ] Candidate name is shown in the header.
- [ ] Timer starts at 60:00.
- [ ] Timer counts down once per second.
- [ ] Full-screen is requested automatically where supported.
- [ ] Leaving enforced full-screen pauses/locks the test.
- [ ] Return-to-full-screen resumes correctly.
- [ ] Full-screen button reflects active/locked state.
- [ ] Study tools and Study Mode pill remain hidden.
- [ ] Both tasks remain editable before submission.
- [ ] Submit opens a confirmation dialog.
- [ ] Confirmation includes both task word counts.
- [ ] Cancel returns to writing.
- [ ] Leave/reload warning appears during the active attempt.
- [ ] No saved-progress restoration occurs after confirmed reload.

## 11. Submission and updated report

- [ ] Submission stops the timer.
- [ ] Submission closes the confirmation dialog.
- [ ] Test submitted message appears.
- [ ] Answers remain editable after submission.
- [ ] Report opens immediately.
- [ ] Report contains correct test identity.
- [ ] Report contains mode.
- [ ] Report contains submission date/time.
- [ ] Report contains candidate name.
- [ ] Optional student email field works.
- [ ] Report contains timer status where applicable.
- [ ] Report contains Task 1 answer and current word count.
- [ ] Report contains Task 2 answer and current word count.
- [ ] Copy report works.
- [ ] Copy confirmation message appears.
- [ ] Gmail action opens a pre-addressed compose window.
- [ ] Outlook/Hotmail action opens a pre-addressed compose window.
- [ ] Default email action works.
- [ ] Teacher email is correct.
- [ ] Page does not claim central/server storage.
- [ ] Editing after submission and submitting again produces an updated report.
- [ ] Timer does not restart after submission.
- [ ] Reload clears the report and returns to the chooser.

## 12. No-persistence and unload contract

- [ ] Writing answers are not persisted in localStorage.
- [ ] Writing answers are not persisted in sessionStorage.
- [ ] Submitted state is not restored.
- [ ] Divider position is not treated as saved progress unless explicitly approved.
- [ ] Refresh/leave warning is active only after an attempt starts and before submission.
- [ ] Initial chooser does not trigger an unnecessary leave warning.
- [ ] Browser-standard wording is accepted for native unload prompts.
- [ ] Back-forward cache restoration does not expose an old attempt.

## 13. Responsive layout

- [ ] At approximately 900 px the layout remains usable.
- [ ] At approximately 390 px panes stack.
- [ ] Divider is hidden on narrow screens.
- [ ] Header controls remain reachable.
- [ ] Candidate name collapses safely where necessary.
- [ ] Task image is fully visible.
- [ ] Answer editor is not clipped.
- [ ] Footer controls remain reachable.
- [ ] No horizontal overflow.
- [ ] Report dialog fits the viewport.
- [ ] Report buttons wrap rather than clip.
- [ ] Text-size options remain usable.

## 14. Accessibility

- [ ] Editor has a programmatic label.
- [ ] Task buttons are native buttons.
- [ ] Image enlargement is keyboard-operable.
- [ ] Divider has separator semantics.
- [ ] Divider is keyboard-operable.
- [ ] Dialogs have labels and modal semantics.
- [ ] Close controls have accessible names.
- [ ] Focus-visible styles are present.
- [ ] Contrast themes remain readable.
- [ ] Disabled/locked states do not rely only on colour.
- [ ] Logo animation respects reduced motion.
- [ ] Tab order follows visual order.

## 15. Cache and preview verification

- [ ] Current repository files are verified before diagnosing a stale preview.
- [ ] Local server or commit-specific link is used for final QA.
- [ ] Query-string cache busting is not treated as guaranteed.
- [ ] Browser hard refresh is attempted when appropriate.
- [ ] Production direct route is verified after merge.
- [ ] Live Hub route is verified after activation.

## 16. Final QA and release

- [ ] Exact source text is compared one final time.
- [ ] Every Task 1 visual detail is compared one final time.
- [ ] Initial chooser session passes.
- [ ] Fresh Study session passes.
- [ ] Fresh Test session passes.
- [ ] Submitted Test/report session passes.
- [ ] Updated report session passes.
- [ ] Narrow-width session passes.
- [ ] Console has no unexpected errors.
- [ ] JavaScript syntax checks pass.
- [ ] `git diff --check` passes.
- [ ] Only intended paths are staged.
- [ ] PR documents source verification and browser QA.
- [ ] PR is merged before hub activation.
- [ ] Canonical route exists on `main`.
- [ ] Exact hub key is activated.
- [ ] Live Hub card opens the test.
- [ ] Direct live route opens the test.
- [ ] Local `main` is updated and clean.
- [ ] Feature branch is cleaned up when appropriate.

---

## Release gate

A Writing test is ready only when all five student-visible states have been approved:

1. Initial chooser.
2. Fresh Study.
3. Fresh Test.
4. Submitted Test/report.
5. Narrow/mobile layout.

Any unchecked source-fidelity item blocks release.
