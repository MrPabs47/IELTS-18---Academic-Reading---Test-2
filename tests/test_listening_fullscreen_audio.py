import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"


class ListeningFullscreenAudioContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def function_body(self, name, next_name):
        match = re.search(
            rf"function {name}\([^)]*\)\{{(?P<body>.*?)function {next_name}\(",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(match, f"Could not find {name}()")
        return match.group("body")

    def test_timer_interval_is_always_replaced_not_duplicated(self):
        body = self.function_body("runTimerInterval", "pauseTimerForFullscreenLock")
        self.assertIn("if(timerId) clearInterval(timerId)", body)
        self.assertLess(body.index("clearInterval(timerId)"), body.index("setInterval("))

    def test_fullscreen_lock_pauses_timer_and_resume_keeps_remaining_value(self):
        return_to_fullscreen = self.function_body("returnToFullscreenAndResume", "runTimerInterval")
        pause = self.function_body("pauseTimerForFullscreenLock", "resumeTimerAfterFullscreenLock")
        resume = self.function_body("resumeTimerAfterFullscreenLock", "pauseAudioForFullscreenLock")
        self.assertIn("if(ok) handleFullscreenChange()", return_to_fullscreen)
        self.assertIn("else { showFullscreenLockOverlay(); updateFullscreenButton(); }", return_to_fullscreen)
        self.assertIn("clearInterval(timerId); timerId=null", pause)
        self.assertIn("fullscreenTimerPaused=true", pause)
        self.assertIn("if(!fullscreenTimerPaused || mode!=='test' || submitted) return", resume)
        self.assertIn("formatDuration(timerSeconds)", resume)
        self.assertIn("runTimerInterval()", resume)
        self.assertNotIn("timerSeconds=30*60", resume)

    def test_audio_resumes_only_when_it_was_playing(self):
        pause = self.function_body("pauseAudioForFullscreenLock", "resumeAudioAfterFullscreenLock")
        resume = self.function_body("resumeAudioAfterFullscreenLock", "handleFullscreenChange")
        self.assertIn("!sectionAudio.paused && !sectionAudio.ended", pause)
        self.assertIn("if(testAudioWasPlayingBeforeFullscreenLock) sectionAudio.pause()", pause)
        self.assertIn("const shouldResume=testAudioWasPlayingBeforeFullscreenLock", resume)
        self.assertIn("if(!shouldResume || mode!=='test' || submitted) return", resume)
        self.assertIn("playCurrentSectionAudio()", resume)
        self.assertNotIn("sectionAudio.load()", resume)
        self.assertNotIn("currentTime", resume)

    def test_fullscreen_and_focus_events_are_deduplicated(self):
        fullscreen = self.function_body("handleFullscreenChange", "recordFocusLoss")
        focus = self.function_body("recordFocusLoss", "restoreThemePreference")
        self.assertIn("if(!fullscreenLockActive)", fullscreen)
        self.assertIn("fullscreenLockActive=true", fullscreen)
        self.assertIn("if(now-lastFocusLossAt<500) return", focus)
        self.assertIn("document.addEventListener('visibilitychange'", self.html)
        self.assertIn("window.addEventListener('blur', recordFocusLoss)", self.html)

    def test_study_mode_does_not_activate_test_lock_or_timer(self):
        fullscreen = self.function_body("handleFullscreenChange", "recordFocusLoss")
        focus = self.function_body("recordFocusLoss", "restoreThemePreference")
        timer = self.function_body("startTimer", "openOptions")
        self.assertIn("mode==='test'", fullscreen)
        self.assertIn("mode==='test'", focus)
        self.assertIn("if(mode==='test')", timer)
        self.assertIn("timerId=null; return", timer)

    def test_submission_permanently_stops_test_timing_and_lock_resume(self):
        submit = self.function_body("submitTest", "confirmSubmit")
        self.assertIn("fullScreenEnforcementEnabled=false", submit)
        self.assertIn("fullscreenTimerPaused=false", submit)
        self.assertIn("testAudioWasPlayingBeforeFullscreenLock=false", submit)
        self.assertIn("clearInterval(timerId); timerId=null", submit)
        self.assertNotRegex(self.html, r"closeResultsBtn\.addEventListener.*startTimer")

    def test_test_start_preserves_click_activation_and_handles_play_promise(self):
        begin = self.function_body("beginTimedTest", "setupDragMatch")
        play = self.function_body("playCurrentSectionAudio", "resetStudyAudioPositions")
        self.assertLess(begin.index("requestAppFullscreen()"), begin.index("startApp('test')"))
        self.assertLess(begin.index("startApp('test')"), begin.index("await fullscreenRequest"))
        self.assertIn("const playPromise=sectionAudio.play()", play)
        self.assertIn("return playPromise.catch((error)=>", play)
        self.assertIn("console.error('Listening audio playback failed:'", play)
        self.assertNotIn("catch(()=>{})", self.html)
        self.assertNotIn("[TEMP audio-start diagnostic]", self.html)

    def test_visible_test_navigation_remains_independent_from_playback(self):
        update = self.function_body("updateSectionAudio", "buildFooter")
        switch = self.function_body("switchSection", "jumpToQuestion")
        self.assertIn("const sectionForAudio=shouldShow ? activeSection : playbackSection", update)
        self.assertIn("activeSection=section", switch)
        self.assertNotIn("playbackSection=section", switch)

    def test_automatic_part_progression_uses_one_play_path(self):
        ended = re.search(
            r"sectionAudio\.addEventListener\('ended',\(\)=>\{(?P<body>.*?)\}\);",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(ended)
        self.assertIn("playbackSection += 1; updateSectionAudio(); return", ended.group("body"))
        self.assertNotIn("playCurrentSectionAudio()", ended.group("body"))

    def test_results_include_local_integrity_summary(self):
        self.assertIn('id="integrityLine"', self.html)
        self.assertIn("Full-screen exits: ${fullScreenExits}", self.html)
        self.assertIn("focus losses / tab switches: ${focusLosses}", self.html)


if __name__ == "__main__":
    unittest.main()
