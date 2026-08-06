(function () {
  "use strict";

  window.IELTS19GTTest4StudyFeedback = {
  "version": 2,
  "terminology": {
    "testType": "General Training Reading",
    "sectionSingular": "Section",
    "sectionPlural": "Sections",
    "textSingular": "Text",
    "textPlural": "Texts"
  },
  "scoreGuide": {
    "title": "General Training Reading score guide",
    "intro": "Estimated IELTS General Training Reading bands. IELTS notes that exact boundaries can vary slightly between test versions.",
    "rows": [
      {
        "correctAnswers": "40",
        "band": "9"
      },
      {
        "correctAnswers": "39",
        "band": "8.5"
      },
      {
        "correctAnswers": "37–38",
        "band": "8"
      },
      {
        "correctAnswers": "36",
        "band": "7.5"
      },
      {
        "correctAnswers": "34–35",
        "band": "7"
      },
      {
        "correctAnswers": "32–33",
        "band": "6.5"
      },
      {
        "correctAnswers": "30–31",
        "band": "6"
      },
      {
        "correctAnswers": "27–29",
        "band": "5.5"
      },
      {
        "correctAnswers": "23–26",
        "band": "5"
      },
      {
        "correctAnswers": "19–22",
        "band": "4.5"
      },
      {
        "correctAnswers": "15–18",
        "band": "4"
      },
      {
        "correctAnswers": "12–14",
        "band": "3.5"
      },
      {
        "correctAnswers": "9–11",
        "band": "3"
      },
      {
        "correctAnswers": "0–8",
        "band": "Below 3"
      }
    ]
  },
  "taskGroups": [
    {
      "id": "s1-cafes",
      "section": 1,
      "controlHost": "#study-instruction-s1-cafes",
      "label": "Matching café reviews",
      "questions": [
        1,
        2,
        3,
        4,
        5
      ],
      "purpose": "Match each statement to the café review that expresses the same meaning.",
      "steps": [
        "Underline the distinctive opinion or detail in the statement.",
        "Scan the six café labels and reviews for a paraphrase of that idea.",
        "Read the full review before choosing the letter."
      ],
      "trap": "Several reviews mention popularity, atmosphere or coffee, so match the complete meaning rather than one shared word."
    },
    {
      "id": "s1-frog",
      "section": 1,
      "controlHost": "#study-instruction-s1-frog",
      "label": "True, False or Not Given",
      "questions": [
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14
      ],
      "purpose": "Decide whether each statement agrees with, contradicts or is not addressed by the development proposal.",
      "steps": [
        "Locate the sentence about the same facility or plan.",
        "Compare every important detail, including tense, quantity and who benefits.",
        "Choose NOT GIVEN only when the text does not confirm or contradict the claim."
      ],
      "trap": "A related facility may be mentioned without the specific detail in the statement."
    },
    {
      "id": "s2-institute",
      "section": 2,
      "controlHost": "#study-instruction-s2-institute",
      "label": "True, False or Not Given",
      "questions": [
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24
      ],
      "purpose": "Check each statement against the institute rules and facilities information.",
      "steps": [
        "Use the key noun in the statement to find the correct subsection.",
        "Compare limiting words such as all, only, free and unable.",
        "Separate a contradiction from information that is simply missing."
      ],
      "trap": "Words such as many, normally and may are weaker than all, always or must."
    },
    {
      "id": "s2-scholarships",
      "section": 2,
      "controlHost": "#study-instruction-s2-scholarships",
      "label": "Short-answer questions",
      "questions": [
        25,
        26,
        27
      ],
      "purpose": "Copy the exact answer from the scholarship information without exceeding the word limit.",
      "steps": [
        "Identify the category requested: duration, benefit or person.",
        "Locate the sentence containing the same condition.",
        "Copy no more than three words and/or a number, then check grammar and spelling."
      ],
      "trap": "Do not copy extra explanatory words or exceed the stated word limit."
    },
    {
      "id": "s3-summary",
      "section": 3,
      "controlHost": "#study-instruction-s3-summary",
      "label": "Summary completion",
      "questions": [
        28,
        29,
        30
      ],
      "purpose": "Complete the summary with exact one-word answers from the opening paragraph.",
      "steps": [
        "Predict the noun needed in each gap.",
        "Follow the summary in the same order as the passage.",
        "Copy ONE WORD ONLY and check spelling."
      ],
      "trap": "A broader category may fit the meaning, but IELTS requires the exact word used in the text."
    },
    {
      "id": "s3-people",
      "section": 3,
      "controlHost": "#study-instruction-s3-people",
      "label": "Matching statements with people",
      "questions": [
        31,
        32,
        33,
        34,
        35,
        36
      ],
      "purpose": "Match each view or claim to the person associated with it in the passage.",
      "steps": [
        "Underline the distinctive claim in the statement.",
        "Scan for the named speaker or person linked to that idea.",
        "Read the surrounding sentences to confirm the complete meaning."
      ],
      "trap": "Some people discuss the same broad topic, so match the precise opinion rather than the topic alone."
    },
    {
      "id": "s3-mc",
      "section": 3,
      "controlHost": "#study-instruction-s3-mc",
      "label": "Multiple choice",
      "questions": [
        37,
        38,
        39,
        40
      ],
      "purpose": "Choose the option that accurately paraphrases the writer’s or speaker’s point.",
      "steps": [
        "Read the question stem before the options.",
        "Summarise the relevant paragraph in your own words.",
        "Eliminate options that add, reverse or exaggerate information."
      ],
      "trap": "An option may repeat passage vocabulary while changing the original meaning."
    }
  ],
  "questions": {
    "1": {
      "group": "s1-cafes",
      "answer": "C",
      "explanation": "Review C describes the largest “small” coffee the reviewers had ever received. That directly matches a cup size being more generous than expected.",
      "skill": "Look for comparison language showing that the real size exceeded the label or expectation.",
      "evidence": "the biggest ‘small’ coffee we’ve ever had!",
      "evidenceRoot": "#text-s1-cafes"
    },
    "2": {
      "group": "s1-cafes",
      "answer": "E",
      "explanation": "Review E says the rolls now contain less filling and the coffee tastes watery, then predicts that customers will go elsewhere. These recent changes are therefore expected to damage the café.",
      "skill": "Follow the cause-and-effect link from a recent change to its predicted consequence.",
      "evidence": "Perhaps the company is trying to cut costs, but this will only lead to customers going elsewhere.",
      "evidenceRoot": "#text-s1-cafes"
    },
    "3": {
      "group": "s1-cafes",
      "answer": "F",
      "explanation": "The reviewers had difficulty finding Café Soloist because nothing outside showed that it was there. This is a clear complaint about missing signage.",
      "skill": "Translate a concrete problem into the category used in the question: no outside indication means inadequate signage.",
      "evidence": "There was nothing outside to indicate that it was there, which would have been helpful!",
      "evidenceRoot": "#text-s1-cafes"
    },
    "4": {
      "group": "s1-cafes",
      "answer": "C",
      "explanation": "Review C says the café was already crowded and is regularly used by people who live nearby. That is evidence of a strong local customer base.",
      "skill": "Match “residents in the area use regularly” with “strong local customer base”.",
      "evidence": "it quickly became clear to us that this is a place that residents in the area use regularly.",
      "evidenceRoot": "#text-s1-cafes"
    },
    "5": {
      "group": "s1-cafes",
      "answer": "B",
      "explanation": "Review B agrees with the positive local-media judgement that this café makes the best coffee in town. The reviewer therefore believes the public praise is deserved.",
      "skill": "Notice agreement phrases such as “are right in saying”, which confirm that praise is justified.",
      "evidence": "Local media are right in saying that this café makes the best cup of coffee in town",
      "evidenceRoot": "#text-s1-cafes"
    },
    "6": {
      "group": "s1-frog",
      "answer": "FALSE",
      "explanation": "The proposal has only been sent to the council for consideration, and the text says building may go ahead in the future. Work has not already started.",
      "skill": "Check the stage of a plan carefully: proposed or approved is not the same as construction having begun.",
      "evidence": "has now been passed to the local council for consideration and approval.",
      "evidenceRoot": "#text-s1-frog"
    },
    "7": {
      "group": "s1-frog",
      "answer": "TRUE",
      "explanation": "The text states that admission will not be limited to families living in Frog Valley. Children from outside the area can therefore attend.",
      "skill": "A negative construction such as “not limited to” can express the same positive meaning as “will take in from outside”.",
      "evidence": "admission will not be limited to families who live in the area.",
      "evidenceRoot": "#text-s1-frog"
    },
    "8": {
      "group": "s1-frog",
      "answer": "TRUE",
      "explanation": "Existing shops will be moved into one zone, and two additional shops—an organic farm shop and a vegan store—will be added. The total number will increase.",
      "skill": "Distinguish relocation from addition, and count any explicitly new facilities.",
      "evidence": "this will see the addition of an organic farm shop and a vegan store.",
      "evidenceRoot": "#text-s1-frog"
    },
    "9": {
      "group": "s1-frog",
      "answer": "FALSE",
      "explanation": "The community centre will provide a meeting place because clubs currently use whatever venues they can find. The text does not describe an existing social-club building that will be replaced.",
      "skill": "Check whether the claimed existing structure is actually named; the passage describes a new venue, not a replacement building.",
      "evidence": "clubs and societies that, until now, have had to meet wherever they can find a venue.",
      "evidenceRoot": "#text-s1-frog"
    },
    "10": {
      "group": "s1-frog",
      "answer": "NOT GIVEN",
      "explanation": "The text confirms that a swimming pool is planned, but it gives no information about whether residents will use it free of charge.",
      "skill": "Separate the existence of a facility from missing information about price or eligibility.",
      "evidence": "The pride of the centre will be a multi-gym with swimming pool",
      "evidenceRoot": "#text-s1-frog"
    },
    "11": {
      "group": "s1-frog",
      "answer": "TRUE",
      "explanation": "The planned office space will house organisations ranging from small start-ups to large local businesses. It is intended for different business sizes.",
      "skill": "Match a range such as “small … to large” with “different sizes”.",
      "evidence": "house anything from small startups to large existing local businesses.",
      "evidenceRoot": "#text-s1-frog"
    },
    "12": {
      "group": "s1-frog",
      "answer": "NOT GIVEN",
      "explanation": "The text says parking will be within office areas or in one car park, but it never states whether it will be underground.",
      "skill": "Do not infer a physical feature, such as underground parking, from a general mention of parking.",
      "evidence": "with dedicated car parking for office workers, either within each office area or in a single car park.",
      "evidenceRoot": "#text-s1-frog"
    },
    "13": {
      "group": "s1-frog",
      "answer": "FALSE",
      "explanation": "Residents requested dentistry and medical testing, but the text explicitly says there are no plans to expand the building for these services at present.",
      "skill": "Look for a direct negative statement that contradicts a proposed increase in services.",
      "evidence": "there are no plans to do this at present.",
      "evidenceRoot": "#text-s1-frog"
    },
    "14": {
      "group": "s1-frog",
      "answer": "NOT GIVEN",
      "explanation": "The passage says doctors will become available at weekends and in the evenings, but it does not say that the centre currently has too few doctors.",
      "skill": "Extended opening hours do not automatically prove a staff shortage.",
      "evidence": "it will be possible to see a doctor at weekends and in the evenings",
      "evidenceRoot": "#text-s1-frog"
    },
    "15": {
      "group": "s2-institute",
      "answer": "FALSE",
      "explanation": "The passage says many staff members have taught overseas, not all of them. The absolute word “all” makes the statement false.",
      "skill": "Treat quantifiers precisely: “many” cannot support “all”.",
      "evidence": "many of whom have taught overseas.",
      "evidenceRoot": "#text-s2-institute"
    },
    "16": {
      "group": "s2-institute",
      "answer": "TRUE",
      "explanation": "All courses are organised into ten-week modules, even though the number of modules differs between courses. The module length is equal.",
      "skill": "Separate the length of each module from the number of modules in a course.",
      "evidence": "Percil Training Institute provides courses in ten-week modules.",
      "evidenceRoot": "#text-s2-institute"
    },
    "17": {
      "group": "s2-institute",
      "answer": "FALSE",
      "explanation": "Assignments must be completed during the two-week breaks, so the text says vacations are not possible then. This contradicts being encouraged to take holidays.",
      "skill": "Look for an explicit prohibition that reverses the statement.",
      "evidence": "it is not possible to take vacations during this time.",
      "evidenceRoot": "#text-s2-institute"
    },
    "18": {
      "group": "s2-institute",
      "answer": "TRUE",
      "explanation": "The text says courses have varying needs and there are not necessarily common class hours across programmes. Timetables can therefore differ considerably.",
      "skill": "Match “no set hours across all programmes” with “different timetables”.",
      "evidence": "there are not necessarily any set hours for classes across all programmes.",
      "evidenceRoot": "#text-s2-institute"
    },
    "19": {
      "group": "s2-institute",
      "answer": "FALSE",
      "explanation": "With legitimate evidence of illness, a student may receive an achievement certificate only—not an attendance certificate.",
      "skill": "Pay attention to the exact type of certificate; related documents are not interchangeable.",
      "evidence": "In this case, an achievement certificate only will be issued.",
      "evidenceRoot": "#text-s2-institute"
    },
    "20": {
      "group": "s2-institute",
      "answer": "NOT GIVEN",
      "explanation": "The passage explains when restaurant bookings are required, but it does not state whether students need permission to bring guests.",
      "skill": "Booking requirements and permission to bring a guest are different issues.",
      "evidence": "No bookings are required for any of the eating places except the restaurant for Friday and Saturday dinner.",
      "evidenceRoot": "#text-s2-institute"
    },
    "21": {
      "group": "s2-institute",
      "answer": "NOT GIVEN",
      "explanation": "The opening times are said to appear below the timetable, but the passage does not provide the coffee lounge’s evening hours.",
      "skill": "Do not guess operating hours when the relevant timetable is not included in the passage.",
      "evidence": "The opening times of the snack bar, coffee lounge and restaurant are printed below your course timetable.",
      "evidenceRoot": "#text-s2-institute"
    },
    "22": {
      "group": "s2-institute",
      "answer": "TRUE",
      "explanation": "On public holidays, a restaurant dinner booking is possible if the group contains at least 20 people. This matches the statement.",
      "skill": "Confirm both conditions: the public holiday and the minimum group size.",
      "evidence": "a group booking may be made for the restaurant for dinner on such days, provided that there is a minimum of 20 people in the group.",
      "evidenceRoot": "#text-s2-institute"
    },
    "23": {
      "group": "s2-institute",
      "answer": "TRUE",
      "explanation": "The passage explicitly welcomes guests of students to use the swimming pool, although they cannot use the gymnasium.",
      "skill": "Read the whole rule so that a restriction on one facility does not hide permission for another.",
      "evidence": "Guests of Percil students are welcome to use the swimming pool",
      "evidenceRoot": "#text-s2-institute"
    },
    "24": {
      "group": "s2-institute",
      "answer": "FALSE",
      "explanation": "The doors are locked after 8.30 pm, but students can still enter by contacting the caretaker and showing a student card. Entry is possible.",
      "skill": "A locked door does not mean access is impossible when an alternative entry procedure is provided.",
      "evidence": "If you need to gain access to the Institute after this time, please contact the caretaker",
      "evidenceRoot": "#text-s2-institute"
    },
    "25": {
      "group": "s2-scholarships",
      "answer": "20 / twenty weeks",
      "explanation": "Scholarships are not available for courses shorter than 20 weeks. Therefore, the minimum eligible course length is 20 weeks.",
      "skill": "Convert “not less than” or “not shorter than” into the minimum value requested.",
      "evidence": "not offered for courses of less than 20 weeks’ duration.",
      "evidenceRoot": "#text-s2-scholarships"
    },
    "26": {
      "group": "s2-scholarships",
      "answer": "(airline) vouchers",
      "explanation": "Applicants travelling more than 2,500 kilometres receive airline vouchers towards their airfares. “Vouchers” or “airline vouchers” stays within the word limit.",
      "skill": "Copy the benefit named immediately after the distance condition.",
      "evidence": "If the distance exceeds this amount, you will be provided with airline vouchers.",
      "evidenceRoot": "#text-s2-scholarships"
    },
    "27": {
      "group": "s2-scholarships",
      "answer": "(the) scholarship holder",
      "explanation": "The passage states that travel costs for dependent children are the scholarship holder’s responsibility.",
      "skill": "When the question asks “who”, identify the person assigned responsibility in the source sentence.",
      "evidence": "Travel costs or support for dependent children are at the scholarship holder’s expense.",
      "evidenceRoot": "#text-s2-scholarships"
    },
    "28": {
      "group": "s3-summary",
      "answer": "maize",
      "explanation": "The opening paragraph says neat fields of maize disappeared when the farm was rewilded. “Maize” is the required one-word crop.",
      "skill": "Follow the summary sequence and copy the exact noun after “fields of”.",
      "evidence": "Neat fields of maize have been replaced",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "29": {
      "group": "s3-summary",
      "answer": "Africa",
      "explanation": "The new landscape is compared with the typical grasslands of Africa. The one-word place name completes the comparison.",
      "skill": "Use the preposition and comparison structure to predict a place name.",
      "evidence": "resembles the typical grasslands of Africa.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "30": {
      "group": "s3-summary",
      "answer": "butterflies",
      "explanation": "Knepp has more purple emperor butterflies than anywhere else in Britain, so “butterflies” completes the summary.",
      "skill": "Match the superlative idea “largest number” with “more … than anywhere else”.",
      "evidence": "more of the unusual purple emperor butterflies than anywhere else in Britain.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "31": {
      "group": "s3-people",
      "answer": "A",
      "explanation": "Burrell’s paragraph reports criticism that rewilding stops food production while the world population is growing. This is the objection described in the statement.",
      "skill": "Match the concern about nourishment to the speaker’s reference to stopping food production.",
      "evidence": "why are you stopping food production?",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "32": {
      "group": "s3-people",
      "answer": "G",
      "explanation": "Elaine Gilligan doubts that rewilding is viewed as important in a large urban area such as Birmingham. That supports the difficulty of involving city residents.",
      "skill": "Link a named city example to the broader idea of urban participation.",
      "evidence": "doubts whether it is seen as important in large urban areas like Birmingham.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "33": {
      "group": "s3-people",
      "answer": "D",
      "explanation": "Frans Vera demonstrated that natural grazing produces open glades mixed with wooded groves, rather than an entirely dense forest.",
      "skill": "Use the landscape description to challenge the earlier belief about dense forest.",
      "evidence": "a constantly changing pattern of open glades and wooded groves.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "34": {
      "group": "s3-people",
      "answer": "F",
      "explanation": "Wouter Helmer says less profitable land can become “adventure land” for an increasingly urban population. This matches turning low-yield fields into natural recreation areas.",
      "skill": "Match “less profitable lands” with fields that yield few crops, and “adventure land” with spaces people enjoy.",
      "evidence": "They leave the less profitable lands to become adventure land for an increasingly urban population.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "35": {
      "group": "s3-people",
      "answer": "E",
      "explanation": "David Balharry says policymakers and politicians will support rewilding only when local communities lead it. Local backing is therefore necessary to influence authorities.",
      "skill": "Track the condition introduced by “only when” and identify both the community and authority groups.",
      "evidence": "will only be championed by policymakers and politicians when it is led by local communities.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "36": {
      "group": "s3-people",
      "answer": "B",
      "explanation": "Leo Linnartz says Dutch people objected to nature development 30 years ago, but rewilding principles are now mainstream. Their acceptance increased over time.",
      "skill": "Look for a past-versus-present contrast that demonstrates changing attitudes.",
      "evidence": "many Dutch objected to ‘nature development’ 30 years ago but rewilding principles are now mainstream.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "37": {
      "group": "s3-mc",
      "answer": "A",
      "explanation": "The paragraph calls rewilding a pragmatic way to revive a struggling farm and says ecotourism earns as much profit as conventional farming did. Burrell therefore had clear financial reasons.",
      "skill": "Summarise the paragraph’s main reason instead of choosing an option based on one isolated detail.",
      "evidence": "For Burrell, rewilding has been a pragmatic way to revive the struggling family farm.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "38": {
      "group": "s3-mc",
      "answer": "C",
      "explanation": "Helmer says young people have a completely different relationship with nature and describes hunting with a camera and gathering experiences. These are new ways of interacting with the land.",
      "skill": "Use the examples after the general claim to identify the exact paraphrase. The passage also says none of the students wants to farm, ruling out option B.",
      "evidence": "They have a completely different relationship to nature to their parents or grandparents.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "39": {
      "group": "s3-mc",
      "answer": "C",
      "explanation": "Ted Green is concerned that intensive farming worsens flooding and carries fertile soil downriver and out to sea. This matches rain washing away productive soil.",
      "skill": "Connect “fertile earth” with productive soil and “swept downriver” with being washed away.",
      "evidence": "intensive farming can worsen flash flooding, and cause fertile earth to be swept downriver and out to sea.",
      "evidenceRoot": "#text-s3-rewilding"
    },
    "40": {
      "group": "s3-mc",
      "answer": "B",
      "explanation": "The final paragraph warns that enthusiasm for large-scale rewilding could cause people to neglect traditional protection of rare species in small reserves. Smaller conservation projects could be forgotten.",
      "skill": "Identify the risk created by the new trend, rather than assuming the writer rejects rewilding itself.",
      "evidence": "there’s a risk people will say, “Oh we don’t have to do any of that old stuff,”",
      "evidenceRoot": "#text-s3-rewilding"
    }
  }
};
}());
