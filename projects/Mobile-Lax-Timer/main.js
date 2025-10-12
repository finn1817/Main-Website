/**
 * LaxTimer - Main Application Controller
 * Handles the flow between team setup and game management
 */

class LaxTimerApp {
    constructor() {
        this.gameState = {
            isSetup: true,
            isGameActive: false,
            isPaused: true,
            homeTeam: '',
            awayTeam: '',
            homeScore: 0,
            awayScore: 0,
            currentQuarter: 1,
            quarterLength: 12 * 60, // 12 minutes in seconds
            gameTimeRemaining: 12 * 60,
            activeGameTime: 0,
            maxQuarters: 4
        };
        
        this.timers = new Map(); // Store penalty timers
        this.timerIdCounter = 1;
        this.gameInterval = null;
        this.settings = this.loadSettings();
        
        this.init();
    }
    
    init() {
        console.log('LaxTimer initializing...');
        this.setupEventListeners();
        this.applySettings();
        this.showTeamSetup();
    }
    
    setupEventListeners() {
        // Team setup
        const team1Input = document.getElementById('team1Name');
        const team2Input = document.getElementById('team2Name');
        const startGameBtn = document.getElementById('startGameBtn');
        
        team1Input.addEventListener('input', () => this.validateTeamInputs());
        team2Input.addEventListener('input', () => this.validateTeamInputs());
        startGameBtn.addEventListener('click', () => this.startGame());
        
        // Game controls
        document.getElementById('startPauseBtn').addEventListener('click', () => this.toggleGameClock());
        document.getElementById('nextQuarterBtn').addEventListener('click', () => this.nextQuarter());
        document.getElementById('restartGameBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('addTimerBtn').addEventListener('click', () => this.showTimerModal());
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('penaltyDuration').addEventListener('change', () => this.toggleCustomTime());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Allow Enter key to submit team names
        team1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.validateTeamInputs(true)) {
                this.startGame();
            }
        });
        team2Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.validateTeamInputs(true)) {
                this.startGame();
            }
        });
    }
    
    validateTeamInputs() {
        const team1 = document.getElementById('team1Name').value.trim();
        const team2 = document.getElementById('team2Name').value.trim();
        const isValid = team1.length > 0 && team2.length > 0 && team1 !== team2;
        
        document.getElementById('startGameBtn').disabled = !isValid;
        return isValid;
    }
    
    showTeamSetup() {
        document.getElementById('teamSetupScreen').classList.add('active');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('team1Name').focus();
    }
    
    startGame() {
        if (!this.validateTeamInputs()) return;
        
        // Get team names
        this.gameState.homeTeam = document.getElementById('team1Name').value.trim();
        this.gameState.awayTeam = document.getElementById('team2Name').value.trim();
        
        // Update displays
        document.getElementById('homeTeamDisplay').textContent = this.gameState.homeTeam;
        document.getElementById('awayTeamDisplay').textContent = this.gameState.awayTeam;
        
        // Update penalty team options
        const penaltyTeamSelect = document.getElementById('penaltyTeam');
        penaltyTeamSelect.innerHTML = `
            <option value="home">${this.gameState.homeTeam}</option>
            <option value="away">${this.gameState.awayTeam}</option>
        `;
        
        // Switch to game screen
        document.getElementById('teamSetupScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        
        this.gameState.isSetup = false;
        this.resetGameState();
        this.updateGameDisplay();
        
        this.showNotification('Game setup complete! Click Start to begin the clock.', 'success');
    }
    
    resetGameState() {
        this.gameState.currentQuarter = 1;
        this.gameState.quarterLength = this.settings.quarterLength * 60;
        this.gameState.gameTimeRemaining = this.gameState.quarterLength;
        this.gameState.activeGameTime = 0;
        this.gameState.homeScore = 0;
        this.gameState.awayScore = 0;
        this.gameState.isGameActive = false;
        this.gameState.isPaused = true;
        
        // Clear all penalty timers
        this.clearAllTimers();
        
        this.updateGameDisplay();
        this.updateScoreboard();
    }
    
    toggleGameClock() {
        if (this.gameState.isPaused) {
            this.startGameClock();
        } else {
            this.pauseGameClock();
        }
    }
    
    startGameClock() {
        this.gameState.isGameActive = true;
        this.gameState.isPaused = false;
        
        this.gameInterval = setInterval(() => {
            this.gameState.gameTimeRemaining--;
            this.gameState.activeGameTime++;
            
            this.updateGameDisplay();
            
            if (this.gameState.gameTimeRemaining <= 0) {
                this.endQuarter();
            }
        }, 1000);
        
        // Resume all penalty timers
        this.timers.forEach(timer => {
            if (!timer.isExpired) {
                timer.resume();
            }
        });
        
        this.updateGameControls();
        this.showNotification('Game clock started!', 'info');
    }
    
    pauseGameClock() {
        this.gameState.isPaused = true;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        // Pause all penalty timers
        this.timers.forEach(timer => timer.pause());
        
        this.updateGameControls();
        this.showNotification('Game clock paused!', 'info');
    }
    
    endQuarter() {
        this.pauseGameClock();
        
        if (this.gameState.currentQuarter >= this.gameState.maxQuarters) {
            this.endGame();
        } else {
            this.showNotification(`Quarter ${this.gameState.currentQuarter} ended!`, 'warning');
        }
    }
    
    nextQuarter() {
        if (this.gameState.currentQuarter >= this.gameState.maxQuarters) {
            this.endGame();
            return;
        }
        
        this.gameState.currentQuarter++;
        this.gameState.gameTimeRemaining = this.gameState.quarterLength;
        this.gameState.isPaused = true;
        
        // Clear expired penalty timers
        this.clearExpiredTimers();
        
        this.updateGameDisplay();
        this.updateGameControls();
        
        this.showNotification(`Starting Quarter ${this.gameState.currentQuarter}`, 'success');
    }
    
    endGame() {
        this.pauseGameClock();
        this.clearAllTimers();
        
        const winner = this.gameState.homeScore > this.gameState.awayScore ? 
            this.gameState.homeTeam : 
            this.gameState.awayScore > this.gameState.homeScore ? 
            this.gameState.awayTeam : 'Tie';
        
        const message = winner === 'Tie' ? 
            'Game ended in a tie!' : 
            `${winner} wins ${Math.max(this.gameState.homeScore, this.gameState.awayScore)}-${Math.min(this.gameState.homeScore, this.gameState.awayScore)}!`;
        
        this.showNotification(message, 'success');
    }
    
    restartGame() {
        if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
            this.pauseGameClock();
            this.resetGameState();
            this.showNotification('Game restarted!', 'info');
        }
    }
    
    adjustScore(team, change) {
        if (team === 'home') {
            this.gameState.homeScore = Math.max(0, this.gameState.homeScore + change);
        } else {
            this.gameState.awayScore = Math.max(0, this.gameState.awayScore + change);
        }
        this.updateScoreboard();
        this.saveGameState();
    }
    
    updateGameDisplay() {
        // Update quarter
        document.getElementById('quarterText').textContent = `Quarter ${this.gameState.currentQuarter}`;
        
        // Update game clock (countdown)
        const gameMinutes = Math.floor(this.gameState.gameTimeRemaining / 60);
        const gameSeconds = this.gameState.gameTimeRemaining % 60;
        document.getElementById('gameClockDisplay').textContent = 
            `${gameMinutes.toString().padStart(2, '0')}:${gameSeconds.toString().padStart(2, '0')}`;
        
        // Update active time (count up)
        const activeMinutes = Math.floor(this.gameState.activeGameTime / 60);
        const activeSeconds = this.gameState.activeGameTime % 60;
        document.getElementById('activeTimeDisplay').textContent = 
            `${activeMinutes.toString().padStart(2, '0')}:${activeSeconds.toString().padStart(2, '0')}`;
    }
    
    updateScoreboard() {
        document.getElementById('homeScore').textContent = this.gameState.homeScore;
        document.getElementById('awayScore').textContent = this.gameState.awayScore;
    }
    
    updateGameControls() {
        const startPauseBtn = document.getElementById('startPauseBtn');
        if (this.gameState.isPaused) {
            startPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            startPauseBtn.classList.remove('pause');
        } else {
            startPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            startPauseBtn.classList.add('pause');
        }
    }
    
    showTimerModal() {
        document.getElementById('timerModal').style.display = 'flex';
        document.getElementById('playerNumber').focus();
    }
    
    closeTimerModal() {
        document.getElementById('timerModal').style.display = 'none';
        // Reset form
        document.getElementById('playerNumber').value = '';
        document.getElementById('penaltyType').value = '';
        document.getElementById('penaltyDuration').value = '120'; // 2 minutes default
        document.getElementById('customTimeGroup').style.display = 'none';
    }
    
    toggleCustomTime() {
        const duration = document.getElementById('penaltyDuration').value;
        const customGroup = document.getElementById('customTimeGroup');
        
        if (duration === 'custom') {
            customGroup.style.display = 'block';
            document.getElementById('customMinutes').focus();
        } else {
            customGroup.style.display = 'none';
        }
    }
    
    createTimer() {
        const playerNumber = document.getElementById('playerNumber').value.trim();
        const penaltyType = document.getElementById('penaltyType').value.trim();
        const team = document.getElementById('penaltyTeam').value;
        const duration = document.getElementById('penaltyDuration').value;
        
        if (!playerNumber || !penaltyType) {
            this.showNotification('Please fill in player number and penalty type!', 'error');
            return;
        }
        
        let totalSeconds;
        if (duration === 'custom') {
            const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
            const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
            totalSeconds = minutes * 60 + seconds;
            
            if (totalSeconds <= 0) {
                this.showNotification('Please enter a valid custom time!', 'error');
                return;
            }
        } else {
            totalSeconds = parseInt(duration);
        }
        
        const timer = new PenaltyTimer({
            id: this.timerIdCounter++,
            playerNumber,
            penaltyType,
            team,
            duration: totalSeconds,
            teamName: team === 'home' ? this.gameState.homeTeam : this.gameState.awayTeam,
            isPaused: this.gameState.isPaused,
            onExpire: (timerId) => this.onTimerExpired(timerId),
            onUpdate: (timerId) => this.onTimerUpdate(timerId)
        });
        
        this.timers.set(timer.id, timer);
        this.renderTimer(timer);
        this.closeTimerModal();
        
        this.showNotification(`Penalty timer created for #${playerNumber}`, 'success');
    }
    
    renderTimer(timer) {
        const container = document.getElementById('penaltyTimersContainer');
        const timerElement = timer.createElement();
        container.appendChild(timerElement);
    }
    
    onTimerExpired(timerId) {
        const timer = this.timers.get(timerId);
        if (timer) {
            this.showNotification(`Penalty expired: #${timer.playerNumber} (${timer.penaltyType})`, 'warning');
            if (this.settings.soundEnabled) {
                this.playSound('complete');
            }
        }
    }
    
    onTimerUpdate(timerId) {
        // Timer updates are handled by the timer itself
        // This could be used for additional game logic if needed
    }
    
    removeTimer(timerId) {
        const timer = this.timers.get(timerId);
        if (timer) {
            timer.destroy();
            this.timers.delete(timerId);
        }
    }
    
    clearAllTimers() {
        this.timers.forEach(timer => timer.destroy());
        this.timers.clear();
        document.getElementById('penaltyTimersContainer').innerHTML = '';
    }
    
    clearExpiredTimers() {
        this.timers.forEach(timer => {
            if (timer.isExpired) {
                this.removeTimer(timer.id);
            }
        });
    }
    
    handleKeyboard(e) {
        // Space bar - toggle game clock
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (!this.gameState.isSetup) {
                this.toggleGameClock();
            }
        }
        
        // Escape - close modals
        if (e.key === 'Escape') {
            this.closeTimerModal();
            this.closeSettings();
        }
    }
    
    showSettings() {
        document.getElementById('settingsModal').style.display = 'flex';
        document.getElementById('quarterLengthSetting').value = this.settings.quarterLength;
        document.getElementById('soundEnabledSetting').checked = this.settings.soundEnabled;
        document.getElementById('autoSaveSetting').checked = this.settings.autoSave;
    }
    
    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }
    
    saveSettings() {
        this.settings.quarterLength = parseInt(document.getElementById('quarterLengthSetting').value);
        this.settings.soundEnabled = document.getElementById('soundEnabledSetting').checked;
        this.settings.autoSave = document.getElementById('autoSaveSetting').checked;
        
        localStorage.setItem('laxTimer_settings', JSON.stringify(this.settings));
        this.applySettings();
        this.closeSettings();
        
        this.showNotification('Settings saved!', 'success');
    }
    
    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            this.settings = this.getDefaultSettings();
            localStorage.removeItem('laxTimer_settings');
            this.applySettings();
            this.showSettings(); // Refresh the modal
            this.showNotification('Settings reset to defaults!', 'info');
        }
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('laxTimer_settings');
            return saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            quarterLength: 12, // minutes
            soundEnabled: true,
            autoSave: true
        };
    }
    
    applySettings() {
        if (!this.gameState.isGameActive) {
            this.gameState.quarterLength = this.settings.quarterLength * 60;
            this.gameState.gameTimeRemaining = this.gameState.quarterLength;
            this.updateGameDisplay();
        }
    }
    
    saveGameState() {
        if (this.settings.autoSave) {
            try {
                localStorage.setItem('laxTimer_gameState', JSON.stringify(this.gameState));
            } catch (e) {
                console.warn('Failed to save game state:', e);
            }
        }
    }
    
    playSound(type) {
        if (!this.settings.soundEnabled) return;
        
        // Simple beep sound generation
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const frequencies = {
                complete: 800,
                warning: 600,
                start: 400
            };
            
            oscillator.frequency.value = frequencies[type] || 400;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Could not play sound:', e);
        }
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
let laxTimerApp;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting LaxTimer...');
    laxTimerApp = new LaxTimerApp();
});

// Global functions for HTML onclick handlers
function adjustScore(team, change) {
    if (laxTimerApp) {
        laxTimerApp.adjustScore(team, change);
    }
}

function closeSettings() {
    if (laxTimerApp) {
        laxTimerApp.closeSettings();
    }
}

function saveSettings() {
    if (laxTimerApp) {
        laxTimerApp.saveSettings();
    }
}

function resetSettings() {
    if (laxTimerApp) {
        laxTimerApp.resetSettings();
    }
}

function closeTimerModal() {
    if (laxTimerApp) {
        laxTimerApp.closeTimerModal();
    }
}

function createTimer() {
    if (laxTimerApp) {
        laxTimerApp.createTimer();
    }
}
