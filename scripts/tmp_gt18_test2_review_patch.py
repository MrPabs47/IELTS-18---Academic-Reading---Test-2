from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
target = root / "general-training" / "cambridge-18" / "test-2"


def replace_text(path: Path, old: str, new: str, expected: int = 1) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{path}: expected {expected} occurrences of {old!r}, found {count}")
    path.write_text(text.replace(old, new), encoding="utf-8", newline="\n")


def replace_bytes(path: Path, old: str, new: str, expected: int = 1) -> None:
    data = path.read_bytes()
    old_b = old.encode("utf-8")
    new_b = new.encode("utf-8")
    count = data.count(old_b)
    if count != expected:
        raise SystemExit(f"{path}: expected {expected} occurrences of {old!r}, found {count}")
    path.write_bytes(data.replace(old_b, new_b))


html = target / "IELTS18 Test 2 - Reading - GT.html"
for old, new in [
    ("no—frills", "no-frills"),
    ("animal—themed", "animal-themed"),
    ("Life Writing is defined as non fiction", "Life Writing is defined as non-fiction"),
    ("a development meeting With an editor", "a development meeting with an editor"),
    ("The regulation chefs” shirts", "The regulation chefs’ shirts"),
    ("To this end. staff must use a clean board each time they out different types of food.", "To this end, staff must use a clean board each time they cut different types of food."),
    ("staff must not tw to fix them themselves.", "staff must not try to fix them themselves."),
    ("If storing containers of chemicals in the kitchen. they must have clear labels", "If storing containers of chemicals in the kitchen, they must have clear labels"),
    ("<h2>In the 1970s, Clothkits revolutionised home sewing. Later, a woman from Sussex, England, revived the nostalgic brand and brought it up to date</h2>", "<h2>A home-sewing revival: the return of Clothkits</h2>\n              <p><em>In the 1970s, Clothkits revolutionised home sewing. Later, a woman from Sussex, England, revived the nostalgic brand and brought it up to date</em></p>"),
    ("Sew-your—own kits", "Sew-your-own kits"),
    ("experiment With colour", "experiment with colour"),
    ("tracing around an existing pair of trousers. in her late twenties", "tracing around an existing pair of trousers. In her late twenties"),
    ("skills such as sewing and knitting. Making your own clothes gives", "skills such as sewing and knitting. ‘Making your own clothes gives"),
    ("mass- producing manufacturer", "mass-producing manufacturer"),
]:
    replace_text(html, old, new)

passage1 = target / "Passage 1.txt"
for old, new in [
    ("no—frills", "no-frills"),
    ("animal—themed", "animal-themed"),
    ("Life Writing is defined as non fiction", "Life Writing is defined as non-fiction"),
    ("a development meeting With an editor", "a development meeting with an editor"),
]:
    replace_bytes(passage1, old, new)

passage2 = target / "Passage 2.txt"
for old, new in [
    ("The regulation chefs” shirts", "The regulation chefs’ shirts"),
    ("To this end. staff must use a clean board each time they out different types of food.", "To this end, staff must use a clean board each time they cut different types of food."),
    ("staff must not tw to fix them themselves.", "staff must not try to fix them themselves."),
    ("If storing containers of chemicals in the kitchen. they must have clear labels", "If storing containers of chemicals in the kitchen, they must have clear labels"),
]:
    replace_bytes(passage2, old, new)

passage3 = target / "Passage 3.txt"
first_line = "In the 1970s, Clothkits revolutionised home sewing. Later, a woman from Sussex, England, revived the nostalgic brand and brought it up to date"
replace_bytes(passage3, first_line, "A home-sewing revival: the return of Clothkits\r\n\r\n" + first_line)
for old, new in [
    ("Sew-your—own kits", "Sew-your-own kits"),
    ("experiment With colour", "experiment with colour"),
    ("tracing around an existing pair of trousers. in her late twenties", "tracing around an existing pair of trousers. In her late twenties"),
    ("skills such as sewing and knitting. Making your own clothes gives", "skills such as sewing and knitting. ‘Making your own clothes gives"),
    ("mass- producing manufacturer", "mass-producing manufacturer"),
]:
    replace_bytes(passage3, old, new)

questions = target / "Questions.txt"
for old, new in [
    ("SECTION 1 Questions 15—27", "SECTION 2 Questions 15—27"),
    ("32 in Paragraph A", "32 In Paragraph A"),
    (" A lts designs represented the attitudes of the time.", " A Its designs represented the attitudes of the time."),
    ("Complete the summary below,", "Complete the summary below."),
]:
    replace_bytes(questions, old, new)

data = target / "study-feedback-data.js"
for old, new, expected in [
    ('section: 1, textId: "s1-sleeping-bags"', 'section: 1, textId: "s1-section"', 1),
    ('section: 1, textId: "s1-life-writing"', 'section: 1, textId: "s1-section"', 1),
    ('section: 2, textId: "s2-employee-health"', 'section: 2, textId: "s2-section"', 1),
    ('section: 2, textId: "s2-kitchen"', 'section: 2, textId: "s2-section"', 1),
    ("If you want a no—frills, budget sleeping bag", "If you want a no-frills, budget sleeping bag", 1),
    ("fun, animal—themed coat.", "fun, animal-themed coat.", 1),
    ("Life Writing is defined as non fiction", "Life Writing is defined as non-fiction", 1),
    ("a development meeting With an editor", "a development meeting with an editor", 2),
    ("To this end. staff must use a clean board each time they out different types of food.", "To this end, staff must use a clean board each time they cut different types of food.", 1),
    ("staff must not tw to fix them themselves.", "staff must not try to fix them themselves.", 1),
    ("If storing containers of chemicals in the kitchen. they must have clear labels", "If storing containers of chemicals in the kitchen, they must have clear labels", 1),
    ('evidence: "Making your own clothes gives you a greater appreciation', 'evidence: "‘Making your own clothes gives you a greater appreciation', 1),
    ("mass- producing manufacturer.", "mass-producing manufacturer.", 1),
    ("Sew-your—own kits formed the core of the business", "Sew-your-own kits formed the core of the business", 1),
]:
    replace_text(data, old, new, expected)

adapter = target / "study-feedback.js"
adapter_text = adapter.read_text(encoding="utf-8")
root_pattern = re.compile(r"  function prepareTextRoots\(\) \{.*?\n  \}\n\n  function prepareInlineFeedbackHosts", re.S)
root_replacement = '''  function prepareTextRoots() {
    var s1 = document.querySelector('.passage-section[data-section="1"]');
    var s2 = document.querySelector('.passage-section[data-section="2"]');
    var s3 = document.querySelector('.passage-section[data-section="3"]');

    if (s1) setTextIdentity(s1, "text-s1-section");
    if (s2) setTextIdentity(s2, "text-s2-section");
    if (s3) setTextIdentity(s3, "text-s3-clothkits");
  }

  function prepareInlineFeedbackHosts'''
adapter_text, count = root_pattern.subn(root_replacement, adapter_text, count=1)
if count != 1:
    raise SystemExit("Could not replace prepareTextRoots() exactly once")

marker = "  function prepareCandidateHeader() {"
structured = '''  function prepareStructuredGroupAnchors() {
    document.querySelectorAll("#questionContent .note-completion-box,#questionContent .summary-completion-box").forEach(function (box) {
      box.classList.add("summary-box");
    });
  }

'''
if adapter_text.count(marker) != 1:
    raise SystemExit("prepareCandidateHeader marker mismatch")
adapter_text = adapter_text.replace(marker, structured + marker, 1)

old_score_fn = '''  function keepScoreFeedbackWithResources() {
    var mount = document.getElementById("readingFeatureShellMount");
    var root = mount && mount.querySelector(".reading-shell-root");
    var button = document.querySelector(".reading-shell-score-feedback-button");
    if (root && button && button.parentElement !== root) root.appendChild(button);
  }
'''
new_score_fn = '''  function positionScoreFeedbackButton() {
    var mount = document.getElementById("readingFeatureShellMount");
    var root = mount && mount.querySelector(".reading-shell-root");
    var button = document.querySelector(".reading-shell-score-feedback-button");
    var topLeft = document.querySelector(".top-left");
    var candidate = document.getElementById("candidateNameDisplay");
    if (!button || !topLeft) return;
    var narrow = Boolean(window.matchMedia && window.matchMedia("(max-width: 600px)").matches);
    if (narrow) {
      if (root && button.parentElement !== root) root.appendChild(button);
      return;
    }
    if (candidate && candidate.parentElement === topLeft) {
      if (button.parentElement !== topLeft || button.previousElementSibling !== candidate) {
        candidate.insertAdjacentElement("afterend", button);
      }
    } else if (button.parentElement !== topLeft) {
      topLeft.appendChild(button);
    }
  }
'''
if adapter_text.count(old_score_fn) != 1:
    raise SystemExit("keepScoreFeedbackWithResources() block mismatch")
adapter_text = adapter_text.replace(old_score_fn, new_score_fn, 1)
adapter_text = adapter_text.replace("    keepScoreFeedbackWithResources();", "    positionScoreFeedbackButton();", 1)
adapter_text = adapter_text.replace(
    "    prepareInlineFeedbackHosts();\n    ensureSectionThreeClearControls();",
    "    prepareInlineFeedbackHosts();\n    prepareStructuredGroupAnchors();\n    ensureSectionThreeClearControls();",
    1,
)
adapter_text = adapter_text.replace(
    "    localiseReadingFeatureShell();\n  }",
    "    localiseReadingFeatureShell();\n    window.addEventListener(\"resize\", positionScoreFeedbackButton);\n  }",
    1,
)
adapter.write_text(adapter_text, encoding="utf-8", newline="\n")

test = root / "tests" / "ielts18_gt_test2_study_parity_test.py"
test_text = test.read_text(encoding="utf-8")
test_text = test_text.replace(
    "def test_task_groups_cover_each_question_once_and_use_five_text_roots() -> None:",
    "def test_task_groups_cover_each_question_once_and_use_section_wide_clue_roots() -> None:",
)
old_roots = '''    for text_id in [
        "s1-sleeping-bags",
        "s1-life-writing",
        "s2-employee-health",
        "s2-kitchen",
        "s3-clothkits",
    ]:
        assert f'textId: "{text_id}"' in data
'''
new_roots = '''    assert data.count('textId: "s1-section"') == 2
    assert data.count('textId: "s2-section"') == 2
    assert data.count('textId: "s3-clothkits"') == 3
'''
if test_text.count(old_roots) != 1:
    raise SystemExit("test text-root assertion block mismatch")
test_text = test_text.replace(old_roots, new_roots, 1)
old_adapter_roots = '''    for root in [
        "text-s1-sleeping-bags",
        "text-s1-life-writing",
        "text-s2-employee-health",
        "text-s2-kitchen",
        "text-s3-clothkits",
    ]:
        assert root in adapter
'''
new_adapter_roots = '''    for root in [
        "text-s1-section",
        "text-s2-section",
        "text-s3-clothkits",
    ]:
        assert root in adapter
'''
if test_text.count(old_adapter_roots) != 1:
    raise SystemExit("adapter root assertion block mismatch")
test_text = test_text.replace(old_adapter_roots, new_adapter_roots, 1)
test_text = test_text.replace(
    '    assert "function keepScoreFeedbackWithResources()" in adapter\n    assert \'root.appendChild(button)\' in adapter',
    '    assert "function positionScoreFeedbackButton()" in adapter\n    assert \'candidate.insertAdjacentElement("afterend", button)\' in adapter\n    assert \'root.appendChild(button)\' in adapter',
)
test_text = test_text.replace(
    '    assert "group.questions.indexOf(question) !== -1" in adapter\n',
    '    assert "group.questions.indexOf(question) !== -1" in adapter\n    assert "function prepareStructuredGroupAnchors()" in adapter\n    assert \'box.classList.add("summary-box")\' in adapter\n',
)
test_text += '''

def test_official_cambridge_source_cleanup_is_preserved() -> None:
    html = HTML.read_text(encoding="utf-8")
    p1 = (TARGET / "Passage 1.txt").read_text(encoding="utf-8")
    p2 = (TARGET / "Passage 2.txt").read_text(encoding="utf-8")
    p3 = (TARGET / "Passage 3.txt").read_text(encoding="utf-8")
    questions = (TARGET / "Questions.txt").read_text(encoding="utf-8")
    combined = "\n".join([html, p1, p2, p3])
    for bad in [
        "no—frills", "animal—themed", "non fiction", "meeting With an editor",
        "chefs” shirts", "To this end. staff", "they out different types of food",
        "must not tw to fix", "kitchen. they must have clear labels", "Sew-your—own",
        "experiment With colour", "trousers. in her late twenties", "mass- producing",
    ]:
        assert bad not in combined
    assert "A home-sewing revival: the return of Clothkits" in html
    assert "A home-sewing revival: the return of Clothkits" in p3
    assert "The regulation chefs’ shirts" in html
    assert "each time they cut different types of food" in p2
    assert "staff must not try to fix them themselves" in p2
    assert "‘Making your own clothes gives you a greater appreciation" in p3
    assert "SECTION 2 Questions 15—27" in questions
    assert " A Its designs represented the attitudes of the time." in questions
    assert "Complete the summary below." in questions


def test_section_wide_clues_and_structured_strategy_anchors_are_declared() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    data = DATA.read_text(encoding="utf-8")
    assert 'setTextIdentity(s1, "text-s1-section")' in adapter
    assert 'setTextIdentity(s2, "text-s2-section")' in adapter
    assert data.count('textId: "s1-section"') == 2
    assert data.count('textId: "s2-section"') == 2
    assert 'document.querySelectorAll("#questionContent .note-completion-box,#questionContent .summary-completion-box")' in adapter
    assert 'box.classList.add("summary-box")' in adapter


def test_score_feedback_returns_to_candidate_row_on_desktop_with_mobile_fallback() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert "function positionScoreFeedbackButton()" in adapter
    assert 'window.matchMedia("(max-width: 600px)").matches' in adapter
    assert 'candidate.insertAdjacentElement("afterend", button)' in adapter
    assert 'if (root && button.parentElement !== root) root.appendChild(button);' in adapter
    assert 'window.addEventListener("resize", positionScoreFeedbackButton);' in adapter
'''
test.write_text(test_text, encoding="utf-8", newline="\n")
