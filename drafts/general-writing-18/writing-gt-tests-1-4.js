(() => {
  const params = new URLSearchParams(location.search);
  const TEST_NUMBER = Number(params.get("test") || 1);
  const TEST_TITLE = `IELTS 18 General Training Writing Test ${TEST_NUMBER}`;
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  const tests = {
    1: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>Your English-speaking friend has asked for your help with a college project he/she is doing about celebrating New Year in different countries.</p>
            <p>Write a letter to your friend. In your letter</p>
            <ul>
              <li>say how important New Year is to people in your country</li>
              <li>describe how New Year is celebrated in your country</li>
              <li>explain what you like about New Year celebrations in your country</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear ....................................,</p>`,
        study: {
          type: "Informal letter helping a friend with a project",
          understanding: [
            "Explain how important New Year is to people in your country.",
            "Describe the main ways New Year is celebrated in your country.",
            "Explain personally what you like about these celebrations."
          ],
          structure: [
            "Dear [first name],",
            "Friendly opening and a clear reference to your friend’s project",
            "Body paragraphs: importance, typical celebrations and what you personally enjoy",
            "Friendly closing such as Best wishes,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I included specific details about celebrations in my country.",
            "I clearly explained my own preferences.",
            "My tone is friendly and informal, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some people say that it is better to work for a large company than a small one.</p>
            <p>Do you agree or disagree?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Agree-or-disagree opinion essay",
          understanding: [
            "State clearly whether you agree or disagree that working for a large company is better.",
            "Compare relevant features of large and small companies.",
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
            "I directly compared large and small companies.",
            "I developed my reasons with explanations or examples.",
            "I wrote at least 250 words."
          ]
        }
      }
    },
    2: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You are soon going to spend three months doing work experience in an organisation.</p>
            <p>Write a letter to the manager of the organisation where you are going to do work experience. In your letter</p>
            <ul>
              <li>thank the manager for the opportunity to do work experience</li>
              <li>explain what you hope to learn from the work experience</li>
              <li>ask some questions about the work experience you are going to do</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Sir or Madam,</p>`,
        study: {
          type: "Formal letter about an upcoming work-experience placement",
          understanding: [
            "Thank the manager politely for offering the placement.",
            "Explain the skills or knowledge you hope to gain.",
            "Ask clear and relevant questions about the placement."
          ],
          structure: [
            "Dear Sir or Madam,",
            "Opening paragraph: thank the manager and state the purpose of the letter",
            "Body paragraphs: explain your learning goals and ask your questions",
            "Polite closing with Yours faithfully,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "My learning goals are specific and relevant.",
            "My questions are clear and useful.",
            "I used a formal tone and wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>When we meet someone for the first time, we generally decide very quickly what kind of person we think they are and if we like them or not.</p>
            <p>Is this a good thing or a bad thing?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Positive-or-negative evaluation essay",
          understanding: [
            "Decide whether forming quick first impressions is mainly a good or a bad thing.",
            "Explain the possible benefits or dangers of judging people quickly.",
            "Support your overall evaluation with developed reasons and examples."
          ],
          structure: [
            "Introduction with your judgement",
            "Possible benefits of quick first impressions",
            "Possible risks and why they matter",
            "Conclusion"
          ],
          checklist: [
            "My overall judgement is clear.",
            "I explained why first impressions can be useful or misleading.",
            "I supported my evaluation with examples.",
            "I wrote at least 250 words."
          ]
        }
      }
    },
    3: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You recently bought some train tickets for a journey a week in advance. When you went to the station to catch the train, you were told you could not use the tickets and the staff were very unhelpful to you.</p>
            <p>Write a letter to the train company. In your letter</p>
            <ul>
              <li>describe the problem you had with the tickets</li>
              <li>say why you were unhappy with the staff</li>
              <li>suggest what action the train company should take</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear Sir or Madam,</p>`,
        study: {
          type: "Formal complaint letter to a train company",
          understanding: [
            "Describe clearly what went wrong with the tickets.",
            "Explain specifically why the staff’s response was unsatisfactory.",
            "Request realistic action from the company, such as a refund, apology or investigation."
          ],
          structure: [
            "Dear Sir or Madam,",
            "Opening paragraph: identify the journey and state the purpose of the complaint",
            "Body paragraphs: explain the ticket problem and the staff’s behaviour",
            "Final paragraph: request action and close with Yours faithfully,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I included enough details for the company to understand the incident.",
            "My requested action is clear and reasonable.",
            "My tone is formal, polite and firm, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>In the past, most working people had only one job. However, nowadays, more and more people have more than one job at the same time.</p>
            <p>What are the reasons for this development?</p>
            <p>What are the advantages and disadvantages of having more than one job?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Reasons plus advantages-and-disadvantages essay",
          understanding: [
            "Explain why more people now have more than one job.",
            "Discuss both advantages and disadvantages of multiple jobs.",
            "Support each part with developed reasons and relevant examples."
          ],
          structure: [
            "Introduction",
            "Reasons for the development",
            "Advantages of having more than one job",
            "Disadvantages and conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "I explained the reasons for the trend.",
            "I discussed both advantages and disadvantages.",
            "I supported my ideas and wrote at least 250 words."
          ]
        }
      }
    },
    4: {
      task1: {
        html: `<p>You should spend about 20 minutes on this task.</p>
          <div class="task-question letter-task-question">
            <p>You recently attended a training course for your work. Your employer has asked you for your feedback on the training course.</p>
            <p>Write a letter to your employer. In your letter</p>
            <ul>
              <li>remind your employer what the course was about</li>
              <li>explain why the course was useful to you in your work</li>
              <li>suggest why the course may not be suitable for some of your other colleagues</li>
            </ul>
          </div>
          <p>Write at least 150 words.</p>
          <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
          <p>Begin your letter as follows:</p>
          <p class="letter-opening">Dear ....................................,</p>`,
        study: {
          type: "Semi-formal workplace feedback letter",
          understanding: [
            "Remind your employer clearly what the training course covered.",
            "Explain how the course has helped you in your work.",
            "Give tactful reasons why it may not suit some colleagues."
          ],
          structure: [
            "Dear [employer’s name],",
            "Opening paragraph: refer to the request for feedback and identify the course",
            "Body paragraphs: explain its usefulness and who may not benefit from it",
            "Professional but friendly closing such as Yours sincerely,"
          ],
          checklist: [
            "I covered all three bullet points fully.",
            "I explained the course content and its practical value clearly.",
            "My comments about colleagues are tactful and well supported.",
            "My tone is professional and respectful, and I wrote at least 150 words."
          ]
        }
      },
      task2: {
        html: `<p>You should spend about 40 minutes on this task.</p>
          <p>Write about the following topic:</p>
          <div class="task-question">
            <p>Some people dislike changes in their society and in their own lives, and want things to stay the same.</p>
            <p>Why do some people want things to stay the same?</p>
            <p>Why should change be regarded as something positive?</p>
          </div>
          <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
          <p>Write at least 250 words.</p>`,
        study: {
          type: "Two-part reasons essay",
          understanding: [
            "Explain why some people resist change in society or in their own lives.",
            "Explain why change can be regarded positively.",
            "Develop both parts with clear reasons and examples."
          ],
          structure: [
            "Introduction",
            "Reasons people prefer things to stay the same",
            "Reasons change can be positive",
            "Conclusion"
          ],
          checklist: [
            "I answered both questions directly.",
            "I explained the causes of resistance to change.",
            "I developed clear reasons why change can be beneficial.",
            "I supported my ideas and wrote at least 250 words."
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
