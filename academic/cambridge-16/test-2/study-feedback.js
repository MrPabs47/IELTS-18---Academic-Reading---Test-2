/*
 * IELTS 16 Academic Reading Test 2 — Study feedback data
 *
 * Content-only sidecar for the Test 2 Study Mode and post-submit review UI.
 * The page integration is intentionally delivered in a separate framework PR.
 */

window.IELTS16AcademicTest2StudyFeedback = {
  "version": 1,
  "test": {
    "book": 16,
    "test": 2,
    "module": "Academic Reading",
    "includedPassages": [
      1,
      2,
      3
    ],
    "passageTitles": {
      "1": "The White Horse of Uffington",
      "2": "I contain multitudes",
      "3": "How to make wise decisions"
    }
  },
  "taskGroups": [
    {
      "id": "p1-tfng",
      "passage": 1,
      "label": "True / False / Not Given",
      "questionNumbers": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      "strategyKey": "trueFalseNotGiven"
    },
    {
      "id": "p1-one-word",
      "passage": 1,
      "label": "ONE WORD ONLY summary completion",
      "questionNumbers": [
        9,
        10,
        11,
        12,
        13
      ],
      "strategyKey": "oneWordCompletion",
      "wordLimit": "ONE WORD ONLY"
    },
    {
      "id": "p2-multiple-choice",
      "passage": 2,
      "label": "Multiple Choice",
      "questionNumbers": [
        14,
        15,
        16
      ],
      "strategyKey": "multipleChoice"
    },
    {
      "id": "p2-word-list",
      "passage": 2,
      "label": "Summary completion with a word list",
      "questionNumbers": [
        17,
        18,
        19,
        20
      ],
      "strategyKey": "summaryCompletionWordList"
    },
    {
      "id": "p2-ynng",
      "passage": 2,
      "label": "Yes / No / Not Given",
      "questionNumbers": [
        21,
        22,
        23,
        24,
        25,
        26
      ],
      "strategyKey": "yesNoNotGiven"
    },
    {
      "id": "p3-multiple-choice",
      "passage": 3,
      "label": "Multiple Choice",
      "questionNumbers": [
        27,
        28,
        29,
        30
      ],
      "strategyKey": "multipleChoice"
    },
    {
      "id": "p3-word-list",
      "passage": 3,
      "label": "Summary completion with a word list",
      "questionNumbers": [
        31,
        32,
        33,
        34,
        35
      ],
      "strategyKey": "summaryCompletionWordList"
    },
    {
      "id": "p3-tfng",
      "passage": 3,
      "label": "True / False / Not Given",
      "questionNumbers": [
        36,
        37,
        38,
        39,
        40
      ],
      "strategyKey": "trueFalseNotGiven"
    }
  ],
  "taskStrategies": {
    "trueFalseNotGiven": {
      "label": "True / False / Not Given",
      "purpose": "Decide whether the passage agrees with, contradicts, or does not give the exact information in the statement.",
      "steps": [
        "Read at least two statements before returning to the passage so you can follow the information in order.",
        "Underline key nouns, verbs, comparisons, quantities and strong words such as ‘most’, ‘all’, ‘only’, ‘first’ or ‘due to’.",
        "Scan for the relevant area, then compare the whole meaning rather than one familiar word.",
        "Choose TRUE when the meaning matches, FALSE when the passage gives the opposite meaning, and NOT GIVEN when the exact extra detail is neither confirmed nor contradicted."
      ],
      "commonTrap": "A related fact does not prove the statement. Every important detail in the statement needs support."
    },
    "yesNoNotGiven": {
      "label": "Yes / No / Not Given",
      "purpose": "Identify the writer’s claim or opinion rather than simply a factual detail.",
      "steps": [
        "Find the part of the review where the writer gives an opinion, evaluation or recommendation.",
        "Compare the writer’s meaning with the full statement, including words such as ‘good idea’, ‘successful’ and ‘already’.",
        "Choose YES when the writer agrees, NO when the writer disagrees, and NOT GIVEN when the writer’s view is not stated."
      ],
      "commonTrap": "Do not choose YES just because the passage discusses the topic. The writer’s position must be clear."
    },
    "oneWordCompletion": {
      "label": "ONE WORD ONLY completion",
      "purpose": "Find one exact word from the passage that fits the meaning, grammar and word limit of the summary.",
      "steps": [
        "Use the words around the gap to predict the grammar you need, such as a noun, adjective or name.",
        "Scan for the same idea in the passage and expect paraphrasing in the summary.",
        "Copy one exact word from the passage.",
        "Read the completed sentence naturally to check grammar and meaning."
      ],
      "commonTrap": "A correct idea still loses the mark if it has more than one word or does not fit the grammar."
    },
    "multipleChoice": {
      "label": "Multiple Choice",
      "purpose": "Choose the option whose complete meaning answers the question exactly.",
      "steps": [
        "Read the question stem and identify what it is asking about: a writer’s point, a claim, a purpose or a detail.",
        "Locate the relevant paragraph using names, topic words and paraphrases.",
        "Compare all four options with the passage, not only the first option that seems familiar.",
        "Reject options that are true in general but do not answer this exact question."
      ],
      "commonTrap": "Distractors often repeat vocabulary from the passage but change the relationship, quantity or focus."
    },
    "summaryCompletionWordList": {
      "label": "Summary completion with a word list",
      "purpose": "Choose a word-list option that fits the summary’s meaning, grammar and collocation.",
      "steps": [
        "Read the summary first and predict the type of word and idea needed in each gap.",
        "Use grammar and fixed phrases to remove options that cannot fit.",
        "Find the relevant section of the passage in order and match the paraphrase.",
        "Read the completed summary to confirm that every answer works naturally."
      ],
      "commonTrap": "Several words can relate to the topic, but only one makes a correct grammatical and logical sentence."
    }
  },
  "questions": {
    "1": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "TRUE",
      "correctAnswerText": "TRUE",
      "marks": 1,
      "evidence": "the vast majority on the chalk downlands of the country’s southern counties",
      "infoButtonAfter": "the vast majority on the chalk downlands of the country’s southern counties",
      "explanation": "The statement says that most English geoglyphs are concentrated in one part of the country. The passage says that the ‘vast majority’ are on the southern chalk downlands, so the meaning matches.",
      "skillFocus": "Match quantity language carefully: ‘the vast majority’ means most.",
      "languageNote": "The phrase ‘the vast majority’ is a strong quantifier. It supports ‘most’, not ‘all’."
    },
    "2": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "NOT GIVEN",
      "correctAnswerText": "NOT GIVEN",
      "marks": 1,
      "evidence": "The figures include giants, horses, crosses and regimental badges.",
      "infoButtonAfter": "The figures include giants, horses, crosses and regimental badges.",
      "explanation": "The passage lists horses as one type of geoglyph, but it never compares the number of horse figures with the number of any other creature. The comparative claim is NOT GIVEN.",
      "skillFocus": "Check comparative claims exactly. A list does not prove that one item is the most common.",
      "languageNote": "The structure ‘more … than any other’ requires a direct comparison. No comparison is given here."
    },
    "3": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "TRUE",
      "correctAnswerText": "TRUE",
      "marks": 1,
      "evidence": "recently been re-dated and shown to be even older than its previously assigned ancient pre-Roman Iron Age date",
      "infoButtonAfter": "recently been re-dated and shown to be even older than its previously assigned",
      "explanation": "The horse was recently dated again and found to be older than people had previously thought. This means the earlier date was mistaken.",
      "skillFocus": "Use comparison language: ‘older than its previously assigned date’ signals a correction to an earlier belief.",
      "languageNote": "‘Previously assigned’ refers to the old date, while ‘recently been re-dated’ signals a new result."
    },
    "4": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "FALSE",
      "correctAnswerText": "FALSE",
      "marks": 1,
      "evidence": "While many historians are convinced the figure is prehistoric, others believe ...",
      "infoButtonAfter": "While many historians are convinced the figure is prehistoric, others believe",
      "explanation": "The statement says historians agree. The passage gives two opposing views, so there is no agreement and the statement is FALSE.",
      "skillFocus": "Look for contrast markers that introduce opposing viewpoints.",
      "languageNote": "‘While …, others …’ is a contrast structure. It directly signals disagreement."
    },
    "5": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "FALSE",
      "correctAnswerText": "FALSE",
      "marks": 1,
      "evidence": "remove the overlying grass to reveal the gleaming white chalk below",
      "infoButtonAfter": "remove the overlying grass to reveal the gleaming white chalk below",
      "explanation": "People did not place white chalk on the hillside. They removed grass so that the chalk already underneath became visible. This contradicts the statement.",
      "skillFocus": "Check the action precisely: removing a covering is not the same as adding material.",
      "languageNote": "The infinitive phrase ‘to reveal’ explains the result of removing the grass."
    },
    "6": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "TRUE",
      "correctAnswerText": "TRUE",
      "marks": 1,
      "evidence": "the vast majority of hill figures have disappeared",
      "infoButtonAfter": "the vast majority of hill figures have disappeared",
      "explanation": "If the vast majority have disappeared, many geoglyphs are no longer visible. The statement matches.",
      "skillFocus": "Match logical meaning: ‘have disappeared’ means they cannot now be seen.",
      "languageNote": "Present perfect ‘have disappeared’ connects a past process with the present result."
    },
    "7": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "TRUE",
      "correctAnswerText": "TRUE",
      "marks": 1,
      "evidence": "the outlines would sometimes change ... creating a different shape to the original geoglyph",
      "infoButtonAfter": "the outlines would sometimes change",
      "explanation": "The passage explicitly says that some outlines changed over hundreds of years and created a different shape. This matches the statement.",
      "skillFocus": "Follow cause and result across a sentence.",
      "languageNote": "‘Would sometimes change’ describes a repeated past tendency, not one single event."
    },
    "8": {
      "passage": 1,
      "taskType": "trueFalseNotGiven",
      "answer": "NOT GIVEN",
      "correctAnswerText": "NOT GIVEN",
      "marks": 1,
      "evidence": "The most famous of these figures is perhaps also the most mysterious",
      "infoButtonAfter": "The most famous of these figures is perhaps also the most mysterious",
      "explanation": "The passage calls the horse famous and mysterious, but it does not say that its fame is caused by its size. The reason for its fame is NOT GIVEN.",
      "skillFocus": "Separate a fact from the reason for that fact.",
      "languageNote": "The phrase ‘due to’ asks for a cause. The passage gives no causal explanation here."
    },
    "9": {
      "passage": 1,
      "taskType": "oneWordCompletion",
      "answer": "Ridgeway",
      "correctAnswerText": "Ridgeway",
      "marks": 1,
      "evidence": "below the Ridgeway, a long-distance Neolithic track",
      "infoButtonAfter": "below the Ridgeway, a long-distance Neolithic track",
      "explanation": "The summary asks for the name of the nearby ancient road. The passage calls it ‘the Ridgeway’, so Ridgeway is the exact one-word answer.",
      "skillFocus": "Copy the named item exactly and obey the one-word limit.",
      "languageNote": "After ‘known as the’, the gap needs a proper noun. Use the capital letter in the passage."
    },
    "10": {
      "passage": 1,
      "taskType": "oneWordCompletion",
      "answer": "documents",
      "correctAnswerText": "documents",
      "marks": 1,
      "evidence": "‘White Horse Hill’ is mentioned in documents from the nearby Abbey of Abingdon",
      "infoButtonAfter": "‘White Horse Hill’ is mentioned in documents from the nearby Abbey of Abingdon",
      "explanation": "The passage says that the first evidence appears in ‘documents’ from the 1070s. The answer is documents.",
      "skillFocus": "Find the noun that completes the source of information in the summary.",
      "languageNote": "The plural noun is required because the summary says ‘appears in ___ from the 1070s’."
    },
    "11": {
      "passage": 1,
      "taskType": "oneWordCompletion",
      "answer": "soil",
      "correctAnswerText": "soil",
      "marks": 1,
      "evidence": "OSL testing was carried out ... on soil from two of the lower layers",
      "infoButtonAfter": "OSL testing was carried out",
      "explanation": "The dating result came from OSL testing on soil taken from the horse’s lower layers. Therefore, soil completes the summary.",
      "skillFocus": "Use the words before the gap to predict the source material being analysed.",
      "languageNote": "After ‘analysis of the surrounding’, the gap needs an uncountable/material noun. ‘Soil’ fits naturally."
    },
    "12": {
      "passage": 1,
      "taskType": "oneWordCompletion",
      "answer": "fertility",
      "correctAnswerText": "fertility",
      "marks": 1,
      "evidence": "a protector of horses, and for her associations with fertility",
      "infoButtonAfter": "a protector of horses, and for her associations with fertility",
      "explanation": "The passage says that Epona was associated with fertility. This completes the phrase about horses and fertility.",
      "skillFocus": "Look for a noun that follows a preposition phrase in the source text.",
      "languageNote": "The fixed pattern is ‘associations with + noun’; the summary paraphrases this as ‘associated with’."
    },
    "13": {
      "passage": 1,
      "taskType": "oneWordCompletion",
      "answer": "Rhiannon",
      "correctAnswerText": "Rhiannon",
      "marks": 1,
      "evidence": "a goddess in native mythology, such as Rhiannon",
      "infoButtonAfter": "a goddess in native mythology, such as Rhiannon",
      "explanation": "The passage gives Rhiannon as a possible native goddess represented by the horse. The answer is Rhiannon.",
      "skillFocus": "For names, locate the exact example introduced by ‘such as’.",
      "languageNote": "‘Such as’ introduces an example, so the gap requires the example name, not the category ‘goddess’."
    },
    "14": {
      "passage": 2,
      "taskType": "multipleChoice",
      "answer": "D",
      "correctAnswerText": "D. They will continue to exist for longer than the human race.",
      "marks": 1,
      "evidence": "they will outlive us",
      "infoButtonAfter": "they will outlive us",
      "explanation": "The writer says microbes ‘will outlive us’. This directly matches the idea that they will exist for longer than humans.",
      "skillFocus": "Match a concise paraphrase: ‘outlive us’ = exist longer than the human race.",
      "languageNote": "The prefix ‘out-’ in ‘outlive’ means ‘live longer than’."
    },
    "15": {
      "passage": 2,
      "taskType": "multipleChoice",
      "answer": "C",
      "correctAnswerText": "C. the average individual has more microbial cells than human ones.",
      "marks": 1,
      "evidence": "the number of microbial ones is higher – about 39 trillion",
      "infoButtonAfter": "the number of microbial ones is higher",
      "explanation": "The paragraph says an average person has about 30 trillion human cells but about 39 trillion microbial cells. This is the fact the writer calls amazing.",
      "skillFocus": "Compare the two figures and identify the writer’s evaluation word.",
      "languageNote": "‘Higher than’ signals the comparison. ‘Ones’ replaces the plural noun ‘cells’."
    },
    "16": {
      "passage": 2,
      "taskType": "multipleChoice",
      "answer": "A",
      "correctAnswerText": "A. explaining how a discovery was made",
      "marks": 1,
      "evidence": "Using microscopes of his own design ... he examined a drop of water ... and found it teeming",
      "infoButtonAfter": "Using microscopes of his own design",
      "explanation": "The paragraph recounts how Leeuwenhoek used his own microscopes to examine water and discover tiny creatures. It explains how the discovery was made.",
      "skillFocus": "For writer-purpose questions, identify the paragraph’s main function rather than one scientific detail.",
      "languageNote": "The sequence ‘Using …, he examined … and found …’ explains a method and result."
    },
    "17": {
      "passage": 2,
      "taskType": "summaryCompletionWordList",
      "answer": "G",
      "correctAnswerText": "G. illness",
      "marks": 1,
      "evidence": "fewer than one hundred species of bacteria bring disease",
      "infoButtonAfter": "fewer than one hundred species of bacteria bring disease",
      "explanation": "The summary says only a small number lead to something harmful. The passage says fewer than one hundred species bring disease, so illness is the best word-list match.",
      "skillFocus": "Use meaning and collocation, not only repeated vocabulary.",
      "languageNote": "The phrase ‘lead to’ is commonly followed by a result noun. ‘Illness’ fits this pattern."
    },
    "18": {
      "passage": 2,
      "taskType": "summaryCompletionWordList",
      "answer": "B",
      "correctAnswerText": "B. partnership",
      "marks": 1,
      "evidence": "we have a symbiotic relationship",
      "infoButtonAfter": "we have a symbiotic relationship",
      "explanation": "A symbiotic relationship is a relationship in which both sides live or work together. From the word list, partnership best expresses this idea.",
      "skillFocus": "Translate an academic term into the closest word-list paraphrase.",
      "languageNote": "‘One based on’ is followed by a noun. ‘Partnership’ is the correct abstract noun."
    },
    "19": {
      "passage": 2,
      "taskType": "summaryCompletionWordList",
      "answer": "H",
      "correctAnswerText": "H. nutrition",
      "marks": 1,
      "evidence": "our unhealthy, low-fibre diets are disrupting the bacterial balance",
      "infoButtonAfter": "our unhealthy, low-fibre diets are disrupting the bacterial balance",
      "explanation": "The summary’s ‘poor ___’ paraphrases unhealthy, low-fibre diets. Nutrition is the matching word-list option.",
      "skillFocus": "Match a broad category word with a more detailed phrase in the passage.",
      "languageNote": "The collocation is ‘poor nutrition’, not ‘poor diet’ from the options list."
    },
    "20": {
      "passage": 2,
      "taskType": "summaryCompletionWordList",
      "answer": "E",
      "correctAnswerText": "E. cleanliness",
      "marks": 1,
      "evidence": "Our obsession with hygiene",
      "infoButtonAfter": "Our obsession with hygiene",
      "explanation": "The passage names an obsession with hygiene as one factor disrupting bacterial balance. In the word list, cleanliness is the matching paraphrase.",
      "skillFocus": "Recognise synonym pairs in summaries: hygiene = cleanliness.",
      "languageNote": "After ‘focus on’, the gap needs a noun. ‘Cleanliness’ is an abstract noun that fits."
    },
    "21": {
      "passage": 2,
      "taskType": "yesNoNotGiven",
      "answer": "YES",
      "correctAnswerText": "YES",
      "marks": 1,
      "evidence": "the excessive use of household detergents and antibacterial products actually destroys the microbes",
      "infoButtonAfter": "the excessive use of household detergents and antibacterial products",
      "explanation": "The writer says that overusing these products can destroy helpful microbes that keep dangerous germs under control. That means the intended protective effect may fail.",
      "skillFocus": "Follow the writer’s cause-and-effect claim.",
      "languageNote": "‘May fail to have the desired effect’ is a cautious paraphrase of a negative result, not a claim of certainty."
    },
    "22": {
      "passage": 2,
      "taskType": "yesNoNotGiven",
      "answer": "NO",
      "correctAnswerText": "NO",
      "marks": 1,
      "evidence": "early exposure to a diverse range of bacteria ... may help protect them against allergies",
      "infoButtonAfter": "early exposure to a diverse range of bacteria",
      "explanation": "The writer gives evidence that early contact with diverse bacteria may protect children against allergies. This contradicts the idea that children should meet as few bacteria as possible.",
      "skillFocus": "Look for the direct opposite of a quantity claim.",
      "languageNote": "‘As few … as possible’ is an extreme minimising phrase; ‘a diverse range’ points in the opposite direction."
    },
    "23": {
      "passage": 2,
      "taskType": "yesNoNotGiven",
      "answer": "NOT GIVEN",
      "correctAnswerText": "NOT GIVEN",
      "marks": 1,
      "evidence": "Among the less appealing case studies is one about a fungus ... Another is about squid",
      "infoButtonAfter": "Among the less appealing case studies",
      "explanation": "The writer describes some case studies as less appealing, but does not say that there are too many of them. The claim about quantity is NOT GIVEN.",
      "skillFocus": "Do not infer a judgement about number from a judgement about appeal.",
      "languageNote": "‘More … than are necessary’ is a comparative quantity claim. The passage gives no number or evaluation of quantity."
    },
    "24": {
      "passage": 2,
      "taskType": "yesNoNotGiven",
      "answer": "YES",
      "correctAnswerText": "YES",
      "marks": 1,
      "evidence": "The readers of Yong’s book must be prepared for a decidedly unglamorous world",
      "infoButtonAfter": "The readers of Yong’s book must be prepared for a decidedly unglamorous world",
      "explanation": "The writer warns readers that the book contains unglamorous, less appealing case studies. The squid example is one of these, so the statement agrees with the writer’s view.",
      "skillFocus": "Link a general evaluation to the examples that follow it.",
      "languageNote": "‘May have limited appeal’ paraphrases ‘less appealing’ and ‘unglamorous’."
    },
    "25": {
      "passage": 2,
      "taskType": "yesNoNotGiven",
      "answer": "NOT GIVEN",
      "correctAnswerText": "NOT GIVEN",
      "marks": 1,
      "evidence": "in an attempt to stop mosquitoes spreading dengue fever",
      "infoButtonAfter": "in an attempt to stop mosquitoes spreading dengue fever",
      "explanation": "The passage says researchers are trying to control dengue fever by loading mosquitoes with bacteria. It does not state whether the effort has been successful, so the answer is NOT GIVEN.",
      "skillFocus": "Separate an attempt or plan from a reported result.",
      "languageNote": "‘In an attempt to’ describes purpose, not success. The statement adds an outcome that is not supplied."
    },
    "26": {
      "passage": 2,
      "taskType": "yesNoNotGiven",
      "answer": "NO",
      "correctAnswerText": "NO",
      "marks": 1,
      "evidence": "In the future ... we could construct buildings with useful microbes built into their walls",
      "infoButtonAfter": "In the future",
      "explanation": "The statement says the microbes have already been put into hospital walls. The passage says this is a possible future development, so the statement is NO.",
      "skillFocus": "Check time references closely: future possibility versus completed present action.",
      "languageNote": "‘Could construct’ is a modal of possibility. It does not mean the buildings already exist."
    },
    "27": {
      "passage": 3,
      "taskType": "multipleChoice",
      "answer": "B",
      "correctAnswerText": "B. A basic assumption about wisdom may be wrong.",
      "marks": 1,
      "evidence": "it isn’t an exceptional trait possessed by a small handful",
      "infoButtonAfter": "it isn’t an exceptional trait possessed by a small handful",
      "explanation": "A common assumption is that wisdom belongs only to a few exceptional people. The paragraph says research challenges that assumption because most people can make wise decisions in the right context.",
      "skillFocus": "Identify the belief that the writer corrects.",
      "languageNote": "The negative form ‘isn’t an exceptional trait’ overturns the earlier assumption."
    },
    "28": {
      "passage": 3,
      "taskType": "multipleChoice",
      "answer": "C",
      "correctAnswerText": "C. The importance of certain influences on it was underestimated.",
      "marks": 1,
      "evidence": "experiential, situational, and cultural factors are even more powerful ... than previously imagined",
      "infoButtonAfter": "experiential, situational, and cultural factors are even more powerful",
      "explanation": "Grossmann says that experience, situation and culture matter more than researchers had previously imagined. This means their importance was underestimated.",
      "skillFocus": "Turn comparative language into a clear paraphrase.",
      "languageNote": "‘More powerful than previously imagined’ means people previously thought these influences were less important."
    },
    "29": {
      "passage": 3,
      "taskType": "multipleChoice",
      "answer": "B",
      "correctAnswerText": "B. will be different in different circumstances.",
      "marks": 1,
      "evidence": "wisdom is not solely an ‘inner quality’ but rather unfolds as a function of situations",
      "infoButtonAfter": "wisdom is not solely an ‘inner quality’",
      "explanation": "Grossmann argues that wisdom depends on the situations people are in. Therefore, the amount of wisdom someone shows can differ across circumstances.",
      "skillFocus": "Follow the central claim about context rather than personality.",
      "languageNote": "‘As a function of situations’ means ‘depending on the situation’."
    },
    "30": {
      "passage": 3,
      "taskType": "multipleChoice",
      "answer": "D",
      "correctAnswerText": "D. a recommended strategy that can help people to reason wisely",
      "marks": 1,
      "evidence": "one of the most reliable ways to support wisdom ... is to look at scenarios from a third-party perspective",
      "infoButtonAfter": "one of the most reliable ways to support wisdom",
      "explanation": "The paragraph recommends taking a third-party perspective as a way to support wiser decisions. It describes a helpful strategy.",
      "skillFocus": "For purpose questions, look for recommendation language such as ‘ways to’ and ‘is to’.",
      "languageNote": "The pattern ‘one of the most reliable ways … is to + verb’ introduces recommended action."
    },
    "31": {
      "passage": 3,
      "taskType": "summaryCompletionWordList",
      "answer": "D",
      "correctAnswerText": "D. modesty",
      "marks": 1,
      "evidence": "intellectual humility or recognition of the limits of our own knowledge",
      "infoButtonAfter": "intellectual humility or recognition of the limits",
      "explanation": "Recognising the limits of your knowledge is intellectual humility. From the word list, modesty is the closest paraphrase.",
      "skillFocus": "Match an academic expression with the closest simpler noun.",
      "languageNote": "The phrase ‘a certain degree of’ is followed by an abstract uncountable noun; ‘modesty’ fits."
    },
    "32": {
      "passage": 3,
      "taskType": "summaryCompletionWordList",
      "answer": "A",
      "correctAnswerText": "A. opinions",
      "marks": 1,
      "evidence": "integration of different attitudes and beliefs",
      "infoButtonAfter": "integration of different attitudes and beliefs",
      "explanation": "The passage says wise reasoning includes integrating different attitudes and beliefs. In the word list, opinions is the closest general word for views that may differ from our own.",
      "skillFocus": "Use the broad word-list term that summarises the source phrase.",
      "languageNote": "The plural verb ‘may differ’ signals that the gap needs a plural countable noun. ‘Opinions’ fits."
    },
    "33": {
      "passage": 3,
      "taskType": "summaryCompletionWordList",
      "answer": "C",
      "correctAnswerText": "C. view",
      "marks": 1,
      "evidence": "appreciation of perspectives wider than the issue at hand",
      "infoButtonAfter": "perspectives wider than the issue at hand",
      "explanation": "The passage says wise reasoning considers perspectives wider than the immediate issue. A broad view is the matching summary phrase.",
      "skillFocus": "Use collocation as a check when several options are semantically related.",
      "languageNote": "‘Take a broad view of’ is a fixed collocation. ‘Broad opinions’ and ‘broad objectivity’ do not fit."
    },
    "34": {
      "passage": 3,
      "taskType": "summaryCompletionWordList",
      "answer": "F",
      "correctAnswerText": "F. objectivity",
      "marks": 1,
      "evidence": "when we adopt a third-person, ‘observer’ viewpoint we reason more broadly",
      "infoButtonAfter": "third-person, ‘observer’ viewpoint",
      "explanation": "Looking at a situation from an observer’s viewpoint means treating it with distance rather than personal involvement. Objectivity is the matching word-list answer.",
      "skillFocus": "Match an approach described in the passage with an abstract noun in the word list.",
      "languageNote": "The preposition ‘with’ is followed by a noun here: ‘regard scenarios with objectivity’."
    },
    "35": {
      "passage": 3,
      "taskType": "summaryCompletionWordList",
      "answer": "G",
      "correctAnswerText": "G. fairness",
      "marks": 1,
      "evidence": "interpersonal and moral ideals such as justice and impartiality",
      "infoButtonAfter": "justice and impartiality",
      "explanation": "The observer viewpoint focuses on justice and impartiality. From the word list, fairness best summarises these moral ideals.",
      "skillFocus": "Use the most inclusive synonym for two linked ideas.",
      "languageNote": "The phrase ‘focus on ___ and moral ideals’ needs a noun that can sit alongside a noun phrase; ‘fairness’ works naturally."
    },
    "36": {
      "passage": 3,
      "taskType": "trueFalseNotGiven",
      "answer": "FALSE",
      "correctAnswerText": "FALSE",
      "marks": 1,
      "evidence": "The students were instructed to imagine their career either ‘as if you were a distant observer’ or ‘before your own eyes’",
      "infoButtonAfter": "The students were instructed to imagine their career either",
      "explanation": "The students did not choose a perspective. They were assigned to a distant-observer role or a control role. The statement says they could choose, so it is FALSE.",
      "skillFocus": "Distinguish between being instructed or assigned and being allowed to choose.",
      "languageNote": "Passive wording matters: ‘were instructed’ describes what researchers told participants to do, not a free choice."
    },
    "37": {
      "passage": 3,
      "taskType": "trueFalseNotGiven",
      "answer": "NOT GIVEN",
      "correctAnswerText": "NOT GIVEN",
      "marks": 1,
      "evidence": "couples in long-term romantic relationships were instructed to visualize an unresolved relationship conflict",
      "infoButtonAfter": "couples in long-term romantic relationships were instructed",
      "explanation": "The passage explains what the couples did, but it does not say whether they knew the research was about wise reasoning. The answer is NOT GIVEN.",
      "skillFocus": "Do not assume that participants knew a study’s purpose unless the passage states it.",
      "languageNote": "The statement adds an awareness claim: ‘were aware’. No evidence confirms or contradicts that claim."
    },
    "38": {
      "passage": 3,
      "taskType": "trueFalseNotGiven",
      "answer": "NOT GIVEN",
      "correctAnswerText": "NOT GIVEN",
      "marks": 1,
      "evidence": "couples in long-term romantic relationships",
      "infoButtonAfter": "couples in long-term romantic relationships",
      "explanation": "The passage states that the couples were in long-term relationships, but it does not say that relationship length affected the results. The answer is NOT GIVEN.",
      "skillFocus": "A participant characteristic is not automatically a cause of the result.",
      "languageNote": "The statement adds a cause-and-effect link: ‘had an impact’. The passage gives no causal language about relationship length."
    },
    "39": {
      "passage": 3,
      "taskType": "trueFalseNotGiven",
      "answer": "TRUE",
      "correctAnswerText": "TRUE",
      "marks": 1,
      "evidence": "displayed more wisdom-related reasoning",
      "infoButtonAfter": "displayed more wisdom-related reasoning",
      "explanation": "In the job experiment, distant observers showed more wisdom-related reasoning. In the couples experiment, those taking the outsider perspective were also more likely to use wise reasoning. The statement matches both results.",
      "skillFocus": "For ‘both’ statements, verify the evidence separately in each experiment.",
      "languageNote": "Comparatives such as ‘more’ and ‘more likely’ support the idea of a stronger tendency, not an absolute rule."
    },
    "40": {
      "passage": 3,
      "taskType": "trueFalseNotGiven",
      "answer": "TRUE",
      "correctAnswerText": "TRUE",
      "marks": 1,
      "evidence": "only a small positive relationship between wise thinking and crystallized intelligence",
      "infoButtonAfter": "only a small positive relationship",
      "explanation": "Grossmann says the relationship between wise thinking and intelligence is only small. This matches the statement that intelligence determines wisdom only to a very limited extent.",
      "skillFocus": "Match degree language accurately: ‘only a small relationship’ = a very limited extent.",
      "languageNote": "‘Only’ reduces the strength of the claim. It is the key word that makes the statement TRUE."
    }
  }
};
