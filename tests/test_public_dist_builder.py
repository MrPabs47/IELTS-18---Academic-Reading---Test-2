from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "build_public_dist.py"
spec = importlib.util.spec_from_file_location("public_dist_builder", SCRIPT)
assert spec and spec.loader
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PublicDistBuilderSafetyTests(unittest.TestCase):
    def test_cloudflare_ceiling_is_exactly_25_mib(self) -> None:
        self.assertEqual(builder.MAX_FILE_BYTES, 25 * 1024 * 1024)

    def test_noindex_is_injected_without_mutating_page_body(self) -> None:
        source = "<!doctype html><html><head><title>X</title></head><body>OK</body></html>"
        rendered = builder.add_noindex(source, PurePosixPath("index.html"))
        self.assertIn('name="robots" content="noindex,nofollow"', rendered)
        self.assertIn("<body>OK</body>", rendered)

    def test_existing_restrictive_robots_tag_is_preserved(self) -> None:
        source = (
            '<html><head><meta name="robots" content="noindex,nofollow" />'
            "</head><body></body></html>"
        )
        rendered = builder.add_noindex(source, PurePosixPath("index.html"))
        self.assertEqual(rendered, source)

    def test_external_and_data_references_are_not_local_dependencies(self) -> None:
        for value in (
            "https://example.com/a.js",
            "//cdn.example.com/a.css",
            "data:image/png;base64,abc",
            "mailto:teacher@example.com",
            "#section-2",
        ):
            self.assertIsNone(builder.clean_ref(value), value)

    def test_relative_reference_normalises_inside_repo(self) -> None:
        resolved = builder.resolve_ref(
            PurePosixPath("academic/cambridge-18/test-1/test.html"),
            "../../../hub/seasonal-theme.css?v=1",
        )
        self.assertEqual(resolved, PurePosixPath("hub/seasonal-theme.css"))

    def test_blocked_source_areas_fail_closed(self) -> None:
        with self.assertRaises(builder.BuildFailure):
            builder.assert_publishable(PurePosixPath("scripts/build_public_dist.py"), set())
        with self.assertRaises(builder.BuildFailure):
            builder.assert_publishable(
                PurePosixPath(".github/workflows/public-dist-guard.yml"), set()
            )

    def test_unapproved_draft_directory_is_blocked(self) -> None:
        with self.assertRaises(builder.BuildFailure):
            builder.assert_publishable(
                PurePosixPath("drafts/internal-preview/index.html"), set()
            )

    def test_approved_writing_runtime_directory_is_allowed(self) -> None:
        approved = {PurePosixPath("drafts/writing-18-test-1")}
        builder.assert_publishable(
            PurePosixPath("drafts/writing-18-test-1/index.html"), approved
        )
        builder.assert_publishable(
            PurePosixPath("drafts/writing-18-test-1/writing-preview.js"), approved
        )

    def test_internal_source_extensions_are_not_publishable(self) -> None:
        for relative in (
            PurePosixPath("academic/cambridge-18/test-1/answers.txt"),
            PurePosixPath("hub/live-hub-contract.json"),
            PurePosixPath("notes.md"),
        ):
            with self.assertRaises(builder.BuildFailure):
                builder.assert_publishable(relative, set())

    def test_javascript_object_url_is_not_misread_as_css_dependency(self) -> None:
        source = "const objectUrl = URL.createObjectURL(await response.blob());"
        self.assertEqual(builder.references(source, ".html"), set())

    def test_javascript_static_fetch_and_url_dependencies_are_detected(self) -> None:
        source = '''
          fetch("diagram.avif?v=2");
          const worker = new URL('./worker.js', import.meta.url);
          import('./helper.js');
        '''
        self.assertEqual(
            builder.references(source, ".js"),
            {"diagram.avif?v=2", "./worker.js", "./helper.js"},
        )

    def test_canonical_writing_discovers_shared_runtime_without_opening_all_drafts(self) -> None:
        routes = builder.canonical_routes(builder.load_contract())
        approved = builder.writing_runtime_roots(routes)
        self.assertIn(PurePosixPath("drafts/general-writing-16-shared"), approved)
        self.assertNotIn(PurePosixPath("drafts"), approved)
        self.assertTrue(all(root.parts[0] == "drafts" and len(root.parts) > 1 for root in approved))

    def test_runtime_chunks_are_narrowly_scoped_to_approved_writing_roots(self) -> None:
        approved = {
            PurePosixPath("drafts/writing-19-test-3"),
            PurePosixPath("drafts/writing-19-test-4"),
        }
        accepted = (
            PurePosixPath("drafts/writing-19-test-3/ethanol-image.b64.0a"),
            PurePosixPath("drafts/writing-19-test-3/ethanol-image.b64.3d"),
            PurePosixPath("drafts/writing-19-test-4/dance-image.b64.0"),
            PurePosixPath("drafts/writing-19-test-4/dance-image.b64.4"),
        )
        for path in accepted:
            self.assertTrue(builder.is_runtime_chunk(path, approved), path)
            builder.assert_publishable(path, approved)

        rejected = (
            PurePosixPath("drafts/unapproved/ethanol-image.b64.0a"),
            PurePosixPath("ethanol-image.b64.0a"),
            PurePosixPath("drafts/writing-19-test-3/answers.b64"),
            PurePosixPath("drafts/writing-19-test-3/secret.data.0a"),
        )
        for path in rejected:
            self.assertFalse(builder.is_runtime_chunk(path, approved), path)
            with self.assertRaises(builder.BuildFailure, msg=str(path)):
                builder.assert_publishable(path, approved)

    def test_known_dynamic_chunk_literals_are_discovered_from_javascript(self) -> None:
        source = '''
          const PARTS = ["ethanol-image.b64.0a", 'ethanol-image.b64.1'];
          Promise.all(PARTS.map((path) => fetch(`${path}?v=1`)));
        '''
        self.assertEqual(
            builder.references(source, ".js"),
            {"ethanol-image.b64.0a", "ethanol-image.b64.1"},
        )

    def test_all_current_live_runtime_directories_have_classified_file_types(self) -> None:
        routes = builder.canonical_routes(builder.load_contract())
        drafts = builder.writing_runtime_roots(routes)
        checked: set[PurePosixPath] = set()

        for route in routes:
            if route.parent not in checked:
                builder.audit_runtime_directory(ROOT / route.parent, drafts)
                checked.add(route.parent)
        for shared in (
            PurePosixPath("academic/shared"),
            PurePosixPath("general-training/shared"),
            PurePosixPath("listening/shared"),
            PurePosixPath("hub"),
        ):
            builder.audit_runtime_directory(ROOT / shared, drafts)
        for draft in drafts:
            builder.audit_runtime_directory(ROOT / draft, drafts)

    def test_known_test3_and_test4_chunks_exist_in_live_runtime(self) -> None:
        expected = (
            "drafts/writing-19-test-3/ethanol-image.b64.0a",
            "drafts/writing-19-test-3/ethanol-image.b64.3d",
            "drafts/writing-19-test-4/dance-image.b64.0",
            "drafts/writing-19-test-4/dance-image.b64.4",
        )
        for relative in expected:
            self.assertTrue((ROOT / relative).is_file(), relative)


if __name__ == "__main__":
    unittest.main()
