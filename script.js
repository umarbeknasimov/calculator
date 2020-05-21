// Recursive Abstract Datetype: Expression (used for parsing and evaluating expressions)
class Expression {
    //Expression = AddSub(left: Expression, right: Expression, type: String)
    //          + MultDiv(left: Expression, right: Expression, type: String)
    //          + ExpLog(base: Expression, expression: Expression, type: String)
    //          + Trig(expression: Expression, type: String)
    //          + Num(value: float) 
    constructor() {
    }

    /**
     * evaluate the expression
     * @return float evaluation
     */
    get evaluate() {
        return 0;
    }
}

class AddSub extends Expression {
    constructor(left, right, type) {
        super();
        this.left = left;
        this.right = right;
        this.type = type;
    }

    get evaluate() {
        return this.type == "add" ? this.left.evaluate + this.right.evaluate: this.left.evaluate - this.right.evaluate;
    }
}

class MultDiv extends Expression {
    constructor(left, right, type) {
        super();
        this.left = left;
        this.right = right;
        this.type = type;
    }
    get evaluate() {
        return this.type == "mult" ? this.left.evaluate * this.right.evaluate: this.left.evaluate / this.right.evaluate;
    }
}

class ExpLog extends Expression {
    constructor(base, expression, type) {
        super();
        this.base = base;
        this.expression = expression;
        this.type = type;
    }
    get evaluate() {
        console.log("in exp eval");
        return this.type == "exp"? Math.pow(this.base.evaluate, this.expression.evaluate): Math.log(this.expression.evaluate) / Math.log(this.base.evaluate);
    }
}

class Trig extends Expression {
    constructor(expression, type) {
        super();
        this.expression = expression;
        this.type = type;
    }
    get evaluate() {
        switch(this.type) {
            case 'sin': {
                return Math.sin(this.expression.evaluate * Math.PI / 180);
            }
            default: {
                throw new SyntaxError(`cannot evaluate trig function: ${this.type}`);
            }
        }
    }
}

class Num extends Expression {
    constructor(value) {
        super();
        this.value = value;
    } 
    
    get evaluate() {
        return this.value;
    }
}


// Token: used for tokenizing string expressions into tokens
class Token {
    /**
     * 
     * @param {String to be tested} char 
     * @return if char is an arithmetic operator
     */
    isOp(char) {
        const operators = ['+', '-', '*', '/'];
        return operators.includes(char);
    }

    /**
     * 
     * @param {String to be tested} char 
     * @return if char is a number
     */
    isNum(char) {
        console.log(`${char} is number: ${Number.isInteger(parseInt(char))}`);
        return Number.isInteger(parseInt(char));
    }

    /**
     * 
     * @param {String to be tokenized} 
     * @return list of tokens 
     */
    tokenize(str) {
        const tokens = [];
        let s = '';
        for (let index = 0; index < str.length; index++) {
            s += str[index];
            const peek = str[index + 1];
    
            if (this.isNum(s) && !this.isNum(peek) && peek != ".") {
                tokens.push(parseFloat(s));
                s = '';
            }            
            else if (s == '(' || s == ')') {
                s == '(' ? tokens.push('(') : tokens.push(')');
                s = '';
            }
            else if (s == '^') {
                tokens.push(s);
                s = '';
            }
            else if (s == 'log' || s == 'ln') {
                tokens.push(s);
                s = '';
            } 
            else if (s == "sin") {
                tokens.push(s);
                s = '';
            }
            else if (this.isOp(s)) {
                tokens.push(s);
                s = '';
            } 
            else if (s == "pi" || s == "e") {
                tokens.push(s);
                s = '';
            }
            else {
                console.log(`s reached end and is ${s}`);
            }
        }
        return tokens
    }
}

// Parse: used to parse tokens into appropriate Expression object
class Parse {
    constructor(str) {
        this.tokens = (new Token()).tokenize(str);
        this.index = 0;
    }

    /**
     * resets index, must be used after parse() in order to parse again
     */
    resetIndex() {
        this.index = 0;
        console.log("Reset index, can call parse again");
    }

    /**
     * increments index if t is the value at index
     * @param {the value at the index} t 
     */
    increment(t) {
        if (t === this.tokens[this.index]) {
            this.index++;
        }
    }

    /**
     * @return the value at index
     */
    get peek() {
        return this.tokens[this.index];
    }

    /**
     * Grammar definition for Expressions
     * expr ::= multDiv ("+" multDiv)* | ("-" multDiv)*;
     * multDiv ::= expo ("*" expo)* | ("/" expo)*;
     * expo ::= logLn ("^" logLn)*;
     * logLn ::= (("log" | "ln") trig)* | trig;
     * trig ::= ("sin" primary)* | primary;
     * primary ::= number | "(" + expr ")" | "e" | "pi"
     * 
     * number = [0-9]*.?[0-9]*
     * @param {Expression variant string name, must be "expr", "multDiv", "expo", "logLn", "trig", or "primary"} name 
     * @return Expression object
     */
    parse(name) {
        switch(name) {
            case 'expr': {
                let result = this.parse("multDiv");
                let curr = this.peek;
                console.log(result);
                while(curr == "+" || curr == "-") {
                    let op = curr == "+" ? 'add' : 'sub'
                    this.increment(curr);
                    let rightChild = this.parse("multDiv");
                    result = new AddSub(result, rightChild, op);
                    curr = this.peek;
                }
                return result;
            }
            case 'multDiv' : {
                let result = this.parse("expo");
                let curr = this.peek;
                while(curr == "*" || curr == "/") {
                    let op = curr == "*" ? 'mult' : 'div';
                    this.increment(curr);
                    let rightChild = this.parse("expo");
                    result = new MultDiv(result, rightChild, op);
                    curr = this.peek;
                }
                return result;
            }
            case 'expo' : {
                    let result = this.parse("logLn");
                    let curr = this.peek;
                    console.log(`in expo with curr: ${curr}`);
                    while(curr == "^") {
                        this.increment(curr);
                        let rightChild = this.parse("logLn");
                        result = new ExpLog(result, rightChild, "exp");
                        curr = this.peek;
                    }
                    return result;
            }
            case 'logLn' : {
                    let curr = this.peek;
                    let result;
                    console.log(`in log with curr: ${curr}`);
                    if (curr == "log" || curr == "ln") {
                        this.increment(curr);
                        let rightChild = this.parse("trig");
                        result = curr == "log" ? new ExpLog(new Num(10), rightChild, "log") : new ExpLog(new Num(Math.E), rightChild, "log");
                        curr = this.peek;
                    } else {
                        result = this.parse("trig");
                    }
                    return result;
                }
            case 'trig' : {
                let curr = this.peek;
                let result;
                console.log(`in trig with curr: ${curr}`);
                if (curr == "sin") {
                    this.increment(curr);
                    let rightChild = this.parse("primary");
                    result = new Trig(rightChild, "sin");
                    curr = this.peek;
                } else {
                    result = this.parse("primary");
                }
                return result;
            }
            case 'primary' : {
                let curr = this.peek;
                if (!isNaN(Number.parseFloat(curr))) {
                    this.increment(curr);
                    return new Num(curr);
                } else if (curr == "(") {
                    this.increment(curr);
                    let result = this.parse("expr");
                    if (this.peek != ")") throw new SyntaxError("expected )");
                    this.increment(")");
                    return result;
                } else if (curr == "pi") {
                    this.increment(curr);
                    return new Num(Math.PI);
                } else if (curr == "e") {
                    return new Num(Math.E);
                } else {
                    throw new SyntaxError(`expected a number or parentheses but got ${curr}`);
                }
            }
            default: {
                throw new SyntaxError(`could not parse, case ${name} with current token ${this.tokens[this.index]}`);
            }
        }
    }
}

//UI
/*initialize constants*/

const numbers = document.querySelectorAll(".number");
const operations = document.querySelectorAll(".op");
const backspace = document.querySelector("#backspace");
const equals = document.querySelector("#equal");
const current = document.querySelector(".current p");
const result = document.querySelector(".result p");
const clear = document.querySelector("#clear");
const parenClose = document.querySelector("#close");
const parenCount = document.querySelector("#paren-count");
const historyList = document.querySelector("#history-list");
const historyDiv = document.querySelector(".history");
const constants = document.querySelectorAll(".constant");

let currentCalculation = "";
let calculationForParser = "";
let currentResult = "";
let parenBalance = 0;
let finishedCalc = false;
const historyListItems = [{ 'expr': '2*2', 'result': '4' }];
const errorMessage = "Error with expression";

/*event listeners*/

numbers.forEach(number => number.addEventListener("click", function() {handleNumberInput(this.id);}));
constants.forEach(number => number.addEventListener("click", function() {handleNumberInput(this.id);}));
operations.forEach(op => op.addEventListener("click", function() {handleOperationInput(this.id);}));
backspace.addEventListener("click", handleBackspaceInput);
equals.addEventListener("click", handleEqualsInput);
clear.addEventListener("click", handleClearInput);
document.addEventListener("keydown", handleKeyInput);



/*functions*/

/**
 * changes state based on pressed key
 * @param {keydown EventListener} key 
 */
function handleKeyInput(key) {
    console.log(key);
    console.log(key.shiftKey);
    const shiftKeyToSymbol = {56: "*", 61: "+",
                            57: "(", 48: ")", 54: "^"};
    const keyToSymbol = {49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 173: "-", 191: "/", 190: "."};
    if ((Object.keys(keyToSymbol).includes("" + key.keyCode) && !key.shiftKey) || (Object.keys(shiftKeyToSymbol).includes("" + key.keyCode) && key.shiftKey)) {
        //if some operation or number is used after =
        if (currentResult != "" && currentResult != errorMessage && !(key.keyCode == 57 && key.shiftKey)) {
            currentCalculation = currentResult;
            calculationForParser = currentResult;
            currentResult = "";
            parenBalance = 0;
        }

        if(key.keyCode == 57 && key.shiftKey) parenBalance += 1;
        if(key.keyCode == 48 && key.shiftKey) {
            if (parenBalance <= 0) {
                return;
            }
            parenBalance -= 1;
        }
        console.log(`shift is ${typeof key.shiftKey}`);
        if (key.shiftKey) {
            currentCalculation += shiftKeyToSymbol[key.keyCode];
            calculationForParser += shiftKeyToSymbol[key.keyCode];
        } else {
            currentCalculation += keyToSymbol[key.keyCode];
            calculationForParser += keyToSymbol[key.keyCode];
        }

        //if ( is used after =
        if (currentResult != "" && currentResult != errorMessage && key.keyCode == 57 && key.shiftKey) {
            currentCalculation = "(" + currentResult;
            calculationForParser = "(" + currentResult;
            currentResult = "";
            parenBalance = 1;
        }
        updateState();
    }

    if (key.keyCode == 8) {
        handleBackspaceInput();
    }

    if ((key.keyCode == 61 && !key.shiftKey) || key.keyCode == 13) {
        handleEqualsInput();
    }

}

/**
 * changes state based on number clicked
 * @param {number} type 
 */
function handleNumberInput(type) {
    if (currentResult != "" && currentResult != errorMessage) {
        currentCalculation = "";
        calculationForParser = "";
        parenBalance = 0;
    }
    currentCalculation += type;
    calculationForParser += type;
    currentResult = "";
    updateState();
}

/**
 * changes state based on operation clicked
 * @param {operation tag id} type 
 */
function handleOperationInput(type) {
    console.log(type);
    const opToSymbol = {'mult': "*", 'sub': "-", "add": "+", "divi": "/",
                        'log': "log(", "power": "^(", "ln": "ln(",
                        'sin': "sin(",
                        'open': '(', 'close': ')',
                        'squared': "^(2)", 'cubed': "^(3)",
                        'period': "."};
    const needsOpenParen = ['log', 'power', 'ln', 'sin', 'open'];
    const noNumBefore = ['log', 'ln', 'open']
    if (currentResult != "" && currentResult != errorMessage && !noNumBefore.includes(type)) {
        currentCalculation = currentResult;
        calculationForParser = currentResult;
        parenBalance = 0;
    }

    if(needsOpenParen.includes(type)) parenBalance += 1;
    if(type == "close") parenBalance -= 1;
    currentCalculation += opToSymbol[type];
    calculationForParser += opToSymbol[type];

    if (currentResult != "" && currentResult != errorMessage && noNumBefore.includes(type)) {
        currentCalculation += currentResult;
        calculationForParser += currentResult;
        parenBalance = 1;
    }

    currentResult = "";

    updateState();
}

/**
 * changes state based on backspace
 */
function handleBackspaceInput() {
    if (currentCalculation.length != 0) {
        let deletedChar = currentCalculation[currentCalculation.length-1];
        console.log(`deleting ${deletedChar}`); 
        switch (deletedChar) {
            case "(": {
                parenBalance -= 1;
                break;
            }
            case ")": {
                parenBalance += 1;
                break;
            }
            default: {console.log(deletedChar)};
        }
        console.log(`parenBalance is ${parenBalance}`);
        currentCalculation = currentCalculation.slice(0, currentCalculation.length-1);
        calculationForParser = calculationForParser.slice(0, calculationForParser.length-1);
        currentResult = "";
        updateState()
    } else {
        console.log("empty calc");
    }
} 

/**
 * changes state based on equals, updates result by building Expression and evaluating
 */
function handleEqualsInput() {
    const ROUND_TO = 1_000_000;
    try {
        parsedExp = (new Parse(calculationForParser)).parse('expr');
        currentResult = "" + Math.round(parsedExp.evaluate * ROUND_TO) / ROUND_TO;
        historyListItems.push({'expr': currentCalculation, 'result': currentResult});
        finishedCalc = true;
    } catch (error) {
        currentResult = errorMessage;
    }
    updateState();
}

/**
 * changes state based on  (C button)
 */
function handleClearInput() {
    currentCalculation = "";
    calculationForParser = "";
    currentResult = "";
    parenBalance = 0;
    updateState();
}

/**
 * changes state based on user clicking on previous calculation
 */
function retrieveFromHistory() {
    console.log(this);
    currentCalculation = this.querySelector('.current').textContent;
    calculationForParser = this.querySelector('.current').textContent;
    currentResult = "";
    parenBalance = 0;
    updateState();
}


/*functions to change calc html*/
init();
function init() {
    updateState();
    console.log("initialized");
}

/**
 * calls other HTML changing functions
 */
function updateState() {
    updateCurrentCalc();
    updateResult();
    updateParens();
    updateHistory();
    console.log(`currCalc: ${currentCalculation}`);
    console.log(`parseCalc: ${calculationForParser}`);
}

/**
 * Updates history calculations
 */
function updateHistory() {
    historyList.innerHTML = "";
    historyListItems.forEach(item => {
        let resultP = document.createElement('p');
        resultP.appendChild(document.createTextNode(item.result));
        let exprP = document.createElement('p');
        exprP.appendChild(document.createTextNode(item.expr));
        let result = document.createElement('div');
        result.classList.add("result");
        result.appendChild(resultP);
        let current = document.createElement('div');
        current.classList.add("current");
        current.appendChild(exprP);
        let elem = document.createElement('li');
        elem.classList.add("calculation");
        elem.appendChild(result);
        elem.appendChild(current);
        historyList.appendChild(elem);
        // <div class="calculation">
        //     <div class="result"><p></p></div>
        //     <div class="current"><p></p></div>
        // </div>

    });
    let historyElements = document.querySelectorAll("#history-list > li");
    console.log(historyElements);
    historyDiv.scrollTop = historyDiv.scrollHeight;
    historyElements.forEach(elem => elem.addEventListener("click", retrieveFromHistory));
}

function updateCurrentCalc() {
    current.textContent = currentCalculation;
}

function updateResult() {
    result.textContent = currentResult;
}

/**
 * updates parenthesis count, disables ) if needed
 */
function updateParens() {
    if (parenBalance == 0) {
        parenClose.disabled = true;
        parenClose.classList.add("disable");
    } else {
        parenClose.disabled = false;    
        parenClose.classList.remove("disable");
    }
    parenCount.textContent = parenBalance;
}
