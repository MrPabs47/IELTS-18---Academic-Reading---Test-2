"""Static contract tests for IELTS 16 Listening Test 1 Part 2 map dropdowns."""

from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = (
    ROOT
    / "listening"
    / "cambridge-16"
    / "test-1"
    / "IELTS16 Test 1 - Listening.html"
)
HTML = HTML_PATH.read_text(encoding="utf-8")
MAP_QUESTIONS = tuple(range(15, 21))
MAP_LETTERS = tuple("ABCDEFGHIJ")
MAP_ANSWERS = {15: "H", 16: "C", 17: "G", 18: "B", 19: "I", 20: "A"}
MAP_LABELS = {
    15: "15. coffee room",
    16: "16. warehouse",
    17: "17. staff canteen",
    18: "18. meeting room",
    19: "19. human resources",
    20: "20. boardroom",
}


class SelectParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.selects = []
        self.labels = {}
        self._select = None
        self._option = None
        self._label_for = None
        self._text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "select":
            self._select = {"attrs": attrs, "options": []}
            self.selects.append(self._select)
        elif tag == "option" and self._select is not None:
            self._option = {"attrs": attrs, "text": ""}
            self._select["options"].append(self._option)
        elif tag == "label":
            self._label_for = attrs.get("for")
            self._text = []

    def handle_data(self, data):
        if self._option is not None:
            self._option["text"] += data
        if self._label_for is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag == "option":
            self._option = None
        elif tag == "select":
            self._select = None
        elif tag == "label" and self._label_for is not None:
            self.labels[self._label_for] = "".join(self._text).strip()
            self._label_for = None
            self._text = []


PARSER = SelectParser()
PARSER.feed(HTML)
SELECTS_BY_NAME = {
    item["attrs"].get("name"): item
    for item in PARSER.selects
    if item["attrs"].get("name")
}


def map_select(question):
    return SELECTS_BY_NAME[f"q{question}"]


def answer_object(name):
    match = re.search(rf"const {name} = \{{([^;]+)\}};", HTML)
    assert match
    return match.group(1)


def function_body(name, next_name):
    match = re.search(
        rf"function {re.escape(name)}\([^)]*\)\{{(?P<body>.*?)"
        rf"function {re.escape(next_name)}\(",
        HTML,
        re.S,
    )
    assert match, f"Could not find {name}()"
    return match.group("body")


def test_static_contract_exact_map_questions_are_native_selects():
    assert all(f"q{question}" in SELECTS_BY_NAME for question in MAP_QUESTIONS)
    assert not re.search(
        r'<input\b[^>]*\bname="q(?:1[5-9]|20)"',
        HTML,
    )
    assert 'role="listbox"' not in HTML


def test_static_contract_each_map_select_has_exact_blank_and_a_to_j_options():
    for question in MAP_QUESTIONS:
        options = map_select(question)["options"]
        values = [option["attrs"].get("value") for option in options]
        labels = [option["text"].strip() for option in options]
        assert values == ["", *MAP_LETTERS]
        assert labels == ["Select a letter", *MAP_LETTERS]
        assert len(values) == len(set(values))


def test_static_contract_default_is_blank_unselected_and_not_answer_revealing():
    for question in MAP_QUESTIONS:
        options = map_select(question)["options"]
        assert options[0] == {"attrs": {"value": ""}, "text": "Select a letter"}
        assert all("selected" not in option["attrs"] for option in options)
        assert all(
            option["text"].strip() in ("Select a letter", *MAP_LETTERS)
            for option in options
        )


def test_static_contract_accessible_names_include_question_and_location():
    for question, expected_label in MAP_LABELS.items():
        select_id = map_select(question)["attrs"].get("id")
        assert select_id == f"q{question}-map"
        assert PARSER.labels[select_id] == expected_label


def test_static_contract_map_selects_use_existing_change_architecture():
    assert (
        "document.querySelectorAll('input[type=\"text\"], select, "
        "input[type=\"radio\"], input[type=\"checkbox\"]')"
    ) in HTML
    assert "el.addEventListener('change', onAnswerChange)" in HTML
    assert "if(el.type==='text') el.addEventListener('input', onAnswerChange)" in HTML
    assert ".map-letter-select" not in re.sub(
        r"\.map-letter-select(?:[^{]*)\{[^}]*\}", "",
        HTML,
        flags=re.S,
    ).split("<script>")[-1]


def test_static_contract_selected_and_blank_values_drive_answered_state():
    assert 'const select=document.querySelector(`select[name="q${q}"]`);' in HTML
    assert "if(select) return select.value.trim();" in HTML
    assert "return String(getUserAnswer(q)).trim().length>0;" in HTML
    assert "btn.classList.toggle('answered', isAnswered(q))" in HTML
    assert "if(isAnswered(q)) answered+=1;" in HTML


def test_static_contract_study_checking_and_rechecking_use_existing_values():
    assert "const user=normalizeAnswer(getUserAnswer(q));" in HTML
    assert "return answerKey[q].some((ans)=>normalizeAnswer(ans)===user);" in HTML
    assert "block.classList.remove('correct','incorrect','partial');" in HTML
    assert "function handlePrimarySubmit(){ if(mode==='study'){ submitTest(); return; }" in HTML


def test_static_contract_test_submission_reads_and_disables_selects():
    assert "const totalCorrect=evaluateAll();" in HTML
    assert (
        "document.querySelectorAll('input, select').forEach((el)=>{ "
        "el.disabled=true; });"
    ) in HTML
    assert "if(isTestAnswerLocked()) return;" in HTML


def test_static_contract_fresh_map_state_is_blank_html_state():
    for question in MAP_QUESTIONS:
        select = map_select(question)
        assert "value" not in select["attrs"]
        assert select["options"][0]["attrs"] == {"value": ""}
        assert all("selected" not in option["attrs"] for option in select["options"])


def test_static_contract_answer_keys_and_scoring_are_preserved():
    key = answer_object("answerKey")
    display = answer_object("displayAnswers")
    for question, answer in MAP_ANSWERS.items():
        assert f"{question}:['{answer}']" in key
        assert f"{question}:'{answer}'" in display
    assert (
        "showCorrectAnswer('ca-15-20','15 H, 16 C, 17 G, 18 B, 19 I, 20 A');"
        in HTML
    )
    assert "function bandFromScore(score)" in HTML


def test_static_contract_map_asset_and_layout_are_preserved():
    assert (
        '<img src="./section-2-map-only.png" '
        'alt="Plan of Stevenson\'s site map" />'
    ) in HTML
    assert ".map-crop-frame img {" in HTML
    assert "width: 100%;" in HTML
    assert "height: auto;" in HTML
    assert "@media (max-width: 900px)" in HTML
    assert ".map-qa-layout { grid-template-columns: 1fr; }" in HTML


def test_static_contract_only_part2_map_controls_were_converted():
    assert re.search(r'<input name="q1" type="text"', HTML)
    assert re.search(r'<input type="checkbox" name="q21_22"', HTML)
    assert re.search(r'<select\b[^>]*\bname="q25"', HTML)
    assert re.search(r'<input name="q31" type="text"', HTML)
    assert len([q for q in MAP_QUESTIONS if f'name="q{q}"' in HTML]) == 6


def test_static_contract_theme_aware_compact_focus_styling_exists():
    style = HTML.split("<style>", 1)[1].split("</style>", 1)[0]
    assert re.search(
        r"\.map-letter-select\s*\{[^}]*min-width:\s*0;[^}]*"
        r"height:\s*42px;[^}]*padding:\s*6px 34px 6px 10px;[^}]*"
        r"background:\s*var\(--panel\);[^}]*"
        r"color:\s*var\(--text\);[^}]*border-color:\s*var\(--border\);",
        style,
        re.S,
    )
    assert re.search(
        r"\.map-letter-select:focus-visible\s*\{[^}]*"
        r"outline:\s*2px solid var\(--accent\);",
        style,
        re.S,
    )
    assert "flex-wrap: wrap;" in style


def test_static_contract_redundant_number_badge_cannot_cover_select_text():
    style = HTML.split("<style>", 1)[1].split("</style>", 1)[0]
    assert ".map-answer-list .inline-answer::before { content: none; }" in style
    assert re.search(
        r"\.map-answer-list \.inline-answer\s*\{[^}]*"
        r"flex:\s*0 1 180px;[^}]*width:\s*180px;[^}]*"
        r"min-width:\s*180px;[^}]*max-width:\s*100%;",
        style,
        re.S,
    )
    assert all(
        re.search(
            rf'<label for="q{question}-map">{re.escape(label)}</label>'
            rf'<span class="inline-answer" data-q="{question}"><select',
            HTML,
        )
        for question, label in MAP_LABELS.items()
    )


def test_static_contract_desktop_alignment_and_mobile_offset_reset_are_explicit():
    style = HTML.split("<style>", 1)[1].split("</style>", 1)[0]
    assert ".map-answer-list { align-self: center; }" in style
    mobile = re.search(r"@media \(max-width: 900px\)\s*\{(?P<body>.*?)\n    \}", style, re.S)
    assert mobile
    assert ".map-answer-list { align-self: start; margin-top: 0; }" in mobile.group("body")
    assert "position: absolute" not in re.search(
        r"\.map-answer-list\s*\{(?P<body>[^}]*)\}",
        style,
    ).group("body")


def test_static_contract_first_test_submission_shows_existing_results_summary():
    submit = function_body("submitTest", "showResultsSummary")
    results = function_body("showResultsSummary", "confirmSubmit")
    assert "const totalCorrect=evaluateAll();" in submit
    assert (
        "document.getElementById('scoreLine').innerHTML="
        "`<strong>Score:</strong> ${totalCorrect} out of 40`;"
    ) in submit
    assert "showResultsSummary();" in submit
    assert "resultsOverlay.style.display='flex'" in results
    assert "closeResultsBtn.focus({preventScroll:true})" in results
    assert (
        'id="resultsPanel" role="dialog" aria-modal="true" '
        'aria-labelledby="results-title"'
    ) in HTML


def test_static_contract_repeat_submit_reopens_without_reconfirming_or_rescoring():
    handler = function_body("handlePrimarySubmit", "startApp")
    results = function_body("showResultsSummary", "confirmSubmit")
    assert "if(submitted) return showResultsSummary()" in handler
    assert handler.index("if(submitted)") < handler.index("confirmSubmit()")
    assert "evaluateAll" not in results
    assert "confirmSubmit" not in results
    assert "append" not in results
    assert "clone" not in results


def test_static_contract_final_submission_stops_and_invalidates_test_audio():
    stop = function_body("stopTestAudioForSubmission", "submitTest")
    silence = function_body("enforceSubmittedTestAudioSilence", "stopTestAudioForSubmission")
    submit = function_body("submitTest", "showResultsSummary")
    assert "studyAudioLoadToken+=1" in stop
    assert "studyAudioTransition=null" in stop
    assert "studyAudioResumeAfterSeekPending=false" in stop
    assert "testAudioWasPlayingBeforeFullscreenLock=false" in stop
    assert "testPart1FreshStartPending=false" in stop
    assert "enforceSubmittedTestAudioSilence()" in stop
    assert "sectionAudio.pause()" in silence
    assert "getSectionAudioSourcePart()===1" in silence
    assert "PART_1_FRESH_START_SECONDS" in silence
    assert "stopTestAudioForSubmission()" in submit
    assert submit.index("stopTestAudioForSubmission()") < submit.index("evaluateAll()")


def test_static_contract_post_submission_cannot_reload_or_restart_audio():
    update = function_body("updateSectionAudio", "buildFooter")
    play = function_body("playCurrentSectionAudio", "resetPart1FreshStart")
    handler = function_body("handlePrimarySubmit", "startApp")
    submitted_branch = update.split("const shouldShow", 1)[0]
    assert "if(mode==='test' && submitted)" in submitted_branch
    assert "audioBar.classList.remove('visible')" in submitted_branch
    assert "return;" in submitted_branch
    assert "sectionAudio.load()" not in submitted_branch
    assert "enforceSubmittedTestAudioSilence()" in play
    assert "showResultsSummary()" in handler
    assert "playCurrentSectionAudio" not in handler
    assert "updateSectionAudio" not in handler


def test_static_contract_audio_status_uses_real_source_and_playback_state():
    source = function_body("getSectionAudioSourcePart", "updateAudioStatusLabel")
    status = function_body("updateAudioStatusLabel", "formatDuration")
    assert "sectionAudioSource.getAttribute('src')" in source
    assert "Object.entries(audioSources)" in source
    assert "const sourcePart=getSectionAudioSourcePart()" in status
    assert "const playing=isMediaActuallyPlaying()" in status
    assert "'is playing' : 'is paused'" in status
    assert "audioStatus.classList.toggle('hidden',!playing)" in status
    assert ".audio-status.hidden { display: none; }" in HTML
    assert "if(enforceSubmittedTestAudioSilence()) return" in HTML


def test_static_contract_disabled_map_selects_keep_native_values():
    submit = function_body("submitTest", "showResultsSummary")
    assert "document.querySelectorAll('input, select')" in submit
    assert "el.disabled=true" in submit
    assert not re.search(r"\.value\s*=\s*['\"]{2}", submit)
    assert not re.search(r"selectedIndex\s*=", submit)


def test_static_contract_no_custom_dropdown_or_per_select_listener_exists():
    assert 'role="listbox"' not in HTML
    assert 'role="option"' not in HTML
    assert "new CustomEvent" not in HTML
    assert "querySelectorAll('.map-letter-select').forEach" not in HTML
    assert "querySelectorAll(\".map-letter-select\").forEach" not in HTML


def test_static_contract_part1_transcript_click_seek_foundation_remains():
    assert "function setupTranscriptSeekInteractions()" in HTML
    assert "function activatePart1TranscriptRow(row)" in HTML
    assert "audioscriptBody.addEventListener('click',(event)=>{" in HTML
    assert "targetTime:normaliseStudyAudioPosition(section,segment.start)" in HTML
    assert "const PART_1_FRESH_START_SECONDS = 10.000;" in HTML


def test_static_contract_part2_transcript_remains_empty():
    assert '2: { audioSrc: "./Test 1 Part 2.mp3", speakers: {}, segments: [] }' in HTML


class ListeningPart2MapDropdownStaticContractTest(unittest.TestCase):
    test_static_contract_exact_map_questions_are_native_selects = staticmethod(
        test_static_contract_exact_map_questions_are_native_selects
    )
    test_static_contract_each_map_select_has_exact_blank_and_a_to_j_options = staticmethod(
        test_static_contract_each_map_select_has_exact_blank_and_a_to_j_options
    )
    test_static_contract_default_is_blank_unselected_and_not_answer_revealing = staticmethod(
        test_static_contract_default_is_blank_unselected_and_not_answer_revealing
    )
    test_static_contract_accessible_names_include_question_and_location = staticmethod(
        test_static_contract_accessible_names_include_question_and_location
    )
    test_static_contract_map_selects_use_existing_change_architecture = staticmethod(
        test_static_contract_map_selects_use_existing_change_architecture
    )
    test_static_contract_selected_and_blank_values_drive_answered_state = staticmethod(
        test_static_contract_selected_and_blank_values_drive_answered_state
    )
    test_static_contract_study_checking_and_rechecking_use_existing_values = staticmethod(
        test_static_contract_study_checking_and_rechecking_use_existing_values
    )
    test_static_contract_test_submission_reads_and_disables_selects = staticmethod(
        test_static_contract_test_submission_reads_and_disables_selects
    )
    test_static_contract_fresh_map_state_is_blank_html_state = staticmethod(
        test_static_contract_fresh_map_state_is_blank_html_state
    )
    test_static_contract_answer_keys_and_scoring_are_preserved = staticmethod(
        test_static_contract_answer_keys_and_scoring_are_preserved
    )
    test_static_contract_map_asset_and_layout_are_preserved = staticmethod(
        test_static_contract_map_asset_and_layout_are_preserved
    )
    test_static_contract_only_part2_map_controls_were_converted = staticmethod(
        test_static_contract_only_part2_map_controls_were_converted
    )
    test_static_contract_theme_aware_compact_focus_styling_exists = staticmethod(
        test_static_contract_theme_aware_compact_focus_styling_exists
    )
    test_static_contract_redundant_number_badge_cannot_cover_select_text = staticmethod(
        test_static_contract_redundant_number_badge_cannot_cover_select_text
    )
    test_static_contract_desktop_alignment_and_mobile_offset_reset_are_explicit = staticmethod(
        test_static_contract_desktop_alignment_and_mobile_offset_reset_are_explicit
    )
    test_static_contract_first_test_submission_shows_existing_results_summary = staticmethod(
        test_static_contract_first_test_submission_shows_existing_results_summary
    )
    test_static_contract_repeat_submit_reopens_without_reconfirming_or_rescoring = staticmethod(
        test_static_contract_repeat_submit_reopens_without_reconfirming_or_rescoring
    )
    test_static_contract_final_submission_stops_and_invalidates_test_audio = staticmethod(
        test_static_contract_final_submission_stops_and_invalidates_test_audio
    )
    test_static_contract_post_submission_cannot_reload_or_restart_audio = staticmethod(
        test_static_contract_post_submission_cannot_reload_or_restart_audio
    )
    test_static_contract_audio_status_uses_real_source_and_playback_state = staticmethod(
        test_static_contract_audio_status_uses_real_source_and_playback_state
    )
    test_static_contract_disabled_map_selects_keep_native_values = staticmethod(
        test_static_contract_disabled_map_selects_keep_native_values
    )
    test_static_contract_no_custom_dropdown_or_per_select_listener_exists = staticmethod(
        test_static_contract_no_custom_dropdown_or_per_select_listener_exists
    )
    test_static_contract_part1_transcript_click_seek_foundation_remains = staticmethod(
        test_static_contract_part1_transcript_click_seek_foundation_remains
    )
    test_static_contract_part2_transcript_remains_empty = staticmethod(
        test_static_contract_part2_transcript_remains_empty
    )
