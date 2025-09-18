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
        const result = executeRulesStep();
        if (result.changed) {
            algorithmStats.steps++;
            algorithmStats[result.rule]++;
            updateAlgorithmStats();
            addLogEntry(result.message, result.rule);
            updateDisplay();

            if (checkIfSolved()) {
                updateStatus('Головоломку розв\'язано автоматично!');
                document.getElementById('gameStatus').className = 'status solved';
                isAutoSolving = false;
            }
        } else {
            addLogEntry('Line Solver не може продовжити. Потрібен backtracking.', 'error');
            isAutoSolving = false;
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

        const result = executeRulesStep();
        if (result.changed) {
            algorithmStats.steps++;
            algorithmStats[result.rule]++;
            updateAlgorithmStats();
            addLogEntry(result.message, result.rule);
            updateDisplay();

            if (checkIfSolved()) {
                updateStatus('Головоломку розв\'язано автоматично!');
                document.getElementById('gameStatus').className = 'status solved';
                isAutoSolving = false;
                return;
            }

            setTimeout(solveNext, autoSolveSpeed);
        } else {
            addLogEntry('Line Solver завершив роботу. Потрібен backtracking.', 'error');
            isAutoSolving = false;
            updateStatus('Автоматичне розв\'язування зупинено');
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
    algorithmStats = { steps: 0, rule1: 0 };
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
                if (this.dataset.algorithm === 'backtrack') {
                    addLogEntry('Алгоритм з backtracking буде реалізований пізніше', 'error');
                } else if (this.dataset.algorithm === 'and-or') {
                    addLogEntry('Алгоритм з І-АБО графами буде реалізований пізніше', 'error');
                }
                return;
            }

            document.querySelectorAll('.algorithm-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentAlgorithm = this.dataset.algorithm;
            addLogEntry(`Обрано алгоритм: ${this.textContent.trim()}`, '');
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