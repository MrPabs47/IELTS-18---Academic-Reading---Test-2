import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'academic/shared/reading-feature-shell.js').read_text(encoding='utf-8')
CSS=(ROOT/'academic/shared/reading-feature-shell.css').read_text(encoding='utf-8')
HTML=(ROOT/'academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html').read_text(encoding='utf-8')


def test_shared_chrome_has_expected_assets_api_and_score_scale():
    assert HTML.count('../../shared/reading-feature-shell.css')==1
    assert HTML.count('../../shared/reading-feature-shell.js')==1
    assert HTML.count('id="readingFeatureShellMount"')==1
    for name in ['init','sync','startStudySession','getStatus','validateConfig']:
        assert re.search(rf'\b{name}\s*:\s*{name}\b',JS)
    rows=re.findall(r'\{ correctAnswers: "([^"]+)", band: "([^"]+)" \}',HTML)
    assert rows==[('39–40','9.0'),('37–38','8.5'),('35–36','8.0'),('33–34','7.5'),('30–32','7.0'),('27–29','6.5'),('23–26','6.0'),('19–22','5.5'),('15–18','5.0'),('13–14','4.5'),('10–12','4.0'),('8–9','3.5'),('6–7','3.0'),('4–5','2.5'),('1–3','1.0'),('0','0')]


def test_shared_chrome_matches_established_order_labels_and_close_control():
    assert 'root.append(guideButton,pill,timer,overlay)' in JS
    for value in ['"📊"','"Score guide"','"Study mode"','"Study time: "','reading-shell-score-guide-close","×"','aria-label","Close score guide"','title","Close score guide"']:
        assert value in JS
    assert JS.find('guideButton=createElement')<JS.find('pill=createElement')<JS.find('timer=createElement')
    assert 'Answer Key' not in JS+CSS+HTML and 'answerKeyButton' not in JS+CSS+HTML and '🔑' not in JS+CSS+HTML
    for value in ['gap:6px','padding:5px 10px','border-radius:999px','height:32px','width:32px','width:min(520px,96vw)']:
        assert value in CSS


def test_study_chrome_is_accessible_and_hidden_in_test_mode():
    assert 'mount.removeAttribute("aria-hidden")' in JS
    assert 'mount.setAttribute("aria-hidden","true")' not in JS
    for value in ['role","dialog"','aria-modal","true"','aria-labelledby","reading-shell-score-guide-title"','closeButton.focus()','event.key==="Escape"','event.target===elements.overlay','focusTarget.focus()']:
        assert value in JS
    for value in ['visibleInStudyBeforeChecking=currentMode==="study"&&!submitted','visibleInStudyAfterChecking=currentMode==="study"&&submitted','hiddenInTestBeforeSubmission=currentMode==="test"&&!submitted','hiddenInTestAfterSubmission=currentMode==="test"&&submitted','elements.root.hidden=!shouldShowStudyChrome']:
        assert value in JS


def test_shell_keeps_out_of_test_engine_and_later_learning_features():
    for value in ['computeBandScore','evaluateQuestions','submitTest','handlePrimarySubmit','confirmSubmit','beginTimedTest','requestFullscreen','getChooseTwoCorrectCount','enforceChooseTwoLimit','Score Feedback','magnifying glass','passage clue toolbar','Show all clues','Clear clues']:
        assert value not in JS
    assert re.search(r'function startTest\(selectedMode\) \{(?P<body>.*?)\n    \}',HTML,re.S)
    assert HTML.count('ReadingFeatureShell.startStudySession()')==1
    assert HTML.count('ReadingFeatureShell.sync()')==1
