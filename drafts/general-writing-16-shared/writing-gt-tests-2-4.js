(() => {
  const match = location.pathname.match(/general-writing-16-test-(\d+)/);
  const TEST_NUMBER = Number(match?.[1] || 2);
  const TEST_TITLE = `IELTS 16 General Training Writing Test ${TEST_NUMBER}`;
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  const tests = {
    2: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You have just read an article in a national newspaper which claims that town centres in your country all look very similar to each other. You don’t fully agree with this opinion.</p>
            <p>Write a letter to the editor of the newspaper. In your letter</p>
            <ul>
              <li>say which points in the article you agree with</li>
              <li>explain ways in which your town centre is different from most other town centres</li>
              <li>offer to give a guided tour of your town to the writer of the article</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Sir or Madam,</p>`,
        study: {
          type: "Formal letter to a newspaper editor",
          understanding: [
            "Respond directly to the newspaper article and explain where you agree and disagree.",
            "Describe specific features that make your town centre different from most others.",
            "End by offering the writer a guided tour of your town."
          ],
          structure: [
            "Dear Sir or Madam,",
            "Opening paragraph: identify the article and explain why you are writing",
            "Body paragraphs: acknowledge points you agree with and describe what makes your town centre distinctive",
            "Final paragraph: offer a guided tour and close with Yours faithfully,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I used specific details about my town centre.",
            "My tone is polite, formal and appropriately confident.",
            "I did not include any addresses and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some people like to try new things, for example, places to visit and types of food. Other people prefer to keep doing things they are familiar with.</p>
            <p>Discuss both these attitudes and give your own opinion.</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Discuss-both-views essay with an opinion",
          understanding: [
            "Explain why some people enjoy trying unfamiliar experiences.",
            "Explain why others prefer familiar routines, places and food.",
            "Give a clear personal opinion and support it throughout the essay."
          ],
          structure: [
            "Introduction with both attitudes and your position",
            "Reasons people enjoy trying new things",
            "Reasons people prefer familiar experiences",
            "Conclusion that restates your opinion"
          ],
          checklist: [
            "I discussed both attitudes fairly.",
            "My own opinion is clear.",
            "I developed each main idea with reasons or examples.",
            "I wrote at least 250 words."
          ]
        }
      }
    },
    3: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>A magazine wants to include contributions from its readers for an article called ‘The book that influenced me most’.</p>
            <p>Write a letter to the editor of the magazine about the book that influenced you most. In your letter</p>
            <ul>
              <li>describe what this book was about</li>
              <li>explain how this book influenced you</li>
              <li>say whether this book would be likely to influence other people</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Sir or Madam,</p>`,
        study: {
          type: "Formal contribution letter to a magazine editor",
          understanding: [
            "Identify one book and describe its subject or story clearly.",
            "Explain specifically how the book influenced your ideas, choices or behaviour.",
            "Evaluate whether the book could influence other readers and explain why."
          ],
          structure: [
            "Dear Sir or Madam,",
            "Opening paragraph: refer to the magazine article and introduce the book",
            "Body paragraphs: describe the book and explain its influence on you",
            "Final paragraph: consider its likely influence on others and close with Yours faithfully,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I explained the book clearly without retelling too much of it.",
            "I gave specific details about its influence on me and other people.",
            "I used a polite formal tone and wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some people spend most of their lives living close to where they were born.</p>
            <p>What might be the reasons for this?</p>
            <p>What are the advantages and disadvantages?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Two-part reasons and advantages/disadvantages essay",
          understanding: [
            "Explain why people may choose to remain close to their birthplace.",
            "Discuss meaningful advantages of staying in the same area.",
            "Discuss meaningful disadvantages as well as advantages."
          ],
          structure: [
            "Introduction",
            "Reasons people remain close to where they were born",
            "Advantages",
            "Disadvantages and conclusion"
          ],
          checklist: [
            "I answered the reasons question directly.",
            "I discussed both advantages and disadvantages.",
            "I developed my points with explanations or examples.",
            "I wrote at least 250 words."
          ]
        }
      }
    },
    4: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>Your friend has been offered a place on a course at the university where you studied. He/She would like your advice about finding a place to live.</p>
            <p>Write an email to your friend. In your email</p>
            <ul>
              <li>describe where you lived when you were a student at the university</li>
              <li>recommend the best way for him/her to look for accommodation</li>
              <li>warn him/her of mistakes students make when choosing accommodation</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your email as follows:</p>
          <p class="letter-opening">Dear ............................ ,</p>`,
        study: {
          type: "Informal email to a friend",
          understanding: [
            "Describe the accommodation you used while studying at the university.",
            "Give practical advice about the best way to search for accommodation.",
            "Warn your friend about common mistakes students make when choosing where to live."
          ],
          structure: [
            "Dear [first name],",
            "Friendly opening and a brief response to the university news",
            "Body paragraphs: your former accommodation, search advice and warnings",
            "Friendly closing such as Best wishes,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "My advice is practical and specific.",
            "My tone is warm and informal without becoming unclear.",
            "I did not include any addresses and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some people say that now is the best time in history to be living.</p>
            <p>What is your opinion about this?</p>
            <p>What other time in history would be interesting to live in?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Two-part opinion essay",
          understanding: [
            "Give a clear opinion on whether the present is the best period in history in which to live.",
            "Choose another historical period that would be interesting to experience.",
            "Explain both answers with specific reasons and examples."
          ],
          structure: [
            "Introduction with your opinion",
            "Why the present is or is not the best time to live",
            "Another historical period you would find interesting",
            "Conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "My opinion about the present is clear.",
            "I identified another historical period and explained why it would be interesting.",
            "I supported my ideas and wrote at least 250 words."
          ]
        }
      }
    }
  };

  const current = tests[TEST_NUMBER] || tests[2];
  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = { title: "Writing Task 1", html: current.task1.html, study: current.task1.study };
  tasks[2] = { title: "Writing Task 2", html: current.task2.html, study: current.task2.study };

  const reportOverlay = document.getElementById("submissionReportOverlay");
  const reportText = () => document.getElementById("submissionReportText");
  const reportName = () => document.getElementById("submissionStudentName")?.value.trim() || state.candidate || "Not provided";

  function correctReportIdentity() {
    const textarea = reportText();
    if (!textarea) return;
    textarea.value = textarea.value.replace(/^IELTS 16 Academic Writing Test 2/m, TEST_TITLE);
  }

  if (reportOverlay) {
    new MutationObserver(() => {
      if (reportOverlay.style.display !== "none") requestAnimationFrame(correctReportIdentity);
    }).observe(reportOverlay, { attributes: true, attributeFilter: ["style"] });
  }

  document.addEventListener("input", (event) => {
    if (event.target?.id === "submissionStudentName" || event.target?.id === "submissionStudentEmail") queueMicrotask(correctReportIdentity);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("#confirmSubmit, #submitButton, #optionsSubmit, .submitted-banner button");
    if (trigger) window.setTimeout(correctReportIdentity, 0);
  }, true);

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-report-action]");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    correctReportIdentity();

    const textarea = reportText();
    if (!textarea) return;

    const action = button.dataset.reportAction;
    const name = reportName();
    const subjectText = `IELTS General Training Writing – Test ${TEST_NUMBER} answers${name !== "Not provided" ? ` – ${name}` : ""}`;
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(textarea.value);
    const to = encodeURIComponent(TEACHER_EMAIL);

    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(textarea.value);
      } catch (error) {
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.setSelectionRange(0, 0);
      }
      const status = document.querySelector(".submission-copy-status");
      if (status) status.textContent = "All text copied. Paste it into an email or Teams message.";
      return;
    }

    let url = `mailto:${TEACHER_EMAIL}?subject=${subject}&body=${body}`;
    if (action === "gmail") {
      url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    } else if (action === "outlook") {
      url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }, true);
})();
