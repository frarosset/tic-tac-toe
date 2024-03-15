// cell values: 0: no mark, 1: player 1 mark, 2: player 2 mark, OR: [' ','X','O'];

// This factory function handles the gameboard functionality
function createGameboard(size, allowedCellValues){
    let gameboard = [];
    const emptyCellValue = allowedCellValues[0];
    let currentPlayer = allowedCellValues[1];

    // Create the empty gameboard
    for (let r=0; r<size; r++){
        // Add a row
        gameboard.push([]);
        for (let c=0; c<size; c++){
            // Add cells to row
            gameboard[r].push(createCell(allowedCellValues,emptyCellValue));
        }
    }

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
    }

    /* Extract info */
    const _getRowCells = function(row){
        return gameboard[row];
    }

    const _getColumnCells = function(column){
        return gameboard.map((itm,idx) => itm[column]);
    }

    const _getMainDiagonalCells = function(){
        return gameboard.map((itm,idx) => itm[idx]);
    }

    const _getAntiDiagonalCells = function(){
        return gameboard.map((itm,idx) => itm[size-idx-1]);
    }

    /* Move methods */
    const isMoveAllowed = function(row,column){
        return  0 <= row && row < size &&
                0 <= column && column < size &&
                gameboard[row][column].getValue() === emptyCellValue;
    } 

    const makeMove = function(row,column){
        // returns true if the move is performed, false otherwise
        if (!isMoveAllowed(row,column)){
            console.log(`Gameboard:makeMove. Move marking cell (${row},${column}) by user ${currentPlayer} not allowed`);
            return false;
        }

        //console.log(`Gameboard:makeMove. Marking cell (${row},${column}) by user ${currentPlayer}`);
        gameboard[row][column].setValue(currentPlayer);
        return true;
    }

    /* Winner methods */
    const _checkEqualValidCellsInLine = function(array){
        let firstValue = array[0].getValue();
        return firstValue != emptyCellValue
               && array.every(itm => itm.getValue()===firstValue);
    }

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
    }

    return {makeMove, printGameboard,getArrayOfLinesOfEqualCells};
}

let gameboard = createGameboard(3,[' ','x','o']);
gameboard.printGameboard();
gameboard.makeMove(1,2);
gameboard.printGameboard();
gameboard.makeMove(2,2);
gameboard.printGameboard();
gameboard.makeMove(-1,2);
gameboard.printGameboard();
gameboard.makeMove(2,2);
gameboard.printGameboard();
gameboard.makeMove(2,2);
gameboard.printGameboard();
gameboard.makeMove(2,1);
gameboard.makeMove(2,0);
gameboard.printGameboard();
gameboard.getArrayOfLinesOfEqualCells().map(line =>{console.log(line.map(cell => cell.getValue()));});
gameboard.makeMove(1,1);
gameboard.makeMove(0,2);
gameboard.printGameboard();
gameboard.getArrayOfLinesOfEqualCells().map(line =>{console.log(line.map(cell => cell.getValue()));});

// This factory function handles the gameboard's cell functionality
// By default, it is a binary cell, but you can allow multiple values
// By default, it is initialized the first allowed value, but a different initialization value can be provided
function createCell(allowedValues = [0,1], val=undefined){
    let value = allowedValues.includes(val) ? val : allowedValues[0]; 

    let getValue = function(){
        return value;
    }

    let setValue = function(val){
        if (!allowedValues.includes(val)){
            console.log(`Cell:setValue. Value ${val} not allowed. Allowed values are: {${allowedValues}}`);
            return;
        }
        value = val;
    }

    return {getValue, setValue};
}

// This factory function handles the player functionality
function createPlayer(name){
    // todo
}

// This factory function handles the flow of the game
function gameController() {
    // todo
}

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

