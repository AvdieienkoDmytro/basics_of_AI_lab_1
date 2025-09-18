// Глобальні змінні стану гри
let currentMode = 'fill';
let currentGameMode = 'manual';
let currentAlgorithm = 'rules';
let gridSize = {width: 10, height: 10};
let gameGrid = [];
let solution = [];
let rowHints = [];
let colHints = [];
let gameStartTime = Date.now();
let errors = 0;
let algorithmStats = {
    steps: 0,
    rule1: 0
};
let isAutoSolving = false;
let autoSolveSpeed = 800;
let lastChangedCell = null;

// Допоміжні функції для керування станом
function resetGame() {
    gameGrid = Array(gridSize.height).fill().map(() => Array(gridSize.width).fill(0));
    gameStartTime = Date.now();
    errors = 0;
    algorithmStats = { steps: 0, rule1: 0 };
    updateAlgorithmStats();
    document.getElementById('algorithmLog').innerHTML = '';
    lastChangedCell = null;
    isAutoSolving = false;
    updateDisplay();
}

function setLastChanged(row, col) {
    lastChangedCell = {row, col};
}

function checkIfSolved() {
    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++) {
            if (solution[i][j] === 1 && gameGrid[i][j] !== 1) {
                return false;
            }
            if (solution[i][j] === 0 && gameGrid[i][j] === 1) {
                return false;
            }
        }
    }
    return true;
}