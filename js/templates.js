// Шаблони японських кросвордів

function loadTemplate(template) {
    if (template === 'heart') {
        gridSize = {width: 9, height: 9};
        solution = [
            [0,1,1,0,1,1,0,0,0],
            [1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,0,0,0,0],
            [0,0,0,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0]
        ];
    } else if (template === 'star') {
        gridSize = {width: 9, height: 9};
        solution = [
            [0,0,0,0,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0],
            [0,0,0,1,1,1,0,0,0],
            [1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,0,0],
            [0,1,1,0,1,0,1,1,0],
            [1,1,0,0,1,0,0,1,1],
            [1,0,0,0,0,0,0,0,1]
        ];
    } else if (template === 'house') {
        gridSize = {width: 9, height: 9};
        solution = [
            [0,0,0,0,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1],
            [1,0,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,1,0,1],
            [1,0,1,0,0,0,1,0,1],
            [1,1,1,0,0,0,1,1,1]
        ];
    } else if (template === 'hard') {
        gridSize = {width: 5, height: 5};
        solution = [
            [1,1,0,1,1],
            [1,1,0,1,1],
            [0,0,0,0,0],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ];
    }

    calculateHints();
    createGrid();
    resetGame();
    updateDisplay();

    document.getElementById('gridWidth').value = gridSize.width;
    document.getElementById('gridHeight').value = gridSize.height;

    if (template === 'hard') {
        setTimeout(() => {
            addLogEntry('Складний шаблон - цей кросворд потребує більше правил!', 'error');
            addLogEntry('Спробуйте "Один крок" кілька разів, щоб побачити межі алгоритму', '');
            updateStatus('Складний кросворд завантажено!');
        }, 100);
    }
}