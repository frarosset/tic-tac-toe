const DOMUtilities = (function(){
    const removeDescendants = function(elem){
        while (elem.hasChildNodes()) {
            removeDescendants(elem.lastChild)
            elem.removeChild(elem.lastChild);
        }
    }

    return {removeDescendants};
})();

// This factory function handles the gameboard functionality
function createGameboard(size, emptyCellValue=''){
    let gameboard = [];
    let numberOfEmptyCells = size*size;

    // Create the empty gameboard
    for (let r=0; r<size; r++){
        // Add a row
        gameboard.push([]);
        for (let c=0; c<size; c++){
            // Add cells to row
            gameboard[r].push(createCell(r,c,r*size+c, emptyCellValue));
        }
    }

    const resetGameboard = function(){
        numberOfEmptyCells = size*size;
        gameboard.forEach(row => {row.map(cell => cell.resetCellPlayer());});
    };

    const printGameboard = function(){
        let verticalLine = ' | ';
        let horizontalLine = '-'.repeat(size + (size-1)*verticalLine.length) + '\n';
        let str = "";

        gameboard.forEach((row,idx) => {
            if (idx>0)
               str += horizontalLine;
            row.forEach((cell,idx) => {
                if (idx>0)
                    str += verticalLine;
                    str += cell.getCellValue();
            });
            str += '\n';
        });
        console.log(str);
    };

    /* Extract info */
    const _getRowCells = function(row){
        return gameboard[row];
    };

    const _getColumnCells = function(column){
        return gameboard.map((itm,idx) => itm[column]);
    };

    const _getMainDiagonalCells = function(){
        return gameboard.map((itm,idx) => itm[idx]);
    };

    const _getAntiDiagonalCells = function(){
        return gameboard.map((itm,idx) => itm[size-idx-1]);
    }

    /* Move methods */
    const _isMoveAllowed = function(row,column){
        return  0 <= row && row < size &&
                0 <= column && column < size &&
                gameboard[row][column].getCellValue() === emptyCellValue;
    }; 

    const makeMove = function(row,column,currentPlayer){
        // returns true if the move is performed, false otherwise
        if (!_isMoveAllowed(row,column)){
            console.log(`Gameboard:makeMove. Setting cell (${row},${column}) to "${currentPlayer.getPlayerName()}" not allowed`);
            return false;
        }

        //console.log(`Gameboard:makeMove. Marking cell (${row},${column}) by user ${currentPlayer}`);
        gameboard[row][column].setCellPlayer(currentPlayer);
        numberOfEmptyCells--;

        return true;
    };

    /* Game finished methods */
    const _checkEqualValidCellsInLine = function(array){
        let firstValue = array[0].getCellValue();
        return firstValue != emptyCellValue
               && array.every(itm => itm.getCellValue()===firstValue);
    };

    const getArrayOfLinesOfEqualCells = function(){
        let linesOfEqualCells = [];
               
        // Check a winner in the rows: only one can be winning!
        for (let row=0; row<size; row++){
            let rowArray = _getRowCells(row);
            if (_checkEqualValidCellsInLine(rowArray)){
                console.log('R'+row);
                linesOfEqualCells.push(rowArray);
                break;
            }
        }

        // Check a winner in the columns: only one can be winning!
        for (let column=0; column<size; column++){        
            let colArray = _getColumnCells(column);
            if (_checkEqualValidCellsInLine(colArray)){
                console.log('C'+column);
                linesOfEqualCells.push(colArray);
                break;
            }
        }

        // Check a winner in the main diagonal
        {    
            let mainDiagArray = _getMainDiagonalCells();
            if (_checkEqualValidCellsInLine(mainDiagArray)){
                console.log('D');
                linesOfEqualCells.push(mainDiagArray);
            }
        }

        // Check a winner in the anti diagonal
        {    
            let antiDiagArray = _getAntiDiagonalCells();
            if (_checkEqualValidCellsInLine(antiDiagArray)){
                console.log('AD');
                linesOfEqualCells.push(antiDiagArray);
            }
        }

        return linesOfEqualCells;
    };

    const noEmptyCells = function(){
        return numberOfEmptyCells==0;
    }

    return {makeMove, resetGameboard, printGameboard,getArrayOfLinesOfEqualCells,noEmptyCells};
}

// This factory function handles the gameboard's cell functionality
// A player object reference can be assigned to the cell, which has a getPlayerValue() method
//    which gives the displayed symbol
// By default, no player is associated: the empty cell displayed value is given by the parameter emptyCellValue
function createCell(row, column, id, emptyCellValue=""){
    let player = null;

    const getCellValue = function(){
        if (player)
            return player.getPlayerValue();
        else
            return emptyCellValue;
    };

    const getCellPlayer = function(){
        return player;
    };

    const setCellPlayer = function(playerToSet){
        player = playerToSet;
    };

    const resetCellPlayer = function(){
        player = null;
    };

    const getCellRow = function(){
        return row;
    };

    const getCellColumn = function(){
        return column;
    };

    const getCellId = function(){
        return id;
    };

    return {getCellValue, getCellPlayer, setCellPlayer, resetCellPlayer, getCellRow, getCellColumn, getCellId};
}

// This factory function handles the player functionality
function createPlayer(id, name, value){  
    let score = 0;
    
    /* Get info */
    const getPlayerId = function(){
        return id;
    };

    const getPlayerName = function(){
        return name;
    };

    const getPlayerValue = function(){
        return value;
    };

    /* Edit score */
    const getPlayerScore = function(){
        return score;
    };
    const resetPlayerScore = function(){
        score = 0;
    };
    const incrementPlayerScoreBy = function(amount=1){
        score += amount;
    };

    return {getPlayerId, getPlayerName, getPlayerValue, getPlayerScore, resetPlayerScore, incrementPlayerScoreBy};
}

function createRoundWinner(player, assignedPoints, winningCells){
    // Game / win status
    const getPlayer = function(){
        return player;
    }

    const getAssignedPoints = function(){
        return assignedPoints;
    }

    const getWinningCells = function(){
        return winningCells;
    }

    return {getPlayer, getAssignedPoints, getWinningCells};
}

// This factory function handles the flow of the game
function gameController(size,player1Name='Player 1', player2Name='Player 2') {

    const emptyCellValue = " ";

    // Create players
    const players = [createPlayer(0,player1Name,'x'), createPlayer(1,player2Name,'o')];
    let currentPlayerIdx = 0;

    let roundWinner;

    const gameboard = createGameboard(size,emptyCellValue);

    // Player functions
    const getCurrentPlayer = function(){
        return players[currentPlayerIdx];
    }
    const _changeCurrentPlayer = function(){
        currentPlayerIdx = (currentPlayerIdx+1) % players.length;
    }

    const getRoundWinnerPlayer = function(){
        return roundWinner;
    }

    const getGameWinnerPlayer = function(){
        if (players[0].getPlayerScore() > players[1].getPlayerScore())
            return players[0];
        else if (players[0].getPlayerScore() < players[1].getPlayerScore())
            return players[1];
        else // no winner
            return null;
    }

    // Play functions
    const initRound = function(){
        roundWinner = undefined;
        gameboard.resetGameboard();
    }

    const playMove = function(row, column){ 
        // try to make the move
        if(!gameboard.makeMove(row,column,getCurrentPlayer()))
            return -1; // continue game, invalid move

        // check if a user has won
        let equalLines = gameboard.getArrayOfLinesOfEqualCells();
        if (equalLines.length){
            roundWinner = createRoundWinner(equalLines[0][0].getCellPlayer(), equalLines.length, equalLines);

            // Increment Player points
            roundWinner.getPlayer().incrementPlayerScoreBy(roundWinner.getAssignedPoints());
            return 1;  // games ends with a winner
        }

        // check if the gameboard is full
        if (gameboard.noEmptyCells()){
            return 2; // games ends with a tie
        }

        // change player
        _changeCurrentPlayer();
        return 0; // continue game
    };

    // Play in console
    const _playConsoleRound = function(){
        console.log('Starting a new round...');

        initRound();

        while (true){
            // Get info on the move to perform
            gameboard.printGameboard();
            let currentPlayerName = getCurrentPlayer().getPlayerName();
            let currentPlayerValue = getCurrentPlayer().getPlayerValue();
            console.log(`${currentPlayerName}'s turn [${currentPlayerValue}].`);
            let input = prompt(`${currentPlayerName}'s turn [${currentPlayerValue}].\n\nInsert the selected cell index as "row,column:"\n(recall that row and column indices starts from 0)`);
            [row,column] = input.split(',').map(itm => parseInt(itm.trim()));

            // Perform the move
            let moveOutcome = playMove(row,column); // 0,-1: the round continues, 1: a player wins, 2: it's a tie

            // Possibly end the round
            if (moveOutcome>0){ // games ends
                gameboard.printGameboard();

                if (moveOutcome==1){ // there is a winner
                    let assignedPoints = roundWinner.getAssignedPoints(); 
                    console.log(`${roundWinner.getPlayer().getPlayerName()} wins this round${assignedPoints>1 ? ` with a ${assignedPoints}x combo, getting ${assignedPoints-1} extra point${assignedPoints>2?'s':''}!` : '.'}`);
                } else{ // 2, tie
                    console.log(`It's a tie! No winner in this round...`);
                }
                break;
            }
        }
    };

    const playConsoleGame = function(){
        console.log(`Welcome to tic-tac-toe\n`);
        console.log(`${players[0].getPlayerName()} VS ${players[1].getPlayerName()}`);

        while(true){
            _playConsoleRound();

            // Print player status
            console.log(`${players[0].getPlayerName()}: ${players[0].getPlayerScore()}\n${players[1].getPlayerName()}: ${players[1].getPlayerScore()}\n`);

            // Ask if the user wants to end the game
            if(prompt(`Press 'ENTER' to continue. Type 'stop' to end the game.`).toLowerCase()=='stop')
                break;
        }

        roundWinner = undefined; // clear the round winner
        console.log(`Game ended!\n`);

        // Print the final game result
        let gameWinnerPlayer = getGameWinnerPlayer();
        if (gameWinnerPlayer)
            console.log(`${gameWinnerPlayer.getPlayerName()} WINS!`);
        else
            console.log(`No winner! It's a tie.`);
    };

    // playConsoleGame();
    
    return {getCurrentPlayer, initRound, playMove, playConsoleGame, getGameWinnerPlayer, getRoundWinnerPlayer};

}

// This factory function handles the display of the game in the DOM --> IIFE (module pattern), as we need a single instance
const dispalyController = (function() {
    let gameboardSize = 3;
    let playerXName = 'Alice';
    let playerOName = 'Bob';
    let game = null;

    // DOM cache
    const gameboardDiv = document.querySelector('main .gameboard');
    const roundOutcomeDiv = document.querySelector('main .round-outcome-div');
    const winnerPlayerSpan = document.querySelector('main .winner-player');
    const winnerComboValSpan = document.querySelector('main .winner-combo-val'); 
    const winnerComboExtraPointsSpan = document.querySelector('main .winner-combo-extra-points'); 

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
    const initGameboardDOM = function(){
        // Reset the gameboard
        resetGameboardDOM();

        // Add the cells
        for (let r=0; r<gameboardSize; r++){
            for (let c=0; c<gameboardSize;c++){
                let cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add('icon-mask');

                if (r==0){
                    if (c==0){
                        cell.classList.add('cell-tl');
                    } else if (c==gameboardSize-1){
                        cell.classList.add('cell-tr');
                    } 
                } else if (r==gameboardSize-1){
                    if (c==0){
                        cell.classList.add('cell-bl');
                    } else if (c==gameboardSize-1){
                        cell.classList.add('cell-br');
                    } 
                } 

                // add row/col info
                cell.varRow = r;
                cell.varColumn = c;

                gameboardDiv.appendChild(cell);
            }
        }
    };

    const resetGameboardDOM = function(){
        DOMUtilities.removeDescendants(gameboardDiv);
    };

    // Player functions
    const playMoveDOM_callback = function(e){
        let elem = e.target;
        if (!elem.classList.contains('cell'))
            return;

        // Get the cell row and column
        let row = elem.varRow;
        let column = elem.varColumn;

        // Get the current player
        let currentPlayerValue = game.getCurrentPlayer().getPlayerValue();

        // Try to do the move
        let moveOutcome = game.playMove(row,column);

        // Invalid move: ignore it
        if (moveOutcome < 0)
            return;
        
        // Mark the cell with the player mark
        elem.classList.add(currentPlayerValue);

        // Possibly end the round
        if (moveOutcome>0){
            if (moveOutcome == 1){
                // The current player wins
                console.log('Someone wins')
                roundWinHandler();
            } else if (moveOutcome == 2){
                // The game finishes with a tie
                console.log('It\'s a tie')
                roundTieHandler();
            }    
            gameboardDiv.removeEventListener('click',playMoveDOM_callback);    
        }
    }

    /* Outcome div handler */
    const resetRoundOutcomeDiv = function(){
        roundOutcomeDiv.classList.remove('tie');
        roundOutcomeDiv.classList.remove('win');
        roundOutcomeDiv.classList.remove('extra');

        winnerPlayerSpan.textContent = "";
        winnerComboValSpan.textContent = ""; 
        winnerComboExtraPointsSpan.textContent = ""; 
    }

    /* tie / win handler */
    const roundWinHandler = function(){
        // Get the winner info
        let winner = game.getRoundWinnerPlayer();

        let winnerPlayerName  = winner.getPlayer().getPlayerName();
        let winnerPlayerValue = winner.getPlayer().getPlayerValue();
        let assignedPoints    = winner.getAssignedPoints();
        let winningCells      = winner.getWinningCells();

        // Show the round outcome
        winnerPlayerSpan.textContent = winnerPlayerName;
        roundOutcomeDiv.classList.add(winnerPlayerValue);
        if (assignedPoints>1){
            winnerComboValSpan.textContent = winningCells.length; 
            winnerComboExtraPointsSpan.textContent = assignedPoints; 
            roundOutcomeDiv.classList.add('extra');
        }
        roundOutcomeDiv.classList.add('win');
    }
    const roundTieHandler = function(){
        // Show the round outcome
        roundOutcomeDiv.classList.add('tie');
    }

    // Initailize a new game immediately
    // todo: start after selecting the right settings
    game = gameController(gameboardSize,playerXName,playerOName);
    initGameboardDOM();
    resetRoundOutcomeDiv();
    gameboardDiv.addEventListener('click',playMoveDOM_callback);

})();












/* Other temporary functions that might be useful: possibly put them in modules */

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



// from: https://stackoverflow.com/a/143889
// Determines if the passed element is overflowing its bounds,
// either vertically or horizontally.
// Will temporarily modify the "overflow" style to detect this
// if necessary.
function checkOverflow(el)
{
   let curOverflow = el.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   let isOverflowing = el.clientWidth < el.scrollWidth 
                    || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
}

// throttle function to avoid calling the actual callback continuously (eg, on resize or scroll)
// from: https://stackoverflow.com/questions/68751736/throttle-window-scroll-event-in-react-with-settimeout
function throttle (callbackFn, limit=100) {
    let wait = false;                  
    return function () {              
        if (!wait) {                  
            callbackFn.call();           
            wait = true;               
            setTimeout(function () {
                callbackFn.call();
                wait = false;          
            }, limit);
        }
    }
}

function fitFontSize(elem, defaultFontSize='',delta=0.9){
    // Initialize the fontSize, if the initial value is provided
    if (defaultFontSize)
        elem.style.fontSize = defaultFontSize;
    let fontSize = getComputedStyle(elem).getPropertyValue('font-size');

    let fontSizeVal,fontSizeUnit; 
    [fontSizeVal,fontSizeUnit] = splitCSSUnits(fontSize);

    while (checkOverflow(elem)){
        fontSizeVal *= delta;
        elem.style.fontSize = fontSizeVal + fontSizeUnit;
    }
}

function splitCSSUnits(CSSAttrVal){
    return [CSSAttrVal.match(/[\d.]+/)[0],CSSAttrVal.match(/[^\d.]+/)[0]];
}

