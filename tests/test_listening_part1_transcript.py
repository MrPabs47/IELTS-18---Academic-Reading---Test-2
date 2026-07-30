import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"

OFFICIAL_DIALOGUE = """
Hello. Children’s Engineering Workshops.
Oh hello. I wanted some information about the workshops in the school holidays.
Sure.
I have two daughters who are interested. The younger one’s Lydia, she’s four – do you take children as young as that?
Yes, our Tiny Engineers workshop is for four to five-year-olds.
What sorts of activities do they do?
All sorts. For example, they work together to design a special cover that goes round an egg, so that when it’s inside they can drop it from a height and it doesn’t break. Well, sometimes it does break but that’s part of the fun!
Right. And Lydia loves building things. Is there any opportunity for her to do that?
Well, they have a competition to see who can make the highest tower. You’d be amazed how high they can go.
Right.
But they’re learning all the time as well as having fun. For example, one thing they do is to design and build a car that’s attached to a balloon, and the force of the air in that actually powers the car and makes it move along. They go really fast too.
OK, well, all this sounds perfect.
Now Carly, that’s my older daughter, has just had her seventh birthday, so presumably she’d be in a different group?
Yes, she’d be in the Junior Engineers. That’s for children from six to eight.
And do they do the same sorts of activities?
Some are the same, but a bit more advanced. So they work out how to build model vehicles, things like cars and trucks, but also how to construct animals using the same sorts of material and technique, and then they learn how they can program them and make them move.
So they learn a bit of coding?
They do. They pick it up really quickly. We’re there to help if they need it, but they learn from one another too.
Right. And do they have competitions too?
Yes, with the Junior Engineers, it’s to use recycled materials like card and wood to build a bridge, and the longest one gets a prize.
That sounds fun. I wouldn’t mind doing that myself!
Then they have something a bit different, which is to think up an idea for a five-minute movie and then film it, using special animation software. You’d be amazed what they come up with.
And of course, that’s something they can put on their phone and take home to show all their friends.
Exactly. And then they also build a robot in the shape of a human, and they decorate it and program it so that it can move its arms and legs.
Perfect. So, is it the same price as the Tiny Engineers?
It’s just a bit more: £50 for the five weeks.
And are the classes on a Monday, too?
They used to be, but we found it didn’t give our staff enough time to clear up after the first workshop, so we moved them to Wednesdays. The classes are held in the morning from ten to eleven.
OK. That’s better for me actually. And what about the location? Where exactly are the workshops held?
They’re in building 10A – there’s a big sign on the door, you can’t miss it, and that’s in Fradstone Industrial Estate.
Sorry?
Fradstone – that’s F-R-A-D-S-T-O-N-E.
And that’s in Grasford, isn’t it?
Yes, up past the station.
And will I have any parking problems there?
No, there’s always plenty available. So would you like to enrol Lydia and Carly now?
OK.
So can I have your full name ...
"""

SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p1-s\d{3})", speaker: "(?P<speaker>[a-z]+)", '
    r'text: "(?P<text>[^"]+)", relatedQuestions: \[(?P<questions>[^\]]*)\], '
    r'start: (?P<start>\d+(?:\.\d+)?), end: (?P<end>\d+(?:\.\d+)?) \}'
)


class ListeningPart1TranscriptContractTest(unittest.TestCase):
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
            questions = [
                int(value.strip())
                for value in match.group("questions").split(",")
                if value.strip()
            ]
            cls.segments.append(
                {
                    "id": match.group("id"),
                    "speaker": match.group("speaker"),
                    "text": match.group("text"),
                    "relatedQuestions": questions,
                    "start": float(match.group("start")),
                    "end": float(match.group("end")),
                }
            )

    def test_all_four_parts_exist_and_only_part_one_has_segments(self):
        self.assertIn("const listeningStudyData", self.html)
        self.assertEqual(len(self.segments), 56)
        for part in (2, 3, 4):
            self.assertRegex(
                self.data,
                rf'{part}: \{{ audioSrc: "\./Test 1 Part {part}\.mp3", speakers: \{{\}}, segments: \[\] \}}',
            )

    def test_part_one_audio_source_and_speakers_are_valid(self):
        self.assertIn('audioSrc: "./Test 1 Part 1.mp3"', self.part1)
        self.assertIn('sarah: { label: "Sarah" }', self.part1)
        self.assertIn('father: { label: "Father" }', self.part1)
        self.assertEqual({segment["speaker"] for segment in self.segments}, {"sarah", "father"})

    def test_segment_ids_are_unique_stable_and_sequential(self):
        expected = [f"p1-s{number:03d}" for number in range(1, 57)]
        actual = [segment["id"] for segment in self.segments]
        self.assertEqual(actual, expected)
        self.assertEqual(len(actual), len(set(actual)))

    def test_every_segment_has_required_foundation_fields(self):
        self.assertNotIn("start: null", self.part1)
        self.assertNotIn("end: null", self.part1)
        for segment in self.segments:
            self.assertTrue(segment["text"])
            self.assertIsInstance(segment["relatedQuestions"], list)
            self.assertIsInstance(segment["start"], float)
            self.assertIsInstance(segment["end"], float)
            self.assertTrue(all(1 <= question <= 10 for question in segment["relatedQuestions"]))

    def test_dialogue_wording_and_order_match_the_official_source(self):
        expected = " ".join(OFFICIAL_DIALOGUE.split())
        actual = " ".join(" ".join(segment["text"] for segment in self.segments).split())
        self.assertEqual(actual, expected)

    def test_questions_one_to_ten_each_have_evidence_relationships(self):
        coverage = {
            question
            for segment in self.segments
            for question in segment["relatedQuestions"]
        }
        self.assertEqual(coverage, set(range(1, 11)))

    def test_panel_is_study_only_and_empty_parts_do_not_render(self):
        self.assertIn('id="audioscriptPanel"', self.html)
        self.assertIn("const shouldShow=mode==='study' && hasTranscript", self.html)
        self.assertIn("audioscriptPanel.hidden=!shouldShow", self.html)
        self.assertIn("if(!shouldShow) return", self.html)
        self.assertIn("renderAudioscriptPanel(); updateFooterState()", self.html)
        self.assertNotIn("mode==='test' && hasTranscript", self.html)
        self.assertNotIn("submitted && hasTranscript", self.html)
        self.assertNotIn("coming soon", self.html.lower())

    def test_show_hide_control_is_accessible_and_session_scoped(self):
        self.assertIn('aria-controls="audioscriptBody"', self.html)
        self.assertIn('aria-expanded="true">Hide script</button>', self.html)
        self.assertIn("audioscriptExpanded=!audioscriptExpanded", self.html)
        self.assertIn("audioscriptExpanded ? 'Hide script' : 'Show script'", self.html)
        self.assertIn("audioscriptToggle.setAttribute('aria-expanded'", self.html)
        self.assertNotRegex(self.html, r"(?:localStorage|sessionStorage).*audioscript")

    def test_rendering_has_stable_ids_accessibility_and_delegated_click_interactions(self):
        self.assertIn("row.id=segment.id", self.html)
        self.assertIn("row.dataset.relatedQuestions=segment.relatedQuestions.join(',')", self.html)
        self.assertIn("accessibleSpeaker.className='sr-only'", self.html)
        self.assertIn("text.textContent=segment.text", self.html)
        renderer = re.search(
            r"function renderAudioscriptPanel\(\)\{(?P<body>.*?)\n    \}\n    function updateSectionAudio",
            self.html,
            re.DOTALL,
        ).group("body")
        self.assertIn("row.setAttribute('role','button')", renderer)
        self.assertIn("row.tabIndex=0", renderer)
        self.assertNotIn("addEventListener", renderer)
        self.assertEqual(self.html.count("audioscriptBody.addEventListener('click'"), 1)

    def test_no_timing_highlighting_clue_or_explanation_schema_was_added(self):
        forbidden = (
            "wordTimings",
            "phraseTimings",
            "clueStart",
            "clueEnd",
            "evidenceType",
            "distractorRelationships",
            "whyExplanation",
            "listeningSkill",
        )
        for field in forbidden:
            self.assertNotIn(field, self.data)


if __name__ == "__main__":
    unittest.main()
