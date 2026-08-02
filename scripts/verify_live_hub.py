#!/usr/bin/env python3
"""Validate the IELTS Pabs Live Hub before a PR can reach main.

The guard has three jobs:
1. Confirm every advertised hub route resolves to the canonical test file.
2. Confirm approved reference implementations have not silently regressed.
3. Keep seasonal hub changes isolated from Reading, Listening, Writing,
   Speaking and shared test-engine work.

Run locally:
    python scripts/verify_live_hub.py
    python scripts/verify_live_hub.py --base-sha origin/main

After a deliberately approved reference-test release, refresh fingerprints in
that validated skill/test PR (never in an unrelated seasonal hub PR):
    python scripts/verify_live_hub.py --refresh-fingerprints
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "hub" / "live-hub-contract.json"
INDEX_PATH = ROOT / "index.html"
SEASONAL_CSS_PATH = ROOT / "hub" / "seasonal-theme.css"

SEASONAL_ENTRY_PATHS = {
    "index.html",
    "hub/seasonal-theme.css",
}
SEASONAL_ENTRY_PREFIXES = ("hub/assets/",)
SEASONAL_ALLOWED_PATHS = {
    "index.html",
    "hub/seasonal-theme.css",
    "hub/live-hub-contract.json",
    "hub/SAFE_SEASONAL_UPDATES.md",
    "scripts/verify_live_hub.py",
    ".github/workflows/live-hub-guard.yml",
}
SEASONAL_ALLOWED_PREFIXES = ("hub/assets/",)


class GuardFailure(RuntimeError):
    """A clear, user-facing guard failure."""


def run_git(*args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if completed.returncode != 0:
        raise GuardFailure(
            f"git {' '.join(args)} failed:\n{completed.stderr.strip()}"
        )
    return completed.stdout.strip()


def load_contract() -> dict:
    if not CONTRACT_PATH.is_file():
        raise GuardFailure(f"Missing contract: {CONTRACT_PATH.relative_to(ROOT)}")
    try:
        contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise GuardFailure(
            f"Invalid JSON in {CONTRACT_PATH.relative_to(ROOT)}: {exc}"
        ) from exc
    verify_contract(contract)
    return contract


def verify_contract(contract: dict) -> None:
    books = contract.get("books")
    tests = contract.get("tests")
    categories = contract.get("categories")
    availability = contract.get("index_availability_fragment")

    if not isinstance(books, list) or not books:
        raise GuardFailure("Live Hub contract must define a non-empty books list.")
    if not isinstance(tests, list) or not tests:
        raise GuardFailure("Live Hub contract must define a non-empty tests list.")
    if not isinstance(categories, dict) or not categories:
        raise GuardFailure("Live Hub contract must define route categories.")
    if not isinstance(availability, str) or not availability.strip():
        raise GuardFailure(
            "Live Hub contract must define index_availability_fragment so availability changes "
            "cannot bypass the route inventory."
        )

    all_keys = {f"{book}-{test}" for book in books for test in tests}
    route_fragments: set[str] = set()

    for category, config in categories.items():
        if not isinstance(config, dict):
            raise GuardFailure(f"Invalid category configuration: {category}")
        for required in ("filesystem_template", "index_route_fragment", "excluded"):
            if required not in config:
                raise GuardFailure(f"Category {category} is missing {required}.")

        fragment = config["index_route_fragment"]
        if fragment in route_fragments:
            raise GuardFailure(f"Duplicate route fragment in contract: {category}")
        route_fragments.add(fragment)

        excluded = config.get("excluded", [])
        if len(excluded) != len(set(excluded)):
            raise GuardFailure(f"Category {category} contains duplicate excluded keys.")
        unknown = sorted(set(excluded) - all_keys)
        if unknown:
            raise GuardFailure(
                f"Category {category} excludes unknown keys: {', '.join(unknown)}"
            )


def normalise_changed_path(path: str) -> str:
    return path.strip().replace("\\", "/")


def changed_files(base_sha: str | None) -> list[str]:
    if not base_sha:
        return []

    base_sha = base_sha.strip()
    if not base_sha or set(base_sha) == {"0"}:
        return []

    try:
        output = run_git("diff", "--name-only", f"{base_sha}...HEAD")
    except GuardFailure:
        output = run_git("diff", "--name-only", f"{base_sha}..HEAD")

    return [normalise_changed_path(item) for item in output.splitlines() if item.strip()]


def is_path_allowed(path: str, exact: set[str], prefixes: Iterable[str]) -> bool:
    return path in exact or any(path.startswith(prefix) for prefix in prefixes)


def verify_seasonal_scope(files: list[str]) -> None:
    if not files:
        return

    seasonal_update = any(
        is_path_allowed(path, SEASONAL_ENTRY_PATHS, SEASONAL_ENTRY_PREFIXES)
        for path in files
    )
    if not seasonal_update:
        return

    unexpected = [
        path
        for path in files
        if not is_path_allowed(path, SEASONAL_ALLOWED_PATHS, SEASONAL_ALLOWED_PREFIXES)
    ]
    if unexpected:
        formatted = "\n".join(f"  - {path}" for path in unexpected)
        raise GuardFailure(
            "This PR changes the Live Hub and also changes files outside the safe hub area.\n"
            "Seasonal/live-hub releases must be isolated from test production work.\n"
            "Move these files to a separate skill/test PR:\n"
            f"{formatted}"
        )


def verify_index(contract: dict) -> None:
    if not INDEX_PATH.is_file():
        raise GuardFailure("Missing index.html")

    index = INDEX_PATH.read_text(encoding="utf-8")
    seasonal_link = '<link rel="stylesheet" href="./hub/seasonal-theme.css" />'
    if seasonal_link not in index:
        raise GuardFailure(
            "index.html must load ./hub/seasonal-theme.css so special-day styling stays isolated."
        )

    if 'href="./index.html#mock-tests"' in index or "location.hash='#mock-tests'" in index:
        raise GuardFailure(
            "The home/logo route must not restore #mock-tests; it should reload the top of index.html."
        )

    for category, config in contract["categories"].items():
        fragment = config["index_route_fragment"]
        count = index.count(fragment)
        if count != 1:
            raise GuardFailure(
                f"Canonical {category} route fragment must appear exactly once in index.html; "
                f"found {count}."
            )

    expected_availability = contract["index_availability_fragment"]
    count = index.count(expected_availability)
    if count != 1:
        raise GuardFailure(
            "Hub availability and live-hub-contract.json do not agree. "
            f"Expected the contract availability fragment exactly once; found {count}. "
            "Update index.html and the contract together in the validated activation PR."
        )


def verify_canonical_targets(contract: dict) -> dict[str, int]:
    books = contract["books"]
    tests = contract["tests"]
    counts: dict[str, int] = {}

    for category, config in contract["categories"].items():
        excluded = set(config.get("excluded", []))
        found = 0
        for book in books:
            for test in tests:
                key = f"{book}-{test}"
                if key in excluded:
                    continue
                relative = config["filesystem_template"].format(book=book, test=test)
                target = ROOT / relative
                if not target.is_file():
                    raise GuardFailure(
                        f"Hub advertises {category} {key}, but the canonical file is missing:\n"
                        f"  {relative}"
                    )
                found += 1
        counts[category] = found

    return counts


def git_blob_sha(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    return run_git("hash-object", "--", relative)


def refresh_fingerprints(contract: dict) -> None:
    for item in contract.get("protected_references", []):
        path = ROOT / item["path"]
        if not path.is_file():
            raise GuardFailure(f"Cannot fingerprint missing protected reference: {item['path']}")
        item["git_blob_sha"] = git_blob_sha(path)

    CONTRACT_PATH.write_text(
        json.dumps(contract, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {CONTRACT_PATH.relative_to(ROOT)}")


def verify_fingerprints(contract: dict) -> int:
    checked = 0
    for item in contract.get("protected_references", []):
        relative = item["path"]
        path = ROOT / relative
        if not path.is_file():
            raise GuardFailure(f"Protected reference is missing: {relative}")

        actual = git_blob_sha(path)
        expected = item["git_blob_sha"]
        if actual != expected:
            raise GuardFailure(
                "An approved reference implementation has changed:\n"
                f"  {relative}\n"
                f"  expected blob: {expected}\n"
                f"  current blob:  {actual}\n"
                "This may be a legitimate skill/test improvement, but it must be validated through "
                "the relevant Academic Reading, GT Reading, Listening, Writing or Speaking workflow "
                "before the approved fingerprint is changed. Do not approve it as part of an "
                "unrelated seasonal hub update."
            )
        checked += 1
    return checked


def verify_seasonal_css() -> None:
    if not SEASONAL_CSS_PATH.is_file():
        raise GuardFailure("Missing hub/seasonal-theme.css")
    css = SEASONAL_CSS_PATH.read_text(encoding="utf-8")
    disallowed = ("@import", "http://", "https://")
    found = [token for token in disallowed if token in css]
    if found:
        raise GuardFailure(
            "Seasonal CSS must be self-contained. Remove external imports/URLs: "
            + ", ".join(found)
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-sha",
        default=None,
        help="Base commit/ref used to enforce hub-only changed-file scope.",
    )
    parser.add_argument(
        "--refresh-fingerprints",
        action="store_true",
        help="Rewrite approved reference blob SHAs after a separately validated skill/test release.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        contract = load_contract()
        if args.refresh_fingerprints:
            refresh_fingerprints(contract)
            return 0

        files = changed_files(args.base_sha)
        verify_seasonal_scope(files)
        verify_index(contract)
        verify_seasonal_css()
        counts = verify_canonical_targets(contract)
        references = verify_fingerprints(contract)

        route_summary = ", ".join(f"{name}={count}" for name, count in counts.items())
        print("Live Hub guard passed.")
        print(f"Canonical routes checked: {route_summary}")
        print(f"Protected reference fingerprints checked: {references}")
        if files:
            print(f"Changed-file scope checked: {len(files)} file(s)")
        return 0
    except GuardFailure as exc:
        print(f"LIVE HUB GUARD FAILED\n{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
