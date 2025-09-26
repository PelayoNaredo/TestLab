// Manejador de animaciones y transiciones entre pantallas
class ScreenManager {
  constructor() {
    this.currentScreen = null;
    this.isTransitioning = false;
  }

  // Mostrar una pantalla con animación
  showScreen(screenId, direction = "forward") {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) {
      console.error(`Screen ${screenId} not found`);
      this.isTransitioning = false;
      return;
    }

    // Si es la primera pantalla
    if (!this.currentScreen) {
      this.currentScreen = targetScreen;
      targetScreen.classList.add("active");
      this.isTransitioning = false;
      return;
    }

    // Si ya estamos en la pantalla objetivo
    if (this.currentScreen === targetScreen) {
      this.isTransitioning = false;
      return;
    }

    const currentScreen = this.currentScreen;

    // Determinar las clases de animación
    let exitAnimation, enterAnimation;

    if (direction === "forward") {
      exitAnimation = "animate__slideOutLeftFade";
      enterAnimation = "animate__slideInRightFade";
    } else {
      exitAnimation = "animate__slideOutRightFade";
      enterAnimation = "animate__slideInLeftFade";
    }

    // Preparar la pantalla de destino
    targetScreen.classList.add("active");
    targetScreen.style.visibility = "visible";
    targetScreen.classList.add("animate__animated", enterAnimation);

    // Animar la pantalla actual hacia fuera
    if (currentScreen) {
      currentScreen.classList.add("animate__animated", exitAnimation);

      currentScreen.addEventListener(
        "animationend",
        () => {
          currentScreen.classList.remove(
            "active",
            "animate__animated",
            exitAnimation
          );
          currentScreen.style.visibility = "hidden";
        },
        { once: true }
      );
    }

    // Completar la transición cuando la nueva pantalla termine de entrar
    targetScreen.addEventListener(
      "animationend",
      () => {
        targetScreen.classList.remove("animate__animated", enterAnimation);
        this.currentScreen = targetScreen;
        this.isTransitioning = false;
      },
      { once: true }
    );
  }

  // Función para crear partículas de fondo
  createParticles() {
    const particlesContainer = document.getElementById("particles-container");
    if (!particlesContainer) return;

    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Tamaño aleatorio
      const size = Math.random() * 8 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Posición horizontal aleatoria
      particle.style.left = `${Math.random() * 100}%`;

      // Duración de animación aleatoria
      const duration = Math.random() * 10 + 8;
      particle.style.animationDuration = `${duration}s`;

      particlesContainer.appendChild(particle);

      // Eliminar partícula después de la animación
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, duration * 1000);
    };

    // Crear partículas iniciales
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createParticle(), i * 200);
    }

    // Continuar creando partículas cada 2 segundos
    setInterval(createParticle, 2000);
  }

  // Función para animar elementos con entrada escalonada
  animateStaggeredElements(selector, delay = 100) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      element.style.animationDelay = `${index * delay}ms`;
      element.classList.add("animate__animated", "animate__fadeInUp");
    });
  }

  // Función para resetear animaciones
  resetAnimations(element) {
    if (element) {
      element.classList.remove(
        "animate__animated",
        "animate__fadeInUp",
        "animate__fadeOutDown",
        "animate__slideInLeft",
        "animate__slideInRight",
        "animate__slideOutLeft",
        "animate__slideOutRight",
        "animate__bounceIn",
        "animate__zoomIn"
      );
    }
  }
}

// Exportar para uso en otros módulos
window.ScreenManager = ScreenManager;
