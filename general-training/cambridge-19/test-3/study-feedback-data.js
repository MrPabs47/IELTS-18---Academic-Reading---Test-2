(function () {
  "use strict";

  window.IELTS19GTTest3StudyFeedback = {
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
      {
        id: "s1-films", section: 1, controlHost: "#study-instruction-s1-films", label: "Matching film reviews",
        questions: [1,2,3,4,5,6,7,8], purpose: "Match each statement to the review that expresses the same meaning.",
        steps: ["Underline the distinctive opinion or reaction in the statement.", "Scan the five reviews for a paraphrase of that idea.", "Read the whole review before choosing the letter."],
        trap: "Several reviews discuss acting or dialogue, so match the complete meaning rather than one shared word."
      },
      {
        id: "s1-sports", section: 1, controlHost: "#study-instruction-s1-sports", label: "Matching sports-event information",
        questions: [9,10,11,12,13,14], purpose: "Match each activity detail to the advertisement that contains the same information.",
        steps: ["Identify the specific experience, person or benefit in the statement.", "Scan the advertisements for a synonym or concrete example.", "Confirm who performs the action and the order in which it happens."],
        trap: "An event may share the same broad topic but not the precise experience described."
      },
      {
        id: "s2-redundancy", section: 2, controlHost: "#study-instruction-s2-redundancy", label: "Note completion",
        questions: [15,16,17,18,19,20,21], purpose: "Use the grammar and meaning around each gap to copy one exact word from the text.",
        steps: ["Predict the word type needed in the gap.", "Find the sentence that paraphrases the note.", "Copy ONE WORD ONLY and check spelling and grammar."],
        trap: "A nearby related word may fit the topic but not the grammar or exact meaning."
      },
      {
        id: "s2-restaurant", section: 2, controlHost: "#study-instruction-s2-restaurant", label: "Sentence completion",
        questions: [22,23,24,25,26,27], purpose: "Complete each sentence with the exact word or two-word phrase used in the instructions.",
        steps: ["Use the words around the gap to predict the answer form.", "Locate the matching rule or example in the text.", "Copy NO MORE THAN TWO WORDS and check the completed sentence."],
        trap: "Do not add articles or explanatory words that exceed the word limit."
      },
      {
        id: "s3-mc", section: 3, controlHost: "#study-instruction-s3-mc", label: "Multiple choice",
        questions: [28,29,30,31,32], purpose: "Identify the precise point made in the named paragraph and eliminate altered meanings.",
        steps: ["Read the question stem before the options.", "Summarise the relevant paragraph in your own words.", "Choose the option that matches the whole idea, not one familiar phrase."],
        trap: "An option may sound plausible but introduce a detail the paragraph does not state."
      },
      {
        id: "s3-paragraphs", section: 3, controlHost: "#study-instruction-s3-paragraphs", label: "Matching information to paragraphs",
        questions: [33,34,35,36], purpose: "Find the paragraph containing the specific detail described in each statement.",
        steps: ["Underline the unique detail in the statement.", "Scan paragraph openings and key nouns for the same concept.", "Read the full paragraph to confirm the exact information."],
        trap: "Choose the paragraph containing the detail itself, not a later paragraph that discusses a related conclusion."
      },
      {
        id: "s3-summary", section: 3, controlHost: "#study-instruction-s3-summary", label: "Summary completion",
        questions: [37,38,39,40], purpose: "Use the summary grammar and passage sequence to copy the exact one-word answers.",
        steps: ["Predict the part of speech required by each gap.", "Follow the summary sequence through Paragraphs E to G.", "Copy ONE WORD ONLY and check that the sentence remains grammatical."],
        trap: "A synonym may express the right idea but IELTS requires the word used in the text."
      }
    ],
    questions: {
      1: { group: "s1-films", answer: "E", explanation: "Uplands has two lead actors whose strengths are in thrillers rather than this kind of film. That directly supports the idea that some cast members are unsuitable for their roles.", skill: "Matching criticism of actors to role suitability", evidence: "the two lead actors are at their best in thrillers, not films like this one", evidenceRoot: "#text-s1-films" },
      2: { group: "s1-films", answer: "C", explanation: "The Jeffersons says that none of the actors could make the script sound natural. A script that does not sound natural is unrealistic dialogue.", skill: "Recognising a direct paraphrase about unnatural dialogue", evidence: "neither she nor the other actors could make the script sound natural", evidenceRoot: "#text-s1-films" },
      3: { group: "s1-films", answer: "A", explanation: "The reviewer expected a music-heavy film but was unexpectedly moved close to tears by the band members’ support after a tragedy.", skill: "Using contrast to identify an unexpected emotional reaction", evidence: "had me close to tears, giving me a new appreciation of the band", evidenceRoot: "#text-s1-films" },
      4: { group: "s1-films", answer: "B", explanation: "Home Fires contains long discussions about relationships that many children would find boring. This matches uninteresting dialogue for some viewers.", skill: "Matching a named audience group to its reaction", evidence: "many children would find the long discussions of relationship issues boring", evidenceRoot: "#text-s1-films" },
      5: { group: "s1-films", answer: "D", explanation: "Space Challenge 5 makes an ethical point about treating other people with respect. That is the moral message mentioned in the statement.", skill: "Matching a general moral-message statement to an ethical point", evidence: "makes an important ethical point about treating other people with respect", evidenceRoot: "#text-s1-films" },
      6: { group: "s1-films", answer: "A", explanation: "The fans shown in Purple Rainbow: The Truth were actual fans of the real group, so non-actors participated in the film.", skill: "Identifying real people appearing instead of professional actors", evidence: "Their fans in the film were actual fans of the group", evidenceRoot: "#text-s1-films" },
      7: { group: "s1-films", answer: "B", explanation: "The Home Fires reviewer explicitly says the film is worth a second viewing, which means it should be seen again.", skill: "Matching an explicit recommendation to watch again", evidence: "It’s certainly worth a second viewing", evidenceRoot: "#text-s1-films" },
      8: { group: "s1-films", answer: "D", explanation: "Space Challenge 5 assumes knowledge of the world 20 years ago, so many references will confuse its teenage audience.", skill: "Linking unfamiliar references to audience knowledge", evidence: "many of the references will leave them confused", evidenceRoot: "#text-s1-films" },
      9: { group: "s1-sports", answer: "B", explanation: "The Pioneer route passes soaring mountain peaks, crystal-clear lakes and high country. These details describe spectacular scenery.", skill: "Matching descriptive examples to a general scenery statement", evidence: "soaring mountain peaks, crystal-clear lakes, and high country await", evidenceRoot: "#text-s1-sports" },
      10: { group: "s1-sports", answer: "C", explanation: "Race Drive Experience provides participants with a race suit and a safety helmet before the driving begins.", skill: "Locating equipment supplied to participants", evidence: "being fully kitted out with one of our race suits and safety helmet", evidenceRoot: "#text-s1-sports" },
      11: { group: "s1-sports", answer: "A", explanation: "McLeans Island Run finishes in Orana Park, where the participant’s spectators include several animals. This directly supports being watched during the activity.", skill: "Matching spectators to the activity they observe", evidence: "where your spectators will include lions, tigers, gorillas and giraffes", evidenceRoot: "#text-s1-sports" },
      12: { group: "s1-sports", answer: "C", explanation: "At Race Drive Experience, participants first ride as passengers on a demonstration drive and only afterwards take the driver’s seat.", skill: "Following the sequence from demonstration to personal performance", evidence: "Then you are strapped into the passenger seat of one of our racing cars and taken on a demo drive", evidenceRoot: "#text-s1-sports" },
      13: { group: "s1-sports", answer: "C", explanation: "The event begins with participants meeting a skilled team of racing drivers, who are experts in the activity.", skill: "Matching expertise language to a group of professionals", evidence: "meeting the skilled team of racing drivers", evidenceRoot: "#text-s1-sports" },
      14: { group: "s1-sports", answer: "A", explanation: "Groups entering McLeans Island Run can win money to put towards a good cause of their choice, so the event can raise funds for charity.", skill: "Connecting a good cause with charitable fundraising", evidence: "win $25,000 to put towards a good cause of your choice", evidenceRoot: "#text-s1-sports" },
      15: { group: "s2-redundancy", answer: "list", explanation: "The first advice is to stay calm and draw up a list of everything that needs to be arranged. The grammar after ‘make a’ also requires a singular noun.", skill: "Using grammar and sequence to identify the exact noun", evidence: "draw up a list of all of the things you need to arrange", evidenceRoot: "#text-s2-redundancy" },
      16: { group: "s2-redundancy", answer: "reference", explanation: "Maintaining good relations matters because the employee will need a reasonable reference for a future job.", skill: "Matching future-employment support to the exact noun", evidence: "You will still need a reasonable reference when the time comes to move on", evidenceRoot: "#text-s2-redundancy" },
      17: { group: "s2-redundancy", answer: "consultancy", explanation: "The former boss may offer consultancy work. In the notes, ‘projects’ paraphrases this possible future work.", skill: "Recognising a specialised work noun from a paraphrase", evidence: "offer you consultancy work", evidenceRoot: "#text-s2-redundancy" },
      18: { group: "s2-redundancy", answer: "outplacement", explanation: "The text recommends help from a professional outplacement company to improve job-search success.", skill: "Locating the specialist service named in the text", evidence: "Help from a professional outplacement company can make a huge difference", evidenceRoot: "#text-s2-redundancy" },
      19: { group: "s2-redundancy", answer: "research", explanation: "Before applying, the employee should carry out in-depth research into what employers currently want.", skill: "Matching ‘serious’ with ‘in-depth’ and copying the noun", evidence: "carry out in-depth research to find out what employers are actually looking for", evidenceRoot: "#text-s2-redundancy" },
      20: { group: "s2-redundancy", answer: "gaps", explanation: "The text advises assessing whether there are gaps in experience or qualifications that could block a new job.", skill: "Identifying missing experience or qualifications from context", evidence: "whether there are any gaps in experience or qualifications that could be a barrier", evidenceRoot: "#text-s2-redundancy" },
      21: { group: "s2-redundancy", answer: "incentive", explanation: "Many people find redundancy is the incentive they need to move their career in the direction they want.", skill: "Matching a positive opportunity to its motivating noun", evidence: "redundancy is actually the incentive they need", evidenceRoot: "#text-s2-redundancy" },
      22: { group: "s2-restaurant", answer: "measurements", explanation: "New staff are told to bring a note of their chest, waist and hip measurements so the correct uniform size can be issued.", skill: "Generalising several body dimensions into one plural noun", evidence: "a note of your chest, waist and hip measurements", evidenceRoot: "#text-s2-restaurant" },
      23: { group: "s2-restaurant", answer: "laundry allowance", explanation: "Staff must keep the uniform clean and receive a laundry allowance to help cover this responsibility.", skill: "Copying a two-word benefit linked to cleaning uniforms", evidence: "you will receive a laundry allowance to help you do this", evidenceRoot: "#text-s2-restaurant" },
      24: { group: "s2-restaurant", answer: "respectable", explanation: "Normal clothes worn to and from work must be respectable. The adjective completes the sentence directly.", skill: "Using adjective grammar to locate the exact requirement", evidence: "make sure they’re respectable", evidenceRoot: "#text-s2-restaurant" },
      25: { group: "s2-restaurant", answer: "hoodies", explanation: "The text names hoodies as an example of tops that are not acceptable in the kitchens.", skill: "Selecting the specific example required by the sentence", evidence: "hoodies and other similar tops are not acceptable in the kitchens", evidenceRoot: "#text-s2-restaurant" },
      26: { group: "s2-restaurant", answer: "crutches", explanation: "Employees who need crutches may still be placed in seated work, so they do not necessarily need time off.", skill: "Connecting an injury aid with an alternative work arrangement", evidence: "injuries that require crutches", evidenceRoot: "#text-s2-restaurant" },
      27: { group: "s2-restaurant", answer: "hand cuts", explanation: "Employees with smaller injuries such as hand cuts must check with their manager before coming to work.", skill: "Copying the exact two-word injury example", evidence: "smaller injuries, such as hand cuts, need to check with their manager", evidenceRoot: "#text-s2-restaurant" },
      28: { group: "s3-mc", answer: "C", explanation: "Paragraph A says the findings could increase the profile of ancient female artists in historical and archaeological records. This could reveal the importance of women previously overlooked in history.", skill: "Identifying the broader significance of a research finding", evidence: "increase the profile of ancient female artists in the historical and archaeological record", evidenceRoot: "#text-s3-women" },
      29: { group: "s3-mc", answer: "A", explanation: "Paragraph C says tartar has promising value as environmental evidence but that this value has not been much exploited. The writer therefore believes archaeologists could use it more.", skill: "Interpreting ‘not exploited’ as underused research potential", evidence: "the value of tartar as environmental evidence has not, so far, been much exploited", evidenceRoot: "#text-s3-women" },
      30: { group: "s3-mc", answer: "B", explanation: "B78’s skeleton indicated that she probably did not perform hard labour. This means her life was not very physically demanding.", skill: "Paraphrasing an absence of hard labour", evidence: "she probably did not do any hard labour", evidenceRoot: "#text-s3-women" },
      31: { group: "s3-mc", answer: "A", explanation: "Paragraph F weighs possible explanations and concludes that the pigment was most likely brought into the region as a finished product. This supports the team’s view that it was imported.", skill: "Following evidence to the writer’s preferred explanation", evidence: "it’s more likely that this ultramarine pigment was brought into the region as a finished product", evidenceRoot: "#text-s3-women" },
      32: { group: "s3-mc", answer: "D", explanation: "Paragraph G explains that medieval artists rarely signed their work and left no known skeletal markers, making their contributions to books largely invisible.", skill: "Identifying the evidence problem highlighted by the writer", evidence: "artists are largely invisible in both the historic and archaeological records", evidenceRoot: "#text-s3-women" },
      33: { group: "s3-paragraphs", answer: "B", explanation: "Paragraph B explains that hardened tartar can preserve trapped particles for hundreds, thousands or potentially millions of years.", skill: "Matching a long preservation period to the correct paragraph", evidence: "entomb these particles and molecules for hundreds or thousands of years, potentially even millions", evidenceRoot: "#text-s3-women" },
      34: { group: "s3-paragraphs", answer: "D", explanation: "Paragraph D states that the blue particles were unusual for two reasons: their colour and their sheer number.", skill: "Locating two explicitly numbered reasons", evidence: "firstly because of their colour, and secondly because of their sheer number", evidenceRoot: "#text-s3-women" },
      35: { group: "s3-paragraphs", answer: "C", explanation: "Paragraph C lists tree and grass pollen, spores, cotton fibres, medicinal plants and micro-charcoal as particles found through dental analysis.", skill: "Matching a list of examples to its paragraph", evidence: "Tree and grass pollen, spores, cotton fibres, medicinal plants and micro-charcoal", evidenceRoot: "#text-s3-women" },
      36: { group: "s3-paragraphs", answer: "F", explanation: "Paragraph F includes the possibility that lapis-lazuli powder was consumed as a medicine, which would mean it was used to treat illness.", skill: "Matching a medical-use possibility to the correct paragraph", evidence: "the consumption of the powder as a medicine", evidenceRoot: "#text-s3-women" },
      37: { group: "s3-summary", answer: "gold", explanation: "The text says lapis lazuli was more precious than gold in Medieval Europe, so even gold was less valuable.", skill: "Comparing relative value and copying the exact noun", evidence: "a substance more precious than gold in Medieval Europe", evidenceRoot: "#text-s3-women" },
      38: { group: "s3-summary", answer: "skill", explanation: "Paragraph E says preparing the pigment took great skill. The summary requires that exact singular noun.", skill: "Using noun grammar to complete a summary statement", evidence: "the preparation of the pigment took great skill", evidenceRoot: "#text-s3-women" },
      39: { group: "s3-summary", answer: "point", explanation: "The artist repeatedly used her lips to make a fine point on the end of her brush.", skill: "Locating the object created on the brush", evidence: "used her lips to make a fine point on the end of her brush", evidenceRoot: "#text-s3-women" },
      40: { group: "s3-summary", answer: "manuscripts", explanation: "The fine brush point was used to paint intricate detail on manuscripts. This is the exact plural noun required before ‘and books’.", skill: "Matching artistic detail work to the object being painted", evidence: "paint intricate detail on manuscripts", evidenceRoot: "#text-s3-women" }
    }
  };
}());