/**
 * Dynamic Timer Manager - Add/Remove timers dynamically
 * Handles dynamic creation and management of penalty timers
 */

class DynamicTimerManager {
    constructor() {
        this.maxTimers = 12;
        this.minTimers = 4;
        this.currentTimerCount = 8;
        this.timerContainer = null;
        this.init();
    }

    init() {
        this.createTimerContainer();
        this.updateTimerManagementUI();
        console.log('Dynamic Timer Manager initialized');
    }

    createTimerContainer() {
        // Find existing timers and wrap them in a container
        const firstTimer = document.querySelector('.timer');
        if (firstTimer) {
            const container = document.createElement('div');
            container.id = 'dynamicTimerContainer';
            container.className = 'dynamic-timer-container';
            
            firstTimer.parentNode.insertBefore(container, firstTimer);
            
            // Move all existing timers into the container
            const allTimers = document.querySelectorAll('.timer');
            allTimers.forEach(timer => {
                container.appendChild(timer);
            });
            
            this.timerContainer = container;
        }
    }

    updateTimerManagementUI() {
        // Add timer management controls to settings
        if (window.laxTimerSettings) {
            // This will be called by the settings system
            this.addTimerManagementToSettings();
        }
    }

    addTimerManagementToSettings() {
        // Add timer count management to existing settings modal
        const originalShowSettings = window.laxTimerSettings.showSettingsModal;
        
        window.laxTimerSettings.showSettingsModal = () => {
            originalShowSettings.call(window.laxTimerSettings);
            
            // Wait for modal to be created, then add our controls
            setTimeout(() => {
                const modalBody = document.querySelector('#settingsModal .modal-body');
                if (modalBody) {
                    const timerManagementHTML = `
                        <div class="setting-group timer-management">
                            <h4>Timer Management</h4>
                            <div class="timer-count-controls">
                                <label for="timerCount">Number of Penalty Timers:</label>
                                <div class="timer-count-input">
                                    <button type="button" onclick="dynamicTimerManager.decreaseTimerCount()" 
                                            class="count-btn minus-btn" ${this.currentTimerCount <= this.minTimers ? 'disabled' : ''}>
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span id="currentTimerCount" class="timer-count-display">${this.currentTimerCount}</span>
                                    <button type="button" onclick="dynamicTimerManager.increaseTimerCount()" 
                                            class="count-btn plus-btn" ${this.currentTimerCount >= this.maxTimers ? 'disabled' : ''}>
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <small>Range: ${this.minTimers} - ${this.maxTimers} timers</small>
                            </div>
                        </div>
                    `;
                    modalBody.insertAdjacentHTML('beforeend', timerManagementHTML);
                }
            }, 50);
        };
    }

    increaseTimerCount() {
        if (this.currentTimerCount < this.maxTimers) {
            this.currentTimerCount++;
            this.addTimer(this.currentTimerCount);
            this.updateTimerCountDisplay();
            this.saveTimerConfiguration();
        }
    }

    decreaseTimerCount() {
        if (this.currentTimerCount > this.minTimers) {
            this.removeTimer(this.currentTimerCount);
            this.currentTimerCount--;
            this.updateTimerCountDisplay();
            this.saveTimerConfiguration();
        }
    }

    addTimer(index) {
        if (!this.timerContainer) {
            console.warn('Timer container not found');
            return;
        }

        const timerHTML = `
            <div class="timer" id="timer${index}">
                <h3><i class="fas fa-clock"></i> Timer ${index}</h3>
                <input type="text" id="player${index}" placeholder="Player Number">
                <input type="text" id="team${index}" placeholder="Team Name">
                <select id="setTime${index}" onchange="setupTimer(${index})">
                    <option value="Not in use">Not in use</option>
                </select>
                <div class="time-display" id="time${index}">00:00:00</div>
                <div class="timer-buttons">
                    <button class="start-btn" onclick="startTimer(${index})">
                        <i class="fas fa-play"></i> Start
                    </button>
                    <button class="stop-btn" onclick="stopTimer(${index})">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                </div>
            </div>
        `;

        this.timerContainer.insertAdjacentHTML('beforeend', timerHTML);

        // Initialize the new timer with preset times
        if (window.timerUtils) {
            timerUtils.addPresetTimesToTimer(index);
        }

        // Update the main timer system
        if (window.laxTimer) {
            laxTimer.timers = this.currentTimerCount;
            laxTimer.setupTimer(index);
        }

        console.log(`Timer ${index} added`);
    }

    removeTimer(index) {
        const timer = document.getElementById(`timer${index}`);
        if (timer) {
            // Stop the timer if it's running
            if (window.laxTimer) {
                laxTimer.stopTimer(index);
            }
            
            timer.remove();
            console.log(`Timer ${index} removed`);
        }

        // Update the main timer system
        if (window.laxTimer) {
            laxTimer.timers = this.currentTimerCount - 1;
        }
    }

    updateTimerCountDisplay() {
        const display = document.getElementById('currentTimerCount');
        if (display) {
            display.textContent = this.currentTimerCount;
        }

        // Update button states
        const minusBtn = document.querySelector('.timer-count-controls .minus-btn');
        const plusBtn = document.querySelector('.timer-count-controls .plus-btn');
        
        if (minusBtn) {
            minusBtn.disabled = this.currentTimerCount <= this.minTimers;
        }
        if (plusBtn) {
            plusBtn.disabled = this.currentTimerCount >= this.maxTimers;
        }
    }

    saveTimerConfiguration() {
        try {
            const config = {
                timerCount: this.currentTimerCount,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('laxTimer_timerConfig', JSON.stringify(config));
            console.log('Timer configuration saved');
        } catch (error) {
            console.warn('Failed to save timer configuration:', error);
        }
    }

    loadTimerConfiguration() {
        try {
            const saved = localStorage.getItem('laxTimer_timerConfig');
            if (saved) {
                const config = JSON.parse(saved);
                const savedCount = config.timerCount;
                
                if (savedCount >= this.minTimers && savedCount <= this.maxTimers) {
                    // Adjust timer count to match saved configuration
                    while (this.currentTimerCount < savedCount) {
                        this.currentTimerCount++;
                        this.addTimer(this.currentTimerCount);
                    }
                    
                    while (this.currentTimerCount > savedCount) {
                        this.removeTimer(this.currentTimerCount);
                        this.currentTimerCount--;
                    }
                    
                    console.log(`Timer configuration loaded: ${this.currentTimerCount} timers`);
                }
            }
        } catch (error) {
            console.warn('Failed to load timer configuration:', error);
        }
    }

    resetToDefaultConfiguration() {
        const defaultCount = 8;
        
        while (this.currentTimerCount < defaultCount) {
            this.currentTimerCount++;
            this.addTimer(this.currentTimerCount);
        }
        
        while (this.currentTimerCount > defaultCount) {
            this.removeTimer(this.currentTimerCount);
            this.currentTimerCount--;
        }
        
        this.saveTimerConfiguration();
        console.log('Timer configuration reset to default');
    }

    getAllActiveTimers() {
        const activeTimers = [];
        for (let i = 1; i <= this.currentTimerCount; i++) {
            const timeElement = document.getElementById(`time${i}`);
            if (timeElement && timeElement.textContent !== '00:00:00' && timeElement.textContent !== 'Not in use') {
                activeTimers.push({
                    index: i,
                    time: timeElement.textContent,
                    player: document.getElementById(`player${i}`)?.value || '',
                    team: document.getElementById(`team${i}`)?.value || ''
                });
            }
        }
        return activeTimers;
    }

    getTimerCount() {
        return this.currentTimerCount;
    }

    exportTimerLayout() {
        const layout = {
            timerCount: this.currentTimerCount,
            maxTimers: this.maxTimers,
            minTimers: this.minTimers,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(layout, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laxtimer-layout-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Timer layout exported');
    }
}

// Extend TimerUtils to support dynamic timers
if (window.TimerUtils) {
    const originalAddPresetTimes = TimerUtils.prototype.addPresetTimes;
    
    TimerUtils.prototype.addPresetTimesToTimer = function(index) {
        const commonTimes = [
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

        const select = document.getElementById('setTime' + index);
        if (select) {
            // Clear existing options except "Not in use"
            while (select.options.length > 1) {
                select.removeChild(select.lastChild);
            }

            // Add preset times
            commonTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time.value;
                option.textContent = time.text;
                select.appendChild(option);
            });
        }
    };

    TimerUtils.prototype.addPresetTimes = function() {
        // Use dynamic timer count instead of hardcoded
        const timerCount = window.dynamicTimerManager ? dynamicTimerManager.getTimerCount() : 8;
        
        for (let i = 1; i <= timerCount; i++) {
            this.addPresetTimesToTimer(i);
        }
    };
}

// Initialize dynamic timer manager
let dynamicTimerManager;

document.addEventListener('DOMContentLoaded', function() {
    // Wait for other components to load
    setTimeout(() => {
        dynamicTimerManager = new DynamicTimerManager();
        // Load saved configuration after a brief delay
        setTimeout(() => {
            dynamicTimerManager.loadTimerConfiguration();
        }, 300);
    }, 300);
});