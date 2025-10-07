// status message to rotate through
class DynamicStatus {
    constructor() {
        this.messages = [
            { text: "Available to start working!", icon: "🟢" },
            { text: "Contact me through the resume site!", icon: "🟢" },
            { text: "Always actively learning!", icon: "📚" },
            { text: "Open to solo jobs and teamwork!", icon: "💼" },
            { text: "Check out my latest projects below!", icon: "🚀" },
            { text: "Always ready for new opportunities!", icon: "✨" }
        ];
        this.currentIndex = 0;
        this.statusElement = document.querySelector('.status-indicator');
        this.init();
    }

    init() {
        if (!this.statusElement) {
            console.error('Status indicator element not found');
            return;
        }
        
        // Set initial message
        this.updateMessage();
        
        // rotate messages every 8 seconds
        setInterval(() => this.rotateMessage(), 6500);
        
        // click to manually cycle
        this.statusElement.addEventListener('click', () => this.rotateMessage());
        this.statusElement.style.cursor = 'pointer';
        this.statusElement.title = 'Click to cycle through status messages';
        
        console.log('✅ Dynamic status system initialized');
    }

    rotateMessage() {
        this.currentIndex = (this.currentIndex + 1) % this.messages.length;
        this.updateMessage();
    }

    updateMessage() {
        if (!this.statusElement) return;
        
        const message = this.messages[this.currentIndex];
        
        // fade out
        this.statusElement.style.opacity = '0';
        this.statusElement.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            // update content
            this.statusElement.innerHTML = `
                <span class="status-dot">${message.icon}</span>
                ${message.text}
            `;
            
            // Update the dot styling to show the emoji properly
            const dot = this.statusElement.querySelector('.status-dot');
            if (dot) {
                dot.style.background = 'transparent';
                dot.style.fontSize = '10px';
                dot.style.display = 'inline-flex';
                dot.style.alignItems = 'center';
                dot.style.justifyContent = 'center';
                dot.style.width = '16px';
                dot.style.height = '16px';
                dot.style.marginRight = '8px';
            }

            // fade in
            this.statusElement.style.opacity = '1';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DynamicStatus();
});