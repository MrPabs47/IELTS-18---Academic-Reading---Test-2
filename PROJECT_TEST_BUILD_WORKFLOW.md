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
- Use the latest verified IELTS 19 Academic Reading test as the shell when creating new IELTS 19 Academic Reading tests.

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
5. Create the new HTML by copying the stable Reading shell.
6. Replace the title everywhere.
7. Replace passages only.
8. Verify passage titles and full passage bodies are correct.
9. Replace questions and answer keys only.
10. Verify question formatting and answer key.
11. Clean up any duplicated data-q values or non-answer question-blocks.
12. Update index.html only after the test file is correct.

## Reading staged prompts

If a single prompt fails, use these smaller stages:

1. Shell only.
2. Passages only.
3. Questions and answer key only.
4. Formatting cleanup only.
5. Hub activation only.

This staged workflow is preferred when Codex starts copying old master content into the new test.

## Reading formatting lessons learned

- TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN must be normal numbered statements with radio buttons and no bullets.
- Note-completion tasks can use bullet points, headings, and numbers inside answer boxes.
- Summary-completion tasks that appear as a paragraph should use a bordered summary box.
- Summary-completion tasks with a word/phrase bank should have a separate bordered options box below the summary.
- Matching experts or people should use dropdowns showing both letter and name.
- Matching sentence endings should use dropdowns showing both letter and full ending phrase.
- Multiple-choice choose TWO should use checkboxes with a maximum of two selections and either-order scoring.
- Sentence completion normally keeps the visible number before the sentence, but if the answer box already shows the question number and the task is visually note-like, bullet-style lines with the number inside the box are acceptable.
- Non-answer note lines should be plain note lines, not question-blocks with duplicated data-q values.

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
11. The IELTS Pabs logo behaviour is preserved.
12. The hub link opens the correct file.
