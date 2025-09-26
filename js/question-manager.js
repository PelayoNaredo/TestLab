// Manejador de preguntas y respuestas
class QuestionManager {
  constructor() {
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.questionStates = [];
    this.visitedQuestions = new Set();
    this.shuffledAnswers = [];
    this.onAnswerSelected = null; // Callback para cuando se selecciona una respuesta
  }

  // Inicializar el estado de las preguntas
  initializeQuestionState(questions) {
    this.currentQuestions = questions;
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(questions.length).fill(undefined);
    this.questionStates = new Array(questions.length).fill("unanswered");
    this.visitedQuestions.clear();
    this.shuffledAnswers = new Array(questions.length).fill(null);
  }

  // Establecer nuevas preguntas (para configuración de test)
  setQuestions(questions) {
    this.initializeQuestionState(questions);
  }

  // Mostrar pregunta actual
  displayQuestion() {
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      return false; // Test terminado
    }

    const question = this.currentQuestions[this.currentQuestionIndex];

    // Actualizar progreso
    document.getElementById("current-question").textContent =
      this.currentQuestionIndex + 1;
    document.getElementById("total-questions").textContent =
      this.currentQuestions.length;

    // Actualizar barra de progreso
    const progressPercentage =
      ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${progressPercentage}%`;

    // Animar tarjeta de pregunta
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

    // Mostrar texto de pregunta
    document.getElementById("question-text").textContent = question.question;

    // Marcar pregunta como visitada
    this.visitedQuestions.add(this.currentQuestionIndex);

    // Mostrar respuestas
    this.displayAnswers(question);

    // Configurar estado inicial de elementos
    const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== undefined;
    document.getElementById("question-explanation").style.display = "none";
    document.getElementById("show-explanation").style.display = hasAnswer
      ? "inline-block"
      : "none";

    return true;
  }

  // Mostrar opciones de respuesta
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

      shuffledOptions = Utils.shuffleArray(optionsWithIndexes);

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
        <div class="option-letter">${String.fromCharCode(65 + index)}</div>
        <div class="option-text">${option.text}</div>
      `;

      answerOption.addEventListener("click", () => this.selectAnswer(index));
      answersContainer.appendChild(answerOption);
    });

    // Restaurar selección previa si existe
    const previousAnswer = this.userAnswers[this.currentQuestionIndex];
    if (previousAnswer !== undefined) {
      const selectedOption = document.querySelector(
        `.answer-option[data-answer-index="${previousAnswer}"]`
      );
      if (selectedOption) {
        selectedOption.classList.add("selected");
        document.getElementById("show-explanation").style.display =
          "inline-block";

        // Mostrar feedback de respuesta para preguntas previamente respondidas
        this.showAnswerFeedback();

        // Actualizar GIF según la respuesta
        const isCorrect = previousAnswer === question.shuffledCorrectAnswer;
        this.updateQuestionGif(isCorrect ? "correct" : "incorrect");
      }
    }
  }

  // Seleccionar una respuesta
  selectAnswer(answerIndex) {
    // Remover selecciones previas
    document.querySelectorAll(".answer-option").forEach((option) => {
      option.classList.remove("selected");
    });

    // Marcar respuesta seleccionada
    const selectedOption = document.querySelector(
      `.answer-option[data-answer-index="${answerIndex}"]`
    );
    selectedOption.classList.add("selected");

    // Guardar respuesta del usuario
    this.userAnswers[this.currentQuestionIndex] = answerIndex;
    this.questionStates[this.currentQuestionIndex] = "answered";

    // Mostrar botón de explicación
    document.getElementById("show-explanation").style.display = "inline-block";

    // Actualizar GIF según correcta/incorrecta
    const question = this.currentQuestions[this.currentQuestionIndex];
    const isCorrect = answerIndex === question.shuffledCorrectAnswer;
    this.updateQuestionGif(isCorrect ? "correct" : "incorrect");

    // Mostrar feedback de respuesta
    this.showAnswerFeedback();

    // Notificar que se seleccionó una respuesta
    if (this.onAnswerSelected) {
      this.onAnswerSelected();
    }
  }

  // Mostrar feedback visual de las respuestas
  showAnswerFeedback() {
    const question = this.currentQuestions[this.currentQuestionIndex];
    const userAnswer = this.userAnswers[this.currentQuestionIndex];

    if (userAnswer === undefined) return;

    document.querySelectorAll(".answer-option").forEach((option, index) => {
      option.classList.remove("correct", "incorrect");

      if (index === question.shuffledCorrectAnswer) {
        option.classList.add("correct");
      } else if (index === userAnswer) {
        option.classList.add("incorrect");
      }

      // Deshabilitar clicks después de responder
      option.style.pointerEvents = "none";
    });
  }

  // Actualizar GIF de la pregunta
  updateQuestionGif(state) {
    const questionGif = document.getElementById("question-gif");

    // Remover clases de animación existentes
    questionGif.classList.remove("correct", "incorrect");

    const gifStates = {
      default: "assets/helocuti-hihihuhu.gif",
      correct: "assets/hello.gif",
      incorrect: "assets/nunu.gif",
    };

    if (gifStates[state]) {
      questionGif.src = gifStates[state];
      if (state !== "default") {
        questionGif.classList.add(state);
      }
    }
  }

  // Navegar a una pregunta específica
  goToQuestion(index) {
    if (index >= 0 && index < this.currentQuestions.length) {
      // Marcar pregunta actual como visitada antes de moverse
      this.visitedQuestions.add(this.currentQuestionIndex);

      this.currentQuestionIndex = index;
      return true;
    }
    return false;
  }

  // Ir a la siguiente pregunta
  nextQuestion() {
    if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
      this.currentQuestionIndex++;

      // Re-habilitar opciones de respuesta para la siguiente pregunta
      document.querySelectorAll(".answer-option").forEach((option) => {
        option.style.pointerEvents = "auto";
        option.classList.remove("correct", "incorrect", "selected");
      });

      return true;
    }
    return false; // Test terminado
  }

  // Ir a la pregunta anterior
  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;

      // Re-habilitar opciones de respuesta
      document.querySelectorAll(".answer-option").forEach((option) => {
        option.style.pointerEvents = "auto";
        option.classList.remove("correct", "incorrect", "selected");
      });

      return true;
    }
    return false;
  }

  // Obtener estadísticas del test
  getTestStats() {
    const totalQuestions = this.currentQuestions.length;
    let correctAnswers = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const userAnswer = this.userAnswers[i];
      const question = this.currentQuestions[i];

      if (
        userAnswer !== undefined &&
        userAnswer === question.shuffledCorrectAnswer
      ) {
        correctAnswers++;
      }
    }

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      percentage,
      answeredQuestions: this.userAnswers.filter(
        (answer) => answer !== undefined
      ).length,
    };
  }

  // Verificar si el test está completo
  isTestComplete() {
    return this.userAnswers.every((answer) => answer !== undefined);
  }

  // Obtener pregunta actual
  getCurrentQuestion() {
    return this.currentQuestions[this.currentQuestionIndex];
  }

  // Resetear estado
  reset() {
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.questionStates = [];
    this.visitedQuestions.clear();
    this.shuffledAnswers = [];
  }
}

// Exportar para uso en otros módulos
window.QuestionManager = QuestionManager;
