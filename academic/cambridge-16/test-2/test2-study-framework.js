/*
 * IELTS 16 Academic Reading Test 2 — Study/Test framework bridge
 *
 * This script leaves Test 2's passage and question markup intact. It layers
 * Study Mode feedback and post-submit review onto the page's existing controls.
 */
(function () {
  'use strict';

  const DATA_KEY = 'IELTS16AcademicTest2StudyFeedback';
  const state = {
    mode: null,
    reviewVisible: false,
    fullStudyCheck: false,
    revealedGroups: new Set(),
    strategyOpen: new Set(),
    studyStartedAt: 0,
    studyTimerId: null,
    candidateName: '',
    evaluation: null,
    originals: {}
  };

  const bandRows = [
    [39, 40, '9'], [37, 38, '8.5'], [35, 36, '8'], [33, 34, '7.5'],
    [30, 32, '7'], [27, 29, '6.5'], [23, 26, '6'], [19, 22, '5.5'],
    [15, 18, '5'], [13, 14, '4.5'], [10, 12, '4'], [8, 9, '3.5'],
    [6, 7, '3'], [4, 5, '2.5'], [0, 3, 'Below 2.5']
  ];

  function data() {
    return window[DATA_KEY] || null;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalise(value) {
    return String(value == null ? '' : value)
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function getUserAnswer(questionNumber) {
    if (typeof window.getUserAnswer === 'function') return window.getUserAnswer(questionNumber);
    const name = 'q' + questionNumber;
    const radio = Array.from(document.querySelectorAll('input[type="radio"][name="' + name + '"]')).find((item) => item.checked);
    if (radio) return radio.value.trim();
    const text = document.querySelector('input[type="text"][name="' + name + '"]');
    if (text) return text.value.trim();
    const select = document.querySelector('select[name="' + name + '"]');
    return select ? select.value.trim() : '';
  }

  function isCorrect(questionNumber, answer) {
    const item = data().questions[questionNumber];
    return !!answer && normalise(answer) === normalise(item.answer);
  }

  function getEvaluation() {
    const results = { total: 0, parts: { 1: 0, 2: 0, 3: 0 }, answers: {} };
    Object.keys(data().questions).forEach((key) => {
      const questionNumber = Number(key);
      const item = data().questions[questionNumber];
      const answer = getUserAnswer(questionNumber);
      const correct = isCorrect(questionNumber, answer);
      results.answers[questionNumber] = { answer, correct };
      if (correct) {
        results.total += 1;
        results.parts[item.passage] += 1;
      }
    });
    return results;
  }

  function bandFor(score) {
    const row = bandRows.find((entry) => score >= entry[0] && score <= entry[1]);
    return row ? row[2] : 'Below 2.5';
  }

  function titleForGroup(group) {
    return 'Questions ' + group.questionNumbers[0] + '–' + group.questionNumbers[group.questionNumbers.length - 1] + ': ' + group.label;
  }

  function groupForQuestion(questionNumber) {
    return data().taskGroups.find((group) => group.questionNumbers.includes(questionNumber));
  }

  function injectStyles() {
    if (byId('test2StudyBridgeStyles')) return;
    const style = document.createElement('style');
    style.id = 'test2StudyBridgeStyles';
    style.textContent = `
      #studyModePill, #studyTimerContainer, #scoreGuideButton, #candidateNameDisplay, #topBarScoreStatus { display: none; }
      #studyModePill { border: 1px solid var(--accent); color: var(--accent); background: var(--accent-soft); border-radius: 999px; padding: 5px 9px; font-weight: 700; }
      #studyTimerContainer { font-weight: 600; color: var(--text-soft); }
      #scoreGuideButton { border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 999px; padding: 6px 10px; cursor: pointer; font-weight: 600; }
      #scoreGuideButton:hover { border-color: var(--accent); color: var(--accent); }
      #candidateNameDisplay, #topBarScoreStatus { color: var(--text-soft); font-size: 0.86rem; }
      .study-group-panel { margin: 12px 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-secondary); overflow: hidden; }
      .study-group-panel__header { padding: 10px 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; justify-content: space-between; }
      .study-group-panel__title { font-weight: 700; }
      .study-group-panel__actions { display: flex; flex-wrap: wrap; gap: 7px; }
      .study-group-panel button { border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 7px; padding: 6px 9px; cursor: pointer; font-weight: 600; }
      .study-group-panel button:hover { border-color: var(--accent); color: var(--accent); }
      .study-group-panel__strategy { display: none; border-top: 1px solid var(--border); padding: 12px; line-height: 1.45; }
      .study-group-panel__strategy.is-open { display: block; }
      .study-group-panel__strategy p { margin: 0 0 8px; }
      .study-group-panel__strategy ol { margin: 6px 0 8px 20px; padding: 0; }
      .study-group-panel__result { display: none; padding: 0 12px 12px; font-weight: 700; }
      .study-group-panel__result.is-visible { display: block; }
      .study-feedback-card { margin: 10px 0 14px; border: 1px solid var(--border); border-radius: 8px; padding: 12px; background: var(--bg-secondary); line-height: 1.45; }
      .study-feedback-card__heading { display: flex; justify-content: space-between; gap: 10px; font-weight: 800; margin-bottom: 8px; }
      .study-feedback-card__row { margin: 7px 0; }
      .study-feedback-card__label { font-weight: 700; }
      .study-feedback-card__answer.is-correct { color: var(--correct); }
      .study-feedback-card__answer.is-incorrect { color: var(--incorrect); }
      .study-feedback-card__clue { margin-top: 9px; }
      .study-feedback-card__clue button { border: 1px solid var(--accent); background: var(--accent-soft); color: var(--accent); border-radius: 7px; padding: 5px 8px; cursor: pointer; font-weight: 700; }
      .study-evidence-clue { background: var(--highlight); color: #111; border-radius: 3px; padding: 1px 2px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
      .study-evidence-focus { outline: 3px solid var(--accent); outline-offset: 2px; }
      #scoreGuideOverlay { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,.55); z-index: 2600; }
      #scoreGuideOverlay.is-open { display: flex; }
      .score-guide-dialog { width: min(580px, 92vw); max-height: 84vh; overflow: auto; background: var(--bg); color: var(--text); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-soft); }
      .score-guide-dialog__top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .score-guide-dialog__close { border: 0; background: none; color: var(--text); font-size: 1.4rem; cursor: pointer; }
      .score-guide-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .score-guide-table th, .score-guide-table td { border-bottom: 1px solid var(--border); text-align: left; padding: 8px; }
      .score-guide-table tr.is-active { background: var(--accent-soft); font-weight: 800; }
      .test2-review-summary { margin: 12px; border: 2px solid var(--accent); border-radius: 10px; padding: 12px; background: var(--accent-soft); }
      .test2-review-summary h3 { margin: 0 0 7px; }
      @media (max-width: 920px) { #candidateNameDisplay, #topBarScoreStatus { display: none !important; } }
    `;
    document.head.appendChild(style);
  }

  function injectTopBar() {
    const topRight = document.querySelector('.top-right');
    const topLeft = document.querySelector('.top-left');
    if (!topRight || !topLeft) return;
    if (!byId('scoreGuideButton')) {
      const scoreGuide = document.createElement('button');
      scoreGuide.id = 'scoreGuideButton';
      scoreGuide.type = 'button';
      scoreGuide.textContent = 'Score guide';
      scoreGuide.addEventListener('click', openScoreGuide);
      topRight.insertBefore(scoreGuide, topRight.firstChild);
    }
    if (!byId('studyModePill')) {
      const pill = document.createElement('div');
      pill.id = 'studyModePill';
      pill.textContent = 'Study mode';
      topRight.insertBefore(pill, topRight.querySelector('#timerContainer'));
    }
    if (!byId('studyTimerContainer')) {
      const studyTimer = document.createElement('div');
      studyTimer.id = 'studyTimerContainer';
      studyTimer.innerHTML = 'Study time: <span id="studyTimerDisplay">00:00</span>';
      topRight.insertBefore(studyTimer, topRight.querySelector('#timerContainer'));
    }
    if (!byId('candidateNameDisplay')) {
      const candidate = document.createElement('div');
      candidate.id = 'candidateNameDisplay';
      topLeft.appendChild(candidate);
    }
    if (!byId('topBarScoreStatus')) {
      const status = document.createElement('div');
      status.id = 'topBarScoreStatus';
      topLeft.appendChild(status);
    }
  }

  function injectScoreGuide() {
    if (byId('scoreGuideOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'scoreGuideOverlay';
    overlay.innerHTML = '<section class="score-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="scoreGuideTitle"><div class="score-guide-dialog__top"><h2 id="scoreGuideTitle">Academic Reading score guide</h2><button type="button" class="score-guide-dialog__close" aria-label="Close score guide">×</button></div><p>Raw scores out of 40 are approximate Academic Reading band equivalents.</p><table class="score-guide-table"><thead><tr><th>Correct answers</th><th>Estimated band</th></tr></thead><tbody>' + bandRows.map((row) => '<tr data-score-min="' + row[0] + '" data-score-max="' + row[1] + '"><td>' + row[0] + '–' + row[1] + '</td><td>' + row[2] + '</td></tr>').join('') + '</tbody></table></section>';
    overlay.addEventListener('click', (event) => { if (event.target === overlay || event.target.closest('.score-guide-dialog__close')) closeScoreGuide(); });
    document.body.appendChild(overlay);
  }

  function openScoreGuide() {
    const overlay = byId('scoreGuideOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('tr.is-active').forEach((row) => row.classList.remove('is-active'));
    if (state.evaluation) {
      const total = state.evaluation.total;
      const active = Array.from(overlay.querySelectorAll('tbody tr')).find((row) => total >= Number(row.dataset.scoreMin) && total <= Number(row.dataset.scoreMax));
      if (active) active.classList.add('is-active');
    }
    overlay.classList.add('is-open');
  }

  function closeScoreGuide() {
    const overlay = byId('scoreGuideOverlay');
    if (overlay) overlay.classList.remove('is-open');
  }

  function startStudyTimer() {
    stopStudyTimer();
    state.studyStartedAt = Date.now();
    const update = () => {
      const output = byId('studyTimerDisplay');
      if (!output || !state.studyStartedAt) return;
      const elapsed = Math.floor((Date.now() - state.studyStartedAt) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      output.textContent = minutes + ':' + seconds;
    };
    update();
    state.studyTimerId = window.setInterval(update, 1000);
  }

  function stopStudyTimer() {
    if (state.studyTimerId) window.clearInterval(state.studyTimerId);
    state.studyTimerId = null;
    state.studyStartedAt = 0;
  }

  function updateTopBar() {
    const scoreGuide = byId('scoreGuideButton');
    const studyPill = byId('studyModePill');
    const studyTimer = byId('studyTimerContainer');
    const candidate = byId('candidateNameDisplay');
    const scoreStatus = byId('topBarScoreStatus');
    const showStudy = state.mode === 'study';
    const showReview = state.reviewVisible;
    if (scoreGuide) scoreGuide.style.display = (showStudy || showReview) ? 'inline-flex' : 'none';
    if (studyPill) studyPill.style.display = showStudy ? 'inline-flex' : 'none';
    if (studyTimer) studyTimer.style.display = showStudy ? 'block' : 'none';
    if (candidate) {
      candidate.textContent = state.mode === 'test' && state.candidateName ? 'Candidate: ' + state.candidateName : '';
      candidate.style.display = candidate.textContent ? 'block' : 'none';
    }
    if (scoreStatus) {
      scoreStatus.textContent = showReview && state.evaluation ? state.evaluation.total + '/40 · Band ' + bandFor(state.evaluation.total) : '';
      scoreStatus.style.display = scoreStatus.textContent ? 'block' : 'none';
    }
  }

  function renderGroupPanels() {
    const content = byId('questionContent');
    if (!content) return;
    content.querySelectorAll('.study-group-panel').forEach((node) => node.remove());
    data().taskGroups.forEach((group) => {
      const firstBlock = content.querySelector('.question-block[data-q="' + group.questionNumbers[0] + '"]');
      if (!firstBlock) return;
      const strategy = data().taskStrategies[group.strategyKey];
      const revealed = state.revealedGroups.has(group.id);
      const panel = document.createElement('section');
      panel.className = 'study-group-panel';
      panel.dataset.groupId = group.id;
      panel.innerHTML = '<div class="study-group-panel__header"><div class="study-group-panel__title">' + escapeHtml(titleForGroup(group)) + '</div><div class="study-group-panel__actions"><button type="button" data-action="strategy">Strategy</button><button type="button" data-action="feedback">' + (revealed ? 'Hide feedback' : 'Show feedback') + '</button></div></div><div class="study-group-panel__strategy' + (state.strategyOpen.has(group.id) ? ' is-open' : '') + '"><p><strong>' + escapeHtml(strategy.purpose || '') + '</strong></p><ol>' + (strategy.steps || []).map((step) => '<li>' + escapeHtml(typeof step === 'string' ? step : step.detail || step.title || '') + '</li>').join('') + '</ol><p><strong>Watch out:</strong> ' + escapeHtml(strategy.commonTrap || '') + '</p></div><div class="study-group-panel__result' + (revealed ? ' is-visible' : '') + '" data-result></div>';
      panel.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        if (button.dataset.action === 'strategy') {
          state.strategyOpen.has(group.id) ? state.strategyOpen.delete(group.id) : state.strategyOpen.add(group.id);
          renderGroupPanels();
        } else {
          toggleGroupFeedback(group.id);
        }
      });
      firstBlock.parentNode.insertBefore(panel, firstBlock);
      if (revealed) updateGroupResult(panel, group);
    });
  }

  function removeFeedbackCards(group) {
    group.questionNumbers.forEach((number) => {
      const block = document.querySelector('.question-block[data-q="' + number + '"]');
      if (!block) return;
      block.classList.remove('correct', 'incorrect');
      block.querySelectorAll('.study-feedback-card').forEach((node) => node.remove());
      const legacyAnswer = byId('ca-' + number);
      if (legacyAnswer) {
        legacyAnswer.textContent = '';
        legacyAnswer.style.display = 'none';
      }
    });
  }

  function feedbackCard(questionNumber) {
    const item = data().questions[questionNumber];
    const answer = getUserAnswer(questionNumber);
    const correct = isCorrect(questionNumber, answer);
    const card = document.createElement('article');
    card.className = 'study-feedback-card';
    card.dataset.question = questionNumber;
    card.innerHTML = '<div class="study-feedback-card__heading"><span>Question ' + questionNumber + '</span><span class="study-feedback-card__answer ' + (correct ? 'is-correct' : 'is-incorrect') + '">' + (correct ? 'Correct' : 'Review') + '</span></div><div class="study-feedback-card__row"><span class="study-feedback-card__label">Your answer: </span>' + escapeHtml(answer || 'No answer') + '</div><div class="study-feedback-card__row"><span class="study-feedback-card__label">Correct answer: </span>' + escapeHtml(item.correctAnswerText) + '</div><div class="study-feedback-card__row"><span class="study-feedback-card__label">Why: </span>' + escapeHtml(item.explanation) + '</div><div class="study-feedback-card__row"><span class="study-feedback-card__label">Skill: </span>' + escapeHtml(item.skillFocus) + '</div><div class="study-feedback-card__clue"><button type="button">Show passage clue</button></div>';
    card.querySelector('button').addEventListener('click', () => focusEvidence(questionNumber));
    return card;
  }

  function updateGroupResult(panel, group) {
    const target = panel.querySelector('[data-result]');
    if (!target) return;
    const evaluation = getEvaluation();
    const correct = group.questionNumbers.filter((number) => evaluation.answers[number].correct).length;
    target.textContent = 'Task result: ' + correct + ' / ' + group.questionNumbers.length;
  }

  function renderFeedbackForGroup(group) {
    removeFeedbackCards(group);
    group.questionNumbers.forEach((number) => {
      const block = document.querySelector('.question-block[data-q="' + number + '"]');
      if (!block) return;
      const answer = getUserAnswer(number);
      block.classList.add(isCorrect(number, answer) ? 'correct' : 'incorrect');
      block.appendChild(feedbackCard(number));
    });
  }

  function toggleGroupFeedback(groupId) {
    const group = data().taskGroups.find((item) => item.id === groupId);
    if (!group) return;
    if (state.revealedGroups.has(groupId)) {
      state.revealedGroups.delete(groupId);
      removeFeedbackCards(group);
    } else {
      state.revealedGroups.add(groupId);
      renderFeedbackForGroup(group);
    }
    renderGroupPanels();
    renderPassageClues();
  }

  function clearPassageClues() {
    document.querySelectorAll('.study-evidence-clue').forEach((node) => {
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    });
    document.querySelectorAll('.study-evidence-focus').forEach((node) => node.classList.remove('study-evidence-focus'));
  }

  function highlightText(root, phrase) {
    if (!root || !phrase) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement && !node.parentElement.closest('.study-evidence-clue, script, style') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const needle = phrase.replace(/\.\.\./g, '').trim().toLowerCase();
    if (!needle) return null;
    let node;
    while ((node = walker.nextNode())) {
      const haystack = node.nodeValue.toLowerCase();
      const index = haystack.indexOf(needle);
      if (index < 0) continue;
      const before = node.nodeValue.slice(0, index);
      const match = node.nodeValue.slice(index, index + needle.length);
      const after = node.nodeValue.slice(index + needle.length);
      const fragment = document.createDocumentFragment();
      if (before) fragment.appendChild(document.createTextNode(before));
      const mark = document.createElement('mark');
      mark.className = 'study-evidence-clue';
      mark.dataset.evidence = phrase;
      mark.textContent = match;
      fragment.appendChild(mark);
      if (after) fragment.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(fragment, node);
      return mark;
    }
    return null;
  }

  function renderPassageClues() {
    clearPassageClues();
    const section = Number((document.querySelector('.passage-section[style*="display: block"]') || document.querySelector('.passage-section:not([style*="display: none"])') || {}).dataset?.section || 1);
    const passage = document.querySelector('.passage-section[data-section="' + section + '"]');
    if (!passage) return;
    data().taskGroups.filter((group) => group.passage === section && state.revealedGroups.has(group.id)).forEach((group) => {
      group.questionNumbers.forEach((number) => highlightText(passage, data().questions[number].infoButtonAfter || data().questions[number].evidence));
    });
  }

  function focusEvidence(questionNumber) {
    clearPassageClues();
    const item = data().questions[questionNumber];
    const passage = document.querySelector('.passage-section[data-section="' + item.passage + '"]');
    const mark = highlightText(passage, item.infoButtonAfter || item.evidence);
    if (mark) {
      mark.classList.add('study-evidence-focus');
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showReviewSummary() {
    document.querySelectorAll('.test2-review-summary').forEach((node) => node.remove());
    const panel = document.createElement('section');
    panel.className = 'test2-review-summary';
    const score = state.evaluation.total;
    panel.innerHTML = '<h3>Your result</h3><div>' + escapeHtml(state.candidateName ? 'Candidate: ' + state.candidateName : 'Study review') + '</div><div><strong>' + score + ' / 40</strong> correct · Estimated Academic Reading band <strong>' + bandFor(score) + '</strong></div><div>Use the task feedback controls below to review why each answer is correct.</div>';
    const content = byId('questionContent');
    if (content) content.insertBefore(panel, content.firstChild);
  }

  function showAllFeedback() {
    data().taskGroups.forEach((group) => {
      state.revealedGroups.add(group.id);
      renderFeedbackForGroup(group);
    });
    renderGroupPanels();
    renderPassageClues();
  }

  function lockAnswers() {
    document.querySelectorAll('#questionContent select, #questionContent input').forEach((input) => { input.disabled = true; });
  }

  function setOptionButtonCopy() {
    const button = document.querySelector('.submit-button');
    if (!button) return;
    button.innerHTML = state.mode === 'study' ? '✔ Check all answers' : state.reviewVisible ? '↻ Start a new attempt' : '✔ Submit test &amp; check answers';
  }

  function finishReview(fromTest) {
    state.evaluation = getEvaluation();
    state.reviewVisible = true;
    state.fullStudyCheck = !fromTest;
    if (fromTest) {
      stopStudyTimer();
      lockAnswers();
      if (window.timerId) window.clearInterval(window.timerId);
      const timer = byId('timerContainer');
      if (timer) timer.style.display = 'none';
      if (typeof window.exitAppFullscreen === 'function') window.exitAppFullscreen();
    }
    showReviewSummary();
    showAllFeedback();
    updateTopBar();
    setOptionButtonCopy();
    if (typeof window.toggleOptions === 'function') window.toggleOptions(false);
  }

  function handlePrimaryAction() {
    if (state.mode === 'test' && state.reviewVisible) {
      window.location.reload();
      return;
    }
    if (state.mode === 'test' && !state.reviewVisible) {
      if (!window.confirm('Are you sure you want to submit your test now? You will not be able to continue answering in Test mode.')) return;
      finishReview(true);
      return;
    }
    finishReview(false);
  }

  function startTimedTest() {
    const input = byId('studentNameInput');
    const name = input ? input.value.trim() : '';
    if (!name) {
      window.alert('Please enter your name before starting test mode.');
      if (input) input.focus();
      return;
    }
    state.candidateName = name;
    state.mode = 'test';
    if (typeof state.originals.beginTimedTest === 'function') state.originals.beginTimedTest();
    updateTopBar();
    setOptionButtonCopy();
  }

  function startStudyMode() {
    state.mode = 'study';
    state.candidateName = '';
    state.reviewVisible = false;
    state.revealedGroups.clear();
    state.strategyOpen.clear();
    if (typeof state.originals.startTest === 'function') state.originals.startTest('study');
    startStudyTimer();
    renderGroupPanels();
    updateTopBar();
    setOptionButtonCopy();
  }

  function interceptModeButtons() {
    document.querySelectorAll('.mode-btn[data-mode="study"]').forEach((button) => {
      button.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); startStudyMode(); }, true);
    });
  }

  function interceptStartButton() {
    const start = document.querySelector('#testStartScreen .mode-btn');
    if (start) start.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); startTimedTest(); }, true);
  }

  function installHooks() {
    state.originals.startTest = window.startTest;
    state.originals.beginTimedTest = window.beginTimedTest;
    state.originals.handlePrimarySubmit = window.handlePrimarySubmit;
    state.originals.switchSection = window.switchSection;

    window.handlePrimarySubmit = handlePrimaryAction;
    window.beginTimedTest = startTimedTest;
    window.confirmGoHome = function () {
      if (window.confirm('Are you sure you want to leave this test and return to the home page? Your current answers may not be saved.')) {
        window.top.location.href = '../../../index.html';
      }
    };
    if (typeof window.switchSection === 'function') {
      window.switchSection = function (section) {
        const output = state.originals.switchSection(section);
        window.setTimeout(renderPassageClues, 0);
        return output;
      };
    }

    const originalToggleOptions = window.toggleOptions;
    if (typeof originalToggleOptions === 'function') {
      window.toggleOptions = function (show) {
        if (show) setOptionButtonCopy();
        return originalToggleOptions(show);
      };
    }
  }

  function initialise() {
    if (!data()) return;
    injectStyles();
    injectTopBar();
    injectScoreGuide();
    installHooks();
    interceptModeButtons();
    interceptStartButton();
    document.addEventListener('click', function (event) {
      if (event.target.closest('.submit-button')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (state.mode === 'test' && state.reviewVisible) window.location.reload();
        else handlePrimaryAction();
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
