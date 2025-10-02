// Алгоритм розв'язування нонограм - LINE SOLVER + BACKTRACKING

// Генерує всі можливі варіанти розміщення блоків у лінії
function generatePossibleLines(hints, length) {
    const lines = [];

    // Якщо підказка [0] - порожня лінія
    if (hints.length === 1 && hints[0] === 0) {
        return [Array(length).fill(0)];
    }

    // Рекурсивна функція для генерації варіантів
    function generate(pos, hintIndex, currentLine) {
        // Всі блоки розміщено - заповнюємо решту нулями
        if (hintIndex === hints.length) {
            lines.push([...currentLine, ...Array(length - pos).fill(0)]);
            return;
        }

        const blockSize = hints[hintIndex];
        const remainingHints = hints.slice(hintIndex + 1);
        const minSpaceNeeded = remainingHints.reduce((sum, h) => sum + h, 0) + remainingHints.length;

        // Пробуємо всі позиції для поточного блоку
        for (let start = pos; start <= length - blockSize - minSpaceNeeded; start++) {
            const newLine = [...currentLine];

            // Порожні клітинки перед блоком
            for (let i = pos; i < start; i++) {
                newLine.push(0);
            }

            // Сам блок
            for (let i = 0; i < blockSize; i++) {
                newLine.push(1);
            }

            // Обов'язковий проміжок після блоку (якщо є ще блоки)
            if (hintIndex < hints.length - 1) {
                newLine.push(0);
                generate(start + blockSize + 1, hintIndex + 1, newLine);
            } else {
                generate(start + blockSize, hintIndex + 1, newLine);
            }
        }
    }

    generate(0, 0, []);
    return lines;
}

// Основний Line Solver - знаходить спільні клітинки у всіх варіантах
function solveLine(line, hints) {
    const length = line.length;
    const possibleLines = generatePossibleLines(hints, length);

    // Відкидаємо варіанти, що конфліктують з поточним станом
    const validLines = possibleLines.filter(possible => {
        for (let i = 0; i < length; i++) {
            if (line[i] === 1 && possible[i] !== 1) return false;
            if (line[i] === -1 && possible[i] !== 0) return false;
        }
        return true;
    });

    if (validLines.length === 0) {
        return null; // Суперечність - немає валідних варіантів
    }

    // Знаходимо спільні клітинки
    const result = Array(length).fill(0);
    for (let i = 0; i < length; i++) {
        let allFilled = true;
        let allEmpty = true;

        for (const validLine of validLines) {
            if (validLine[i] !== 1) allFilled = false;
            if (validLine[i] !== 0) allEmpty = false;
        }

        if (allFilled) result[i] = 1;
        else if (allEmpty) result[i] = -1;
    }

    return result;
}

// Застосування Line Solver до рядка
function applyLineSolverToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];

    const solved = solveLine(currentRow, hints);
    if (!solved) return { changed: false, contradiction: true };

    let changed = false;
    let filledCount = 0;
    let crossedCount = 0;

    for (let j = 0; j < gridSize.width; j++) {
        if (currentRow[j] === 0 && solved[j] !== 0) {
            gameGrid[row][j] = solved[j];
            setLastChanged(row, j);
            changed = true;
            if (solved[j] === 1) filledCount++;
            else crossedCount++;
        }
    }

    if (changed) {
        const msg = `заповнено ${filledCount}, закреслено ${crossedCount}`;
        return { changed: true, message: msg };
    }
    return { changed: false };
}

// Застосування Line Solver до колонки
function applyLineSolverToColumn(col) {
    const hints = colHints[col];
    const currentCol = [];
    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }

    const solved = solveLine(currentCol, hints);
    if (!solved) return { changed: false, contradiction: true };

    let changed = false;
    let filledCount = 0;
    let crossedCount = 0;

    for (let i = 0; i < gridSize.height; i++) {
        if (currentCol[i] === 0 && solved[i] !== 0) {
            gameGrid[i][col] = solved[i];
            setLastChanged(i, col);
            changed = true;
            if (solved[i] === 1) filledCount++;
            else crossedCount++;
        }
    }

    if (changed) {
        const msg = `заповнено ${filledCount}, закреслено ${crossedCount}`;
        return { changed: true, message: msg };
    }
    return { changed: false };
}

// ГОЛОВНА ФУНКЦІЯ - виконує один крок розв'язування
function executeRulesStep() {
    // Line Solver для всіх рядків
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyLineSolverToRow(i);
        if (result.contradiction) {
            return { changed: false, contradiction: true };
        }
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule1',
                message: `Рядок ${i + 1}: ${result.message}`
            };
        }
    }

    // Line Solver для всіх колонок
    for (let j = 0; j < gridSize.width; j++) {
        const result = applyLineSolverToColumn(j);
        if (result.contradiction) {
            return { changed: false, contradiction: true };
        }
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule1',
                message: `Колонка ${j + 1}: ${result.message}`
            };
        }
    }

    return { changed: false };
}

// BACKTRACKING АЛГОРИТМ
function solveWithBacktracking() {
    // Спочатку застосовуємо Line Solver доти, доки можливо
    let progress = true;
    while (progress) {
        const result = executeRulesStep();
        if (result.contradiction) {
            return false; // Суперечність - цей шлях неправильний
        }
        progress = result.changed;
    }

    // Перевіряємо чи розв'язано
    if (checkIfSolved()) {
        return true;
    }

    // Знаходимо невизначену клітинку для здогадки
    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (gameGrid[i][j] === 0) {
                // Зберігаємо поточний стан
                const savedGrid = gameGrid.map(row => [...row]);

                // Пробуємо заповнити клітинку
                gameGrid[i][j] = 1;
                if (solveWithBacktracking()) {
                    return true; // Знайдено розв'язок
                }

                // Відновлюємо стан і пробуємо закреслити
                gameGrid = savedGrid.map(row => [...row]);
                gameGrid[i][j] = -1;
                if (solveWithBacktracking()) {
                    return true; // Знайдено розв'язок
                }

                // Жоден варіант не спрацював - відкочуємося
                gameGrid = savedGrid.map(row => [...row]);
                return false;
            }
        }
    }

    return false; // Не знайдено невизначених клітинок
}

// Функція для запуску backtracking з інтерфейсу
function executeBacktrackingStep() {
    // Зберігаємо початковий стан
    const initialGrid = gameGrid.map(row => [...row]);

    // Запускаємо backtracking
    const solved = solveWithBacktracking();

    if (solved) {
        // Перевіряємо чи дійсно щось змінилось
        let hasChanges = false;
        for (let i = 0; i < gridSize.height; i++) {
            for (let j = 0; j < gridSize.width; j++) {
                if (initialGrid[i][j] !== gameGrid[i][j]) {
                    hasChanges = true;
                    break;
                }
            }
            if (hasChanges) break;
        }

        if (hasChanges) {
            return {
                changed: true,
                rule: 'rule2',
                message: 'Backtracking знайшов розв\'язок!'
            };
        } else {
            return {
                changed: false,
                message: 'Backtracking завершився без змін'
            };
        }
    } else {
        // Відновлюємо початковий стан якщо не вдалося розв'язати
        gameGrid = initialGrid.map(row => [...row]);
        return {
            changed: false,
            message: 'Backtracking не знайшов розв\'язок'
        };
    }
}