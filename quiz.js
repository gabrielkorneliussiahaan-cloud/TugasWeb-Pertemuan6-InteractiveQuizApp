// ====================================================================
// TUGAS RUTIN 6 — INTERACTIVE QUIZ APP
// ====================================================================

// ---------- Data soal (REQUIREMENT: minimal 5, di sini ada 8) ----------
// Tiap soal punya kategori sendiri -> dipakai untuk badge kategori dan
// diacak urutannya tiap mulai kuis (bonus: kategori soal random).
const questions = [
  {
    category: "HTML",
    question: "Tag HTML apa yang dipakai untuk membuat link ke halaman lain?",
    options: ["<link>", "<a>", "<href>", "<nav>"],
    correctIndex: 1,
  },
  {
    category: "HTML",
    question: "Elemen semantik mana yang tepat untuk membungkus menu navigasi utama?",
    options: ["<div>", "<section>", "<nav>", "<aside>"],
    correctIndex: 2,
  },
  {
    category: "CSS",
    question: "Properti CSS apa yang dipakai untuk membuat layout grid?",
    options: ["display: flex", "display: grid", "position: grid", "layout: grid"],
    correctIndex: 1,
  },
  {
    category: "CSS",
    question: "Fungsi CSS apa yang dipakai supaya ukuran font menyesuaikan lebar layar secara halus?",
    options: ["calc()", "minmax()", "clamp()", "var()"],
    correctIndex: 2,
  },
  {
    category: "JavaScript",
    question: "Kata kunci apa yang dipakai untuk mendeklarasikan variabel yang nilainya tidak boleh diubah?",
    options: ["let", "var", "const", "static"],
    correctIndex: 2,
  },
  {
    category: "JavaScript",
    question: "Method array mana yang menghasilkan array baru berisi elemen yang lolos suatu kondisi?",
    options: [".map()", ".filter()", ".forEach()", ".reduce()"],
    correctIndex: 1,
  },
  {
    category: "JavaScript",
    question: "Apa fungsi utama dari async/await dalam JavaScript?",
    options: [
      "Mempercepat eksekusi kode",
      "Menulis kode asinkron dengan gaya sinkron",
      "Mengubah tipe data otomatis",
      "Membuat variabel global",
    ],
    correctIndex: 1,
  },
  {
    category: "Web API",
    question: "API browser mana yang dipakai untuk menyimpan data secara permanen di sisi klien?",
    options: ["sessionStorage", "cookies", "localStorage", "fetch"],
    correctIndex: 2,
  },
];

const CONFIG = {
  secondsPerQuestion: 15,
  highScoreKey: "quizAppHighScore",
};

// ---------- Referensi elemen DOM ----------
const screens = {
  start: document.getElementById("startScreen"),
  quiz: document.getElementById("quizScreen"),
  result: document.getElementById("resultScreen"),
};

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const highScoreDisplay = document.getElementById("highScoreDisplay");

const questionCounter = document.getElementById("questionCounter");
const categoryBadge = document.getElementById("categoryBadge");
const progressFill = document.getElementById("progressFill");
const timerFill = document.getElementById("timerFill");
const timerValue = document.getElementById("timerValue");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("options");

const finalScore = document.getElementById("finalScore");
const finalTotal = document.getElementById("finalTotal");
const resultMessage = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const newHighScoreNote = document.getElementById("newHighScoreNote");

const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

// ---------- State kuis ----------
let quizQuestions = [];
let currentIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = CONFIG.secondsPerQuestion;
let answerLocked = false;

// ====================================================================
// REQUIREMENT: navigasi tanpa reload halaman (SPA pattern)
// ====================================================================
const showScreen = (name) => {
  Object.entries(screens).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
};

// ====================================================================
// REQUIREMENT: high score di LocalStorage
// ====================================================================
const getHighScore = () => Number(localStorage.getItem(CONFIG.highScoreKey)) || 0;

const saveHighScoreIfNeeded = (finalScoreValue) => {
  const current = getHighScore();
  if (finalScoreValue > current) {
    localStorage.setItem(CONFIG.highScoreKey, String(finalScoreValue));
    return true;
  }
  return false;
};

// ---------- Utilitas: acak urutan array (Fisher-Yates) ----------
// Bonus: kategori soal random -> urutan soal (dan kategorinya) diacak
// setiap kali kuis dimulai.
const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ====================================================================
// REQUIREMENT: render soal dengan createElement / textContent
// (tidak pakai innerHTML supaya lebih aman dan sesuai ketentuan)
// ====================================================================
const renderQuestion = () => {
  answerLocked = false;
  const current = quizQuestions[currentIndex];

  // meta info
  questionCounter.textContent = `Soal ${currentIndex + 1}/${quizQuestions.length}`;
  categoryBadge.textContent = current.category;
  progressFill.style.width = `${(currentIndex / quizQuestions.length) * 100}%`;

  // teks pertanyaan
  questionText.textContent = current.question;

  // kosongkan container opsi lalu bangun ulang lewat createElement
  optionsContainer.textContent = "";

  current.options.forEach((optionText, index) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "option";
    optionButton.dataset.index = String(index);
    optionButton.textContent = optionText;
    optionsContainer.appendChild(optionButton);
  });

  // animasi transisi antar soal (bonus): retrigger animasi kartu
  const questionCard = document.getElementById("questionCard");
  questionCard.classList.remove("question-card");
  void questionCard.offsetWidth; // force reflow supaya animasi terulang
  questionCard.classList.add("question-card");

  startTimer();
};

// ====================================================================
// Timer per soal (bonus)
// ====================================================================
const startTimer = () => {
  clearInterval(timerInterval);
  timeLeft = CONFIG.secondsPerQuestion;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!answerLocked) {
        lockAnswer(null); // waktu habis, tidak ada jawaban dipilih
      }
    }
  }, 1000);
};

const updateTimerDisplay = () => {
  timerValue.textContent = String(Math.max(timeLeft, 0));
  const percent = (timeLeft / CONFIG.secondsPerQuestion) * 100;
  timerFill.style.width = `${Math.max(percent, 0)}%`;
  timerFill.style.background = timeLeft <= 5 ? "var(--wrong)" : "var(--primary)";
};

// ====================================================================
// REQUIREMENT: event delegation untuk pilihan jawaban
// Satu listener di container .options, bukan satu listener per tombol.
// ====================================================================
optionsContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".option");
  if (!button || answerLocked) return;

  const selectedIndex = Number(button.dataset.index);
  lockAnswer(selectedIndex);
});

// ====================================================================
// REQUIREMENT: feedback visual (benar = hijau, salah = merah)
// ====================================================================
const lockAnswer = (selectedIndex) => {
  answerLocked = true;
  clearInterval(timerInterval);

  const current = quizQuestions[currentIndex];
  const optionButtons = optionsContainer.querySelectorAll(".option");

  optionButtons.forEach((button, index) => {
    button.classList.add("option--disabled");
    if (index === current.correctIndex) {
      button.classList.add("option--correct");
    } else if (index === selectedIndex) {
      button.classList.add("option--wrong");
    }
  });

  if (selectedIndex === current.correctIndex) {
    score += 1;
  }

  setTimeout(goToNextQuestion, 900);
};

const goToNextQuestion = () => {
  currentIndex += 1;
  if (currentIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
};

// ====================================================================
// REQUIREMENT: skor otomatis di akhir quiz
// ====================================================================
const finishQuiz = () => {
  clearInterval(timerInterval);
  progressFill.style.width = "100%";

  finalScore.textContent = String(score);
  finalTotal.textContent = String(quizQuestions.length);

  const isNewHighScore = saveHighScoreIfNeeded(score);
  const percentage = Math.round((score / quizQuestions.length) * 100);

  if (percentage >= 80) {
    resultIcon.textContent = "🏆";
    resultTitle.textContent = "Mantap Banget!";
    resultMessage.textContent = "Pemahaman web-mu udah solid.";
  } else if (percentage >= 50) {
    resultIcon.textContent = "👍";
    resultTitle.textContent = "Lumayan!";
    resultMessage.textContent = "Sedikit lagi, terus belajar ya.";
  } else {
    resultIcon.textContent = "💪";
    resultTitle.textContent = "Ayo Coba Lagi";
    resultMessage.textContent = "Pelajari lagi materinya, pasti bisa lebih baik.";
  }

  newHighScoreNote.hidden = !isNewHighScore;
  highScoreDisplay.textContent = String(getHighScore());

  showScreen("result");
};

// ====================================================================
// REQUIREMENT: tombol restart untuk mengulang quiz
// ====================================================================
const startQuiz = () => {
  quizQuestions = shuffleArray(questions); // bonus: urutan/kategori soal diacak
  currentIndex = 0;
  score = 0;
  showScreen("quiz");
  renderQuestion();
};

startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", startQuiz);

// ====================================================================
// Dark mode toggle (bonus)
// ====================================================================
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  themeToggle.firstChild.textContent = theme === "dark" ? "☀️ " : "🌙 ";
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
};

let currentTheme = "light";
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(currentTheme);
});

// ====================================================================
// Inisialisasi
// ====================================================================
highScoreDisplay.textContent = String(getHighScore());
applyTheme(currentTheme);
showScreen("start");
