# IELTS Pabs Reading Question Type Layout Guide

This project uses static HTML test pages. All new Reading tests must follow the approved layouts below.

## General rules

1. Use the latest stable Reading test as the shell.
2. Replace content only.
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
12. Keep the IELTS Pabs logo behaviour: red hover, hover-triggered blur animation, and confirmation home link.

## TRUE / FALSE / NOT GIVEN

Use for tasks that say:
Do the following statements agree with the information given in Reading Passage X?

Layout:
- Normal question blocks.
- Visible question number before each statement.
- Radio buttons:
  TRUE
  FALSE
  NOT GIVEN
- No bullet points.
- Do not put the question number inside an answer box.

## YES / NO / NOT GIVEN

Use for tasks that say:
Do the following statements agree with the views or claims of the writer?

Layout:
- Normal question blocks.
- Visible question number before each statement.
- Radio buttons:
  YES
  NO
  NOT GIVEN
- No bullet points.
- Do not put the question number inside an answer box.

## Note completion

Use for tasks that say:
Complete the notes below.

Layout:
- Use note-style formatting.
- Keep headings and subheadings from the source.
- If the source note block is bordered, recreate a bordered note box in HTML.
- Main heading and subheadings inside the note box must not be bulleted.
- Use bullet points where the notes naturally list points.
- Put the question number inside the answer box.
- Do not show an extra visible number before the sentence.
- Use inline input boxes with data-q.

Example:
• Excavations of rock shelters inside [8 answer box] near the village of Kelo revealed...

Correct HTML style:
<span class="inline-input" data-q="8"><input type="text" name="q8"></span>

## Summary completion without options

Use for tasks that say:
Complete the summary below.
Choose ONE WORD ONLY / NO MORE THAN TWO WORDS from the passage.

Layout:
- Use a bordered summary box if the original task is a summary paragraph.
- If the source summary has a title, center that title at the top of the bordered box.
- Use inline answer boxes.
- Put the question number inside the answer box.
- Keep the summary as connected paragraph-style text; do not split into visually disconnected rows unless the source is actually row-based.
- Use bullet points only if the source summary is in note form.

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
- Normal numbered question blocks.
- Visible question number before each sentence.
- Inline answer box at the blank.
- Do not use bullet points unless the original task is clearly note-form.
- For sentence completion, the number usually stays before the sentence, not inside the box.

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
- Show the list of headings clearly.
- Use dropdowns for each paragraph.
- Dropdowns should show both Roman numeral and heading text.

## Matching people / experts / researchers

Use for tasks that give a list of people or experts.

Layout:
- If the source has a “List of People/Experts” bank, render that list in a separate bordered box.
- Keep the numbered matching statements separate and normally numbered.
- Show the full list of people clearly.
- Use dropdowns.
- Dropdowns should show both letter and name.

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

## Forbidden pattern

Do not use or call functions like:
convertGapFillNumbersToBullets()

Bullet points must be added directly only to the specific note-completion or summary items that need them.

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
13. Check the IELTS Pabs logo still has red hover, hover blur animation, and confirmation home link.
14. Check the hub link opens the correct new test.
15. During formatting cleanup, quickly check HTML nesting around `#questionPane`, `#questionContent`, `#selectionToolbar`, and bottom navigation; remove only clearly misplaced closing tags.
