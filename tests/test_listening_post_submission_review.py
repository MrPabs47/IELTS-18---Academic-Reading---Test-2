"""Static contract tests for IELTS 16 Listening post-submission Study Review."""

from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = (
    ROOT
    / "listening"
    / "cambridge-16"
    / "test-1"
    / "IELTS16 Test 1 - Listening.html"
)
HTML = HTML_PATH.read_text(encoding="utf-8")


def function_body(name):
    start = HTML.index(f"function {name}")
    body_start = HTML.index("{", start) + 1
    next_function = HTML.find("\n    function ", body_start)
    if next_function == -1:
        next_function = len(HTML)
    return HTML[body_start:next_function]


class ListeningPostSubmissionReviewStaticContractTest(unittest.TestCase):
    """Protect the submitted Test review lifecycle without executing browser code."""

    def test_results_have_one_close_button_and_no_review_transition(self):
        self.assertEqual(HTML.count('id="closeResultsBtn"'), 1)
        self.assertEqual(HTML.count('id="reviewResultsBtn"'), 0)
        self.assertNotIn("Review in Study Mode", HTML)
        self.assertNotIn("Return to Study Review", HTML)
        self.assertIn(
            "closeResultsBtn.addEventListener('click',closeResultsSummary)",
            HTML,
        )

    def test_final_submission_activates_review_before_results_open(self):
        submit = function_body("submitTest")
        self.assertIn("if(finalTestSubmission) activateSubmittedReview()", submit)
        self.assertLess(
            submit.index("activateSubmittedReview()"),
            submit.index("showResultsSummary()"),
        )
        self.assertLess(
            submit.index("submittedResultSnapshot=captureSubmittedResultSnapshot"),
            submit.index("activateSubmittedReview()"),
        )

    def test_review_does_not_start_a_fresh_study_attempt(self):
        review = function_body("activateSubmittedReview")
        self.assertNotIn("startApp(", review)
        self.assertNotIn("mode='study'", review)
        self.assertNotIn('mode="study"', review)
        self.assertNotIn("resetStudyAudioPositions()", review)

    def test_review_has_one_explicit_state_source(self):
        self.assertIn("submittedReview = false", HTML)
        self.assertIn("function isStudyExperience()", HTML)
        self.assertIn("mode==='study' || submittedReview", HTML)
        review = function_body("activateSubmittedReview")
        self.assertEqual(review.count("submittedReview=true"), 1)

    def test_submitted_remains_true_and_test_lock_remains_authoritative(self):
        review = function_body("activateSubmittedReview")
        lock = function_body("isTestAnswerLocked")
        self.assertNotIn("submitted=false", review)
        self.assertIn("mode==='test' && submitted", lock)
        self.assertIn("enforceSubmittedReviewAnswerLock()", review)

    def test_score_band_candidate_time_and_integrity_are_cached(self):
        snapshot = function_body("captureSubmittedResultSnapshot")
        submit = function_body("submitTest")
        self.assertIn("return Object.freeze({", snapshot)
        for field in (
            "totalCorrect",
            "bandInfo:Object.freeze",
            "candidate:",
            "elapsedSeconds:",
            "integrity:Object.freeze",
            "integritySummary:",
        ):
            self.assertIn(field, snapshot)
        self.assertIn(
            "submittedResultSnapshot=captureSubmittedResultSnapshot("
            "totalCorrect,bandInfo)",
            submit,
        )

    def test_entering_review_never_scores_or_calculates_a_band(self):
        review = function_body("activateSubmittedReview")
        feedback = function_body("renderSubmittedReviewFeedback")
        for forbidden in ("evaluateAll(", "submitTest(", "bandFromScore("):
            self.assertNotIn(forbidden, review)
            self.assertNotIn(forbidden, feedback)

    def test_submitted_values_are_snapshotted_without_review_overwrites(self):
        snapshot = function_body("captureSubmittedResultSnapshot")
        review = function_body("activateSubmittedReview")
        feedback = function_body("renderSubmittedReviewFeedback")
        self.assertIn("answers[q]=getUserAnswer(q)", snapshot)
        self.assertIn("answers:Object.freeze(answers)", snapshot)
        self.assertNotIn(".value=", review)
        self.assertNotIn(".value=", feedback)

    def test_all_native_and_custom_answer_controls_stay_locked(self):
        lock = function_body("enforceSubmittedReviewAnswerLock")
        switch = function_body("switchSection")
        self.assertIn(
            "document.querySelectorAll('input, textarea, select')", lock
        )
        self.assertIn("el.disabled=true", lock)
        self.assertIn("setCustomDragLocked(true)", lock)
        self.assertIn("if(submittedReview) enforceSubmittedReviewAnswerLock()", switch)

    def test_map_dropdowns_remain_native_visible_and_disabled(self):
        self.assertEqual(HTML.count('class="map-letter-select"'), 6)
        self.assertIn(
            "#app.submitted-review-active select:disabled", HTML
        )
        self.assertRegex(
            HTML,
            r"#app\.submitted-review-active select:disabled\s*\{[^}]*"
            r"opacity:\s*1",
        )
        self.assertNotIn("querySelectorAll('.map-letter-select').forEach", HTML)

    def test_review_feedback_uses_cached_correct_incorrect_and_blank_states(self):
        snapshot = function_body("captureSubmittedResultSnapshot")
        state = function_body("submittedReviewStateForQuestions")
        feedback = function_body("renderSubmittedReviewFeedback")
        self.assertIn("15:'15-20'", HTML)
        self.assertIn("20:'15-20'", HTML)
        self.assertIn("answeredByQuestion[q]=isAnswered(q)", snapshot)
        self.assertIn(
            "correctByQuestion[q]=answeredByQuestion[q] && isCorrect(q)", snapshot
        )
        self.assertIn("if(correctCount===0) return false", state)
        self.assertIn("return 'partial'", state)
        self.assertIn("submittedResultSnapshot.correctByQuestion", feedback)

    def test_review_feedback_does_not_change_counts_or_student_answers(self):
        feedback = function_body("renderSubmittedReviewFeedback")
        self.assertNotIn("updateFooterState", feedback)
        self.assertNotIn("dispatchEvent", feedback)
        self.assertNotIn("getUserAnswer", feedback)
        self.assertNotRegex(feedback, r"\.value\s*=")

    def test_review_shows_study_audio_controls_without_autoplay(self):
        update = function_body("updateSectionAudio")
        review = function_body("activateSubmittedReview")
        self.assertIn("const shouldShow=mode==='study' || submittedReview", update)
        self.assertIn("audioBar.classList.toggle('visible',shouldShow)", update)
        self.assertIn("audioBar.classList.add('visible')", review)
        self.assertNotIn("updateSectionAudio()", review)
        self.assertNotIn("sectionAudioSource.setAttribute", review)
        self.assertNotIn("sectionAudio.load()", review)
        self.assertNotIn("playCurrentSectionAudio()", review)
        self.assertNotIn(".play()", review)

    def test_part_one_transcript_is_available_and_seekable_in_review(self):
        renderer = function_body("renderAudioscriptPanel")
        active = function_body("isStudyPart1AudioActive")
        sync = function_body("updatePart1TranscriptSync")
        activate = function_body("activatePart1TranscriptRow")
        playback = function_body("requestPendingStudyAudioPlayback")
        self.assertIn("submittedReview && hasTranscript", renderer)
        self.assertIn("mode==='study' || submittedReview", active)
        self.assertIn("mode==='study' || submittedReview", sync)
        self.assertIn("row.classList.add('is-seekable')", renderer)
        self.assertIn("row.setAttribute('role','button')", renderer)
        self.assertIn("requestStudyAudioUserSeek(1,segment,true)", activate)
        self.assertIn("sectionAudio.play()", playback)
        self.assertIn(".catch(()=>false)", playback)

    def test_review_phrase_play_request_survives_low_readiness_without_prior_play(self):
        request = function_body("requestStudyAudioUserSeek")
        apply_seek = function_body("applyPendingStudyAudioUserSeek")
        playback = function_body("requestPendingStudyAudioPlayback")
        self.assertIn("shouldPlay:Boolean(shouldPlay)", request)
        self.assertIn("playRequestedForSource:''", request)
        self.assertIn("sectionAudio.readyState<1", apply_seek)
        self.assertIn("requestPendingStudyAudioPlayback(request)", apply_seek)
        self.assertIn(
            "request.playRequestedForSource=playbackSource", playback
        )
        self.assertEqual(playback.count("sectionAudio.play()"), 1)

    def test_review_preserves_transcript_following_and_split_layout(self):
        resume = function_body("updateResumeFollowingControl")
        layout = function_body("updateStudySplitLayout")
        self.assertIn("submittedReview", resume)
        self.assertIn("submittedReview && activeSection===1", layout)
        self.assertIn("Resume following", HTML)
        self.assertIn("Resize questions and audioscript panes", HTML)

    def test_parts_two_to_four_remain_without_transcripts(self):
        empty_parts = re.findall(
            r"[234]:\s*\{\s*audioSrc:\s*\"\./Test 1 Part [234]\.mp3\","
            r"\s*speakers:\s*\{\},\s*segments:\s*\[\]\s*\}",
            HTML,
        )
        self.assertEqual(len(empty_parts), 3)

    def test_entering_review_pauses_audio_and_cancels_pending_transitions(self):
        initialise = function_body("initialiseSubmittedReviewAudioPositions")
        self.assertGreaterEqual(initialise.count("sectionAudio.pause()"), 2)
        self.assertIn("studyAudioLoadToken+=1", initialise)
        self.assertIn("studyAudioTransition=null", initialise)
        self.assertIn("studyAudioResumeAfterSeekPending=false", initialise)

    def test_part_one_review_position_keeps_the_ten_second_floor(self):
        initialise = function_body("initialiseSubmittedReviewAudioPositions")
        normalise = function_body("normaliseStudyAudioPosition")
        self.assertIn(
            "const PART_1_FRESH_START_SECONDS = 10.000;", HTML
        )
        self.assertIn(
            "normaliseStudyAudioPosition(sourcePart,sectionAudio.currentTime)",
            initialise,
        )
        self.assertIn("Math.max(floor,position)", normalise)

    def test_parts_two_to_four_keep_zero_based_review_seeking(self):
        floor = function_body("getStudyAudioFloor")
        self.assertIn(
            "return section===1 ? PART_1_FRESH_START_SECONDS : 0", floor
        )
        self.assertIn("studyAudioPositions={1:0,2:0,3:0,4:0}", HTML)

    def test_test_sequential_playback_cannot_restart_in_review(self):
        ended = re.search(
            r"sectionAudio\.addEventListener\('ended',\(\)=>\{(?P<body>.*?)\}\);",
            HTML,
            re.DOTALL,
        )
        self.assertIsNotNone(ended)
        self.assertIn("mode==='test' && !submitted", ended.group("body"))
        self.assertNotIn("submittedReview", ended.group("body"))

    def test_timer_fullscreen_and_integrity_monitoring_stay_stopped(self):
        review = function_body("activateSubmittedReview")
        focus = function_body("recordFocusLoss")
        fullscreen = function_body("handleFullscreenChange")
        self.assertIn("clearInterval(timerId)", review)
        self.assertNotIn("startTimer()", review)
        self.assertNotIn("runTimerInterval()", review)
        self.assertNotIn("requestAppFullscreen()", review)
        self.assertIn("fullScreenEnforcementEnabled=false", review)
        self.assertIn("!submitted", focus)
        self.assertIn("!submitted", fullscreen)

    def test_cached_integrity_is_not_erased_or_recounted(self):
        snapshot = function_body("captureSubmittedResultSnapshot")
        review = function_body("activateSubmittedReview")
        self.assertIn("integrity:Object.freeze({fullScreenExits,focusLosses})", snapshot)
        self.assertNotIn("fullScreenExits=0", review)
        self.assertNotIn("focusLosses=0", review)

    def test_review_submit_control_reopens_results_without_confirmation(self):
        handler = function_body("handlePrimarySubmit")
        self.assertIn("if(submitted) return showResultsSummary()", handler)
        self.assertLess(handler.index("if(submitted)"), handler.index("confirmSubmit()"))
        labels = function_body("updatePrimarySubmitControlLabels")
        self.assertIn("View submitted results", labels)

    def test_reopening_results_does_not_rescore_duplicate_or_touch_audio(self):
        show = function_body("showResultsSummary")
        self.assertEqual(HTML.count('id="resultsOverlay"'), 1)
        self.assertEqual(HTML.count('id="resultsPanel"'), 1)
        for forbidden in (
            "evaluateAll(",
            "submitTest(",
            "bandFromScore(",
            "sectionAudio.load(",
            "sectionAudio.play(",
            "playCurrentSectionAudio(",
        ):
            self.assertNotIn(forbidden, show)

    def test_closing_results_restores_review_focus_without_changing_state(self):
        close = function_body("closeResultsSummary")
        self.assertIn("resultsOverlay.style.display='none'", close)
        self.assertIn("focus({preventScroll:true})", close)
        self.assertNotIn("submittedReview=false", close)
        self.assertNotIn("switchSection(", close)

    def test_review_keeps_all_part_navigation_active(self):
        self.assertIn(
            "if(activeSection>1) switchSection(activeSection-1)", HTML
        )
        self.assertIn(
            "if(activeSection<4) switchSection(activeSection+1)", HTML
        )
        self.assertIn("part.addEventListener('click'", HTML)
        self.assertIn("btn.addEventListener('click',()=>jumpToQuestion(q))", HTML)

    def test_fresh_study_remains_editable_and_resets_review_state(self):
        start = function_body("startApp")
        drag = function_body("setupDragMatch")
        self.assertIn("if(mode==='study') resetStudyAudioPositions()", start)
        self.assertIn("submitted=false", start)
        self.assertIn("submittedReview=false", start)
        self.assertIn("submittedResultSnapshot=null", start)
        self.assertIn("setupDragMatch()", start)
        self.assertIn("setCustomDragLocked(false)", drag)

    def test_test_before_submission_still_hides_transcript(self):
        renderer = function_body("renderAudioscriptPanel")
        start = function_body("startApp")
        self.assertIn(
            "const shouldShow=mode==='study' && hasTranscript || "
            "submittedReview && hasTranscript",
            renderer,
        )
        self.assertIn("submittedReview=false", start)
        self.assertNotIn("submitted && hasTranscript", renderer)

    def test_full_reload_returns_to_the_fresh_mode_chooser_lifecycle(self):
        self.assertIn('<div id="modeScreen">', HTML)
        self.assertIn("submittedReview = false", HTML)
        self.assertIn("submittedResultSnapshot = null", HTML)
        self.assertNotIn("localStorage.setItem('submittedReview'", HTML)
        self.assertNotIn("sessionStorage.setItem('submittedReview'", HTML)

    def test_study_header_shell_reports_locked_review_accessibly(self):
        self.assertNotIn('id="reviewModeBanner"', HTML)
        self.assertIn('id="listeningStudyShell" hidden aria-hidden="true"', HTML)
        self.assertIn('id="listeningStudyPill"', HTML)
        self.assertIn(">Study Mode</button>", HTML)
        header = function_body("updateStudyModeHeader")
        self.assertIn("const visible=isStudyExperience()", header)
        self.assertIn(
            "'Study Mode \\u2014 submitted answers locked' : 'Study Mode'", header
        )
        self.assertIn(
            "'Study Mode \\u00B7 Locked' : 'Study Mode'", header
        )
        self.assertIn("listeningStudyShell.hidden=!visible", header)

    def test_study_header_and_results_are_theme_and_mobile_safe(self):
        self.assertRegex(
            HTML,
            r"\.results-actions\s*\{[^}]*flex-wrap:\s*wrap",
        )
        self.assertRegex(
            HTML,
            r"\.results-actions \.mode-btn\s*\{[^}]*max-width:\s*100%",
        )
        self.assertIn("background: var(--accent-soft)", HTML)
        self.assertIn(".listening-study-pill", HTML)
        self.assertIn(".listening-study-header-button:focus-visible", HTML)
        self.assertRegex(
            HTML,
            r"(?s)@media \(max-width: 760px\).*?"
            r"\.top-right\s*\{[^}]*flex-wrap:\s*wrap",
        )

    def test_global_information_ui_is_replaced_by_locked_review_dialog(self):
        self.assertNotIn('id="studyInfoBtn"', HTML)
        self.assertNotIn('id="studyInfoDialog"', HTML)
        self.assertNotIn('aria-label="Listening Study Mode information"', HTML)
        self.assertIn(
            'id="lockedReviewDialog" role="dialog" aria-modal="true" '
            'aria-labelledby="locked-review-title"',
            HTML,
        )
        self.assertIn(
            "You are reviewing a submitted test. Your answers are locked. "
            "To edit answers and check them as you work, start a new attempt "
            "in Study Mode.",
            HTML,
        )
        open_dialog = function_body("openStudyDialog")
        close_dialog = function_body("closeStudyDialog")
        self.assertIn("if(!isStudyExperience()", open_dialog)
        self.assertIn("closeButton.focus({preventScroll:true})", open_dialog)
        self.assertIn("opener.focus({preventScroll:true})", close_dialog)
        for body in (open_dialog, close_dialog):
            self.assertNotIn("sectionAudio.", body)
            self.assertNotIn("playCurrentSectionAudio", body)

    def test_locked_dialog_supports_escape_and_safe_backdrop_close(self):
        self.assertIn(
            "if(event.target===overlay) closeStudyDialog(true)", HTML
        )
        self.assertIn("if(event.key!=='Escape') return", HTML)
        self.assertIn("if(activeStudyDialog)", HTML)

    def test_review_does_not_unlock_on_navigation_or_results_reopen(self):
        switch = function_body("switchSection")
        show = function_body("showResultsSummary")
        close = function_body("closeResultsSummary")
        self.assertIn("enforceSubmittedReviewAnswerLock()", switch)
        self.assertNotIn("disabled=false", switch)
        self.assertNotIn("setCustomDragLocked(false)", show)
        self.assertNotIn("setCustomDragLocked(false)", close)

    def test_review_does_not_add_part_two_transcript_or_new_learning_tools(self):
        self.assertEqual(HTML.count("const listeningStudyData ="), 1)
        self.assertNotIn("answer evidence", HTML.lower())
        self.assertNotIn("highlighting tool", HTML.lower())
        self.assertNotIn("notes tool", HTML.lower())


if __name__ == "__main__":
    unittest.main()
