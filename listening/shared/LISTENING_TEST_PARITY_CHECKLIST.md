# Listening Test Parity Checklist

**Use with:** `listening/shared/IELTS_LISTENING_FAST_TRACK_WORKFLOW.md`

This is the short pass/fail specification for every Listening production branch.  
The target page, audio files, instructions, answer key and evaluator remain authoritative for test-specific content.

---

## A. Branch and audit gate

- [ ] Branch/worktree starts from current `origin/main`.
- [ ] Worktree is clean and isolated from protected Reading work.
- [ ] Exact target HTML path is confirmed.
- [ ] Current Live Hub route resolves to that canonical target path.
- [ ] All four target audio files exist and load.
- [ ] Q1–40, part ranges, task instructions and answer controls are inventoried.
- [ ] Answer key, accepted variants, evaluator and band conversion are confirmed.
- [ ] Target is compared against Cambridge IELTS 16 Listening Test 1.
- [ ] Read-only audit reports exact gaps, allowed paths and genuine blockers.
- [ ] No implementation begins before this audit is approved.

## B. Mode chooser and header

- [ ] Test Mode and Study Mode are both keyboard accessible.
- [ ] Study header order is Score guide → Answer Key → Study Mode indicator.
- [ ] Header controls fit desktop, mobile and extra-large text.
- [ ] Active Test hides the complete Study shell.
- [ ] Submitted review shows `Study Mode · Locked`.
- [ ] Dialogs are labelled, support Escape/backdrop close and restore focus.

## C. Fresh Study

- [ ] All answers are editable.
- [ ] Compact sticky audio player is visible.
- [ ] Part label updates correctly.
- [ ] Parts have independent in-memory audio positions.
- [ ] Part changes save, pause, load and restore safely.
- [ ] Study part changes do not autoplay.
- [ ] Score guide is available without showing a result.
- [ ] Answer Key has Q1–40 native buttons.
- [ ] Every exact task group has strategy information.
- [ ] Every group has Show answers & feedback.
- [ ] Full active-part transcript is visible.
- [ ] Transcript split, swap and hide controls work.
- [ ] Highlights and notes work only in eligible question text.
- [ ] No final score, band, snapshot or locked state is shown.

## D. Checked Study

- [ ] Individual group reveal evaluates only that group.
- [ ] Global Study check reveals/refreshes all groups.
- [ ] Correct, incorrect, unanswered and partial states render.
- [ ] Group score pills use exact denominators.
- [ ] Choose TWO is one unordered set with 0/2, 1/2 and 2/2 states.
- [ ] Accepted answers are displayed without prefilling controls.
- [ ] Why, Skill and Evidence are present for all Q1–40.
- [ ] Evidence maps to stable transcript segment IDs.
- [ ] Evidence highlights amber rows and seeks safely.
- [ ] Current playback remains green and distinguishable.
- [ ] Editing invalidates only the affected visible group.
- [ ] Explicit recheck refreshes the edited group.
- [ ] Checking does not reset audio or transcript state.
- [ ] Answers remain editable.

## E. Fresh Test

- [ ] Candidate/start flow works.
- [ ] Timer starts once.
- [ ] Fullscreen/focus protections work where supported.
- [ ] Leave/reload protection starts with the test.
- [ ] Study shell, strategies, feedback, Answer Key and Score guide are hidden.
- [ ] Transcripts and evidence are hidden.
- [ ] Test audio follows the approved sequential playback contract.
- [ ] Question/part navigation does not restart or replace the wrong audio source.
- [ ] Submission confirmation appears once.
- [ ] There is one final submission path.

## F. Completed Test / locked review

- [ ] Submitted snapshot is captured once and frozen.
- [ ] Snapshot includes answers, correctness, score, band, candidate, time and integrity data.
- [ ] Native inputs/selects and custom matching controls are locked.
- [ ] Disabled answers remain legible.
- [ ] Timer and integrity monitoring stop.
- [ ] Test audio cannot restart.
- [ ] Results overlay has one Close control.
- [ ] Closing results reveals immediate locked Study Review.
- [ ] Audio and all four transcripts are available without autoplay.
- [ ] All feedback uses the snapshot, not mutable DOM.
- [ ] Reopening results does not rescore.
- [ ] Part/footer/Answer Key navigation remains available.
- [ ] Highlights and notes remain editable.
- [ ] Answers remain locked through part changes and result reopen.

## G. Audio contract

- [ ] Four exact audio sources are configured.
- [ ] Per-part Study positions are separate.
- [ ] Fresh Study resets positions.
- [ ] No position is persisted to localStorage/sessionStorage.
- [ ] Save occurs on timeupdate, seeked and pause.
- [ ] Restore waits for metadata/readiness.
- [ ] Stale load/source/part callbacks are ignored.
- [ ] Latest deliberate transcript/evidence seek wins.
- [ ] Native pointer and keyboard seeking remain usable.
- [ ] Low-readiness seeking is safe.
- [ ] Target-specific start floors are audited, not copied blindly.
- [ ] Active Test sequential playback is separate from Study part selection.
- [ ] Submitted review initialises paused and cannot restart Test sequence.
- [ ] Mobile audio controls remain full-width and usable.

## H. Transcript contract

- [ ] Parts 1–4 each have a complete dataset.
- [ ] Every row has a unique stable ID.
- [ ] Speaker key and visible label are valid.
- [ ] Text is exact and non-empty.
- [ ] Start/end times are numeric and ordered.
- [ ] `end > start` for every row.
- [ ] Genuine silence gaps clear current highlighting.
- [ ] Instruction rows are not mapped to answers unless defensible.
- [ ] No duplicate or hallucinated ending rows.
- [ ] Q1–40 all have defensible `relatedQuestions` coverage.
- [ ] Active row uses green and `aria-current`.
- [ ] Manual scroll pauses following.
- [ ] Resume following restores active-part tracking.
- [ ] Phrase pointer and Enter/Space activation seek and play.
- [ ] Selecting transcript text does not seek.
- [ ] Transcript scrolling never moves the question pane/window.
- [ ] Active Test cannot render transcripts.

## I. Answer navigation and marker

- [ ] Answer Key has exactly 40 entries.
- [ ] Footer and Answer Key use one exact navigation helper.
- [ ] Direct answer click/focus uses the same target contract.
- [ ] Text completion targets the input/wrapper.
- [ ] Radio targets the selected or first enabled option.
- [ ] Map targets the visible map-answer row/select.
- [ ] Choose TWO targets the combined group.
- [ ] Matching targets the visible row/custom slot.
- [ ] Only one blue active-question marker exists.
- [ ] Cross-part navigation does not change audio or feedback unexpectedly.
- [ ] Annotation activity never creates, moves or clears the marker.

## J. Strategies and feedback content

- [ ] Task groups exactly match target instructions and ranges.
- [ ] Every Q1–40 belongs to the correct group.
- [ ] Strategy purpose is task-specific.
- [ ] Numbered steps are practical.
- [ ] Watch-out trap is realistic.
- [ ] Exact word/letter/reuse rules are preserved.
- [ ] Why explains question-specific listening logic.
- [ ] Skill is concise and actionable.
- [ ] Evidence is recording-grounded.
- [ ] No answer leakage appears before explicit checking.
- [ ] Completion does not imply unaccepted synonyms.
- [ ] Multiple choice addresses distractors where useful.
- [ ] Maps address orientation/direction.
- [ ] Choose TWO does not imply answer order.

## K. Highlights and notes

- [ ] Eligibility is limited to authored question content.
- [ ] Input, select, button, drag controls, feedback, strategies, header/footer/results, audio and audioscript are excluded.
- [ ] Selection cannot cross task/question boundaries.
- [ ] Highlights use stable scoped IDs.
- [ ] Multiple highlights and overlap segmentation are safe.
- [ ] Removing a highlight preserves surrounding DOM.
- [ ] Note text is underlined with no permanent icon or reserved width.
- [ ] Floating red `×` is hidden by default.
- [ ] Hover/focus/focus-within reveals delete.
- [ ] Delete is a native accessible button.
- [ ] Delete does not open the editor or activate an answer.
- [ ] Underlined text opens the editor with click/Enter/Space.
- [ ] Editor supports save, cancel, close and delete.
- [ ] Desktop drag and mobile layout are safe.
- [ ] Reload clears annotations.

## L. Layout, themes and accessibility

- [ ] Desktop split pane fills available workspace.
- [ ] Divider drag is bounded.
- [ ] Circular swap control works and restores.
- [ ] Hiding script restores full question width.
- [ ] Map/diagram has safe minimum question width.
- [ ] Mobile stacks panes and hides divider.
- [ ] Transcript height is capped on mobile.
- [ ] Inline completions wrap naturally.
- [ ] Matching, maps and multiple choice have no overflow.
- [ ] Black-on-white theme passes.
- [ ] White-on-black theme passes.
- [ ] Yellow-on-black theme passes.
- [ ] Normal, large and extra-large text pass.
- [ ] Visible focus treatment exists.
- [ ] Dialog, Answer Key, transcript rows and annotation controls have accessible names/roles.
- [ ] No unexpected console errors.

## M. Testing gate

- [ ] Focused target module passes during each implementation phase.
- [ ] Target Test 2 suite remains lean and production-linked.
- [ ] Existing complete Listening regression suite passes at phase gates.
- [ ] JavaScript syntax/integrity checks pass.
- [ ] Transcript/evidence validators cover IDs, timing and Q1–40 mappings.
- [ ] Tests do not duplicate large Test 1 source-string suites without need.
- [ ] Native range/fullscreen automation limitations are reported separately from product defects.
- [ ] `git diff --check` passes.

## N. Visual QA gate

- [ ] Fresh Study browser session completed.
- [ ] Checked Study browser session completed.
- [ ] Fresh Test browser session completed.
- [ ] Completed Test/locked review browser session completed.
- [ ] Parts 1–4 audio and transcript representative rows checked.
- [ ] Evidence checked in every part.
- [ ] Annotation/marker isolation checked.
- [ ] Desktop checked.
- [ ] Approximately 390px checked.
- [ ] Extra-large text checked.
- [ ] All three themes checked.
- [ ] Live Hub link opens the target canonical page.

## O. Release and cleanup

- [ ] Work remains unstaged until visual approval.
- [ ] Final complete Listening suite passes once.
- [ ] Exact intended paths only are staged.
- [ ] Commit message is descriptive.
- [ ] Branch is pushed after authentication is confirmed.
- [ ] PR targets `main`.
- [ ] PR changed-file list is correct.
- [ ] Validation and environment limitations are documented.
- [ ] PR is squash-merged after checks/mergeability.
- [ ] Squash commit is verified on `origin/main`.
- [ ] Target HTML, tests and hub path are verified on `origin/main`.
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
