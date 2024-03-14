// cell values: 0: no mark, 1: player 1 mark, 2: player 2 mark, OR: [' ','X','O'];

// This factory function handles the gameboard functionality
function createGameboard(size, allowedCellValues){
    let gameboard = [];
    let emptyCell = allowedCellValues[0];
    let currentPlayer = allowedCellValues[1];


    for (let r=0; r<size; r++){
        // Add a row
        gameboard.push([]);
        for (let c=0; c<size; c++){
            gameboard[r].push(createCell(allowedCellValues,emptyCell));
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

    const isMoveAllowed = function(row,column){
        return  0 <= row && row < size &&
                0 <= column && column < size &&
                gameboard[row][column].getValue() === emptyCell;
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


    return {makeMove, printGameboard};
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
gameboard.makeMove(2,3);
gameboard.printGameboard();

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

// TEST
// let cell = createCell([0,1,4,5]);
// console.log(cell.getValue());
// cell.setValue(4);
// console.log(cell.getValue());
// cell.setValue(3); // not a valid value
// let cell2 = createCell([0,1,4,5],1);
// console.log(cell2.getValue());
// let cell3 = createCell([0,1,4,5],3);
// console.log(cell3.getValue());

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

