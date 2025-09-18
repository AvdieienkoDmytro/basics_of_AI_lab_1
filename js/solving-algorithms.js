// Алгоритми розв'язування нонограм

// Допоміжні функції
function calculateMinPositions(hints, length) {
    const positions = [];
    let pos = 0;

    for (let i = 0; i < hints.length; i++) {
        positions.push(pos);
        pos += hints[i];
        if (i < hints.length - 1) pos += 1;
    }

    return positions;
}

function calculateMaxPositions(hints, length) {
    const positions = [];
    let pos = length;

    for (let i = hints.length - 1; i >= 0; i--) {
        pos -= hints[i];
        positions.unshift(pos);
        if (i > 0) pos -= 1;
    }

    return positions;
}

// 1. FULL LINES (Повні лінії)
function applyFullLinesToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 1 && hints[0] === 0) {
        for (let j = 0; j < gridSize.width; j++) {
            if (currentRow[j] === 0) {
                gameGrid[row][j] = -1;
                setLastChanged(row, j);
                changed = true;
            }
        }
        if (changed) return { changed: true, message: "закреслено всі клітинки (підказка 0)" };
    }

    const totalHints = hints.reduce((sum, hint) => sum + hint, 0);
    const minSpaces = Math.max(0, hints.length - 1);
    if (totalHints + minSpaces === gridSize.width) {
        let pos = 0;
        for (let h = 0; h < hints.length; h++) {
            for (let k = 0; k < hints[h]; k++) {
                if (currentRow[pos] === 0) {
                    gameGrid[row][pos] = 1;
                    setLastChanged(row, pos);
                    changed = true;
                }
                pos++;
            }
            if (h < hints.length - 1) {
                if (currentRow[pos] === 0) {
                    gameGrid[row][pos] = -1;
                    setLastChanged(row, pos);
                    changed = true;
                }
                pos++;
            }
        }
        if (changed) return { changed: true, message: "повне заповнення" };
    }

    return { changed: false };
}

function applyFullLinesToColumn(col) {
    const hints = colHints[col];
    let changed = false;

    if (hints.length === 1 && hints[0] === 0) {
        for (let i = 0; i < gridSize.height; i++) {
            if (gameGrid[i][col] === 0) {
                gameGrid[i][col] = -1;
                setLastChanged(i, col);
                changed = true;
            }
        }
        if (changed) return { changed: true, message: "закреслено всі клітинки (підказка 0)" };
    }

    const totalHints = hints.reduce((sum, hint) => sum + hint, 0);
    const minSpaces = Math.max(0, hints.length - 1);
    if (totalHints + minSpaces === gridSize.height) {
        let pos = 0;
        for (let h = 0; h < hints.length; h++) {
            for (let k = 0; k < hints[h]; k++) {
                if (gameGrid[pos][col] === 0) {
                    gameGrid[pos][col] = 1;
                    setLastChanged(pos, col);
                    changed = true;
                }
                pos++;
            }
            if (h < hints.length - 1) {
                if (gameGrid[pos][col] === 0) {
                    gameGrid[pos][col] = -1;
                    setLastChanged(pos, col);
                    changed = true;
                }
                pos++;
            }
        }
        if (changed) return { changed: true, message: "повне заповнення" };
    }

    return { changed: false };
}

// 2. OVERLAP METHOD (Метод перетинів)
function applyOverlapToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 1 && hints[0] === 0) return { changed: false };

    const minPositions = calculateMinPositions(hints, gridSize.width);
    const maxPositions = calculateMaxPositions(hints, gridSize.width);

    for (let h = 0; h < hints.length; h++) {
        const minStart = minPositions[h];
        const maxStart = maxPositions[h];
        const blockSize = hints[h];

        const overlapStart = Math.max(minStart, maxStart);
        const overlapEnd = Math.min(minStart + blockSize, maxStart + blockSize);

        if (overlapStart < overlapEnd) {
            for (let j = overlapStart; j < overlapEnd; j++) {
                if (currentRow[j] === 0) {
                    gameGrid[row][j] = 1;
                    setLastChanged(row, j);
                    changed = true;
                }
            }
        }
    }

    if (changed) return { changed: true, message: "знайдено перетини блоків" };
    return { changed: false };
}

function applyOverlapToColumn(col) {
    const hints = colHints[col];
    let changed = false;

    if (hints.length === 1 && hints[0] === 0) return { changed: false };

    const minPositions = calculateMinPositions(hints, gridSize.height);
    const maxPositions = calculateMaxPositions(hints, gridSize.height);

    for (let h = 0; h < hints.length; h++) {
        const minStart = minPositions[h];
        const maxStart = maxPositions[h];
        const blockSize = hints[h];

        const overlapStart = Math.max(minStart, maxStart);
        const overlapEnd = Math.min(minStart + blockSize, maxStart + blockSize);

        if (overlapStart < overlapEnd) {
            for (let i = overlapStart; i < overlapEnd; i++) {
                if (gameGrid[i][col] === 0) {
                    gameGrid[i][col] = 1;
                    setLastChanged(i, col);
                    changed = true;
                }
            }
        }
    }

    if (changed) return { changed: true, message: "знайдено перетини блоків" };
    return { changed: false };
}

// 3. SIMPLE SPACES (Прості проміжки)
function applySimpleSpacesToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    const minBlockSize = Math.min(...hints);

    for (let start = 0; start < gridSize.width; start++) {
        if (currentRow[start] === -1) {
            let end = start + 1;
            while (end < gridSize.width && currentRow[end] !== -1) {
                end++;
            }

            if (end < gridSize.width && currentRow[end] === -1) {
                const gapSize = end - start - 1;
                if (gapSize > 0 && gapSize < minBlockSize) {
                    for (let j = start + 1; j < end; j++) {
                        if (currentRow[j] === 0) {
                            gameGrid[row][j] = -1;
                            setLastChanged(row, j);
                            changed = true;
                        }
                    }
                }
            }
            start = end - 1;
        }
    }

    if (changed) return { changed: true, message: "закреслено малі проміжки" };
    return { changed: false };
}

function applySimpleSpacesToColumn(col) {
    const hints = colHints[col];
    const currentCol = [];
    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    const minBlockSize = Math.min(...hints);

    for (let start = 0; start < gridSize.height; start++) {
        if (currentCol[start] === -1) {
            let end = start + 1;
            while (end < gridSize.height && currentCol[end] !== -1) {
                end++;
            }

            if (end < gridSize.height && currentCol[end] === -1) {
                const gapSize = end - start - 1;
                if (gapSize > 0 && gapSize < minBlockSize) {
                    for (let i = start + 1; i < end; i++) {
                        if (currentCol[i] === 0) {
                            gameGrid[i][col] = -1;
                            setLastChanged(i, col);
                            changed = true;
                        }
                    }
                }
            }
            start = end - 1;
        }
    }

    if (changed) return { changed: true, message: "закреслено малі проміжки" };
    return { changed: false };
}

// 4. FORCE METHOD (Метод примусу)
function applyForceToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    for (let start = 0; start < gridSize.width; start++) {
        if (currentRow[start] === 1) {
            let end = start;
            while (end < gridSize.width && currentRow[end] === 1) {
                end++;
            }
            const currentBlockSize = end - start;

            for (const hint of hints) {
                if (hint >= currentBlockSize) {
                    const needToExtend = hint - currentBlockSize;

                    const leftBlocked = start === 0 || currentRow[start - 1] === -1;
                    const rightBlocked = end === gridSize.width || currentRow[end] === -1;

                    if (leftBlocked && !rightBlocked) {
                        for (let j = end; j < Math.min(end + needToExtend, gridSize.width); j++) {
                            if (currentRow[j] === 0) {
                                gameGrid[row][j] = 1;
                                setLastChanged(row, j);
                                changed = true;
                            } else if (currentRow[j] === -1) {
                                break;
                            }
                        }
                    } else if (rightBlocked && !leftBlocked) {
                        for (let j = start - 1; j >= Math.max(start - needToExtend, 0); j--) {
                            if (currentRow[j] === 0) {
                                gameGrid[row][j] = 1;
                                setLastChanged(row, j);
                                changed = true;
                            } else if (currentRow[j] === -1) {
                                break;
                            }
                        }
                    }
                }
            }
            start = end - 1;
        }
    }

    if (changed) return { changed: true, message: "примусово завершено блоки" };
    return { changed: false };
}

function applyForceToColumn(col) {
    const hints = colHints[col];
    const currentCol = [];
    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    for (let start = 0; start < gridSize.height; start++) {
        if (currentCol[start] === 1) {
            let end = start;
            while (end < gridSize.height && currentCol[end] === 1) {
                end++;
            }
            const currentBlockSize = end - start;

            for (const hint of hints) {
                if (hint >= currentBlockSize) {
                    const needToExtend = hint - currentBlockSize;

                    const topBlocked = start === 0 || currentCol[start - 1] === -1;
                    const bottomBlocked = end === gridSize.height || currentCol[end] === -1;

                    if (topBlocked && !bottomBlocked) {
                        for (let i = end; i < Math.min(end + needToExtend, gridSize.height); i++) {
                            if (currentCol[i] === 0) {
                                gameGrid[i][col] = 1;
                                setLastChanged(i, col);
                                changed = true;
                            } else if (currentCol[i] === -1) {
                                break;
                            }
                        }
                    } else if (bottomBlocked && !topBlocked) {
                        for (let i = start - 1; i >= Math.max(start - needToExtend, 0); i--) {
                            if (currentCol[i] === 0) {
                                gameGrid[i][col] = 1;
                                setLastChanged(i, col);
                                changed = true;
                            } else if (currentCol[i] === -1) {
                                break;
                            }
                        }
                    }
                }
            }
            start = end - 1;
        }
    }

    if (changed) return { changed: true, message: "примусово завершено блоки" };
    return { changed: false };
}

// 5. GLUE TECHNIQUE (Метод склеювання)
function applyGlueToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    for (let i = 0; i < gridSize.width - 2; i++) {
        if (currentRow[i] === 1 && currentRow[i + 1] === 0 && currentRow[i + 2] === 1) {
            let leftStart = i;
            while (leftStart > 0 && currentRow[leftStart - 1] === 1) leftStart--;
            let leftSize = i - leftStart + 1;

            let rightEnd = i + 2;
            while (rightEnd < gridSize.width - 1 && currentRow[rightEnd + 1] === 1) rightEnd++;
            let rightSize = rightEnd - (i + 2) + 1;

            let totalSize = leftSize + 1 + rightSize;

            for (const hint of hints) {
                if (hint === totalSize) {
                    if (currentRow[i + 1] === 0) {
                        gameGrid[row][i + 1] = 1;
                        setLastChanged(row, i + 1);
                        changed = true;
                    }
                }
            }
        }
    }

    if (changed) return { changed: true, message: "склеїно сусідні блоки" };
    return { changed: false };
}

// 6. MERCURY TECHNIQUE
function applyMercuryToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    // Mercury зліва - якщо є заповнена клітинка на відстані рівній довжині першої підказки від краю
    const firstHint = hints[0];
    for (let j = 0; j < Math.min(firstHint, gridSize.width); j++) {
        if (currentRow[j] === 1) {
            // Перший блок не може розміститися зліва від цієї клітинки
            // тому все зліва від неї має бути пустим
            for (let k = 0; k < j; k++) {
                if (currentRow[k] === 0) {
                    gameGrid[row][k] = -1;
                    setLastChanged(row, k);
                    changed = true;
                }
            }
            break;
        }
    }

    // Mercury справа - якщо є заповнена клітинка на відстані рівній довжині останньої підказки від краю
    const lastHint = hints[hints.length - 1];
    for (let j = gridSize.width - 1; j >= Math.max(gridSize.width - lastHint, 0); j--) {
        if (currentRow[j] === 1) {
            // Останній блок не може розміститися справа від цієї клітинки
            for (let k = j + 1; k < gridSize.width; k++) {
                if (currentRow[k] === 0) {
                    gameGrid[row][k] = -1;
                    setLastChanged(row, k);
                    changed = true;
                }
            }
            break;
        }
    }

    if (changed) return { changed: true, message: "застосовано Mercury technique" };
    return { changed: false };
}

function applyMercuryToColumn(col) {
    const hints = colHints[col];
    const currentCol = [];
    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    // Mercury зверху
    const firstHint = hints[0];
    for (let i = 0; i < Math.min(firstHint, gridSize.height); i++) {
        if (currentCol[i] === 1) {
            for (let k = 0; k < i; k++) {
                if (currentCol[k] === 0) {
                    gameGrid[k][col] = -1;
                    setLastChanged(k, col);
                    changed = true;
                }
            }
            break;
        }
    }

    // Mercury знизу
    const lastHint = hints[hints.length - 1];
    for (let i = gridSize.height - 1; i >= Math.max(gridSize.height - lastHint, 0); i--) {
        if (currentCol[i] === 1) {
            for (let k = i + 1; k < gridSize.height; k++) {
                if (currentCol[k] === 0) {
                    gameGrid[k][col] = -1;
                    setLastChanged(k, col);
                    changed = true;
                }
            }
            break;
        }
    }

    if (changed) return { changed: true, message: "застосовано Mercury technique" };
    return { changed: false };
}

// 7. MAXIMUM RANGE (Максимальний діапазон)
function applyMaxRangeToRow(row) {
    const hints = rowHints[row];
    const currentRow = gameGrid[row];
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    // Для кожного блоку визначаємо найлівішу та найправішу можливу позицію
    for (let h = 0; h < hints.length; h++) {
        const blockSize = hints[h];

        // Найлівіша можлива позиція
        let leftmost = 0;
        for (let i = 0; i < h; i++) {
            leftmost += hints[i] + 1; // попередні блоки + проміжки
        }

        // Найправіша можлива позиція
        let rightmost = gridSize.width - blockSize;
        for (let i = h + 1; i < hints.length; i++) {
            rightmost -= hints[i] + 1; // наступні блоки + проміжки
        }

        // Закреслюємо все що поза діапазоном цього блоку
        if (h === 0) {
            // Для першого блоку - закреслюємо все праворуч від його максимальної позиції
            for (let j = rightmost + blockSize; j < gridSize.width; j++) {
                if (currentRow[j] === 0) {
                    gameGrid[row][j] = -1;
                    setLastChanged(row, j);
                    changed = true;
                }
            }
        }

        if (h === hints.length - 1) {
            // Для останнього блоку - закреслюємо все ліворуч від його мінімальної позиції
            for (let j = 0; j < leftmost; j++) {
                if (currentRow[j] === 0) {
                    gameGrid[row][j] = -1;
                    setLastChanged(row, j);
                    changed = true;
                }
            }
        }
    }

    if (changed) return { changed: true, message: "закреслено клітинки поза максимальним діапазоном" };
    return { changed: false };
}

function applyMaxRangeToColumn(col) {
    const hints = colHints[col];
    const currentCol = [];
    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    for (let h = 0; h < hints.length; h++) {
        const blockSize = hints[h];

        let topmost = 0;
        for (let i = 0; i < h; i++) {
            topmost += hints[i] + 1;
        }

        let bottommost = gridSize.height - blockSize;
        for (let i = h + 1; i < hints.length; i++) {
            bottommost -= hints[i] + 1;
        }

        if (h === 0) {
            for (let i = bottommost + blockSize; i < gridSize.height; i++) {
                if (currentCol[i] === 0) {
                    gameGrid[i][col] = -1;
                    setLastChanged(i, col);
                    changed = true;
                }
            }
        }

        if (h === hints.length - 1) {
            for (let i = 0; i < topmost; i++) {
                if (currentCol[i] === 0) {
                    gameGrid[i][col] = -1;
                    setLastChanged(i, col);
                    changed = true;
                }
            }
        }
    }

    if (changed) return { changed: true, message: "закреслено клітинки поза максимальним діапазоном" };
    return { changed: false };
}

function applyGlueToColumn(col) {
    const hints = colHints[col];
    const currentCol = [];
    for (let i = 0; i < gridSize.height; i++) {
        currentCol.push(gameGrid[i][col]);
    }
    let changed = false;

    if (hints.length === 0 || (hints.length === 1 && hints[0] === 0)) return { changed: false };

    for (let i = 0; i < gridSize.height - 2; i++) {
        if (currentCol[i] === 1 && currentCol[i + 1] === 0 && currentCol[i + 2] === 1) {
            let topStart = i;
            while (topStart > 0 && currentCol[topStart - 1] === 1) topStart--;
            let topSize = i - topStart + 1;

            let bottomEnd = i + 2;
            while (bottomEnd < gridSize.height - 1 && currentCol[bottomEnd + 1] === 1) bottomEnd++;
            let bottomSize = bottomEnd - (i + 2) + 1;

            let totalSize = topSize + 1 + bottomSize;

            for (const hint of hints) {
                if (hint === totalSize) {
                    if (currentCol[i + 1] === 0) {
                        gameGrid[i + 1][col] = 1;
                        setLastChanged(i + 1, col);
                        changed = true;
                    }
                }
            }
        }
    }

    if (changed) return { changed: true, message: "склеїно сусідні блоки" };
    return { changed: false };
}

// ГОЛОВНА ФУНКЦІЯ РОЗВ'ЯЗУВАННЯ
function executeRulesStep() {
    // 1. Full Lines
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyFullLinesToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule1',
                message: `Full Lines: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applyFullLinesToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule1',
                message: `Full Lines: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    // 2. Overlap Method
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyOverlapToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule2',
                message: `Overlap: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applyOverlapToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule2',
                message: `Overlap: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    // 3. Simple Spaces
    for (let i = 0; i < gridSize.height; i++) {
        const result = applySimpleSpacesToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule3',
                message: `Simple Spaces: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applySimpleSpacesToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule3',
                message: `Simple Spaces: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    // 4. Force Method
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyForceToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule4',
                message: `Force: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applyForceToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule4',
                message: `Force: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    // 5. Glue Technique
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyGlueToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule5',
                message: `Glue: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applyGlueToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule5',
                message: `Glue: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    // 6. Mercury Technique
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyMercuryToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule6',
                message: `Mercury: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applyMercuryToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule6',
                message: `Mercury: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    // 7. Maximum Range
    for (let i = 0; i < gridSize.height; i++) {
        const result = applyMaxRangeToRow(i);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule7',
                message: `Max Range: Рядок ${i + 1} - ${result.message}`
            };
        }
    }

    for (let j = 0; j < gridSize.width; j++) {
        const result = applyMaxRangeToColumn(j);
        if (result && result.changed) {
            return {
                changed: true,
                rule: 'rule7',
                message: `Max Range: Колонка ${j + 1} - ${result.message}`
            };
        }
    }

    return { changed: false };
}