const DOMUtilities = (function(){
    const removeDescendants = function(elem){
        while (elem.hasChildNodes()) {
            removeDescendants(elem.lastChild)
            elem.removeChild(elem.lastChild);
        }
    };

    const getCheckedRadioValueAmongDescendants = function(ascendentElement){
        return ascendentElement.querySelector("input[type=radio]:checked").value;
    };

    return {removeDescendants,getCheckedRadioValueAmongDescendants};
})();

const commonUtilities = (function(){
    const randomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return {randomInt};
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
    };

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
            return null;
        }

        //console.log(`Gameboard:makeMove. Marking cell (${row},${column}) by user ${currentPlayer}`);
        gameboard[row][column].setCellPlayer(currentPlayer);
        numberOfEmptyCells--;

        return gameboard[row][column];
    };

    const deactivatedMove = function(row,column,currentPlayer){
        if (gameboard[row][column].getCellPlayer()==currentPlayer){
            gameboard[row][column].resetCellPlayer();
            numberOfEmptyCells++;
        }
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
                // console.log('R'+row);
                linesOfEqualCells.push(rowArray);
                break;
            }
        }

        // Check a winner in the columns: only one can be winning!
        for (let column=0; column<size; column++){        
            let colArray = _getColumnCells(column);
            if (_checkEqualValidCellsInLine(colArray)){
                // console.log('C'+column);
                linesOfEqualCells.push(colArray);
                break;
            }
        }

        // Check a winner in the main diagonal
        {    
            let mainDiagArray = _getMainDiagonalCells();
            if (_checkEqualValidCellsInLine(mainDiagArray)){
                // console.log('D');
                linesOfEqualCells.push(mainDiagArray);
            }
        }

        // Check a winner in the anti diagonal
        {    
            let antiDiagArray = _getAntiDiagonalCells();
            if (_checkEqualValidCellsInLine(antiDiagArray)){
                // console.log('AD');
                linesOfEqualCells.push(antiDiagArray);
            }
        }

        return linesOfEqualCells;
    };

    const noEmptyCells = function(){
        return numberOfEmptyCells==0;
    };

    return {makeMove, resetGameboard, printGameboard,getArrayOfLinesOfEqualCells,noEmptyCells,deactivatedMove};
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
    };

    const getAssignedPoints = function(){
        return assignedPoints;
    };

    const getWinningCells = function(){
        return winningCells;
    };

    return {getPlayer, getAssignedPoints, getWinningCells};
}

// This factory function handles the flow of the game
function gameController(size,player1Name='Player 1', player2Name='Player 2', extendedMode=false) {

    const emptyCellValue = " ";

    // Classic Mode: each player puts a mark, until a player wins or the gameboard is full
    // Extended Mode: each player puts AT MOST a number of marks equal to the size of the gameboard.
    // Eg, in a 3x3 board, you can put at most 3 marks per playerl
    // If a mark is set in a gameboard where there are already 'size' marks of the same type, the
    // one placed first is removed and a new one is put in another spot. Then, in the gameboard remain
    // only the most recents ones. To do this, we need to save the current activeCells (activeCells array).
    let activeCells;
    let deactivatedCell;
    // To cover both cases, you just need to check when the number of activeCells is equal to the maximum
    // allowed, and in that case, deactivate the cell in activeCells array that has been set first, ie, 
    // activeCells[0]
    // Classic mode: max size*size active cells including both players (ie, all of the cells)
    // Extended mode: at most 2*size active cells including both players
    let maxActiveCells = extendedMode ? 2*size : size*size;

    // Create players
    const players = [createPlayer(0,player1Name,'x'), createPlayer(1,player2Name,'o')];
    let currentPlayerIdx = 0;

    let roundWinner;

    const gameboard = createGameboard(size,emptyCellValue);

    // Player functions
    const getCurrentPlayer = function(){
        return players[currentPlayerIdx];
    };
    const getPlayers = function(){
        return players;
    };
    const _changeCurrentPlayer = function(){
        currentPlayerIdx = (currentPlayerIdx+1) % players.length;
    };

    const getRoundWinnerPlayer = function(){
        return roundWinner;
    };

    const getGameWinnerPlayer = function(){
        if (players[0].getPlayerScore() > players[1].getPlayerScore())
            return players[0];
        else if (players[0].getPlayerScore() < players[1].getPlayerScore())
            return players[1];
        else // no winner
            return null;
    };

    // Play functions
    const initRound = function(){
        roundWinner = undefined;
        currentPlayerIdx = commonUtilities.randomInt(0,1);
        activeCells = [];
        deactivatedCell=null;
        gameboard.resetGameboard();
    };

    // A function to get the cell that has been deactivated, to be used, eg, to update the DOM by the displayController
    const getDeactivatedCell = function(){
        return deactivatedCell;
    };

    const handleCellDeactivation = function(){
        if (activeCells.length == maxActiveCells){
            deactivatedCell = activeCells.shift();
            gameboard.deactivatedMove(deactivatedCell.getCellRow(),deactivatedCell.getCellColumn(),getCurrentPlayer());
        } else {
            deactivatedCell = null;
        }
    };

    const saveActivationCell = function(cell){
        activeCells.push(cell);
    };

    const playMove = function(row, column){
        // Check whether a cell must be deactivated and do it if possible
        handleCellDeactivation();

        // try to make the move
        let cell = gameboard.makeMove(row,column,getCurrentPlayer());
        if(!cell)
            return -1; // continue game, invalid move

        // Add the current cell  where a mark is set to the activeCells array
        saveActivationCell(cell);
        
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
    
    return {getCurrentPlayer, getPlayers,initRound, playMove, playConsoleGame, getGameWinnerPlayer, getRoundWinnerPlayer,getDeactivatedCell};

}

// This factory function handles the display of the game in the DOM --> IIFE (module pattern), as we need a single instance
const dispalyController = (function() {
    let gameboardSize = 3;
    let extendedMode = false;
    let playerName = {};
    let game = null;

    // DOM cache
    const startNewGameDiv = document.querySelector('main .start-new-game-div');
    const startNewGameBtn = document.querySelector('main .start-new-game-btn');
    const backBtn = document.querySelector('header .back-btn');

    const playerInfoDiv =   {x: document.querySelector('.player-info.x'),
                             o: document.querySelector('.player-info.o')};
    const playerInfoName = {x: playerInfoDiv.x.querySelector('.player-name'),
                             o: playerInfoDiv.o.querySelector('.player-name')};
    const playerInfoScore = {x: playerInfoDiv.x.querySelector('.player-score'),
                             o: playerInfoDiv.o.querySelector('.player-score')};
    const gameboardCntDiv = document.querySelector('main .gameboard-cnt');
    const gameboardDiv = gameboardCntDiv.querySelector('.gameboard');
    const roundOutcomeDiv = document.querySelector('main .round-outcome-div');
    const winnerPlayerSpan = roundOutcomeDiv.querySelector('main .winner-player');
    const winnerComboValSpan = roundOutcomeDiv.querySelector('main .winner-combo-val'); 
    const winnerComboExtraPointsSpan = roundOutcomeDiv.querySelector('main .winner-combo-extra-points'); 
    const nextRoundBtn = roundOutcomeDiv.querySelector('.next-round-btn');
    const endGameAfterRoundBtn = roundOutcomeDiv.querySelector('.end-game-btn'); 

    const playerNameInput = {x: startNewGameDiv.querySelector('#input-player-x-name'),
                             o: startNewGameDiv.querySelector('#input-player-o-name')};
    const gameboardSizeInput = startNewGameDiv.querySelector('#input-gameboard-size'); 
    const extendedModeInput = startNewGameDiv.querySelector('#input-gameboard-extended-mode');
    

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
    const initGameboardDOM = function(){
        // Reset the gameboard
        resetGameboardDOM();

        // Add the cells
        for (let r=0; r<gameboardSize; r++){
            for (let c=0; c<gameboardSize;c++){
                let cellClickableArea = document.createElement('div');
                cellClickableArea.classList.add('cell-clickable-area');

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

                cellClickableArea.appendChild(cell);
                gameboardDiv.appendChild(cellClickableArea);
            }
        }
    };

    const resetGameboardDOM = function(){
        DOMUtilities.removeDescendants(gameboardDiv);
    };

    const addClassToCellDOM = function(cell,className){
        gameboardDiv.childNodes[cell.getCellId()].firstChild.classList.add(className);
    };
    const removeClassFromCellDOM = function(cell,className){
        gameboardDiv.childNodes[cell.getCellId()].firstChild.classList.remove(className);
    };

    /* Outcome div handler */
    const resetRoundOutcomeDiv = function(){
        roundOutcomeDiv.classList.remove('tie');
        roundOutcomeDiv.classList.remove('win');
        roundOutcomeDiv.classList.remove('extra');
        roundOutcomeDiv.classList.remove('x');
        roundOutcomeDiv.classList.remove('o');

        winnerPlayerSpan.textContent = "";
        winnerComboValSpan.textContent = ""; 
        winnerComboExtraPointsSpan.textContent = ""; 

        // Remove button event listener
        nextRoundBtn.removeEventListener('click',startRoundDOM);
        endGameAfterRoundBtn.removeEventListener('click',endGameAfterRound);
    };

    const setWinRoundOutcomeDiv = function(winnerPlayerName,winnerPlayerValue,winnerPlayerComboVal,assignedPoints){
        winnerPlayerSpan.textContent = winnerPlayerName;
        roundOutcomeDiv.classList.add(winnerPlayerValue);
        if (assignedPoints>1){
            winnerComboValSpan.textContent = winnerPlayerComboVal; 
            winnerComboExtraPointsSpan.textContent = assignedPoints; 
            roundOutcomeDiv.classList.add('extra');
        }
        roundOutcomeDiv.classList.add('win'); 

        // Add button event listener to select what to do next
        nextRoundBtn.addEventListener('click',startRoundDOM);
        endGameAfterRoundBtn.addEventListener('click',endGameAfterRound);
    };

    const setTieRoundOutcomeDiv = function(){
        roundOutcomeDiv.classList.add('tie');

        // Add button event listener to select what to do next
        nextRoundBtn.addEventListener('click',startRoundDOM);
        endGameAfterRoundBtn.addEventListener('click',endGameAfterRound);
    };

    const highlightWinningCells = function(winningCells){
        winningCells.forEach(line => {
            line.forEach((cell) => {
                addClassToCellDOM(cell,'winning-cell');
            });
        });
    };

    const setPlayerInfoScore = function(player){
        let playerValue = player.getPlayerValue();
        let playerScore = player.getPlayerScore();
        playerInfoScore[playerValue].textContent = playerScore;
    };

    const setAllPlayersInfoScore = function(){
        game.getPlayers().forEach(player => {setPlayerInfoScore(player);});
    };

    const setPlayerInfoCurrentPlayer = function(){
        let currentPlayerValue = game.getCurrentPlayer().getPlayerValue();
        game.getPlayers().forEach(
            player => {
                let playerValue = player.getPlayerValue();
                playerInfoDiv[playerValue].classList.toggle('current-player',playerValue===currentPlayerValue)
            });
    };

    const resetPlayerInfoCurrentPlayer = function(){
        game.getPlayers().forEach(
            player => {
                let playerValue = player.getPlayerValue();
                playerInfoDiv[playerValue].classList.toggle('current-player',0)
            });
    };

    /* tie / win handler */
    const roundWinHandler = function(){
        // Get the winner info
        let winner = game.getRoundWinnerPlayer();

        let winnerPlayer = winner.getPlayer();
        let winnerPlayerName  = winnerPlayer.getPlayerName();
        let winnerPlayerValue = winnerPlayer.getPlayerValue();
        let assignedPoints    = winner.getAssignedPoints();
        let winningCells      = winner.getWinningCells();

        // Highlight winning cells
        highlightWinningCells(winningCells);

        // Show the round outcome
        setWinRoundOutcomeDiv(winnerPlayerName,winnerPlayerValue,winningCells.length,assignedPoints);
   
        // Change the winner player score
        setPlayerInfoScore(winnerPlayer);
    };
    const roundTieHandler = function(){
        // Show the round outcome
        setTieRoundOutcomeDiv();
    };

    // Start game / round

    const startGameDOM = function(){
        // Create a new game
        game = gameController(gameboardSize,playerName.x,playerName.o,extendedMode);

        // Initialize players score on playerInfoDiv
        setAllPlayersInfoScore();
        
        // Start the round
        startRoundDOM();
    };

    const startRoundDOM = function(){
        game.initRound();
        initGameboardDOM();

        // Reset the game outcome info
        resetRoundOutcomeDiv();

        // Highlight the current player info div
        setPlayerInfoCurrentPlayer();

        // Add event listener to the click events on the gameboard
        gameboardDiv.addEventListener('click',playMoveDOM);
    };

    const endRoundDOM = function(moveOutcome){
        if (moveOutcome == 1){
            // The current player wins
            roundWinHandler();
        } else if (moveOutcome == 2){
            // The game finishes with a tie
            roundTieHandler();
        } 
        // Remove event listener   
        gameboardDiv.removeEventListener('click',playMoveDOM); 
    };

    const playMoveDOM = function(e){
        // NOTE: the gameboard structure is:
        //       gameboard > cell-clickable-area > cell
        //       gameboard has an event listener, but because of bubbling, 
        //       elem is the top element present that capture the click
        //       cell-clickable-area has  a fixed size, while cell might get transformed

        let elem = e.target;

        // If elem is a cell, play the move on that cell
        if (!elem.classList.contains('cell')){
            // Otherwise, a cell might still have been selected
            // Check if the clicking point is in the cell-clickable-area
            // This happens, eg, if cell is scaled down
            if (elem.classList.contains('cell-clickable-area'))
                elem = elem.firstChild; // .cell
            else
                return;
        }

        // Get the cell row and column
        let row = elem.varRow;
        let column = elem.varColumn;

        // Get the current player
        let currentPlayerValue = game.getCurrentPlayer().getPlayerValue();

        // Try to do the move
        let moveOutcome = game.playMove(row,column);

        // Deactivated a cell (this depends on the modality of the game: this happens in extended mode)
        let deactivatedCell = game.getDeactivatedCell();
        if (deactivatedCell){
            removeClassFromCellDOM(deactivatedCell,currentPlayerValue);
        }

        // Invalid move: ignore it
        if (moveOutcome < 0)
            return;
        
        // Mark the cell with the player mark
        elem.classList.add(currentPlayerValue);

        // Possibly end the round
        if (moveOutcome>0){
            resetPlayerInfoCurrentPlayer();
            endRoundDOM(moveOutcome);
        }else{
            // Highlight the current player info div
            setPlayerInfoCurrentPlayer();
        }
    };

    const getPlayersNamesFromSettings = function(){
        for (sym in playerNameInput){
            let playerValue = playerNameInput[sym].value;
            playerName[sym] = playerValue.length>0? playerValue : playerNameInput[sym].placeholder;
            playerInfoName[sym].textContent = playerName[sym]
        }
    };
    const getGameboardSizeFromSettings = function(){
        gameboardSize = parseInt(DOMUtilities.getCheckedRadioValueAmongDescendants(gameboardSizeInput));
        document.documentElement.style.setProperty('--gameboard-size', gameboardSize);
    };
    const getExtendedModeFromSettings = function(){
        extendedMode = parseInt(DOMUtilities.getCheckedRadioValueAmongDescendants(extendedModeInput));
    };

    const startNewGame = function(){
        startNewGameBtn.removeEventListener('click',startNewGame);
        backBtn.addEventListener('click',endGameAfterRound);
        startNewGameDiv.classList.toggle('game-on',true);

        getPlayersNamesFromSettings();
        getGameboardSizeFromSettings();
        getExtendedModeFromSettings();

        startGameDOM();
    };

    const endGame = function(){
        backBtn.removeEventListener('click',endGameAfterRound);
        startNewGameBtn.addEventListener('click',startNewGame);
        startNewGameDiv.classList.toggle('game-on',false);
    };

    const endGameAfterRound = function(){
        resetRoundOutcomeDiv();
        endGame();
    };

    function setGameboardSizeDOM(entry){
        // Resize observer callback: there is only one entry here
        //let sizes = gameboardCntDiv.getBoundingClientRect();
        let sizes = entry[0].contentRect;
        gameboardDiv.classList.toggle('larger-width-than-height',sizes.width>=sizes.height);
    };

    // Initailize a new game immediately
    const init = (function(){
        // Resize observer, to adapt the gameboard size
        // see https://web.dev/articles/resize-observer
        gameboardResizeObserver.observe(gameboardCntDiv);

        // Initialize the DOM
        resetRoundOutcomeDiv();
        
        startNewGameBtn.addEventListener('click',startNewGame);     
    })();

})();







/* Other temporary functions that might be useful: possibly put them in modules */

/*
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
*/
