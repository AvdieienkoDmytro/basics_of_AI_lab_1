// І-АБО ГРАФ РОЗВ'ЯЗУВАЧ НОНОГРАМ
// Базується на теорії з книги Глибовця-Олецького

// ============= ПОКРОКОВИЙ І-АБО АЛГОРИТМ =============

function executeAndOrStep() {
    if (!andOrState) {
        // Ініціалізація стану
        andOrState = {
            phase: 'rows',
            currentRow: 0,
            currentCol: 0,
            rowsChanged: false,
            colsChanged: false
        };

        // Після ініціалізації одразу продовжуємо виконання
        return executeAndOrStep();
    }

    // Фаза 1: І-компонента - обробка ВСІХ рядків
    if (andOrState.phase === 'rows') {
        if (andOrState.currentRow < gridSize.height) {
            const row = andOrState.currentRow;
            const result = applyAndOrToRow(row);

            andOrState.currentRow++;

            if (result.contradiction) {
                return {
                    changed: false,
                    rule: 'rule3',
                    message: `І-АБО: Суперечність в рядку ${row + 1}`,
                    finished: true
                };
            }

            if (result.changed) {
                andOrState.rowsChanged = true;
                return {
                    changed: true,
                    rule: 'rule3',
                    message: `І-АБО: Рядок ${row + 1} (${result.variants} варіантів)`
                };
            }

            // Рядок без змін - продовжуємо далі, але НЕ повертаємо changed:false
            return executeAndOrStep(); // Рекурсивно викликаємо для наступного рядка
        } else {
            // Всі рядки оброблено - переходимо до колонок
            andOrState.phase = 'cols';
            andOrState.currentCol = 0;

            return executeAndOrStep(); // Продовжуємо з колонками
        }
    }

    // Фаза 2: І-компонента - обробка ВСІХ колонок
    if (andOrState.phase === 'cols') {
        if (andOrState.currentCol < gridSize.width) {
            const col = andOrState.currentCol;
            const result = applyAndOrToCol(col);

            andOrState.currentCol++;

            if (result.contradiction) {
                return {
                    changed: false,
                    rule: 'rule3',
                    message: `І-АБО: Суперечність в колонці ${col + 1}`,
                    finished: true
                };
            }

            if (result.changed) {
                andOrState.colsChanged = true;
                // Якщо колонка змінилась - повертаємось до рядків
                andOrState.phase = 'rows';
                andOrState.currentRow = 0;

                return {
                    changed: true,
                    rule: 'rule3',
                    message: `І-АБО: Колонка ${col + 1} змінена, повертаємось до рядків`
                };
            }

            // Колонка без змін - продовжуємо далі
            return executeAndOrStep(); // Рекурсивно викликаємо для наступної колонки
        } else {
            // Всі колонки оброблено
            if (andOrState.rowsChanged || andOrState.colsChanged) {
                // Були зміни - починаємо новий цикл
                andOrState.phase = 'rows';
                andOrState.currentRow = 0;
                andOrState.rowsChanged = false;
                andOrState.colsChanged = false;

                return executeAndOrStep(); // Новий цикл
            } else {
                // Нічого не змінилось - закінчуємо
                andOrState = null;
                return {
                    changed: false,
                    rule: 'rule3',
                    message: 'І-АБО граф завершив роботу',
                    finished: true
                };
            }
        }
    }

    return {
        changed: false,
        finished: true
    };
}

// ============= І-АБО ДЛЯ РЯДКА =============

function applyAndOrToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];

    // АБО-компонента: генеруємо всі можливі варіанти
    const possibleLines = generatePossibleLines(hints, gridSize.width);

    // Фільтруємо варіанти що конфліктують з поточним станом
    const validLines = possibleLines.filter(possible => {
        for (let j = 0; j < gridSize.width; j++) {
            if (currentRow[j] === 1 && possible[j] !== 1) return false;
            if (currentRow[j] === -1 && possible[j] !== 0) return false;
        }
        return true;
    });

    if (validLines.length === 0) {
        return { changed: false, contradiction: true };
    }

    // І-компонента: знаходимо спільні клітинки у ВСІХ варіантах
    let changed = false;
    for (let j = 0; j < gridSize.width; j++) {
        if (currentRow[j] !== 0) continue;

        const allFilled = validLines.every(line => line[j] === 1);
        const allEmpty = validLines.every(line => line[j] === 0);

        if (allFilled) {
            gameGrid[row][j] = 1;
            setLastChanged(row, j);
            changed = true;
        } else if (allEmpty) {
            gameGrid[row][j] = -1;
            setLastChanged(row, j);
            changed = true;
        }
    }

    return { changed, variants: validLines.length };
}

// ============= І-АБО ДЛЯ КОЛОНКИ =============

function applyAndOrToCol(col) {
    const hints = colHints[col];
    const currentCol = [];

    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }

    // АБО-компонента: генеруємо всі можливі варіанти
    const possibleLines = generatePossibleLines(hints, gridSize.height);

    // Фільтруємо варіанти що конфліктують з поточним станом
    const validLines = possibleLines.filter(possible => {
        for (let i = 0; i < gridSize.height; i++) {
            if (currentCol[i] === 1 && possible[i] !== 1) return false;
            if (currentCol[i] === -1 && possible[i] !== 0) return false;
        }
        return true;
    });

    if (validLines.length === 0) {
        return { changed: false, contradiction: true };
    }

    // І-компонента: знаходимо спільні клітинки у ВСІХ варіантах
    let changed = false;
    for (let i = 0; i < gridSize.height; i++) {
        if (currentCol[i] !== 0) continue;

        const allFilled = validLines.every(line => line[i] === 1);
        const allEmpty = validLines.every(line => line[i] === 0);

        if (allFilled) {
            gameGrid[i][col] = 1;
            setLastChanged(i, col);
            changed = true;
        } else if (allEmpty) {
            gameGrid[i][col] = -1;
            setLastChanged(i, col);
            changed = true;
        }
    }

    return { changed, variants: validLines.length };
}

// ============= ПОВНИЙ І-АБО РОЗВ'ЯЗУВАЧ З BACKTRACKING =============

function solveWithFullAndOr() {
    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
        iterations++;
        let changed = false;

        // І-компонента: обробляємо ВСІ рядки
        for (let i = 0; i < gridSize.height; i++) {
            const result = applyAndOrToRow(i);
            if (result.contradiction) {
                return { success: false, iterations };
            }
            if (result.changed) {
                changed = true;
            }
        }

        // І-компонента: обробляємо ВСІ колонки
        for (let j = 0; j < gridSize.width; j++) {
            const result = applyAndOrToCol(j);
            if (result.contradiction) {
                return { success: false, iterations };
            }
            if (result.changed) {
                changed = true;
            }
        }

        // Якщо нічого не змінилось - перевіряємо чи розв'язано
        if (!changed) {
            if (checkIfSolved()) {
                return { success: true, iterations };
            }

            // Не розв'язано повністю - застосовуємо АБО-логіку (backtracking)
            const guessResult = makeIntelligentGuess();
            if (!guessResult) {
                return { success: false, iterations };
            }
        }
    }

    return { success: false, iterations };
}

// ============= РОЗУМНА ЗДОГАДКА (АБО-ВУЗОЛ) =============

function makeIntelligentGuess() {
    // Евристика: шукаємо клітинку з найменшою кількістю можливостей
    let bestCell = null;
    let minOptions = Infinity;

    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (gameGrid[i][j] === 0) {
                const options = countCellOptions(i, j);
                if (options > 0 && options < minOptions) {
                    minOptions = options;
                    bestCell = { row: i, col: j };
                }
            }
        }
    }

    if (!bestCell) return false;

    // АБО-вибір: пробуємо заповнити (1) АБО закреслити (-1)
    const savedGrid = gameGrid.map(row => [...row]);

    // Спроба 1: заповнити
    gameGrid[bestCell.row][bestCell.col] = 1;
    const result1 = solveWithFullAndOr();

    if (result1.success) {
        return true;
    }

    // Відновлюємо стан
    gameGrid = savedGrid.map(row => [...row]);

    // Спроба 2: закреслити
    gameGrid[bestCell.row][bestCell.col] = -1;
    const result2 = solveWithFullAndOr();

    if (result2.success) {
        return true;
    }

    // Відновлюємо стан - жоден варіант не спрацював
    gameGrid = savedGrid.map(row => [...row]);
    return false;
}

// ============= ПІДРАХУНОК ОПЦІЙ ДЛЯ КЛІТИНКИ =============

function countCellOptions(row, col) {
    // Підраховуємо скільки валідних варіантів включають цю клітинку як заповнену
    const rowPossible = generatePossibleLines(rowHints[row], gridSize.width);
    const colPossible = generatePossibleLines(colHints[col], gridSize.height);

    const rowValid = rowPossible.filter(line => {
        return line.every((val, j) => {
            if (gameGrid[row][j] === 0) return true;
            if (gameGrid[row][j] === 1 && val === 1) return true;
            if (gameGrid[row][j] === -1 && val === 0) return true;
            return false;
        });
    });

    const colValid = colPossible.filter(line => {
        return line.every((val, i) => {
            if (gameGrid[i][col] === 0) return true;
            if (gameGrid[i][col] === 1 && val === 1) return true;
            if (gameGrid[i][col] === -1 && val === 0) return true;
            return false;
        });
    });

    const rowFilled = rowValid.filter(line => line[col] === 1).length;
    const colFilled = colValid.filter(line => line[row] === 1).length;

    return Math.min(rowFilled, colFilled);
}


// ============= І-АБО ДЛЯ РЯДКА =============

function applyAndOrToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];

    // АБО-компонента: генеруємо всі можливі варіанти
    const possibleLines = generatePossibleLines(hints, gridSize.width);

    // Фільтруємо варіанти що конфліктують з поточним станом
    const validLines = possibleLines.filter(possible => {
        for (let j = 0; j < gridSize.width; j++) {
            if (currentRow[j] === 1 && possible[j] !== 1) return false;
            if (currentRow[j] === -1 && possible[j] !== 0) return false;
        }
        return true;
    });

    if (validLines.length === 0) {
        return { changed: false, contradiction: true };
    }

    // І-компонента: знаходимо спільні клітинки у ВСІХ варіантах
    let changed = false;
    for (let j = 0; j < gridSize.width; j++) {
        if (currentRow[j] !== 0) continue;

        const allFilled = validLines.every(line => line[j] === 1);
        const allEmpty = validLines.every(line => line[j] === 0);

        if (allFilled) {
            gameGrid[row][j] = 1;
            setLastChanged(row, j);
            changed = true;
        } else if (allEmpty) {
            gameGrid[row][j] = -1;
            setLastChanged(row, j);
            changed = true;
        }
    }

    return { changed, variants: validLines.length };
}

// ============= І-АБО ДЛЯ КОЛОНКИ =============

function applyAndOrToCol(col) {
    const hints = colHints[col];
    const currentCol = [];

    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }

    // АБО-компонента: генеруємо всі можливі варіанти
    const possibleLines = generatePossibleLines(hints, gridSize.height);

    // Фільтруємо варіанти що конфліктують з поточним станом
    const validLines = possibleLines.filter(possible => {
        for (let i = 0; i < gridSize.height; i++) {
            if (currentCol[i] === 1 && possible[i] !== 1) return false;
            if (currentCol[i] === -1 && possible[i] !== 0) return false;
        }
        return true;
    });

    if (validLines.length === 0) {
        return { changed: false, contradiction: true };
    }

    // І-компонента: знаходимо спільні клітинки у ВСІХ варіантах
    let changed = false;
    for (let i = 0; i < gridSize.height; i++) {
        if (currentCol[i] !== 0) continue;

        const allFilled = validLines.every(line => line[i] === 1);
        const allEmpty = validLines.every(line => line[i] === 0);

        if (allFilled) {
            gameGrid[i][col] = 1;
            setLastChanged(i, col);
            changed = true;
        } else if (allEmpty) {
            gameGrid[i][col] = -1;
            setLastChanged(i, col);
            changed = true;
        }
    }

    return { changed, variants: validLines.length };
}

// ============= ПОВНИЙ І-АБО РОЗВ'ЯЗУВАЧ З BACKTRACKING =============

function solveWithFullAndOr() {
    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
        iterations++;
        let changed = false;

        // І-компонента: обробляємо ВСІ рядки
        for (let i = 0; i < gridSize.height; i++) {
            const result = applyAndOrToRow(i);
            if (result.contradiction) {
                return { success: false, iterations };
            }
            if (result.changed) {
                changed = true;
            }
        }

        // І-компонента: обробляємо ВСІ колонки
        for (let j = 0; j < gridSize.width; j++) {
            const result = applyAndOrToCol(j);
            if (result.contradiction) {
                return { success: false, iterations };
            }
            if (result.changed) {
                changed = true;
            }
        }

        // Якщо нічого не змінилось - перевіряємо чи розв'язано
        if (!changed) {
            if (checkIfSolved()) {
                return { success: true, iterations };
            }

            // Не розв'язано повністю - застосовуємо АБО-логіку (backtracking)
            const guessResult = makeIntelligentGuess();
            if (!guessResult) {
                return { success: false, iterations };
            }
        }
    }

    return { success: false, iterations };
}

// ============= РОЗУМНА ЗДОГАДКА (АБО-ВУЗОЛ) =============

function makeIntelligentGuess() {
    // Евристика: шукаємо клітинку з найменшою кількістю можливостей
    let bestCell = null;
    let minOptions = Infinity;

    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (gameGrid[i][j] === 0) {
                const options = countCellOptions(i, j);
                if (options > 0 && options < minOptions) {
                    minOptions = options;
                    bestCell = { row: i, col: j };
                }
            }
        }
    }

    if (!bestCell) return false;

    // АБО-вибір: пробуємо заповнити (1) АБО закреслити (-1)
    const savedGrid = gameGrid.map(row => [...row]);

    // Спроба 1: заповнити
    gameGrid[bestCell.row][bestCell.col] = 1;
    const result1 = solveWithFullAndOr();

    if (result1.success) {
        return true;
    }

    // Відновлюємо стан
    gameGrid = savedGrid.map(row => [...row]);

    // Спроба 2: закреслити
    gameGrid[bestCell.row][bestCell.col] = -1;
    const result2 = solveWithFullAndOr();

    if (result2.success) {
        return true;
    }

    // Відновлюємо стан - жоден варіант не спрацював
    gameGrid = savedGrid.map(row => [...row]);
    return false;
}

// ============= ПІДРАХУНОК ОПЦІЙ ДЛЯ КЛІТИНКИ =============

function countCellOptions(row, col) {
    // Підраховуємо скільки валідних варіантів включають цю клітинку як заповнену
    const rowPossible = generatePossibleLines(rowHints[row], gridSize.width);
    const colPossible = generatePossibleLines(colHints[col], gridSize.height);

    const rowValid = rowPossible.filter(line => {
        return line.every((val, j) => {
            if (gameGrid[row][j] === 0) return true;
            if (gameGrid[row][j] === 1 && val === 1) return true;
            if (gameGrid[row][j] === -1 && val === 0) return true;
            return false;
        });
    });

    const colValid = colPossible.filter(line => {
        return line.every((val, i) => {
            if (gameGrid[i][col] === 0) return true;
            if (gameGrid[i][col] === 1 && val === 1) return true;
            if (gameGrid[i][col] === -1 && val === 0) return true;
            return false;
        });
    });

    const rowFilled = rowValid.filter(line => line[col] === 1).length;
    const colFilled = colValid.filter(line => line[row] === 1).length;

    return Math.min(rowFilled, colFilled);
}