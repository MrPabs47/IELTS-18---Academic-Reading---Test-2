import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = (
    ROOT
    / "listening"
    / "cambridge-16"
    / "test-1"
    / "IELTS16 Test 1 - Listening.html"
)

SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p(?P<part>[1-4])-[is]\d{3})", '
    r'speaker: "(?P<speaker>[^"]+)", text: "(?P<text>.*?)", '
    r"relatedQuestions: \[(?P<questions>[^\]]*)\], "
    r"start: (?P<start>\d+(?:\.\d+)?), end: (?P<end>\d+(?:\.\d+)?) \}"
)
FEEDBACK_PATTERN = re.compile(
    r"^\s+(?P<question>\d+):\{why:'(?P<why>[^']+)',"
    r"skill:'(?P<skill>[^']+)'\},?$",
    re.MULTILINE,
)


def function_body(source: str, name: str) -> str:
    match = re.search(
        rf"(?:async\s+)?function {re.escape(name)}\([^)]*\)\s*\{{", source
    )
    if not match:
        raise AssertionError(f"Function {name} was not found")
    opening = match.end() - 1
    depth = 0
    quote = None
    escaped = False
    for index in range(opening, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in ("'", '"', "`"):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[opening + 1 : index]
    raise AssertionError(f"Function {name} was not closed")


class ListeningExplanationsEvidenceStaticContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        feedback = re.search(
            r"const listeningQuestionFeedback = \{(?P<body>.*?)\n    \};\n"
            r"    const listeningBands",
            cls.html,
            re.DOTALL,
        )
        if not feedback:
            raise AssertionError("listeningQuestionFeedback was not found")
        cls.feedback_source = feedback.group("body")
        cls.feedback = {
            int(match.group("question")): {
                "why": match.group("why"),
                "skill": match.group("skill"),
            }
            for match in FEEDBACK_PATTERN.finditer(cls.feedback_source)
        }
        cls.segments = []
        for match in SEGMENT_PATTERN.finditer(cls.html):
            cls.segments.append(
                {
                    "id": match.group("id"),
                    "part": int(match.group("part")),
                    "speaker": match.group("speaker"),
                    "text": match.group("text"),
                    "questions": [
                        int(value.strip())
                        for value in match.group("questions").split(",")
                        if value.strip()
                    ],
                    "start": float(match.group("start")),
                    "end": float(match.group("end")),
                }
            )

    def test_feedback_data_covers_questions_one_to_forty_exactly(self):
        self.assertEqual(set(self.feedback), set(range(1, 41)))
        self.assertEqual(len(self.feedback), 40)

    def test_every_question_has_non_empty_why_and_skill(self):
        for question, detail in self.feedback.items():
            with self.subTest(question=question):
                self.assertTrue(detail["why"].strip())
                self.assertTrue(detail["skill"].strip())

    def test_feedback_has_no_placeholder_or_embedded_evidence_data(self):
        self.assertNotRegex(
            self.feedback_source, r"(?i)\b(?:todo|tbd|placeholder)\b"
        )
        self.assertNotRegex(self.feedback_source, r"\bevidence\s*:")
        self.assertNotIn("relatedQuestions", self.feedback_source)

    def test_why_text_is_answer_specific_and_substantive(self):
        for question, detail in self.feedback.items():
            with self.subTest(question=question):
                self.assertGreaterEqual(len(detail["why"].split()), 14)
                self.assertRegex(detail["why"], r"[.!?][”’\"]?$")

    def test_skill_text_is_brief_and_question_specific(self):
        for question, detail in self.feedback.items():
            with self.subTest(question=question):
                self.assertGreaterEqual(len(detail["skill"].split()), 6)
                self.assertLessEqual(len(detail["skill"].split()), 24)

    def test_choose_two_pairs_use_one_order_neutral_explanation(self):
        self.assertEqual(self.feedback[21], self.feedback[22])
        self.assertEqual(self.feedback[23], self.feedback[24])
        self.assertIn("either order", self.feedback[23]["why"])

    def test_all_questions_resolve_to_existing_transcript_mappings(self):
        mapped = {
            question
            for segment in self.segments
            for question in segment["questions"]
        }
        self.assertEqual(mapped, set(range(1, 41)))

    def test_every_mapping_is_in_the_question_correct_part(self):
        for question in range(1, 41):
            expected_part = (question - 1) // 10 + 1
            evidence = [
                segment
                for segment in self.segments
                if question in segment["questions"]
            ]
            with self.subTest(question=question):
                self.assertTrue(evidence)
                self.assertEqual(
                    {segment["part"] for segment in evidence}, {expected_part}
                )

    def test_narrator_rows_are_never_answer_evidence(self):
        for segment in self.segments:
            if segment["speaker"] == "Narrator":
                self.assertEqual(segment["questions"], [])

    def test_question_and_pair_evidence_is_deduplicated_and_chronological(self):
        resolver = function_body(self.html, "evidenceSegmentsForQuestions")
        self.assertIn("segment.relatedQuestions.some", resolver)
        self.assertIn("seen.has(segment.id)", resolver)
        self.assertIn("seen.add(segment.id)", resolver)
        self.assertIn("return matches", resolver)
        self.assertNotIn("indexOf", resolver)
        self.assertNotIn(".text", resolver)

    def test_pair_question_union_is_requested_without_answer_order(self):
        numbers = function_body(self.html, "questionNumbersForFeedback")
        self.assertIn("group.pairName ? group.questions", numbers)
        render = function_body(self.html, "renderListeningStudyGroupFeedback")
        self.assertIn("questionNumbersForFeedback(group)", render)
        self.assertIn("combinedListeningFeedbackDetails(group)", render)

    def test_feedback_card_renders_your_correct_why_skill_hierarchy(self):
        builder = function_body(self.html, "buildListeningFeedbackCard")
        for label in (
            "Your answer",
            "Correct answer",
            "Why",
            "Skill",
        ):
            self.assertIn(label, self.html)
        self.assertIn("appendFeedbackDetail(list,'Why',details.why)", builder)
        self.assertIn(
            "appendFeedbackDetail(list,'Skill',details.skill)", builder
        )

    def test_feedback_rendering_uses_central_question_data(self):
        ordinary = function_body(
            self.html, "renderListeningStudyGroupFeedback"
        )
        self.assertIn("listeningQuestionFeedback[questionNumber]", ordinary)
        self.assertIn("listeningQuestionFeedback[group.questions[0]]", self.html)

    def test_feedback_invalidation_still_hides_the_relevant_group(self):
        invalidate = function_body(
            self.html, "invalidateListeningStudyGroupFeedback"
        )
        hide = function_body(self.html, "hideListeningStudyGroup")
        self.assertIn("hideListeningStudyGroup(group)", invalidate)
        self.assertIn("clearTranscriptEvidenceForGroup(group)", hide)

    def test_locked_review_still_reveals_all_cards_from_snapshot(self):
        sync = function_body(self.html, "syncListeningStudyTaskControls")
        activate = function_body(self.html, "activateSubmittedReview")
        header = function_body(self.html, "updateStudyModeHeader")
        self.assertIn("revealAllListeningStudyGroups(true)", sync)
        self.assertIn("updateStudyModeHeader()", activate)
        self.assertIn("syncListeningStudyTaskControls()", header)

    def test_feedback_card_has_native_svg_evidence_button(self):
        button = function_body(self.html, "buildTranscriptEvidenceButton")
        self.assertIn("document.createElementNS", button)
        self.assertIn("http://www.w3.org/2000/svg", button)
        self.assertIn("viewBox", button)
        self.assertNotRegex(button, r"🔍|&#128269;|\\uD83D")

    def test_ordinary_evidence_button_has_question_accessible_name(self):
        accessible_name = function_body(
            self.html, "feedbackEvidenceAccessibleName"
        )
        self.assertIn(
            "`Show transcript evidence for Question ${questionNumbers[0]}`",
            accessible_name,
        )

    def test_paired_evidence_buttons_have_exact_accessible_names(self):
        self.assertIn(
            "Show transcript evidence for Questions 21–22", self.html
        )
        self.assertIn(
            "Show transcript evidence for Questions 23–24", self.html
        )

    def test_buttons_are_added_only_when_mapped_evidence_exists(self):
        builder = function_body(self.html, "buildTranscriptEvidenceButton")
        self.assertIn("evidenceSegmentsForQuestions(questionNumbers)", builder)
        self.assertIn("if(!segments.length) return null", builder)

    def test_evidence_state_is_separate_from_playback_state(self):
        self.assertIn("let activeEvidenceQuestion = null", self.html)
        self.assertIn("let activeEvidenceSegmentIds = []", self.html)
        self.assertIn("let currentAudioscriptSegmentId = ''", self.html)

    def test_evidence_rows_use_amber_without_taking_aria_current(self):
        apply_state = function_body(
            self.html, "applyTranscriptEvidenceState"
        )
        self.assertIn("is-evidence-phrase", apply_state)
        self.assertNotIn("aria-current", apply_state)
        sync = function_body(self.html, "updateActiveTranscriptSync")
        self.assertIn("aria-current", sync)

    def test_playback_and_evidence_styles_can_coexist(self):
        self.assertIn(".audioscript-segment.is-evidence-phrase", self.html)
        self.assertIn(
            ".audioscript-segment.is-current-phrase.is-evidence-phrase",
            self.html,
        )
        coexist = re.search(
            r"\.audioscript-segment\.is-current-phrase\.is-evidence-phrase"
            r"\s*\{(?P<body>[^}]+)\}",
            self.html,
        )
        self.assertIsNotNone(coexist)
        self.assertIn("var(--correct-soft)", coexist.group("body"))
        self.assertRegex(coexist.group("body"), r"#(?:f59e0b|d97706)")

    def test_evidence_navigation_switches_media_and_seeks_first_evidence_phrase(self):
        show = function_body(self.html, "showTranscriptEvidence")
        self.assertIn("getSectionForQuestion(questionNumbers[0])", show)
        self.assertIn("const wasPlaying=isMediaActuallyPlaying()", show)
        self.assertIn("getSectionAudioSourcePart()!==targetPart", show)
        self.assertIn("switchSection(targetPart)", show)
        self.assertIn(
            "requestStudyAudioUserSeek(targetPart,segments[0],wasPlaying)", show
        )
        self.assertNotIn("updateSectionAudio", show)
        self.assertNotIn("sectionAudio.currentTime", show)
        self.assertNotIn("sectionAudio.play", show)
        self.assertNotIn("sectionAudio.pause", show)

    def test_evidence_seek_uses_chronological_mapping_and_exact_q34_start(self):
        resolver = function_body(self.html, "evidenceSegmentsForQuestions")
        self.assertIn(
            "matches.sort((first,second)=>first.part-second.part || first.start-second.start)",
            resolver,
        )
        q34 = [
            segment
            for segment in self.segments
            if 34 in segment["questions"]
        ]
        self.assertTrue(q34)
        self.assertEqual(q34[0]["id"], "p4-s013")
        self.assertAlmostEqual(q34[0]["start"], 183.969, places=3)

    def test_evidence_seek_marks_first_row_as_playback_and_all_rows_as_evidence(self):
        show = function_body(self.html, "showTranscriptEvidence")
        request = function_body(self.html, "requestStudyAudioUserSeek")
        marker = function_body(self.html, "markCurrentAudioscriptSegment")
        self.assertIn("activeEvidenceSegmentIds=segments.map", show)
        self.assertIn("markCurrentAudioscriptSegment(segment.id)", request)
        self.assertIn("is-current-phrase", marker)
        self.assertIn("aria-current", marker)

    def test_evidence_navigation_reveals_and_renders_the_script(self):
        show = function_body(self.html, "showTranscriptEvidence")
        self.assertIn("renderAudioscriptPanel()", show)
        self.assertIn("setAudioscriptExpanded(true)", show)
        self.assertIn("requestAnimationFrame", show)

    def test_evidence_navigation_scrolls_only_the_transcript_body(self):
        focus = function_body(self.html, "focusTranscriptEvidence")
        self.assertIn("audioscriptBody.scrollTop", focus)
        self.assertIn("markTranscriptProgrammaticScroll", focus)
        self.assertIn("focus({preventScroll:true})", focus)
        self.assertNotIn("window.scroll", focus)
        self.assertNotIn("studyQuestionPane.scroll", focus)
        self.assertNotIn("scrollIntoView", focus)

    def test_evidence_navigation_does_not_change_following_state(self):
        show = function_body(self.html, "showTranscriptEvidence")
        focus = function_body(self.html, "focusTranscriptEvidence")
        request = function_body(self.html, "requestStudyAudioUserSeek")
        for source in (show, focus, request):
            self.assertNotIn("transcriptFollowingEnabled=", source)
            self.assertNotIn("transcriptFollowingBySection", source)
            self.assertNotIn("resumeTranscriptFollowing", source)

    def test_multiple_mapped_segments_are_all_highlighted(self):
        q6 = [
            segment["id"]
            for segment in self.segments
            if 6 in segment["questions"]
        ]
        self.assertGreaterEqual(len(q6), 3)
        apply_state = function_body(
            self.html, "applyTranscriptEvidenceState"
        )
        self.assertIn("activeEvidenceSegmentIds.includes(row.id)", apply_state)

    def test_evidence_persists_through_script_rerender_and_hide_show(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        expanded = function_body(self.html, "setAudioscriptExpanded")
        self.assertIn("applyTranscriptEvidenceState()", renderer)
        self.assertNotIn("clearTranscriptEvidence", expanded)

    def test_new_selection_replaces_old_and_fresh_session_clears_it(self):
        show = function_body(self.html, "showTranscriptEvidence")
        reset = function_body(self.html, "resetListeningStudyFeedbackState")
        self.assertIn("activeEvidenceQuestion=", show)
        self.assertIn("activeEvidenceSegmentIds=", show)
        self.assertIn("clearTranscriptEvidence()", reset)

    def test_manual_other_part_can_hide_then_restore_evidence(self):
        apply_state = function_body(
            self.html, "applyTranscriptEvidenceState"
        )
        self.assertIn("audioscriptPanel.dataset.part", apply_state)
        self.assertIn("getSectionForQuestion", apply_state)
        self.assertIn("classList.toggle", apply_state)

    def test_active_test_mode_still_hides_feedback_and_transcript(self):
        controls = function_body(
            self.html, "syncListeningStudyTaskControls"
        )
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertIn("const visible=isStudyExperience()", controls)
        self.assertNotIn("mode==='test'", renderer)
        self.assertIn("audioscriptPanel.hidden=!shouldShow", renderer)

    def test_batch_does_not_add_notes_highlighting_or_annotation_storage(self):
        block = self.html[
            self.html.index("const listeningQuestionFeedback")
            : self.html.index("function fullscreenElement")
        ]
        for forbidden in (
            "studentNotes",
            "annotationStorage",
            "selectionToolbar",
            "studentHighlight",
            "contenteditable",
        ):
            self.assertNotIn(forbidden, block)


if __name__ == "__main__":
    unittest.main()
