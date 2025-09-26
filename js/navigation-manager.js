// Manejador de navegación y grid de estado de preguntas
class NavigationManager {
  constructor(questionManager) {
    this.questionManager = questionManager;
    this.eventListenersSetup = false;
  }

  // Crear el grid de estado de preguntas (solo 3 círculos)
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
          questionIndex < this.questionManager.currentQuestions.length
        ) {
          if (this.questionManager.goToQuestion(questionIndex)) {
            this.updateNavigationButtons();
            this.updateQuestionStatusGrid();
            this.questionManager.displayQuestion();
          }
        }
      });
      grid.appendChild(btn);
    }

    this.updateQuestionStatusGrid();
  }

  // Actualizar el grid de estado de preguntas
  updateQuestionStatusGrid() {
    const buttons = document.querySelectorAll(".question-status-btn");
    const current = this.questionManager.currentQuestionIndex;
    const total = this.questionManager.currentQuestions.length;

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
        } else if (
          this.questionManager.userAnswers[questionIndex] !== undefined
        ) {
          // Verificar si la respuesta fue correcta
          const question = this.questionManager.currentQuestions[questionIndex];
          const userAnswer = this.questionManager.userAnswers[questionIndex];
          const isCorrect = userAnswer === question.shuffledCorrectAnswer;

          if (isCorrect) {
            btn.classList.add("answered-correct");
          } else {
            btn.classList.add("answered-incorrect");
          }
        } else if (this.questionManager.visitedQuestions.has(questionIndex)) {
          btn.classList.add("visited");
        }
      }
    });
  }

  // Actualizar botones de navegación
  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-question");
    const nextHeaderBtn = document.getElementById("next-question-header");

    if (!prevBtn || !nextHeaderBtn) {
      console.error("❌ No se encontraron botones de navegación");
      return;
    }

    // Actualizar botón anterior
    prevBtn.disabled = this.questionManager.currentQuestionIndex === 0;

    // Actualizar botón siguiente
    const hasAnswered =
      this.questionManager.userAnswers[
        this.questionManager.currentQuestionIndex
      ] !== undefined;
    const isLastQuestion =
      this.questionManager.currentQuestionIndex >=
      this.questionManager.currentQuestions.length - 1;

    console.log(
      `🔍 Estado navegación - Índice: ${this.questionManager.currentQuestionIndex}, Respondida: ${hasAnswered}, Última: ${isLastQuestion}`
    );

    if (isLastQuestion && hasAnswered) {
      nextHeaderBtn.disabled = false;
      nextHeaderBtn.textContent = "Ver Resultados";
      console.log("🏁 Botón configurado para ver resultados");
    } else {
      nextHeaderBtn.disabled = !hasAnswered;
      nextHeaderBtn.innerHTML = `
        
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
      console.log(
        `➡️ Botón siguiente ${hasAnswered ? "habilitado" : "deshabilitado"}`
      );
    }

    // Actualizar grid de estado
    this.updateQuestionStatusGrid();
  }

  // Configurar event listeners para navegación
  setupNavigationEventListeners() {
    // Evitar configurar listeners múltiples veces
    if (this.eventListenersSetup) {
      console.log("⚠️ Event listeners de navegación ya configurados");
      return;
    }

    console.log("🔧 Configurando event listeners de navegación...");

    // Verificar que los elementos existen
    const prevBtn = document.getElementById("prev-question");
    const nextBtn = document.getElementById("next-question-header");

    if (!prevBtn || !nextBtn) {
      console.error("❌ Botones de navegación no encontrados en el DOM");
      return;
    }

    // Botón anterior
    prevBtn.addEventListener("click", () => {
      console.log("⬅️ Click en botón anterior");
      if (this.questionManager.prevQuestion()) {
        this.questionManager.displayQuestion();
        this.updateNavigationButtons();
        this.questionManager.updateQuestionGif("default");
      }
    });

    // Botón siguiente en header
    nextBtn.addEventListener("click", () => {
      console.log("➡️ Click en botón siguiente");
      const isLastQuestion =
        this.questionManager.currentQuestionIndex >=
        this.questionManager.currentQuestions.length - 1;
      const hasAnswered =
        this.questionManager.userAnswers[
          this.questionManager.currentQuestionIndex
        ] !== undefined;

      console.log(
        `Última pregunta: ${isLastQuestion}, Respondida: ${hasAnswered}`
      );

      if (isLastQuestion && hasAnswered) {
        // Ir a resultados
        console.log("🏁 Completando test...");
        this.onTestComplete();
      } else if (hasAnswered) {
        // Siguiente pregunta
        if (this.questionManager.nextQuestion()) {
          this.questionManager.displayQuestion();
          this.updateNavigationButtons();
          this.questionManager.updateQuestionGif("default");
        }
      } else {
        console.log("⚠️ Debes responder la pregunta actual antes de continuar");
      }
    });

    this.eventListenersSetup = true;
    console.log("✅ Event listeners de navegación configurados");
  }

  // Callback cuando el test se completa
  onTestComplete() {
    // Este método será sobrescrito por la clase principal
    console.log("Test completado");
  }

  // Resetear navegación
  reset() {
    const grid = document.getElementById("question-status-grid");
    if (grid) {
      grid.innerHTML = "";
    }
    // Resetear el flag para permitir reconfigurar event listeners en un nuevo test
    this.eventListenersSetup = false;
  }
}

// Exportar para uso en otros módulos
window.NavigationManager = NavigationManager;
