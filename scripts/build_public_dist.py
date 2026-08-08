#!/usr/bin/env python3
"""Build a least-privilege static deployment in dist/.

The repository contains both student-facing runtime files and private working
material. This script publishes from the Live Hub contract, not from the repo
root. It is intentionally fail-closed: an unexpected local dependency, source
area, file type, oversized asset or missing route stops the build.
"""

from __future__ import annotations

import argparse
import html
import json
import posixpath
import re
import shutil
import sys
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "hub" / "live-hub-contract.json"
DEFAULT_OUTPUT = ROOT / "dist"
MAX_FILE_BYTES = 25 * 1024 * 1024
MAX_OUTPUT_FILES = 20_000

PUBLIC_EXTENSIONS = {
    ".html", ".css", ".js",
    ".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif", ".ico",
    ".mp3", ".m4a", ".aac", ".ogg", ".wav", ".webm", ".mp4",
    ".woff", ".woff2", ".webmanifest",
}
SUPPORT_EXTENSIONS = PUBLIC_EXTENSIONS - {".html"}
TEXT_EXTENSIONS = {".html", ".css", ".js", ".svg", ".webmanifest"}
DEPENDENCY_TEXT_EXTENSIONS = {".html", ".css", ".js", ".svg"}
REVIEW_REQUIRED_EXTENSIONS = {".json", ".wasm", ".xml", ".vtt", ".srt", ".ttf", ".otf", ".csv"}
REVIEW_EXEMPT_PATHS = {PurePosixPath("hub/live-hub-contract.json")}
PRIVATE_SOURCE_EXTENSIONS = {
    ".md", ".txt", ".py", ".pyc", ".yml", ".yaml", ".toml", ".ini", ".lock", ".log",
    ".ps1", ".bat", ".cmd", ".sh",
}

BLOCKED_PARTS = {".git", ".github", "scripts", "tests", "dist"}
BLOCKED_NAMES = {
    "agents.md", "answers.txt", "questions.txt", "master-notes.md",
    "project_test_build_workflow.md", "question_type_layout_guide_listening.md",
    "question_type_layout_guide_reading.md", "reading-hub-structure.md",
}
OLD_PUBLIC_MARKERS = {
    "mrpabs47.github.io/ielts-18---academic-reading---test-2",
}
ROBOTS_META = '<meta name="robots" content="noindex,nofollow" />'
ROBOTS_TXT = "User-agent: *\nDisallow: /\n"

# Some approved Writing runtimes reconstruct high-resolution AVIF images from
# co-located base64 chunks. These are runtime assets, but their final suffixes
# are chunk IDs such as .0a rather than ordinary image extensions. They are
# publishable only inside a canonical Writing draft runtime discovered from the
# Live Hub contract, never globally.
RUNTIME_CHUNK_RE = re.compile(r"^.+\.b64\.[A-Za-z0-9]+$")

HTML_ATTR_RE = re.compile(
    r"(?:src|href|poster|action|data-src)\s*=\s*([\"'])(.*?)\1",
    re.IGNORECASE | re.DOTALL,
)
# Avoid matching JavaScript names such as createObjectURL(...). Genuine CSS
# url(...) calls are not immediately preceded by an identifier character.
CSS_URL_RE = re.compile(
    r"(?<![A-Za-z0-9_-])url\(\s*([\"']?)(.*?)\1\s*\)",
    re.IGNORECASE | re.DOTALL,
)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?\s*([\"'])(.*?)\1", re.IGNORECASE)
LOCATION_RE = re.compile(
    r"(?:window\.)?location\.replace\(\s*([\"'`])([^\"'`]+)\1\s*\)|"
    r"(?:window\.)?location\.href\s*=\s*([\"'`])([^\"'`]+)\3|"
    r"(?:window\.)?location\s*=\s*([\"'`])([^\"'`]+)\5",
    re.IGNORECASE,
)
JS_FETCH_RE = re.compile(r"\bfetch\s*\(\s*([\"'`])([^\"'`$]+)\1", re.IGNORECASE)
JS_NEW_URL_RE = re.compile(
    r"\bnew\s+URL\s*\(\s*([\"'`])([^\"'`$]+)\1\s*,\s*import\.meta\.url",
    re.IGNORECASE,
)
JS_IMPORT_RE = re.compile(r"\bimport\s*\(\s*([\"'`])([^\"'`$]+)\1", re.IGNORECASE)
JS_RUNTIME_CHUNK_LITERAL_RE = re.compile(
    r"([\"'`])([^\"'`\n]+\.b64\.[A-Za-z0-9]+)\1",
    re.IGNORECASE,
)
ROBOTS_TAG_RE = re.compile(
    r"<meta\b[^>]*\bname\s*=\s*([\"'])robots\1[^>]*>", re.IGNORECASE
)
HEAD_RE = re.compile(r"<head\b[^>]*>", re.IGNORECASE)


class BuildFailure(RuntimeError):
    pass


def rel(path: Path) -> PurePosixPath:
    try:
        return PurePosixPath(path.relative_to(ROOT).as_posix())
    except ValueError as exc:
        raise BuildFailure(f"Path escapes repository root: {path}") from exc


def within(path: PurePosixPath, parent: PurePosixPath) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def is_runtime_chunk(path: PurePosixPath, draft_roots: set[PurePosixPath]) -> bool:
    return bool(RUNTIME_CHUNK_RE.fullmatch(path.name)) and any(
        within(path, root) for root in draft_roots
    )


def has_publishable_type(path: PurePosixPath, draft_roots: set[PurePosixPath]) -> bool:
    return path.suffix.lower() in PUBLIC_EXTENSIONS or is_runtime_chunk(path, draft_roots)


def is_known_private_source(path: PurePosixPath) -> bool:
    return path.name.lower() in BLOCKED_NAMES or path.suffix.lower() in PRIVATE_SOURCE_EXTENSIONS


def load_contract() -> dict:
    if not CONTRACT.is_file():
        raise BuildFailure("Missing hub/live-hub-contract.json")
    try:
        data = json.loads(CONTRACT.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise BuildFailure(f"Invalid Live Hub contract: {exc}") from exc
    for key in ("books", "tests", "categories"):
        if key not in data:
            raise BuildFailure(f"Live Hub contract is missing {key}")
    return data


def canonical_routes(contract: dict) -> list[PurePosixPath]:
    routes: set[PurePosixPath] = set()
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
                if not (ROOT / Path(route.as_posix())).is_file():
                    raise BuildFailure(f"Advertised route is missing: {category} {key}: {route}")
                routes.add(route)
    return sorted(routes, key=str)


def assert_publishable(path: PurePosixPath, draft_roots: set[PurePosixPath]) -> None:
    if path.is_absolute() or ".." in path.parts:
        raise BuildFailure(f"Unsafe public path: {path}")
    if any(part.startswith(".") for part in path.parts):
        raise BuildFailure(f"Hidden path cannot be published: {path}")
    if any(part in BLOCKED_PARTS for part in path.parts):
        raise BuildFailure(f"Blocked source area cannot be published: {path}")
    if path.name.lower() in BLOCKED_NAMES:
        raise BuildFailure(f"Internal source file cannot be published: {path}")
    if not has_publishable_type(path, draft_roots):
        raise BuildFailure(f"Unapproved public file type: {path}")
    if path.parts and path.parts[0] == "drafts":
        if not any(within(path, root) for root in draft_roots):
            raise BuildFailure(f"Unapproved drafts path cannot be published: {path}")


def add_noindex(text: str, path: PurePosixPath) -> str:
    for match in ROBOTS_TAG_RE.finditer(text):
        tag = match.group(0).lower()
        if "noindex" in tag and "nofollow" in tag:
            return text
    head = HEAD_RE.search(text)
    if not head:
        raise BuildFailure(f"HTML page has no <head>: {path}")
    return text[:head.end()] + "\n  " + ROBOTS_META + text[head.end():]


def copy_file(path: PurePosixPath, output: Path, draft_roots: set[PurePosixPath]) -> bool:
    assert_publishable(path, draft_roots)
    source = ROOT / Path(path.as_posix())
    if not source.is_file():
        raise BuildFailure(f"Runtime source is missing: {path}")
    if source.is_symlink():
        raise BuildFailure(f"Symlink cannot enter public output: {path}")
    size = source.stat().st_size
    if size > MAX_FILE_BYTES:
        raise BuildFailure(
            f"25 MiB file ceiling exceeded: {path} is {size:,} bytes; limit {MAX_FILE_BYTES:,}"
        )

    target = output / Path(path.as_posix())
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        return False
    if path.suffix.lower() == ".html":
        try:
            rendered = add_noindex(source.read_text(encoding="utf-8"), path)
        except UnicodeDecodeError as exc:
            raise BuildFailure(f"HTML is not UTF-8: {path}") from exc
        target.write_text(rendered, encoding="utf-8", newline="\n")
    else:
        shutil.copy2(source, target)
    return True


def audit_runtime_directory(source_dir: Path, draft_roots: set[PurePosixPath]) -> None:
    """Classify every file in a directory that can feed the public runtime.

    Ordinary browser assets are publishable. Known source/documentation formats
    are explicitly private. Ambiguous data formats and every unknown file type
    fail the build so a future test cannot silently lose a runtime dependency.
    """
    if not source_dir.is_dir():
        return

    review_required: list[PurePosixPath] = []
    unknown: list[PurePosixPath] = []
    for path in source_dir.rglob("*"):
        if not path.is_file():
            continue
        relative = rel(path)
        if path.is_symlink():
            unknown.append(relative)
            continue
        if relative in REVIEW_EXEMPT_PATHS or is_known_private_source(relative):
            continue
        if relative.suffix.lower() in REVIEW_REQUIRED_EXTENSIONS:
            review_required.append(relative)
            continue
        if has_publishable_type(relative, draft_roots):
            continue
        unknown.append(relative)

    if review_required:
        sample = "\n".join(f"  - {item}" for item in sorted(review_required, key=str)[:20])
        extra = "" if len(review_required) <= 20 else f"\n  ... and {len(review_required)-20} more"
        raise BuildFailure(
            "A canonical runtime directory contains data/file types that require explicit review "
            "before publication:\n" + sample + extra
        )
    if unknown:
        sample = "\n".join(f"  - {item}" for item in sorted(unknown, key=str)[:20])
        extra = "" if len(unknown) <= 20 else f"\n  ... and {len(unknown)-20} more"
        raise BuildFailure(
            "A canonical runtime directory contains unclassified files. Review each file and "
            "either add a narrow public rule or classify it as private:\n" + sample + extra
        )


def copy_support(source_dir: Path, output: Path, draft_roots: set[PurePosixPath]) -> None:
    if not source_dir.is_dir():
        return
    audit_runtime_directory(source_dir, draft_roots)
    for source in source_dir.rglob("*"):
        if not source.is_file() or source.is_symlink():
            continue
        relative = rel(source)
        if relative.suffix.lower() in SUPPORT_EXTENSIONS or is_runtime_chunk(relative, draft_roots):
            copy_file(relative, output, draft_roots)


def clean_ref(raw: str) -> str | None:
    raw = html.unescape(raw).strip()
    if not raw or raw.startswith("#") or "${" in raw:
        return None
    lower = raw.lower()
    if lower.startswith(("data:", "mailto:", "tel:", "javascript:", "blob:")) or raw.startswith("//"):
        return None
    parsed = urlsplit(raw)
    if parsed.scheme or parsed.netloc:
        return None
    value = unquote(parsed.path).strip()
    return value or None


def resolve_ref(from_path: PurePosixPath, raw: str) -> PurePosixPath | None:
    value = clean_ref(raw)
    if value is None:
        return None
    if value.startswith("/"):
        normal = posixpath.normpath(value.lstrip("/"))
    else:
        normal = posixpath.normpath(str(from_path.parent / value))
    if normal in {"", "."}:
        return PurePosixPath("index.html")
    candidate = PurePosixPath(normal)
    if candidate.is_absolute() or candidate.parts[:1] == ("..",) or ".." in candidate.parts:
        raise BuildFailure(f"Reference escapes repository root: {from_path} -> {raw}")
    return candidate


def references(text: str, suffix: str) -> set[str]:
    found: set[str] = set()
    if suffix == ".html":
        found.update(match.group(2) for match in HTML_ATTR_RE.finditer(text))
        for match in LOCATION_RE.finditer(text):
            found.add(match.group(2) or match.group(4) or match.group(6))
    if suffix in {".html", ".css", ".svg"}:
        found.update(match.group(2) for match in CSS_URL_RE.finditer(text))
    if suffix == ".css":
        found.update(match.group(2) for match in CSS_IMPORT_RE.finditer(text))
    if suffix == ".js":
        found.update(match.group(2) for match in JS_FETCH_RE.finditer(text))
        found.update(match.group(2) for match in JS_NEW_URL_RE.finditer(text))
        found.update(match.group(2) for match in JS_IMPORT_RE.finditer(text))
        found.update(match.group(2) for match in JS_RUNTIME_CHUNK_LITERAL_RE.finditer(text))
    return {item for item in found if item}


def writing_runtime_roots(routes: list[PurePosixPath]) -> set[PurePosixPath]:
    """Discover draft runtimes only by following canonical Writing entry points."""
    approved: set[PurePosixPath] = set()
    pending: list[PurePosixPath] = [route for route in routes if "Writing.html" in route.name]
    seen: set[PurePosixPath] = set()

    while pending:
        current = pending.pop()
        if current in seen:
            continue
        seen.add(current)
        source = ROOT / Path(current.as_posix())
        if not source.is_file() or current.suffix.lower() not in {".html", ".css", ".svg"}:
            continue
        try:
            text = source.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            raise BuildFailure(f"Writing runtime text is not UTF-8: {current}") from exc

        for raw in references(text, current.suffix.lower()):
            target = resolve_ref(current, raw)
            if target is None or not target.parts or target.parts[0] != "drafts":
                continue
            target_source = ROOT / Path(target.as_posix())
            if target_source.is_dir():
                target = target / "index.html"
                target_source = ROOT / Path(target.as_posix())
            if not target_source.is_file():
                if target.suffix:
                    raise BuildFailure(f"Writing runtime target is missing: {current} -> {target}")
                continue

            root = target.parent
            if root not in approved:
                approved.add(root)
                for name in ("start.html", "index.html"):
                    page = root / name
                    if (ROOT / Path(page.as_posix())).is_file():
                        pending.append(page)
            if target.suffix.lower() in {".html", ".css", ".svg"}:
                pending.append(target)

    return approved


def seed(contract: dict, output: Path) -> tuple[list[PurePosixPath], set[PurePosixPath]]:
    routes = canonical_routes(contract)
    drafts = writing_runtime_roots(routes)

    copy_file(PurePosixPath("index.html"), output, drafts)
    copy_support(ROOT / "hub", output, drafts)

    copied_dirs: set[PurePosixPath] = set()
    for route in routes:
        copy_file(route, output, drafts)
        if route.parent not in copied_dirs:
            copy_support(ROOT / Path(route.parent.as_posix()), output, drafts)
            copied_dirs.add(route.parent)

    for shared in ("academic/shared", "general-training/shared", "listening/shared"):
        copy_support(ROOT / shared, output, drafts)

    for draft in sorted(drafts, key=str):
        source_dir = ROOT / Path(draft.as_posix())
        copy_support(source_dir, output, drafts)
        for name in ("start.html", "index.html"):
            page = draft / name
            if (ROOT / Path(page.as_posix())).is_file():
                copy_file(page, output, drafts)

    return routes, drafts


def dependency_closure(output: Path, drafts: set[PurePosixPath]) -> None:
    for _ in range(30):
        added = False
        text_files = [
            path for path in output.rglob("*")
            if path.is_file() and path.suffix.lower() in DEPENDENCY_TEXT_EXTENSIONS
        ]
        for built in text_files:
            source_rel = PurePosixPath(built.relative_to(output).as_posix())
            text = built.read_text(encoding="utf-8")
            for raw in references(text, source_rel.suffix.lower()):
                target_rel = resolve_ref(source_rel, raw)
                if target_rel is None:
                    continue
                source = ROOT / Path(target_rel.as_posix())
                if source.is_dir():
                    target_rel = target_rel / "index.html"
                    source = ROOT / Path(target_rel.as_posix())
                if not source.exists():
                    if target_rel.suffix:
                        raise BuildFailure(f"Missing local dependency: {source_rel} -> {raw}")
                    continue
                if not source.is_file():
                    continue
                if not has_publishable_type(target_rel, drafts):
                    raise BuildFailure(
                        f"Public page references an unapproved file type: {source_rel} -> {target_rel}"
                    )
                if copy_file(target_rel, output, drafts):
                    added = True
        if not added:
            return
    raise BuildFailure("Dependency closure did not stabilise")


def validate_dependencies(output: Path, drafts: set[PurePosixPath]) -> None:
    broken: list[str] = []
    for built in output.rglob("*"):
        if not built.is_file() or built.suffix.lower() not in DEPENDENCY_TEXT_EXTENSIONS:
            continue
        source_rel = PurePosixPath(built.relative_to(output).as_posix())
        text = built.read_text(encoding="utf-8")
        for raw in references(text, source_rel.suffix.lower()):
            target_rel = resolve_ref(source_rel, raw)
            if target_rel is None:
                continue
            target = output / Path(target_rel.as_posix())
            if target.is_dir():
                target = target / "index.html"
            if has_publishable_type(target_rel, drafts) and not target.is_file():
                broken.append(f"{source_rel} -> {raw}")
    if broken:
        sample = "\n".join(f"  - {item}" for item in broken[:30])
        extra = "" if len(broken) <= 30 else f"\n  ... and {len(broken)-30} more"
        raise BuildFailure("Broken public dependencies:\n" + sample + extra)


def validate(output: Path, routes: list[PurePosixPath], drafts: set[PurePosixPath]) -> tuple[int, int, PurePosixPath, int, int]:
    for required in [PurePosixPath("index.html"), *routes]:
        if not (output / Path(required.as_posix())).is_file():
            raise BuildFailure(f"Required public route is missing: {required}")

    robots = output / "robots.txt"
    if not robots.is_file() or robots.read_text(encoding="utf-8") != ROBOTS_TXT:
        raise BuildFailure("robots.txt is missing or incorrect")

    forbidden = (
        "AGENTS.md", "Answers.txt", "Questions.txt", "PROJECT_TEST_BUILD_WORKFLOW.md",
        "hub/live-hub-contract.json", ".github", "scripts", "tests",
    )
    for item in forbidden:
        if (output / item).exists():
            raise BuildFailure(f"Internal source leaked into public output: {item}")

    files = [path for path in output.rglob("*") if path.is_file()]
    if len(files) > MAX_OUTPUT_FILES:
        raise BuildFailure(f"File-count ceiling exceeded: {len(files):,} > {MAX_OUTPUT_FILES:,}")

    total = 0
    runtime_chunks = 0
    largest = PurePosixPath("index.html")
    largest_size = -1
    for path in files:
        public_rel = PurePosixPath(path.relative_to(output).as_posix())
        if public_rel.name != "robots.txt":
            assert_publishable(public_rel, drafts)
        if is_runtime_chunk(public_rel, drafts):
            runtime_chunks += 1
        size = path.stat().st_size
        total += size
        if size > MAX_FILE_BYTES:
            raise BuildFailure(f"25 MiB file ceiling exceeded in output: {public_rel}")
        if size > largest_size:
            largest, largest_size = public_rel, size

        if public_rel.suffix.lower() == ".html":
            text = path.read_text(encoding="utf-8")
            tags = [match.group(0).lower() for match in ROBOTS_TAG_RE.finditer(text)]
            if not any("noindex" in tag and "nofollow" in tag for tag in tags):
                raise BuildFailure(f"Generated HTML lacks noindex,nofollow: {public_rel}")
        if public_rel.suffix.lower() in TEXT_EXTENSIONS:
            lower = path.read_text(encoding="utf-8").lower()
            if any(marker in lower for marker in OLD_PUBLIC_MARKERS):
                raise BuildFailure(f"Old GitHub Pages address leaked into public output: {public_rel}")

    validate_dependencies(output, drafts)
    return len(files), total, largest, largest_size, runtime_chunks


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output = args.output if args.output.is_absolute() else (ROOT / args.output).resolve()
    filesystem_root = Path(output.anchor) if output.anchor else None
    if output == ROOT or (filesystem_root is not None and output == filesystem_root):
        print("PUBLIC DIST BUILD FAILED\nRefusing unsafe output directory", file=sys.stderr)
        return 1

    try:
        if output.exists():
            if output.is_symlink():
                raise BuildFailure(f"Output cannot be a symlink: {output}")
            shutil.rmtree(output)
        output.mkdir(parents=True, exist_ok=True)

        contract = load_contract()
        routes, drafts = seed(contract, output)
        dependency_closure(output, drafts)
        (output / "robots.txt").write_text(ROBOTS_TXT, encoding="utf-8", newline="\n")
        count, total, largest, largest_size, runtime_chunks = validate(output, routes, drafts)

        print("Safe public dist build passed.")
        print(f"Canonical routes: {len(routes)}")
        print(f"Approved Writing runtime directories: {len(drafts)}")
        print(f"Dynamic runtime chunks: {runtime_chunks}")
        print("Unclassified runtime files: 0")
        print(f"Public files: {count:,} / {MAX_OUTPUT_FILES:,}")
        print(f"Public size: {total / (1024 * 1024):.1f} MiB")
        print(
            f"Largest file: {largest} "
            f"({largest_size / (1024 * 1024):.2f} MiB / 25.00 MiB)"
        )
        print(f"Output: {output}")
        return 0
    except (BuildFailure, OSError, UnicodeDecodeError) as exc:
        print(f"PUBLIC DIST BUILD FAILED\n{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
