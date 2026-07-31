import html
import json
import re
import shutil
import subprocess
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-17" / "test-1"
HTML_PATH = TEST_DIR / "IELTS17 Test 1 - Academic Reading.html"
ANSWERS_PATH = TEST_DIR / "Answers.txt"
QUESTIONS_PATH = TEST_DIR / "Questions.txt"
PASSAGE_PATHS = {part: TEST_DIR / f"Passage {part}.txt" for part in range(1, 4)}

EXPECTED_ANSWER_KEY = {
    1: "population", 2: "suburbs", 3: "businessmen", 4: "funding", 5: "press",
    6: "soil", 7: "FALSE", 8: "NOT GIVEN", 9: "TRUE", 10: "TRUE",
    11: "FALSE", 12: "FALSE", 13: "NOT GIVEN", 14: "A", 15: "F", 16: "E",
    17: "D", 18: "fortress", 19: "bullfights", 20: "opera", 21: "salt",
    22: "shops", 23: ["C", "D"], 24: ["C", "D"], 25: ["B", "E"],
    26: ["B", "E"], 27: "H", 28: "J", 29: "F", 30: "B", 31: "D",
    32: "NOT GIVEN", 33: "NO", 34: "NO", 35: "YES", 36: "B", 37: "C",
    38: "A", 39: "B", 40: "D",
}

EXPECTED_DISPLAY_ANSWERS = {
    **{question: answer for question, answer in EXPECTED_ANSWER_KEY.items()
       if question not in (23, 24, 25, 26)},
    23: "C / D",
    24: "C / D",
    25: "B / E",
    26: "B / E",
}

EXPECTED_SECTION_RANGES = {
    1: {"from": 1, "to": 13},
    2: {"from": 14, "to": 26},
    3: {"from": 27, "to": 40},
}

EXPECTED_TASK_GROUPS = [
    (1, 6, "Note completion"),
    (7, 13, "TRUE/FALSE/NOT GIVEN"),
    (14, 17, "Matching information"),
    (18, 22, "Summary completion"),
    (23, 24, "Choose TWO"),
    (25, 26, "Choose TWO"),
    (27, 31, "Summary completion with phrase list"),
    (32, 35, "YES/NO/NOT GIVEN"),
    (36, 40, "Multiple choice"),
]


def _balanced_body(source, declaration_pattern, label):
    matches = list(re.finditer(declaration_pattern, source))
    if len(matches) != 1:
        raise AssertionError(
            f"Expected exactly one {label} declaration, found {len(matches)}"
        )
    start = matches[0].end() - 1
    depth = 0
    quote = None
    escaped = False
    for index in range(start, len(source)):
        character = source[index]
        if quote:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == quote:
                quote = None
            continue
        if character in ("'", '"', "`"):
            quote = character
        elif character == "{":
            depth += 1
        elif character == "}":
            depth -= 1
            if depth == 0:
                return source[start + 1:index]
    raise AssertionError(f"Could not parse balanced body for {label}")


def _extract_object(source, name):
    body = _balanced_body(
        source,
        rf"const\s+{re.escape(name)}\s*=\s*{{",
        name,
    )
    quoted = re.sub(r"(?m)^\s*(\d+)\s*:", r'"\1":', body)
    data = json.loads("{" + re.sub(r",\s*$", "", quoted.strip()) + "}")
    return {int(key): value for key, value in data.items()}


def _function_body(source, name):
    return _balanced_body(
        source,
        rf"function\s+{re.escape(name)}\s*\([^)]*\)\s*{{",
        f"function {name}",
    )


def _function_source(source, name):
    match = re.search(
        rf"function\s+{re.escape(name)}\s*\([^)]*\)\s*{{",
        source,
    )
    if not match:
        raise AssertionError(f"Missing function {name}")
    body = _balanced_body(
        source,
        rf"function\s+{re.escape(name)}\s*\([^)]*\)\s*{{",
        f"function {name}",
    )
    return source[match.start():match.end()] + body + "}"


def _replace_function_body(source, name, replacement):
    match = re.search(
        rf"function\s+{re.escape(name)}\s*\([^)]*\)\s*{{",
        source,
    )
    if not match:
        raise AssertionError(f"Missing function {name}")
    body_start = match.end()
    original_body = _balanced_body(
        source,
        rf"function\s+{re.escape(name)}\s*\([^)]*\)\s*{{",
        f"function {name}",
    )
    body_end = body_start + len(original_body)
    return source[:body_start] + replacement + source[body_end:]


def _run_node(script, payload):
    bundled_node = (
        Path.home()
        / ".cache"
        / "codex-runtimes"
        / "codex-primary-runtime"
        / "dependencies"
        / "node"
        / "bin"
        / ("node.exe" if Path.home().drive else "node")
    )
    node = shutil.which("node") or (
        str(bundled_node) if bundled_node.is_file() else None
    )
    if not node:
        raise AssertionError(
            "Node.js is required to execute the extracted production JavaScript"
        )
    completed = subprocess.run(
        [node, "-e", script],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=ROOT,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "Extracted production JavaScript failed with exit code "
            f"{completed.returncode}.\nSTDOUT:\n{completed.stdout}\n"
            f"STDERR:\n{completed.stderr}"
        )
    try:
        return json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        raise AssertionError(
            "Extracted production JavaScript did not return valid JSON.\n"
            f"STDOUT:\n{completed.stdout}\nSTDERR:\n{completed.stderr}"
        ) from error


def _extract_section_ranges(source):
    body = _balanced_body(
        source,
        r"const\s+sectionRanges\s*=\s*{",
        "sectionRanges",
    )
    ranges = {}
    for part, start, end in re.findall(
        r"(\d+)\s*:\s*{\s*from\s*:\s*(\d+)\s*,\s*to\s*:\s*(\d+)\s*}",
        body,
    ):
        ranges[int(part)] = {"from": int(start), "to": int(end)}
    return ranges


def _normalise_text(value):
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def _strip_markup(value):
    return _normalise_text(re.sub(r"<[^>]+>", " ", value))


def _named_controls(source, name):
    return re.findall(
        rf'<(?:input|select)\b[^>]*\bname="{re.escape(name)}"[^>]*>',
        source,
    )


def _select_markup(source, name):
    match = re.search(
        rf'<select\b[^>]*\bname="{re.escape(name)}"[^>]*>.*?</select>',
        source,
        re.S,
    )
    if not match:
        raise AssertionError(f"Missing select control named {name}")
    return match.group(0)


def _control_values(markup):
    return re.findall(r'\bvalue="([^"]*)"', markup)


class _AnswerControlParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.controls = []
        self.data_questions = []
        self._active_select = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        data_question = attributes.get("data-q")
        if data_question is not None:
            self.data_questions.append(data_question)
        if tag == "input" and attributes.get("name"):
            self.controls.append({
                "tag": "input",
                "name": attributes["name"],
                "type": attributes.get("type", "text").lower(),
                "values": [attributes.get("value", "")],
            })
        elif tag == "select" and attributes.get("name"):
            control = {
                "tag": "select",
                "name": attributes["name"],
                "type": "select",
                "values": [],
            }
            self.controls.append(control)
            self._active_select = control
        elif tag == "option" and self._active_select is not None:
            self._active_select["values"].append(attributes.get("value", ""))

    def handle_endtag(self, tag):
        if tag == "select":
            self._active_select = None


def _answer_control_inventory(source):
    parser = _AnswerControlParser()
    parser.feed(source)
    return parser.controls, parser.data_questions


def _expected_answer_names():
    names = {f"q{question}" for question in range(1, 23)}
    names.update({"q23_24", "q25_26"})
    names.update({f"q{question}" for question in range(27, 41)})
    return names


def _validate_control_inventory(source):
    controls, data_questions = _answer_control_inventory(source)
    by_name = {}
    for control in controls:
        by_name.setdefault(control["name"], []).append(control)

    expected_names = _expected_answer_names()
    actual_names = set(by_name)
    if actual_names != expected_names:
        raise AssertionError(
            "Answer-control names differ from the exact production contract. "
            f"Missing: {sorted(expected_names - actual_names)}; "
            f"unexpected: {sorted(actual_names - expected_names)}"
        )

    def require_inputs(question, control_type, values):
        name = f"q{question}"
        actual = by_name[name]
        if len(actual) != len(values):
            raise AssertionError(
                f"{name} must have exactly {len(values)} {control_type} control(s); "
                f"found {len(actual)}"
            )
        if any(item["tag"] != "input" or item["type"] != control_type for item in actual):
            raise AssertionError(f"{name} has an unexpected control type")
        actual_values = [item["values"][0] for item in actual]
        if actual_values != values:
            raise AssertionError(
                f"{name} values changed: expected {values}, found {actual_values}"
            )
        if len(actual_values) != len(set(actual_values)) and len(actual_values) > 1:
            raise AssertionError(f"{name} contains a duplicate answer option")

    for question in list(range(1, 7)) + list(range(18, 23)):
        require_inputs(question, "text", [""])
    for question in range(7, 14):
        require_inputs(question, "radio", ["TRUE", "FALSE", "NOT GIVEN"])
    for question in range(32, 36):
        require_inputs(question, "radio", ["YES", "NO", "NOT GIVEN"])
    for question in range(36, 41):
        require_inputs(question, "radio", list("ABCD"))

    for question, letters in [
        *[(question, "ABCDEFG") for question in range(14, 18)],
        *[(question, "ABCDEFGHIJ") for question in range(27, 32)],
    ]:
        name = f"q{question}"
        actual = by_name[name]
        if len(actual) != 1 or actual[0]["tag"] != "select":
            raise AssertionError(
                f"{name} must have exactly one select; found {len(actual)} control(s)"
            )
        expected_values = ["", *list(letters)]
        if actual[0]["values"] != expected_values:
            raise AssertionError(
                f"{name} options changed: expected {expected_values}, "
                f"found {actual[0]['values']}"
            )
        if len(actual[0]["values"]) != len(set(actual[0]["values"])):
            raise AssertionError(f"{name} contains a duplicate select option")

    for name in ("q23_24", "q25_26"):
        actual = by_name[name]
        if len(actual) != 5:
            raise AssertionError(f"{name} must have exactly five checkboxes")
        if any(item["tag"] != "input" or item["type"] != "checkbox" for item in actual):
            raise AssertionError(f"{name} must contain only checkbox controls")
        values = [item["values"][0] for item in actual]
        if values != list("ABCDE") or len(values) != len(set(values)):
            raise AssertionError(
                f"{name} must contain unique checkbox values A-E; found {values}"
            )

    numeric_data_questions = []
    for value in data_questions:
        if not re.fullmatch(r"\d+", value):
            raise AssertionError(f"Unexpected non-numeric data-q value: {value!r}")
        numeric_data_questions.append(int(value))
    if any(question < 1 or question > 40 for question in numeric_data_questions):
        raise AssertionError("A data-q value falls outside Questions 1-40")
    return by_name


def _instruction_for_range(source, start, end):
    range_pattern = rf"{start}(?:-|–|&ndash;){end}"
    instruction_texts = []
    for match in re.finditer(
        r'<div class="instruction-block"[^>]*>(.*?)</div>',
        source,
        re.S,
    ):
        text = _strip_markup(match.group(1))
        instruction_texts.append(text)
        if re.search(rf"\bQuestions?\s+{range_pattern}\b", text, re.I):
            return text
    for text in instruction_texts:
        containing_range = re.search(
            r"\bQuestions?\s+(\d+)(?:-|–)(\d+)\b",
            text,
            re.I,
        )
        if (
            containing_range
            and int(containing_range.group(1)) <= start
            and int(containing_range.group(2)) >= end
        ):
            return text
    raise AssertionError(f"Missing instruction block for Questions {start}-{end}")


def _parse_answers_file(source):
    singles = {}
    groups = {}
    for line_number, raw_line in enumerate(source.splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        match = re.fullmatch(r"(\d+)(?:\s*&\s*(\d+))?\s+(.+)", line)
        if not match:
            raise AssertionError(
                f"Could not parse Answers.txt line {line_number}: {raw_line!r}"
            )
        first = int(match.group(1))
        second = int(match.group(2)) if match.group(2) else None
        answer = match.group(3).strip()
        if second is None:
            singles[first] = answer
        else:
            groups[(first, second)] = {
                item.strip() for item in answer.split(",") if item.strip()
            }
    return singles, groups


class _PassageExtractor(HTMLParser):
    VOID_ELEMENTS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }

    def __init__(self):
        super().__init__()
        self.active_part = None
        self.active_depth = 0
        self.parts = {part: [] for part in range(1, 4)}
        self.container_counts = {part: 0 for part in range(1, 4)}

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = attributes.get("class", "").split()
        if self.active_part is None and tag == "div" and "passage-section" in classes:
            raw_part = attributes.get("data-section", "")
            if not raw_part.isdigit() or int(raw_part) not in self.parts:
                raise AssertionError(
                    f"Unexpected passage-section data-section value: {raw_part!r}"
                )
            self.active_part = int(raw_part)
            self.container_counts[self.active_part] += 1
            self.active_depth = 1
        elif self.active_part is not None and tag not in self.VOID_ELEMENTS:
            self.active_depth += 1

    def handle_startendtag(self, tag, attrs):
        attributes = dict(attrs)
        classes = attributes.get("class", "").split()
        if tag == "div" and "passage-section" in classes:
            raw_part = attributes.get("data-section", "")
            if raw_part.isdigit() and int(raw_part) in self.parts:
                self.container_counts[int(raw_part)] += 1

    def handle_endtag(self, tag):
        if self.active_part is None:
            return
        self.active_depth -= 1
        if self.active_depth == 0:
            self.active_part = None

    def handle_data(self, data):
        if self.active_part is not None:
            self.parts[self.active_part].append(data)


def _extract_passages(source):
    parser = _PassageExtractor()
    parser.feed(source)
    total_containers = sum(parser.container_counts.values())
    if total_containers != 3 or any(
        parser.container_counts[part] != 1 for part in range(1, 4)
    ):
        raise AssertionError(
            "Expected exactly one passage-section container for each of Parts 1-3; "
            f"found {parser.container_counts}"
        )
    passages = {
        part: _normalise_text(" ".join(chunks))
        for part, chunks in parser.parts.items()
    }
    return passages, parser.container_counts


def _execute_choose_two_cases(source, cases):
    function_source = _function_source(source, "getChooseTwoCorrectCount")
    script = f"""
const fs = require("fs");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
let activeGroups = {{}};
const document = {{
  querySelectorAll(selector) {{
    const match = selector.match(/name='([^']+)'/);
    const groupName = match ? match[1] : "";
    return (activeGroups[groupName] || []).map((value) => ({{ value }}));
  }}
}};
{function_source}
const results = payload.cases.map((item) => {{
  activeGroups = item.groups;
  return getChooseTwoCorrectCount(item.groupName, item.correctLetters);
}});
process.stdout.write(JSON.stringify(results));
"""
    return _run_node(script, {"cases": cases})


def _choose_two_cases():
    return [
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": []}, "expected": 0},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["C"]}, "expected": 1},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["C", "D"]}, "expected": 2},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["C", "A"]}, "expected": 1},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["A", "B"]}, "expected": 0},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["D", "C"]}, "expected": 2},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["C", "C"]}, "expected": 1},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["C", "D", "A", "E"]}, "expected": 2},
        {"groupName": "q23_24", "correctLetters": ["C", "D"],
         "groups": {"q23_24": ["C"], "q25_26": ["D", "E"]}, "expected": 1},
        {"groupName": "q25_26", "correctLetters": ["B", "E"],
         "groups": {"q25_26": []}, "expected": 0},
        {"groupName": "q25_26", "correctLetters": ["B", "E"],
         "groups": {"q25_26": ["B"]}, "expected": 1},
        {"groupName": "q25_26", "correctLetters": ["B", "E"],
         "groups": {"q25_26": ["B", "E"]}, "expected": 2},
        {"groupName": "q25_26", "correctLetters": ["B", "E"],
         "groups": {"q25_26": ["E", "B"]}, "expected": 2},
        {"groupName": "q25_26", "correctLetters": ["B", "E"],
         "groups": {"q25_26": ["B", "C"]}, "expected": 1},
        {"groupName": "q25_26", "correctLetters": ["B", "E"],
         "groups": {"q25_26": ["A", "C"]}, "expected": 0},
    ]


def _validate_choose_two_semantics(source):
    cases = _choose_two_cases()
    actual = _execute_choose_two_cases(source, cases)
    expected = [case["expected"] for case in cases]
    if actual != expected:
        raise AssertionError(
            f"Production choose-two results changed: expected {expected}, found {actual}"
        )
    if any(
        not isinstance(score, int) or isinstance(score, bool) or score < 0 or score > 2
        for score in actual
    ):
        raise AssertionError(f"Choose-two scores must be integers from 0 to 2: {actual}")
    return actual


def _raw_score_scenarios(answer_key):
    independent = [
        question for question, answer in answer_key.items()
        if not isinstance(answer, list)
    ]
    all_correct = {str(question): answer_key[question] for question in independent}
    scenarios = [
        {"name": "all-correct", "answers": all_correct,
         "groupScores": {"q23_24": 2, "q25_26": 2}, "expected": 40},
        {"name": "all-incorrect", "answers": {},
         "groupScores": {"q23_24": 0, "q25_26": 0}, "expected": 0},
        {"name": "one-independent", "answers": {"1": answer_key[1]},
         "groupScores": {"q23_24": 0, "q25_26": 0}, "expected": 1},
        {"name": "one-group-mark", "answers": {},
         "groupScores": {"q23_24": 1, "q25_26": 0}, "expected": 1},
        {"name": "both-groups-full", "answers": {},
         "groupScores": {"q23_24": 2, "q25_26": 2}, "expected": 4},
    ]
    mixed_questions = [1, 7, 14, 18, 27, 32, 36]
    scenarios.append({
        "name": "mixed",
        "answers": {
            str(question): answer_key[question] for question in mixed_questions
        },
        "groupScores": {"q23_24": 1, "q25_26": 2},
        "expected": len(mixed_questions) + 3,
    })
    for question in independent:
        scenarios.append({
            "name": f"single-q{question}",
            "answers": {str(question): answer_key[question]},
            "groupScores": {"q23_24": 0, "q25_26": 0},
            "expected": 1,
        })
    return scenarios


def _execute_raw_score_scenarios(source, scenarios):
    function_source = _function_source(source, "evaluateQuestions")
    answer_key = _extract_object(source, "answerKey")
    correct_text = _extract_object(source, "correctAnswerText")
    script = f"""
const fs = require("fs");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
const answerKey = {json.dumps(answer_key)};
const correctAnswerText = {json.dumps(correct_text)};
let active = null;
function getUserAnswer(questionNumber) {{
  return Object.prototype.hasOwnProperty.call(active.answers, String(questionNumber))
    ? String(active.answers[String(questionNumber)])
    : "";
}}
function getChooseTwoCorrectCount(groupName) {{
  return Number(active.groupScores[groupName] || 0);
}}
function setQuestionFeedback() {{}}
const document = {{
  querySelector() {{ return null; }},
  querySelectorAll() {{ return []; }},
  getElementById() {{
    return {{ classList: {{ remove() {{}}, add() {{}} }}, textContent: "" }};
  }}
}};
{function_source}
const results = payload.scenarios.map((scenario) => {{
  active = scenario;
  return evaluateQuestions();
}});
process.stdout.write(JSON.stringify(results));
"""
    return _run_node(script, {"scenarios": scenarios})


def _validate_raw_score_semantics(source):
    answer_key = _extract_object(source, "answerKey")
    scenarios = _raw_score_scenarios(answer_key)
    actual = _execute_raw_score_scenarios(source, scenarios)
    expected = [scenario["expected"] for scenario in scenarios]
    if actual != expected:
        details = [
            f"{scenario['name']}: expected {wanted}, found {found}"
            for scenario, wanted, found in zip(scenarios, expected, actual)
            if wanted != found
        ]
        raise AssertionError("Production raw-score results changed. " + "; ".join(details))
    if any(
        not isinstance(score, int) or isinstance(score, bool) or score < 0 or score > 40
        for score in actual
    ):
        raise AssertionError(f"Raw scores must be integers from 0 to 40: {actual}")
    return dict(zip((scenario["name"] for scenario in scenarios), actual))


def _expected_band_scores():
    ranges = [
        (39, 40, 9), (37, 38, 8.5), (35, 36, 8), (33, 34, 7.5),
        (30, 32, 7), (27, 29, 6.5), (23, 26, 6), (19, 22, 5.5),
        (15, 18, 5), (13, 14, 4.5), (10, 12, 4), (8, 9, 3.5),
        (6, 7, 3), (4, 5, 2.5), (1, 3, 1), (0, 0, 0),
    ]
    expected = {}
    for start, end, band in ranges:
        for score in range(start, end + 1):
            expected[score] = band
    return expected


def _execute_band_scores(source, scores):
    function_source = _function_source(source, "computeBandScore")
    script = f"""
const fs = require("fs");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
{function_source}
process.stdout.write(JSON.stringify(payload.scores.map(computeBandScore)));
"""
    return _run_node(script, {"scores": scores})


def _validate_band_semantics(source):
    scores = list(range(41))
    actual = _execute_band_scores(source, scores)
    expected_map = _expected_band_scores()
    expected = [expected_map[score] for score in scores]
    if actual != expected:
        differences = [
            f"{score}: expected {wanted}, found {found}"
            for score, wanted, found in zip(scores, expected, actual)
            if wanted != found
        ]
        raise AssertionError("Production band conversion changed. " + "; ".join(differences))
    if any(
        not isinstance(band, (int, float)) or isinstance(band, bool)
        for band in actual
    ):
        raise AssertionError(f"Band outputs must be numeric: {actual}")
    return actual


def _normalisation_cases():
    return [
        (" population ", 1),
        ("Population", 1),
        ("population.", 0),
        ("the population", 0),
        ("populations", 0),
        ("popu-lation", 0),
        ("popu  lation", 0),
    ]


def _execute_normalisation_cases(source, cases):
    get_answer_source = _function_source(source, "getUserAnswer")
    evaluate_source = _function_source(source, "evaluateQuestions")
    answer_key = _extract_object(source, "answerKey")
    correct_text = _extract_object(source, "correctAnswerText")
    script = f"""
const fs = require("fs");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
const answerKey = {json.dumps(answer_key)};
const correctAnswerText = {json.dumps(correct_text)};
let currentValue = "";
const document = {{
  querySelectorAll() {{ return []; }},
  querySelector(selector) {{
    return selector === "input[type='text'][name='q1']"
      ? {{ value: currentValue }}
      : null;
  }},
  getElementById() {{
    return {{ classList: {{ remove() {{}}, add() {{}} }}, textContent: "" }};
  }}
}};
function getChooseTwoCorrectCount() {{ return 0; }}
function setQuestionFeedback() {{}}
{get_answer_source}
{evaluate_source}
const results = payload.values.map((value) => {{
  currentValue = value;
  return evaluateQuestions();
}});
process.stdout.write(JSON.stringify(results));
"""
    return _run_node(script, {"values": [value for value, _ in cases]})


def _validate_normalisation_semantics(source):
    cases = _normalisation_cases()
    actual = _execute_normalisation_cases(source, cases)
    expected = [score for _, score in cases]
    if actual != expected:
        differences = [
            f"{value!r}: expected {wanted}, found {found}"
            for (value, wanted), found in zip(cases, actual)
            if wanted != found
        ]
        raise AssertionError(
            "Production ordinary-answer normalisation changed. " + "; ".join(differences)
        )
    return actual


def _derive_task_groups(source):
    by_name = _validate_control_inventory(source)
    signatures = {}
    for question in range(1, 41):
        if question in (23, 24):
            signatures[question] = "choose-two-q23_24"
            continue
        if question in (25, 26):
            signatures[question] = "choose-two-q25_26"
            continue
        controls = by_name[f"q{question}"]
        first = controls[0]
        if first["type"] == "text":
            signatures[question] = "text"
        elif first["type"] == "select":
            signatures[question] = (
                "matching-a-g"
                if first["values"] == ["", *list("ABCDEFG")]
                else "phrase-a-j"
            )
        elif first["type"] == "radio":
            values = [control["values"][0] for control in controls]
            if values == ["TRUE", "FALSE", "NOT GIVEN"]:
                signatures[question] = "tfng"
            elif values == ["YES", "NO", "NOT GIVEN"]:
                signatures[question] = "ynng"
            elif values == list("ABCD"):
                signatures[question] = "multiple-choice"
            else:
                raise AssertionError(
                    f"Cannot derive task type for Q{question} from values {values}"
                )
        else:
            raise AssertionError(
                f"Cannot derive task type for Q{question} from {first['type']}"
            )

    derived = []
    start = 1
    active = signatures[1]
    for question in range(2, 42):
        next_signature = signatures.get(question)
        if next_signature != active:
            derived.append((start, question - 1, active))
            start = question
            active = next_signature
    return derived


def _listener_body(source, owner, event_name):
    return _balanced_body(
        source,
        rf'{re.escape(owner)}\.addEventListener\("{re.escape(event_name)}",\s*\(\)\s*=>\s*{{',
        f"{owner} {event_name} listener",
    )


def _validate_mode_activation_lifecycle(source):
    wire_source = _function_source(source, "wireModeButtons")
    script = f"""
const starts = [];
let pendingMode = "";
function startTest(selectedMode) {{ starts.push(selectedMode); }}
function updateFullscreenSupportNote() {{}}
function isFullscreenApiSupported() {{ return true; }}

function makeTarget(modeName) {{
  return {{
    dataset: {{ mode: modeName }},
    listeners: {{}},
    getAttribute(name) {{ return name === "data-mode" ? modeName : null; }},
    closest() {{ return this; }},
    addEventListener(name, callback) {{
      if (!this.listeners[name]) this.listeners[name] = [];
      this.listeners[name].push(callback);
    }}
  }};
}}

const testButton = makeTarget("test");
const studyButton = makeTarget("study");
const modeScreen = {{
  dataset: {{}},
  listeners: {{}},
  style: {{}},
  addEventListener(name, callback) {{
    if (!this.listeners[name]) this.listeners[name] = [];
    this.listeners[name].push(callback);
  }}
}};
const testStartScreen = {{ style: {{ display: "none" }} }};
const studentNameInput = {{ focusCount: 0, focus() {{ this.focusCount += 1; }} }};
const document = {{
  querySelectorAll(selector) {{
    return selector === ".mode-btn[data-mode]" ? [testButton, studyButton] : [];
  }},
  getElementById(id) {{
    return {{
      modeScreen,
      testStartScreen,
      studentNameInput
    }}[id] || null;
  }}
}};

{wire_source}
wireModeButtons();
wireModeButtons();

function makeEvent(target, key) {{
  return {{
    target,
    key,
    prevented: false,
    preventDefault() {{ this.prevented = true; }}
  }};
}}

function dispatch(button, type, key) {{
  const event = makeEvent(button, key);
  (button.listeners[type] || []).forEach((callback) => callback(event));
  (modeScreen.listeners[type] || []).forEach((callback) => callback(event));
  return event;
}}

dispatch(studyButton, "click");
const studyClickStarts = starts.slice();
starts.length = 0;
dispatch(studyButton, "keydown", "Enter");
const studyKeyboardStarts = starts.slice();
starts.length = 0;
dispatch(testButton, "click");
const testClickStarts = starts.slice();
const testPendingMode = pendingMode;
starts.length = 0;
const unrelated = makeEvent({{ closest() {{ return null; }} }});
(modeScreen.listeners.click || []).forEach((callback) => callback(unrelated));

process.stdout.write(JSON.stringify({{
  studyClickStarts,
  studyKeyboardStarts,
  testClickStarts,
  testPendingMode,
  unrelatedStarts: starts.slice(),
  modeClickListeners: (modeScreen.listeners.click || []).length,
  modeKeyListeners: (modeScreen.listeners.keydown || []).length,
  studyButtonClickListeners: (studyButton.listeners.click || []).length,
  studyButtonKeyListeners: (studyButton.listeners.keydown || []).length
}}));
"""
    actual = _run_node(script, {})
    expected = {
        "studyClickStarts": ["study"],
        "studyKeyboardStarts": ["study"],
        "testClickStarts": [],
        "testPendingMode": "test",
        "unrelatedStarts": [],
        "modeClickListeners": 1,
        "modeKeyListeners": 1,
        "studyButtonClickListeners": 0,
        "studyButtonKeyListeners": 0,
    }
    if actual != expected:
        raise AssertionError(
            "Production mode activation is not single-path and idempotently wired: "
            f"expected {expected}, found {actual}"
        )
    return actual


def _validate_submission_lifecycle(source):
    primary_source = _function_source(source, "handlePrimarySubmit")
    confirm_source = _function_source(source, "confirmSubmit")
    submit_source = _function_source(source, "submitTest")
    script = f"""
function simulate(selectedMode) {{
  let mode = selectedMode;
  let isTestRunning = selectedMode === "test";
  let testSubmitted = false;
  let isTimerPaused = false;
  let timerId = 17;
  let timerSeconds = 3500;
  let studentName = "Test Student";
  let fullScreenExits = 1;
  let focusViolations = 2;
  let evaluateCalls = 0;
  let confirmCalls = 0;
  let clearCalls = 0;
  const answerControls = [{{ disabled: false }}, {{ disabled: false }}];
  const submitControls = [{{ disabled: false }}, {{ disabled: false }}];
  const elements = {{}};
  const ids = [
    "ca-1", "studentLine", "fullScreenExitLine", "focusViolationLine",
    "totalTimeLine", "scoreLine", "bandLine", "descriptorLine", "resultsOverlay"
  ];
  ids.forEach((id) => {{
    elements[id] = {{ style: {{}}, textContent: "", classList: {{ add() {{}}, remove() {{}} }} }};
  }});
  const document = {{
    getElementById(id) {{ return elements[id] || null; }},
    querySelectorAll(selector) {{
      if (selector === "#questionContent select, #questionContent input") {{
        return answerControls;
      }}
      if (selector === '[onclick="handlePrimarySubmit()"]') return submitControls;
      return [];
    }}
  }};
  const window = {{ confirm() {{ confirmCalls += 1; return true; }} }};
  const correctAnswerText = {{ 1: "population" }};
  function evaluateQuestions() {{ evaluateCalls += 1; return 5 + evaluateCalls; }}
  function updateCounts() {{}}
  function buildQuestionNav() {{}}
  function computeBandScore(score) {{ return score / 2; }}
  function getBandDescriptor() {{ return {{ level: "level", description: "description" }}; }}
  function formatDuration(seconds) {{ return String(seconds); }}
  function hideFullscreenLockOverlay() {{}}
  function clearInterval() {{ clearCalls += 1; }}
  function exitAppFullscreen() {{}}
  function toggleOptions() {{}}

  {primary_source}
  {confirm_source}
  {submit_source}

  handlePrimarySubmit();
  const firstSnapshot = JSON.stringify({{
    score: elements.scoreLine.textContent,
    band: elements.bandLine.textContent,
    time: elements.totalTimeLine.textContent,
    focus: elements.focusViolationLine.textContent,
    fullscreen: elements.fullScreenExitLine.textContent
  }});
  handlePrimarySubmit();
  confirmSubmit();
  submitTest();
  const finalSnapshot = JSON.stringify({{
    score: elements.scoreLine.textContent,
    band: elements.bandLine.textContent,
    time: elements.totalTimeLine.textContent,
    focus: elements.focusViolationLine.textContent,
    fullscreen: elements.fullScreenExitLine.textContent
  }});
  return {{
    evaluateCalls,
    confirmCalls,
    testSubmitted,
    isTestRunning,
    timerId,
    clearCalls,
    answerControlsDisabled: answerControls.every((control) => control.disabled),
    submitControlsDisabled: submitControls.every((control) => control.disabled),
    snapshotsEqual: firstSnapshot === finalSnapshot
  }};
}}

process.stdout.write(JSON.stringify({{
  test: simulate("test"),
  study: simulate("study")
}}));
"""
    actual = _run_node(script, {})
    expected = {
        "test": {
            "evaluateCalls": 1,
            "confirmCalls": 2,
            "testSubmitted": True,
            "isTestRunning": False,
            "timerId": None,
            "clearCalls": 1,
            "answerControlsDisabled": True,
            "submitControlsDisabled": True,
            "snapshotsEqual": True,
        },
        "study": {
            "evaluateCalls": 4,
            "confirmCalls": 1,
            "testSubmitted": False,
            "isTestRunning": False,
            "timerId": 17,
            "clearCalls": 0,
            "answerControlsDisabled": False,
            "submitControlsDisabled": False,
            "snapshotsEqual": False,
        },
    }
    if actual != expected:
        raise AssertionError(
            "Production Test/Study submission lifecycle changed: "
            f"expected {expected}, found {actual}"
        )
    return actual


def _validate_timer_expiry_lifecycle(source):
    start_source = _function_source(source, "startTimer")
    resume_source = _function_source(source, "resumeTimer")
    script = f"""
let mode = "test";
let isTestRunning = true;
let testSubmitted = false;
let isTimerPaused = false;
let timerId = null;
let timerSeconds = 1;
let nextTimerId = 1;
let submitCalls = 0;
let intervalRegistrations = 0;
let clearCalls = 0;
let activeCallback = null;
const display = {{
  textContent: "",
  classList: {{ add() {{}}, remove() {{}} }}
}};
const timerContainer = {{ classList: {{ add() {{}}, remove() {{}} }} }};
const timerPrefix = {{ textContent: "" }};
const document = {{
  getElementById(id) {{
    return {{ timerDisplay: display, timerContainer, timerPrefix }}[id] || null;
  }}
}};
function formatDuration(seconds) {{
  const safe = Math.max(0, seconds);
  return String(Math.floor(safe / 60)).padStart(2, "0") + ":" +
    String(safe % 60).padStart(2, "0");
}}
function setInterval(callback) {{
  intervalRegistrations += 1;
  activeCallback = callback;
  return nextTimerId++;
}}
function clearInterval() {{ clearCalls += 1; }}
function submitTest() {{
  submitCalls += 1;
  testSubmitted = true;
  isTestRunning = false;
  if (timerId) {{
    clearInterval(timerId);
    timerId = null;
  }}
}}

{start_source}
{resume_source}

startTimer();
const expiryCallback = activeCallback;
expiryCallback();
const afterExpiry = {{
  timerSeconds,
  display: display.textContent,
  submitCalls,
  timerId,
  clearCalls,
  intervalRegistrations
}};
expiryCallback();
const afterRepeatedCallback = {{
  timerSeconds,
  display: display.textContent,
  submitCalls,
  timerId,
  intervalRegistrations
}};
const registrationsBeforeSubmittedStart = intervalRegistrations;
startTimer();
const submittedStartRegistrations = intervalRegistrations - registrationsBeforeSubmittedStart;
isTimerPaused = true;
const registrationsBeforeResume = intervalRegistrations;
resumeTimer();
const expiredResumeRegistrations = intervalRegistrations - registrationsBeforeResume;

mode = "study";
isTestRunning = false;
testSubmitted = false;
timerSeconds = 1;
timerId = null;
activeCallback = null;
const registrationsBeforeStudy = intervalRegistrations;
startTimer();
const studyRegistrations = intervalRegistrations - registrationsBeforeStudy;

process.stdout.write(JSON.stringify({{
  afterExpiry,
  afterRepeatedCallback,
  submittedStartRegistrations,
  expiredResumeRegistrations,
  studyRegistrations
}}));
"""
    actual = _run_node(script, {})
    if actual["afterExpiry"]["timerSeconds"] != 0:
        raise AssertionError(f"Timer did not clamp at zero: {actual}")
    if actual["afterExpiry"]["display"] != "00:00":
        raise AssertionError(f"Timer did not stop at 00:00: {actual}")
    if actual["afterExpiry"]["submitCalls"] != 1:
        raise AssertionError(f"Timer expiry did not submit exactly once: {actual}")
    if actual["afterExpiry"]["timerId"] is not None:
        raise AssertionError(f"Timer interval remained active after expiry: {actual}")
    if actual["afterRepeatedCallback"]["timerSeconds"] != 0:
        raise AssertionError(f"Repeated timer callback produced a negative value: {actual}")
    if actual["afterRepeatedCallback"]["submitCalls"] != 1:
        raise AssertionError(f"Repeated timer callback submitted again: {actual}")
    for key in (
        "submittedStartRegistrations",
        "expiredResumeRegistrations",
        "studyRegistrations",
    ):
        if actual[key] != 0:
            raise AssertionError(f"Timer registered an invalid interval ({key}): {actual}")
    return actual


def _validate_focus_loss_lifecycle(source):
    record_source = _function_source(source, "recordFocusLoss")
    end_source = _function_source(source, "endFocusLossEpisode")
    visibility_body = _listener_body(source, "document", "visibilitychange")
    blur_body = _listener_body(source, "window", "blur")
    focus_body = _listener_body(source, "window", "focus")
    script = f"""
let mode = "test";
let isTestRunning = true;
let testSubmitted = false;
let focusViolations = 0;
let focusLossEpisodeActive = false;
let fullScreenExits = 0;
const document = {{ hidden: false }};

{record_source}
{end_source}
function onVisibilityChange() {{ {visibility_body} }}
function onBlur() {{ {blur_body} }}
function onFocus() {{ {focus_body} }}

function reset() {{
  mode = "test";
  isTestRunning = true;
  testSubmitted = false;
  focusViolations = 0;
  focusLossEpisodeActive = false;
  document.hidden = false;
}}
function hidden() {{ document.hidden = true; onVisibilityChange(); }}
function visible() {{ document.hidden = false; onVisibilityChange(); }}

reset(); onBlur(); hidden(); const blurHidden = focusViolations;
reset(); hidden(); onBlur(); const hiddenBlur = focusViolations;
reset(); onBlur(); hidden(); onBlur(); const repeatedAway = focusViolations;
reset(); onBlur(); onFocus(); onBlur(); const focusReset = focusViolations;
reset(); hidden(); visible(); hidden(); const visibleReset = focusViolations;
reset(); hidden(); onFocus(); onBlur(); const hiddenFocusBlur = focusViolations;
reset(); hidden(); onFocus(); hidden(); const hiddenFocusHidden = focusViolations;
reset(); hidden(); onFocus(); visible(); onBlur();
const hiddenFocusVisibleBlur = focusViolations;
reset(); hidden(); onFocus(); onFocus();
const repeatedFocusWhileHidden = {{
  focusViolations,
  focusLossEpisodeActive
}};
reset(); mode = "study"; onBlur(); hidden(); const study = focusViolations;
reset(); focusViolations = 3; testSubmitted = true; onBlur(); hidden();
const submitted = focusViolations;
reset(); fullScreenExits = 4; onBlur(); hidden();
const fullscreenSeparate = fullScreenExits;

process.stdout.write(JSON.stringify({{
  blurHidden,
  hiddenBlur,
  repeatedAway,
  focusReset,
  visibleReset,
  hiddenFocusBlur,
  hiddenFocusHidden,
  hiddenFocusVisibleBlur,
  repeatedFocusWhileHidden,
  study,
  submitted,
  fullscreenSeparate
}}));
"""
    actual = _run_node(script, {})
    expected = {
        "blurHidden": 1,
        "hiddenBlur": 1,
        "repeatedAway": 1,
        "focusReset": 2,
        "visibleReset": 2,
        "hiddenFocusBlur": 1,
        "hiddenFocusHidden": 1,
        "hiddenFocusVisibleBlur": 2,
        "repeatedFocusWhileHidden": {
            "focusViolations": 1,
            "focusLossEpisodeActive": True,
        },
        "study": 0,
        "submitted": 3,
        "fullscreenSeparate": 4,
    }
    if actual != expected:
        raise AssertionError(
            "Production focus-loss episode lifecycle changed: "
            f"expected {expected}, found {actual}"
        )
    return actual


class TestIELTS17Test1EngineProtection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML_PATH.read_text(encoding="utf-8")
        cls.answers_text = ANSWERS_PATH.read_text(encoding="utf-8")
        cls.questions_text = QUESTIONS_PATH.read_text(encoding="utf-8")
        cls.answer_key = _extract_object(cls.html, "answerKey")
        cls.display_answers = _extract_object(cls.html, "correctAnswerText")

    def test_01_file_and_page_identity(self):
        expected_files = [
            HTML_PATH,
            ANSWERS_PATH,
            QUESTIONS_PATH,
            *PASSAGE_PATHS.values(),
        ]
        for path in expected_files:
            self.assertTrue(path.is_file(), f"Required production source is missing: {path}")

        title = re.search(r"<title\b[^>]*>(.*?)</title>", self.html, re.S | re.I)
        heading = re.search(r"<h1\b[^>]*>(.*?)</h1>", self.html, re.S | re.I)
        self.assertIsNotNone(title, "Production page has no browser title")
        self.assertIsNotNone(heading, "Production page has no H1 identity heading")
        self.assertEqual(
            _strip_markup(title.group(1)),
            "IELTS 17 Academic Reading Test 1",
        )
        self.assertEqual(
            _strip_markup(heading.group(1)),
            "IELTS 17 Academic Reading Test 1",
        )
        self.assertEqual(sorted(self.answer_key), list(range(1, 41)))
        self.assertEqual(sorted(self.display_answers), list(range(1, 41)))
        for question in range(1, 41):
            self.assertEqual(
                len(re.findall(rf'\bid="ca-{question}"', self.html)),
                1,
                f"Q{question} must have exactly one feedback target",
            )

        _validate_control_inventory(self.html)

    def test_02_passage_and_navigation_ranges(self):
        self.assertEqual(
            _extract_section_ranges(self.html),
            EXPECTED_SECTION_RANGES,
            "sectionRanges no longer represents the 13/13/14 passage boundaries",
        )
        expected_headers = {
            1: "questions 1–13",
            2: "questions 14–26",
            3: "questions 27–40",
        }
        for part, expected_text in expected_headers.items():
            passage_match = re.search(
                rf'<div class="passage-section" data-section="{part}"[^>]*>',
                self.html,
            )
            question_match = re.search(
                rf'<div data-section="{part}"[^>]*>',
                self.html,
            )
            self.assertIsNotNone(passage_match, f"Missing passage section {part}")
            self.assertIsNotNone(question_match, f"Missing question section {part}")
            self.assertIn(expected_text, self.html.lower())

        nav = _function_body(self.html, "buildQuestionNav")
        self.assertIn("const range = sectionRanges[activeSection];", nav)
        self.assertIn("for (let q = range.from; q <= range.to; q++)", nav)
        switch = _function_body(self.html, "switchSection")
        self.assertIn("const range = sectionRanges[section];", switch)

    def test_03_complete_page_owned_answer_key(self):
        self.assertEqual(
            self.answer_key,
            EXPECTED_ANSWER_KEY,
            "The production answerKey changed",
        )
        self.assertEqual(len(self.answer_key), 40)
        self.assertEqual(set(self.answer_key[23]), {"C", "D"})
        self.assertEqual(set(self.answer_key[24]), {"C", "D"})
        self.assertEqual(set(self.answer_key[25]), {"B", "E"})
        self.assertEqual(set(self.answer_key[26]), {"B", "E"})

    def test_04_answers_txt_alignment_for_all_40_marks(self):
        singles, groups = _parse_answers_file(self.answers_text)
        grouped_questions = {23, 24, 25, 26}
        expected_singles = {
            question: answer
            for question, answer in EXPECTED_ANSWER_KEY.items()
            if question not in grouped_questions
        }
        self.assertEqual(singles, expected_singles)
        self.assertEqual(groups, {(23, 24): {"C", "D"}, (25, 26): {"B", "E"}})
        for question, source_answer in singles.items():
            self.assertEqual(self.answer_key[question], source_answer)
        for (first, second), source_set in groups.items():
            self.assertEqual(set(self.answer_key[first]), source_set)
            self.assertEqual(set(self.answer_key[second]), source_set)

        # Known local-source typo: Questions.txt repeats number 22 around the
        # Lucca items. It is not scoring authority. Production and Answers.txt
        # correctly preserve Q21 = salt and Q22 = shops.
        self.assertEqual(self.answer_key[21], "salt")
        self.assertEqual(self.answer_key[22], "shops")

    def test_05_display_answer_alignment(self):
        self.assertEqual(
            self.display_answers,
            EXPECTED_DISPLAY_ANSWERS,
            "correctAnswerText no longer matches the canonical scoring data",
        )
        for question in range(1, 41):
            key = self.answer_key[question]
            display = self.display_answers[question]
            if isinstance(key, list):
                displayed_set = {
                    item.strip() for item in display.split("/") if item.strip()
                }
                self.assertEqual(
                    displayed_set,
                    set(key),
                    f"Q{question} display pair contradicts its unordered scoring set",
                )
            else:
                self.assertEqual(display, key, f"Q{question} display answer changed")

    def test_06_question_control_topology_covers_40_marks(self):
        by_name = _validate_control_inventory(self.html)
        self.assertEqual(set(by_name), _expected_answer_names())
        self.assertEqual(len(by_name), 38)

        for question in range(1, 41):
            self.assertEqual(
                len(re.findall(rf'\bid="ca-{question}"', self.html)),
                1,
                f"Q{question} is not represented by one feedback target",
            )

    def test_07_one_word_instruction_contracts(self):
        for start, end in ((1, 6), (18, 22)):
            instruction = _instruction_for_range(self.html, start, end)
            self.assertIn(
                "Choose ONE WORD ONLY from the passage for each answer.",
                instruction,
                f"Questions {start}-{end} lost their ONE WORD ONLY instruction",
            )
            self.assertEqual(
                instruction.count("ONE WORD ONLY"),
                1,
                f"Questions {start}-{end} have an ambiguous word-limit instruction",
            )

    def test_08_task_group_map_matches_production_instructions_and_controls(self):
        self.assertEqual(
            _derive_task_groups(self.html),
            [
                (1, 6, "text"),
                (7, 13, "tfng"),
                (14, 17, "matching-a-g"),
                (18, 22, "text"),
                (23, 24, "choose-two-q23_24"),
                (25, 26, "choose-two-q25_26"),
                (27, 31, "phrase-a-j"),
                (32, 35, "ynng"),
                (36, 40, "multiple-choice"),
            ],
            "Task boundaries derived from production controls changed",
        )
        expected_instruction_terms = {
            (1, 6): ("Complete the notes below.",),
            (7, 13): ("TRUE", "FALSE", "NOT GIVEN"),
            (14, 17): ("Which section contains the following information?", "A-G"),
            (18, 22): ("Complete the summary below.",),
            (23, 24): ("Choose TWO letters, A-E.",),
            (25, 26): ("Choose TWO letters, A-E.",),
            (27, 31): ("Complete the summary using the list of phrases, A-J, below.",),
            (32, 35): ("YES", "NO", "NOT GIVEN"),
            (36, 40): ("Choose the correct letter, A, B, C, or D.",),
        }
        for start, end, label in EXPECTED_TASK_GROUPS:
            instruction = _instruction_for_range(self.html, start, end)
            for term in expected_instruction_terms[(start, end)]:
                self.assertIn(
                    term,
                    instruction,
                    f"{label} instruction for Q{start}-{end} lost {term!r}",
                )

    def test_09_choose_two_engine_is_unordered_bounded_and_not_double_scored(self):
        get_answer = _function_body(self.html, "getUserAnswer")
        for question, group_name in (
            (23, "q23_24"), (24, "q23_24"),
            (25, "q25_26"), (26, "q25_26"),
        ):
            self.assertRegex(
                get_answer,
                rf"qNum === {question}[\s\S]*?name='{group_name}'",
                f"Q{question} is no longer read from {group_name}",
            )

        helper = _function_body(self.html, "getChooseTwoCorrectCount")
        for token in (
            "const selected = new Set(",
            ".trim().toUpperCase()",
            "const correct = new Set(",
            "correct.has(letter)",
        ):
            self.assertIn(token, helper)

        limit = _function_body(self.html, "enforceChooseTwoLimit")
        self.assertIn("checked.length > 2", limit)
        self.assertIn("box.checked = false", limit)
        self.assertIn('enforceChooseTwoLimit("q23_24")', self.html)
        self.assertIn('enforceChooseTwoLimit("q25_26")', self.html)

        evaluate = _function_body(self.html, "evaluateQuestions")
        self.assertRegex(
            evaluate,
            r'23:\s*{\s*groupName:\s*"q23_24",\s*questions:\s*\[23,\s*24\],'
            r'\s*correctLetters:\s*\["C",\s*"D"\]\s*}',
        )
        self.assertRegex(
            evaluate,
            r'25:\s*{\s*groupName:\s*"q25_26",\s*questions:\s*\[25,\s*26\],'
            r'\s*correctLetters:\s*\["B",\s*"E"\]\s*}',
        )
        self.assertRegex(
            evaluate,
            r"const\s+groupCorrectCount\s*=\s*getChooseTwoCorrectCount\("
            r"\s*chooseTwoGroup\.groupName,\s*chooseTwoGroup\.correctLetters\s*\)",
        )
        self.assertIn("correctCount += groupCorrectCount;", evaluate)
        self.assertIn("if (groupedQuestions.has(q))", evaluate)
        self.assertRegex(evaluate, r"if\s*\(groupedQuestions\.has\(q\)\)\s*{\s*continue;")
        actual = _validate_choose_two_semantics(self.html)
        self.assertEqual(len(actual), len(_choose_two_cases()))

    def test_10_ordinary_answer_normalisation_is_exact_beyond_case_and_trim(self):
        get_answer = _function_body(self.html, "getUserAnswer")
        self.assertIn("checked.value.trim()", get_answer)
        self.assertIn("input.value.trim()", get_answer)
        self.assertIn("select.value.trim()", get_answer)

        evaluate = _function_body(self.html, "evaluateQuestions")
        self.assertIn("user.toLowerCase() === String(k).toLowerCase()", evaluate)
        self.assertIn("user.toLowerCase() === key.toLowerCase()", evaluate)
        self.assertEqual(
            _validate_normalisation_semantics(self.html),
            [1, 1, 0, 0, 0, 0, 0],
        )

    def test_11_raw_score_is_page_owned_and_totals_40_marks(self):
        evaluate = _function_body(self.html, "evaluateQuestions")
        self.assertIn("let correctCount = 0;", evaluate)
        self.assertIn("for (let q = 1; q <= 40; q++)", evaluate)
        self.assertIn("return correctCount;", evaluate)
        results = _validate_raw_score_semantics(self.html)
        self.assertEqual(results["all-correct"], 40)
        self.assertEqual(results["all-incorrect"], 0)
        self.assertEqual(results["one-independent"], 1)
        self.assertEqual(results["one-group-mark"], 1)
        self.assertEqual(results["both-groups-full"], 4)
        self.assertEqual(results["mixed"], 10)

        submit = _function_body(self.html, "submitTest")
        self.assertRegex(
            submit,
            r"const\s+correctCount\s*=\s*evaluateQuestions\(\)\s*;",
        )
        self.assertRegex(
            submit,
            r"const\s+band\s*=\s*computeBandScore\(correctCount\)\s*;",
        )

    def test_12_academic_band_conversion_every_score_and_boundary(self):
        actual = _validate_band_semantics(self.html)
        self.assertEqual(len(actual), 41)
        for score, expected in {
            0: 0, 1: 1, 3: 1, 4: 2.5, 38: 8.5, 39: 9, 40: 9,
        }.items():
            with self.subTest(raw_score=score):
                self.assertEqual(actual[score], expected)

    def test_13_page_owned_engine_functions_remain_present(self):
        required_functions = [
            "getUserAnswer",
            "getChooseTwoCorrectCount",
            "evaluateQuestions",
            "computeBandScore",
            "submitTest",
            "handlePrimarySubmit",
            "confirmSubmit",
            "switchSection",
            "buildQuestionNav",
        ]
        for function_name in required_functions:
            with self.subTest(function=function_name):
                self.assertTrue(_function_body(self.html, function_name).strip())

    def test_14_test_mode_timer_fullscreen_focus_and_locking_structure(self):
        self.assertIn('let mode = "test";', self.html)
        self.assertIn("let testSubmitted = false;", self.html)

        begin = _function_body(self.html, "beginTimedTest")
        self.assertIn("await requestAppFullscreen()", begin)
        self.assertIn('startTest("test")', begin)
        self.assertIn("startTimer()", begin)

        primary = _function_body(self.html, "handlePrimarySubmit")
        self.assertIn('mode === "test"', primary)
        self.assertIn("isTestRunning", primary)
        self.assertIn("!testSubmitted", primary)
        self.assertIn("confirmSubmit();", primary)
        self.assertRegex(
            primary,
            r'if\s*\(\s*mode\s*===\s*"test"\s*\)\s*{\s*'
            r"if\s*\(\s*isTestRunning\s*&&\s*!testSubmitted\s*\)\s*"
            r"confirmSubmit\(\);\s*return;\s*}",
        )
        self.assertTrue(
            primary.rstrip().endswith("submitTest();"),
            "Study/non-running submission must still reach the page-owned submitTest",
        )

        confirm = _function_body(self.html, "confirmSubmit")
        self.assertIn("window.confirm", confirm)
        self.assertIn("if (!ok) return;", confirm)
        self.assertIn("submitTest();", confirm)

        submit = _function_body(self.html, "submitTest")
        self.assertIn('if (mode === "test" && testSubmitted) return;', submit)
        self.assertIn('if (mode === "test")', submit)
        test_lock_branch = submit.split('if (mode === "test")', 1)[1]
        self.assertIn("testSubmitted = true;", test_lock_branch)
        self.assertRegex(
            test_lock_branch,
            r'document\s*\.\s*querySelectorAll\('
            r'"#questionContent select, #questionContent input"\)',
        )
        self.assertIn("el.disabled = true", test_lock_branch)
        self.assertIn('[onclick="handlePrimarySubmit()"]', test_lock_branch)
        self.assertIn("button.disabled = true", test_lock_branch)

        start_test = _function_body(self.html, "startTest")
        self.assertIn('if (mode === "test")', start_test)
        self.assertIn("} else {", start_test)
        self.assertIn("isTestRunning = false;", start_test)

        for timer_function in ("startTimer", "pauseTimer", "resumeTimer"):
            self.assertTrue(_function_body(self.html, timer_function).strip())
        self.assertIn("setInterval", _function_body(self.html, "startTimer"))
        self.assertIn("clearInterval(timerId)", _function_body(self.html, "pauseTimer"))
        self.assertIn("startTimer()", _function_body(self.html, "resumeTimer"))

        fullscreen = _function_body(self.html, "handleFullscreenChange")
        for token in (
            "fullScreenExits += 1",
            "pauseTimer()",
            "showFullscreenLockOverlay()",
            "hideFullscreenLockOverlay()",
            "resumeTimer()",
        ):
            self.assertIn(token, fullscreen)
        visibility_listener = _listener_body(
            self.html, "document", "visibilitychange"
        )
        blur_listener = _listener_body(self.html, "window", "blur")
        self.assertIn("document.hidden", visibility_listener)
        self.assertIn("recordFocusLoss()", visibility_listener)
        self.assertIn("endFocusLossEpisode()", visibility_listener)
        self.assertIn("recordFocusLoss()", blur_listener)
        focus_listener = _listener_body(self.html, "window", "focus")
        self.assertIn("endFocusLossEpisode()", focus_listener)
        focus_recorder = _function_body(self.html, "recordFocusLoss")
        for token in (
            'mode !== "test"',
            "!isTestRunning",
            "testSubmitted",
            "focusLossEpisodeActive",
            "focusViolations += 1",
        ):
            self.assertIn(token, focus_recorder)

        # Deliberately not asserted as acceptable in Batch 1A:
        # duplicate Study initialisation, post-final Test resubmission,
        # negative timer continuation, or focus-event double counting.

    def test_15_complete_local_passages_match_production_html(self):
        production_passages, container_counts = _extract_passages(self.html)
        self.assertEqual(container_counts, {1: 1, 2: 1, 3: 1})
        for part, path in PASSAGE_PATHS.items():
            source = path.read_text(encoding="utf-8")
            self.assertTrue(source.strip(), f"Passage {part}.txt is empty")
            self.assertEqual(
                production_passages[part],
                _normalise_text(source),
                f"Production Passage {part} no longer matches {path.name}",
            )

    def test_16_mandatory_mutation_probes_reject_regressions(self):
        choose_two_zero = _replace_function_body(
            self.html,
            "getChooseTwoCorrectCount",
            "\n      return 0;\n    ",
        )
        with self.subTest(mutation="choose-two helper returns zero"):
            with self.assertRaises(AssertionError):
                _validate_choose_two_semantics(choose_two_zero)

        evaluator_100 = _replace_function_body(
            self.html,
            "evaluateQuestions",
            "\n      return 100;\n    ",
        )
        with self.subTest(mutation="evaluator returns 100"):
            with self.assertRaises(AssertionError):
                _validate_raw_score_semantics(evaluator_100)

        q14_select = _select_markup(self.html, "q14")
        duplicate_q14 = self.html.replace(q14_select, q14_select + q14_select, 1)
        self.assertNotEqual(duplicate_q14, self.html)
        with self.subTest(mutation="duplicate Q14 select"):
            with self.assertRaises(AssertionError):
                _validate_control_inventory(duplicate_q14)

        original_input_return = "if (input) return input.value.trim();"
        punctuation_input_return = (
            'if (input) return input.value.trim().replace(/[.,]/g, "");'
        )
        punctuation_normalisation = self.html.replace(
            original_input_return,
            punctuation_input_return,
            1,
        )
        self.assertNotEqual(punctuation_normalisation, self.html)
        with self.subTest(mutation="punctuation stripping"):
            with self.assertRaises(AssertionError):
                _validate_normalisation_semantics(punctuation_normalisation)

        band_body = _function_body(self.html, "computeBandScore")
        band_40_zero = _replace_function_body(
            self.html,
            "computeBandScore",
            "\n      if (correct === 40) return 0;" + band_body,
        )
        with self.subTest(mutation="score 40 returns Band 0"):
            with self.assertRaises(AssertionError):
                _validate_band_semantics(band_40_zero)

        q41_control = self.html.replace(
            "</body>",
            '<input type="text" name="q41" /></body>',
            1,
        )
        self.assertNotEqual(q41_control, self.html)
        with self.subTest(mutation="unexpected q41 control"):
            with self.assertRaises(AssertionError):
                _validate_control_inventory(q41_control)

        q36_a = re.search(
            r'<input\b[^>]*\bname="q36"[^>]*\bvalue="A"[^>]*>',
            self.html,
        )
        self.assertIsNotNone(q36_a)
        duplicate_q36 = self.html.replace(
            q36_a.group(0),
            q36_a.group(0) + q36_a.group(0),
            1,
        )
        with self.subTest(mutation="duplicate Q36 radio"):
            with self.assertRaises(AssertionError):
                _validate_control_inventory(duplicate_q36)

        duplicate_passage_2 = self.html.replace(
            "</body>",
            '<div class="passage-section" data-section="2"></div></body>',
            1,
        )
        with self.subTest(mutation="duplicate Passage 2 container"):
            with self.assertRaises(AssertionError):
                _extract_passages(duplicate_passage_2)

    def test_17_mode_activation_is_single_path_and_wired_once(self):
        actual = _validate_mode_activation_lifecycle(self.html)
        self.assertEqual(actual["studyClickStarts"], ["study"])
        self.assertEqual(actual["studyKeyboardStarts"], ["study"])
        self.assertEqual(actual["testClickStarts"], [])
        self.assertEqual(actual["unrelatedStarts"], [])

        wire_body = _function_body(self.html, "wireModeButtons")
        duplicate_handler = _replace_function_body(
            self.html,
            "wireModeButtons",
            """
      const duplicateStudyButton =
        document.querySelectorAll(".mode-btn[data-mode]")[1];
      duplicateStudyButton.addEventListener("click", () => startTest("study"));
""" + wire_body,
        )
        with self.subTest(mutation="second reachable Study start handler"):
            with self.assertRaises(AssertionError):
                _validate_mode_activation_lifecycle(duplicate_handler)

    def test_18_completed_test_cannot_recalculate_but_study_can(self):
        actual = _validate_submission_lifecycle(self.html)
        self.assertEqual(actual["test"]["evaluateCalls"], 1)
        self.assertTrue(actual["test"]["submitControlsDisabled"])
        self.assertTrue(actual["test"]["snapshotsEqual"])
        self.assertEqual(actual["study"]["evaluateCalls"], 4)
        self.assertFalse(actual["study"]["submitControlsDisabled"])

        guard = 'if (mode === "test" && testSubmitted) return;'
        self.assertIn(guard, self.html)
        no_guard = self.html.replace(guard, "", 1)
        with self.subTest(mutation="completed-Test submit guard removed"):
            with self.assertRaises(AssertionError):
                _validate_submission_lifecycle(no_guard)

        disable = "button.disabled = true"
        self.assertIn(disable, self.html)
        submit_reenabled = self.html.replace(disable, "button.disabled = false", 1)
        with self.subTest(mutation="Test submit control re-enabled"):
            with self.assertRaises(AssertionError):
                _validate_submission_lifecycle(submit_reenabled)

    def test_19_timer_expiry_clamps_submits_once_and_cannot_resume(self):
        actual = _validate_timer_expiry_lifecycle(self.html)
        self.assertEqual(actual["afterExpiry"]["timerSeconds"], 0)
        self.assertEqual(actual["afterExpiry"]["display"], "00:00")
        self.assertEqual(actual["afterExpiry"]["submitCalls"], 1)
        self.assertEqual(actual["afterRepeatedCallback"]["submitCalls"], 1)

        completion_guard = "if (timerSeconds === 0) {"
        self.assertIn(completion_guard, self.html)
        keeps_decrementing = self.html.replace(
            completion_guard,
            "if (false) {",
            1,
        )
        with self.subTest(mutation="timer continues after zero"):
            with self.assertRaises(AssertionError):
                _validate_timer_expiry_lifecycle(keeps_decrementing)

        callback_guard = (
            'if (mode !== "test" || !isTestRunning || testSubmitted) {'
        )
        self.assertIn(callback_guard, self.html)
        double_expiry = self.html.replace(callback_guard, "if (false) {", 1)
        with self.subTest(mutation="timer expiry submits twice"):
            with self.assertRaises(AssertionError):
                _validate_timer_expiry_lifecycle(double_expiry)

    def test_20_focus_loss_is_counted_once_per_away_episode(self):
        actual = _validate_focus_loss_lifecycle(self.html)
        self.assertEqual(
            actual,
            {
                "blurHidden": 1,
                "hiddenBlur": 1,
                "repeatedAway": 1,
                "focusReset": 2,
                "visibleReset": 2,
                "hiddenFocusBlur": 1,
                "hiddenFocusHidden": 1,
                "hiddenFocusVisibleBlur": 2,
                "repeatedFocusWhileHidden": {
                    "focusViolations": 1,
                    "focusLossEpisodeActive": True,
                },
                "study": 0,
                "submitted": 3,
                "fullscreenSeparate": 4,
            },
        )

        independent_events = self.html.replace(
            "recordFocusLoss();",
            "focusViolations += 1;",
            2,
        )
        self.assertNotEqual(independent_events, self.html)
        with self.subTest(mutation="blur and hidden increment independently"):
            with self.assertRaises(AssertionError):
                _validate_focus_loss_lifecycle(independent_events)

        no_reset = _replace_function_body(
            self.html,
            "endFocusLossEpisode",
            "\n      return;\n    ",
        )
        with self.subTest(mutation="focus-return does not reset episode"):
            with self.assertRaises(AssertionError):
                _validate_focus_loss_lifecycle(no_reset)

        submitted_guard = "        testSubmitted ||\n"
        record_body = _function_body(self.html, "recordFocusLoss")
        self.assertIn(submitted_guard, record_body)
        focus_after_submit = _replace_function_body(
            self.html,
            "recordFocusLoss",
            record_body.replace(submitted_guard, "", 1),
        )
        with self.subTest(mutation="focus counting remains active after submission"):
            with self.assertRaises(AssertionError):
                _validate_focus_loss_lifecycle(focus_after_submit)

        visible_focus_guard = "if (!document.hidden) endFocusLossEpisode();"
        self.assertIn(visible_focus_guard, self.html)
        unguarded_focus_return = self.html.replace(
            visible_focus_guard,
            "endFocusLossEpisode();",
            1,
        )
        with self.subTest(mutation="focus while hidden ends the episode"):
            with self.assertRaises(AssertionError):
                _validate_focus_loss_lifecycle(unguarded_focus_return)


if __name__ == "__main__":
    unittest.main()
