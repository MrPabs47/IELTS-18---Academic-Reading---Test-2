/*
 * IELTS 16 Academic Reading Test 1 — Study feedback data
 *
 * Feedback content loaded by the standalone test page for Study Mode and
 * post-submit Review UI. Included task groups: Passage 1 Questions 1–13,
 * Passage 2 Questions 14–26 and Passage 3 Questions 27–40.
 */

window.IELTS16AcademicTest1StudyFeedback = {
  version: 1,
  test: {
    book: 16,
    test: 1,
    module: "Academic Reading",
    passage: 1,
    passageTitle: "Why we need to protect polar bears",
    includedPassages: [1, 2, 3],
    passageTitles: {
      1: "Why we need to protect polar bears",
      2: "The Step Pyramid of Djoser",
      3: "The future of work"
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
      questionNumbers: [8, 9, 10, 11, 12, 13, 21, 22, 23, 24],
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
    },

    chooseTwoLetters: {
      label: "Choose TWO letters",
      questionNumbers: [25, 26],
      steps: [
        { title: "Read every option", detail: "underline the key claim in each statement." },
        { title: "Find evidence separately", detail: "treat each option as its own True / False decision." },
        { title: "Check the exact detail", detail: "names and topic words may match, while the detail is wrong." },
        { title: "Choose exactly two", detail: "do not select a third answer just because it seems related." },
        { title: "Watch out", detail: "the two correct options may appear in different parts of the passage." }
      ]
    },

    multipleChoice: {
      label: "Multiple Choice",
      questionNumbers: [27, 28, 29, 30],
      steps: [
        { title: "Read the question first", detail: "identify exactly what information you need." },
        { title: "Find the relevant area", detail: "scan for names, topic words and paraphrases." },
        { title: "Compare every option", detail: "choose the option whose whole meaning matches." },
        { title: "Eliminate precisely", detail: "a familiar word does not make an option correct." },
        { title: "Watch out", detail: "all four options may mention the same topic, but only one answers the question exactly." }
      ]
    },

    summaryCompletionWordList: {
      label: "Summary completion with a word list",
      questionNumbers: [31, 32, 33, 34],
      steps: [
        { title: "Read summary / predict gap", detail: "use grammar and meaning around each blank before looking at the options." },
        { title: "Scan word list", detail: "check which words fit the sentence pattern and collocation." },
        { title: "Find source in order", detail: "follow the summary through the passage in the same sequence." },
        { title: "Match paraphrase", detail: "choose the option that matches the passage meaning, not just a repeated topic." },
        { title: "Check sentence", detail: "read the completed sentence to confirm grammar and meaning." }
      ]
    },

    matchingPeople: {
      label: "Matching statements with people",
      questionNumbers: [35, 36, 37, 38, 39, 40],
      steps: [
        { title: "Read the statement first", detail: "underline the main claim and any strong words." },
        { title: "Build a speaker map", detail: "note each person’s main view while reading." },
        { title: "Match the paraphrase", detail: "find the same idea, not necessarily the same words." },
        { title: "Eliminate carefully", detail: "cross out people whose view does not match the whole statement." },
        { title: "Watch out", detail: "the questions do not follow passage order and a person may be used more than once." }
      ]
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
    },

    21: {
      taskType: "oneWordCompletion",
      passage: 2,
      answer: "city",
      marks: 1,
      evidence: "The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.",
      infoButtonAfter: "The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.",
      explanation: "The notes say the complex was as big as an Egyptian ____. The passage says it was the size of a city in ancient Egypt, so city is the one-word answer.",
      skillFocus: "Use the words around the gap to predict grammar. After “an Egyptian”, look for a singular countable noun."
    },

    22: {
      taskType: "oneWordCompletion",
      passage: 2,
      answer: "priests",
      marks: 1,
      evidence: "The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.",
      infoButtonAfter: "The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.",
      explanation: "The notes refer to accommodation occupied by ____. The passage says there were living quarters for the priests. “Living quarters” paraphrases accommodation, so priests is the answer.",
      skillFocus: "Expect paraphrasing in note completion. Match “accommodation” with “living quarters”, then copy the exact one-word answer."
    },

    23: {
      taskType: "oneWordCompletion",
      passage: 2,
      answer: "trench",
      marks: 1,
      evidence: "The wall had 13 false doors cut into it with only one true entrance cut into the south-east corner; the entire wall was then ringed by a trench 750 meters long and 40 meters wide.",
      infoButtonAfter: "The wall had 13 false doors cut into it with only one true entrance cut into the south-east corner; the entire wall was then ringed by a trench 750 meters long and 40 meters wide.",
      explanation: "The notes say a long ____ encircled the wall. The passage says the wall was ringed by a trench. “Ringed” means encircled, so trench is the answer.",
      skillFocus: "Match paraphrases, not only identical words. Here, “encircled” matches “was ringed by”."
    },

    24: {
      taskType: "oneWordCompletion",
      passage: 2,
      answer: "location",
      marks: 1,
      evidence: "If someone wished to enter, he or she would have needed to know in advance how to find the location of the true opening in the wall.",
      infoButtonAfter: "If someone wished to enter, he or she would have needed to know in advance how to find the location of the true opening in the wall.",
      explanation: "The notes say visitors needed to know the ____ of the real entrance. The passage says they needed to find the location of the true opening, so location is the one-word answer.",
      skillFocus: "Check grammar and collocation. After “the”, the gap needs a noun, and “the location of” is a natural phrase."
    },

    25: {
      taskType: "chooseTwoLetters",
      passage: 2,
      group: "25-26",
      correctAnswers: ["B", "D"],
      marks: 2,
      skillFocus: "Check each option separately. A related name or topic is not enough: the whole statement must match the passage exactly.",
      options: {
        B: {
          evidence: "Djoser is thought to have reigned for 19 years, but some historians and scholars attribute a much longer time for his rule, owing to the number and size of the monuments he built.",
          infoButtonAfter: "Djoser is thought to have reigned for 19 years, but some historians and scholars attribute a much longer time for his rule, owing to the number and size of the monuments he built.",
          explanation: "Option B is correct because the passage gives one possible length of Djoser’s reign, then says some historians and scholars believe it was much longer. This is disagreement about its length."
        },
        D: {
          evidence: "Djoser’s grave goods, and even his body, were stolen at some point in the past and all archaeologists found were a small number of his valuables overlooked by the thieves.",
          infoButtonAfter: "Djoser’s grave goods, and even his body, were stolen at some point in the past and all archaeologists found were a small number of his valuables overlooked by the thieves.",
          explanation: "Option D is correct because archaeologists found a small number of Djoser’s valuables that the thieves had missed. These were possessions still in the tomb."
        }
      }
    },

    26: {
      taskType: "chooseTwoLetters",
      passage: 2,
      group: "25-26",
      correctAnswers: ["B", "D"],
      marks: 0,
      sharedWith: 25
    },

    27: {
      taskType: "multipleChoice",
      passage: 3,
      answer: "B",
      answerLabel: "the extent to which AI will alter the nature of the work that people do.",
      marks: 1,
      evidence: "According to a leading business consultancy, 3-14% of the global workforce will need to switch to a different occupation within the next 10-15 years, and all workers will need to adapt as their occupations evolve alongside increasingly capable machines.",
      infoButtonAfter: "According to a leading business consultancy, 3-14% of the global workforce will need to switch to a different occupation within the next 10-15 years, and all workers will need to adapt as their occupations evolve alongside increasingly capable machines.",
      explanation: "The paragraph says some workers will need to change occupation and all workers will need to adapt as their jobs evolve. This is about how widely AI will change the nature of people’s work, so B is correct.",
      skillFocus: "For a paragraph-summary question, choose the option that covers the overall message, not one example such as automation or a percentage."
    },

    28: {
      taskType: "multipleChoice",
      passage: 3,
      answer: "D",
      answerLabel: "It is a key factor driving current developments in the workplace.",
      marks: 1,
      evidence: "Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production – the so-called knowledge economy.",
      infoButtonAfter: "Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production – the so-called knowledge economy.",
      explanation: "Pachidi says some of the most fundamental workplace changes are happening in data-based jobs, or the knowledge economy. This matches D: it is a key factor driving current developments in the workplace.",
      skillFocus: "Match paraphrases. “Some of the most fundamental changes” matches “a key factor driving current developments”."
    },

    29: {
      taskType: "multipleChoice",
      passage: 3,
      answer: "C",
      answerLabel: "staff making sure that AI produces the results that they want",
      marks: 1,
      evidence: "Pachidi and colleagues even observed people developing strategies to make the algorithm work to their own advantage. ‘We are seeing cases where workers feed the algorithm with false data to reach their targets,’ she reports.",
      infoButtonAfter: "Pachidi and colleagues even observed people developing strategies to make the algorithm work to their own advantage. ‘We are seeing cases where workers feed the algorithm with false data to reach their targets,’ she reports.",
      explanation: "Workers fed false data to the algorithm so they could reach their own targets. In other words, they were making sure AI produced the results they wanted, so C is correct.",
      skillFocus: "Look for the action and its purpose. Here, “to reach their targets” explains why workers manipulated the data."
    },

    30: {
      taskType: "multipleChoice",
      passage: 3,
      answer: "D",
      answerLabel: "illustrates how changes in the job market can be successfully handled.",
      marks: 1,
      evidence: "History is clear that change can mean redundancies. But social policies can tackle this through retraining and redeployment.",
      infoButtonAfter: "History is clear that change can mean redundancies. But social policies can tackle this through retraining and redeployment.",
      explanation: "McGaughey accepts that change can cause redundancies, but says retraining and redeployment can deal with this. He shows how job-market changes can be handled successfully, so D is correct.",
      skillFocus: "Follow contrast words such as “but”. The correct option often summarises the solution as well as the problem."
    },

    31: {
      taskType: "summaryCompletionWordList",
      passage: 3,
      answer: "G",
      answerLabel: "information",
      marks: 1,
      evidence: "Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production – the so-called knowledge economy.",
      infoButtonAfter: "Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production – the so-called knowledge economy.",
      explanation: "The summary says these jobs rely not on production but on ____. The passage says they are dependent on data rather than on production. Data means information, so G is correct.",
      skillFocus: "Use contrasts carefully. Here, data rather than production is the contrast, and information is the noun that fits the gap."
    },

    32: {
      taskType: "summaryCompletionWordList",
      passage: 3,
      answer: "E",
      answerLabel: "reliance",
      marks: 1,
      evidence: "In cases like this, Pachidi believes, a short-sighted view begins to creep into working practices whereby workers learn through the ‘algorithm’s eyes’ and become dependent on its instructions.",
      infoButtonAfter: "In cases like this, Pachidi believes, a short-sighted view begins to creep into working practices whereby workers learn through the ‘algorithm’s eyes’ and become dependent on its instructions.",
      explanation: "The summary describes a growing ____ on AI recommendations. The passage says workers become dependent on the algorithm’s instructions, so dependent is paraphrased by reliance.",
      skillFocus: "Check collocation as well as meaning. Growing reliance on is a natural noun phrase matching become dependent on."
    },

    33: {
      taskType: "summaryCompletionWordList",
      passage: 3,
      answer: "C",
      answerLabel: "intuition",
      marks: 1,
      evidence: "Alternative explorations – where experimentation and human instinct lead to progress and new ideas – are effectively discouraged.",
      infoButtonAfter: "Alternative explorations – where experimentation and human instinct lead to progress and new ideas – are effectively discouraged.",
      explanation: "The summary says staff are deterred from experimenting and using their own ____. The passage says experimentation and human instinct are discouraged. Instinct matches intuition.",
      skillFocus: "Choose a synonym that fits the grammar. Intuition is a noun and fits after using their own."
    },

    34: {
      taskType: "summaryCompletionWordList",
      passage: 3,
      answer: "F",
      answerLabel: "confidence",
      marks: 1,
      evidence: "Their objective is to make AI technologies more trustworthy and transparent, so that organisations and individuals understand how AI decisions are made.",
      infoButtonAfter: "Their objective is to make AI technologies more trustworthy and transparent, so that organisations and individuals understand how AI decisions are made.",
      explanation: "The summary says researchers want to increase users’ ____ with regard to the technology. Making AI more trustworthy and transparent would build confidence in it.",
      skillFocus: "Link the result to the aim. Transparent, trustworthy technology helps users feel confidence in the technology."
    },

    35: {
      taskType: "matchingPeople",
      passage: 3,
      answer: "B",
      answerLabel: "Hamish Low",
      marks: 1,
      evidence: "It assumes that the number of jobs is fixed. If in 30 years, half of 100 jobs are being carried out by robots, that doesn’t mean we are left with just 50 jobs for humans. The number of jobs will increase: we would expect there to be 150 jobs.",
      infoButtonAfter: "It assumes that the number of jobs is fixed. If in 30 years, half of 100 jobs are being carried out by robots, that doesn’t mean we are left with just 50 jobs for humans. The number of jobs will increase: we would expect there to be 150 jobs.",
      explanation: "Low rejects the idea that more robots automatically mean fewer jobs for people. He says the number of jobs will increase.",
      skillFocus: "Match the conclusion, not just the topic. Low’s final claim is that employment will grow."
    },

    36: {
      taskType: "matchingPeople",
      passage: 3,
      answer: "A",
      answerLabel: "Stella Pachidi",
      marks: 1,
      evidence: "‘In many cases, they can outperform humans,’ says Pachidi. ‘Organisations are attracted to using algorithms because they want to make choices based on what they consider is “perfect information”, as well as to reduce costs and enhance productivity.’",
      infoButtonAfter: "‘In many cases, they can outperform humans,’ says Pachidi. ‘Organisations are attracted to using algorithms because they want to make choices based on what they consider is “perfect information”, as well as to reduce costs and enhance productivity.’",
      explanation: "Pachidi gives several attractions: algorithms may outperform humans, provide “perfect information”, reduce costs and improve productivity.",
      skillFocus: "When a statement says “several reasons”, look for a list of reasons rather than one isolated detail."
    },

    37: {
      taskType: "matchingPeople",
      passage: 3,
      answer: "C",
      answerLabel: "Ewan McGaughey",
      marks: 1,
      evidence: "‘The promises of these new technologies are astounding. They deliver humankind the capacity to live in a way that nobody could have once imagined,’ he adds. ‘Just as the industrial revolution brought people past subsistence agriculture, and the corporate revolution enabled mass production, a third revolution has been pronounced. But it will not only be one of technology. The next revolution will be social.’",
      infoButtonAfter: "‘The promises of these new technologies are astounding. They deliver humankind the capacity to live in a way that nobody could have once imagined,’ he adds. ‘Just as the industrial revolution brought people past subsistence agriculture, and the corporate revolution enabled mass production, a third revolution has been pronounced. But it will not only be one of technology. The next revolution will be social.’",
      explanation: "McGaughey compares the possible impact of new technologies with the industrial and corporate revolutions.",
      skillFocus: "Watch for comparison signals such as “just as”. They often connect the statement to an earlier historical example."
    },

    38: {
      taskType: "matchingPeople",
      passage: 3,
      answer: "A",
      answerLabel: "Stella Pachidi",
      marks: 1,
      evidence: "In the meantime, says Pachidi, ‘We need to make sure we fully understand the dilemmas that this new world raises regarding expertise, occupational boundaries and control.’",
      infoButtonAfter: "In the meantime, says Pachidi, ‘We need to make sure we fully understand the dilemmas that this new world raises regarding expertise, occupational boundaries and control.’",
      explanation: "Pachidi says we must fully understand the dilemmas raised by AI, including expertise, occupational boundaries and control.",
      skillFocus: "Match broad summaries to examples. “Range of problems” summarises the listed dilemmas."
    },

    39: {
      taskType: "matchingPeople",
      passage: 3,
      answer: "B",
      answerLabel: "Hamish Low",
      marks: 1,
      evidence: "Instead, he envisages a multistage employment life: one where retraining happens across the life course, and where multiple jobs and no job happen by choice at different stages.",
      infoButtonAfter: "Instead, he envisages a multistage employment life: one where retraining happens across the life course, and where multiple jobs and no job happen by choice at different stages.",
      explanation: "Low predicts a multistage working life with retraining, multiple jobs and periods without work.",
      skillFocus: "Use contrast between old and new models. The answer often paraphrases the new model described after “instead”."
    },

    40: {
      taskType: "matchingPeople",
      passage: 3,
      answer: "C",
      answerLabel: "Ewan McGaughey",
      marks: 1,
      evidence: "McGaughey’s findings are a call to arms to leaders of organisations, governments and banks to pre-empt the coming changes with bold new policies that guarantee full employment, fair incomes and a thriving economic democracy.",
      infoButtonAfter: "McGaughey’s findings are a call to arms to leaders of organisations, governments and banks to pre-empt the coming changes with bold new policies that guarantee full employment, fair incomes and a thriving economic democracy.",
      explanation: "McGaughey calls on authorities to introduce policies guaranteeing full employment and fair incomes.",
      skillFocus: "Connect policy language to the claim. “Guarantee full employment” and “fair incomes” paraphrase adequately paid work for everyone."
    }

  }
};
