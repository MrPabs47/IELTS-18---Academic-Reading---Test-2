#!/usr/bin/env python3
"""Build the curated public site and add a real Cloudflare Pages 404 page.

Cloudflare Pages treats a static site without a top-level 404.html as a
single-page application and serves index.html for unknown paths. This wrapper
keeps the existing least-privilege dist build unchanged, then adds one small,
non-indexable 404.html so unknown URLs return the Pages not-found response
instead of the Live Hub.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILDER = ROOT / "scripts" / "build_public_dist.py"
OUTPUT = ROOT / "dist"
NOT_FOUND = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Page not found</title>
</head>
<body>
  <main>
    <h1>Page not found</h1>
    <p>The page you requested is not available.</p>
    <p><a href="/">Return to the practice hub</a></p>
  </main>
</body>
</html>
"""


def main() -> int:
    result = subprocess.run([sys.executable, str(BUILDER)], cwd=ROOT, check=False)
    if result.returncode != 0:
        return result.returncode

    target = OUTPUT / "404.html"
    target.write_text(NOT_FOUND, encoding="utf-8", newline="\n")

    if not target.is_file():
        print("CLOUDFLARE PAGES BUILD FAILED: 404.html was not created", file=sys.stderr)
        return 1
    if "noindex,nofollow" not in target.read_text(encoding="utf-8"):
        print("CLOUDFLARE PAGES BUILD FAILED: 404.html is indexable", file=sys.stderr)
        return 1

    print("Cloudflare Pages 404 guard added: dist/404.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
