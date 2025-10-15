// input.js
class InputManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        canvas.addEventListener('click', (event) => this.handleClick(event));
        
        window.addEventListener('keydown', (event) => {
            keys[event.code] = true;
            this.handleKeyDown(event);
        });

        window.addEventListener('keyup', (event) => {
            keys[event.code] = false;
        });

        // Button event listeners
        document.getElementById('startButton').addEventListener('click', () => game.init());
        document.getElementById('restartButton').addEventListener('click', () => game.restart());
        document.getElementById('nextLevelButton').addEventListener('click', () => game.nextLevel());
        document.getElementById('resumeButton').addEventListener('click', () => game.pause());
        document.getElementById('pauseRestartButton').addEventListener('click', () => game.restart());
        document.getElementById('mainMenuButton').addEventListener('click', () => game.returnToMenu());
        document.getElementById('pauseMenuButton').addEventListener('click', () => game.returnToMenu());
    }

    handleClick(event) {
        if (!game.gameActive || !game.gameStarted || game.isPaused) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        game.shootBullet(x, y);
    }

    handleKeyDown(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                if (game.gameActive && game.gameStarted) {
                    game.pause();
                }
                break;
            case 'KeyR':
                if (game.gameStarted) {
                    game.restart();
                }
                break;
            case 'Escape':
                if (game.gameActive && game.gameStarted) {
                    game.pause();
                }
                break;
        }
    }
}