/*
 * IELTS 16 Academic Reading Test 1 — Study feedback data
 *
 * Content-only foundation for Reading Study Mode.
 * This file is deliberately not loaded by the test page yet, so it does not
 * change Test Mode, Study Mode, scoring, timing, highlights, or navigation.
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
      infoButtonAfter: "Yet the polar bear experiences no such consequences.",
      explanation: "The statement says polar bears suffer health problems because of the fat under their skin. The passage says the opposite: humans with similar fat levels would be likely to have health problems, but polar bears do not. This is a contradiction.",
      skillFocus: "Notice contrast. ‘Yet’ introduces the opposite idea: humans may suffer these consequences, whereas polar bears do not."
    },

    2: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      evidence: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      infoButtonAfter: "the brown bears.",
      explanation: "The statement says Liu’s study compared different groups of polar bears. The passage says it compared polar bears with brown bears. Liu did not compare one group of polar bears with another, so this is a contradiction.",
      skillFocus: "Read noun phrases precisely. ‘Different groups of polar bears’ is not the same as ‘polar bears and brown bears’."
    },

    3: {
      taskType: "trueFalseNotGiven",
      answer: "NOT GIVEN",
      evidence: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      infoButtonAfter: "the brown bears.",
      explanation: "The passage confirms that Liu and his colleagues compared polar bears and brown bears genetically. However, it does not say whether they were the first researchers to do this. The ‘first’ claim is neither confirmed nor contradicted.",
      skillFocus: "Words such as ‘first’, ‘only’, ‘always’ and ‘never’ need exact evidence. Do not assume them from related information."
    },

    4: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      evidence: "Liu and his colleagues found the polar bears had a gene known as APoB, which reduces levels of low-density lipoproteins (LDLs) – a form of ‘bad’ cholesterol.",
      infoButtonAfter: "a form of ‘bad’ cholesterol.",
      explanation: "The statement says polar bears control ‘bad’ cholesterol by genetic means. The passage says they have a gene, APoB, which reduces LDLs, a form of bad cholesterol. The meanings match.",
      skillFocus: "Recognise paraphrasing: ‘by genetic means’ means through a gene, and ‘bad cholesterol’ refers to LDLs."
    },

    5: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      evidence: "This process results in about six months of fasting, where the female bears have to keep themselves and their cubs alive.",
      infoButtonAfter: "keep themselves and their cubs alive",
      explanation: "The statement says female polar bears can survive for about six months without food. The passage says they go through about six months of fasting while keeping themselves and their cubs alive. The meanings match.",
      skillFocus: "‘Without food’ is paraphrased as ‘fasting’. Look for a change in wording, not necessarily the same words."
    },

    6: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      evidence: "Six months later, when they finally emerged from the den with their cubs, there was no evidence of significant loss of bone density.",
      infoButtonAfter: "no evidence of significant loss of bone density.",
      explanation: "The statement says the female bears’ bones were very weak when they left their dens. The passage says there was no significant loss of bone density. This is a contradiction.",
      skillFocus: "Check for opposite meanings. ‘Very weak’ conflicts with ‘no significant loss of bone density’."
    },

    7: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      evidence: "If the mechanism of bone remodelling in polar bears can be understood, many bedridden humans, and even astronauts, could potentially benefit.",
      infoButtonAfter: "could potentially benefit.",
      explanation: "The statement says the polar bear’s mechanism for increasing bone density could be used to help people in the future. The passage says bedridden humans and astronauts could potentially benefit if the mechanism is understood. The meanings match.",
      skillFocus: "Follow possibility language. ‘Could be used by people one day’ matches ‘could potentially benefit’."
    }
  }
};
