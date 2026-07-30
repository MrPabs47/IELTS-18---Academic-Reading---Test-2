"""Static contract tests for the IELTS 16 Test 1 Part 4 Study audioscript."""

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

FOUNDATION_HASHES = {
    1: "0022ec4971a38262b5cbbacedf56fabca3db523014f5d11ba64d2947db2dc521",
    2: "39494101b8347ee7cce3c22fceb6d33810cb0e3bd5cb5a3c40a14f5938e4faa5",
    3: "a4a513fe61c11d4f4bfcf97f2c17c2712a8da7478f338c4aff6ad659c7020614",
}
TIMING_HASHES = {
    1: "5ad9563d458367f1352b95696451c1273348f766437dce70dcf57daba17dec6d",
    2: "71d27cd8a0ae34f18a151fa0c7c2ef4750997b88c7bab612a9207d37b7f079fd",
    3: "0607ac72d7574c093e91f3039d79a1479cdbcdab205ea81e2a64aad4b2d70e54",
}
EXPECTED_EVIDENCE = {
    31: ["p4-s003"],
    32: ["p4-s006"],
    33: ["p4-s012"],
    34: ["p4-s013"],
    35: ["p4-s017"],
    36: ["p4-s021"],
    37: ["p4-s026"],
    38: ["p4-s027"],
    39: ["p4-s029"],
    40: ["p4-s033"],
}

SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p[1234]-[is]\d{3})", speaker: "(?P<speaker>[^"]+)", '
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


class ListeningPart4TranscriptSyncStaticContractTest(unittest.TestCase):
    """Static contracts for Part 4 data, sync, seeking, layout, and review."""

    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        part4_match = re.search(
            r"const part4TranscriptData = \{(?P<body>.*?)\n    \};\n"
            r"    const listeningStudyData",
            cls.html,
            re.DOTALL,
        )
        if not part4_match:
            raise AssertionError("part4TranscriptData was not found")
        cls.part4_source = part4_match.group("body")
        cls.segments = {
            part: parse_segments(cls.html, f"p{part}-")
            for part in range(1, 5)
        }

    def test_static_contract_part_four_has_genuine_transcript_data(self):
        self.assertEqual(len(self.segments[4]), 44)
        self.assertIn(
            "listeningStudyData.parts[4]=part4TranscriptData", self.html
        )
        self.assertIn('audioSrc: "./Test 1 Part 4.mp3"', self.part4_source)

    def test_static_contract_ids_are_stable_unique_and_complete(self):
        ids = [segment["id"] for segment in self.segments[4]]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(
            [item for item in ids if item.startswith("p4-i")],
            [f"p4-i{number:03d}" for number in range(1, 9)],
        )
        self.assertEqual(
            [item for item in ids if item.startswith("p4-s")],
            [f"p4-s{number:03d}" for number in range(1, 37)],
        )

    def test_static_contract_timestamps_are_numeric_valid_and_ordered(self):
        previous_start = -1.0
        for segment in self.segments[4]:
            self.assertIsInstance(segment["start"], float)
            self.assertIsInstance(segment["end"], float)
            self.assertGreaterEqual(segment["start"], 0.0)
            self.assertGreater(segment["end"], segment["start"])
            self.assertGreaterEqual(segment["start"], previous_start)
            previous_start = segment["start"]

    def test_static_contract_part_four_has_no_overlapping_segments(self):
        for previous, current in zip(self.segments[4], self.segments[4][1:]):
            self.assertGreaterEqual(current["start"], previous["end"])

    def test_static_contract_text_is_non_empty_and_trimmed(self):
        for segment in self.segments[4]:
            self.assertTrue(segment["text"])
            self.assertEqual(segment["text"], segment["text"].strip())

    def test_static_contract_speaker_labels_are_consistent(self):
        self.assertIn('Narrator: { label: "Narrator" }', self.part4_source)
        self.assertIn('lecturer: { label: "Lecturer" }', self.part4_source)
        self.assertEqual(
            {segment["speaker"] for segment in self.segments[4]},
            {"Narrator", "lecturer"},
        )

    def test_static_contract_genuine_instructions_are_unique(self):
        texts = [segment["text"] for segment in self.segments[4]]
        self.assertEqual(len(texts), len(set(texts)))
        self.assertNotIn("Thank you.", texts)
        self.assertEqual(texts.count("That is the end of Part 4."), 1)
        self.assertEqual(
            texts.count(
                "You now have one minute to check your answers to Part 4."
            ),
            1,
        )
        self.assertEqual(
            texts.count("That is the end of the Listening test."), 1
        )

    def test_static_contract_parts_one_to_three_hashes_are_unchanged(self):
        expected_counts = {1: 71, 2: 41, 3: 54}
        for part in range(1, 4):
            with self.subTest(part=part):
                self.assertEqual(len(self.segments[part]), expected_counts[part])
                self.assertEqual(
                    foundation_hash(self.segments[part]),
                    FOUNDATION_HASHES[part],
                )
                self.assertEqual(
                    timing_hash(self.segments[part]), TIMING_HASHES[part]
                )

    def test_static_contract_questions_thirty_one_to_forty_have_evidence(self):
        mapped = {
            question
            for segment in self.segments[4]
            for question in segment["relatedQuestions"]
        }
        self.assertEqual(mapped, set(range(31, 41)))

    def test_static_contract_evidence_is_confined_to_defensible_rows(self):
        actual = {
            question: [
                segment["id"]
                for segment in self.segments[4]
                if question in segment["relatedQuestions"]
            ]
            for question in range(31, 41)
        }
        self.assertEqual(actual, EXPECTED_EVIDENCE)

    def test_static_contract_narrator_rows_have_no_answer_mappings(self):
        for segment in self.segments[4]:
            if segment["id"].startswith("p4-i"):
                self.assertEqual(segment["speaker"], "Narrator")
                self.assertEqual(segment["relatedQuestions"], [])

    def test_static_contract_part_four_question_controls_and_answers_unchanged(self):
        for question in range(31, 41):
            self.assertEqual(
                len(re.findall(rf'name="q{question}" type="text"', self.html)),
                1,
            )
        self.assertIn('id="ca-31-40"', self.html)
        self.assertIn(
            "31:['practical'],32:['publication'],33:['choices'],"
            "34:['negative'],35:['play'],36:['capitalism'],"
            "37:['depression'],38:['logic'],39:['opportunity'],"
            "40:['practice','practise']",
            self.html,
        )
        self.assertIn("Write <strong>ONE WORD ONLY</strong>", self.html)

    def test_static_contract_study_and_submitted_review_render_part_four(self):
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

    def test_static_contract_active_test_mode_hides_part_four_transcript(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertNotIn("mode==='test'", renderer)
        self.assertIn("audioscriptPanel.hidden=!shouldShow", renderer)
        self.assertIn("if(!shouldShow) return", renderer)

    def test_static_contract_green_current_phrase_and_aria_current_are_shared(self):
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
        by_id = {item["id"]: item for item in self.segments[4]}
        self.assertGreater(
            by_id["p4-i004"]["start"] - by_id["p4-i003"]["end"], 50
        )
        self.assertGreater(
            by_id["p4-s016"]["start"] - by_id["p4-s015"]["end"], 5
        )
        self.assertGreater(
            by_id["p4-i007"]["start"] - by_id["p4-i006"]["end"], 60
        )

    def test_static_contract_auto_follow_scrolls_only_transcript_body(self):
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

    def test_static_contract_pointer_and_keyboard_use_shared_seek_handlers(self):
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

    def test_static_contract_part_four_is_zero_based_and_part_one_is_ten(self):
        floor = function_body(self.html, "getStudyAudioFloor")
        normalise = function_body(self.html, "normaliseStudyAudioPosition")
        self.assertIn(
            "section===1 ? PART_1_FRESH_START_SECONDS : 0", floor
        )
        self.assertIn("Math.max(floor,position)", normalise)
        self.assertIn(
            "targetTime:normaliseStudyAudioPosition(section,segment.start)",
            function_body(self.html, "requestStudyAudioUserSeek"),
        )
        self.assertGreater(self.segments[4][0]["start"], 0.0)

    def test_static_contract_part_four_state_is_independent_and_remembered(self):
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

    def test_static_contract_part_four_desktop_uses_shared_split_layout(self):
        layout = function_body(self.html, "updateStudySplitLayout")
        self.assertIn(
            "isStudyExperience() && activeSection===4 && partHasTranscript(4)",
            layout,
        )
        self.assertIn("studyWorkspace.classList.add('is-split')", layout)
        self.assertEqual(self.html.count('id="audioscriptBody"'), 1)
        self.assertEqual(self.html.count('id="studyDivider"'), 1)

    def test_static_contract_part_four_has_safe_question_pane_minimum(self):
        bounds = function_body(self.html, "getStudySplitBounds")
        self.assertIn(
            "const PART_4_STUDY_QUESTION_MIN_WIDTH = 640", self.html
        )
        self.assertIn(
            "activeSection===4 ? PART_4_STUDY_QUESTION_MIN_WIDTH", bounds
        )
        self.assertIn(
            "minimumQuestionWidth+STUDY_AUDIOSCRIPT_MIN_WIDTH", bounds
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

    def test_static_contract_submitted_part_four_answers_remain_locked(self):
        lock = function_body(self.html, "enforceSubmittedReviewAnswerLock")
        switch = function_body(self.html, "switchSection")
        self.assertIn("el.disabled=true", lock)
        self.assertIn(
            "if(submittedReview) enforceSubmittedReviewAnswerLock()", switch
        )
        self.assertIn(".submitted-review-active input:disabled", self.html)

    def test_static_contract_study_check_pauses_without_resetting_time(self):
        pause = function_body(self.html, "pauseStudyAudioForChecking")
        submit = function_body(self.html, "submitTest")
        self.assertIn("sectionAudio.pause()", pause)
        self.assertIn("saveStudyAudioPosition(activeSection)", pause)
        self.assertNotIn("sectionAudio.currentTime=", pause)
        self.assertIn(
            "if(!finalTestSubmission && !submittedReview) "
            "pauseStudyAudioForChecking()",
            submit,
        )

    def test_static_contract_test_mode_sequential_playback_is_unchanged(self):
        self.assertIn(
            "if(mode==='test' && !submitted && playbackSection<4)"
            "{ playbackSection += 1; updateSectionAudio(); return; }",
            self.html,
        )
        update_audio = function_body(self.html, "updateSectionAudio")
        self.assertIn(
            "const sectionForAudio=shouldShow ? activeSection : playbackSection",
            update_audio,
        )

    def test_static_contract_all_four_parts_share_study_review_only_data_path(self):
        for part in range(2, 5):
            self.assertIn(
                f"listeningStudyData.parts[{part}]=part{part}TranscriptData",
                self.html,
            )
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertIn(
            "mode==='study' && hasTranscript || submittedReview && hasTranscript",
            renderer,
        )
        self.assertNotIn("mode==='test'", renderer)

    def test_static_contract_review_remains_paused_and_feedback_visible(self):
        enter_review = function_body(self.html, "activateSubmittedReview")
        initialise = function_body(
            self.html, "initialiseSubmittedReviewAudioPositions"
        )
        feedback = function_body(self.html, "renderSubmittedReviewFeedback")
        self.assertIn("sectionAudio.pause()", initialise)
        self.assertNotIn("sectionAudio.play()", enter_review)
        self.assertIn(
            "[31,32,33,34,35,36,37,38,39,40]", feedback
        )

    def test_static_contract_transcript_contains_no_word_level_timings(self):
        self.assertNotRegex(self.part4_source, r"\bwords\s*:")


if __name__ == "__main__":
    unittest.main()
