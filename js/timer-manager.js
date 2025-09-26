// Manejador del temporizador continuo
class TimerManager {
  constructor() {
    this.startTime = null;
    this.timer = null;
    this.isRunning = false;
    this.totalElapsedTime = 0;
  }

  // Iniciar el temporizador continuo
  startContinuousTimer() {
    if (this.isRunning) return;

    this.startTime = Date.now();
    this.isRunning = true;

    const timerDisplay = document.getElementById("timer-display");

    this.timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.startTime + this.totalElapsedTime;

      if (timerDisplay) {
        timerDisplay.textContent = Utils.formatTime(elapsed);
      }
    }, 1000);
  }

  // Pausar el temporizador
  pauseTimer() {
    if (!this.isRunning) return;

    this.totalElapsedTime += Date.now() - this.startTime;
    this.isRunning = false;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Reanudar el temporizador
  resumeTimer() {
    if (this.isRunning) return;

    this.startContinuousTimer();
  }

  // Detener completamente el temporizador
  stopTimer() {
    this.pauseTimer();
    this.totalElapsedTime = 0;
    this.startTime = null;
  }

  // Obtener el tiempo transcurrido actual
  getCurrentTime() {
    if (!this.startTime) return 0;

    const currentElapsed = this.isRunning ? Date.now() - this.startTime : 0;
    return this.totalElapsedTime + currentElapsed;
  }

  // Formatear el tiempo actual
  getFormattedCurrentTime() {
    return Utils.formatTime(this.getCurrentTime());
  }

  // Mostrar/ocultar el temporizador
  showTimer() {
    const timerElement = document.getElementById("test-timer");
    if (timerElement) {
      timerElement.style.display = "flex";
    }
  }

  hideTimer() {
    const timerElement = document.getElementById("test-timer");
    if (timerElement) {
      timerElement.style.display = "none";
    }
  }

  // Resetear el temporizador
  reset() {
    this.stopTimer();
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
      timerDisplay.textContent = "00:00";
    }
  }

  // Configurar modo cronometrado (para futuras implementaciones)
  setTimedMode(timePerQuestion) {
    this.timePerQuestion = timePerQuestion;
    this.isTimedMode = true;
    // Por ahora solo almacenamos la configuración
    // En una implementación futura se podría añadir cuenta regresiva por pregunta
    console.log(`Modo cronometrado activado: ${timePerQuestion}s por pregunta`);
  }
}

// Exportar para uso en otros módulos
window.TimerManager = TimerManager;
