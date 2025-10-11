/**
 * Timer Utilities - Additional helper functions for LaxTimer
 * Handles data persistence, exports, and advanced features
 */

class TimerUtils {
    constructor() {
        this.storageKey = 'laxTimer_data';
        this.init();
    }

    init() {
        // Load saved data on initialization
        this.loadTimerData();
        
        // Save data every 30 seconds
        setInterval(() => {
            this.saveTimerData();
        }, 30000);
        
        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveTimerData();
        });
    }

    saveTimerData() {
        const data = {
            timers: [],
            timestamp: new Date().toISOString()
        };

        for (let i = 1; i <= 8; i++) {
            const playerInput = document.getElementById('player' + i);
            const teamInput = document.getElementById('team' + i);
            const timeSelect = document.getElementById('setTime' + i);
            const timeDisplay = document.getElementById('time' + i);

            if (playerInput && teamInput && timeSelect && timeDisplay) {
                data.timers.push({
                    index: i,
                    player: playerInput.value,
                    team: teamInput.value,
                    selectedTime: timeSelect.value,
                    currentTime: timeDisplay.textContent
                });
            }
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('Timer data saved successfully');
        } catch (error) {
            console.warn('Failed to save timer data:', error);
        }
    }

    loadTimerData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return;

            const data = JSON.parse(saved);
            console.log('Loading timer data from:', data.timestamp);

            data.timers.forEach(timer => {
                const playerInput = document.getElementById('player' + timer.index);
                const teamInput = document.getElementById('team' + timer.index);
                const timeSelect = document.getElementById('setTime' + timer.index);

                if (playerInput) playerInput.value = timer.player || '';
                if (teamInput) teamInput.value = timer.team || '';
                if (timeSelect) timeSelect.value = timer.selectedTime || 'Not in use';
            });

            console.log('Timer data loaded successfully');
        } catch (error) {
            console.warn('Failed to load timer data:', error);
        }
    }

    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Saved timer data cleared');
        } catch (error) {
            console.warn('Failed to clear saved data:', error);
        }
    }

    exportTimerData() {
        const data = {
            timers: [],
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        for (let i = 1; i <= 8; i++) {
            const playerInput = document.getElementById('player' + i);
            const teamInput = document.getElementById('team' + i);
            const timeSelect = document.getElementById('setTime' + i);
            const timeDisplay = document.getElementById('time' + i);

            if (playerInput && teamInput && timeSelect && timeDisplay) {
                data.timers.push({
                    index: i,
                    player: playerInput.value,
                    team: teamInput.value,
                    selectedTime: timeSelect.value,
                    currentTime: timeDisplay.textContent,
                    isActive: timeDisplay.textContent !== '00:00:00' && timeDisplay.textContent !== 'Not in use'
                });
            }
        }

        // Create downloadable file
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lax-timer-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Timer data exported successfully');
    }

    importTimerData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.timers || !Array.isArray(data.timers)) {
                        throw new Error('Invalid file format');
                    }

                    // Clear current data
                    this.clearAllTimers();

                    // Load imported data
                    data.timers.forEach(timer => {
                        if (timer.index >= 1 && timer.index <= 8) {
                            const playerInput = document.getElementById('player' + timer.index);
                            const teamInput = document.getElementById('team' + timer.index);
                            const timeSelect = document.getElementById('setTime' + timer.index);

                            if (playerInput) playerInput.value = timer.player || '';
                            if (teamInput) teamInput.value = timer.team || '';
                            if (timeSelect) timeSelect.value = timer.selectedTime || 'Not in use';
                            
                            // Setup the timer with new values
                            if (window.laxTimer) {
                                window.laxTimer.setupTimer(timer.index);
                            }
                        }
                    });

                    console.log('Timer data imported successfully');
                    resolve(data);
                } catch (error) {
                    console.error('Failed to import timer data:', error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    clearAllTimers() {
        for (let i = 1; i <= 8; i++) {
            const playerInput = document.getElementById('player' + i);
            const teamInput = document.getElementById('team' + i);
            const timeSelect = document.getElementById('setTime' + i);

            if (playerInput) playerInput.value = '';
            if (teamInput) teamInput.value = '';
            if (timeSelect) timeSelect.value = 'Not in use';
            
            // Reset the timer
            if (window.laxTimer) {
                window.laxTimer.setupTimer(i);
            }
        }
        console.log('All timers cleared');
    }

    getTimerStatistics() {
        const stats = {
            totalTimers: 8,
            activeTimers: 0,
            inUseTimers: 0,
            playersAssigned: 0,
            teamsAssigned: 0
        };

        for (let i = 1; i <= 8; i++) {
            const playerInput = document.getElementById('player' + i);
            const teamInput = document.getElementById('team' + i);
            const timeSelect = document.getElementById('setTime' + i);
            const timeDisplay = document.getElementById('time' + i);

            if (timeSelect && timeSelect.value !== 'Not in use') {
                stats.inUseTimers++;
            }

            if (timeDisplay && timeDisplay.textContent !== '00:00:00' && timeDisplay.textContent !== 'Not in use') {
                stats.activeTimers++;
            }

            if (playerInput && playerInput.value.trim()) {
                stats.playersAssigned++;
            }

            if (teamInput && teamInput.value.trim()) {
                stats.teamsAssigned++;
            }
        }

        return stats;
    }

    addPresetTimes() {
        // Add common lacrosse penalty times as presets
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

        for (let i = 1; i <= 8; i++) {
            const select = document.getElementById('setTime' + i);
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
        }
    }
}

// Initialize timer utilities
let timerUtils;

document.addEventListener('DOMContentLoaded', function() {
    timerUtils = new TimerUtils();
    
    // Add preset times to all selects
    timerUtils.addPresetTimes();
});

// Global utility functions
function exportTimers() {
    if (timerUtils) {
        timerUtils.exportTimerData();
    }
}

function clearAllTimers() {
    if (timerUtils && confirm('Are you sure you want to clear all timer data?')) {
        timerUtils.clearAllTimers();
    }
}

function showTimerStats() {
    if (timerUtils) {
        const stats = timerUtils.getTimerStatistics();
        alert(`Timer Statistics:
        
Total Timers: ${stats.totalTimers}
In Use: ${stats.inUseTimers}
Currently Active: ${stats.activeTimers}
Players Assigned: ${stats.playersAssigned}
Teams Assigned: ${stats.teamsAssigned}`);
    }
}