# Writing Test Parity Checklist

**Use with:** `academic/shared/IELTS_WRITING_FAST_TRACK_WORKFLOW.md`

The target screenshots/original target files and the user-approved Task 1 visual remain authoritative for test-specific content.

## A. Baseline and content

- [ ] Branch starts from current `main`.
- [ ] Exact canonical target path is confirmed.
- [ ] Task 1 prompt is transcribed exactly.
- [ ] Task 2 prompt is transcribed exactly.
- [ ] Task 2 essay type is identified correctly.
- [ ] Word minimums are exact.
- [ ] No wording is inferred from memory.

## B. Task 1 visual source fidelity

- [ ] Enhancement uses the direct source image, not a reconstruction.
- [ ] Graph/chart: title, axes, ticks, scale, values, markers, line styles and legend are inventoried.
- [ ] Map/plan: every label, orientation, road/path/beach/building/feature and relative position is inventoried.
- [ ] Process/diagram: every stage, arrow, sequence, branch and label is inventoried.
- [ ] Enhanced image is compared side by side with the source.
- [ ] No data, labels, features, stages or relationships changed.
- [ ] No invented information appears.
- [ ] Accidental cursor/ghost artifacts are removed only when clearly not part of the source.

## C. Image quality and upload

- [ ] Image is crisp at ordinary desktop width.
- [ ] Image is crisp when the task pane is enlarged.
- [ ] File size is reasonable for web delivery.
- [ ] Local file opens fully before upload.
- [ ] Upload method is binary-safe.
- [ ] Commit-specific browser preview shows the complete asset from top to bottom.
- [ ] No partial decode, blank image, broken icon or truncated lower section.
- [ ] Success is not declared from path/SHA existence alone.

## D. CSS isolation

- [ ] Inherited CSS is searched for `#taskImage`, `.task-visual`, `.visual-frame` and old asset-specific rules.
- [ ] No legacy rule from another task overrides the new visual.
- [ ] Special visuals use a task-specific class when needed.
- [ ] Generic image rules remain minimal.
- [ ] Computed styles are inspected if the image is blank, clipped, tiny or oversized.

## E. Visual-type checks

### Graph/chart

- [ ] Every plotted value/point/bar is correct.
- [ ] Marker shapes are correct.
- [ ] Line styles are correct.
- [ ] Legend order is correct.
- [ ] All legend text stays inside the legend box with padding.
- [ ] No labels are clipped at image edges.

### Map/plan

- [ ] Every label is exact.
- [ ] Public/private wording is exact.
- [ ] Orientation/compass is exact.
- [ ] No feature is added, removed or moved.
- [ ] Meaningful arrows/boundaries are preserved.

### Process/diagram

- [ ] Every stage is present.
- [ ] Every arrow is correct.
- [ ] Sequence is exact.
- [ ] No stage/detail is invented or omitted.

## F. Layout and modes

- [ ] Normal Task 1 split view is readable.
- [ ] Enlarged/focus view shows the complete visual.
- [ ] Aspect ratio is preserved.
- [ ] No crop, stretch or horizontal overflow.
- [ ] Wide 16:9 viewport checked.
- [ ] Narrower laptop viewport checked.
- [ ] Responsive/mobile state checked where supported.
- [ ] Study Mode Task 1 works.
- [ ] Study Mode Task 2 works.
- [ ] Test Mode Task 1 works.
- [ ] Test Mode Task 2 works.
- [ ] Candidate name is in the reference position.
- [ ] Timer/footer controls work.
- [ ] Word counters work.
- [ ] Submission/report identifies the correct test.
- [ ] No unexpected console errors.

## G. Preview gate

- [ ] Preview URL is commit-specific.
- [ ] Rendered browser result has been visually inspected.
- [ ] Full Task 1 image has been inspected, not only the top section.
- [ ] Normal and enlarged views both pass.
- [ ] User approval is received before publication.

## H. Publish gate

When the user says **publish**, all items below are part of the same release flow.

- [ ] Approved preview commit is the intended branch head.
- [ ] Branch is compared with current `main`; divergence is resolved if needed.
- [ ] Canonical Academic Writing page exists on `main`.
- [ ] PR changed-file list is correct.
- [ ] PR is squash-merged.
- [ ] `index.html` Academic Writing availability includes the new `[book]-[test]` key.
- [ ] `hub/live-hub-contract.json` is updated to match the advertised route.
- [ ] Canonical page is verified on `main`.
- [ ] Live Hub button is active.
- [ ] Live Hub button opens the canonical page.
- [ ] Production render matches the approved preview.

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
