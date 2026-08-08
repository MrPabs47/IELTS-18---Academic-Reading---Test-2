#!/usr/bin/env python3
"""Build a least-privilege static deployment for the IELTS Pabs Live Hub.

The source repository intentionally contains internal documentation, source
material, tests and workflow files alongside the student-facing application.
This builder creates ``dist/`` from an allow-listed runtime surface instead of
publishing the repository root.

Design goals:
- seed deployment routes from ``hub/live-hub-contract.json``;
- publish only canonical Live Hub/test entry points and runtime assets;
- follow active Writing redirects into their required ``drafts/`` runtime dirs;
- exclude source/docs/workflows/tests by default;
- add noindex/nofollow to the generated HTML without mutating source files;
- enforce Cloudflare Pages free-plan safety ceilings before deployment;
- fail closed when a public page references a local file we refuse to publish.

Run locally or as the Cloudflare Pages build command:
    python scripts/build_public_dist.py

Optional output directory:
    python scripts/build_public_dist.py --output /tmp/ielts-public
"""

from __future__ import annotations

import argparse
import html
import json
import os
import posixpath
import re
import shutil
import sys
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "hub" / "live-hub-contract.json"
DEFAULT_OUTPUT = ROOT / "dist"

# Cloudflare Pages documents this as 25 MiB per individual static asset.
MAX_FILE_BYTES = 25 * 1024 * 1024
MAX_OUTPUT_FILES = 20_000

PUBLIC_EXTENSIONS = {
    ".html",
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
    ".gif",
    ".ico",
    ".mp3",
    ".m4a",
    ".ogg",
    ".wav",
    ".webm",
    ".woff",
    ".woff2",
    ".webmanifest",
}
SUPPORT_EXTENSIONS = PUBLIC_EXTENSIONS - {".html"}
TEXT_EXTENSIONS = {".html", ".css", ".js", ".svg", ".webmanifest"}

BLOCKED_PATH_PARTS = {".git", ".github", "scripts", "tests", "dist"}
BLOCKED_BASENAMES = {
    "agents.md",
    "answers.txt",
    "questions.txt",
    "master-notes.md",
    "project_test_build_workflow.md",
    "question_type_layout_guide_listening.md",
    "question_type_layout_guide_reading.md",
    "reading-hub-structure.md",
}
FORBIDDEN_PUBLIC_TEXT = {
    "mrpabs47.github.io/IELTS-18---Academic-Reading---Test-2",
}
ROBOTS_META = '<meta name="robots" content="noindex,nofollow" />'
ROBOTS_TXT = "User-agent: *\nDisallow: /\n"

HTML_ATTR_RE = re.compile(
    r"(?:src|href|poster|action|data-src)\s*=\s*([\"'])(.*?)\1",
    re.IGNORECASE | re.DOTALL,
)
CSS_URL_RE = re.compile(r"url\(\s*([\"']?)(.*?)\1\s*\)", re.IGNORECASE | re.DOTALL)
LOCATION_RE = re.compile(
    r"(?:window\.)?location(?:\.href)?\s*=\s*([\"'`])([^\"'`]+)\1|"
    r"(?:window\.)?location\.replace\(\s*([\"'`])([^\"'`]+)\3\s*\)",
    re.IGNORECASE,
)
QUOTED_RUNTIME_RE = re.compile(
    r"[\"'`]([^\"'`]+\.(?:html|css|js|png|jpe?g|webp|svg|gif|ico|mp3|m4a|ogg|wav|webm|woff2?|webmanifest)(?:[?#][^\"'`]*)?)[\"'`]",
    re.IGNORECASE,
)
ROBOTS_META_RE = re.compile(
    r"<meta\b[^>]*\bname\s*=\s*([\"'])robots\1[^>]*>",
    re.IGNORECASE,
)
HEAD_OPEN_RE = re.compile(r"<head\b[^>]*>", re.IGNORECASE)


class BuildFailure(RuntimeError):
    """A deployment-blocking public-build error."""


def repo_relative(path: Path) -> PurePosixPath:
    try:
        return PurePosixPath(path.relative_to(ROOT).as_posix())
    except ValueError as exc:
        raise BuildFailure(f"Path escapes repository root: {path}") from exc


def load_contract() -> dict:
    if not CONTRACT_PATH.is_file():
        raise BuildFailure("Missing hub/live-hub-contract.json")
    try:
        contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise BuildFailure(f"Invalid Live Hub contract JSON: {exc}") from exc

    required = {"books", "tests", "categories"}
    missing = sorted(required - contract.keys())
    if missing:
        raise BuildFailure(f"Live Hub contract missing: {', '.join(missing)}")
    return contract


def canonical_routes(contract: dict) -> list[PurePosixPath]:
    routes: list[PurePosixPath] = []
    for category, config in contract["categories"].items():
        template = config.get("filesystem_template")
        if not isinstance(template, str):
            raise BuildFailure(f"Category {category} has no filesystem_template")
        excluded = set(config.get("excluded", []))
        for book in contract["books"]:
            for test in contract["tests"]:
                key = f"{book}-{test}"
                if key in excluded:
                    continue
                route = PurePosixPath(template.format(book=book, test=test))
                source = ROOT / Path(route.as_posix())
                if not source.is_file():
                    raise BuildFailure(
                        f"Live Hub advertises {category} {key}, but canonical file is missing: {route}"
                    )
                routes.append(route)
    return sorted(set(routes), key=str)


def path_is_within(relative: PurePosixPath, parent: PurePosixPath) -> bool:
    try:
        relative.relative_to(parent)
        return True
    except ValueError:
        return False


def assert_source_path_allowed(
    relative: PurePosixPath,
    approved_draft_roots: set[PurePosixPath],
) -> None:
    if relative.is_absolute() or ".." in relative.parts:
        raise BuildFailure(f"Unsafe public path: {relative}")
    if any(part.startswith(".") for part in relative.parts):
        raise BuildFailure(f"Hidden path cannot be published: {relative}")
    if any(part in BLOCKED_PATH_PARTS for part in relative.parts):
        raise BuildFailure(f"Blocked source area cannot be published: {relative}")
    if relative.name.lower() in BLOCKED_BASENAMES:
        raise BuildFailure(f"Internal source file cannot be published: {relative}")
    if relative.suffix.lower() not in PUBLIC_EXTENSIONS:
        raise BuildFailure(
            f"Unapproved runtime extension for public output: {relative.suffix or '(none)'} ({relative})"
        )
    if relative.parts and relative.parts[0] == "drafts":
        if not any(path_is_within(relative, root) for root in approved_draft_roots):
            raise BuildFailure(f"Unapproved drafts path cannot be published: {relative}")


def inject_noindex(source: str, relative: PurePosixPath) -> str:
    existing = ROBOTS_META_RE.findall(source)
    if existing:
        # Existing restrictive tags are retained. If a page has a robots tag that
        # does not contain both directives, add our deployment-only restrictive tag.
        tags = ROBOTS_META_RE.finditer(source)
        for match in tags:
            tag = match.group(0).lower()
            if "noindex" in tag and "nofollow" in tag:
                return source

    head = HEAD_OPEN_RE.search(source)
    if not head:
        raise BuildFailure(f"HTML page has no <head> for noindex injection: {relative}")
    return source[: head.end()] + "\n  " + ROBOTS_META + source[head.end() :]


def copy_runtime_file(
    relative: PurePosixPath,
    output: Path,
    approved_draft_roots: set[PurePosixPath],
) -> bool:
    assert_source_path_allowed(relative, approved_draft_roots)
    source = ROOT / Path(relative.as_posix())
    if not source.is_file():
        raise BuildFailure(f"Runtime source is missing: {relative}")
    if source.is_symlink():
        raise BuildFailure(f"Symlinks are not allowed in public output: {relative}")

    size = source.stat().st_size
    if size > MAX_FILE_BYTES:
        raise BuildFailure(
            f"Cloudflare file-size ceiling exceeded: {relative} is {size:,} bytes; "
            f"limit is {MAX_FILE_BYTES:,} bytes"
        )

    destination = output / Path(relative.as_posix())
    destination.parent.mkdir(parents=True, exist_ok=True)

    if relative.suffix.lower() == ".html":
        try:
            text = source.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            raise BuildFailure(f"HTML is not UTF-8: {relative}") from exc
        rendered = inject_noindex(text, relative)
        if destination.is_file() and destination.read_text(encoding="utf-8") == rendered:
            return False
        destination.write_text(rendered, encoding="utf-8", newline="\n")
    else:
        if destination.is_file() and destination.stat().st_size == size:
            # The build starts from a clean directory; this only avoids duplicate
            # copies when multiple canonical categories share a test directory.
            return False
        shutil.copy2(source, destination)
    return True


def copy_support_tree(
    source_dir: Path,
    output: Path,
    approved_draft_roots: set[PurePosixPath],
) -> None:
    if not source_dir.is_dir():
        return
    for path in source_dir.rglob("*"):
        if not path.is_file() or path.is_symlink():
            continue
        if path.suffix.lower() not in SUPPORT_EXTENSIONS:
            continue
        relative = repo_relative(path)
        copy_runtime_file(relative, output, approved_draft_roots)


def strip_reference(raw: str) -> str | None:
    raw = html.unescape(raw).strip()
    if not raw or raw.startswith("#") or "${" in raw:
        return None
    lowered = raw.lower()
    if lowered.startswith(("data:", "mailto:", "tel:", "javascript:", "blob:")):
        return None
    if raw.startswith("//"):
        return None
    parsed = urlsplit(raw)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path).strip()
    return path or None


def resolve_reference(from_relative: PurePosixPath, raw: str) -> PurePosixPath | None:
    clean = strip_reference(raw)
    if clean is None:
        return None

    if clean.startswith("/"):
        normalised = posixpath.normpath(clean.lstrip("/"))
    else:
        normalised = posixpath.normpath(str(from_relative.parent / clean))

    if normalised in {"", "."}:
        return None
    candidate = PurePosixPath(normalised)
    if candidate.is_absolute() or candidate.parts[:1] == ("..",) or ".." in candidate.parts:
        raise BuildFailure(f"Public reference escapes repository root: {from_relative} -> {raw}")
    return candidate


def extract_references(text: str, suffix: str) -> set[str]:
    references: set[str] = set()
    if suffix == ".html":
        references.update(match.group(2) for match in HTML_ATTR_RE.finditer(text))
    if suffix in {".html", ".css", ".svg"}:
        references.update(match.group(2) for match in CSS_URL_RE.finditer(text))
    if suffix in TEXT_EXTENSIONS:
        for match in LOCATION_RE.finditer(text):
            references.add(match.group(2) or match.group(4))
        references.update(match.group(1) for match in QUOTED_RUNTIME_RE.finditer(text))
    return {item for item in references if item}


def discover_writing_runtime_roots(
    routes: list[PurePosixPath],
) -> set[PurePosixPath]:
    approved: set[PurePosixPath] = set()
    pending = [route for route in routes if "Writing.html" in route.name]
    seen: set[PurePosixPath] = set()

    while pending:
        relative = pending.pop()
        if relative in seen:
            continue
        seen.add(relative)
        source = ROOT / Path(relative.as_posix())
        text = source.read_text(encoding="utf-8")
        for raw in extract_references(text, ".html"):
            target = resolve_reference(relative, raw)
            if target is None or not target.parts or target.parts[0] != "drafts":
                continue
            target_source = ROOT / Path(target.as_posix())
            if not target_source.is_file():
                raise BuildFailure(f"Writing redirect target is missing: {relative} -> {target}")
            root = target.parent
            approved.add(root)
            pending.append(target)

    return approved


def seed_public_surface(
    contract: dict,
    output: Path,
) -> tuple[list[PurePosixPath], set[PurePosixPath]]:
    routes = canonical_routes(contract)
    approved_drafts = discover_writing_runtime_roots(routes)

    # The only unconditional root page is the Live Hub.
    copy_runtime_file(PurePosixPath("index.html"), output, approved_drafts)

    # Hub styling/assets are public runtime support; contract/docs remain private.
    copy_support_tree(ROOT / "hub", output, approved_drafts)

    # Copy each canonical page exactly. Within its canonical test directory, copy
    # only non-HTML runtime assets. This avoids publishing stray preview HTML while
    # preserving sidecars, maps and audio that may be selected dynamically in JS.
    copied_test_dirs: set[PurePosixPath] = set()
    for route in routes:
        copy_runtime_file(route, output, approved_drafts)
        test_dir = route.parent
        if test_dir not in copied_test_dirs:
            copy_support_tree(ROOT / Path(test_dir.as_posix()), output, approved_drafts)
            copied_test_dirs.add(test_dir)

    # Shared engines are public runtime dependencies of canonical test pages.
    for shared in (
        PurePosixPath("academic/shared"),
        PurePosixPath("general-training/shared"),
        PurePosixPath("listening/shared"),
    ):
        copy_support_tree(ROOT / Path(shared.as_posix()), output, approved_drafts)

    # Active Writing implementations currently live below drafts/. Only the exact
    # directories reached by canonical Writing routes are approved for publishing.
    for draft_root in sorted(approved_drafts, key=str):
        source_dir = ROOT / Path(draft_root.as_posix())
        copy_support_tree(source_dir, output, approved_drafts)
        for name in ("start.html", "index.html"):
            candidate = draft_root / name
            if (ROOT / Path(candidate.as_posix())).is_file():
                copy_runtime_file(candidate, output, approved_drafts)

    return routes, approved_drafts


def close_local_dependencies(
    output: Path,
    approved_draft_roots: set[PurePosixPath],
) -> None:
    # Re-scan until stable because a newly copied HTML/CSS/JS file can introduce
    # another required local runtime dependency outside its seed directory.
    for _round in range(50):
        copied_any = False
        public_text_files = [
            path
            for path in output.rglob("*")
            if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS
        ]
        for built in public_text_files:
            relative = PurePosixPath(built.relative_to(output).as_posix())
            try:
                text = built.read_text(encoding="utf-8")
            except UnicodeDecodeError as exc:
                raise BuildFailure(f"Public text asset is not UTF-8: {relative}") from exc

            for raw in extract_references(text, relative.suffix.lower()):
                target = resolve_reference(relative, raw)
                if target is None:
                    continue
                source_target = ROOT / Path(target.as_posix())
                if source_target.is_dir():
                    index_target = target / "index.html"
                    if (ROOT / Path(index_target.as_posix())).is_file():
                        target = index_target
                        source_target = ROOT / Path(target.as_posix())
                    else:
                        continue
                if not source_target.exists():
                    # Ignore extensionless client-side routes, but fail on missing
                    # file-like URLs because those would become broken production assets.
                    if target.suffix:
                        raise BuildFailure(f"Missing local runtime dependency: {relative} -> {raw}")
                    continue
                if not source_target.is_file():
                    continue
                destination = output / Path(target.as_posix())
                if destination.is_file():
                    continue
                copy_runtime_file(target, output, approved_draft_roots)
                copied_any = True

        if not copied_any:
            return
    raise BuildFailure("Local dependency closure did not stabilise after 50 passes")


def validate_local_dependencies(output: Path) -> None:
    failures: list[str] = []
    for built in output.rglob("*"):
        if not built.is_file() or built.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        relative = PurePosixPath(built.relative_to(output).as_posix())
        text = built.read_text(encoding="utf-8")
        for raw in extract_references(text, relative.suffix.lower()):
            target = resolve_reference(relative, raw)
            if target is None:
                continue
            destination = output / Path(target.as_posix())
            if destination.is_dir():
                destination = destination / "index.html"
            if target.suffix and not destination.is_file():
                failures.append(f"{relative} -> {raw}")
    if failures:
        sample = "\n".join(f"  - {item}" for item in failures[:30])
        extra = "" if len(failures) <= 30 else f"\n  ... and {len(failures) - 30} more"
        raise BuildFailure(f"Broken local public dependencies:\n{sample}{extra}")


def validate_output(
    output: Path,
    routes: list[PurePosixPath],
    approved_draft_roots: set[PurePosixPath],
) -> tuple[int, int, PurePosixPath, int]:
    if not (output / "index.html").is_file():
        raise BuildFailure("Public build is missing index.html")
    for route in routes:
        if not (output / Path(route.as_posix())).is_file():
            raise BuildFailure(f"Public build is missing canonical route: {route}")

    robots = output / "robots.txt"
    if robots.read_text(encoding="utf-8") != ROBOTS_TXT:
        raise BuildFailure("robots.txt is missing or incorrect")

    files = [path for path in output.rglob("*") if path.is_file()]
    if len(files) > MAX_OUTPUT_FILES:
        raise BuildFailure(
            f"Cloudflare file-count ceiling exceeded: {len(files):,} > {MAX_OUTPUT_FILES:,}"
        )

    total_bytes = 0
    largest_path = PurePosixPath("index.html")
    largest_size = -1
    for path in files:
        relative = PurePosixPath(path.relative_to(output).as_posix())
        if path.is_symlink():
            raise BuildFailure(f"Symlink reached public output: {relative}")
        if relative.name != "robots.txt":
            assert_source_path_allowed(relative, approved_draft_roots)
        size = path.stat().st_size
        total_bytes += size
        if size > MAX_FILE_BYTES:
            raise BuildFailure(f"Public file exceeds size ceiling: {relative} ({size:,} bytes)")
        if size > largest_size:
            largest_path, largest_size = relative, size

        if relative.suffix.lower() == ".html":
            text = path.read_text(encoding="utf-8")
            tags = [match.group(0).lower() for match in ROBOTS_META_RE.finditer(text)]
            if not any("noindex" in tag and "nofollow" in tag for tag in tags):
                raise BuildFailure(f"Generated HTML lacks noindex,nofollow: {relative}")

        if relative.suffix.lower() in TEXT_EXTENSIONS:
            text_lower = path.read_text(encoding="utf-8").lower()
            for forbidden in FORBIDDEN_PUBLIC_TEXT:
                if forbidden.lower() in text_lower:
                    raise BuildFailure(f"Old GitHub Pages URL leaked into public output: {relative}")

    forbidden_outputs = [
        PurePosixPath("AGENTS.md"),
        PurePosixPath("Answers.txt"),
        PurePosixPath("Questions.txt"),
        PurePosixPath("hub/live-hub-contract.json"),
        PurePosixPath("PROJECT_TEST_BUILD_WORKFLOW.md"),
    ]
    for forbidden in forbidden_outputs:
        if (output / Path(forbidden.as_posix())).exists():
            raise BuildFailure(f"Internal file leaked into public output: {forbidden}")

    validate_local_dependencies(output)
    return len(files), total_bytes, largest_path, largest_size


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output directory (default: repository dist/)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output = args.output
    if not output.is_absolute():
        output = (ROOT / output).resolve()
    if output == ROOT:
        print("PUBLIC DIST BUILD FAILED\nRefusing to use repository root as output", file=sys.stderr)
        return 1

    try:
        if output.exists():
            if output.is_symlink():
                raise BuildFailure(f"Output directory cannot be a symlink: {output}")
            shutil.rmtree(output)
        output.mkdir(parents=True, exist_ok=True)

        contract = load_contract()
        routes, approved_drafts = seed_public_surface(contract, output)
        close_local_dependencies(output, approved_drafts)
        (output / "robots.txt").write_text(ROBOTS_TXT, encoding="utf-8", newline="\n")
        count, total, largest_path, largest_size = validate_output(
            output, routes, approved_drafts
        )

        print("Safe public dist build passed.")
        print(f"Canonical Live Hub routes: {len(routes)}")
        print(f"Approved Writing runtime directories: {len(approved_drafts)}")
        print(f"Public files: {count:,} / {MAX_OUTPUT_FILES:,}")
        print(f"Public size: {total / (1024 * 1024):.1f} MiB")
        print(
            f"Largest public file: {largest_path} "
            f"({largest_size / (1024 * 1024):.2f} MiB / 25.00 MiB)"
        )
        print(f"Output: {output}")
        return 0
    except BuildFailure as exc:
        print(f"PUBLIC DIST BUILD FAILED\n{exc}", file=sys.stderr)
        return 1
    except OSError as exc:
        print(f"PUBLIC DIST BUILD FAILED\n{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
