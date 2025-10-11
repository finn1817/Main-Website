/**
 * Simple Bridge Functions for LaxTimer Enhanced Features
 * These functions provide fallbacks and prevent JavaScript errors
 */

// Global variables to track components
let gameManager = null;
let scoreboard = null;
let dynamicTimerManager = null;

// Simple game clock simulation
let gameClockInterval = null;
let gameTime = 900; // 15 minutes in seconds
let isGamePaused = true;
let currentQuarter = 1;

// Simple scoreboard data
let homeScore = 0;
let awayScore = 0;
let homeTeamName = 'Home Team';
let awayTeamName = 'Away Team';

// Initialize simple features when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bridge functions initialized');
    
    // Initialize basic scoreboard display
    updateScoreboardDisplay();
    updateGameClockDisplay();
    
    // Try to initialize advanced components after a delay
    setTimeout(initializeAdvancedComponents, 1000);
});

// Settings function
function showSettings() {
    if (window.laxTimerSettings && laxTimerSettings.showSettingsModal) {
        laxTimerSettings.showSettingsModal();
        return;
    }
    
    // Simple fallback
    alert('Settings: This will open advanced settings once fully loaded. For now, use the game controls above.');
}

function initializeAdvancedComponents() {
    try {
        if (window.GameManager) {
            gameManager = new GameManager();
        }
        if (window.Scoreboard) {
            scoreboard = new Scoreboard();
        }
        if (window.DynamicTimerManager) {
            dynamicTimerManager = new DynamicTimerManager();
        }
        console.log('Advanced components initialized');
    } catch (error) {
        console.log('Using simple fallback functions');
    }
}

// Game Clock Functions
function toggleGameClock() {
    if (gameManager && gameManager.toggleGameClock) {
        gameManager.toggleGameClock();
        return;
    }
    
    // Simple fallback
    isGamePaused = !isGamePaused;
    
    if (!isGamePaused) {
        startSimpleGameClock();
        if (window.laxTimer) {
            laxTimer.resumeAllTimers();
        }
        document.getElementById('pauseAllText').textContent = 'Pause All';
        console.log('Game resumed (simple mode)');
    } else {
        stopSimpleGameClock();
        if (window.laxTimer) {
            laxTimer.pauseAllTimers();
        }
        document.getElementById('pauseAllText').textContent = 'Resume All';
        console.log('Game paused (simple mode)');
    }
}

function startSimpleGameClock() {
    if (gameClockInterval) return;
    
    gameClockInterval = setInterval(() => {
        if (gameTime > 0) {
            gameTime--;
            updateGameClockDisplay();
        } else {
            // Quarter ended
            stopSimpleGameClock();
            alert(`Quarter ${currentQuarter} ended!`);
        }
    }, 1000);
}

function stopSimpleGameClock() {
    if (gameClockInterval) {
        clearInterval(gameClockInterval);
        gameClockInterval = null;
    }
}

function updateGameClockDisplay() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const display = document.getElementById('globalClockDisplay');
    if (display) {
        display.textContent = timeString;
    }
    
    const quarterDisplay = document.getElementById('quarterDisplay');
    if (quarterDisplay) {
        quarterDisplay.textContent = `Quarter ${currentQuarter}`;
    }
}

function restartGame() {
    if (gameManager && gameManager.restartGame) {
        gameManager.restartGame();
        return;
    }
    
    // Simple fallback
    if (confirm('Restart the entire game? This will reset all timers and scores.')) {
        stopSimpleGameClock();
        gameTime = 900; // Reset to 15 minutes
        currentQuarter = 1;
        isGamePaused = true;
        
        // Reset scores
        homeScore = 0;
        awayScore = 0;
        updateScoreboardDisplay();
        
        // Reset all timers
        if (window.stopAllTimers) {
            stopAllTimers();
        }
        
        updateGameClockDisplay();
        console.log('Game restarted (simple mode)');
    }
}

function nextQuarter() {
    if (gameManager && gameManager.nextQuarter) {
        gameManager.nextQuarter();
        return;
    }
    
    // Simple fallback
    if (currentQuarter < 4) {
        currentQuarter++;
        gameTime = 900; // Reset quarter time
        stopSimpleGameClock();
        isGamePaused = true;
        updateGameClockDisplay();
        
        document.getElementById('pauseAllText').textContent = 'Start Quarter';
        console.log(`Advanced to Quarter ${currentQuarter} (simple mode)`);
    } else {
        alert('Game Complete! All quarters finished.');
    }
}

function showGameSettings() {
    if (gameManager && gameManager.showGameSettings) {
        gameManager.showGameSettings();
        return;
    }
    
    // Simple fallback
    const quarterLength = prompt('Enter quarter length in minutes:', '15');
    if (quarterLength && !isNaN(quarterLength)) {
        gameTime = parseInt(quarterLength) * 60;
        updateGameClockDisplay();
        console.log(`Quarter length set to ${quarterLength} minutes (simple mode)`);
    }
}

// Scoreboard Functions
function editTeamName(team) {
    if (scoreboard && scoreboard.editTeamName) {
        scoreboard.editTeamName(team);
        return;
    }
    
    // Simple fallback
    const currentName = team === 'home' ? homeTeamName : awayTeamName;
    const newName = prompt(`Enter ${team} team name:`, currentName);
    
    if (newName && newName.trim()) {
        if (team === 'home') {
            homeTeamName = newName.trim();
        } else {
            awayTeamName = newName.trim();
        }
        updateScoreboardDisplay();
        console.log(`${team} team name changed to: ${newName}`);
    }
}

function adjustScore(team, change) {
    if (scoreboard && scoreboard.adjustScore) {
        scoreboard.adjustScore(team, change);
        return;
    }
    
    // Simple fallback
    if (team === 'home') {
        homeScore = Math.max(0, homeScore + change);
    } else {
        awayScore = Math.max(0, awayScore + change);
    }
    
    updateScoreboardDisplay();
    console.log(`${team} team score: ${team === 'home' ? homeScore : awayScore}`);
}

function resetScores() {
    if (scoreboard && scoreboard.resetScores) {
        scoreboard.resetScores();
        return;
    }
    
    // Simple fallback
    if (confirm('Reset all scores to 0?')) {
        homeScore = 0;
        awayScore = 0;
        updateScoreboardDisplay();
        console.log('Scores reset (simple mode)');
    }
}

function exportGameData() {
    if (scoreboard && scoreboard.exportGameData) {
        scoreboard.exportGameData();
        return;
    }
    
    // Simple fallback
    const gameData = {
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeScore: homeScore,
        awayScore: awayScore,
        quarter: currentQuarter,
        gameTime: gameTime,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(gameData, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laxtimer-game-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Game data exported (simple mode)');
}

function showScoreboardSettings() {
    if (scoreboard && scoreboard.showScoreboardSettings) {
        scoreboard.showScoreboardSettings();
        return;
    }
    
    // Simple fallback
    alert('Scoreboard settings: Click team names to edit, use +/- buttons to adjust scores.');
}

function updateScoreboardDisplay() {
    const homeNameEl = document.getElementById('homeTeamName');
    const awayNameEl = document.getElementById('awayTeamName');
    const homeScoreEl = document.getElementById('homeScore');
    const awayScoreEl = document.getElementById('awayScore');
    
    if (homeNameEl) homeNameEl.textContent = homeTeamName;
    if (awayNameEl) awayNameEl.textContent = awayTeamName;
    if (homeScoreEl) homeScoreEl.textContent = homeScore;
    if (awayScoreEl) awayScoreEl.textContent = awayScore;
}

// Enhanced timer functions that work with game state
function startAllTimers() {
    if (isGamePaused) {
        alert('Start the game clock first before starting penalty timers.');
        return;
    }
    
    if (window.laxTimer) {
        for (let i = 1; i <= 8; i++) {
            const timeDisplay = document.getElementById('time' + i);
            if (timeDisplay && timeDisplay.textContent !== 'Not in use' && timeDisplay.textContent !== '00:00:00') {
                laxTimer.startTimer(i);
            }
        }
    }
}

function stopAllTimers() {
    if (window.laxTimer) {
        for (let i = 1; i <= 8; i++) {
            laxTimer.stopTimer(i);
        }
    }
}

console.log('Enhanced LaxTimer bridge functions loaded');