# IELTS Reading Hub structure

This repository now has a simple `index.html` launcher so students can:

1. choose Academic or General Training
2. choose a test
3. open the selected test
4. keep the normal Study mode and Test mode screen inside each test file

## Recommended structure for future tests

```text
academic/
  cambridge-18/
    test-2/
      IELTS18 Test 2 - Academic Reading.html
      passages.txt
      questions.txt
      answers.txt
      spec.md

general-training/
  cambridge-19/
    test-2/
      IELTS19 Test 2 - General Training Reading.html
      passages.txt
      questions.txt
      answers.txt
      spec.md
```

## How to add a new test later

1. Create the folder for the new test.
2. Upload the standalone HTML file.
3. Upload the source text files.
4. Add a short `spec.md` that shows the section ranges and question types.
5. Update the `tests` array inside `index.html`.
6. Point `href` to the HTML file for that test.

## Suggested `spec.md` format

```md
Test title: Cambridge 16 Test 2 Academic Reading

Section ranges:
- Passage 1: Q1-13
- Passage 2: Q14-26
- Passage 3: Q27-40

Question types:
- Q1-8: True / False / Not Given
- Q9-13: Summary completion, ONE WORD ONLY
- Q14-16: Multiple choice, A-D
- Q17-20: Summary completion with options A-H
- Q21-26: Yes / No / Not Given
- Q27-30: Multiple choice, A-D
- Q31-35: Summary completion with options A-J
- Q36-40: True / False / Not Given

Rules:
- Reuse the existing launcher and test UI where possible.
- Keep timer, split panes, notes, highlighting, scoring and mode screen.
- Change only the content, answer key and any question block logic required.
```

## Practical note

For now, the current Cambridge 18 Academic test is still linked from the repository root. That is fine. You can migrate files into folders later and simply update the launcher link when each test is moved.
