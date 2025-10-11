/**
 * Game Engine - Advanced game management and logic
 * Handles complex game scenarios and integrations
 */

class GameEngine {
    constructor(app) {
        this.app = app;
        this.gameHistory = [];
        this.eventLog = [];
        this.statistics = {
            totalPenalties: 0,
            penaltiesByTeam: { home: 0, away: 0 },
            penaltiesByType: {},
            averagePenaltyTime: 0,
            gameEvents: []
        };
    }
    
    logEvent(type, data) {
        const event = {
            timestamp: new Date().toISOString(),
            gameTime: this.app.gameState.activeGameTime,
            quarter: this.app.gameState.currentQuarter,
            type,
            data
        };
        
        this.eventLog.push(event);
        this.statistics.gameEvents.push(event);
        
        console.log('Game Event:', event);
    }
    
    onPenaltyCreated(timer) {
        this.statistics.totalPenalties++;
        this.statistics.penaltiesByTeam[timer.team]++;
        
        if (!this.statistics.penaltiesByType[timer.penaltyType]) {
            this.statistics.penaltiesByType[timer.penaltyType] = 0;
        }
        this.statistics.penaltiesByType[timer.penaltyType]++;
        
        this.logEvent('penalty_created', {
            player: timer.playerNumber,
            team: timer.team,
            teamName: timer.teamName,
            penaltyType: timer.penaltyType,
            duration: timer.duration
        });
    }
    
    onPenaltyExpired(timer) {
        this.logEvent('penalty_expired', {
            player: timer.playerNumber,
            team: timer.team,
            teamName: timer.teamName,
            penaltyType: timer.penaltyType
        });
    }
    
    onScoreChanged(team, newScore, oldScore) {
        this.logEvent('score_changed', {
            team,
            teamName: team === 'home' ? this.app.gameState.homeTeam : this.app.gameState.awayTeam,
            newScore,
            oldScore,
            change: newScore - oldScore
        });
    }
    
    onQuarterChanged(newQuarter, oldQuarter) {
        this.logEvent('quarter_changed', {
            newQuarter,
            oldQuarter
        });
    }
    
    onGameStateChanged(newState, oldState) {
        this.logEvent('game_state_changed', {
            newState,
            oldState
        });
    }
    
    getGameStatistics() {
        return {
            ...this.statistics,
            activePenalties: this.app.timers.size,
            gameProgress: {
                quarter: this.app.gameState.currentQuarter,
                timeRemaining: this.app.gameState.gameTimeRemaining,
                activeTime: this.app.gameState.activeGameTime,
                score: {
                    home: this.app.gameState.homeScore,
                    away: this.app.gameState.awayScore
                }
            }
        };
    }
    
    exportGameData() {
        const gameData = {
            gameInfo: {
                homeTeam: this.app.gameState.homeTeam,
                awayTeam: this.app.gameState.awayTeam,
                finalScore: {
                    home: this.app.gameState.homeScore,
                    away: this.app.gameState.awayScore
                },
                quarters: this.app.gameState.currentQuarter,
                totalGameTime: this.app.gameState.activeGameTime
            },
            statistics: this.getGameStatistics(),
            eventLog: this.eventLog,
            exportDate: new Date().toISOString(),
            version: '1.0'
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
        
        this.app.showNotification('Game data exported successfully!', 'success');
    }
    
    generateGameReport() {
        const stats = this.getGameStatistics();
        const winner = this.app.gameState.homeScore > this.app.gameState.awayScore ? 
            this.app.gameState.homeTeam : 
            this.app.gameState.awayScore > this.app.gameState.homeScore ? 
            this.app.gameState.awayTeam : 'Tie Game';
        
        const report = `
LACROSSE GAME REPORT
==================

Teams: ${this.app.gameState.homeTeam} vs ${this.app.gameState.awayTeam}
Final Score: ${this.app.gameState.homeScore} - ${this.app.gameState.awayScore}
Result: ${winner}
Game Duration: ${Math.floor(stats.gameProgress.activeTime / 60)} minutes

PENALTY SUMMARY
==============
Total Penalties: ${stats.totalPenalties}
${this.app.gameState.homeTeam}: ${stats.penaltiesByTeam.home}
${this.app.gameState.awayTeam}: ${stats.penaltiesByTeam.away}

Penalty Types:
${Object.entries(stats.penaltiesByType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

GAME EVENTS
===========
${this.eventLog.map(event => {
    const time = Math.floor(event.gameTime / 60) + ':' + (event.gameTime % 60).toString().padStart(2, '0');
    return `Q${event.quarter} ${time} - ${event.type}: ${JSON.stringify(event.data)}`;
}).join('\n')}

Generated: ${new Date().toLocaleString()}
        `.trim();
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laxtimer-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.app.showNotification('Game report generated!', 'success');
    }
    
    validateGameState() {
        const issues = [];
        
        // Check for impossible scores
        if (this.app.gameState.homeScore < 0 || this.app.gameState.awayScore < 0) {
            issues.push('Negative scores detected');
        }
        
        // Check for impossible time
        if (this.app.gameState.gameTimeRemaining < 0) {
            issues.push('Negative game time detected');
        }
        
        // Check for impossible quarter
        if (this.app.gameState.currentQuarter < 1 || this.app.gameState.currentQuarter > this.app.gameState.maxQuarters) {
            issues.push('Invalid quarter number');
        }
        
        return issues;
    }
    
    autoSaveGame() {
        if (this.app.settings.autoSave) {
            try {
                const saveData = {
                    gameState: this.app.gameState,
                    timers: Array.from(this.app.timers.entries()).map(([id, timer]) => ({
                        id,
                        playerNumber: timer.playerNumber,
                        penaltyType: timer.penaltyType,
                        team: timer.team,
                        teamName: timer.teamName,
                        duration: timer.duration,
                        timeRemaining: timer.timeRemaining,
                        isExpired: timer.isExpired
                    })),
                    statistics: this.statistics,
                    timestamp: new Date().toISOString()
                };
                
                localStorage.setItem('laxTimer_autoSave', JSON.stringify(saveData));
                console.log('Game auto-saved');
            } catch (e) {
                console.warn('Auto-save failed:', e);
            }
        }
    }
    
    loadAutoSave() {
        try {
            const saved = localStorage.getItem('laxTimer_autoSave');
            if (!saved) return false;
            
            const saveData = JSON.parse(saved);
            
            // Restore game state
            Object.assign(this.app.gameState, saveData.gameState);
            
            // Restore statistics
            if (saveData.statistics) {
                Object.assign(this.statistics, saveData.statistics);
            }
            
            // Restore timers
            if (saveData.timers) {
                saveData.timers.forEach(timerData => {
                    const timer = new PenaltyTimer({
                        ...timerData,
                        isPaused: this.app.gameState.isPaused,
                        onExpire: (timerId) => this.app.onTimerExpired(timerId),
                        onUpdate: (timerId) => this.app.onTimerUpdate(timerId)
                    });
                    
                    this.app.timers.set(timer.id, timer);
                    this.app.renderTimer(timer);
                });
                
                // Update timer ID counter
                this.app.timerIdCounter = Math.max(...saveData.timers.map(t => t.id), 0) + 1;
            }
            
            return true;
        } catch (e) {
            console.warn('Failed to load auto-save:', e);
            return false;
        }
    }
}