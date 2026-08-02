# Safe Live Hub and Seasonal Update Runbook

This runbook protects the live IELTS Pabs hub from accidentally replacing or downgrading Reading, General Training Reading, Listening, Writing or future Speaking tests.

Before any Live Hub work, read:

- `hub/IELTS_LIVE_HUB_FAST_TRACK_WORKFLOW.md`
- `hub/LIVE_HUB_PARITY_CHECKLIST.md`
- this seasonal runbook when the change is temporary or event-specific

The Live Hub is a **router**. Canonical skill pages remain the source of Test Mode, Study Mode, feedback, transcripts, audio, evidence, scoring, Writing tools and future Speaking behaviour.

## What the protection does

`python scripts/verify_live_hub.py` checks that:

1. the hub still uses the approved canonical route patterns for every live category;
2. `index.html` availability matches the exact availability fragment recorded in `hub/live-hub-contract.json`;
3. every test advertised by the hub exists at its canonical path;
4. completed/restored reference boundaries still match approved Git blob fingerprints;
5. a seasonal hub PR does not also modify test pages, shared engines or unrelated repository files;
6. the logo/home route does not reintroduce the old `#mock-tests` scroll behaviour;
7. seasonal styling remains local and does not load external CSS, fonts or images.

The GitHub Actions workflow `.github/workflows/live-hub-guard.yml` runs automatically for pull requests and updates to `main`.

## Normal special-day update

Use this for Christmas, Lunar New Year, Halloween, Australia Day, New Year or another date-specific hub appearance.

### 1. Start from current `main`

In GitHub Desktop:

1. switch to `main`;
2. click **Fetch origin**;
3. click **Pull origin** when offered;
4. confirm there are no uncommitted changes;
5. run the current Live Hub guard.

Never create a seasonal branch from an old redesign branch.

### 2. Create a dated backup branch

Use a name such as:

```text
backup-live-hub-before-christmas-2026-12-01
```

The backup is a convenient visual comparison and targeted hub rollback point. Git history remains the deeper backup. Never copy the whole backup repository over current `main`.

### 3. Create a seasonal branch

Use a name such as:

```text
seasonal/christmas-2026
```

### 4. Complete a read-only delta audit

State:

- the event and active dates;
- exact intended appearance;
- what must remain unchanged;
- exact allowed and forbidden paths;
- desktop/mobile acceptance;
- representative skill links;
- removal date and rollback method.

Do not edit before this scope is clear.

### 5. Edit only the seasonal layer

Preferred files:

```text
hub/seasonal-theme.css
hub/assets/*
```

The neutral hub stylesheet, route-generation JavaScript and all test files should remain untouched.

`index.html` should change only when the event needs temporary accessible text that CSS cannot provide. Do not edit availability or route logic during a seasonal update.

### 6. Run the guard locally

From the repository root:

```bash
python scripts/verify_live_hub.py --base-sha origin/main
```

Expected route inventory at the time this runbook was prepared:

```text
Live Hub guard passed.
Canonical routes checked: academicReading=16, generalReading=16, listening=15, academicWriting=1
Protected reference fingerprints checked: 11
```

The counts will change only through a validated route/category activation that updates `index.html` and the contract together.

### 7. Preview and manually check

Check wide desktop, medium width and approximately 390 px. Confirm:

- clean no-hash top load;
- IELTS Pabs logo refreshes to the absolute top;
- Mock Tests, Practice Lab and My Progress;
- all four book families;
- available and `Coming soon` states;
- keyboard focus and reduced-motion behaviour;
- no clipped or covered controls.

Open representative links:

- one completed Academic Reading reference;
- IELTS 19 GT Test 1 or 2;
- the newest completed GT test;
- IELTS 16 Listening Test 1;
- one additional Listening test;
- every currently live Academic Writing item;
- the IELTS Pabs logo from the hub and from a test page.

The decoration must not reduce contrast, alter Academic/GT meaning, move test links or change target URLs.

### 8. Open a hub-only pull request

The PR should contain only safe seasonal paths. The automated guard rejects a combined hub-and-test release.

Suggested title:

```text
Add Christmas 2026 Live Hub theme
```

Include:

- event and active dates;
- files changed;
- desktop/medium/mobile confirmation;
- keyboard/reduced-motion confirmation;
- representative links checked;
- guard result;
- planned removal date;
- known limitations.

### 9. Merge and verify live

After checks pass:

1. squash-merge the PR;
2. verify the commit on `origin/main`;
3. wait for GitHub Pages;
4. hard refresh the live hub;
5. repeat the representative link and logo checks.

### 10. Remove the theme after the event

Create a new branch from updated `main`, restore `hub/seasonal-theme.css` to its neutral state, remove event-only assets, run the guard and merge another small hub-only PR.

## Adding or improving a test

Test production and hub decoration are separate releases.

1. Complete the test through its Academic Reading, GT Reading, Listening, Writing or Speaking workflow.
2. Run its full parity checklist and regression suite.
3. Merge and verify the test PR first.
4. Create a fresh hub activation branch from updated `main`.
5. Update exact availability, canonical route inventory and expected availability contract together.
6. Add or update a protected fingerprint only for a deliberately approved stable reference boundary.
7. Run the guard and open a separate small activation PR.

After a validated reference change, fingerprints can be refreshed with:

```bash
python scripts/verify_live_hub.py --refresh-fingerprints
```

Do not use this command merely to make a seasonal or unrelated PR pass. A mismatch requires investigation and skill-specific validation.

## Emergency rollback

When a seasonal update causes a problem:

1. revert the seasonal PR or restore the neutral seasonal files;
2. do not copy the whole repository from an old backup branch;
3. do not replace Academic Reading, GT Reading, Listening, Writing or Speaking directories;
4. run the Live Hub guard;
5. merge the smallest rollback;
6. verify the live hub and representative targets.

When a direct target is broken but its hub path is correct, move the repair to the relevant skill workflow. The hub may temporarily withdraw the one affected item, but it must not repair the test by copying an old file.

## Files protected as approved references

The contract currently protects:

- shared Reading feature-shell CSS and JavaScript;
- IELTS 16 Academic Reading Test 4;
- IELTS 17 Academic Reading Test 1;
- current IELTS 19 GT Reading Tests 1, 2 and 3;
- IELTS 16 Listening Test 1;
- the IELTS 16 Academic Writing canonical entry, clean-start redirect and visible application entry.

These boundaries represent completed or restored behaviour used to detect silent replacement. Add another fingerprint only after the target becomes a stable approved reference implementation.
