from __future__ import annotations

import importlib.util
import unittest
from pathlib import PurePosixPath


ROOT = __import__("pathlib").Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "build_deploy_dist.py"
spec = importlib.util.spec_from_file_location("deploy_dist_builder", SCRIPT)
assert spec and spec.loader
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PortableDeployDistBuilderTests(unittest.TestCase):
    def test_dynamic_query_does_not_hide_static_local_path(self) -> None:
        self.assertEqual(
            builder.clean_ref("../general-writing-19/index.html?test=4&attempt=${Date.now()}"),
            "../general-writing-19/index.html",
        )

    def test_dynamic_path_interpolation_remains_blocked(self) -> None:
        self.assertIsNone(builder.clean_ref("../general-writing-${book}/index.html?test=4"))

    def test_current_shared_general_writing_runtimes_are_discovered(self) -> None:
        routes = builder.core.canonical_routes(builder.core.load_contract())
        approved = builder.core.writing_runtime_roots(routes)
        for expected in (
            PurePosixPath("drafts/general-writing-16-shared"),
            PurePosixPath("drafts/general-writing-17"),
            PurePosixPath("drafts/general-writing-18"),
            PurePosixPath("drafts/general-writing-19"),
        ):
            self.assertIn(expected, approved)


if __name__ == "__main__":
    unittest.main()
