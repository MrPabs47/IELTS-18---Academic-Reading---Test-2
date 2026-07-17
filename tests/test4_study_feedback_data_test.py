import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST4 = ROOT / "academic/cambridge-16/test-4"
HTML = (TEST4 / "IELTS16 Test 4 - Academic Reading.html").read_text(encoding="utf-8")
DATA_JS = (TEST4 / "study-feedback.js").read_text(encoding="utf-8")
CORE = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")

EXPECTED_GROUPS = [
    ("p1-diagram", 1, 1, list(range(1, 7))),
    ("p1-tfng", 1, 1, list(range(7, 11))),
    ("p1-short", 1, 1, list(range(11, 14))),
    ("p2-mc", 2, 2, list(range(14, 18))),
    ("p2-summary", 2, 2, list(range(18, 23))),
    ("p2-ynng", 2, 2, list(range(23, 27))),
    ("p3-headings", 3, 3, list(range(27, 33))),
    ("p3-mc", 3, 3, list(range(33, 36))),
    ("p3-ynng", 3, 3, list(range(36, 41))),
]


def _load_data():
    script = (
        "const fs=require('fs'),vm=require('vm');"
        "const context={window:{}};vm.createContext(context);"
        "vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),context);"
        "process.stdout.write(JSON.stringify(context.window.IELTS16AcademicTest4StudyFeedback));"
    )
    completed = subprocess.run(
        ["node", "-e", script, str(TEST4 / "study-feedback.js")],
        cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8",
    )
    return json.loads(completed.stdout)


def _extract_object(name):
    match = re.search(rf"const\s+{name}\s*=\s*{{", HTML)
    assert match
    start = match.end() - 1
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
    return json.loads("{" + re.sub(r",\s*$", "", quoted.strip()) + "}")


def _records():
    data = _load_data()
    correct = _extract_object("correctAnswerText")
    groups_by_question = {
        question: group
        for group in data["taskGroups"]
        for question in group["questions"]
    }
    return data, {
        question: {
            "correctAnswer": correct[str(question)],
            "why": data["questions"][str(question)][0],
            "skill": data["questions"][str(question)][1],
            "evidence": data["questions"][str(question)][2],
            "passage": groups_by_question[question]["passage"],
            "group": groups_by_question[question]["id"],
        }
        for question in range(1, 41)
    }


def test_exactly_nine_groups_cover_q1_q40_once_with_page_boundaries():
    data = _load_data()
    groups = data["taskGroups"]
    assert len(groups) == 9
    actual = [(group["id"], group["part"], group["passage"], group["questions"]) for group in groups]
    assert actual == EXPECTED_GROUPS
    represented = [question for group in groups for question in group["questions"]]
    assert represented == list(range(1, 41))
    assert len(represented) == len(set(represented))


def test_batch2_targeted_feedback_uses_complete_answer_proving_context():
    data, records = _records()
    groups = {group["id"]: group for group in data["taskGroups"]}
    assert groups["p1-short"]["label"] == "Short-answer questions"

    q19 = records[19]
    assert "asked subjects questions" in q19["evidence"]
    assert "half of the students read the story on a tablet, the other half in paperback" in q19["evidence"]
    assert "superior in their comprehension" in q19["evidence"]

    q22 = records[22]
    assert "understand another’s feelings" in q22["evidence"]
    assert "another person’s feelings" in q22["why"]
    assert "These are aspects of emotional content" not in q22["why"]

    assert "lack of confidence in AI" in records[28]["evidence"]
    assert "reluctance to accept what AI has to offer" in records[28]["evidence"]

    q34_evidence = records[34]["evidence"]
    assert "too difficult for most people to comprehend" in q34_evidence
    assert "cause anxiety" in q34_evidence
    assert "losing control" in q34_evidence

    q35_evidence = records[35]["evidence"]
    assert "disproportionate amount of media attention" in q35_evidence
    assert "we cannot rely on technology" in q35_evidence

    q36_evidence = records[36]["evidence"]
    assert "Optimists became more extreme in their enthusiasm for AI" in q36_evidence
    assert "sceptics became even more guarded" in q36_evidence
    assert "strengthened their prior views" in records[36]["why"]

    q40_evidence = records[40]["evidence"]
    assert "felt more satisfied with its decisions" in q40_evidence
    assert "more likely to believe it was superior" in q40_evidence
    assert "more likely to use it in the future" in q40_evidence

    passages = {
        number: (TEST4 / f"Passage {number}.txt").read_text(encoding="utf-8")
        for number in (1, 2, 3)
    }
    for question in [19, 22, 28, 34, 35, 36, 40]:
        assert records[question]["evidence"] in passages[records[question]["passage"]]


def test_every_feedback_record_has_correct_answer_why_skill_evidence_passage_and_group():
    data, records = _records()
    assert sorted(map(int, data["questions"])) == list(range(1, 41))
    assert sorted(records) == list(range(1, 41))
    for record in records.values():
        assert record["correctAnswer"].strip()
        assert record["why"].strip()
        assert record["skill"].strip()
        assert record["evidence"].strip()
        assert record["passage"] in (1, 2, 3)
        assert record["group"].strip()


def test_every_evidence_string_exists_in_its_assigned_local_passage():
    _, records = _records()
    passages = {
        number: (TEST4 / f"Passage {number}.txt").read_text(encoding="utf-8")
        for number in (1, 2, 3)
    }
    for question, record in records.items():
        assert record["evidence"] in passages[record["passage"]], f"Q{question} evidence not found in Passage {record['passage']}"


def test_displayed_correct_answers_are_page_owned_and_variants_remain_compatible():
    answer_key = _extract_object("answerKey")
    correct_text = _extract_object("correctAnswerText")
    assert sorted(map(int, correct_text)) == list(range(1, 41))
    assert "getAnswerKeyDisplay: (questionNumber) => correctAnswerText[questionNumber] || \"\"" in HTML
    assert "html(config.answers.getAnswerKeyDisplay(questionNumber) || \"\")" in CORE
    for question in range(1, 41):
        assert correct_text[str(question)].strip()
    q12_display_terms = {item.strip().replace("â€™", "'") for item in correct_text["12"].split("/")}
    q12_variants = {item.replace("â€™", "'") for item in answer_key["12"]}
    assert q12_display_terms.issubset(q12_variants)
    q13_display_terms = {item.strip() for item in correct_text["13"].split("/")}
    assert q13_display_terms.issubset(set(answer_key["13"]))


def test_blank_answer_copy_and_all_nine_control_hosts_are_protected():
    data = _load_data()
    assert '"Not answered \u00b7 0 points"' in CORE
    selectors = [group["controlHost"] for group in data["taskGroups"]]
    assert len(selectors) == len(set(selectors)) == 9
    for selector in selectors:
        assert selector.startswith("#")
        assert HTML.count(f'id="{selector[1:]}"') == 1


def test_test4_data_is_supplied_to_generic_core_without_test3_leakage():
    config = HTML.split("window.readingFeatureShellConfig =", 1)[1].split("function initReadingFeatureShell", 1)[0]
    assert "taskGroups: test4StudyFeedback && test4StudyFeedback.taskGroups" in config
    assert "questionDetails: test4StudyFeedback && test4StudyFeedback.questions" in config
    assert "IELTS16AcademicTest4StudyFeedback" not in CORE
    assert "cambridge-16-academic-reading-test-4" not in CORE
    assert "p1-diagram" not in CORE
