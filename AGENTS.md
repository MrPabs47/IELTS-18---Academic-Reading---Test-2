# IELTS Pabs project instructions

This repo contains standalone IELTS practice HTML files for Reading, Listening, and future Writing tests.

## Core project rules

1. Preserve the existing standalone HTML / GitHub Pages architecture.
2. Do not convert the project to React, Vite, Next, npm, or any build system unless explicitly requested.
3. Do not introduce external libraries or dependencies.
4. Keep each test self-contained in one HTML file unless explicitly asked otherwise.
5. Reuse the latest stable test page as the shell and replace only test-specific content.
6. Make the smallest safe changes possible.
7. Preserve current scoring, review, navigation, answer checking, timer, full-screen, theme, text-size, and IELTS Pabs logo behaviours.
8. Do not rewrite working sections unnecessarily.
9. If a requirement is unclear, prefer a minimal safe implementation and report what was left unchanged.
10. Do not use copyrighted source websites as the source of truth when local source files are available. Use the uploaded txt/image/audio files in the relevant test folder.

## Required guides

Before creating or modifying any Reading test, read and follow:

- QUESTION_TYPE_LAYOUT_GUIDE_READING.md
- PROJECT_TEST_BUILD_WORKFLOW.md

Before creating or modifying any Listening test, read and follow:

- QUESTION_TYPE_LAYOUT_GUIDE_LISTENING.md
- PROJECT_TEST_BUILD_WORKFLOW.md

## Required workflow for new Reading tests

1. Use the latest stable Reading test of the same module as the shell: Academic for Academic Reading, GT for General Training Reading. Never use an Academic shell for a GT Reading test.
2. Preserve the candidate/name start-screen behaviour from the stable shell. Test Mode should require the student name if stable tests do this; Study Mode may skip the name field if that is how the shell works.
3. Classify Questions 1-40 by question type before editing the HTML.
4. Build in staged prompts rather than one massive pass: shell only, passages only, questions and answers only, formatting cleanup only, hub activation only, then documentation update only if new issues were found.
5. Replace passages first, using the exact full text from Passage 1.txt, Passage 2.txt, and Passage 3.txt.
6. Replace questions and answer keys separately if the test is complex.
7. Do not summarise, shorten, paraphrase, or invent passage/question wording.
8. Do not copy old passage bodies, old question blocks, old answers, or old answer keys from the master shell. If old shell content appears, repair in smaller sections, such as Section 1 only, Section 2 only, then Section 3 only.
9. Confirm old master titles and old master question phrases are gone. Do not trust the PR title or description; inspect the actual changed files and actual HTML.
10. Confirm there is only one answerKey object and only one correctAnswerText object.
11. Confirm every question has a matching feedback ID from ca-1 to ca-40.
12. Update index.html only after the test itself is correct.

## Required workflow for new Listening tests

1. Use the latest stable Listening test as the shell.
2. Classify Questions 1-40 by question type before editing the HTML.
3. Replace question content and answer keys using Questions.txt and Answers.txt.
4. Replace audio paths using the four MP3 files uploaded for the test.
5. In Test Mode, audio starts when the student clicks “Start the test now”, then plays Part 1 to Part 4 sequentially.
6. In Test Mode, the audio player should be hidden until after submission.
7. In Study Mode, the relevant audio player should be available for the selected part.
8. Students must be able to move between sections while audio is playing.
9. If full screen is exited, show the warning but do not stop the audio.
10. Update index.html only after the test itself is correct.

## Known pitfalls to avoid

1. Do not only change passage titles. The full passage bodies must also be replaced.
2. Do not only replace some question sections. Confirm all required question sections are replaced.
3. Do not create or call JavaScript functions that automatically convert question numbers into bullets based on a number range.
4. Do not use or call functions like convertGapFillNumbersToBullets().
5. Bullet points must be added directly only to note-completion, form-completion, table-completion, or summary-style lines that need them.
6. TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN tasks must keep normal visible numbers and no bullets.
7. If answer boxes display the question number inside the box, do not also show a visible question number before the sentence.
8. Non-answer note lines must not be given duplicate data-q values or feedback IDs.
9. Never use “Accept both changes” in a merge conflict unless the duplicated sections have been checked manually.
10. If a generated file becomes contaminated by old test content, prefer a staged repair: passages only, then questions/answers only, then hub only.
11. If Answers.txt contains alternatives like habitat(s), store accepted answers as an array in answerKey (e.g., `10: ["habitat", "habitats"]`) and show both forms in correctAnswerText (e.g., `habitat / habitats`).
12. If a note-completion or summary-completion task is shown in a bordered box in the source, recreate that bordered box in HTML with matching visual structure.
13. In note-completion boxes, headings/subheadings should not be bullet points; only actual note lines should use bullets.
14. In matching people/experts tasks, keep numbered statements separate and add a clearly bordered “List of People/Experts” option bank when shown in source.
15. During formatting cleanup, quickly validate HTML nesting around `#questionPane`, `#questionContent`, `#selectionToolbar`, and bottom navigation, removing only clearly misplaced closing tags.
16. Stage discipline: hub activation should ideally edit only `index.html`; formatting cleanup should ideally edit only the relevant test HTML file. If a hub activation PR touches a test HTML file, re-check that test for accidental content/format overwrites.
17. GT Reading sections have different organisation: Section 1 may contain two or more short texts, Section 2 may contain two workplace/practical texts, and Section 3 is usually one longer text. Clearly separate multiple GT texts with headings, spacing, and divider styling so texts such as `Gobridge Tramlink FAQs` / `Adorable Knitwear` or `How to Become a Great Leader` / `Resigning from a Job in a Professional Manner` do not visually merge.
18. Passage panes should focus on passage titles and passage text. Do not repeat redundant `Questions...` or `Read the text...` instructions when the fixed pane header and question pane already provide them, especially before Section 3 paragraph A.
19. If matching tasks use labelled reviews/texts/sections in the passage pane, make the passage labels interactive when useful, with hover/focus affordance and dropdown or keyboard backup, rather than forcing only a repeated option bank.
20. Sentence completion is not summary completion: use separate vertical sentence items with one visible number, an inline input at the blank, no fake underscores plus separate input, and no duplicated number inside the input.
21. Summary completion should stay connected paragraph-style, normally in a bordered summary box when the source shows one, with a centred or emphasised title and feedback areas that do not disrupt the paragraph before submission.
22. Note completion should look like notes with headings, indentation, aligned bullet-style lines, and bordered note boxes when the source shows one; avoid absolute-positioned bullets that misalign vertically.
23. Recreate bordered option-bank boxes for `List of People`, `List of Headings`, `List of Experts`, or similar source banks, while keeping numbered matching statements separate.
24. TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, and multiple-choice options should use the cleaner stable stacked clickable row/card layout, with exact scoring values such as `TRUE`, `FALSE`, `NOT GIVEN`, `YES`, and `NO`; normalise `NG` in Answers.txt to `NOT GIVEN`.
25. Text inputs, inline inputs, and dropdowns should inherit the page font family and use a font size consistent with surrounding question text.
26. Bottom navigation part chips and counts must stay on one line using nowrap/inline-flex spacing and horizontal overflow where needed.
27. The IELTS Pabs logo/home link should use `cursor: pointer;` and `user-select: none;` so it does not show a text insertion cursor.
28. During hub activation verification, confirm the correct key and path are in the correct category, for example IELTS 19 GT Reading Test 1 uses key `19-1` under General Training Reading.

## IELTS Pabs logo behaviour

All current and future tests should keep the IELTS Pabs logo behaviour:

1. Logo at the top-left.
2. Red hover colour: #e31837.
3. Hover-triggered blur-from-bottom letter animation.
4. Reduced-motion fallback.
5. Click asks for confirmation before returning to the hub.
6. The logo animation must not affect the timer, audio, section navigation, answer checking, or layout size.
