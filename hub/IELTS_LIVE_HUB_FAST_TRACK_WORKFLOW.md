# IELTS Pabs Live Hub Fast-Track Update Workflow

**IELTS Website Practice Creation — canonical Live Hub production guide**  
**Reference implementation:** current `main` Live Hub  
**Key releases:** redesign PR #382; safety-guard PR #393; IELTS 16 Academic Writing Test 2 activation  
**Prepared:** 2 August 2026

> **Operating rule**
>
> Before auditing or editing the Live Hub, read and follow:
>
> - `hub/IELTS_LIVE_HUB_FAST_TRACK_WORKFLOW.md`
> - `hub/LIVE_HUB_PARITY_CHECKLIST.md`
> - `hub/SAFE_SEASONAL_UPDATES.md` for a seasonal change
>
> Treat them as the required workflow and pass/fail specification. Use current `origin/main` as the baseline. The Live Hub is a router; canonical skill pages and their own workflows remain authoritative for test behaviour.

---

## Executive summary

The 2026 Live Hub redesign created a cleaner IELTS Pabs entry point with a restrained dark design, Cambridge 19–16 book sections, direct skill links, Academic and General Training pathways, Listening and Speaking rows, Practice Lab, My Progress and local attempt-history chips.

The release and follow-up checks exposed several important risks:

- a correct URL can still open a test whose content is older than the approved version;
- a whole-repository restore from a hub backup can restore obsolete tests as well as the old hub;
- the old `#mock-tests` hash made the home logo return to a slightly scrolled position;
- test production, test activation and hub appearance work can become mixed unless they use separate branches and pull requests;
- every new live category must be added to the route contract and guard, not only to `index.html`;
- seasonal decoration needs an isolated implementation and removal path;
- source checks cannot replace desktop, mobile and live browser review.

The central rule is:

**The Live Hub is a routing and availability surface. It must never become a copy of a test, a source of Study Mode behaviour or a place where old test files are restored.**

A normal seasonal update should require one baseline, one short audit, one isolated theme change, one verification pass, one small release PR and one later removal PR. A normal test activation should happen only after the skill-specific test is merged and verified on current `main`.

---

## 1. What the current Live Hub established

### 1.1 Product structure

The hub provides:

- a sticky translucent header;
- the `IELTS Pabs` home logo;
- Mock Tests, Practice Lab and My Progress navigation;
- Log in and Sign up placeholders;
- an animated practice message;
- IELTS 19, 18, 17 and 16 sections;
- four test cards per book;
- Academic and General Training pathways;
- Reading and Writing rows inside each pathway;
- shared Listening and Speaking rows below the divider;
- direct links for available skills and `Coming soon` for unavailable skills;
- local attempt-history chips and hover details.

### 1.2 Visual identity

The permanent hub uses near-black surfaces, white and grey text, Academic purple `#7204A3`, General Training blue `#0062A3`, and separate muted book-family accents. The layout is four columns on wide screens, two on medium screens and one at phone width.

Temporary event styling is loaded separately through:

```text
hub/seasonal-theme.css
```

### 1.3 Architecture

The hub generates canonical routes from book number, test number, skill category and availability sets. It does not own questions, answers, scoring, Study Mode, audio, transcripts, evidence, Writing tools or Speaking behaviour.

The safety layer consists of:

```text
hub/live-hub-contract.json
scripts/verify_live_hub.py
.github/workflows/live-hub-guard.yml
hub/SAFE_SEASONAL_UPDATES.md
```

---

## 2. Lessons learned

### 2.1 Route correctness is necessary but not sufficient

IELTS 19 GT Reading Tests 1 and 2 used their expected canonical routes while their visible Study experience did not match the completed version the user expected. Later GT releases restored and refined Study Mode, clue controls and interactions.

**Rule:** verify both the route and the approved target experience. Stable reference boundaries may also use protected Git blob fingerprints.

### 2.2 Backups are comparison points, not full restore sources

A dated backup captures the entire repository at that moment. Restoring it wholesale can replace newer Reading, GT, Listening or Writing work.

**Rule:** recover exact hub files or revert an exact hub PR. Never copy the whole backup branch over current `main`.

### 2.3 The logo must use a clean home URL

The old `#mock-tests` state produced a small downward scroll.

**Rule:** the logo returns to clean `index.html`, removes obsolete hashes, restores the absolute top and refreshes without altering test routes.

### 2.4 Test production and hub activation are separate releases

A test may require many files and skill-specific checks. Activation normally needs only the availability/route layer and route contract.

**Rule:** merge and verify the test first; activate it in a separate tiny hub PR.

### 2.5 Seasonal work needs a clean removal path

**Rule:** put temporary decoration in `hub/seasonal-theme.css` and local `hub/assets/*`, record active/removal dates, and remove it through another small PR.

### 2.6 New live categories must enter the contract

The first guard covered Academic Reading, GT Reading and Listening. Academic Writing later became live.

**Rule:** a category or item is not fully activated until `index.html`, the canonical file, `hub/live-hub-contract.json` and the guard agree.

### 2.7 Browser approval remains mandatory

**Rule:** every hub update receives one controlled desktop/medium/phone review before merge and a smaller live review after deployment.

---

## 3. Fixed sources of truth

Resolve conflicts in this order:

| Priority | Source | Used for |
|---|---|---|
| 1 | Current `origin/main` canonical skill page and assets | Actual Test/Study behaviour, questions, media, scoring and feedback |
| 2 | Relevant skill workflow and parity checklist | Skill-specific Definition of Done |
| 3 | `hub/live-hub-contract.json` | Canonical route inventory and approved references |
| 4 | Current `main/index.html` | Hub presentation, availability and route generation |
| 5 | Live Hub guard and GitHub Actions result | Executable route, fingerprint and scope protection |
| 6 | Current GitHub Pages deployment | Final behaviour after merge |
| 7 | Dated hub backup | Historical comparison and targeted hub recovery only |
| 8 | Screenshots/previews | Visual reference only |

### Golden rules

- Never infer the latest test from memory or an old branch.
- Never use a working hub link as proof of skill parity.
- Never refresh a fingerprint merely to make CI pass.
- Never restore the whole repository from a hub backup.
- Never combine seasonal decoration and test repair in one PR.

---

## 4. Classify the update before editing

### Class A — Seasonal appearance

Examples: Christmas, New Year, Lunar New Year, Halloween, Australia Day or a temporary school event.

Normal paths:

```text
hub/seasonal-theme.css
hub/assets/*
```

Use `index.html` only when temporary accessible text cannot be expressed safely through the seasonal layer. Do not change route JavaScript.

### Class B — Small permanent hub update

Examples: approved colour, wording, spacing or accessibility correction. State what must remain unchanged and keep the route layer frozen unless route work is the explicit purpose.

### Class C — Route or availability activation

Examples: activating a completed Reading, Listening, Writing or Speaking test, withdrawing one broken target, or correcting one canonical path.

Required evidence:

- skill-specific release already merged to current `main`;
- direct canonical target verified;
- skill parity evidence available;
- exact availability key and path declared;
- contract and guard updated in the same activation PR.

### Class D — Hub feature

Examples: filters, progress persistence, accounts or Cloudflare-backed history. Define data ownership, privacy, empty/error states and focused tests before implementation.

### Class E — Major redesign

Examples: replacing the card architecture, navigation or information hierarchy. Require a dated backup, reference screenshots, route inventory, design contract, broad QA and explicit release approval.

### Class F — Emergency rollback

Identify whether the failure is visual, routing, target-test, shared-engine, deployment/cache or persistence-related. Revert the smallest responsible release. Do not restore unrelated directories.

---

## 5. Definition of Done by update class

### Seasonal

- current-main baseline and dated backup;
- only seasonal files changed unless temporary accessible text is justified;
- route logic and test files unchanged;
- no external fonts, scripts, CSS or image hosts;
- desktop, medium and phone review complete;
- representative live skills open;
- removal date and removal PR plan recorded.

### Small permanent update

- exact visual/copy delta implemented;
- routes, availability and local-history IDs preserved unless explicitly authorised;
- keyboard, reduced-motion and responsive states checked;
- guard and changed-file review pass.

### Activation

- target release exists on current `main`;
- direct canonical target opens and begins in the intended state;
- availability key, route generator and contract agree;
- neighbouring rows remain unchanged;
- hub and direct target are both checked before and after merge.

### Major redesign

- baseline screenshots and route inventory captured;
- non-negotiable behaviours written down;
- only hub-owned files changed;
- all four books, all card types, all navigation panels and local-history states reviewed;
- representative routes from every live skill checked;
- one approved release PR and rollback point.

---

## 6. Hub ownership contract

### Hub-owned

- information architecture and visual hierarchy;
- book/test cards;
- available and unavailable states;
- canonical link generation;
- top-level navigation;
- local attempt-history presentation;
- seasonal extension point;
- route/reference guard.

### Skill-owned

- source content and instructions;
- Test/Study lifecycle;
- answer evaluation and scoring;
- feedback, strategies, clues and evidence;
- audio/transcripts;
- Writing editor/report behaviour;
- Speaking recording logic;
- target-specific accessibility and regression suites.

When a problem appears after following a hub link, first test the direct target. A direct-target failure belongs to the skill workflow, not the hub.

---

## 7. Canonical route and availability contract

Current route families include:

```text
Academic Reading
./academic/cambridge-{book}/test-{test}/IELTS{book}%20Test%20{test}%20-%20Academic%20Reading.html

General Training Reading
./general-training/cambridge-{book}/test-{test}/IELTS{book}%20Test%20{test}%20-%20Reading%20-%20GT.html

Listening
./listening/cambridge-{book}/test-{test}/IELTS{book}%20Test%20{test}%20-%20Listening.html

Academic Writing
./academic/cambridge-{book}/test-{test}/IELTS{book}%20Test%20{test}%20-%20Academic%20Writing.html
```

Future General Training Writing and Speaking routes must be added only after canonical production pages exist.

For every activation:

1. verify the direct canonical file on current `main`;
2. confirm the intended availability key;
3. update `index.html` availability and route logic;
4. update `hub/live-hub-contract.json` category inventory and exact availability contract;
5. run the guard;
6. open the hub link and direct link;
7. verify again after merge.

A canonical route may redirect to a shared application entry point, as the first Academic Writing test does. The route check verifies the canonical entry file; the Writing suite verifies the redirected application.

---

## 8. Protected reference contract

Fingerprints detect silent content replacement where the URL remains unchanged.

Protect only stable, approved reference boundaries such as:

- shared Reading shell assets;
- completed Academic Reading references;
- completed/restored GT Reading references;
- the completed Listening reference;
- stable canonical Writing entry boundaries.

A fingerprint update is allowed only when:

1. the change is deliberate;
2. the relevant skill/shared tests pass;
3. visual approval is complete;
4. the fingerprint is refreshed in that validated release or a clearly identified safety-maintenance PR;
5. the reason is documented.

A seasonal PR must never refresh test fingerprints.

---

## 9. Fast-track workflow

| Phase | Work | Required output | Stop rule |
|---|---|---|---|
| 0. Baseline | Pull current `main`, confirm clean state, classify update, run current guard, create backup when required | Base SHA, class, clean status, existing failures, rollback point | Do not edit from a stale/dirty branch |
| 1. Read-only delta audit | State intended change, preserved behaviour, allowed/forbidden paths, affected routes and QA matrix | One-page delta and implementation plan | No code changes |
| 2. Scoped implementation | Change only approved hub files; keep test production separate | Exact files touched and focused checks | Stop if a target-test issue appears |
| 3. Automated verification | Run guard, JSON/JS/CSS checks as applicable and `git diff --check` | Green checks or explicit failures | Do not refresh fingerprints as a shortcut |
| 4. Browser QA | Review top load, logo, panels, cards, routes, desktop/medium/phone, keyboard and reduced motion | Recorded visual approval | No commit before approval |
| 5. Release | Review exact diff, stage exact paths, open one PR, confirm guard and mergeability | Clean PR with validation summary | No unrelated follow-on changes |
| 6. Live verification | Verify merge commit, wait for Pages, hard refresh, repeat representative links, clean branch | Verified live state and clean main | Roll back smallest release if live check fails |

---

## 10. Automated safety strategy

Reuse every time:

- canonical route-fragment checks;
- advertised file-existence checks;
- exact availability-contract check;
- protected-reference fingerprints;
- logo/hash-scroll regression check;
- seasonal local-asset and changed-file scope check;
- JSON parsing;
- `git diff --check`.

Add focused tests only for a new user-observable hub contract, such as filtering, progress persistence, account state, route-category generation or seasonal date switching. Do not duplicate skill evaluator suites inside hub tests.

---

## 11. Manual browser QA

### Home and navigation

1. Load the clean no-hash hub and confirm it starts at the absolute top.
2. Scroll down, click IELTS Pabs and confirm a clean top refresh.
3. Check Mock Tests, Practice Lab and My Progress.
4. Check mouse and keyboard interaction.
5. Check reduced-motion behaviour.

### Cards and states

1. Review IELTS 19, 18, 17 and 16.
2. Review Academic and GT pathways.
3. Confirm Reading before Writing.
4. Confirm Listening and Speaking below the divider.
5. Check available and `Coming soon` rows.
6. Check attempt chips/popover where data exist.

### Responsive

- wide desktop: four cards;
- medium: two cards;
- approximately 390 px: one card;
- no clipping or horizontal overflow;
- usable header/navigation at each width.

### Representative targets

Open at minimum:

- one approved Academic Reading reference;
- IELTS 19 GT Test 1 or 2;
- the newest completed GT test;
- IELTS 16 Listening Test 1;
- one additional Listening test;
- every currently live Academic Writing item;
- the target changed by the PR.

For each, confirm the correct current experience and the home route.

---

## 12. Seasonal update workflow

1. Pull current `main` and run the guard.
2. Create a dated backup such as `backup-live-hub-before-christmas-2026-12-01`.
3. Create `seasonal/christmas-2026`.
4. Complete a read-only delta audit.
5. Edit only `hub/seasonal-theme.css` and local `hub/assets/*` unless temporary accessible text is necessary.
6. Keep Academic/GT identity and all links unchanged.
7. Run the guard and browser matrix.
8. Open one hub-only PR with active and removal dates.
9. Verify live after merge.
10. After the event, restore the neutral seasonal layer through a second small PR.

---

## 13. Test activation workflow

### Gate 1 — skill release

- target test PR merged;
- skill parity checklist and tests pass;
- target page visually approved.

### Gate 2 — direct canonical verification

- exact file exists on current `main`;
- direct URL opens;
- intended mode chooser/initial state appears;
- target home route works.

### Gate 3 — hub contract

- exact availability key added;
- route generator exists;
- category inventory/exclusions updated;
- guard expected availability updated through the contract;
- protected reference added only when the boundary is stable and approved.

### Gate 4 — hub verification

- row becomes available;
- href equals direct canonical path;
- neighbouring rows remain unchanged;
- mobile layout remains usable;
- guard passes;
- live deployment opens the target after merge.

---

## 14. Major-redesign workflow

Before design work, capture current screenshots at desktop, medium and phone widths, route inventory, availability inventory, colour tokens, storage contract, guard result, dated backup and non-negotiable behaviours.

Write a design contract covering hierarchy, card density, book visibility, navigation, breakpoints, Academic/GT identity, available/unavailable states, progress placement, seasonal extension point and accessibility.

A redesign branch normally edits hub-owned files only. Any test-page defect discovered during redesign becomes a separate skill-specific task. Rebuild the approved final delta on current `main` rather than merging a long-lived stale redesign branch wholesale.

---

## 15. Incident response and rollback

Classify the failure:

- visual-only hub issue;
- route/availability issue;
- target-test regression;
- shared-engine regression;
- GitHub Pages/cache issue;
- local-storage/history issue.

Responses:

- visual issue: revert the hub PR or restore the exact previous hub-owned file;
- route issue: correct/withdraw only the intended key/path;
- target-test issue: move investigation to the relevant skill workflow;
- seasonal issue: restore neutral seasonal files and remove event assets;
- backup recovery: use the dated backup to compare or recover exact hub files, never to force-reset current `main`.

Record date/time, symptom, affected routes, first bad release, immediate protection, root cause, files changed, checks run, live verification and workflow/checklist update.

---

## 16. Codex operating rules

| Situation | Required setting/action |
|---|---|
| Read-only audit or substantial redesign | Model 5.6 Sol; Medium; Standard; Goal off |
| Tiny copy, colour or route correction | Model 5.6 Sol; Light; Standard; Goal off |
| Approval | Ask for approval for major redesign, data/privacy changes or broad routing changes; tightly scoped approved work may proceed |
| Prompt | Expected state → class → sources → allowed/forbidden paths → acceptance → checks → browser QA → Git report |
| Task boundary | End with “Stop after this task” and forbid later phases |
| Skill-page problem | Stop and move to the relevant skill workflow |
| Old-branch conflict | Rebuild the intended hub delta on current `main`; do not overwrite current files wholesale |

### Required prompt preamble

```text
Before auditing or editing the IELTS Pabs Live Hub, read and follow:

hub/IELTS_LIVE_HUB_FAST_TRACK_WORKFLOW.md
hub/LIVE_HUB_PARITY_CHECKLIST.md

For seasonal work also read:

hub/SAFE_SEASONAL_UPDATES.md

Treat them as the required workflow and pass/fail specification.
Use current origin/main as the baseline. The Live Hub is a router; canonical
skill pages and their own workflows remain authoritative for test behaviour.
Classify the update before editing, state exact allowed paths, and do not copy
files from an old backup or redesign branch.
```

---

## 17. Decision matrix

| Question | Yes | No |
|---|---|---|
| Temporary and event-specific? | Seasonal layer plus removal PR | Continue classification |
| Changes availability or href? | Activation workflow and contract update | Keep routes frozen |
| Changes Test/Study behaviour? | Skill-specific workflow | Keep work hub-owned |
| Changes persistence/accounts? | Hub feature with data/privacy contract | Normal workflow may be enough |
| Replaces information architecture? | Major redesign with backup/full matrix | Small permanent update |
| Old backup contains desired design? | Recover exact hub delta onto current `main` | Continue normally |
| PR mixes test and seasonal files? | Split it | Continue if scope matches class |
| Fingerprint changed unexpectedly? | Stop and investigate | Continue |
| Direct target fails but route is right? | Fix/withdraw through skill workflow | Continue hub diagnosis |

---

## 18. Pull request templates

### Seasonal PR

```text
Title: Add [event] [year] Live Hub theme

## Summary
## Active dates
## Included
## Files changed
## Validation
- Guard:
- Desktop:
- Approximately 390 px:
- Keyboard/reduced motion:
- Representative links:
## Removal plan
## Known limitations
```

### Activation PR

```text
Title: Activate IELTS [book] [skill] Test [number] in Live Hub

## Summary
## Canonical target
## Test release evidence
- Merged test PR/commit:
- Skill parity checklist:
- Direct target verified:
## Hub and contract changes
## Validation
- Guard:
- Hub/direct links:
- Mobile card:
- Home logo:
## Known limitations
```

---

## 19. Anti-patterns

| Avoid | Use instead |
|---|---|
| Starting from an old redesign branch | Current `origin/main` plus a fresh branch |
| Treating a working URL as proof of latest Study Mode | Route plus skill parity and protected-reference checks |
| Copying a whole backup onto main | Targeted hub recovery or exact PR revert |
| Mixing seasonal styling and test fixes | Separate PRs |
| Editing route logic for decoration | Seasonal CSS and local assets |
| Activating before test release | Merge/verify test first, then tiny activation |
| Adding a category only to `index.html` | Update availability, contract and guard together |
| Refreshing fingerprints to make CI green | Investigate and validate |
| Committing before browser approval | Keep unstaged until QA passes |
| Testing only desktop | Desktop, medium and approximately 390 px |
| Fixing a test from the hub branch | Use the skill workflow |
| Leaving seasonal decoration in permanent CSS | Isolated theme and removal PR |

---

## 20. One-page runbook

### Before editing

- pull/fetch current `main`;
- confirm clean worktree and base SHA;
- read workflow/checklist;
- classify update;
- run current guard;
- create backup where required;
- confirm canonical targets;
- declare allowed/forbidden paths;
- complete read-only delta audit.

### During implementation

- keep the hub a router;
- edit only approved hub files;
- preserve routes/history unless explicitly changing them;
- keep seasonal work isolated;
- never copy old test files;
- keep test production and activation separate;
- update the contract with every new live category/item;
- report actual files touched;
- stop after the approved delta.

### Before commit

- run the Live Hub guard;
- validate JSON/JS/CSS as applicable;
- run `git diff --check`;
- review changed files;
- check top load, logo and all navigation panels;
- check cards, availability and history;
- check desktop, medium and approximately 390 px;
- open representative Academic, GT, Listening and live Writing/Speaking routes;
- record visual approval;
- stage exact paths only.

### Release and cleanup

- open PR to `main` with validation summary;
- confirm guard and mergeability;
- squash merge;
- verify commit on `origin/main`;
- wait for Pages and hard refresh;
- repeat representative live checks;
- pull updated `main` in GitHub Desktop;
- stop servers and close handles;
- remove feature branch/worktree;
- fetch/prune and confirm clean main;
- schedule seasonal removal where applicable.

---

## Final recommendation

Treat the Live Hub as a stable product surface with narrow extension points:

- `index.html` for permanent structure, availability and canonical routing;
- `hub/seasonal-theme.css` and `hub/assets/*` for temporary events;
- `hub/live-hub-contract.json` for executable route/reference truth;
- skill-specific pages and workflows for actual IELTS test behaviour.

The safest update is the one that begins from current `main`, clearly classifies its purpose, changes the smallest correct set of files, proves routes and approved references, receives visual approval and releases once through a clean pull request.
