// entities.js
class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    drawWithGlow(glowColor = this.color, glowIntensity = 10) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowIntensity;
        this.draw();
        ctx.shadowBlur = 0;
    }
}

class Player extends Entity {
    constructor(x, y, radius, color) {
        super(x, y, radius, color);
        this.velocity = 5;
        this.shielded = false;
        this.rapidFire = false;
        this.multiShot = false;
        this.thrusterParticles = [];
    }

    update() {
        if (keys.ArrowLeft && this.x - this.radius > 0) {
            this.x -= this.velocity;
            this.addThrusterParticle('right');
        }
        if (keys.ArrowRight && this.x + this.radius < canvas.width) {
            this.x += this.velocity;
            this.addThrusterParticle('left');
        }
        if (keys.ArrowUp && this.y - this.radius > 0) {
            this.y -= this.velocity;
            this.addThrusterParticle('down');
        }
        if (keys.ArrowDown && this.y + this.radius < canvas.height) {
            this.y += this.velocity;
            this.addThrusterParticle('up');
        }

        this.thrusterParticles.forEach((particle, index) => {
            particle.update();
            if (particle.alpha <= 0) {
                this.thrusterParticles.splice(index, 1);
            }
        });
    }

    addThrusterParticle(direction) {
        if (Math.random() < 0.3) {
            let offsetX = 0, offsetY = 0;
            let velX = 0, velY = 0;
            
            switch(direction) {
                case 'right':
                    offsetX = this.radius;
                    velX = 2;
                    break;
                case 'left':
                    offsetX = -this.radius;
                    velX = -2;
                    break;
                case 'down':
                    offsetY = this.radius;
                    velY = 2;
                    break;
                case 'up':
                    offsetY = -this.radius;
                    velY = -2;
                    break;
            }
            
            this.thrusterParticles.push(new Particle(
                this.x + offsetX,
                this.y + offsetY,
                2,
                '#00ffff',
                { x: velX, y: velY }
            ));
        }
    }

    draw() {
        this.thrusterParticles.forEach(particle => particle.draw());
        
        if (this.shielded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        this.drawWithGlow('#00ffff', 15);
    }
}

class Projectile extends Entity {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color);
        this.velocity = velocity;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw() {
        // Draw trail
        this.trail.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius * (index / this.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${index / this.trail.length * 0.5})`;
            ctx.fill();
        });
        
        this.drawWithGlow('#ffffff', 8);
    }
}

class Enemy extends Entity {
    constructor(x, y, radius, color, velocity, health) {
        super(x, y, radius, color);
        this.velocity = velocity;
        this.health = health;
        this.maxHealth = health;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.rotation = 0;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Health bar
        if (this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = 'red';
            ctx.fillRect(-barWidth/2, -this.radius - 10, barWidth, barHeight);
            ctx.fillStyle = 'green';
            ctx.fillRect(-barWidth/2, -this.radius - 10, barWidth * healthPercent, barHeight);
        }
        
        ctx.restore();
        
        this.drawWithGlow(this.color, 10);
    }
}

class Particle extends Entity {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color);
        this.velocity = velocity;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        super.draw();
        ctx.restore();
    }
}