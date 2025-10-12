/**
 * Penalty Timer Manager
 * Handles individual penalty timers with countdown functionality
 */

class PenaltyTimer {
    constructor(options) {
        this.id = options.id;
        this.playerNumber = options.playerNumber;
        this.penaltyType = options.penaltyType;
        this.team = options.team;
        this.teamName = options.teamName;
        this.duration = options.duration; // in seconds
        this.timeRemaining = options.duration;
        this.isPaused = options.isPaused || true;
        this.isExpired = false;
        this.onExpire = options.onExpire;
        this.onUpdate = options.onUpdate;
        
        this.interval = null;
        this.element = null;
        
        this.createTimer();
    }
    
    createTimer() {
        // Timer will start paused and sync with game clock
        if (!this.isPaused && laxTimerApp && !laxTimerApp.gameState.isPaused) {
            this.start();
        }
    }
    
    start() {
        if (this.isExpired || this.interval) return;
        
        this.isPaused = false;
        this.interval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.onUpdate) {
                this.onUpdate(this.id);
            }
            
            if (this.timeRemaining <= 0) {
                this.expire();
            }
        }, 1000);
        
        this.updateTimerControls();
    }
    
    pause() {
        this.isPaused = true;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.updateTimerControls();
    }
    
    resume() {
        if (!this.isExpired) {
            this.start();
        }
    }
    
    stop() {
        this.pause();
        this.timeRemaining = this.duration;
        this.updateDisplay();
    }
    
    expire() {
        this.pause();
        this.isExpired = true;
        this.timeRemaining = 0;
        this.updateDisplay();
        
        if (this.element) {
            this.element.classList.add('expired');
        }
        
        if (this.onExpire) {
            this.onExpire(this.id);
        }
    }
    
    remove() {
        this.pause();
        if (laxTimerApp) {
            laxTimerApp.removeTimer(this.id);
        }
    }
    
    updateDisplay() {
        if (!this.element) return;
        
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeDisplay = this.element.querySelector('.timer-display');
        
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Add warning class when under 30 seconds
        if (this.timeRemaining <= 30 && this.timeRemaining > 0) {
            this.element.classList.add('warning');
        }
        
        // Add critical class when under 10 seconds
        if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
            this.element.classList.add('critical');
        }
    }
    
    updateTimerControls() {
        if (!this.element) return;
        
        const startBtn = this.element.querySelector('.timer-start');
        const pauseBtn = this.element.querySelector('.timer-pause');
        
        if (this.isPaused || this.isExpired) {
            if (startBtn) startBtn.style.display = this.isExpired ? 'none' : 'inline-block';
            if (pauseBtn) pauseBtn.style.display = 'none';
        } else {
            if (startBtn) startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'inline-block';
        }
    }
    
    createElement() {
        const timerDiv = document.createElement('div');
        timerDiv.className = `penalty-timer ${this.team}-team`;
        timerDiv.id = `timer-${this.id}`;
        
        const teamColor = this.team === 'home' ? 'var(--home-color)' : 'var(--away-color)';
        
        timerDiv.innerHTML = `
            <div class="timer-header">
                <div class="timer-info">
                    <div class="player-info">
                        <span class="player-number">#${this.playerNumber}</span>
                        <span class="team-indicator" style="color: ${teamColor}">${this.teamName}</span>
                    </div>
                    <div class="penalty-info">
                        <span class="penalty-type">${this.penaltyType}</span>
                    </div>
                </div>
                <button class="timer-remove" onclick="laxTimerApp.removeTimer(${this.id})" title="Remove Timer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="timer-display">${Math.floor(this.duration / 60).toString().padStart(2, '0')}:${(this.duration % 60).toString().padStart(2, '0')}</div>
            
            <div class="timer-controls">
                <button class="timer-btn timer-start" onclick="laxTimerApp.timers.get(${this.id}).start()" title="Start Timer">
                    <i class="fas fa-play"></i>
                </button>
                <button class="timer-btn timer-pause" onclick="laxTimerApp.timers.get(${this.id}).pause()" title="Pause Timer" style="display: none;">
                    <i class="fas fa-pause"></i>
                </button>
                <button class="timer-btn timer-stop" onclick="laxTimerApp.timers.get(${this.id}).stop()" title="Reset Timer">
                    <i class="fas fa-stop"></i>
                </button>
            </div>
        `;
        
        this.element = timerDiv;
        this.updateDisplay();
        this.updateTimerControls();
        
        return timerDiv;
    }
    
    destroy() {
        this.pause();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}
