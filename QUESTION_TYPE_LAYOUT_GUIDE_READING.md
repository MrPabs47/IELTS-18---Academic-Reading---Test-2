# IELTS Pabs Reading Question Type Layout Guide

This project uses static HTML test pages. All new Reading tests must follow the approved layouts below.

## General rules

1. Use the latest stable Reading test of the same module as the shell: Academic for Academic Reading and General Training for GT Reading. Never use an Academic shell for a GT Reading test. The current stable GT shell should preserve the candidate/name start screen, timer, split panes, bottom navigation, question highlighting, drag/drop matching, summary and note formatting, and option-card layouts.
2. Replace content only. Preserve the stable shell's candidate/name start-screen behaviour. Every new Reading test must keep the name input; Test Mode must require the student name before starting, and Study Mode may start without requiring a name if the stable shell does.
3. Do not summarise, shorten, paraphrase, or invent passage or question wording.
4. Use the exact full text from Passage 1.txt, Passage 2.txt, Passage 3.txt, Questions.txt, and Answers.txt.
5. Before editing HTML, classify Questions 1–40 by question type.
6. Do not copy old passage titles, old questions, old answers, or old answer keys from the master.
7. Every question must have a matching feedback ID:
   Q1 -> ca-1
   Q2 -> ca-2
   ...
   Q40 -> ca-40
8. There must be only one answerKey object.
9. There must be only one correctAnswerText object.
10. Do not create JavaScript that automatically changes question numbers into bullet points.
11. Bullet points must be based on the actual question type and layout, not the question number range.
12. Keep the IELTS Pabs logo behaviour: red hover, hover-triggered blur animation, confirmation home link, pointer cursor on hover, and no text insertion cursor. Recommended CSS: `.logo.home-link { cursor: pointer; user-select: none; }`.
13. Build Reading tests in staged prompts: shell only, passages only, questions and answers only, specific formatting and OCR cleanup, visual smoke check, highlight behaviour check, hub activation, and documentation update only if new issues were found. If old shell content appears, repair in smaller sections. Always inspect actual changed files and actual HTML, not only the PR title or description.
14. GT Reading is organised differently: Section 1 may contain two or more short texts, Section 2 may contain two workplace/practical texts, and Section 3 is usually one longer text. Build GT Reading tests in staged prompts: shell only, passages only, questions and answers only or by section if needed, specific formatting and OCR cleanup, visual smoke check, highlight behaviour check, hub activation, and documentation update only if new problems were found. Do not build a full GT test in one massive pass.


## Passage pane rules for Reading

- Passage panes should focus on the passage title and passage text.
- Do not repeat redundant `Questions...` or `Read the text...` lines if the fixed pane header and question pane already provide that instruction.
- Section 3 should start cleanly with the passage title and paragraph A when the source is paragraph-labelled.
- If a GT section contains two separate texts, clearly separate them in the passage pane with headings, spacing, and divider styling so they do not visually merge. For example, GT Test 1 Section 1 needed clear separation between `Gobridge Tramlink FAQs` and `Adorable Knitwear`, and Section 2 needed clear separation between `How to Become a Great Leader` and `Resigning from a Job in a Professional Manner`.

## Academic Reading build checks

Academic Reading structure:

1. Academic Reading normally has one main passage per section.
2. Do not apply GT mini text separation rules to Academic sections unless the source clearly shows separate texts.
3. Passage 1 should map to Questions 1 to about 13.
4. Passage 2 should map to Questions 14 to about 26.
5. Passage 3 should map to Questions 27 to 40.

Desktop split layout:

1. Before hub activation, verify that `#passagePane`, `#divider`, and `#questionPane` are sibling elements inside `.main-inner`.
2. `#divider` and `#questionPane` must not be nested inside `#passagePane` or `#passageContent`.
3. On desktop width, the passage must appear on the left, questions on the right, and the divider between them.

Completion question layout:

1. Sentence completion must show the question number before the sentence.
2. Sentence completion must not show the question number inside the answer gap.
3. If the shell uses `.inline-input::before` to show `data-q` inside gaps, add a modifier such as `.inline-input.no-gap-number` for sentence-completion gaps.
4. Table, note, and summary completion may keep numbered gaps only when this matches the original visual layout.
5. Before building questions, classify each completion task as sentence completion, table completion, note completion, or summary completion.

Pre-hub visual check:

1. Do not activate the hub until the rendered test page has been checked visually.
2. Confirm the left/right split layout works.
3. Confirm question numbering looks correct.
4. Confirm section switching works.
5. Confirm footer counts are correct.
6. Confirm answer checking still works.
7. Confirm Test mode and Study mode behaviour still work.
8. Confirm full-screen Test mode enforcement still works.
9. Test normal same-paragraph passage highlighting.
10. Test dragging from the end of one passage paragraph into the next paragraph.
11. Confirm the blue selection preview clips at the paragraph boundary if live clipping is implemented.
12. Confirm the final highlight stops at the starting paragraph.
13. Confirm the next paragraph remains separate and unchanged.
14. Test a long question that wraps across two lines.
15. Confirm highlighting within that same question still works.
16. Test dragging from one question into the next question.
17. Confirm it does not create an unsafe highlight across questions.
18. Confirm answer inputs, dropdowns, radio buttons, and feedback still work.

## Reading highlight behaviour

General principle:

1. Highlighting must never damage the Reading test layout.
2. Highlighting must never merge two separate passage paragraphs.
3. Highlighting must never replace multiple paragraphs with one single highlighted span.
4. Highlighting should prioritise safe behaviour over allowing very large multi-block selections.

Passage pane rule:

1. In the passage pane, highlighting should work within one paragraph or safe text block at a time.
2. If the user starts selecting in one passage paragraph and drags into the next paragraph, the live blue selection preview should clip at the end of the starting paragraph when possible.
3. When the user clicks Highlight, the final highlight must also stop at the end of the starting paragraph.
4. The following paragraph must remain unchanged.
5. No alert, toast, warning, or visible message should appear.
6. If the user wants to highlight the next paragraph, they should select that paragraph separately and highlight again.
7. This rule also applies to passage labels or other safe passage text blocks such as headings, table cells, or list items where relevant.

Question pane rule:

1. In the question pane, highlighting may work inside one question, one instruction block, or one safe question text block.
2. If a question is long and wraps over two visual lines, highlighting should still work because it is one question block.
3. Highlighting does not need to work across separate questions.
4. Highlighting does not need to work across separate task blocks.
5. If the user selects from one question into the next question, the highlight should be clipped or blocked safely rather than crossing into the next question.
6. This is acceptable because the question pane contains mixed elements such as instructions, inputs, tables, dropdowns, radio buttons, and feedback areas.
7. The main requirement is that highlighting must not break question layout, inputs, answer checking, or feedback display.

Implementation rule for future tests:

1. Do not use destructive highlight fallbacks that replace a selected range with one span containing `range.toString()`.
2. Do not use a fallback that calls `range.deleteContents()` and `range.insertNode(span)` across multiple paragraphs.
3. Use safe block detection for highlights.
4. Final highlight behaviour should clip to the starting safe block when a selection crosses into another block.
5. Live blue selection clipping is allowed if it does not interfere with normal selection or test functions.
6. Live blue selection clipping must be limited to the relevant pane and must not interfere with text selection in unrelated areas.
7. Use a guard flag if using `selectionchange` so it does not create selectionchange loops.

## Shared form control and navigation rules

- Text inputs, inline inputs, and dropdowns should inherit the page font family and use a font size consistent with the surrounding question text.
- Inline inputs should not look oversized or force awkward line breaks unless the screen is narrow.
- Bottom navigation part chips and counts must stay on one line. Use `white-space: nowrap`, `inline-flex`, suitable spacing, and horizontal overflow for question buttons if needed.
- When a GT section has two texts, the question pane must clearly say which questions belong to which text. Add the heading style `Read “Text title” and answer Questions X to Y.` before each question group linked to a separate GT text.
- The bottom navigation must not wrap labels such as `Part 1` and `0 of 14` onto separate lines. Use `inline-flex`, `white-space: nowrap`, `width: auto`, `flex: 0 0 auto`, and `min-width: max-content` where needed. Question numbers may scroll horizontally if needed.

## TRUE / FALSE / NOT GIVEN

Use for tasks that say:
Do the following statements agree with the information given in Reading Passage X?

Layout:
- Normal question blocks.
- Visible question number before each statement.
- Radio buttons in the cleaner stable layout: options stacked vertically, each option in a clear clickable row/card, comfortable spacing, and the radio button aligned with the label text.
- Values must remain exactly: `TRUE`, `FALSE`, `NOT GIVEN`. Do not use `NG` as a radio value.
- If Answers.txt uses `NG`, normalise answerKey and correctAnswerText to `NOT GIVEN`.
- No bullet points.
- Do not put the question number inside an answer box.

## YES / NO / NOT GIVEN

Use for tasks that say:
Do the following statements agree with the views or claims of the writer?

Layout:
- Normal question blocks.
- Visible question number before each statement.
- Radio buttons in the cleaner stable layout: options stacked vertically, each option in a clear clickable row/card, comfortable spacing, and the radio button aligned with the label text.
- Values must remain exactly: `YES`, `NO`, `NOT GIVEN`. Do not use `NG` as a radio value.
- If Answers.txt uses `NG`, normalise answerKey and correctAnswerText to `NOT GIVEN`.
- No bullet points.
- Do not put the question number inside an answer box.

## Note completion

Use for tasks that say:
Complete the notes below.

Layout:
- Use note-style formatting, not a normal paragraph.
- Keep headings and subheadings from the source.
- If the source note block is bordered, recreate a bordered note box in HTML.
- Main heading and subheadings inside the note box must not be bulleted.
- Use headings, indentation, and bullet-style lines where appropriate.
- Bullet points should sit on the same line as the note text, not float on a separate line. Avoid absolute-positioned bullets if they cause vertical misalignment; flex-row bullet layout is safer.
- Question numbers may appear inside or beside the input for note-completion, but do not duplicate the number in a confusing way.
- Use inline input boxes with data-q.
- Example lesson: GT Test 1 Q22-27 `The best way to resign` needed note-style headings, bullet lines, and aligned bullets.

Example:
• Excavations of rock shelters inside [8 answer box] near the village of Kelo revealed...

Correct HTML style:
<span class="inline-input" data-q="8"><input type="text" name="q8"></span>

## Summary completion without options

Use for tasks that say:
Complete the summary below.
Choose ONE WORD ONLY / NO MORE THAN TWO WORDS from the passage.

Layout:
- Use a bordered summary box if the original task shows the summary inside a bordered box or as a summary paragraph.
- If the source summary has a title, center or clearly emphasise that title at the top of the bordered box.
- Use inline answer boxes.
- Put the question number inside the answer box.
- Keep the summary as connected paragraph-style text; do not split into visually disconnected rows unless the source is actually row-based. Feedback areas must exist but should not disrupt paragraph flow before submission.
- Use bullet points only if the source summary is in note form. Example lessons: Academic Test 4 `Mining the sea floor` and `Contemporary hunter-gatherer societies` needed bordered summary boxes; GT Test 1 `The importance of the ‘face with tears of joy’` needed a cleaner connected summary box.

## Summary completion with options

Use for tasks that say:
Complete the summary using the list of words or phrases below.

Layout:
- Use a bordered summary box.
- Put the title inside the box if the source has a title.
- Use inline dropdowns.
- Show the question number before each dropdown.
- Below the summary, create a separate bordered options box.
- Dropdowns should show both letter and phrase where possible.

## Sentence completion

Use for tasks that say:
Complete the sentences below.

Layout:
- Use a vertical list of separate sentence items.
- Each sentence should have one clear visible question number at the start of the sentence.
- The answer input should sit naturally inside the blank position.
- Do not leave fake underscores plus a separate input below the sentence.
- Do not duplicate the question number inside the input if the sentence already starts with the question number.
- Do not use bullet points unless the original task is clearly note-form.
- Example lesson: GT Test 1 Q15-21 should look like `15. Initially, a leader needs to focus on gaining the [input] of the staff.`

## Matching information to paragraphs

Use for tasks that say:
Which paragraph contains the following information?

Layout:
- Normal numbered question blocks.
- Visible question numbers.
- Dropdowns with paragraph letters.
- Passage paragraph letters must be bold and easy to scan using paragraph-letter.

## Matching headings

Use for tasks where students choose headings for paragraphs.

Layout:
- Show the list of headings clearly, in a bordered option-bank box if the source presents it that way.
- Use dropdowns for each paragraph.
- Dropdowns should show both Roman numeral and heading text. Example lesson: GT Test 1 Q28-32 needed the `List of Headings` clearly formatted.

## Matching people / experts / researchers

Use for tasks that give a list of people or experts.

Layout:
- If the source has a `List of People`, `List of Experts`, or similar bank, render that list in a separate bordered box.
- Keep the numbered matching statements separate and normally numbered.
- Show the full list of people clearly.
- Use dropdowns.
- Dropdowns should show both letter and name. Example lesson: Academic Test 4 Q18-23 needed the `List of People` in a bordered box.

## Matching tasks using passage labels

Use when the original task asks students to match information to labelled reviews, texts, or sections shown in the passage pane.

Layout:
- Make passage labels interactive when useful, so students can drag or click/select labels directly from the passage pane.
- On hover/focus, interactive passage labels should show a dashed/outlined rectangle or similar affordance.
- Keep dropdown or keyboard accessibility as a backup.
- Do not force students to rely only on a repeated option bank if the original task naturally uses labels in the passage.
- Example lesson: for GT Test 1 Q8-14, labels `A Mary-Anne`, `B Davina`, `C Naga`, `D Libby`, and `E Laura` should be draggable/click-selectable from the passage pane.


## Current question highlighting

There must be only one active question highlighted at a time. Highlighting must update when the user clicks a bottom question number, clicks inside a question block, focuses an input, clicks a radio option, focuses a dropdown, or clicks/focuses a drop zone.

Do not rely only on `change` or `input` events. Use a helper such as `setCurrentQuestionFromElement(event.target)` and attach it to `#questionContent` with both `focusin` and `click`. Do not scroll when the user simply clicks inside a question; only bottom question navigation should scroll.

## Answer alternatives from Answers.txt

When Answers.txt indicates alternatives such as habitat(s):

- answerKey must accept both forms, e.g. `10: ["habitat", "habitats"]`
- correctAnswerText must display both forms clearly, e.g. `habitat / habitats`

## Matching sentence endings

Use for tasks that say:
Complete each sentence with the correct ending.

Layout:
- Show endings clearly.
- Use dropdowns.
- Dropdowns should show both letter and full ending phrase.
- Keep the original sentence beginning visible.

## Multiple choice, one answer

Use for tasks that say:
Choose the correct letter, A, B, C or D.

Layout:
- Normal question block.
- Visible question number.
- Full question text.
- Radio buttons in clear clickable row/card styling, not plain labels separated only by line breaks or `<br>` tags.
- Show the full option text.
- Add comfortable spacing between multiple-choice questions.

## Multiple choice, choose TWO

Use for tasks that say:
Choose TWO letters.

Layout:
- Checkbox-style options in clear clickable row/card styling, not plain labels separated only by line breaks or `<br>` tags.
- Students can select a maximum of two options.
- If two options are already selected and the student clicks a third, prevent the third selection.
- Students can untick and change their answers.
- Score answers in either order.
- Count one selected option as one answered question and two selected options as two answered questions.

## Submit confirmation behaviour

All visible primary submit/check buttons in Reading tests must call a submit wrapper such as `handlePrimarySubmit()`, not `submitTest()` directly. `submitTest()` may remain the internal scoring/results function.

Required behaviour:

1. In Test mode, clicking any primary submit/check button must show one confirmation message before final submission.
2. The confirmation message should warn that the student will not be able to continue answering in Test mode.
3. If the user cancels, the test must remain active and no answers should be checked.
4. If the user confirms, `submitTest()` should run.
5. In Study mode, `handlePrimarySubmit()` may check answers directly without confirmation.
6. There must not be duplicate confirmation messages.
7. All visible submit/check buttons must use the wrapper, including the options menu submit button, bottom navigation check/submit button, and any other primary submit/check button.

Recommended implementation pattern:

```js
function confirmSubmit() {
  const ok = window.confirm("Are you sure you want to submit your test now? You will not be able to continue answering in Test mode.");
  if (!ok) return;
  submitTest();
}

function handlePrimarySubmit() {
  if (mode === "test" && !testSubmitted) {
    confirmSubmit();
    return;
  }
  submitTest();
}
```

Required button pattern: `onclick="handlePrimarySubmit()"`

Forbidden pattern for primary submit/check buttons: `onclick="submitTest()"`

## Full-screen Test mode enforcement

All new IELTS Pabs tests must preserve the stable shell's full-screen Test mode behaviour. This applies project-wide to Reading, Listening, and future test types. Study mode must remain usable without full screen.

Required behaviour:

1. After the student enters their name and starts a Test mode attempt, the test must attempt to enter browser full screen.
2. Study mode must not require or enforce full screen.
3. If full screen is supported and entered successfully, enforcement must remain active throughout the running Test mode attempt.
4. If the student exits full screen during an active Test mode attempt, pause the timer and show a lock overlay.
5. The lock overlay must ask the student to return to full screen before continuing.
6. Returning to full screen must hide the lock overlay and resume the timer.
7. If full screen is unsupported or the browser blocks the request, show a clear note that full-screen enforcement is limited on that device.
8. The results screen must show full-screen exits, tab switches / focus losses, and total time when submitted.
9. Once the test is submitted, full-screen enforcement must stop.
10. The timer must never run twice, continue behind the lock overlay, or create duplicate intervals when full screen resumes.
11. The full-screen lock overlay must never appear in Study mode.
12. Full-screen enforcement must preserve the approved submit flow: do not remove or bypass `handlePrimarySubmit()`.

Required UI elements:

- `fullscreenSupportNote` on the Test mode name/start screen.
- `fullscreenBtn` and `fullscreenBtnLabel` in the top bar.
- `fullscreenLockOverlay` with a **Return to full screen** button.
- `fullscreenLockPanel`, styled for readability and hidden by default with its overlay.
- Results fields for full-screen exits, focus losses, and total time.

Required JavaScript pattern:

- `beginTimedTest()` must attempt full screen before starting the timed Test mode attempt.
- A `fullscreenchange` listener must detect exits during active Test mode.
- Leaving full screen during active Test mode must pause the timer and show `fullscreenLockOverlay`.
- Returning to full screen must hide the overlay and resume the timer without starting a duplicate interval.
- `submitTest()` must mark the test submitted and stop full-screen enforcement.
- Do not remove or bypass `handlePrimarySubmit()`; submit confirmation must still work correctly while enforcement is active.

For Listening tests, preserve the stable shell's audio rule as well: leaving full screen pauses the timed attempt and locks the interface, but must not stop the sequential Test mode audio.

## Forbidden pattern

Do not use or call functions like:
convertGapFillNumbersToBullets()

Bullet points must be added directly only to the specific note-completion or summary items that need them.


## Codex restricted-file verification

When a prompt restricts edits to specific files, run `git diff --name-only` before finishing. If any file outside the allowed list changed, revert those extra files before committing. Include the exact `git diff --name-only` output in the final report; do not rely on summaries that claim only one file changed.

## Final Reading verification checklist

Before finishing any new Reading test:
1. Check every passage title is from the new test.
2. Check old master passage titles are gone.
3. Check every question is from the new test.
4. Check old master questions are gone.
5. Check answerKey uses the new Answers.txt.
6. Check correctAnswerText uses the new Answers.txt.
7. Check no duplicate answerKey or correctAnswerText exists.
8. Check every ca-1 to ca-40 exists.
9. Check T/F/NG and Y/N/NG questions have normal numbers and no bullets.
10. Check note-completion questions have bullets only when appropriate.
11. Check answer boxes have numbers inside only for note/summary style tasks.
12. Check sentence-completion questions keep normal visible question numbers.
13. Confirm Test mode asks for confirmation before submitting.
14. Confirm cancelling keeps the test active and no answers are checked.
15. Confirm confirming submits and shows results.
16. Confirm Study mode still checks answers normally.
17. Confirm no primary submit/check button calls `submitTest()` directly.
18. Confirm all primary submit/check buttons call `handlePrimarySubmit()` or the current approved wrapper.
19. Check the IELTS Pabs logo still has red hover, hover blur animation, and confirmation home link.
20. Check the hub link opens the correct new test.
21. During formatting cleanup, quickly check HTML nesting around `#questionPane`, `#questionContent`, `#selectionToolbar`, and bottom navigation; remove only clearly misplaced closing tags.
22. Do not create duplicate sections, duplicate answerKey or correctAnswerText objects, or duplicate ca-1 to ca-40 IDs.
23. Hub activation should ideally change only index.html. Formatting cleanup should ideally change only the relevant test HTML file. If hub activation also touches a test HTML file, inspect it afterwards to ensure it did not overwrite formatting or content.
24. Confirm the correct key and path exist in the correct hub category; for IELTS 19 GT Reading Test 1, key `19-1` belongs under General Training Reading.
25. After every merge, inspect the actual changed files, browser title, visible header, candidate/name screen, question groups, answerKey, correctAnswerText, ca-1 to ca-40, and index.html only during hub activation. Do not trust PR titles or summaries.
26. Confirm Test mode attempts full screen at start.
27. Confirm leaving full screen pauses the test.
28. Confirm **Return to full screen** resumes the test.
29. Confirm Study mode does not enforce full screen.
30. Confirm results show full-screen exits, focus losses, and total time.
31. Confirm the timer does not duplicate or continue running behind the lock overlay.
32. Confirm submit confirmation still works with full-screen enforcement.
33. Confirm `#fullscreenLockOverlay` is hidden by default.
34. Confirm `#fullscreenLockPanel` is styled and readable.
