/**
 * LaxTimer - Working Lacrosse Multi-Timer Application
 * Simplified and functional version
 */

class LaxTimer {
    constructor() {
        this.intervals = {};
        this.timers = 8;
        this.init();
    }

    init() {
        console.log('LaxTimer initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        // Initialize all timers
        for (let i = 1; i <= this.timers; i++) {
            this.setupTimer(i);
        }
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('LaxTimer initialized with', this.timers, 'timers');
    }

    setupTimer(index) {
        const setTimeSelect = document.getElementById('setTime' + index);
        const timeDisplay = document.getElementById('time' + index);
        
        if (!setTimeSelect || !timeDisplay) {
            console.warn(`Timer ${index} elements not found`);
            return;
        }

        // Add preset times to dropdown
        this.addPresetTimes(setTimeSelect);
        
        const selectedValue = setTimeSelect.value;
        
        if (selectedValue === 'Not in use') {
            timeDisplay.textContent = 'Not in use';
            timeDisplay.style.color = '#999';
            this.stopTimer(index);
        } else {
            timeDisplay.textContent = selectedValue;
            timeDisplay.style.color = '';
        }
    }

    addPresetTimes(selectElement) {
        // Clear existing options except first one
        while (selectElement.options.length > 1) {
            selectElement.removeChild(selectElement.lastChild);
        }

        const presetTimes = [
            { value: "00:00:30", text: "30 seconds" },
            { value: "00:01:00", text: "1 minute" },
            { value: "00:01:30", text: "1 minute 30 seconds" },
            { value: "00:02:00", text: "2 minutes" },
            { value: "00:02:30", text: "2 minutes 30 seconds" },
            { value: "00:03:00", text: "3 minutes" },
            { value: "00:03:30", text: "3 minutes 30 seconds" },
            { value: "00:04:00", text: "4 minutes" },
            { value: "00:04:30", text: "4 minutes 30 seconds" },
            { value: "00:05:00", text: "5 minutes" },
            { value: "00:10:00", text: "10 minutes" },
            { value: "00:15:00", text: "15 minutes" }
        ];

        presetTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time.value;
            option.textContent = time.text;
            selectElement.appendChild(option);
        });
    }

    startTimer(index) {
        const timeDisplay = document.getElementById('time' + index);
        if (!timeDisplay || timeDisplay.textContent === 'Not in use') {
            return;
        }

        // Stop existing timer if running
        this.stopTimer(index);

        const [hours, minutes, seconds] = timeDisplay.textContent.split(':').map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds <= 0) {
            this.showNotification(`Timer ${index} is already at zero`);
            return;
        }

        this.intervals[index] = setInterval(() => {
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

        console.log(`Timer ${index} started`);
        this.updateTimerButton(index, 'running');
    }

    stopTimer(index) {
        if (this.intervals[index]) {
            clearInterval(this.intervals[index]);
            delete this.intervals[index];
        }
        
        this.updateTimerButton(index, 'stopped');
        console.log(`Timer ${index} stopped`);
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
        
        // Show notification
        const message = playerName && teamName 
            ? `Timer ${index} expired! ${playerName} (${teamName}) penalty time is up.`
            : `Timer ${index} expired!`;
        
        this.showNotification(message);
        
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
                this.startTimer(timerIndex);
                event.preventDefault();
            }
            
            // Spacebar to toggle all timers
            else if (key === ' ' || key === 'Spacebar') {
                this.toggleAllTimers();
                event.preventDefault();
            }
        });
    }

    toggleAllTimers() {
        const hasRunningTimers = Object.keys(this.intervals).length > 0;
        
        if (hasRunningTimers) {
            // Stop all running timers
            for (let i = 1; i <= this.timers; i++) {
                this.stopTimer(i);
            }
            this.showNotification('All timers stopped');
        } else {
            // Start timers that have time left
            let startedCount = 0;
            for (let i = 1; i <= this.timers; i++) {
                const timeDisplay = document.getElementById('time' + i);
                if (timeDisplay && timeDisplay.textContent !== 'Not in use' && timeDisplay.textContent !== '00:00:00') {
                    this.startTimer(i);
                    startedCount++;
                }
            }
            
            if (startedCount > 0) {
                this.showNotification(`${startedCount} timers started`);
            } else {
                this.showNotification('No timers available to start');
            }
        }
    }

    showNotification(message) {
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
                background: #3498db;
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
        
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
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
        laxTimer.showNotification('All available timers started');
    }
}

function stopAllTimers() {
    if (laxTimer) {
        for (let i = 1; i <= laxTimer.timers; i++) {
            laxTimer.stopTimer(i);
        }
        laxTimer.showNotification('All timers stopped');
    }
}