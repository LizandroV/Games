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

  // Nuevo: Controles de voz
  const voiceSelector = document.createElement("select");
  voiceSelector.id = "voice-selector";
  voiceSelector.className = "voice-selector";

  const voicePitchSlider = document.createElement("input");
  voicePitchSlider.type = "range";
  voicePitchSlider.id = "voice-pitch";
  voicePitchSlider.min = "0.5";
  voicePitchSlider.max = "2";
  voicePitchSlider.step = "0.1";
  voicePitchSlider.value = "1";

  const voicePitchValue = document.createElement("span");
  voicePitchValue.id = "voice-pitch-value";
  voicePitchValue.textContent = "1.0";

  // Crear contenedor para controles de voz
  const voiceControlsContainer = document.createElement("div");
  voiceControlsContainer.className = "voice-controls";
  voiceControlsContainer.innerHTML = `
      <h3>Configuración de Voz</h3>
      <div class="control-group">
        <label for="voice-selector">Voz:</label>
        <div id="voice-selector-container"></div>
      </div>
      <div class="control-group">
        <label for="voice-pitch">Tono: <span id="voice-pitch-value">1.0</span></label>
        <input type="range" id="voice-pitch" min="0.5" max="2" step="0.1" value="1">
      </div>
    `;

  // Insertar después del indicador de voz
  const voiceIndicatorContainer =
    document.querySelector("#voice-indicator").parentNode;
  voiceIndicatorContainer.parentNode.insertBefore(
    voiceControlsContainer,
    voiceIndicatorContainer.nextSibling
  );

  // Configuración de BINGO
  const BINGO_CONFIG = {
    B: { min: 1, max: 15, color: "#e63946", spanish: "B" },
    I: { min: 16, max: 30, color: "#f1c453", spanish: "I" },
    N: { min: 31, max: 45, color: "#2a9d8f", spanish: "N" },
    G: { min: 46, max: 60, color: "#457b9d", spanish: "G" },
    O: { min: 61, max: 75, color: "#9d4edd", spanish: "O" },
  };

  // Mejorado: Pronunciación en español
  const SPANISH_PRONUNCIATION = {
    B: "Beh",
    I: "I",
    N: "Eh-neh",
    G: "Heh",
    O: "Oh",
  };

  // Estado del juego
  let gameInterval;
  let isPlaying = false;
  let calledNumbers = [];
  let availableNumbers = [];
  let currentCall = null;
  let speechRate = 1;
  let speechPitch = 1;
  let selectedVoice = null;
  let intervalSpeed = 5000; // 5 segundos por defecto
  let voices = [];

  // Comprobar si el navegador soporta síntesis de voz
  const speechSupported = "speechSynthesis" in window;

  if (speechSupported) {
    voiceIndicator.textContent = "Disponible";
    voiceIndicator.style.color = "#2a9d8f";

    // Cargar voces disponibles
    loadVoices();

    // Si las voces no están disponibles inmediatamente, esperar al evento voiceschanged
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  } else {
    voiceIndicator.textContent = "No disponible";
    voiceIndicator.style.color = "#e63946";
    speakBtn.disabled = true;
    voiceControlsContainer.style.display = "none";
  }

  // Cargar voces disponibles
  function loadVoices() {
    voices = speechSynthesis.getVoices();

    // Filtrar solo voces en español
    const spanishVoices = voices.filter(
      (voice) =>
        voice.lang.includes("es") ||
        voice.name.includes("Spanish") ||
        voice.name.includes("Español")
    );

    // Si no hay voces en español, usar todas las voces
    const voicesToUse = spanishVoices.length > 0 ? spanishVoices : voices;

    // Limpiar selector
    const voiceSelectorContainer = document.getElementById(
      "voice-selector-container"
    );
    voiceSelectorContainer.innerHTML = "";

    // Crear selector de voces
    const select = document.createElement("select");
    select.id = "voice-selector";

    voicesToUse.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      select.appendChild(option);

      // Seleccionar por defecto una voz en español
      if (voice.lang.startsWith("es") && !selectedVoice) {
        option.selected = true;
        selectedVoice = voice;
      }
    });

    // Si no se encontró una voz en español, usar la primera
    if (!selectedVoice && voicesToUse.length > 0) {
      selectedVoice = voicesToUse[0];
      select.options[0].selected = true;
    }

    // Evento de cambio de voz
    select.addEventListener("change", function () {
      selectedVoice = voicesToUse[this.value];

      // Probar la voz seleccionada
      const testUtterance = new SpeechSynthesisUtterance("Bingo");
      testUtterance.voice = selectedVoice;
      testUtterance.rate = speechRate;
      testUtterance.pitch = speechPitch;
      speechSynthesis.speak(testUtterance);
    });

    voiceSelectorContainer.appendChild(select);

    // Configurar control de tono
    const pitchSlider = document.getElementById("voice-pitch");
    const pitchValue = document.getElementById("voice-pitch-value");

    pitchSlider.addEventListener("input", function () {
      speechPitch = parseFloat(this.value);
      pitchValue.textContent = speechPitch.toFixed(1);

      // Probar el tono
      const testUtterance = new SpeechSynthesisUtterance("Bingo");
      testUtterance.voice = selectedVoice;
      testUtterance.rate = speechRate;
      testUtterance.pitch = speechPitch;
      speechSynthesis.speak(testUtterance);
    });
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

  // Mejorado: Anunciar el número en español con mejor pronunciación
  function announceNumber(letter, number) {
    // Obtener el nombre de la letra en español
    const letterName = BINGO_CONFIG[letter].spanish;

    // Texto para mostrar en pantalla
    const announcementText = `${letterName} ${number}`;
    announcement.textContent = announcementText;

    // Usar síntesis de voz mejorada
    speakNumberEnhanced(letterName, number);
  }

  // Mejorado: Función para hablar el número usando síntesis de voz con mejor pronunciación
  function speakNumberEnhanced(letter, number) {
    if (!speechSupported) return;

    // Cancelar cualquier anuncio anterior
    window.speechSynthesis.cancel();

    // Actualizar indicador de voz
    voiceIndicator.textContent = "Hablando...";
    voiceIndicator.style.color = "#f1c453";

    // Convertir el número a palabras en español para mejor pronunciación
    const numberInWords = convertNumberToSpanishWords(number);

    // Usar la pronunciación mejorada de la letra
    const letterPronunciation = SPANISH_PRONUNCIATION[letter];

    // Crear el texto a hablar con pausas para mejor claridad
    // Formato: "Letra [pausa] Número"
    const textToSpeak = `${letterPronunciation}, ${numberInWords}`;

    // Crear y configurar el objeto de síntesis de voz
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "es-ES";
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1;

    // Usar la voz seleccionada si está disponible
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

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

  // Nuevo: Convertir número a palabras en español para mejor pronunciación
  function convertNumberToSpanishWords(number) {
    // Números del 1 al 19
    const units = [
      "",
      "uno",
      "dos",
      "tres",
      "cuatro",
      "cinco",
      "seis",
      "siete",
      "ocho",
      "nueve",
      "diez",
      "once",
      "doce",
      "trece",
      "catorce",
      "quince",
      "dieciséis",
      "diecisiete",
      "dieciocho",
      "diecinueve",
    ];

    // Decenas
    const tens = [
      "",
      "",
      "veinte",
      "treinta",
      "cuarenta",
      "cincuenta",
      "sesenta",
      "setenta",
    ];

    // Para números del 1 al 19, usar la tabla de unidades
    if (number < 20) {
      return units[number];
    }

    // Para números del 20 al 29, casos especiales
    if (number >= 20 && number < 30) {
      if (number === 20) return "veinte";
      return "veinti" + units[number - 20];
    }

    // Para números del 30 al 75
    const ten = Math.floor(number / 10);
    const unit = number % 10;

    if (unit === 0) {
      return tens[ten];
    } else {
      return tens[ten] + " y " + units[unit];
    }
  }

  // Repetir el último número llamado con pronunciación mejorada
  function repeatLastNumber() {
    if (currentCall) {
      const { letter, number } = currentCall;
      speakNumberEnhanced(BINGO_CONFIG[letter].spanish, number);
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

  // Agregar estilos para los nuevos controles
  const style = document.createElement("style");
  style.textContent = `
      .voice-controls {
        background-color: #2d3748;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-top: 1rem;
      }
      
      .voice-controls h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
      }
      
      .control-group {
        margin-bottom: 0.5rem;
      }
      
      .control-group label {
        display: block;
        margin-bottom: 0.25rem;
      }
      
      #voice-selector {
        width: 100%;
        padding: 0.5rem;
        border-radius: 0.25rem;
        background-color: #1a202c;
        color: white;
        border: 1px solid #4a5568;
      }
      
      #voice-pitch {
        width: 100%;
      }
    `;
  document.head.appendChild(style);
});
