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


def test_strength_and_focus_messages_use_separate_paths():
    for path in TEST_FILES:
        text = html(path)
        assert 'const scoreFeedbackStrengthMessages = {' in text
        assert 'You usually distinguished accurately between information that was stated, contradicted, or not mentioned.' in text
        assert 'You selected options that were well supported by the passage.' in text
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
