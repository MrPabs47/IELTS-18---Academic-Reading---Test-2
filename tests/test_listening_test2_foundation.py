import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening/cambridge-16/test-2/IELTS16 Test 2 - Listening.html"


class ListeningTest2FoundationContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def test_identity_and_exact_seven_task_groups_remain(self):
        self.assertIn("IELTS 16 - Listening Test 2", self.html)
        for group in ("1-10", "11-15", "16-18", "19-20", "21-24", "25-30", "31-40"):
            self.assertRegex(self.html, rf"['\"]{group}['\"]")
        self.assertIn("ONE WORD AND/OR A NUMBER", self.html)
        self.assertIn("Each option can be used once only", self.html)
        self.assertIn("Choose <strong>TWO</strong> letters", self.html)

    def test_all_questions_have_one_authoritative_answer_shape(self):
        for question in list(range(1, 19)) + list(range(21, 41)):
            self.assertRegex(self.html, rf'name="q{question}"')
        self.assertEqual(5, len(re.findall(r'<input[^>]+name="q19_20"', self.html)))
        self.assertNotRegex(self.html, r'name="q(?:0|4[1-9]|[5-9]\d)"')

    def test_study_header_order_and_locked_state_are_present(self):
        score = self.html.index('id="scoreGuideBtn"')
        answer_key = self.html.index('id="answerKeyBtn"')
        pill = self.html.index('id="listeningStudyPill"')
        self.assertLess(score, answer_key)
        self.assertLess(answer_key, pill)
        self.assertIn("Study Mode · Locked", self.html)
        self.assertIn("function updateStudyModeHeader()", self.html)

    def test_score_guide_and_answer_key_are_neutral_accessible_dialogs(self):
        self.assertIn('id="scoreGuideDialog" role="dialog" aria-modal="true"', self.html)
        self.assertIn('id="answerKeyDialog" role="dialog" aria-modal="true"', self.html)
        self.assertIn("function renderAnswerKey()", self.html)
        self.assertIn("for(let q=1;q<=40;q+=1)", self.html)
        self.assertIn("function closeStudyDialog", self.html)
        self.assertIn("event.key==='Escape'", self.html)

    def test_candidate_timer_integrity_and_leave_lifecycle_are_attempt_scoped(self):
        self.assertIn("let attemptStarted = false", self.html)
        self.assertIn("function beginTimedTest()", self.html)
        self.assertIn("function pauseTestTimer()", self.html)
        self.assertIn("function resumeTestTimer()", self.html)
        self.assertIn("focusLosses", self.html)
        self.assertRegex(self.html, r"beforeunload'.*?if\(!attemptStarted \|\| submitted\) return", re.DOTALL)

    def test_one_primary_submit_wrapper_and_duplicate_guard(self):
        self.assertIn("function handlePrimarySubmit()", self.html)
        self.assertIn("function confirmSubmit()", self.html)
        self.assertIn("if(submissionInProgress || submitted)", self.html)
        self.assertEqual(2, len(re.findall(r"addEventListener\('click', handlePrimarySubmit\)", self.html)))
        self.assertNotIn("addEventListener('click', handleSubmit)", self.html)

    def test_exact_navigation_contract_covers_every_test2_shape(self):
        self.assertIn("function getExactQuestionTarget(q)", self.html)
        self.assertIn("function activateQuestionTarget(q", self.html)
        self.assertIn("data-active-question", self.html)
        self.assertIn("q===19 || q===20", self.html)
        self.assertIn(".drag-question-row", self.html)
        self.assertIn("focusin", self.html)

    def test_active_test_hides_learning_shell(self):
        self.assertIn("function updateStudyModeHeader()", self.html)
        self.assertIn("mode==='study' || submittedReview", self.html)
        self.assertIn("listeningStudyHeader.hidden", self.html)

    def test_responsive_chrome_uses_measured_header_and_audio_offsets(self):
        for custom_property in ("--app-header-h", "--app-audio-h"):
            self.assertIn(custom_property, self.html)
        self.assertIn("function updateResponsiveChromeOffsets()", self.html)
        self.assertIn("topBar.getBoundingClientRect().height", self.html)
        self.assertIn("audioBar.getBoundingClientRect().height", self.html)
        self.assertIn("layoutObserver.observe(topBar)", self.html)
        self.assertIn("layoutObserver.observe(audioBar)", self.html)
        self.assertIn("padding-top: calc(var(--app-header-h) + 14px)", self.html)
        self.assertIn("top: calc(var(--app-header-h) + 4px)", self.html)
        self.assertIn(
            "scroll-margin-top: calc(var(--app-header-h) + var(--app-audio-h) + 20px)",
            self.html,
        )
        responsive_start = self.html.index("function updateResponsiveChromeOffsets()")
        responsive_end = self.html.index("function setupResponsiveChromeOffsets()", responsive_start)
        self.assertNotIn(".play(", self.html[responsive_start:responsive_end])

    def test_mobile_header_controls_and_footer_chips_are_contained(self):
        self.assertIn("/* Test 2 mobile chrome containment. */", self.html)
        mobile_start = self.html.index("/* Test 2 mobile chrome containment. */")
        mobile = self.html[mobile_start : self.html.index("</style>", mobile_start)]
        self.assertIn("@media (max-width: 760px)", mobile)
        self.assertIn("white-space: normal", mobile)
        self.assertIn("overflow-wrap: anywhere", mobile)
        self.assertIn(".footer-main[data-active-section=", mobile)
        self.assertIn("overflow-x: auto", mobile)
        self.assertIn("flex: 0 0 auto", mobile)
        self.assertIn("min-width: max-content", mobile)
        self.assertIn("overflow: visible", mobile)
        self.assertNotIn(".audio-bar.visible { top: 0; }", mobile)

    def test_pass2_content_is_not_fabricated(self):
        self.assertNotIn("relatedQuestions", self.html)
        self.assertNotIn("questionFeedback", self.html)
        self.assertNotIn("taskStrategies", self.html)
        self.assertNotIn("transcriptSegments", self.html)
        self.assertNotIn("Why:</strong>", self.html)
        self.assertNotIn("Evidence:</strong>", self.html)


if __name__ == "__main__":
    unittest.main()
