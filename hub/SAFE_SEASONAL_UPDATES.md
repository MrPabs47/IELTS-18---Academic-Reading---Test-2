# Safe Live Hub and Seasonal Update Runbook

This runbook protects the live IELTS Pabs hub from accidentally replacing or downgrading Reading, General Training Reading or Listening tests.

The Live Hub is a **router**. The canonical test pages remain the source of Test Mode, Study Mode, feedback, transcripts, audio, evidence and scoring behaviour.

## What the protection does

`python scripts/verify_live_hub.py` checks that:

1. the hub still uses the approved canonical Academic Reading, General Training Reading and Listening route patterns;
2. every test advertised by the hub exists at its canonical path;
3. the restored/completed Reading, GT and Listening reference implementations still match their approved Git blob fingerprints;
4. a seasonal hub PR does not also modify test pages, shared Reading code, Listening code or unrelated repository files;
5. the logo/home route does not reintroduce the old `#mock-tests` scroll behaviour;
6. seasonal styling remains local and does not load external CSS, fonts or images.

The GitHub Actions workflow `.github/workflows/live-hub-guard.yml` runs this automatically for pull requests and updates to `main`.

## Normal special-day update

Use this for Christmas, Lunar New Year, Halloween, Australia Day, New Year or another date-specific hub appearance.

### 1. Start from current `main`

In GitHub Desktop:

1. Switch to `main`.
2. Click **Fetch origin**.
3. Click **Pull origin** if offered.
4. Confirm there are no uncommitted changes.

Never create a seasonal branch from an old hub branch.

### 2. Create a dated backup branch

Use a name such as:

```text
backup-live-hub-before-christmas-2026-12-01
```

This branch is a convenient visual rollback point. Git history remains the deeper backup.

### 3. Create a seasonal branch

Use a name such as:

```text
seasonal/christmas-2026
```

### 4. Edit only the seasonal layer

Preferred files:

```text
hub/seasonal-theme.css
hub/assets/*
```

The neutral hub stylesheet and all test files should remain untouched.

`index.html` should only change when the event needs a temporary hub message or accessible text that CSS cannot provide. Do not edit its route-generation JavaScript during a seasonal update.

### 5. Run the guard locally

From the repository root:

```bash
python scripts/verify_live_hub.py --base-sha origin/main
```

Expected result:

```text
Live Hub guard passed.
Canonical routes checked: academicReading=16, generalReading=16, listening=15
Protected reference fingerprints checked: 8
```

### 6. Preview and manually check

Check desktop and phone width. Open representative links:

- one completed Academic Reading reference;
- IELTS 19 GT Tests 1 and 2;
- one Listening test, including IELTS 16 Listening Test 1;
- the IELTS Pabs logo from the hub and from a test page.

The event decoration must not reduce contrast, cover controls, change link targets or alter the meaning of Academic and General Training colours.

### 7. Open a hub-only pull request

The PR should contain only the safe hub paths. The automated guard will reject a combined hub-and-test release.

Suggested title:

```text
Add Christmas 2026 Live Hub theme
```

Include:

- event and active dates;
- files changed;
- desktop/mobile preview confirmation;
- representative links checked;
- guard result;
- planned date to remove the theme.

### 8. Merge and verify live

After checks pass:

1. squash-merge the PR;
2. wait for GitHub Pages;
3. hard refresh the live hub;
4. open the representative Reading, GT and Listening links again.

### 9. Remove the theme after the event

Create a new branch from updated `main`, restore `hub/seasonal-theme.css` to its neutral commented state, run the guard and merge another small hub-only PR.

## Adding or improving a test

Test production and hub decoration are separate releases.

1. Complete the test in its Reading, GT or Listening branch.
2. Run its full parity checklist and regression suite.
3. Merge the test PR first.
4. When an approved protected reference changes, update its fingerprint in that same validated test PR:

```bash
python scripts/verify_live_hub.py --refresh-fingerprints
```

5. Run the guard again.
6. Activate or change hub availability in a separate tiny hub PR.

Do not refresh fingerprints merely to make a seasonal PR pass. A mismatch means the test reference changed and needs its own investigation or validated release.

## Emergency rollback

When a seasonal update causes a problem:

1. revert the seasonal PR, or restore the neutral `hub/seasonal-theme.css`;
2. do not copy the whole repository from an old backup branch;
3. do not replace Reading, GT or Listening directories;
4. run the Live Hub guard;
5. merge the rollback and verify GitHub Pages.

Restoring the entire repository from an old hub backup can also restore old test files. The backup branch is for comparison and targeted recovery, not for wholesale replacement.

## Files protected as approved references

The contract currently fingerprints:

- the shared Reading feature-shell CSS and JavaScript;
- IELTS 16 Academic Reading Test 4;
- IELTS 17 Academic Reading Test 1;
- IELTS 19 GT Reading Tests 1, 2 and 3;
- IELTS 16 Listening Test 1.

These references represent the completed or restored behaviour used to judge future parity. Add another fingerprint only after that test becomes an approved reference implementation.
