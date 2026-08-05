import json
import re
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening/cambridge-16/test-2/IELTS16 Test 2 - Listening.html"
MEDIA_DURATION = 397.538281
PART_1_FLOOR = 0.30
PART_2_MEDIA_DURATION = 463.685938
PART_2_FLOOR = 0.20
EXPECTED_MAPPINGS = {
    1: ["t2-p1-s008", "t2-p1-s009"],
    2: ["t2-p1-s011"],
    3: ["t2-p1-s015"],
    4: ["t2-p1-s020"],
    5: ["t2-p1-s023"],
    6: ["t2-p1-s025"],
    7: ["t2-p1-s027"],
    8: ["t2-p1-s028", "t2-p1-s029"],
    9: ["t2-p1-s033"],
    10: ["t2-p1-s035"],
}
EXPECTED_PART_2_MAPPINGS = {
    11: ["t2-p2-s005"],
    12: ["t2-p2-s010"],
    13: ["t2-p2-s014"],
    14: ["t2-p2-s017"],
    15: ["t2-p2-s020"],
    16: ["t2-p2-s024"],
    17: ["t2-p2-s027"],
    18: ["t2-p2-s028"],
    19: ["t2-p2-s035", "t2-p2-s038"],
    20: ["t2-p2-s035", "t2-p2-s038"],
}
ROW_PATTERN = re.compile(
    r'\{\s*id:\s*("(?:[^"\\]|\\.)*"),\s*'
    r'speaker:\s*("(?:[^"\\]|\\.)*"),\s*'
    r'text:\s*("(?:[^"\\]|\\.)*"),\s*'
    r'\[questionLinksKey\]:\s*(\[[^\]]*\]),\s*'
    r'start:\s*([0-9]+(?:\.[0-9]+)?),\s*'
    r'end:\s*([0-9]+(?:\.[0-9]+)?)\s*\}'
)


class ListeningTest2Part1TranscriptContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        cls.all_rows = [
            {
                "id": json.loads(match.group(1)),
                "speaker": json.loads(match.group(2)),
                "text": json.loads(match.group(3)),
                "relatedQuestions": json.loads(match.group(4)),
                "start": float(match.group(5)),
                "end": float(match.group(6)),
            }
            for match in ROW_PATTERN.finditer(cls.html)
        ]
        cls.rows = [row for row in cls.all_rows if row["id"].startswith("t2-p1-")]
        cls.by_id = {row["id"]: row for row in cls.rows}

    def mapped_ids(self, question):
        return [row["id"] for row in self.rows if question in row["relatedQuestions"]]

    def test_01_part1_dataset_exists(self):
        self.assertIn("const listeningStudyData =", self.html)
        self.assertRegex(self.html, r"parts:\s*\{\s*1:\s*\{")

    def test_02_part1_uses_existing_test2_audio_source(self):
        self.assertIn("audioSrc: audioSources[1]", self.html)
        self.assertIn("1: '../../../Test 2 Part 1.mp3'", self.html)

    def test_03_speaker_map_contains_verified_keys(self):
        for key in ("narrator", "employee", "woman"):
            self.assertRegex(self.html, rf"\b{key}:\s*\{{\s*label:")

    def test_04_speaker_map_uses_verified_labels(self):
        for key, label in (("narrator", "Narrator"), ("employee", "Employee"), ("woman", "Woman")):
            self.assertRegex(self.html, rf'{key}:\s*\{{\s*label:\s*"{label}"\s*\}}')

    def test_05_part1_has_exactly_52_rows(self):
        self.assertEqual(52, len(self.rows))

    def test_06_verified_speaker_row_counts(self):
        self.assertEqual(Counter({"employee": 19, "woman": 18, "narrator": 15}), Counter(row["speaker"] for row in self.rows))

    def test_07_all_row_ids_are_unique(self):
        self.assertTrue(self.rows)
        self.assertEqual(len(self.rows), len(self.by_id))

    def test_08_ids_follow_instruction_and_dialogue_patterns(self):
        self.assertTrue(self.rows)
        for row in self.rows:
            self.assertRegex(row["id"], r"^t2-p1-[is]\d{3}$")
            expected_prefix = "i" if row["speaker"] == "narrator" else "s"
            self.assertEqual(expected_prefix, row["id"].split("-")[-1][0])

    def test_09_every_row_has_the_complete_production_shape(self):
        self.assertEqual(52, len(self.rows))
        for row in self.rows:
            self.assertEqual({"id", "speaker", "text", "relatedQuestions", "start", "end"}, set(row))

    def test_10_every_speaker_reference_is_valid(self):
        self.assertTrue(self.rows)
        self.assertLessEqual({row["speaker"] for row in self.rows}, {"narrator", "employee", "woman"})

    def test_11_every_text_value_is_non_empty(self):
        self.assertTrue(self.rows)
        self.assertTrue(all(isinstance(row["text"], str) and row["text"].strip() for row in self.rows))

    def test_12_starts_and_ends_are_numeric(self):
        self.assertTrue(self.rows)
        self.assertTrue(all(isinstance(row[field], float) for row in self.rows for field in ("start", "end")))

    def test_13_every_start_respects_the_verified_floor(self):
        self.assertTrue(self.rows)
        self.assertGreaterEqual(min(row["start"] for row in self.rows), PART_1_FLOOR)

    def test_14_every_end_is_greater_than_its_start(self):
        self.assertTrue(self.rows)
        self.assertTrue(all(row["end"] > row["start"] for row in self.rows))

    def test_15_rows_are_chronological(self):
        self.assertTrue(self.rows)
        self.assertEqual([row["start"] for row in self.rows], sorted(row["start"] for row in self.rows))

    def test_16_no_unjustified_overlap_exists(self):
        self.assertTrue(self.rows)
        for previous, current in zip(self.rows, self.rows[1:]):
            self.assertGreaterEqual(current["start"], previous["end"], f'{previous["id"]} overlaps {current["id"]}')

    def test_17_every_row_is_within_verified_media_duration(self):
        self.assertTrue(self.rows)
        self.assertTrue(all(row["end"] <= MEDIA_DURATION for row in self.rows))

    def test_18_narrator_rows_have_no_question_links(self):
        self.assertTrue(self.rows)
        self.assertTrue(all(not row["relatedQuestions"] for row in self.rows if row["speaker"] == "narrator"))

    def test_19_no_question_is_mapped_only_to_narration(self):
        for question in range(1, 11):
            linked = [row for row in self.rows if question in row["relatedQuestions"]]
            self.assertTrue(linked)
            self.assertTrue(any(row["speaker"] != "narrator" for row in linked))

    def test_20_questions_1_to_10_are_all_mapped(self):
        self.assertEqual(set(range(1, 11)), {q for row in self.rows for q in row["relatedQuestions"]})

    def test_21_all_question_mappings_are_exact(self):
        self.assertEqual(EXPECTED_MAPPINGS, {q: self.mapped_ids(q) for q in range(1, 11)})

    def test_22_question_8_maps_to_both_verified_rows(self):
        self.assertEqual(["t2-p1-s028", "t2-p1-s029"], self.mapped_ids(8))

    def test_23_no_part2_to_part4_question_mapping_is_present(self):
        self.assertTrue(self.rows)
        self.assertFalse({q for row in self.rows for q in row["relatedQuestions"] if 11 <= q <= 40})

    def test_24_question_3_uses_singular_payment(self):
        row = self.by_id.get("t2-p1-s015", {})
        self.assertIn("once we’ve received the payment", row.get("text", ""))

    def test_25_question_3_never_uses_plural_payments(self):
        row = self.by_id.get("t2-p1-s015", {})
        self.assertTrue(row)
        self.assertNotRegex(row.get("text", ""), r"\bpayments\b")

    def test_26_selected_official_script_fingerprints_exist(self):
        fingerprints = {
            "t2-p1-i001": "This is the IELTS Listening test",
            "t2-p1-s008": "in a frame",
            "t2-p1-s015": "received the payment",
            "t2-p1-s023": "touch up the colour",
            "t2-p1-s028": "properly in focus",
            "t2-p1-s035": "plastic ones sometimes break",
            "t2-p1-i015": "half a minute to check your answers",
        }
        for row_id, phrase in fingerprints.items():
            self.assertIn(phrase, self.by_id.get(row_id, {}).get("text", ""))

    def test_27_first_visible_row_is_verified_instruction(self):
        self.assertTrue(self.rows)
        self.assertEqual("t2-p1-i001", self.rows[0]["id"])

    def test_28_first_row_starts_near_point_33_and_not_before_floor(self):
        self.assertTrue(self.rows)
        self.assertAlmostEqual(0.33, self.rows[0]["start"], places=2)
        self.assertGreaterEqual(self.rows[0]["start"], PART_1_FLOOR)

    def test_29_copyright_and_publisher_wording_is_absent(self):
        self.assertTrue(self.rows)
        transcript = " ".join(row["text"] for row in self.rows).lower()
        for forbidden in ("copyright", "cambridge university press", "publisher"):
            self.assertNotIn(forbidden, transcript)

    def test_30_final_employee_row_is_not_duplicated(self):
        matches = [row for row in self.rows if row["id"] == "t2-p1-s037"]
        self.assertEqual(1, len(matches))
        self.assertEqual(("employee", "Bye.", 357.54, 357.84), (matches[0]["speaker"], matches[0]["text"], matches[0]["start"], matches[0]["end"]))

    def test_31_part1_start_floor_is_exactly_point_30(self):
        self.assertRegex(self.html, r"const VERIFIED_PART_1_START_SECONDS\s*=\s*0\.30\s*;")
        self.assertIn("studyAudioStartFloors[1]=VERIFIED_PART_1_START_SECONDS", self.html)

    def test_32_initial_part1_playback_is_clamped(self):
        self.assertIn("function enforceAudioPlaybackFloor", self.html)
        self.assertIn("enforceAudioPlaybackFloor(playbackSection)", self.html)
        self.assertRegex(self.html, r"loadedmetadata'.*enforceAudioPlaybackFloor", re.DOTALL)

    def test_33_saved_part1_position_below_floor_restores_to_floor(self):
        self.assertIn("const safeTarget=normaliseStudyAudioPosition(section,target)", self.html)
        self.assertIn("Math.max(floor,numeric)", self.html)

    def test_34_transcript_and_future_evidence_seek_foundation_clamps(self):
        self.assertIn("function clampListeningStudySeek(section,position)", self.html)
        self.assertIn("return normaliseStudyAudioPosition(section,position)", self.html)

    def test_35_study_positions_remain_independent_by_part(self):
        self.assertIn("studyAudioPositions = {1:0,2:0,3:0,4:0}", self.html)
        self.assertIn("studyAudioPositions[section]=normaliseStudyAudioPosition", self.html)

    def test_36_test_sequence_remains_independent_from_study(self):
        self.assertIn("function advanceTestAudioSequence()", self.html)
        self.assertIn("playbackSection+=1", self.html)
        self.assertIn("if(mode==='test' && !submitted && playbackSection<4)", self.html)

    def test_37_parts3_and_4_transcript_data_remain_absent(self):
        data_start = self.html.index("const listeningStudyData =")
        data_end = self.html.index("const studyAudioStartFloors", data_start)
        data = self.html[data_start:data_end]
        for part in (3, 4):
            self.assertNotRegex(data, rf"\b{part}:\s*\{{\s*audioSrc")

    def test_38_global_transcript_completion_gate_remains_closed(self):
        self.assertRegex(self.html, r"const hasCompleteTranscriptData\s*=\s*false\s*;")

    def test_39_partial_part1_transcript_cannot_become_visible(self):
        self.assertIn("const canSplit=hasCompleteTranscriptData &&", self.html)
        self.assertIn("studyAudioscriptPane.hidden=!canSplit", self.html)
        self.assertIn("study-audioscript-pane[hidden]", self.html)

    def test_40_no_pass2b_content_is_introduced(self):
        for forbidden in ("questionFeedback", "taskStrategies", "Why:</strong>", "Evidence buttons", "buildEvidenceButton"):
            self.assertNotIn(forbidden, self.html)


class ListeningTest2Part2TranscriptContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        cls.all_rows = [
            {
                "id": json.loads(match.group(1)),
                "speaker": json.loads(match.group(2)),
                "text": json.loads(match.group(3)),
                "relatedQuestions": json.loads(match.group(4)),
                "start": float(match.group(5)),
                "end": float(match.group(6)),
            }
            for match in ROW_PATTERN.finditer(cls.html)
        ]
        cls.rows = [row for row in cls.all_rows if row["id"].startswith("t2-p2-")]
        cls.by_id = {row["id"]: row for row in cls.rows}
        data_start = cls.html.index("const listeningStudyData =")
        data_end = cls.html.index("const studyAudioStartFloors", data_start)
        cls.data = cls.html[data_start:data_end]
        match = re.search(
            r"\b2:\s*\{\s*audioSrc:\s*audioSources\[2\],\s*speakers:\s*\{(?P<speakers>.*?)\}\s*,\s*segments:",
            cls.data,
            re.DOTALL,
        )
        cls.speaker_block = match.group("speakers") if match else ""

    def mapped_ids(self, question):
        return [row["id"] for row in self.rows if question in row["relatedQuestions"]]

    def test_41_part2_dataset_and_existing_audio_source_exist(self):
        self.assertRegex(self.data, r"\b2:\s*\{\s*audioSrc:\s*audioSources\[2\]")
        self.assertIn("2: '../../../Test 2 Part 2.mp3'", self.html)

    def test_42_part2_speaker_map_is_exact_and_neutral(self):
        keys = re.findall(r"\b([a-z][a-z0-9_]*)\s*:\s*\{\s*label:", self.speaker_block)
        self.assertEqual(["narrator", "speaker"], keys)
        self.assertRegex(self.speaker_block, r'narrator:\s*\{\s*label:\s*"Narrator"\s*\}')
        self.assertRegex(self.speaker_block, r'speaker:\s*\{\s*label:\s*"Speaker"\s*\}')
        self.assertNotRegex(self.speaker_block, r"Headteacher|Principal|Administrator")

    def test_43_part2_has_verified_total_and_speaker_counts(self):
        self.assertEqual(45, len(self.rows))
        self.assertEqual(Counter({"speaker": 38, "narrator": 7}), Counter(row["speaker"] for row in self.rows))

    def test_44_part2_ids_are_unique_and_follow_verified_patterns(self):
        self.assertEqual(45, len(self.by_id))
        for row in self.rows:
            self.assertRegex(row["id"], r"^t2-p2-[is]\d{3}$")
            expected_prefix = "i" if row["speaker"] == "narrator" else "s"
            self.assertEqual(expected_prefix, row["id"].split("-")[-1][0])

    def test_45_every_part2_row_has_valid_production_shape(self):
        self.assertEqual(45, len(self.rows))
        for row in self.rows:
            self.assertEqual({"id", "speaker", "text", "relatedQuestions", "start", "end"}, set(row))
            self.assertIn(row["speaker"], {"narrator", "speaker"})
            self.assertIsInstance(row["text"], str)
            self.assertTrue(row["text"].strip())
            self.assertIsInstance(row["start"], float)
            self.assertIsInstance(row["end"], float)

    def test_46_part2_timing_is_valid_chronological_and_non_overlapping(self):
        self.assertTrue(self.rows)
        self.assertGreaterEqual(min(row["start"] for row in self.rows), PART_2_FLOOR)
        self.assertTrue(all(row["end"] > row["start"] for row in self.rows))
        self.assertEqual([row["start"] for row in self.rows], sorted(row["start"] for row in self.rows))
        self.assertTrue(all(row["end"] <= PART_2_MEDIA_DURATION for row in self.rows))
        for previous, current in zip(self.rows, self.rows[1:]):
            self.assertGreaterEqual(current["start"], previous["end"], f'{previous["id"]} overlaps {current["id"]}')

    def test_47_narration_is_unmapped_and_answers_use_speaker_rows(self):
        self.assertTrue(all(not row["relatedQuestions"] for row in self.rows if row["speaker"] == "narrator"))
        for question in range(11, 21):
            linked = [row for row in self.rows if question in row["relatedQuestions"]]
            self.assertTrue(linked)
            self.assertTrue(all(row["speaker"] == "speaker" for row in linked))

    def test_48_only_questions_11_to_20_are_mapped(self):
        mapped = {question for row in self.rows for question in row["relatedQuestions"]}
        self.assertEqual(set(range(11, 21)), mapped)
        self.assertFalse(mapped & set(range(1, 11)))

    def test_49_part2_question_mappings_are_exact(self):
        self.assertEqual(EXPECTED_PART_2_MAPPINGS, {question: self.mapped_ids(question) for question in range(11, 21)})

    def test_50_choose_two_rows_have_symmetric_unordered_mapping(self):
        drama = self.by_id.get("t2-p2-s035", {})
        piano = self.by_id.get("t2-p2-s038", {})
        self.assertEqual([19, 20], drama.get("relatedQuestions"))
        self.assertEqual([19, 20], piano.get("relatedQuestions"))
        self.assertEqual(self.mapped_ids(19), self.mapped_ids(20))
        self.assertNotEqual(["t2-p2-s035"], self.mapped_ids(19))
        self.assertNotEqual(["t2-p2-s038"], self.mapped_ids(20))

    def test_51_matching_evidence_is_independent_and_positive(self):
        self.assertIn("different country’s cuisine each day", self.by_id.get("t2-p2-s024", {}).get("text", ""))
        self.assertIn("ask pupils to make suggestions", self.by_id.get("t2-p2-s027", {}).get("text", ""))
        q18 = self.by_id.get("t2-p2-s028", {}).get("text", "")
        self.assertIn("Speedy Italian", q18)
        self.assertIn("don’t eat meat or fish", q18)

    def test_52_selected_official_script_fingerprints_exist(self):
        fingerprints = {
            "t2-p2-i001": "head teacher talking to parents",
            "t2-p2-s005": "turned it into offices",
            "t2-p2-s014": "wait a considerable time to be served",
            "t2-p2-s020": "tables and chairs",
            "t2-p2-s023": "World Adventures",
            "t2-p2-s026": "Street Life",
            "t2-p2-s028": "Speedy Italian",
            "t2-p2-s035": "start drama classes",
            "t2-p2-s038": "magnificent grand piano",
        }
        for row_id, phrase in fingerprints.items():
            self.assertIn(phrase, self.by_id.get(row_id, {}).get("text", ""))

    def test_53_copyright_and_publisher_wording_is_absent(self):
        transcript = " ".join(row["text"] for row in self.rows).lower()
        for forbidden in ("copyright", "cambridge university press", "publisher"):
            self.assertNotIn(forbidden, transcript)

    def test_54_first_and_final_rows_match_verified_boundaries(self):
        self.assertTrue(self.rows)
        self.assertEqual("t2-p2-i001", self.rows[0]["id"])
        self.assertAlmostEqual(0.27, self.rows[0]["start"], places=2)
        self.assertGreaterEqual(self.rows[0]["start"], PART_2_FLOOR)
        final_speaker = [row for row in self.rows if row["id"] == "t2-p2-s038"]
        self.assertEqual(1, len(final_speaker))
        self.assertEqual(423.64, final_speaker[0]["end"])

    def test_55_part2_floor_is_exact_and_independent(self):
        self.assertRegex(self.html, r"const VERIFIED_PART_1_START_SECONDS\s*=\s*0\.30\s*;")
        self.assertRegex(self.html, r"const VERIFIED_PART_2_START_SECONDS\s*=\s*0\.20\s*;")
        self.assertIn("studyAudioStartFloors[1]=VERIFIED_PART_1_START_SECONDS", self.html)
        self.assertIn("studyAudioStartFloors[2]=VERIFIED_PART_2_START_SECONDS", self.html)
        self.assertRegex(self.html, r"const studyAudioStartFloors\s*=\s*\{1:0,2:0,3:0,4:0\}")

    def test_56_initial_and_restored_part2_positions_are_clamped(self):
        self.assertIn("function enforceAudioPlaybackFloor", self.html)
        self.assertIn("enforceAudioPlaybackFloor(playbackSection)", self.html)
        self.assertIn("const target=studyAudioPositionInitialized[section] ? studyAudioPositions[section] : getStudyAudioFloor(section)", self.html)
        self.assertIn("const safeTarget=normaliseStudyAudioPosition(section,target)", self.html)
        self.assertIn("Math.max(floor,numeric)", self.html)

    def test_57_phrase_and_evidence_seek_foundation_uses_part_floor(self):
        self.assertIn("function clampListeningStudySeek(section,position)", self.html)
        self.assertIn("return normaliseStudyAudioPosition(section,position)", self.html)

    def test_58_part1_floor_and_positions_remain_independent(self):
        self.assertIn("studyAudioPositions = {1:0,2:0,3:0,4:0}", self.html)
        self.assertIn("studyAudioPositions[section]=normaliseStudyAudioPosition", self.html)
        self.assertEqual(PART_1_FLOOR, 0.30)

    def test_59_test_audio_sequence_remains_independent(self):
        self.assertIn("function advanceTestAudioSequence()", self.html)
        self.assertIn("playbackSection+=1", self.html)
        self.assertIn("loadTestAudioSource(playbackSection)", self.html)

    def test_60_parts3_and_4_remain_without_transcripts_or_floors(self):
        for part in (3, 4):
            self.assertNotRegex(self.data, rf"\b{part}:\s*\{{\s*audioSrc")
        self.assertNotIn("studyAudioStartFloors[3]=", self.html)
        self.assertNotIn("studyAudioStartFloors[4]=", self.html)

    def test_61_global_completion_gate_remains_closed(self):
        self.assertRegex(self.html, r"const hasCompleteTranscriptData\s*=\s*false\s*;")

    def test_62_partial_transcripts_remain_hidden(self):
        self.assertIn("const canSplit=hasCompleteTranscriptData &&", self.html)
        self.assertIn("studyAudioscriptPane.hidden=!canSplit", self.html)
        self.assertIn("study-audioscript-pane[hidden]", self.html)

    def test_63_no_pass2b_content_is_introduced(self):
        for forbidden in ("questionFeedback", "taskStrategies", "Why:</strong>", "Evidence buttons", "buildEvidenceButton"):
            self.assertNotIn(forbidden, self.html)


if __name__ == "__main__":
    unittest.main()
