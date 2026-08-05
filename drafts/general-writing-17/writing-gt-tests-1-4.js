(() => {
  const params = new URLSearchParams(location.search);
  const TEST_NUMBER = Number(params.get("test") || 1);
  const TEST_TITLE = `IELTS 17 General Training Writing Test ${TEST_NUMBER}`;
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  const tests = {
    1: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>Your English-speaking friend who lives in your town has asked for your advice about learning a new sport.</p>
            <p>Write an email to your friend. In your email</p>
            <ul>
              <li>recommend a new sport that would be suitable for your friend to learn</li>
              <li>explain how your friend could learn this sport</li>
              <li>suggest that you both learn this sport together.</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear ............................,</p>`,
        study: {
          type: "Informal email giving advice to a friend",
          understanding: [
            "Recommend one suitable new sport and explain why it would suit your friend.",
            "Give practical details about how your friend could learn the sport.",
            "Make a clear and friendly suggestion that you learn the sport together."
          ],
          structure: [
            "Dear [first name],",
            "Friendly opening and a clear response to your friend’s request for advice",
            "Body paragraphs: recommend the sport, explain how to learn it and suggest doing it together",
            "Friendly closing such as Best wishes,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I explained why the sport would be suitable.",
            "My advice is practical and my tone is friendly and informal.",
            "I did not include any addresses and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>In the future, people may no longer be able to pay for things in shops using cash. All payments may have to be made by card or using phones.</p>
            <p>Do you think this will happen one day?</p>
            <p>Why do you think some people might not be happy to give up using cash?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Two-part opinion essay",
          understanding: [
            "Give a clear opinion about whether shops will eventually stop accepting cash.",
            "Explain why some people may be unhappy about giving up cash.",
            "Support both answers with developed reasons and relevant examples."
          ],
          structure: [
            "Introduction with your position",
            "Whether a fully cashless future is likely",
            "Reasons some people may resist giving up cash",
            "Conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "My opinion about the future of cash is clear.",
            "I explained more than one possible concern about cashless payments.",
            "I supported my ideas and wrote at least 250 words."
          ]
        }
      }
    },
    2: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>The parents of your Australian friend Chris have invited you to a surprise birthday party for him/her.</p>
            <p>Write a letter to Chris’s parents. In your letter</p>
            <ul>
              <li>say why you think Chris will enjoy the surprise party</li>
              <li>explain why you won’t be able to attend the party</li>
              <li>give details of a plan to see Chris at a different time.</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Mr and Mrs Collins,</p>`,
        study: {
          type: "Semi-formal letter to a friend’s parents",
          understanding: [
            "Explain why the surprise party is likely to suit Chris.",
            "Give a clear and polite reason why you cannot attend.",
            "Describe a specific alternative plan to meet Chris at another time."
          ],
          structure: [
            "Dear Mr and Mrs Collins,",
            "Opening paragraph: thank them for the invitation and respond warmly",
            "Body paragraphs: explain why Chris will enjoy the party and why you cannot attend",
            "Final paragraph: give details of your alternative plan and close with Yours sincerely,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "My reason for not attending is clear and polite.",
            "My alternative plan includes specific details.",
            "My tone is warm but respectful, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>In some countries, more and more people are hiring a personal fitness trainer, rather than playing sports or doing exercise classes.</p>
            <p>What are the reasons for this?</p>
            <p>Is this a positive or a negative development?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Reasons and positive/negative development essay",
          understanding: [
            "Explain why personal fitness trainers are becoming more popular.",
            "State clearly whether this trend is mainly positive or mainly negative.",
            "Support your judgement with developed reasons and examples."
          ],
          structure: [
            "Introduction with the trend and your position",
            "Reasons people hire personal trainers",
            "Why the development is positive or negative",
            "Conclusion"
          ],
          checklist: [
            "I explained the main reasons for the trend.",
            "My positive-or-negative judgement is clear.",
            "I developed my position rather than only listing advantages and disadvantages.",
            "I supported my ideas and wrote at least 250 words."
          ]
        }
      }
    },
    3: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You recently booked a part-time course at a college. You now need to cancel your booking.</p>
            <p>Write a letter to the college administrator. In your letter</p>
            <ul>
              <li>say which part-time course you booked</li>
              <li>explain why you need to cancel your booking</li>
              <li>ask about booking a different course</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Sir or Madam,</p>`,
        study: {
          type: "Formal letter requesting a course-booking change",
          understanding: [
            "Identify the part-time course you originally booked.",
            "Explain clearly and politely why you need to cancel.",
            "Ask for information about booking a suitable alternative course."
          ],
          structure: [
            "Dear Sir or Madam,",
            "Opening paragraph: identify the booking and explain the purpose of the letter",
            "Body paragraphs: explain the cancellation and provide any necessary details",
            "Final paragraph: ask about another course and close with Yours faithfully,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I identified the original course clearly.",
            "My cancellation request and alternative-course enquiry are polite and specific.",
            "I used a formal tone and wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>It is better to buy just a few expensive clothes, rather than lots of cheaper clothes.</p>
            <p>Do you agree or disagree?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Agree-or-disagree opinion essay",
          understanding: [
            "State clearly whether you agree or disagree with buying fewer expensive clothes.",
            "Compare relevant factors such as quality, durability, cost, choice and consumption.",
            "Develop a consistent position with reasons and examples."
          ],
          structure: [
            "Introduction with a clear position",
            "First main reason",
            "Second main reason or a considered opposing point",
            "Conclusion"
          ],
          checklist: [
            "My position is clear throughout the essay.",
            "I directly compared fewer expensive clothes with many cheaper clothes.",
            "I developed my reasons with explanations or examples.",
            "I wrote at least 250 words."
          ]
        }
      }
    },
    4: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You have bought some clothing online and are not satisfied with your purchase.</p>
            <p>Write a letter to the company that you bought the clothing from. In your email</p>
            <ul>
              <li>give details of the purchase</li>
              <li>describe the problem</li>
              <li>explain why you need a replacement urgently</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Sir or Madam,</p>`,
        study: {
          type: "Formal complaint letter requesting an urgent replacement",
          understanding: [
            "Give enough purchase details for the company to identify the order.",
            "Describe the problem with the clothing clearly and objectively.",
            "Explain why a replacement is needed urgently and state the action you expect."
          ],
          structure: [
            "Dear Sir or Madam,",
            "Opening paragraph: identify the purchase and state the purpose of the complaint",
            "Body paragraphs: describe the problem and provide relevant order details",
            "Final paragraph: explain the urgency, request a replacement and close with Yours faithfully,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I included useful purchase details and described the problem precisely.",
            "I clearly explained why the replacement is urgent.",
            "My tone is formal, polite and firm, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some people think that it’s a good idea to socialise with work colleagues during evenings and weekends. Other people think it’s important to keep working life completely separate from social life.</p>
            <p>Discuss both these views and give your own opinion.</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Discuss-both-views essay with an opinion",
          understanding: [
            "Explain why some people value socialising with colleagues outside work.",
            "Explain why others prefer to keep work and social life separate.",
            "Give a clear personal opinion and support it throughout the essay."
          ],
          structure: [
            "Introduction with both views and your position",
            "Reasons for socialising with colleagues",
            "Reasons for separating work and social life",
            "Conclusion that restates your opinion"
          ],
          checklist: [
            "I discussed both views fairly.",
            "My own opinion is clear.",
            "I developed each view with reasons or examples.",
            "I wrote at least 250 words."
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
