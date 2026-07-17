import json
import re
from pathlib import Path


HTML_PATH = Path("academic/cambridge-16/test-4/IELTS16 Test 4 - Academic Reading.html")
HTML = HTML_PATH.read_text(encoding="utf-8")
CORE = Path("academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")


EXPECTED_ANSWER_KEY = {
    1: "posts", 2: "canal", 3: "ventilation", 4: "lid", 5: "weight", 6: "climbing",
    7: "FALSE", 8: "NOT GIVEN", 9: "FALSE", 10: "TRUE", 11: "gold",
    12: ["architect", "the architect", "architect name", "the architect name", "architect's",
         "the architect's", "architect\u2019s", "the architect\u2019s", "architect's name",
         "the architect's name", "architect\u2019s name", "the architect\u2019s name"],
    13: ["harbour", "the harbour", "harbor", "the harbor"],
    14: "A", 15: "B", 16: "D", 17: "B", 18: "D", 19: "H", 20: "F", 21: "B", 22: "C",
    23: "YES", 24: "NO", 25: "NOT GIVEN", 26: "YES",
    27: "iii", 28: "vi", 29: "ii", 30: "i", 31: "vii", 32: "v",
    33: "C", 34: "B", 35: "A", 36: "NO", 37: "NOT GIVEN", 38: "YES", 39: "NO", 40: "YES",
}

EXPECTED_CORRECT_TEXT = {
    **{q: value for q, value in EXPECTED_ANSWER_KEY.items() if q not in (12, 13)},
    12: "architect / architect\u2019s name",
    13: "harbour / harbor",
}


def _extract_object(name):
    matches = list(re.finditer(rf"const\s+{name}\s*=\s*{{", HTML))
    assert len(matches) == 1
    start = matches[0].end() - 1
    depth = 0
    for index in range(start, len(HTML)):
        if HTML[index] == "{":
            depth += 1
        elif HTML[index] == "}":
            depth -= 1
            if depth == 0:
                body = HTML[start + 1:index]
                break
    else:
        raise AssertionError(f"Could not parse {name}")
    quoted = re.sub(r"(?m)^\s*(\d+)\s*:", r'"\1":', body)
    data = json.loads("{" + re.sub(r",\s*$", "", quoted.strip()) + "}")
    return {int(key): value for key, value in data.items()}


def _function_body(name):
    match = re.search(rf"function\s+{name}\s*\([^)]*\)\s*{{", HTML)
    assert match, f"Missing function {name}"
    start = match.end() - 1
    depth = 0
    for index in range(start, len(HTML)):
        if HTML[index] == "{":
            depth += 1
        elif HTML[index] == "}":
            depth -= 1
            if depth == 0:
                return HTML[start + 1:index]
    raise AssertionError(f"Could not parse function {name}")


def _named_controls(question):
    return re.findall(rf'<(?:input|select)\b[^>]*\bname="q{question}"[^>]*>', HTML)


def _tag_attributes(tag):
    return dict(re.findall(r'([\w:-]+)="([^"]*)"', tag))


def _element_text_by_id(element_id):
    match = re.search(rf'<(?P<tag>[a-z][\w-]*)\b[^>]*\bid="{re.escape(element_id)}"[^>]*>(?P<body>.*?)</(?P=tag)>', HTML, re.S)
    assert match, f"Missing element #{element_id}"
    return re.sub(r'<[^>]+>', '', match.group("body")).strip()


def test_page_owns_exactly_one_complete_one_point_answer_contract():
    assert _extract_object("answerKey") == EXPECTED_ANSWER_KEY
    assert _extract_object("correctAnswerText") == EXPECTED_CORRECT_TEXT
    assert sorted(_extract_object("answerKey")) == list(range(1, 41))
    assert sorted(_extract_object("correctAnswerText")) == list(range(1, 41))
    assert "const chooseTwoGroupNames = {};" in _function_body("getUserAnswer")
    assert "const chooseTwoGroups = {};" in _function_body("evaluateQuestions")
    assert "Object.values(chooseTwoGroups)" in _function_body("evaluateQuestions")
    assert "correctCount++;" in _function_body("evaluateQuestions")


def test_q12_q13_variants_and_canonical_display_answers_remain_distinct():
    key = _extract_object("answerKey")
    display = _extract_object("correctAnswerText")
    assert {"architect", "architect's name", "architect\u2019s name"}.issubset(set(key[12]))
    assert {"harbour", "harbor", "the harbour", "the harbor"}.issubset(set(key[13]))
    assert display[12] == "architect / architect\u2019s name"
    assert display[13] == "harbour / harbor"


def test_all_q1_q40_page_input_formats_are_protected():
    for question in list(range(1, 7)) + list(range(11, 14)):
        controls = _named_controls(question)
        assert len(controls) == 1 and 'type="text"' in controls[0]
    for question in range(7, 11):
        controls = _named_controls(question)
        assert len(controls) == 3
        assert {re.search(r'value="([^"]+)"', item).group(1) for item in controls} == {"TRUE", "FALSE", "NOT GIVEN"}
    for question in list(range(14, 18)) + list(range(33, 36)):
        controls = _named_controls(question)
        assert len(controls) == 4
        assert {re.search(r'value="([^"]+)"', item).group(1) for item in controls} == set("ABCD")
    for question in range(18, 23):
        controls = _named_controls(question)
        assert len(controls) == 1 and controls[0].startswith("<select")
        assert re.search(rf'inline-select-answer" data-q="{question}"', HTML)
    for question in list(range(23, 27)) + list(range(36, 41)):
        controls = _named_controls(question)
        assert len(controls) == 3
        assert {re.search(r'value="([^"]+)"', item).group(1) for item in controls} == {"YES", "NO", "NOT GIVEN"}
    for question in range(27, 33):
        controls = _named_controls(question)
        assert len(controls) == 1 and controls[0].startswith("<select")
    for question in range(1, 41):
        assert len(re.findall(rf'id="ca-{question}"', HTML)) == 1


def test_q11_q13_inputs_have_distinct_resolved_visible_accessible_names():
    label_ids = []
    accessible_names = []
    for question in range(11, 14):
        controls = _named_controls(question)
        assert len(controls) == 1
        attributes = _tag_attributes(controls[0])
        assert attributes["name"] == f"q{question}"
        assert attributes["type"] == "text"
        assert not attributes.get("placeholder")
        assert not attributes.get("aria-label")
        label_id = attributes.get("aria-labelledby")
        assert label_id
        label_ids.append(label_id)
        label_text = _element_text_by_id(label_id)
        assert label_text
        assert label_text.startswith(f"{question}.")
        accessible_names.append(label_text)
        assert re.search(rf'<div class="question-block" data-q="{question}">.*?{re.escape(controls[0])}.*?id="ca-{question}"', HTML, re.S)
    assert len(set(label_ids)) == 3
    assert len(set(accessible_names)) == 3


def test_fullscreen_lock_dialog_has_a_resolved_visible_heading_name():
    overlay = re.search(r'<div\b[^>]*\bid="fullscreenLockOverlay"[^>]*>', HTML)
    assert overlay
    attributes = _tag_attributes(overlay.group(0))
    assert attributes.get("role") == "dialog"
    assert not attributes.get("aria-label")
    heading_id = attributes.get("aria-labelledby")
    assert heading_id
    heading = re.search(rf'<h[1-6]\b[^>]*\bid="{re.escape(heading_id)}"[^>]*>(.*?)</h[1-6]>', HTML, re.S)
    assert heading
    assert re.sub(r'<[^>]+>', '', heading.group(1)).strip() == "Test paused"
    assert "showFullscreenLockOverlay()" in _function_body("handleFullscreenChange")
    assert "hideFullscreenLockOverlay()" in _function_body("handleFullscreenChange")
    assert "returnToFullscreenAndResume()" in HTML


def test_answer_reading_correctness_evaluation_score_and_band_stay_page_owned():
    get_answer = _function_body("getUserAnswer")
    for token in ["input[type='radio']", "select[name='", "input[type='text']"]:
        assert token in get_answer
    correct = _function_body("isUserAnswerCorrect")
    assert "const user = getUserAnswer(qNum);" in correct
    assert "const key = answerKey[qNum];" in correct
    assert "key.some" in correct and "toLowerCase()" in correct
    evaluate = _function_body("evaluateQuestions")
    assert "for (let q = 1; q <= 40; q++)" in evaluate
    assert "isUserAnswerCorrect(q)" in evaluate
    assert "return correctCount;" in evaluate
    band = _function_body("computeBandScore")
    for boundary in [39, 37, 35, 33, 30, 27, 23, 19, 15, 13, 10, 8, 6, 4, 1]:
        assert str(boundary) in band


def test_submit_confirmation_results_and_answer_locking_contract():
    assert not re.search(r'<button[^>]+onclick="submitTest\(\)"', HTML)
    assert re.search(r'onclick="handlePrimarySubmit\(\)"', HTML)
    primary = _function_body("handlePrimarySubmit")
    assert 'if (mode === "test")' in primary and "isTestRunning" in primary and "!testSubmitted" in primary
    assert "confirmSubmit();" in primary and "return;" in primary and primary.rstrip().endswith("submitTest();")
    confirm = _function_body("confirmSubmit")
    assert "window.confirm" in confirm and "if (!ok) return;" in confirm and "submitTest();" in confirm
    submit = _function_body("submitTest")
    for token in ["evaluateQuestions()", "computeBandScore(correctCount)", 'testSubmitted = true',
                  'isTestRunning = false', 'el.disabled = true', 'resultsOverlay', 'focusViolations']:
        assert token in submit
    for result_id in ["scoreLine", "bandLine", "fullScreenExitLine", "focusViolationLine", "totalTimeLine", "resultsOverlay"]:
        assert f'id="{result_id}"' in HTML


def test_study_resubmission_reuses_page_evaluator_and_refreshes_shared_review():
    primary = _function_body("handlePrimarySubmit")
    submit = _function_body("submitTest")
    relabel = _function_body("enableStudyResubmission")
    assert 'if (mode === "test")' in primary
    assert 'if (isTestRunning && !testSubmitted) confirmSubmit();' in primary
    assert primary.index("return;") < primary.index("submitTest();")
    assert primary.rstrip().endswith("submitTest();")
    assert submit.count("evaluateQuestions()") == 1
    assert submit.index("evaluateQuestions()") < submit.index('resultsOverlay.style.display = "flex"')
    assert 'if (mode === "study")' in submit
    assert "enableStudyResubmission();" in submit
    assert "window.ReadingFeatureShell.sync();" in submit
    assert 'document.querySelectorAll(\'[onclick="handlePrimarySubmit()"]\')' in relabel
    assert 'button.textContent = "✔ Submit answers again";' in relabel
    assert 'button.title = "Recalculate score from current answers";' in relabel
    assert "studyHasSubmitted = true;" in relabel
    assert len(re.findall(r'<button\b[^>]*onclick="handlePrimarySubmit\(\)"', HTML)) == 2
    assert not re.search(r'<button[^>]+onclick="submitTest\(\)"', HTML)
    test_lock = submit.split('if (mode === "test")', 1)[1]
    assert 'testSubmitted = true' in test_lock
    assert 'el.disabled = true' in test_lock
    assert 'button.disabled = true' in test_lock


def test_post_submission_study_edits_are_provisional_until_resubmission():
    answer_change = _function_body("onAnswerChange")
    assert 'mode === "study" && studyHasSubmitted && changedQuestion !== null' in answer_change
    assert 'const answer = getUserAnswer(changedQuestion);' in answer_change
    assert 'isUserAnswerCorrect(changedQuestion) ? "correct" : "incorrect"' in answer_change
    assert 'answer ?' in answer_change and ': ""' in answer_change
    for aggregate_update in ["evaluateQuestions()", "submitTest()", "scoreLine", "bandLine", "ReadingFeatureShell.sync()"]:
        assert aggregate_update not in answer_change


def test_timer_fullscreen_and_focus_loss_contracts_are_preserved():
    start = _function_body("startTimer")
    pause = _function_body("pauseTimer")
    resume = _function_body("resumeTimer")
    assert "clearInterval(timerId)" in start
    assert "setInterval" in start
    assert "clearInterval(timerId)" in pause
    assert "if (!isTestRunning" in resume and "startTimer()" in resume
    fullscreen = _function_body("handleFullscreenChange")
    for token in ["fullScreenExits += 1", "pauseTimer()", "showFullscreenLockOverlay()", "resumeTimer()", "hideFullscreenLockOverlay()"]:
        assert token in fullscreen
    begin = _function_body("beginTimedTest")
    assert "await requestAppFullscreen()" in begin and 'startTest("test")' in begin
    assert 'document.addEventListener("visibilitychange"' in HTML
    assert 'window.addEventListener("blur"' in HTML
    assert HTML.count("focusViolations += 1") == 2


def test_section_navigation_and_question_targets_cover_every_format():
    switch = _function_body("switchSection")
    assert "sectionRanges[section]" in switch
    assert "activeSection = section" in switch
    target = _function_body("getQuestionTarget")
    for token in [".inline-answer[data-q=", ".question-block[data-q=", "data-pair-targets"]:
        assert token in target
    assert "partRanges: sectionRanges" in HTML


def test_shared_shell_is_an_adapter_and_cannot_introduce_test4_scoring():
    config = HTML.split("window.readingFeatureShellConfig =", 1)[1].split("function initReadingFeatureShell", 1)[0]
    assert "getUserAnswer: (questionNumber) => getUserAnswer(questionNumber)" in config
    assert "isCorrect: (questionNumber) => isUserAnswerCorrect(questionNumber)" in config
    for forbidden in ["function evaluateQuestions", "function submitTest", "function computeBandScore", "const answerKey", "const correctAnswerText"]:
        assert forbidden not in CORE
