document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const board = document.getElementById("board");
  const currentLetter = document.getElementById("current-letter");
  const currentNumber = document.getElementById("current-number");
  const announcement = document.getElementById("announcement");
  const history = document.getElementById("history");
  const startBtn = document.getElementById("start-btn");
  const speakBtn = document.getElementById("speak-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const currentBall = document.querySelector(".current-ball");
  const voiceIndicator = document.querySelector("#voice-indicator span");
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");

  // Configuración de BINGO
  const BINGO_CONFIG = {
    B: { min: 1, max: 15, color: "#e63946", spanish: "B" },
    I: { min: 16, max: 30, color: "#f1c453", spanish: "I" },
    N: { min: 31, max: 45, color: "#2a9d8f", spanish: "N" },
    G: { min: 46, max: 60, color: "#457b9d", spanish: "G" },
    O: { min: 61, max: 75, color: "#9d4edd", spanish: "O" },
  };

  // Estado del juego
  let gameInterval;
  let isPlaying = false;
  let calledNumbers = [];
  let availableNumbers = [];
  let currentCall = null;
  let speechRate = 1;
  let intervalSpeed = 5000; // 5 segundos por defecto

  // Comprobar si el navegador soporta síntesis de voz
  const speechSupported = "speechSynthesis" in window;

  if (speechSupported) {
    voiceIndicator.textContent = "Disponible";
    voiceIndicator.style.color = "#2a9d8f";
  } else {
    voiceIndicator.textContent = "No disponible";
    voiceIndicator.style.color = "#e63946";
    speakBtn.disabled = true;
  }

  // Inicializar el control de velocidad
  speedSlider.addEventListener("input", updateSpeed);

  function updateSpeed() {
    const value = speedSlider.value;
    intervalSpeed = value * 1000; // Convertir a milisegundos

    // Actualizar el valor mostrado
    speedValue.textContent = `${value} segundo${value !== "1" ? "s" : ""}`;

    // Ajustar la velocidad de la voz
    if (value <= 3) {
      speechRate = 0.8; // Más lento
    } else if (value >= 8) {
      speechRate = 1.2; // Más rápido
    } else {
      speechRate = 1; // Normal
    }

    // Si el juego está en marcha, reiniciar el intervalo con la nueva velocidad
    if (isPlaying) {
      clearInterval(gameInterval);
      gameInterval = setInterval(callNumber, intervalSpeed);
    }
  }

  // Inicializar el juego
  function initGame() {
    // Crear todos los números posibles de BINGO
    availableNumbers = [];
    for (const letter in BINGO_CONFIG) {
      const { min, max } = BINGO_CONFIG[letter];
      for (let num = min; num <= max; num++) {
        availableNumbers.push({ letter, number: num });
      }
    }

    // Crear el tablero de BINGO
    createBingoBoard();
  }

  // Crear el tablero de BINGO con todos los números
  function createBingoBoard() {
    board.innerHTML = "";

    // Crear el tablero por columnas (B, I, N, G, O)
    const columns = ["B", "I", "N", "G", "O"];

    // Para cada fila (1-15)
    for (let row = 1; row <= 15; row++) {
      // Para cada columna (B, I, N, G, O)
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const letter = columns[colIndex];
        const num = row + colIndex * 15; // Calcular el número correcto para cada columna

        const cell = document.createElement("div");
        cell.className = "number-cell";
        cell.id = `${letter}${num}`;
        cell.textContent = num;
        cell.dataset.letter = letter;
        cell.dataset.number = num;

        board.appendChild(cell);
      }
    }
  }

  // Llamar a un número aleatorio de BINGO
  function callNumber() {
    if (availableNumbers.length === 0) {
      endGame();
      announcement.textContent =
        "¡Juego terminado! Todos los números han sido llamados.";
      return;
    }

    // Obtener un número aleatorio de los disponibles
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const { letter, number } = availableNumbers[randomIndex];

    // Guardar la llamada actual
    currentCall = { letter, number };

    // Eliminar el número llamado de los disponibles
    availableNumbers.splice(randomIndex, 1);

    // Agregar a los números llamados
    calledNumbers.unshift({ letter, number });

    // Actualizar la visualización
    updateDisplay(letter, number);

    // Marcar el número en el tablero
    markNumber(letter, number);

    // Actualizar el historial
    updateHistory();

    // Anunciar el número
    announceNumber(letter, number);
  }

  // Actualizar la visualización del número actual
  function updateDisplay(letter, number) {
    // Actualizar el color de la bola según la letra
    currentBall.style.backgroundColor = BINGO_CONFIG[letter].color;

    // Establecer el color del texto (para mejor contraste)
    const textColor = letter === "I" ? "#000" : "#fff";
    currentLetter.style.color = textColor;
    currentNumber.style.color = textColor;

    // Actualizar la letra y el número
    currentLetter.textContent = letter;
    currentNumber.textContent = number;

    // Agregar animación
    currentBall.classList.add("animate-glow");
    setTimeout(() => {
      currentBall.classList.remove("animate-glow");
    }, 2000);
  }

  // Marcar un número en el tablero de BINGO
  function markNumber(letter, number) {
    // Encontrar el elemento del número
    const numberElement = document.getElementById(`${letter}${number}`);

    if (numberElement) {
      // Eliminar cualquier clase "recent" anterior
      document
        .querySelectorAll(
          ".number-cell.recent-1, .number-cell.recent-2, .number-cell.recent-3, .number-cell.recent-4, .number-cell.recent-5"
        )
        .forEach((el) => {
          if (el.classList.contains("recent-1")) {
            el.classList.remove("recent-1");
            el.classList.add("recent-2");
          } else if (el.classList.contains("recent-2")) {
            el.classList.remove("recent-2");
            el.classList.add("recent-3");
          } else if (el.classList.contains("recent-3")) {
            el.classList.remove("recent-3");
            el.classList.add("recent-4");
          } else if (el.classList.contains("recent-4")) {
            el.classList.remove("recent-4");
            el.classList.add("recent-5");
          } else if (el.classList.contains("recent-5")) {
            el.classList.remove("recent-5");
          }
        });

      // Marcar como llamado y reciente
      numberElement.classList.add("called", "recent-1", "animate-pop");

      // Eliminar la clase de animación después de que se complete
      setTimeout(() => {
        numberElement.classList.remove("animate-pop");
      }, 500);
    }
  }

  // Actualizar el historial
  function updateHistory() {
    history.innerHTML = "";

    // Mostrar los últimos 10 números llamados (o menos si se han llamado menos)
    const historyToShow = calledNumbers.slice(0, 10);

    historyToShow.forEach((call, index) => {
      const historyBall = document.createElement("div");
      historyBall.className = `history-ball ${call.letter.toLowerCase()}`;
      if (index < 5) {
        historyBall.classList.add("recent");
      }
      historyBall.textContent = `${call.letter}${call.number}`;
      history.appendChild(historyBall);
    });
  }

  // Anunciar el número en español
  function announceNumber(letter, number) {
    // Obtener el nombre de la letra en español
    const letterName = BINGO_CONFIG[letter].spanish;

    // Texto para mostrar en pantalla
    const announcementText = `${letterName} ${number}`;
    announcement.textContent = announcementText;

    // Usar síntesis de voz
    speakNumber(letterName, number);
  }

  // Función para hablar el número usando síntesis de voz
  function speakNumber(letter, number) {
    if (!speechSupported) return;

    // Cancelar cualquier anuncio anterior
    window.speechSynthesis.cancel();

    // Actualizar indicador de voz
    voiceIndicator.textContent = "Hablando...";
    voiceIndicator.style.color = "#f1c453";

    // Crear el texto a hablar
    const textToSpeak = `${letter}, ${number}`;

    // Crear y configurar el objeto de síntesis de voz
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "es-ES";
    utterance.rate = speechRate;
    utterance.volume = 1;

    // Evento cuando termina de hablar
    utterance.onend = () => {
      voiceIndicator.textContent = "Listo";
      voiceIndicator.style.color = "#2a9d8f";
    };

    // Evento en caso de error
    utterance.onerror = () => {
      voiceIndicator.textContent = "Error";
      voiceIndicator.style.color = "#e63946";
    };

    // Hablar
    window.speechSynthesis.speak(utterance);
  }

  // Repetir el último número llamado
  function repeatLastNumber() {
    if (currentCall) {
      const { letter, number } = currentCall;
      speakNumber(BINGO_CONFIG[letter].spanish, number);
    }
  }

  // Iniciar el juego
  function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    // Llamar al primer número inmediatamente
    callNumber();

    // Establecer intervalo para llamar números
    gameInterval = setInterval(callNumber, intervalSpeed);
  }

  // Pausar el juego
  function pauseGame() {
    if (!isPlaying) return;

    isPlaying = false;
    clearInterval(gameInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = "Continuar";
  }

  // Finalizar el juego
  function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    startBtn.disabled = true;
    pauseBtn.disabled = true;
  }

  // Reiniciar el juego
  function resetGame() {
    // Limpiar el intervalo
    clearInterval(gameInterval);

    // Reiniciar el estado del juego
    isPlaying = false;
    calledNumbers = [];
    currentCall = null;

    // Reiniciar la interfaz
    currentLetter.textContent = "-";
    currentNumber.textContent = "-";
    announcement.textContent = "Esperando inicio...";
    history.innerHTML = "";

    // Reiniciar los botones
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = "Iniciar";

    // Reiniciar la bola actual
    currentBall.style.backgroundColor = "linear-gradient(145deg, #333, #222)";

    // Reiniciar el indicador de voz
    voiceIndicator.textContent = speechSupported
      ? "Disponible"
      : "No disponible";
    voiceIndicator.style.color = speechSupported ? "#2a9d8f" : "#e63946";

    // Reinicializar el juego
    initGame();
  }

  // Event listeners
  startBtn.addEventListener("click", startGame);
  speakBtn.addEventListener("click", repeatLastNumber);
  pauseBtn.addEventListener("click", pauseGame);
  resetBtn.addEventListener("click", resetGame);

  // Inicializar el juego al cargar
  initGame();
});
