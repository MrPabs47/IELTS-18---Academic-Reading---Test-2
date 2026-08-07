(function () {
  "use strict";

  const tfng = {
    purpose: "Compare the complete statement with the relevant information in the text.",
    steps: [
      "Underline the main claim and any limiting words in the statement.",
      "Locate the relevant sentence and compare the whole meaning, not isolated vocabulary.",
      "Choose FALSE for a contradiction and NOT GIVEN when the required information is absent."
    ],
    trap: "A statement can use the same topic words as the text while changing a limit, condition or responsibility."
  };

  const matchingInformation = {
    purpose: "Match each statement to the group whose description expresses the same idea.",
    steps: [
      "Underline the distinctive idea in the statement.",
      "Scan the labelled groups for the same meaning rather than the same words.",
      "Confirm the full statement before selecting a letter; letters may be reused."
    ],
    trap: "Several groups may share a broad topic, so match the precise feature rather than one familiar word."
  };

  const noteCompletion = {
    purpose: "Use the note structure, grammar and meaning around each gap to find the exact words in the text.",
    steps: [
      "Predict the type of word or phrase required by the grammar around the gap.",
      "Scan the relevant paragraph for the same idea or sequence.",
      "Copy no more than two words and check spelling, grammar and the word limit."
    ],
    trap: "A nearby technical term may look relevant but fail to complete the note grammatically or precisely."
  };

  const tableCompletion = {
    purpose: "Use the row headings and sentence grammar to locate the exact one-word answer in the text.",
    steps: [
      "Read across the whole row to understand the strategy, approach and customer response.",
      "Predict the grammatical form needed in the gap.",
      "Find the matching idea in the passage and copy ONE WORD ONLY."
    ],
    trap: "The correct idea may be paraphrased across the row, so do not choose a word only because it appears nearby."
  };

  const matchingHeadings = {
    purpose: "Choose the heading that captures the main idea of each whole section rather than one detail.",
    steps: [
      "Read the opening and closing ideas of the section and summarise its overall purpose.",
      "Compare that summary with every plausible heading.",
      "Reject headings that describe only an example, name or supporting detail."
    ],
    trap: "A heading can match a memorable sentence but still miss the section’s main message."
  };

  const summaryCompletion = {
    purpose: "Follow the summary sequence and use grammar plus paraphrase to copy the exact one-word answer.",
    steps: [
      "Predict the word type and likely meaning before searching.",
      "Follow the summary in order through the relevant passage section.",
      "Copy ONE WORD ONLY and check that the completed sentence is grammatical."
    ],
    trap: "The summary often paraphrases the passage, so matching one nearby word without checking the sentence can mislead you."
  };

  const multipleChoice = {
    purpose: "Identify the precise point made in the named section and reject options that distort it.",
    steps: [
      "Read the question stem first and identify exactly what it asks about.",
      "Find the relevant passage sentence and summarise its meaning before comparing options.",
      "Eliminate choices that add an unsupported detail, reverse the idea or answer a different question."
    ],
    trap: "A distractor may reuse passage vocabulary while changing the relationship or focus."
  };

  window.IELTS18GTTest1StudyFeedback = {
    version: 1,
    terminology: {
      testType: "General Training Reading",
      sectionSingular: "Section",
      sectionPlural: "Sections",
      textSingular: "Text",
      textPlural: "Texts"
    },
    scoreGuide: {
      title: "General Training Reading score guide",
      intro: "Estimated IELTS General Training Reading bands. IELTS notes that exact boundaries can vary slightly between test versions.",
      rows: [
        { correctAnswers: "40", band: "9" },
        { correctAnswers: "39", band: "8.5" },
        { correctAnswers: "37–38", band: "8" },
        { correctAnswers: "36", band: "7.5" },
        { correctAnswers: "34–35", band: "7" },
        { correctAnswers: "32–33", band: "6.5" },
        { correctAnswers: "30–31", band: "6" },
        { correctAnswers: "27–29", band: "5.5" },
        { correctAnswers: "23–26", band: "5" },
        { correctAnswers: "19–22", band: "4.5" },
        { correctAnswers: "15–18", band: "4" },
        { correctAnswers: "12–14", band: "3.5" },
        { correctAnswers: "9–11", band: "3" },
        { correctAnswers: "0–8", band: "Below 3" }
      ]
    },
    taskGroups: [
      { id: "s1-dry-cleaning-tfng", section: 1, controlHost: "#study-instruction-s1-dry-cleaning", label: "True / False / Not Given", questions: [1,2,3,4,5,6,7], ...tfng },
      { id: "s1-reader-writer-groups", section: 1, controlHost: "#study-instruction-s1-groups", label: "Matching information to groups", questions: [8,9,10,11,12,13,14], ...matchingInformation },
      { id: "s2-lifting-notes", section: 2, controlHost: "#study-instruction-s2-lifting", label: "Note completion", questions: [15,16,17,18,19,20,21,22], ...noteCompletion },
      { id: "s2-complaints-table", section: 2, controlHost: "#study-instruction-s2-complaints", label: "Table completion", questions: [23,24,25,26,27], ...tableCompletion },
      { id: "s3-stork-headings", section: 3, controlHost: "#study-instruction-s3-headings", label: "Matching headings", questions: [28,29,30,31,32,33], ...matchingHeadings },
      { id: "s3-stork-summary", section: 3, controlHost: "#study-instruction-s3-summary", label: "Summary completion", questions: [34,35,36,37], ...summaryCompletion },
      { id: "s3-stork-mc", section: 3, controlHost: "#study-instruction-s3-mc", label: "Multiple choice", questions: [38,39,40], ...multipleChoice }
    ],
    questions: {
      1: {
        group: "s1-dry-cleaning-tfng",
        answer: "TRUE",
        explanation: "The statement says a dry cleaner remains responsible even when a sign claims otherwise. The text says such a sign does not remove the company’s responsibility, so the statement agrees with the passage and is TRUE.",
        skill: "Compare the rule with any attempted exception; a sign cannot cancel the legal responsibility stated in the text.",
        evidence: "Even if the dry cleaning company has a sign saying they aren’t responsible for items left with them, this isn’t necessarily true. They can’t opt out of this responsibility just by putting up a sign.",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      2: {
        group: "s1-dry-cleaning-tfng",
        answer: "FALSE",
        explanation: "The question says compensation should cover the cost of a completely new replacement. The text limits compensation to the item’s value when it was left with the cleaner, specifically not the cost of replacing it as new, so the statement is FALSE.",
        skill: "Watch for value limits and contrast language such as ‘not’; it can reverse an otherwise similar claim.",
        evidence: "If they have to pay the cost of replacing a damaged or lost item, the maximum they’re obliged to offer you is the value of the item when it was left with them, not what it would cost to replace as new.",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      3: {
        group: "s1-dry-cleaning-tfng",
        answer: "FALSE",
        explanation: "A receipt is evidence of the original price, but the text does not say that price must be refunded. It says the cleaner can reduce the amount according to the item’s condition, so receiving the full original purchase price is contradicted.",
        skill: "Separate evidence of an original price from the rule used to calculate compensation.",
        evidence: "You’ll probably be asked to provide evidence of how much it originally cost — for example, a receipt. The dry cleaner can then offer you a reduced amount depending on the condition of the item — you’ll have to negotiate the cost with them.",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      4: {
        group: "s1-dry-cleaning-tfng",
        answer: "TRUE",
        explanation: "The question says a trade association may support a complaint. The passage explicitly says that if the cleaner belongs to a trade association, the complaint can be passed to it and it may be able to help, so the answer is TRUE.",
        skill: "Match modal language carefully: ‘may be able to help’ supports ‘it may be possible to get support’.",
        evidence: "If the dry cleaner is a member of a trade association such as the UK Fashion and Textile Association, you can pass your complaint to them and they may be able to help you.",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      5: {
        group: "s1-dry-cleaning-tfng",
        answer: "FALSE",
        explanation: "The question describes the independent report as free. The text says an independent organisation can produce a report but warns that this could be expensive, often around £100. That directly contradicts ‘free’, so the answer is FALSE.",
        skill: "Check cost qualifiers closely; one adjective such as ‘free’ can decide the whole statement.",
        evidence: "You could get an independent organisation to look at your issue and produce a report, but this could be expensive (often around £100).",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      6: {
        group: "s1-dry-cleaning-tfng",
        answer: "NOT GIVEN",
        explanation: "The passage says an unhappy customer can take the case to court, but it gives no information about how satisfied most people are with court outcomes. The closest relevant information describes the option of going to court, not its success rate, so the answer is NOT GIVEN.",
        skill: "Do not turn the existence of an option into an unstated claim about how successful or satisfying it is.",
        evidence: "If you’ve tried the options above and are still unhappy With the outcome, you could take your case to court.",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      7: {
        group: "s1-dry-cleaning-tfng",
        answer: "TRUE",
        explanation: "The statement asks whether a case from nine months ago can still go to court. The passage allows up to six years from the time the item was taken to the cleaner, so nine months is well inside that limit and the statement is TRUE.",
        skill: "Convert the stated time limit into the question’s example and check whether it falls inside or outside the boundary.",
        evidence: "There’s a time limit for going to court — from when you took the item to the dry cleaner, you have up to six years.",
        evidenceRoot: "#text-s1-dry-cleaning"
      },
      8: {
        group: "s1-reader-writer-groups",
        answer: "A",
        explanation: "Teenvision members talk about recent reading and make suggestions about what the group should read next. ‘Make suggestions on what we should read next’ directly matches members sharing ideas for future books, so A is correct.",
        skill: "Match the action in the question to a paraphrase of the same group activity, not just the topic of books.",
        evidence: "We are a friendly group, with everybody keen to talk about what we’ve enjoyed reading recently and make suggestions on what we should read next.",
        evidenceRoot: "#text-s1-groups"
      },
      9: {
        group: "s1-reader-writer-groups",
        answer: "F",
        explanation: "The Poetry writing group says it is currently full. Interested people can only join a waiting list, which means new members cannot join the group at present, so F is correct.",
        skill: "Treat ‘currently full’ as the decisive availability condition and distinguish a waiting list from actual membership.",
        evidence: "The group is currently full but anyone interested is welcome to join the membership waiting list.",
        evidenceRoot: "#text-s1-groups"
      },
      10: {
        group: "s1-reader-writer-groups",
        answer: "B",
        explanation: "Creative writing workshops invite participants to share their writing and hear constructive suggestions from others about how to improve it. Those suggestions are feedback on the participant’s own work, so B is correct.",
        skill: "Look for a paraphrase of ‘feedback’, such as constructive suggestions about how to improve your work.",
        evidence: "Would you like to share your writing with others and hear their constructive suggestions for how to improve it?",
        evidenceRoot: "#text-s1-groups"
      },
      11: {
        group: "s1-reader-writer-groups",
        answer: "C",
        explanation: "Books for now is specifically for people who discuss science fiction novels. The examples that follow are different kinds of science fiction, so the group is focused on one overall genre and C is correct.",
        skill: "Distinguish one main genre from its subgenres; a list of varieties does not necessarily mean a mix of genres.",
        evidence: "The group is open to men and women who enjoy discussing the themes and issues found in science fiction novels. Our books are usually those written from the 1960s onwards and include feminist science fiction, cyberpunk and scientific romance.",
        evidenceRoot: "#text-s1-groups"
      },
      12: {
        group: "s1-reader-writer-groups",
        answer: "F",
        explanation: "The Poetry writing group states that members’ poems will be displayed in the library and online. That makes their work available for other people to see, so F matches the statement.",
        skill: "Connect a concrete publication or display method with the broader idea of work being available to the public.",
        evidence: "You will explore how to power up your imagination, and your poems will be displayed in the library and online.",
        evidenceRoot: "#text-s1-groups"
      },
      13: {
        group: "s1-reader-writer-groups",
        answer: "E",
        explanation: "The book club reads and discusses a business book each month. Business books are the group’s stated focus rather than poetry or fiction, so E is the group described by the question.",
        skill: "Identify what the group actually reads and use that content type to exclude poetry- and fiction-based groups.",
        evidence: "Every month members of this group read a fabulous business book which is then discussed when we meet.",
        evidenceRoot: "#text-s1-groups"
      },
      14: {
        group: "s1-reader-writer-groups",
        answer: "B",
        explanation: "Creative writing workshops directly address people who feel they have a book inside them but need help getting started, then offer support with storylines and characters. That makes B suitable for someone who thinks they could write a book.",
        skill: "Match the learner’s goal in the question to the purpose of the group, especially language about getting started and developing ideas.",
        evidence: "Have you got a book inside you but need the inspiration to get started? Build your confidence to begin formulating ideas for storylines and characters at our regular workshops.",
        evidenceRoot: "#text-s1-groups"
      },
      15: {
        group: "s2-lifting-notes",
        answer: "(CE) mark",
        explanation: "The note gives an example of evidence that lifting equipment was manufactured properly. The passage says equipment bearing a CE mark has been constructed to international standards, so the accepted answer is CE mark or mark.",
        skill: "Use the example marker ‘e.g.’ to find a concrete feature that proves the general statement in the note.",
        evidence: "For example, equipment bearing a CE mark has been constructed to international standards.",
        evidenceRoot: "#text-s2-lifting"
      },
      16: {
        group: "s2-lifting-notes",
        answer: "tests",
        explanation: "The note says equipment may need to undergo something before use. The text refers to documented instructions for tests that must be followed prior to using the equipment, so ‘tests’ is the exact word that completes the note.",
        skill: "Match the time phrase ‘before use’ with its passage paraphrase ‘prior to using’ and copy the linked noun.",
        evidence: "In addition, equipment that meets these standards will have documented instructions for tests that should be adhered to prior to using the equipment.",
        evidenceRoot: "#text-s2-lifting"
      },
      17: {
        group: "s2-lifting-notes",
        answer: "engineer",
        explanation: "The note asks who may carry out a regular check. The passage says certain machinery must be inspected every six months by a qualified engineer, so ‘engineer’ is the required noun.",
        skill: "Use the passive structure ‘checked/inspected by’ to identify the person responsible for the action.",
        evidence: "Certain types of machinery, such as cranes, must be inspected by a qualified engineer on a six-monthly basis.",
        evidenceRoot: "#text-s2-lifting"
      },
      18: {
        group: "s2-lifting-notes",
        answer: "control measures",
        explanation: "The note says lift plans are used to establish and carry out something for risks. The passage explains that a lift plan is a risk assessment in which dangers are calculated and control measures are identified and put in place. ‘Control measures’ therefore completes the note.",
        skill: "Follow the cause-and-response structure of a risk assessment: identify the danger, then identify and implement the measure that controls it.",
        evidence: "Lift plans are a type of risk assessment, whereby the possible dangers of the operation are carefully calculated. and control measures are identified and put in place.",
        evidenceRoot: "#text-s2-lifting"
      },
      19: {
        group: "s2-lifting-notes",
        answer: "(lifting) crew",
        explanation: "The note asks who can be consulted during a Tool Box Talk. The text says the lift plan should be talked over with the lifting crew during the Tool Box Talk, so ‘lifting crew’ or ‘crew’ is accepted.",
        skill: "Match the meeting name first, then identify the people explicitly involved in that discussion.",
        evidence: "Before any lift proceeds. the plan should be talked over with the lifting crew during what is often referred to as a ‘Tool Box Talk’ (TBT).",
        evidenceRoot: "#text-s2-lifting"
      },
      20: {
        group: "s2-lifting-notes",
        answer: "barriers",
        explanation: "The note asks for objects used to stop a load passing over people. The passage says the area must have barriers or another means of ensuring nobody walks under a moving load, so ‘barriers’ is the exact example required.",
        skill: "Use ‘such as’ in the note to look for a concrete example of the broader safety method described in the passage.",
        evidence: "Firstly, if a load needs to be moved where workers or members of the public are present, the area must have barriers or other means to ensure no one is allowed to walk under the load while it is moving.",
        evidenceRoot: "#text-s2-lifting"
      },
      21: {
        group: "s2-lifting-notes",
        answer: "banksman",
        explanation: "The note describes a person who gives verbal directions to a crane driver. The passage names this person as a banksman and explains that the banksman tells the driver which way to move the load when the driver cannot see it.",
        skill: "Match a job description to the named role, using the following sentence to confirm the person’s exact function.",
        evidence: "Secondly, someone called a banksman should always be used when moving heavy loads by crane. As a crane driver often cannot see the load, especially during touch—down, this person tells him or her which way to move it.",
        evidenceRoot: "#text-s2-lifting"
      },
      22: {
        group: "s2-lifting-notes",
        answer: "injuries",
        explanation: "The note says secondary lifting equipment is more likely to cause something. The passage states that most injuries occur because of faults or weaknesses in chains, slings, shackles and rigging, so ‘injuries’ is the required plural noun.",
        skill: "Track what the pronoun ‘these items’ refers to and connect the equipment type with the consequence attributed to it.",
        evidence: "Chains, slings, shackles and rigging are all examples of secondary lifting equipment, and it is perhaps surprising to note that most injuries occur due to faults or weaknesses in these items.",
        evidenceRoot: "#text-s2-lifting"
      },
      23: {
        group: "s2-complaints-table",
        answer: "win",
        explanation: "The Stay calm row says not to treat the complaint as a personal attack. In the matching passage paragraph, the advice is that aiming to win the confrontation accomplishes nothing, so ‘win’ completes ‘Do not try to ___ the argument.’",
        skill: "Use the row heading to locate the right advice paragraph, then check that the copied verb fits after ‘try to’.",
        evidence: "Aiming to win the confrontation accomplishes nothing.",
        evidenceRoot: "#text-s2-complaints"
      },
      24: {
        group: "s2-complaints-table",
        answer: "expectations",
        explanation: "The table says the customer usually had something that was not fulfilled. The passage explains that the customer has usually bought a product or service that did not meet their expectations, so ‘expectations’ is the exact noun.",
        skill: "Recognise ‘not fulfilled’ as a paraphrase of ‘did not meet’ and copy the noun that follows it.",
        evidence: "He or she has usually made a purchase that did not meet their expectations – a product, service, or maybe a combination of the two.",
        evidenceRoot: "#text-s2-complaints"
      },
      25: {
        group: "s2-complaints-table",
        answer: "solution",
        explanation: "The Listen well row says the customer cannot recognise something until calm. The passage says the customer must relax before being able to hear your solution, so ‘solution’ is the one-word answer.",
        skill: "Follow the sequence of emotional state first and response second; the answer comes after the customer relaxes.",
        evidence: "The customer needs to do this before being able to hear your solution.",
        evidenceRoot: "#text-s2-complaints"
      },
      26: {
        group: "s2-complaints-table",
        answer: "policy",
        explanation: "The Suggest action row says staff should be sure of the company’s rules on complaints. The passage says you need to know what you can and cannot do within the policy of the business, so ‘policy’ completes the table.",
        skill: "Match a general phrase such as ‘company rules’ to the formal noun used in the passage.",
        evidence: "One thing to keep in mind is that you should know what you can and cannot do within the policy of the business you work for.",
        evidenceRoot: "#text-s2-complaints"
      },
      27: {
        group: "s2-complaints-table",
        answer: "recommendation",
        explanation: "The table says a satisfied customer may make a verbal something in future. The passage says a simple gesture could lead to a word-of-mouth recommendation to others, so ‘recommendation’ is the exact noun.",
        skill: "Recognise ‘verbal’ as a paraphrase of ‘word-of-mouth’ and copy the noun describing the positive result.",
        evidence: "A simple gesture like this could result in a word-of-mouth recommendation to others, while making a promise you cannot commit to will only set you back.",
        evidenceRoot: "#text-s2-complaints"
      },
      28: {
        group: "s3-stork-headings",
        answer: "vii",
        explanation: "Section A presents storks as symbols of hope and new life but also explains that their association with rebirth made them a symbol of rebellion. The section therefore combines positive meaning with opposition, matching heading vii, ‘Creatures which represent both joy and opposition’.",
        skill: "For headings, combine the section’s contrasting main ideas instead of choosing a heading from one isolated detail.",
        evidence: "Storks are migrants arriving after the end of Winter, nesting on rooftops and happily associating with humans, and because of this they have long been a symbol of hope and new life. Yet their association with rebirth also meant they became a symbol of rebellion.",
        evidenceRoot: "#text-s3-storks"
      },
      29: {
        group: "s3-stork-headings",
        answer: "i",
        explanation: "Section B explains that the British project to return white storks was inspired by successful reintroductions in European countries. That makes the UK enterprise arise from success elsewhere, which is exactly heading i.",
        skill: "Identify the origin or motivation of the project and match it to a heading about how the enterprise began.",
        evidence: "These young storks are part of a project to return the species to Britain, inspired by reintroductions in European countries that more than reached their target.",
        evidenceRoot: "#text-s3-storks"
      },
      30: {
        group: "s3-stork-headings",
        answer: "vi",
        explanation: "Section C places the storks’ return against ecological loss, climate crisis and eco-anxiety, then describes the return as refreshing and important restoration. The main idea is hopeful restoration during difficult environmental times, so heading vi is correct.",
        skill: "Use the contrast between the negative wider context and the positive development to identify the paragraph’s main message.",
        evidence: "In the face of reports of unrelenting ecological loss (the UN estimates a million species are on the brink of extinction globally), the white stork’s return is refreshing news. As tens of thousands of people demonstrate about the growing climate crisis and eco-anxiety besets us, these glimpses of restoration are important.",
        evidenceRoot: "#text-s3-storks"
      },
      31: {
        group: "s3-stork-headings",
        answer: "iii",
        explanation: "Section D begins by showing that support from conservation bodies was difficult to obtain, while later naming organisations whose expertise and support were welcome or invaluable. The whole section therefore contrasts organisations that did not support the project with others that did, matching heading iii.",
        skill: "Read beyond the opening problem and summarise the whole section when a heading depends on a contrast developed later.",
        evidence: "Support from conservation bodies has been surprisingly difficult to obtain; some were hard-pressed with their own initiatives, while others were simply reluctant to stick their necks out.",
        evidenceRoot: "#text-s3-storks"
      },
      32: {
        group: "s3-stork-headings",
        answer: "viii",
        explanation: "Section E says reintroduced storks are greeted with great happiness and that historical stork festivals have been restored. Those are the two central ideas in heading viii: delight caused by storks and the revival of public events.",
        skill: "Prefer the heading that captures two linked main points when both are stated together in the section.",
        evidence: "Where storks have been reintroduced, they are greeted with great happiness and some historical stork festivals have been restored.",
        evidenceRoot: "#text-s3-storks"
      },
      33: {
        group: "s3-stork-headings",
        answer: "ii",
        explanation: "Section F states that the project hopes storks will inspire empathy and affection, and may also make people concerned about the wider landscape where the birds feed. This range of feelings and the action it may encourage match heading ii.",
        skill: "Track the intended effect on people across the section and choose a heading broad enough to include the different emotions and responses.",
        evidence: "A driving motivation behind the project in the UK is the aspiration that the storks’ return will spark feelings of empathy and affection from townspeople who see their nests on rooftops. They might also encourage the public to feel worried about the wider area where they fly off to feed on earthworms, grasshoppers and frogs.",
        evidenceRoot: "#text-s3-storks"
      },
      34: {
        group: "s3-stork-summary",
        answer: "sticks",
        explanation: "The summary describes the birds putting something together high in an oak tree. Section B says the pair built an untidy nest of sticks in the top branches of a huge oak, so ‘sticks’ is the exact one-word answer.",
        skill: "Follow the summary’s location clues and copy the noun naming the nest material.",
        evidence: "So, after such a long absence, there was great excitement when in April of this year a pair of white storks built an untidy nest of sticks in the top branches of a huge oak in the middle of our rewilding project at Knepp Estate in West Sussex.",
        evidenceRoot: "#text-s3-storks"
      },
      35: {
        group: "s3-stork-summary",
        answer: "infertile",
        explanation: "The summary says the three eggs unfortunately proved to be something. The passage states that the eggs were infertile and did not hatch, so ‘infertile’ is the exact adjective required.",
        skill: "Use the grammar after ‘proved to be’ to predict an adjective, then locate the sentence explaining why the eggs did not hatch.",
        evidence: "Drone footage, taken before the pair started sitting on them, showed three large eggs. The fact that they were infertile and did not hatch was not too disappointing.",
        evidenceRoot: "#text-s3-storks"
      },
      36: {
        group: "s3-stork-summary",
        answer: "Poland",
        explanation: "The summary asks where the two storks were bred before arriving in the UK. Section B says they were imported from Poland and later notes that the other birds were also from Poland, so ‘Poland’ completes the sentence.",
        skill: "For a place-name gap, identify the origin phrase and copy the country exactly.",
        evidence: "Imported from Poland, they have spent the best part of three years in a six acre pen with a group of other juveniles and several injured, non-flying adults, also from Poland.",
        evidenceRoot: "#text-s3-storks"
      },
      37: {
        group: "s3-stork-summary",
        answer: "loyalty",
        explanation: "The summary says other storks are developing a sense of something towards their new home. The passage states that birds have shown strong loyalty to the site and gives the example of one returning after flying to France, so ‘loyalty’ is the answer.",
        skill: "Use the example that follows an abstract noun to confirm the exact quality being described.",
        evidence: "Other birds have already shown strong loyalty to the site. Two years ago, a young bird from Knepp flew across the Channel to France and, this summer, returned to its companions.",
        evidenceRoot: "#text-s3-storks"
      },
      38: {
        group: "s3-stork-mc",
        answer: "D",
        explanation: "Section A says Parliament considered destroying the remaining storks because people feared the birds might inspire republicanism. Republicanism opposes monarchy, so option D correctly paraphrases the belief that storks might encourage people to get rid of the monarchy.",
        skill: "Translate the key political term into the option’s plain-language meaning rather than matching surface vocabulary.",
        evidence: "Shortly after the restoration of King Charles ll in 1660, while storks were rare but surviving, parliament debated putting greater effort into destroying them entirely for fear they might inspire republicanism.",
        evidenceRoot: "#text-s3-storks"
      },
      39: {
        group: "s3-stork-mc",
        answer: "C",
        explanation: "The Sussex Wildlife Trust committee raised doubts about whether the stork had ever been a British bird. That is uncertainty about whether the species was genuinely native, which matches option C.",
        skill: "Match the committee’s specific doubt to the option that preserves the same issue, rather than nearby concerns mentioned later.",
        evidence: "In addition, the committee of the Sussex Wildlife Trust raised doubts about the stork ever having been a British bird.",
        evidenceRoot: "#text-s3-storks"
      },
      40: {
        group: "s3-stork-mc",
        answer: "A",
        explanation: "Section E gives different examples of people creating places for storks to nest: poles beside Spanish motorways and cartwheels on roofs in Alsace. These are a variety of measures to create nesting sites, so option A is correct.",
        skill: "Combine several concrete examples into the broader category described by the correct option.",
        evidence: "The Spanish erect poles for nests along their motorways, and in Alsace householders install cartwheels for storks to build nests on their roofs.",
        evidenceRoot: "#text-s3-storks"
      }
    }
  };
}());
