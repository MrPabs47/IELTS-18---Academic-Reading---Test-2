import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "listening" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Listening.html"


class ListeningStudyAudioMemoryStaticContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def test_has_four_independent_in_memory_positions_and_session_reset(self):
        self.assertIn("studyAudioPositions = {1:0,2:0,3:0,4:0}", self.html)
        self.assertIn("function resetStudyAudioPositions()", self.html)
        self.assertIn("if(mode==='study') resetStudyAudioPositions()", self.html)
        self.assertNotRegex(self.html, r"(?:localStorage|sessionStorage).*studyAudioPositions")

    def test_saves_on_playback_pause_and_seek(self):
        self.assertRegex(self.html, r"sectionAudio\.addEventListener\('timeupdate'.*?saveStudyAudioPosition\(\)")
        self.assertRegex(self.html, r"sectionAudio\.addEventListener\('seeked'.*?saveStudyAudioPosition\(\)")
        self.assertRegex(
            self.html,
            r"sectionAudio\.addEventListener\('pause'.*?saveStudyAudioPosition\(\)",
        )

    def test_native_controls_remain_pointer_and_keyboard_seekable(self):
        self.assertRegex(self.html, r'<audio id="sectionAudio" controls preload="auto">')
        audio_css = "\n".join(re.findall(r"#sectionAudio\s*\{(.*?)\}", self.html, re.DOTALL))
        self.assertIn("pointer-events: auto", audio_css)
        self.assertIn("position: relative", audio_css)
        self.assertIn("z-index: 1", audio_css)
        self.assertIn("flex: 1 1 420px", audio_css)
        self.assertIn("min-width: 0", audio_css)
        self.assertIn("width: 100%", audio_css)
        self.assertNotRegex(audio_css, r"pointer-events:\s*none")
        self.assertIn(
            "sectionAudio.addEventListener('pointerdown',beginStudyAudioControlInteraction)",
            self.html,
        )
        self.assertIn("['ArrowLeft','ArrowRight','Home','End'].includes(event.key)", self.html)
        self.assertIn("function prepareStudyAudioSeekability(section,src,loadToken)", self.html)
        self.assertIn("fetch(src,{headers:{Range:'bytes=0-0'}})", self.html)
        self.assertIn("if(response.status===206) return", self.html)
        self.assertIn("URL.createObjectURL(await response.blob())", self.html)
        self.assertIn("if(mode==='study' && studyAudioObjectUrls[sectionForAudio])", self.html)

    def test_audio_flex_rule_is_not_dropped_by_batch_b_css(self):
        self.assertRegex(
            self.html,
            r"(?s)\.reading-shell-study-status-unanswered\s*\{[^{}]*\}\s*"
            r"#sectionAudio\s*\{",
        )
        audio_bar_css = re.search(
            r"\.audio-bar\s*\{(.*?)\}", self.html, re.DOTALL
        ).group(1)
        self.assertIn("width: 100%", audio_bar_css)
        self.assertIn("min-width: 0", audio_bar_css)
        self.assertIn("box-sizing: border-box", audio_bar_css)

    def test_mobile_audio_wraps_to_a_full_usable_row(self):
        self.assertRegex(
            self.html,
            r"(?s)@media \(max-width: 560px\).*?"
            r"\.audio-bar\.visible\s*\{\s*flex-wrap:\s*wrap;.*?"
            r"#sectionAudio\s*\{\s*flex-basis:\s*100%;\s*height:\s*34px;\s*\}",
        )

    def test_user_control_interaction_cannot_be_overwritten_by_pending_restore(self):
        interaction = re.search(
            r"function beginStudyAudioControlInteraction\(\)\{(?P<body>.*?)\n\s*\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(interaction)
        body = interaction.group("body")
        self.assertIn("mode!=='study'", body)
        self.assertIn("studyAudioTransition.section!==activeSection", body)
        self.assertIn("sectionAudioSource.getAttribute('src')!==audioSources[activeSection]", body)
        self.assertIn("studyAudioTransition=null", body)
        self.assertIn("cancelPendingStudyAudioUserSeek()", body)
        self.assertIn("loadedAudioSection=activeSection", body)
        self.assertNotIn("preventDefault", body)
        self.assertNotIn("sectionAudio.currentTime=", body)

    def test_seekability_fallback_preserves_state_and_is_study_only(self):
        fallback = re.search(
            r"async function prepareStudyAudioSeekability\(section,src,loadToken\)\{(?P<body>.*?)\n\s*\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(fallback)
        body = fallback.group("body")
        self.assertIn("mode!=='study'", body)
        self.assertIn("studyAudioSeekabilityPending[section]", body)
        self.assertIn("studyAudioSeekabilityPending[section]=true", body)
        self.assertIn("loadToken!==studyAudioLoadToken", body)
        self.assertIn("activeSection!==section", body)
        self.assertIn("const shouldResume=!sectionAudio.paused", body)
        self.assertIn("saveStudyAudioPosition(section)", body)
        self.assertIn("resumeAfterRestore:shouldResume", body)
        self.assertIn("restoreStudyAudioPosition(section,src,objectLoadToken)", body)
        self.assertIn("studyAudioSeekabilityPending[section]=false", self.html)
        restore = re.search(
            r"function restoreStudyAudioPosition\(section,src,loadToken\)\{(?P<body>.*?)\n\s*\}\n\s*function partHasTranscript",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(restore)
        self.assertIn("if(shouldResume) playCurrentSectionAudio()", restore.group("body"))

    def test_restores_only_after_metadata_with_stale_load_guards(self):
        self.assertIn("function restoreStudyAudioPosition(section,src,loadToken)", self.html)
        self.assertIn("loadToken!==studyAudioLoadToken", self.html)
        self.assertIn("activeSection!==section", self.html)
        self.assertIn("sectionAudioSource.getAttribute('src')!==src", self.html)
        self.assertIn("!studyAudioTransition || studyAudioTransition.loadToken!==loadToken", self.html)
        self.assertIn("sectionAudio.readyState>=1", self.html)
        self.assertIn("sectionAudio.addEventListener('loadedmetadata',restore,{once:true})", self.html)
        self.assertIn("sectionAudio.currentTime=restoredTime", self.html)
        self.assertIn(
            "pendingStudyAudioUserSeek && pendingStudyAudioUserSeek.section===section",
            self.html,
        )

    def test_deliberate_transcript_seek_has_a_single_newest_request_token(self):
        request = re.search(
            r"function requestStudyAudioUserSeek\(section,segment,shouldPlay\)"
            r"\{(?P<body>.*?)\n\s*\}",
            self.html,
            re.DOTALL,
        )
        cancel = re.search(
            r"function cancelPendingStudyAudioUserSeek\(\)\{(?P<body>.*?)\n\s*\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(request)
        self.assertIsNotNone(cancel)
        self.assertIn("token:++studyAudioUserSeekToken", self.html)
        self.assertIn("pendingStudyAudioUserSeek=request", self.html)
        self.assertIn("studyAudioUserSeekToken+=1", cancel.group("body"))
        self.assertIn("pendingStudyAudioUserSeek=null", cancel.group("body"))

    def test_load_and_restore_events_cannot_overwrite_saved_positions(self):
        save = re.search(
            r"function saveStudyAudioPosition\(section=loadedAudioSection\)\{(?P<body>.*?)\n\s*\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(save)
        self.assertIn("studyAudioTransition", save.group("body"))
        self.assertIn("pendingStudyAudioUserSeek", save.group("body"))
        self.assertIn("studyAudioTransition={loadToken,section:sectionForAudio,src}", self.html)
        self.assertIsNotNone(
            re.search(
                r"loadedAudioSection=section;.*?sectionAudio\.currentTime=restoredTime",
                self.html,
                re.DOTALL,
            )
        )
        self.assertIn(
            "if(studyAudioTransition && studyAudioTransition.loadToken===loadToken) studyAudioTransition=null",
            self.html,
        )

    def test_part_change_saves_pauses_loads_restores_and_does_not_study_autoplay(self):
        update = re.search(
            r"function updateSectionAudio\(\)\{(?P<body>.*?)\n\s*\}\n\s*function buildFooter",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(update)
        body = update.group("body")
        self.assertIn("saveStudyAudioPosition(loadedAudioSection)", body)
        self.assertIn("sectionAudio.pause()", body)
        self.assertIn("sectionAudio.load()", body)
        self.assertIn("restoreStudyAudioPosition(sectionForAudio,src,loadToken)", body)
        self.assertNotIn("mode==='study' && sectionAudio.paused", body)
        self.assertIn("mode==='test' && !submitted && sectionAudio.paused", body)

    def test_test_mode_keeps_playback_section_and_same_source_is_not_reloaded(self):
        self.assertIn("const sectionForAudio=shouldShow ? activeSection : playbackSection", self.html)
        self.assertIsNotNone(
            re.search(
                r"if\(sectionAudioSource\.getAttribute\('src'\)!==src\)\{.*?sectionAudio\.load\(\)",
                self.html,
                re.DOTALL,
            )
        )
        self.assertIn(
            "if(mode==='test' && !submitted && playbackSection<4){ playbackSection += 1;",
            self.html,
        )

    def test_compact_sticky_player_keeps_dynamic_part_label(self):
        self.assertIn('id="sectionAudioLabel">Part 1 audio</label>', self.html)
        self.assertIn("sectionAudioLabel.textContent=`Part ${sectionForAudio} audio`", self.html)
        self.assertNotIn("Changing parts pauses the audio.", self.html)
        self.assertNotIn("audio-note", self.html)
        self.assertIsNotNone(
            re.search(
                r"\.audio-bar\s*\{.*?position:\s*sticky;.*?top:\s*var\(--header-h\);",
                self.html,
                re.DOTALL,
            )
        )
        self.assertIn(".audio-bar.visible { display: flex; }", self.html)
        self.assertIn("#sectionAudio {", self.html)


if __name__ == "__main__":
    unittest.main()
