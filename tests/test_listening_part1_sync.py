"""Static contract tests for IELTS 16 Test 1 Part 1 transcript synchronisation."""

import hashlib
import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"
TIMING_SHA256 = "a4d1787060c4a2f0fb040043e9a90c309e68a6752bf3f664edd30a6f529b112d"
SEGMENT_PATTERN = re.compile(
    r'\{ id: "(?P<id>p1-s\d{3})", speaker: "(?P<speaker>[a-z]+)", '
    r'text: "(?P<text>[^"]+)", relatedQuestions: \[(?P<questions>[^\]]*)\], '
    r'start: (?P<start>\d+(?:\.\d+)?), end: (?P<end>\d+(?:\.\d+)?) \}'
)


def function_body(html: str, name: str) -> str:
    match = re.search(rf"function {re.escape(name)}\([^)]*\)\s*\{{", html)
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


class ListeningPart1SyncStaticContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        cls.segments = [
            {
                "id": match.group("id"),
                "start": float(match.group("start")),
                "end": float(match.group("end")),
            }
            for match in SEGMENT_PATTERN.finditer(cls.html)
        ]

    def test_static_contract_uses_unchanged_56_numeric_part_one_ranges(self):
        self.assertEqual(len(self.segments), 56)
        timings = [[item["id"], item["start"], item["end"]] for item in self.segments]
        payload = json.dumps(timings, separators=(",", ":")).encode("utf-8")
        self.assertEqual(hashlib.sha256(payload).hexdigest(), TIMING_SHA256)
        self.assertIn("time>=segment.start && time<segment.end", self.html)

    def test_static_contract_is_study_part_one_and_part_one_source_only(self):
        sync = function_body(self.html, "updatePart1TranscriptSync")
        self.assertIn("mode==='study'", sync)
        self.assertIn("activeSection===1", sync)
        self.assertIn("sectionAudioSource.getAttribute('src')===audioSources[1]", sync)
        self.assertIn("audioscriptPanel.dataset.part==='1'", sync)
        self.assertIn("const shouldShow=mode==='study' && hasTranscript", self.html)
        self.assertNotIn("mode==='test' && hasTranscript", self.html)

    def test_static_contract_gap_boundaries_and_later_start_overlap_selection(self):
        selector = function_body(self.html, "findPart1TranscriptSegment")
        self.assertIn("let active=null", selector)
        self.assertIn("time>=segment.start && time<segment.end", selector)
        self.assertIn("segment.start>=active.start", selector)
        self.assertIn("return active", selector)

        def selected_id(time):
            candidates = [item for item in self.segments if item["start"] <= time < item["end"]]
            return max(candidates, key=lambda item: item["start"])["id"] if candidates else None

        self.assertIsNone(selected_id(self.segments[0]["start"] - 0.001))
        self.assertIsNone(selected_id(self.segments[-1]["end"]))
        self.assertIsNone(selected_id(180.0))
        for earlier, later in ((31, 32), (34, 35), (37, 38), (40, 41)):
            first = self.segments[earlier - 1]
            second = self.segments[later - 1]
            overlap_time = (second["start"] + min(first["end"], second["end"])) / 2
            self.assertEqual(selected_id(overlap_time), second["id"])

    def test_static_contract_applies_one_active_class_and_aria_current(self):
        sync = function_body(self.html, "updatePart1TranscriptSync")
        clear = function_body(self.html, "clearCurrentAudioscriptSegment")
        self.assertIn(".audioscript-segment.is-current-phrase", clear)
        self.assertIn("current.classList.remove('is-current-phrase')", clear)
        self.assertIn("current.removeAttribute('aria-current')", clear)
        self.assertIn("next.classList.add('is-current-phrase')", sync)
        self.assertIn("next.setAttribute('aria-current','true')", sync)
        self.assertNotIn("replaceChildren", sync)

    def test_static_contract_covers_audio_events_and_restored_position(self):
        for event_name in (
            "timeupdate",
            "seeking",
            "seeked",
            "play",
            "pause",
            "loadedmetadata",
            "loadeddata",
            "ended",
        ):
            self.assertRegex(
                self.html,
                rf"sectionAudio\.addEventListener\('{event_name}'.*?updatePart1TranscriptSync",
            )
        restore = function_body(self.html, "restoreStudyAudioPosition")
        self.assertIn("updatePart1TranscriptSync({forceFollow:true})", restore)
        self.assertNotRegex(self.html, r"(?:setInterval|requestAnimationFrame)\([^\n]*updatePart1TranscriptSync")

    def test_static_contract_auto_follow_scrolls_only_transcript_on_segment_change(self):
        sync = function_body(self.html, "updatePart1TranscriptSync")
        follow = function_body(self.html, "followCurrentAudioscriptSegment")
        self.assertIn("changed || forceFollow", sync)
        self.assertIn("audioscriptBody.scrollTop", follow)
        self.assertIn("const comfort=", follow)
        self.assertIn("segmentRect.top>=bodyRect.top+comfort", follow)
        self.assertNotIn("window.scroll", follow)
        self.assertNotIn("studyQuestionPane", follow)
        self.assertNotIn("scrollIntoView", follow)
        self.assertNotIn("behavior:'smooth'", follow)

    def test_static_contract_programmatic_scroll_is_guarded_and_manual_scroll_pauses(self):
        setup = function_body(self.html, "setupTranscriptFollowingInteractions")
        marker = function_body(self.html, "markTranscriptProgrammaticScroll")
        self.assertIn("transcriptProgrammaticScrollTarget=safeTarget", marker)
        self.assertIn("guardToken=++transcriptProgrammaticScrollToken", marker)
        self.assertIn("transcriptProgrammaticScrollToken===guardToken", marker)
        self.assertIn("transcriptProgrammaticScrollTarget!==null", setup)
        self.assertIn("pauseTranscriptFollowing()", setup)
        for event_name in ("wheel", "touchmove", "keydown", "pointerdown", "scroll"):
            self.assertIn(f"audioscriptBody.addEventListener('{event_name}'", setup)
        self.assertNotIn("addEventListener('pointermove'", setup)
        self.assertNotIn("transcriptManualScrollIntentUntil", self.html)
        self.assertIn("targetsScrollbar", setup)
        self.assertIn("if(targetsScrollbar) pauseTranscriptFollowing()", setup)
        for key in ("ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"):
            self.assertIn(f"'{key}'", setup)

    def test_static_contract_scroll_events_alone_do_not_pause_following(self):
        setup = function_body(self.html, "setupTranscriptFollowingInteractions")
        scroll_handler = re.search(
            r"audioscriptBody\.addEventListener\('scroll',\(\)=>\{(?P<body>.*?)\},\{passive:true\}\)",
            setup,
            re.DOTALL,
        )
        self.assertIsNotNone(scroll_handler)
        self.assertIn("transcriptProgrammaticScrollTarget!==null", scroll_handler.group("body"))
        self.assertNotIn("pauseTranscriptFollowing", scroll_handler.group("body"))

    def test_static_contract_highlighting_continues_while_following_is_paused(self):
        sync = function_body(self.html, "updatePart1TranscriptSync")
        self.assertLess(
            sync.index("next.classList.add('is-current-phrase')"),
            sync.index("transcriptFollowingEnabled && (changed || forceFollow)"),
        )
        pause = function_body(self.html, "pauseTranscriptFollowing")
        self.assertNotIn("clearCurrentAudioscriptSegment", pause)

    def test_static_contract_resume_preserves_audio_and_realigns_current_phrase(self):
        self.assertIn('id="transcriptFollowResumeButton"', self.html)
        self.assertIn(">Resume following</button>", self.html)
        resume = function_body(self.html, "resumeTranscriptFollowing")
        self.assertIn("transcriptFollowingEnabled=true", resume)
        self.assertLess(resume.index("updateResumeFollowingControl()"), resume.index("updatePart1TranscriptSync({forceFollow:true})"))
        self.assertIn("updatePart1TranscriptSync({forceFollow:true})", resume)
        self.assertNotIn("sectionAudio.currentTime=", resume)
        self.assertNotIn("studyQuestionPane", resume)
        self.assertNotIn("window.scroll", resume)

        control = function_body(self.html, "updateResumeFollowingControl")
        self.assertIn("!audioscriptPanel.hidden", control)
        self.assertIn("audioscriptExpanded", control)
        self.assertIn("!audioscriptBody.hidden", control)
        self.assertIn("!transcriptFollowingEnabled", control)

    def test_static_contract_current_phrase_uses_theme_aware_success_colours(self):
        active_rule = re.search(
            r"\.audioscript-segment\.is-current-phrase\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(active_rule)
        self.assertIn("background: var(--correct-soft)", active_rule.group("body"))
        self.assertIn("var(--correct)", active_rule.group("body"))
        self.assertIn("font-weight: 600", active_rule.group("body"))
        self.assertNotIn("var(--accent", active_rule.group("body"))
        self.assertEqual(self.html.count("--correct-soft:"), 3)

    def test_static_contract_hide_show_part_switch_and_fresh_session_state(self):
        expanded = function_body(self.html, "setAudioscriptExpanded")
        switched = function_body(self.html, "switchSection")
        started = function_body(self.html, "startApp")
        self.assertNotIn("transcriptFollowingEnabled=", expanded)
        self.assertIn("restoreStudyLayoutState()", expanded)
        self.assertIn("updateSectionAudio()", switched)
        self.assertIn("renderAudioscriptPanel()", switched)
        self.assertIn("restoreStudyLayoutState(section)", switched)
        self.assertIn("resetPart1TranscriptFollowing()", started)
        self.assertIn("transcriptFollowingEnabled=true", function_body(self.html, "resetPart1TranscriptFollowing"))

    def test_static_contract_allows_delegated_seek_but_excludes_words_and_future_feedback_ui(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertIn("text.textContent=segment.text", renderer)
        self.assertNotIn("segment.words", renderer)
        self.assertNotIn("wordTimings", self.html)
        self.assertNotIn("addEventListener", renderer)
        self.assertEqual(self.html.count("audioscriptBody.addEventListener('click'"), 1)
        self.assertNotIn("seekToTranscript", self.html)
        for forbidden in (
            "playClue",
            "cluePlayback",
            "whyExplanation",
            "annotationToolbar",
            "listeningSkill",
            "answerEvidence",
            "distractorEvidence",
        ):
            self.assertNotIn(forbidden, self.html)

    def test_static_contract_parts_two_to_four_remain_empty_and_unsynchronised(self):
        for part in (2, 3, 4):
            self.assertRegex(
                self.html,
                rf'{part}: \{{ audioSrc: "\./Test 1 Part {part}\.mp3", speakers: \{{\}}, segments: \[\] \}}',
            )


if __name__ == "__main__":
    unittest.main()
