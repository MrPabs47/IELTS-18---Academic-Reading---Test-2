# IELTS Pabs Reading Question Type Layout Guide

This project uses static HTML test pages. All new Reading tests must follow the approved layouts below.

## General rules

1. Use the latest stable Reading test of the same module as the shell: Academic for Academic Reading and General Training for GT Reading. Never use an Academic shell for a GT Reading test.
2. Replace content only. Preserve the stable shell's candidate/name start-screen behaviour; Test Mode must keep required name entry if the stable shell has it, and Study Mode may skip it only if the stable shell does.
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
13. Build Reading tests in staged prompts: shell only, passages only, questions and answers only, formatting cleanup only, hub activation only, then documentation update only if new issues were found. If old shell content appears, repair in smaller sections. Always inspect actual changed files and actual HTML, not only the PR title or description.
14. GT Reading is organised differently: Section 1 may contain two or more short texts, Section 2 may contain two workplace/practical texts, and Section 3 is usually one longer text.


## Passage pane rules for Reading

- Passage panes should focus on the passage title and passage text.
- Do not repeat redundant `Questions...` or `Read the text...` lines if the fixed pane header and question pane already provide that instruction.
- Section 3 should start cleanly with the passage title and paragraph A when the source is paragraph-labelled.
- If a GT section contains two separate texts, clearly separate them with headings, spacing, and divider styling so they do not visually merge. For example, GT Test 1 Section 1 needed clear separation between `Gobridge Tramlink FAQs` and `Adorable Knitwear`, and Section 2 needed clear separation between `How to Become a Great Leader` and `Resigning from a Job in a Professional Manner`.

## Shared form control and navigation rules

- Text inputs, inline inputs, and dropdowns should inherit the page font family and use a font size consistent with the surrounding question text.
- Inline inputs should not look oversized or force awkward line breaks unless the screen is narrow.
- Bottom navigation part chips and counts must stay on one line. Use `white-space: nowrap`, `inline-flex`, suitable spacing, and horizontal overflow for question buttons if needed.
- The bottom navigation must not wrap labels such as `Part 1` and `2 of 14` onto separate lines.

## TRUE / FALSE / NOT GIVEN

Use for tasks that say:
Do the following statements agree with the information given in Reading Passage X?

Layout:
- Normal question blocks.
- Visible question number before each statement.
- Radio buttons in the cleaner stable layout: options stacked vertically, each option in a clear clickable row/card, comfortable spacing, and the radio button aligned with the label text.
- Values must remain exactly: `TRUE`, `FALSE`, `NOT GIVEN`.
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
- Values must remain exactly: `YES`, `NO`, `NOT GIVEN`.
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
- Radio buttons in clear clickable row/card styling, not plain labels separated only by line breaks.
- Show the full option text.
- Add comfortable spacing between multiple-choice questions.

## Multiple choice, choose TWO

Use for tasks that say:
Choose TWO letters.

Layout:
- Checkbox-style options in clear clickable row/card styling, not plain labels separated only by line breaks.
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
16. Do not create duplicate sections, duplicate answerKey or correctAnswerText objects, or duplicate ca-1 to ca-40 IDs.
17. Hub activation should ideally change only index.html. Formatting cleanup should ideally change only the relevant test HTML file. If hub activation also touches a test HTML file, inspect it afterwards to ensure it did not overwrite formatting or content.
18. Confirm the correct key and path exist in the correct hub category; for IELTS 19 GT Reading Test 1, key `19-1` belongs under General Training Reading.
