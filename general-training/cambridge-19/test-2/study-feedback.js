(function () {
  "use strict";

  const matching = {
    purpose: "Match each statement to the text that expresses the same meaning, allowing for paraphrase.",
    steps: [
      "Underline the distinctive idea in the statement.",
      "Scan each option for the same meaning rather than the same words.",
      "Confirm every detail before selecting the letter."
    ],
    trap: "A text may share one topic word but still describe a different feature."
  };

  const tfng = {
    purpose: "Compare the complete statement with the relevant information in the text.",
    steps: [
      "Underline limits, time references and the main claim.",
      "Locate the relevant sentence and compare the whole meaning.",
      "Choose FALSE for a contradiction and NOT GIVEN when the required information is absent."
    ],
    trap: "Matching vocabulary is not enough; the relationship between the ideas must also match."
  };

  const completion = {
    purpose: "Use the grammar and meaning around each gap to locate and copy the exact word from the text.",
    steps: [
      "Predict the word type and meaning before scanning.",
      "Find the sentence that expresses the same idea.",
      "Copy ONE WORD ONLY and check spelling and grammar."
    ],
    trap: "A nearby related word may not fit the grammar or the exact meaning of the gap."
  };

  const multipleChoice = {
    purpose: "Identify the precise point made in the relevant part of the text.",
    steps: [
      "Read the question stem before the options.",
      "Find and summarise the relevant passage idea in your own words.",
      "Eliminate options that are only partly supported or change the focus."
    ],
    trap: "An option can repeat passage vocabulary while answering a different question."
  };

  const matchingPeople = {
    purpose: "Match each statement with the person whose words express that idea.",
    steps: [
      "Identify the key claim in the statement.",
      "Locate each named speaker and read the whole quotation.",
      "Choose the person whose meaning matches every part of the statement."
    ],
    trap: "Do not choose a person merely because they discuss the same general topic."
  };

  window.IELTS19GTTest2StudyFeedback = {
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
      { id: "s1-campsites", section: 1, controlHost: "#study-instruction-s1-campsites", label: "Matching campsite information", questions: [1,2,3,4,5,6,7], ...matching },
      { id: "s1-tfng", section: 1, controlHost: "#study-instruction-s1-tfng", label: "True / False / Not Given", questions: [8,9,10,11,12,13,14], ...tfng },
      { id: "s2-flowchart", section: 2, controlHost: "#study-instruction-s2-flowchart", label: "Flow-chart completion", questions: [15,16,17,18,19,20], ...completion },
      { id: "s2-sentences", section: 2, controlHost: "#study-instruction-s2-sentences", label: "Sentence completion", questions: [21,22,23,24,25,26,27], ...completion },
      { id: "s3-mc", section: 3, controlHost: "#study-instruction-s3-mc", label: "Multiple choice", questions: [28,29,30,31], ...multipleChoice },
      { id: "s3-people", section: 3, controlHost: "#study-instruction-s3-people", label: "Matching people", questions: [32,33,34,35], ...matchingPeople },
      { id: "s3-summary", section: 3, controlHost: "#study-instruction-s3-summary", label: "Summary completion", questions: [36,37,38,39], ...completion },
      { id: "s3-title", section: 3, controlHost: "#study-instruction-s3-title", label: "Best-title multiple choice", questions: [40], ...multipleChoice }
    ],
    questions: {
      1: { group: "s1-campsites", answer: "D", explanation: "South Turnbull is the only site that can become completely inaccessible. The phrase ‘can’t be reached at all’ directly matches ‘impossible to get to’, while ‘in periods of bad weather’ explains when this happens.", skill: "Matching an absolute accessibility claim to an exact paraphrase", evidence: "in periods of bad weather it can’t be reached at all", evidenceRoot: "#text-s1-campsites" },
      2: { group: "s1-campsites", answer: "A", explanation: "Prettycoat Farm is described as an ideal base for exploring the area by car. The listed destinations—rock museum, craft workshops and Gaydon Castle—correspond to the ‘various tourist spots’ in the question.", skill: "Linking a general destination statement to a list of examples", evidence: "an ideal base for exploring the area and driving to the rock museum, the craft workshops or Gaydon Castle", evidenceRoot: "#text-s1-campsites" },
      3: { group: "s1-campsites", answer: "C", explanation: "Oakerly Estate tells campers to pitch within a white boundary around the cliff edge. ‘Within the white line’ is a direct paraphrase of camping inside the marked zone.", skill: "Matching a safety instruction with its marked boundary", evidence: "pitch your tent within the white line around the cliff edge", evidenceRoot: "#text-s1-campsites" },
      4: { group: "s1-campsites", answer: "E", explanation: "Boxer Trepis attracts rock climbers who travel there specifically to attempt the surrounding 20-metre rockfaces. This is the particular physical challenge described in the question.", skill: "Identifying a visitor group from its purpose and activity", evidence: "especially attractive to rock climbers, who come here to camp from hundreds of miles away so that they can attempt the climb", evidenceRoot: "#text-s1-campsites" },
      5: { group: "s1-campsites", answer: "C", explanation: "The journey to Oakerly is difficult because of the narrow roads, but the writer says visitors will not be disappointed when they arrive. That contrast shows the destination is worth the difficult journey.", skill: "Using contrast to connect difficulty with a positive outcome", evidence: "You won’t be disappointed when you reach Oakerly, despite the problems of getting there by car on such narrow roads", evidenceRoot: "#text-s1-campsites" },
      6: { group: "s1-campsites", answer: "B", explanation: "Newgammon Wild opened recently and is known only by a small number of campers. ‘The handful of campers who know about it’ directly supports the idea that few people have heard of it.", skill: "Matching a quantity paraphrase to a small-number expression", evidence: "the handful of campers who know about it so far", evidenceRoot: "#text-s1-campsites" },
      7: { group: "s1-campsites", answer: "B", explanation: "The beaches near Newgammon Wild are reached by steep, narrow cliff steps, and visitors need good fitness and energy for the return. Those details show physical effort is necessary to enjoy the coast.", skill: "Combining access details to infer the required physical effort", evidence: "which can be accessed by steep, narrow cliff steps. You need a good level of fitness for these", evidenceRoot: "#text-s1-campsites" },

      8: { group: "s1-tfng", answer: "TRUE", explanation: "The water has reached a ‘critical level’ and the newsletter says action will be taken ‘immediately’. Both expressions support the statement that the problem is being treated as an emergency.", skill: "Recognising urgency through evaluative and time language", evidence: "reached a critical level. A decision has been taken to deal with this immediately", evidenceRoot: "#text-s1-newsletter" },
      9: { group: "s1-tfng", answer: "FALSE", explanation: "This year’s waterproof covering is explicitly temporary. The major building work is scheduled for next year, so the claim that a permanent repair will happen this year contradicts the text.", skill: "Comparing temporary and permanent time references", evidence: "sealed temporarily with a waterproof covering to prevent any further water getting in until the major building works take place next year", evidenceRoot: "#text-s1-newsletter" },
      10: { group: "s1-tfng", answer: "NOT GIVEN", explanation: "The newsletter warns residents to look out for wet-paint signs and keep children away, but it never reports that anyone has ignored those signs. The claimed past behaviour is therefore not given.", skill: "Separating an instruction from an unstated report of behaviour", evidence: "Please look out for signs indicating where the paint is wet. If you have children, make sure they keep away from the walls", evidenceRoot: "#text-s1-newsletter" },
      11: { group: "s1-tfng", answer: "TRUE", explanation: "The text says the spray liquid from the previous air fresheners stained the carpets. Staining is a form of damage, so the statement agrees with the newsletter.", skill: "Matching a general consequence to a specific example of damage", evidence: "the liquid in their spray stained the carpets", evidenceRoot: "#text-s1-newsletter" },
      12: { group: "s1-tfng", answer: "FALSE", explanation: "Residents must seal their rubbish bags, but the caretaker is responsible for collecting and disposing of them. The statement incorrectly transfers the removal responsibility to residents.", skill: "Distinguishing residents’ preparation duty from the caretaker’s role", evidence: "seal rubbish bags when they put them in the corridor for collection and disposal by the caretaker", evidenceRoot: "#text-s1-newsletter" },
      13: { group: "s1-tfng", answer: "TRUE", explanation: "The newsletter explicitly states that complaints have been received about drilling outside permitted hours. This directly supports the claim that residents have reported noisy-neighbour problems.", skill: "Matching a complaint report to its paraphrased problem", evidence: "we have received complaints from others about out-of-hours drilling", evidenceRoot: "#text-s1-newsletter" },
      14: { group: "s1-tfng", answer: "FALSE", explanation: "The permitted hours are followed by the absolute statement ‘There can be no exceptions’. Informing neighbours is polite but does not allow work outside those hours, so the statement is false.", skill: "Using an absolute rule to reject a proposed exception", evidence: "There can be no exceptions to this rule. If you are planning to undertake such work during these hours, it is still polite to inform your neighbours", evidenceRoot: "#text-s1-newsletter" },

      15: { group: "s2-flowchart", answer: "condition", explanation: "The gap follows ‘have a’, so it needs a singular countable noun. The text says a client may suffer from ‘a condition’ that makes dressing difficult, making condition the exact one-word answer.", skill: "Using article grammar to locate the exact singular noun", evidence: "they may suffer from a condition that prevents them from doing this easily", evidenceRoot: "#text-s2-care" },
      16: { group: "s2-flowchart", answer: "conversation", explanation: "The flow chart asks what is pleasant to have while cooking breakfast. The passage says this is a good time to enjoy ‘a conversation’, which fits both the meaning and the singular noun grammar.", skill: "Matching a social activity to the exact noun after ‘some’", evidence: "this is often a good time to enjoy a conversation and catch up on how they are feeling", evidenceRoot: "#text-s2-care" },
      17: { group: "s2-flowchart", answer: "hoovering", explanation: "The gap needs an example of housework before ‘and washing up’. The passage gives ‘hoovering the living room’ as its example, so hoovering is the required one-word gerund.", skill: "Selecting an example that fits a parallel activity list", evidence: "Even something as simple as hoovering the living room can make a huge difference", evidenceRoot: "#text-s2-care" },
      18: { group: "s2-flowchart", answer: "healthy", explanation: "The passage says care workers try to make the client’s midday meal healthy. The adjective directly describes lunch in the completed flow chart and must be copied exactly.", skill: "Using adjective position to identify the required descriptive word", evidence: "Care workers try to ensure this is healthy because it is so important to keep clients fit and well", evidenceRoot: "#text-s2-care" },
      19: { group: "s2-flowchart", answer: "shopping", explanation: "After preparing lunch, the care worker may go with the client to a supermarket to carry out their shopping. The flow-chart phrase ‘some shopping’ paraphrases this activity exactly.", skill: "Following the daily sequence to identify the next activity", evidence: "the care worker may help the client to carry out their shopping by going with them to the local supermarket", evidenceRoot: "#text-s2-care" },
      20: { group: "s2-flowchart", answer: "laundry", explanation: "The question asks for an outdoor activity involving leaving home. The passage gives taking the laundry to the launderette, so laundry is the exact one-word object after ‘doing their’.", skill: "Matching an example activity while checking the gap grammar", evidence: "taking the laundry to the launderette", evidenceRoot: "#text-s2-care" },

      21: { group: "s2-sentences", answer: "wellbeing", explanation: "The main benefit of reducing working hours is improved general health and wellbeing. The sentence already paraphrases health as feeling better physically, leaving wellbeing as the exact missing noun.", skill: "Separating two coordinated benefits to identify the missing noun", evidence: "an improvement in their general health and wellbeing", evidenceRoot: "#text-s2-balance" },
      22: { group: "s2-sentences", answer: "injuries", explanation: "The text says a comfortable workstation minimises the chance of injuries. The question paraphrases the setup advice as checking the chair, work surface and screen, so injuries is the required plural noun.", skill: "Linking ergonomic advice to the consequence it prevents", evidence: "this will help to minimise the chance of any injuries", evidenceRoot: "#text-s2-balance" },
      23: { group: "s2-sentences", answer: "realistic", explanation: "The passage recommends setting goals but immediately warns that they should be realistic because unattainable goals damage confidence. The adjective realistic completes the sentence exactly.", skill: "Using a contrast warning to select the correct adjective", evidence: "Remember though, to make these realistic, because setting an unattainable goal is the quickest way to damage your confidence", evidenceRoot: "#text-s2-balance" },
      24: { group: "s2-sentences", answer: "prioritise / prioritize", explanation: "When people are juggling many pieces of work, the passage says learning to prioritise is key. After ‘the ability to’, the base verb prioritise fits the grammar; the scorer also accepts the American spelling prioritize.", skill: "Using infinitive grammar and an explicit key-skill statement", evidence: "if you’re juggling numerous pieces of work on a daily basis, learning to prioritise is key", evidenceRoot: "#text-s2-balance" },
      25: { group: "s2-sentences", answer: "productivity", explanation: "Having nothing enjoyable to anticipate can become overwhelming and ultimately hinder productivity. The question paraphrases this as giving up treats and asks what decreases, so productivity is the exact noun.", skill: "Tracing a negative cause to its stated work-related effect", evidence: "this can easily become overwhelming and ultimately hinder your productivity", evidenceRoot: "#text-s2-balance" },
      26: { group: "s2-sentences", answer: "holiday", explanation: "The passage advises people to take their annual holiday entitlement instead of giving it up. In the question, holiday is the one word that completes ‘holiday allowance’ and preserves the original meaning.", skill: "Matching an entitlement phrase to its one-word modifier", evidence: "make sure you take your annual holiday entitlement", evidenceRoot: "#text-s2-balance" },
      27: { group: "s2-sentences", answer: "pets", explanation: "The final paragraph lists family, friends and favourite pets as important companions and says time with loved ones helps people unwind. Pets is therefore the exact plural noun completing the list.", skill: "Completing a paraphrased list from the passage’s final examples", evidence: "Family, friends and favourite pets are the ultimate life enhancers", evidenceRoot: "#text-s2-balance" },

      28: { group: "s3-mc", answer: "D", explanation: "The writer says only a few cities have reduced childhood obesity and adds that, as in Amsterdam, Leeds’ largest decline is among deprived families. This shared pattern of success makes option D correct.", skill: "Comparing two cities to identify the stated similarity", evidence: "As in Amsterdam, the decline in Leeds is most marked among families living in the most deprived areas", evidenceRoot: "#text-s3-henry" },
      29: { group: "s3-mc", answer: "B", explanation: "Susan Jebb calls the improvement among the most deprived children ‘startling’. That word expresses strong surprise, so the option saying she was amazed by the figures best matches her reaction.", skill: "Translating an evaluative quotation into the matching option", evidence: "‘The improvement in the most deprived children in Leeds is startling,’ said Susan Jebb", evidenceRoot: "#text-s3-henry" },
      30: { group: "s3-mc", answer: "D", explanation: "The passage reports that the biggest decline is 6.4% in the reception class, whose children are about four years old. This supports the option that the youngest children show the greatest reduction.", skill: "Combining a superlative statistic with an age reference", evidence: "The biggest decline in obesity in Leeds is 6.4% in the reception class, at about the age of four", evidenceRoot: "#text-s3-henry" },
      31: { group: "s3-mc", answer: "C", explanation: "The 15 places are introduced as Leeds’ closest comparable neighbours. The next sentence says obesity rates there have not shifted, directly supporting the option that their levels have remained the same since the study began.", skill: "Following a reference word from a list to its shared result", evidence: "The obesity rates there and across the country have not shifted", evidenceRoot: "#text-s3-henry" },

      32: { group: "s3-people", answer: "C", explanation: "Janice Burberry says Leeds wanted to focus on prevention because obesity is very difficult to tackle once it has taken hold. This matches the aim of stopping weight gain before it became a serious problem.", skill: "Matching a prevention aim to the speaker who explains it", evidence: "Janice Burberry, the head of public health at Leeds city council, said the early years were a good time to intervene to support families", evidenceRoot: "#text-s3-henry" },
      33: { group: "s3-people", answer: "A", explanation: "Susan Jebb says the fall is a genuine trend because it covers four years rather than one unusual data point. This directly matches the statement that obesity levels have fallen consistently over time.", skill: "Linking a trend claim to duration and repeated data", evidence: "‘This is four years, not one rogue data point,’ she said", evidenceRoot: "#text-s3-henry" },
      34: { group: "s3-people", answer: "D", explanation: "Seema Kennedy recognises how difficult healthy choices can be for busy parents and says anything that makes the process easier is ‘a real lifeline’. That is the same idea as something simplifying the struggle being very helpful.", skill: "Matching a metaphorical benefit to the speaker’s practical concern", evidence: "anything that can make it easier is a real lifeline", evidenceRoot: "#text-s3-henry" },
      35: { group: "s3-people", answer: "C", explanation: "Janice Burberry says parents are experts in their own lives and know what they can and cannot achieve. This supports the statement that parents are realistic about their capacity to make lifestyle changes.", skill: "Matching self-knowledge and limits to a realism claim", evidence: "Parents are experts in their own lives, and they know what they can and can’t achieve", evidenceRoot: "#text-s3-henry" },

      36: { group: "s3-summary", answer: "boundaries", explanation: "The summary asks what parents set firmly during routines such as meals and bedtimes. The passage repeatedly says Henry helps parents set boundaries, so boundaries is the exact plural noun.", skill: "Matching a summary verb phrase to a repeated programme aim", evidence: "supports parents in setting boundaries for their children", evidenceRoot: "#text-s3-henry" },
      37: { group: "s3-summary", answer: "authoritative", explanation: "Kim Roberts contrasts authoritarian and permissive parenting with Henry’s preferred third approach, authoritative parenting. The comparative phrase ‘become more’ requires the adjective authoritative.", skill: "Distinguishing similar parenting terms through explicit contrast", evidence: "The programme encourages authoritative rather than authoritarian parenting", evidenceRoot: "#text-s3-henry" },
      38: { group: "s3-summary", answer: "permissive", explanation: "The text defines permissive parenting as asking children what they want to do, which represents total freedom of choice. Therefore permissive is the exact adjective describing the style in the summary.", skill: "Matching a definition to the correct technical adjective", evidence: "‘Permissive parenting is asking children what they want to do", evidenceRoot: "#text-s3-henry" },
      39: { group: "s3-summary", answer: "story", explanation: "The passage gives bedtime as an example of controlled choice: children decide where they want to read their story. The singular noun story completes the summary within the one-word limit.", skill: "Extracting the object from a concrete example of controlled choice", evidence: "they are asked where they want to read their story beforehand", evidenceRoot: "#text-s3-henry" },
      40: { group: "s3-title", answer: "A", explanation: "The article reports Leeds’ reduction in childhood obesity, examines Henry as a possible cause and explains how the programme works. Option A covers this overall achievement-focused discussion; the other titles are too narrow or inaccurate.", skill: "Selecting a title that represents the whole article’s purpose", evidence: "Leeds has become the first city in the UK to report a drop in childhood obesity after introducing a programme called ‘Henry’", evidenceRoot: "#text-s3-henry" }
    }
  };
}());
