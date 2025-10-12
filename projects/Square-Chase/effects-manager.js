// Visual Effects Manager
class EffectsManager {
    constructor() {
        this.particles = [];
        this.activeEffects = [];
    }

    createParticles(x, y, count = 8, color = 'var(--zone-border)') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (Math.PI * 2 / count) * i;
            const distance = 30 + Math.random() * 20;
            const particleX = Math.cos(angle) * distance;
            const particleY = Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = color;
            particle.style.setProperty('--particle-x', particleX + 'px');
            particle.style.setProperty('--particle-y', particleY + 'px');
            
            document.body.appendChild(particle);
            this.particles.push(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                this.particles = this.particles.filter(p => p !== particle);
            }, 1000);
        }
    }

    screenShake(duration = 500) {
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, duration);
    }

    createZoneActivation(element) {
        element.classList.add('active');
        
        // Create particles at zone center
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.createParticles(centerX, centerY, 12);
        this.screenShake();

        // Remove active class after animation
        setTimeout(() => {
            element.classList.remove('active');
        }, 500);
    }

    createExplosion(x, y, color = '#ff6600', intensity = 'medium') {
        const particleCounts = {
            low: 6,
            medium: 12,
            high: 20
        };
        
        const count = particleCounts[intensity] || 12;
        this.createParticles(x, y, count, color);
        
        // Create additional ring effect for high intensity
        if (intensity === 'high') {
            setTimeout(() => {
                this.createParticles(x, y, count / 2, color);
            }, 150);
        }
    }

    createTrailBurst(x, y) {
        // Create a burst of smaller particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'var(--square-color)';
            particle.style.borderRadius = '50%';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9996';
            
            const angle = (Math.PI * 2 / 8) * i;
            const distance = 15 + Math.random() * 10;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            particle.style.transition = 'all 0.6s ease-out';
            document.body.appendChild(particle);
            
            // Animate outward
            setTimeout(() => {
                particle.style.left = targetX + 'px';
                particle.style.top = targetY + 'px';
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0.5)';
            }, 10);
            
            // Remove after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 600);
        }
    }

    createRipple(x, y, color = 'var(--zone-border)') {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = (x - 25) + 'px';
        ripple.style.top = (y - 25) + 'px';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.border = `2px solid ${color}`;
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9996';
        ripple.style.opacity = '0.8';
        ripple.style.transform = 'scale(0)';
        ripple.style.transition = 'all 0.6s ease-out';
        
        document.body.appendChild(ripple);
        
        // Animate ripple
        setTimeout(() => {
            ripple.style.transform = 'scale(3)';
            ripple.style.opacity = '0';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    showFloatingText(x, y, text, color = 'var(--text-color)') {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        textElement.style.position = 'fixed';
        textElement.style.left = x + 'px';
        textElement.style.top = y + 'px';
        textElement.style.color = color;
        textElement.style.fontSize = '1.2rem';
        textElement.style.fontWeight = 'bold';
        textElement.style.pointerEvents = 'none';
        textElement.style.zIndex = '9999';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.transition = 'all 1s ease-out';
        textElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        
        document.body.appendChild(textElement);
        
        // Animate upward and fade
        setTimeout(() => {
            textElement.style.transform = 'translate(-50%, -100px)';
            textElement.style.opacity = '0';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        }, 1000);
    }

    createSpeedLines(x, y, direction = 'right') {
        const lineCount = 5;
        const directions = {
            right: { dx: 50, dy: 0 },
            left: { dx: -50, dy: 0 },
            up: { dx: 0, dy: -50 },
            down: { dx: 0, dy: 50 }
        };
        
        const dir = directions[direction] || directions.right;
        
        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            line.style.position = 'fixed';
            line.style.width = '20px';
            line.style.height = '2px';
            line.style.background = 'var(--square-color)';
            line.style.left = (x - 10) + 'px';
            line.style.top = (y + (i - 2) * 4) + 'px';
            line.style.pointerEvents = 'none';
            line.style.zIndex = '9997';
            line.style.opacity = '0.8';
            line.style.transition = 'all 0.3s ease-out';
            
            document.body.appendChild(line);
            
            // Animate lines
            setTimeout(() => {
                line.style.left = (x - 10 + dir.dx) + 'px';
                line.style.top = (y + (i - 2) * 4 + dir.dy) + 'px';
                line.style.opacity = '0';
            }, i * 20);
            
            // Remove after animation
            setTimeout(() => {
                if (line.parentNode) {
                    line.parentNode.removeChild(line);
                }
            }, 300 + i * 20);
        }
    }

    clearAllEffects() {
        // Remove all particles
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
        
        // Remove shake effect
        document.body.classList.remove('shake');
        
        // Clear active effects
        this.activeEffects = [];
    }

    destroy() {
        this.clearAllEffects();
    }
}

// Export for use in other modules
window.EffectsManager = EffectsManager;