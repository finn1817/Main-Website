class SimpleAnalytics {
    constructor() {
        this.clicks = JSON.parse(localStorage.getItem('buttonClicks') || '{}');
        this.init();
    }

    init() {
        // Track all button clicks
        document.querySelectorAll('.button-list a, .resume-button, .quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const label = e.target.textContent.trim() || e.target.title || 'unknown';
                this.trackClick(label);
                this.showClickFeedback(e.target);
                this.updateMostPopular(); // Update display after each click
            });
        });

        // Show popular sections
        this.displayPopularSections();
        this.updateMostPopular(); // Initial update
    }

    trackClick(label) {
        this.clicks[label] = (this.clicks[label] || 0) + 1;
        localStorage.setItem('buttonClicks', JSON.stringify(this.clicks));
        console.log(`📊 Tracked click: ${label} (${this.clicks[label]} times)`);
    }

    showClickFeedback(element) {
        // Visual feedback on click
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);

        // Ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute; pointer-events: none; border-radius: 50%;
            background: rgba(255,255,255,0.6); transform: scale(0);
            animation: ripple 0.6s ease-out; z-index: 1000;
            width: 20px; height: 20px; left: 50%; top: 50%;
            margin-left: -10px; margin-top: -10px;
        `;
        element.style.position = 'relative';
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    displayPopularSections() {
        const sorted = Object.entries(this.clicks).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            console.log('📈 Most popular sections:', sorted.slice(0, 3));
        }
    }

    updateMostPopular() {
        const popularDisplay = document.getElementById('popularDisplay');
        if (!popularDisplay) return;

        const sorted = Object.entries(this.clicks).sort((a, b) => b[1] - a[1]);
        
        if (sorted.length === 0) {
            popularDisplay.innerHTML = '<span class="popular-item loading">📊 Click buttons to see stats!</span>';
            return;
        }

        const [topSection, topCount] = sorted[0];
        const emoji = this.getEmojiForSection(topSection);
        
        popularDisplay.innerHTML = `
            <span class="popular-item">
                ${emoji} ${topSection} (${topCount} click${topCount > 1 ? 's' : ''})
            </span>
        `;

        // Add subtle animation
        const item = popularDisplay.querySelector('.popular-item');
        item.style.transform = 'scale(0.8)';
        item.style.opacity = '0';
        setTimeout(() => {
            item.style.transform = 'scale(1)';
            item.style.opacity = '1';
        }, 100);
    }

    getEmojiForSection(section) {
        const emojiMap = {
            'About Me': '👨‍💻',
            'Contact Info': '📧',
            'My Interests': '🎯',
            'School Involvement': '🎓',
            'More Projects': '🚀',
            'My Resume': '📄',
            'Contact': '📧',
            'Projects': '🚀',
            'Resume': '📄',
            'GitHub': '🔗'
        };
        return emojiMap[section] || '⭐';
    }
}

// Add ripple animation CSS
const rippleCSS = `
@keyframes ripple {
    to { transform: scale(4); opacity: 0; }
}`;
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SimpleAnalytics();
});