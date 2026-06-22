/*
 * IELTS 16 Academic Reading Test 2 — Study feedback data
 *
 * Content-only sidecar for the Test 2 Study Mode and post-submit review UI.
 * The page integration is intentionally delivered in a separate framework PR.
 */

(() => {
  const question = (passage, taskType, answer, correctAnswerText, evidence, infoButtonAfter, explanation, skillFocus) => ({
    passage,
    taskType,
    answer,
    correctAnswerText,
    marks: 1,
    evidence,
    infoButtonAfter,
    explanation,
    skillFocus
  });

  window.IELTS16AcademicTest2StudyFeedback = {
    version: 1,
    test: {
      book: 16,
      test: 2,
      module: "Academic Reading",
      includedPassages: [1, 2, 3],
      passageTitles: {
        1: "The White Horse of Uffington",
        2: "I contain multitudes",
        3: "How to make wise decisions"
      }
    },

    taskGroups: [
      { id: "p1-tfng", passage: 1, label: "True / False / Not Given", questionNumbers: [1, 2, 3, 4, 5, 6, 7, 8], strategyKey: "trueFalseNotGiven" },
      { id: "p1-one-word", passage: 1, label: "ONE WORD ONLY summary completion", questionNumbers: [9, 10, 11, 12, 13], strategyKey: "oneWordCompletion", wordLimit: "ONE WORD ONLY" },
      { id: "p2-multiple-choice", passage: 2, label: "Multiple Choice", questionNumbers: [14, 15, 16], strategyKey: "multipleChoice" },
      { id: "p2-word-list", passage: 2, label: "Summary completion with a word list", questionNumbers: [17, 18, 19, 20], strategyKey: "summaryCompletionWordList" },
      { id: "p2-ynng", passage: 2, label: "Yes / No / Not Given", questionNumbers: [21, 22, 23, 24, 25, 26], strategyKey: "yesNoNotGiven" },
      { id: "p3-multiple-choice", passage: 3, label: "Multiple Choice", questionNumbers: [27, 28, 29, 30], strategyKey: "multipleChoice" },
      { id: "p3-word-list", passage: 3, label: "Summary completion with a word list", questionNumbers: [31, 32, 33, 34, 35], strategyKey: "summaryCompletionWordList" },
      { id: "p3-tfng", passage: 3, label: "True / False / Not Given", questionNumbers: [36, 37, 38, 39, 40], strategyKey: "trueFalseNotGiven" }
    ],

    taskStrategies: {
      trueFalseNotGiven: {
        label: "True / False / Not Given",
        purpose: "Decide whether the passage agrees with, contradicts, or does not give the exact information in the statement.",
        steps: [
          "Read at least two statements before returning to the passage so you can follow the information in order.",
          "Underline the words that carry the statement’s meaning. Depending on the statement, this may be a key noun or verb, a comparison, a quantity, a time reference, a cause, or a limiting word such as ‘most’, ‘all’, ‘only’ or ‘first’.",
          "Scan for the relevant area, then compare the whole meaning rather than one familiar word.",
          "Choose TRUE when the meaning matches, FALSE when the passage gives the opposite meaning, and NOT GIVEN when the exact extra detail is neither confirmed nor contradicted."
        ],
        commonTrap: "A related fact does not prove the statement. Every important detail in the statement needs support."
      },
      yesNoNotGiven: {
        label: "Yes / No / Not Given",
        purpose: "Identify the writer’s claim or opinion rather than simply a factual detail.",
        steps: [
          "Find the part of the passage where the writer discusses, evaluates or recommends something relevant to the statement.",
          "Compare the writer’s full position with the statement. Depending on the question, pay attention to the relevant opinion, judgement, time reference, cause or degree of certainty.",
          "Choose YES when the writer agrees, NO when the writer disagrees, and NOT GIVEN when the writer’s view is not stated."
        ],
        commonTrap: "Do not choose YES just because the passage discusses the topic. The writer’s position must be clear."
      },
      oneWordCompletion: {
        label: "ONE WORD ONLY completion",
        purpose: "Find one exact word from the passage that fits the meaning, grammar and word limit of the summary.",
        steps: [
          "Use the words immediately before and after the gap to predict the kind of word needed. Depending on the sentence, it may be a name, noun, adjective, verb or number.",
          "Scan for the same idea in the passage and expect paraphrasing in the summary.",
          "Copy one exact word from the passage.",
          "Read the completed sentence naturally to check grammar and meaning."
        ],
        commonTrap: "A correct idea still loses the mark if it has more than one word or does not fit the grammar."
      },
      multipleChoice: {
        label: "Multiple Choice",
        purpose: "Choose the option whose complete meaning answers the question exactly.",
        steps: [
          "Read the question stem and identify its precise focus. It may ask about a claim, purpose, attitude, detail or relationship.",
          "Locate the relevant paragraph using the most useful clue available, such as a name, topic word, contrast, concept or likely paraphrase.",
          "Compare all four options with the passage, not only the first option that seems familiar.",
          "Reject options that are true in general but do not answer this exact question."
        ],
        commonTrap: "Distractors often repeat vocabulary from the passage but change the relationship, quantity or focus."
      },
      summaryCompletionWordList: {
        label: "Summary completion with a word list",
        purpose: "Choose a word-list option that fits the summary’s meaning, grammar and collocation.",
        steps: [
          "Read the summary first and predict the meaning and type of word each gap needs from its immediate sentence context.",
          "Use any available grammar, meaning or collocation clues to remove options that cannot fit.",
          "Find the relevant section of the passage in order and match the paraphrase.",
          "Read the completed summary to confirm that every answer works naturally."
        ],
        commonTrap: "Several words can relate to the topic, but only one makes a correct grammatical and logical sentence."
      }
    },

    questions: {
      1: question(1, "trueFalseNotGiven", "TRUE", "TRUE", "the vast majority on the chalk downlands of the country’s southern counties", "the vast majority on the chalk downlands of the country’s southern counties", "The statement says that most English geoglyphs are concentrated in one part of the country. The passage says that the ‘vast majority’ are on the southern chalk downlands, so the meaning matches. Here, ‘the vast majority’ supports ‘most’, not ‘all’.", "Match quantity language carefully."),
      2: question(1, "trueFalseNotGiven", "NOT GIVEN", "NOT GIVEN", "The figures include giants, horses, crosses and regimental badges.", "The figures include giants, horses, crosses and regimental badges.", "The passage lists horses as one type of geoglyph, but it never compares the number of horse figures with the number of any other creature. The comparative claim is NOT GIVEN. The structure ‘more … than any other’ needs direct comparison evidence.", "Check comparative claims exactly."),
      3: question(1, "trueFalseNotGiven", "TRUE", "TRUE", "recently been re-dated and shown to be even older than its previously assigned", "recently been re-dated and shown to be even older than its previously assigned", "The horse was recently dated again and found to be older than people had previously thought. This means the earlier date was mistaken.", "Use comparison language to spot a correction to an earlier belief."),
      4: question(1, "trueFalseNotGiven", "FALSE", "FALSE", "While many historians are convinced the figure is prehistoric, others believe", "While many historians are convinced the figure is prehistoric, others believe", "The statement says historians agree. The passage gives two opposing views, so there is no agreement and the statement is FALSE. The contrast structure ‘while …, others …’ directly signals disagreement.", "Look for contrast markers that introduce opposing viewpoints."),
      5: question(1, "trueFalseNotGiven", "FALSE", "FALSE", "remove the overlying grass to reveal the gleaming white chalk below", "remove the overlying grass to reveal the gleaming white chalk below", "People did not place white chalk on the hillside. They removed grass so that the chalk already underneath became visible. This contradicts the statement.", "Check the action precisely: removing a covering is not the same as adding material."),
      6: question(1, "trueFalseNotGiven", "TRUE", "TRUE", "the vast majority of hill figures have disappeared", "the vast majority of hill figures have disappeared", "If the vast majority have disappeared, many geoglyphs are no longer visible. The statement matches. The present perfect ‘have disappeared’ describes a past process with a present result.", "Match logical meaning across paraphrases."),
      7: question(1, "trueFalseNotGiven", "TRUE", "TRUE", "the outlines would sometimes change due to people not always cutting in exactly the same place", "the outlines would sometimes change", "The passage explicitly says that some outlines changed over hundreds of years and created a different shape. This matches the statement.", "Follow cause and result across a sentence."),
      8: question(1, "trueFalseNotGiven", "NOT GIVEN", "NOT GIVEN", "The most famous of these figures is perhaps also the most mysterious", "The most famous of these figures is perhaps also the most mysterious", "The passage calls the horse famous and mysterious, but it does not say that its fame is caused by its size. The reason for its fame is NOT GIVEN. The phrase ‘due to’ asks for a cause, and no cause is stated.", "Separate a fact from the reason for that fact."),
      9: question(1, "oneWordCompletion", "Ridgeway", "Ridgeway", "below the Ridgeway, a long-distance Neolithic** track", "below the Ridgeway, a long-distance Neolithic** track", "The summary asks for the name of the nearby ancient road. The passage calls it ‘the Ridgeway’, so Ridgeway is the exact one-word answer. After ‘known as the’, the gap needs the proper name.", "Copy the named item exactly and obey the one-word limit."),
      10: question(1, "oneWordCompletion", "documents", "documents", "‘White Horse Hill’ is mentioned in documents from the nearby Abbey of Abingdon", "‘White Horse Hill’ is mentioned in documents from the nearby Abbey of Abingdon", "The passage says that the first evidence appears in ‘documents’ from the 1070s. The answer is documents. The plural noun fits the phrase ‘appears in ___ from the 1070s’.", "Find the noun that completes the source of information in the summary."),
      11: question(1, "oneWordCompletion", "soil", "soil", "OSL) testing was carried out by the Oxford Archaeological Unit on soil from two of the lower layers", "OSL) testing was carried out by the Oxford Archaeological Unit on soil from two of the lower layers", "The dating result came from OSL testing on soil taken from the horse’s lower layers. Therefore, soil completes the summary. After ‘analysis of the surrounding’, an uncountable material noun fits naturally.", "Use the words before the gap to predict the source material being analysed."),
      12: question(1, "oneWordCompletion", "fertility", "fertility", "a protector of horses, and for her associations with fertility", "a protector of horses, and for her associations with fertility", "The passage says that Epona was associated with fertility. This completes the phrase about horses and fertility.", "Look for the exact noun that completes the paraphrase."),
      13: question(1, "oneWordCompletion", "Rhiannon", "Rhiannon", "a goddess in native mythology, such as Rhiannon", "a goddess in native mythology, such as Rhiannon", "The passage gives Rhiannon as a possible native goddess represented by the horse. The answer is Rhiannon. ‘Such as’ introduces the example required by the gap.", "For names, locate the exact example introduced in the passage."),
      14: question(2, "multipleChoice", "D", "D. They will continue to exist for longer than the human race.", "they will outlive us", "they will outlive us", "The writer says microbes ‘will outlive us’. This directly matches the idea that they will exist for longer than humans. The prefix ‘out-’ in ‘outlive’ means ‘live longer than’.", "Match a concise paraphrase."),
      15: question(2, "multipleChoice", "C", "C. the average individual has more microbial cells than human ones.", "the number of microbial ones is higher – about 39 trillion", "the number of microbial ones is higher", "The paragraph says an average person has about 30 trillion human cells but about 39 trillion microbial cells. This is the fact the writer calls amazing. Here, ‘ones’ replaces the plural noun ‘cells’.", "Compare the two figures and identify the writer’s evaluation."),
      16: question(2, "multipleChoice", "A", "A. explaining how a discovery was made", "Using microscopes of his own design that could magnify up to 270 times, he examined a drop of water from a nearby lake and found it teeming", "Using microscopes of his own design", "The paragraph recounts how Leeuwenhoek used his own microscopes to examine water and discover tiny creatures. It explains how the discovery was made.", "For writer-purpose questions, identify the paragraph’s main function."),
      17: question(2, "summaryCompletionWordList", "G", "G. illness", "fewer than one hundred species of bacteria bring disease", "fewer than one hundred species of bacteria bring disease", "The summary says only a small number lead to something harmful. The passage says fewer than one hundred species bring disease, so illness is the best word-list match. The phrase ‘lead to’ is followed by a result noun, and illness fits.", "Use meaning and collocation, not only repeated vocabulary."),
      18: question(2, "summaryCompletionWordList", "B", "B. partnership", "we have a symbiotic relationship", "we have a symbiotic relationship", "A symbiotic relationship is one in which both sides live or work together. From the word list, partnership best expresses this idea.", "Translate an academic term into the closest word-list paraphrase."),
      19: question(2, "summaryCompletionWordList", "H", "H. nutrition", "our unhealthy, low-fibre diets are disrupting the bacterial balance", "our unhealthy, low-fibre diets are disrupting the bacterial balance", "The summary’s ‘poor ___’ paraphrases unhealthy, low-fibre diets. Nutrition is the matching word-list option because ‘poor nutrition’ is the natural collocation.", "Match a broad category word with a more detailed phrase in the passage."),
      20: question(2, "summaryCompletionWordList", "E", "E. cleanliness", "Our obsession with hygiene", "Our obsession with hygiene", "The passage names an obsession with hygiene as one factor disrupting bacterial balance. In the word list, cleanliness is the matching paraphrase.", "Recognise synonym pairs in summaries."),
      21: question(2, "yesNoNotGiven", "YES", "YES", "the excessive use of household detergents and antibacterial products actually destroys the microbes", "the excessive use of household detergents and antibacterial products", "The writer says that overusing these products can destroy helpful microbes that keep dangerous germs under control. That means the intended protective effect may fail.", "Follow the writer’s cause-and-effect claim."),
      22: question(2, "yesNoNotGiven", "NO", "NO", "early exposure to a diverse range of bacteria, which may help protect them against allergies", "early exposure to a diverse range of bacteria", "The writer gives evidence that early contact with diverse bacteria may protect children against allergies. This contradicts the idea that children should meet as few bacteria as possible. ‘As few … as possible’ is an extreme minimising phrase.", "Look for the direct opposite of a quantity claim."),
      23: question(2, "yesNoNotGiven", "NOT GIVEN", "NOT GIVEN", "Among the less appealing case studies is one about a fungus that is wiping out entire populations of frogs", "Among the less appealing case studies", "The writer describes some case studies as less appealing, but does not say that there are too many of them. The claim about quantity is NOT GIVEN. ‘More … than are necessary’ needs quantity evidence, which the passage does not give.", "Do not infer a judgement about number from a judgement about appeal."),
      24: question(2, "yesNoNotGiven", "YES", "YES", "The readers of Yong’s book must be prepared for a decidedly unglamorous world", "The readers of Yong’s book must be prepared for a decidedly unglamorous world", "The writer warns readers that the book contains unglamorous, less appealing case studies. The squid example is one of these, so the statement agrees with the writer’s view.", "Link a general evaluation to the examples that follow it."),
      25: question(2, "yesNoNotGiven", "NOT GIVEN", "NOT GIVEN", "in an attempt to stop mosquitoes spreading dengue fever", "in an attempt to stop mosquitoes spreading dengue fever", "The passage says researchers are trying to control dengue fever by loading mosquitoes with bacteria. It does not state whether the effort has been successful, so the answer is NOT GIVEN. ‘In an attempt to’ describes purpose, not a result.", "Separate an attempt or plan from a reported outcome."),
      26: question(2, "yesNoNotGiven", "NO", "NO", "In the future, our ability to manipulate microbes means we could construct buildings with useful microbes built into their walls", "In the future", "The statement says the microbes have already been put into hospital walls. The passage says this is a possible future development, so the statement is NO. ‘Could construct’ is a modal of possibility, not evidence that the buildings already exist.", "Check time references closely: future possibility versus completed present action."),
      27: question(3, "multipleChoice", "B", "B. A basic assumption about wisdom may be wrong.", "it isn’t an exceptional trait possessed by a small handful", "it isn’t an exceptional trait possessed by a small handful", "A common assumption is that wisdom belongs only to a few exceptional people. The paragraph says research challenges that assumption because most people can make wise decisions in the right context.", "Identify the belief that the writer corrects."),
      28: question(3, "multipleChoice", "C", "C. The importance of certain influences on it was underestimated.", "experiential, situational, and cultural factors are even more powerful in shaping wisdom than previously imagined", "experiential, situational, and cultural factors are even more powerful", "Grossmann says that experience, situation and culture matter more than researchers had previously imagined. This means their importance was underestimated.", "Turn comparative language into a clear paraphrase."),
      29: question(3, "multipleChoice", "B", "B. will be different in different circumstances.", "wisdom is not solely an “inner quality” but rather unfolds as a function of situations", "wisdom is not solely an “inner quality”", "Grossmann argues that wisdom depends on the situations people are in. Therefore, the amount of wisdom someone shows can differ across circumstances. ‘As a function of situations’ means ‘depending on the situation’.", "Follow the central claim about context rather than personality."),
      30: question(3, "multipleChoice", "D", "D. a recommended strategy that can help people to reason wisely", "one of the most reliable ways to support wisdom in our own day-to-day decisions is to look at scenarios from a third-party perspective", "one of the most reliable ways to support wisdom", "The paragraph recommends taking a third-party perspective as a way to support wiser decisions. It describes a helpful strategy. The pattern ‘one of the most reliable ways … is to + verb’ introduces recommended action.", "For purpose questions, look for recommendation language."),
      31: question(3, "summaryCompletionWordList", "D", "D. modesty", "intellectual humility or recognition of the limits of our own knowledge", "intellectual humility or recognition of the limits", "Recognising the limits of your knowledge is intellectual humility. From the word list, modesty is the closest paraphrase. The phrase ‘a certain degree of’ is followed by an abstract noun, and modesty fits.", "Match an academic expression with the closest simpler noun."),
      32: question(3, "summaryCompletionWordList", "A", "A. opinions", "integration of different attitudes and beliefs", "integration of different attitudes and beliefs", "The passage says wise reasoning includes integrating different attitudes and beliefs. In the word list, opinions is the closest general word for views that may differ from our own. The plural verb ‘may differ’ also signals a plural noun.", "Use the broad word-list term that summarises the source phrase."),
      33: question(3, "summaryCompletionWordList", "C", "C. view", "appreciation of perspectives wider than the issue at hand", "perspectives wider than the issue at hand", "The passage says wise reasoning considers perspectives wider than the immediate issue. A broad view is the matching summary phrase. ‘Take a broad view of’ is a fixed collocation.", "Use collocation as a check when several options are semantically related."),
      34: question(3, "summaryCompletionWordList", "F", "F. objectivity", "when we adopt a third-person, ‘observer’ viewpoint we reason more broadly", "third-person, ‘observer’ viewpoint", "Looking at a situation from an observer’s viewpoint means treating it with distance rather than personal involvement. Objectivity is the matching word-list answer.", "Match an approach described in the passage with an abstract noun in the word list."),
      35: question(3, "summaryCompletionWordList", "G", "G. fairness", "interpersonal and moral ideals such as justice and impartiality", "justice and impartiality", "The observer viewpoint focuses on justice and impartiality. From the word list, fairness best summarises these moral ideals.", "Use the most inclusive synonym for two linked ideas."),
      36: question(3, "trueFalseNotGiven", "FALSE", "FALSE", "The students were instructed to imagine their career either ‘as if you were a distant observer’ or ‘before your own eyes as if you were right there’", "The students were instructed to imagine their career either", "The students did not choose a perspective. They were assigned to a distant-observer role or a control role. The statement says they could choose, so it is FALSE. ‘Were instructed’ describes what researchers told participants to do, not a free choice.", "Distinguish between being instructed or assigned and being allowed to choose."),
      37: question(3, "trueFalseNotGiven", "NOT GIVEN", "NOT GIVEN", "couples in long-term romantic relationships were instructed to visualize an unresolved relationship conflict", "couples in long-term romantic relationships were instructed", "The passage explains what the couples did, but it does not say whether they knew the research was about wise reasoning. The answer is NOT GIVEN.", "Do not assume that participants knew a study’s purpose unless the passage states it."),
      38: question(3, "trueFalseNotGiven", "NOT GIVEN", "NOT GIVEN", "couples in long-term romantic relationships", "couples in long-term romantic relationships", "The passage states that the couples were in long-term relationships, but it does not say that relationship length affected the results. The answer is NOT GIVEN. The statement adds a cause-and-effect link that the passage does not make.", "A participant characteristic is not automatically a cause of the result."),
      39: question(3, "trueFalseNotGiven", "TRUE", "TRUE", "displayed more wisdom-related reasoning", "displayed more wisdom-related reasoning", "In the job experiment, distant observers showed more wisdom-related reasoning. In the couples experiment, those taking the outsider perspective were also more likely to use wise reasoning. The statement matches both results.", "For ‘both’ statements, verify the evidence separately in each experiment."),
      40: question(3, "trueFalseNotGiven", "TRUE", "TRUE", "only a small positive relationship between wise thinking and crystallized intelligence", "only a small positive relationship", "Grossmann says the relationship between wise thinking and intelligence is only small. This matches the statement that intelligence determines wisdom only to a very limited extent. The word ‘only’ reduces the strength of the claim.", "Match degree language accurately.")
    }
  };
})();
