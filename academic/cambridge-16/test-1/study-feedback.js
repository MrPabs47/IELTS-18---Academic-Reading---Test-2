/*
 * IELTS 16 Academic Reading Test 1 — Study feedback data
 *
 * Feedback content loaded by the standalone test page for the Passage 1
 * Questions 1–7 True / False / Not Given Study Mode and post-submit Review UI.
 */

window.IELTS16AcademicTest1StudyFeedback = {
  version: 1,
  test: {
    book: 16,
    test: 1,
    module: "Academic Reading",
    passage: 1,
    passageTitle: "Why we need to protect polar bears"
  },

  taskStrategies: {
    trueFalseNotGiven: {
      label: "True / False / Not Given",
      questionNumbers: [1, 2, 3, 4, 5, 6, 7],
      orderNote: "In a continuous text, these questions usually follow the order of the passage. They do in this set.",
      purpose: "Identify whether the passage agrees with, contradicts, or does not give the exact information in each statement.",
      steps: [
        "Take 10–20 seconds to survey the title and paragraph layout. Decide whether this task looks like a comfortable place to start.",
        "Read at least two statements before looking back at the passage. This helps you notice if you have moved past an earlier answer.",
        "Highlight topic words and meaning-changers: key nouns, verbs, names, numbers, comparisons, and strong words such as ‘first’, ‘only’, ‘all’, ‘always’ or ‘never’.",
        "Scan for the relevant area, then close-read the sentence and the sentences around it. Do not decide from one matching word alone.",
        "Choose TRUE when the meaning matches, FALSE when there is a contradiction, and NOT GIVEN when the passage does not confirm or contradict the exact claim."
      ],
      commonTrap: "A topic being mentioned is not enough for TRUE. The meaning of the whole statement must match.",
      notGivenTip: "For NOT GIVEN, separate what the passage tells you from the extra detail in the statement. If that extra detail is neither confirmed nor contradicted, choose NOT GIVEN."
    }
  },

  questions: {
    1: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      evidence: "Yet the polar bear experiences no such consequences.",
      infoButtonAfter: "Humans with comparative levels of adipose tissue would be considered obese and would be likely to suffer from diabetes and heart disease. Yet the polar bear experiences no such consequences.",
      explanation: "The statement says that fat causes polar bears health problems. The passage says humans with similar fat levels may suffer diabetes and heart disease, but polar bears experience “no such consequences”. This is the opposite, so the answer is FALSE.",
      skillFocus: "Notice contrast. ‘Yet’ introduces the opposite idea: humans may suffer these consequences, whereas polar bears do not."
    },

    2: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      evidence: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      infoButtonAfter: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      explanation: "The statement says Liu compared different groups of polar bears. The passage says he compared polar bears with brown bears, which are a different species. That contradicts the statement, so the answer is FALSE.",
      skillFocus: "Read noun phrases precisely. ‘Different groups of polar bears’ is not the same as ‘polar bears and brown bears’."
    },

    3: {
      taskType: "trueFalseNotGiven",
      answer: "NOT GIVEN",
      evidence: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      infoButtonAfter: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      explanation: "The passage confirms that Liu compared polar bears with brown bears. However, it never says that Liu and his colleagues were the first researchers to make this comparison. The extra word “first” is not confirmed or contradicted, so the answer is NOT GIVEN.",
      skillFocus: "Words such as ‘first’, ‘only’, ‘always’ and ‘never’ need exact evidence. Do not assume them from related information."
    },

    4: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      evidence: "Liu and his colleagues found the polar bears had a gene known as APoB, which reduces levels of low-density lipoproteins (LDLs) – a form of ‘bad’ cholesterol.",
      infoButtonAfter: "Liu and his colleagues found the polar bears had a gene known as APoB, which reduces levels of low-density lipoproteins (LDLs) – a form of ‘bad’ cholesterol.",
      explanation: "The passage says polar bears have a gene, APoB, that reduces LDLs, described as “bad” cholesterol. This matches the idea that they control bad cholesterol through genetics. Therefore, the answer is TRUE.",
      skillFocus: "Recognise paraphrasing: ‘by genetic means’ means through a gene, and ‘bad cholesterol’ refers to LDLs."
    },

    5: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      evidence: "This process results in about six months of fasting, where the female bears have to keep themselves and their cubs alive.",
      infoButtonAfter: "This process results in about six months of fasting, where the female bears have to keep themselves and their cubs alive, depleting their own calcium and calorie reserves.",
      explanation: "The passage says female bears fast for about six months and keep themselves and their cubs alive during that time. Fasting means going without food, so this matches the statement. The answer is TRUE.",
      skillFocus: "‘Without food’ is paraphrased as ‘fasting’. Look for a change in wording, not necessarily the same words."
    },

    6: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      evidence: "Six months later, when they finally emerged from the den with their cubs, there was no evidence of significant loss of bone density.",
      infoButtonAfter: "In addition, six months later, when they finally emerged from the den with their cubs, there was no evidence of significant loss of bone density.",
      explanation: "The statement says the bears’ bones were very weak after leaving the dens. The passage says there was “no evidence of significant loss of bone density”. That is the opposite idea, so the answer is FALSE.",
      skillFocus: "Check for opposite meanings. ‘Very weak’ conflicts with ‘no significant loss of bone density’."
    },

    7: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      evidence: "If the mechanism of bone remodelling in polar bears can be understood, many bedridden humans, and even astronauts, could potentially benefit.",
      infoButtonAfter: "If the mechanism of bone remodelling in polar bears can be understood, many bedridden humans, and even astronauts, could potentially benefit.",
      explanation: "The passage says bedridden people and astronauts could potentially benefit if scientists understand this mechanism. This matches the idea that it could be used to help people in the future. The answer is TRUE.",
      skillFocus: "Follow possibility language. ‘Could be used by people one day’ matches ‘could potentially benefit’."
    }
  }
};
