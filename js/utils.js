// Utilidades y funciones auxiliares
class Utils {
  // Función para aleatorizar arrays
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Formatear tiempo en formato mm:ss
  static formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Función para mostrar/ocultar elementos con animación
  static showElement(elementId, display = "block") {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = display;
      element.classList.add("animate__animated", "animate__fadeInUp");
      element.addEventListener(
        "animationend",
        () => {
          element.classList.remove("animate__animated", "animate__fadeInUp");
        },
        { once: true }
      );
    }
  }

  static hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("animate__animated", "animate__fadeOutDown");
      element.addEventListener(
        "animationend",
        () => {
          element.style.display = "none";
          element.classList.remove("animate__animated", "animate__fadeOutDown");
        },
        { once: true }
      );
    }
  }

  // Debounce function para evitar múltiples clicks
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Función para crear elementos DOM de forma rápida
  static createElement(tag, className = "", textContent = "", attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }
}

// Exportar para uso en otros módulos
window.Utils = Utils;
