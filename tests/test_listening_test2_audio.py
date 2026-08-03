import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening/cambridge-16/test-2/IELTS16 Test 2 - Listening.html"


class ListeningTest2AudioContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def test_exact_four_test2_sources_exist(self):
        for part in range(1, 5):
            filename = f"Test 2 Part {part}.mp3"
            self.assertIn(f"../../../{filename}", self.html)
            self.assertTrue((ROOT / filename).is_file())

    def test_audited_test2_floors_are_all_zero(self):
        self.assertIn("const studyAudioStartFloors = {1:0,2:0,3:0,4:0}", self.html)

    def test_four_in_memory_positions_reset_for_fresh_study(self):
        self.assertIn("studyAudioPositions = {1:0,2:0,3:0,4:0}", self.html)
        self.assertIn("function resetStudyAudioPositions()", self.html)
        self.assertNotRegex(self.html, r"(?:localStorage|sessionStorage).*studyAudioPositions")

    def test_progress_seek_and_pause_save_positions(self):
        for event in ("timeupdate", "seeked", "pause"):
            self.assertIn(f"sectionAudio.addEventListener('{event}',saveStudyAudioPosition)", self.html)
        self.assertIn("function saveStudyAudioPosition(sectionOverride=null)", self.html)
        self.assertIn("saveStudyAudioPosition(previousAudioSection)", self.html)

    def test_part_change_has_metadata_and_stale_load_guards(self):
        self.assertIn("studyAudioLoadToken", self.html)
        self.assertIn("studyAudioTransition", self.html)
        self.assertIn("loadedmetadata", self.html)
        self.assertIn("if(loadToken!==studyAudioLoadToken", self.html)
        self.assertIn("sectionAudioSource.getAttribute('src')!==src", self.html)
        self.assertIn("sectionAudio.removeEventListener('loadedmetadata',restore)", self.html)
        self.assertIn("sectionAudio.addEventListener('loadedmetadata',restore)", self.html)
        self.assertNotIn("sectionAudio.addEventListener('loadedmetadata',restore,{once:true})", self.html)
        self.assertIn("Math.abs(sectionAudio.currentTime-safeTarget)<0.05", self.html)
        self.assertIn("sectionAudio.addEventListener('seeked',finishRestore,{once:true})", self.html)
        load_start = self.html.index("function loadStudyAudioForSection(section)")
        load_end = self.html.index("function playCurrentSectionAudio", load_start)
        load = self.html[load_start:load_end]
        self.assertLess(
            load.index("restoreStudyAudioPosition(section,src,loadToken)"),
            load.index("sectionAudioSource.setAttribute('src',src)"),
        )
        self.assertLess(
            load.index("sectionAudioSource.setAttribute('src',src)"),
            load.index("sectionAudio.load()"),
        )

    def test_restore_waits_for_the_requested_media_and_handles_cached_readiness(self):
        restore_start = self.html.index("function restoreStudyAudioPosition(section,src,loadToken)")
        restore_end = self.html.index("function loadStudyAudioForSection", restore_start)
        restore = self.html[restore_start:restore_end]

        self.assertIn(
            "const expectedCurrentSrc=studyAudioObjectUrls[section] || new URL(src,document.URL).href",
            restore,
        )
        self.assertIn("const restore=(event)=>", restore)
        self.assertIn(
            "if(sectionAudio.currentSrc!==expectedCurrentSrc) return",
            restore,
        )
        self.assertIn("if(sectionAudio.readyState<2)", restore)
        self.assertIn("if(event && event.type==='loadedmetadata')", restore)
        self.assertIn("sectionAudio.addEventListener('canplay',restore,{once:true})", restore)
        self.assertIn("if(sectionAudio.readyState>=1) restore()", restore)
        self.assertIn(
            "if(loadedAudioSection!==section && studyAudioTransition && studyAudioTransition.loadToken===loadToken)",
            restore,
        )
        self.assertIn("sectionAudio.addEventListener('loadedmetadata',restore)", restore)
        self.assertIn(
            "studyAudioPositionInitialized[section] ? studyAudioPositions[section] : getStudyAudioFloor(section)",
            restore,
        )
        self.assertIn("sectionAudio.pause()", restore)

    def test_study_restore_has_a_non_range_server_seekability_fallback(self):
        self.assertIn("studyAudioObjectUrls", self.html)
        self.assertIn("studyAudioSeekabilityPending", self.html)
        self.assertIn("async function prepareStudyAudioSeekability(section,src,loadToken)", self.html)
        self.assertIn("fetch(src,{headers:{Range:'bytes=0-0'}})", self.html)
        self.assertIn("if(response.status===206) return", self.html)
        self.assertIn("URL.createObjectURL(await response.blob())", self.html)
        self.assertIn("prepareStudyAudioSeekability(section,src,loadToken)", self.html)
        self.assertIn("sectionAudio.removeAttribute('src')", self.html)

    def test_latest_deliberate_native_seek_wins(self):
        self.assertIn("studyAudioUserSeekToken", self.html)
        self.assertIn("pendingStudyAudioUserSeek", self.html)
        self.assertIn("beginStudyAudioControlInteraction", self.html)
        self.assertIn("pointerdown", self.html)
        self.assertIn("keydown", self.html)

    def test_study_switch_pauses_restores_and_never_autoplays(self):
        self.assertIn("function loadStudyAudioForSection", self.html)
        self.assertIn("sectionAudio.pause()", self.html)
        self.assertIn("restoreStudyAudioPosition", self.html)
        self.assertIn("if(mode==='test' && !submitted", self.html)

    def test_test_sequence_is_separate_and_submission_silences_it(self):
        self.assertIn("playbackSection", self.html)
        self.assertIn("function advanceTestAudioSequence()", self.html)
        self.assertIn("function stopActiveTestAudio()", self.html)
        self.assertIn("if(mode==='test' && !submitted && playbackSection<4)", self.html)
        self.assertIn("submittedReview", self.html)

    def test_sticky_player_and_mobile_native_controls(self):
        self.assertIn("position: sticky", self.html)
        self.assertIn('id="studyAudioPartLabel"', self.html)
        self.assertIn("#sectionAudio", self.html)
        self.assertIn("width: 100%", self.html)

    def test_visible_status_uses_loaded_source_and_real_media_state(self):
        self.assertIn("function getLoadedAudioStatusSection()", self.html)
        self.assertIn("studyAudioObjectUrls[section]", self.html)
        status_start = self.html.index("function updateAudioStatusLabel(")
        status_end = self.html.index("function formatDuration", status_start)
        status = self.html[status_start:status_end]

        self.assertIn("getLoadedAudioStatusSection()", status)
        self.assertIn("sectionAudio.ended", status)
        self.assertIn("sectionAudio.paused", status)
        self.assertIn("sectionAudio.readyState", status)
        for wording in (
            "Loading Part ${part} audio",
            "Part ${part} audio paused",
            "Part ${part} audio playing",
            "Part ${part} audio ended",
        ):
            self.assertIn(wording, status)
        for forbidden_side_effect in (
            ".play(",
            ".pause(",
            "currentTime=",
            "setAttribute('src'",
            ".load(",
            "activeSection=",
            "playbackSection=",
            "submitTest(",
            "evaluateAll(",
        ):
            self.assertNotIn(forbidden_side_effect, status)

    def test_status_events_and_source_transitions_are_not_optimistic_or_stale(self):
        for event in (
            "loadstart",
            "loadedmetadata",
            "canplay",
            "play",
            "playing",
            "pause",
            "waiting",
            "seeking",
            "seeked",
            "ended",
        ):
            self.assertRegex(
                self.html,
                rf"sectionAudio\.addEventListener\('{event}'.*updateAudioStatusLabel",
            )

        status_start = self.html.index("function updateAudioStatusLabel(")
        status_end = self.html.index("function formatDuration", status_start)
        status = self.html[status_start:status_end]
        self.assertIn("loadToken!==studyAudioLoadToken", status)
        self.assertIn("studyAudioTransition.loadToken!==loadToken", status)

        play_start = self.html.index("function playCurrentSectionAudio()")
        play_end = self.html.index("function loadTestAudioSource", play_start)
        play = self.html[play_start:play_end]
        self.assertLess(play.index("sectionAudio.play()"), play.index("updateAudioStatusLabel()"))

    def test_submitted_review_resynchronises_to_a_visible_paused_status(self):
        review_start = self.html.index("function activateSubmittedReview()")
        review_end = self.html.index("function showResultsSummary", review_start)
        review = self.html[review_start:review_end]
        self.assertIn("sectionAudio.pause()", review)
        self.assertIn("updateAudioStatusLabel()", review)
        self.assertLess(review.rindex("sectionAudio.pause()"), review.index("updateAudioStatusLabel()"))


if __name__ == "__main__":
    unittest.main()
