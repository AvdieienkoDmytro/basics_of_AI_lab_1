// Логіка гри та розрахунки

function calculateHints() {
    rowHints = [];
    for (let i = 0; i < gridSize.height; i++) {
        const hints = [];
        let count = 0;
        for (let j = 0; j < gridSize.width; j++) {
            if (solution[i][j] === 1) {
                count++;
            } else {
                if (count > 0) {
                    hints.push(count);
                    count = 0;
                }
            }
        }
        if (count > 0) hints.push(count);
        if (hints.length === 0) hints.push(0);
        rowHints.push(hints);
    }

    colHints = [];
    for (let j = 0; j < gridSize.width; j++) {
        const hints = [];
        let count = 0;
        for (let i = 0; i < gridSize.height; i++) {
            if (solution[i][j] === 1) {
                count++;
            } else {
                if (count > 0) {
                    hints.push(count);
                    count = 0;
                }
            }
        }
        if (count > 0) hints.push(count);
        if (hints.length === 0) hints.push(0);
        colHints.push(hints);
    }
}

function generateRandomPuzzle() {
    solution = Array(gridSize.height).fill().map(() => Array(gridSize.width).fill(0));

    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            solution[i][j] = Math.random() < 0.4 ? 1 : 0;
        }
    }

    calculateHints();
    resetGame();
}

function createGrid() {
    const gridElement = document.getElementById('gameGrid');
    gridElement.style.gridTemplateColumns = `repeat(${gridSize.width}, 1fr)`;
    gridElement.innerHTML = '';

    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => handleCellClick(i, j));
            gridElement.appendChild(cell);
        }
    }

    const rowHintsContainer = document.getElementById('rowHints');
    rowHintsContainer.innerHTML = '';
    for (let i = 0; i < gridSize.height; i++) {
        const rowHintDiv = document.createElement('div');
        rowHintDiv.className = 'row-hint';
        rowHints[i].forEach(hint => {
            const hintSpan = document.createElement('span');
            hintSpan.className = 'hint';
            hintSpan.textContent = hint;
            rowHintDiv.appendChild(hintSpan);
        });
        rowHintsContainer.appendChild(rowHintDiv);
    }

    const colHintsContainer = document.getElementById('colHints');
    colHintsContainer.innerHTML = '';
    for (let j = 0; j < gridSize.width; j++) {
        const colHintDiv = document.createElement('div');
        colHintDiv.className = 'col-hint-container';
        colHints[j].forEach(hint => {
            const hintSpan = document.createElement('span');
            hintSpan.className = 'hint';
            hintSpan.textContent = hint;
            colHintDiv.appendChild(hintSpan);
        });
        colHintsContainer.appendChild(colHintDiv);
    }
}

function handleCellClick(row, col) {
    if (currentGameMode === 'auto') return;

    if (currentMode === 'fill') {
        gameGrid[row][col] = gameGrid[row][col] === 1 ? 0 : 1;
    } else if (currentMode === 'cross') {
        gameGrid[row][col] = gameGrid[row][col] === -1 ? 0 : -1;
    } else if (currentMode === 'clear') {
        gameGrid[row][col] = 0;
    }
    updateDisplay();
}

function updateDisplay() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = gameGrid[row][col];

        cell.className = 'cell';
        if (value === 1) {
            cell.classList.add('filled');
        } else if (value === -1) {
            cell.classList.add('crossed');
        }

        if (lastChangedCell && lastChangedCell.row === row && lastChangedCell.col === col) {
            cell.classList.add('last-changed');
            setTimeout(() => {
                cell.classList.remove('last-changed');
                lastChangedCell = null;
            }, 1000);
        }
    });

    updateProgress();
}

function updateProgress() {
    let filled = 0;
    let total = 0;
    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (solution[i][j] === 1) {
                total++;
                if (gameGrid[i][j] === 1) filled++;
            }
        }
    }
    const progress = total > 0 ? Math.round((filled / total) * 100) : 0;
    document.getElementById('progress').textContent = progress + '%';
    document.getElementById('errors').textContent = errors;
}

function checkSolution() {
    let correct = true;
    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (gameGrid[i][j] === 1 && solution[i][j] !== 1) {
                correct = false;
                errors++;
            }
            if (gameGrid[i][j] !== -1 && solution[i][j] === 1 && gameGrid[i][j] !== 1) {
                correct = false;
            }
        }
    }

    const statusElement = document.getElementById('gameStatus');
    if (correct) {
        statusElement.textContent = 'Вітаємо! Головоломку розв\'язано!';
        statusElement.className = 'status solved';
    } else {
        statusElement.textContent = 'Є помилки. Продовжуйте спроби!';
        statusElement.className = 'status playing';
    }
    updateDisplay();
}

function clearGrid() {
    if (currentGameMode === 'manual' && !confirm('Очистити всю сітку?')) return;
    resetGame();
}

function createCustomGrid() {
    const width = parseInt(document.getElementById('gridWidth').value);
    const height = parseInt(document.getElementById('gridHeight').value);

    if (width < 5 || width > 20 || height < 5 || height > 20) {
        alert('Розмір має бути від 5 до 20');
        return;
    }

    gridSize = {width, height};
    generateRandomPuzzle();
    createGrid();
    updateDisplay();
}

function newGame() {
    loadTemplate('star');
}