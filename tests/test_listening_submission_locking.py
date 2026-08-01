import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"


class ListeningSubmissionLockingContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def function_body(self, name, next_name):
        match = re.search(
            rf"function {name}\([^)]*\)\{{(?P<body>.*?)function {next_name}\(",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(match, f"Could not find {name}()")
        return match.group("body")

    def test_all_submit_controls_use_one_primary_wrapper(self):
        self.assertIn("menuSubmitBtn.addEventListener('click', handlePrimarySubmit)", self.html)
        self.assertIn("footerSubmitBtn.addEventListener('click', handlePrimarySubmit)", self.html)
        self.assertNotIn("addEventListener('click', handleSubmit)", self.html)
        self.assertNotRegex(self.html, r'onclick=["\']submitTest\(')

    def test_static_contract_study_checks_pause_without_confirmation_or_final_state(self):
        body = self.function_body("handlePrimarySubmit", "startApp")
        self.assertIn("if(mode==='study'){ submitTest(); return; }", body)
        self.assertIn("if(submitted) return", body)
        self.assertIn("confirmSubmit()", body)
        submit = self.function_body("submitTest", "confirmSubmit")
        self.assertIn("const finalTestSubmission=mode==='test'", submit)
        self.assertIn(
            "if(!finalTestSubmission && !submittedReview) pauseStudyAudioForChecking()",
            submit,
        )
        self.assertIn("if(finalTestSubmission) submitted=true", submit)
        self.assertNotIn("submitted=true;\n      const finalTestSubmission", submit)

    def test_static_contract_study_check_pause_preserves_media_and_part_state(self):
        body = self.function_body("pauseStudyAudioForChecking", "submitTest")
        self.assertIn("if(mode!=='study' || submittedReview) return false", body)
        self.assertIn("sectionAudio.pause()", body)
        self.assertIn("saveStudyAudioPosition(activeSection)", body)
        self.assertIn("studyAudioResumeAfterSeekPending=false", body)
        self.assertIn("studyAudioTransition.resumeAfterRestore=false", body)
        self.assertNotIn("sectionAudio.currentTime=", body)
        self.assertNotIn("sectionAudioSource.setAttribute", body)
        self.assertNotIn("sectionAudio.load()", body)
        self.assertNotRegex(body, r"\bactiveSection\s*=")
        self.assertNotRegex(body, r"\bplaybackRate\s*=")
        self.assertNotRegex(body, r"\bvolume\s*=")
        self.assertNotRegex(body, r"\bmuted\s*=")

    def test_static_contract_options_and_results_do_not_pause_or_autoplay(self):
        options = self.function_body("openOptions", "getSectionForQuestion")
        close_results = self.function_body("closeResultsSummary", "showResultsSummary")
        show_results = self.function_body("showResultsSummary", "confirmSubmit")
        for body in (options, close_results, show_results):
            self.assertNotIn("sectionAudio.pause()", body)
            self.assertNotIn("sectionAudio.play()", body)
            self.assertNotIn("playCurrentSectionAudio()", body)

    def test_static_contract_submit_labels_are_accessible_and_encoding_safe(self):
        self.assertNotRegex(self.html, r"Ã|â|Â|�")
        self.assertIn(
            '<span class="submit-button-icon" aria-hidden="true">&#10003;</span>',
            self.html,
        )
        labels = self.function_body(
            "updatePrimarySubmitControlLabels", "setCustomDragLocked"
        )
        self.assertIn("mode==='study' ? 'Check answers'", labels)
        self.assertIn("'Submit test & check answers'", labels)
        self.assertIn("'View submitted results'", labels)
        renderer = self.function_body(
            "setPrimarySubmitButtonLabel", "updatePrimarySubmitControlLabels"
        )
        self.assertIn("icon.setAttribute('aria-hidden','true')", renderer)
        self.assertIn("icon.innerHTML='&#10003;'", renderer)
        self.assertIn("text.textContent=label", renderer)
        self.assertIn("menuSubmitBtn.setAttribute('aria-label',label)", renderer)

    def test_test_confirmation_can_cancel_without_submitting(self):
        confirm = self.function_body("confirmSubmit", "handlePrimarySubmit")
        self.assertIn(
            "You will not be able to continue answering in Test mode.",
            confirm,
        )
        self.assertIn("if(!ok) return; submitTest()", confirm)

    def test_repeated_final_test_submission_is_guarded(self):
        submit = self.function_body("submitTest", "confirmSubmit")
        self.assertIn("if(isTestAnswerLocked()) return", submit)
        self.assertLess(
            submit.index("if(isTestAnswerLocked()) return"),
            submit.index("evaluateAll()"),
        )

    def test_native_answers_are_disabled_only_for_final_test_submission(self):
        submit = self.function_body("submitTest", "confirmSubmit")
        self.assertIn("if(finalTestSubmission)", submit)
        self.assertIn("document.querySelectorAll('input, select')", submit)
        self.assertIn("el.disabled=true", submit)

    def test_drag_choice_click_and_dragstart_have_runtime_guards(self):
        setup = self.function_body("setupDragMatch", "syncDragSelect")
        self.assertIn("dragstart", setup)
        self.assertIn("if(isTestAnswerLocked()){ e.preventDefault(); return; }", setup)
        self.assertRegex(
            setup,
            r"addEventListener\('click'.*?if\(isTestAnswerLocked\(\)\) return",
        )

    def test_drop_slot_click_and_clear_handlers_have_runtime_guards(self):
        setup = self.function_body("setupDragMatch", "syncDragSelect")
        self.assertRegex(
            setup,
            r"addEventListener\('drop'.*?if\(isTestAnswerLocked\(\)\) return",
        )
        self.assertRegex(
            setup,
            r"slot\.addEventListener\('click'.*?if\(isTestAnswerLocked\(\)\) return",
        )
        self.assertRegex(
            setup,
            r"\.drag-clear'.*?addEventListener\('click'.*?if\(isTestAnswerLocked\(\)\) return",
        )

    def test_hidden_select_mutation_helpers_are_guarded(self):
        sync = self.function_body("syncDragSelect", "setDragAssignment")
        assign = self.function_body("setDragAssignment", "clearDragAssignment")
        clear = self.function_body("clearDragAssignment", "renderDragAssignments")
        self.assertIn("if(isTestAnswerLocked()) return", sync)
        self.assertIn("if(isTestAnswerLocked()) return", assign)
        self.assertIn("if(isTestAnswerLocked()) return", clear)

    def test_final_test_drag_controls_are_visibly_and_accessibly_locked(self):
        lock = self.function_body("setCustomDragLocked", "submitTest")
        self.assertIn("choice.inert=locked", lock)
        self.assertIn("choice.draggable=!locked", lock)
        self.assertIn("choice.setAttribute('tabindex','-1')", lock)
        self.assertIn("slot.inert=locked", lock)
        self.assertIn("slot.tabIndex=locked ? -1 : 0", lock)
        self.assertIn("btn.disabled=locked", lock)
        self.assertIn("aria-disabled", lock)
        self.assertIn("classList.toggle('is-locked',locked)", lock)
        self.assertIn("setCustomDragLocked(true)", self.html)
        self.assertIn("setCustomDragLocked(false)", self.html)
        self.assertIn("return mode==='test' && submitted", self.html)


if __name__ == "__main__":
    unittest.main()
