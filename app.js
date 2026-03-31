const questionBank = [
  {
    domain: "Data Governance",
    difficulty: "Foundation",
    question: "What is the primary purpose of a data governance council?",
    options: [
      "To write ETL jobs for all enterprise systems",
      "To define decision rights, policies, and accountability for data",
      "To replace business ownership of data",
      "To maintain physical database servers"
    ],
    answer: 1,
    explanation:
      "Governance councils define authority, policy, and accountability across business and IT stakeholders."
  },
  {
    domain: "Data Quality",
    difficulty: "Foundation",
    question: "Which metric best measures data quality completeness?",
    options: [
      "Percentage of required values that are populated",
      "Number of dashboards in production",
      "Database storage growth rate",
      "Count of data stewards"
    ],
    answer: 0,
    explanation: "Completeness measures whether required data elements are present."
  },
  {
    domain: "Metadata Management",
    difficulty: "Intermediate",
    question: "A business glossary is most directly used to:",
    options: [
      "Configure network firewalls",
      "Standardize business definitions and shared understanding",
      "Archive logs for 7 years",
      "Encrypt all tables"
    ],
    answer: 1,
    explanation: "Glossaries align language and meaning across teams."
  },
  {
    domain: "Master & Reference Data",
    difficulty: "Intermediate",
    question: "Master data is best described as:",
    options: [
      "Transient event data generated every second",
      "Authoritative core entities shared across processes",
      "Any file stored in a data lake",
      "Only data used by finance"
    ],
    answer: 1,
    explanation: "Master data covers shared core entities like customer and product."
  },
  {
    domain: "Data Architecture",
    difficulty: "Advanced",
    question: "What is a key goal of enterprise data architecture?",
    options: [
      "Reduce data silos and enable integration",
      "Eliminate the need for governance",
      "Restrict all data access permanently",
      "Replace all applications yearly"
    ],
    answer: 0,
    explanation: "Architecture aligns standards and structures for interoperable data."
  },
  {
    domain: "Data Ethics & Privacy",
    difficulty: "Advanced",
    question: "Data minimization means organizations should:",
    options: [
      "Collect every possible data element",
      "Store data forever regardless of purpose",
      "Collect only data needed for stated purposes",
      "Avoid documenting data processing"
    ],
    answer: 2,
    explanation: "Collect and retain only data that is necessary and justified."
  }
];

const progressKey = "cdmp-prep-progress-v2";

const domainSelect = document.getElementById("domainSelect");
const difficultySelect = document.getElementById("difficultySelect");
const newQuestionBtn = document.getElementById("newQuestionBtn");
const weakAreaBtn = document.getElementById("weakAreaBtn");
const questionCard = document.getElementById("questionCard");
const quizForm = document.getElementById("quizForm");
const checkBtn = document.getElementById("checkBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const feedback = document.getElementById("feedback");
const answeredCount = document.getElementById("answeredCount");
const correctCount = document.getElementById("correctCount");
const accuracy = document.getElementById("accuracy");
const streak = document.getElementById("streak");
const bestStreak = document.getElementById("bestStreak");
const resetProgressBtn = document.getElementById("resetProgressBtn");
const domainStatsBody = document.getElementById("domainStatsBody");

let currentQuestion = null;

function getDomains() {
  return ["All", ...new Set(questionBank.map((q) => q.domain))];
}

function emptyProgress() {
  const byDomain = {};
  questionBank.forEach(({ domain }) => {
    byDomain[domain] = { answered: 0, correct: 0 };
  });
  return {
    answered: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    byDomain
  };
}

function loadProgress() {
  const raw = localStorage.getItem(progressKey);
  if (!raw) return emptyProgress();

  try {
    const parsed = JSON.parse(raw);
    const baseline = emptyProgress();
    return {
      ...baseline,
      ...parsed,
      byDomain: {
        ...baseline.byDomain,
        ...(parsed.byDomain || {})
      }
    };
  } catch {
    return emptyProgress();
  }
}

function saveProgress(progress) {
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

function filteredQuestions() {
  const selectedDomain = domainSelect.value;
  const selectedDifficulty = difficultySelect.value;

  return questionBank.filter((q) => {
    const domainMatch = selectedDomain === "All" || q.domain === selectedDomain;
    const difficultyMatch = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    return domainMatch && difficultyMatch;
  });
}

function chooseQuestion(questions) {
  if (!questions.length) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

function selectQuestion() {
  currentQuestion = chooseQuestion(filteredQuestions());
  renderQuestion();
}

function updateStats() {
  const progress = loadProgress();
  answeredCount.textContent = String(progress.answered);
  correctCount.textContent = String(progress.correct);
  streak.textContent = String(progress.streak);
  bestStreak.textContent = String(progress.bestStreak);
  const pct = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;
  accuracy.textContent = `${pct}%`;
}

function renderDomainTable() {
  const progress = loadProgress();
  domainStatsBody.innerHTML = "";

  Object.entries(progress.byDomain).forEach(([domain, stats]) => {
    const tr = document.createElement("tr");
    const pct = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
    tr.innerHTML = `<td>${domain}</td><td>${stats.answered}</td><td>${stats.correct}</td><td>${pct}%</td>`;
    domainStatsBody.appendChild(tr);
  });
}

function renderQuestion() {
  if (!currentQuestion) {
    questionCard.innerHTML = "<strong>No matching question.</strong><p>Try changing domain or difficulty.</p>";
    quizForm.innerHTML = "";
    feedback.textContent = "";
    return;
  }

  questionCard.innerHTML = `<strong>${currentQuestion.domain}</strong> · <em>${currentQuestion.difficulty}</em><p>${currentQuestion.question}</p>`;
  quizForm.innerHTML = "";

  currentQuestion.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "answer-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = String(index);

    const span = document.createElement("span");
    span.textContent = option;

    label.append(input, span);
    quizForm.appendChild(label);
  });

  feedback.textContent = "";
  feedback.className = "feedback";
}

function updateProgress(isCorrect) {
  const progress = loadProgress();
  progress.answered += 1;
  if (isCorrect) {
    progress.correct += 1;
    progress.streak += 1;
    progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
  } else {
    progress.streak = 0;
  }

  const domainStats = progress.byDomain[currentQuestion.domain] || { answered: 0, correct: 0 };
  domainStats.answered += 1;
  if (isCorrect) domainStats.correct += 1;
  progress.byDomain[currentQuestion.domain] = domainStats;

  saveProgress(progress);
}

function checkAnswer() {
  if (!currentQuestion) return;

  const selected = quizForm.querySelector("input[name='answer']:checked");
  if (!selected) {
    feedback.textContent = "Please select an answer first.";
    feedback.className = "feedback error";
    return;
  }

  const isCorrect = Number(selected.value) === currentQuestion.answer;
  updateProgress(isCorrect);
  updateStats();
  renderDomainTable();

  feedback.textContent = isCorrect
    ? `Correct. ${currentQuestion.explanation}`
    : `Not quite. ${currentQuestion.explanation}`;
  feedback.className = `feedback ${isCorrect ? "success" : "error"}`;
}

function showExplanation() {
  if (!currentQuestion) return;
  feedback.textContent = `Explanation: ${currentQuestion.explanation}`;
  feedback.className = "feedback";
}

function resetProgress() {
  saveProgress(emptyProgress());
  updateStats();
  renderDomainTable();
  feedback.textContent = "Progress reset.";
  feedback.className = "feedback";
}

function practiceWeakArea() {
  const progress = loadProgress();
  const scored = Object.entries(progress.byDomain)
    .map(([domain, stats]) => ({
      domain,
      answered: stats.answered,
      accuracy: stats.answered ? stats.correct / stats.answered : 0
    }))
    .sort((a, b) => {
      if (a.answered === 0 && b.answered === 0) return 0;
      if (a.answered === 0) return -1;
      if (b.answered === 0) return 1;
      return a.accuracy - b.accuracy;
    });

  if (!scored.length) return;
  domainSelect.value = scored[0].domain;
  selectQuestion();
}

function renderDomains() {
  getDomains().forEach((domain) => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    domainSelect.appendChild(option);
  });
}

function init() {
  renderDomains();
  domainSelect.value = "All";
  difficultySelect.value = "All";
  selectQuestion();
  updateStats();
  renderDomainTable();
}

newQuestionBtn.addEventListener("click", selectQuestion);
weakAreaBtn.addEventListener("click", practiceWeakArea);
checkBtn.addEventListener("click", checkAnswer);
showAnswerBtn.addEventListener("click", showExplanation);
resetProgressBtn.addEventListener("click", resetProgress);

domainSelect.addEventListener("change", selectQuestion);
difficultySelect.addEventListener("change", selectQuestion);

init();
