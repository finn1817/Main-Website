// powerups.js
class PowerUp extends Entity {
    constructor(x, y, radius, color, type) {
        super(x, y, radius, color);
        this.type = type;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: 2
        };
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.lifeTime = 0;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.pulsePhase += 0.1;
        this.lifeTime++;
    }

    draw() {
        const pulseSize = this.radius + Math.sin(this.pulsePhase) * 3;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw icon based on type
        ctx.fillStyle = '#000';
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '';
        switch(this.type) {
            case 'health': icon = '+'; break;
            case 'rapidFire': icon = '⚡'; break;
            case 'shield': icon = '🛡'; break;
            case 'multiShot': icon = '※'; break;
        }
        
        ctx.fillText(icon, this.x, this.y);
        
        // Glow effect
        this.drawWithGlow(this.color, 15);
    }
}

class PowerUpManager {
    static applyPowerUp(type) {
        switch (type) {
            case 'health':
                game.lives = Math.min(game.lives + 1, 5);
                game.showNotification('HEALTH RESTORED!', '#00ff00');
                break;
                
            case 'rapidFire':
                player.rapidFire = true;
                setTimeout(() => {
                    player.rapidFire = false;
                    game.updateWeaponIndicator();
                }, 8000);
                game.showNotification('RAPID FIRE ACTIVATED!', '#ffff00');
                break;
                
            case 'shield':
                player.shielded = true;
                setTimeout(() => {
                    player.shielded = false;
                }, 10000);
                game.showNotification('SHIELD ACTIVATED!', '#0080ff');
                break;
                
            case 'multiShot':
                player.multiShot = true;
                setTimeout(() => {
                    player.multiShot = false;
                    game.updateWeaponIndicator();
                }, 12000);
                game.showNotification('MULTI-SHOT ENABLED!', '#ff0080');
                break;
        }
        
        game.updateWeaponIndicator();
        ui.updateUI();
    }

    static spawnPowerUp(x, y) {
        const types = ['health', 'rapidFire', 'shield', 'multiShot'];
        const colors = ['#00ff00', '#ffff00', '#0080ff', '#ff0080'];
        const type = types[Math.floor(Math.random() * types.length)];
        const color = colors[types.indexOf(type)];
        
        game.powerUps.push(new PowerUp(x, y, 12, color, type));
    }
}