/**
 * LaxTimer Settings and Configuration
 * Advanced settings, themes, and user preferences
 */

class LaxTimerSettings {
    constructor() {
        this.settingsKey = 'laxTimer_settings';
        this.defaultSettings = {
            theme: 'auto', // 'light', 'dark', 'auto'
            soundEnabled: true,
            visualAlerts: true,
            autoSave: true,
            confirmActions: true,
            keyboardShortcuts: true,
            timerLayout: 'grid', // 'grid', 'list'
            defaultPenaltyTime: '00:02:00',
            maxTimers: 8,
            language: 'en'
        };
        this.settings = { ...this.defaultSettings };
        this.init();
    }

    init() {
        this.loadSettings();
        this.applySettings();
        this.createSettingsPanel();
        console.log('LaxTimer Settings initialized');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.settingsKey);
            if (saved) {
                const savedSettings = JSON.parse(saved);
                this.settings = { ...this.defaultSettings, ...savedSettings };
                console.log('Settings loaded:', this.settings);
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
            this.settings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            this.saveSettings();
            this.applySettings();
        }
    }

    applySettings() {
        // Apply sound settings
        this.applySoundSettings();
        
        // Apply visual settings
        this.applyVisualSettings();
        
        // Apply layout settings
        this.applyLayoutSettings();
        
        // Apply keyboard shortcuts
        this.applyKeyboardSettings();
    }

    applySoundSettings() {
        // Create audio context for timer sounds
        if (this.settings.soundEnabled && !this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.createSounds();
            } catch (error) {
                console.warn('Audio context not supported:', error);
            }
        }
    }

    createSounds() {
        // Create different sounds for different events
        this.sounds = {
            timerComplete: this.createBeepSound(800, 0.3, 0.5),
            timerStart: this.createBeepSound(400, 0.1, 0.3),
            timerStop: this.createBeepSound(200, 0.1, 0.3),
            warning: this.createBeepSound(600, 0.2, 0.4)
        };
    }

    createBeepSound(frequency, duration, volume) {
        return () => {
            if (!this.audioContext || !this.settings.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    playSound(soundName) {
        if (this.sounds && this.sounds[soundName] && this.settings.soundEnabled) {
            this.sounds[soundName]();
        }
    }

    applyVisualSettings() {
        const body = document.body;
        
        if (this.settings.visualAlerts) {
            body.classList.add('visual-alerts-enabled');
        } else {
            body.classList.remove('visual-alerts-enabled');
        }
    }

    applyLayoutSettings() {
        const body = document.body;
        
        // Remove existing layout classes
        body.classList.remove('layout-grid', 'layout-list');
        
        // Add current layout class
        body.classList.add(`layout-${this.settings.timerLayout}`);
    }

    applyKeyboardSettings() {
        // This will be handled by the main LaxTimer class
        // Just store the setting for reference
    }

    createSettingsPanel() {
        // Create settings button if it doesn't exist
        if (!document.getElementById('settingsBtn')) {
            const settingsBtn = document.createElement('button');
            settingsBtn.id = 'settingsBtn';
            settingsBtn.className = 'control-btn';
            settingsBtn.style.background = 'linear-gradient(135deg, #6c757d, #495057)';
            settingsBtn.innerHTML = '<i class="fas fa-cog"></i> Settings';
            settingsBtn.onclick = () => this.showSettingsModal();
            
            // Add to control buttons
            const controlButtons = document.querySelector('.control-buttons');
            if (controlButtons) {
                controlButtons.appendChild(settingsBtn);
            }
        }
    }

    showSettingsModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('settingsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="laxTimerSettings.hideSettingsModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2><i class="fas fa-cog"></i> LaxTimer Settings</h2>
                        <button class="modal-close" onclick="laxTimerSettings.hideSettingsModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <label for="soundEnabled">
                                <input type="checkbox" id="soundEnabled" ${this.settings.soundEnabled ? 'checked' : ''}>
                                Enable Sound Effects
                            </label>
                        </div>
                        <div class="setting-group">
                            <label for="visualAlerts">
                                <input type="checkbox" id="visualAlerts" ${this.settings.visualAlerts ? 'checked' : ''}>
                                Enable Visual Alerts
                            </label>
                        </div>
                        <div class="setting-group">
                            <label for="autoSave">
                                <input type="checkbox" id="autoSave" ${this.settings.autoSave ? 'checked' : ''}>
                                Auto-save Timer Data
                            </label>
                        </div>
                        <div class="setting-group">
                            <label for="confirmActions">
                                <input type="checkbox" id="confirmActions" ${this.settings.confirmActions ? 'checked' : ''}>
                                Confirm Destructive Actions
                            </label>
                        </div>
                        <div class="setting-group">
                            <label for="keyboardShortcuts">
                                <input type="checkbox" id="keyboardShortcuts" ${this.settings.keyboardShortcuts ? 'checked' : ''}>
                                Enable Keyboard Shortcuts
                            </label>
                        </div>
                        <div class="setting-group">
                            <label for="timerLayout">Timer Layout:</label>
                            <select id="timerLayout">
                                <option value="grid" ${this.settings.timerLayout === 'grid' ? 'selected' : ''}>Grid</option>
                                <option value="list" ${this.settings.timerLayout === 'list' ? 'selected' : ''}>List</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label for="defaultPenaltyTime">Default Penalty Time:</label>
                            <select id="defaultPenaltyTime">
                                <option value="00:01:00" ${this.settings.defaultPenaltyTime === '00:01:00' ? 'selected' : ''}>1 minute</option>
                                <option value="00:02:00" ${this.settings.defaultPenaltyTime === '00:02:00' ? 'selected' : ''}>2 minutes</option>
                                <option value="00:03:00" ${this.settings.defaultPenaltyTime === '00:03:00' ? 'selected' : ''}>3 minutes</option>
                                <option value="00:05:00" ${this.settings.defaultPenaltyTime === '00:05:00' ? 'selected' : ''}>5 minutes</option>
                            </select>
                        </div>
                        <div class="keyboard-shortcuts-info">
                            <h4>Keyboard Shortcuts:</h4>
                            <p><strong>Space:</strong> Toggle all timers</p>
                            <p><strong>1-8:</strong> Start individual timer</p>
                            <p><strong>Ctrl+S:</strong> Save current state</p>
                            <p><strong>Ctrl+R:</strong> Reset all timers</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="laxTimerSettings.resetToDefaults()">Reset to Defaults</button>
                        <button class="btn-primary" onclick="laxTimerSettings.saveSettingsFromModal()">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        modal.innerHTML += `
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    background: var(--card-bg);
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                body.dark .modal-content {
                    background: var(--card-dark-bg);
                    color: var(--dark-text);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                }
                body.dark .modal-header {
                    border-color: var(--border-dark-color);
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                    padding: 5px;
                }
                body.dark .modal-close {
                    color: #ccc;
                }
                .modal-body {
                    padding: 20px;
                }
                .setting-group {
                    margin-bottom: 20px;
                }
                .setting-group label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                }
                .setting-group input[type="checkbox"] {
                    margin: 0;
                }
                .setting-group select {
                    width: 100%;
                    margin-top: 5px;
                }
                .keyboard-shortcuts-info {
                    background: var(--light-bg);
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                }
                body.dark .keyboard-shortcuts-info {
                    background: var(--dark-bg);
                }
                .keyboard-shortcuts-info h4 {
                    margin-bottom: 10px;
                    color: var(--primary-color);
                }
                .keyboard-shortcuts-info p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .modal-footer {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px;
                    border-top: 1px solid var(--border-color);
                }
                body.dark .modal-footer {
                    border-color: var(--border-dark-color);
                }
                .btn-primary, .btn-secondary {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
            </style>
        `;

        document.body.appendChild(modal);
    }

    hideSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.remove();
        }
    }

    saveSettingsFromModal() {
        // Get values from modal
        this.updateSetting('soundEnabled', document.getElementById('soundEnabled').checked);
        this.updateSetting('visualAlerts', document.getElementById('visualAlerts').checked);
        this.updateSetting('autoSave', document.getElementById('autoSave').checked);
        this.updateSetting('confirmActions', document.getElementById('confirmActions').checked);
        this.updateSetting('keyboardShortcuts', document.getElementById('keyboardShortcuts').checked);
        this.updateSetting('timerLayout', document.getElementById('timerLayout').value);
        this.updateSetting('defaultPenaltyTime', document.getElementById('defaultPenaltyTime').value);

        this.hideSettingsModal();
        
        // Show success message
        if (window.timerUtils) {
            // Temporarily show success
            const originalBtn = document.getElementById('settingsBtn');
            if (originalBtn) {
                const originalText = originalBtn.innerHTML;
                originalBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    originalBtn.innerHTML = originalText;
                }, 2000);
            }
        }
    }

    resetToDefaults() {
        if (this.settings.confirmActions) {
            if (!confirm('Reset all settings to defaults? This cannot be undone.')) {
                return;
            }
        }
        
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettings();
        this.hideSettingsModal();
    }

    getSetting(key) {
        return this.settings[key];
    }

    exportSettings() {
        const blob = new Blob([JSON.stringify(this.settings, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'laxtimer-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize settings
let laxTimerSettings;

document.addEventListener('DOMContentLoaded', function() {
    laxTimerSettings = new LaxTimerSettings();
});