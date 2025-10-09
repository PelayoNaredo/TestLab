// Clase principal que coordina todos los módulos
class TestLab {
  constructor() {
    // Inicializar manejadores
    this.screenManager = new ScreenManager();
    this.timerManager = new TimerManager();
    this.questionManager = new QuestionManager();
    this.navigationManager = new NavigationManager(this.questionManager);

    // Propiedades del estado de la aplicación
    this.subjects = [];
    this.currentSubject = null;
    this.currentTestType = null;

    // Configurar callback para cuando se complete el test
    this.navigationManager.onTestComplete = () => this.finishTest();

    this.init();
  }

  async init() {
    console.log("🎀 TestLab Kawaii iniciando...");
    console.log(
      "💡 Modo desarrollo: Si no ves tus archivos JSON, usa Live Server o similar"
    );

    await this.loadSubjects();
    this.setupEventListeners();
    this.screenManager.createParticles();
    this.screenManager.showScreen("subject-screen", "forward");
  }

  async loadSubjects() {
    try {
      console.log("Intentando cargar subjects...");
      const subjectFiles = [
        "BMC_U2.json",
        "BMC_U2_examen.json",
        "FG_UD1.json",
        "FG_UD1_examen.json",
        "GMB_U1.json",
        "GMB_U1_examen.json",
      ];

      let loadedCount = 0;

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
            loadedCount++;
          }
        } catch (error) {
          console.error(`Error cargando ${file}:`, error);
          // Si es un error de CORS (protocolo file://), detectamos que estamos en local
          if (
            error.message.includes("fetch") ||
            error.message.includes("CORS")
          ) {
            console.log("🔧 Modo local detectado - usando datos mock");
          }
        }
      }

      console.log("Subjects cargados:", this.subjects);

      // Si no se cargó ningún archivo, usar datos mock
      if (loadedCount === 0) {
        console.log(
          "⚠️ No se pudieron cargar archivos JSON - Cargando datos mock para desarrollo"
        );
        this.loadMockData();
      } else {
        this.displaySubjects();
        this.hideLoadingScreen();
      }
    } catch (error) {
      console.error("Error general cargando subjects:", error);
      this.loadMockData();
    }
  }

  loadMockData() {
    console.log("📝 Cargando datos mock completos...");
    this.subjects = [
      {
        id: "matematicas-basicas",
        name: "Matemáticas Básicas",
        icon: "🔢",
        description: "Aritmética fundamental y álgebra básica",
        questions: [
          {
            question: "¿Cuánto es 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
            explanation:
              "La suma de 2 + 2 es igual a 4. Es una operación aritmética básica.",
          },
          {
            question: "¿Cuál es el resultado de 5 × 3?",
            options: ["12", "15", "18", "20"],
            correctAnswer: 1,
            explanation:
              "5 multiplicado por 3 es igual a 15. La multiplicación es una suma repetida: 5 + 5 + 5 = 15.",
          },
          {
            question: "¿Cuánto es 20 ÷ 4?",
            options: ["4", "5", "6", "8"],
            correctAnswer: 1,
            explanation:
              "20 dividido entre 4 es igual a 5. La división es la operación inversa de la multiplicación.",
          },
          {
            question: "¿Cuál es el valor de x en la ecuación: x + 7 = 12?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 2,
            explanation:
              "Para resolver x + 7 = 12, restamos 7 de ambos lados: x = 12 - 7 = 5.",
          },
          {
            question: "¿Cuánto es 3²?",
            options: ["6", "8", "9", "12"],
            correctAnswer: 2,
            explanation:
              "3² significa 3 elevado al cuadrado, que es 3 × 3 = 9.",
          },
        ],
      },
      {
        id: "ciencias-naturales",
        name: "Ciencias Naturales",
        icon: "🧪",
        description: "Biología, química y física básica",
        questions: [
          {
            question:
              "¿Cuál es el componente más abundante del aire que respiramos?",
            options: [
              "Oxígeno",
              "Nitrógeno",
              "Dióxido de carbono",
              "Hidrógeno",
            ],
            correctAnswer: 1,
            explanation:
              "El nitrógeno constituye aproximadamente el 78% del aire atmosférico, mientras que el oxígeno representa solo el 21%.",
          },
          {
            question:
              "¿Cuántos huesos tiene el cuerpo humano adulto aproximadamente?",
            options: ["150", "186", "206", "246"],
            correctAnswer: 2,
            explanation:
              "El cuerpo humano adulto tiene aproximadamente 206 huesos, aunque este número puede variar ligeramente entre individuos.",
          },
          {
            question: "¿Cuál es la fórmula química del agua?",
            options: ["H₂O", "CO₂", "NaCl", "CH₄"],
            correctAnswer: 0,
            explanation:
              "La fórmula química del agua es H₂O, indicando que cada molécula contiene 2 átomos de hidrógeno y 1 de oxígeno.",
          },
          {
            question: "¿Qué planeta es conocido como el 'planeta rojo'?",
            options: ["Venus", "Marte", "Júpiter", "Saturno"],
            correctAnswer: 1,
            explanation:
              "Marte es conocido como el planeta rojo debido al óxido de hierro (herrumbre) presente en su superficie.",
          },
          {
            question: "¿Cuál es la velocidad de la luz en el vacío?",
            options: [
              "299,792,458 m/s",
              "300,000,000 m/s",
              "150,000,000 m/s",
              "500,000,000 m/s",
            ],
            correctAnswer: 0,
            explanation:
              "La velocidad de la luz en el vacío es exactamente 299,792,458 metros por segundo, una constante fundamental de la física.",
          },
        ],
      },
      {
        id: "historia-mundial",
        name: "Historia Mundial",
        icon: "🏛️",
        description: "Eventos históricos importantes y cronología",
        questions: [
          {
            question: "¿En qué año comenzó la Segunda Guerra Mundial?",
            options: ["1937", "1938", "1939", "1940"],
            correctAnswer: 2,
            explanation:
              "La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana de Polonia.",
          },
          {
            question: "¿Quién fue el primer presidente de Estados Unidos?",
            options: [
              "Thomas Jefferson",
              "George Washington",
              "John Adams",
              "Benjamin Franklin",
            ],
            correctAnswer: 1,
            explanation:
              "George Washington fue el primer presidente de Estados Unidos, sirviendo desde 1789 hasta 1797.",
          },
          {
            question: "¿En qué año cayó el Muro de Berlín?",
            options: ["1987", "1988", "1989", "1990"],
            correctAnswer: 2,
            explanation:
              "El Muro de Berlín cayó el 9 de noviembre de 1989, marcando el fin simbólico de la Guerra Fría.",
          },
          {
            question:
              "¿Cuál fue la primera civilización en desarrollar la escritura?",
            options: ["Egipcios", "Sumerios", "Chinos", "Griegos"],
            correctAnswer: 1,
            explanation:
              "Los sumerios desarrollaron el primer sistema de escritura conocido (cuneiforme) alrededor del 3200 a.C. en Mesopotamia.",
          },
          {
            question: "¿En qué siglo vivió Leonardo da Vinci?",
            options: ["Siglo XIV", "Siglo XV", "Siglo XV-XVI", "Siglo XVI"],
            correctAnswer: 2,
            explanation:
              "Leonardo da Vinci vivió entre 1452 y 1519, abarcando principalmente los siglos XV y XVI durante el Renacimiento.",
          },
        ],
      },
      {
        id: "geografia-mundial",
        name: "Geografía Mundial",
        icon: "🌍",
        description: "Países, capitales, continentes y geografía física",
        questions: [
          {
            question: "¿Cuál es la capital de Australia?",
            options: ["Sídney", "Melbourne", "Canberra", "Perth"],
            correctAnswer: 2,
            explanation:
              "Canberra es la capital de Australia, aunque Sídney y Melbourne son ciudades más grandes y conocidas.",
          },
          {
            question: "¿Cuál es el río más largo del mundo?",
            options: ["Amazonas", "Nilo", "Yangtsé", "Misisipi"],
            correctAnswer: 1,
            explanation:
              "El río Nilo, con aproximadamente 6,650 km de longitud, es considerado el río más largo del mundo.",
          },
          {
            question: "¿En qué continente se encuentra el desierto del Sahara?",
            options: ["Asia", "Australia", "África", "América del Sur"],
            correctAnswer: 2,
            explanation:
              "El desierto del Sahara se encuentra en el norte de África y es el desierto cálido más grande del mundo.",
          },
          {
            question: "¿Cuál es la montaña más alta del mundo?",
            options: ["K2", "Monte Everest", "Kangchenjunga", "Lhotse"],
            correctAnswer: 1,
            explanation:
              "El Monte Everest, con 8,848.86 metros de altura, es la montaña más alta del mundo, ubicada en el Himalaya.",
          },
          {
            question: "¿Cuántos continentes hay en la Tierra?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
            explanation:
              "Tradicionalmente se consideran 7 continentes: Asia, África, América del Norte, América del Sur, Antártida, Europa y Oceanía.",
          },
        ],
      },
    ];

    console.log(
      `✅ ${this.subjects.length} materias mock cargadas correctamente`
    );
    this.displaySubjects();

    // Ocultar loading screen y mostrar pantalla principal
    this.hideLoadingScreen();
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.classList.remove("active");
      console.log("🎀 Loading screen ocultado");
    }
  }

  displaySubjects() {
    const subjectsGrid = document.getElementById("subjects-grid");
    subjectsGrid.innerHTML = "";

    this.subjects.forEach((subject) => {
      console.log(
        `📝 Mostrando subject: ${subject.name}, icon: ${subject.icon}`
      );
      const subjectCard = Utils.createElement("div", "subject-card");

      subjectCard.innerHTML = `
        <div class="subject-icon">${subject.icon}</div>
        <h3>${subject.name}</h3>
        <p>${subject.description}</p>
      `;

      subjectCard.addEventListener("click", () => {
        this.selectSubject(subject);
      });

      subjectsGrid.appendChild(subjectCard);
    });

    // Animar entrada de las tarjetas
    this.screenManager.animateStaggeredElements(".subject-card", 150);
  }

  selectSubject(subject) {
    this.currentSubject = subject;
    document.getElementById("selected-subject-title").textContent =
      subject.name;
    this.screenManager.showScreen("test-type-screen", "forward");
  }

  selectTestType(type) {
    this.currentTestType = type;
    this.showTestConfigScreen();
  }

  showTestConfigScreen() {
    // Actualizar información de la pantalla de configuración
    const configTitle = document.getElementById("config-test-title");
    const configSubtitle = document.getElementById("config-test-subtitle");

    // Datos para cada tipo de test
    const testTypeData = {
      sequential: {
        title: "Configurar Test Secuencial",
        subtitle: "Selecciona el rango de preguntas a estudiar",
      },
      random: {
        title: "Configurar Test Aleatorio",
        subtitle: "Selecciona cuántas preguntas quieres practicar",
      },
      errors: {
        title: "Configurar Test de Errores",
        subtitle: "Repasa las preguntas que has fallado",
      },
      timed: {
        title: "Configurar Test Cronometrado",
        subtitle: "Ajusta la cantidad y tiempo por pregunta",
      },
    };

    const data = testTypeData[this.currentTestType];
    configTitle.textContent = data.title;
    configSubtitle.textContent = data.subtitle;

    // Mostrar/ocultar secciones de configuración
    this.showConfigSection(this.currentTestType);

    // Inicializar valores
    this.initializeConfigValues();

    // Mostrar la pantalla de configuración
    this.screenManager.showScreen("test-config-screen", "forward");
  }

  showConfigSection(type) {
    // Ocultar todas las secciones
    const sections = [
      "sequential-config",
      "random-config",
      "errors-config",
      "timed-config",
    ];
    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      section.style.display = "none";
      section.classList.add("hidden");
    });

    // Mostrar la sección apropiada
    const targetSection = document.getElementById(`${type}-config`);
    if (targetSection) {
      targetSection.style.display = "block";
      targetSection.classList.remove("hidden");
    }
  }

  initializeConfigValues() {
    const totalQuestions = this.currentSubject.questions.length;

    if (this.currentTestType === "sequential") {
      const rangeStart = document.getElementById("range-start");
      const rangeEnd = document.getElementById("range-end");
      const maxQuestions = document.getElementById("max-questions");
      const selectedCount = document.getElementById("selected-count");

      rangeStart.max = totalQuestions;
      rangeEnd.max = totalQuestions;
      rangeEnd.value = Math.min(10, totalQuestions);
      maxQuestions.textContent = totalQuestions;
      selectedCount.textContent = rangeEnd.value - rangeStart.value + 1;

      // Event listeners para actualizar el contador
      const updateCount = () => {
        const start = parseInt(rangeStart.value);
        const end = parseInt(rangeEnd.value);
        if (start <= end) {
          selectedCount.textContent = end - start + 1;
        }
      };
      rangeStart.addEventListener("input", updateCount);
      rangeEnd.addEventListener("input", updateCount);
    }

    if (this.currentTestType === "random") {
      const maxQuestionsRandom = document.getElementById(
        "random-max-questions"
      );
      const randomSelectedCount = document.getElementById(
        "random-selected-count"
      );
      maxQuestionsRandom.textContent = totalQuestions;

      // Ajustar botones de cantidad según las preguntas disponibles
      const quantityButtons = document.querySelectorAll(".quantity-btn");
      quantityButtons.forEach((btn) => {
        const quantity = btn.dataset.quantity;
        if (quantity !== "all" && parseInt(quantity) > totalQuestions) {
          btn.disabled = true;
          btn.style.opacity = "0.5";
        }
      });
    }

    if (this.currentTestType === "errors") {
      // Por ahora, mostrar todas las preguntas como "errores" para demo
      const errorCount = document.getElementById("error-questions-count");
      errorCount.textContent = totalQuestions;
    }

    if (this.currentTestType === "timed") {
      const timedQuestions = document.getElementById("timed-questions");
      const timePerQuestion = document.getElementById("time-per-question");
      const totalTime = document.getElementById("total-time");

      // Añadir opciones según preguntas disponibles
      timedQuestions.innerHTML = "";
      [5, 10, 15, 20].forEach((num) => {
        if (num <= totalQuestions) {
          const option = document.createElement("option");
          option.value = num;
          option.textContent = `${num} preguntas`;
          if (num === 10) option.selected = true;
          timedQuestions.appendChild(option);
        }
      });

      // Actualizar tiempo total
      const updateTotalTime = () => {
        const questions = parseInt(timedQuestions.value);
        const timePerQ = parseInt(timePerQuestion.value);
        const totalSeconds = questions * timePerQ;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        totalTime.textContent = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;
      };

      timedQuestions.addEventListener("change", updateTotalTime);
      timePerQuestion.addEventListener("change", updateTotalTime);
      updateTotalTime();
    }
  }

  startConfiguredTest() {
    // Preparar test según la configuración
    let questions = [...this.currentSubject.questions];
    let questionsToUse = [];

    switch (this.currentTestType) {
      case "sequential":
        const start =
          parseInt(document.getElementById("range-start").value) - 1;
        const end = parseInt(document.getElementById("range-end").value);
        questionsToUse = questions.slice(start, end);
        break;

      case "random":
        const selectedQuantityBtn = document.querySelector(
          ".quantity-btn.active"
        );
        const customQuantity = document.getElementById("custom-quantity").value;

        let quantity;
        if (customQuantity && parseInt(customQuantity) > 0) {
          quantity = Math.min(parseInt(customQuantity), questions.length);
        } else if (selectedQuantityBtn) {
          const btnQuantity = selectedQuantityBtn.dataset.quantity;
          quantity =
            btnQuantity === "all"
              ? questions.length
              : Math.min(parseInt(btnQuantity), questions.length);
        } else {
          quantity = Math.min(15, questions.length); // Default
        }

        questions = Utils.shuffleArray(questions);
        questionsToUse = questions.slice(0, quantity);
        break;

      case "errors":
        // Para demo, usar todas las preguntas aleatorizadas
        questionsToUse = Utils.shuffleArray(questions);
        break;

      case "timed":
        const timedQuantity = parseInt(
          document.getElementById("timed-questions").value
        );
        const timePerQ = parseInt(
          document.getElementById("time-per-question").value
        );

        questions = Utils.shuffleArray(questions);
        questionsToUse = questions.slice(0, timedQuantity);

        // Configurar timer para modo cronometrado
        this.timerManager.setTimedMode(timePerQ);
        break;
    }

    // Actualizar las preguntas en el manager
    this.questionManager.setQuestions(questionsToUse);

    // Iniciar el test
    this.startTest();
    this.screenManager.showScreen("test-screen", "forward");
  }

  prepareTest() {
    let questions = [...this.currentSubject.questions];

    switch (this.currentTestType) {
      case "sequential":
        // Mantener orden original
        break;
      case "random":
        questions = Utils.shuffleArray(questions);
        break;
      case "errors":
        // Para demo, usamos todas las preguntas aleatorizadas
        questions = Utils.shuffleArray(questions);
        break;
      case "timed":
        questions = Utils.shuffleArray(questions);
        break;
    }

    // Inicializar estado de preguntas
    this.questionManager.initializeQuestionState(questions);
  }

  startTest() {
    // Configurar temporizador
    this.timerManager.showTimer();
    this.timerManager.startContinuousTimer();

    // Configurar callback para actualizar navegación cuando se responde
    this.questionManager.onAnswerSelected = () => {
      this.navigationManager.updateNavigationButtons();
    };

    // Crear grid de navegación y configurar event listeners
    this.navigationManager.createQuestionStatusGrid();
    this.navigationManager.setupNavigationEventListeners();

    // Mostrar primera pregunta
    this.questionManager.displayQuestion();
    this.navigationManager.updateNavigationButtons();
  }

  finishTest() {
    // Detener temporizador
    this.timerManager.pauseTimer();

    // Calcular y mostrar resultados
    const stats = this.questionManager.getTestStats();
    const timeElapsed = this.timerManager.getCurrentTime();

    this.displayResults(stats, timeElapsed);
    this.screenManager.showScreen("results-screen", "forward");
  }

  displayResults(stats, timeElapsed) {
    // Actualizar estadísticas
    document.getElementById(
      "score-percentage"
    ).textContent = `${stats.percentage}%`;
    document.getElementById(
      "correct-answers"
    ).textContent = `${stats.correctAnswers}/${stats.totalQuestions}`;
    document.getElementById("time-taken").textContent =
      Utils.formatTime(timeElapsed);

    // Actualizar título según rendimiento
    const resultsTitle = document.getElementById("results-title");
    if (stats.percentage >= 80) {
      resultsTitle.textContent = "¡Excelente trabajo!";
    } else if (stats.percentage >= 60) {
      resultsTitle.textContent = "¡Bien hecho!";
    } else if (stats.percentage >= 50) {
      resultsTitle.textContent = "¡Buen intento!";
    } else {
      resultsTitle.textContent = "¡Sigue practicando!";
    }
  }

  restartTest() {
    this.timerManager.reset();
    this.questionManager.reset();
    this.navigationManager.reset();

    // Volver a la pantalla de configuración para permitir reconfigurar
    this.showTestConfigScreen();
  }

  setupEventListeners() {
    // Navegación de regreso
    document
      .getElementById("back-to-subjects")
      .addEventListener("click", () => {
        this.screenManager.showScreen("subject-screen", "backward");
      });

    document
      .getElementById("back-to-test-types")
      .addEventListener("click", () => {
        this.timerManager.reset();
        this.screenManager.showScreen("test-type-screen", "backward");
      });

    // Navegación desde configuración
    document
      .getElementById("back-to-test-types-config")
      .addEventListener("click", () => {
        this.screenManager.showScreen("test-type-screen", "backward");
      });

    // Selección de tipos de test
    document.querySelectorAll(".test-type-card").forEach((card) => {
      card.addEventListener("click", () => {
        const testType = card.dataset.type;
        this.selectTestType(testType);
      });
    });

    // Botón para iniciar test configurado
    document
      .getElementById("start-configured-test")
      .addEventListener("click", () => {
        this.startConfiguredTest();
      });

    // Event listeners para configuración de test aleatorio
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remover active de todos los botones
        document
          .querySelectorAll(".quantity-btn")
          .forEach((b) => b.classList.remove("active"));
        // Añadir active al botón clickeado
        btn.classList.add("active");

        // Actualizar contador
        const quantity = btn.dataset.quantity;
        const totalQuestions = this.currentSubject?.questions?.length || 0;
        const actualQuantity =
          quantity === "all"
            ? totalQuestions
            : Math.min(parseInt(quantity), totalQuestions);
        const counterElement = document.getElementById("random-selected-count");
        if (counterElement) {
          counterElement.textContent = actualQuantity;
        }

        // Limpiar input personalizado
        const customInput = document.getElementById("custom-quantity");
        if (customInput) customInput.value = "";
      });
    });

    // Event listener para cantidad personalizada
    const customQuantityInput = document.getElementById("custom-quantity");
    if (customQuantityInput) {
      customQuantityInput.addEventListener("input", () => {
        // Remover active de todos los botones
        document
          .querySelectorAll(".quantity-btn")
          .forEach((b) => b.classList.remove("active"));

        // Actualizar contador
        const value = parseInt(customQuantityInput.value) || 0;
        const totalQuestions = this.currentSubject?.questions?.length || 0;
        const actualQuantity = Math.min(value, totalQuestions);
        const counterElement = document.getElementById("random-selected-count");
        if (counterElement && value > 0) {
          counterElement.textContent = actualQuantity;
        }
      });
    }

    // Mostrar explicación
    document
      .getElementById("show-explanation")
      .addEventListener("click", () => {
        const question = this.questionManager.getCurrentQuestion();
        document.getElementById("explanation-text").textContent =
          question.explanation || "No hay explicación disponible.";
        Utils.showElement("question-explanation");
      });

    // Botones de resultados
    document.getElementById("restart-test").addEventListener("click", () => {
      this.restartTest();
    });

    document
      .getElementById("back-to-subjects-final")
      .addEventListener("click", () => {
        this.timerManager.reset();
        this.questionManager.reset();
        this.navigationManager.reset();
        this.screenManager.showScreen("subject-screen", "backward");
      });
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.testLabApp = new TestLab();
});
