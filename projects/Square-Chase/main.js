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

            // Initialize core systems
            this.effectsManager = new EffectsManager();
            this.gameEngine = new GameEngine();
            this.zoneManager = new ZoneManager();
            this.uiManager = new UIManager(this.gameEngine, this.zoneManager);

            // Make effects manager globally available
            window.effectsManager = this.effectsManager;

            // Start the game
            this.gameEngine.start();

            // Setup cleanup on page unload
            window.addEventListener('beforeunload', () => {
                this.destroy();
            });

            this.isInitialized = true;
            console.log('🎮 Square Chase Game initialized successfully!');
            console.log('Features: 6 zone types, 4 active at a time, auto-cycling, improved UI');
            
            // Show welcome message
            this.showWelcomeMessage();
            
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

    showWelcomeMessage() {
        // Create a temporary welcome overlay
        const welcome = document.createElement('div');
        welcome.className = 'modal active';
        welcome.innerHTML = `
            <div class="modal-content">
                <h2>🎮 Welcome to Square Chase!</h2>
                <p>Experience the enhanced version with:</p>
                <ul style="text-align: left; margin: 15px 0;">
                    <li>6 different zone types (only 4 active at a time)</li>
                    <li>Auto-cycling zones every 15 seconds</li>
                    <li>Dynamic position shuffling</li>
                    <li>Enhanced visual effects</li>
                    <li>Improved UI and controls</li>
                    <li>Keyboard shortcuts</li>
                </ul>
                <p><small>Press <strong>H</strong> for help, <strong>Space</strong> to pause, or <strong>R</strong> to reset</small></p>
                <div class="modal-buttons">
                    <button class="modal-btn" id="welcomeStart">Start Playing!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        // Auto-hide after 5 seconds or on button click
        const hideWelcome = () => {
            welcome.classList.remove('active');
            setTimeout(() => {
                if (welcome.parentNode) {
                    welcome.parentNode.removeChild(welcome);
                }
            }, 300);
        };
        
        document.getElementById('welcomeStart').addEventListener('click', hideWelcome);
        setTimeout(hideWelcome, 5000);
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