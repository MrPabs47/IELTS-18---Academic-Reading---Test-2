"""Static contract tests for Listening question-pane highlights and notes."""

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = (
    ROOT
    / "listening"
    / "cambridge-16"
    / "test-1"
    / "IELTS16 Test 1 - Listening.html"
)


class ListeningAnnotationsStaticContractTest(unittest.TestCase):
    """Protect the static integration contract without simulating browser ranges."""

    @classmethod
    def setUpClass(cls):
        cls.html = TARGET.read_text(encoding="utf-8")

    def function_body(self, name, next_name):
        start = self.html.index(f"function {name}")
        end = self.html.index(f"function {next_name}", start)
        return self.html[start:end]

    def test_reading_style_toolbar_uses_accessible_native_controls(self):
        toolbar = re.search(
            r'<div id="selectionToolbar"(?P<attrs>[^>]*)>(?P<body>.*?)</div>',
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(toolbar)
        self.assertIn('role="toolbar"', toolbar.group("attrs"))
        self.assertIn('aria-label="Text annotation actions"', toolbar.group("attrs"))
        self.assertIn("hidden", toolbar.group("attrs"))
        self.assertIn('<button type="button" id="highlightSelectionBtn"', toolbar.group("body"))
        self.assertIn('<button type="button" id="noteSelectionBtn"', toolbar.group("body"))
        self.assertIn("#selectionToolbar button:focus-visible", self.html)
        self.assertIn("position: fixed", self.html[self.html.index("#selectionToolbar"):])

    def test_selection_is_limited_to_one_safe_authored_question_boundary(self):
        for selector in (
            ".instruction-heading",
            ".instruction-copy",
            ".bullet-list > li",
            ".small-heading",
            ".radio-option > span",
            ".checkbox-option > span",
            ".map-answer-row > label",
            ".drag-question-row > div:not(.matching-num):not(.drag-slot)",
        ):
            self.assertIn(selector, self.html)
        validity = self.function_body("isValidAnnotationRange", "annotationNodeForEndpoint")
        self.assertIn("range.collapsed", validity)
        self.assertIn("!range.toString().trim()", validity)
        self.assertIn("startBoundary!==endBoundary", validity)
        self.assertIn("studyQuestionPane.contains(startBoundary)", validity)
        self.assertIn("LISTENING_ANNOTATION_EXCLUDED_SELECTOR", validity)
        self.assertIn("rangeIntersectsElement(range,element)", validity)

    def test_inputs_generated_content_and_interactive_matching_controls_are_excluded(self):
        excluded = self.html[
            self.html.index("const LISTENING_ANNOTATION_EXCLUDED_SELECTOR")
            : self.html.index("const selectionToolbar")
        ]
        for selector in (
            "'input'",
            "'textarea'",
            "'select'",
            "'button'",
            "'.inline-answer'",
            "'.drag-slot'",
            "'.drag-bank'",
            "'.drag-choice'",
            "'.correct-answer'",
            "'.listening-study-feedback-host'",
            "'.reading-shell-study-panel'",
            "'.reading-shell-study-feedback-card'",
        ):
            self.assertIn(selector, excluded)

    def test_toolbar_only_opens_for_a_valid_question_pane_selection(self):
        show = self.function_body("showSelectionToolbarForRange", "updateSelectionToolbar")
        self.assertIn("isValidAnnotationRange(range)", show)
        self.assertIn("pendingAnnotationRange=range.cloneRange()", show)
        self.assertIn("pendingAnnotationBoundary=getAnnotationBoundary", show)
        self.assertIn("positionSelectionToolbar(range)", show)
        self.assertIn("hideSelectionToolbar()", show)
        mouse = self.html[
            self.html.index("document.addEventListener('mouseup'")
            : self.html.index("document.addEventListener('keyup'")
        ]
        self.assertIn("studyQuestionPane.contains(event.target)", mouse)
        self.assertIn("isValidAnnotationRange(selection.getRangeAt(0))", mouse)
        self.assertNotIn("audioscriptBody.contains", mouse)
        self.assertIn("if(!selection || selection.rangeCount!==1)", self.html)
        self.assertIn("selection.isCollapsed", self.html)

    def test_selecting_option_text_preserves_the_answer_control_state(self):
        capture = self.function_body(
            "captureSelectionControlState", "restoreSelectionControlState"
        )
        self.assertIn("event.target.closest('label')?.querySelector('input,select')", capture)
        self.assertIn("checked:'checked' in control ? control.checked : null", capture)
        self.assertIn("value:control.value", capture)
        restore = self.function_body(
            "restoreSelectionControlState", "collectAnnotationTextSegments"
        )
        self.assertIn("snapshot.control.checked=snapshot.checked", restore)
        self.assertIn("snapshot.control.value=snapshot.value", restore)
        setup = self.function_body("setupListeningAnnotations", "fullscreenEnabled")
        self.assertIn(
            "studyQuestionPane.addEventListener('mousedown',captureSelectionControlState,true)",
            setup,
        )
        self.assertIn("restoreSelectionControlState()", setup)
        self.assertIn("event.stopImmediatePropagation()", setup)

    def test_toolbar_is_viewport_safe_and_dismissible(self):
        position = self.function_body("positionSelectionToolbar", "showSelectionToolbarForRange")
        self.assertIn("window.innerWidth-halfWidth-8", position)
        self.assertIn("window.innerHeight-toolbarRect.height-8", position)
        self.assertIn("rect.bottom+8", position)
        setup = self.function_body("setupListeningAnnotations", "fullscreenEnabled")
        self.assertIn("document.addEventListener('pointerdown'", setup)
        self.assertIn("window.addEventListener('resize'", setup)
        self.assertIn("studyQuestionPane.addEventListener('scroll'", setup)
        self.assertIn("if(!selectionToolbar.hidden)", self.html)
        self.assertIn("hideSelectionToolbar({clearSelection:true})", self.html)

    def test_highlights_have_scoped_stable_ids_and_support_multiple_ranges(self):
        self.assertIn(
            "const LISTENING_ANNOTATION_SCOPE = 'ielts16-listening-test1'",
            self.html,
        )
        apply = self.function_body("applyOrRemoveHighlight", "noteAnchorNodes")
        self.assertIn("listeningAnnotationId+=1", apply)
        self.assertIn(
            "`${LISTENING_ANNOTATION_SCOPE}-highlight-${listeningAnnotationId}`",
            apply,
        )
        self.assertIn("wrapAnnotationSegments(", apply)
        self.assertIn("'.highlighted'", apply)
        self.assertNotIn("innerHTML", apply)

    def test_nested_duplicates_are_prevented_and_overlap_is_segmented_safely(self):
        collect = self.function_body("collectAnnotationTextSegments", "wrapAnnotationSegments")
        self.assertIn("if(skipSelector && parent?.closest(skipSelector)) continue", collect)
        self.assertIn("rangeIntersectsElement(range,node)", collect)
        self.assertIn("node===range.startContainer ? range.startOffset : 0", collect)
        self.assertIn("node===range.endContainer ? range.endOffset", collect)
        wrap = self.function_body("wrapAnnotationSegments", "unwrapAnnotationNodes")
        self.assertIn("segments.reverse()", wrap)
        self.assertIn("segmentRange.surroundContents(wrapper)", wrap)
        self.assertIn("wrapper.dataset[dataKey]=id", wrap)

    def test_highlight_removal_preserves_surrounding_dom(self):
        unwrap = self.function_body("unwrapAnnotationNodes", "applyOrRemoveHighlight")
        self.assertIn("while(wrapper.firstChild)", unwrap)
        self.assertIn("parent.insertBefore(wrapper.firstChild,wrapper)", unwrap)
        self.assertIn("wrapper.remove()", unwrap)
        self.assertIn("parent.normalize()", unwrap)
        apply = self.function_body("applyOrRemoveHighlight", "noteAnchorNodes")
        self.assertIn("singleAnnotationIdForRange", apply)
        self.assertIn(
            'unwrapAnnotationNodes(`.highlighted[data-annotation-id="${existingId}"]`)',
            apply,
        )

    def test_note_editor_is_labelled_focusable_and_supports_crud(self):
        dialog = re.search(
            r'<div class="note-window" id="noteWindow"(?P<attrs>[^>]*)>(?P<body>.*?)</div>\s*</div>',
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(dialog)
        attrs = dialog.group("attrs")
        self.assertIn('role="dialog"', attrs)
        self.assertIn('aria-modal="false"', attrs)
        self.assertIn('aria-labelledby="noteWindowTitle"', attrs)
        self.assertIn('<label for="noteText">Note text</label>', dialog.group("body"))
        self.assertIn('<textarea id="noteText"', dialog.group("body"))
        for control in ("closeNoteBtn", "deleteNoteBtn", "cancelNoteBtn", "saveNoteBtn"):
            self.assertRegex(self.html, rf'<button type="button" id="{control}"')
        self.assertIn("noteText.focus({preventScroll:true})", self.html)
        self.assertIn("opener.focus({preventScroll:true})", self.html)
        for function in (
            "createOrEditNote",
            "openNoteEditor",
            "saveCurrentNote",
            "deleteNote",
            "deleteCurrentNote",
            "closeNoteEditor",
        ):
            self.assertIn(f"function {function}", self.html)

    def test_notes_use_scoped_ids_reading_style_anchors_and_empty_note_handling(self):
        create = self.function_body("createOrEditNote", "saveCurrentNote")
        self.assertIn("currentNoteId+=1", create)
        self.assertIn("`${LISTENING_ANNOTATION_SCOPE}-note-${currentNoteId}`", create)
        self.assertIn("notesStore[noteId]={text:''}", create)
        self.assertIn("prepareNoteAnchors(noteId)", create)
        anchors = self.function_body("prepareNoteAnchors", "positionNoteWindow")
        self.assertIn("anchor.tabIndex=0", anchors)
        self.assertIn("anchor.setAttribute('aria-label','Open note for selected text')", anchors)
        self.assertIn("deleteControl.type='button'", anchors)
        self.assertIn("deleteControl.className='note-delete'", anchors)
        self.assertIn("Delete note for selected text", anchors)
        self.assertIn("deleteControl.textContent='\\u00D7'", anchors)
        self.assertIn("firstAnchor.appendChild(deleteControl)", anchors)
        save = self.function_body("saveCurrentNote", "deleteCurrentNote")
        self.assertIn("notesStore[currentOpenNoteId].text=noteText.value", save)
        delete = self.function_body("deleteNote", "deleteCurrentNote")
        self.assertIn("delete notesStore[noteId]", delete)
        self.assertNotIn("confirm(", delete)

    def test_note_anchor_delete_control_is_floating_hidden_and_layout_neutral(self):
        self.assertNotIn("note-indicator", self.html)
        anchor_style = re.search(
            r"\.note-anchor\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(anchor_style)
        anchor_body = anchor_style.group("body")
        self.assertIn("position: relative", anchor_body)
        self.assertIn("text-decoration: underline", anchor_body)
        self.assertNotIn("display: inline-flex", anchor_body)
        self.assertNotIn("width:", anchor_body)
        self.assertNotIn("margin:", anchor_body)
        delete_style = re.search(
            r"\.note-anchor \.note-delete\s*\{(?P<body>.*?)\}",
            self.html,
            re.DOTALL,
        )
        self.assertIsNotNone(delete_style)
        body = delete_style.group("body")
        for expected in (
            "position: absolute",
            "top: -10px",
            "right: -10px",
            "display: none",
            "width: 16px",
            "height: 16px",
            "background: var(--danger)",
        ):
            self.assertIn(expected, body)
        self.assertIn(".note-anchor:hover .note-delete", self.html)
        self.assertIn(".note-anchor:focus .note-delete", self.html)
        self.assertIn(".note-anchor:focus-within .note-delete", self.html)
        self.assertNotIn("min-width:", body)
        self.assertNotIn("margin:", body)

    def test_note_anchor_activation_and_delete_are_keyboard_safe_and_isolated(self):
        setup = self.function_body("setupListeningAnnotations", "fullscreenEnabled")
        self.assertIn("event.target.closest('.note-delete[data-note-id]')", setup)
        self.assertIn("event.target.closest('.note-anchor[data-note-id]')", setup)
        self.assertIn("deleteNote(deleteControl.dataset.noteId)", setup)
        self.assertIn("openNoteEditor(anchor.dataset.noteId,anchor)", setup)
        self.assertIn("event.key!=='Enter' && event.key!==' '", setup)
        self.assertIn("event.preventDefault()", setup)
        self.assertIn("event.stopPropagation()", setup)
        self.assertIn("},true);", setup)
        delete = self.function_body("deleteNote", "deleteCurrentNote")
        self.assertIn(".note-delete[data-note-id=", delete)
        self.assertIn("unwrapAnnotationNodes", delete)
        editor_delete = self.function_body("deleteCurrentNote", "setupNoteWindowDragging")
        self.assertIn("deleteNote(currentOpenNoteId)", editor_delete)

    def test_question_8_inline_completion_structure_and_spacing_are_unchanged(self):
        expected = (
            'Held on <span class="inline-answer" data-q="8">'
            '<input name="q8" type="text" /></span> from 10 am to 11 am.'
        )
        self.assertIn(expected, self.html)
        self.assertNotRegex(
            self.html,
            r'note-(?:indicator|delete)[^<]*</(?:button|span)>\s*<span class="inline-answer" data-q="8"',
        )

    def test_annotation_actions_are_mode_independent_and_do_not_mutate_test_state(self):
        actions = self.html[
            self.html.index("function applyOrRemoveHighlight")
            : self.html.index("function setupNoteWindowDragging")
        ]
        for forbidden in (
            "answerKey",
            "checkAnswers",
            "submitTest",
            "submittedResultSnapshot=",
            "sectionAudio.",
            "timerId",
            "revealAllListeningStudyGroups",
            "activeEvidence",
            "transcriptFollowingEnabled",
        ):
            self.assertNotIn(forbidden, actions)
        for mode_guard in ("mode==='study'", "mode==='test'", "submittedReview"):
            self.assertNotIn(mode_guard, actions)
        self.assertIn("setupListeningAnnotations();", self.html)

    def test_submitted_answers_stay_locked_while_annotation_buttons_remain_native(self):
        lock_start = self.html.index("function enforceSubmittedReviewAnswerLock")
        lock_end = self.html.index("\n    function ", lock_start + 10)
        lock = self.html[lock_start:lock_end]
        self.assertIn("input, textarea, select", lock)
        self.assertIn("if(el===noteText) return", lock)
        self.assertNotIn("selectionToolbar", lock)
        self.assertNotIn("noteWindow", lock)
        self.assertIn("submittedReview", self.html)

    def test_dom_persistence_matches_reading_and_is_not_promoted_to_reload_storage(self):
        self.assertIn("const notesStore = {}", self.html)
        self.assertNotRegex(
            self.html,
            r"(?:localStorage|sessionStorage)\.(?:getItem|setItem)\([^)]*LISTENING_ANNOTATION",
        )
        for function_name in (
            "switchQuestionSectionWithoutMedia",
            "swapStudyPanes",
            "showResultsSummary",
            "closeResultsSummary",
        ):
            start = self.html.index(f"function {function_name}")
            end = self.html.index("\n    function ", start + 10)
            body = self.html[start:end]
            self.assertNotIn("unwrapAnnotationNodes", body)
            self.assertNotIn("notesStore =", body)
        self.assertIn("LISTENING_ANNOTATION_SCOPE", self.html)

    def test_annotation_activity_never_creates_moves_or_clears_question_marker(self):
        annotations = self.html[
            self.html.index("const LISTENING_ANNOTATION_SCOPE")
            : self.html.index("function fullscreenEnabled")
        ]
        for forbidden in (
            "activeQuestionNumber",
            "activateExactQuestionTarget",
            "clearActiveQuestionTarget",
            "highlightCurrentQuestion",
            "navigateToExactQuestion",
            "questionNumberForAnnotationBoundary",
            "syncQuestionMarkerToAnnotation",
        ):
            self.assertNotIn(forbidden, annotations)
        for annotation_action in (
            "showSelectionToolbarForRange",
            "applyOrRemoveHighlight",
            "createOrEditNote",
            "openNoteEditor",
            "saveCurrentNote",
            "closeNoteEditor",
            "deleteNote",
            "deleteCurrentNote",
        ):
            self.assertIn(f"function {annotation_action}", annotations)

    def test_direct_answers_answer_key_and_footer_keep_singular_marker_navigation(self):
        direct = self.function_body(
            "setupActiveQuestionInteractions", "switchQuestionSectionWithoutMedia"
        )
        self.assertIn("studyQuestionPane.addEventListener('click',identify)", direct)
        self.assertIn("studyQuestionPane.addEventListener('focusin',identify)", direct)
        self.assertIn("questionNumberFromInteractionTarget(event.target)", direct)
        self.assertIn("activateExactQuestionTarget(questionNumber)", direct)
        answer_key = self.function_body("navigateFromAnswerKey", "renderAnswerKey")
        self.assertIn("navigateToExactQuestion(questionNumber,{closeDialog:true})", answer_key)
        footer = self.function_body("jumpToQuestion", "bindInputs")
        self.assertIn("navigateToExactQuestion(q)", footer)
        exact = self.function_body(
            "activateExactQuestionTarget", "questionNumberFromInteractionTarget"
        )
        self.assertIn("clearActiveQuestionTarget()", exact)
        self.assertIn("marker.classList.add('is-active-question-target')", exact)

    def test_audioscript_dom_and_transcript_interactions_remain_annotation_free(self):
        audioscript_markup = self.html[
            self.html.index('<section class="audioscript-panel"')
            : self.html.index(
                "</section>",
                self.html.index('<section class="audioscript-panel"'),
            )
        ]
        for forbidden in (
            "selectionToolbar",
            "noteWindow",
            "note-indicator",
            "data-annotation-id",
            "data-note-id",
        ):
            self.assertNotIn(forbidden, audioscript_markup)
        self.assertIn("function setupTranscriptSeekInteractions()", self.html)
        self.assertIn("transcriptSelectionIsCollapsed()", self.html)
        self.assertIn("pointerGesture.selectionWasCollapsed", self.html)
        self.assertIn("activatePart1TranscriptRow(row)", self.html)
        self.assertIn("is-evidence-phrase", self.html)
        self.assertIn("is-current-phrase", self.html)

    def test_theme_mobile_map_and_matching_safety_contracts_remain_present(self):
        for theme in ("black-on-white", "white-on-black", "yellow-on-black"):
            self.assertIn(theme, self.html)
        self.assertIn("--highlight: #ffcc66", self.html)
        self.assertIn("--highlight: #ffeb3b", self.html)
        self.assertIn("@media (max-width: 560px)", self.html)
        self.assertIn("width: min(340px, calc(100vw - 24px))", self.html)
        self.assertIn(".note-anchor .note-delete", self.html)
        self.assertIn(".map-answer-row > label", self.html)
        self.assertIn("'.drag-slot'", self.html)
        self.assertIn("setupDragMatch()", self.html)
        self.assertIn("setupStudySplitDivider()", self.html)


if __name__ == "__main__":
    unittest.main()
