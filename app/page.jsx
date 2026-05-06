"use client";

import { useEffect, useMemo, useState } from "react";

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
const domains = ["All", ...new Set(questionBank.map((question) => question.domain))];
const difficulties = ["All", "Foundation", "Intermediate", "Advanced"];

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

function normalizeProgress(progress) {
  const baseline = emptyProgress();
  const savedByDomain = progress?.byDomain || {};
  const byDomain = {};

  Object.entries(baseline.byDomain).forEach(([domain, stats]) => {
    byDomain[domain] = {
      ...stats,
      ...(savedByDomain[domain] || {})
    };
  });

  return {
    ...baseline,
    ...progress,
    byDomain
  };
}

function loadProgress() {
  if (typeof window === "undefined") return emptyProgress();

  const raw = window.localStorage.getItem(progressKey);
  if (!raw) return emptyProgress();

  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

function saveProgress(progress) {
  window.localStorage.setItem(progressKey, JSON.stringify(progress));
}

function chooseQuestion(questions) {
  if (!questions.length) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

function calculatePercent(correct, answered) {
  return answered ? Math.round((correct / answered) * 100) : 0;
}

function filterQuestions(domain, difficulty) {
  return questionBank.filter((question) => {
    const domainMatch = domain === "All" || question.domain === domain;
    const difficultyMatch = difficulty === "All" || question.difficulty === difficulty;
    return domainMatch && difficultyMatch;
  });
}

function applyAnswer(progress, question, isCorrect) {
  const nextProgress = normalizeProgress(progress);
  nextProgress.answered += 1;

  if (isCorrect) {
    nextProgress.correct += 1;
    nextProgress.streak += 1;
    nextProgress.bestStreak = Math.max(nextProgress.bestStreak, nextProgress.streak);
  } else {
    nextProgress.streak = 0;
  }

  const domainStats = nextProgress.byDomain[question.domain] || { answered: 0, correct: 0 };
  domainStats.answered += 1;
  if (isCorrect) domainStats.correct += 1;
  nextProgress.byDomain[question.domain] = domainStats;

  return nextProgress;
}

function findWeakArea(progress) {
  return Object.entries(progress.byDomain)
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
    })[0]?.domain;
}

export default function HomePage() {
  const [domain, setDomain] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState({ text: "", tone: "" });
  const [progress, setProgress] = useState(emptyProgress);

  const filteredQuestions = useMemo(
    () => filterQuestions(domain, difficulty),
    [domain, difficulty]
  );
  const accuracy = calculatePercent(progress.correct, progress.answered);

  function selectQuestion(nextDomain = domain, nextDifficulty = difficulty) {
    setCurrentQuestion(chooseQuestion(filterQuestions(nextDomain, nextDifficulty)));
    setSelectedAnswer("");
    setFeedback({ text: "", tone: "" });
  }

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    setCurrentQuestion(chooseQuestion(filteredQuestions));
    setSelectedAnswer("");
    setFeedback({ text: "", tone: "" });
  }, [filteredQuestions]);

  function checkAnswer() {
    if (!currentQuestion) return;

    if (selectedAnswer === "") {
      setFeedback({ text: "Please select an answer first.", tone: "error" });
      return;
    }

    const isCorrect = Number(selectedAnswer) === currentQuestion.answer;
    const nextProgress = applyAnswer(progress, currentQuestion, isCorrect);
    setProgress(nextProgress);
    saveProgress(nextProgress);

    setFeedback({
      text: isCorrect
        ? `Correct. ${currentQuestion.explanation}`
        : `Not quite. ${currentQuestion.explanation}`,
      tone: isCorrect ? "success" : "error"
    });
  }

  function showExplanation() {
    if (!currentQuestion) return;
    setFeedback({ text: `Explanation: ${currentQuestion.explanation}`, tone: "" });
  }

  function resetProgress() {
    const nextProgress = emptyProgress();
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setFeedback({ text: "Progress reset.", tone: "" });
  }

  function practiceWeakArea() {
    const weakArea = findWeakArea(progress);
    if (!weakArea) return;

    setDomain(weakArea);
    selectQuestion(weakArea, difficulty);
  }

  return (
    <>
      <header className="container">
        <h1>CDMP Prep Hub</h1>
        <p>
          Interactive practice for DAMA CDMP concepts: learn by domain, difficulty,
          and adaptive weak-area review.
        </p>
      </header>

      <main className="container grid">
        <section className="card">
          <h2>Practice Setup</h2>
          <div className="controls two-col">
            <label htmlFor="domainSelect">Domain</label>
            <select
              id="domainSelect"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            >
              {domains.map((domainOption) => (
                <option key={domainOption} value={domainOption}>
                  {domainOption}
                </option>
              ))}
            </select>

            <label htmlFor="difficultySelect">Difficulty</label>
            <select
              id="difficultySelect"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              {difficulties.map((difficultyOption) => (
                <option key={difficultyOption} value={difficultyOption}>
                  {difficultyOption}
                </option>
              ))}
            </select>
          </div>
          <div className="button-row">
            <button type="button" onClick={() => selectQuestion()}>
              New Question
            </button>
            <button type="button" onClick={practiceWeakArea}>
              Practice Weak Area
            </button>
          </div>
          <article className="question-card" aria-live="polite">
            {currentQuestion ? (
              <>
                <strong>{currentQuestion.domain}</strong>{" "}
                <span aria-hidden="true">· </span>
                <em>{currentQuestion.difficulty}</em>
                <p>{currentQuestion.question}</p>
              </>
            ) : (
              <>
                <strong>No matching question.</strong>
                <p>Try changing domain or difficulty.</p>
              </>
            )}
          </article>
        </section>

        <section className="card">
          <h2>Quick Quiz</h2>
          <form>
            {currentQuestion?.options.map((option, index) => (
              <label className="answer-option" key={option}>
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedAnswer === String(index)}
                  onChange={(event) => setSelectedAnswer(event.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </form>
          <div className="button-row">
            <button type="button" className="primary" onClick={checkAnswer}>
              Check Answer
            </button>
            <button type="button" onClick={showExplanation}>
              Show Explanation
            </button>
          </div>
          <p className={`feedback ${feedback.tone}`} aria-live="polite">
            {feedback.text}
          </p>
        </section>

        <section className="card">
          <h2>Progress</h2>
          <div className="stats">
            <p>
              <strong>Answered:</strong> <span>{progress.answered}</span>
            </p>
            <p>
              <strong>Correct:</strong> <span>{progress.correct}</span>
            </p>
            <p>
              <strong>Accuracy:</strong> <span>{accuracy}%</span>
            </p>
            <p>
              <strong>Streak:</strong> <span>{progress.streak}</span>
            </p>
            <p>
              <strong>Best Streak:</strong> <span>{progress.bestStreak}</span>
            </p>
          </div>
          <button type="button" className="danger" onClick={resetProgress}>
            Reset Progress
          </button>
        </section>

        <section className="card full-width">
          <h2>Domain Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Answered</th>
                <th>Correct</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(progress.byDomain).map(([domainName, stats]) => (
                <tr key={domainName}>
                  <td>{domainName}</td>
                  <td>{stats.answered}</td>
                  <td>{stats.correct}</td>
                  <td>{calculatePercent(stats.correct, stats.answered)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      <footer className="container footer">
        <small>
          Served by Next.js. Scores are stored only in your browser via localStorage.
        </small>
      </footer>
    </>
  );
}
