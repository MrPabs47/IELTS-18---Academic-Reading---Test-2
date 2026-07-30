"""Static contract tests for IELTS 16 Listening Study feedback corrections."""

from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = (
    ROOT
    / "listening"
    / "cambridge-16"
    / "test-1"
    / "IELTS16 Test 1 - Listening.html"
)
HTML = HTML_PATH.read_text(encoding="utf-8")


def function_body(name):
    start = HTML.index(f"function {name}")
    body_start = HTML.index("{", start) + 1
    next_function = HTML.find("\n    function ", body_start)
    if next_function == -1:
        next_function = len(HTML)
    return HTML[body_start:next_function]


TASK_GROUP_SOURCE = HTML[
    HTML.index("const listeningTaskGroups = [") : HTML.index(
        "const groupedQuestionMap"
    )
]


class ListeningStudyFeedbackStaticContractTest(unittest.TestCase):
    """Protect Study feedback as static source contracts without browser execution."""

    def test_global_study_information_button_and_dialog_are_removed(self):
        for removed in (
            'id="studyInfoBtn"',
            'id="studyInfoDialog"',
            "Listening Study Mode information",
            "After a Test submission, submitted answers remain locked.",
            "Additional answer and evidence tools will appear where available.",
        ):
            self.assertNotIn(removed, HTML)

    def test_ordinary_and_locked_pill_copy_share_one_state_source(self):
        header = function_body("updateStudyModeHeader")
        self.assertIn(
            "submittedReview ? 'Study Mode \\u00B7 Locked' : 'Study Mode'",
            header,
        )
        self.assertIn(
            "submittedReview ? 'Study Mode \\u2014 submitted answers locked' "
            ": 'Study Mode'",
            header,
        )
        self.assertIn("listeningStudyPill.disabled=!submittedReview", header)

    def test_locked_pill_dialog_is_accessible_and_has_exact_explanation(self):
        self.assertIn(
            'id="lockedReviewDialog" role="dialog" aria-modal="true" '
            'aria-labelledby="locked-review-title"',
            HTML,
        )
        self.assertIn(
            "You are reviewing a submitted test. Your answers are locked. "
            "To edit answers and check them as you work, start a new attempt "
            "in Study Mode.",
            HTML,
        )
        self.assertIn(
            "if(submittedReview) "
            "openStudyDialog(lockedReviewOverlay,lockedReviewCloseBtn,"
            "listeningStudyPill)",
            HTML,
        )

    def test_dialog_focus_escape_backdrop_and_opener_restore_are_present(self):
        opener = function_body("openStudyDialog")
        closer = function_body("closeStudyDialog")
        self.assertIn("closeButton.focus({preventScroll:true})", opener)
        self.assertIn("opener.focus({preventScroll:true})", closer)
        self.assertIn("if(event.target===overlay) closeStudyDialog(true)", HTML)
        self.assertIn("if(activeStudyDialog)", HTML)
        self.assertIn("if(event.key!=='Escape') return", HTML)

    def test_dialog_lifecycle_does_not_touch_audio_or_answers(self):
        for name in ("openStudyDialog", "closeStudyDialog"):
            body = function_body(name)
            for forbidden in (
                "sectionAudio",
                "currentTime",
                "getUserAnswer",
                "evaluateAll",
                "disabled=",
            ):
                self.assertNotIn(forbidden, body)

    def test_header_order_is_score_guide_answer_key_then_study_pill(self):
        shell_start = HTML.index('id="listeningStudyShell"')
        shell_end = HTML.index("</div>", shell_start)
        shell = HTML[shell_start:shell_end]
        self.assertLess(shell.index('id="scoreGuideBtn"'), shell.index('id="answerKeyBtn"'))
        self.assertLess(shell.index('id="answerKeyBtn"'), shell.index('id="listeningStudyPill"'))

    def test_header_shell_is_visible_only_for_study_experiences(self):
        header = function_body("updateStudyModeHeader")
        self.assertIn("const visible=isStudyExperience()", header)
        self.assertIn("listeningStudyShell.hidden=!visible", header)
        self.assertEqual(
            function_body("isStudyExperience").strip(),
            "return mode==='study' || submittedReview; }",
        )

    def test_score_guide_has_dialog_semantics_and_uses_existing_band_rows(self):
        self.assertIn(
            'id="scoreGuideDialog" role="dialog" aria-modal="true" '
            'aria-labelledby="score-guide-title"',
            HTML,
        )
        render = function_body("renderScoreGuide")
        self.assertIn("listeningBands.forEach", render)
        self.assertIn("listeningBands[index-1].min-1", render)
        self.assertNotIn("evaluateAll", render)
        self.assertNotIn("bandFromScore", render)
        self.assertIn(
            "The displayed band follows this practice test’s current scoring table.",
            HTML,
        )

    def test_answer_key_dialog_uses_existing_accepted_answer_data(self):
        self.assertIn(
            'id="answerKeyDialog" role="dialog" aria-modal="true" '
            'aria-labelledby="answer-key-title"',
            HTML,
        )
        accepted = function_body("acceptedAnswerDisplay")
        paired = function_body("pairedAnswerDisplay")
        self.assertIn("displayAnswers[questionNumber]", accepted)
        self.assertIn("answerKey[questionNumber].join(' / ')", accepted)
        self.assertIn("answerKey[questionNumber]", paired)
        self.assertIn("(either order)", paired)

    def test_answer_key_does_not_score_or_modify_student_controls(self):
        for name in (
            "renderAnswerKey",
            "acceptedAnswerDisplay",
            "pairedAnswerDisplay",
            "navigateFromAnswerKey",
        ):
            body = function_body(name)
            self.assertNotIn("evaluateAll", body)
            self.assertNotIn(".value=", body)
            self.assertNotIn(".checked=", body)

    def test_answer_key_renders_all_40_entries_as_native_buttons(self):
        render = function_body("renderAnswerKey")
        self.assertIn("for(let questionNumber=range.from", render)
        self.assertNotIn("questionNumber===22", render)
        self.assertNotIn("questionNumber===24", render)
        self.assertIn("document.createElement('button')", render)
        self.assertIn("item.type='button'", render)
        self.assertIn("navigateFromAnswerKey(questionNumber)", render)
        self.assertIn("`Go to Question ${questionNumber}: ${answerText}`", render)

    def test_answer_key_navigation_closes_dialog_and_targets_question_part(self):
        navigate = function_body("navigateFromAnswerKey")
        shared = function_body("navigateToExactQuestion")
        activate = function_body("activateExactQuestionTarget")
        self.assertIn(
            "navigateToExactQuestion(questionNumber,{closeDialog:true})", navigate
        )
        self.assertIn("if(closeDialog) closeStudyDialog(false)", shared)
        self.assertIn("getSectionForQuestion(questionNumber)", shared)
        self.assertIn("switchQuestionSectionWithoutMedia", shared)
        self.assertIn("activateExactQuestionTarget(", shared)
        self.assertIn("target.marker.classList.add('is-active-question-target')", activate)
        self.assertIn("scrollQuestionTargetIntoView(target.marker)", activate)
        self.assertIn("focus({preventScroll:true})", activate)

    def test_answer_key_navigation_preserves_audio_transcript_and_feedback_state(self):
        for name in (
            "navigateFromAnswerKey",
            "navigateToExactQuestion",
            "activateExactQuestionTarget",
            "switchQuestionSectionWithoutMedia",
            "getExactQuestionTarget",
            "scrollQuestionTargetIntoView",
        ):
            body = function_body(name)
            for forbidden in (
                "updateSectionAudio(",
                "renderAudioscriptPanel(",
                "currentTime=",
                ".play(",
                ".pause(",
                "showListeningStudyGroup(",
                "hideListeningStudyGroup(",
                "evaluateAll(",
            ):
                self.assertNotIn(forbidden, body)

    def test_answer_key_has_stable_targets_for_all_listening_task_shapes(self):
        target = function_body("getExactQuestionTarget")
        self.assertIn('.inline-answer[data-q="${questionNumber}"]', target)
        self.assertIn('input[type="radio"][name="q${questionNumber}"]', target)
        self.assertIn('select[name="q${questionNumber}"]', target)
        self.assertIn(".closest('.map-answer-row')", target)
        self.assertIn('input[name="${group.pairName}"]', target)
        self.assertIn('.drag-slot[data-q="${questionNumber}"]', target)
        self.assertIn(".closest('.drag-question-row')", target)
        self.assertIn("controls.find((control)=>control.checked)", target)
        self.assertIn("radios.find((radio)=>radio.checked)", target)
        self.assertIn("focusTarget.disabled", target)
        self.assertIn("focusTarget.inert", target)
        self.assertIn("focusTarget=marker", target)
        self.assertIn("return {block,marker,focusTarget}", target)

    def test_all_question_navigation_uses_one_exact_target_state_and_blue_marker(self):
        activate = function_body("activateExactQuestionTarget")
        clear = function_body("clearActiveQuestionTarget")
        switch = function_body("switchSection")
        start = function_body("startApp")
        self.assertIn("let activeQuestionNumber = null", HTML)
        self.assertIn("activeQuestionNumber=questionNumber", activate)
        self.assertIn("activeQuestionNumber=null", clear)
        self.assertIn("clearActiveQuestionTarget()", activate)
        self.assertIn("clearActiveQuestionTarget()", switch)
        self.assertIn("clearActiveQuestionTarget()", start)
        self.assertIn(
            "document.querySelectorAll('.is-active-question-target')", clear
        )
        marker = re.search(
            r"\.is-active-question-target\s*\{(?P<body>.*?)\}", HTML, re.DOTALL
        )
        self.assertIsNotNone(marker)
        self.assertIn("#2563eb", marker.group("body"))
        self.assertIn("outline", marker.group("body"))
        self.assertNotIn("border-width", marker.group("body"))

    def test_shared_cross_part_navigation_preserves_rendered_transcript_state(self):
        part_one_sync = function_body("updatePart1TranscriptSync")
        active_sync = function_body("updateActiveTranscriptSync")
        guard = (
            "activeQuestionNumber!==null && "
            "audioscriptPanel.dataset.part!==String(activeSection)"
        )
        self.assertIn(guard, part_one_sync)
        self.assertIn(guard, active_sync)
        self.assertLess(
            part_one_sync.index(guard),
            part_one_sync.index("clearCurrentAudioscriptSegment()"),
        )
        self.assertLess(
            active_sync.index(guard),
            active_sync.index("clearCurrentAudioscriptSegment()"),
        )

    def test_answer_key_exact_target_ranges_cover_all_40_questions(self):
        target = function_body("getExactQuestionTarget")
        self.assertIn("questionNumber<=10 || questionNumber>=31", target)
        self.assertIn("questionNumber<=14", target)
        self.assertIn("questionNumber<=20", target)
        self.assertIn("questionNumber<=24", target)
        self.assertIn("else {", target)
        self.assertIn('input[type="radio"][name="q${questionNumber}"]', target)
        self.assertIn("group.startSelector", target)
        self.assertIn("group.pairName", target)

    def test_footer_and_answer_key_share_exact_navigation_without_media_changes(self):
        answer_key = function_body("navigateFromAnswerKey")
        footer = function_body("jumpToQuestion")
        shared = function_body("navigateToExactQuestion")
        self.assertIn("navigateToExactQuestion(", answer_key)
        self.assertIn("navigateToExactQuestion(q)", footer)
        self.assertIn("activateExactQuestionTarget(", shared)
        for forbidden in (
            "updateSectionAudio(",
            "renderAudioscriptPanel(",
            "currentTime=",
            ".play(",
            ".pause(",
            "showListeningStudyGroup(",
            "showTranscriptEvidence(",
        ):
            self.assertNotIn(forbidden, shared)

    def test_direct_pointer_and_focus_interactions_use_the_same_target_helper(self):
        setup = function_body("setupActiveQuestionInteractions")
        resolver = function_body("questionNumberFromInteractionTarget")
        self.assertIn(
            "studyQuestionPane.addEventListener('click',identify)", setup
        )
        self.assertIn(
            "studyQuestionPane.addEventListener('focusin',identify)", setup
        )
        self.assertIn("activateExactQuestionTarget(questionNumber)", setup)
        for token in (
            "input[name^=\"q\"]",
            "select[name^=\"q\"]",
            ".inline-answer[data-q]",
            ".map-answer-row",
            ".drag-question-row",
            "name==='q21_22'",
            "name==='q23_24'",
        ):
            self.assertIn(token, resolver)

    def test_exactly_seven_reusable_task_groups_exist(self):
        self.assertEqual(TASK_GROUP_SOURCE.count("id:'questions-"), 7)
        for label in (
            "Questions 1–10",
            "Questions 11–14",
            "Questions 15–20",
            "Questions 21–22",
            "Questions 23–24",
            "Questions 25–30",
            "Questions 31–40",
        ):
            self.assertIn(f"label:'{label}'", TASK_GROUP_SOURCE)

    def test_task_group_types_and_question_ranges_are_exact(self):
        for task_type in (
            "Note completion",
            "Multiple choice",
            "Map matching",
            "Choose two answers",
            "Matching",
        ):
            self.assertIn(f"type:'{task_type}'", TASK_GROUP_SOURCE)
        self.assertEqual(TASK_GROUP_SOURCE.count("type:'Choose two answers'"), 2)
        self.assertEqual(TASK_GROUP_SOURCE.count("type:'Note completion'"), 2)

    def test_each_group_builds_one_task_information_control(self):
        build = function_body("buildListeningStudyTaskControls")
        self.assertIn("listeningTaskGroups.forEach", build)
        self.assertIn("className='reading-shell-study-icon-button'", build)
        self.assertIn(
            "strategyButton.setAttribute('aria-label',"
            "`How to tackle ${group.label}`)",
            build,
        )
        self.assertIn("strategyButton.setAttribute('aria-expanded','false')", build)

    def test_strategy_panels_are_inline_regions_not_modal_dialogs(self):
        strategy = function_body("makeStrategyPanel")
        self.assertIn("panel.setAttribute('role','region')", strategy)
        self.assertIn("panel.hidden=true", strategy)
        self.assertNotIn("aria-modal", strategy)
        self.assertNotIn("openStudyDialog", strategy)

    def test_strategy_panels_have_numbered_steps_and_watch_out_cards(self):
        strategy = function_body("makeStrategyPanel")
        self.assertIn("group.steps.forEach", strategy)
        self.assertIn("`Step ${index+1}`", strategy)
        self.assertIn("watchLabel.append(watchChip,'Watch out')", strategy)
        for phrase in (
            "Listen for paraphrases and contrasts.",
            "Find the starting point and map orientation.",
            "Similar vocabulary does not necessarily mean the same category.",
            "Write the exact ONE WORD answer and check spelling.",
        ):
            self.assertIn(phrase, TASK_GROUP_SOURCE)

    def test_strategy_toggle_only_changes_panel_state(self):
        build = function_body("buildListeningStudyTaskControls")
        self.assertIn("strategyPanel.hidden=!opening", build)
        self.assertIn(
            "strategyButton.setAttribute('aria-expanded',String(opening))", build
        )
        for forbidden in ("sectionAudio", "currentTime", "switchSection("):
            self.assertNotIn(forbidden, build)

    def test_each_group_builds_one_show_answers_control(self):
        build = function_body("buildListeningStudyTaskControls")
        self.assertIn("className='reading-shell-study-reveal-button'", build)
        self.assertIn("textContent='Show answers & feedback'", build)
        self.assertIn("setAttribute('aria-expanded','false')", build)

    def test_revealed_group_state_is_independent(self):
        self.assertIn("const revealedGroups = new Set()", HTML)
        show = function_body("showListeningStudyGroup")
        hide = function_body("hideListeningStudyGroup")
        self.assertIn("revealedGroups.add(group.id)", show)
        self.assertIn("revealedGroups.delete(group.id)", hide)

    def test_hiding_feedback_does_not_change_answers(self):
        hide = function_body("hideListeningStudyGroup")
        self.assertIn("control.feedbackHost.replaceChildren()", hide)
        for forbidden in (".value=", ".checked=", "getUserAnswer(", "evaluateAll("):
            self.assertNotIn(forbidden, hide)

    def test_editing_a_visible_group_invalidates_only_that_group(self):
        invalidate = function_body("invalidateListeningStudyGroupFeedback")
        change = function_body("onAnswerChange")
        self.assertIn("revealedGroups.has(group.id)", invalidate)
        self.assertIn("hideListeningStudyGroup(group)", invalidate)
        self.assertNotIn("renderListeningStudyGroupFeedback", invalidate)
        self.assertIn("invalidateListeningStudyGroupFeedback(currentQuestion)", change)
        self.assertNotIn("refreshVisibleListeningStudyFeedback", HTML)

    def test_explicit_reveal_rechecks_invalidated_feedback(self):
        toggle = function_body("toggleListeningStudyGroup")
        show = function_body("showListeningStudyGroup")
        self.assertIn("showListeningStudyGroup(group,false)", toggle)
        self.assertIn("renderListeningStudyGroupFeedback(group,useSnapshot)", show)
        self.assertIn("updateListeningStudyGroupScore(group,useSnapshot)", show)

    def test_global_study_check_reveals_or_refreshes_every_group(self):
        submit = function_body("submitTest")
        reveal_all = function_body("revealAllListeningStudyGroups")
        self.assertIn(
            "if(!finalTestSubmission) revealAllListeningStudyGroups(false)", submit
        )
        self.assertIn("listeningTaskGroups.forEach", reveal_all)
        self.assertIn("showListeningStudyGroup(group,useSnapshot)", reveal_all)

    def test_ordinary_study_feedback_does_not_lock_answers(self):
        for name in (
            "showListeningStudyGroup",
            "hideListeningStudyGroup",
            "renderListeningStudyGroupFeedback",
        ):
            body = function_body(name)
            self.assertNotIn(".disabled=true", body)
            self.assertNotIn("setCustomDragLocked", body)

    def test_submitted_review_auto_reveals_groups_and_hides_toggles(self):
        sync = function_body("syncListeningStudyTaskControls")
        self.assertIn("control.revealButton.hidden=!visible || submittedReview", sync)
        self.assertIn(
            "if(submittedReview && submittedResultSnapshot) "
            "revealAllListeningStudyGroups(true)",
            sync,
        )

    def test_submitted_feedback_uses_snapshot_not_mutable_dom(self):
        snapshot = function_body("snapshotAnswer")
        state = function_body("questionFeedbackState")
        self.assertIn("submittedResultSnapshot.answers[questionNumber]", snapshot)
        self.assertIn(
            "submittedResultSnapshot.answeredByQuestion[questionNumber]", state
        )
        self.assertIn(
            "submittedResultSnapshot.correctByQuestion[questionNumber]", state
        )

    def test_submitted_feedback_does_not_rescore(self):
        for name in (
            "snapshotAnswer",
            "questionFeedbackState",
            "pairedFeedbackState",
            "renderListeningStudyGroupFeedback",
            "syncListeningStudyTaskControls",
        ):
            self.assertNotIn("evaluateAll(", function_body(name))
            self.assertNotIn("bandFromScore(", function_body(name))

    def test_feedback_cards_support_all_four_statuses(self):
        card = function_body("buildListeningFeedbackCard")
        state = function_body("questionFeedbackState")
        for status in ("unanswered", "correct", "incorrect"):
            self.assertIn(f"'{status}'", state)
        self.assertIn("reading-shell-study-feedback-${state.status}", card)
        self.assertIn("state.status==='partial' ? 'Partially correct'", card)

    def test_text_radio_map_matching_and_part_four_use_shared_scorer(self):
        render = function_body("renderListeningStudyGroupFeedback")
        state = function_body("questionFeedbackState")
        self.assertIn("getUserAnswer(questionNumber)", state)
        self.assertIn("isCorrect(questionNumber)", state)
        self.assertIn("group.questions.forEach", render)
        for group_id in (
            "questions-1-10",
            "questions-11-14",
            "questions-15-20",
            "questions-25-30",
            "questions-31-40",
        ):
            self.assertIn(f"id:'{group_id}'", TASK_GROUP_SOURCE)

    def test_paired_checkbox_groups_are_evaluated_as_unordered_sets(self):
        paired = function_body("pairedFeedbackState")
        self.assertIn("const selectedSet=new Set", paired)
        self.assertIn(
            "accepted.filter((answer)=>selectedSet.has(answer)).length",
            paired,
        )
        self.assertIn("correctCount===accepted.length", paired)
        self.assertNotIn("isCorrect(", paired)
        self.assertEqual(TASK_GROUP_SOURCE.count("pairName:'q"), 2)

    def test_choose_two_partial_and_zero_selection_contracts(self):
        paired = function_body("pairedFeedbackState")
        self.assertIn("selected.length===0 ? 'unanswered'", paired)
        self.assertIn("correctCount===accepted.length ? 'correct'", paired)
        self.assertIn("correctCount>0 ? 'partial' : 'incorrect'", paired)
        self.assertIn("correctCount", paired)
        self.assertIn("total:accepted.length", paired)

    def test_paired_feedback_renders_one_combined_card_per_pair(self):
        render = function_body("renderListeningStudyGroupFeedback")
        self.assertIn("if(group.pairName)", render)
        self.assertIn(
            "buildListeningFeedbackCard(group.label,state,"
            "pairedAnswerDisplay(group),details,questionNumbers)",
            render,
        )

    def test_paired_card_shows_independent_mark_count(self):
        card = function_body("buildListeningFeedbackCard")
        self.assertIn("if(Number.isInteger(state.correctCount)", card)
        self.assertIn("scoreLabel.textContent='Score'", card)
        self.assertIn("`${state.correctCount} / ${state.total} correct`", card)

    def test_all_seven_groups_build_reading_style_score_pills(self):
        build = function_body("buildListeningStudyTaskControls")
        self.assertIn("className='reading-shell-study-result'", build)
        self.assertIn("result.hidden=true", build)
        self.assertIn(
            "listeningTaskControlMap.set(group.id,"
            "{group,controls,strategyButton,revealButton,result,"
            "strategyPanel,feedbackHost})",
            build,
        )
        self.assertEqual(TASK_GROUP_SOURCE.count("id:'questions-"), 7)

    def test_group_score_pills_use_exact_group_denominators(self):
        score = function_body("listeningStudyGroupScore")
        update = function_body("updateListeningStudyGroupScore")
        self.assertIn("group.questions.length", score)
        self.assertIn("pairedFeedbackState(group,useSnapshot).correctCount", score)
        self.assertIn(
            "group.questions.filter((questionNumber)=>"
            "questionFeedbackState(questionNumber,useSnapshot).correct).length",
            score,
        )
        self.assertIn(
            "`${score.correctCount} / ${score.total} correct`",
            update,
        )

    def test_group_score_pills_update_only_on_explicit_evaluation(self):
        show = function_body("showListeningStudyGroup")
        hide = function_body("hideListeningStudyGroup")
        change = function_body("onAnswerChange")
        self.assertIn("updateListeningStudyGroupScore(group,useSnapshot)", show)
        self.assertIn("control.result.hidden=true", hide)
        self.assertNotIn("updateListeningStudyGroupScore", change)
        self.assertNotIn("listeningStudyGroupScore", change)

    def test_submitted_review_score_pills_use_snapshot_and_stay_fixed(self):
        show = function_body("showListeningStudyGroup")
        sync = function_body("syncListeningStudyTaskControls")
        self.assertIn("updateListeningStudyGroupScore(group,useSnapshot)", show)
        self.assertIn("revealAllListeningStudyGroups(true)", sync)
        self.assertIn(
            "if(submittedReview) return",
            function_body("hideListeningStudyGroup"),
        )
        self.assertIn(
            "if(submittedReview) return",
            function_body("invalidateListeningStudyGroupFeedback"),
        )

    def test_blank_answers_are_presented_without_prefilling_controls(self):
        card = function_body("buildListeningFeedbackCard")
        self.assertIn("state.answered ? state.answer : 'Not answered'", card)
        self.assertNotIn(".value=", card)
        self.assertNotIn(".checked=", card)

    def test_optional_future_details_do_not_render_empty_placeholders(self):
        optional = function_body("appendFeedbackDetail")
        card = function_body("buildListeningFeedbackCard")
        self.assertIn("if(!text) return", optional)
        self.assertIn("appendFeedbackDetail(list,'Why',details.why)", card)
        self.assertIn("appendFeedbackDetail(list,'Skill',details.skill)", card)
        self.assertNotIn("<dt>Why</dt>", HTML)
        self.assertNotIn("<dt>Skill</dt>", HTML)
        self.assertNotIn("<dt>Evidence", HTML)

    def test_evidence_controls_do_not_add_student_annotation_features(self):
        self.assertIn("listening-study-evidence-button", HTML)
        for forbidden in (
            "studentNotes",
            "annotationStorage",
            "studentHighlight",
        ):
            self.assertNotIn(forbidden, HTML)

    def test_feedback_hosts_are_inserted_after_complete_task_groups(self):
        build = function_body("buildListeningStudyTaskControls")
        self.assertIn("end.insertAdjacentElement('afterend',feedbackHost)", build)
        self.assertIn("className='listening-study-feedback-host'", build)
        self.assertNotIn("appendChild(feedbackHost)", build)
        self.assertNotIn("start.append", build)
        self.assertNotIn("end.append", build)

    def test_existing_inline_answer_text_is_suppressed_when_cards_are_used(self):
        suppress = function_body("suppressLegacyInlineFeedback")
        submit = function_body("submitTest")
        self.assertIn("document.querySelectorAll('.correct-answer')", suppress)
        self.assertIn("answer.style.display='none'", suppress)
        self.assertIn("suppressLegacyInlineFeedback()", submit)
        self.assertIn("showCorrectAnswer('ca-15-20'", HTML)

    def test_question_wording_and_source_layout_markers_remain_present(self):
        for marker in (
            "Children’s Engineering Workshops",
            "Stevenson’s was founded in",
            "Plan of Stevenson's site map",
            "Which TWO parts of the introductory stage",
            "Personal meanings",
            "Stoicism",
        ):
            self.assertIn(marker, HTML)

    def test_test_mode_hides_all_task_controls(self):
        sync = function_body("syncListeningStudyTaskControls")
        self.assertIn("const visible=isStudyExperience()", sync)
        self.assertIn("control.controls.hidden=!visible", sync)
        self.assertIn("control.strategyButton.disabled=!visible", sync)
        self.assertIn("control.revealButton.hidden=!visible || submittedReview", sync)

    def test_feedback_and_strategy_styles_are_theme_and_mobile_safe(self):
        for selector in (
            ".reading-shell-study-panel",
            ".reading-shell-study-feedback-card",
            ".reading-shell-study-feedback-correct",
            ".reading-shell-study-feedback-partial",
            ".reading-shell-study-feedback-incorrect",
            ".reading-shell-study-feedback-unanswered",
            ".reading-shell-study-result",
        ):
            self.assertIn(selector, HTML)
        self.assertIn("background: var(--bg-secondary)", HTML)
        self.assertRegex(
            HTML,
            r"(?s)@media \(max-width: 760px\).*?"
            r"\.listening-answer-key-grid\s*\{\s*grid-template-columns:\s*1fr",
        )


if __name__ == "__main__":
    unittest.main()
