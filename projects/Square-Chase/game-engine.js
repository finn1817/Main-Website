// Game Engine for Square Chase
class GameEngine {
    constructor() {
        this.chaseSquare = document.getElementById('chaseSquare');
        this.gameStartTime = Date.now();
        
        // Position and movement
        this.chaseX = 20;
        this.chaseY = 20;
        this.targetX = 20;
        this.targetY = 20;
        
        // Game state
        this.baseChaseSpeed = 0.02;
        this.currentSpeedMultiplier = 1;
        this.difficultySpeed = 1;
        this.isPaused = false;
        this.isFrozen = false;
        this.currentEffect = 'None';
        this.effectTimeout = null;
        this.chaosInterval = null;
        
        // Scoring and timing
        this.score = 0;
        this.gameTime = 0;
        this.lastScoreTime = Date.now();
        this.scoreInterval = null;
        this.gameRunning = true;
        
        // Trail system
        this.trails = [];
        this.maxTrails = 12;
        this.trailGrowthRate = 0.01;
        this.currentTrailLength = 12;
        this.lastTrailTime = 0;
        
        // Animation frame
        this.animationId = null;
        this.isRunning = false;
        
        this.initializePosition();
        this.setupEventListeners();
    }

    initializePosition() {
        this.chaseSquare.style.left = this.chaseX + 'px';
        this.chaseSquare.style.top = this.chaseY + 'px';
        this.chaseSquare.style.display = 'block';
        this.chaseSquare.style.visibility = 'visible';
        this.chaseSquare.style.opacity = '1';
    }

    setupEventListeners() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            // Center the square on cursor (subtract half width/height)
            this.targetX = e.clientX - 12.5;
            this.targetY = e.clientY - 12.5;
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameRunning = true;
            this.startScoring();
            this.animate();
            console.log('Game engine started');
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            this.stopScoring();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            console.log('Game engine stopped');
        }
    }

    animate() {
        if (!this.isRunning || !this.gameRunning) return;

        this.updateDifficulty();
        this.updateGameTime();
        this.updatePosition();
        this.updateTrails();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateGameTime() {
        this.gameTime = (Date.now() - this.gameStartTime) / 1000;
    }

    startScoring() {
        // Add 100 points every 3 seconds
        this.scoreInterval = setInterval(() => {
            if (this.gameRunning && this.isRunning) {
                this.score += 100;
                
                // Bonus points for longer gameplay
                if (this.gameTime > 60) {
                    this.score += 50; // Bonus after 1 minute
                }
                if (this.gameTime > 120) {
                    this.score += 100; // Extra bonus after 2 minutes
                }
            }
        }, 3000);
    }

    stopScoring() {
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
    }

    endGame() {
        this.gameRunning = false;
        this.stop();
        
        // Trigger game over modal
        if (window.uiManager) {
            window.uiManager.showGameOver(this.score, this.gameTime);
        }
        
        console.log(`Game Over! Final Score: ${this.score}, Time: ${Math.floor(this.gameTime)}s`);
    }

    updateDifficulty() {
        const timeElapsed = (Date.now() - this.gameStartTime) / 1000;
        this.difficultySpeed = 1 + (timeElapsed / 30); // increase by 1x every 30 seconds
    }

    updatePosition() {
        // Don't move if paused or frozen
        if (this.isPaused || this.isFrozen) return;

        const effectiveSpeed = this.baseChaseSpeed * this.difficultySpeed * this.currentSpeedMultiplier;
        
        // Add chaos effect if active
        if (this.currentEffect === 'Chaos') {
            const chaosX = (Math.random() - 0.5) * 10;
            const chaosY = (Math.random() - 0.5) * 10;
            this.chaseX += chaosX;
            this.chaseY += chaosY;
        } else {
            this.chaseX += (this.targetX - this.chaseX) * effectiveSpeed;
            this.chaseY += (this.targetY - this.chaseY) * effectiveSpeed;
        }

        // Keep square within bounds
        this.chaseX = Math.max(0, Math.min(window.innerWidth - 25, this.chaseX));
        this.chaseY = Math.max(0, Math.min(window.innerHeight - 25, this.chaseY));

        // Update visual position
        this.chaseSquare.style.left = Math.round(this.chaseX) + 'px';
        this.chaseSquare.style.top = Math.round(this.chaseY) + 'px';
    }

    updateTrails() {
        const now = Date.now();
        if (now - this.lastTrailTime > 80) {
            this.createTrail(Math.round(this.chaseX), Math.round(this.chaseY));
            this.lastTrailTime = now;
        }
    }

    createTrail(x, y) {
        // Grow trail length over time (caps at 30)
        const timeElapsed = (Date.now() - this.gameStartTime) / 1000;
        this.currentTrailLength = Math.min(30, this.maxTrails + (timeElapsed * this.trailGrowthRate));
        
        // Remove excess trails
        while (this.trails.length >= this.currentTrailLength) {
            const oldTrail = this.trails.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.parentNode.removeChild(oldTrail);
            }
        }
        
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        
        // Calculate trail opacity based on position in array
        const trailIndex = this.trails.length;
        const opacity = 0.6 * (trailIndex / this.currentTrailLength);
        trail.style.opacity = opacity;
        
        // Make trails slightly smaller based on age
        const scale = 0.7 + (0.3 * (trailIndex / this.currentTrailLength));
        trail.style.transform = `scale(${scale})`;
        
        document.body.appendChild(trail);
        this.trails.push(trail);
        
        // Fade out trail gradually
        setTimeout(() => {
            if (trail.style.opacity > 0) {
                trail.style.opacity = '0';
            }
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
                this.trails = this.trails.filter(t => t !== trail);
            }, 800);
        }, 50);
    }

    applyEffect(effect) {
        // Clear any existing effect
        this.clearEffect();

        switch (effect.type) {
            case 'speed':
                this.currentSpeedMultiplier = effect.multiplier;
                this.currentEffect = effect.multiplier > 1 ? 'Speed Up' : 'Slowed';
                break;

            case 'invisible':
                this.chaseSquare.classList.add('invisible');
                this.currentEffect = 'Invisible';
                break;

            case 'boost':
                this.currentSpeedMultiplier = effect.multiplier;
                this.chaseSquare.classList.add('boosted');
                this.currentEffect = 'BOOST!';
                break;

            case 'freeze':
                this.isFrozen = true;
                this.chaseSquare.classList.add('frozen');
                this.currentEffect = 'Frozen';
                break;

            case 'chaos':
                this.chaseSquare.classList.add('chaotic');
                this.currentEffect = 'Chaos';
                this.startChaosEffect();
                break;

            case 'gameover':
                this.endGame();
                return; // Don't set timeout for game over

            case 'pause':
                this.isPaused = true;
                this.chaseSquare.classList.add('paused');
                this.currentEffect = 'Paused';
                return; // Don't set timeout for pause
        }

        // Set timeout to clear effect
        if (effect.duration) {
            this.effectTimeout = setTimeout(() => {
                this.clearEffect();
            }, effect.duration);
        }
    }

    clearEffect() {
        // Clear timeouts and intervals
        if (this.effectTimeout) {
            clearTimeout(this.effectTimeout);
            this.effectTimeout = null;
        }
        
        if (this.chaosInterval) {
            clearInterval(this.chaosInterval);
            this.chaosInterval = null;
        }

        // Reset states
        this.currentSpeedMultiplier = 1;
        this.isPaused = false;
        this.isFrozen = false;
        this.currentEffect = 'None';

        // Remove visual effects
        this.chaseSquare.classList.remove('invisible', 'boosted', 'frozen', 'chaotic', 'paused');
    }

    startChaosEffect() {
        // Random direction changes during chaos
        this.chaosInterval = setInterval(() => {
            const randomAngle = Math.random() * Math.PI * 2;
            const randomDistance = 50 + Math.random() * 100;
            this.targetX = this.chaseX + Math.cos(randomAngle) * randomDistance;
            this.targetY = this.chaseY + Math.sin(randomAngle) * randomDistance;
        }, 200);
    }

    getGameState() {
        return {
            speed: (this.difficultySpeed * this.currentSpeedMultiplier).toFixed(1) + 'x',
            effect: this.currentEffect,
            trailLength: Math.round(this.currentTrailLength),
            position: { x: Math.round(this.chaseX), y: Math.round(this.chaseY) },
            score: this.score,
            gameTime: Math.floor(this.gameTime),
            isGameRunning: this.gameRunning
        };
    }

    reset() {
        this.clearEffect();
        this.gameStartTime = Date.now();
        this.chaseX = 20;
        this.chaseY = 20;
        this.targetX = 20;
        this.targetY = 20;
        this.difficultySpeed = 1;
        this.currentTrailLength = this.maxTrails;
        
        // Reset scoring and timing
        this.score = 0;
        this.gameTime = 0;
        this.gameRunning = true;
        this.stopScoring();
        
        // Clear all trails
        this.trails.forEach(trail => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        });
        this.trails = [];
        
        this.initializePosition();
        
        // Restart scoring if game is running
        if (this.isRunning) {
            this.startScoring();
        }
        
        console.log('Game engine reset');
    }

    destroy() {
        this.stop();
        this.clearEffect();
        this.stopScoring();
        
        // Clear all trails
        this.trails.forEach(trail => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        });
        this.trails = [];
    }
}

// Export for use in other modules
window.GameEngine = GameEngine;