// Головний файл ініціалізації

document.addEventListener('DOMContentLoaded', function() {
    setupModeSelector();
    setupModeSwitcher();
    setupAlgorithmSelector();
    setupSpeedControl();
    newGame();
    startTimer();

    // Початкове повідомлення
    addLogEntry('Система готова до роботи', '');
    addLogEntry('Оберіть режим та почніть гру!', '');
});