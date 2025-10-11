/**
 * Game Management - Master game clock, quarters, and global controls
 * Handles the main game timer and coordination between all penalty timers
 */

class GameManager {
    constructor() {
        this.gameClockInterval = null;
        this.gameTime = 0; // in seconds
        this.quarterLength = 15 * 60; // 15 minutes default
        this.currentQuarter = 1;
        this.maxQuarters = 4;
        this.isGamePaused = false;
        this.gameStarted = false;
        this.init();
    }

    init() {
        this.createGameClockUI();
        this.setupGameControls();
        this.loadGameSettings();
        console.log('Game Manager initialized');
    }

    createGameClockUI() {
        // Create game clock container
        const gameClockContainer = document.createElement('div');
        gameClockContainer.id = 'gameClockContainer';
        gameClockContainer.className = 'game-clock-container';
        
        gameClockContainer.innerHTML = `
            <div class="game-clock-display">
                <div class="quarter-display">
                    <span id="quarterText">Quarter 1</span>
                </div>
                <div class="main-clock">
                    <span id="gameTimeDisplay">15:00</span>
                </div>
                <div class="game-controls">
                    <button id="startPauseGame" class="game-control-btn start-pause-btn">
                        <i class="fas fa-play"></i> Start Game
                    </button>
                    <button id="restartGame" class="game-control-btn restart-btn">
                        <i class="fas fa-redo"></i> Restart Game
                    </button>
                    <button id="nextQuarter" class="game-control-btn next-quarter-btn">
                        <i class="fas fa-forward"></i> Next Quarter
                    </button>
                    <button id="gameSettings" class="game-control-btn settings-btn">
                        <i class="fas fa-cog"></i> Game Settings
                    </button>
                </div>
            </div>
        `;

        // Insert after header
        const header = document.querySelector('header');
        if (header) {
            header.after(gameClockContainer);
        }

        // Add event listeners
        this.setupGameEventListeners();
    }

    setupGameEventListeners() {
        document.getElementById('startPauseGame').addEventListener('click', () => {
            this.toggleGameClock();
        });

        document.getElementById('restartGame').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('nextQuarter').addEventListener('click', () => {
            this.nextQuarter();
        });

        document.getElementById('gameSettings').addEventListener('click', () => {
            this.showGameSettings();
        });
    }

    setupGameControls() {
        // Move existing control buttons to work with game state
        const originalStartAll = window.startAllTimers;
        const originalStopAll = window.stopAllTimers;

        window.startAllTimers = () => {
            if (!this.isGamePaused) {
                originalStartAll();
            }
        };

        window.stopAllTimers = () => {
            originalStopAll();
        };
    }

    toggleGameClock() {
        if (!this.gameStarted) {
            this.startGame();
        } else if (this.isGamePaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    startGame() {
        this.gameStarted = true;
        this.isGamePaused = false;
        this.gameTime = this.quarterLength;
        
        this.gameClockInterval = setInterval(() => {
            if (this.gameTime <= 0) {
                this.endQuarter();
            } else {
                this.gameTime--;
                this.updateGameDisplay();
            }
        }, 1000);

        this.updateGameControls();
        console.log('Game started');
    }

    pauseGame() {
        this.isGamePaused = true;
        
        // Pause all penalty timers
        if (window.laxTimer) {
            laxTimer.stopAllTimers();
        }
        
        // Don't clear the game clock interval, just pause it
        clearInterval(this.gameClockInterval);
        this.gameClockInterval = null;
        
        this.updateGameControls();
        console.log('Game paused - all timers stopped');
    }

    resumeGame() {
        this.isGamePaused = false;
        
        // Resume game clock
        this.gameClockInterval = setInterval(() => {
            if (this.gameTime <= 0) {
                this.endQuarter();
            } else {
                this.gameTime--;
                this.updateGameDisplay();
            }
        }, 1000);
        
        this.updateGameControls();
        console.log('Game resumed');
    }

    restartGame() {
        if (window.laxTimerSettings && laxTimerSettings.getSetting('confirmActions')) {
            if (!confirm('Restart the entire game? This will reset everything including the scoreboard.')) {
                return;
            }
        }

        // Reset everything
        this.stopGame();
        this.currentQuarter = 1;
        this.gameTime = this.quarterLength;
        this.gameStarted = false;
        this.isGamePaused = false;

        // Reset all penalty timers
        if (window.timerUtils) {
            timerUtils.clearAllTimers();
        }

        // Reset scoreboard
        if (window.scoreboard) {
            scoreboard.resetScores();
        }

        this.updateGameDisplay();
        this.updateGameControls();
        console.log('Game restarted');
    }

    nextQuarter() {
        if (this.currentQuarter >= this.maxQuarters) {
            alert('Game is complete! Use "Restart Game" to start a new game.');
            return;
        }

        if (window.laxTimerSettings && laxTimerSettings.getSetting('confirmActions')) {
            if (!confirm(`Start Quarter ${this.currentQuarter + 1}? The game clock will reset but penalty timers will continue.`)) {
                return;
            }
        }

        this.currentQuarter++;
        this.gameTime = this.quarterLength;
        this.gameStarted = false;
        this.isGamePaused = false;

        // Stop game clock but keep penalty timers running
        this.stopGame();

        this.updateGameDisplay();
        this.updateGameControls();
        console.log(`Starting Quarter ${this.currentQuarter}`);
    }

    endQuarter() {
        this.stopGame();
        
        if (this.currentQuarter >= this.maxQuarters) {
            alert('Game Over! Final quarter completed.');
        } else {
            alert(`Quarter ${this.currentQuarter} ended! Start the next quarter when ready.`);
        }
    }

    stopGame() {
        if (this.gameClockInterval) {
            clearInterval(this.gameClockInterval);
            this.gameClockInterval = null;
        }
        this.updateGameControls();
    }

    updateGameDisplay() {
        const timeDisplay = document.getElementById('gameTimeDisplay');
        const quarterDisplay = document.getElementById('quarterText');
        
        if (timeDisplay) {
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Visual warning for last minute
            if (this.gameTime <= 60 && this.gameTime > 0) {
                timeDisplay.style.color = '#dc3545';
                timeDisplay.style.animation = 'pulse 1s infinite';
            } else {
                timeDisplay.style.color = '';
                timeDisplay.style.animation = '';
            }
        }

        if (quarterDisplay) {
            quarterDisplay.textContent = `Quarter ${this.currentQuarter}`;
        }
    }

    updateGameControls() {
        const startPauseBtn = document.getElementById('startPauseGame');
        
        if (startPauseBtn) {
            if (!this.gameStarted) {
                startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
                startPauseBtn.className = 'game-control-btn start-pause-btn';
            } else if (this.isGamePaused) {
                startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume Game';
                startPauseBtn.className = 'game-control-btn start-pause-btn';
            } else {
                startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Game';
                startPauseBtn.className = 'game-control-btn pause-btn';
            }
        }
    }

    showGameSettings() {
        // Create game settings modal
        const modal = document.createElement('div');
        modal.id = 'gameSettingsModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="gameManager.hideGameSettings()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2><i class="fas fa-cog"></i> Game Settings</h2>
                        <button class="modal-close" onclick="gameManager.hideGameSettings()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <label for="quarterLength">Quarter Length (minutes):</label>
                            <input type="number" id="quarterLength" value="${this.quarterLength / 60}" min="1" max="30">
                        </div>
                        <div class="setting-group">
                            <label for="maxQuarters">Number of Quarters:</label>
                            <select id="maxQuarters">
                                <option value="2" ${this.maxQuarters === 2 ? 'selected' : ''}>2 (Halves)</option>
                                <option value="4" ${this.maxQuarters === 4 ? 'selected' : ''}>4 (Quarters)</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="gameManager.hideGameSettings()">Cancel</button>
                        <button class="btn-primary" onclick="gameManager.saveGameSettings()">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    hideGameSettings() {
        const modal = document.getElementById('gameSettingsModal');
        if (modal) {
            modal.remove();
        }
    }

    saveGameSettings() {
        const quarterLengthInput = document.getElementById('quarterLength');
        const maxQuartersSelect = document.getElementById('maxQuarters');

        if (quarterLengthInput) {
            const newLength = parseInt(quarterLengthInput.value) * 60;
            if (newLength > 0) {
                this.quarterLength = newLength;
                if (!this.gameStarted) {
                    this.gameTime = this.quarterLength;
                    this.updateGameDisplay();
                }
            }
        }

        if (maxQuartersSelect) {
            this.maxQuarters = parseInt(maxQuartersSelect.value);
        }

        this.saveGameSettingsToStorage();
        this.hideGameSettings();
    }

    loadGameSettings() {
        try {
            const saved = localStorage.getItem('laxTimer_gameSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.quarterLength = settings.quarterLength || (15 * 60);
                this.maxQuarters = settings.maxQuarters || 4;
                this.gameTime = this.quarterLength;
                this.updateGameDisplay();
            }
        } catch (error) {
            console.warn('Failed to load game settings:', error);
        }
    }

    saveGameSettingsToStorage() {
        try {
            const settings = {
                quarterLength: this.quarterLength,
                maxQuarters: this.maxQuarters
            };
            localStorage.setItem('laxTimer_gameSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save game settings:', error);
        }
    }

    isGameActive() {
        return this.gameStarted && !this.isGamePaused;
    }

    getCurrentQuarter() {
        return this.currentQuarter;
    }

    getGameTime() {
        return this.gameTime;
    }
}

// Initialize game manager
let gameManager;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other components to load
    setTimeout(() => {
        gameManager = new GameManager();
    }, 100);
});