function stringToInt(message) {
    message = message.trim();

    if (message == '') {
        return { valid: true, value: 10000 };
    }

    //10+(10+10) [10, + [10 + 10]]

    var result = stringToArray(message);

    if (!result.valid) {
        return { ...result }
    }

    result = resolveArray(result.value);
    if (result.valid) {
        return { valid: true, value: result.value }
    } else {
        return { ...result }
    }

}

function stringToArray(string) {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const operators = ['*', '+', '-', '/'];

    const tempArray = [];
    var temp = '';

    const message = string;
    var parentheseLevel = 0;

    var lastIsNumber = false;

    for (let i = 0; i < message.length; i++) {
        const character = message[i];

        if (character == '(') {
            if (parentheseLevel == 0) {
                if (temp != '') {
                    tempArray.push(temp);
                    tempArray.push('*');
                    temp = '';
                    lastIsNumber = false;
                } else if (lastIsNumber) {
                    tempArray.push('*');
                }
            }
            parentheseLevel += 1;
            continue;
        } else if (character == ')') {
            parentheseLevel -= 1;
            if (parentheseLevel == 0) {
                let tempResult = stringToArray(temp);
                temp = '';
                lastIsNumber = true;
                if (tempResult.valid) {
                    tempArray.push(tempResult.value);
                } else {
                    return { ...tempResult };
                }

                let nextCharacter = message[i + 1];
                if (nextCharacter == ' ') {
                    const nextNextCharacter = message[i + 2];
                    if (numbers.includes(nextNextCharacter) || nextNextCharacter == '(') {
                        tempArray.push('*');
                        lastIsNumber = false;
                    }
                } else if (numbers.includes(nextCharacter) || nextCharacter == '(') {
                    tempArray.push('*');
                    lastIsNumber = false;
                }

            } else if (parentheseLevel < 0) {
                return { valid: false, reason: 'Too many )' };
            }
            continue;
        }

        if (parentheseLevel > 0) {
            temp += character;
            continue;
        }

        if (character == ' ') {
            if (temp != '') {
                if (lastIsNumber) {
                    return { valid: false, reason: '2 numbers in a row' };
                }
                tempArray.push(temp);
                lastIsNumber = true;
                temp = '';
            }
            continue;
        }
        if (numbers.includes(character)) {
            if (lastIsNumber && temp != '') {
                return { valid: false, reason: '2 numbers in a row' }
            }
            temp += character;
        } else if (operators.includes(character)) {
            if (character == '-' && temp == '') {
                let nextCharacter = message[i + 1];
                if (numbers.includes(nextCharacter)) {
                    temp += '-';
                    continue;
                } else if (nextCharacter == '(') {
                    tempArray.push('-1');
                    tempArray.push('*');
                    lastIsNumber = false;
                    continue;
                }
            }
            if (temp == '' && !lastIsNumber) {
                return { valid: false, reason: '2 operators in a row' };
            } else {
                if (temp != '') {
                    tempArray.push(temp);
                }
                temp = '';
            }
            if (character == '*') {
                if (i < message.length - 1 && message[i + 1] == '*') {
                    tempArray.push('**');
                    i += 1;
                    temp = '';
                    lastIsNumber = false;
                    continue;
                }
            }
            lastIsNumber = false;
            tempArray.push(character);
        } else {
            return { valid: false, reason: `Character not expected ${character}` };
        }
    }

    if (temp != '') {
        lastIsNumber = true;
        tempArray.push(temp);
    }

    if (parentheseLevel > 0) {
        return { valid: false, reason: 'Paranthese not closed' };
    }

    if (!lastIsNumber) {
        return { valid: false, reason: 'Equation finishes with operator' };
    }
    return { valid: true, value: tempArray };
}
function resolveArray(array) {

    const tempArray = array.slice(); //Créé une copie pour éviter les problèmes de références
    const PEMDAS = [['**'], ['*', '/'], ['+', '-']];

    for (let i = 0; i < tempArray.length; i++) {
        if (Array.isArray(tempArray[i])) {
            let result = resolveArray(tempArray[i]);
            if (result.valid) {
                tempArray[i] = [result.value];
            } else {
                return { ...result };
            }
        }
    }

    for (let j = tempArray.length - 2; j > 0; j -= 0) {
        try {
            if (tempArray[j] == '**') {
                var firstNumber = parseInt(tempArray[j - 1]);
                var secondNumber = parseInt(tempArray[j + 1]);
                var newNumber = firstNumber ** secondNumber;
                tempArray.splice(j - 1, 3);
                tempArray.splice(j - 1, 0, newNumber);
            } else {
                j -= 2;
            }
        } catch (err) {
            return { valid: false, reason: `Error while calculating exposants: ${err}` };
        }
    }

    for (let i = 1; i < PEMDAS.length; i++) {
        for (let j = 1; j < tempArray.length; j += 0) {
            if (PEMDAS[i].includes(tempArray[j])) {
                try {
                    var firstNumber = parseInt(tempArray[j - 1]);
                    var secondNumber = parseInt(tempArray[j + 1]);
                    var newNumber = 0;

                    switch (tempArray[j]) {
                        case '*':
                            newNumber = firstNumber * secondNumber;
                            break;
                        case '/':
                            if (secondNumber == 0) { return { valid: false, reason: 'division by 0 not allowed' } }
                            newNumber = firstNumber / secondNumber;
                            break;
                        case '+':
                            newNumber = firstNumber + secondNumber;
                            break;
                        case '-':
                            newNumber = firstNumber - secondNumber;
                            break;
                        default:
                            return { valid: false, reason: `operator not expected: ${tempArray[j]}` };
                    }

                    tempArray.splice(j - 1, 3);
                    tempArray.splice(j - 1, 0, newNumber);

                } catch (err) {
                    return { valid: false, reason: `Error while calculating operator ${err}` };
                }
            } else {
                j += 2;
            }
        }

    }

    return { valid: true, value: tempArray[0] };
}

function unitaryTests() {
    const unitaryTests = [
        // basic
        { message: '5+3', valid: true, response: 8 },
        { message: '10*10+10*10', valid: true, response: 200 },
        { message: '2**3', valid: true, response: 8 },
        { message: '2**3**2', valid: true, response: 512 },
        { message: '(2+3)*4', valid: true, response: 20 },
        { message: '2(2+2)', valid: true, response: 8 },

        // invalid syntax
        { message: '--5+3', valid: false, reason: '2 operators in a row' },
        { message: '10.5+2.5', valid: false, reason: 'Character not expected .' },
        { message: '- (2+3)', valid: false, reason: '2 operators in a row' },
        { message: '10 20', valid: false, reason: '2 numbers in a row' },
        { message: '3/0', valid: false, reason: 'division by 0 not allowed' },
        { message: '(2+3', valid: false, reason: 'Paranthese not closed' },

        // whitespace
        { message: '    2+2    ', valid: true, response: 4 },

        // big int precision
        { message: '9007199254740993+1', valid: true, response: 9007199254740994 },
    ];

    let passed = 0;
    for (let i = 0; i < unitaryTests.length; i++) {
        const { message, valid, response, reason } = unitaryTests[i];
        const result = stringToInt(message);

        const key = `test[${i}] "${message}"`;

        if (valid) {
            if (result.valid && result.value === response) {
                console.log(`✅ ${key} passed`);
                passed++;
            } else {
                console.error(`❌ ${key} failed: expected valid=true & value=${response}, but got`, result);
            }
        } else {
            if (!result.valid) {
                if (reason && result.reason !== reason) {
                    console.error(`❌ ${key} failed: expected reason="${reason}", but got "${result.reason}"`);
                } else {
                    console.log(`✅ ${key} passed`);
                    passed++;
                }
            } else {
                console.error(`❌ ${key} failed: expected valid=false, but got`, result);
            }
        }
    }

    console.log(`\n${passed}/${unitaryTests.length} tests passed.`);
}

function simpleTest(message) {
    const result = Int(message);
    if (result.valid) {
        console.log(`Operation success! Result ${result.value}`);
    } else {
        if (result.reason) {
            console.log(`Operation failed! Reason: ${result.reason}`);
        } else {
            console.log(`Operation failed! Reason not given`);
        }
    }
}

unitaryTests();