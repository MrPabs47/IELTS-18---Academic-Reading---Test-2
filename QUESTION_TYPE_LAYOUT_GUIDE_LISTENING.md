# IELTS Pabs Listening Question Type Layout Guide

This project uses static HTML Listening test pages with local MP3 files. All new Listening tests must follow the approved layouts below.

## General rules

1. Use the latest stable Listening test as the shell.
2. Replace content only.
3. Do not summarise, shorten, paraphrase, or invent question wording.
4. Use the exact full text from Questions.txt and Answers.txt.
5. Before editing HTML, classify Questions 1–40 by question type.
6. Use the four uploaded MP3 files as the audio source.
7. Do not copy old questions, old answers, old audio paths, or old answer keys from the master.
8. Every question must have a matching feedback ID:
   Q1 -> ca-1
   Q2 -> ca-2
   ...
   Q40 -> ca-40
9. There must be only one answerKey object.
10. There must be only one correctAnswerText object.
11. Keep the IELTS Pabs logo behaviour: red hover, hover-triggered blur animation, and confirmation home link.

## Listening test structure

A Listening test has four parts:
- Part 1: Questions 1–10
- Part 2: Questions 11–20
- Part 3: Questions 21–30
- Part 4: Questions 31–40

The bottom navigation should show only the question numbers for the selected part to avoid crowding.

## Audio behaviour

Test Mode:
- Audio starts when the student clicks “Start the test now”.
- Audio should play from Part 1 to Part 4 sequentially.
- When one audio file ends, the next part should start automatically.
- Students should still be able to click between sections while audio plays.
- Do not show the audio player during the test.
- If students leave full screen, show the full-screen warning, but do not stop the audio.

Study Mode:
- Show the audio player for the selected part.
- When students move to another part, show the audio player for that part.
- Students can replay audio freely in Study Mode.

After submission:
- Audio controls may be shown so students can review.

## Form completion

Use for tasks with forms, booking details, names, phone numbers, dates, prices, addresses, etc.

Layout:
- Use a clean form/table style.
- Keep labels on the left and answer boxes on the right where possible.
- Put the question number inside the answer box.
- Use inline text inputs.
- Do not use bullet points unless the original form uses bullets.

## Note completion

Use for tasks that say:
Complete the notes below.

Layout:
- Use note-style formatting.
- Keep headings and subheadings.
- Use bullet points where the notes naturally list points.
- Put the question number inside the answer box.
- Do not show an extra visible number before the sentence.

## Table completion

Use for tasks shown as a table.

Layout:
- Recreate the table in HTML.
- Keep row and column headings.
- Put the answer boxes inside the relevant table cells.
- Put the question number inside the answer box.
- Avoid breaking the table into separate question blocks unless screen size requires it.

## Flow-chart completion

Use for process or sequence tasks.

Layout:
- Use a vertical or simple flow-chart style.
- Preserve arrows or sequence markers if possible.
- Put the question number inside the answer box.
- Keep the layout readable on the right pane.

## Sentence completion

Use for tasks that say:
Complete the sentences below.

Layout:
- Normal numbered question blocks.
- Visible question number before each sentence.
- Inline answer box at the blank.
- Do not use bullets unless the source task is note-style.

## Multiple choice, one answer

Use for tasks that say:
Choose the correct letter, A, B or C.

Layout:
- Normal question block.
- Visible question number.
- Full question text.
- Radio buttons.
- Show the full option text.

## Multiple choice, choose TWO

Use for tasks that say:
Choose TWO letters.

Layout:
- Checkbox-style options.
- Students can select a maximum of two options.
- If two options are already selected and the student clicks a third, prevent the third selection.
- Students can untick and change their answers.
- Score answers in either order.
- Count one selected option as one answered question and two selected options as two answered questions.

## Matching

Use for tasks where students match questions to options, people, places, opinions, or categories.

Layout:
- Show the option list clearly above or beside the questions.
- Use dropdowns.
- Dropdowns should show both letter and full option text where possible.
- If there is enough horizontal space, place the options beside the question list.

## Map / plan / diagram labelling

Use when the task includes a map, floor plan, diagram, or picture.

Layout:
- Use the provided image.
- If the uploaded screenshot includes extra question text around the image, use a cropped image where possible.
- Place the image on the left side of the question area and the questions/options on the right if space allows.
- Students should be able to see the map and the options/questions without excessive scrolling.
- Use dropdowns or labelled answer boxes depending on the source task.
- Do not stretch the image in a way that makes labels hard to read.

## Labelling with options

Use when students label a map/diagram using a list of options.

Layout:
- Show all options clearly.
- Use dropdowns with both letter and phrase where possible.
- If the task works better visually, use draggable labels only if the master Listening file already supports that interaction reliably.

## Short-answer questions

Use for tasks that require one or more words/numbers.

Layout:
- Normal numbered question blocks.
- Visible question number before the prompt.
- Text input answer box.
- Follow the word limit exactly.

## Submit confirmation behaviour

All visible primary submit/check buttons in Listening tests must call a submit wrapper such as `handlePrimarySubmit()`, not `submitTest()` directly. `submitTest()` may remain the internal scoring/results function.

Required behaviour:

1. In Test mode, clicking any primary submit/check button must show one confirmation message before final submission.
2. The confirmation message should warn that the student will not be able to continue answering in Test mode.
3. If the user cancels, the test must remain active, audio behaviour should continue as before, and no answers should be checked.
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

## Answer key rules

- Use Answers.txt as the source of truth.
- Accept spelling variants only when Answers.txt gives them.
- Accept number/word variants when Answers.txt gives them, for example:
  ten / 10
- For slash alternatives, include all acceptable variants in answerKey.
- For paired answers, score either order when the test allows it.

## Final Listening verification checklist

Before finishing any new Listening test:
1. Check the test title is correct.
2. Check all questions are from the new test.
3. Check old master questions are gone.
4. Check audio paths point to the new test’s MP3 files.
5. Check Part 1 audio starts when the timed test starts.
6. Check audio continues automatically from Part 1 to Part 4.
7. Check students can move between sections while audio plays.
8. Check Study Mode shows the selected section’s audio player.
9. Check the bottom navigation only shows the selected part’s question numbers.
10. Check answerKey uses the new Answers.txt.
11. Check correctAnswerText uses the new Answers.txt.
12. Check no duplicate answerKey or correctAnswerText exists.
13. Check every ca-1 to ca-40 exists.
14. Check choose-two questions are limited to two selections.
15. Check map/diagram tasks show the visual and questions clearly.
16. Confirm Test mode asks for confirmation before submitting.
17. Confirm cancelling keeps the test active and no answers are checked.
18. Confirm confirming submits and shows results.
19. Confirm Study mode still checks answers normally.
20. Confirm no primary submit/check button calls `submitTest()` directly.
21. Confirm all primary submit/check buttons call `handlePrimarySubmit()` or the current approved wrapper.
22. Check the IELTS Pabs logo still has red hover, hover blur animation, and confirmation home link.
23. Check the hub link opens the correct new test.
