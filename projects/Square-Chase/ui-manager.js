// UI Management System
class UIManager {
    constructor(gameEngine, zoneManager) {
        this.gameEngine = gameEngine;
        this.zoneManager = zoneManager;
        this.updateInterval = null;
        
        this.initializeUI();
        this.setupEventListeners();
        this.startUpdates();
    }

    initializeUI() {
        this.createGameStats();
        this.createControlPanel();
        this.createModals();
        this.updateInstructions();
    }

    createGameStats() {
        // Check if stats already exist
        let statsElement = document.querySelector('.game-stats');
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.className = 'game-stats';
            document.body.appendChild(statsElement);
        }

        statsElement.innerHTML = `
            <div><span class="label">Speed:</span> <span class="value" id="speedDisplay">1.0x</span></div>
            <div><span class="label">Effect:</span> <span class="value" id="effectDisplay">None</span></div>
            <div><span class="label">Trail:</span> <span class="value" id="trailDisplay">12</span></div>
            <div><span class="label">Zones:</span> <span class="value" id="zoneDisplay">4/6</span></div>
            <div><span class="label">Cycle:</span> <span class="value" id="cycleDisplay">15s</span></div>
        `;
    }

    createControlPanel() {
        let controlPanel = document.querySelector('.control-panel');
        if (!controlPanel) {
            controlPanel = document.createElement('div');
            controlPanel.className = 'control-panel';
            document.body.appendChild(controlPanel);
        }

        controlPanel.innerHTML = `
            <button class="control-btn" id="pauseBtn">⏸️ Pause</button>
            <button class="control-btn" id="resetBtn">🔄 Reset</button>
            <button class="control-btn" id="helpBtn">❓ Help</button>
            <button class="control-btn" id="settingsBtn">⚙️ Settings</button>
        `;
    }

    createModals() {
        this.createHelpModal();
        this.createSettingsModal();
    }

    createHelpModal() {
        const helpModal = document.createElement('div');
        helpModal.id = 'helpModal';
        helpModal.className = 'modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <h2>🎮 How to Play Square Chase</h2>
                <p><strong>Objective:</strong> Move your mouse around to control the cursor. The black square will chase your cursor with a delay!</p>
                
                <div style="text-align: left; margin: 20px 0;">
                    <h3>Zone Types:</h3>
                    <p>⚡ <strong>Speed Zone:</strong> Makes the square move faster</p>
                    <p>🐌 <strong>Slow Zone:</strong> Slows down the square significantly</p>
                    <p>👻 <strong>Ghost Zone:</strong> Makes the square nearly invisible</p>
                    <p>🚀 <strong>Boost Zone:</strong> Temporary super speed burst</p>
                    <p>❄️ <strong>Freeze Zone:</strong> Completely freezes the square</p>
                    <p>🌪️ <strong>Chaos Zone:</strong> Random chaotic movement</p>
                </div>
                
                <p><strong>Game Features:</strong></p>
                <p>• Only 4 zones appear at a time (cycling between 6 types)</p>
                <p>• Zones change positions every 8 seconds</p>
                <p>• New zone types appear every 15 seconds</p>
                <p>• Difficulty increases over time</p>
                <p>• Trail length grows as you play</p>
                
                <div class="modal-buttons">
                    <button class="modal-btn" id="helpCloseBtn">Got it!</button>
                </div>
            </div>
        `;
        document.body.appendChild(helpModal);
    }

    createSettingsModal() {
        const settingsModal = document.createElement('div');
        settingsModal.id = 'settingsModal';
        settingsModal.className = 'modal';
        settingsModal.innerHTML = `
            <div class="modal-content">
                <h2>⚙️ Game Settings</h2>
                
                <div style="text-align: left; margin: 20px 0;">
                    <div style="margin: 15px 0;">
                        <label for="speedSlider">Base Speed: <span id="speedValue">2%</span></label><br>
                        <input type="range" id="speedSlider" min="1" max="5" value="2" style="width: 100%; margin-top: 5px;">
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label for="trailSlider">Trail Length: <span id="trailValue">12</span></label><br>
                        <input type="range" id="trailSlider" min="5" max="30" value="12" style="width: 100%; margin-top: 5px;">
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label>
                            <input type="checkbox" id="effectsCheckbox" checked> Enable Visual Effects
                        </label>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label>
                            <input type="checkbox" id="soundCheckbox" checked> Enable Sound Effects
                        </label>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="settingsResetBtn">Reset to Default</button>
                    <button class="modal-btn" id="settingsCloseBtn">Apply</button>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);
    }

    updateInstructions() {
        let instructions = document.querySelector('.instructions');
        if (!instructions) {
            instructions = document.createElement('div');
            instructions.className = 'instructions';
            document.body.appendChild(instructions);
        }

        instructions.innerHTML = `
            Move your cursor around - the square will chase you with a delay!<br>
            <small>Hover over zones for special effects! • 4 of 6 zones active • Auto-cycling every 15s</small>
        `;
    }

    setupEventListeners() {
        // Pause button
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.togglePause();
        });

        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.resetGame();
        });

        // Help button
        document.getElementById('helpBtn')?.addEventListener('click', () => {
            this.showModal('helpModal');
        });

        // Settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showModal('settingsModal');
        });

        // Modal close buttons
        document.getElementById('helpCloseBtn')?.addEventListener('click', () => {
            this.hideModal('helpModal');
        });

        document.getElementById('settingsCloseBtn')?.addEventListener('click', () => {
            this.applySettings();
            this.hideModal('settingsModal');
        });

        document.getElementById('settingsResetBtn')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Settings controls
        const speedSlider = document.getElementById('speedSlider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                document.getElementById('speedValue').textContent = e.target.value + '%';
            });
        }

        const trailSlider = document.getElementById('trailSlider');
        if (trailSlider) {
            trailSlider.addEventListener('input', (e) => {
                document.getElementById('trailValue').textContent = e.target.value;
            });
        }

        // Zone hover events
        this.setupZoneEvents();

        // Modal background clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.resetGame();
                    break;
                case 'h':
                case 'H':
                    this.showModal('helpModal');
                    break;
                case 'Escape':
                    this.hideAllModals();
                    break;
            }
        });
    }

    setupZoneEvents() {
        // Use event delegation for zone events
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('pause-zone')) {
                this.handleZoneEnter(e.target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('pause-zone')) {
                this.handleZoneLeave(e.target);
            }
        }, true);
    }

    handleZoneEnter(zoneElement) {
        const zoneType = zoneElement.dataset.type;
        if (!zoneType || zoneElement.classList.contains('hidden')) return;

        const effect = this.zoneManager.getZoneEffect(zoneType);
        if (effect) {
            this.gameEngine.applyEffect(effect);
            
            // Visual feedback
            if (window.effectsManager) {
                window.effectsManager.createZoneActivation(zoneElement);
                
                // Show floating text
                const rect = zoneElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                window.effectsManager.showFloatingText(centerX, centerY, effect.type.toUpperCase());
            }
        }

        console.log(`Entered ${zoneType} zone`);
    }

    handleZoneLeave(zoneElement) {
        const zoneType = zoneElement.dataset.type;
        if (!zoneType) return;

        // Only clear effect for pause zones
        if (zoneType === 'pause') {
            this.gameEngine.clearEffect();
        }

        console.log(`Left ${zoneType} zone`);
    }

    togglePause() {
        const pauseBtn = document.getElementById('pauseBtn');
        if (this.gameEngine.isRunning) {
            this.gameEngine.stop();
            pauseBtn.textContent = '▶️ Resume';
            pauseBtn.classList.add('active');
        } else {
            this.gameEngine.start();
            pauseBtn.textContent = '⏸️ Pause';
            pauseBtn.classList.remove('active');
        }
    }

    resetGame() {
        this.gameEngine.reset();
        this.zoneManager.cycleZones();
        
        // Visual feedback
        if (window.effectsManager) {
            window.effectsManager.createExplosion(
                window.innerWidth / 2,
                window.innerHeight / 2,
                'var(--zone-border)',
                'high'
            );
        }
        
        console.log('Game reset');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    applySettings() {
        const speedSlider = document.getElementById('speedSlider');
        const trailSlider = document.getElementById('trailSlider');
        const effectsCheckbox = document.getElementById('effectsCheckbox');

        if (speedSlider) {
            const newSpeed = parseInt(speedSlider.value) / 100;
            this.gameEngine.baseChaseSpeed = newSpeed;
        }

        if (trailSlider) {
            const newTrailLength = parseInt(trailSlider.value);
            this.gameEngine.maxTrails = newTrailLength;
            this.gameEngine.currentTrailLength = newTrailLength;
        }

        if (effectsCheckbox) {
            document.body.style.setProperty('--effects-enabled', effectsCheckbox.checked ? '1' : '0');
        }

        console.log('Settings applied');
    }

    resetSettings() {
        document.getElementById('speedSlider').value = 2;
        document.getElementById('speedValue').textContent = '2%';
        document.getElementById('trailSlider').value = 12;
        document.getElementById('trailValue').textContent = '12';
        document.getElementById('effectsCheckbox').checked = true;
        document.getElementById('soundCheckbox').checked = true;
    }

    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateGameStats();
        }, 100);
    }

    updateGameStats() {
        if (!this.gameEngine) return;

        const gameState = this.gameEngine.getGameState();
        
        const speedDisplay = document.getElementById('speedDisplay');
        const effectDisplay = document.getElementById('effectDisplay');
        const trailDisplay = document.getElementById('trailDisplay');

        if (speedDisplay) speedDisplay.textContent = gameState.speed;
        if (effectDisplay) effectDisplay.textContent = gameState.effect;
        if (trailDisplay) trailDisplay.textContent = gameState.trailLength;

        // Update cycle timer (simplified)
        const cycleDisplay = document.getElementById('cycleDisplay');
        if (cycleDisplay) {
            const elapsed = Math.floor((Date.now() - this.gameEngine.gameStartTime) / 1000) % 15;
            const remaining = 15 - elapsed;
            cycleDisplay.textContent = remaining + 's';
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Remove created elements
        document.querySelectorAll('.game-stats, .control-panel, .modal').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }
}

// Export for use in other modules
window.UIManager = UIManager;