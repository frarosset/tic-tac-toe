// cell values: 0: no mark, 1: player 1 mark, 2: player 2 mark

// This factory function handles the gameboard functionality
function createGameboard(size){
    /* todo */
}

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

