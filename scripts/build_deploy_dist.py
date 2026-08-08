#!/usr/bin/env python3
"""Build the portable least-privilege deployment used by public hosts.

This wrapper keeps the core public-dist policy in build_public_dist.py, while
normalising browser URLs that have a static path and a dynamic query string
(e.g. ?attempt=${Date.now()}). That matters for shared Writing runtimes whose
start pages redirect to a stable local file with cache-busting/query state.
Dynamic path interpolation remains blocked.
"""

from __future__ import annotations

import html
import importlib.util
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CORE_SCRIPT = ROOT / "scripts" / "build_public_dist.py"

spec = importlib.util.spec_from_file_location("public_dist_core", CORE_SCRIPT)
if spec is None or spec.loader is None:
    raise RuntimeError("Unable to load scripts/build_public_dist.py")
core = importlib.util.module_from_spec(spec)
spec.loader.exec_module(core)


def clean_ref(raw: str) -> str | None:
    """Return a static local path while ignoring query-only interpolation.

    A URL such as ../general-writing-19/index.html?attempt=${Date.now()} has a
    fully static file path and is safe to include in the deployment graph. A
    URL whose *path* itself contains ${...} remains dynamic and is ignored so
    the build stays fail-closed rather than guessing a public path.
    """
    raw = html.unescape(raw).strip()
    if not raw or raw.startswith("#"):
        return None

    lower = raw.lower()
    if lower.startswith(("data:", "mailto:", "tel:", "javascript:", "blob:")) or raw.startswith("//"):
        return None

    parsed = urlsplit(raw)
    if parsed.scheme or parsed.netloc:
        return None

    value = unquote(parsed.path).strip()
    if not value or "${" in value:
        return None
    return value


# All core discovery/closure functions resolve this global at call time, so a
# single narrow override fixes runtime discovery without weakening its other
# allowlists, blocked paths, file ceilings or validation checks.
core.clean_ref = clean_ref


def main() -> int:
    return core.main()


if __name__ == "__main__":
    raise SystemExit(main())
