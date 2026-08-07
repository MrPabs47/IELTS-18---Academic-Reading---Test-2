# IELTS Writing Fast-Track Production Workflow

**IELTS Website Practice Creation — canonical Writing production guide**  
**Reference experience:** completed Cambridge 18 Academic Writing tests and Cambridge 19 Academic Writing Tests 1–2  
**Updated:** 7 August 2026

> **Operating rule**
>
> Before auditing, building, previewing or publishing an Academic Writing test, read this guide and `WRITING_TEST_PARITY_CHECKLIST.md`. The supplied screenshots/original target files and the user-approved Task 1 visual are authoritative for test-specific content.

## Executive summary

The Writing shell is stable. The main production risk is now **Task 1 visual integrity and rendered browser QA**.

Cambridge 19 Tests 1–2 exposed avoidable failure modes:

- binary image files existed in GitHub but rendered partially or not at all;
- an old generic `#taskImage` CSS rule from another Writing task overrode the harbour map;
- a map enhancement drifted into reconstruction and changed labels;
- graph legend spacing needed visual checking after enhancement;
- normal and enlarged/focus views needed separate sizing checks;
- publishing the canonical page and activating the Live Hub were initially treated as separate actions;
- hub availability also needs `hub/live-hub-contract.json` kept in sync.

**Core lesson:** a repository path or successful commit is not proof of a working Writing test. The rendered browser preview is the release truth.

Normal workflow for the remaining tests:

1. exact-content audit;
2. faithful Task 1 enhancement and asset proof;
3. one implementation pass;
4. one deliberate browser visual-QA pass;
5. one complete publication to `main` + Live Hub + hub contract.

## 1. Sources of truth

1. **Target screenshots/original files** — exact Task 1/2 wording and Task 1 information.
2. **User-approved enhanced Task 1 image** — final website visual.
3. **Completed Writing tests on current `main`** — Study/Test shell, report flow, navigation and layout reference.
4. **This workflow + Writing parity checklist** — production and release gates.
5. **`index.html` + `hub/live-hub-contract.json`** — routing/availability only.

### Golden rules

- Never infer test wording from memory.
- Never reconstruct when the requirement is enhancement.
- Task 1 visuals are assessment data: labels, values, markers, lines, arrows, features and relationships must not change.
- Browser rendering outranks source/path assumptions.
- When the user says **publish**, publish completely: merge to `main`, verify the canonical route, activate the Live Hub key, update the Live Hub contract, and verify the hub button opens the approved test.

## 2. Task 1 visual contract

### 2.1 Enhancement means preservation

Enhancement may improve resolution, contrast, line clarity, text readability and scan cleanliness. It may remove an obvious cursor/ghost artifact that is not part of the source.

It must not:

- change graph values, line positions, scales, markers or legend entries;
- change map labels, roads, beaches, buildings, docks or relative positions;
- change process stages, arrows, sequence or relationships;
- invent missing detail;
- reinterpret ambiguous content.

If information changes, reject the enhanced asset and return to the source.

### 2.2 Source inventory before enhancement

**Graph/chart:** title; axes; ticks/scale; years/categories; series; markers; line styles; legend order; plotted values/trends.

**Map/plan:** titles/time states; compass; every label; roads/paths; buildings/areas; coastline; arrows; relative positions.

**Process/diagram:** all stages; labels; arrows; sequence; branches/loops; inputs/outputs.

Compare the final enhanced image side by side with this inventory.

### 2.3 Clarity target

Aim for effective **4K-like clarity on large/high-DPI screens**, not an unnecessarily huge file.

The visual must be crisp in normal split view and when enlarged, while remaining reasonably lightweight. For line-heavy monochrome charts/maps, a clean optimised PNG is the reliability default unless another format is proven in the actual browser delivery path.

### 2.4 Binary asset proof

For every Task 1 binary:

1. open the local file fully;
2. use a binary-safe upload method;
3. verify the intended repository filename/object;
4. open a commit-specific browser preview;
5. visually inspect the image from top to bottom;
6. fail the gate for blank, partial, truncated or corrupted rendering;
7. if one large binary remains unreliable, use smaller verified lossless chunks assembled seamlessly rather than repeatedly retrying an unverified upload.

Never call an asset successful because a path or SHA exists.

## 3. CSS isolation contract

A legacy shared Writing rule previously targeted `#taskImage` and interfered with an unrelated harbour map.

Before each new test:

- search inherited CSS for `#taskImage`, `.task-visual`, `.visual-frame` and old asset-specific sizing;
- keep generic image rules minimal;
- use a task-specific class for special visuals when needed;
- do not add a new broad selector to fix one test;
- inspect computed styles whenever the visual is blank, cropped, tiny or oversized.

## 4. Layout contract

### Normal view

- complete Task 1 visual remains available in the task pane;
- aspect ratio is preserved;
- no forced crop or horizontal overflow;
- labels remain readable;
- vertical scrolling is preferable to excessive shrinking.

### Enlarged/focus view

- complete visual remains visible;
- use available pane space;
- preserve aspect ratio;
- contain rather than crop;
- no stretch distortion;
- no inherited rule should suddenly change sizing.

### Required visual checks

At minimum inspect:

- ordinary desktop split view;
- enlarged/focus view;
- wide 16:9 display;
- narrower laptop viewport;
- responsive/mobile state where supported.

## 5. Visual-type QA

### Graphs/charts

Verify title, axes, ticks, all data points/bars, marker shapes, line styles and legend order. **All legend text must remain inside the legend box with comfortable padding.** No edge labels may be clipped.

### Maps/plans

Verify every label exactly, especially public/private wording, compass/orientation, roads, beaches, buildings and other features. Nothing may be moved, added or removed. The Porth Harbour lesson is explicit: wording such as **Public beach** and **Private beach** is task data, not editable design copy.

### Processes/diagrams

Verify every stage and arrow, exact sequence, loops/branches and labels. Enhancement must not reinterpret the process.

## 6. Fast-track workflow

### Phase 0 — baseline

- start from current `main`;
- one feature/preview branch per test;
- confirm canonical target path;
- confirm source screenshots are complete.

Stop if branch/main is stale or source material is incomplete.

### Phase 1 — exact audit

Before editing:

- transcribe Task 1 exactly;
- transcribe Task 2 exactly;
- identify Task 2 essay type;
- inventory Task 1 visual information;
- inspect inherited image CSS;
- choose a task-specific asset name/class.

No speculative redesign.

### Phase 2 — enhancement and asset proof

- enhance the direct source only;
- compare source vs enhanced side by side;
- optimise size without changing information;
- verify local decode;
- upload safely;
- verify full browser decode before integrating further.

Stop for any information drift or partial/blank rendering.

### Phase 3 — one implementation pass

Use the established Writing shell for:

- correct title/identity;
- exact Task 1 prompt and approved visual;
- exact Task 2 prompt;
- Task 1/2 Study guidance;
- Study/Test modes;
- candidate/timer flow;
- word counters;
- submission/report behaviour;
- home/logo/navigation parity.

Do not reopen shared architecture unless a reproducible defect affects multiple Writing tests.

### Phase 4 — browser visual QA

One controlled session must cover:

1. mode chooser;
2. Fresh Study Task 1 and Task 2;
3. Fresh Test Task 1 and Task 2;
4. candidate name placement;
5. timer/footer controls;
6. Task 1 normal view;
7. Task 1 enlarged/focus view;
8. full image top-to-bottom decode;
9. graph/map/process fidelity;
10. no inherited-image CSS conflict;
11. word counters;
12. submission/report identity and actions;
13. wide/narrow viewport behaviour;
14. no unexpected console errors.

**Do not call the preview ready until the rendered browser passes.**

### Phase 5 — publish

After explicit approval:

1. freeze the approved preview revision;
2. compare branch with current `main` and resolve divergence if needed;
3. ensure the canonical Academic Writing entry page is included;
4. open PR and verify changed files;
5. squash merge;
6. activate `[book]-[test]` in Academic Writing availability in `index.html`;
7. update `hub/live-hub-contract.json` in the same release flow;
8. verify the canonical page on `main`;
9. open the Live Hub and confirm the Writing button is active;
10. launch it and verify production matches the approved preview.

## 7. Evidence hierarchy

Use this order:

1. **Rendered browser result** — visual authority.
2. **Commit-specific preview** — exact revision proof.
3. **Repository path/blob check** — presence only.
4. **Source/CSS inspection** — diagnosis/support.

A lower layer cannot override a failure at a higher layer.

## 8. Lean regression strategy

Writing needs focused checks, not the heavy Reading/Listening model.

Per test, protect:

- exact Task 1 prompt;
- exact Task 2 prompt;
- correct title/test ID;
- correct Task 1 image reference;
- no legacy asset from another test;
- no conflicting broad `#taskImage` override;
- Task 1 visibility in Study/Test;
- normal/enlarged container behaviour;
- report identity for the correct test;
- canonical route;
- after publication, Live Hub key and contract alignment.

Manual/browser visual QA remains mandatory for Task 1.

## 9. Anti-patterns

| Avoid | Use instead |
|---|---|
| Rebuilding a Task 1 visual from interpretation | Enhance the direct source and audit fidelity |
| Huge unoptimised “4K” files | High effective clarity + optimised reliable asset |
| Checking only that an image path exists | Inspect the complete browser render |
| One global `#taskImage` rule for unrelated visual types | Minimal generic CSS + task-specific class |
| Repeated format changes without diagnosis | Inspect CSS/decode first, then change one layer |
| Checking graph trends only | Check every point, marker, axis and legend boundary |
| Checking map shape only | Check every label and feature |
| Normal-view-only QA | Normal + enlarged/focus + wide/narrow |
| Canonical page published but hub unavailable | Publish route + hub + contract together |
| Hub updated but contract stale | Synchronise `live-hub-contract.json` |
| Declaring ready after code/path validation | Require rendered visual QA |
| Patching after approval without a regression | Freeze and release the approved revision |

## 10. One-page runbook

### Before building

- Pull current `main`.
- Create one Writing preview branch.
- Collect Task 1/2 source screenshots.
- Transcribe prompts exactly.
- Inventory Task 1 visual data.
- Inspect inherited image CSS.

### Build

- Enhance direct Task 1 source only.
- Audit enhancement against source.
- Optimise and verify local asset.
- Upload safely and prove browser decode.
- Implement one test-specific override using isolated visual classes when needed.

### Review

- Open commit-specific preview.
- Inspect full Task 1 image.
- Test normal and enlarged/focus views.
- Audit graph/map/process fidelity.
- Check Task 2, Study/Test, candidate/timer, counters and report flow.
- Check wide/narrow screen behaviour and console.

### Publish

- Freeze approved commit.
- Merge to `main`.
- Verify canonical route.
- Activate Live Hub key.
- Update Live Hub contract.
- Launch from Live Hub and confirm production matches preview.

## Final recommendation

Treat the Writing shell as stable and treat **Task 1 visual integrity + rendered browser QA** as the main risk.

For the remaining Cambridge 19 Academic Writing tests, the fast path is:

**source audit → faithful enhancement → verified asset → one implementation → normal/enlarged browser QA → one complete Live Hub publication.**
