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

1. Use the latest stable Reading test as the shell.
2. Classify Questions 1-40 by question type before editing the HTML.
3. Replace passages first, using the exact full text from Passage 1.txt, Passage 2.txt, and Passage 3.txt.
4. Replace questions and answer keys separately if the test is complex.
5. Do not summarise, shorten, paraphrase, or invent passage/question wording.
6. Do not copy old passage bodies, old question blocks, old answers, or old answer keys from the master shell.
7. Confirm old master titles and old master question phrases are gone.
8. Confirm there is only one answerKey object and only one correctAnswerText object.
9. Confirm every question has a matching feedback ID from ca-1 to ca-40.
10. Update index.html only after the test itself is correct.

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

## IELTS Pabs logo behaviour

All current and future tests should keep the IELTS Pabs logo behaviour:

1. Logo at the top-left.
2. Red hover colour: #e31837.
3. Hover-triggered blur-from-bottom letter animation.
4. Reduced-motion fallback.
5. Click asks for confirmation before returning to the hub.
6. The logo animation must not affect the timer, audio, section navigation, answer checking, or layout size.
