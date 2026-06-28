import json
import re
from pathlib import Path

HTML_PATH = Path("academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html")
HTML = HTML_PATH.read_text(encoding="utf-8")

EXPECTED_ANSWER_KEY = {
    1: "FALSE", 2: "NOT GIVEN", 3: "FALSE", 4: "TRUE", 5: "TRUE",
    6: "lightweight", 7: "bronze", 8: "levels", 9: "hull", 10: "triangular",
    11: "music", 12: "grain", 13: "towboats", 14: "D", 15: "C", 16: "F",
    17: "H", 18: "G", 19: "B", 20: ["microorganisms", "micro-organisms"],
    21: "reindeer", 22: "insects", 23: ["B", "C"], 24: ["B", "C"],
    25: ["A", "C"], 26: ["A", "C"], 27: "NOT GIVEN", 28: "TRUE",
    29: "TRUE", 30: "NOT GIVEN", 31: "FALSE", 32: "FALSE", 33: "H", 34: "D",
    35: "G", 36: "C", 37: "A", 38: ["warm", "warm winter"], 39: "summer",
    40: ["mustard", "mustard plant", "mustard plants"],
}

EXPECTED_CORRECT_TEXT = {
    1: "FALSE", 2: "NOT GIVEN", 3: "FALSE", 4: "TRUE", 5: "TRUE",
    6: "lightweight", 7: "bronze", 8: "levels", 9: "hull", 10: "triangular",
    11: "music", 12: "grain", 13: "towboats", 14: "D", 15: "C", 16: "F",
    17: "H", 18: "G", 19: "B", 20: "microorganisms / micro-organisms",
    21: "reindeer", 22: "insects", 23: "B", 24: "C", 25: "A", 26: "C",
    27: "NOT GIVEN", 28: "TRUE", 29: "TRUE", 30: "NOT GIVEN", 31: "FALSE",
    32: "FALSE", 33: "H", 34: "D", 35: "G", 36: "C", 37: "A",
    38: "warm / warm winter", 39: "summer", 40: "mustard / mustard plant(s)",
}


def _extract_object(name):
    assert len(re.findall(rf"const\s+{name}\s*=\s*{{", HTML)) == 1
    start = re.search(rf"const\s+{name}\s*=\s*{{", HTML).end() - 1
    depth = 0
    for i in range(start, len(HTML)):
        if HTML[i] == "{":
            depth += 1
        elif HTML[i] == "}":
            depth -= 1
            if depth == 0:
                body = HTML[start + 1:i]
                break
    else:
        raise AssertionError(f"Could not parse {name}")
    quoted = re.sub(r"(?m)^\s*(\d+)\s*:", r'"\1":', body)
    quoted = re.sub(r",\s*$", "", quoted.strip())
    data = json.loads("{" + quoted + "}")
    return {int(k): v for k, v in data.items()}


def _function_body(name):
    match = re.search(rf"function\s+{name}\s*\([^)]*\)\s*{{", HTML)
    assert match, f"Missing function {name}"
    start = match.end() - 1
    depth = 0
    for i in range(start, len(HTML)):
        if HTML[i] == "{":
            depth += 1
        elif HTML[i] == "}":
            depth -= 1
            if depth == 0:
                return HTML[start + 1:i]
    raise AssertionError(f"Could not parse function {name}")


def _block_for_data_q(q):
    pattern = rf'<div class="question-block[^"]*" data-q="{q}"[^>]*>(.*?)\n\s*</div>'
    match = re.search(pattern, HTML, re.S)
    assert match, f"Missing question block for Q{q}"
    return match.group(0)


def test_complete_answer_contract_q1_to_q40():
    assert _extract_object("answerKey") == EXPECTED_ANSWER_KEY
    assert _extract_object("correctAnswerText") == EXPECTED_CORRECT_TEXT
    assert sorted(_extract_object("answerKey")) == list(range(1, 41))
    assert sorted(_extract_object("correctAnswerText")) == list(range(1, 41))


def test_question_format_contract_and_feedback_placeholders():
    for q in range(1, 6):
        block = _block_for_data_q(q)
        assert f'name="q{q}"' in block
        for value in ["TRUE", "FALSE", "NOT GIVEN"]:
            assert f'value="{value}"' in block
    for q in list(range(6, 14)) + list(range(20, 23)) + list(range(38, 41)):
        assert re.search(rf'class="inline-input inline-answer" data-q="{q}"', HTML)
        assert f'name="q{q}"' in HTML
    assert "ONE WORD ONLY" in HTML
    assert "NO MORE THAN TWO WORDS" in HTML
    for q in list(range(14, 20)) + list(range(33, 38)):
        block = _block_for_data_q(q)
        assert re.search(rf'<select class="matching-select" name="q{q}"(?: style="[^"]+")?>', block)
        for value in "ABCDEFGH":
            assert f'value="{value}"' in block
    for q in range(27, 33):
        block = _block_for_data_q(q)
        for value in ["TRUE", "FALSE", "NOT GIVEN"]:
            assert f'value="{value}"' in block
    for q in range(1, 41):
        assert len(re.findall(rf'id="ca-{q}"', HTML)) == 1


def test_choose_two_structural_contract():
    assert _extract_object("answerKey")[23] == ["B", "C"]
    assert _extract_object("answerKey")[24] == ["B", "C"]
    assert _extract_object("answerKey")[25] == ["A", "C"]
    assert _extract_object("answerKey")[26] == ["A", "C"]
    assert len(re.findall(r'name="q23_24"', HTML)) == 5
    assert len(re.findall(r'name="q25_26"', HTML)) == 5
    assert 'data-pair-targets="23 24"' in _block_for_data_q(23)
    assert 'data-pair-targets="25 26"' in _block_for_data_q(25)
    limit_body = _function_body("enforceChooseTwoLimit")
    assert 'checked.length > 2' in limit_body
    assert 'box.checked = false' in limit_body
    assert 'enforceChooseTwoLimit("q23_24")' in HTML
    assert 'enforceChooseTwoLimit("q25_26")' in HTML


def _choose_two_count(selected, correct):
    # Mirrors the production getChooseTwoCorrectCount helper: uppercase selected checkbox values,
    # uppercase correct letters, then count selected letters that are in the correct set.
    selected_set = {str(x).strip().upper() for x in selected if str(x).strip()}
    correct_set = {str(x).strip().upper() for x in correct}
    return sum(1 for letter in selected_set if letter in correct_set)


def test_real_choose_two_helper_contract_is_present_and_partial_credit_matches_it():
    helper = _function_body("getChooseTwoCorrectCount")
    assert "querySelectorAll" in helper
    assert "input[type='checkbox'][name='" in helper
    assert ".toUpperCase()" in helper
    assert "correct.has(letter)" in helper
    assert _choose_two_count(["B", "C"], ["B", "C"]) == 2
    assert _choose_two_count(["B", "D"], ["B", "C"]) == 1
    assert _choose_two_count(["B"], ["B", "C"]) == 1
    assert _choose_two_count(["D", "E"], ["B", "C"]) == 0
    assert _choose_two_count(["A", "C"], ["A", "C"]) == 2
    assert _choose_two_count(["A", "B"], ["A", "C"]) == 1
    assert _choose_two_count(["C"], ["A", "C"]) == 1
    assert _choose_two_count(["B", "D"], ["A", "C"]) == 0


def test_test_mode_engine_contract():
    begin = _function_body("beginTimedTest")
    assert 'document.getElementById("studentNameInput")' in begin
    assert 'alert("Please enter your name before starting test mode.")' in begin
    assert "await requestAppFullscreen()" in begin
    assert 'startTest("test")' in begin
    assert "startTimer()" in begin
    fs = _function_body("handleFullscreenChange")
    assert "pauseTimer()" in fs
    assert "showFullscreenLockOverlay()" in fs
    assert "resumeTimer()" in fs
    assert "hideFullscreenLockOverlay()" in fs
    assert re.search(r'onclick="handlePrimarySubmit\(\)"', HTML)
    assert not re.search(r'<button[^>]+onclick="submitTest\(\)"', HTML)
    primary = _function_body("handlePrimarySubmit")
    assert "mode === \"test\"" in primary and "!testSubmitted" in primary
    assert "confirmSubmit();" in primary
    confirm = _function_body("confirmSubmit")
    assert "window.confirm" in confirm
    assert "submitTest();" in confirm
    assert "if (!ok) return;" in confirm
    for result_id in ["scoreLine", "bandLine", "fullScreenExitLine", "focusViolationLine", "totalTimeLine"]:
        assert f'id="{result_id}"' in HTML
    for text in ["You answered ", "Estimated IELTS Academic Reading band:", "Full screen exits:", "Tab switches / focus losses:", "Total time when submitted:"]:
        assert text in HTML


def test_navigation_contract():
    for q in [1, 14, 23, 25, 27, 33]:
        assert re.search(rf'class="question-block[^"]*" data-q="{q}"', HTML)
    for q in list(range(6, 14)) + list(range(20, 23)) + list(range(38, 41)):
        assert re.search(rf'class="inline-input inline-answer" data-q="{q}"', HTML)
    assert 'data-pair-targets="23 24"' in HTML
    assert 'data-pair-targets="25 26"' in HTML
    assert _function_body("buildQuestionNav")
    target = _function_body("getQuestionTarget")
    assert ".question-block[data-q=\"" in target
    assert ".inline-answer[data-q=\"" in target
    assert "data-pair-targets" in target
