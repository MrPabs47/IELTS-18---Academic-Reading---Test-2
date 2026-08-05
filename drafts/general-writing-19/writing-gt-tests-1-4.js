(() => {
  const params = new URLSearchParams(location.search);
  const TEST_NUMBER = Number(params.get("test") || 1);
  const TEST_TITLE = `IELTS 19 General Training Writing Test ${TEST_NUMBER}`;
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  const tests = {
    1: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You would like to reduce your working hours in order to study part time.</p>
            <p>Write a letter to your boss. In your letter</p>
            <ul>
              <li>explain why you want to reduce your working hours</li>
              <li>say which hours you would like to work</li>
              <li>describe how your part-time studies would benefit your employer</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear ....................................,</p>`,
        study: {
          type: "Semi-formal letter requesting reduced working hours",
          understanding: [
            "Explain clearly why you want to reduce your working hours to study part time.",
            "Propose the exact hours or days you would like to work.",
            "Show how your studies would create a practical benefit for your employer."
          ],
          structure: [
            "Dear [boss’s name],",
            "Opening paragraph: state your request and introduce the reason for it",
            "Body paragraphs: explain your preferred schedule and the benefit of your studies",
            "Professional closing such as Yours sincerely,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I proposed a clear and workable schedule.",
            "I explained the benefit to my employer, not only to myself.",
            "My tone is polite and professional, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>More and more people nowadays visit well-known places to take photographs of themselves, without looking at the place.</p>
            <p>Why do you think this is happening?</p>
            <p>Is it a positive or a negative trend?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Causes plus positive-or-negative trend essay",
          understanding: [
            "Explain why people increasingly focus on taking photographs of themselves at famous places.",
            "Give a clear judgement on whether this is mainly a positive or negative trend.",
            "Support both parts with developed reasons and relevant examples."
          ],
          structure: [
            "Introduction with your overall judgement",
            "Reasons the behaviour is becoming more common",
            "Why the trend is positive or negative",
            "Conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "I explained the causes rather than only describing the trend.",
            "My positive or negative judgement is clear and supported.",
            "I wrote at least 250 words."
          ]
        }
      }
    },
    2: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You are a member of an International Students’ club. The club is organising an event to celebrate popular food from around the world.</p>
            <p>Write a letter to the event organiser, Luis. In your letter</p>
            <ul>
              <li>offer to make a popular dish from your country</li>
              <li>describe what this dish is</li>
              <li>explain why it should be included in the event</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Luis,</p>`,
        study: {
          type: "Semi-formal letter to a club event organiser",
          understanding: [
            "Offer clearly to prepare one popular dish from your country.",
            "Describe the dish, including its ingredients, appearance or how it is served.",
            "Explain why it would be a valuable addition to the international event."
          ],
          structure: [
            "Dear Luis,",
            "Friendly opening and a clear offer to help with the event",
            "Body paragraphs: describe the dish and explain its cultural or practical value",
            "Warm closing such as Best wishes,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "My description makes the dish easy to understand.",
            "I gave specific reasons why it suits the event.",
            "My tone is warm and appropriately organised, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>It is sometimes possible to pay somebody to do things you don’t want to do, or don’t have time to do, for example, household chores or looking after children.</p>
            <p>Is this a good way of providing work for others?</p>
            <p>Should people do these things themselves?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Two-part opinion essay",
          understanding: [
            "Evaluate whether paying people to perform household or caring tasks is a good way to provide work.",
            "Give a clear opinion on whether people should instead do these tasks themselves.",
            "Address both questions separately and support each answer."
          ],
          structure: [
            "Introduction with your overall position",
            "Whether this creates useful and fair employment",
            "Whether people should do these tasks themselves",
            "Conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "I considered the effects on workers as well as customers.",
            "My opinion about doing the tasks personally is clear.",
            "I supported my ideas and wrote at least 250 words."
          ]
        }
      }
    },
    3: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>Five months ago, you started renting an apartment on a six-month agreement. You now wish to stay in the apartment for longer than the six months you originally agreed with the owner.</p>
            <p>Write a letter to the owner of your apartment. In your letter</p>
            <ul>
              <li>say how long you now want to rent the apartment for</li>
              <li>explain why your plans have changed</li>
              <li>tell the owner about a problem in the apartment</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear ....................................,</p>`,
        study: {
          type: "Semi-formal letter to an apartment owner",
          understanding: [
            "State exactly how much longer you would like to rent the apartment.",
            "Explain clearly why your original plans have changed.",
            "Describe one apartment problem and indicate what action may be needed."
          ],
          structure: [
            "Dear [owner’s name],",
            "Opening paragraph: request an extension to the rental agreement",
            "Body paragraphs: explain your changed plans and describe the apartment problem",
            "Polite closing such as Yours sincerely,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I gave a precise requested rental period.",
            "I described the problem clearly and politely.",
            "My tone is respectful and practical, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some consumers are increasingly choosing to buy goods that are produced in their local area, rather than imported goods.</p>
            <p>What are the reasons for this?</p>
            <p>Is this a positive or a negative trend?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Reasons plus positive-or-negative trend essay",
          understanding: [
            "Explain why consumers may increasingly prefer locally produced goods.",
            "Judge whether the shift away from imported goods is mainly positive or negative.",
            "Support your explanation and judgement with relevant examples."
          ],
          structure: [
            "Introduction with your overall judgement",
            "Reasons consumers are choosing local goods",
            "Positive or negative effects of the trend",
            "Conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "I explained several relevant reasons for the preference.",
            "My judgement is clear and considers meaningful effects.",
            "I supported my ideas and wrote at least 250 words."
          ]
        }
      }
    },
    4: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You started in your present job two years ago. You now feel it is important for your career development to move to a different department in the same company.</p>
            <p>Write a letter to your manager. In your letter</p>
            <ul>
              <li>say what you have learned in your present job</li>
              <li>suggest how the company would benefit from moving you to a different department</li>
              <li>explain why you do not wish to leave the company</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear ....................................,</p>`,
        study: {
          type: "Semi-formal workplace transfer request",
          understanding: [
            "Summarise the useful skills and knowledge you have gained in your present job.",
            "Explain how transferring you would benefit the company as well as your career.",
            "Show clearly why you want to remain with the same employer."
          ],
          structure: [
            "Dear [manager’s name],",
            "Opening paragraph: request consideration for a departmental transfer",
            "Body paragraphs: explain what you have learned and the benefit to the company",
            "Final paragraph: express loyalty to the company and close with Yours sincerely,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I gave specific examples of what I have learned.",
            "I explained the organisational benefit of the transfer.",
            "My tone is positive, loyal and professional, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Nowadays famous people are photographed by professional photographers everywhere they go. Some people say this is a good thing because the public are interested in their lives. Other people think that photographers are wrong to follow famous people.</p>
            <p>Discuss both these views and give your own opinion.</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Discuss-both-views essay with an opinion",
          understanding: [
            "Explain why some people think photographing famous people serves public interest.",
            "Explain why others believe following famous people is wrong.",
            "Give a clear personal opinion and support it throughout the essay."
          ],
          structure: [
            "Introduction presenting both views and your position",
            "Reasons public interest may justify photography",
            "Reasons constant pursuit may be unethical or intrusive",
            "Conclusion restating your opinion"
          ],
          checklist: [
            "I discussed both views fairly.",
            "My own opinion is clear.",
            "I considered privacy as well as public interest.",
            "I developed my ideas and wrote at least 250 words."
          ]
        }
      }
    }
  };

  const current = tests[TEST_NUMBER] || tests[1];
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
