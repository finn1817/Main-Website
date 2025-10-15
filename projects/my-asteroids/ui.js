// ui.js
class UIManager {
    constructor() {
        this.notifications = [];
    }

    updateUI() {
        document.getElementById('score').textContent = game.score.toLocaleString();
        document.getElementById('level').textContent = game.level;
        document.getElementById('enemyCount').textContent = game.enemies.length;
        this.updateLivesDisplay();
    }

    updateLivesDisplay() {
        const livesDisplay = document.getElementById('livesDisplay');
        livesDisplay.innerHTML = '';
        
        for (let i = 0; i < game.lives; i++) {
            const lifeIcon = document.createElement('div');
            lifeIcon.className = 'life-icon';
            livesDisplay.appendChild(lifeIcon);
        }
    }

    showGameOver() {
        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = `Final Score: ${game.score.toLocaleString()}`;
        
        const newRecord = statsManager.endGame(game.score, game.level, game.totalKills);
        const newRecordElement = document.getElementById('newRecord');
        
        if (newRecord) {
            newRecordElement.style.display = 'block';
            newRecordElement.classList.add('pulsing');
        } else {
            newRecordElement.style.display = 'none';
        }
        
        document.getElementById('gameOver').style.display = 'block';
    }

    showLevelUp() {
        const bonus = game.level * 100;
        game.score += bonus;
        document.getElementById('levelBonus').textContent = `Bonus Points: +${bonus}`;
        document.getElementById('levelUp').style.display = 'block';
    }

    showNotification(message, color = '#00ffff') {
        this.notifications.push({
            message,
            color,
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            alpha: 1,
            life: 0
        });
    }

    updateNotifications() {
        this.notifications.forEach((notification, index) => {
            notification.life++;
            notification.y -= 1;
            notification.alpha = Math.max(0, 1 - notification.life / 120);
            
            ctx.save();
            ctx.globalAlpha = notification.alpha;
            ctx.fillStyle = notification.color;
            ctx.font = 'bold 24px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(notification.message, notification.x, notification.y);
            ctx.restore();
            
            if (notification.alpha <= 0) {
                this.notifications.splice(index, 1);
            }
        });
    }

    drawMinimap() {
        const minimap = document.getElementById('minimap');
        const minimapCtx = minimap.getContext('2d');
        const scaleX = minimap.width / canvas.width;
        const scaleY = minimap.height / canvas.height;
        
        minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        minimapCtx.fillRect(0, 0, minimap.width, minimap.height);
        
        // Player
        minimapCtx.fillStyle = '#00ffff';
        minimapCtx.fillRect(
            player.x * scaleX - 1,
            player.y * scaleY - 1,
            2, 2
        );
        
        // Enemies
        game.enemies.forEach(enemy => {
            minimapCtx.fillStyle = '#ff6b35';
            minimapCtx.fillRect(
                enemy.x * scaleX - 1,
                enemy.y * scaleY - 1,
                2, 2
            );
        });
        
        // Power-ups
        game.powerUps.forEach(powerUp => {
            minimapCtx.fillStyle = powerUp.color;
            minimapCtx.fillRect(
                powerUp.x * scaleX - 1,
                powerUp.y * scaleY - 1,
                2, 2
            );
        });
    }
}