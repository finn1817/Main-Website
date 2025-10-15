// stats.js
class StatsManager {
    constructor() {
        this.stats = this.loadStats();
        this.gameStartTime = null;
    }

    loadStats() {
        const defaultStats = {
            highScore: 0,
            totalGames: 0,
            totalKills: 0,
            bestLevel: 1,
            totalScore: 0,
            totalPlayTime: 0
        };
        
        const saved = localStorage.getItem('dansAsteroids2025Stats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }

    saveStats() {
        localStorage.setItem('dansAsteroids2025Stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    }

    startGame() {
        this.gameStartTime = Date.now();
        this.stats.totalGames++;
        this.saveStats();
    }

    endGame(score, level, kills) {
        if (this.gameStartTime) {
            const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            this.stats.totalPlayTime += playTime;
        }

        this.stats.totalScore += score;
        this.stats.totalKills += kills;
        
        let newRecord = false;
        if (score > this.stats.highScore) {
            this.stats.highScore = score;
            newRecord = true;
        }
        
        if (level > this.stats.bestLevel) {
            this.stats.bestLevel = level;
        }
        
        this.saveStats();
        return newRecord;
    }

    updateStatsDisplay() {
        document.getElementById('highScore').textContent = this.stats.highScore.toLocaleString();
        document.getElementById('totalGames').textContent = this.stats.totalGames.toLocaleString();
        document.getElementById('totalKills').textContent = this.stats.totalKills.toLocaleString();
        document.getElementById('bestLevel').textContent = this.stats.bestLevel;
        
        const avgScore = this.stats.totalGames > 0 ? 
            Math.round(this.stats.totalScore / this.stats.totalGames) : 0;
        document.getElementById('avgScore').textContent = avgScore.toLocaleString();
        
        const minutes = Math.floor(this.stats.totalPlayTime / 60);
        const hours = Math.floor(minutes / 60);
        const displayMinutes = minutes % 60;
        const timeText = hours > 0 ? `${hours}h ${displayMinutes}m` : `${minutes}m`;
        document.getElementById('timePlayed').textContent = timeText;
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            localStorage.removeItem('dansAsteroids2025Stats');
            this.stats = this.loadStats();
            this.updateStatsDisplay();
        }
    }
}