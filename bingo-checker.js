// bingo-checker.js
// --------------------------------------------------------
// Simple 4×4 bingo detection + confetti
// --------------------------------------------------------

export function checkBingo(completed, gridOrder, size = 4) {
  // completed: array of filenames (e.g. "Score5.svg")
  // gridOrder: randomizedOrder from script.js
  const completedSet = new Set(completed);

  // build a 4x4 board of booleans
  const board = [];
  for (let r = 0; r < size; r++) {
    board[r] = [];
    for (let c = 0; c < size; c++) {
      const filename = window.scoreFilenames[gridOrder[r * size + c]];
      board[r][c] = completedSet.has(filename);
    }
  }

  // check rows & columns
  for (let i = 0; i < size; i++) {
    if (board[i].every(Boolean)) return true;                  // row
    if (board.map(r => r[i]).every(Boolean)) return true;      // column
  }

  // check diagonals
  if (board.every((r, i) => r[i])) return true;                // main diagonal
  if (board.every((r, i) => r[size - 1 - i])) return true;     // anti diagonal

  return false;
}

// Simple confetti using canvas-confetti CDN
export function launchConfetti() {
  if (window.confetti) {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 }
    });
  } else {
    console.warn("Confetti library not loaded");
  }
}
