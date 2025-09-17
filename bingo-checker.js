// bingo-checker.js
// --------------------------------------------------------
// Simple 4×4 bingo detection + confetti
// --------------------------------------------------------

export function checkBingo(completed, gridOrder, scoreFilenames, size = 4) {
  const completedSet = new Set(completed);
  const board = [];

  for (let r = 0; r < size; r++) {
    board[r] = [];
    for (let c = 0; c < size; c++) {
      const filename = scoreFilenames[gridOrder[r * size + c]];
      board[r][c] = completedSet.has(filename);
    }
  }

  // rows, columns
  for (let i = 0; i < size; i++) {
    if (board[i].every(Boolean)) return true;
    if (board.map(r => r[i]).every(Boolean)) return true;
  }

  // diagonals
  if (board.every((r, i) => r[i])) return true;
  if (board.every((r, i) => r[size - 1 - i])) return true;

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
