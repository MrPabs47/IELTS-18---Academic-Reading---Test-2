import hashlib
import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"
AUDIO = ROOT / "listening" / "cambridge-16" / "test-1" / "Test 1 Part 1.mp3"

AUDIO_DURATION_SECONDS = 422.040313
AUDIO_BYTES = 13_505_290
AUDIO_SHA256 = "0ab5c21d09421649106c432304c5c3b471064a373348d9a6705e95488e6f989d"
FOUNDATION_SHA256 = "fef1c013390af928b0a31b57a7c52dfad44391b2b99e0857333f75245e6c8fb0"
TIMING_SHA256 = "a4d1787060c4a2f0fb040043e9a90c309e68a6752bf3f664edd30a6f529b112d"

SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p1-s\d{3})", speaker: "(?P<speaker>[a-z]+)", '
    r'text: "(?P<text>[^"]+)", relatedQuestions: \[(?P<questions>[^\]]*)\], '
    r'start: (?P<start>\d+(?:\.\d+)?), end: (?P<end>\d+(?:\.\d+)?) \}'
)

EXPECTED_EVIDENCE_SEGMENTS = {
    1: ["p1-s008", "p1-s009"],
    2: ["p1-s012", "p1-s013"],
    3: ["p1-s016", "p1-s017"],
    4: ["p1-s024"],
    5: ["p1-s031"],
    6: ["p1-s033", "p1-s034", "p1-s035"],
    7: ["p1-s037"],
    8: ["p1-s042", "p1-s043"],
    9: ["p1-s047", "p1-s049"],
    10: ["p1-s052", "p1-s053"],
}


class ListeningPart1TimestampContractTest(unittest.TestCase):
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

    def test_all_56_segments_have_stable_sequential_ids_and_numeric_times(self):
        self.assertEqual(len(self.segments), 56)
        self.assertEqual(
            [segment["id"] for segment in self.segments],
            [f"p1-s{number:03d}" for number in range(1, 57)],
        )
        self.assertNotIn("start: null", self.part1)
        self.assertNotIn("end: null", self.part1)
        for segment in self.segments:
            self.assertIsInstance(segment["start"], float)
            self.assertIsInstance(segment["end"], float)
            self.assertGreaterEqual(segment["start"], 0)
            self.assertGreater(segment["end"], segment["start"])

    def test_starts_are_ordered_and_all_times_fit_the_verified_audio(self):
        starts = [segment["start"] for segment in self.segments]
        self.assertEqual(starts, sorted(starts))
        self.assertTrue(
            all(
                current["start"] <= following["end"]
                for current, following in zip(self.segments, self.segments[1:])
            )
        )
        self.assertLessEqual(max(segment["end"] for segment in self.segments), AUDIO_DURATION_SECONDS)
        self.assertEqual(self.segments[0]["start"], 87.150)
        self.assertEqual(self.segments[-1]["end"], 382.070)

    def test_audio_duration_constant_is_bound_to_the_exact_mp3(self):
        audio_bytes = AUDIO.read_bytes()
        self.assertEqual(len(audio_bytes), AUDIO_BYTES)
        self.assertEqual(hashlib.sha256(audio_bytes).hexdigest(), AUDIO_SHA256)

    def test_text_speakers_and_related_questions_remain_unchanged(self):
        foundation = [
            {
                "id": segment["id"],
                "speaker": segment["speaker"],
                "text": segment["text"],
                "relatedQuestions": segment["relatedQuestions"],
            }
            for segment in self.segments
        ]
        payload = json.dumps(
            foundation,
            ensure_ascii=False,
            separators=(",", ":"),
        ).encode("utf-8")
        self.assertEqual(hashlib.sha256(payload).hexdigest(), FOUNDATION_SHA256)

    def test_all_timestamp_values_are_protected_from_accidental_drift(self):
        timings = [
            [segment["id"], segment["start"], segment["end"]]
            for segment in self.segments
        ]
        payload = json.dumps(timings, separators=(",", ":")).encode("utf-8")
        self.assertEqual(hashlib.sha256(payload).hexdigest(), TIMING_SHA256)

    def test_questions_one_to_ten_keep_their_evidence_segments(self):
        actual = {
            question: [
                segment["id"]
                for segment in self.segments
                if question in segment["relatedQuestions"]
            ]
            for question in range(1, 11)
        }
        self.assertEqual(actual, EXPECTED_EVIDENCE_SEGMENTS)

    def test_parts_two_to_four_remain_without_transcript_segments_or_timings(self):
        for part in (2, 3, 4):
            self.assertRegex(
                self.data,
                rf'{part}: \{{ audioSrc: "\./Test 1 Part {part}\.mp3", speakers: \{{\}}, segments: \[\] \}}',
            )

    def test_no_word_timing_clue_or_future_feedback_schema_or_ui_was_added(self):
        forbidden_data = (
            "wordTimings",
            "phraseTimings",
            "clueStart",
            "clueEnd",
            "evidenceType",
            "distractorRelationships",
            "whyExplanation",
            "listeningSkill",
        )
        for field in forbidden_data:
            self.assertNotIn(field, self.data)

        forbidden_ui = (
            "active-audioscript-segment",
            "audioscript-highlight",
            "syncAudioscript",
            "seekToTranscript",
            "playClue",
        )
        for token in forbidden_ui:
            self.assertNotIn(token, self.html)

        renderer_match = re.search(
            r"function renderAudioscriptPanel\(\)\{(?P<body>.*?)\n    \}\n    function updateSectionAudio",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(renderer_match)
        renderer = renderer_match.group("body")
        self.assertIn("row.dataset.start=String(segment.start)", renderer)
        self.assertNotIn("segment.end", renderer)
        self.assertNotIn("currentTime", renderer)
        self.assertNotIn("addEventListener", renderer)


if __name__ == "__main__":
    unittest.main()
