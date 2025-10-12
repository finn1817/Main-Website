// Main Square Chase Game Initialization
class SquareChaseGame {
    constructor() {
        this.gameEngine = null;
        this.zoneManager = null;
        this.effectsManager = null;
        this.uiManager = null;
        this.themeManager = null;
        
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize theme manager
            this.initializeTheme();

            // Initialize core systems (but don't start runtime yet)
            this.effectsManager = new EffectsManager();
            this.gameEngine = new GameEngine();
            this.zoneManager = new ZoneManager();
            this.uiManager = new UIManager(this.gameEngine, this.zoneManager);

            // Make effects manager globally available
            window.effectsManager = this.effectsManager;
            
            // Make UI manager globally available for game over handling
            window.uiManager = this.uiManager;
            
            // Make game engine globally available for zone manager
            window.gameEngine = this.gameEngine;

            // Mark as pre-game: hide in-game UI and show start screen
            document.body.classList.add('pre-game');
            this.injectStartScreen();

            // Setup cleanup on page unload
            window.addEventListener('beforeunload', () => {
                this.destroy();
            });

            this.isInitialized = true;
            console.log('🎮 Square Chase Game initialized successfully!');
            console.log('Features: 6 zone types, 4 active at a time, auto-cycling, improved UI');
            
            // No welcome modal now; start screen replaces it
            
        } catch (error) {
            console.error('Failed to initialize Square Chase Game:', error);
        }
    }

    initializeTheme() {
        // Initialize theme manager if available
        this.themeManager = window.themeManager || (typeof ThemeManager !== 'undefined' ? ThemeManager.getInstance?.() : null);
        
        if (this.themeManager) {
            // Listen for theme changes and update body class
            this.themeManager.addObserver((newTheme) => {
                document.body.classList.toggle('dark', newTheme === 'dark');
            });
            
            // Set initial theme
            const currentTheme = this.themeManager.getCurrentTheme?.() || 'light';
            document.body.classList.toggle('dark', currentTheme === 'dark');
            
            console.log('Theme manager integrated successfully');
        } else {
            console.warn('Theme manager not available, using default light theme');
        }
    }

    injectStartScreen() {
        // Create a start screen that includes settings and help
        const start = document.createElement('div');
        start.id = 'startScreen';
        start.className = 'modal active';
        start.innerHTML = `
            <div class="modal-content">
                <h2>🎮 Square Chase</h2>
                <p>Move your cursor – the square will chase you! Hover zones for effects. Avoid the 💀.</p>
                <div class="settings-grid" style="margin: 16px 0;">
                    <div class="settings-item">
                        <label for="speedSlider_start">Base Speed: <span id="speedValue_start">2%</span></label><br>
                        <input type="range" id="speedSlider_start" min="1" max="5" value="2">
                    </div>
                    <div class="settings-item">
                        <label for="trailSlider_start">Trail Length: <span id="trailValue_start">12</span></label><br>
                        <input type="range" id="trailSlider_start" min="5" max="30" value="12">
                    </div>
                    <div class="settings-item">
                        <label><input type="checkbox" id="effectsCheckbox_start" checked> Enable Visual Effects</label>
                    </div>
                    <div class="settings-item">
                        <label><input type="checkbox" id="soundCheckbox_start" checked> Enable Sound Effects</label>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn" id="startGameBtn">Start Game</button>
                    <button class="modal-btn secondary" id="openHelpFromStart">Help</button>
                </div>
            </div>
        `;

        document.body.appendChild(start);

        // Wire up start screen controls
        const bind = () => {
            const speedSlider = document.getElementById('speedSlider_start');
            const trailSlider = document.getElementById('trailSlider_start');
            const effectsCheckbox = document.getElementById('effectsCheckbox_start');
            
            speedSlider?.addEventListener('input', (e) => {
                document.getElementById('speedValue_start').textContent = e.target.value + '%';
            });
            trailSlider?.addEventListener('input', (e) => {
                document.getElementById('trailValue_start').textContent = e.target.value;
            });
            
            document.getElementById('openHelpFromStart')?.addEventListener('click', () => {
                // Show the in-game help modal for consistency
                window.uiManager?.showModal('helpModal');
            });

            document.getElementById('startGameBtn')?.addEventListener('click', () => {
                // Apply chosen settings before start
                if (speedSlider) this.gameEngine.baseChaseSpeed = parseInt(speedSlider.value) / 100;
                if (trailSlider) {
                    this.gameEngine.maxTrails = parseInt(trailSlider.value);
                    this.gameEngine.currentTrailLength = parseInt(trailSlider.value);
                }
                if (effectsCheckbox) {
                    document.body.style.setProperty('--effects-enabled', effectsCheckbox.checked ? '1' : '0');
                }

                // Transition to playing state
                start.classList.remove('active');
                setTimeout(() => start.remove(), 300);
                document.body.classList.remove('pre-game');
                document.body.classList.add('playing');

                // Hide breadcrumb during gameplay
                const bc = document.querySelector('nav.breadcrumb');
                if (bc) bc.setAttribute('data-was-visible', '1');

                // Start engine
                this.gameEngine.start();
            });
        };

        bind();
    }

    pause() {
        if (this.gameEngine) {
            this.gameEngine.stop();
        }
    }

    resume() {
        if (this.gameEngine) {
            this.gameEngine.start();
        }
    }

    reset() {
        if (this.gameEngine) {
            this.gameEngine.reset();
        }
        if (this.zoneManager) {
            this.zoneManager.cycleZones();
        }
        if (this.effectsManager) {
            this.effectsManager.clearAllEffects();
        }
    }

    destroy() {
        console.log('Destroying Square Chase Game...');
        
        if (this.uiManager) {
            this.uiManager.destroy();
        }
        
        if (this.gameEngine) {
            this.gameEngine.destroy();
        }
        
        if (this.zoneManager) {
            this.zoneManager.destroy();
        }
        
        if (this.effectsManager) {
            this.effectsManager.destroy();
        }
        
        this.isInitialized = false;
        console.log('Square Chase Game destroyed');
    }

    // Public API for external control
    getGameState() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.gameEngine?.isRunning || false,
            gameData: this.gameEngine?.getGameState() || null
        };
    }

    // Debug methods
    forceZoneCycle() {
        if (this.zoneManager) {
            this.zoneManager.cycleZones();
        }
    }

    forceZoneShuffle() {
        if (this.zoneManager) {
            this.zoneManager.shufflePositions();
        }
    }

    triggerEffect(effectType) {
        if (this.gameEngine && this.zoneManager) {
            const effect = this.zoneManager.getZoneEffect(effectType);
            if (effect) {
                this.gameEngine.applyEffect(effect);
            }
        }
    }
}

// Auto-initialize when script loads
let gameInstance = null;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new SquareChaseGame();
    
    // Make game instance globally available for debugging
    window.squareChaseGame = gameInstance;
});

// Export for manual initialization if needed
window.SquareChaseGame = SquareChaseGame;