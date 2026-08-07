# IELTS General Training Reading Fast-Track Production Workflow

**IELTS Website Practice Creation — canonical General Training Reading production guide**  
**Reference implementations:** Cambridge IELTS 19 General Training Reading Tests 1–4  
**Core releases:** PR #379 and PR #381  
**Stabilisation releases:** PR #387, PR #389 and PR #392  
**Focused regression release:** PR #436 — Test 3 header CSS inheritance and Study-dialog containment  
**Current reference commit:** `94455b5135879d06e514388a2ba9341bb3273144`  
**Prepared:** 2 August 2026  
**Updated:** 8 August 2026

> **Operating rule**
>
> Before auditing or editing a General Training Reading test, read and follow:
>
> - `general-training/shared/IELTS_GT_READING_FAST_TRACK_WORKFLOW.md`
> - `general-training/shared/GT_READING_TEST_PARITY_CHECKLIST.md`
>
> Treat them as the required workflow and pass/fail specification. The target test HTML, local passage/question/answer files, answer key, accepted variants and evaluator remain authoritative for test-specific content.
>
> A shared Reading dialog is not verified merely because its button exists. Open and inspect every available Score guide, Answer Key and score-feedback dialog after any header, toolbar, mount or responsive CSS change.

---

## Executive summary

Cambridge IELTS 19 General Training Reading Tests 1–4 now form the project’s behavioural reference set. Tests 1 and 2 established the integration patterns; Tests 3 and 4 exposed lifecycle, scoring, matching, layout and header/logo regressions that are now part of the required parity contract. All four use the shared Academic Reading shell while preserving General Training terminology, section structure, scoring, multiple-text layouts and target-specific answer controls.

The final experience includes:

- Test Mode and Study Mode;
- a General Training score guide and Answer Key;
- task-specific strategies;
- Q1–40 Correct answer, Why and Skill feedback;
- 40 magnifying-glass passage clues;
- section-level clue controls;
- repeatable Study checking;
- final Test submission locking;
- section performance reporting;
- responsive layout, themes, text sizes, highlights and notes;
- a consistent IELTS Pabs home route.

The final quality is strong, but the route exposed several avoidable delays:

- Test 1 and Test 2 used different integration shapes.
- Newer shared-shell validation required an explicit `partLabel: "Section"`.
- Legacy result reading required an explicit compatibility opt-in.
- Clue controls disappeared until complete question and clue coverage were declared.
- A visible Evidence row was added even though the magnifying-glass highlight already showed the supporting passage text.
- Some clue spans and Why/Skill explanations were technically correct but too compressed to resolve the learner's misunderstanding.
- General Training sections contain multiple independent text roots, so Academic assumptions about one passage per section are unsafe.
- Custom drag/drop and matching controls require explicit final Test locking.
- A Test 3 header `white-space: nowrap` rule leaked into nested shared Reading dialogs, squeezing the Score guide until modal content was explicitly protected.

The central lesson is:

**Use the shared Reading shell, but audit the General Training page as its own product. Do not treat it as Academic Reading with different text, do not treat technically correct feedback as sufficient unless it produces a clear learner 'aha', and do not assume a fixed overlay is isolated from the CSS ancestry of the element that mounts it.**

For the next General Training Reading target, the expected normal path is:

1. clean branch and baseline;
2. one read-only delta audit;
3. one foundation and lifecycle pass;
4. one student-data and clue pass;
5. one browser QA and release pass.

A genuine shared-shell blocker may justify one extra tightly scoped task. Repeated micro-batches should not be the default.

---

## 1. What Tests 1–4 established

### 1.1 Canonical shared Reading shell

Both reference tests use the project’s shared Reading assets:

- `academic/shared/reading-feature-shell.css`
- `academic/shared/reading-feature-shell-core.js`

The shared shell owns reusable Study resources and review presentation. It does not replace the target page’s passages, questions, evaluator, timer, Test protections or answer controls.

### 1.2 General Training terminology

The user-facing contract uses:

- **General Training Reading**, not Academic Reading;
- **Section**, not Part;
- **Text**, not Passage when referring to the short source items inside Sections 1 and 2;
- **Performance by section**, not Performance by part;
- **section clues**, not passage clues where the broader section control is described.

Every configuration must provide an explicit General Training label such as:

```js
partLabel: "Section"
```

Do not rely on text replacement after rendering when the shared API can express the terminology directly.

### 1.3 General Training score guide and section totals

The reference pair uses the General Training Reading conversion and the page’s existing evaluator. It does not reuse the Academic Reading conversion.

For Cambridge IELTS 19 Tests 1 and 2, the section ranges are:

- Section 1: Q1–14;
- Section 2: Q15–27;
- Section 3: Q28–40.

These are reference-test facts, not universal constants. Every target must audit its own ranges and evaluator.

### 1.4 Multiple text roots

Sections 1 and 2 commonly contain more than one independent text. The reference pair therefore maps questions to stable text roots, for example:

- `#text-s1-campsites`;
- `#text-s1-tram`;
- `#text-s1-knitwear`;
- `#text-s2-leadership`;
- `#text-s2-resigning`.

A clue must resolve inside the correct text root. Searching the whole section is not acceptable when the same phrase could appear in another notice, review, advertisement or workplace text.

### 1.5 Student support

The reference Study experience provides:

- a General Training score guide;
- an interactive Answer Key for Q1–40;
- task-group strategy panels;
- Correct answer;
- Why;
- Skill;
- a magnifying-glass clue for every question;
- a section-level clue control;
- correct, incorrect and unanswered states after checking;
- section totals and task feedback after an official result exists.

The visible feedback card does **not** show a separate Evidence row. The evidence excerpt remains internal and powers passage highlighting. This avoids repeating the same information directly below the highlighted source text.

### 1.6 Test submission and locking

After final Test submission:

- the evaluator runs once;
- the timer stops;
- the result is frozen;
- text inputs, radio buttons, selects and checkboxes are locked;
- custom drag/drop items and drop zones are also locked;
- submit controls are disabled;
- the result overlay can close into a locked review;
- learning resources become available without allowing answer changes;
- reopening results does not create a new result.

### 1.7 Two supported integration patterns

#### Preferred direct integration — Test 2 pattern

The target HTML provides the shared-shell mount, stable instruction hosts, text roots and page adapters directly. Test-specific student data lives in a sidecar such as `study-feedback-data.js`.

Use this pattern for new work whenever practical.

#### Legacy adapter integration — Test 1 pattern

A small target adapter prepares stable instruction hosts and text roots around an older standalone HTML page, then connects the shared shell without rewriting the entire test.

Use this pattern only when direct integration would create unnecessary risk. Keep the adapter target-specific and do not move page-shape assumptions into shared code.

---

## 2. Main causes of delay and the new rule for each

| Area | What caused delay | Rule for future tests |
|---|---|---|
| Academic assumptions | Early work risked treating GT as Academic with different content | Audit terminology, score conversion, section ranges and multi-text structure first |
| Integration shape | Test 1 needed a compatibility adapter while Test 2 was closer to direct integration | Choose the integration pattern during the read-only audit and do not redesign midway |
| Section label | Shared validation later required explicit terminology | Always configure `partLabel: "Section"` before activation |
| Legacy submitted result | Older pages depended on DOM result compatibility | Prefer an authoritative snapshot; otherwise opt into the approved compatibility path explicitly and test it |
| Clue capability | Clues disappeared when completeness flags were missing | Require complete Q1–40 detail and clue coverage before activation |
| Visible Evidence | Evidence text duplicated the highlighted passage | Keep evidence internally; show Correct answer, Why, Skill and the clue button only |
| Instructional clarity | Some clues and explanations were too short or generic to resolve the learner's exact misunderstanding | Apply the Aha test to every Q1–40 clue/Why/Skill trio; use the shortest wording that still makes the logic explicit |
| Multiple text roots | Whole-section searching could target the wrong notice/review | Give each source text a stable root and resolve clues within that root |
| Custom locking | Native inputs locked but drag/drop could remain interactive | Include every custom control in final Test locking tests |
| Header CSS inheritance | A broad Test 3 `white-space: nowrap` rule was inherited by fixed dialogs mounted inside the header | Record shell mount ancestry, scope header selectors to direct controls, explicitly reset dialog inheritance and open every shared dialog in browser QA |
| Home route | Test 2’s clickable home logo needed a separate repair | Treat the home route and leave warning as a standard parity item |
| Browser automation | Fullscreen and native browser prompts can be environment-limited | Use the evidence hierarchy and report environment limitations separately |
| Documentation timing | The GT contract was learned during implementation | Read the workflow and checklist before the next target audit |

---

## 3. Fixed sources of truth

Conflicts must be resolved in this order.

| Priority | Source | Used for |
|---|---|---|
| 1 | Target GT HTML and local source files | Exact texts, questions, instructions, word limits, layouts and answer-control shapes |
| 2 | Target `answerKey`, accepted-answer display and evaluator | Scoring, normalisation, partial credit, raw score and General Training band |
| 3 | `general-training/shared/GT_READING_TEST_PARITY_CHECKLIST.md` | Pass/fail behaviour for modes, clues, layout, accessibility, testing and release |
| 4 | Cambridge IELTS 19 GT Test 2 on current `main` | Preferred direct-integration reference |
| 5 | Cambridge IELTS 19 GT Test 1 on current `main` | Legacy-adapter reference and compatibility proof |
| 6 | Shared Reading shell and regression tests | Generic capability behaviour and regression protection |
| 7 | Current Live Hub `index.html` | Canonical route and availability only |
| 8 | Merged GT stabilisation PRs | Historical reasons for explicit terminology, compatibility, clue coverage and feedback display rules |

### Golden rules

#### Never infer test content from memory

Preserve the target page’s exact:

- task instructions;
- answer limits;
- reuse rules;
- letter/word formats;
- question ranges;
- answer-control types;
- accepted variants.

#### Never reuse the Academic band conversion

The target GT evaluator is authoritative. The score guide must agree with it.

#### Never assume one text per section

Sections 1 and 2 may contain several notices, advertisements, reviews, instructions or workplace texts. Give each text a stable root.

#### Never assume a fixed dialog is isolated from its mount ancestry

The shared shell may append fixed backdrops inside a header or toolbar mount. Inherited properties and containing-block rules can still affect the dialog. Record the mount ancestry, scope page-level selectors narrowly, and inspect the opened dialog rather than checking only its trigger.

#### Never expose internal evidence merely because it exists

Internal evidence is required for validation and highlighting. The visible card follows the product contract: Correct answer, Why, Skill and clue control.

#### The Live Hub is a router

The canonical path format is:

`./general-training/cambridge-[book]/test-[test]/IELTS[book]%20Test%20[test]%20-%20Reading%20-%20GT.html`

The hub does not own test content or Study feedback.

---

## 4. Definition of Done by state

### 4.1 Fresh Study

Must be visible or available:

- Study Mode header shell;
- General Training score guide;
- Answer Key;
- strategy information for every exact task group;
- Q1–40 neutral feedback cards;
- Correct answer, Why and Skill for every question;
- 40 enabled magnifying-glass clue buttons;
- section-level clue control;
- highlights and notes in eligible authored content;
- editable answers;
- correct General Training terminology.

The Score guide and Answer Key must each be opened and visually inspected. Their title, introduction, table/grid content and close control must use the intended dialog width without clipping, inherited one-line layout or squeezed columns.

Must remain hidden or neutral:

- no official correctness or points;
- no final score or band;
- no section totals;
- no What went well / Focus next ranking;
- no visible Evidence row;
- no locked-review label.

### 4.2 Checked or submitted Study

After explicit checking:

- the evaluator runs through the target page;
- correctness and points appear;
- raw score and GT band agree with the page;
- section totals use the audited target ranges;
- task-performance feedback appears when the required outcomes are available;
- the score-feedback dialog opens at its intended width and every section card remains readable;
- all learning resources remain visible;
- answers remain editable;
- a new explicit check refreshes the result cleanly;
- no duplicate cards, clue buttons, marks, badges or result controls appear.

Where the page uses a submitted Study snapshot, live edits must not alter it until resubmission. Where the page uses group-by-group checking, only the affected group should invalidate. The audit must record which model the target page uses.

### 4.3 New Study attempt

- previous official result and status styling are cleared;
- general learning resources remain available;
- answers return to the target page’s fresh state;
- no stale section totals, task rankings, marks or badges remain.

### 4.4 Fresh Test

Must be active:

- candidate/start flow;
- 60-minute timer or target-defined timing;
- fullscreen/focus handling where supported;
- leave/reload protection after start;
- answer and section navigation;
- one submission confirmation;
- one final submission path.

Must remain hidden:

- Score guide;
- Answer Key;
- strategies;
- feedback cards;
- clue buttons and section clue map;
- score, band and section totals.

### 4.5 Completed Test / locked review

Must be active:

- one frozen final result;
- locked native and custom answer controls;
- stopped timer;
- disabled submit controls;
- learning resources derived from the submitted result;
- Answer Key, score guide, feedback and clues;
- newly available completed-Test dialogs that open without clipping or inherited header layout;
- section and question navigation;
- editable highlights and notes where the page permits them;
- leave/reload protection according to the target Test contract.

Must remain impossible:

- changing submitted answers;
- rescoring from mutable live controls;
- restarting the timer;
- duplicating result, feedback or clue UI;
- reactivating drag/drop or custom matching controls.

### 4.6 Fresh reload

A full reload returns to the mode chooser and clears attempt state unless the product explicitly defines persistence. Theme or text-size preferences may persist if the existing page already supports them.

---

## 5. General Training-specific content contract

### 5.1 Section structure

Audit and record:

- Q range for each section;
- number of source texts in each section;
- source-text titles or labels;
- stable DOM root for each source text;
- task groups and their exact question ranges.

Do not hard-code 14/13/13 without verifying the target.

### 5.2 Task types

The workflow must support the target’s actual mix, including where present:

- matching information across advertisements/notices/reviews;
- matching features or people;
- True / False / Not Given;
- Yes / No / Not Given;
- matching headings;
- multiple choice;
- Choose TWO or other grouped multiple-answer tasks;
- sentence, note, table, form, flow-chart or summary completion;
- short answer;
- custom drag/drop matching.

### 5.3 Instructions and word limits

Every strategy and validator must preserve the exact instruction:

- ONE WORD ONLY;
- NO MORE THAN TWO WORDS;
- NO MORE THAN THREE WORDS AND/OR A NUMBER;
- choose a letter;
- letters may or may not be reused;
- answer order rules for grouped tasks.

Do not imply an accepted synonym unless the evaluator accepts it.

### 5.4 Section language

Use Section and Text consistently in:

- headers;
- footer chips;
- Answer Key headings;
- score feedback;
- clue toolbar;
- accessibility labels;
- strategy copy.

---

## 6. Reusable architecture contract

### 6.1 Page-owned responsibilities

Each target page remains responsible for:

- exact content and instructions;
- answer controls;
- answer key and accepted variants;
- evaluator and GT band conversion;
- Study/Test start and mode state;
- timer, fullscreen and focus protections;
- submit guards;
- final locking;
- section switching and question navigation;
- authoritative submitted result where available;
- highlight and note eligibility.

### 6.2 Shared-shell responsibilities

The shared Reading shell provides:

- Score guide;
- Answer Key;
- strategies;
- feedback-card rendering;
- score feedback;
- clue buttons;
- section clue maps;
- generic dialogs and accessibility behaviour;
- capability validation and isolation.

Shared code must be capability-based. It must never branch on:

- Cambridge book number;
- test number;
- question number;
- page filename;
- a GT test title.

### 6.3 Preferred result contract

Preferred pages expose an authoritative submitted object containing:

```js
{
  submissionId,
  rawScore,
  band,
  partScores: {
    1: { score, max },
    2: { score, max },
    3: { score, max }
  },
  questionOutcomes: { 1: true, /* ... */ 40: false }
}
```

The property name `partScores` is the shared API field; user-facing copy must still say Section.

### 6.4 Approved legacy compatibility

An older page may use:

```js
compatibility: {
  allowDomSubmittedResult: true
}
```

Use this only when:

- the target evaluator is already authoritative;
- score and band output are stable;
- section outcomes can be reproduced correctly;
- the compatibility path is explicit;
- browser tests prove Fresh Study, checked Study and completed Test behaviour.

Do not create a hidden title-specific parser in shared code.

### 6.5 Target data sidecar

Prefer a pure target data file containing:

- terminology;
- score guide;
- task groups;
- Q1–40 answer display;
- Why;
- Skill;
- internal evidence target;
- text root;
- optional dedicated clue text/target.

Keep page wiring and data separate where practical.

### 6.6 Shared-dialog containment and inheritance contract

The shared Reading shell may mount fixed backdrops inside the header host. Therefore:

- record the mount’s DOM ancestry during the read-only audit;
- scope header and toolbar selectors to direct controls rather than broad descendant trees;
- audit inherited `white-space`, `font-size`, `line-height`, `text-align`, `overflow`, `min-width` and `max-width`;
- audit containing-block risks from `position`, `transform`, `filter`, `perspective`, containment and flex/grid sizing;
- explicitly reset dialog/backdrop inheritance when the mount cannot be moved safely;
- keep titles, introductions, tables, cards and close controls inside the visible dialog;
- open Score guide, Answer Key and score feedback after every header, toolbar, mount or responsive CSS change;
- repeat representative dialog checks at desktop, narrow width, extra-large text and all three themes.

A visual header fix is not complete until the shared-dialog smoke matrix passes. Button presence, hidden DOM or unit-level selector checks alone do not prove modal usability.

---

## 7. Student-data contract

### 7.1 Task groups

Every Q1–40 must belong to exactly one task group.

Each group requires:

- stable ID;
- section;
- control host;
- learner-friendly label;
- exact question list;
- purpose;
- practical numbered steps;
- realistic trap.

### 7.2 Question details

Each question requires:

- accepted answer display;
- Why explanation;
- concise but instructionally resolving Skill;
- internal evidence target with enough context to make the logic clear;
- correct text root;
- group ID.

### 7.3 Visible feedback policy

Display:

- Correct answer;
- Why;
- Skill;
- magnifying-glass clue.

Do not display a separate Evidence row in the GT reference experience.

### 7.4 Why standard

Why must explain the relationship between question and text. It must not merely repeat the correct answer.

For:

- TRUE: explain the agreement;
- FALSE: identify the contradiction;
- NOT GIVEN: identify the related information that is present and the required detail that is absent;
- matching: explain the exact paraphrase;
- completion: explain meaning and grammatical fit;
- multiple choice: explain why the correct option matches the whole idea and why distractors fail when useful.

### 7.5 Skill standard

Skill should be concise, specific and teachable, for example:

- comparing time boundaries;
- distinguishing a rule from an unstated consequence;
- matching an absolute claim to a paraphrase;
- predicting noun form from grammar;
- separating a main idea from one example.

The Skill line must also tell the learner what to do differently next time. A label such as `scan for keywords` is not enough unless it identifies the decisive relationship the learner must compare.

### 7.6 Instructional resolution standard — the Aha test

The clue, Why and Skill form one teaching sequence. Together they must move a learner from confusion to a clear understanding of both the answer and the reading move that produced it.

#### Self-contained review standard

Use this editorial pass/fail test: **could a student understand why the answer is correct using only the question, the displayed/highlighted clue(s) and the Why explanation, without needing the rest of the passage?** If not, the clue or explanation is too compressed.

The preferred clue unit is one complete sentence. Use two short connected sentences when the logic crosses a sentence boundary—for example contrast, cause/effect, pronoun reference, condition or a qualification introduced in the next sentence. A shorter clause is acceptable only when it is genuinely self-contained. Do not lengthen clues mechanically.

For matching headings, use the sentence or pair of sentences that captures the paragraph’s main idea rather than a vivid supporting detail. For NOT GIVEN, show the closest relevant stated information and make the Why identify exactly which required detail is absent; never invent evidence for absence.

#### Clue

The highlighted clue must show the **minimum sufficient evidence span**:

- include the decisive word or phrase;
- include enough surrounding text to preserve the subject, action and logical relationship;
- include a negation, qualifier, comparison, condition, cause, time marker or reference word when it changes the meaning;
- do not highlight only the answer word or a fragment that forces the learner to infer the missing logic;
- do not make the span unnecessarily broad.

There is no hard word count. Prefer one complete sentence, or two short connected sentences when the reasoning requires both. The correct length is the shortest span that remains self-contained and logically complete.

#### Why

Why must create an explicit reasoning bridge:

1. identify the important wording or claim in the question;
2. identify the matching, contrasting or missing information in the source;
3. explain the logical relationship;
4. state why that relationship produces the answer;
5. where useful, name the likely distractor or misunderstanding.

#### Skill

Skill must convert the question-specific lesson into a reusable action. It should name the reading operation and the concrete feature to check next time, such as a time boundary, negation, degree word, pronoun reference, grammar fit or difference between a rule and an example.

#### Pass/fail question

A trio fails the Aha test when a plausible learner who chose the wrong answer could read it and still reasonably ask:

- `But why is that the answer?`
- `Which exact words changed the meaning?`
- `What should I do differently on the next question?`

Avoid vague endings such as `look carefully`, `scan for keywords`, `read the paragraph` or `the text says so` unless the explanation also identifies the exact relationship that matters.

Generic example:

- Weak clue: `after Monday`.
- Clearer clue: `Applications received after Monday will not be considered.`
- Weak Why: `The passage says the statement is false.`
- Clearer Why: `The question says applications are accepted after Monday, but the text says applications received after Monday will not be considered. The time condition is opposite, so the statement is FALSE.`
- Weak Skill: `Scan for keywords.`
- Clearer Skill: `Compare the time marker and the rule attached to it; matching nouns do not help when after reverses the condition.`

---

## 8. Text-root and clue standard

### 8.1 Stable text roots

Every short source text must have a stable unique root. Do not use positional selectors that can change when headings or separators are inserted.

### 8.2 Exact target

The target fragment must:

- exist in the correct text root;
- be distinctive enough to resolve once;
- preserve exact punctuation where required by the renderer;
- survive normal whitespace normalisation;
- support shared evidence where several questions genuinely use the same phrase;
- include the minimum sufficient context for the learner to understand the logic without reconstructing omitted words;
- include decisive qualifiers, negation, comparison, condition, cause or time language when relevant;
- avoid an isolated answer word or a misleadingly short fragment.

### 8.3 Complete coverage

Before activating clues:

- all 40 questions must have valid details;
- all 40 questions must have valid clue targets;
- every target root must exist;
- every target must resolve;
- `completeQuestionCoverage: true` must be justified;
- `completeClueCoverage: true` must be justified.

### 8.4 Visible Evidence setting

GT Tests 1 and 2 use:

```js
showEvidenceText: false
```

This suppresses only the redundant visible row. It must not disable clue data or passage highlighting.

### 8.5 Section clue control

The section-level control must:

- show all valid clues for the active section/text context;
- avoid duplicate marks and badges;
- clear or suspend marks when changing section;
- restore only retained open intent;
- stay closed after an explicit close;
- use the correct section terminology.

---

## 9. Fast-track workflow for the next GT Reading target

### Phase 0 — branch and baseline

Create one isolated feature branch from current `origin/main`.

Required output:

- branch name;
- base SHA;
- clean status;
- exact target HTML path;
- current Live Hub route;
- target file inventory;
- existing test inventory;
- confirmation that unrelated Reading, Listening, Writing, Speaking and hub work is untouched.

Stop if:

- main is stale;
- the branch is wrong;
- the worktree is dirty in target/shared paths;
- another branch is editing the same target;
- required source files are missing.

### Phase 1 — one read-only delta audit

Compare the target against:

- the GT parity checklist;
- GT19 Test 2 direct integration;
- GT19 Test 1 legacy adapter;
- the shared Reading contract.

Audit:

- all 40 questions;
- section ranges;
- every source text;
- task instructions and word limits;
- answer controls;
- answer key and accepted variants;
- evaluator and GT band conversion;
- Test lifecycle and locking;
- existing Study integration;
- stable instruction hosts;
- stable text roots;
- shell mount ancestry and the containers that own shared dialog backdrops;
- header, toolbar and responsive selectors that could leak inherited or containing-block styles into shared dialogs;
- special controls such as drag/drop or Choose TWO;
- current tests;
- exact allowed paths;
- genuine shared blockers.

Output one short delta report. Do not edit.

### Phase 2 — foundation and lifecycle pass

Implement only:

- shared CSS/core loading;
- shell mount and direct terminology config;
- page adapters;
- result contract or approved compatibility;
- section ranges;
- instruction hosts;
- text roots;
- Test locking adapters;
- narrowly scoped header/toolbar styles and any required shared-dialog inheritance reset;
- home route;
- target foundation tests.

Do not write Q1–40 explanations yet.

Stop when:

- Fresh Study shell initialises;
- Fresh Test remains private;
- completed Test remains locked;
- Score guide and Answer Key open with complete visible layouts;
- shared tests remain green.

### Phase 3 — student-data and clue pass

Add:

- exact task groups;
- all Q1–40 Correct answer displays;
- all Why explanations;
- all Skills;
- internal evidence/clue targets;
- complete text-root mappings;
- score guide;
- target data validators;
- a human Aha-test review of every Q1–40 clue/Why/Skill trio from the perspective of a plausible wrong-answer learner.

Activate complete coverage only after all targets resolve and every trio is instructionally clear, not merely present.

### Phase 4 — browser QA

Run one complete browser session:

1. Fresh Study;
2. open and fully inspect Score guide and Answer Key;
3. checked/submitted Study;
4. open and fully inspect score feedback;
5. new Study attempt;
6. Fresh Test;
7. completed Test/locked review and newly available dialogs;
8. all sections and every source text;
9. representative early, middle and late clues;
10. section-level clue control;
11. custom control locking;
12. desktop, approximately 390 px, extra-large text and all themes;
13. repeat the shared-dialog smoke matrix after any header, toolbar, mount or responsive CSS change;
14. home route and leave warning;
15. clean console.

### Phase 5 — release

- run final target and shared tests;
- run JavaScript syntax checks and `git diff --check`;
- verify exact changed paths;
- stage only intended files;
- create one descriptive commit;
- push after authentication is confirmed;
- create PR to `main`;
- verify changed files, checks and mergeability;
- squash merge;
- verify the squash commit on `origin/main`;
- verify target file, tests and hub route on `origin/main`;
- stop servers and remove the branch/worktree safely.

---

## 10. Lean testing strategy

### 10.1 Reuse every time

Run the shared Reading-shell matrix and the existing GT19 Tests 1 and 2 reference checks where relevant.

### 10.2 Recommended target modules

Prefer a small target-specific suite:

| Module | Purpose |
|---|---|
| `test_gt_reading_testX_foundation.py` | Identity, 40 questions, ranges, loader, shared assets, terminology and no learning leak |
| `test_gt_reading_testX_scoring.py` | Answer key, accepted variants, GT band, section totals, special scoring and final locking |
| `test_gt_reading_testX_study_data.py` | Task groups, Q1–40 Correct answer/Why/Skill, visible Evidence suppression, score guide and structural completeness |
| `test_gt_reading_testX_clues.py` | Text roots, all 40 targets, clue buttons, section control and highlight rendering |
| `test_gt_reading_testX_browser_lifecycle.py` | Fresh/checked Study, Fresh/completed Test, resubmission, shared-dialog smoke matrix, duplication and custom-control locking |

Add a new deep module only for a genuinely new question-control mechanism. Automated checks can prove completeness and target resolution, but they cannot prove that a learner will understand the explanation or that a visually opened dialog is usable; the all-40 Aha-test editorial review and browser dialog inspection remain mandatory.

### 10.3 Phase-gate testing

During editing:

- run the focused target module;
- run syntax checks for changed scripts;
- run `git diff --check`.

At each gate:

- run all target modules;
- run the established shared Reading suite.

Before commit:

- run the complete matrix once more;
- do not rerun it after a documentation-only change unless executable code changed.

### 10.4 Evidence hierarchy

Use:

1. live browser behaviour;
2. production-linked executable test;
3. structural validator;
4. source-string assertion.

For dialogs, live browser evidence means opening the dialog and inspecting its visible title, explanatory text, content body, controls and responsive behaviour. Trigger presence is not equivalent evidence.

Report unchanged fullscreen or native browser-control limitations separately from product failures.

---

## 11. Scoring and result integrity

### 11.1 Target evaluator is authoritative

The shared shell must not independently redefine accepted answers or band conversion.

### 11.2 Reference GT guide

The current Cambridge 19 GT Tests 1–4 use this estimate:

| Correct | Band |
|---|---|
| 40 | 9 |
| 39 | 8.5 |
| 37–38 | 8 |
| 36 | 7.5 |
| 34–35 | 7 |
| 32–33 | 6.5 |
| 30–31 | 6 |
| 27–29 | 5.5 |
| 23–26 | 5 |
| 19–22 | 4.5 |
| 15–18 | 4 |
| 12–14 | 3.5 |
| 9–11 | 3 |
| 0–8 | Below 3 |

Do not copy this table without confirming that it agrees with the target page and current project decision.

### 11.3 Special scoring

Audit:

- unordered grouped answers;
- partial credit rules;
- multiple controls representing one scored item;
- drag/drop letter normalisation;
- case and whitespace normalisation;
- alternative spellings;
- number formats.

The Study display and completed Test review must match the page evaluator exactly.

---

## 12. Accessibility, layout and themes

Every target must verify:

- unique IDs;
- keyboard-operable mode choices, dialogs, clue controls and custom answers;
- accessible names for icon-only controls;
- visible focus;
- meaning not dependent on colour alone;
- black-on-white, white-on-black and yellow-on-black themes;
- normal, large and extra-large text;
- desktop and approximately 390 px widths;
- multiple short texts remain readable;
- divider and pane layout remain usable;
- inline completions wrap naturally;
- drag/drop, matching, tables and flow charts do not overflow;
- the home logo works by mouse, Enter and Space;
- dialogs close by their intended controls and restore focus;
- Score guide, Answer Key and score feedback are each opened and inspected, not only detected in the DOM;
- dialog titles, introductions, tables, cards and close controls stay inside the visible dialog;
- dialog content is not squeezed by inherited `white-space: nowrap`, flex sizing, text alignment or overflow;
- header and toolbar changes are audited for `white-space`, `font-size`, `line-height`, `text-align`, `overflow`, `min-width`, `max-width`, `position`, `transform`, `z-index`, flex and grid effects;
- the shared-dialog smoke matrix passes at desktop, approximately 390 px, extra-large text and representative theme states;
- no unexpected console errors.

---

## 13. Shared change or target-specific change?

| Question | Yes | No |
|---|---|---|
| Does the behaviour already work in both GT19 Tests 1 and 2? | Reuse the existing contract | Keep the target change local |
| Can the target express the behaviour through config or data? | Do not touch shared core | Prove a missing generic capability |
| Would the shared fix inspect title, book, test, question range or filename? | Reject it as a test-specific shared hack | Continue if capability-based |
| Is the problem caused by one page’s DOM shape? | Use a target adapter | Consider shared work only after repetition |
| Is a dialog broken only because the target mount sits inside a styled header? | Scope or reset the target inheritance locally and add the dialog smoke test | Consider shared core only if the same generic failure reproduces across targets |
| Does malformed optional data disable unrelated features? | Fix capability isolation generically with a failing test | Keep current contract |
| Is the issue only terminology? | Configure Section/Text labels directly | Avoid global text replacement |
| Is the issue only the redundant visible Evidence row? | Use `showEvidenceText: false` | Do not remove internal clue data |
| Would extraction require migrating completed tests during the target build? | Defer unless it clearly reduces risk | Keep the next target aligned first |

---

## 14. Git and release workflow

1. Fetch current `origin/main`.
2. Create one isolated GT Reading branch/worktree.
3. Read the workflow and checklist.
4. Run one read-only audit.
5. Keep implementation unstaged until browser approval.
6. Run focused tests during each phase.
7. Run the complete target/shared matrix at gates.
8. Run final syntax checks and `git diff --check`.
9. Verify exact intended paths.
10. Stage exact files only.
11. Commit with a descriptive message.
12. Push after GitHub authentication is confirmed.
13. Create PR with base `main`.
14. Verify changed files, checks and mergeability.
15. Squash merge.
16. Verify the squash commit on `origin/main`.
17. Verify target HTML, sidecars, tests and Live Hub route.
18. Stop local servers.
19. Close terminals/editors/Explorer windows holding the worktree.
20. Remove worktree and local/remote feature branches.
21. Fetch/prune and confirm clean main.

### PR template

**Title**

`Add IELTS [book] GT Reading Test [test] Study mode and parity`

**Description sections**

- Summary
- Included
- Validation
- Known environment limitations

Report:

- exact target/shared test result;
- JavaScript syntax and diff integrity;
- Q1–40 data and clue coverage;
- Fresh/checked Study result;
- Fresh/completed Test result;
- opened Score guide, Answer Key and score-feedback dialog result;
- desktop/mobile/theme review;
- exact changed-file list;
- confirmation that unrelated tests and the Live Hub were not modified unless explicitly authorised.

---

## 15. Anti-patterns to avoid

| Avoid | Use instead |
|---|---|
| Treating GT as Academic with different passages | Audit GT terminology, scoring, ranges and multi-text structure |
| Starting Q1–40 content before the page contract | One read-only delta audit |
| Copying 14/13/13 blindly | Verify target section ranges |
| Reusing Academic band thresholds | Target GT evaluator and approved GT guide |
| One root for a section with several texts | Stable root per notice/review/advertisement/text |
| Showing an Evidence row and a passage highlight | Keep internal evidence; show clue button only |
| Highlighting only the answer word or an undersized fragment | Highlight the shortest complete evidence unit, including the decisive qualifier or relationship |
| Why that merely repeats the answer | Bridge question wording to source wording and explain the conclusion |
| Generic Skill such as `scan for keywords` | Name the reusable operation and the exact feature to compare next time |
| Activating clues with partial data | Complete Q1–40 target audit first |
| Missing `partLabel: "Section"` | Explicit terminology config |
| Silent DOM score parsing | Authoritative snapshot or explicit approved compatibility |
| Locking only native inputs | Lock drag/drop and custom controls too |
| Broad header `white-space: nowrap` or flex rules applied to all descendants | Scope rules to direct top-bar controls and reset shared-dialog inheritance |
| Declaring a modal passed because its trigger is visible | Open it and inspect the complete visible layout in the browser |
| Assuming `position: fixed` escapes ancestor CSS | Audit mount ancestry, inheritance and containing-block properties |
| Global text replacement for core terminology | Config-driven user-facing labels |
| Copying the Test 1 adapter into every page | Prefer the direct Test 2 pattern for new targets |
| Large test-of-tests mutation frameworks | Five lean production-linked modules plus shared regressions |
| Treating browser-environment limitations as product defects | Evidence hierarchy and documented exception |
| Committing before browser approval | Unstaged work until all states pass |
| Editing the Live Hub during a target-page task | Separate hub activation unless explicitly in scope |

---

## 16. Cambridge 19 reference-set lessons and IELTS 18 launch gate

Cambridge IELTS 19 GT Reading Tests 1–4 are now the behavioural reference set. Use them together, not as four independent templates:

- **Test 2** — preferred direct-integration reference;
- **Test 1** — legacy-adapter compatibility reference;
- **Tests 3 and 4** — regression references for submitted-review lifecycle, dialogs, scoring, layout and logo behaviour;
- **Tests 1–4 together** — expected Study/Test/locked-review parity.

The following gates are mandatory before a new GT Reading test is considered aligned.

### 16.1 Mode lifecycle — verify visible state, not just DOM state

The required lifecycle is:

1. **Study Mode:** task-specific strategy/ⓘ controls are visible.
2. **Active Test Mode:** zero strategy/ⓘ controls are visibly available, even if their DOM remains attached.
3. **Submitted Test review:** strategy/ⓘ controls, Answer Key, score guide, feedback and clues return, while every submitted answer remains locked.

A `hidden` attribute alone is not proof when CSS can force `display`. Browser QA must check computed/visible state in all three phases.

### 16.2 Low-score contract — `Below 3` must round-trip

Under the current project decision:

- 0–8 correct = **`Below 3`**;
- 9–11 correct = **Band 3**.

`Below 3` is a valid first-class band label, not an error or missing numeric value. It must agree across the target evaluator, result overlay, submitted-result snapshot/parser, Score guide and submitted Score feedback. A blank Test submission is the fastest regression case: it must still initialise completed-Test feedback and show `Submitted band: Below 3.`

### 16.3 Matching and drag/drop — presence is not functionality

Where a target uses matching or drag/drop, browser QA must exercise the supported interaction paths before submission:

- real drag/drop;
- click-to-place;
- keyboard placement;
- repeated-letter reuse when the instructions allow it;
- Clear/reset.

Then submit the Test and verify source items, answer zones, native backing controls and Clear/reset remain locked. This catches initialisation-order failures where answer boxes exist but interaction wiring never attached.

### 16.4 Self-contained clues and explanations

For every Q1–40 item, judge the feedback as if the surrounding passage were hidden. **Question + clue(s) + Why must be enough to understand why the answer is correct.** Skill then tells the learner what reading action to reuse next time.

Use one complete clue sentence by default. Use two short connected sentences only when the logic genuinely crosses the boundary. Shorter fragments are acceptable only when self-contained. Keep clues concise, but never so short that the learner has to reconstruct the missing subject, condition, comparison, negation, cause, time boundary or reference.

For NOT GIVEN, show the closest relevant information the passage actually states and explain the exact detail that is absent. For matching headings, use evidence that represents the paragraph’s main idea rather than one memorable detail. Explain a likely distractor when doing so resolves a realistic misunderstanding.

### 16.5 Layout hygiene

Hidden feedback hosts and unrevealed wrappers must be layout-neutral. They must not contribute unexplained padding, margins or empty vertical space before feedback exists. Browser QA must verify the block expands when feedback is revealed and contracts again when it is hidden.

### 16.6 Header and logo parity

Verify the IELTS Pabs logo as one feature, not separate pieces:

- correct route to the top-level Live Hub;
- active-Test leave warning;
- mouse, Enter and Space activation;
- established per-letter hover animation;
- reduced-motion behaviour;
- no header CSS leakage into Score guide, Answer Key or score-feedback dialogs.

### 16.7 Permanent regression and release safety

When a new failure class is discovered, add the smallest production-linked permanent regression that would have caught it. Before merge:

- run the focused target/shared Reading matrix;
- run the full browser lifecycle matrix;
- run the Live Hub Safety Guard;
- refresh protected reference fingerprints only after the relevant Reading validation passes and only for deliberately changed reference files;
- keep unrelated Hub contract repairs, activations and seasonal changes in separate PRs.

### 16.8 Next target — Cambridge IELTS 18 GT Reading Test 1

The next target is **Cambridge IELTS 18 General Training Reading Test 1**. Its HTML, source files, answer key, accepted variants and evaluator remain authoritative for test-specific content. Do not copy Cambridge 19 passages, task ranges, control shapes or accepted variants.

The initial read-only audit must explicitly verify:

- exact Section ranges, task groups and source-text roots;
- exact instructions, word limits, answers and accepted variants;
- current GT scoring, including the `Below 3` contract;
- Study → active Test → submitted Test information-control lifecycle;
- blank/low-score submitted feedback;
- real matching/drag-drop interaction where present;
- final locking of native and custom controls;
- all 40 self-contained clue/Why/Skill trios;
- zero dead spacing from hidden feedback hosts;
- Score guide, Answer Key and score-feedback dialogs;
- home route, leave warning, keyboard access and logo animation;
- desktop, narrow, theme and text-size parity;
- current Live Hub route and safety-guard constraints.

If an item already works, preserve it. Do not redesign working behaviour merely to make the implementation resemble a Cambridge 19 file.

---

## 17. One-page runbook

### Before coding

- update main;
- create an isolated branch/worktree;
- read workflow and checklist;
- confirm target HTML, source files and hub route;
- verify 40 questions, section ranges, evaluator and GT band;
- identify every source text and stable root;
- classify direct vs legacy-adapter integration;
- record special answer controls;
- record shell mount ancestry and potentially inherited header/toolbar styles;
- produce one read-only delta.

### During foundation

- load shared CSS/core;
- configure `partLabel: "Section"`;
- configure result snapshot or approved compatibility;
- prepare mount, instruction hosts and text roots;
- protect Test lifecycle and custom locking;
- scope header/toolbar styles narrowly and protect nested dialogs;
- open Score guide and Answer Key before leaving the phase;
- keep Q1–40 content out of this phase.

### During student-data work

- define exact task groups;
- write Correct answer, Why and Skill for Q1–40;
- map exact internal evidence targets to the correct text roots;
- apply the Aha test to every clue/Why/Skill trio;
- ensure each clue is the shortest complete evidence span, not simply the shortest possible span;
- set `showEvidenceText: false`;
- activate complete coverage only after validation.

### Before commit

- run target modules and shared Reading suite;
- run browser states and representative clues in all sections;
- confirm 40 cards, 40 Why, 40 Skill, zero visible Evidence, 40 clues;
- open and inspect Score guide, Answer Key and score feedback;
- repeat the dialog smoke matrix after any header, toolbar, mount or responsive CSS change;
- confirm Test locking including custom controls;
- check desktop/mobile/themes/text size/home route/console;
- run syntax checks and `git diff --check`;
- verify exact changed paths;
- record visual approval.

### Release

- stage exact files;
- one commit;
- push;
- PR to `main`;
- verify checks and mergeability;
- squash merge;
- verify `origin/main` and Live Hub route;
- clean branch/worktree.

---

## 18. Required Codex prompt preamble

```text
Before auditing or editing this General Training Reading test, read and follow:

general-training/shared/IELTS_GT_READING_FAST_TRACK_WORKFLOW.md
general-training/shared/GT_READING_TEST_PARITY_CHECKLIST.md

Treat them as the required workflow and parity specification.

Use Cambridge IELTS 19 General Training Reading Tests 1–4 on current main as the behavioural reference set: Test 2 is the preferred direct-integration reference, Test 1 is the legacy-adapter reference, and Tests 3–4 are regression references for submitted-review lifecycle, dialogs, scoring, layout and logo parity. The target test HTML, source files, answer key, accepted variants and evaluator remain authoritative for target-specific content.

For every question, make the clue, Why and Skill pass the self-contained Aha test: a learner should understand why the answer is correct using only the question, displayed/highlighted clue(s) and Why explanation. Prefer one complete clue sentence, or two short connected sentences when the logic requires both. Explicitly bridge question wording to source wording and conclusion, and give a reusable next-step reading action. Technically correct but vague, undersized or under-explained feedback does not pass.

Record the Reading-shell mount ancestry. After any header, toolbar, mount or responsive CSS change, open and inspect the Score guide, Answer Key and score-feedback dialogs at desktop and narrow widths; button presence alone is not a pass.

Model: 5.6 Sol
Effort: Medium
Speed: Standard
Goal: off

Do not edit outside the explicitly allowed paths. Do not change the shared Reading core unless a focused failing test proves a generic blocker. Stop after the requested phase.
```

For branch, status, commit and tiny documentation mechanics:

```text
Model: 5.6 Sol
Effort: Light
Speed: Standard
Goal: off
```

---

## 19. Required exception format

```text
Checklist item:
Reason:
Evidence:
Risk:
Approved deviation:
Follow-up:
```

No silent exceptions.