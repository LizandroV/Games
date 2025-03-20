document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const cardGrid = document.getElementById("card-grid");
  const newCardBtn = document.getElementById("new-card-btn");

  // Configuración de BINGO
  const BINGO_CONFIG = {
    B: { min: 1, max: 15 },
    I: { min: 16, max: 30 },
    N: { min: 31, max: 45 },
    G: { min: 46, max: 60 },
    O: { min: 61, max: 75 },
  };

  // Generar un número aleatorio entre min y max (ambos inclusive)
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generar un array de números aleatorios únicos para una columna
  function generateRandomColumn(min, max, count) {
    const numbers = [];
    while (numbers.length < count) {
      const num = getRandomNumber(min, max);
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers;
  }

  // Crear la cartilla de BINGO
  function createBingoCard() {
    // Limpiar la cuadrícula
    cardGrid.innerHTML = "";

    // Generar números aleatorios para cada columna
    const columns = {
      B: generateRandomColumn(BINGO_CONFIG["B"].min, BINGO_CONFIG["B"].max, 5),
      I: generateRandomColumn(BINGO_CONFIG["I"].min, BINGO_CONFIG["I"].max, 5),
      N: generateRandomColumn(BINGO_CONFIG["N"].min, BINGO_CONFIG["N"].max, 5),
      G: generateRandomColumn(BINGO_CONFIG["G"].min, BINGO_CONFIG["G"].max, 5),
      O: generateRandomColumn(BINGO_CONFIG["O"].min, BINGO_CONFIG["O"].max, 5),
    };

    // Crear la cuadrícula 5x5
    const letters = ["B", "I", "N", "G", "O"];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const letter = letters[col];
        const cell = document.createElement("div");

        // Espacio libre en el centro
        if (row === 2 && col === 2) {
          cell.className = "number-cell free-space";
          cell.textContent = "FREE";
          cell.innerHTML = "FREE<br>SPACE";
        } else {
          cell.className = "number-cell";
          cell.textContent = columns[letter][row];

          // Agregar evento para marcar/desmarcar
          cell.addEventListener("click", toggleMark);
        }

        cardGrid.appendChild(cell);
      }
    }
  }

  // Marcar o desmarcar un número
  function toggleMark() {
    // No marcar el espacio libre
    if (this.classList.contains("free-space")) return;

    this.classList.toggle("marked");
    this.classList.add("animate-pop");

    // Eliminar la clase de animación después de que se complete
    setTimeout(() => {
      this.classList.remove("animate-pop");
    }, 300);
  }

  // Evento para generar una nueva cartilla
  newCardBtn.addEventListener("click", () => {
    createBingoCard();
  });

  // Generar la cartilla inicial
  createBingoCard();
});
