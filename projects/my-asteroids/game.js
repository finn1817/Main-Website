// game.js
class Game {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        this.gameActive = false;
        this.gameStarted = false;
        this.isPaused = false;
        this.totalKills = 0;
        this.lastShotTime = 0;
        this.shotCooldown = 200;
    }

    init() {
        if (!this.gameStarted) {
            document.getElementById('howToPlay').style.display = 'none';
            this.gameStarted = true;
            statsManager.startGame();
        }

        this.reset();
        this.gameActive = true;
        this.isPaused = false;
        
        ui.updateUI();
        this.updateWeaponIndicator();
        this.startGameLoop();
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        this.totalKills = 0;
        
        player.x = canvas.width / 2;
        player.y = canvas.height - 50;
        player.shielded = false;
        player.rapidFire = false;
        player.multiShot = false;
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        this.spawnLoop = setInterval(() => this.spawnEnemies(), Math.max(1000 - this.level * 50, 300));
    }

    stopGameLoop() {
        clearInterval(this.gameLoop);
        clearInterval(this.spawnLoop);
    }

    update() {
        if (!this.gameActive || this.isPaused) return;

        this.clearCanvas();
        this.updateEntities();
        this.checkCollisions();
        this.cleanupEntities();
        ui.updateNotifications();
        ui.drawMinimap();
    }

    clearCanvas() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    updateEntities() {
        player.update();
        player.draw();

        [...this.particles, ...this.bullets, ...this.enemies, ...this.powerUps].forEach(entity => {
            entity.update();
            entity.draw();
        });
    }

    checkCollisions() {
        // Player-Enemy collisions
        this.enemies.forEach((enemy, enemyIndex) => {
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (dist - enemy.radius - player.radius < 1) {
                if (!player.shielded) {
                    this.lives--;
                    ui.updateUI();
                    this.createExplosion(enemy.x, enemy.y, enemy.color);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
                this.enemies.splice(enemyIndex, 1);
            }
        });

        // Bullet-Enemy collisions
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                if (dist - enemy.radius - bullet.radius < 1) {
                    enemy.health--;
                    this.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10 * this.level;
                        this.totalKills++;
                        this.createExplosion(enemy.x, enemy.y, enemy.color);
                        
                        if (Math.random() < 0.15) {
                            PowerUpManager.spawnPowerUp(enemy.x, enemy.y);
                        }
                        
                        if (this.enemies.length === 0) {
                            this.levelUp();
                        }
                    } else {
                        this.createSparks(bullet.x, bullet.y, '#ffffff');
                    }
                    
                    ui.updateUI();
                }
            });
        });

        // Player-PowerUp collisions
        this.powerUps.forEach((powerUp, index) => {
            const dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y);
            if (dist - powerUp.radius - player.radius < 1) {
                this.powerUps.splice(index, 1);
                PowerUpManager.applyPowerUp(powerUp.type);
                this.createSparks(powerUp.x, powerUp.y, powerUp.color);
            }
        });
    }

    cleanupEntities() {
        this.bullets = this.bullets.filter(bullet => 
            bullet.x > -50 && bullet.x < canvas.width + 50 &&
            bullet.y > -50 && bullet.y < canvas.height + 50
        );
        
        this.particles = this.particles.filter(particle => particle.alpha > 0);
        this.powerUps = this.powerUps.filter(powerUp => powerUp.y < canvas.height + 50);
        this.enemies = this.enemies.filter(enemy => 
            enemy.x > -100 && enemy.x < canvas.width + 100 &&
            enemy.y > -100 && enemy.y < canvas.height + 100
        );
    }

    spawnEnemies() {
        if (!this.gameActive || this.isPaused) return;

        const numEnemies = Math.min(this.level + 2, 8);
        for (let i = 0; i < numEnemies; i++) {
            const radius = Math.random() * (25 - 10) + 10;
            let x, y;
            
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
                y = Math.random() * canvas.height;
            } else {
                x = Math.random() * canvas.width;
                y = 0 - radius;
            }

            const hue = Math.random() * 60 + 300; // Purple-red range
            const color = `hsl(${hue}, 70%, 50%)`;
            const angle = Math.atan2(player.y - y, player.x - x);
            const speed = 1 + this.level * 0.3;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const health = Math.ceil(this.level / 2);

            this.enemies.push(new Enemy(x, y, radius, color, velocity, health));
        }
    }

    shootBullet(targetX, targetY) {
        const now = Date.now();
        const cooldown = player.rapidFire ? this.shotCooldown / 3 : this.shotCooldown;
        
        if (now - this.lastShotTime < cooldown) return;
        this.lastShotTime = now;

        const shots = player.multiShot ? 3 : 1;
        const angleSpread = player.multiShot ? 0.3 : 0;
        
        for (let i = 0; i < shots; i++) {
            const baseAngle = Math.atan2(targetY - player.y, targetX - player.x);
            const angle = baseAngle + (i - 1) * angleSpread;
            const speed = 8;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            
            this.bullets.push(new Projectile(player.x, player.y, 4, 'white', velocity));
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                x, y,
                Math.random() * 4 + 2,
                color,
                {
                    x: (Math.random() - 0.5) * 8,
                    y: (Math.random() - 0.5) * 8
                }
            ));
        }
    }

    createSparks(x, y, color) {
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(
                x, y,
                Math.random() * 2 + 1,
                color,
                {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4
                }
            ));
        }
    }

    updateWeaponIndicator() {
        const indicator = document.getElementById('weaponIndicator');
        let weaponText = 'STANDARD';
        
        if (player.multiShot && player.rapidFire) {
            weaponText = 'MULTI-RAPID';
        } else if (player.multiShot) {
            weaponText = 'MULTI-SHOT';
        } else if (player.rapidFire) {
            weaponText = 'RAPID FIRE';
        }
        
        indicator.innerHTML = `
            <div>WEAPON: ${weaponText}</div>
            <div>AMMO: ∞</div>
        `;
    }

    showNotification(message, color) {
        ui.showNotification(message, color);
    }

    pause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            document.getElementById('pauseMenu').style.display = 'block';
        } else {
            document.getElementById('pauseMenu').style.display = 'none';
        }
    }

    levelUp() {
        this.level++;
        this.stopGameLoop();
        ui.showLevelUp();
    }

    nextLevel() {
        document.getElementById('levelUp').style.display = 'none';
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        clearInterval(this.spawnLoop);
        this.spawnLoop = setInterval(() => this.spawnEnemies(), Math.max(1000 - this.level * 50, 300));
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    gameOver() {
        this.gameActive = false;
        this.stopGameLoop();
        ui.showGameOver();
    }

    restart() {
        this.stopGameLoop();
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseMenu').style.display = 'none';
        this.init();
    }

    returnToMenu() {
        this.stopGameLoop();
        this.gameStarted = false;
        this.gameActive = false;
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('howToPlay').style.display = 'block';
    }
}