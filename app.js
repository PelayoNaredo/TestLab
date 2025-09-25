class TestLab {
  constructor() {
    this.subjects = [];
    this.currentSubject = null;
    this.currentTestType = null;
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.questionStates = []; // 'unanswered', 'answered', 'visited'
    this.visitedQuestions = new Set();
    this.shuffledAnswers = []; // Guardar el orden aleatorizado de cada pregunta
    this.testStartTime = null;
    this.timer = null;
    this.timePerQuestion = 30; // seconds for timed tests
    this.timeLeft = 0;

    this.init();
  }

  async init() {
    await this.loadSubjects();
    this.setupEventListeners();
    this.showScreen("subject-screen", "forward");
  }

  async loadSubjects() {
    try {
      console.log("Intentando cargar subjects...");
      // Load subjects from tests folder
      const subjectFiles = [
        "BMC_U2.json",
        "BMC_U2_examen.json",
        "FG_UD1.json",
        "FG_UD1_examen.json",
      ];

      for (const file of subjectFiles) {
        try {
          console.log(`Intentando cargar: tests/${file}`);
          const response = await fetch(`tests/${file}`);
          console.log(`Response para ${file}:`, response.status, response.ok);
          if (response.ok) {
            const data = await response.json();
            console.log(`Datos cargados para ${file}:`, data.name);
            this.subjects.push({
              id: file.replace(".json", ""),
              name:
                data.name ||
                file.replace(".json", "").charAt(0).toUpperCase() +
                  file.slice(1, -5),
              icon: data.icon || "📚",
              description:
                data.description ||
                `Test de ${data.name || file.replace(".json", "")}`,
              questions: data.questions || [],
            });
          }
        } catch (error) {
          console.warn(`Could not load ${file}:`, error);
        }
      }

      console.log(`Total subjects cargados: ${this.subjects.length}`);
      // If no subjects loaded, create sample data
      if (this.subjects.length === 0) {
        console.log("No se cargaron subjects, usando samples...");
        this.createSampleSubjects();
      }

      this.renderSubjects();
    } catch (error) {
      console.error("Error loading subjects:", error);
      console.log("Error general, usando samples...");
      this.createSampleSubjects();
      this.renderSubjects();
    }
  }

  createSampleSubjects() {
    this.subjects = [
      {
        id: "matematicas",
        name: "Matemáticas",
        icon: "https://cdn.lordicon.com/veoexymv.json",
        description: "Álgebra, geometría y cálculo básico",
        questions: [
          {
            question: "¿Cuál es el resultado de 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
            explanation:
              "La suma de 2 + 2 es igual a 4. Es una operación aritmética básica.",
          },
          {
            question: "¿Cuál es el valor de π (pi) aproximadamente?",
            options: ["3.14", "2.71", "4.20", "1.41"],
            correctAnswer: 0,
            explanation:
              "Pi (π) es aproximadamente 3.14159... Es la relación entre la circunferencia de un círculo y su diámetro.",
          },
          {
            question: "¿Cuánto es 5 × 7?",
            options: ["30", "32", "35", "37"],
            correctAnswer: 2,
            explanation: "5 multiplicado por 7 es igual a 35.",
          },
        ],
      },
      {
        id: "ciencias",
        name: "Ciencias",
        icon: "https://cdn.lordicon.com/zpxybbhl.json",
        description: "Física, química y biología",
        questions: [
          {
            question: "¿Cuál es el símbolo químico del agua?",
            options: ["H2O", "HO2", "O2H", "OH2"],
            correctAnswer: 0,
            explanation:
              "El agua tiene la fórmula química H2O, que significa dos átomos de hidrógeno y uno de oxígeno.",
          },
          {
            question: "¿A qué velocidad se propaga la luz en el vacío?",
            options: [
              "300,000 km/h",
              "300,000 km/s",
              "30,000 km/s",
              "3,000,000 km/s",
            ],
            correctAnswer: 1,
            explanation:
              "La velocidad de la luz en el vacío es aproximadamente 300,000 kilómetros por segundo.",
          },
        ],
      },
      {
        id: "historia",
        name: "Historia",
        icon: "https://cdn.lordicon.com/wzwygmng.json",
        description: "Historia universal y nacional",
        questions: [
          {
            question: "¿En qué año comenzó la Segunda Guerra Mundial?",
            options: ["1938", "1939", "1940", "1941"],
            correctAnswer: 1,
            explanation:
              "La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana de Polonia.",
          },
          {
            question: "¿Quién fue el primer hombre en pisar la Luna?",
            options: [
              "Buzz Aldrin",
              "Neil Armstrong",
              "John Glenn",
              "Alan Shepard",
            ],
            correctAnswer: 1,
            explanation:
              "Neil Armstrong fue el primer ser humano en pisar la Luna el 20 de julio de 1969.",
          },
        ],
      },
    ];
  }

  renderSubjects() {
    const subjectsGrid = document.getElementById("subjects-grid");
    subjectsGrid.innerHTML = "";

    this.subjects.forEach((subject, index) => {
      const subjectCard = document.createElement("div");
      subjectCard.className =
        "subject-card animate__animated animate__bounceIn";
      subjectCard.style.animationDelay = `${index * 0.1}s`;
      subjectCard.dataset.subjectId = subject.id;

      subjectCard.innerHTML = `
                <div class="subject-icon">
                    <lord-icon
                        src="${subject.icon}"
                        trigger="hover"
                        style="width:100px;height:100px">
                    </lord-icon>
                </div>
                <h3>${subject.name}</h3>
                <p>${subject.description}</p>
            `;

      subjectCard.addEventListener("click", () =>
        this.selectSubject(subject.id)
      );
      subjectsGrid.appendChild(subjectCard);
    });
  }

  setupEventListeners() {
    // Navigation buttons
    document
      .getElementById("back-to-subjects")
      .addEventListener("click", () => {
        this.showScreen("subject-screen", "backward");
      });

    document
      .getElementById("back-to-test-types")
      .addEventListener("click", () => {
        // Stop continuous timer when leaving test
        this.stopContinuousTimer();
        this.showScreen("test-type-screen", "backward");
      });

    document
      .getElementById("back-to-subjects-final")
      .addEventListener("click", () => {
        this.showScreen("subject-screen", "backward");
      });

    // Test type selection
    document.querySelectorAll(".test-type-card").forEach((card) => {
      card.addEventListener("click", () => {
        const testType = card.dataset.type;
        this.selectTestType(testType);
      });
    });

    // Test actions
    document
      .getElementById("show-explanation")
      .addEventListener("click", () => {
        this.showExplanation();
      });

    // Header navigation buttons
    document
      .getElementById("next-question-header")
      .addEventListener("click", () => {
        this.nextQuestion();
      });

    document.getElementById("prev-question").addEventListener("click", () => {
      this.prevQuestion();
    });

    document.getElementById("restart-test").addEventListener("click", () => {
      this.restartTest();
    });

    // Add button click animations
    document
      .querySelectorAll("button, .test-type-card, .subject-card")
      .forEach((element) => {
        element.addEventListener("click", () => {
          element.classList.add("animate__animated", "animate__headShake");
          element.addEventListener(
            "animationend",
            () => {
              element.classList.remove(
                "animate__animated",
                "animate__headShake"
              );
            },
            { once: true }
          );
        });
      });
  }

  showScreen(screenId, direction = "forward") {
    const currentScreen = document.querySelector(".screen.active");
    const nextScreen = document.getElementById(screenId);

    if (currentScreen && currentScreen.id === screenId) return;

    const isInitialLoad = !currentScreen;

    let inAnimation, outAnimation;
    if (isInitialLoad) {
      inAnimation = "animate__fadeIn";
      outAnimation = "animate__fadeOut";
    } else {
      inAnimation =
        direction === "forward"
          ? "animate__slideInRightFade"
          : "animate__slideInLeftFade";
      outAnimation =
        direction === "forward"
          ? "animate__slideOutLeftFade"
          : "animate__slideOutRightFade";
    }

    // Preparar la nueva pantalla inmediatamente
    nextScreen.style.zIndex = 10;
    nextScreen.classList.add("active");
    nextScreen.classList.add("animate__animated", inAnimation);

    if (currentScreen) {
      // Asegurar que la pantalla saliente esté por debajo
      currentScreen.style.zIndex = 5;
      currentScreen.classList.add("animate__animated", outAnimation);

      // Manejar el final de la animación de salida
      currentScreen.addEventListener(
        "animationend",
        () => {
          currentScreen.classList.remove("active");
          currentScreen.classList.remove("animate__animated", outAnimation);
          currentScreen.style.zIndex = "";
          // Forzar la ocultación inmediata
          currentScreen.style.visibility = "hidden";
          // Restaurar la visibilidad después de un pequeño delay para evitar flickering
          setTimeout(() => {
            if (!currentScreen.classList.contains("active")) {
              currentScreen.style.visibility = "";
            }
          }, 50);
        },
        { once: true }
      );
    }

    // Manejar el final de la animación de entrada
    nextScreen.addEventListener(
      "animationend",
      () => {
        nextScreen.classList.remove("animate__animated", inAnimation);
        nextScreen.style.zIndex = 10; // Mantener un z-index alto para la pantalla activa
      },
      { once: true }
    );
  }

  selectSubject(subjectId) {
    this.currentSubject = this.subjects.find((s) => s.id === subjectId);
    if (this.currentSubject) {
      document.getElementById("selected-subject-title").textContent =
        this.currentSubject.name;

      const testTypeCards = document.querySelectorAll(".test-type-card");
      testTypeCards.forEach((card, index) => {
        card.classList.add("animate__animated", "animate__bounceIn");
        card.style.animationDelay = `${index * 0.1}s`;
      });

      this.showScreen("test-type-screen", "forward");
    }
  }

  selectTestType(testType) {
    this.currentTestType = testType;
    this.prepareTest();
    this.showScreen("test-screen", "forward");
    this.startTest();
  }

  prepareTest() {
    let questions = [...this.currentSubject.questions];

    switch (this.currentTestType) {
      case "sequential":
        // Keep original order
        break;
      case "random":
        questions = this.shuffleArray(questions);
        break;
      case "errors":
        // For demo, we'll use all questions but could filter previously failed ones
        questions = this.shuffleArray(questions);
        break;
      case "timed":
        questions = this.shuffleArray(questions);
        this.timePerQuestion = 30; // 30 seconds per question
        break;
    }

    this.currentQuestions = questions;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  startTest() {
    this.testStartTime = Date.now();

    // Initialize question states
    this.userAnswers = new Array(this.currentQuestions.length).fill(undefined);
    this.questionStates = new Array(this.currentQuestions.length).fill(
      "unanswered"
    );
    this.visitedQuestions.clear();
    this.shuffledAnswers = new Array(this.currentQuestions.length).fill(null);

    // Setup timer - always visible for all test types
    document.getElementById("test-timer").style.display = "flex";

    // Start continuous timer for the entire test
    this.startContinuousTimer();

    // Create question status grid
    this.createQuestionStatusGrid();

    this.displayQuestion();
  }

  displayQuestion() {
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      this.finishTest();
      return;
    }

    const question = this.currentQuestions[this.currentQuestionIndex];

    // Update progress
    document.getElementById("current-question").textContent =
      this.currentQuestionIndex + 1;
    document.getElementById("total-questions").textContent =
      this.currentQuestions.length;

    // Update progress bar
    const progressPercentage =
      ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${progressPercentage}%`;

    // Animate and display question
    const questionCard = document.querySelector("#test-screen .question-card");
    questionCard.classList.add("animate__animated", "animate__slideInLeft");
    questionCard.addEventListener(
      "animationend",
      () => {
        questionCard.classList.remove(
          "animate__animated",
          "animate__slideInLeft"
        );
      },
      { once: true }
    );

    document.getElementById("question-text").textContent = question.question;

    // Mark current question as visited
    this.visitedQuestions.add(this.currentQuestionIndex);

    // Reset question GIF to default state
    this.updateQuestionGif("default");

    // Display answers
    this.displayAnswers(question);

    // Hide elements that should not be visible initially (unless previously answered)
    const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== undefined;
    document.getElementById("question-explanation").style.display = "none";
    document.getElementById("show-explanation").style.display = hasAnswer
      ? "inline-block"
      : "none";

    // Update navigation buttons
    this.updateNavigationButtons();

    // Timer continues running, no need to restart for each question
  }

  displayAnswers(question) {
    const answersContainer = document.getElementById("answers-container");
    answersContainer.innerHTML = "";

    let shuffledOptions;
    let newCorrectIndex;

    // Verificar si ya tenemos el orden aleatorizado para esta pregunta
    if (this.shuffledAnswers[this.currentQuestionIndex] === null) {
      // Primera vez que visitamos esta pregunta, aleatorizar y guardar
      const optionsWithIndexes = question.options.map((option, index) => ({
        text: option,
        originalIndex: index,
      }));

      shuffledOptions = this.shuffleArray(optionsWithIndexes);

      // Encontrar el nuevo índice de la respuesta correcta
      newCorrectIndex = shuffledOptions.findIndex(
        (option) => option.originalIndex === question.correctAnswer
      );

      // Guardar el orden aleatorizado y la respuesta correcta para esta pregunta
      this.shuffledAnswers[this.currentQuestionIndex] = {
        options: shuffledOptions,
        correctAnswerIndex: newCorrectIndex,
      };
    } else {
      // Usar el orden aleatorizado ya guardado
      const savedData = this.shuffledAnswers[this.currentQuestionIndex];
      shuffledOptions = savedData.options;
      newCorrectIndex = savedData.correctAnswerIndex;
    }

    // Actualizar el índice de la respuesta correcta para esta pregunta
    question.shuffledCorrectAnswer = newCorrectIndex;

    shuffledOptions.forEach((option, index) => {
      const answerOption = document.createElement("div");
      answerOption.className = "answer-option";
      answerOption.dataset.answerIndex = index;

      answerOption.innerHTML = `
                <div class="option-letter">${String.fromCharCode(
                  65 + index
                )}</div>
                <div class="option-text">${option.text}</div>
            `;

      answerOption.addEventListener("click", () => this.selectAnswer(index));
      answersContainer.appendChild(answerOption);
    });

    // Restore previous answer selection if exists
    const previousAnswer = this.userAnswers[this.currentQuestionIndex];
    if (previousAnswer !== undefined) {
      const selectedOption = document.querySelector(
        `.answer-option[data-answer-index="${previousAnswer}"]`
      );
      if (selectedOption) {
        selectedOption.classList.add("selected");
        document.getElementById("show-explanation").style.display =
          "inline-block";

        // Show answer feedback for previously answered questions
        this.showAnswerFeedback();

        // Update GIF state
        const isCorrect = previousAnswer === question.shuffledCorrectAnswer;
        this.updateQuestionGif(isCorrect ? "correct" : "incorrect");
      }
    }

    // Update question status grid
    this.updateQuestionStatusGrid();
  }

  selectAnswer(answerIndex) {
    // Remove previous selections
    document.querySelectorAll(".answer-option").forEach((option) => {
      option.classList.remove("selected");
    });

    // Mark selected answer
    const selectedOption = document.querySelector(
      `.answer-option[data-answer-index="${answerIndex}"]`
    );
    selectedOption.classList.add("selected");

    // Store user answer
    this.userAnswers[this.currentQuestionIndex] = answerIndex;
    this.questionStates[this.currentQuestionIndex] = "answered";

    // Enable explanation button
    document.getElementById("show-explanation").style.display = "inline-block";

    // Update navigation buttons and status grid
    this.updateNavigationButtons();
    this.updateQuestionStatusGrid();

    // Update GIF based on correct/incorrect answer
    const question = this.currentQuestions[this.currentQuestionIndex];
    const isCorrect = answerIndex === question.shuffledCorrectAnswer;
    this.updateQuestionGif(isCorrect ? "correct" : "incorrect");

    // Show correct/incorrect feedback
    this.showAnswerFeedback();

    // Timer continues running throughout the test
  }

  updateQuestionGif(state) {
    const questionGif = document.getElementById("question-gif");

    // Remove existing animation classes
    questionGif.classList.remove("correct", "incorrect");

    // Update GIF source and add animation class based on state
    switch (state) {
      case "default":
        questionGif.src = "assets/helocuti-hihihuhu.gif";
        questionGif.alt = "Hello Kitty Default";
        break;
      case "correct":
        questionGif.src = "assets/hello.gif";
        questionGif.alt = "Hello Kitty Correct";
        questionGif.classList.add("correct");
        break;
      case "incorrect":
        questionGif.src = "assets/nunu.gif";
        questionGif.alt = "Hello Kitty Incorrect";
        questionGif.classList.add("incorrect");
        break;
    }
  }

  showAnswerFeedback() {
    const question = this.currentQuestions[this.currentQuestionIndex];
    const userAnswer = this.userAnswers[this.currentQuestionIndex];

    document.querySelectorAll(".answer-option").forEach((option, index) => {
      // Usar el índice aleatorizado de la respuesta correcta
      const isCorrect = index === question.shuffledCorrectAnswer;
      const isUserChoice = index === userAnswer;

      if (isCorrect) {
        option.classList.add("correct", "animate__animated", "animate__tada");
      } else if (isUserChoice && !isCorrect) {
        option.classList.add(
          "incorrect",
          "animate__animated",
          "animate__wobble"
        );
      }

      // Disable further clicking
      option.style.pointerEvents = "none";

      // Clean up animation classes after they finish
      option.addEventListener(
        "animationend",
        () => {
          option.classList.remove(
            "animate__animated",
            "animate__tada",
            "animate__wobble"
          );
        },
        { once: true }
      );
    });
  }

  showExplanation() {
    const question = this.currentQuestions[this.currentQuestionIndex];
    const explanationElement = document.getElementById("question-explanation");
    const explanationText = document.getElementById("explanation-text");

    if (question.explanation) {
      explanationText.textContent = question.explanation;
      explanationElement.style.display = "block";
    }

    // Hide the explanation button after clicking
    document.getElementById("show-explanation").style.display = "none";
  }

  startContinuousTimer() {
    this.continuousTimer = setInterval(() => {
      this.updateContinuousTimerDisplay();
    }, 1000);
  }

  stopContinuousTimer() {
    if (this.continuousTimer) {
      clearInterval(this.continuousTimer);
      this.continuousTimer = null;
    }
  }

  updateContinuousTimerDisplay() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - this.testStartTime) / 1000);

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const display = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    document.getElementById("timer-display").textContent = display;

    // Set color based on test type and elapsed time
    const timerElement = document.getElementById("test-timer");

    if (this.currentTestType === "timed") {
      // For timed tests, show warning colors as time progresses
      const totalTimeLimit =
        this.timePerQuestion * this.currentQuestions.length; // Total time for all questions
      const timeRemaining = totalTimeLimit - elapsedTime;

      if (timeRemaining <= 60) {
        // Less than 1 minute remaining
        timerElement.style.color = "var(--error-color)";
      } else if (timeRemaining <= 180) {
        // Less than 3 minutes remaining
        timerElement.style.color = "var(--warning-color)";
      } else {
        timerElement.style.color = "var(--primary-dark)";
      }

      // Auto-complete test if time runs out
      if (timeRemaining <= 0) {
        this.showResults();
      }
    } else {
      timerElement.style.color = "var(--primary-dark)";
    }
  }

  startQuestionTimer() {
    this.timeLeft = this.timePerQuestion;
    this.updateTimerDisplay();

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      // Only timeout for timed tests, other tests continue counting up after 0
      if (this.timeLeft <= 0 && this.currentTestType === "timed") {
        this.timeOut();
      } else if (this.timeLeft <= 0) {
        // For non-timed tests, continue counting in negative (showing elapsed time)
        this.timeLeft--;
      }
    }, 1000);
  }

  stopQuestionTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimerDisplay() {
    const timerElement = document.getElementById("test-timer");

    if (this.currentTestType === "timed") {
      // For timed tests, show countdown
      const minutes = Math.floor(Math.abs(this.timeLeft) / 60);
      const seconds = Math.abs(this.timeLeft) % 60;
      const display = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      document.getElementById("timer-display").textContent = display;

      // Change color when time is running out
      if (this.timeLeft <= 10) {
        timerElement.style.color = "var(--error-color)";
      } else if (this.timeLeft <= 20) {
        timerElement.style.color = "var(--warning-color)";
      } else {
        timerElement.style.color = "var(--warning-color)";
      }
    } else {
      // For other tests, show elapsed time (count up from 0)
      const elapsedTime = this.timePerQuestion - this.timeLeft;
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      const display = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      document.getElementById("timer-display").textContent = display;
      timerElement.style.color = "var(--primary-dark)";
    }
  }

  timeOut() {
    this.stopQuestionTimer();

    // If no answer was selected, mark as incorrect
    if (this.userAnswers[this.currentQuestionIndex] === undefined) {
      this.userAnswers[this.currentQuestionIndex] = -1; // Mark as timeout
    }

    this.showAnswerFeedback();
    document.getElementById("show-explanation").style.display = "inline-block";
  }

  nextQuestion() {
    this.currentQuestionIndex++;

    // Re-enable answer options for next question
    document.querySelectorAll(".answer-option").forEach((option) => {
      option.style.pointerEvents = "auto";
    });

    this.updateNavigationButtons();
    this.displayQuestion();
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;

      // Re-enable answer options
      document.querySelectorAll(".answer-option").forEach((option) => {
        option.style.pointerEvents = "auto";
      });

      this.updateNavigationButtons();
      this.displayQuestion();
    }
  }

  createQuestionStatusGrid() {
    const grid = document.getElementById("question-status-grid");
    grid.innerHTML = "";

    // Solo crear 3 botones: anterior, actual, siguiente
    for (let i = 0; i < 3; i++) {
      const btn = document.createElement("button");
      btn.className = "question-status-btn";
      btn.addEventListener("click", (e) => {
        const questionIndex = parseInt(e.target.dataset.questionIndex);
        if (
          questionIndex >= 0 &&
          questionIndex < this.currentQuestions.length
        ) {
          this.goToQuestion(questionIndex);
        }
      });
      grid.appendChild(btn);
    }

    this.updateQuestionStatusGrid();
  }

  updateQuestionStatusGrid() {
    const buttons = document.querySelectorAll(".question-status-btn");
    const current = this.currentQuestionIndex;
    const total = this.currentQuestions.length;

    // Determinar los índices a mostrar: anterior, actual, siguiente
    const indices = [
      current > 0 ? current - 1 : null,
      current,
      current < total - 1 ? current + 1 : null,
    ];

    buttons.forEach((btn, position) => {
      const questionIndex = indices[position];

      // Limpiar todas las clases
      btn.classList.remove(
        "current",
        "answered-correct",
        "answered-incorrect",
        "visited"
      );

      if (questionIndex === null) {
        // No hay pregunta para esta posición
        btn.style.opacity = "0.3";
        btn.textContent = "—";
        btn.disabled = true;
        btn.dataset.questionIndex = "-1";
      } else {
        btn.style.opacity = "1";
        btn.textContent = questionIndex + 1;
        btn.disabled = false;
        btn.dataset.questionIndex = questionIndex;
        btn.title = `Pregunta ${questionIndex + 1}`;

        // Aplicar el estado apropiado
        if (questionIndex === current) {
          btn.classList.add("current");
        } else if (this.userAnswers[questionIndex] !== undefined) {
          // Verificar si la respuesta fue correcta
          const question = this.currentQuestions[questionIndex];
          const userAnswer = this.userAnswers[questionIndex];
          const isCorrect = userAnswer === question.shuffledCorrectAnswer;

          if (isCorrect) {
            btn.classList.add("answered-correct");
          } else {
            btn.classList.add("answered-incorrect");
          }
        } else if (this.visitedQuestions.has(questionIndex)) {
          btn.classList.add("visited");
        }
      }
    });
  }

  goToQuestion(index) {
    if (index >= 0 && index < this.currentQuestions.length) {
      // Mark current question as visited before moving
      this.visitedQuestions.add(this.currentQuestionIndex);

      this.currentQuestionIndex = index;
      this.displayQuestion();
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-question");
    const nextHeaderBtn = document.getElementById("next-question-header");

    // Update previous button
    prevBtn.disabled = this.currentQuestionIndex === 0;

    // Update next header button
    const hasAnswered =
      this.userAnswers[this.currentQuestionIndex] !== undefined;
    const isLastQuestion =
      this.currentQuestionIndex >= this.currentQuestions.length - 1;

    if (isLastQuestion && hasAnswered) {
      nextHeaderBtn.disabled = false;
      nextHeaderBtn.textContent = "Ver Resultados";
    } else {
      nextHeaderBtn.disabled = !hasAnswered;
      nextHeaderBtn.innerHTML = `
        Siguiente
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      `;
    }
  }

  finishTest() {
    this.stopQuestionTimer();
    this.showResults();
    this.showScreen("results-screen", "forward");
  }

  showResults() {
    // Stop the continuous timer
    this.stopContinuousTimer();

    const totalQuestions = this.currentQuestions.length;
    const correctAnswers = this.userAnswers.reduce((count, answer, index) => {
      const question = this.currentQuestions[index];
      // Usar el índice aleatorizado si existe, sino el original
      const correctIndex =
        question.shuffledCorrectAnswer !== undefined
          ? question.shuffledCorrectAnswer
          : question.correctAnswer;
      return count + (answer === correctIndex ? 1 : 0);
    }, 0);

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const testDuration = this.formatTime(Date.now() - this.testStartTime);

    // Update results display
    document.getElementById("score-percentage").textContent = `${percentage}%`;
    document.getElementById(
      "correct-answers"
    ).textContent = `${correctAnswers}/${totalQuestions}`;
    document.getElementById("time-taken").textContent = testDuration;

    // Update results title based on performance
    const resultsTitle = document.getElementById("results-title");
    const resultsContent = document.querySelector(".results-content");
    resultsContent.classList.remove("success-animation");

    if (percentage >= 90) {
      resultsTitle.textContent = "¡Excelente trabajo!";
      resultsContent.classList.add("success-animation");
    } else if (percentage >= 70) {
      resultsTitle.textContent = "¡Bien hecho!";
    } else if (percentage >= 50) {
      resultsTitle.textContent = "¡Buen intento!";
    } else {
      resultsTitle.textContent = "¡Sigue practicando!";
    }

    // El icono de Hello Kitty se mantiene siempre igual
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  restartTest() {
    this.prepareTest();
    this.startTest();
    this.showScreen("test-screen", "forward");
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TestLab();
  createParticles();
});

// Particles Animation
function createParticles() {
  const particlesContainer = document.getElementById("particles-container");
  const particleCount = 50; // Número de partículas

  function createParticle() {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    // Tamaño aleatorio entre 2px y 8px
    const size = Math.random() * 6 + 2;
    particle.style.width = size + "px";
    particle.style.height = size + "px";

    // Posición horizontal aleatoria
    particle.style.left = Math.random() * 100 + "%";

    // Duración de animación aleatoria
    const duration = Math.random() * 10 + 8; // Entre 8 y 18 segundos
    particle.style.animationDuration = duration + "s";

    // Retraso aleatorio
    particle.style.animationDelay = Math.random() * 5 + "s";

    particlesContainer.appendChild(particle);

    // Eliminar la partícula cuando termine la animación y crear una nueva
    particle.addEventListener("animationend", () => {
      particle.remove();
      createParticle();
    });
  }

  // Crear partículas iniciales
  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => createParticle(), i * 200);
  }
}
