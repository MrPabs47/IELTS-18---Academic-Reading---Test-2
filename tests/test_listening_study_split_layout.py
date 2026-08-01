"""Static contract tests for the Part 1 Study-mode split layout."""

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"


class ListeningStudySplitLayoutStaticContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def test_split_is_part_one_study_only_and_requires_expanded_transcript(self):
        self.assertIn(
            "mode==='study' && activeSection===1 && partHasTranscript(1) && window.innerWidth>STUDY_SPLIT_BREAKPOINT",
            self.html,
        )
        self.assertIn("desktopCandidate && bounds && audioscriptExpanded", self.html)
        self.assertNotIn("mode==='test' && activeSection===1 && partHasTranscript", self.html)

    def test_parts_without_transcripts_have_no_split_placeholder(self):
        self.assertIn("studyWorkspace.classList.remove('is-split','is-question-only','is-desktop-script-collapsed')", self.html)
        self.assertIn("const bounds=desktopCandidate ? getStudySplitBounds() : null", self.html)
        self.assertNotIn("transcript placeholder", self.html.lower())

    def test_breakpoint_ratio_and_minimum_width_contract(self):
        self.assertIn("const STUDY_SPLIT_BREAKPOINT = 900", self.html)
        self.assertIn("const DEFAULT_STUDY_SPLIT_RATIO = 0.58", self.html)
        self.assertIn("const STUDY_QUESTION_MIN_WIDTH = 480", self.html)
        self.assertIn("const STUDY_AUDIOSCRIPT_MIN_WIDTH = 360", self.html)
        self.assertIn("const STUDY_DIVIDER_WIDTH = 18", self.html)
        self.assertIn("const availableWidth=totalWidth-STUDY_DIVIDER_WIDTH", self.html)
        self.assertIn(
            "availableWidth<STUDY_QUESTION_MIN_WIDTH+STUDY_AUDIOSCRIPT_MIN_WIDTH",
            self.html,
        )

    def test_divider_semantics_and_accessible_name(self):
        divider = re.search(r'<div class="study-divider" id="studyDivider"(?P<attrs>[^>]*)>', self.html)
        self.assertIsNotNone(divider)
        attrs = divider.group("attrs")
        for expected in (
            'role="separator"',
            'tabindex="0"',
            'aria-orientation="vertical"',
            'aria-label="Resize questions and audioscript panes"',
            'aria-valuemin="0"',
            'aria-valuemax="100"',
            'aria-valuenow="58"',
        ):
            self.assertIn(expected, attrs)
        self.assertIn("studyDivider.setAttribute('aria-valuenow'", self.html)
        swap = re.search(
            r'<button class="study-pane-swap-button" id="studyPaneSwapButton"'
            r'(?P<attrs>[^>]*)>',
            self.html,
        )
        self.assertIsNotNone(swap)
        self.assertIn('type="button"', swap.group("attrs"))
        self.assertIn(
            'aria-label="Swap question and audioscript panes"',
            swap.group("attrs"),
        )
        self.assertIn('aria-pressed="false"', swap.group("attrs"))
        self.assertIn("<svg", self.html)

    def test_pointer_keyboard_and_reset_controls_are_connected(self):
        for event_name in ("pointerdown", "pointermove", "pointerup", "pointercancel", "keydown", "dblclick"):
            self.assertIn(f"studyDivider.addEventListener('{event_name}'", self.html)
        self.assertIn("studyDivider.setPointerCapture", self.html)
        for key in ("ArrowLeft", "ArrowRight", "Home", "End"):
            self.assertIn(f"event.key==='{key}'", self.html)
        self.assertIn("event.shiftKey ? 0.05 : 0.02", self.html)
        self.assertIn("applyStudySplitRatio(DEFAULT_STUDY_SPLIT_RATIO)", self.html)
        self.assertIn(
            "studyPaneSwapButton.addEventListener('click',swapStudyPanes)",
            self.html,
        )
        self.assertIn(
            "event.target.closest('.study-pane-swap-button')", self.html
        )

    def test_reading_style_circular_button_and_opposing_arrows_are_present(self):
        circle = re.search(
            r"\.study-pane-swap-button\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(circle)
        for token in (
            "border-radius: 50%",
            "background: #03284f",
            "border: 2px solid #0d3d73",
            "position: absolute",
            "top: 50%",
            "left: 50%",
        ):
            self.assertIn(token, circle.group("body"))
        self.assertIn(
            'd="M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3"',
            self.html,
        )
        focus = re.search(
            r"\.study-pane-swap-button:focus-visible\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(focus)
        self.assertIn("outline: 3px solid var(--accent)", focus.group("body"))

    def test_swap_toggles_pane_order_and_second_activation_restores_it(self):
        swap = re.search(
            r"function swapStudyPanes\(\)\{(?P<body>.*?)\n\s*\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(swap)
        body = swap.group("body")
        self.assertIn("studyPanesSwapped=!studyPanesSwapped", body)
        self.assertIn(
            "studyWorkspace.classList.toggle('is-panes-swapped',studyPanesSwapped)",
            body,
        )
        self.assertIn(
            "studyPaneSwapButton.setAttribute('aria-pressed',String(studyPanesSwapped))",
            body,
        )
        self.assertIn(
            'grid-template-areas: "script divider questions"', self.html
        )
        self.assertIn(
            'grid-template-areas: "questions divider script"', self.html
        )

    def test_swap_preserves_audio_transcript_and_internal_scroll_state(self):
        start = self.html.index("function swapStudyPanes()")
        end = self.html.index("\n    function setupStudySplitDivider", start)
        body = self.html[start:end]
        self.assertIn("const questionScroll=studyQuestionPane.scrollTop", body)
        self.assertIn("const transcriptScroll=audioscriptBody.scrollTop", body)
        self.assertIn("studyQuestionPane.scrollTop=questionScroll", body)
        self.assertIn(
            "audioscriptBody.scrollTop=markTranscriptProgrammaticScroll(transcriptScroll)",
            body,
        )
        for forbidden in (
            "sectionAudio.",
            "updateSectionAudio(",
            "renderAudioscriptPanel(",
            "activeQuestionNumber=",
            "activeEvidence",
            "transcriptFollowingEnabled=",
        ):
            self.assertNotIn(forbidden, body)

    def test_ratio_storage_is_test_specific_and_session_scoped(self):
        self.assertIn(
            "const STUDY_SPLIT_STORAGE_KEY = 'ielts16-listening-test1-study-split-ratio'",
            self.html,
        )
        self.assertIn("sessionStorage.getItem(STUDY_SPLIT_STORAGE_KEY)", self.html)
        self.assertIn("sessionStorage.setItem(STUDY_SPLIT_STORAGE_KEY", self.html)
        self.assertNotRegex(self.html, r"localStorage\.(?:getItem|setItem)\(STUDY_SPLIT_STORAGE_KEY")
        self.assertIn("Number.isFinite(stored) && stored>0 && stored<1", self.html)
        self.assertIn("return DEFAULT_STUDY_SPLIT_RATIO", self.html)

    def test_question_and_transcript_scroll_positions_are_separate(self):
        self.assertIn("studyQuestionScrollPositions = {1:0,2:0,3:0,4:0}", self.html)
        self.assertIn("let studyAudioscriptScrollPosition = 0", self.html)
        self.assertIn("studyQuestionPane.scrollTop=studyQuestionScrollPositions[section]", self.html)
        self.assertIn("audioscriptBody.scrollTop=studyAudioscriptScrollPosition", self.html)

    def test_hide_show_collapses_and_restores_without_duplicate_transcript(self):
        self.assertIn("is-desktop-script-collapsed", self.html)
        self.assertIn('id="audioscriptExternalToggle"', self.html)
        self.assertIn(">Show audioscript</button>", self.html)
        self.assertIn("audioscriptExpanded=!audioscriptExpanded", self.html)
        self.assertIn("setAudioscriptExpanded(audioscriptExpanded)", self.html)
        self.assertIn("setAudioscriptExpanded(true)", self.html)
        self.assertEqual(self.html.count('id="audioscriptBody"'), 1)

    def test_mobile_contract_returns_to_normal_document_flow(self):
        mobile = re.search(r"@media \(max-width: 900px\) \{(?P<body>.*?)\n\s*\}\n\s*</style>", self.html, re.DOTALL)
        self.assertIsNotNone(mobile)
        body = mobile.group("body")
        self.assertIn("height: auto", body)
        self.assertIn("overflow: visible", body)
        self.assertIn(".study-divider", body)
        self.assertIn("display: none !important", body)

    def test_transcript_speaker_column_is_compact_bounded_and_mobile_safe(self):
        segment = re.search(
            r"\.audioscript-segment\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(segment)
        body = segment.group("body")
        self.assertIn(
            "grid-template-columns: minmax(58px, 70px) minmax(0, 1fr)",
            body,
        )
        self.assertIn("gap: 6px", body)
        self.assertIn(
            ".audioscript-text { min-width: 0; overflow-wrap: anywhere; }",
            self.html,
        )
        self.assertIn(
            ".audioscript-segment { grid-template-columns: minmax(0, 1fr); gap: 2px; }",
            self.html,
        )
        self.assertIn(".audioscript-speaker-spacer { display: none; }", self.html)

    def test_document_scroll_lock_is_scoped_to_active_desktop_workspace(self):
        self.assertIn(
            "const STUDY_DOCUMENT_LOCK_CLASS = 'listening-study-desktop-workspace-active'",
            self.html,
        )
        self.assertRegex(
            self.html,
            r"(?s)html\.listening-study-desktop-workspace-active,\s*"
            r"body\.listening-study-desktop-workspace-active\s*\{.*?overflow-y:\s*hidden;",
        )
        self.assertIn(
            "document.documentElement.classList.toggle(STUDY_DOCUMENT_LOCK_CLASS,locked)",
            self.html,
        )
        self.assertIn(
            "document.body.classList.toggle(STUDY_DOCUMENT_LOCK_CLASS,locked)",
            self.html,
        )
        self.assertIn("let lockDocumentScroll=false", self.html)
        self.assertEqual(self.html.count("lockDocumentScroll=true"), 2)
        self.assertIn("setStudyDocumentScrollLock(lockDocumentScroll)", self.html)
        self.assertIn("function maintainStudyDocumentScrollPosition()", self.html)
        self.assertIn(
            "document.documentElement.classList.contains(STUDY_DOCUMENT_LOCK_CLASS)",
            self.html,
        )
        self.assertIn(
            "window.addEventListener('scroll',maintainStudyDocumentScrollPosition,{passive:true})",
            self.html,
        )

    def test_split_and_question_only_modes_keep_internal_scrollers(self):
        self.assertRegex(
            self.html,
            r"(?s)\.study-workspace\.is-split \.study-question-pane,\s*"
            r"\.study-workspace\.is-question-only \.study-question-pane\s*\{.*?overflow-y:\s*auto;",
        )
        self.assertRegex(
            self.html,
            r"(?s)\.audioscript-body\s*\{.*?overflow-y:\s*auto;",
        )
        self.assertIn("studyWorkspace.classList.add('is-question-only','is-desktop-script-collapsed')", self.html)
        self.assertIn("audioscriptExternalToggle.hidden=false", self.html)

    def test_scroll_lock_updates_for_part_switch_and_viewport_resize(self):
        self.assertIn("window.addEventListener('resize',scheduleStudySplitLayout)", self.html)
        switch = re.search(
            r"function switchSection\(section\)\{(?P<body>.*?)\n\s*function jumpToQuestion",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(switch)
        self.assertIn("updateStudySplitLayout()", switch.group("body"))
        self.assertIn("window.innerWidth>STUDY_SPLIT_BREAKPOINT", self.html)
        self.assertIn("mode==='study' && activeSection===1", self.html)

    def test_workspace_height_uses_rendered_footer_and_has_bottom_padding(self):
        self.assertIn("footer.getBoundingClientRect().top", self.html)
        self.assertIn("studyWorkspace.getBoundingClientRect().top-8", self.html)
        self.assertRegex(
            self.html,
            r"(?s)body\.listening-study-desktop-workspace-active \.main\s*\{.*?"
            r"padding-bottom:\s*0;.*?overflow:\s*clip;",
        )
        self.assertRegex(self.html, r"(?s)\.audioscript-body\s*\{.*?padding:\s*4px 12px 16px;")
        self.assertIn(".study-workspace.is-question-only .section-panel { padding: 8px 12px 16px; }", self.html)

    def test_no_future_transcript_features_were_introduced(self):
        for forbidden in (
            "wordTimings",
            "phraseTimings",
            "activeTranscriptSegment",
            "resumeFollowing",
            "cluePlayback",
            "answerEvidence",
            "distractorEvidence",
            "annotationToolbar",
        ):
            self.assertNotIn(forbidden, self.html)


if __name__ == "__main__":
    unittest.main()
