const DOMUtilities = (function () {
  const removeDescendants = function (elem) {
    while (elem.hasChildNodes()) {
      removeDescendants(elem.lastChild);
      elem.removeChild(elem.lastChild);
    }
  };

  const getCheckedRadioValueAmongDescendants = function (ascendentElement) {
    return ascendentElement.querySelector("input[type=radio]:checked").value;
  };

  // from: https://stackoverflow.com/a/143889
  // Determines if the passed element is overflowing its bounds,
  // either vertically or horizontally.
  // Will temporarily modify the "overflow" style to detect this
  // if necessary.
  const _checkEllipsis = function (el) {
    return el.offsetWidth < el.scrollWidth;
  };

  const fitFontSize = function (elem, defaultFontSize = "", delta = 0.9) {
    // Initialize the fontSize, if the initial value is provided
    if (defaultFontSize) elem.style.fontSize = defaultFontSize;
    const fontSize = getComputedStyle(elem).getPropertyValue("font-size");

    const cssUnitsSplit = _splitCSSUnits(fontSize);
    let fontSizeVal = cssUnitsSplit[0];
    const fontSizeUnit = cssUnitsSplit[1];

    while (_checkEllipsis(elem) && fontSizeVal > 8) {
      fontSizeVal *= delta;
      elem.style.fontSize = fontSizeVal + fontSizeUnit;
    }
  };

  const _splitCSSUnits = function (CSSAttrVal) {
    return [CSSAttrVal.match(/[\d.]+/)[0], CSSAttrVal.match(/[^\d.]+/)[0]];
  };

  return {
    removeDescendants,
    getCheckedRadioValueAmongDescendants,
    fitFontSize,
  };
})();

const commonUtilities = (function () {
  const randomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const randomItemInArray = function (array) {
    const randomIdx = randomInt(0, array.length - 1);
    return array[randomIdx];
  };

  return { randomInt, randomItemInArray };
})();

// Disable CSS transitions on window resize
// From: https://stackoverflow.com/questions/38526764/disable-css-transitions-on-window-resize
// In style.css, add: body.stop-transitions * {transition: none !important;}
(function () {
  const classes = document.body.classList;
  let timer = 0;
  window.addEventListener("resize", function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    } else classes.add("stop-transitions");

    timer = setTimeout(() => {
      classes.remove("stop-transitions");
      timer = null;
    }, 100);
  });
})();

// This factory function handles the gameboard functionality
function createGameboard(size, emptyCellValue = "", winLen = 0) {
  if (winLen == 0) winLen = size;

  const gameboard = [];
  let numberOfEmptyCells = size * size;

  // Map(): see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  const emptyCells = new Map();

  // Create the empty gameboard
  for (let r = 0; r < size; r++) {
    // Add a row
    gameboard.push([]);

    for (let c = 0; c < size; c++) {
      const id = r * size + c;
      // Add cells to row
      gameboard[r].push(createCell(r, c, id, emptyCellValue));
      emptyCells.set(id, gameboard[r][c]);
    }
  }

  const resetGameboard = function () {
    numberOfEmptyCells = size * size;

    gameboard.forEach((row) => {
      row.forEach((cell) => {
        cell.resetCellPlayer();
        emptyCells.set(cell.getCellId(), cell);
      });
    });
  };

  const printGameboard = function () {
    const verticalLine = " | ";
    const horizontalLine =
      "-".repeat(size + (size - 1) * verticalLine.length) + "\n";
    let str = "";

    gameboard.forEach((row, idx) => {
      if (idx > 0) str += horizontalLine;
      row.forEach((cell, idx) => {
        if (idx > 0) str += verticalLine;
        str += cell.getCellValue();
      });
      str += "\n";
    });

    console.log(str);
  };

  /* Extract info */
  const _getRowCells = function (row) {
    return gameboard[row];
  };

  const _getColumnCells = function (column) {
    return gameboard.map((itm) => itm[column]);
  };

  const _getMainDiagonalCells = function (k = 0) {
    //return gameboard.map((itm,idx) => itm[idx]); /* valid only if k=0 */
    return gameboard.reduce((arr, itm, idx) => {
      const i = idx + k;
      if (i >= 0 && i < size) {
        arr.push(itm[i]);
      }
      return arr;
    }, []);
  };

  const _getAntiDiagonalCells = function (k = 0) {
    //return gameboard.map((itm,idx) => itm[size-idx-1]); /* valid only if k=0 */
    return gameboard.reduce((arr, itm, idx) => {
      const i = size - idx - 1 + k;
      if (i >= 0 && i < size) {
        arr.push(itm[i]);
      }
      return arr;
    }, []);
  };

  const gameboardLines = (function () {
    const lines = [];

    // Row lines
    for (let row = 0; row < size; row++) lines.push(_getRowCells(row));

    // Column lines
    for (let column = 0; column < size; column++)
      lines.push(_getColumnCells(column));

    const diagN = size - winLen;

    // Main diagonal
    for (let diagK = -diagN; diagK < diagN + 1; diagK++)
      lines.push(_getMainDiagonalCells(diagK));

    // Check a winner in the anti diagonal
    for (let diagK = -diagN; diagK < diagN + 1; diagK++)
      lines.push(_getAntiDiagonalCells(diagK));

    return lines;
  })();

  const gameboardSubLines = (function () {
    const subLines = [];

    // for each line
    for (const line of gameboardLines) {
      //console.log(`Line: [${line.map(cell => cell.getCellId())}]`);

      // for each possible subline (there are more than one when winLen<size)
      for (let i = 0; i < line.length - winLen + 1; i++) {
        const subLine = line.slice(i, i + winLen);
        subLines.push(subLine);
        //console.log(`  subline: [${subLine.map(cell => cell.getCellId())}]`);
      }
    }
    return subLines;
  })();

  const getSize = function () {
    return size;
  };

  const getWinLen = function () {
    return winLen;
  };

  /* Move methods */
  const _isMoveAllowed = function (row, column) {
    return (
      0 <= row &&
      row < size &&
      0 <= column &&
      column < size &&
      gameboard[row][column].getCellValue() === emptyCellValue
    );
  };

  const makeMove = function (row, column, currentTurn) {
    // returns true if the move is performed, false otherwise
    if (!_isMoveAllowed(row, column)) {
      console.log(
        `Gameboard:makeMove. Setting cell (${row},${column}) to "${currentTurn.getPlayerName()}" not allowed`
      );
      return null;
    }

    //console.log(`Gameboard:makeMove. Marking cell (${row},${column}) by user ${currentTurn}`);
    const cell = gameboard[row][column];
    cell.setCellPlayer(currentTurn);
    numberOfEmptyCells--;
    emptyCells.delete(cell.getCellId());

    return cell;
  };

  const unmarkMove = function (row, column, currentTurn) {
    const cell = gameboard[row][column];
    if (cell.getCellPlayer() == currentTurn) {
      cell.resetCellPlayer();
      numberOfEmptyCells++;
      emptyCells.set(cell.getCellId(), cell);
    }
  };

  /* Game finished methods */
  // const _checkEqualValidCellsInLine = function (array) {
  //   const firstValue = array[0].getCellValue();
  //   return (
  //     firstValue != emptyCellValue &&
  //     array.every((itm) => itm.getCellValue() === firstValue)
  //   );
  // };

  const _checkAtLeastMEqualCellsInLine = function (array) {
    let iStart = 0;
    let iEnd = -1;
    let found = false;
    let prevValue;
    let cellValue = array[iStart].getCellValue();

    if (winLen == 1 && cellValue != emptyCellValue) {
      iEnd = array.length;
      found = true;
    }

    for (let i = 1; i < array.length; i++) {
      prevValue = cellValue;
      cellValue = array[i].getCellValue();

      // empty cell or cell different from previous one
      if (cellValue == emptyCellValue || cellValue != prevValue) {
        if (!found) {
          iStart = i;
        } else {
          iEnd = i; /* adjust the ending index */
          break;
        }
      } else if (i - iStart + 1 == winLen) {
        // same cell as before
        iEnd = array.length;
        found = true;
      }
    }

    if (found) {
      if (iEnd - iStart == winLen) return [array.slice(iStart, iEnd)];
      else
        return [
          array.slice(iStart, iStart + winLen),
          array.slice(iEnd - winLen, iEnd),
        ];
    } else {
      return null;
    }
  };

  const getArrayOfLinesOfEqualCells = function () {
    const linesOfEqualCells = [];

    // Check a winner in the lines
    for (const line of gameboardLines) {
      const seq = _checkAtLeastMEqualCellsInLine(line);
      // previously: seq = _checkEqualValidCellsInLine(line)
      if (seq) {
        linesOfEqualCells.push(...seq);
      }
    }

    return linesOfEqualCells;
  };

  const noEmptyCells = function () {
    return numberOfEmptyCells == 0;
  };

  const getEmptyCells = function () {
    return emptyCells;
  };

  const getTerminalCondition = function () {
    const equalLines = getArrayOfLinesOfEqualCells();
    // Gameboard has a winner
    if (equalLines.length) {
      return createTerminalCondition(
        equalLines[0][0].getCellPlayer(),
        equalLines
      );
    }

    // Gameboard is full
    if (noEmptyCells()) {
      return createTerminalCondition(null, []);
    }

    // There are empty cells to fill and no winner yet
    return null;
  };

  // Gameboard scoring

  const getPotentialWinScoreAfterMove = function (cell, player) {
    let score = 0;

    // Check if the player can win (temporarly marking the cell)
    makeMove(cell.getCellRow(), cell.getCellColumn(), player);

    const terminalCondition = getTerminalCondition();
    if (terminalCondition && terminalCondition.getPlayer()) {
      // the winner is necessarily the player
      score = terminalCondition.getAssignedPoints(); // win
    }

    unmarkMove(cell.getCellRow(), cell.getCellColumn(), player);

    if (score)
      console.log(
        "WinScore",
        player.isHuman() ? "(Opponent)" : "(AI)",
        cell.getCellId(),
        score
      ); // debug

    return score;
  };

  const getPotentialForkScoreAfterMove = function (cell, player) {
    // Make the move (temporarly marking the cell)
    makeMove(cell.getCellRow(), cell.getCellColumn(), player);

    // Check if the ai player could win on next move, to see if some immediate win are generated
    // Score: number of winning combinations after a move
    // - A 1 score, is a potential win on the next turn of the player,
    //   that however can be blocked by the opponent in the turn in between
    // - A >1 score, is a certain win on the next turn of the player,
    //   beacause the opponent can only block one of them in the turn in between

    const score = getAllPotentialWinScoreAfterMove(player).length;

    unmarkMove(cell.getCellRow(), cell.getCellColumn(), player);

    if (score)
      console.log(
        "ForkScore",
        player.isHuman() ? "(Opponent)" : "(AI)",
        cell.getCellId(),
        score
      ); // debug

    return score;
  };

  const getAllPotentialWinScoreAfterMove = function (
    player,
    getBestScoreOnly = false
  ) {
    let winningCells = [];
    const emptyCellsArr = [...emptyCells.values()];
    let bestScore = 1; // a 0 score is not a win

    emptyCellsArr.forEach((cell) => {
      // Check if the player can win
      const score = getPotentialWinScoreAfterMove(cell, player);

      // reset the cells if a better score is found
      if (getBestScoreOnly) {
        if (score > bestScore) {
          bestScore = score;
          winningCells = [cell];
        } else if (score == bestScore) {
          winningCells.push(cell);
        }
      } else if (score > 0) {
        winningCells.push(cell);
      }
    });
    return winningCells;
  };

  const getAllPotentialForkScoreAfterMove = function (
    player,
    getForkScoreOnly = false
  ) {
    const potentialWinCells = []; // with score=1, see getPotentialForkScoreAfterMove
    const forkingCells = []; // with score>1
    const emptyCellsArr = [...emptyCells.values()];

    emptyCellsArr.forEach((cell) => {
      const score = getPotentialForkScoreAfterMove(cell, player);
      // Check if the player can fork
      if (score == 1 && !getForkScoreOnly) potentialWinCells.push(cell);
      else if (score > 1) forkingCells.push(cell);
    });

    // if there are forking cells, return their array to secure a win,
    // otherwise, return the array of potential win cells (in 2 moves), which are not a guarantee though
    return forkingCells.length > 0 ? forkingCells : potentialWinCells;
  };

  // -------------------------------------------------------------------

  // Gameboard heuristic score
  // The following 3 methods implement the heuristic score of the current gameboard.
  // The heuristic score is based on: https://stackoverflow.com/questions/77446399/how-to-properly-implement-minimax-ai-for-tic-tac-toe
  // For each line (row, column, diagonal), consider the winning opportunities, ie, lines in which no opponent mark is set.
  // For each winning opportunity line, cound the number of marks of the current player in there.
  // Then, the heuristic score (for a given player) is the sum of the square of these values.
  // The overall gameboard heuristic score is the heuristic score of the current player minus the one of the opponent.
  // Note that empty lines are ignored, as they are opportunities for both players.
  // Also, note that if winLen<size, there can be more than one 'sub-line' in each line, so each of them is considered as a separate one.

  const getLineHeuristicSquaredScoreForPlayer = function (line, playerVal) {
    //let str = `      sl: [${line.map(cell => cell.getCellValue())}]`;

    // Get the number of marked cells
    let numOfMarkedCellsForPotentialWin = 0;
    for (const cell of line) {
      const cellVal = cell.getCellValue();

      if (cellVal == playerVal)
        // player mark
        numOfMarkedCellsForPotentialWin++;
      else if (cellVal != emptyCellValue) {
        // opponent mark: no win in this line
        //console.log(str,' --> NONE');
        return 0;
      }
    }
    //console.log(str,' --> ', numOfMarkedCellsForPotentialWin);
    return numOfMarkedCellsForPotentialWin ** 2;
  };

  const getGameboardHeuristicScoreForPlayer = function (player) {
    let score = 0;
    const playerVal = player.getPlayerValue();
    // This score sums the score of all the winning opportunities of the player
    // A winning opportunity is a line in which no opponent mark is set

    // If winLen==size, the lines are equal to the subLines
    // If winLen<size, a winning opportunity can occur in each subline (there are 1+ of them in each line)
    // for each subline
    for (const subLine of gameboardSubLines) {
      //console.log(`    SubLine: [${subLine.map(cell => cell.getCellId())}] = [${subLine.map(cell => cell.getCellValue())}]  ==> ${player.getPlayerValue()}`);

      score += getLineHeuristicSquaredScoreForPlayer(subLine, playerVal);
    }
    //console.log(`  GAMEBOARD SCORE (${player.getPlayerName()}): ${score}`);
    return score;
  };

  const getGameboardHeuristicScore = function (player, opponent) {
    // This is the overall score that takes into account both the player and the opponent winning opportunities
    const score =
      getGameboardHeuristicScoreForPlayer(player) -
      getGameboardHeuristicScoreForPlayer(opponent);
    //console.log(`GAMEBOARD SCORE (TOT): ${score}\n`);
    return score;
  };

  return {
    makeMove,
    resetGameboard,
    printGameboard,
    getArrayOfLinesOfEqualCells,
    noEmptyCells,
    getEmptyCells,
    unmarkMove,
    getTerminalCondition,
    getSize,
    getWinLen,
    getAllPotentialWinScoreAfterMove,
    getAllPotentialForkScoreAfterMove,
    getGameboardHeuristicScore,
  };
}

// This factory function handles the gameboard's cell functionality
// A player object reference can be assigned to the cell, which has a getPlayerValue() method
//    which gives the displayed symbol
// By default, no player is associated: the empty cell displayed value is given by the parameter emptyCellValue
function createCell(row, column, id, emptyCellValue = "") {
  let player = null;

  const getCellValue = function () {
    if (player) return player.getPlayerValue();
    else return emptyCellValue;
  };

  const getCellPlayer = function () {
    return player;
  };

  const setCellPlayer = function (playerToSet) {
    player = playerToSet;
  };

  const resetCellPlayer = function () {
    player = null;
  };

  const getCellRow = function () {
    return row;
  };

  const getCellColumn = function () {
    return column;
  };

  const getCellId = function () {
    return id;
  };

  return {
    getCellValue,
    getCellPlayer,
    setCellPlayer,
    resetCellPlayer,
    getCellRow,
    getCellColumn,
    getCellId,
  };
}

// This factory function handles the player functionality
function createPlayer(id, name, value) {
  let score = 0;

  /* Get info */
  const getPlayerId = function () {
    return id;
  };

  const getPlayerName = function () {
    return name;
  };

  const getPlayerValue = function () {
    return value;
  };

  /* Edit score */
  const getPlayerScore = function () {
    return score;
  };
  const resetPlayerScore = function () {
    score = 0;
  };
  const incrementPlayerScoreBy = function (amount = 1) {
    score += amount;
  };

  const isHuman = function () {
    return true;
  };

  return {
    getPlayerId,
    getPlayerName,
    getPlayerValue,
    getPlayerScore,
    resetPlayerScore,
    incrementPlayerScoreBy,
    isHuman,
  };
}

function createAIPlayer(id, name = "AI", value, skillLevel) {
  const player = createPlayer(id, name, value);
  let opponent = null;

  // Override isHuman method
  player.isHuman = function () {
    return false;
  };

  function setOpponent(opponentToSet) {
    opponent = opponentToSet;
    minMaxTurnInfo.min.player = opponentToSet;
  }

  const baseScore = 10 ** 9; // a value sufficiently high such that is is higher than any possible heuristic value for a non-terminal state
  const minMaxTurnInfo = {
    max: {
      player: player,
      fcn: Math.max,
      worstScore: -baseScore,
      updateAlfaBeta: (best, alpha, beta) => [Math.max(alpha, best), beta],
      getAlfaBetaCondition: (best, alpha, beta) => best >= beta,
    },
    min: {
      player: opponent,
      fcn: Math.min,
      worstScore: baseScore,
      updateAlfaBeta: (best, alpha, beta) => [alpha, Math.min(beta, best)],
      getAlfaBetaCondition: (best, alpha) => best <= alpha,
    },
  };
  const minMaxNodesMap = new Map();

  const getRandomMove = function (gameboard) {
    // Select a random cell among the empty ones
    const emptyCellsId = [...gameboard.getEmptyCells().keys()];
    return commonUtilities.randomItemInArray(emptyCellsId);
  };

  const getHeuristicMove_skillLevelFrom0to4 = function (gameboard, skillLevel) {
    // Heuristic chosen moves phases:
    // [1] If the ai player can win now, make the move to win [REACTIVE MOVE],
    // [2] else if the opponent can win on the next move, make the move to block it [REACTIVE MOVE],
    // [3] else if the ai can create a fork opportunity, create it [PROACTIVE MOVE],
    // [4] else if the opponent can create a fork opportunity, block it [PROACTIVE MOVE],
    // [5] else, make a random move .
    //
    // skillLevel 0. Phases: 5
    // skillLevel 1. Phases: 1 > 5
    // skillLevel 2. Phases: 1 > 2 > 5
    // skillLevel 3. Phases: 1 > 2 > 3 > 5
    // skillLevel 4. Phases: 1 > 2 > 3 > 4 > 5

    if (skillLevel >= 1) {
      // Phase 1: Check if the ai player can win
      const winningCells = gameboard.getAllPotentialWinScoreAfterMove(
        player,
        true
      ); // get best score move

      if (winningCells.length)
        return commonUtilities.randomItemInArray(winningCells).getCellId();

      if (skillLevel >= 2) {
        // Phase 2: Check if the opponent can win
        const blockingCells = gameboard.getAllPotentialWinScoreAfterMove(
          opponent,
          true
        ); // get best score move
        if (blockingCells.length)
          return commonUtilities.randomItemInArray(blockingCells).getCellId();

        if (skillLevel >= 3) {
          // Phase 3: Check if the ai can fork
          const forkingCells =
            gameboard.getAllPotentialForkScoreAfterMove(player);
          if (forkingCells.length)
            return commonUtilities.randomItemInArray(forkingCells).getCellId();

          if (skillLevel >= 4) {
            // Phase 4: Check if the opponent can fork
            const forkingBlockCells =
              gameboard.getAllPotentialForkScoreAfterMove(opponent);
            if (forkingBlockCells.length)
              return commonUtilities
                .randomItemInArray(forkingBlockCells)
                .getCellId();
          }
        }
      }
    }

    // Phase 5: else, return a random move
    return getRandomMove(gameboard);
  };

  const _getMinMaxMaxDepth = function (gameboard) {
    const maxNodesToExplore = 300000;
    const numOfEmptyCells = gameboard.getEmptyCells().size;
    let nextNumOfEmptyCells = numOfEmptyCells;
    let nextNodesToExplore = numOfEmptyCells;
    let maxDepth;

    if (numOfEmptyCells <= 9) {
      maxDepth = numOfEmptyCells;
    } else {
      while (
        nextNodesToExplore < maxNodesToExplore &&
        nextNumOfEmptyCells > 1
      ) {
        nextNumOfEmptyCells--;
        nextNodesToExplore *= nextNumOfEmptyCells;
      }
      maxDepth = numOfEmptyCells - nextNumOfEmptyCells + 1;
    }

    console.log(
      `Search tree depth. TOT: ${numOfEmptyCells} - STOP AT ${maxDepth}`
    );

    return maxDepth;
  };

  // getBestMove use minmax algorithm the find the optimal best move
  // Such move is sub-optimal if a maxDepth smaller than the maximum depth is specified
  // The implementation is based on: https://alialaa.com/blog/tic-tac-toe-js-minimax
  // Also, alpha-beta pruning is implemented to improve performance.
  // See, eg, https://towardsdatascience.com/algorithms-revisited-part-7-decision-trees-alpha-beta-pruning-9b711b6bf109
  // As getBestMove returns the best move, alpha-beta pruning is not performed at depth 0 (=on main call), to avoid losing solutions
  // Then, a recursive method  minMaxSearch() is implemented, to handle the alpha-beta pruning (indeed,
  // in that case, only the gameboard score is important)
  // see https://stackoverflow.com/questions/31429974/alphabeta-pruning-alpha-equals-or-greater-than-beta-why-equals
  // The implementation of the alpha-beta pruning is based on: https://github.com/aimacode/aima-java/blob/AIMA3e/aima-core/src/main/java/aima/core/search/adversarial/AlphaBetaSearch.java#L66

  const getBestMove = async function (gameboard, maxDepth = -1) {
    // MAIN CALL (ie, at depth 0, and not on recursion call)

    // Init nodesMap
    minMaxNodesMap.clear();

    // Get max search depth
    const maxDepthLim = _getMinMaxMaxDepth(gameboard);
    maxDepth = maxDepth >= 0 ? Math.min(maxDepthLim, maxDepth) : maxDepthLim;

    const depth = 0; // current depth
    //-------------------------------------------------------------------------------

    // Get info on the current turn: this avoids duplicating code for minimizing and maximizing players
    const isMaximizing = true;
    const currentTurnInfo = minMaxTurnInfo.max;

    //Initialize best to the lowest (MAX player) / highest (MIN player) possible value
    let best = currentTurnInfo.worstScore;
    const alpha = minMaxTurnInfo.max.worstScore;
    const beta = minMaxTurnInfo.min.worstScore;

    // Loop through all empty cells
    const emptyCellsArr = [...gameboard.getEmptyCells().values()];
    for (const cell of emptyCellsArr) {
      const r = cell.getCellRow();
      const c = cell.getCellColumn();

      // The move is always valid
      gameboard.makeMove(r, c, currentTurnInfo.player);

      //Recursively call minMaxSearch with the other player (using !isMaximizing) and depth incremented by 1
      const nodeValue = minMaxSearch(
        gameboard,
        maxDepth,
        !isMaximizing,
        depth + 1,
        alpha,
        beta
      );

      //Updating best value using Math.max (MAX player) / Math.min (MIN player)
      //The correct function is retrieved from currentTurnInfo.fcn
      best = currentTurnInfo.fcn(best, nodeValue);
      // gameboard.printGameboard();console.log(best,nodeValue);

      // Restore the cell
      gameboard.unmarkMove(r, c, currentTurnInfo.player);

      // On MAIN CALL: map each heuristic value with the cell the AI would move
      if (minMaxNodesMap.has(nodeValue))
        minMaxNodesMap.get(nodeValue).push(cell.getCellId());
      else minMaxNodesMap.set(nodeValue, [cell.getCellId()]);

      await new Promise((resolve) => setTimeout(resolve, 2));
    }

    //-------------------------------------------------------------------------------

    // On MAIN CALL: return the index of the best move (or a random one, if there are multiple of them)
    const bestMoves = minMaxNodesMap.get(best);

    return commonUtilities.randomItemInArray(bestMoves);
  };

  let minMaxSearch = function (
    gameboard,
    maxDepth = -1,
    isMaximizing = true,
    depth = 0,
    alpha = minMaxTurnInfo.max.worstScore,
    beta = minMaxTurnInfo.min.worstScore
  ) {
    // Ending condition: either there is a winner, or the board is full, or the max depth is reached
    // Return the heuristic value of this gameboard
    const terminalCondition = gameboard.getTerminalCondition();
    if (terminalCondition) {
      const winningPlayer = terminalCondition.getPlayer();
      if (!winningPlayer) {
        // no winner, but the gameboard is full: tie
        return 0;
      } else if (winningPlayer.getPlayerValue() === value) {
        // The winner is this AI player (maximizing player)
        return baseScore - depth;
      } else {
        // The winner is the opponent (minimizer player)
        return -baseScore + depth;
      }
    } else if (depth === maxDepth) {
      // The gameboard has no winner and is not full,
      // but the maximum depth of the exploration tree is reached
      // The the heuristic vale  is unknown yet: use an heuristic
      //console.log(isMaximizing);gameboard.printGameboard();
      return gameboard.getGameboardHeuristicScore(player, opponent); // 0
    }

    //-------------------------------------------------------------------------------

    // Get info on the current turn: this avoids duplicating code for minimizing and maximizing players
    const currentTurnInfo = isMaximizing
      ? minMaxTurnInfo.max
      : minMaxTurnInfo.min;

    //Initialize best to the lowest (MAX player) / highest (MIN player) possible value for this gameboard
    let best = currentTurnInfo.worstScore;

    // Loop through all empty cells
    const emptyCellsArr = [...gameboard.getEmptyCells().values()];
    for (const cell of emptyCellsArr) {
      const r = cell.getCellRow();
      const c = cell.getCellColumn();

      // The move is always valid
      gameboard.makeMove(r, c, currentTurnInfo.player);

      //Recursively call minMaxSearch with the other player (using !isMaximizing) and depth incremented by 1
      const nodeValue = minMaxSearch(
        gameboard,
        maxDepth,
        !isMaximizing,
        depth + 1,
        alpha,
        beta
      );

      //Updating best value using Math.max (MAX player) / Math.min (MIN player)
      //The correct function is retrieved from currentTurnInfo.fcn
      best = currentTurnInfo.fcn(best, nodeValue);

      //if (depth <2) {gameboard.printGameboard();console.log(best,nodeValue)};

      // Restore the cell
      gameboard.unmarkMove(r, c, currentTurnInfo.player);

      // ------------------------------

      // Alpha-beta pruning
      // alpha: best value for the maximizer at that level or below. The higher the better.
      // beta:  best value for the minimizer at that level or below. The lower the better.
      // The actual expressions based on max or min player are retrieved from currentTurnInfo
      if (currentTurnInfo.getAlfaBetaCondition(best, alpha, beta)) {
        //(alpha >= beta
        //console.log('Cutoff at ',depth,'/',maxDepth, {alpha,best,beta,isMaximizing});
        break; // cutoff
      }

      //console.log({alpha,beta,isMaximizing,depth});
      [alpha, beta] = currentTurnInfo.updateAlfaBeta(best, alpha, beta);
      //console.log({alpha,beta});
    }

    //-------------------------------------------------------------------------------

    // On RECURSIVE call: return the heuristic value for next calculation
    return best;
  };

  const getAIMove = async function (gameboard) {
    // skillLevel 0. Novice AI, totally random move
    // skillLevel 1. Beginner AI, reactive player: immediate win or random move
    // skillLevel 2. Intermediate AI, reactive player: immediate win or immediate block or random move
    // skillLevel 3. Proficient AI, proactive player: immediate win or immediate block or fork or random move
    // skillLevel 4. Advanced AI, proactive player: immediate win or immediate block or fork or block fork or random move
    // skillLevel 5. Expert AI, uses minmax with depth limited to winLen to make it not perfect and beatable.
    // skillLevel 6. Master AI, uses minmax with full depth (at least for the 3x3 grid...
    //               on larger boards the max depth might be reduced for computational reasons).
    //               In optimal conditions (when using full depth), it is unbeatable.

    // getBestMove is async and returns a Promise, resolved with the move to perform as value
    // as this method is async, too, it returns a Promise, resolved with the move to perform as value
    let move;

    if (skillLevel <= 4) {
      move = getHeuristicMove_skillLevelFrom0to4(gameboard, skillLevel);
    } else if (skillLevel == 5) {
      move = await getBestMove(gameboard, gameboard.getWinLen());
    } else {
      move = await getBestMove(gameboard);
    }

    return move;
  };

  return { ...player, getAIMove, setOpponent };
}

function createTerminalCondition(player, winningCells) {
  const assignedPoints = winningCells.length;

  // Game / win status
  const getPlayer = function () {
    return player;
  };

  const getAssignedPoints = function () {
    return assignedPoints;
  };

  const getWinningCells = function () {
    return winningCells;
  };

  return { getPlayer, getAssignedPoints, getWinningCells };
}

// This factory function handles the flow of the game
function gameController(
  size,
  playersName = { x: "Player 1", o: "Player 2" },
  playersIsHuman = { x: false, o: false },
  AISkillLevel = { x: null, o: null },
  extendedMode = false,
  winLen = 0
) {
  const emptyCellValue = " ";

  // Classic Mode: each player puts a mark, until a player wins or the gameboard is full
  // Extended Mode: each player puts AT MOST a number of marks equal to the size of the gameboard.
  // Eg, in a 3x3 board, you can put at most 3 marks per playerl
  // If a mark is set in a gameboard where there are already 'size' marks of the same type, the
  // one placed first is removed and a new one is put in another spot. Then, in the gameboard remain
  // only the most recents ones. To do this, we need to save the current markedCells (markedCells array).
  let markedCells;
  let cellToUnmark;
  // To cover both cases, you just need to check when the number of markedCells is equal to the maximum
  // allowed, and in that case, unmark the cell in markedCells array that has been set first, ie,
  // markedCells[0]
  // Classic mode: max size*size marked cells including both players (ie, all of the cells)
  // Extended mode: at most 2*size marked cells including both players
  const maxMarkedCells = extendedMode ? 2 * size : size * size;

  if (winLen == 0) winLen = size;

  // Create players
  const players = [];
  for (const sym in playersName) {
    if (playersIsHuman[sym]) {
      players.push(
        createPlayer(players.length, playersName[sym], sym.toString())
      );
    } else {
      players.push(
        createAIPlayer(
          players.length,
          playersName[sym],
          sym.toString(),
          AISkillLevel[sym]
        )
      );
    }
  }
  // Set opponents for ai
  if (!players[0].isHuman()) players[0].setOpponent(players[1]);
  if (!players[1].isHuman()) players[1].setOpponent(players[0]);

  let currentPlayerIdx = 0;

  let roundWinner;

  const gameboard = createGameboard(size, emptyCellValue, winLen);

  // Player functions
  const getCurrentPlayer = function () {
    return players[currentPlayerIdx];
  };
  const getPlayers = function () {
    return players;
  };
  const _changeCurrentPlayer = function () {
    currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
  };

  const getRoundWinnerPlayer = function () {
    return roundWinner;
  };

  const getGameWinnerPlayer = function () {
    if (players[0].getPlayerScore() > players[1].getPlayerScore())
      return players[0];
    else if (players[0].getPlayerScore() < players[1].getPlayerScore())
      return players[1];
    // no winner
    else return null;
  };

  // Play functions
  const initRound = function () {
    roundWinner = undefined;
    currentPlayerIdx = commonUtilities.randomInt(0, 1);
    markedCells = [];
    cellToUnmark = null;
    gameboard.resetGameboard();
  };

  // A function to get the cell that has been unmarkedd, to be used, eg, to update the DOM by the displayController
  const getCellToUnmark = function () {
    return cellToUnmark;
  };

  const handleCellUnmark = function () {
    if (markedCells.length == maxMarkedCells) {
      cellToUnmark = markedCells.shift();
      gameboard.unmarkMove(
        cellToUnmark.getCellRow(),
        cellToUnmark.getCellColumn(),
        getCurrentPlayer()
      );
    } else {
      cellToUnmark = null;
    }
  };

  const _saveMarkedCell = function (cell) {
    markedCells.push(cell);
  };

  const getAIMove = async function () {
    // Just a wrapper of AI player method, but returns a Promise, resolved with the move to perform as value
    // getAIMove is async and returns a Promise, resolved with the move to perform as value

    const player = getCurrentPlayer();
    if (player.isHuman()) return null;
    const move = await player.getAIMove(gameboard);
    return move;
  };

  const playMove = function (row, column) {
    // Check whether a cell must be unmarked and do it if possible
    handleCellUnmark();

    // try to make the move
    const cell = gameboard.makeMove(row, column, getCurrentPlayer());
    if (!cell) return -1; // continue game, invalid move

    // Add the current cell  where a mark is set to the markedCells array
    _saveMarkedCell(cell);

    const terminalCondition = gameboard.getTerminalCondition();
    if (terminalCondition) {
      // check if there is a valid winner
      if (terminalCondition.getPlayer()) {
        // Terminal condition has info on the actual winner player
        roundWinner = terminalCondition;
        // Increment Player points
        roundWinner
          .getPlayer()
          .incrementPlayerScoreBy(roundWinner.getAssignedPoints());
        return 1; // games ends with a winner
      } else {
        // the gameboard is full, with no winner
        return 2; // games ends with a tie
      }
    }

    // change player
    _changeCurrentPlayer();
    return 0; // continue game
  };

  // Play in console
  const _playConsoleRound = function () {
    console.log("Starting a new round...");

    initRound();

    while (true) {
      // Get info on the move to perform
      gameboard.printGameboard();
      const currentPlayerName = getCurrentPlayer().getPlayerName();
      const currentPlayerValue = getCurrentPlayer().getPlayerValue();
      console.log(`${currentPlayerName}'s turn [${currentPlayerValue}].`);
      const input = prompt(
        `${currentPlayerName}'s turn [${currentPlayerValue}].\n\nInsert the selected cell index as "row,column:"\n(recall that row and column indices starts from 0)`
      );
      const [row, column] = input.split(",").map((itm) => parseInt(itm.trim()));

      // Perform the move
      const moveOutcome = playMove(row, column); // 0,-1: the round continues, 1: a player wins, 2: it's a tie

      // Possibly end the round
      if (moveOutcome > 0) {
        // games ends
        gameboard.printGameboard();

        if (moveOutcome == 1) {
          // there is a winner
          const assignedPoints = roundWinner.getAssignedPoints();
          console.log(
            `${roundWinner.getPlayer().getPlayerName()} wins this round${
              assignedPoints > 1
                ? ` with a ${assignedPoints}x combo, getting ${
                    assignedPoints - 1
                  } extra point${assignedPoints > 2 ? "s" : ""}!`
                : "."
            }`
          );
        } else {
          // 2, tie
          console.log(`It's a tie! No winner in this round...`);
        }
        break;
      }
    }
  };

  const playConsoleGame = function () {
    console.log(`Welcome to tic-tac-toe\n`);
    console.log(
      `${players[0].getPlayerName()} VS ${players[1].getPlayerName()}`
    );

    while (true) {
      _playConsoleRound();

      // Print player status
      console.log(
        `${players[0].getPlayerName()}: ${players[0].getPlayerScore()}\n${players[1].getPlayerName()}: ${players[1].getPlayerScore()}\n`
      );

      // Ask if the user wants to end the game
      if (
        prompt(
          `Press 'ENTER' to continue. Type 'stop' to end the game.`
        ).toLowerCase() == "stop"
      )
        break;
    }

    roundWinner = undefined; // clear the round winner
    console.log(`Game ended!\n`);

    // Print the final game result
    const gameWinnerPlayer = getGameWinnerPlayer();
    if (gameWinnerPlayer)
      console.log(`${gameWinnerPlayer.getPlayerName()} WINS!`);
    else console.log(`No winner! It's a tie.`);
  };

  // playConsoleGame();

  return {
    getCurrentPlayer,
    getPlayers,
    initRound,
    playMove,
    playConsoleGame,
    getGameWinnerPlayer,
    getRoundWinnerPlayer,
    getCellToUnmark,
    getAIMove,
  };
}

// This factory function handles the display of the game in the DOM --> IIFE (module pattern), as we need a single instance
(function displayController() {
  const AIMoveDelayMs = 1200;
  let gameboardSize = 3;
  let gameboardWinLen = 3;
  let extendedMode = false;
  const playersName = {};
  let playersIsHuman = {};
  let AISkillLevel = {};
  let game = null;

  // DOM cache
  const mainDiv = document.querySelector("main");
  const startNewGameDiv = document.querySelector("main .start-new-game-div");
  const startNewGameBtn = document.querySelector("main .start-new-game-btn");
  const backBtn = document.querySelector("header .back-btn");
  const infoBtn = document.querySelector("header .info-btn");

  const playerInfoDiv = {
    x: document.querySelector(".player-info.x"),
    o: document.querySelector(".player-info.o"),
  };
  const playerInfoName = {
    x: playerInfoDiv.x.querySelector(".player-name"),
    o: playerInfoDiv.o.querySelector(".player-name"),
  };
  const playerInfoScore = {
    x: playerInfoDiv.x.querySelector(".player-score"),
    o: playerInfoDiv.o.querySelector(".player-score"),
  };
  const gameboardCntDiv = document.querySelector("main .gameboard-cnt");
  const gameboardDiv = gameboardCntDiv.querySelector(".gameboard");
  const roundOutcomeDiv = document.querySelector("main .round-outcome-div");
  const roundOutcomeTextDiv = roundOutcomeDiv.querySelector(
    ".round-outcome-text"
  );
  const winnerPlayerSpan = roundOutcomeDiv.querySelector("main .winner-player");
  const winnerComboValSpan = roundOutcomeDiv.querySelector(
    "main .winner-combo-val"
  );
  const winnerComboExtraPointsSpan = roundOutcomeDiv.querySelector(
    "main .winner-combo-extra-points"
  );
  const nextRoundBtn = roundOutcomeDiv.querySelector(".next-round-btn");
  const endGameAfterRoundBtn = roundOutcomeDiv.querySelector(".end-game-btn");

  const playerNameInput = {
    x: startNewGameDiv.querySelector("#input-player-x-name"),
    o: startNewGameDiv.querySelector("#input-player-o-name"),
  };
  const numOfPlayersInput = startNewGameDiv.querySelector(
    "#input-num-of-players"
  );
  const numOfPlayersInputRadioBtns = startNewGameDiv.querySelectorAll(
    "#input-num-of-players input"
  );
  const AISkillLevelInput = startNewGameDiv.querySelector(
    "#input-ai-skill-level"
  );
  const gameboardSizeInput = startNewGameDiv.querySelector(
    "#input-gameboard-size"
  );
  const extendedModeInput = startNewGameDiv.querySelector(
    "#input-gameboard-extended-mode"
  );

  const playerNamesFontSize = getComputedStyle(
    document.documentElement,
    null
  ).getPropertyValue("--player-info-name-fontsize");
  const roundOutcomeFontSize = getComputedStyle(
    document.documentElement,
    null
  ).getPropertyValue("--round-outcome-text-fontsize");

  // Resize observer, to adapt the gameboard size
  // see https://web.dev/articles/resize-observer
  const gameboardResizeObserver = new ResizeObserver(setGameboardSizeDOM);

  // Gameboard creation, e.g.,
  // <div class="gameboard">
  //     <div class="cell cell-tl icon-mask"></div>
  //     <div class="cell icon-mask"></div>
  //     <div class="cell cell-tr icon-mask"></div>
  //     <div class="cell icon-mask"></div>
  //     <div class="cell icon-mask"></div>
  //     <div class="cell icon-mask"></div>
  //     <div class="cell cell-bl icon-mask"></div>
  //     <div class="cell icon-mask"></div>
  //     <div class="cell cell-br icon-mask"></div>
  // </div>
  //
  // However, each cell is wrapped in a cell-clickable-area div
  // which is just used to capture the click events and will not
  // be scaled or transformed
  //
  // <div class="cell-clickable-area">
  //     <div class="cell cell-tl icon-mask"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell icon-mask o"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell cell-tr icon-mask"></div
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell icon-mask"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell icon-mask x"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell icon-mask"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell cell-bl icon-mask"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell icon-mask x"></div>
  // </div>
  // <div class="cell-clickable-area">
  //     <div class="cell cell-br icon-mask o"></div>
  // </div>
  const initGameboardDOM = function () {
    // Reset the gameboard
    resetGameboardDOM();

    // Add the cells
    for (let r = 0; r < gameboardSize; r++) {
      for (let c = 0; c < gameboardSize; c++) {
        const cellClickableArea = document.createElement("div");
        cellClickableArea.classList.add("cell-clickable-area");

        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add("icon-mask");

        if (r == 0) {
          if (c == 0) {
            cell.classList.add("cell-tl");
          } else if (c == gameboardSize - 1) {
            cell.classList.add("cell-tr");
          }
        } else if (r == gameboardSize - 1) {
          if (c == 0) {
            cell.classList.add("cell-bl");
          } else if (c == gameboardSize - 1) {
            cell.classList.add("cell-br");
          }
        }

        // add row/col info
        cell.varRow = r;
        cell.varColumn = c;

        cellClickableArea.appendChild(cell);
        gameboardDiv.appendChild(cellClickableArea);
      }
    }
  };

  const resetGameboardDOM = function () {
    DOMUtilities.removeDescendants(gameboardDiv);
  };

  const addClassToCellDOM = function (cell, className) {
    gameboardDiv.childNodes[cell.getCellId()].firstChild.classList.add(
      className
    );
  };
  const removeClassFromCellDOM = function (cell, className) {
    gameboardDiv.childNodes[cell.getCellId()].firstChild.classList.remove(
      className
    );
  };

  /* Outcome div handler */
  const resetRoundOutcomeDiv = function () {
    roundOutcomeDiv.classList.remove("tie");
    roundOutcomeDiv.classList.remove("win");
    roundOutcomeDiv.classList.remove("extra");
    roundOutcomeDiv.classList.remove("x");
    roundOutcomeDiv.classList.remove("o");

    winnerPlayerSpan.textContent = "";
    winnerComboValSpan.textContent = "";
    winnerComboExtraPointsSpan.textContent = "";

    // Remove button event listener
    nextRoundBtn.removeEventListener("click", startRoundDOM);
    endGameAfterRoundBtn.removeEventListener("click", endGameAfterRound);
  };

  const setWinRoundOutcomeDiv = function (
    winnerPlayerName,
    winnerPlayerValue,
    winnerPlayerComboVal,
    assignedPoints
  ) {
    winnerPlayerSpan.textContent = winnerPlayerName;
    roundOutcomeDiv.classList.add(winnerPlayerValue);
    if (assignedPoints > 1) {
      winnerComboValSpan.textContent = winnerPlayerComboVal;
      winnerComboExtraPointsSpan.textContent = assignedPoints;
      roundOutcomeDiv.classList.add("extra");
    }
    roundOutcomeDiv.classList.add("win");

    // Add button event listener to select what to do next
    nextRoundBtn.addEventListener("click", startRoundDOM);
    endGameAfterRoundBtn.addEventListener("click", endGameAfterRound);
  };

  const setTieRoundOutcomeDiv = function () {
    roundOutcomeDiv.classList.add("tie");

    // Add button event listener to select what to do next
    nextRoundBtn.addEventListener("click", startRoundDOM);
    endGameAfterRoundBtn.addEventListener("click", endGameAfterRound);
  };

  const highlightWinningCells = function (winningCells) {
    winningCells.forEach((line) => {
      line.forEach((cell) => {
        addClassToCellDOM(cell, "winning-cell");
      });
    });
  };

  const setPlayerInfoScore = function (player) {
    const playerValue = player.getPlayerValue();
    const playerScore = player.getPlayerScore();
    playerInfoScore[playerValue].textContent = playerScore;
  };

  const setAllPlayersInfoScore = function () {
    game.getPlayers().forEach((player) => {
      setPlayerInfoScore(player);
    });
  };

  const setPlayerInfoCurrentPlayer = function () {
    const currentPlayerValue = game.getCurrentPlayer().getPlayerValue();
    game.getPlayers().forEach((player) => {
      const playerValue = player.getPlayerValue();
      playerInfoDiv[playerValue].classList.toggle(
        "current-player",
        playerValue === currentPlayerValue
      );
    });
  };

  const resetPlayerInfoCurrentPlayer = function () {
    game.getPlayers().forEach((player) => {
      const playerValue = player.getPlayerValue();
      playerInfoDiv[playerValue].classList.toggle("current-player", 0);
    });
  };

  /* tie / win handler */
  const roundWinHandler = function () {
    // Get the winner info
    const winner = game.getRoundWinnerPlayer();

    const winnerPlayer = winner.getPlayer();
    const winnerPlayerName = winnerPlayer.getPlayerName();
    const winnerPlayerValue = winnerPlayer.getPlayerValue();
    const assignedPoints = winner.getAssignedPoints();
    const winningCells = winner.getWinningCells();

    // Highlight winning cells
    highlightWinningCells(winningCells);

    // Show the round outcome
    setWinRoundOutcomeDiv(
      winnerPlayerName,
      winnerPlayerValue,
      winningCells.length,
      assignedPoints
    );

    // Change the winner player score
    setPlayerInfoScore(winnerPlayer);
  };
  const roundTieHandler = function () {
    // Show the round outcome
    setTieRoundOutcomeDiv();
  };

  // Start game / round

  const startGameDOM = function () {
    // Create a new game
    game = gameController(
      gameboardSize,
      playersName,
      playersIsHuman,
      AISkillLevel,
      extendedMode,
      gameboardWinLen
    );

    // Initialize players score on playerInfoDiv
    setAllPlayersInfoScore();

    // Start the round
    startRoundDOM();
  };

  // Temporary fix to disable context menu to appear on prolonged touch or right-mouse click
  // https://stackoverflow.com/questions/36668147/disable-mobile-longpress-context-menu-on-specific-elements?noredirect=1&lq=1
  // (See below, on gameboardDiv.addEventListener('contextmenu',...))
  const contextMenuCallback = function (e) {
    //console.log('CONTEXTMENU',e.target.classList[0])
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.target.click(); /* Simulate click to play the move */
  };

  const startRoundDOM = function () {
    game.initRound();
    initGameboardDOM();

    // Reset the game outcome info
    resetRoundOutcomeDiv();

    // Add event listener to the click events on the gameboard
    gameboardDiv.addEventListener("click", playMoveDOM);

    // Temporary fix to disable context menu to appear on prolonged touch or right-mouse click
    // https://stackoverflow.com/questions/36668147/disable-mobile-longpress-context-menu-on-specific-elements?noredirect=1&lq=1
    gameboardDiv.addEventListener("contextmenu", contextMenuCallback, true);

    nextMoveDOM();
  };

  const nextMoveDOM = function () {
    // Highlight the current player info div
    setPlayerInfoCurrentPlayer();

    if (!game.getCurrentPlayer().isHuman()) {
      const start = performance.now();
      game.getAIMove().then((cellToMove) => {
        const elapsed = performance.now() - start;
        const waitFor = Math.max(AIMoveDelayMs - elapsed, 0);
        console.log(
          `AI next move: ${cellToMove} (elaphsed: ${elapsed} ms, wait for ${waitFor} ms)`
        );
        setTimeout(
          playMoveDOM, //function
          waitFor, // artificial delay
          { target: gameboardDiv.childNodes[cellToMove] } // arguments of function
        );
      });
    }
    // else: wait for player click on cell, after which playMoveDOM callback is called
  };

  const endRoundDOM = function (moveOutcome) {
    resetPlayerInfoCurrentPlayer();

    if (moveOutcome == 1) {
      // The current player wins
      roundWinHandler();
    } else if (moveOutcome == 2) {
      // The game finishes with a tie
      roundTieHandler();
    }
    // Remove event listener
    gameboardDiv.removeEventListener("click", playMoveDOM);
    gameboardDiv.removeEventListener("contextmenu", contextMenuCallback, true);
  };

  const playMoveDOM = function (e) {
    // NOTE: the gameboard structure is:
    //       gameboard > cell-clickable-area > cell
    //       gameboard has an event listener, but because of bubbling,
    //       elem is the top element present that capture the click
    //       cell-clickable-area has  a fixed size, while cell might get transformed

    let elem = e.target;

    // If elem is a cell, play the move on that cell
    if (!elem.classList.contains("cell")) {
      // Otherwise, a cell might still have been selected
      // Check if the clicking point is in the cell-clickable-area
      // This happens, eg, if cell is scaled down
      if (elem.classList.contains("cell-clickable-area"))
        elem = elem.firstChild; // .cell
      else return;
    }

    // Get the cell row and column
    const row = elem.varRow;
    const column = elem.varColumn;

    // Get the current player
    const currentPlayerValue = game.getCurrentPlayer().getPlayerValue();

    // Try to do the move
    const moveOutcome = game.playMove(row, column);

    // Unmark a cell (this depends on the modality of the game: this happens in extended mode)
    const cellToUnmark = game.getCellToUnmark();
    if (cellToUnmark) {
      removeClassFromCellDOM(cellToUnmark, currentPlayerValue);
    }

    // Invalid move: ignore it
    if (moveOutcome < 0) return;

    // Mark the cell with the player mark
    elem.classList.add(currentPlayerValue);

    // Possibly end the round
    if (moveOutcome > 0) {
      endRoundDOM(moveOutcome);
    } else {
      nextMoveDOM();
    }
  };

  /* Start / end game -- toggling between settings and playing view */
  const getPlayersNamesFromSettings = function () {
    for (const sym in playerNameInput) {
      const playerValue = playerNameInput[sym].value;
      playersName[sym] =
        playerValue.length > 0 ? playerValue : playerNameInput[sym].placeholder;
      playerInfoName[sym].textContent = playersName[sym];
    }
  };

  const AIplayerNames = [
    "Novice AI",
    "Beginner AI",
    "Intermediate AI",
    "Proficient AI",
    "Advanced AI",
    "Expert AI",
    "Master AI",
  ];
  const setAIplayerName = function () {
    // Check whether player O is human or AI
    const numOfPlayers =
      DOMUtilities.getCheckedRadioValueAmongDescendants(numOfPlayersInput);
    const oIsAiPlayer = numOfPlayers == 1;
    const AISkillLevel = parseInt(AISkillLevelInput.value);
    playerNameInput.o.disabled = oIsAiPlayer;
    AISkillLevelInput.disabled = !oIsAiPlayer;
    playerNameInput.o.value = oIsAiPlayer ? AIplayerNames[AISkillLevel] : "";
  };
  const getHumanPlayersFromSettings = function () {
    // Check whether player O is human or AI
    const numOfPlayers =
      DOMUtilities.getCheckedRadioValueAmongDescendants(numOfPlayersInput);
    if (numOfPlayers == 1) {
      playersIsHuman = { x: true, o: false };
    } else {
      playersIsHuman = { x: true, o: true };
    }
    for (const sym in playerInfoDiv) {
      playerInfoDiv[sym].classList.toggle("ai", !playersIsHuman[sym]);
    }
  };
  const getAISkillLevelFromSettings = function () {
    // Check whether player O is human or AI
    const numOfPlayers =
      DOMUtilities.getCheckedRadioValueAmongDescendants(numOfPlayersInput);
    if (numOfPlayers == 1) {
      AISkillLevel = { x: null, o: parseInt(AISkillLevelInput.value) };
    } else {
      AISkillLevel = { x: null, o: null };
    }
  };

  const getGameboardSizeFromSettings = function () {
    gameboardSize = parseInt(
      DOMUtilities.getCheckedRadioValueAmongDescendants(gameboardSizeInput)
    );
    document.documentElement.style.setProperty(
      "--gameboard-size",
      gameboardSize
    );
  };
  const getExtendedModeFromSettings = function () {
    extendedMode = parseInt(
      DOMUtilities.getCheckedRadioValueAmongDescendants(extendedModeInput)
    );
  };
  const getGameboardWinLen = function () {
    gameboardWinLen = Math.min(gameboardSize, 4);
  };

  const showInfoDiv = function () {
    mainDiv.classList.toggle("info-on", true);
    backBtn.addEventListener("click", hideInfoDiv);
    infoBtn.removeEventListener("click", showInfoDiv);
  };
  const hideInfoDiv = function () {
    mainDiv.classList.toggle("info-on", false);
    backBtn.removeEventListener("click", hideInfoDiv);
    infoBtn.addEventListener("click", showInfoDiv);
  };

  const adaptSizeBasedOnPlayerNames = function () {
    DOMUtilities.fitFontSize(playerInfoName.x, playerNamesFontSize, 0.9);
    DOMUtilities.fitFontSize(playerInfoName.o, playerNamesFontSize, 0.9);
    DOMUtilities.fitFontSize(roundOutcomeTextDiv, roundOutcomeFontSize, 0.9);
  };

  const startNewGame = function () {
    startNewGameBtn.removeEventListener("click", startNewGame);
    numOfPlayersInputRadioBtns.forEach((input) =>
      input.removeEventListener("change", setAIplayerName)
    );
    AISkillLevelInput.removeEventListener("input", setAIplayerName);
    infoBtn.removeEventListener("click", showInfoDiv);
    backBtn.addEventListener("click", endGameAfterRound);
    mainDiv.classList.toggle("game-on", true);

    getPlayersNamesFromSettings();
    getHumanPlayersFromSettings();
    getAISkillLevelFromSettings();
    getGameboardSizeFromSettings();
    getGameboardWinLen();
    getExtendedModeFromSettings();

    startGameDOM();
  };

  const endGame = function () {
    infoBtn.addEventListener("click", showInfoDiv);
    backBtn.removeEventListener("click", endGameAfterRound);
    startNewGameBtn.addEventListener("click", startNewGame);
    numOfPlayersInputRadioBtns.forEach((input) =>
      input.addEventListener("change", setAIplayerName)
    );
    AISkillLevelInput.addEventListener("input", setAIplayerName);
    mainDiv.classList.toggle("game-on", false);
  };

  const endGameAfterRound = function () {
    resetRoundOutcomeDiv();
    endGame();
  };

  function setGameboardSizeDOM(entry) {
    // Resize observer callback: there is only one entry here
    //let sizes = gameboardCntDiv.getBoundingClientRect();
    const sizes = entry[0].contentRect;
    gameboardDiv.classList.toggle(
      "larger-width-than-height",
      sizes.width >= sizes.height
    );
    adaptSizeBasedOnPlayerNames();
  }

  // Initailize a new game immediately
  (function init() {
    // Resize observer, to adapt the gameboard size
    // see https://web.dev/articles/resize-observer
    gameboardResizeObserver.observe(gameboardCntDiv);

    // Initialize the DOM
    resetRoundOutcomeDiv();
    setAIplayerName();

    startNewGameBtn.addEventListener("click", startNewGame);
    infoBtn.addEventListener("click", showInfoDiv);
    numOfPlayersInputRadioBtns.forEach((input) =>
      input.addEventListener("change", setAIplayerName)
    );
    AISkillLevelInput.addEventListener("input", setAIplayerName);
  })();
})();
