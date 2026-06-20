/*
 * IELTS 16 Academic Reading Test 1 — Study feedback data
 *
 * Feedback content loaded by the standalone test page for Study Mode and
 * post-submit Review UI. Included task groups: Passage 1 Questions 1–13 and
 * Passage 2 Questions 14–20.
 */

window.IELTS16AcademicTest1StudyFeedback = {
  version: 1,
  test: {
    book: 16,
    test: 1,
    module: "Academic Reading",
    passage: 1,
    passageTitle: "Why we need to protect polar bears",
    includedPassages: [1, 2],
    passageTitles: {
      1: "Why we need to protect polar bears",
      2: "The Step Pyramid of Djoser"
    }
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
    },

    oneWordCompletion: {
      label: "ONE WORD ONLY completion",
      questionNumbers: [8, 9, 10, 11, 12, 13],
      orderNote: "These questions follow the order of the relevant information in the passage.",
      purpose: "Find the exact one-word answer in the passage and make sure it fits the meaning, grammar and word limit of the notes.",
      steps: [
        "Read the words around the gap and predict the grammar you need: a noun, adjective, verb, number or other form.",
        "Underline the key idea in the notes, then scan for the same meaning in the passage. Expect paraphrasing rather than identical words.",
        "Copy one exact word from the passage. Do not add an article, plural ending or extra word unless it appears in the text.",
        "Read the completed notes naturally. Check that the grammar and meaning both work."
      ],
      commonTrap: "A correct idea can still lose the mark if it breaks the word limit or does not fit the grammar around the gap.",
      wordLimitTip: "ONE WORD ONLY means exactly one word from the passage. Hyphenated forms count as one word only when they appear that way in the source text."
    },

    matchingHeadings: {
      label: "Matching Headings",
      questionNumbers: [14, 15, 16, 17, 18, 19, 20],
      orderNote: "The questions follow paragraph order here, but the headings themselves are paraphrased summaries rather than words copied from the passage.",
      purpose: "Choose the heading that best summarises the main idea of each paragraph.",
      steps: [
        "Read the list of headings first. Underline the main idea in each one, rather than every individual word.",
        "Read the whole paragraph for its central message. The first and last sentences often help, but do not choose from one matching word alone.",
        "Match the overall meaning. A correct heading should cover most of the paragraph, not a single example or detail.",
        "Cross out headings you have used and compare close options carefully before you decide."
      ],
      commonTrap: "A heading can share vocabulary with a paragraph but still be wrong if it describes only a minor detail.",
      answerUseTip: "Each heading is used once only. Check whether your chosen heading leaves a better match for another paragraph."
    }
  },

  questions: {
    1: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      marks: 1,
      evidence: "Yet the polar bear experiences no such consequences.",
      infoButtonAfter: "Humans with comparative levels of adipose tissue would be considered obese and would be likely to suffer from diabetes and heart disease. Yet the polar bear experiences no such consequences.",
      explanation: "The statement says fat causes polar bears health problems. The passage says polar bears experience “no such consequences”, so the meaning is opposite.",
      skillFocus: "Look for contrast words such as “yet”. Compare both sides before you decide."
    },

    2: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      marks: 1,
      evidence: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      infoButtonAfter: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      explanation: "The statement says Liu compared different groups of polar bears. The passage says he compared polar bears with brown bears, a different species, so the meaning is opposite.",
      skillFocus: "Check exactly who or what is being compared. Do not treat different species as different groups of one species."
    },

    3: {
      taskType: "trueFalseNotGiven",
      answer: "NOT GIVEN",
      marks: 1,
      evidence: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      infoButtonAfter: "They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.",
      explanation: "The passage confirms that Liu compared polar bears with brown bears. It never says they were the first researchers to do this, so “first” is NOT GIVEN.",
      skillFocus: "Underline strong extra words such as “first”, “only”, “always” and “never”. Find exact proof for them."
    },

    4: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      marks: 1,
      evidence: "Liu and his colleagues found the polar bears had a gene known as APoB, which reduces levels of low-density lipoproteins (LDLs) – a form of ‘bad’ cholesterol.",
      infoButtonAfter: "Liu and his colleagues found the polar bears had a gene known as APoB, which reduces levels of low-density lipoproteins (LDLs) – a form of ‘bad’ cholesterol.",
      explanation: "The passage says polar bears have APoB, a gene that reduces LDLs or “bad” cholesterol. This matches controlling bad cholesterol by genetic means.",
      skillFocus: "Match paraphrases: a genetic means = a gene; bad cholesterol = LDLs."
    },

    5: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      marks: 1,
      evidence: "This process results in about six months of fasting, where the female bears have to keep themselves and their cubs alive.",
      infoButtonAfter: "This process results in about six months of fasting, where the female bears have to keep themselves and their cubs alive, depleting their own calcium and calorie reserves.",
      explanation: "The passage says female bears fast for about six months while keeping themselves and their cubs alive. Fasting means going without food, so the statement matches.",
      skillFocus: "Match meaning, not identical words. “Fasting” means going without food."
    },

    6: {
      taskType: "trueFalseNotGiven",
      answer: "FALSE",
      marks: 1,
      evidence: "Six months later, when they finally emerged from the den with their cubs, there was no evidence of significant loss of bone density.",
      infoButtonAfter: "In addition, six months later, when they finally emerged from the den with their cubs, there was no evidence of significant loss of bone density.",
      explanation: "The statement says the bears’ bones were very weak. The passage says there was “no evidence of significant loss of bone density”, so the meaning is opposite.",
      skillFocus: "Check for opposite meaning. “No significant loss” does not match “very weak”."
    },

    7: {
      taskType: "trueFalseNotGiven",
      answer: "TRUE",
      marks: 1,
      evidence: "If the mechanism of bone remodelling in polar bears can be understood, many bedridden humans, and even astronauts, could potentially benefit.",
      infoButtonAfter: "If the mechanism of bone remodelling in polar bears can be understood, many bedridden humans, and even astronauts, could potentially benefit.",
      explanation: "The passage says bedridden people and astronauts could potentially benefit if scientists understand the mechanism. This matches a possible future use for people.",
      skillFocus: "Follow possibility language. “Could potentially benefit” matches a future possible use."
    },

    8: {
      taskType: "oneWordCompletion",
      answer: "violent",
      marks: 1,
      evidence: "Bears, on the other hand, seem to be perceived as stupid and in many cases violent.",
      infoButtonAfter: "Bears, on the other hand, seem to be perceived as stupid and in many cases violent.",
      explanation: "The notes say bears are seen as unintelligent and ____. The passage says they are perceived as stupid and often violent. “Stupid” paraphrases “unintelligent”, so violent is the one-word answer.",
      skillFocus: "Use the words around the gap to predict grammar. After “unintelligent and”, look for an adjective."
    },

    9: {
      taskType: "oneWordCompletion",
      answer: "tool",
      marks: 1,
      evidence: "A male bear called GoGo in Tennoji Zoo, Osaka, has even been observed making use of a tool to manipulate his environment.",
      infoButtonAfter: "A male bear called GoGo in Tennoji Zoo, Osaka, has even been observed making use of a tool to manipulate his environment.",
      explanation: "The passage says GoGo was seen making use of a tool. The notes say he used a branch “as a ____”, so tool fits both the meaning and the grammar.",
      skillFocus: "Check the words around the gap. After “as a”, look for one singular countable noun."
    },

    10: {
      taskType: "oneWordCompletion",
      answer: "meat",
      marks: 1,
      evidence: "The bear used a tree branch on multiple occasions to dislodge a piece of meat hung out of his reach.",
      infoButtonAfter: "The bear used a tree branch on multiple occasions to dislodge a piece of meat hung out of his reach.",
      explanation: "The passage says the bear used a branch to dislodge a piece of meat. The notes say he knocked down some ____, so meat completes the meaning.",
      skillFocus: "Check countability. “Some” can be followed by an uncountable noun such as meat."
    },

    11: {
      taskType: "oneWordCompletion",
      answer: "photographer",
      marks: 1,
      evidence: "A calculated move by a male bear involved running and jumping onto barrels in an attempt to get to a photographer standing on a platform four metres high.",
      infoButtonAfter: "A calculated move by a male bear involved running and jumping onto barrels in an attempt to get to a photographer standing on a platform four metres high.",
      explanation: "The passage says the bear tried to get to a photographer standing on a platform. The notes say there was a ____ on the platform, so photographer is the one-word answer.",
      skillFocus: "Use grammar to narrow the answer. After “a”, look for one singular countable noun."
    },

    12: {
      taskType: "oneWordCompletion",
      answer: "game",
      marks: 1,
      evidence: "For example, Ames observed bears putting objects in piles and then knocking them over in what appeared to be a game.",
      infoButtonAfter: "For example, Ames observed bears putting objects in piles and then knocking them over in what appeared to be a game.",
      explanation: "The passage says knocking objects over appeared to be a game. The notes describe activity similar to a ____, so game fits the meaning and grammar.",
      skillFocus: "Use the article as a clue. “A” needs a singular countable noun."
    },

    13: {
      taskType: "oneWordCompletion",
      answer: "frustration",
      marks: 1,
      evidence: "As for emotions, while the evidence is once again anecdotal, many bears have been seen to hit out at ice and snow – seemingly out of frustration – when they have just missed out on a kill.",
      infoButtonAfter: "As for emotions, while the evidence is once again anecdotal, many bears have been seen to hit out at ice and snow – seemingly out of frustration – when they have just missed out on a kill.",
      explanation: "The passage says bears may hit ice and snow seemingly out of frustration after missing a kill. The notes describe movements suggesting ____, so frustration is the one-word answer.",
      skillFocus: "After “suggesting”, look for a noun. Do not add an article to an uncountable noun such as frustration."
    },

    14: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "A",
      answer: "iv",
      answerLabel: "A single certainty among other less definite facts",
      marks: 1,
      evidence: "The evolution of the pyramid form has been written and argued about for centuries. However, there is no question that, as far as Egypt is concerned, it began with one monument to one king designed by one brilliant architect: the Step Pyramid of Djoser at Saqqara.",
      infoButtonAfter: "The evolution of the pyramid form has been written and argued about for centuries. However, there is no question that, as far as Egypt is concerned, it began with one monument to one king designed by one brilliant architect: the Step Pyramid of Djoser at Saqqara.",
      explanation: "Paragraph A says the development of pyramids has been debated for centuries. However, one fact is certain: in Egypt, the pyramid began with Djoser’s Step Pyramid. This matches heading iv.",
      skillFocus: "Look for the paragraph’s central contrast. Here, “however” introduces the one certain fact after several less definite ideas."
    },

    15: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "B",
      answer: "vii",
      answerLabel: "An idea for changing the design of burial structures",
      marks: 1,
      evidence: "For reasons which remain unclear, Djoser’s main official, whose name was Imhotep, conceived of building a taller, more impressive tomb for his king by stacking stone slabs on top of one another, progressively making them smaller, to form the shape now known as the Step Pyramid.",
      infoButtonAfter: "For reasons which remain unclear, Djoser’s main official, whose name was Imhotep, conceived of building a taller, more impressive tomb for his king by stacking stone slabs on top of one another, progressively making them smaller, to form the shape now known as the Step Pyramid.",
      explanation: "Paragraph B explains Imhotep’s new idea for creating a taller tomb by stacking stone slabs. This was a change from earlier rectangular clay-brick tombs, so heading vii is the best summary.",
      skillFocus: "Match the main development, not a background fact. The paragraph focuses on a new design for a tomb."
    },

    16: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "C",
      answer: "ii",
      answerLabel: "A difficult task for those involved",
      marks: 1,
      evidence: "The weight of the enormous mass was a challenge for the builders, who placed the stones at an inward incline in order to prevent the monument breaking up.",
      infoButtonAfter: "The weight of the enormous mass was a challenge for the builders, who placed the stones at an inward incline in order to prevent the monument breaking up.",
      explanation: "Paragraph C describes experimentation during construction and the difficulty of supporting the pyramid’s enormous weight. This matches heading ii, a difficult task for the builders.",
      skillFocus: "For headings, check whether the heading explains the whole paragraph. Here, experimentation and the construction challenge belong to the same main idea."
    },

    17: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "D",
      answer: "v",
      answerLabel: "An overview of the external buildings and areas",
      marks: 1,
      evidence: "The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.",
      infoButtonAfter: "The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.",
      explanation: "Paragraph D gives an overview of the large complex around the pyramid, including buildings, accommodation, a wall and a trench. This matches heading v.",
      skillFocus: "Separate the pyramid from its surroundings. This paragraph is mainly about the external complex, not the inside of the pyramid."
    },

    18: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "E",
      answer: "i",
      answerLabel: "The areas and artefacts within the pyramid itself",
      marks: 1,
      evidence: "The burial chamber of the tomb, where the king’s body was laid to rest, was dug beneath the base of the pyramid, surrounded by a vast maze of long tunnels that had rooms off them to discourage robbers. One of the most mysterious discoveries found inside the pyramid was a large number of stone vessels.",
      infoButtonAfter: "The burial chamber of the tomb, where the king’s body was laid to rest, was dug beneath the base of the pyramid, surrounded by a vast maze of long tunnels that had rooms off them to discourage robbers. One of the most mysterious discoveries found inside the pyramid was a large number of stone vessels.",
      explanation: "Paragraph E describes places inside the pyramid, such as the burial chamber and tunnels, as well as objects found there, especially stone vessels. This matches heading i.",
      skillFocus: "Notice when a heading has two parts. This paragraph covers both internal areas and artefacts found inside them."
    },

    19: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "F",
      answer: "viii",
      answerLabel: "An incredible experience despite the few remains",
      marks: 1,
      evidence: "Djoser’s grave goods, and even his body, were stolen at some point in the past and all archaeologists found were a small number of his valuables overlooked by the thieves. There was enough left throughout the pyramid and its complex, however, to astonish and amaze the archaeologists who excavated it.",
      infoButtonAfter: "Djoser’s grave goods, and even his body, were stolen at some point in the past and all archaeologists found were a small number of his valuables overlooked by the thieves. There was enough left throughout the pyramid and its complex, however, to astonish and amaze the archaeologists who excavated it.",
      explanation: "Paragraph F says most of the tomb’s contents were stolen, but the remaining finds still amazed the archaeologists. This contrast matches heading viii.",
      skillFocus: "Follow contrast words such as “however”. They often connect a problem with the paragraph’s main conclusion."
    },

    20: {
      taskType: "matchingHeadings",
      passage: 2,
      paragraph: "G",
      answer: "vi",
      answerLabel: "A pyramid design that others copied",
      marks: 1,
      evidence: "The Step Pyramid was a revolutionary advance in architecture and became the archetype which all the other great pyramid builders of Egypt would follow.",
      infoButtonAfter: "The Step Pyramid was a revolutionary advance in architecture and became the archetype which all the other great pyramid builders of Egypt would follow.",
      explanation: "Paragraph G says the Step Pyramid became an archetype that later pyramid builders followed. This directly matches heading vi, a design that others copied.",
      skillFocus: "Use strong summary words. “Archetype” means an original model that others follow or copy."
    }
  }
};
