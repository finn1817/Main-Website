/**
 * LaxTimer - Lacrosse Multi-Timer Application
 * Main timer functionality and management
 */

class LaxTimer {
    constructor() {
        this.intervals = {};
        this.timers = 8; // Total number of timers
        this.init();
    }

    init() {
        console.log('LaxTimer initializing...');
        
        // Initialize all timers on page load
        for (let i = 1; i <= this.timers; i++) {
            this.setupTimer(i);
        }
        
        // Add event listeners for keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('LaxTimer initialized with', this.timers, 'timers');
    }

    setupTimer(index) {
        const timeInput = document.getElementById('setTime' + index);
        const timeElement = document.getElementById('time' + index);
        
        if (!timeInput || !timeElement) {
            console.warn(`Timer ${index} elements not found`);
            return;
        }
        
        timeElement.textContent = timeInput.value;
        
        if (timeInput.value === "Not in use") {
            this.stopTimer(index);
            timeElement.textContent = "Not in use";
        }
    }

    startTimer(index) {
        const timeElement = document.getElementById('time' + index);
        if (!timeElement) return;
        
        if (timeElement.textContent === "00:00:00" || timeElement.textContent === "Not in use") {
            console.log(`Timer ${index} cannot start: invalid time`);
            return;
        }
        
        // Stop existing timer if running
        this.stopTimer(index);
        
        // Play start sound if settings allow
        if (window.laxTimerSettings) {
            laxTimerSettings.playSound('timerStart');
        }
        
        let totalSeconds = this.hmsToSecondsOnly(timeElement.textContent);
        
        this.intervals[index] = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(this.intervals[index]);
                this.onTimerComplete(index);
            } else {
                totalSeconds--;
                timeElement.textContent = this.secondsToHMS(totalSeconds);
                
                // Visual feedback for last 10 seconds
                if (totalSeconds <= 10 && totalSeconds > 0) {
                    timeElement.style.color = '#dc3545';
                    timeElement.style.animation = 'pulse 1s infinite';
                    
                    // Play warning sound at 10 seconds if settings allow
                    if (totalSeconds === 10 && window.laxTimerSettings) {
                        laxTimerSettings.playSound('warning');
                    }
                } else {
                    timeElement.style.color = '';
                    timeElement.style.animation = '';
                }
            }
        }, 1000);
        
        console.log(`Timer ${index} started`);
    }

    stopTimer(index) {
        if (this.intervals[index]) {
            clearInterval(this.intervals[index]);
            this.intervals[index] = null;
            
            // Play stop sound if settings allow
            if (window.laxTimerSettings) {
                laxTimerSettings.playSound('timerStop');
            }
            
            // Reset visual styling
            const timeElement = document.getElementById('time' + index);
            if (timeElement) {
                timeElement.style.color = '';
                timeElement.style.animation = '';
            }
            
            console.log(`Timer ${index} stopped`);
        }
    }

    startAllTimers() {
        for (let i = 1; i <= this.timers; i++) {
            const timeElement = document.getElementById('time' + i);
            if (timeElement && timeElement.textContent !== "00:00:00" && timeElement.textContent !== "Not in use") {
                this.startTimer(i);
            }
        }
        console.log('All active timers started');
    }

    stopAllTimers() {
        for (let i = 1; i <= this.timers; i++) {
            this.stopTimer(i);
        }
        console.log('All timers stopped');
    }

    onTimerComplete(index) {
        const playerInput = document.getElementById('player' + index);
        const teamInput = document.getElementById('team' + index);
        
        let message = `Timer ${index} has finished!`;
        
        if (playerInput && playerInput.value) {
            message += `\nPlayer: ${playerInput.value}`;
        }
        
        if (teamInput && teamInput.value) {
            message += `\nTeam: ${teamInput.value}`;
        }
        
        // Play completion sound if settings allow
        if (window.laxTimerSettings) {
            laxTimerSettings.playSound('timerComplete');
        }
        
        alert(message);
        
        // Flash the timer for visual feedback
        const timerElement = document.getElementById('timer' + index);
        if (timerElement) {
            timerElement.style.background = '#ffebee';
            setTimeout(() => {
                timerElement.style.background = '';
            }, 2000);
        }
    }

    secondsToHMS(secs) {
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const seconds = secs % 60;
        return [hours, minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .join(":");
    }

    hmsToSecondsOnly(str) {
        const p = str.split(':');
        let s = 0;
        let m = 1;

        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }
        return s;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check if keyboard shortcuts are enabled in settings
            if (window.laxTimerSettings && !laxTimerSettings.getSetting('keyboardShortcuts')) {
                return;
            }
            
            // Space bar to start/stop all timers
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.toggleAllTimers();
            }
            
            // Number keys 1-8 to start individual timers
            if (e.code >= 'Digit1' && e.code <= 'Digit8' && e.target.tagName !== 'INPUT') {
                const timerIndex = parseInt(e.code.replace('Digit', ''));
                if (timerIndex <= this.timers) {
                    this.startTimer(timerIndex);
                }
            }
            
            // Ctrl+S to save data
            if (e.ctrlKey && e.code === 'KeyS' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (window.timerUtils) {
                    timerUtils.saveTimerData();
                }
            }
            
            // Ctrl+R to reset all timers
            if (e.ctrlKey && e.code === 'KeyR' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (window.timerUtils) {
                    timerUtils.resetAllTimers();
                }
            }
        });
    }

    toggleAllTimers() {
        // Check if any timer is running
        const anyRunning = this.intervals.some(interval => interval !== null && interval !== undefined);
        
        if (anyRunning) {
            this.stopAllTimers();
        } else {
            this.startAllTimers();
        }
    }

    getActiveTimersCount() {
        return this.intervals.filter(interval => interval !== null && interval !== undefined).length;
    }

    resetTimer(index) {
        this.stopTimer(index);
        this.setupTimer(index);
    }

    resetAllTimers() {
        for (let i = 1; i <= this.timers; i++) {
            this.resetTimer(i);
        }
    }
}

// Global functions for HTML onclick handlers
let laxTimer;

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
        laxTimer.startAllTimers();
    }
}

function stopAllTimers() {
    if (laxTimer) {
        laxTimer.stopAllTimers();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    laxTimer = new LaxTimer();
    
    // Add CSS animation for pulsing effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});