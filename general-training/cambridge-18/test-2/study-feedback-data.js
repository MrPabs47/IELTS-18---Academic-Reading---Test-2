(function () {
  "use strict";

  const matchingFeatures = {
    purpose: "Match each statement to the sleeping bag whose description expresses the same precise feature.",
    steps: [
      "Underline the distinctive feature in the statement, such as weight, season, storage or insulation.",
      "Scan the labelled reviews for a paraphrase of that feature rather than the same vocabulary.",
      "Confirm the whole statement before choosing a letter; a letter may be used more than once."
    ],
    trap: "Several sleeping bags share broad qualities such as warmth or easy packing, so one familiar word is not enough to prove the match."
  };

  const tfng = {
    purpose: "Compare the complete statement with the closest relevant information in the competition rules.",
    steps: [
      "Underline the main claim and any limiting words in the statement.",
      "Find the closest relevant rule and compare the whole meaning, including limits and exceptions.",
      "Choose FALSE for a contradiction and NOT GIVEN when the required detail is not stated."
    ],
    trap: "A rule can discuss the same topic without answering the exact claim, especially when the question adds a past result, success or other unstated detail."
  };

  const noteCompletion = {
    purpose: "Use the note headings, grammar and paraphrases to copy the exact one-word answer from the employee-health text.",
    steps: [
      "Predict the word type and meaning needed by the gap before searching.",
      "Use the note heading to locate the relevant paragraph and follow the ideas in order.",
      "Copy ONE WORD ONLY and check that it completes the note naturally and exactly."
    ],
    trap: "A nearby word may be on the right topic but fail to match the note's grammar or the precise paraphrase."
  };

  const sentenceCompletion = {
    purpose: "Complete each workplace rule with the exact one-word detail stated in the kitchen guidelines.",
    steps: [
      "Use the sentence around the gap to predict the missing noun or other word form.",
      "Locate the matching rule in Hygiene, Safety rules or Breaks and identify the exact detail.",
      "Copy ONE WORD ONLY and re-read the completed sentence for meaning and grammar."
    ],
    trap: "Do not copy a broader category when the sentence asks for the specific item named in the rule."
  };

  const matchingParagraphs = {
    purpose: "Match each statement to the paragraph that contains the same specific information about Clothkits.",
    steps: [
      "Underline the distinctive idea in the statement, such as a date, employment trend or business aim.",
      "Scan paragraphs A–E for that idea or its paraphrase.",
      "Read enough surrounding text to confirm the relationship; paragraph letters may be reused."
    ],
    trap: "A paragraph may mention the same person or company but not the exact information asked for."
  };

  const multipleChoice = {
    purpose: "Identify the precise point made in the named paragraph and reject options that distort or add to it.",
    steps: [
      "Read the question stem first and identify exactly what relationship or reason it asks about.",
      "Find the relevant sentence and summarise its meaning before looking closely at the options.",
      "Eliminate choices that reverse the idea, add unsupported information or focus on a different detail."
    ],
    trap: "A distractor may recycle words from the article while changing the cause, timing or main point."
  };

  const summaryCompletion = {
    purpose: "Follow the summary sequence through Paragraph B and copy the exact one-word detail for each gap.",
    steps: [
      "Predict the word type and likely meaning from the grammar around the gap.",
      "Follow the summary in order through the paragraph and match each paraphrased idea.",
      "Copy ONE WORD ONLY and check spelling and grammatical fit."
    ],
    trap: "Several nearby nouns may look plausible, so confirm the exact relationship in the completed summary sentence."
  };

  window.IELTS18GTTest2StudyFeedback = {
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
      intro: "Estimated IELTS General Training Reading bands. Exact boundaries can vary slightly between test versions.",
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
      { id: "s1-sleeping-bags-matching", section: 1, textId: "s1-section", controlHost: "#study-instruction-s1-sleeping-bags", label: "Matching features", questions: [1,2,3,4,5,6,7,8], ...matchingFeatures },
      { id: "s1-life-writing-tfng", section: 1, textId: "s1-section", controlHost: "#study-instruction-s1-life-writing", label: "True / False / Not Given", questions: [9,10,11,12,13,14], ...tfng },
      { id: "s2-employee-health-notes", section: 2, textId: "s2-section", controlHost: "#study-instruction-s2-employee-health", label: "Note completion", questions: [15,16,17,18,19,20,21], ...noteCompletion },
      { id: "s2-kitchen-sentences", section: 2, textId: "s2-section", controlHost: "#study-instruction-s2-kitchen", label: "Sentence completion", questions: [22,23,24,25,26,27], ...sentenceCompletion },
      { id: "s3-clothkits-paragraphs", section: 3, textId: "s3-clothkits", controlHost: "#study-instruction-s3-paragraphs", label: "Matching information to paragraphs", questions: [28,29,30,31], ...matchingParagraphs },
      { id: "s3-clothkits-mc", section: 3, textId: "s3-clothkits", controlHost: "#study-instruction-s3-mc", label: "Multiple choice", questions: [32,33,34,35], ...multipleChoice },
      { id: "s3-clothkits-summary", section: 3, textId: "s3-clothkits", controlHost: "#study-instruction-s3-summary", label: "Summary completion", questions: [36,37,38,39,40], ...summaryCompletion }
    ],
    questions: {
      1: {
        group: "s1-sleeping-bags-matching",
        answer: "D",
        explanation: "The statement says the bag is difficult to pack away. Review D tells the user to allow extra time to fit it back in the bag, which directly describes that difficulty, so D is the match.",
        skill: "Translate an evaluative phrase such as ‘not very easy’ into the practical consequence described in the review.",
        evidence: "Give yourself a bit of time to fit it back in the bag, though."
      },
      2: {
        group: "s1-sleeping-bags-matching",
        answer: "A",
        explanation: "The statement requires a bag for every season. Review A calls the Vango Fuse -12 an ‘all-year-round’ sleeping bag, which is a direct paraphrase of use in any season, so A is correct.",
        skill: "Match time-range paraphrases precisely: ‘all-year-round’ means suitable throughout the year.",
        evidence: "This all-year-round sleeping bag combines natural duck down and a new synthetic fibre."
      },
      3: {
        group: "s1-sleeping-bags-matching",
        answer: "E",
        explanation: "Review E says extra insulation is placed around the head, chest and feet because these areas tend to feel cold. That is deliberate warming of particular body parts, so E matches the statement.",
        skill: "Look for design features tied to a purpose; ‘extra insulation’ plus named body areas proves the match.",
        evidence: "We like the extra insulation in this sleeping bag around the areas that tend to feel the cold (head, chest and feet)."
      },
      4: {
        group: "s1-sleeping-bags-matching",
        answer: "B",
        explanation: "Review B mentions a handy pocket for essentials inside the sleeping bag. A pocket is a storage area, so B is the only review that directly matches the statement.",
        skill: "Match the function rather than the noun: a ‘pocket for essentials’ is a useful storage area.",
        evidence: "This double sleeping bag — which is suitable for all seasons except winter — is soft and cosy, and there’s a handy pocket for essentials, located inside near the top."
      },
      5: {
        group: "s1-sleeping-bags-matching",
        answer: "D",
        explanation: "The question describes a buyer who wants to spend little. Review D explicitly calls the bag a ‘budget sleeping bag’, so D matches the price requirement.",
        skill: "Identify the decisive price word; ‘budget’ is the direct signal for a low-cost option.",
        evidence: "If you want a no-frills, budget sleeping bag that will last more than one summer, opt for this."
      },
      6: {
        group: "s1-sleeping-bags-matching",
        answer: "F",
        explanation: "Review F says the sleeping bag can be unzipped and turned into an animal-themed coat. A coat can be worn outside bedtime to keep the child warm, so F is the bag that also works during the day.",
        skill: "Follow what a product can transform into and infer the stated function from that new form, without adding functions not supported by the text.",
        evidence: "This innovative, high-quality kids’ sleeping bag enables you to undo some zips and turn it into a fun, animal-themed coat."
      },
      7: {
        group: "s1-sleeping-bags-matching",
        answer: "C",
        explanation: "Review C gives a weight of only 350g and says the compact pack size makes it ideal for backpacking. Those details directly support someone trying to carry as little weight as possible, so C is correct.",
        skill: "Use measurable evidence such as weight first, then confirm the intended use such as backpacking.",
        evidence: "At just 350g, this sleeping bag is remarkably light, and as it’s synthetic, it’s very easy to maintain. The pack size is just 13x20cm, which makes it ideal for backpacking."
      },
      8: {
        group: "s1-sleeping-bags-matching",
        answer: "A",
        explanation: "Review A says the sleeping bag combines natural duck down with a new synthetic fibre. These are two different filling materials, so A matches the statement.",
        skill: "When a question says ‘two different types’, look for linking language such as ‘combines X and Y’.",
        evidence: "This all-year-round sleeping bag combines natural duck down and a new synthetic fibre."
      },
      9: {
        group: "s1-life-writing-tfng",
        answer: "TRUE",
        explanation: "The statement says an entry may contain fewer than 5,000 words. The rules set 5,000 as a maximum and explicitly say there is no minimum word count, so a shorter entry is allowed and the answer is TRUE.",
        skill: "Distinguish a maximum from a minimum; ‘no more than’ limits the upper end, while ‘no minimum’ permits shorter entries.",
        evidence: "Entries should be original works of life writing of no more than 5,000 words. The word count will be checked and entries longer than 5,000 words will be disqualified. There is no minimum word count."
      },
      10: {
        group: "s1-life-writing-tfng",
        answer: "FALSE",
        explanation: "The statement suggests writers can choose another person’s life as the subject. The rules require the piece to be based significantly on the author’s own experience and exclude traditional biographies that are only about someone else, so the statement is FALSE.",
        skill: "Check whose experience the rule requires; the topic can involve other people, but it cannot be only another person’s biography.",
        evidence: "For the purposes of the Prize, Life Writing is defined as non-fiction and should be based on a significant portion from the author’s own experience. Traditional biographies, where the piece is only about the experience of someone else, are excluded."
      },
      11: {
        group: "s1-life-writing-tfng",
        answer: "TRUE",
        explanation: "Only previous winners and highly commended writers are excluded. The rules then state that other previous entrants may submit again, so someone who entered before without success is allowed to re-enter and the answer is TRUE.",
        skill: "Read the exception and the general rule together; exclusion of two successful groups leaves other previous entrants eligible.",
        evidence: "Writers who have previously won or been highly commended in the Life Writing Prize are excluded from entering; otherwise, previous entrants may submit."
      },
      12: {
        group: "s1-life-writing-tfng",
        answer: "NOT GIVEN",
        explanation: "The text gives current eligibility rules, including being over 18, but it says nothing about the ages, student status or educational circumstances of previous prize winners. Because the past-winner claim is not stated or contradicted, the answer is NOT GIVEN.",
        skill: "Do not use current eligibility criteria as evidence about the characteristics of previous winners; check the exact time reference in the statement.",
        evidence: "The Life Writing Prize is open to writers aged over 18 and resident in the UK who are emerging writers, which means they have not previously published in print a full-length work."
      },
      13: {
        group: "s1-life-writing-tfng",
        answer: "FALSE",
        explanation: "The statement says only one prize is awarded. The text describes a winner and also two highly commended entries that each receive money and other benefits, so more than one entrant receives an award and the statement is FALSE.",
        skill: "Count all award categories, not only the item labelled ‘winner’.",
        evidence: "The winner will receive £1,500, publication on Spread the Word’s website, two years’ membership of the Royal Society of Literature, and a development meeting with an editor and an agent. Two highly commended entries will receive £500 and two mentoring sessions, a development meeting with an editor and an agent, and be published on the Spread the Word website."
      },
      14: {
        group: "s1-life-writing-tfng",
        answer: "NOT GIVEN",
        explanation: "The rules say the winning and highly commended entries are published on the competition website, but they do not describe what happened to previous winners’ later writing careers. The claim that earlier winners became successful published writers is therefore NOT GIVEN.",
        skill: "Separate a prize benefit that includes publication from an unstated claim about later professional success.",
        evidence: "The winner will receive £1,500, publication on Spread the Word’s website, two years’ membership of the Royal Society of Literature, and a development meeting with an editor and an agent. Two highly commended entries will receive £500 and two mentoring sessions, a development meeting with an editor and an agent, and be published on the Spread the Word website."
      },
      15: {
        group: "s2-employee-health-notes",
        answer: "absenteeism",
        explanation: "The note pairs improved efficiency with another benefit expressed as ‘less …’. The text says employee wellness can reduce absenteeism and increase productivity, so ‘absenteeism’ completes the paraphrase ‘less absenteeism’.",
        skill: "Use the note’s comparative wording to convert ‘reduce X’ in the passage into ‘less X’ in the notes.",
        evidence: "Putting effort into employee wellness can reduce absenteeism and encourage better teamwork in the workplace, as well as increased productivity."
      },
      16: {
        group: "s2-employee-health-notes",
        answer: "soda",
        explanation: "The note asks what healthier options should replace. The passage says to substitute soda in vending machines with water or juice, so the item being replaced is ‘soda’.",
        skill: "Track the direction of replacement: ‘substitute X with Y’ means X is removed and Y is the healthier alternative.",
        evidence: "A simple thing to do is substitute soda in any on-site vending machines with water or juice."
      },
      17: {
        group: "s2-employee-health-notes",
        answer: "fruit",
        explanation: "The note says to offer something at no cost. The passage recommends putting out a bowl of fruit and inviting staff to help themselves for free, so ‘fruit’ is the one-word answer.",
        skill: "Match the paraphrase ‘at no cost’ to ‘for free’, then copy the noun attached to that benefit.",
        evidence: "Consider putting a bowl of fruit out in the staff room and urge everyone to help themselves for free."
      },
      18: {
        group: "s2-employee-health-notes",
        answer: "fridge",
        explanation: "The note asks for something provided for staff use. The passage says employees can bring healthy lunches from home if there is a fridge in the break room, so ‘fridge’ completes the note.",
        skill: "Use the purpose in the note to identify the physical facility named in the passage.",
        evidence: "You can encourage employees to bring in healthy lunches from home by making sure that there is a fridge in the break room."
      },
      19: {
        group: "s2-employee-health-notes",
        answer: "bikes",
        explanation: "The note asks what employees need somewhere to leave. The exercise paragraph recommends installing racks for bikes in the staff car park, so ‘bikes’ is the object stored there.",
        skill: "Convert the facility into its purpose: racks are the place, while ‘bikes’ are what employees leave there.",
        evidence: "These might include: installing racks for bikes in your staff car park; encouraging employees to take part in fun runs and charity events; suggesting ‘walking meetings’ where people discuss business as they get fresh air and exercise; and putting in showers to assist those who ride or run to the workplace."
      },
      20: {
        group: "s2-employee-health-notes",
        answer: "showers",
        explanation: "The note asks for a facility for workers who exercise. The passage recommends putting in showers for employees who ride or run to work, so ‘showers’ is the exact one-word answer.",
        skill: "Match the group of people in the note to the facility specifically provided for them.",
        evidence: "These might include: installing racks for bikes in your staff car park; encouraging employees to take part in fun runs and charity events; suggesting ‘walking meetings’ where people discuss business as they get fresh air and exercise; and putting in showers to assist those who ride or run to the workplace."
      },
      21: {
        group: "s2-employee-health-notes",
        answer: "surveys",
        explanation: "The note asks how employers can find out how staff feel at work. The passage recommends employee surveys to obtain information about workplace morale, so ‘surveys’ is the answer.",
        skill: "Match the purpose ‘find out how employees feel’ to the passage’s ‘get information on morale’ and copy the method used.",
        evidence: "Some ways you can do this in the workplace include: running employee surveys to get valuable information on morale in the workplace; training managers on mental health strategies; offering rebates so employees are compensated for counselling if required; and refusing to accept any bullying and unprofessional behaviour in your workplace."
      },
      22: {
        group: "s2-kitchen-sentences",
        answer: "aprons",
        explanation: "The sentence asks what must be freshly washed along with chefs’ uniforms before every shift. The hygiene rule states that shirts and trousers must be freshly laundered, along with aprons if worn, so ‘aprons’ is correct.",
        skill: "Follow the list joined by ‘along with’ and copy the additional clothing item.",
        evidence: "The regulation chefs’ shirts and trousers are to be freshly laundered before starting a new shift, along with aprons if they are worn."
      },
      23: {
        group: "s2-kitchen-sentences",
        answer: "board",
        explanation: "The sentence asks what must be changed when staff start cutting a different type of food. The cross-contamination rule says staff must use a clean board each time they cut different types of food, so ‘board’ is the required item.",
        skill: "Identify the object controlled by the hygiene rule rather than the type of food that triggers the change.",
        evidence: "Cross-contamination between raw and cooked food must be avoided. To this end, staff must use a clean board each time they cut different types of food."
      },
      24: {
        group: "s2-kitchen-sentences",
        answer: "money",
        explanation: "The question asks what handling requires staff to clean their hands before touching food. The rule says staff should not touch money and then food without washing their hands, so ‘money’ is the answer.",
        skill: "Track the sequence of actions in the rule and identify what comes before the required hand washing.",
        evidence: "Staff should not touch money and then food without washing their hands in between."
      },
      25: {
        group: "s2-kitchen-sentences",
        answer: "appliances",
        explanation: "The sentence asks what kitchen workers must not try to repair. The safety rule says defective appliances must be switched off and staff must not try to fix them themselves, so ‘appliances’ is correct.",
        skill: "Match ‘repair’ in the question to ‘fix’ in the rule and copy the noun that receives that action.",
        evidence: "Loose clothing or jewellery must not be worn. Defective appliances must be turned off and not used — staff must not try to fix them themselves."
      },
      26: {
        group: "s2-kitchen-sentences",
        answer: "labels",
        explanation: "The sentence asks what is required to identify chemicals. The safety rule says chemical containers must have clear labels to prevent confusion about their contents, so ‘labels’ is the one-word answer.",
        skill: "Match the function ‘identify’ to the passage’s purpose ‘avoid confusion about the contents’ and copy the required item.",
        evidence: "If storing containers of chemicals in the kitchen, they must have clear labels, so as to avoid any confusion about the contents."
      },
      27: {
        group: "s2-kitchen-sentences",
        answer: "storeroom",
        explanation: "The question asks where staff are forbidden to take drinks from. The Breaks rule says beverages kept in the storeroom may not be consumed by staff, so ‘storeroom’ completes the sentence.",
        skill: "Separate the prohibited source of drinks from the permitted alternative: storeroom beverages are forbidden, while staff-room water is provided.",
        evidence: "Beverages kept in the storeroom may not be consumed by staff, but filtered water is provided free of charge in the staff room."
      },
      28: {
        group: "s3-clothkits-paragraphs",
        answer: "E",
        explanation: "The statement asks where Mawer says she wanted oversight of every stage of the business. In Paragraph E she says everyone from design to production should be part of a process she could witness, so E is the match.",
        skill: "Match the broad phrase ‘all the stages’ to a range such as ‘from design to production’ plus the idea of personally witnessing the process.",
        evidence: "I wanted to feel that everyone involved in the brand, from design to production, was part of a process I could witness."
      },
      29: {
        group: "s3-clothkits-paragraphs",
        answer: "C",
        explanation: "The statement asks for changing employment patterns among the population. Paragraph C says more women were going out to work and consequently sewing less for their children, so C contains the required employment change.",
        skill: "Look for a population trend rather than an event inside the company; ‘more women were going out to work’ is the decisive clue.",
        evidence: "More women were going out to work and sewing less for their children."
      },
      30: {
        group: "s3-clothkits-paragraphs",
        answer: "A",
        explanation: "The question asks for the original establishment date. Paragraph A states directly that the brand was founded in 1968, so A is the paragraph containing that date.",
        skill: "For date-location matching, identify exactly what the date refers to; ‘founded’ marks the establishment of the brand.",
        evidence: "The brand, founded in 1968, had by the late 1980s mostly vanished from people’s lives, but by a combination of determination and luck Kay Mawer brought it back."
      },
      31: {
        group: "s3-clothkits-paragraphs",
        answer: "E",
        explanation: "Paragraph E explains that making your own clothes increases appreciation of the craftsmanship and makes you treasure the finished garment more. Those are the benefits of sewing and then wearing the garment, so E is correct.",
        skill: "When the question asks for benefits, find the stated consequences of the activity rather than merely a mention of the activity itself.",
        evidence: "‘Making your own clothes gives you a greater appreciation of the craftsmanship in the construction of a garment,’ Mawer says. ‘When you know the process involved in making a skirt, you treasure it in a way you wouldn’t if you’d bought it from a mass-producing manufacturer."
      },
      32: {
        group: "s3-clothkits-mc",
        answer: "D",
        explanation: "Paragraph A says Mawer remembered Clothkits when a girlfriend mentioned the name while they were chatting. That is a conversation with someone she knew, so option D is correct; no shop, purchase or observed outfit caused the memory.",
        skill: "Translate the narrative event into the option category: ‘a girlfriend mentioned … while we were chatting’ equals a conversation with an acquaintance.",
        evidence: "I forgot about that skirt for a long time, but when a girlfriend mentioned the name Clothkits while we were chatting, it was as if a door suddenly opened on a moment in the past that resonated with vivid significance for me."
      },
      33: {
        group: "s3-clothkits-mc",
        answer: "A",
        explanation: "Paragraph B says Clothkits embodied the spirit of the late 1960s and 1970s. That means its designs reflected the attitudes and culture of that period, which is exactly option A.",
        skill: "Match an abstract paraphrase: ‘embodied the spirit of’ corresponds to ‘represented the attitudes of’ the time.",
        evidence: "Clothkits has always embodied the spirit of the late 1960s and 1970s."
      },
      34: {
        group: "s3-clothkits-mc",
        answer: "C",
        explanation: "Paragraph C explains that Freeman’s was a large corporate company whose ethos did not fit Clothkits’ alternative artistic values, and Clothkits was then made dormant. This supports C: Freeman’s was an unsuitable partner.",
        skill: "For a ‘why’ question, connect the stated incompatibility to the outcome instead of choosing earlier background problems that are merely mentioned.",
        evidence: "She sold the company to one of her suppliers, who then sold it on to Freeman’s, which ran Clothkits alongside its own brand for a while, using Kennedy’s impressive database, but its ethos as a big, corporate company did not sit well alongside the alternative and artistic values of Clothkits. In 1991, Clothkits was made dormant, and there the story might have ended, were it not for Mawer’s fascination with discovering what happened to Clothkits."
      },
      35: {
        group: "s3-clothkits-mc",
        answer: "C",
        explanation: "Paragraph E describes growing dissatisfaction with a disposable society and renewed interest in sewing and knitting. That means people are more concerned about throwing things away than before, so option C captures the writer’s point.",
        skill: "Identify the broad social trend in the paragraph and choose the option that paraphrases it, rather than an unsupported prediction about the company.",
        evidence: "The revival of Clothkits has also, of course, coincided with a growing sense of dissatisfaction at our disposable society, and the resulting resurgence of interest in skills such as sewing and knitting."
      },
      36: {
        group: "s3-clothkits-summary",
        answer: "fabric",
        explanation: "The summary says the company sold material with a pattern printed on it. Paragraph B describes Kennedy’s idea of printing a pattern straight on to coloured fabric, so ‘fabric’ is the exact one-word answer.",
        skill: "Use the verb phrase around the gap to identify the object receiving the printed pattern.",
        evidence: "Clothkits was created by the designer Anne Kennedy, who came up with the ingenious idea of printing a pattern straight on to coloured fabric so that a paper pattern was not needed."
      },
      37: {
        group: "s3-clothkits-summary",
        answer: "instructions",
        explanation: "The summary says the printed material came with something that enabled buyers to make garments. Paragraph B says it was accompanied by instructions explaining how to cut and sew the pieces, so ‘instructions’ is correct.",
        skill: "Match the purpose in the summary to the item that provides the method in the passage.",
        evidence: "It was accompanied by instructions that almost anyone could follow on how to cut the pieces out and sew them together."
      },
      38: {
        group: "s3-clothkits-summary",
        answer: "geometric",
        explanation: "The summary asks for the type of pattern on Kennedy’s first dress. Paragraph B says the initial design was a dress in a geometric stripe, so ‘geometric’ completes ‘a geometric pattern’.",
        skill: "Check grammatical fit: the gap before ‘pattern’ needs an adjective, and the passage supplies ‘geometric’.",
        evidence: "Its initial design was a dress in a geometric stripe in orange, pink, turquoise and purple."
      },
      39: {
        group: "s3-clothkits-summary",
        answer: "newspaper",
        explanation: "The summary says an article produced many orders. Paragraph B says the dress was featured in the Observer newspaper and Kennedy then received more than £2,000 in orders, so ‘newspaper’ is the category required by the summary.",
        skill: "Use the grammar before ‘article’ and the named publication in the passage to generalise to the required one-word category.",
        evidence: "It cost 25 shillings (£1.25), and after it was featured in the Observer newspaper, Kennedy received more than £2,000 worth of orders."
      },
      40: {
        group: "s3-clothkits-summary",
        answer: "knitwear",
        explanation: "The summary asks what else Kennedy sold as the business grew. Paragraph B says sew-your-own kits were the core business and were supplemented by knitwear, so ‘knitwear’ is the additional product.",
        skill: "Match ‘also sold’ to a contrast between the core product and the supplementary product named in the passage.",
        evidence: "Sew-your-own kits formed the core of the business, supplemented by knitwear."
      }
    }
  };
}());
