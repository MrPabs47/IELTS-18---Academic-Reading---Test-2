# IELTS Pabs Live Hub Parity Checklist

**Use with:** `hub/IELTS_LIVE_HUB_FAST_TRACK_WORKFLOW.md`  
**Seasonal companion:** `hub/SAFE_SEASONAL_UPDATES.md`

This is the pass/fail specification for every Live Hub branch. The current `main` hub, canonical skill pages, skill-specific workflows, `hub/live-hub-contract.json` and the Live Hub guard remain authoritative.

---

## A. Branch and baseline gate

- [ ] Branch/worktree starts from current `origin/main`.
- [ ] Current `origin/main` SHA is recorded.
- [ ] Worktree is clean.
- [ ] No unrelated skill worktree is editing the same hub files.
- [ ] Current Live Hub guard passes before implementation, or every existing failure is documented.
- [ ] Update is classified as Seasonal, Small permanent, Route activation, Hub feature, Major redesign or Emergency rollback.
- [ ] A dated backup branch exists when required.
- [ ] Read-only delta audit is complete before editing.
- [ ] Exact allowed paths are listed.
- [ ] Exact forbidden paths are listed.
- [ ] Rollback method is defined.

## B. Sources of truth

- [ ] Current `main` canonical target pages are used rather than memory or old branches.
- [ ] Relevant skill-specific workflow/checklist is identified for every affected live test.
- [ ] `hub/live-hub-contract.json` is reviewed.
- [ ] Current `index.html` availability and route logic are reviewed.
- [ ] Dated backup is used only for comparison or targeted hub recovery.
- [ ] No whole-repository restore from an old hub branch is planned.
- [ ] Any uncertainty about the latest approved test is resolved before hub editing.

## C. Update classification and scope

### Seasonal

- [ ] Normal paths are limited to `hub/seasonal-theme.css` and `hub/assets/*`.
- [ ] `index.html` changes are limited to necessary temporary accessible text.
- [ ] Route JavaScript is untouched.
- [ ] Event active and removal dates are recorded.

### Small permanent update

- [ ] Exact visual/copy delta is stated.
- [ ] Routes and availability are frozen unless explicitly authorised.
- [ ] No unrelated redesign is included.

### Route/availability activation

- [ ] Target test is already merged to current `main`.
- [ ] Canonical direct page opens successfully.
- [ ] Skill-specific parity evidence is available.
- [ ] Target test files are not edited in the hub activation PR.

### Hub feature

- [ ] Persistence/data ownership is defined.
- [ ] Privacy and empty/error states are defined where relevant.
- [ ] Focused feature tests are planned.

### Major redesign

- [ ] Dated backup exists.
- [ ] Current reference screenshots and route inventory are captured.
- [ ] Design contract and preserved behaviours are documented.
- [ ] Explicit release approval is required.

## D. Changed-file discipline

- [ ] Actual files touched match the declared update class.
- [ ] No Reading, GT Reading, Listening, Writing or Speaking implementation file appears in a seasonal/small hub PR.
- [ ] No shared test engine appears in a hub-only PR.
- [ ] No old test file is copied from a backup or preview branch.
- [ ] No temporary preview file is included unintentionally.
- [ ] Exact intended paths only will be staged.
- [ ] `git diff --check` passes.

## E. Hub architecture contract

- [ ] Live Hub remains a router and availability surface.
- [ ] Test questions, scoring, Study Mode, audio, transcripts and writing behaviour remain in canonical test pages.
- [ ] Hub does not duplicate or override skill-specific logic.
- [ ] Permanent structure remains in `index.html`.
- [ ] Seasonal overrides remain in `hub/seasonal-theme.css`.
- [ ] Local event assets remain under `hub/assets/*`.
- [ ] Existing local-history contract remains unchanged unless explicitly migrated.

## F. Availability and canonical routes

- [ ] Every available row has an explicit availability key.
- [ ] Every unavailable row is non-interactive and says `Coming soon`.
- [ ] No stale hidden href exists on an unavailable row.
- [ ] Every available href uses the canonical encoded path.
- [ ] Direct target and hub target resolve to the same page.
- [ ] Every advertised canonical file exists on current `main`.
- [ ] No unintended neighbouring key changes availability.
- [ ] Any withdrawal affects only the intended target.

## G. New category or test activation

- [ ] Category key exists in the hub availability object.
- [ ] Exact live keys are listed.
- [ ] Canonical route generator exists.
- [ ] Filesystem template exists in `hub/live-hub-contract.json`.
- [ ] Excluded/non-live inventory is correct.
- [ ] Automated route count/report is updated.
- [ ] Entry-point redirect is verified when used.
- [ ] Target skill parity checklist passed before activation.
- [ ] Target page home route works.
- [ ] Live row changes from `Coming soon` to available only after all gates pass.

## H. Protected references

- [ ] Current protected fingerprints match.
- [ ] Any mismatch is investigated.
- [ ] Fingerprints are not refreshed in a seasonal or unrelated hub PR.
- [ ] A deliberate fingerprint update is paired with validated skill/shared-engine evidence.
- [ ] New fingerprint is added only for a stable approved reference boundary.
- [ ] Shared Reading/other protected engines are not silently replaced.

## I. Header, logo and navigation

- [ ] IELTS Pabs logo is visible and correctly labelled.
- [ ] Logo works with mouse.
- [ ] Logo works with keyboard.
- [ ] Logo returns to clean `index.html`.
- [ ] Obsolete `#mock-tests` hash is not introduced.
- [ ] Hub opens at the absolute top.
- [ ] Refresh does not restore an unwanted scroll position.
- [ ] Mock Tests button shows the default hub.
- [ ] Practice Lab opens and returns correctly.
- [ ] My Progress opens and returns correctly.
- [ ] Visual and keyboard order agree.
- [ ] Active Test leave protection is preserved on test pages.

## J. Books, cards and hierarchy

- [ ] IELTS 19, 18, 17 and 16 remain visible in the intended order.
- [ ] Each book shows four test cards.
- [ ] Test titles are correct.
- [ ] Academic pathway remains on the intended side.
- [ ] General Training pathway remains on the intended side.
- [ ] Reading appears before Writing inside each pathway.
- [ ] Listening and Speaking remain below the divider.
- [ ] No duplicate labels, test badges, arrows or Start buttons appear unless deliberately approved.
- [ ] Mock Tests remain the primary visual hierarchy.

## K. Colours and visual identity

- [ ] Academic uses approved purple `#7204A3` unless explicitly changed.
- [ ] General Training uses approved blue `#0062A3` unless explicitly changed.
- [ ] Academic and GT meaning does not vary by book.
- [ ] Book-family accents remain secondary.
- [ ] Text/background contrast remains readable.
- [ ] Meaning does not rely on colour alone.
- [ ] Seasonal decoration does not obscure permanent identity.
- [ ] Logo hover/focus treatment remains visible.

## L. Available and unavailable states

- [ ] Available rows look and behave interactive.
- [ ] Available rows have visible hover and focus states.
- [ ] Unavailable rows do not appear clickable.
- [ ] `Coming soon` remains readable at all widths.
- [ ] No newly activated item retains a preview label.
- [ ] No withdrawn item retains a working href.
- [ ] Skill labels remain consistent across books.

## M. Attempt history and progress contract

- [ ] Existing storage key `ielts-pabs-results` remains unchanged unless explicitly migrated.
- [ ] Existing skill IDs remain stable.
- [ ] Up to two recent attempts display correctly.
- [ ] Band/score fallback display remains correct.
- [ ] History popover opens only when attempts exist.
- [ ] Popover remains inside viewport.
- [ ] Hub update does not erase local history.
- [ ] My Progress copy does not promise cross-device persistence before implementation.
- [ ] Any Cloudflare/account migration has its own data/privacy plan.

## N. Seasonal contract

- [ ] Theme is decorative and lightweight.
- [ ] No external CSS, script, font or image host is added.
- [ ] No test link moves or changes meaning.
- [ ] No critical control is covered.
- [ ] No route-generation code changes.
- [ ] Academic/GT colours retain their identity.
- [ ] Desktop and phone remain readable.
- [ ] Reduced-motion preference is respected.
- [ ] Neutral theme can be restored by changing only seasonal files.
- [ ] Removal PR/date is recorded.

## O. Responsive layout and accessibility

- [ ] Wide desktop shows the approved four-column layout.
- [ ] Medium width shows the approved two-column layout.
- [ ] Approximately 390 px shows one column.
- [ ] No horizontal overflow occurs.
- [ ] No label or control is clipped.
- [ ] Header remains usable at mobile width.
- [ ] Navigation remains reachable by keyboard.
- [ ] Visible `:focus-visible` treatment exists.
- [ ] Reduced-motion state removes non-essential animation.
- [ ] Accessible names remain meaningful.
- [ ] Dialog/popover semantics remain valid.
- [ ] Text size and spacing remain readable.

## P. Automated verification gate

- [ ] `python scripts/verify_live_hub.py --base-sha origin/main` passes.
- [ ] Contract JSON parses.
- [ ] All advertised route fragments are found.
- [ ] All advertised canonical files exist.
- [ ] Protected fingerprints match.
- [ ] Home-logo/hash regression check passes.
- [ ] Seasonal local-asset/scope check passes.
- [ ] Changed-file scope matches update class.
- [ ] JavaScript syntax/integrity check passes when hub script changes.
- [ ] CSS validation passes when seasonal/permanent CSS changes.
- [ ] Focused hub-feature tests pass where applicable.
- [ ] `git diff --check` passes.

## Q. Representative target smoke test

From the hub, open:

- [ ] one approved Academic Reading reference;
- [ ] IELTS 19 GT Test 1 or 2;
- [ ] newest completed GT test;
- [ ] IELTS 16 Listening Test 1;
- [ ] one additional Listening test;
- [ ] every currently live Academic Writing entry;
- [ ] every currently live General Training Writing entry;
- [ ] every currently live Speaking entry;
- [ ] the target changed by this PR.

For each representative target:

- [ ] correct test/skill opens;
- [ ] approved current experience appears;
- [ ] no stale preview URL/label appears;
- [ ] local assets load;
- [ ] IELTS Pabs home route returns correctly.

## R. Visual QA gate

- [ ] Fresh no-hash hub load checked.
- [ ] Scroll-down and logo refresh checked.
- [ ] Mock Tests checked.
- [ ] Practice Lab checked.
- [ ] My Progress checked.
- [ ] One book/card from every book family checked.
- [ ] Available and Coming soon states checked.
- [ ] Attempt-history chip/popover checked where data exist.
- [ ] Desktop checked.
- [ ] Medium width checked.
- [ ] Approximately 390 px checked.
- [ ] Keyboard-only navigation checked.
- [ ] Reduced-motion state checked.
- [ ] Seasonal active state checked where applicable.
- [ ] Seasonal neutral/removal state checked where applicable.
- [ ] No unexpected console errors occur.
- [ ] Visual approval is recorded before commit/merge.

## S. Release gate

- [ ] Work remains unstaged until visual approval.
- [ ] Final guard passes after the last executable change.
- [ ] Exact changed-file list is reviewed.
- [ ] Commit message is descriptive.
- [ ] PR targets `main`.
- [ ] PR class and scope are stated.
- [ ] PR includes Summary, Included, Validation and Known limitations.
- [ ] Seasonal PR includes active/removal dates.
- [ ] Activation PR identifies merged test release and canonical target.
- [ ] Automated guard is green.
- [ ] PR is mergeable.
- [ ] Major redesign has explicit release approval.
- [ ] Squash merge is used unless another method is deliberately approved.

## T. Live verification and cleanup

- [ ] Squash/merge commit is verified on `origin/main`.
- [ ] GitHub Pages deployment is allowed to update.
- [ ] Live hub is hard refreshed.
- [ ] Live top-of-page and logo behaviour are verified.
- [ ] Live changed state is verified.
- [ ] Representative live target links are opened again.
- [ ] Local `main` is fetched and pulled in GitHub Desktop.
- [ ] Local servers are stopped.
- [ ] Terminals/editors/Explorer release the worktree.
- [ ] Feature worktree/branch is removed safely.
- [ ] Fetch/prune is complete.
- [ ] Clean main is confirmed.
- [ ] Seasonal removal follow-up is scheduled/completed.
- [ ] Dated backup is retained or cleaned up deliberately.
- [ ] Any incident or reusable lesson is added to the workflow/checklist.

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
