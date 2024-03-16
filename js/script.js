// cell values: 0: no mark, 1: player 1 mark, 2: player 2 mark, OR: [' ','X','O'];

// This factory function handles the gameboard functionality
function createGameboard(size, playersValues,emptyCellValue=''){
    let gameboard = [];
    let numberOfEmptyCells = size*size;

    // Create the empty gameboard
    for (let r=0; r<size; r++){
        // Add a row
        gameboard.push([]);
        for (let c=0; c<size; c++){
            // Add cells to row
            gameboard[r].push(createCell(r,c,r*size+c, [emptyCellValue,...playersValues],emptyCellValue));
        }
    }

    const resetGameboard = function(){
        numberOfEmptyCells = size*size;
        gameboard.forEach(row => {row.map(cell => cell.resetValue());});
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
                    str += cell.getValue();
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
                gameboard[row][column].getValue() === emptyCellValue;
    }; 

    const makeMove = function(row,column,currentPlayer){
        // returns true if the move is performed, false otherwise
        if (!_isMoveAllowed(row,column)){
            console.log(`Gameboard:makeMove. Setting cell (${row},${column}) to "${currentPlayer}" not allowed`);
            return false;
        }

        //console.log(`Gameboard:makeMove. Marking cell (${row},${column}) by user ${currentPlayer}`);
        gameboard[row][column].setValue(currentPlayer);
        numberOfEmptyCells--;

        return true;
    };

    /* Game finished methods */
    const _checkEqualValidCellsInLine = function(array){
        let firstValue = array[0].getValue();
        return firstValue != emptyCellValue
               && array.every(itm => itm.getValue()===firstValue);
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
// By default, it is a binary cell, but you can allow multiple values
// By default, it is initialized the first allowed value, but a different initialization value can be provided
function createCell(row, column, id, allowedValues = [0,1], initialValue=undefined){
    initialValue = allowedValues.includes(initialValue) ? initialValue : allowedValues[0]; 
    let value = initialValue;

    const getValue = function(){
        return value;
    };

    const setValue = function(val){
        if (!allowedValues.includes(val)){
            console.log(`Cell:setValue. Value ${val} not allowed. Allowed values are: {${allowedValues}}`);
            return;
        }
        value = val;
    };

    const resetValue = function(val){
        value = initialValue;
    };

    const getRow = function(){
        return row;
    };

    const getColumn = function(){
        return column;
    };

    const getId = function(){
        return id;
    };

    return {getValue, setValue, resetValue, getRow, getColumn, getId};
}

// This factory function handles the player functionality
function createPlayer(id, name, value){  
    let score = 0;
    
    /* Get info */
    const getId = function(){
        return id;
    };

    const getName = function(){
        return name;
    };

    const getValue = function(){
        return value;
    };

    /* Edit score */
    const getScore = function(){
        return score;
    };
    const resetScore = function(){
        score = 0;
    };
    const incrementScoreBy = function(amount=1){
        score += amount;
    };

    return {getId, getName, getValue, getScore, resetScore, incrementScoreBy};
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

    const gameboard = createGameboard(size,players.map(player => player.getValue()),emptyCellValue);

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
        if (players[0].getScore() > players[1].getScore())
            return players[0];
        else if (players[0].getScore() < players[1].getScore())
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
        if(!gameboard.makeMove(row,column,getCurrentPlayer().getValue()))
            return 0; // continue game

        // check if a user has won
        let equalLines = gameboard.getArrayOfLinesOfEqualCells();
        if (equalLines.length){
            console.log(equalLines[0][0].getValue());
            roundWinner = createRoundWinner(players[0], equalLines.length, equalLines)
            // players [0] is a placeholder -- this is to fix. The gameboard has no info on the index of the user--> better to store the pointer to the userrather than its value (todo)

            // Increment Player points
            roundWinner.getPlayer().incrementScoreBy(roundWinner.getAssignedPoints());
            return 1;  // games ends with a winner
        }

        // check if the gameboard is full
        if (gameboard.noEmptyCells()){
            return -1; // games ends with a tie
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
            console.log(`${getCurrentPlayer().getName()}'s turn [${getCurrentPlayer().getValue()}].`);
            let input = prompt(`${getCurrentPlayer().getName()}'s turn [${getCurrentPlayer().getValue()}].\n\nInsert the selected cell index as "row,column:"\n(recall that row and column indices starts from 0)`);
            [row,column] = input.split(',').map(itm => parseInt(itm.trim()));

            // Perform the move
            let gameOutcome = playMove(row,column); // 0: the round continues, 1: a player wins, -1: it's a tie

            // Possibly end the round
            if (gameOutcome){ // games ends
                gameboard.printGameboard();

                if (gameOutcome==1){ // there is a winner
                    let assignedPoints = roundWinner.getAssignedPoints(); 
                    console.log(`${roundWinner.getPlayer().getName()} wins this round${assignedPoints>1 ? ` with a ${assignedPoints}x combo, getting ${assignedPoints-1} extra point${assignedPoints>2?'s':''}!` : '.'}`);
                } else{ // -1, tie
                    console.log(`It's a tie! No winner in this round...`);
                }
                break;
            }
        }
    };

    const playConsoleGame = function(){
        console.log(`Welcome to tic-tac-toe\n`);
        console.log(`${players[0].getName()} VS ${players[1].getName()}`);

        while(true){
            _playConsoleRound();

            // Print player status
            console.log(`${players[0].getName()}: ${players[0].getScore()}\n${players[1].getName()}: ${players[1].getScore()}\n`);

            // Ask if the user wants to end the game
            if(prompt(`Press 'ENTER' to continue. Type 'stop' to end the game.`).toLowerCase()=='stop')
                break;
        }

        roundWinner = undefined; // clear the round winner
        console.log(`Game ended!\n`);

        // Print the final game result
        let gameWinnerPlayer = getGameWinnerPlayer();
        if (gameWinnerPlayer)
            console.log(`${gameWinnerPlayer.getName()} WINS!`);
        else
            console.log(`No winner! It's a tie.`);
    };

    playConsoleGame();
    
    return {getCurrentPlayer, initRound, playMove, playConsoleGame, getGameWinnerPlayer};

}

let game = gameController(3,'Alice','Bob');


// This factory function handles the display of the game in the DOM --> IIFE (module pattern), as we need a single instance
const dispalyController = (function() {
    // todo
})();












/* Other temporary functions that might be useful: possibly put them in modules */

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeDescendants(elem){
    while (elem.hasChildNodes()) {
        removeDescendants(elem.lastChild)
        elem.removeChild(elem.lastChild);
    }
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

