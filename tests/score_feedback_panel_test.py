from pathlib import Path

TEST_FILES = [
    Path("academic/cambridge-16/test-1/IELTS16 Test 1 - Academic Reading.html"),
    Path("academic/cambridge-16/test-2/IELTS16 Test 2 - Academic Reading.html"),
]


def html(path):
    return path.read_text(encoding="utf-8")


def test_header_score_is_accessible_hidden_button():
    for path in TEST_FILES:
        text = html(path)
        assert '<button type="button" id="topBarScoreStatus"' in text
        assert 'title="View score feedback"' in text
        assert 'aria-controls="scoreFeedbackOverlay"' in text
        assert 'aria-hidden="true"' in text
        assert 'tabindex="-1"' in text
        assert 'hidden></button>' in text
        assert 'id="topBarScoreStatus" role="status"' not in text


def test_header_score_available_only_after_full_score():
    for path in TEST_FILES:
        text = html(path)
        assert 'fullTestScoreAvailable = true;' in text
        assert 'fullTestCorrectCount = correctCount;' in text
        assert 'score.hidden = false;' in text
        assert 'score.tabIndex = 0;' in text
        assert 'score.setAttribute("aria-hidden", "false")' in text
        assert 'score.hidden = true;' in text
        assert 'score.tabIndex = -1;' in text


def test_modal_reuses_existing_band_descriptor_helpers():
    for path in TEST_FILES:
        text = html(path)
        modal_start = text.index('function renderScoreFeedbackPanel()')
        modal = text[modal_start:text.index('function openScoreFeedbackPanel()', modal_start)]
        assert 'computeBandScore(fullTestCorrectCount)' in modal
        assert 'formatBandLabel(band)' in modal
        assert 'getBandDescriptor(band)' in modal
        assert 'academicReadingBandRows' not in modal
        assert '40-39 = 9' not in modal


def test_part_scores_come_from_canonical_evaluation():
    for path in TEST_FILES:
        text = html(path)
        assert 'latestEvaluation = evaluation;' in text
        assert 'questionOutcomes' in text
        modal = text[text.index('function renderScoreFeedbackPanel()'):]
        assert 'const evaluation = getScoreFeedbackEvaluation();' in modal
        assert 'evaluation.parts[part]' in modal
        assert 'getUserAnswer(' not in modal.split('function openScoreFeedbackPanel()')[0]


def test_explicit_question_type_metadata_present():
    test1 = html(TEST_FILES[0])
    for group in [
        'label: "True / False / Not Given", questions: [1,2,3,4,5,6,7]',
        'label: "Table completion", questions: [8,9,10,11,12,13]',
        'label: "Matching headings", questions: [14,15,16,17,18,19,20]',
        'label: "Note completion", questions: [21,22,23,24]',
        'label: "Multiple choice", questions: [25,26]',
        'label: "Multiple choice", questions: [27,28,29,30]',
        'label: "Summary completion", questions: [31,32,33,34]',
        'label: "Matching people", questions: [35,36,37,38,39,40]',
    ]:
        assert group in test1
    test2 = html(TEST_FILES[1])
    for group in [
        'label: "True / False / Not Given", questions: [1,2,3,4,5,6,7,8]',
        'label: "Summary completion", questions: [9,10,11,12,13]',
        'label: "Multiple choice", questions: [14,15,16]',
        'label: "Summary completion", questions: [17,18,19,20]',
        'label: "Yes / No / Not Given", questions: [21,22,23,24,25,26]',
        'label: "Multiple choice", questions: [27,28,29,30]',
        'label: "Summary completion", questions: [31,32,33,34,35]',
        'label: "Yes / No / Not Given", questions: [36,37,38,39,40]',
    ]:
        assert group in test2


def test_score_feedback_body_is_single_scroll_region_with_static_header():
    for path in TEST_FILES:
        text = html(path)
        assert '.score-feedback-panel {' in text
        assert 'display: flex;' in text
        assert 'flex-direction: column;' in text
        assert 'overflow: hidden;' in text
        assert '.score-feedback-panel .score-guide-header {' in text
        assert 'flex: 0 0 auto;' in text
        assert '#scoreFeedbackBody.score-feedback-body {' in text
        assert 'flex: 1 1 auto;' in text
        assert 'min-height: 0;' in text
        assert 'overflow-y: auto;' in text
        modal_markup = text[text.index('id="scoreFeedbackOverlay"'):text.index('id="answerKeyOverlay"')]
        assert modal_markup.index('class="score-guide-header"') < modal_markup.index('id="scoreFeedbackBody"')


def test_score_feedback_scroll_css_does_not_change_score_guide_or_answer_key_contracts():
    for path in TEST_FILES:
        text = html(path)
        assert '#answerKeyOverlay .score-guide-panel.answer-key-panel' in text or '.answer-key-panel {' in text
        score_feedback_css_start = text.index('.score-feedback-panel {')
        score_feedback_css = text[score_feedback_css_start:text.index('#scoreFeedbackBody.score-feedback-body {', score_feedback_css_start)]
        assert 'answer-key-panel' not in score_feedback_css
        assert 'score-guide-panel {' not in score_feedback_css


def test_test2_creates_feedback_cards_for_all_three_parts():
    text = html(TEST_FILES[1])
    render_fn = text[text.index('function renderScoreFeedbackPanel()'):text.index('function openScoreFeedbackPanel()')]
    assert 'Object.keys(sectionRanges).sort((a,b)=>Number(a)-Number(b)).forEach((part)' in render_fn
    assert 'const partGroups=scoreFeedbackGroups.filter((group)=>Number(group.part)===Number(part))' in render_fn
    assert 'section.innerHTML="<h3>Part "+part+" · "' in render_fn
    assert 'body.appendChild(section)' in render_fn
    assert '{ part: 1,' in text and '{ part: 2,' in text and '{ part: 3,' in text


def test_strength_and_focus_messages_use_separate_paths():
    for path in TEST_FILES:
        text = html(path)
        assert 'const scoreFeedbackStrengthMessages = {' in text
        assert 'You also recognised when the passage did not give enough information to make a decision.' in text
        assert 'You avoided distractors that repeated words from the text but changed the meaning.' in text
        assert 'Compare the meaning rather than matching individual words' in text
        assert 'check the meaning of the whole option, not just familiar words' in text
        append_fn = text[text.index('function appendFeedbackItem'):text.index('function renderScoreFeedbackPanel()', text.index('function appendFeedbackItem'))]
        assert 'title === "What went well"' in append_fn
        assert 'scoreFeedbackStrengthMessages[item.group.strategyKey]' in append_fn
        assert 'scoreFeedbackGuidance[item.group.strategyKey]' in append_fn
        assert 'This is a useful area to practise.' in append_fn


def test_scoring_timing_answer_key_clue_and_modal_paths_are_unchanged_by_wording_refinement():
    for path in TEST_FILES:
        text = html(path)
        assert 'latestEvaluation = evaluation;' in text
        assert 'questionOutcomes' in text
        assert 'if (mode === "test")' in text
        assert 'Total time used:' in text
        assert 'Time remaining:' in text
        assert 'openAnswerKeyPanel' in text
        assert 'scoreFeedbackOverlay' in text
        assert 'event.key === "Escape"' in text
        assert 'event.target === feedbackOverlay' in text


def test_thresholds_and_small_groups_guarded():
    for path in TEST_FILES:
        text = html(path)
        assert 'item.total >= 3' in text
        assert 'item.ratio >= 0.75' in text
        assert 'item.ratio < 0.60' in text


def test_time_management_overall_only_and_study_omits():
    for path in TEST_FILES:
        text = html(path)
        modal = text[text.index('function renderScoreFeedbackPanel()'):text.index('function openScoreFeedbackPanel()')]
        assert 'if (mode === "test")' in modal
        assert 'Total time used:' in modal
        assert 'Time remaining:' in modal
        assert 'The 60-minute test time ended before the test was submitted.' in modal
        assert 'As a flexible guide, aim to complete Parts 1 and 2 in a little under 20 minutes each.' in modal
        assert 'part time' not in modal.lower()
        assert 'per-part' not in modal.lower()


def test_modal_accessibility_and_safe_closing():
    for path in TEST_FILES:
        text = html(path)
        assert 'id="scoreFeedbackOverlay"' in text
        assert 'aria-modal="true"' in text
        assert 'Score feedback' in text
        assert 'Your IELTS Academic Reading result' in text
        assert 'if (close) close.focus();' in text
        assert 'lastScoreFeedbackOpener.focus()' in text
        assert 'event.key === "Escape"' in text
        assert 'event.target === feedbackOverlay' in text
        assert 'closeScoreFeedbackPanel(false)' in text


def test_opening_panel_does_not_trigger_checking_or_timer_controls():
    for path in TEST_FILES:
        text = html(path)
        open_fn = text[text.index('function openScoreFeedbackPanel()'):text.index('function closeScoreFeedbackPanel', text.index('function openScoreFeedbackPanel()'))]
        forbidden = ['evaluateQuestions(', 'submitTest(', 'startTimer(', 'pauseTimer(', 'resumeTimer(', 'openAnswerKeyPanel(', 'show', 'Clue']
        for token in forbidden:
            assert token not in open_fn
