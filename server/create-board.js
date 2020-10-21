const createBoard = () => {
  // two-dimensional array filled with nulls
  let board;
  
  const clear = () => {
    board = Array(3)
      .fill()
      .map(() => Array(3).fill(null));
  };

  const alreadyClicked = (tileNum) => {
    let y = Math.floor(tileNum / 3);
    let x = tileNum % 3;
    
    if (board[y][x]) return true;
    return false;
  }

  const inBounds = (x, y) => {
    return y >= 0 && y < board.length && x >= 0 && x < board[y].length;
  };

  const numMatches = (x, y, dx, dy) => {
    let i = 1;
    while (
      inBounds(x + i * dx, y + i * dy) &&
      board[y + i * dy][x + i * dx] === board[y][x]
    ) {
      i++;
    }
    return i - 1;
  };

  const isWinningMove = (x, y) => {
    for (let dx = -1; dx < 2; dx++) {
      for (let dy = -1; dy < 2; dy++) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const count = numMatches(x, y, dx, dy) + numMatches(x, y, -dx, -dy) + 1;

        if (count === 3) {
          return true;
        }
      }
    }
    return false;
  };

  const makeMove = (tileNum, playerID) => {

    let y = Math.floor(tileNum / 3);
    let x = tileNum % 3;

    board[y][x] = playerID;
    return isWinningMove(x, y);
  };

  const isDraw = () => {
    for (row of board) {
      if (!(row[0] && row[1] && row[2])) {
        return false;
      }
    }
    return true;
  };

  const getBoard = () => board;

  clear();
  return {
    makeMove,
    getBoard,
    clear,
    alreadyClicked,
    isDraw
  };
};

module.exports = createBoard;
