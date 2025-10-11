/**
 * LaxTimer Main Application - Integrated Version
 * Enhanced Lacrosse Game Management System with Dynamic Features
 */

class LaxTimer {
    constructor() {
        this.timers = 8; // Default timer count, can be adjusted dynamically
        this.intervals = {};
        this.isPaused = {};
        this.sounds = null;
        this.isGlobalPaused = false;
        this.gameManager = null;
        this.scoreboard = null;
        
        this.init();
    }

    init() {
        console.log('LaxTimer initializing...');
        
        // Initialize sound system
        if (window.timerUtils) {
            this.sounds = timerUtils.initSounds();
        }
        
        // Setup all timers
        this.setupAllTimers();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize integrations with other components
        this.initializeIntegrations();
        
        console.log('LaxTimer initialized successfully');
    }

    initializeIntegrations() {
        // Wait for other components to load
        setTimeout(() => {
            if (window.gameManager) {
                this.gameManager = gameManager;
                console.log('Game Manager integration established');
            }
            
            if (window.scoreboard) {
                this.scoreboard = scoreboard;
                console.log('Scoreboard integration established');
            }
            
            if (window.dynamicTimerManager) {
                // Update timer count based on dynamic manager
                this.timers = dynamicTimerManager.getTimerCount();
                console.log(`Timer count updated to: ${this.timers}`);
            }
        }, 500);
    }

    setupAllTimers() {
        for (let i = 1; i <= this.timers; i++) {
            this.setupTimer(i);
        }
    }

    setupTimer(index) {
        const setTimeSelect = document.getElementById('setTime' + index);
        const timeDisplay = document.getElementById('time' + index);
        
        if (!setTimeSelect || !timeDisplay) {
            console.warn(`Timer ${index} elements not found`);
            return;
        }

        const selectedValue = setTimeSelect.value;
        
        if (selectedValue === 'Not in use') {
            timeDisplay.textContent = 'Not in use';
            timeDisplay.style.color = '#999';
            this.stopTimer(index);
            return;
        }

        // Parse time and set display
        const timeRegex = /^(\d{2}):(\d{2}):(\d{2})$/;
        const match = selectedValue.match(timeRegex);
        
        if (match) {
            timeDisplay.textContent = selectedValue;
            timeDisplay.style.color = '';
            console.log(`Timer ${index} set to: ${selectedValue}`);
        } else {
            console.warn(`Invalid time format for timer ${index}: ${selectedValue}`);
        }
    }

    startTimer(index) {
        if (this.isGlobalPaused && this.gameManager && !this.gameManager.gameClockRunning) {
            this.showNotification('Game is paused. Resume game clock to start individual timers.', 'warning');
            return;
        }

        const timeDisplay = document.getElementById('time' + index);
        if (!timeDisplay || timeDisplay.textContent === 'Not in use') {
            return;
        }

        // Stop existing timer if running
        this.stopTimer(index);

        const [hours, minutes, seconds] = timeDisplay.textContent.split(':').map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds <= 0) {
            this.showNotification(`Timer ${index} is already at zero`, 'info');
            return;
        }

        this.isPaused[index] = false;
        
        this.intervals[index] = setInterval(() => {
            if (this.isPaused[index] || this.isGlobalPaused) {
                return;
            }

            totalSeconds--;
            
            const displayHours = Math.floor(totalSeconds / 3600);
            const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
            const displaySeconds = totalSeconds % 60;
            
            const timeString = `${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
            timeDisplay.textContent = timeString;

            // Visual feedback for low time
            if (totalSeconds <= 30 && totalSeconds > 0) {
                timeDisplay.style.color = '#ff6b6b';
                timeDisplay.style.fontWeight = 'bold';
            } else if (totalSeconds <= 60) {
                timeDisplay.style.color = '#ffa726';
            } else {
                timeDisplay.style.color = '';
                timeDisplay.style.fontWeight = '';
            }

            // Timer expired
            if (totalSeconds <= 0) {
                this.stopTimer(index);
                this.onTimerExpired(index);
            }
        }, 1000);

        // Play start sound
        if (this.sounds && this.sounds.start) {
            this.sounds.start.play().catch(e => console.warn('Could not play start sound'));
        }

        console.log(`Timer ${index} started`);
        this.updateTimerButton(index, 'running');
    }

    stopTimer(index) {
        if (this.intervals[index]) {
            clearInterval(this.intervals[index]);
            delete this.intervals[index];
        }
        
        this.isPaused[index] = false;
        this.updateTimerButton(index, 'stopped');
        
        console.log(`Timer ${index} stopped`);
    }

    pauseTimer(index) {
        this.isPaused[index] = true;
        this.updateTimerButton(index, 'paused');
        console.log(`Timer ${index} paused`);
    }

    resumeTimer(index) {
        this.isPaused[index] = false;
        this.updateTimerButton(index, 'running');
        console.log(`Timer ${index} resumed`);
    }

    onTimerExpired(index) {
        const playerInput = document.getElementById('player' + index);
        const teamInput = document.getElementById('team' + index);
        const timeDisplay = document.getElementById('time' + index);
        
        const playerName = playerInput ? playerInput.value : '';
        const teamName = teamInput ? teamInput.value : '';
        
        // Visual effects
        timeDisplay.style.color = '#ff4757';
        timeDisplay.style.fontWeight = 'bold';
        timeDisplay.textContent = '00:00:00';
        
        // Flash effect
        this.flashTimer(index);
        
        // Play expiration sound
        if (this.sounds && this.sounds.expiration) {
            this.sounds.expiration.play().catch(e => console.warn('Could not play expiration sound'));
        }
        
        // Show notification
        const message = playerName && teamName 
            ? `Timer ${index} expired! ${playerName} (${teamName}) penalty time is up.`
            : `Timer ${index} expired!`;
        
        this.showNotification(message, 'success');
        
        // Update game manager if available
        if (this.gameManager) {
            this.gameManager.onTimerExpired(index, { player: playerName, team: teamName });
        }
        
        console.log(`Timer ${index} expired - Player: ${playerName}, Team: ${teamName}`);
    }

    flashTimer(index) {
        const timer = document.getElementById('timer' + index);
        if (!timer) return;
        
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            timer.style.opacity = timer.style.opacity === '0.3' ? '1' : '0.3';
            flashCount++;
            
            if (flashCount >= 6) {
                clearInterval(flashInterval);
                timer.style.opacity = '1';
            }
        }, 300);
    }

    updateTimerButton(index, state) {
        const startBtn = document.querySelector(`#timer${index} .start-btn`);
        const stopBtn = document.querySelector(`#timer${index} .stop-btn`);
        
        if (!startBtn || !stopBtn) return;
        
        switch (state) {
            case 'running':
                startBtn.style.opacity = '0.6';
                stopBtn.style.opacity = '1';
                break;
            case 'stopped':
            case 'paused':
                startBtn.style.opacity = '1';
                stopBtn.style.opacity = '0.6';
                break;
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ignore if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = event.key;
            
            // Number keys 1-8 to start individual timers
            if (key >= '1' && key <= '8') {
                const timerIndex = parseInt(key);
                if (timerIndex <= this.timers) {
                    this.startTimer(timerIndex);
                    event.preventDefault();
                }
            }
            
            // Spacebar to toggle all timers
            else if (key === ' ' || key === 'Spacebar') {
                this.toggleAllTimers();
                event.preventDefault();
            }
            
            // 'p' to pause/resume game
            else if (key.toLowerCase() === 'p') {
                if (this.gameManager) {
                    this.gameManager.toggleGameClock();
                }
                event.preventDefault();
            }
            
            // 'r' to restart game
            else if (key.toLowerCase() === 'r' && event.ctrlKey) {
                if (this.gameManager) {
                    this.gameManager.restartGame();
                }
                event.preventDefault();
            }
        });
    }

    // Global timer control methods
    pauseAllTimers() {
        this.isGlobalPaused = true;
        
        for (let i = 1; i <= this.timers; i++) {
            if (this.intervals[i]) {
                this.pauseTimer(i);
            }
        }
        
        this.showNotification('All timers paused', 'info');
        console.log('All timers paused globally');
    }

    resumeAllTimers() {
        this.isGlobalPaused = false;
        
        for (let i = 1; i <= this.timers; i++) {
            if (this.intervals[i]) {
                this.resumeTimer(i);
            }
        }
        
        this.showNotification('All timers resumed', 'info');
        console.log('All timers resumed globally');
    }

    toggleAllTimers() {
        if (this.isGlobalPaused) {
            this.resumeAllTimers();
        } else {
            this.pauseAllTimers();
        }
    }

    showNotification(message, type = 'info') {
        // Create or update notification element
        let notification = document.getElementById('timerNotification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'timerNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(notification);
        }
        
        // Set notification style based on type
        const colors = {
            info: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }

    // Public methods for external integration
    getActiveTimers() {
        const activeTimers = [];
        for (let i = 1; i <= this.timers; i++) {
            if (this.intervals[i]) {
                const timeDisplay = document.getElementById('time' + i);
                const playerInput = document.getElementById('player' + i);
                const teamInput = document.getElementById('team' + i);
                
                activeTimers.push({
                    index: i,
                    time: timeDisplay ? timeDisplay.textContent : '',
                    player: playerInput ? playerInput.value : '',
                    team: teamInput ? teamInput.value : '',
                    isPaused: this.isPaused[i] || false
                });
            }
        }
        return activeTimers;
    }

    updateTimerCount(newCount) {
        if (newCount >= 4 && newCount <= 12) {
            this.timers = newCount;
            console.log(`Timer count updated to: ${this.timers}`);
        }
    }

    exportTimerData() {
        const timers = [];
        for (let i = 1; i <= this.timers; i++) {
            const timeDisplay = document.getElementById('time' + i);
            const playerInput = document.getElementById('player' + i);
            const teamInput = document.getElementById('team' + i);
            const setTimeSelect = document.getElementById('setTime' + i);
            
            if (timeDisplay && playerInput && teamInput && setTimeSelect) {
                timers.push({
                    index: i,
                    player: playerInput.value,
                    team: teamInput.value,
                    selectedTime: setTimeSelect.value,
                    currentTime: timeDisplay.textContent,
                    isActive: !!this.intervals[i],
                    isPaused: this.isPaused[i] || false
                });
            }
        }
        
        return {
            timers,
            globalPaused: this.isGlobalPaused,
            exportTime: new Date().toISOString()
        };
    }
}

// Initialize LaxTimer when DOM is loaded
let laxTimer;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing LaxTimer...');
    laxTimer = new LaxTimer();
});

// Global functions for backwards compatibility and HTML onclick handlers
function setupTimer(index) {
    if (laxTimer) {
        laxTimer.setupTimer(index);
    }
}

function startTimer(index) {
    if (laxTimer) {
        laxTimer.startTimer(index);
    }
}

function stopTimer(index) {
    if (laxTimer) {
        laxTimer.stopTimer(index);
    }
}

function startAllTimers() {
    if (laxTimer) {
        for (let i = 1; i <= laxTimer.timers; i++) {
            const timeDisplay = document.getElementById('time' + i);
            if (timeDisplay && timeDisplay.textContent !== 'Not in use' && timeDisplay.textContent !== '00:00:00') {
                laxTimer.startTimer(i);
            }
        }
        laxTimer.showNotification('All available timers started', 'info');
    }
}

function stopAllTimers() {
    if (laxTimer) {
        for (let i = 1; i <= laxTimer.timers; i++) {
            laxTimer.stopTimer(i);
        }
        laxTimer.showNotification('All timers stopped', 'info');
    }
}