// Алгоритм розв'язування нонограм - LINE SOLVER

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
            if (line[i] === 1 && possible[i] !== 1) return false;  // Заповнена клітинка має залишатись заповненою
            if (line[i] === -1 && possible[i] !== 0) return false; // Закреслена клітинка має залишатись порожньою
        }
        return true;
    });

    if (validLines.length === 0) {
        console.error('Помилка: немає валідних варіантів для лінії');
        return null;
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

        if (allFilled) result[i] = 1;       // У всіх варіантах заповнена
        else if (allEmpty) result[i] = -1;  // У всіх варіантах порожня
        // Інакше залишається 0 (невизначена)
    }

    return result;
}

// Застосування Line Solver до рядка
function applyLineSolverToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];

    const solved = solveLine(currentRow, hints);
    if (!solved) return { changed: false };

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
    if (!solved) return { changed: false };

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