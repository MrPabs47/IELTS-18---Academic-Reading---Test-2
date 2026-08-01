# IELTS Listening Fast-Track Production Workflow

**IELTS Website Practice Creation — canonical Listening production guide**  
**Reference implementation:** Cambridge IELTS 16 Listening Test 1  
**Reference release:** PR #385, merged as `f45cf1a8e8e605aa72dacd9abbe18d48bad806cb`  
**Prepared:** 1 August 2026

> **Operating rule**
>
> Before auditing or editing a Listening test, read and follow:
>
> - `listening/shared/IELTS_LISTENING_FAST_TRACK_WORKFLOW.md`
> - `listening/shared/LISTENING_TEST_PARITY_CHECKLIST.md`
>
> Treat them as the required workflow and parity specification. The target test HTML, audio files, instructions and answer evaluator remain authoritative for test-specific content.

---

## Executive summary

Cambridge IELTS 16 Listening Test 1 established the first complete Listening reference implementation for the project. It now combines a reliable timed Test Mode with a genuinely useful Study Mode: part-specific audio memory, full synchronised transcripts, transcript seeking, evidence-linked playback, task strategies, answer-specific feedback, a score guide, an Answer Key, submitted locked review, split-pane study layout, Reading-style highlights and notes, responsive behaviour and strong regression protection.

The final quality was high. The route to that quality was longer than it needed to be.

The work expanded because several behaviours were discovered and corrected late:

- Study audio required independent positions for four parts, stale-load protection and user-seek priority.
- Native audio seeking behaved differently depending on browser readiness and range support.
- Test audio, Study audio and submitted-review audio needed separate lifecycle rules.
- Full transcript synchronisation required exact timings, evidence mappings and a clear follow policy.
- Transcript clicks, evidence clicks and pending audio restores competed until a latest-action-wins contract was introduced.
- Answer Key, footer navigation and direct answer interaction needed one exact active-question target system.
- Annotations initially consumed inline space and then incorrectly moved the blue question marker.
- Browser automation could not reliably synthesise native range selection or every fullscreen transition.
- Windows worktree cleanup and GitHub authentication were environmental workflow issues, not product defects.

The central lesson is:

**Future Listening tests should begin with one read-only delta audit against the completed Test 1 contract, then reuse that contract without redesigning it.**

For IELTS 16 Listening Test 2, the expected normal path is:

1. clean branch and baseline;
2. one read-only audit;
3. one foundation/lifecycle implementation pass;
4. one transcript and student-support pass;
5. one final QA and release pass.

A genuine blocker may justify one extra tightly scoped task. Repeated micro-batches should not be the default.

---

## 1. What Test 1 established

### 1.1 Study audio

The reference implementation provides:

- one compact sticky native audio player;
- separate in-memory playback positions for Parts 1–4;
- safe save, pause, load and restore behaviour when changing parts;
- no automatic Study playback after a part change;
- a fresh Study attempt reset;
- no localStorage or sessionStorage persistence for audio position;
- native pointer and keyboard seeking;
- stale-load guards;
- a newest-request-wins seek token;
- safe source changes at low media readiness;
- Test Mode sequential playback that remains independent from Study navigation;
- submitted-review audio that never restarts Test playback.

Test 1 uses a 10-second fresh-start floor for Part 1 and a zero-second floor for Parts 2–4. This is a **test-specific timing decision**, not a value to copy automatically. Every future test must audit its own files and opening material.

### 1.2 Full transcripts and evidence

Test 1 contains complete timed transcript data for all four parts:

- Part 1: 71 rows;
- Part 2: 41 rows;
- Part 3: 54 rows;
- Part 4: 44 rows.

These counts describe the Test 1 reference only. Future tests must use the number of rows required by their own recordings.

Each transcript row has:

- a stable segment ID;
- a speaker key and visible label;
- exact text;
- numeric start and end times;
- zero or more `relatedQuestions`.

The full Q1–40 evidence map is resolved through `relatedQuestions`. Evidence controls do not search transcript text. They use known segment mappings, highlight those rows in amber and seek to the first defensible evidence segment.

Current playback uses green. Evidence uses amber. When a row is both, both states remain distinguishable.

### 1.3 Student support

The reference Study experience includes:

- Score guide;
- interactive Answer Key for Q1–40;
- task-group strategy panels;
- answer-specific **Why**;
- answer-specific **Skill**;
- answer-specific **Evidence**;
- explicit reveal/hide controls;
- group score pills;
- correct, incorrect, unanswered and partially correct states;
- combined unordered-set scoring for Choose TWO questions;
- native map dropdowns;
- exact navigation to the correct answer control or task row.

### 1.4 Submitted Test review

After one final Test submission:

- a defensive submitted snapshot is captured once;
- score, band, candidate, elapsed time and integrity data are cached;
- all native and custom answer controls remain locked;
- the timer and integrity monitoring stop;
- Test audio cannot restart;
- the results panel has one Close action;
- closing results reveals an immediate locked Study Review;
- audio and transcripts remain available;
- all feedback is derived from the snapshot, not mutable DOM state;
- reopening results does not rescore;
- annotations remain editable even though answers are locked.

### 1.5 Study layout and transcript interaction

Desktop Study Mode uses:

- a question pane;
- an audioscript pane;
- a draggable circular divider;
- pane swapping;
- remembered split ratio;
- independent transcript scroll/follow state by part;
- a question-only collapsed state when the script is hidden.

Mobile uses stacked panes and hides the divider. The transcript receives a controlled maximum height, and the question layout must remain usable for maps, matching and inline completion.

Transcript phrase activation means **seek and play**. Text selection inside the transcript must not seek.

### 1.6 Highlights and notes

Annotations apply only to authored content in the question pane.

They do not apply to:

- audio controls;
- answer controls;
- generated feedback;
- strategy panels;
- results;
- header/footer navigation;
- the audioscript.

Saved notes use the Reading interaction pattern:

- selected text remains naturally positioned and underlined;
- no permanent pen or reserved inline width;
- a small red `×` appears on hover or keyboard focus;
- activating the underlined text opens the note editor;
- activating `×` deletes the note without opening the editor;
- the editor also has Delete;
- annotations are in-memory/DOM only and clear on reload.

Annotation activity is independent from answer activity. Highlighting, creating a note, opening a note or deleting a note must not create, move or clear the blue active-question marker.

---

## 2. Main causes of delay and the new rule for each

| Area | What caused delay | Rule for future tests |
|---|---|---|
| Audio memory | Part changes, metadata timing and user seeking competed | Use one explicit part-memory state machine with load tokens and newest-request-wins seeking |
| Browser media behaviour | Native range support and readiness varied | Preserve the Test 1 fallback contract; treat browser readiness as an implementation condition |
| Test vs Study audio | Shared handlers risked autoplay or reset in the wrong mode | Define separate lifecycle rules for Study, active Test and submitted review before coding |
| Transcripts | Text, timing, speakers and evidence were built incrementally | Prepare all four transcript datasets and their Q mappings as one audited content package |
| Evidence | Text search would be ambiguous and fragile | Map questions to stable transcript segment IDs; never infer evidence by searching visible text |
| Navigation | Answer Key, footer and direct interaction used different targets | Route all genuine answer/navigation actions through one exact-question target helper |
| Annotations | Permanent icons damaged line flow | Use the Reading underlined-anchor plus floating hover/focus delete pattern |
| Marker coupling | Annotation functions explicitly activated the question marker | Keep annotations and answer-marker state completely independent |
| Testing | Many narrow modules accumulated during discovery | Reuse Test 1 contracts and create a small target-specific suite; expand only for a new mechanism |
| Browser automation | Native text selection and fullscreen were unreliable in automation | Use the evidence hierarchy and one manual browser session |
| Release/authentication | GitHub device authentication timed out | Confirm GitHub Desktop/browser authentication before push |
| Cleanup | Windows held the worktree directory open | Stop local servers and close terminals/Explorer before removing the worktree |

---

## 3. Fixed sources of truth

Conflicts must be resolved in this order.

| Priority | Source | Used for |
|---|---|---|
| 1 | Target Listening HTML and local media files | Exact questions, controls, instructions, audio filenames, part structure and visible wording |
| 2 | Target answer key, accepted-answer display and evaluator | Scoring, normalisation, partial credit, raw score and band |
| 3 | `listening/shared/LISTENING_TEST_PARITY_CHECKLIST.md` | Pass/fail behaviour for modes, audio, transcripts, review, annotations, layout and release |
| 4 | Cambridge IELTS 16 Listening Test 1 on current `main` | Visible reference experience and proven interaction contracts |
| 5 | Test 1 Listening regression modules | Executable reference contracts and known safeguards |
| 6 | Current Live Hub `index.html` | Canonical path and availability only |
| 7 | Reading annotation implementation | Interaction reference for highlights and notes only |

### Golden rules

#### Never infer test content from memory

The target test files are authoritative. Preserve:

- exact task instructions;
- answer limits;
- reuse rules;
- letter/word formats;
- question ranges;
- answer control types.

#### Never create transcript evidence from the answer key alone

Evidence must be defensible from the recording and the approved transcript timing.

#### Never copy a Test 1 test-specific constant blindly

Examples include:

- transcript row counts;
- speaker IDs;
- question groups;
- Part 1 start floor;
- map width requirements;
- accepted answer variants;
- task-group count.

#### The Live Hub is a router, not a copy of the test

The hub should resolve to the canonical page:

`./listening/cambridge-[book]/test-[test]/IELTS[book]%20Test%20[test]%20-%20Listening.html`

A hub backup can confirm historical links, but it is not the source of Study Mode content.

---

## 4. Definition of Done by state

### 4.1 Fresh Study

Must be visible or available:

- Study Mode header shell;
- Score guide;
- Answer Key;
- task information/strategies for every exact target task group;
- compact sticky audio player;
- independent part audio positions;
- full transcript for the active part;
- transcript follow/resume behaviour;
- split-pane controls on desktop;
- question/audio pane swap;
- highlights and notes in eligible question text;
- Show answers & feedback controls;
- all answers editable.

Must remain hidden or neutral:

- no final Test snapshot;
- no locked-review label;
- no official final score or band;
- no automatic correctness display before explicit checking;
- no transcript in active Test Mode;
- no automatic audio playback after a Study part switch.

### 4.2 Checked Study

After an individual group reveal or global Study check:

- feedback cards show correct, incorrect, unanswered or partially correct;
- accepted answer is displayed;
- Why, Skill and Evidence are available;
- evidence control highlights exact transcript rows and seeks safely;
- group score pill updates only when explicitly evaluated;
- answers remain editable;
- editing invalidates only the affected visible group;
- explicit reveal/check recalculates that group;
- other groups retain their own state;
- audio/transcript state is not reset by checking.

There is no immutable final Study snapshot. Rechecking is expected.

### 4.3 Fresh Test

Must be active:

- candidate/start flow;
- timer;
- fullscreen/focus protections where supported;
- leave/reload protection after start;
- sequential Test audio;
- answer and part navigation appropriate to Test Mode;
- submission confirmation;
- one final submission path.

Must remain hidden:

- Study header shell;
- Score guide;
- Answer Key;
- strategies;
- feedback cards;
- transcript/audioscript;
- evidence controls;
- Study audio memory behaviour;
- annotations that would disclose learning content must not interfere with Test state.

### 4.4 Completed Test / locked Study Review

Must be active:

- one immutable submitted snapshot;
- cached raw score and band;
- cached candidate/time/integrity data;
- locked native and custom answers;
- stopped timer;
- stopped integrity monitoring;
- no Test audio restart;
- immediate review behind the results panel;
- one Close button in results;
- `Study Mode · Locked` indicator;
- audio and full transcripts;
- all task feedback derived from snapshot;
- Answer Key and Score guide;
- part/footer navigation;
- editable highlights and notes;
- results reopening without rescoring.

Must remain impossible:

- changing submitted answers;
- recalculating the snapshot from the live DOM;
- restarting Test audio;
- restarting the timer;
- duplicating result panels, feedback cards, controls or transcript rows.

### 4.5 Fresh page reload

A full reload returns to the mode chooser.

It clears:

- submitted review state;
- submitted snapshot;
- Study audio positions;
- transcript follow/scroll memory;
- highlights and notes.

It does not persist these states through localStorage or sessionStorage unless a future product decision explicitly changes the contract.

---

## 5. Reusable Listening architecture contract

The Listening reference is currently a proven **page contract**, not yet a shared JavaScript platform like Reading.

### 5.1 Page-owned responsibilities

Each target Listening page owns:

- exact questions and task instructions;
- answer controls;
- answer key and accepted display;
- evaluator and band conversion;
- Study/Test mode lifecycle;
- Test timer and integrity protections;
- final submitted snapshot;
- part audio filenames;
- audio state machine;
- transcript datasets;
- question-to-transcript mappings;
- exact task-group data;
- Why/Skill/Evidence content;
- answer-specific navigation targets;
- annotations and eligibility boundaries.

### 5.2 Reference-contract responsibilities

The Test 1 implementation and tests define reusable behaviour for:

- Study audio memory;
- newest-request-wins seek handling;
- safe media source transitions;
- active Test sequential playback;
- submitted-review audio;
- transcript rendering and following;
- evidence highlighting;
- split layout;
- Answer Key and footer navigation;
- exact active-question marker;
- task strategies and group feedback;
- partial Choose TWO scoring;
- submitted locking;
- Reading-style annotations.

### 5.3 Shared-code decision

Do **not** extract a large shared Listening core during Test 2 merely because code is duplicated.

A shared change is justified only when:

1. the same behaviour exists in at least two completed Listening pages;
2. the duplicated contract is stable;
3. a focused test proves the generic boundary;
4. extraction reduces risk rather than introducing a cross-test migration;
5. both pages can adopt it without test-title or IELTS-version branching.

A proposed shared helper must be capability-based. Reject shared code that inspects:

- the test title;
- IELTS version;
- a specific question number;
- a specific audio filename;
- a single page path.

### 5.4 Target-specific constants

Keep these in the target page/data:

- audio sources;
- transcript IDs and timing;
- speaker labels;
- `relatedQuestions`;
- task groups;
- answer variants;
- per-part start floors;
- map or diagram minimum widths;
- exact evidence rows;
- question target selectors where the task shape is unique.

---

## 6. Fast-track workflow for IELTS 16 Listening Test 2

### Phase 0 — branch, worktree and baseline

Create one isolated Listening worktree from updated `origin/main`.

Required output:

- branch name;
- base SHA;
- clean status;
- exact target page path;
- current Live Hub route;
- baseline Listening test count;
- audio/media inventory;
- confirmation that the protected Reading worktree was not used.

Stop if:

- the branch is wrong;
- the worktree is dirty;
- local main is stale;
- another worktree edits the same target;
- required audio files are missing.

### Phase 1 — one read-only delta audit

Compare Test 2 against Test 1 and the checklist.

Audit:

- all 40 questions;
- part ranges;
- task types and exact instructions;
- answer controls;
- answer key and accepted variants;
- map/diagram assets;
- four audio files;
- current Test Mode lifecycle;
- current Study Mode behaviour;
- submission/result logic;
- hub route;
- existing tests;
- any legacy code that conflicts with the reference contract.

Required output:

- what already matches;
- what is missing;
- exact allowed paths;
- proposed target-specific test modules;
- genuine blockers;
- whether any shared extraction is justified.

No edits.

### Phase 2 — foundation and lifecycle implementation

Implement the reusable behavioural foundation before student-support content:

- mode lifecycle;
- sticky audio player;
- per-part Study memory;
- safe seek/load tokens;
- Test sequential playback;
- submitted snapshot and lock;
- immediate locked review;
- split layout;
- exact answer navigation;
- active-question marker;
- annotation eligibility and Reading-style note anchors;
- marker/annotation independence;
- map/dropdown parity where required.

Required output:

- Fresh Study, Fresh Test and completed Test structural contracts pass;
- no transcripts or feedback content are fabricated;
- no Test learning-resource leak;
- exact files changed.

Shared code remains frozen unless a focused failing contract proves a generic blocker.

### Phase 3 — transcripts, evidence and student support

Prepare and add as one audited content package:

- four full transcript datasets;
- stable segment IDs;
- speaker map;
- exact start/end timing;
- complete Q1–40 `relatedQuestions`;
- task groups;
- strategies;
- Q1–40 Why;
- Q1–40 Skill;
- Q1–40 Evidence;
- evidence controls;
- Answer Key display;
- group scoring;
- special handling for Choose TWO, matching, maps and completion.

Activation rule:

- do not expose a part transcript until its data are complete;
- do not expose evidence until all mapped questions resolve;
- do not expose answer-specific content until all 40 entries pass validation.

### Phase 4 — browser parity QA and focused corrections

Use one fresh localhost origin.

Verify:

- Fresh Study;
- Checked Study;
- Fresh Test;
- completed Test/locked review;
- Parts 1–4 audio;
- Parts 1–4 transcripts;
- phrase seek-and-play;
- evidence seek/highlight;
- manual transcript scrolling and Resume following;
- all question shapes;
- annotations;
- active marker isolation;
- desktop;
- approximately 390px;
- normal and extra-large text;
- all three themes;
- pane drag and swap;
- no console errors;
- Live Hub route.

Only genuine user-facing or P0/P1 defects justify another implementation task.

### Phase 5 — release

After visual approval:

- run the complete Listening suite once;
- run focused Test 2 modules;
- run syntax/integrity checks;
- run `git diff --check`;
- stage exact paths only;
- create one descriptive commit unless a deliberate two-commit boundary is approved;
- push through the authenticated Git flow;
- create PR to `main`;
- confirm changed files and mergeability;
- squash and merge;
- verify merged markers on `origin/main`;
- verify the Live Hub canonical link;
- stop local servers and close open folder handles;
- remove worktree;
- delete local and remote feature branches;
- prune;
- confirm clean main.

---

## 7. Lean testing strategy

### 7.1 Reuse every time

Run the existing Test 1 Listening modules as regression protection for the reference page.

They protect:

- audio memory;
- fullscreen/Test audio;
- submission locking;
- post-submission review;
- split layout;
- task feedback;
- Answer Key/navigation;
- transcript sync;
- evidence;
- annotations.

### 7.2 Recommended Test 2 modules

Prefer a small target-specific suite such as:

| Module | Purpose |
|---|---|
| `test_listening_test2_foundation.py` | Mode lifecycle, controls, answer shapes, hub identity and no learning-resource leak |
| `test_listening_test2_audio.py` | Four sources, memory, safe seek/load, sequential Test playback and review audio |
| `test_listening_test2_transcripts.py` | All four datasets, stable IDs, timing, speakers and complete Q1–40 mapping |
| `test_listening_test2_study_feedback.py` | Task groups, strategies, Why/Skill/Evidence, special scoring and Answer Key |
| `test_listening_test2_review_annotations.py` | Snapshot lock, review lifecycle, split layout, highlights/notes and marker isolation |

Use a shared parser/helper inside the Test 2 test file if needed. Do not create four near-duplicate transcript modules unless the file size becomes genuinely unreviewable.

### 7.3 Phase-gate testing

During editing:

- run the focused target module;
- run syntax checks for changed script;
- run `git diff --check`.

At a phase gate:

- run all Test 2 modules;
- run the established complete Listening suite.

Before commit:

- run the complete suite once more;
- do not rerun it after a documentation-only or comment-only change unless executable code changed.

### 7.4 Avoid the test-of-tests problem

Do not:

- build large token-mutation frameworks for unchanged mechanisms;
- count source-string presence as proof when an executable contract is practical;
- duplicate Test 1 assertions line for line in many files;
- rerun the full matrix after every transcript sentence;
- treat unchanged native browser automation limitations as failures;
- add tests for temporary implementation details that the user cannot observe.

Add a new deep regression only when Test 2 introduces a genuinely new task shape, media mechanism or lifecycle rule.

---

## 8. Transcript and evidence production standard

### 8.1 Transcript record

Every row requires:

- stable ID: `p[part]-i###` or `p[part]-s###`;
- speaker key;
- exact visible text;
- `relatedQuestions`;
- numeric `start`;
- numeric `end`.

Requirements:

- IDs are unique;
- rows are ordered;
- `end > start`;
- genuine silence gaps are allowed;
- instruction rows normally have no answer mapping;
- duplicate/hallucinated endings are prohibited;
- no question is mapped to an indefensible row;
- all Q1–40 evidence mappings are complete.

### 8.2 Timing workflow

1. Verify audio source and duration.
2. Identify instruction and recording boundaries.
3. Segment by meaningful phrase, not arbitrary equal lengths.
4. Record start/end timing.
5. Confirm ordering and gaps.
6. Browser-check playback highlighting.
7. Click representative early, middle and late rows.
8. Confirm low-readiness seeking.
9. Confirm last row and end-of-part behaviour.
10. Recheck after any audio source fallback.

### 8.3 Evidence workflow

For each question:

1. identify the precise reasoning-bearing recording segment;
2. map one or more stable IDs;
3. avoid broad surrounding rows unless needed for meaning;
4. write learner-facing Evidence separately;
5. confirm evidence control highlights amber rows;
6. confirm seeking preserves the intended playback state;
7. confirm active green playback remains visible;
8. confirm Evidence never appears in active Test Mode.

### 8.4 Question-specific feedback

**Why** explains the listening logic:

- paraphrase;
- contrast;
- correction;
- distractor rejection;
- direction/orientation;
- category distinction;
- exact word heard;
- speaker attitude;
- sequence or relationship.

**Skill** is concise and practical:

- predict grammar;
- listen for correction;
- track map direction;
- distinguish example from answer;
- wait for final choice;
- check singular/plural;
- check spelling;
- treat Choose TWO as an unordered set.

**Evidence** identifies the defensible recording content without inventing a quote.

### 8.5 Strategy quality

Every task group needs:

- exact label and range;
- exact task type;
- short purpose;
- practical numbered steps;
- one realistic trap;
- accurate word/letter/reuse rules.

Avoid vague filler such as “listen carefully”.

---

## 9. Special task contracts

### Completion

- preserve exact word limit;
- accept only evaluator-approved variants;
- explain grammar prediction;
- preserve spelling and singular/plural rules;
- do not imply synonyms are accepted when the evaluator does not accept them.

### Multiple choice

- explain why the accepted option answers the stem;
- identify a tempting distractor when useful;
- listen through corrections and changes of mind;
- answer navigation must focus the selected radio or the first enabled option.

### Choose TWO

- evaluate as one unordered set;
- zero selected: unanswered;
- one correct: partially correct;
- all accepted: correct;
- no answer-order implication;
- display one combined card and one `x / 2 correct` score.

### Map/plan/diagram

- use native accessible selects unless a stronger existing control is already proven;
- preserve all labels and orientation;
- enforce a safe question-pane minimum width;
- do not let transcript split collapse the map;
- evidence should identify directional language;
- mobile must remain overflow-safe.

### Matching

- preserve the evaluator’s exact answer model;
- custom controls require native/state mirrors;
- submitted review must lock custom interactions;
- Answer Key/footer navigation must target the visible matching row.

---

## 10. Annotation contract

### Eligibility

Allow only authored text inside one safe question/task boundary.

Exclude:

- input, textarea, select and button;
- inline answer wrappers;
- drag slots, banks and choices;
- generated correct answers;
- Study feedback;
- strategies;
- header/footer/results;
- audio;
- audioscript.

### Highlights

- stable scoped IDs;
- multiple independent ranges;
- safe overlap segmentation;
- no nested duplicates;
- remove without damaging surrounding DOM;
- no answer or audio state changes.

### Notes

- Reading-style underlined anchor;
- no permanent icon or inline width;
- floating red `×` hidden by default;
- hover, focus and focus-within reveal;
- native delete button with accessible label;
- Enter/Space opens note;
- delete path does not open note or activate an answer;
- editor supports save, cancel, close and delete;
- desktop editor draggable;
- mobile editor remains usable.

### Marker independence

Annotation activity must not:

- set `activeQuestionNumber`;
- navigate to a question;
- create the blue marker;
- move an existing marker;
- clear an existing marker;
- focus a nearby answer.

Only genuine answer interaction, Answer Key navigation and footer navigation control the marker.

---

## 11. Layout and accessibility contract

### Desktop

- compact header;
- sticky audio below header;
- question and transcript panes fill usable space;
- draggable divider remains reachable;
- swap control is clear;
- no horizontal overflow;
- map/diagram question width protected;
- transcript speaker column compact but readable;
- note delete control does not alter line flow.

### Mobile

At approximately 390px:

- audio wraps to a full usable row;
- divider is hidden;
- panes stack;
- transcript height is capped;
- inline answers wrap naturally;
- map, matching and multiple choice remain usable;
- no permanent note icon appears between words;
- dialogs and note editor fit viewport;
- no clipped footer controls.

### Accessibility

- native controls where possible;
- visible `:focus-visible`;
- transcript rows use button semantics when seekable;
- current transcript uses `aria-current`;
- dialogs are labelled and restore focus;
- Answer Key entries are native buttons;
- note anchors and delete actions have meaningful accessible names;
- disabled submitted answers remain legible;
- keyboard order matches visual order.

---

## 12. Final browser QA script

### Fresh Study

1. Start Study Mode.
2. Confirm Score guide, Answer Key and Study Mode indicator.
3. Confirm no result or locked state.
4. Change Parts 1–4 and verify independent audio positions.
5. Confirm all transcripts render.
6. Click phrases and verify seek-and-play.
7. Manually scroll transcript and verify following pauses.
8. Resume following.
9. Open strategy panels and reveal one group.
10. Edit one answer and verify only that group invalidates.

### Evidence

1. Check representative questions in every part.
2. Click evidence.
3. Confirm exact amber rows.
4. Confirm safe seek.
5. Confirm green playback state remains distinguishable.
6. Confirm no text-search fallback.

### Annotations

1. Click an answer to establish a blue marker.
2. Highlight text beside another question.
3. Create, edit and delete a note.
4. Confirm marker does not move.
5. Reload fresh and annotate before selecting an answer.
6. Confirm no marker appears.
7. Check inline completion spacing and mobile wrapping.

### Fresh Test

1. Start with candidate name.
2. Confirm timer and supported fullscreen/focus behaviour.
3. Confirm Study resources and transcripts are hidden.
4. Confirm sequential Test audio.
5. Confirm part/question navigation does not restart the wrong source.
6. Confirm one final submission confirmation.

### Completed Test

1. Submit a controlled mixed set.
2. Confirm score and band once.
3. Close results.
4. Confirm locked Study Review.
5. Confirm all answers remain disabled.
6. Confirm audio/transcripts work without autoplay.
7. Confirm Answer Key, Score guide and feedback use snapshot.
8. Reopen results and confirm no recalculation.
9. Confirm annotations remain editable.

### Responsive and themes

Repeat representative checks at:

- desktop;
- approximately 390px;
- normal text;
- extra-large text;
- black on white;
- white on black;
- yellow on black.

Finish with:

- no unexpected console errors;
- no clipped controls;
- no document overflow;
- canonical Live Hub link opens the target page.

---

## 13. Codex operating rules

| Situation | Required setting/action |
|---|---|
| Read-only audit or substantial implementation | Model 5.6 Sol; Medium or High when needed; Standard; Goal off |
| Tiny correction, status, commit or cleanup | Model 5.6 Sol; Light; Standard; Goal off |
| Approval | Ask for approval for audits or shared-risk changes; approve tightly scoped target-page work |
| Prompt structure | Expected state → allowed paths → forbidden actions → acceptance states → tests → browser QA → Git report |
| Task boundary | End with “Stop after this task” and explicitly forbid later phases |
| Shared blocker | Stop and report exact generic limitation; do not create a title/version-specific workaround |
| Browser limitation | Preserve state and use the QA evidence hierarchy |
| Usage limit | Do not start long transcription/implementation work near the usage limit |
| Test link | Include localhost only when visual or audio testing is actually required |

### Required prompt preamble

```text
Before auditing or editing this Listening test, read and follow:

listening/shared/IELTS_LISTENING_FAST_TRACK_WORKFLOW.md
listening/shared/LISTENING_TEST_PARITY_CHECKLIST.md

Treat them as the required workflow and parity specification.

Use Cambridge IELTS 16 Listening Test 1 on current main as the visible
and behavioural reference. The target test files remain authoritative
for test-specific questions, instructions, answers, audio and timing.
```

### Prompt-design improvements

- Put Fresh Study, Checked Study, Fresh Test and Completed Test acceptance near the top.
- Give exact allowed paths.
- Separate transcript data work from speculative architecture.
- Require actual files touched during the task.
- Require evidence mappings to resolve before activation.
- Protect Test Mode from Study changes explicitly.
- State that annotations must not move the question marker.
- Avoid giant speculative test lists before the target audit.
- Use one complete browser session rather than repeated partial sessions.
- Do not provide the localhost link during planning-only tasks.

---

## 14. Shared change or target-specific change?

| Question | Yes | No |
|---|---|---|
| Does the behaviour already exist in two completed Listening pages? | Consider a focused shared contract | Keep it target-specific |
| Is the issue caused by a generic capability rather than content? | Add a focused generic test before changing architecture | Fix the target page/data |
| Would the helper inspect test title, version, question number or filename? | Reject as a shared hack | Continue if capability-based |
| Can Test 2 express the behaviour with its own data/config? | Do not touch shared code | Prove the missing capability |
| Would extraction require migrating Test 1 during Test 2 delivery? | Defer unless it clearly reduces risk | Keep Test 2 aligned first |
| Is the issue only one page’s layout/content? | Fix that page | Consider shared work only after repetition |

---

## 15. Git and release workflow

1. Fetch current `origin/main`.
2. Create one isolated Listening branch/worktree.
3. Keep work unstaged until visual approval.
4. Run focused modules during implementation.
5. Run complete Listening suite at phase gates.
6. Run final complete suite, syntax checks and `git diff --check`.
7. Stage exact intended paths only.
8. Commit with a descriptive message.
9. Push after GitHub authentication is confirmed.
10. Create PR with base `main`.
11. Verify changed files, checks and mergeability.
12. Squash and merge.
13. Verify the squash commit on `origin/main`.
14. Verify target file, tests and Live Hub path on `origin/main`.
15. Stop localhost servers.
16. Close terminals, editors and Explorer windows using the worktree.
17. Remove worktree.
18. Delete local and remote feature branches.
19. Fetch/prune and confirm clean main.

### PR template

**Title**

`Add IELTS 16 Test 2 Listening Study mode and parity`

**Description sections**

- Summary
- Included
- Validation
- Known environment limitations

Report:

- exact automated test count;
- zero genuine failures;
- syntax/integrity result;
- desktop/mobile/theme review;
- audio/transcript review;
- native range-selection or fullscreen limitation if unchanged;
- confirmation that protected unrelated worktrees were not modified.

---

## 16. Anti-patterns to avoid

| Avoid | Use instead |
|---|---|
| Starting transcript content before the lifecycle audit | One read-only delta audit |
| Copying Test 1 constants wholesale | Target-specific inventory and validation |
| Text-search evidence | Stable segment mappings |
| One audio position for all parts | Independent part memory |
| Pending restore overriding a user seek | Newest-request-wins token |
| Study part changes autoplaying | Restore paused unless user explicitly activates playback |
| Test navigation reloading Study audio | Separate Test playback section |
| Recalculating completed results from DOM | Immutable submitted snapshot |
| Showing transcripts in active Test Mode | Study and locked-review gating |
| Permanent note icons | Floating hover/focus delete |
| Annotation actions moving the marker | Independent annotation state |
| Huge target-specific mutation frameworks | Five lean Test 2 modules plus reused regression suite |
| Treating browser automation gaps as product defects | Evidence hierarchy and manual smoke check |
| Committing before visual approval | Unstaged work until all states pass |
| Deleting worktrees while servers/folders are open | Close handles first |
| Assuming a hub redesign changed the page | Verify the canonical generated path |

---

## 17. Next-test launch plan

For IELTS 16 Listening Test 2:

- update to current `main`;
- create an isolated Listening worktree;
- run one read-only audit;
- produce a one-page delta against Test 1;
- confirm all four audio files and the target answer evaluator;
- identify exact task groups;
- identify any new task shape;
- plan five lean target modules;
- freeze shared architecture unless a blocker is proven.

Expected normal outcome:

- no new shared-core work;
- target-page parity implementation;
- Test 2 transcripts and evidence;
- Test 2 student-support content;
- one controlled visual QA session;
- one PR.

---

## 18. One-page runbook

### Before coding

- Pull/fetch latest `main`.
- Create isolated Listening worktree.
- Read workflow and checklist.
- Confirm target path and hub route.
- Inventory four audio files.
- Confirm 40 questions and answer key.
- Map exact task groups.
- Audit Test/Study/submission lifecycle.
- Report delta and blockers.
- Do not edit during audit.

### During implementation

- Add foundation first.
- Preserve Test Mode.
- Add safe audio memory and seeking.
- Add immutable submitted review.
- Add all four transcript datasets.
- Map Q1–40 evidence.
- Add strategies and Q1–40 feedback.
- Add annotations without marker coupling.
- Run focused modules.
- Keep shared code frozen unless proven necessary.

### Before commit

- Fresh Study.
- Checked Study.
- Fresh Test.
- Completed Test.
- Parts 1–4 audio/transcript.
- Evidence.
- Annotations.
- Desktop/mobile/themes/text size.
- Hub path.
- Console.
- Complete Listening suite.
- Syntax/integrity.
- `git diff --check`.
- Exact staging.
- One commit/PR.
- Squash merge.
- Verify `origin/main`.
- Close handles and clean branch/worktree.

---

## Final recommendation

Treat Cambridge IELTS 16 Listening Test 1 as the stable behavioural reference for the next test, not as a page to redesign and not yet as a mandate for a large shared-core extraction.

The next Listening test should primarily be:

- a target-page lifecycle alignment;
- four accurate transcript datasets;
- complete question-to-evidence mappings;
- task-specific student support;
- focused regression protection;
- one deliberate release.

Following this workflow should reduce repeated audio fixes, transcript rework, annotation polish loops, over-testing and release friction while preserving the standard achieved in PR #385.
