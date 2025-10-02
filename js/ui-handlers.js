// Обробники UI та автоматичне розв'язування

function updateStatus(message) {
    document.getElementById('gameStatus').textContent = message;
}

function addLogEntry(message, type = '') {
    const log = document.getElementById('algorithmLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateAlgorithmStats() {
    document.getElementById('algorithmSteps').textContent = algorithmStats.steps;
    document.getElementById('rule1Count').textContent = algorithmStats.rule1;
    document.getElementById('rule2Count').textContent = algorithmStats.rule2 || 0;
    document.getElementById('rule3Count').textContent = algorithmStats.rule3 || 0;

    let totalCells = 0;
    let correctCells = 0;

    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (solution[i][j] === 1) {
                totalCells++;
                if (gameGrid[i][j] === 1) correctCells++;
            }
        }
    }

    const successRate = totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';
}

// АВТОМАТИЧНЕ РОЗВ'ЯЗУВАННЯ
function autoSolveStep() {
    if (currentAlgorithm === 'rules') {
        // Line Solver алгоритм
        const result = executeRulesStep();
        if (result.changed) {
            algorithmStats.steps++;
            algorithmStats.rule1++;
            updateAlgorithmStats();
            addLogEntry(result.message, 'rule1');
            updateDisplay();

            if (checkIfSolved()) {
                updateStatus('Головоломку розв\'язано автоматично!');
                document.getElementById('gameStatus').className = 'status solved';
                isAutoSolving = false;
            }
        } else {
            addLogEntry('Line Solver не може продовжити.', 'error');
            isAutoSolving = false;
        }

    } else if (currentAlgorithm === 'backtrack') {
        // Backtracking алгоритм - спочатку пробуємо Line Solver
        const result = executeRulesStep();
        if (result.changed) {
            algorithmStats.steps++;
            algorithmStats.rule1++;
            updateAlgorithmStats();
            addLogEntry(result.message, 'rule1');
            updateDisplay();

            if (checkIfSolved()) {
                updateStatus('Головоломку розв\'язано з Line Solver!');
                document.getElementById('gameStatus').className = 'status solved';
                isAutoSolving = false;
            }
        } else {
            // Line Solver не може продовжити
            addLogEntry('Line Solver зупинився', 'error');

            if (!checkIfSolved()) {
                addLogEntry('Головоломка ще не розв\'язана. Запуск backtracking...', 'rule2');

                // Показуємо поточний стан перед backtracking
                let unsolvedCells = 0;
                for (let i = 0; i < gridSize.height; i++) {
                    for (let j = 0; j < gridSize.width; j++) {
                        if (gameGrid[i][j] === 0) unsolvedCells++;
                    }
                }
                addLogEntry(`Нерозв'язаних клітинок: ${unsolvedCells}`, 'rule2');

                const backtrackResult = executeBacktrackingStep();

                addLogEntry(`Backtracking результат: ${JSON.stringify(backtrackResult)}`, 'rule2');

                if (backtrackResult.changed) {
                    algorithmStats.steps++;
                    algorithmStats.rule2++;
                    updateAlgorithmStats();
                    addLogEntry(backtrackResult.message, 'rule2');
                    updateDisplay();

                    if (checkIfSolved()) {
                        updateStatus('Головоломку розв\'язано з backtracking!');
                        document.getElementById('gameStatus').className = 'status solved';
                    } else {
                        updateStatus('Backtracking виконано частково');
                    }
                } else {
                    addLogEntry(backtrackResult.message || 'Backtracking не знайшов розв\'язок', 'error');
                    updateStatus('Backtracking не зміг розв\'язати');
                }
            } else {
                addLogEntry('Головоломка вже розв\'язана!', 'rule1');
                updateStatus('Розв\'язано!');
            }
            isAutoSolving = false;
        }

    } else if (currentAlgorithm === 'and-or') {
        // І-АБО граф алгоритм
        const result = executeAndOrStep();

        if (result.changed) {
            algorithmStats.steps++;
            algorithmStats.rule3++;
            updateAlgorithmStats();
            addLogEntry(result.message, 'rule3');
            updateDisplay();

            if (checkIfSolved()) {
                updateStatus('Головоломку розв\'язано за допомогою І-АБО графа!');
                document.getElementById('gameStatus').className = 'status solved';
                isAutoSolving = false;
            }
        } else {
            if (result.finished) {
                addLogEntry(result.message || 'І-АБО граф завершив роботу', 'rule3');
                isAutoSolving = false;

                if (!checkIfSolved()) {
                    updateStatus('І-АБО граф завершено, але не розв\'язано повністю');
                }
            } else {
                addLogEntry(result.message || 'І-АБО граф продовжує роботу', 'rule3');
            }
        }

    } else {
        addLogEntry('Цей алгоритм ще не реалізований', 'error');
    }
}

function autoSolveAll() {
    if (isAutoSolving) return;

    isAutoSolving = true;
    updateStatus('Автоматичне розв\'язування...');

    function solveNext() {
        if (!isAutoSolving) return;

        // Вибір алгоритму залежно від поточного режиму
        let result;

        if (currentAlgorithm === 'rules') {
            result = executeRulesStep();

            if (result.changed) {
                algorithmStats.steps++;
                algorithmStats.rule1++;
                updateAlgorithmStats();
                addLogEntry(result.message, 'rule1');
                updateDisplay();

                if (checkIfSolved()) {
                    updateStatus('Головоломку розв\'язано автоматично!');
                    document.getElementById('gameStatus').className = 'status solved';
                    isAutoSolving = false;
                    return;
                }

                setTimeout(solveNext, autoSolveSpeed);
            } else {
                addLogEntry('Line Solver завершив роботу', 'error');
                isAutoSolving = false;
                updateStatus('Автоматичне розв\'язування зупинено');
            }

        } else if (currentAlgorithm === 'backtrack') {
            // Спочатку пробуємо Line Solver
            result = executeRulesStep();

            if (result.changed) {
                algorithmStats.steps++;
                algorithmStats.rule1++;
                updateAlgorithmStats();
                addLogEntry(result.message, 'rule1');
                updateDisplay();

                if (checkIfSolved()) {
                    updateStatus('Головоломку розв\'язано!');
                    document.getElementById('gameStatus').className = 'status solved';
                    isAutoSolving = false;
                    return;
                }

                setTimeout(solveNext, autoSolveSpeed);
            } else {
                // Line Solver зупинився - запускаємо backtracking
                if (!checkIfSolved()) {
                    addLogEntry('Line Solver зупинився. Запуск backtracking...', 'rule2');

                    const backtrackResult = executeBacktrackingStep();

                    if (backtrackResult.changed) {
                        algorithmStats.steps++;
                        algorithmStats.rule2++;
                        updateAlgorithmStats();
                        addLogEntry(backtrackResult.message, 'rule2');
                        updateDisplay();

                        if (checkIfSolved()) {
                            updateStatus('Головоломку розв\'язано з backtracking!');
                            document.getElementById('gameStatus').className = 'status solved';
                        }
                    } else {
                        addLogEntry(backtrackResult.message || 'Backtracking не знайшов розв\'язок', 'error');
                    }
                }
                isAutoSolving = false;
                updateStatus('Автоматичне розв\'язування завершено');
            }

        } else if (currentAlgorithm === 'and-or') {
            result = executeAndOrStep();

            if (result.changed) {
                algorithmStats.steps++;
                algorithmStats.rule3++;
                updateAlgorithmStats();
                addLogEntry(result.message, 'rule3');
                updateDisplay();

                if (checkIfSolved()) {
                    updateStatus('Головоломку розв\'язано автоматично!');
                    document.getElementById('gameStatus').className = 'status solved';
                    isAutoSolving = false;
                    return;
                }

                setTimeout(solveNext, autoSolveSpeed);
            } else {
                if (result.finished) {
                    addLogEntry('І-АБО граф завершив роботу', 'rule3');
                } else {
                    addLogEntry('Алгоритм завершив роботу', 'error');
                }
                isAutoSolving = false;
                updateStatus('Автоматичне розв\'язування зупинено');
            }
        }
    }

    solveNext();
}

function pauseAutoSolve() {
    isAutoSolving = false;
    updateStatus('Автоматичне розв\'язування на паузі');
}

function resetAutoSolve() {
    isAutoSolving = false;
    algorithmStats = { steps: 0, rule1: 0, rule2: 0, rule3: 0 };
    andOrState = null;
    updateAlgorithmStats();
    document.getElementById('algorithmLog').innerHTML = '';
    clearGrid();
    updateStatus('Алгоритм скинуто');
}

function getHint() {
    const result = executeRulesStep();
    if (result.changed) {
        updateDisplay();
        addLogEntry(result.message, result.rule);
    } else {
        addLogEntry('Не вдається знайти очевидний наступний крок', 'error');
    }
}

function switchGameMode(mode) {
    currentGameMode = mode;

    document.querySelectorAll('.mode-switch-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(mode + '-mode').classList.add('active');

    const autoStats = document.getElementById('auto-stats');
    const logSection = document.getElementById('algorithm-log-section');

    if (mode === 'auto') {
        autoStats.style.display = 'block';
        logSection.style.display = 'block';
        updateStatus('Автоматичний режим - натисніть "Один крок" або "Розв\'язати все"');
    } else {
        autoStats.style.display = 'none';
        logSection.style.display = 'none';
        updateStatus('Ручний режим - Використовуйте підказки для заповнення сітки');
    }
}

function setupModeSwitcher() {
    document.querySelectorAll('.mode-switch-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            switchGameMode(mode);
        });
    });
}

function setupAlgorithmSelector() {
    document.querySelectorAll('.algorithm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('disabled')) {
                return;
            }

            document.querySelectorAll('.algorithm-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentAlgorithm = this.dataset.algorithm;

            const algorithmNames = {
                'rules': 'Line Solver',
                'backtrack': 'Line Solver + Backtracking',
                'and-or': 'І-АБО граф'
            };

            addLogEntry(`Обрано алгоритм: ${algorithmNames[currentAlgorithm]}`, '');

            // Скидаємо стан І-АБО графа при зміні алгоритму
            if (currentAlgorithm !== 'and-or') {
                andOrState = null;
            }
        });
    });
}

function setupSpeedControl() {
    const slider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');

    slider.addEventListener('input', function() {
        autoSolveSpeed = parseInt(this.value);
        speedValue.textContent = autoSolveSpeed + 'мс';
    });
}

function setupModeSelector() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
        });
    });
}

function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }, 1000);
}