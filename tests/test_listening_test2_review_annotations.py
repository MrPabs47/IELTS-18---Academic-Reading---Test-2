import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening/cambridge-16/test-2/IELTS16 Test 2 - Listening.html"


class ListeningTest2ReviewAnnotationsContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def test_one_defensive_submitted_snapshot_controls_review(self):
        self.assertIn("submittedResultSnapshot", self.html)
        self.assertIn("function captureSubmittedResultSnapshot", self.html)
        self.assertIn("Object.freeze", self.html)
        self.assertIn("answers:Object.freeze", self.html)
        self.assertIn("correctByQuestion:Object.freeze", self.html)
        self.assertIn("function showResultsSummary()", self.html)

    def test_result_overlay_has_one_close_and_reopens_without_rescoring(self):
        self.assertEqual(1, len(re.findall(r'id="resultsOverlay"', self.html)))
        self.assertEqual(1, len(re.findall(r'id="closeResultsBtn"', self.html)))
        show_results = self.html[self.html.index("function showResultsSummary()") :]
        self.assertNotIn("evaluateAll()", show_results.split("function ", 1)[0])
        self.assertIn("if(submitted) return showResultsSummary()", self.html)

    def test_submission_immediately_activates_locked_review(self):
        self.assertIn("function activateSubmittedReview()", self.html)
        self.assertIn("submittedReview=true", self.html)
        self.assertIn("Study Mode · Locked", self.html)
        self.assertIn("activateSubmittedReview()", self.html)

    def test_native_and_custom_controls_are_locked(self):
        self.assertIn("function isTestAnswerLocked()", self.html)
        self.assertIn("function setCustomDragLocked(locked)", self.html)
        self.assertIn("aria-disabled", self.html)
        self.assertRegex(self.html, r"function setDragAssignment\([^)]*\)\{ if\(isTestAnswerLocked\(\)\) return")
        self.assertRegex(self.html, r"function clearDragAssignment\([^)]*\)\{ if\(isTestAnswerLocked\(\)\) return")

    def test_snapshot_preserves_matching_and_unordered_choose_two(self):
        self.assertIn("dragAssignments", self.html)
        self.assertIn("getTwoAnswerSelection", self.html)
        self.assertIn(".sort()", self.html)
        self.assertIn("scoreTwoAnswerGroup('q19_20',[19,20])", self.html)

    def test_question_only_split_foundation_has_no_blank_script(self):
        self.assertIn('id="studyWorkspace"', self.html)
        self.assertIn('id="studyQuestionPane"', self.html)
        self.assertIn('id="studyAudioscriptPane"', self.html)
        self.assertIn('id="studyDivider"', self.html)
        self.assertIn('id="studyPaneSwapButton"', self.html)
        self.assertIn("function updateStudySplitLayout()", self.html)
        self.assertIn("hasCompleteTranscriptData=false", self.html)
        self.assertIn("study-audioscript-pane[hidden]", self.html)

    def test_annotation_ui_uses_accessible_reading_style_controls(self):
        self.assertIn('id="selectionToolbar" role="toolbar"', self.html)
        self.assertIn('id="noteEditor" role="dialog"', self.html)
        self.assertIn("note-anchor", self.html)
        self.assertIn("note-delete", self.html)
        self.assertIn("setAttribute('aria-label','Delete note')", self.html)
        self.assertIn("function openNoteEditor", self.html)

    def test_annotation_eligibility_excludes_all_answer_and_shell_controls(self):
        self.assertIn("function isAnnotationEligibleNode", self.html)
        for selector in ("input", "textarea", "select", "button", ".radio-option", ".checkbox-option", ".drag-choice", ".drag-slot", ".correct-answer"):
            self.assertIn(selector, self.html)

    def test_annotations_are_scoped_in_memory_and_overlap_safe(self):
        self.assertIn("annotationSequence", self.html)
        self.assertIn("function createHighlightFromSelection", self.html)
        self.assertIn("function removeAnnotation", self.html)
        self.assertIn("intersectsNode", self.html)
        self.assertNotRegex(self.html, r"(?:localStorage|sessionStorage).*(?:annotation|highlight|note)")

    def test_note_open_delete_and_keyboard_paths_are_isolated(self):
        self.assertIn("event.key==='Enter' || event.key===' '", self.html)
        self.assertIn("event.stopPropagation()", self.html)
        self.assertIn("function deleteNote", self.html)
        self.assertIn("function closeNoteEditor", self.html)

    def test_annotation_code_never_activates_question_marker(self):
        start = self.html.index("function isAnnotationEligibleNode")
        end = self.html.index("function setupAnnotationInteractions")
        annotation_code = self.html[start:end]
        self.assertNotIn("activateQuestionTarget", annotation_code)
        self.assertNotIn("activeQuestionNumber=", annotation_code)

    def test_mobile_and_desktop_annotation_layout_contracts_exist(self):
        self.assertIn(".note-editor.is-dragging", self.html)
        self.assertIn("@media (max-width: 760px)", self.html)
        self.assertIn(".study-divider", self.html)
        self.assertIn("display: none", self.html)


if __name__ == "__main__":
    unittest.main()
