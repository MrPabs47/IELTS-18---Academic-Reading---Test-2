"""Static contract tests for Part 1 transcript seeking and the Study playback floor."""

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


class ListeningPart1ClickSeekStaticContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")
        cls.segments = []
        for match in SEGMENT_PATTERN.finditer(cls.html):
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

    def test_static_contract_preserves_all_71_timed_records(self):
        self.assertEqual(len(self.segments), 71)
        self.assertEqual(
            [item["id"] for item in self.segments if item["id"].startswith("p1-i")],
            [f"p1-i{number:03d}" for number in range(1, 16)],
        )
        conversation = [
            item for item in self.segments if item["id"].startswith("p1-s")
        ]
        self.assertEqual(
            [item["id"] for item in conversation],
            [f"p1-s{number:03d}" for number in range(1, 57)],
        )
        foundation = [
            {
                "id": item["id"],
                "speaker": item["speaker"],
                "text": item["text"],
                "relatedQuestions": item["relatedQuestions"],
            }
            for item in conversation
        ]
        foundation_payload = json.dumps(
            foundation, ensure_ascii=False, separators=(",", ":")
        ).encode("utf-8")
        self.assertEqual(
            hashlib.sha256(foundation_payload).hexdigest(), FOUNDATION_SHA256
        )
        timing_payload = json.dumps(
            [[item["id"], item["start"], item["end"]] for item in conversation],
            separators=(",", ":"),
        ).encode("utf-8")
        self.assertEqual(hashlib.sha256(timing_payload).hexdigest(), TIMING_SHA256)

    def test_static_contract_renders_every_timed_row_with_one_shared_interaction(self):
        renderer = function_body(self.html, "renderAudioscriptPanel")
        self.assertIn("partData.segments.forEach", renderer)
        self.assertIn("Number.isFinite(segment.start)", renderer)
        self.assertIn("row.classList.add('is-seekable')", renderer)
        self.assertIn("row.setAttribute('role','button')", renderer)
        self.assertIn("row.tabIndex=0", renderer)
        self.assertIn("row.dataset.start=String(segment.start)", renderer)
        self.assertNotIn("addEventListener", renderer)
        self.assertEqual(self.html.count("setupTranscriptSeekInteractions();"), 1)
        self.assertEqual(
            self.html.count("audioscriptBody.addEventListener('click'"), 1
        )

    def test_static_contract_activation_is_study_part_one_visible_source_only(self):
        guard = function_body(self.html, "canActivatePart1TranscriptRow")
        source_guard = function_body(self.html, "isStudyPart1AudioActive")
        self.assertIn("mode==='study'", source_guard)
        self.assertIn("activeSection===1", source_guard)
        self.assertIn(
            "sectionAudioSource.getAttribute('src')===audioSources[1]", source_guard
        )
        self.assertIn("!audioscriptPanel.hidden", guard)
        self.assertIn("audioscriptExpanded", guard)
        self.assertIn("!audioscriptBody.hidden", guard)
        self.assertIn("audioscriptBody.contains(row)", guard)

    def test_static_contract_uses_the_existing_segment_start_and_shared_user_seek(self):
        activate = function_body(self.html, "activatePart1TranscriptRow")
        request = function_body(self.html, "requestStudyAudioUserSeek")
        apply_seek = function_body(self.html, "applyPendingStudyAudioUserSeek")
        self.assertIn(
            "listeningStudyData.parts[1].segments.find((item)=>item.id===row.id)",
            activate,
        )
        self.assertIn("Number.isFinite(segment.start)", activate)
        self.assertIn("requestStudyAudioUserSeek(1,segment,true)", activate)
        self.assertIn(
            "targetTime:normaliseStudyAudioPosition(section,segment.start)", request
        )
        self.assertIn("markCurrentAudioscriptSegment(segment.id)", request)
        self.assertIn("sectionAudio.currentTime=request.targetTime", apply_seek)
        self.assertNotIn("replaceChildren", activate)

    def test_static_contract_phrase_activation_always_requests_play_once(self):
        activate = function_body(self.html, "activatePart1TranscriptRow")
        request = function_body(self.html, "requestStudyAudioUserSeek")
        apply_seek = function_body(self.html, "applyPendingStudyAudioUserSeek")
        playback = function_body(self.html, "requestPendingStudyAudioPlayback")
        self.assertIn("requestStudyAudioUserSeek(1,segment,true)", activate)
        self.assertIn("shouldPlay:Boolean(shouldPlay)", request)
        self.assertIn("playRequestedForSource:''", request)
        self.assertIn("requestPendingStudyAudioPlayback(request)", apply_seek)
        self.assertIn(
            "request.playRequestedForSource===playbackSource", playback
        )
        self.assertIn("request.playRequestedForSource=playbackSource", playback)
        self.assertEqual(playback.count("sectionAudio.play()"), 1)
        self.assertIn("playPromise.then", playback)
        self.assertIn(".catch(()=>false)", playback)
        self.assertNotIn("sectionAudio.play()", request)
        self.assertNotIn("sectionAudio.play()", apply_seek)

    def test_static_contract_click_does_not_change_unrelated_audio_or_page_state(self):
        activate = function_body(self.html, "activatePart1TranscriptRow")
        forbidden = (
            "playbackRate",
            "volume",
            "muted",
            "activeSection=",
            "audioscriptExpanded=",
            "studySplitRatio",
            "studyQuestionPane",
            "window.scroll",
            "scrollIntoView",
            "answer",
        )
        for token in forbidden:
            self.assertNotIn(token, activate)

    def test_static_contract_preserves_following_enabled_and_paused_modes(self):
        activate = function_body(self.html, "activatePart1TranscriptRow")
        request = function_body(self.html, "requestStudyAudioUserSeek")
        sync = function_body(self.html, "updatePart1TranscriptSync")
        self.assertIn("requestStudyAudioUserSeek", activate)
        self.assertIn("transcriptFollowingEnabled && (changed || forceFollow)", sync)
        self.assertNotIn("transcriptFollowingEnabled=", activate)
        self.assertNotIn("transcriptFollowingEnabled=", request)
        self.assertNotIn("transcriptFollowResumeButton.hidden=", request)
        self.assertNotIn("audioscriptBody.scrollTop", request)

    def test_static_contract_pending_user_seek_beats_restore_and_retries_on_readiness(self):
        request = function_body(self.html, "requestStudyAudioUserSeek")
        apply_seek = function_body(self.html, "applyPendingStudyAudioUserSeek")
        restore = function_body(self.html, "restoreStudyAudioPosition")
        self.assertIn("token:++studyAudioUserSeekToken", request)
        self.assertIn("pendingStudyAudioUserSeek=request", request)
        self.assertIn("studyAudioTransition=null", request)
        self.assertIn("request.token!==studyAudioUserSeekToken", apply_seek)
        self.assertIn("sectionAudio.readyState<1", apply_seek)
        self.assertIn(
            "const alreadyAtTarget=Math.abs(sectionAudio.currentTime-request.targetTime)<0.05",
            apply_seek,
        )
        self.assertIn("if(!alreadyAtTarget)", apply_seek)
        self.assertIn(
            "Math.abs(sectionAudio.currentTime-request.targetTime)<0.05",
            apply_seek,
        )
        self.assertIn(
            "sectionAudio.readyState>=2 && !sectionAudio.paused && reachedTarget",
            apply_seek,
        )
        self.assertIn(
            "pendingStudyAudioUserSeek && pendingStudyAudioUserSeek.section===section",
            restore,
        )
        for event_name in ("loadedmetadata", "loadeddata", "canplay", "seeked"):
            self.assertRegex(
                self.html,
                rf"sectionAudio\.addEventListener\('{event_name}'.*?"
                r"applyPendingStudyAudioUserSeek\(\)",
            )

    def test_static_contract_locked_review_starts_seekability_and_keeps_marker_pending(self):
        request = function_body(self.html, "requestStudyAudioUserSeek")
        apply_seek = function_body(self.html, "applyPendingStudyAudioUserSeek")
        part_one_sync = function_body(self.html, "updatePart1TranscriptSync")
        active_sync = function_body(self.html, "updateActiveTranscriptSync")
        self.assertIn("const sourceTransitionPending=Boolean(", request)
        self.assertIn("sectionAudio.readyState<2", request)
        self.assertIn("sectionAudio.load()", request)
        self.assertIn(
            "prepareStudyAudioSeekability(section,audioSources[section],readinessLoadToken)",
            request,
        )
        self.assertIn("sectionAudio.readyState<1", apply_seek)
        self.assertIn("requestPendingStudyAudioPlayback(request)", apply_seek)
        self.assertIn(
            "prepareStudyAudioSeekability(request.section,audioSources[request.section],studyAudioLoadToken)",
            apply_seek,
        )
        for sync in (part_one_sync, active_sync):
            self.assertIn("pendingStudyAudioUserSeek", sync)
            self.assertIn(
                "markCurrentAudioscriptSegment(pendingStudyAudioUserSeek.segmentId)",
                sync,
            )
            self.assertIn("return", sync)

    def test_static_contract_pointer_drag_and_text_selection_do_not_seek(self):
        setup = function_body(self.html, "setupTranscriptSeekInteractions")
        selection = function_body(self.html, "transcriptSelectionIsCollapsed")
        self.assertIn("window.getSelection()", selection)
        self.assertIn("selection.isCollapsed", selection)
        for event_name in (
            "pointerdown",
            "pointermove",
            "pointerup",
            "pointercancel",
            "click",
        ):
            self.assertIn(f"audioscriptBody.addEventListener('{event_name}'", setup)
        self.assertIn("Math.hypot", setup)
        self.assertIn(">moveThreshold", setup)
        self.assertIn("releasedRow===pointerGesture.row", setup)
        self.assertIn("pointerGesture.selectionWasCollapsed", setup)
        self.assertIn("transcriptSelectionIsCollapsed()", setup)
        self.assertIn("if(!pointerClickAllowed) return", setup)
        self.assertNotIn("preventDefault()", setup.split(
            "audioscriptBody.addEventListener('keydown'"
        )[0])

    def test_static_contract_enter_and_space_activate_without_space_scrolling(self):
        setup = function_body(self.html, "setupTranscriptSeekInteractions")
        keyboard = setup.split(
            "audioscriptBody.addEventListener('keydown',(event)=>{", 1
        )[1]
        self.assertIn("event.key!=='Enter' && event.key!==' '", keyboard)
        self.assertIn("event.preventDefault()", keyboard)
        self.assertIn("activatePart1TranscriptRow(row)", keyboard)

    def test_static_contract_text_is_selectable_with_theme_aware_affordances(self):
        seekable_rule = re.search(
            r"\.audioscript-segment\.is-seekable\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        focus_rule = re.search(
            r"\.audioscript-segment\.is-seekable:focus-visible\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        active_rule = re.search(
            r"\.audioscript-segment\.is-current-phrase\.is-seekable:focus-visible\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(seekable_rule)
        self.assertIsNotNone(focus_rule)
        self.assertIsNotNone(active_rule)
        self.assertIn("cursor: pointer", seekable_rule.group("body"))
        self.assertNotIn("user-select", seekable_rule.group("body"))
        self.assertIn("var(--accent)", focus_rule.group("body"))
        self.assertIn("var(--correct-soft)", active_rule.group("body"))
        self.assertIn("var(--correct)", active_rule.group("body"))
        self.assertIn("var(--accent)", active_rule.group("body"))

    def test_static_contract_part_one_floor_uses_the_single_10_second_constant(self):
        floor = function_body(self.html, "getStudyAudioFloor")
        normalise = function_body(self.html, "normaliseStudyAudioPosition")
        enforce = function_body(self.html, "enforceStudyPart1PlaybackFloor")
        self.assertEqual(
            re.findall(
                r"const PART_1_FRESH_START_SECONDS = (\d+\.\d+);", self.html
            ),
            ["10.000"],
        )
        self.assertIn(
            "section===1 ? PART_1_FRESH_START_SECONDS : 0", floor
        )
        self.assertIn("Math.max(floor,position)", normalise)
        self.assertIn(
            "sectionAudio.currentTime>=PART_1_FRESH_START_SECONDS", enforce
        )
        self.assertIn(
            "sectionAudio.currentTime=PART_1_FRESH_START_SECONDS", enforce
        )
        self.assertIn(
            "studyAudioTransition && studyAudioTransition.section===1", enforce
        )
        self.assertIn("if(!partOneRestorePending)", enforce)
        self.assertIn(
            "studyAudioPositions[1]=PART_1_FRESH_START_SECONDS", enforce
        )

    def test_static_contract_floor_covers_native_pointer_keyboard_and_media_events(self):
        self.assertIn(
            "sectionAudio.addEventListener('pointerdown',beginStudyAudioControlInteraction)",
            self.html,
        )
        self.assertIn(
            "['ArrowLeft','ArrowRight','Home','End'].includes(event.key)", self.html
        )
        for event_name in (
            "play",
            "timeupdate",
            "seeking",
            "seeked",
            "pause",
            "loadedmetadata",
            "loadeddata",
        ):
            self.assertRegex(
                self.html,
                rf"sectionAudio\.addEventListener\('{event_name}'.*?enforceStudyPart1PlaybackFloor",
            )

    def test_static_contract_floor_preserves_playing_or_paused_state_without_loops(self):
        enforce = function_body(self.html, "enforceStudyPart1PlaybackFloor")
        self.assertIn("studyPart1FloorCorrectionInProgress", enforce)
        self.assertIn("const shouldResume=Boolean(", enforce)
        self.assertIn("studyAudioResumeAfterSeekPending=true", enforce)
        self.assertIn(
            "studyAudioResumeAfterSeekPending && sectionAudio.paused", self.html
        )
        self.assertIn("safelyResumeStudyAudio()", self.html)
        self.assertIn("studyAudioResumeAfterSeekPending=false", self.html)

    def test_static_contract_saved_and_restored_positions_obey_each_part_floor(self):
        save = function_body(self.html, "saveStudyAudioPosition")
        restore = function_body(self.html, "restoreStudyAudioPosition")
        self.assertIn(
            "normaliseStudyAudioPosition(section,sectionAudio.currentTime)", save
        )
        self.assertIn(
            "normaliseStudyAudioPosition(section,studyAudioPositions[section])",
            restore,
        )
        self.assertIn("const freshStart=getStudyAudioFloor(section)", restore)

        def normalised(section, value):
            return max(10.0 if section == 1 else 0.0, value)

        self.assertEqual(normalised(1, 0.0), 10.0)
        self.assertEqual(normalised(1, 9.999), 10.0)
        self.assertEqual(normalised(1, 45.5), 45.5)
        for section in (2, 3, 4):
            self.assertEqual(normalised(section, 0.0), 0.0)

    def test_static_contract_fresh_test_and_sequential_audio_remain_protected(self):
        reset = function_body(self.html, "resetPart1FreshStart")
        apply_test = function_body(self.html, "applyPendingTestPart1FreshStart")
        play = function_body(self.html, "playCurrentSectionAudio")
        self.assertIn("studyPart1FreshStartPending=selectedMode==='study'", reset)
        self.assertIn("testPart1FreshStartPending=selectedMode==='test'", reset)
        self.assertIn(
            "sectionAudio.currentTime=PART_1_FRESH_START_SECONDS", apply_test
        )
        self.assertLess(
            play.index("applyPendingTestPart1FreshStart()"),
            play.index("sectionAudio.play()"),
        )
        self.assertIn(
            "if(mode==='test' && !submitted && playbackSection<4){ playbackSection += 1;",
            self.html,
        )

    def test_static_contract_parts_two_to_four_remain_without_transcript_rows(self):
        for part in (2, 3, 4):
            self.assertRegex(
                self.html,
                rf'{part}: \{{ audioSrc: "\./Test 1 Part {part}\.mp3", speakers: \{{\}}, segments: \[\] \}}',
            )


if __name__ == "__main__":
    unittest.main()
