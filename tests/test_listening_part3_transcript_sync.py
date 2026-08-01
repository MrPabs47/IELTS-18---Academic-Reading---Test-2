"""Static contract tests for the IELTS 16 Test 1 Part 3 Study audioscript."""

import hashlib
import json
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

PART_1_FOUNDATION_SHA256 = (
    "fef1c013390af928b0a31b57a7c52dfad44391b2b99e0857333f75245e6c8fb0"
)
PART_1_TIMING_SHA256 = (
    "a4d1787060c4a2f0fb040043e9a90c309e68a6752bf3f664edd30a6f529b112d"
)
PART_2_FOUNDATION_SHA256 = (
    "39494101b8347ee7cce3c22fceb6d33810cb0e3bd5cb5a3c40a14f5938e4faa5"
)
PART_2_TIMING_SHA256 = (
    "71d27cd8a0ae34f18a151fa0c7c2ef4750997b88c7bab612a9207d37b7f079fd"
)

SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p[123]-[is]\d{3})", speaker: "(?P<speaker>[^"]+)", '
    r'text: "(?P<text>[^"]+)", relatedQuestions: \[(?P<questions>[^\]]*)\], '
    r'start: (?P<start>\d+(?:\.\d+)?), end: (?P<end>\d+(?:\.\d+)?) \}'
)


def function_body(html: str, name: str) -> str:
    match = re.search(
        rf"(?:async\s+)?function {re.escape(name)}\([^)]*\)\s*\{{", html
    )
    if not match:
        raise AssertionError(f"Function {name} was not found")
    opening = match.end() - 1
    depth = 0
    for index in range(opening, len(html)):
        if html[index] == "{":
            depth += 1
        elif html[index] == "}":
            depth -= 1
            if depth == 0:
                return html[opening + 1 : index]
    raise AssertionError(f"Function {name} was not closed")


def parse_segments(source: str, prefix: str):
    parsed = []
    for match in SEGMENT_PATTERN.finditer(source):
        if not match.group("id").startswith(prefix):
            continue
        parsed.append(
            {
                "id": match.group("id"),
                "speaker": match.group("speaker"),
                "text": match.group("text"),
                "relatedQuestions": [
                    int(value.strip())
                    for value in match.group("questions").split(",")
                    if value.strip()
                ],
                "start": float(match.group("start")),
                "end": float(match.group("end")),
            }
        )
    return parsed


def foundation_hash(segments):
    payload = [
        {
            "id": item["id"],
            "speaker": item["speaker"],
            "text": item["text"],
            "relatedQuestions": item["relatedQuestions"],
        }
        for item in segments
    ]
    encoded = json.dumps(
        payload, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def timing_hash(segments):
    payload = [[item["id"], item["start"], item["end"]] for item in segments]
    encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


class ListeningPart3TranscriptSyncStaticContractTest(unittest.TestCase):
    """Static contracts for Part 3 transcript data, sync, seeking, and layout."""

    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        part3_match = re.search(
            r"const part3TranscriptData = \{(?P<body>.*?)\n    \};\n"
            r"    const listeningStudyData",
            cls.html,
            re.DOTALL,
        )
        if not part3_match:
            raise AssertionError("part3TranscriptData was not found")
        cls.part3_source = part3_match.group("body")
        cls.part3_segments = parse_segments(cls.part3_source, "p3-")
        cls.part2_segments = parse_segments(cls.html, "p2-")
        cls.part1_segments = parse_segments(cls.html, "p1-")

    def test_static_contract_part_three_has_genuine_transcript_data(self):
        self.assertEqual(len(self.part3_segments), 54)
        self.assertIn(
            "listeningStudyData.parts[3]=part3TranscriptData", self.html
        )
        self.assertIn('audioSrc: "./Test 1 Part 3.mp3"', self.part3_source)

    def test_static_contract_instruction_and_speaker_ids_are_stable_unique(self):
        ids = [segment["id"] for segment in self.part3_segments]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(
            [item for item in ids if item.startswith("p3-i")],
            [f"p3-i{number:03d}" for number in range(1, 9)],
        )
        self.assertEqual(
            [item for item in ids if item.startswith("p3-s")],
            [f"p3-s{number:03d}" for number in range(1, 47)],
        )

    def test_static_contract_all_rows_have_numeric_ordered_timestamps(self):
        previous_start = -1.0
        for segment in self.part3_segments:
            self.assertIsInstance(segment["start"], float)
            self.assertIsInstance(segment["end"], float)
            self.assertGreaterEqual(segment["start"], 0.0)
            self.assertGreater(segment["end"], segment["start"])
            self.assertGreaterEqual(segment["start"], previous_start)
            previous_start = segment["start"]

    def test_static_contract_transcript_text_is_non_empty(self):
        for segment in self.part3_segments:
            self.assertEqual(segment["text"], segment["text"].strip())
            self.assertTrue(segment["text"])

    def test_static_contract_speaker_labels_are_consistent(self):
        self.assertIn('Narrator: { label: "Narrator" }', self.part3_source)
        self.assertIn('jess: { label: "Jess" }', self.part3_source)
        self.assertIn('tom: { label: "Tom" }', self.part3_source)
        self.assertEqual(
            {segment["speaker"] for segment in self.part3_segments},
            {"Narrator", "jess", "tom"},
        )

    def test_static_contract_excludes_hallucinated_duplicate_instructions(self):
        texts = [segment["text"] for segment in self.part3_segments]
        self.assertEqual(len(texts), len(set(texts)))
        self.assertNotIn("No.", texts)
        self.assertEqual(texts.count("That is the end of Part 3."), 1)
        self.assertEqual(
            texts.count(
                "You now have half a minute to check your answers to Part 3."
            ),
            1,
        )

    def test_static_contract_base_part_four_placeholder_remains_empty(self):
        self.assertRegex(
            self.html,
            r'4: \{ audioSrc: "\./Test 1 Part 4\.mp3", '
            r'speakers: \{\}, segments: \[\] \}',
        )

    def test_static_contract_part_one_hashes_are_unchanged(self):
        conversation = [
            item for item in self.part1_segments if item["id"].startswith("p1-s")
        ]
        self.assertEqual(len(self.part1_segments), 71)
        self.assertEqual(len(conversation), 56)
        self.assertEqual(
            foundation_hash(conversation), PART_1_FOUNDATION_SHA256
        )
        self.assertEqual(timing_hash(conversation), PART_1_TIMING_SHA256)

    def test_static_contract_part_two_hashes_and_data_are_unchanged(self):
        self.assertEqual(len(self.part2_segments), 41)
        self.assertEqual(
            foundation_hash(self.part2_segments), PART_2_FOUNDATION_SHA256
        )
        self.assertEqual(
            timing_hash(self.part2_segments), PART_2_TIMING_SHA256
        )

    def test_static_contract_questions_twenty_one_to_thirty_have_evidence(self):
        mapped = {
            question
            for segment in self.part3_segments
            for question in segment["relatedQuestions"]
        }
        self.assertEqual(mapped, set(range(21, 31)))

    def test_static_contract_evidence_is_confined_to_defensible_rows(self):
        expected = {
            21: ["p3-s007", "p3-s008"],
            22: ["p3-s004", "p3-s005"],
            23: ["p3-s022", "p3-s023", "p3-s024"],
            24: ["p3-s013", "p3-s014"],
            25: ["p3-s027"],
            26: ["p3-s030"],
            27: ["p3-s034"],
            28: ["p3-s038", "p3-s039"],
            29: ["p3-s043"],
            30: ["p3-s045"],
        }
        actual = {
            question: [
                segment["id"]
                for segment in self.part3_segments
                if question in segment["relatedQuestions"]
            ]
            for question in range(21, 31)
        }
        self.assertEqual(actual, expected)

    def test_static_contract_narrator_rows_have_no_answer_mappings(self):
        for segment in self.part3_segments:
            if segment["id"].startswith("p3-i"):
                self.assertEqual(segment["speaker"], "Narrator")
                self.assertEqual(segment["relatedQuestions"], [])

    def test_static_contract_study_and_submitted_review_render_part_three(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertIn(
            "const partData=listeningStudyData.parts[activeSection]", renderer
        )
        self.assertIn(
            "const shouldShow=mode==='study' && hasTranscript || "
            "submittedReview && hasTranscript",
            renderer,
        )
        self.assertIn("partHasTranscript(activeSection)", renderer)

    def test_static_contract_active_test_mode_cannot_render_transcript(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertNotIn("mode==='test'", renderer)
        self.assertIn("audioscriptPanel.hidden=!shouldShow", renderer)
        self.assertIn("if(!shouldShow) return", renderer)

    def test_static_contract_part_three_uses_green_current_phrase_and_aria_current(self):
        sync = function_body(self.html, "updateActiveTranscriptSync")
        self.assertIn("next.classList.add('is-current-phrase')", sync)
        self.assertIn("next.setAttribute('aria-current','true')", sync)
        self.assertIn("var(--correct-soft)", self.html)
        self.assertIn("var(--correct)", self.html)

    def test_static_contract_genuine_gaps_clear_the_current_phrase(self):
        finder = function_body(self.html, "findTranscriptSegment")
        sync = function_body(self.html, "updateActiveTranscriptSync")
        self.assertIn("time>=segment.start && time<segment.end", finder)
        self.assertIn("const nextId=segment ? segment.id : ''", sync)
        self.assertIn("clearCurrentAudioscriptSegment()", sync)
        self.assertGreater(
            self.part3_segments[3]["start"] - self.part3_segments[2]["end"],
            19,
        )
        transition = next(
            item for item in self.part3_segments if item["id"] == "p3-i006"
        )
        preceding = next(
            item for item in self.part3_segments if item["id"] == "p3-i005"
        )
        self.assertGreater(transition["start"] - preceding["end"], 29)

    def test_static_contract_auto_follow_scrolls_only_the_transcript_body(self):
        follow = function_body(self.html, "followCurrentAudioscriptSegment")
        sync = function_body(self.html, "updateActiveTranscriptSync")
        self.assertIn(
            "audioscriptBody.scrollTop=markTranscriptProgrammaticScroll", follow
        )
        self.assertIn("followCurrentAudioscriptSegment", sync)
        self.assertNotIn("window.scroll", follow)
        self.assertNotIn("studyQuestionPane", follow)
        self.assertNotIn("scrollIntoView", follow)

    def test_static_contract_manual_scrolling_pauses_following(self):
        setup = function_body(self.html, "setupTranscriptFollowingInteractions")
        pause = function_body(self.html, "pauseTranscriptFollowing")
        for event_name in ("wheel", "touchmove", "keydown", "pointerdown"):
            self.assertIn(event_name, setup)
        self.assertIn("transcriptFollowingEnabled=false", pause)
        self.assertIn(
            "transcriptFollowingBySection[activeSection]=false", pause
        )

    def test_static_contract_resume_following_uses_active_part(self):
        resume = function_body(self.html, "resumeTranscriptFollowing")
        self.assertIn("transcriptFollowingEnabled=true", resume)
        self.assertIn(
            "transcriptFollowingBySection[activeSection]=true", resume
        )
        self.assertIn("updateActiveTranscriptSync({forceFollow:true})", resume)

    def test_static_contract_pointer_and_keyboard_share_one_handler_system(self):
        setup = function_body(self.html, "setupTranscriptSeekInteractions")
        self.assertEqual(
            self.html.count("setupTranscriptSeekInteractions();"), 1
        )
        for event_name in (
            "pointerdown",
            "pointermove",
            "pointerup",
            "pointercancel",
            "click",
            "keydown",
        ):
            self.assertIn(
                f"audioscriptBody.addEventListener('{event_name}'", setup
            )
        self.assertIn("activateActiveTranscriptRow(row)", setup)
        self.assertIn("event.key!=='Enter' && event.key!==' '", setup)

    def test_static_contract_phrase_activation_always_seeks_and_plays(self):
        activate = function_body(self.html, "activateActiveTranscriptRow")
        request = function_body(self.html, "requestStudyAudioUserSeek")
        playback = function_body(self.html, "requestPendingStudyAudioPlayback")
        self.assertIn("requestStudyAudioUserSeek(section,segment,true)", activate)
        self.assertIn("shouldPlay:Boolean(shouldPlay)", request)
        self.assertIn("playRequestedForSource:''", request)
        self.assertEqual(playback.count("sectionAudio.play()"), 1)
        self.assertIn(".catch(()=>false)", playback)

    def test_static_contract_ended_audio_uses_the_same_play_intent(self):
        activate = function_body(self.html, "activateActiveTranscriptRow")
        playback = function_body(self.html, "requestPendingStudyAudioPlayback")
        self.assertIn("requestStudyAudioUserSeek(section,segment,true)", activate)
        self.assertIn("!sectionAudio.ended", playback)
        self.assertIn("sectionAudio.play()", playback)

    def test_static_contract_text_selection_does_not_seek(self):
        setup = function_body(self.html, "setupTranscriptSeekInteractions")
        selection = function_body(self.html, "transcriptSelectionIsCollapsed")
        self.assertIn("window.getSelection()", selection)
        self.assertIn("selection.isCollapsed", selection)
        self.assertIn("pointerGesture.selectionWasCollapsed", setup)
        self.assertIn("transcriptSelectionIsCollapsed()", setup)
        self.assertIn("Math.hypot", setup)

    def test_static_contract_part_three_and_two_are_zero_based_but_part_one_is_ten(self):
        floor = function_body(self.html, "getStudyAudioFloor")
        normalise = function_body(self.html, "normaliseStudyAudioPosition")
        self.assertIn(
            "section===1 ? PART_1_FRESH_START_SECONDS : 0", floor
        )
        self.assertIn("Math.max(floor,position)", normalise)
        self.assertEqual(self.part3_segments[0]["start"], 0.0)
        self.assertIn(
            "targetTime:normaliseStudyAudioPosition(section,segment.start)",
            function_body(self.html, "requestStudyAudioUserSeek"),
        )

    def test_static_contract_independent_transcript_state_is_remembered(self):
        save = function_body(self.html, "saveStudyLayoutState")
        restore = function_body(self.html, "restoreStudyLayoutState")
        self.assertIn(
            "studyAudioscriptScrollPositions = {1:0,2:0,3:0,4:0}",
            self.html,
        )
        self.assertIn(
            "transcriptFollowingBySection = {1:true,2:true,3:true,4:true}",
            self.html,
        )
        self.assertIn(
            "studyAudioscriptScrollPositions[section]=audioscriptBody.scrollTop",
            save,
        )
        self.assertIn(
            "studyAudioscriptScrollPositions[section] || 0", restore
        )

    def test_static_contract_part_three_desktop_uses_shared_split_layout(self):
        layout = function_body(self.html, "updateStudySplitLayout")
        self.assertIn(
            "isStudyExperience() && activeSection===3 && partHasTranscript(3)",
            layout,
        )
        self.assertIn("studyWorkspace.classList.add('is-split')", layout)
        self.assertEqual(self.html.count('id="audioscriptBody"'), 1)
        self.assertEqual(self.html.count('id="studyDivider"'), 1)

    def test_static_contract_part_three_has_safe_question_pane_minimum(self):
        bounds = function_body(self.html, "getStudySplitBounds")
        apply_ratio = function_body(self.html, "applyStudySplitRatio")
        self.assertIn(
            "const PART_3_STUDY_QUESTION_MIN_WIDTH = 720", self.html
        )
        self.assertIn(
            "activeSection===3 ? PART_3_STUDY_QUESTION_MIN_WIDTH", bounds
        )
        self.assertIn(
            "minimumQuestionWidth+STUDY_AUDIOSCRIPT_MIN_WIDTH", bounds
        )
        self.assertIn(
            "if(!preserveRequested) studySplitRatio=appliedRatio", apply_ratio
        )
        self.assertIn(
            "applyStudySplitRatio(studySplitRatio,"
            "{save:false,preserveRequested:true})",
            self.html,
        )

    def test_static_contract_mobile_hides_divider_and_caps_transcript(self):
        mobile = re.search(
            r"@media \(max-width: 900px\) \{(?P<body>.*?)\n\s*\}\n\s*</style>",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(mobile)
        body = mobile.group("body")
        self.assertIn(".study-divider", body)
        self.assertIn("display: none !important", body)
        self.assertRegex(
            body, r"audioscript-body\s*\{[^}]*max-height:\s*300px"
        )
        self.assertIn(
            ".study-workspace.is-split .audioscript-body { max-height: 300px; }",
            self.html,
        )
        self.assertIn("grid-template-columns: 1fr", body)

    def test_static_contract_hide_script_restores_full_question_width(self):
        layout = function_body(self.html, "updateStudySplitLayout")
        self.assertIn(
            "studyWorkspace.classList.add("
            "'is-question-only','is-desktop-script-collapsed')",
            layout,
        )
        self.assertIn("audioscriptExternalToggle.hidden=false", layout)
        self.assertIn(
            "studyWorkspace.style.removeProperty('--study-question-width')",
            layout,
        )

    def test_static_contract_review_locks_all_part_three_answer_controls(self):
        lock = function_body(self.html, "enforceSubmittedReviewAnswerLock")
        custom_lock = function_body(self.html, "setCustomDragLocked")
        switch = function_body(self.html, "switchSection")
        self.assertIn("el.disabled=true", lock)
        self.assertIn("setCustomDragLocked(true)", lock)
        self.assertIn("choice.inert=locked", custom_lock)
        self.assertIn("slot.inert=locked", custom_lock)
        self.assertIn("btn.disabled=locked", custom_lock)
        self.assertIn(
            "if(submittedReview) enforceSubmittedReviewAnswerLock()", switch
        )
        self.assertIn(
            ".submitted-review-active input:disabled", self.html
        )

    def test_static_contract_review_feedback_groups_remain_visible(self):
        feedback = function_body(self.html, "renderSubmittedReviewFeedback")
        self.assertIn("[21,22]", feedback)
        self.assertIn("[23,24]", feedback)
        self.assertIn("[25,26,27,28,29,30]", feedback)
        self.assertIn("markBlock", feedback)

    def test_static_contract_review_never_autoplays_or_restarts_test_audio(self):
        update_audio = function_body(self.html, "updateSectionAudio")
        enter_review = function_body(self.html, "activateSubmittedReview")
        initialise_review_audio = function_body(
            self.html, "initialiseSubmittedReviewAudioPositions"
        )
        self.assertIn("sectionAudio.pause()", initialise_review_audio)
        self.assertIn(
            "initialiseSubmittedReviewAudioPositions()", enter_review
        )
        self.assertIn(
            "if(mode==='test' && !submitted && sectionAudio.paused)",
            update_audio,
        )
        self.assertNotIn("sectionAudio.play()", enter_review)

    def test_static_contract_untouched_part_has_no_current_phrase(self):
        self.assertIn(
            "transcriptSyncActivatedBySection = "
            "{1:false,2:false,3:false,4:false}",
            self.html,
        )
        reset = function_body(self.html, "resetPart1TranscriptFollowing")
        sync = function_body(self.html, "updateActiveTranscriptSync")
        self.assertIn(
            "transcriptSyncActivatedBySection="
            "{1:false,2:false,3:false,4:false}",
            reset,
        )
        self.assertIn(
            "if(!transcriptSyncActivatedBySection[section])"
            "{ clearCurrentAudioscriptSegment(); return; }",
            sync,
        )

    def test_static_contract_real_play_seek_and_phrase_activation_enable_sync(self):
        play = re.search(
            r"sectionAudio\.addEventListener\('play',\(\)=>\{(?P<body>.*?)\}\);",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(play)
        self.assertIn(
            "transcriptSyncActivatedBySection[sourcePart]=true",
            play.group("body"),
        )
        control = function_body(self.html, "beginStudyAudioControlInteraction")
        phrase = function_body(self.html, "requestStudyAudioUserSeek")
        self.assertIn(
            "transcriptSyncActivatedBySection[activeSection]=true", control
        )
        self.assertIn(
            "transcriptSyncActivatedBySection[section]=true", phrase
        )

    def test_static_contract_render_and_metadata_do_not_activate_sync(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertNotIn("transcriptSyncActivatedBySection[", renderer)
        for event_name in ("loadedmetadata", "loadeddata", "pause"):
            event = re.search(
                rf"sectionAudio\.addEventListener\('{event_name}',"
                rf"\(\)=>\{{(?P<body>.*?)\}}\);",
                self.html,
                re.DOTALL,
            )
            self.assertIsNotNone(event)
            self.assertNotIn(
                "transcriptSyncActivatedBySection[", event.group("body")
            )

    def test_static_contract_activation_survives_pause_and_part_navigation(self):
        switch = function_body(self.html, "switchSection")
        self.assertNotIn("transcriptSyncActivatedBySection[", switch)
        self.assertNotIn(
            "transcriptSyncActivatedBySection="
            "{1:false,2:false,3:false,4:false}",
            switch,
        )

    def test_static_contract_active_test_mode_hides_later_transcripts(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertIn("hasTranscript", renderer)
        self.assertIn("audioscriptPanel.hidden=!shouldShow", renderer)


if __name__ == "__main__":
    unittest.main()
