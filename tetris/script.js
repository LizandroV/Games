// DOM Elements
const boardElement = document.getElementById("board");
const nextPieceElement = document.getElementById("next-piece");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");
const finalScoreElement = document.getElementById("final-score");
const startPauseBtn = document.getElementById("start-pause-btn");
const restartBtn = document.getElementById("restart-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const gameOverOverlay = document.getElementById("game-over");
const pauseOverlay = document.getElementById("pause-overlay");
const startOverlay = document.getElementById("start-overlay");
const gameArea = document.getElementById("game-area");

// Mobile controls
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const downBtn = document.getElementById("down-btn");
const rotateBtn = document.getElementById("rotate-btn");
const hardDropBtn = document.getElementById("hard-drop-btn");

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;

// Tetromino shapes
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    className: "tetromino-I",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: "tetromino-J",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: "tetromino-L",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    className: "tetromino-O",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    className: "tetromino-S",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: "tetromino-T",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    className: "tetromino-Z",
  },
};

// Game state
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isPaused = false;
let dropTime = INITIAL_DROP_TIME;
let gameStarted = false;
let dropInterval = null;

// Initialize the game board
function createBoard() {
  board = Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(0));
  boardElement.innerHTML = "";

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", "empty");
      cell.dataset.x = x;
      cell.dataset.y = y;
      boardElement.appendChild(cell);
    }
  }
}

// Random tetromino generator
function randomTetromino() {
  const tetrominos = "IJLOSTZ";
  const randTetromino =
    tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
}

// Reset player
function resetPlayer() {
  currentPiece = {
    pos: { x: 3, y: 0 },
    tetromino: nextPiece,
    collided: false,
  };
  nextPiece = randomTetromino();
  renderNextPiece();

  // Check if game over
  if (checkCollision(currentPiece.tetromino, currentPiece.pos)) {
    gameOver = true;
    clearInterval(dropInterval);
    dropInterval = null;
    finalScoreElement.textContent = score;
    gameOverOverlay.classList.remove("hidden");
  }
}

// Render next piece preview
function renderNextPiece() {
  nextPieceElement.innerHTML = "";

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const cell = document.createElement("div");
      cell.classList.add("next-piece-cell");

      if (nextPiece.shape[y] && nextPiece.shape[y][x] === 1) {
        cell.classList.add(nextPiece.className);
      }

      nextPieceElement.appendChild(cell);
    }
  }
}

// Update board display
function updateBoard() {
  // Clear the board of any active pieces
  const cells = boardElement.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    if (board[y][x] === 0) {
      cell.className = "cell empty";
    }
  });

  // Add the current piece to the display
  if (currentPiece) {
    currentPiece.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const newY = y + currentPiece.pos.y;
          const newX = x + currentPiece.pos.x;

          if (
            newY >= 0 &&
            newY < BOARD_HEIGHT &&
            newX >= 0 &&
            newX < BOARD_WIDTH
          ) {
            const cellIndex = newY * BOARD_WIDTH + newX;
            const cell = cells[cellIndex];
            cell.className = `cell ${currentPiece.tetromino.className}`;
          }
        }
      });
    });
  }
}

// Check for collision
function checkCollision(piece, pos) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      // Check if we're on a tetromino cell
      if (piece.shape[y][x] !== 0) {
        const newY = y + pos.y;
        const newX = x + pos.x;

        // Check if we're outside the game area boundaries
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          // Check if we're colliding with a locked cell
          (newY >= 0 && board[newY][newX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Rotate tetromino
function rotate(matrix, dir) {
  // Make the rows become columns (transpose)
  const rotatedTetro = matrix.map((_, index) =>
    matrix.map((col) => col[index])
  );

  // Reverse each row to get a rotated matrix
  if (dir > 0) return rotatedTetro.map((row) => row.reverse());
  return rotatedTetro.reverse();
}

// Player rotation
function playerRotate(dir) {
  if (isPaused || gameOver || !gameStarted) return;

  const originalPos = { ...currentPiece.pos };
  const originalShape = [...currentPiece.tetromino.shape];

  // Rotate the tetromino
  currentPiece.tetromino.shape = rotate(currentPiece.tetromino.shape, dir);

  // This one is so that the player can't rotate into the walls or other tetrominos
  let offset = 1;
  while (checkCollision(currentPiece.tetromino, currentPiece.pos)) {
    currentPiece.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));

    if (offset > currentPiece.tetromino.shape[0].length) {
      // If we can't find a valid position, revert the rotation
      currentPiece.tetromino.shape = originalShape;
      currentPiece.pos = originalPos;
      return;
    }
  }

  updateBoard();
}

// Move player horizontally
function movePlayer(dir) {
  if (isPaused || gameOver || !gameStarted) return;

  currentPiece.pos.x += dir;

  if (checkCollision(currentPiece.tetromino, currentPiece.pos)) {
    currentPiece.pos.x -= dir;
  } else {
    updateBoard();
  }
}

// Drop player
function drop() {
  if (isPaused || gameOver || !gameStarted) return;

  // Increase level when player has cleared 10 lines
  if (lines >= level * 10) {
    level++;
    levelElement.textContent = level;
    // Also increase speed
    dropTime = INITIAL_DROP_TIME / level;

    if (dropInterval) {
      clearInterval(dropInterval);
      dropInterval = setInterval(drop, dropTime);
    }
  }

  currentPiece.pos.y++;

  if (checkCollision(currentPiece.tetromino, currentPiece.pos)) {
    currentPiece.pos.y--;

    // We collided, need to merge the tetromino and check for cleared rows
    mergePiece();
    resetPlayer();
    sweepRows();
  }

  updateBoard();
}

// Hard drop
function dropToBottom() {
  if (isPaused || gameOver || !gameStarted) return;

  while (
    !checkCollision(currentPiece.tetromino, {
      ...currentPiece.pos,
      y: currentPiece.pos.y + 1,
    })
  ) {
    currentPiece.pos.y++;
  }

  mergePiece();
  resetPlayer();
  sweepRows();
  updateBoard();
}

// Merge the current piece with the board
function mergePiece() {
  currentPiece.tetromino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const newY = y + currentPiece.pos.y;
        const newX = x + currentPiece.pos.x;

        if (
          newY >= 0 &&
          newY < BOARD_HEIGHT &&
          newX >= 0 &&
          newX < BOARD_WIDTH
        ) {
          board[newY][newX] = 1;
        }
      }
    });
  });
}

// Sweep completed rows
function sweepRows() {
  let rowsCleared = 0;

  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== 0)) {
      // Remove the row and add an empty row at the top
      board.splice(y, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0));
      rowsCleared++;
      y++; // Check the same row again since we moved rows down
    }
  }

  if (rowsCleared > 0) {
    // Calculate score based on number of rows cleared and level
    score += rowsCleared * 100 * level;
    lines += rowsCleared;

    scoreElement.textContent = score;
    linesElement.textContent = lines;

    // Rebuild the board display completely
    const cells = boardElement.querySelectorAll(".cell");
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cellIndex = y * BOARD_WIDTH + x;
        const cell = cells[cellIndex];

        if (board[y][x] === 0) {
          cell.className = "cell empty";
        } else {
          // For simplicity, we'll use a generic locked class
          cell.className = "cell tetromino-ghost";
        }
      }
    }
  }
}

// Start game
function startGame() {
  // Reset everything
  createBoard();
  dropTime = INITIAL_DROP_TIME;
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  isPaused = false;
  gameStarted = true;

  scoreElement.textContent = score;
  levelElement.textContent = level;
  linesElement.textContent = lines;

  nextPiece = randomTetromino();
  resetPlayer();

  startOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");

  startPauseBtn.innerHTML = '<span class="icon">⏸</span> Pause';
  restartBtn.disabled = false;

  if (dropInterval) clearInterval(dropInterval);
  dropInterval = setInterval(drop, dropTime);

  updateBoard();
}

// Pause game
function pauseGame() {
  if (gameOver || !gameStarted) return;

  isPaused = !isPaused;

  if (isPaused) {
    clearInterval(dropInterval);
    dropInterval = null;
    pauseOverlay.classList.remove("hidden");
    startPauseBtn.innerHTML = '<span class="icon">▶</span> Resume';
  } else {
    pauseOverlay.classList.add("hidden");
    dropInterval = setInterval(drop, dropTime);
    startPauseBtn.innerHTML = '<span class="icon">⏸</span> Pause';
  }
}

// Handle key presses
function handleKeyPress(e) {
  if (gameOver || !gameStarted) return;
  if (isPaused) {
    if (e.key === "p") pauseGame();
    return;
  }

  switch (e.key) {
    case "ArrowLeft":
      movePlayer(-1);
      break;
    case "ArrowRight":
      movePlayer(1);
      break;
    case "ArrowDown":
      drop();
      break;
    case "ArrowUp":
      playerRotate(1);
      break;
    case " ":
      e.preventDefault(); // Prevent page scrolling
      dropToBottom();
      break;
    case "p":
      pauseGame();
      break;
    default:
      break;
  }
}

// Event listeners
startPauseBtn.addEventListener("click", () => {
  if (gameStarted) {
    pauseGame();
  } else {
    startGame();
  }
});

restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

// Mobile controls
leftBtn.addEventListener("click", () => movePlayer(-1));
rightBtn.addEventListener("click", () => movePlayer(1));
downBtn.addEventListener("click", drop);
rotateBtn.addEventListener("click", () => playerRotate(1));
hardDropBtn.addEventListener("click", dropToBottom);

// Keyboard controls
document.addEventListener("keydown", handleKeyPress);

// Focus the game area
gameArea.focus();

// Initialize the board
createBoard();
