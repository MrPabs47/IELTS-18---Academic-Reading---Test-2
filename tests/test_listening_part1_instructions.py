"""Static contract tests for IELTS 16 Test 1 Part 1 spoken instructions."""

import hashlib
import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"

FOUNDATION_SHA256 = "fef1c013390af928b0a31b57a7c52dfad44391b2b99e0857333f75245e6c8fb0"
TIMING_SHA256 = "a4d1787060c4a2f0fb040043e9a90c309e68a6752bf3f664edd30a6f529b112d"

SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p1-[is]\d{3})", speaker: "(?P<speaker>[^"]+)", '
    r'text: "(?P<text>[^"]+)", relatedQuestions: \[(?P<questions>[^\]]*)\], '
    r'start: (?P<start>\d+(?:\.\d+)?), end: (?P<end>\d+(?:\.\d+)?) \}'
)

EXPECTED_INSTRUCTIONS = [
    ("p1-i001", "Test 1. This is the IELTS Listening test.", 11.080, 15.240),
    (
        "p1-i002",
        "You will hear a number of different recordings and you will have to answer questions on what you hear.",
        16.000,
        22.060,
    ),
    (
        "p1-i003",
        "There will be time for you to read the instructions and questions, and you will have a chance to check your work.",
        22.680,
        29.280,
    ),
    ("p1-i004", "All the recordings will be played once only.", 30.000, 33.240),
    ("p1-i005", "The test is in four parts.", 34.410, 36.660),
    (
        "p1-i006",
        "At the end of the test, you will be given ten minutes to transfer your answers to the answer sheet.",
        37.180,
        43.500,
    ),
    ("p1-i007", "Now turn to Part 1.", 45.070, 46.700),
    ("p1-i008", "Part 1.", 51.560, 52.600),
    (
        "p1-i009",
        "You will hear a man phoning to find out about some children's engineering workshops.",
        53.620,
        59.320,
    ),
    (
        "p1-i010",
        "First, you have some time to look at Questions 1 to 3.",
        60.360,
        64.420,
    ),
    (
        "p1-i011",
        "Now listen carefully and answer Questions 1 to 3.",
        78.760,
        83.560,
    ),
    (
        "p1-i012",
        "Before you hear the rest of the conversation,",
        170.440,
        172.960,
    ),
    (
        "p1-i013",
        "you have some time to look at Questions 4 to 10.",
        173.380,
        177.000,
    ),
    ("p1-i014", "That is the end of Part 1.", 385.560, 387.500),
    (
        "p1-i015",
        "You now have half a minute to check your answers to Part 1.",
        387.980,
        391.920,
    ),
]


def function_body(html: str, name: str) -> str:
    match = re.search(rf"(?:async\s+)?function {re.escape(name)}\([^)]*\)\s*\{{", html)
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


class ListeningPart1InstructionsStaticContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        data_match = re.search(
            r"const listeningStudyData = \{(?P<body>.*?)\n    \};\n    const sectionRanges",
            cls.html,
            re.DOTALL,
        )
        if not data_match:
            raise AssertionError("listeningStudyData was not found")
        cls.data = data_match.group("body")
        part1_match = re.search(
            r"1: \{(?P<body>.*?)\n\s*\]\n\s*\},\n\s*2:",
            cls.data,
            re.DOTALL,
        )
        if not part1_match:
            raise AssertionError("Part 1 transcript data was not found")
        cls.part1 = part1_match.group("body")
        cls.segments = []
        for match in SEGMENT_PATTERN.finditer(cls.part1):
            cls.segments.append(
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
        cls.instructions = [
            segment for segment in cls.segments if segment["id"].startswith("p1-i")
        ]
        cls.conversation = [
            segment for segment in cls.segments if segment["id"].startswith("p1-s")
        ]

    def test_static_contract_has_exact_approved_instruction_records(self):
        actual = [
            (item["id"], item["text"], item["start"], item["end"])
            for item in self.instructions
        ]
        self.assertEqual(actual, EXPECTED_INSTRUCTIONS)
        self.assertEqual(
            [item["id"] for item in self.instructions],
            [f"p1-i{number:03d}" for number in range(1, 16)],
        )
        for item in self.instructions:
            self.assertEqual(item["speaker"], "Narrator")
            self.assertEqual(item["relatedQuestions"], [])
            self.assertIsInstance(item["start"], float)
            self.assertIsInstance(item["end"], float)
            self.assertGreater(item["end"], item["start"])

    def test_static_contract_has_71_chronological_timed_rows(self):
        self.assertEqual(len(self.instructions), 15)
        self.assertEqual(len(self.conversation), 56)
        self.assertEqual(len(self.segments), 71)
        self.assertEqual(
            [item["id"] for item in self.conversation],
            [f"p1-s{number:03d}" for number in range(1, 57)],
        )
        self.assertEqual(
            [item["start"] for item in self.segments],
            sorted(item["start"] for item in self.segments),
        )

    def test_static_contract_preserves_all_56_conversation_records(self):
        foundation = [
            {
                "id": item["id"],
                "speaker": item["speaker"],
                "text": item["text"],
                "relatedQuestions": item["relatedQuestions"],
            }
            for item in self.conversation
        ]
        foundation_payload = json.dumps(
            foundation, ensure_ascii=False, separators=(",", ":")
        ).encode("utf-8")
        self.assertEqual(
            hashlib.sha256(foundation_payload).hexdigest(), FOUNDATION_SHA256
        )

        timings = [
            [item["id"], item["start"], item["end"]] for item in self.conversation
        ]
        timing_payload = json.dumps(timings, separators=(",", ":")).encode("utf-8")
        self.assertEqual(hashlib.sha256(timing_payload).hexdigest(), TIMING_SHA256)

    def test_static_contract_excludes_copyright_and_unreliable_transcript_text(self):
        visible_text = [item["text"] for item in self.segments]
        joined = "\n".join(visible_text).lower()
        self.assertEqual(visible_text[0], EXPECTED_INSTRUCTIONS[0][1])
        self.assertNotIn("this recording is copyright", joined)
        self.assertNotIn("publishing", joined)
        self.assertNotIn("and go to the hospital", joined)
        self.assertNotIn("okay", [text.strip().lower() for text in visible_text])
        self.assertEqual(
            visible_text.count("Before you hear the rest of the conversation,"), 1
        )

    def test_static_contract_sync_selects_both_row_types_and_real_gaps(self):
        selector = function_body(self.html, "findPart1TranscriptSegment")
        self.assertIn("listeningStudyData.parts[1].segments", selector)
        self.assertIn("time>=segment.start && time<segment.end", selector)
        self.assertIn("segment.start>=active.start", selector)

        def selected_id(time):
            candidates = [
                item
                for item in self.segments
                if item["start"] <= time < item["end"]
            ]
            return (
                max(candidates, key=lambda item: item["start"])["id"]
                if candidates
                else None
            )

        self.assertEqual(selected_id(11.080), "p1-i001")
        self.assertEqual(selected_id(87.150), "p1-s001")
        for gap in (10.000, 15.500, 70.000, 84.000, 168.000, 180.000, 200.000, 383.000, 392.000):
            self.assertIsNone(selected_id(gap))

    def test_static_contract_uses_one_renderer_and_one_green_active_treatment(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        sync = function_body(self.html, "updatePart1TranscriptSync")
        self.assertIn("partData.segments.forEach", renderer)
        self.assertIn("row.className='audioscript-segment'", renderer)
        self.assertIn("text.textContent=segment.text", renderer)
        self.assertIn("next.classList.add('is-current-phrase')", sync)
        self.assertIn("next.setAttribute('aria-current','true')", sync)
        self.assertIn("background: var(--correct-soft)", self.html)
        self.assertIn("box-shadow: inset 4px 0 0 var(--correct)", self.html)

    def test_static_contract_instruction_rows_use_one_delegated_seek_interaction(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertNotIn("addEventListener", renderer)
        self.assertNotIn("currentTime", renderer)
        self.assertEqual(
            self.html.count("audioscriptBody.addEventListener('click'"), 1
        )
        self.assertEqual(self.html.count("setupTranscriptSeekInteractions();"), 1)
        self.assertNotIn("seekToTranscript", self.html)
        self.assertNotIn("wordTimings", self.html)

    def test_static_contract_defines_one_clear_fresh_start_constant(self):
        matches = re.findall(
            r"const PART_1_FRESH_START_SECONDS = (\d+\.\d+);", self.html
        )
        self.assertEqual(matches, ["10.000"])

    def test_static_contract_study_applies_part_one_floor_to_saved_zero(self):
        reset = function_body(self.html, "resetStudyAudioPositions")
        restore = function_body(self.html, "restoreStudyAudioPosition")
        save = function_body(self.html, "saveStudyAudioPosition")
        self.assertIn(
            "studyAudioPositionInitialized={1:false,2:false,3:false,4:false}", reset
        )
        self.assertIn(
            "const hasSavedPosition=Boolean(studyAudioPositionInitialized[section])",
            restore,
        )
        self.assertIn("const freshStart=getStudyAudioFloor(section)", restore)
        self.assertIn("normaliseStudyAudioPosition(section,studyAudioPositions[section])", restore)
        self.assertIn("normaliseStudyAudioPosition(section,sectionAudio.currentTime)", save)
        self.assertIn("studyAudioPositionInitialized[section]=true", restore)
        self.assertIn("studyPart1FreshStartPending=false", restore)
        self.assertIn("studyAudioPositionInitialized[section]=true", save)
        self.assertNotIn("currentTime===0", restore)
        self.assertNotIn("currentTime === 0", restore)

        def restored(section, initialized, saved_position):
            floor = 10.0 if section == 1 else 0.0
            return max(floor, saved_position) if initialized else floor

        self.assertEqual(restored(1, False, 0.0), 10.0)
        self.assertEqual(restored(1, True, 0.0), 10.0)
        self.assertEqual(restored(1, True, 7.5), 10.0)
        self.assertEqual(restored(1, True, 137.25), 137.25)
        for section in (2, 3, 4):
            self.assertEqual(restored(section, False, 0.0), 0.0)
            self.assertEqual(restored(section, True, 0.0), 0.0)

    def test_static_contract_test_offset_is_pending_one_time_and_before_play(self):
        reset = function_body(self.html, "resetPart1FreshStart")
        apply_offset = function_body(self.html, "applyPendingTestPart1FreshStart")
        play = function_body(self.html, "playCurrentSectionAudio")
        started = function_body(self.html, "startApp")
        self.assertIn("testPart1FreshStartPending=selectedMode==='test'", reset)
        self.assertIn("resetPart1FreshStart(selectedMode)", started)
        self.assertIn("playbackSection!==1", apply_offset)
        self.assertIn("sectionAudio.currentTime=PART_1_FRESH_START_SECONDS", apply_offset)
        self.assertIn("testPart1FreshStartPending=false", apply_offset)
        self.assertLess(
            play.index("applyPendingTestPart1FreshStart()"),
            play.index("sectionAudio.play()"),
        )
        self.assertRegex(
            self.html,
            r"sectionAudio\.addEventListener\('loadedmetadata'.*?applyPendingTestPart1FreshStart",
        )
        self.assertRegex(
            self.html,
            r"sectionAudio\.addEventListener\('loadeddata'.*?applyPendingTestPart1FreshStart",
        )

    def test_static_contract_preserves_user_activation_and_sequential_test_audio(self):
        begin = function_body(self.html, "beginTimedTest")
        self.assertLess(begin.index("startApp('test')"), begin.index("await fullscreenRequest"))
        self.assertIn(
            "startTestBtn.addEventListener('click',()=>", self.html
        )
        self.assertIn(
            "if(mode==='test' && !submitted && playbackSection<4){ playbackSection += 1;",
            self.html,
        )
        self.assertIn("const sectionForAudio=shouldShow ? activeSection : playbackSection", self.html)

    def test_static_contract_parts_two_to_four_stay_empty(self):
        for part in (2, 3, 4):
            self.assertRegex(
                self.data,
                rf'{part}: \{{ audioSrc: "\./Test 1 Part {part}\.mp3", speakers: \{{\}}, segments: \[\] \}}',
            )


if __name__ == "__main__":
    unittest.main()
