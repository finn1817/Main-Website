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
        this.createGameHeader();
        this.createGameStats();
        this.createControlPanel();
        this.createModals();
        this.updateInstructions();
    }

    createGameHeader() {
        let gameHeader = document.querySelector('.game-header');
        if (!gameHeader) {
            gameHeader = document.createElement('div');
            gameHeader.className = 'game-header';
            document.body.appendChild(gameHeader);
        }

        gameHeader.innerHTML = `
            <div class="timer-display">
                <span class="label">TIME</span>
                <div class="value" id="timeDisplay">0:00</div>
            </div>
            <div class="score-display">
                <span class="label">SCORE</span>
                <div class="value" id="scoreDisplay">0</div>
            </div>
        `;
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
            <div><span class="label">Zones:</span> <span class="value" id="zoneDisplay">4/7</span></div>
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
        this.createGameOverModal();
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
                    <p>💀 <strong>Game Over Zone:</strong> <span style="color: #ff0000;">DANGER!</span> Ends the game if touched!</p>
                </div>
                
                <p><strong>Game Features:</strong></p>
                <p>• Only 4 zones appear at a time (cycling between 7 types)</p>
                <p>• Zones change positions every 8 seconds</p>
                <p>• New zone types appear every 15 seconds</p>
                <p>• Difficulty increases over time</p>
                <p>• Trail length grows as you play</p>
                <p>• Score increases by 100 every 3 seconds</p>
                <p>• Game Over zones appear after 30 seconds!</p>
                
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

    createGameOverModal() {
        const gameOverModal = document.createElement('div');
        gameOverModal.id = 'gameOverModal';
        gameOverModal.className = 'modal';
        gameOverModal.innerHTML = `
            <div class="modal-content">
                <h2 style="color: #ff0000;">💀 GAME OVER!</h2>
                <p>You touched the Game Over zone!</p>
                
                <div style="margin: 20px 0; padding: 15px; background: rgba(255,0,0,0.1); border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold;">Final Score</div>
                    <div style="font-size: 2rem; color: var(--zone-border); font-family: 'Courier New', monospace;" id="finalScore">0</div>
                    <div style="margin-top: 10px;">Time Survived: <span id="finalTime">0:00</span></div>
                </div>
                
                <p style="margin: 15px 0;">
                    <strong>Performance Rating:</strong> <span id="performanceRating">Beginner</span>
                </p>
                
                <div class="modal-buttons">
                    <button class="modal-btn" id="playAgainBtn">🔄 Play Again</button>
                    <button class="modal-btn secondary" id="gameOverCloseBtn">📊 View Stats</button>
                </div>
            </div>
        `;
        document.body.appendChild(gameOverModal);
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
            <small>Hover over zones for special effects! • 4 of 7 zones active • Auto-cycling every 15s • Avoid the 💀!</small>
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

        // Game Over modal buttons
        document.getElementById('playAgainBtn')?.addEventListener('click', () => {
            this.hideModal('gameOverModal');
            this.resetGame();
        });

        document.getElementById('gameOverCloseBtn')?.addEventListener('click', () => {
            this.hideModal('gameOverModal');
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

        // Handle Game Over zone immediately
        if (zoneType === 'gameover') {
            if (window.effectsManager) {
                window.effectsManager.createExplosion(
                    window.innerWidth / 2,
                    window.innerHeight / 2,
                    '#ff0000',
                    'high'
                );
            }
            this.gameEngine.endGame();
            return;
        }

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

    showGameOver(finalScore, gameTime) {
        // Update final score and time
        document.getElementById('finalScore').textContent = finalScore.toLocaleString();
        
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Calculate performance rating
        let rating = 'Beginner';
        if (finalScore >= 2000) rating = 'Expert';
        else if (finalScore >= 1500) rating = 'Advanced';
        else if (finalScore >= 1000) rating = 'Intermediate';
        else if (finalScore >= 500) rating = 'Novice';
        
        document.getElementById('performanceRating').textContent = rating;
        
        // Show the modal
        this.showModal('gameOverModal');
        
        // Create dramatic effects
        if (window.effectsManager) {
            setTimeout(() => {
                window.effectsManager.screenShake(1000);
            }, 500);
        }
        
        console.log(`Game Over displayed - Score: ${finalScore}, Time: ${gameTime}s, Rating: ${rating}`);
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
        
        // Update timer
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            const minutes = Math.floor(gameState.gameTime / 60);
            const seconds = gameState.gameTime % 60;
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update score
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = gameState.score.toLocaleString();
        }
        
        // Update other stats
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