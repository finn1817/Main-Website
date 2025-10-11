/**
 * Digital Scoreboard - Team names and scoring system
 * Handles score tracking and team management
 */

class Scoreboard {
    constructor() {
        this.homeTeam = 'Home Team';
        this.awayTeam = 'Away Team';
        this.homeScore = 0;
        this.awayScore = 0;
        this.init();
    }

    init() {
        this.createScoreboardUI();
        this.loadScoreboardData();
        console.log('Scoreboard initialized');
    }

    createScoreboardUI() {
        const scoreboardContainer = document.createElement('div');
        scoreboardContainer.id = 'scoreboardContainer';
        scoreboardContainer.className = 'scoreboard-container';
        
        scoreboardContainer.innerHTML = `
            <div class="scoreboard">
                <div class="team-section home-team">
                    <div class="team-name-display">
                        <span id="homeTeamName" onclick="scoreboard.editTeamName('home')">${this.homeTeam}</span>
                        <i class="fas fa-edit edit-icon"></i>
                    </div>
                    <div class="team-score">
                        <span id="homeScore">${this.homeScore}</span>
                    </div>
                    <div class="score-controls">
                        <button onclick="scoreboard.adjustScore('home', 1)" class="score-btn plus-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="scoreboard.adjustScore('home', -1)" class="score-btn minus-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="scoreboard-center">
                    <div class="vs-text">VS</div>
                    <div class="scoreboard-controls">
                        <button onclick="scoreboard.resetScores()" class="reset-scores-btn">
                            <i class="fas fa-redo"></i> Reset Scores
                        </button>
                    </div>
                </div>
                
                <div class="team-section away-team">
                    <div class="team-name-display">
                        <span id="awayTeamName" onclick="scoreboard.editTeamName('away')">${this.awayTeam}</span>
                        <i class="fas fa-edit edit-icon"></i>
                    </div>
                    <div class="team-score">
                        <span id="awayScore">${this.awayScore}</span>
                    </div>
                    <div class="score-controls">
                        <button onclick="scoreboard.adjustScore('away', 1)" class="score-btn plus-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="scoreboard.adjustScore('away', -1)" class="score-btn minus-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert after game clock container
        const gameClockContainer = document.getElementById('gameClockContainer');
        if (gameClockContainer) {
            gameClockContainer.after(scoreboardContainer);
        } else {
            // Fallback: insert after header
            const header = document.querySelector('header');
            if (header) {
                header.after(scoreboardContainer);
            }
        }
    }

    adjustScore(team, change) {
        if (team === 'home') {
            this.homeScore = Math.max(0, this.homeScore + change);
            document.getElementById('homeScore').textContent = this.homeScore;
        } else if (team === 'away') {
            this.awayScore = Math.max(0, this.awayScore + change);
            document.getElementById('awayScore').textContent = this.awayScore;
        }

        // Visual feedback for scoring
        if (change > 0) {
            this.showScoreAnimation(team);
        }

        this.saveScoreboardData();
        console.log(`${team} team score: ${team === 'home' ? this.homeScore : this.awayScore}`);
    }

    showScoreAnimation(team) {
        const scoreElement = document.getElementById(team === 'home' ? 'homeScore' : 'awayScore');
        if (scoreElement) {
            scoreElement.style.transform = 'scale(1.3)';
            scoreElement.style.color = '#28a745';
            
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
                scoreElement.style.color = '';
            }, 500);
        }
    }

    editTeamName(team) {
        const currentName = team === 'home' ? this.homeTeam : this.awayTeam;
        const newName = prompt(`Enter ${team} team name:`, currentName);
        
        if (newName && newName.trim()) {
            if (team === 'home') {
                this.homeTeam = newName.trim();
                document.getElementById('homeTeamName').textContent = this.homeTeam;
            } else {
                this.awayTeam = newName.trim();
                document.getElementById('awayTeamName').textContent = this.awayTeam;
            }
            this.saveScoreboardData();
        }
    }

    resetScores() {
        if (window.laxTimerSettings && laxTimerSettings.getSetting('confirmActions')) {
            if (!confirm('Reset both team scores to 0?')) {
                return;
            }
        }

        this.homeScore = 0;
        this.awayScore = 0;
        document.getElementById('homeScore').textContent = this.homeScore;
        document.getElementById('awayScore').textContent = this.awayScore;
        
        this.saveScoreboardData();
        console.log('Scores reset');
    }

    loadScoreboardData() {
        try {
            const saved = localStorage.getItem('laxTimer_scoreboard');
            if (saved) {
                const data = JSON.parse(saved);
                this.homeTeam = data.homeTeam || 'Home Team';
                this.awayTeam = data.awayTeam || 'Away Team';
                this.homeScore = data.homeScore || 0;
                this.awayScore = data.awayScore || 0;
                
                // Update display if elements exist
                const homeNameEl = document.getElementById('homeTeamName');
                const awayNameEl = document.getElementById('awayTeamName');
                const homeScoreEl = document.getElementById('homeScore');
                const awayScoreEl = document.getElementById('awayScore');
                
                if (homeNameEl) homeNameEl.textContent = this.homeTeam;
                if (awayNameEl) awayNameEl.textContent = this.awayTeam;
                if (homeScoreEl) homeScoreEl.textContent = this.homeScore;
                if (awayScoreEl) awayScoreEl.textContent = this.awayScore;
                
                console.log('Scoreboard data loaded');
            }
        } catch (error) {
            console.warn('Failed to load scoreboard data:', error);
        }
    }

    saveScoreboardData() {
        try {
            const data = {
                homeTeam: this.homeTeam,
                awayTeam: this.awayTeam,
                homeScore: this.homeScore,
                awayScore: this.awayScore,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('laxTimer_scoreboard', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save scoreboard data:', error);
        }
    }

    exportScoreboardData() {
        const data = {
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            quarter: window.gameManager ? gameManager.getCurrentQuarter() : 1,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lacrosse-game-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Scoreboard data exported');
    }

    getGameSummary() {
        return {
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            quarter: window.gameManager ? gameManager.getCurrentQuarter() : 1,
            winner: this.homeScore > this.awayScore ? this.homeTeam : 
                   this.awayScore > this.homeScore ? this.awayTeam : 'Tie'
        };
    }

    showQuickScoreModal() {
        // Create quick score entry modal
        const modal = document.createElement('div');
        modal.id = 'quickScoreModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="scoreboard.hideQuickScoreModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2><i class="fas fa-futbol"></i> Quick Score Entry</h2>
                        <button class="modal-close" onclick="scoreboard.hideQuickScoreModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="quick-score-section">
                            <h3>${this.homeTeam}</h3>
                            <input type="number" id="quickHomeScore" value="${this.homeScore}" min="0">
                        </div>
                        <div class="quick-score-section">
                            <h3>${this.awayTeam}</h3>
                            <input type="number" id="quickAwayScore" value="${this.awayScore}" min="0">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="scoreboard.hideQuickScoreModal()">Cancel</button>
                        <button class="btn-primary" onclick="scoreboard.saveQuickScores()">Update Scores</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    hideQuickScoreModal() {
        const modal = document.getElementById('quickScoreModal');
        if (modal) {
            modal.remove();
        }
    }

    saveQuickScores() {
        const homeInput = document.getElementById('quickHomeScore');
        const awayInput = document.getElementById('quickAwayScore');

        if (homeInput && awayInput) {
            const newHomeScore = Math.max(0, parseInt(homeInput.value) || 0);
            const newAwayScore = Math.max(0, parseInt(awayInput.value) || 0);

            this.homeScore = newHomeScore;
            this.awayScore = newAwayScore;

            document.getElementById('homeScore').textContent = this.homeScore;
            document.getElementById('awayScore').textContent = this.awayScore;

            this.saveScoreboardData();
        }

        this.hideQuickScoreModal();
    }
}

// Initialize scoreboard
let scoreboard;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other components to load
    setTimeout(() => {
        scoreboard = new Scoreboard();
    }, 200);
});