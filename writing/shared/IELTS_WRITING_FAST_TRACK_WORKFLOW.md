# IELTS Writing Fast-Track Production Workflow

**IELTS Website Practice Creation — canonical Writing production guide**  
**Reference implementation:** Cambridge IELTS 16 Academic Writing Test 2  
**Reference release:** PR #399, merged into `main` on 2 August 2026  
**Prepared:** 2 August 2026

> **Operating rule**
>
> Before auditing or editing a Writing test, read and follow:
>
> - `writing/shared/IELTS_WRITING_FAST_TRACK_WORKFLOW.md`
> - `writing/shared/WRITING_TEST_PARITY_CHECKLIST.md`
>
> Treat them as the required workflow and parity specification. The target task scans, source text and image assets remain authoritative for test-specific content.

---

## Executive summary

Cambridge IELTS 16 Academic Writing Test 2 established the first complete Writing reference implementation for the project. It now provides a consistent IELTS Pabs experience with:

- the same Test/Study mode chooser used by the other skills;
- candidate-name flow and a 60-minute timed Test Mode;
- automatic full-screen request and the established pause/return behaviour;
- a two-pane task-and-answer layout with a stable draggable divider;
- exact Task 1 and Task 2 wording;
- an improved high-resolution Task 1 diagram;
- in-pane image enlargement that leaves the answer pane available;
- live word counts without warnings or minimum-count badges;
- contrast and text-size options;
- the shared IELTS Pabs logo and hover animation;
- leave/reload protection during an active attempt;
- no saved-progress restoration;
- an editable post-submission report with copy, Gmail, Outlook/Hotmail and default-email options;
- a canonical Academic Writing route activated in the Live Hub.

The final quality is strong. The main opportunity is to make future Writing tests much faster by treating this test as a **reference contract**, not as a new design starting point.

The central lesson is:

**Future Writing tests should begin with one source-and-parity audit, then copy the proven Writing contract and replace only the test-specific identity, task wording and visual assets unless a focused check proves a genuine generic blocker.**

For a normal Academic Writing test, the expected path is:

1. clean branch and baseline;
2. one read-only source/parity audit;
3. one target-content and asset pass;
4. one interaction and browser QA pass;
5. one release and hub-activation pass.

A new shared Writing architecture should not be extracted merely because the second test contains duplicate code. Extraction becomes reasonable only after at least two completed Writing pages prove that the duplicated behaviour is stable and genuinely generic.

---

## 1. What IELTS 16 Academic Writing Test 2 established

### 1.1 Mode chooser and fresh-start contract

A fresh page load shows the mode chooser.

The chooser uses the same visible order as the established tests:

1. **Test mode (exam conditions)** on the left;
2. **Study mode (show feedback)** on the right.

Test Mode then asks for the candidate’s full name before starting.

The page does not restore an earlier Writing attempt from `localStorage` or `sessionStorage`. A reload or a new visit returns to the chooser and clears the live attempt.

### 1.2 Test Mode lifecycle

The reference provides:

- a 60-minute timer;
- candidate name in the header;
- automatic full-screen request where supported;
- pause/lock behaviour after leaving enforced full screen;
- return-to-full-screen control;
- leave/reload warning during an active unsent attempt;
- one submit confirmation path;
- timer stop on submission;
- editable answers after submission;
- a new report generated from the current answers when the student submits again.

No Test Mode pill is displayed. The established tests use a Study Mode pill only.

### 1.3 Study Mode lifecycle

Study Mode provides the same Writing interface without the Test timer or candidate-name requirement.

The current reference includes a Study tools surface and self-review content, but it does not yet provide AI marking. Future AI feedback must remain a separate product phase and must not be silently introduced while producing the next test.

### 1.4 Writing layout

Desktop uses:

- a fixed top header;
- a fixed bottom task navigator;
- a left task pane;
- a right answer pane;
- a draggable circular divider;
- independently scrollable panes;
- Task 1 and Task 2 switching;
- a plain live word count.

The divider must work on the first drag. Pointer tracking continues across the window while dragging, text selection is suppressed, and the split remains within a safe range.

On narrow screens the panes stack and the divider is hidden.

### 1.5 Task presentation

The left pane contains all task instructions.

The right pane contains only:

- `Your answer`;
- the answer editor;
- the plain word count.

Task wording is bold where the original test makes it prominent, but it is not italicised unless the source test itself uses italics.

Task 1 images are fully visible by default. Clicking or pressing Enter/Space on the image enlarges it **inside the left pane only**, so the right answer pane remains visible.

### 1.6 Image fidelity

The Task 1 diagram was improved without changing the process information.

The production rule is:

- preserve every label, number, arrow, sequence and relationship;
- prefer direct PDF extraction, vector artwork or a high-resolution source;
- use conservative denoising, contrast correction, sharpening and non-generative super-resolution;
- never rely on an unverified generative redraw for an assessed diagram;
- compare the improved image against the source before publishing.

### 1.7 Typography and shared chrome

The Writing interface uses the established test typography and the same visible chrome as Academic Reading:

- Arial/Helvetica test text;
- matching header spacing and icons;
- IELTS Pabs logo;
- per-character logo reveal animation;
- hover replay;
- reduced-motion support;
- connection and notification icons;
- labelled full-screen control;
- options menu;
- Study Mode pill only in Study Mode.

### 1.8 Submission report

Submission produces a **Test submitted** state and opens a report containing:

- test identity;
- mode;
- submission date/time;
- candidate name;
- optional student email;
- timer status where applicable;
- Task 1 word count and answer;
- Task 2 word count and answer.

The report can be:

- copied;
- opened in Gmail;
- opened in Outlook/Hotmail;
- opened in the default email application.

The current destination is `pablo.jaramillo@ilsc.com.au`.

The page does not yet send data to a central database or Google Sheet. The student must copy or email the report before closing or reloading.

### 1.9 Live Hub route

The Live Hub activates only the completed test:

- availability key: `16-2`;
- type: `academicWriting`;
- canonical route:
  `./academic/cambridge-16/test-2/IELTS16%20Test%202%20-%20Academic%20Writing.html`.

The canonical route opens the production Writing page and begins from the chooser.

---

## 2. What caused delay and the new rule for each

| Area | What caused delay | Rule for future tests |
|---|---|---|
| UI design | Early versions invented Writing-specific cards and labels instead of reusing the existing test language | Start from the visible Academic Reading reference and the completed Writing page |
| Mode chooser | Saved/session state skipped the chooser on later visits | No attempt persistence; fresh load always returns to chooser |
| Typography | Task prompts inherited italic styling that did not match the source test | Audit source formatting and explicitly set normal/bold/italic states |
| Divider | Competing or element-only drag handlers made the first drag unreliable | Use one pointer-based window-tracked divider implementation |
| Text-size menu | Fixed Writing font sizes overrode the option classes | Route Writing sizes through shared CSS variables and test all three sizes |
| Logo animation | Initial implementation animated only on page entry | Copy the complete reference hover/reset logic, not only the CSS |
| Submission | Locking answers conflicted with the intended resend/update workflow | Stop the timer but keep answers editable; generate an updated report on resubmission |
| Saving progress | Autosave caused unexpected restoration and hid the mode chooser | Do not persist Writing attempts until a future product decision explicitly changes the contract |
| Image quality | Enlarging a low-resolution image does not create new detail | Use high-quality source extraction or conservative verified enhancement |
| Cache behaviour | Branch-based RawGitHack links served old scripts after changes | During QA use commit-specific links or a fresh deployment, not query strings alone |
| Release | Preview content and hub activation were separate steps | Merge the completed page first, then add the canonical route and activate only the exact hub key |
| Shared code | The first page accumulated refinement scripts during discovery | Consolidate carefully for the next test, but do not extract a shared platform before the contract is proven twice |

---

## 3. Fixed sources of truth

Conflicts must be resolved in this order.

| Priority | Source | Used for |
|---|---|---|
| 1 | Target Cambridge task scans, PDF pages or exact transcriptions | Exact Task 1/Task 2 wording, instructions, minimum word statements, punctuation and visual information |
| 2 | Target Task 1 image or chart source | All labels, values, arrows, categories and visual relationships |
| 3 | `writing/shared/WRITING_TEST_PARITY_CHECKLIST.md` | Required mode, layout, options, submission, accessibility and release behaviour |
| 4 | IELTS 16 Academic Writing Test 2 on current `main` | Visible and behavioural reference contract |
| 5 | Academic Reading reference tests | Shared header, logo, chooser, full-screen, options and leave-warning logic |
| 6 | Current Live Hub `index.html` | Canonical route and exact availability key only |
| 7 | General IELTS knowledge | Background only; never used to rewrite source task content |

### Golden rules

#### Never infer task wording from memory

Preserve the task text exactly. Do not “improve” punctuation, add advice or paraphrase the prompt unless the user explicitly approves a source correction.

#### Never let AI enhancement change assessed information

Every visible label, number, arrow and category must be checked against the source.

#### Never use the preview URL as the production route

The hub must point to the canonical Academic Writing path.

#### Never treat browser cache as proof that code is wrong

Verify the current repository file and use a commit-specific link or deployment before reopening implementation.

---

## 4. Definition of Done by state

| State | Must be visible / active | Must remain hidden / absent |
|---|---|---|
| Initial chooser | Test Mode left, Study Mode right; exact labels; Test candidate step available; blank attempt | Previous answers, timer, candidate header, report, restored attempt |
| Fresh Study | Study Mode pill, Study tools, both tasks, editor, word count, divider, image interaction, options | Test timer, candidate header, Test lock overlay, saved attempt restoration |
| Fresh Test | Candidate name, 60-minute timer, full-screen request/lock where supported, both tasks, editor, word count, submit controls, leave warning | Study Mode pill, Study tools, prior answers, automatic report |
| Submitted Test | Timer stopped, Test submitted message, report window, answers remain editable, updated report possible | Answer lock, timer restart, hidden answers, automatic external storage claim |
| Reload/new visit | Mode chooser and blank answers | Restored attempt, restored submission, restored report |
| Narrow/mobile | Stacked usable panes, no divider, readable task/image/editor, reachable controls | Horizontal overflow, clipped header/footer, unusable image zoom |

### Header order

When visible, keep this order:

**IELTS Pabs → test title → candidate name → Study tools/Study Mode or timer → connection → notifications → Full screen → menu**

Visual and keyboard order should agree.

### Footer order

Use:

**Writing Task 1 → Writing Task 2 → previous → next → submit/self-review**

Do not display minimum word requirements or saved word-count badges inside the task chips.

---

## 5. Reusable Writing contract

Writing is currently a proven **reference-page contract**, not yet a shared JavaScript platform.

### 5.1 Target-owned responsibilities

Each target Writing test owns:

- book and test identity;
- exact Task 1 instructions and prompt;
- exact Task 2 instructions and prompt;
- Task 1 visual asset and alt text;
- any source-approved emphasis;
- canonical route;
- Live Hub availability key;
- teacher/report destination if intentionally different.

### 5.2 Reference-contract responsibilities

The completed Test 2 implementation defines reusable behaviour for:

- chooser and candidate flow;
- fresh-start/no-persistence policy;
- Test timer and full-screen behaviour;
- leave/reload warning;
- Study/Test chrome;
- logo animation;
- task switching;
- two-pane layout;
- stable divider;
- responsive stacking;
- word count;
- contrast and text-size options;
- in-pane Task 1 enlargement;
- submission confirmation;
- editable post-submission answers;
- report generation and email/copy actions;
- production route and hub activation pattern.

### 5.3 Shared-code decision

Do not build a large shared Writing core during the next test merely because the page duplicates Test 2.

A shared extraction is justified only when:

1. the same behaviour exists in at least two completed Writing pages;
2. the duplicated contract is stable;
3. the target-specific fields are clearly separable;
4. extraction reduces maintenance risk;
5. both pages can adopt it without title/version/path branching.

Reject a proposed shared helper if it inspects:

- the IELTS book number;
- the test number;
- the task topic;
- a specific image filename;
- a specific canonical page path.

### 5.4 Suggested target data boundary

A future generic page should eventually receive a small configuration object such as:

```js
{
  book: 16,
  test: 2,
  title: "IELTS 16 Academic Writing Test 2",
  teacherEmail: "pablo.jaramillo@ilsc.com.au",
  task1: {
    instructions: [...],
    prompt: [...],
    minimumWords: 150,
    image: "./task-1-sugar-production-4k.png",
    imageAlt: "..."
  },
  task2: {
    instructions: [...],
    prompt: [...],
    minimumWords: 250
  }
}
```

This is a future architecture target, not a requirement to refactor before producing the next test.

---

## 6. Fast-track workflow for the next Writing test

| Phase | Work | Required output | Stop rule |
|---|---|---|---|
| 0. Branch and baseline | Update `main`, create one feature branch, confirm clean state, locate canonical target route and current hub key | Branch, base SHA, clean status, target page path, source inventory | Do not edit if branch/path/source is uncertain |
| 1. One read-only source/parity audit | Compare the target tasks against Test 2 and the checklist; inventory wording, visual asset, formatting and any genuinely new requirement | One-page delta: reusable contract, target replacements, blockers, exact allowed paths | No code changes; no redesign based on preference alone |
| 2. Target implementation | Copy the completed Writing contract into the canonical target path; replace identity, task text, image and alt text | Functional target page opening from chooser with both exact tasks | Do not alter shared behaviour unless a focused failure proves a generic blocker |
| 3. Browser and content QA | Verify chooser, Study, Test, divider, image, fonts, text sizes, full screen, refresh warning, submission/report, mobile and console | One controlled QA report with screenshots/observations and corrections | Only user-facing defects justify another implementation pass |
| 4. Release and hub activation | Final source check, exact staging, PR, merge, canonical-route check, activate exact hub key | Clean `main`, live card, direct link, one release summary | Do not activate an unmerged or preview-only page |

### Recommended task count

Normal case: **four work tasks plus one release task**.

1. Read-only source/parity audit.
2. Target page and asset implementation.
3. Browser QA and focused correction.
4. Final verification.
5. Merge and hub activation.

---

## 7. Lean testing strategy

### 7.1 Reuse every time

The completed IELTS 16 Academic Writing Test 2 should remain the behavioural reference for:

- mode chooser;
- Test candidate flow;
- full-screen lifecycle;
- refresh protection;
- typography and options;
- divider;
- image focus;
- word count;
- submission report;
- no persistence;
- hub routing.

### 7.2 Recommended target-specific checks

| Module/check | Purpose |
|---|---|
| `writing_[book]_[test]_foundation` | Identity, chooser, exact route, no persistence, correct chrome |
| `writing_[book]_[test]_content` | Exact Task 1/2 text, source emphasis, image asset, alt text |
| `writing_[book]_[test]_interactions` | Task switching, divider, image focus, word count, text sizes, contrast |
| `writing_[book]_[test]_test_mode` | Candidate, timer, full screen, leave warning, submission confirmation |
| `writing_[book]_[test]_report_and_hub` | Editable post-submit state, report fields/actions, canonical route, exact hub key |

These may be automated, structural or manual depending on the current project test framework. Do not build a large mutation suite for unchanged Writing behaviour.

### 7.3 Phase-gate testing

During editing:

- run syntax checks for changed JavaScript;
- run focused target checks;
- run `git diff --check`;
- inspect exact task text against source.

At the browser QA gate:

- run one complete desktop session;
- run one narrow/mobile session;
- use a commit-specific preview or local server;
- check the console.

Before release:

- repeat exact source comparison;
- confirm canonical route;
- confirm only the intended hub key is active.

### 7.4 Evidence hierarchy

1. Live browser behaviour.
2. Production-linked executable check.
3. Structural/source validation.
4. Source-string assertion.

Native full-screen and unload prompts are browser-controlled. An unchanged browser wording difference is not a product defect when the required confirmation behaviour is present.

---

## 8. Task source and image production standard

### 8.1 Task transcription

For each task:

1. identify the exact source page;
2. transcribe all instructions;
3. preserve paragraph order;
4. preserve bold/italic distinctions only where source-supported;
5. preserve punctuation and capitalisation;
6. compare character-by-character or line-by-line;
7. record the source used in the audit.

### 8.2 Task 1 visual audit

Record:

- source filename/page;
- original dimensions;
- target web dimensions;
- all visible labels;
- all numbers/units;
- all arrows/directions;
- all categories/stages;
- whether cropping removes any assessed information.

### 8.3 Image enhancement workflow

Preferred order:

1. extract the original image from the source PDF;
2. use vector extraction where available;
3. otherwise render at 600 dpi or higher;
4. crop tightly without removing information;
5. apply conservative denoise/contrast/sharpening;
6. optionally use non-generative 2×/4× super-resolution;
7. compare against source at 100% and zoomed view;
8. publish only after every label and relationship is verified.

### 8.4 Prohibited image changes

Do not:

- redraw with generative AI and assume fidelity;
- replace labels with paraphrases;
- alter numbers or units;
- add or remove arrows;
- change category order;
- simplify a map/process/chart;
- crop legends, axes or keys;
- claim “4K” when the source contains no additional recoverable detail.

---

## 9. Typography, layout and accessibility contract

### Desktop

- Arial/Helvetica for test content.
- Task text approximately 18 px at Normal size.
- Large and Extra large visibly increase task, editor, word count and footer controls.
- Left and right panes fill the usable area.
- Divider works on the first pointer drag.
- Task 1 image remains readable and contained.
- Editor remains available during image enlargement.
- No horizontal page overflow.
- Fixed header/footer do not cover content.

### Mobile/narrow

At approximately 390 px:

- header remains usable;
- non-essential title text may collapse safely;
- panes stack;
- divider is hidden;
- image is fully visible;
- editor is not clipped;
- task buttons and submit remain reachable;
- report dialog fits the viewport;
- email/report actions wrap.

### Accessibility

- native buttons and textarea;
- labelled editor;
- visible `:focus-visible`;
- keyboard-operable task switching;
- keyboard-operable image enlargement;
- keyboard-operable divider where displayed;
- labelled dialogs;
- readable contrast themes;
- reduced-motion support for logo animation;
- no information conveyed by colour alone.

---

## 10. Submission and reporting contract

### Before submission

- sync the active task answer;
- include both task word counts in confirmation;
- allow the student to keep writing.

### On submission

- stop the timer;
- set the submitted state;
- keep both answers editable;
- show the Test submitted banner;
- open the report;
- do not claim server storage.

### Updated submission

When the student edits after submission and submits again:

- generate the report from the current answers;
- update the date/time;
- update word counts;
- keep previous in-page answers available;
- do not restore or infer an old report after reload.

### Email actions

Provide:

- Copy report;
- Open Gmail;
- Open Outlook/Hotmail;
- Use email app.

Copy is the safest option for long answers because email URL lengths vary.

### Future central storage

A Google Apps Script or Cloudflare-backed endpoint may later send submissions to a central sheet/database. That is a separate feature requiring:

- endpoint authentication/abuse controls;
- privacy notice;
- submission ID;
- delivery success/failure state;
- retry logic;
- teacher review status;
- no silent loss.

Do not add partial central storage while producing a new test unless it is the explicit task.

---

## 11. Prompt and agent operating standard

### Required prompt preamble

```text
Before auditing or editing this Writing test, read and follow:

writing/shared/IELTS_WRITING_FAST_TRACK_WORKFLOW.md
writing/shared/WRITING_TEST_PARITY_CHECKLIST.md

Treat them as the required workflow and parity specification.

Use Cambridge IELTS 16 Academic Writing Test 2 on current main as the
visible and behavioural reference. The target source scans/text and
visual assets remain authoritative for task-specific content.
```

### Prompt structure

Use this sequence:

1. expected state;
2. exact source files;
3. exact allowed paths;
4. forbidden changes;
5. required outputs;
6. targeted tests/checks;
7. browser QA;
8. stop rule;
9. Git status/report.

### Task boundary

End planning and implementation prompts with:

> Stop after this task. Do not continue to the next phase, activate the hub or merge unless explicitly instructed.

### Shared blocker rule

When a generic limitation is found:

- stop;
- describe the exact failing user-facing contract;
- identify the smallest generic boundary;
- propose one focused check;
- do not create a book/test/title-specific shared workaround.

---

## 12. Shared change or target-specific change?

| Question | Yes | No |
|---|---|---|
| Does the behaviour already exist in two completed Writing pages? | Consider a focused shared extraction | Keep it target-specific |
| Is the issue caused by generic mode/layout/report behaviour? | Add one focused generic check before changing the contract | Fix target content or asset |
| Would the helper inspect book, test, title, topic or image filename? | Reject it as a shared hack | Continue if capability-based |
| Can the target be expressed by replacing identity, tasks and image only? | Do not touch reusable behaviour | Prove the missing generic capability |
| Is the problem only stale preview caching? | Verify through commit/local/deployment first | Continue implementation diagnosis |
| Does the proposed image change alter assessed information? | Reject it | Continue after source comparison |

---

## 13. Final browser QA script

### Initial chooser

1. Open a fresh production or commit-specific link.
2. Confirm blank chooser.
3. Confirm Test left and Study right.
4. Confirm no previous answer restoration.

### Fresh Study

5. Enter Study Mode.
6. Confirm Study tools and Study Mode pill.
7. Confirm no timer/candidate name.
8. Switch Task 1/Task 2.
9. Type in both tasks and verify separate answers.
10. Test Normal/Large/Extra large.
11. Test all contrast options.
12. Drag the divider immediately on first attempt.
13. Click and keyboard-open the Task 1 image.
14. Confirm right editor remains visible.
15. Confirm logo hover animation replays.

### Fresh Test

16. Reload and confirm chooser.
17. Select Test Mode.
18. Confirm name is required.
19. Start and verify candidate header and 60:00 timer.
20. Verify full-screen request/lock where supported.
21. Verify Task 1/2 answers and word counts.
22. Attempt reload/leave and confirm warning.
23. Cancel submission and continue writing.

### Submitted Test

24. Submit.
25. Confirm timer stops.
26. Confirm Test submitted message.
27. Confirm answers remain editable.
28. Confirm report includes both answers and counts.
29. Test Copy report.
30. Test Gmail, Outlook/Hotmail and default email links.
31. Edit an answer and prepare an updated report.
32. Reload and confirm a fresh chooser, not restored progress.

### Responsive and release

33. Test approximately 390 px width.
34. Confirm no horizontal overflow or clipped controls.
35. Confirm report dialog/action wrapping.
36. Check console for unexpected errors.
37. Open canonical route.
38. Open from the Live Hub card.
39. Confirm only the intended Writing card is active.

---

## 14. Git and release workflow

1. Update local `main`.
2. Create one feature branch for one Writing test.
3. Keep changes isolated to target Writing files and explicitly approved shared files.
4. Use a local server or commit-specific preview for QA.
5. Run syntax, source-integrity and focused behaviour checks.
6. Run `git diff --check`.
7. Complete visual approval before release.
8. Create one descriptive commit or one clean PR series.
9. Open PR with:
   - Summary;
   - Included;
   - Source verification;
   - Browser QA;
   - Known browser/environment limitations.
10. Merge.
11. Add/verify the canonical route.
12. Activate the exact Live Hub key.
13. Open the live hub and direct route.
14. Update local `main`.
15. Delete the feature branch when clean.

### Release PR template

**Title**

`Add IELTS [book] Academic Writing Test [test]`

**Description**

```text
## Summary
Publishes IELTS [book] Academic Writing Test [test] using the established
Writing reference contract.

## Included
- exact Task 1 and Task 2 content
- verified Task 1 visual asset
- Test and Study modes
- Writing layout, word count and options
- submission report
- canonical route and hub activation

## Validation
- exact source-text comparison
- image-information comparison
- chooser/Study/Test/submission browser QA
- Normal/Large/Extra large and contrast checks
- desktop and narrow-width checks
- syntax and git diff checks

## Known environment limitations
Document unchanged native browser full-screen or unload-dialog behaviour only.
```

---

## 15. Anti-patterns to avoid

| Avoid | Use instead |
|---|---|
| Designing a new Writing UI for every test | Copy the completed Writing reference contract |
| Starting implementation before exact task transcription | One read-only source/parity audit |
| Saving answers by default | Fresh-start/no-persistence contract |
| Hiding the chooser through session restoration | Chooser on every reload/new visit |
| Fixed font rules that override the menu | Shared CSS variables tested at all sizes |
| Element-only divider movement | One window-tracked pointer implementation |
| Start-only logo animation | Complete hover/reset reference logic |
| Italicising question text because a base style does | Explicit source-supported typography |
| Enlarging a low-resolution scan and calling it improved | Source extraction or verified conservative enhancement |
| Generative diagram redraw without comparison | Pixel/label/relationship verification |
| Locking answers after submission | Editable answers and updated reports |
| Claiming answers are saved centrally | Clear copy/email-only messaging |
| Debugging stale cache as if it were current code | Commit-specific/local/deployed verification |
| Activating the hub before merge | Merge, canonical route, then exact key activation |
| Extracting a shared Writing platform after one page | Wait for two stable completed pages |
| Reopening AI feedback during routine test production | Keep AI marking as a separate explicit phase |

---

## 16. Next-test launch plan

### Start here

Choose the next Academic Writing test, update `main`, create one feature branch and run a single read-only audit against:

- this workflow;
- the Writing parity checklist;
- IELTS 16 Academic Writing Test 2;
- the target source pages and image.

The audit should output:

- exact target route;
- exact source files/pages;
- Task 1 transcription;
- Task 2 transcription;
- Task 1 visual inventory;
- formatting differences;
- whether the reference contract can be copied unchanged;
- exact files allowed for implementation;
- any genuine blocker.

### Expected normal outcome

- no shared architecture change;
- one copied Writing contract;
- target identity/text/image replacement;
- one controlled browser QA session;
- one PR;
- one exact hub-key activation.

### Success measures

| Measure | Target |
|---|---|
| Implementation cycles | One audit, one implementation pass, one QA/correction pass |
| Shared-contract changes | Zero in the normal case |
| Late source defects | Zero |
| Browser review | One complete desktop session plus one narrow-width check |
| Release | One PR and one hub activation |
| Task fidelity | Exact wording and verified visual information |
| Persistence defects | Zero; fresh load always chooser |
| Student usability | Divider, image, editor, options and report all work on first use |

---

## 17. One-page runbook

| Before coding | During implementation | Before release |
|---|---|---|
| Pull current main | Copy the completed Writing contract | Compare all task text to source |
| Create one branch | Replace identity only where required | Verify every Task 1 label/value/arrow |
| Read workflow/checklist | Replace Task 1/2 source content | Run chooser/Study/Test/submission QA |
| Confirm canonical target path | Add verified image and alt text | Test all text sizes and themes |
| Inventory source scans/PDF | Preserve no-persistence behaviour | Test divider first drag and image focus |
| Record exact formatting | Preserve report workflow | Check desktop and narrow width |
| Produce one-page delta | Run focused checks and syntax | Check canonical route and hub key |
| Freeze shared contract unless blocked | Use commit/local preview | Merge, activate, open live links |

### Final recommendation

Treat IELTS 16 Academic Writing Test 2 as the Writing product contract. The next tests should be source-driven content-and-asset work, not fresh interface design. Reuse the proven chooser, chrome, layout, divider, options, lifecycle and submission report. Improve the architecture only after a second completed Writing page confirms a stable generic boundary.
