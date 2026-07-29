(function () {
  "use strict";

  const tfng = {
    purpose: "Compare the complete statement with the relevant information in the text.",
    steps: [
      "Underline limits, times and the main claim in the statement.",
      "Find the relevant sentence and compare the whole meaning.",
      "Choose FALSE for a contradiction and NOT GIVEN only when the required information is absent."
    ],
    trap: "A shared word does not make the statement true; every important detail must agree."
  };

  const matching = {
    purpose: "Match each statement to the review that expresses the same meaning.",
    steps: [
      "Underline the distinctive detail in the statement.",
      "Scan the reviews for a paraphrase of that detail.",
      "Read the whole review before selecting the letter."
    ],
    trap: "Several reviews mention size, sleeves or colour, so confirm the exact relationship rather than one repeated word."
  };

  const completion = {
    purpose: "Use the grammar and meaning around each gap to locate and copy the exact word from the text.",
    steps: [
      "Predict the word type and meaning before scanning.",
      "Find the sentence that expresses the same idea.",
      "Copy ONE WORD ONLY and check spelling and grammar."
    ],
    trap: "A nearby related word may not fit the grammar or the exact meaning of the completed sentence."
  };

  const headings = {
    purpose: "Choose the heading that captures the main purpose of each section, not one supporting detail.",
    steps: [
      "Summarise the section in a few words after reading it.",
      "Compare that summary with every remaining heading.",
      "Reject headings that describe only one example or a topic not developed in the section."
    ],
    trap: "A heading can contain vocabulary from the section but still miss its central message."
  };

  const multipleChoice = {
    purpose: "Identify the precise point made by the writer and eliminate options that alter or narrow it.",
    steps: [
      "Read the question stem before the options.",
      "Locate and summarise the relevant passage idea in your own words.",
      "Choose the option that matches the whole idea, not just familiar vocabulary."
    ],
    trap: "An option may sound reasonable or repeat passage words while still changing the writer’s point."
  };

  window.IELTS19GTTest1StudyFeedback = {
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
      { id: "s1-tram-tfng", section: 1, controlHost: "#study-instruction-s1-tram-tfng", label: "True / False / Not Given", questions: [1,2,3,4,5,6,7], ...tfng },
      { id: "s1-knitwear", section: 1, controlHost: "#study-instruction-s1-knitwear", label: "Matching customer reviews", questions: [8,9,10,11,12,13,14], ...matching },
      { id: "s2-leadership", section: 2, controlHost: "#study-instruction-s2-leadership", label: "Sentence completion", questions: [15,16,17,18,19,20,21], ...completion },
      { id: "s2-resigning", section: 2, controlHost: "#study-instruction-s2-resigning", label: "Note completion", questions: [22,23,24,25,26,27], ...completion },
      { id: "s3-headings", section: 3, controlHost: "#study-instruction-s3-headings", label: "Matching headings", questions: [28,29,30,31,32], ...headings },
      { id: "s3-summary", section: 3, controlHost: "#study-instruction-s3-summary", label: "Summary completion", questions: [33,34,35,36,37], ...completion },
      { id: "s3-mc", section: 3, controlHost: "#study-instruction-s3-mc", label: "Multiple choice", questions: [38,39,40], ...multipleChoice }
    ],
    questions: {
      1: { group: "s1-tram-tfng", answer: "FALSE", explanation: "The first tram leaves at 6.30 am, which is half an hour after the first city bus. Therefore the buses begin earlier, not later, so the statement contradicts the text.", skill: "Comparing two start times expressed through a time difference", evidence: "half an hour after the first city bus service", evidenceRoot: "#text-s1-tram" },
      2: { group: "s1-tram-tfng", answer: "FALSE", explanation: "The direct airport-to-city-centre service runs only until 7.30 pm. After that, the trams follow an evening schedule to the main railway station, so the statement’s destination and time are wrong.", skill: "Tracking a timetable change and its new destination", evidence: "Trams from the airport to the city centre start running at 6.15 am and leave every fifteen minutes until 7.30 pm when the evening schedule takes over", evidenceRoot: "#text-s1-tram" },
      3: { group: "s1-tram-tfng", answer: "NOT GIVEN", explanation: "The text says that the 207 airport bus runs hourly through the night, but it does not list its stops. There is no information confirming or denying that it stops at the main railway station.", skill: "Distinguishing route frequency from unstated stop information", evidence: "the number 207 airport bus runs every hour through the night", evidenceRoot: "#text-s1-tram" },
      4: { group: "s1-tram-tfng", answer: "TRUE", explanation: "Passengers are told to check their route and buy the correct-price ticket. This shows that the fare depends on the journey being made.", skill: "Inferring variable prices from route-specific ticket instructions", evidence: "Check your route and make sure you buy the correct price ticket", evidenceRoot: "#text-s1-tram" },
      5: { group: "s1-tram-tfng", answer: "FALSE", explanation: "Bicycles are permitted only up to 7.30 am and then again from 10 am. The period between 7.30 and 10 is excluded, so the statement reverses the rule.", skill: "Reading the boundaries of permitted time periods", evidence: "up to 7.30 am, between 10 am and 2.30 pm and after 7 pm", evidenceRoot: "#text-s1-tram" },
      6: { group: "s1-tram-tfng", answer: "NOT GIVEN", explanation: "Festivals are mentioned because trams carry extra passengers and bicycles may be prohibited. The text does not say that additional trams are put into service.", skill: "Separating increased passenger numbers from an unstated increase in services", evidence: "Festivals and other large events may also mean that bicycles are prohibited as trams carry extra passengers at these times", evidenceRoot: "#text-s1-tram" },
      7: { group: "s1-tram-tfng", answer: "NOT GIVEN", explanation: "Cyclists are instructed not to block entrances or exits, but the text gives no consequence for doing so. It never says they may be required to leave the tram.", skill: "Separating a rule from an unstated penalty", evidence: "ensure they do not obstruct the entrance, exit or any other area of public access", evidenceRoot: "#text-s1-tram" },

      8: { group: "s1-knitwear", answer: "B", explanation: "Davina says that the purple sweater was pretty but lighter in the website picture than in reality. This is the only review where the colour does not match the image.", skill: "Matching a colour discrepancy to the correct reviewer", evidence: "I expected a lighter shade from the picture", evidenceRoot: "#text-s1-knitwear" },
      9: { group: "s1-knitwear", answer: "A", explanation: "Mary-Anne says she spent a while considering the purchase because of the price. This directly matches taking time to decide.", skill: "Matching a decision delay to its stated reason", evidence: "I spent a while thinking about buying this sweater because of the price", evidenceRoot: "#text-s1-knitwear" },
      10: { group: "s1-knitwear", answer: "C", explanation: "Naga selected medium, found it too tight and exchanged it. This shows that her first size choice was wrong.", skill: "Following a purchase, fit problem and exchange sequence", evidence: "I opted for the medium, but it was too tight so I exchanged it", evidenceRoot: "#text-s1-knitwear" },
      11: { group: "s1-knitwear", answer: "E", explanation: "Laura bought two colours intending to return one, but then kept both. Her original return plan changed after the purchase.", skill: "Identifying a changed intention from contrast", evidence: "with every intention of sending one of them back. That didn’t happen, of course", evidenceRoot: "#text-s1-knitwear" },
      12: { group: "s1-knitwear", answer: "A", explanation: "Mary-Anne normally takes medium but deliberately chose large. Therefore she bought a larger size than usual.", skill: "Comparing a usual size with the size actually purchased", evidence: "I tend to take medium but went for large", evidenceRoot: "#text-s1-knitwear" },
      13: { group: "s1-knitwear", answer: "E", explanation: "Laura says the sweaters work with jeans and are also stylish enough for work. These are casual and smart settings respectively.", skill: "Matching examples to the broader categories smart and casual", evidence: "lovely to wear with jeans but also stylish enough to wear to work", evidenceRoot: "#text-s1-knitwear" },
      14: { group: "s1-knitwear", answer: "C", explanation: "Naga was unsure whether the striped olive-green sweater would look right on her. This directly matches concern that it might not suit her.", skill: "Matching an uncertainty about appearance to a paraphrase", evidence: "I wasn’t sure it was going to look right on me", evidenceRoot: "#text-s1-knitwear" },

      15: { group: "s2-leadership", answer: "trust", explanation: "The text says that first impressions form in the opening weeks, so a new leader must work hard to earn the staff’s trust. Trust is the exact one-word noun needed after ‘the’.", skill: "Matching an early leadership priority to the exact noun", evidence: "work hard to earn their trust", evidenceRoot: "#text-s2-leadership" },
      16: { group: "s2-leadership", answer: "goals", explanation: "A leader must set bold goals that everyone understands, supports and is willing to work towards. Goals is the exact plural noun that fits the sentence.", skill: "Locating a plural noun through paraphrased staff commitment", evidence: "set bold goals", evidenceRoot: "#text-s2-leadership" },
      17: { group: "s2-leadership", answer: "strategy", explanation: "Staff should participate in designing a new strategy when change is needed. The question paraphrases ‘new’ as ‘different’, leaving strategy as the required noun.", skill: "Matching a paraphrased change process to an exact noun", evidence: "participating in the design of a new strategy", evidenceRoot: "#text-s2-leadership" },
      18: { group: "s2-leadership", answer: "solutions", explanation: "Leaders should allow staff time to develop new ideas and solutions for new problems. The plural noun solutions completes ‘find solutions to them’ naturally and exactly.", skill: "Matching problems with the plural noun describing their answers", evidence: "new ideas and solutions that will fix new problems", evidenceRoot: "#text-s2-leadership" },
      19: { group: "s2-leadership", answer: "pride", explanation: "The leader should honour the business’s pioneers and create a sense of pride throughout the organisation. Pride is the exact noun required after ‘feel’.", skill: "Locating an organisational feeling linked to past achievements", evidence: "instil a sense of pride across the organization", evidenceRoot: "#text-s2-leadership" },
      20: { group: "s2-leadership", answer: "risk", explanation: "The passage says leaders must accept that some risk may be necessary. The question paraphrases this as agreeing to a certain degree of risk.", skill: "Matching a cautious paraphrase to the exact business noun", evidence: "some risk may be required if the situation calls for it", evidenceRoot: "#text-s2-leadership" },
      21: { group: "s2-leadership", answer: "future", explanation: "Staff are inspired when their leader is genuinely excited about the organisation’s future. Future is the exact noun following ‘the’ in both the text and the question.", skill: "Matching enthusiasm about what lies ahead to the exact noun", evidence: "genuinely thrilled about its future", evidenceRoot: "#text-s2-leadership" },

      22: { group: "s2-resigning", answer: "temptations", explanation: "The opening paragraph describes angry or critical ways of leaving and says these temptations must be resisted. The plural form is required after ‘all’.", skill: "Linking examples of unprofessional behaviour to their collective noun", evidence: "you need to resist these temptations", evidenceRoot: "#text-s2-resigning" },
      23: { group: "s2-resigning", answer: "completion", explanation: "Before meeting the manager, the employee should prepare status updates and suggestions concerning the completion of ongoing tasks. Completion is the exact noun after ‘their’.", skill: "Matching project-finish advice to a formal noun", evidence: "suggestions concerning completion", evidenceRoot: "#text-s2-resigning" },
      24: { group: "s2-resigning", answer: "reference", explanation: "The employee is advised to ask what kind of reference the employer or line manager can provide. Reference is the exact singular noun requested.", skill: "Locating employment-document information in a list of meeting topics", evidence: "Ask about a reference too", evidenceRoot: "#text-s2-resigning" },
      25: { group: "s2-resigning", answer: "disruption", explanation: "Professional preparation should ensure a smooth transition and minimise disruption to the employer. The note paraphrases the employer as the organisation.", skill: "Matching a smooth handover with the problem it should minimise", evidence: "minimise disruption to your employer", evidenceRoot: "#text-s2-resigning" },
      26: { group: "s2-resigning", answer: "failings", explanation: "The resignation letter should not discuss the failings of the company or the boss. Failings is the exact plural noun after ‘any’.", skill: "Identifying prohibited criticism in resignation-letter advice", evidence: "Don’t be tempted to address the failings of the company or your boss", evidenceRoot: "#text-s2-resigning" },
      27: { group: "s2-resigning", answer: "skills", explanation: "The second paragraph of the letter can mention opportunities to develop skills. The question paraphrases develop as improve, so skills is the exact answer.", skill: "Matching a career-development paraphrase to the passage noun", evidence: "opportunities to develop skills", evidenceRoot: "#text-s2-resigning" },

      28: { group: "s3-headings", answer: "vi", explanation: "Section A focuses on the exceptionally rapid global growth of emojis, from their 2011 beginnings to use by most of the online population and billions sent daily. Heading vi captures that spread and new form of interaction.", skill: "Selecting a heading from the section’s dominant growth theme", evidence: "As a form of global communication, emojis only began their growth in 2011", evidenceRoot: "#text-s3-emojis" },
      29: { group: "s3-headings", answer: "iii", explanation: "Section B explains that language changes to express identity and absorb new concepts, with words and emojis both filling new communicative needs. Heading iii summarises this shared function.", skill: "Connecting examples of words and emojis to one central purpose", evidence: "the gaps in our vocabulary are being filled not simply by new words, but by an absolutely new system of expression", evidenceRoot: "#text-s3-emojis" },
      30: { group: "s3-headings", answer: "viii", explanation: "Section C explains that short smartphone messages can lose emotional information and that emojis restore facial-expression-like framing. Heading viii therefore states their value for making feelings clear.", skill: "Identifying the problem-solution relationship that controls a section", evidence: "Emojis are a means of restoring this emotional framing to an interaction", evidenceRoot: "#text-s3-emojis" },
      31: { group: "s3-headings", answer: "i", explanation: "Section D argues that emojis contain built-in obsolescence because they are repeatedly redesigned and expanded, limiting their usefulness over time. Heading i captures this short lifespan.", skill: "Recognising obsolescence as the main idea behind repeated updates", evidence: "emojis have something akin to a built-in obsolescence", evidenceRoot: "#text-s3-emojis" },
      32: { group: "s3-headings", answer: "v", explanation: "Section E lists emojis in politics, marketing, art, entertainment, fashion, architecture and commerce, then explains what their popularity reveals about us. Heading v includes both their fields of use and their wider meaning.", skill: "Choosing a heading that covers both examples and their implication", evidence: "they’ve become implicated in almost all aspects of modern society, from politics and marketing to art and entertainment", evidenceRoot: "#text-s3-emojis" },

      33: { group: "s3-summary", answer: "dated", explanation: "The writer predicts that the ‘face with tears of joy’ will appear dated in a few years. Dated is the exact adjective needed after ‘will seem’.", skill: "Using linking verbs to predict an adjective and copy it exactly", evidence: "will also appear to be dated in a few years", evidenceRoot: "#text-s3-emojis" },
      34: { group: "s3-summary", answer: "society", explanation: "The emoji’s changing status offers insight into the way society is evolving. Society is the exact singular noun after ‘developments in’.", skill: "Matching ‘evolving’ with the summary noun ‘developments’", evidence: "the way that society is evolving", evidenceRoot: "#text-s3-emojis" },
      35: { group: "s3-summary", answer: "history", explanation: "The emoji acts as a lens for viewing the history of human communication and predicting its future. The summary keeps the same contrast, so history is required.", skill: "Using a past–future contrast to locate the missing noun", evidence: "view the history of human communication, and to predict its future", evidenceRoot: "#text-s3-emojis" },
      36: { group: "s3-summary", answer: "identity", explanation: "Language is adapted by groups and generations as an expression of identity and their changing sense of self. Identity is the exact noun that fits the summary.", skill: "Matching ‘sense of self’ to its abstract noun", evidence: "As an expression of identity, language is adapted by different groups and different generations", evidenceRoot: "#text-s3-emojis" },
      37: { group: "s3-summary", answer: "concepts", explanation: "Language must continually assimilate fresh concepts as they develop. The plural noun concepts completes ‘allow new concepts to be included’.", skill: "Matching a paraphrased verb while preserving the exact object noun", evidence: "assimilate fresh concepts as these evolve", evidenceRoot: "#text-s3-emojis" },

      38: { group: "s3-mc", answer: "B", explanation: "The writer says Words of the Year reflect a particular time and often fade from people’s consciousness soon afterwards. Option B accurately paraphrases being quickly forgotten.", skill: "Matching a multiple-choice option to a time-based paraphrase", evidence: "once that time has passed, they fade from people’s consciousness almost as quickly as they arose", evidenceRoot: "#text-s3-emojis" },
      39: { group: "s3-mc", answer: "A", explanation: "Emojis are routinely enhanced, redesigned and expanded, and the writer immediately says this artificially limits their usefulness. Option A captures this constant change.", skill: "Linking a stated cause directly to its consequence", evidence: "The emojis you have on your phone now will undergo subtle redesigns over the course of time, and extra characters will be added. Because of this, their usefulness is artificially limited", evidenceRoot: "#text-s3-emojis" },
      40: { group: "s3-mc", answer: "D", explanation: "Across the text, emojis are used to examine changes in language, technology, communication and society. The conclusion says they help us understand our relationship with technology, society and ourselves, which is exactly the broad focus of option D.", skill: "Choosing a subtitle that represents the whole text rather than one section", evidence: "help us to understand our relationship with technology, society and ourselves", evidenceRoot: "#text-s3-emojis" }
    }
  };
}());
