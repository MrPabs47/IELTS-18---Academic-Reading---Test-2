"""Regression coverage for IELTS 16 Academic Reading Test 2 Study clues.

The page marks Study Mode passage evidence by finding each question's
``infoButtonAfter`` text in the matching passage and then appending numbered
badges to the highlighted mark.  These tests keep that data/rendering contract
intact without requiring a browser or external Python packages.
"""

from __future__ import annotations

import html
import json
import re
import subprocess
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-16" / "test-2"
HTML_PATH = TEST_DIR / "IELTS16 Test 2 - Academic Reading.html"
STUDY_FEEDBACK_PATH = TEST_DIR / "study-feedback.js"
EXCLUDED_CLUE_ANCESTORS = {"mark", "button", "input", "select", "textarea"}


@dataclass
class _DomNode:
    tag: str | None = None
    text: str = ""
    attrs: dict[str, str | None] = field(default_factory=dict)
    parent: "_DomNode | None" = None
    children: list["_DomNode"] = field(default_factory=list)

    def append(self, child: "_DomNode") -> None:
        child.parent = self
        self.children.append(child)

    def has_excluded_ancestor(self) -> bool:
        node: _DomNode | None = self.parent
        while node:
            if node.tag in EXCLUDED_CLUE_ANCESTORS:
                return True
            node = node.parent
        return False


class _FragmentParser(HTMLParser):
    VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = _DomNode(tag="__root__")
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = _DomNode(tag=tag, attrs=dict(attrs))
        self.stack[-1].append(node)
        if tag not in self.VOID_TAGS:
            self.stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        if data:
            self.stack[-1].append(_DomNode(text=data))


def _load_study_data() -> dict:
    script = f"""
      global.window = {{}};
      require({json.dumps(str(STUDY_FEEDBACK_PATH))});
      process.stdout.write(JSON.stringify(window.IELTS16AcademicTest2StudyFeedback));
    """
    output = subprocess.check_output(["node", "-e", script], text=True)
    return json.loads(output)


def _extract_passage_roots() -> dict[int, _DomNode]:
    page = HTML_PATH.read_text(encoding="utf-8")
    passages: dict[int, _DomNode] = {}
    starts = list(re.finditer(r'<div class="passage-section" data-section="(\d)"[^>]*>', page))
    right_panel = page.find('<div class="right-panel"')
    for index, match in enumerate(starts):
        passage_id = int(match.group(1))
        end = starts[index + 1].start() if index + 1 < len(starts) else right_panel
        parser = _FragmentParser()
        parser.feed(page[match.end():end])
        passages[passage_id] = parser.root
    return passages


def _normalise_text(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def _iter_text_nodes(node: _DomNode):
    if node.tag is None:
        yield node
        return
    for child in node.children:
        yield from _iter_text_nodes(child)


def _find_text_node_match(root: _DomNode, needle: str) -> tuple[_DomNode, int] | None:
    """Mirror findTextNodeMatch: only one eligible text node may contain a clue."""
    for node in _iter_text_nodes(root):
        if not node.text.strip() or node.has_excluded_ancestor():
            continue
        idx = node.text.find(needle)
        if idx >= 0:
            return node, idx
    return None


def _mark_study_evidence(root: _DomNode, question_number: int, clue: str) -> _DomNode | None:
    for node in _walk_elements(root):
        if node.tag == "mark" and (node.attrs.get("data-clue-text") == clue or clue in str(node.attrs.get("data-clue-text") or "")):
            questions = [q for q in (node.attrs.get("data-clue-questions") or "").split(",") if q]
            if str(question_number) not in questions:
                questions.append(str(question_number))
            node.attrs["data-clue-questions"] = ",".join(questions)
            _render_study_clue_badges(node)
            return node

    match = _find_text_node_match(root, clue)
    if not match:
        return None
    node, idx = match
    parent = node.parent
    assert parent is not None
    mark = _DomNode(tag="mark", attrs={"class": "study-evidence-highlight", "id": f"study-evidence-{question_number}", "data-clue-text": clue, "data-clue-questions": str(question_number)})
    mark.append(_DomNode(text=node.text[idx:idx + len(clue)]))
    replacement = []
    if node.text[:idx]:
        replacement.append(_DomNode(text=node.text[:idx]))
    replacement.append(mark)
    if node.text[idx + len(clue):]:
        replacement.append(_DomNode(text=node.text[idx + len(clue):]))
    insert_at = parent.children.index(node)
    parent.children[insert_at:insert_at + 1] = replacement
    for child in replacement:
        child.parent = parent
    _render_study_clue_badges(mark)
    return mark


def _walk_elements(node: _DomNode):
    if node.tag is not None:
        yield node
    for child in node.children:
        yield from _walk_elements(child)


def _render_study_clue_badges(mark: _DomNode) -> None:
    mark.children = [child for child in mark.children if not (child.tag == "button" and child.attrs.get("class") == "study-clue-badge")]
    for question in [q for q in (mark.attrs.get("data-clue-questions") or "").split(",") if q]:
        badge = _DomNode(tag="button", attrs={"type": "button", "class": "study-clue-badge", "aria-label": f"Return to question {question}"})
        badge.append(_DomNode(text=question))
        mark.append(badge)


def _badge_map(root: _DomNode) -> dict[str, list[str]]:
    marks = [node for node in _walk_elements(root) if node.tag == "mark" and node.attrs.get("class") == "study-evidence-highlight"]
    return {str(mark.attrs.get("data-clue-text")): [str(badge.children[0].text) for badge in mark.children if badge.tag == "button" and badge.attrs.get("class") == "study-clue-badge"] for mark in marks}


def test_all_40_study_clues_can_be_found_sequentially_in_their_passages() -> None:
    """Every question must have an exact, markable Study clue in a DOM text node."""
    data = _load_study_data()
    passages = _extract_passage_roots()

    assert sorted(map(int, data["questions"].keys())) == list(range(1, 41))
    assert sorted(passages) == [1, 2, 3]

    for question_number in range(1, 41):
        question = data["questions"][str(question_number)]
        clue = _normalise_text(question.get("infoButtonAfter") or question.get("evidence") or "")
        passage = passages[int(question["passage"])]

        assert clue, f"Question {question_number} has no Study clue text"
        assert _find_text_node_match(passage, clue), (
            f"Question {question_number} clue is not present in a single eligible Passage {question['passage']} text node"
        )

    sequential_passages = _extract_passage_roots()
    marked_questions: set[int] = set()
    for question_number in range(1, 41):
        question = data["questions"][str(question_number)]
        clue = _normalise_text(question.get("infoButtonAfter") or question.get("evidence") or "")
        passage = sequential_passages[int(question["passage"])]

        mark = _mark_study_evidence(passage, question_number, clue)
        assert mark is not None, f"Question {question_number} clue could not be marked"
        assert str(question_number) in (mark.attrs.get("data-clue-questions") or "").split(",")
        marked_questions.add(question_number)

    assert marked_questions == set(range(1, 41))


def test_show_all_flow_renders_expected_clue_badges_for_each_passage() -> None:
    """Simulate Show-all per passage, including same-text clue badge reuse."""
    data = _load_study_data()
    passages = _extract_passage_roots()
    represented_questions: set[int] = set()

    for passage_number, passage in passages.items():
        expected_badges: dict[str, list[str]] = {}
        groups = [group for group in data["taskGroups"] if int(group["passage"]) == passage_number]
        assert groups, f"Passage {passage_number} has no Study task groups"

        for group in groups:
            for question_number in group["questionNumbers"]:
                clue = _normalise_text(data["questions"][str(question_number)].get("infoButtonAfter") or data["questions"][str(question_number)].get("evidence") or "")
                badge_key = next((existing_clue for existing_clue in expected_badges if clue in existing_clue), clue)
                expected_badges.setdefault(badge_key, [])
                if str(question_number) not in expected_badges[badge_key]:
                    expected_badges[badge_key].append(str(question_number))
                assert _mark_study_evidence(passage, question_number, clue) is not None

        actual_badges = _badge_map(passage)
        assert actual_badges == expected_badges
        for badges in actual_badges.values():
            represented_questions.update(map(int, badges))

    assert represented_questions == set(range(1, 41))


def test_study_clue_rendering_contract_and_test_mode_safeguards_remain_intact() -> None:
    """Keep the Study visual shell hooks without bypassing Test Mode safeguards."""
    page = HTML_PATH.read_text(encoding="utf-8")

    required_snippets = [
        '<script src="study-feedback.js"></script>',
        'id="passageClueToggle" class="study-clue-toggle" hidden',
        'class="study-clue-btn" data-clue-q="',
        'function findTextNodeMatch(root, needle)',
        'node.parentElement.closest("mark, button, input, select, textarea")',
        'function markStudyEvidence(q)',
        'function renderStudyClueBadges(mark)',
        'badge.className = "study-clue-badge"',
        'badge.textContent = question',
        'function handlePrimarySubmit()',
        'onclick="handlePrimarySubmit()"',
        'id="fullscreenLockOverlay"',
        'function submitTest()',
    ]
    for snippet in required_snippets:
        assert snippet in page

    assert 'onclick="submitTest()"' not in page
    assert page.count('function handlePrimarySubmit()') == 1
    assert page.count('function submitTest()') == 1
    assert page.count('const answerKey =') == 1
    assert page.count('const correctAnswerText =') == 1


def test_study_shell_foundation_and_lifecycle_behaviour_contract() -> None:
    """Guard the shared Study Mode shell import and Test 1 evidence lifecycle parity."""
    page = HTML_PATH.read_text(encoding="utf-8")
    shared_css = (ROOT / "academic/shared/reading-study-shell.css").read_text(encoding="utf-8")
    shared_js = (ROOT / "academic/shared/reading-study-shell.js").read_text(encoding="utf-8")
    readme = (ROOT / "academic/shared/README-study-mode-shell.md").read_text(encoding="utf-8")

    assert '<link rel="stylesheet" href="../../shared/reading-study-shell.css">' in page
    assert '<script src="../../shared/reading-study-shell.js"></script>' in page
    assert "Show answers &amp; feedback" in page
    assert "Hide answers & feedback" in page
    assert "Study time: <span id=\"studyTimerDisplay\">00:00</span>" in page
    assert 'id="studyHeaderChrome" class="study-header-chrome"' in page
    assert page.index('id="scoreGuideButton"') < page.index('id="studyModePill"') < page.index('id="studyTimerContainer"') < page.index('class="icon-group"')
    header = page[page.index('id="studyHeaderChrome"'):page.index('class="icon-group"')]
    assert "Check all answers" not in header
    assert "studyCheckAllControl" not in header
    assert "#studyToolbar" not in shared_css
    assert ".is-visible" in shared_css
    assert ".study-icon-btn" in shared_css
    assert ".study-feedback-card dl" in shared_css
    assert "ReadingStudyShell.init(adapter)" in readme
    for hook in ["getMode()", "getTaskGroups()", "showGroupFeedback(groupId)", "hideGroupFeedback(groupId)", "markEvidence(questionNumber)", "clearEvidence()", "focusQuestionClue(questionNumber)", "getActivePassage()"]:
        assert hook in readme

    assert "init(adapter)" in shared_js
    assert "showChrome(show, options)" in shared_js
    assert "showAllPassageClues()" in shared_js
    assert "hideAllPassageClues()" in shared_js
    assert "focusClue(questionNumber)" in shared_js
    assert "fullClueMapVisible" not in shared_js
    assert "fullClueMapPassages: new Set()" in shared_js
    assert "this.renderVisibleEvidence(active);" in shared_js
    assert "setVisible(byId(\"studyTimer\"), studyActive" in shared_js
    assert "studyActive = !!show && isStudyMode && !submitted" in shared_js
    assert "toggle.hidden = (!isStudyMode && !submitted) || !hasPassageClues" in shared_js
    assert "adapter.isFullClueMapVisible" not in shared_js
    assert "studyCheckAll" not in shared_js

    init = page[page.index("ReadingStudyShell.init({"):page.index("function showStudyChrome")]
    assert "getMode: () => mode" in init
    assert "showGroupFeedback: renderStudyGroupFeedback" in init
    assert "hideGroupFeedback: clearStudyGroupFeedback" in init
    assert "markEvidence: markStudyEvidence" in init
    assert "clearEvidenceForPassage: clearStudyEvidenceHighlightsForPassage" in init
    assert "focusQuestionClue: focusMarkedStudyEvidence" in init

    show_group = page[page.index("function showStudyGroup(groupId)"):page.index("function renderStudyGroupFeedback(groupId)")]
    assert "controller.showGroup(groupId)" in show_group
    render_group = page[page.index("function renderStudyEvidenceForGroup(group)"):page.index("function getStudyEvidenceText(q)")]
    assert "group.questionNumbers.forEach((q) => markStudyEvidence(q));" in render_group
    assert "revealedStudyTaskGroups.has(group.id)" in render_group

    focus = page[page.index("function focusStudyEvidence(q)"):page.index("function checkAllStudyAnswers()")]
    assert "controller.focusClue(q)" in focus
    assert "clearStudyEvidenceHighlights();\n      setTimeout" not in focus


def test_shared_controller_full_map_state_with_mocked_adapter() -> None:
    """Exercise full-map and focus lifecycle with a mocked DOM/adapter, no browser needed."""
    script = """
      const assert = require('assert');
      global.window = {};
      const elements = {
        passageClueToggle: { hidden: true, textContent: '', onclick: null, classList: { toggle() {} }, setAttribute() {} },
        studyHeaderChrome: { style: {}, classList: { toggle() {} }, setAttribute() {} },
        scoreGuideButton: { style: {}, classList: { toggle() {} }, setAttribute() {} },
        studyModePill: { style: {}, classList: { toggle() {} }, setAttribute() {} },
        studyTimerContainer: { style: {}, classList: { toggle() {} }, setAttribute() {} }
      };
      global.document = {
        getElementById(id) { return elements[id] || null; },
        querySelectorAll(selector) { return selector === '.study-task-panel' ? [] : []; }
      };
      require(SHELL_PATH);

      let mode = 'study';
      let submitted = false;
      let activePassage = 1;
      const visibleByPassage = new Map([['1', new Set()], ['2', new Set()]]);
      const focused = [];
      const groups = [
        { id: 'g1', passage: 1, questionNumbers: [1, 2] },
        { id: 'g2', passage: 1, questionNumbers: [3, 4] },
        { id: 'g3', passage: 2, questionNumbers: [5] }
      ];
      const passageForQuestion = (q) => groups.find((group) => group.questionNumbers.includes(Number(q))).passage;
      const addVisible = (q) => visibleByPassage.get(String(passageForQuestion(q))).add(String(q));
      const controller = window.ReadingStudyShell.init({
        getMode: () => mode,
        isStudyMode: () => mode === 'study',
        isSubmitted: () => submitted,
        getTaskGroups: () => groups,
        getActivePassage: () => activePassage,
        visibleGroups: new Set(),
        showGroupFeedback() {},
        hideGroupFeedback() {},
        markEvidence(q) { addVisible(q); return { q }; },
        clearEvidence() { visibleByPassage.forEach((set) => set.clear()); },
        clearEvidenceForPassage(passage) { visibleByPassage.get(String(passage)).clear(); },
        focusQuestionClue(q) { addVisible(q); focused.push(String(q)); return { q }; }
      });
      const visibleList = (passage) => Array.from(visibleByPassage.get(String(passage))).sort().join(',');
      const toggle = elements.passageClueToggle;

      controller.updateClueToolbar();
      assert.strictEqual(toggle.hidden, false);
      assert.strictEqual(toggle.textContent, 'Show all passage clues');
      toggle.onclick();
      assert.strictEqual(visibleList(1), '1,2,3,4');
      assert.strictEqual(toggle.textContent, 'Hide all passage clues');

      activePassage = 2;
      controller.updateClueToolbar();
      assert.strictEqual(toggle.textContent, 'Show all passage clues');
      activePassage = 1;
      controller.updateClueToolbar();
      assert.strictEqual(toggle.textContent, 'Hide all passage clues');

      controller.focusClue(2);
      assert.strictEqual(visibleList(1), '1,2,3,4');
      assert.deepStrictEqual(focused, ['2']);

      toggle.onclick();
      assert.strictEqual(visibleList(1), '');
      assert.strictEqual(toggle.textContent, 'Show all passage clues');

      controller.showGroup('g1');
      assert.strictEqual(visibleList(1), '1,2');
      toggle.onclick();
      assert.strictEqual(visibleList(1), '1,2,3,4');
      activePassage = 2;
      controller.showGroup('g3');
      assert.strictEqual(visibleList(2), '5');
      assert.strictEqual(toggle.textContent, 'Hide all passage clues');
      activePassage = 1;
      controller.updateClueToolbar();
      toggle.onclick();
      assert.strictEqual(visibleList(1), '1,2');
      assert.strictEqual(visibleList(2), '5');
      assert.strictEqual(toggle.textContent, 'Show all passage clues');

      controller.showGroup('g2');
      assert.strictEqual(toggle.textContent, 'Hide all passage clues');
      activePassage = 2;
      controller.updateClueToolbar();
      assert.strictEqual(toggle.textContent, 'Hide all passage clues');

      mode = 'test';
      submitted = false;
      controller.updateClueToolbar();
      assert.strictEqual(toggle.hidden, true);
    """
    script = "const SHELL_PATH = " + json.dumps(str(ROOT / "academic/shared/reading-study-shell.js")) + ";\n" + script
    subprocess.check_call(["node", "-e", script])

def test_overlapping_and_contained_clue_badges_are_preserved() -> None:
    """Contained clue strings must reuse marks and keep every badge."""
    passage = _DomNode(tag="div", attrs={"class": "passage-section", "data-section": "1"})
    passage.append(_DomNode(text="alpha beta gamma delta"))
    first = _mark_study_evidence(passage, 1, "alpha beta gamma")
    second = _mark_study_evidence(passage, 2, "beta")
    assert first is not None
    assert second is first
    assert (first.attrs.get("data-clue-questions") or "").split(",") == ["1", "2"]
    badges = [child.children[0].text for child in first.children if child.tag == "button"]
    assert badges == ["1", "2"]
