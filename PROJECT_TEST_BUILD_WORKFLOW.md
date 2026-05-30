# IELTS Pabs test build workflow

This file records the project-wide workflow for creating new IELTS Reading and Listening tests. It exists so future chats and Codex runs can continue from the same rules.

## Project architecture

- The site is a static GitHub Pages project.
- Tests are standalone HTML files.
- Do not convert the project to React, Vite, Next, npm, or any other build system unless explicitly requested.
- Do not install packages or create package.json.
- Keep the test pages self-contained.

## Current stable approach

For new tests, use the latest stable test of the same type as the shell, but replace content in stages.

Recommended Reading shell:
- Use the latest verified stable Academic Reading test as the shell when creating Academic Reading tests.
- Use the latest verified stable General Training Reading test as the shell when creating GT Reading tests; never use an Academic shell. The stable GT shell should preserve the candidate/name start screen, timer, split panes, bottom navigation, question highlighting, drag/drop matching, summary and note formatting, and option-card layouts.
- Never use an Academic Reading shell for a GT Reading test. GT Reading has a different organisation: Section 1 may contain two or more short texts, Section 2 may contain two workplace/practical texts, and Section 3 is usually one longer text.

Recommended Listening shell:
- Use the latest verified IELTS 16 Listening test as the shell until a newer stable Listening test is created.

## Reading build workflow

Use this order for new Academic or GT Reading tests:

1. Confirm the test folder exists.
2. Confirm the source files are uploaded:
   - Passage 1.txt
   - Passage 2.txt
   - Passage 3.txt
   - Questions.txt
   - Answers.txt
3. Read QUESTION_TYPE_LAYOUT_GUIDE_READING.md.
4. Classify Questions 1-40 by question type before writing HTML.
5. Create the new HTML by copying the stable Reading shell of the same module: Academic shell for Academic tests, GT shell for General Training tests.
6. Preserve the candidate/name start-screen behaviour from the stable shell. Every new Reading test must keep the name input; Test Mode must require the student name before starting, while Study Mode may start without requiring a name if the stable shell does.
7. Replace the title everywhere.
8. Replace passages only. For GT sections with two separate texts, clearly separate Text 1 and Text 2 with headings, spacing, and divider styling.
9. Verify passage titles and full passage bodies are correct. Remove redundant passage-pane `Questions...` or `Read the text...` instructions when the fixed pane header and question pane already provide them.
10. Replace questions and answer keys only. For GT sections with two separate texts, add a clear question-group heading before each linked group using the style: `Read “Text title” and answer Questions X to Y.`
11. Verify question formatting and answer key. Normalise Answers.txt `NG` to `NOT GIVEN` for TRUE/FALSE/NOT GIVEN or YES/NO/NOT GIVEN scoring values.
12. Clean up any duplicated data-q values or non-answer question-blocks.
13. Update index.html only after the test file is correct.

## Reading staged prompts

If a single prompt fails, use these smaller stages:

1. Shell only.
2. Passages only.
3. Questions and answers by section if needed.
4. Formatting cleanup only.
5. Hub activation only.
6. Documentation update only if new problems were found.

This staged workflow is preferred for all new Reading builds and required for all GT Reading builds and whenever Codex starts copying old master content into the new test. Do not build or replace a whole GT test in one massive pass. If old shell content appears, repair in smaller sections, such as Section 1 only, Section 2 only, then Section 3 only. Do not trust the PR title or description; always inspect the actual changed files and actual HTML.

## Reading formatting lessons learned

- TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN must be normal numbered statements with radio buttons and no bullets. Use stacked clickable row/card options with comfortable spacing, and keep values exactly as scoring expects: `TRUE`, `FALSE`, `NOT GIVEN`, `YES`, and `NO`.
- Note-completion tasks should look like notes, not normal paragraphs. Use headings, indentation, aligned bullet-style lines, and numbers inside or beside answer boxes without confusing duplication. Bullets must sit on the same line as the note text; flex-row bullet layout is safer than absolute-positioned bullets.
- If the source note-completion block is inside a bordered box, recreate that bordered box in HTML.
- In note-completion blocks, headings/subheadings must not be bulleted; only actual note items should use bullet points.
- Summary-completion tasks that appear as a paragraph should remain connected paragraph-style text with inline inputs and use a bordered summary box when the source shows one. Keep feedback elements grouped so they do not disrupt the paragraph flow.
- If the source summary has a title (e.g., "Mining the sea floor", "Contemporary hunter-gatherer societies"), center that title at the top of the bordered summary box.
- Keep summary-completion text visually connected as paragraph-style content; do not split into disconnected rows unless the source is truly row-based.
- Summary-completion tasks with a word/phrase bank should have a separate bordered options box below the summary.
- Matching experts or people should use dropdowns showing both letter and name. If the original task asks students to match information to labelled reviews/texts/sections shown in the passage pane, make those passage labels interactive when useful with dashed/outlined hover/focus affordance and keyboard/dropdown backup.
- When the source includes a `List of People`, `List of Headings`, `List of Experts`, or similar option bank, render it in a separate bordered box and keep the numbered statements as normal numbered items.
- Matching sentence endings should use dropdowns showing both letter and full ending phrase.
- Multiple-choice options should use clear clickable row/card styling, not plain labels separated only by `<br>` tags. Choose TWO should use checkboxes with a maximum of two selections and either-order scoring.
- Sentence completion is not summary completion. Use a vertical list of separate sentence items, one visible number at the sentence start, and an inline input at the blank. Do not leave fake underscores plus a separate input below the sentence, and do not duplicate the number inside the input if the sentence already starts with the number.
- Non-answer note lines should be plain note lines, not question-blocks with duplicated data-q values.
- If Answers.txt indicates alternatives such as habitat(s), answerKey should accept both forms via array (e.g., `["habitat","habitats"]`) and correctAnswerText should display both clearly (`habitat / habitats`).
- For GT sections with multiple texts, use clear headings, spacing, and divider styling so separate texts do not visually merge, e.g. `Gobridge Tramlink FAQs` / `Adorable Knitwear` or `How to Become a Great Leader` / `Resigning from a Job in a Professional Manner`.
- Passage panes should focus on passage title and passage text, not duplicate `Questions...` or `Read the text...` instructions already supplied by the fixed pane header or question pane.
- Text inputs, inline inputs, and dropdowns should inherit the page font family and use font size consistent with surrounding question text.
- Current-question highlighting must have only one active question at a time and update on bottom question-number clicks, clicks inside a question block, input focus, radio option clicks, dropdown focus, and drop-zone click/focus. Attach a helper such as `setCurrentQuestionFromElement(event.target)` to `#questionContent` using `focusin` and `click`; do not scroll on ordinary question clicks, only on bottom navigation.
- Bottom navigation part chips and counts must stay on one line. Use `inline-flex`, `white-space: nowrap`, `width: auto`, `flex: 0 0 auto`, and `min-width: max-content` where needed; question numbers may scroll horizontally, but never allow labels such as `Part 1` and `0 of 14` to split onto two lines.
- The IELTS Pabs logo/home link should use pointer cursor behaviour, e.g. `.logo.home-link { cursor: pointer; user-select: none; }`.


## Forbidden Reading pattern

Do not create or call JavaScript that changes question numbers into bullet points based on a hard-coded question range.

Do not use or call:

```js
convertGapFillNumbersToBullets();
```

Bullet points must be written directly in the HTML only for the relevant note/summary items.

## Listening build workflow

Use this order for new Listening tests:

1. Confirm the test folder exists.
2. Confirm the source files are uploaded:
   - Questions.txt
   - Answers.txt
   - four MP3 files
   - images/screenshots only when needed for maps, plans, diagrams, or special layouts
3. Read QUESTION_TYPE_LAYOUT_GUIDE_LISTENING.md.
4. Classify Questions 1-40 by question type before writing HTML.
5. Copy the stable Listening shell.
6. Replace title, question content, answer key, and audio paths.
7. Confirm audio behaviour:
   - Test Mode starts Part 1 when the timed test starts.
   - Audio continues automatically from Part 1 to Part 4.
   - Audio player is hidden in Test Mode until submission.
   - Study Mode shows the selected part’s audio player.
   - Students can move between sections while audio plays.
8. Confirm bottom navigation shows only the selected part’s question numbers.
9. Update index.html only after the Listening test works.

## Listening formatting lessons learned

- For form completion, use a clean table/form style and put question numbers inside answer boxes.
- For map/plan tasks, use cropped images when possible and place the image and questions/options side by side when there is space.
- For choose TWO questions, limit to two selections.
- For matching questions, show both letter and full option text in dropdowns.
- For tables and flow charts, preserve the original visual logic rather than turning everything into separate rows.

## Submit confirmation standard

All IELTS Pabs tests must route visible primary submit/check buttons through a submit wrapper such as `handlePrimarySubmit()`. Do not wire primary buttons directly to `submitTest()`. `submitTest()` can remain the internal scoring and results function, but the visible button click path must go through the wrapper.

Required behaviour:

1. In Test mode, clicking any primary submit/check button shows one confirmation message before final submission.
2. The confirmation message warns that the student will not be able to continue answering in Test mode.
3. If the user cancels, the test remains active and no answers are checked.
4. If the user confirms, `submitTest()` runs.
5. In Study mode, `handlePrimarySubmit()` may check answers directly without confirmation.
6. There must not be duplicate confirmation messages.
7. All visible submit/check buttons use the wrapper, including:
   - Options menu submit button
   - Bottom navigation check/submit button
   - Any other primary submit/check button in Reading or Listening tests

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

## IELTS Pabs logo standard

All test pages should keep the same logo behaviour:

1. Top-left IELTS Pabs logo.
2. Hover colour: #e31837.
3. Hover-triggered blur-from-bottom animation.
4. Reduced-motion fallback.
5. Click asks for confirmation before returning to the hub.
6. The logo animation must not affect the timer, audio, answer checking, section switching, or layout size.

## Conflict rules

- Avoid Accept both changes in GitHub conflicts.
- Accept both often causes duplicated sections, duplicated answerKey blocks, and broken layouts.
- If conflicts appear, inspect which side has the current intended version before resolving.
- If unsure, stop and ask before merging.


## Codex restricted-file verification

Every prompt that restricts edits to a file list must finish with this discipline:

1. Run `git diff --name-only` before committing.
2. If any file outside the allowed file list changed, revert those extra files before committing.
3. Include the exact `git diff --name-only` output in the final report.

Do not rely on summaries that claim only one file changed; inspect the actual changed file list after every merge.

## Final verification checklist for every new test

1. Correct title appears in the browser title, header, and results overlay.
2. All old master passage titles are gone.
3. All old master question phrases are gone.
4. All passages/questions come from the new test source files.
5. answerKey and correctAnswerText are from the new Answers.txt.
6. There is only one answerKey object.
7. There is only one correctAnswerText object.
8. ca-1 to ca-40 all exist.
9. Section switching works.
10. Bottom navigation counts are correct.
11. Test mode asks for confirmation before submitting.
12. Cancelling the submit confirmation keeps the test active and does not check answers.
13. Confirming the submit confirmation submits and shows results.
14. Study mode still checks answers normally.
15. No primary submit/check button calls `submitTest()` directly.
16. All primary submit/check buttons call `handlePrimarySubmit()` or the current approved wrapper.
17. The IELTS Pabs logo behaviour is preserved.
18. The hub link opens the correct file.
19. For formatting cleanup stage, verify HTML nesting around `#questionPane`, `#questionContent`, `#selectionToolbar`, and bottom nav is valid (fix only clearly wrong closing tags).
20. For staged workflow discipline, hub activation should ideally touch only `index.html`, while formatting cleanup should ideally touch only the target test HTML file. If hub activation touches a test HTML file, inspect it afterwards to confirm formatting and content were not overwritten.
21. Confirm the correct hub key and path exist in the correct category; for IELTS 19 GT Reading Test 1, the key is `19-1` under General Training Reading.
22. Do not create duplicate sections, duplicate answerKey or correctAnswerText objects, or duplicate ca-1 to ca-40 IDs.
23. After every merge, inspect the actual changed files, browser title, visible header, candidate/name screen, question groups, answerKey, correctAnswerText, ca-1 to ca-40, and `index.html` only during hub activation. Do not trust PR titles or summaries.
