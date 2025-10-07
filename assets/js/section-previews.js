class SectionPreviews {
    constructor() {
        this.previews = {
            'About Me': '👋 Learn about my background, skills, and what pushes me',
            'Contact Info': '📧 Get in touch by email',
            'My Interests': '🎯 Discover what I do outside of programming',
            'School Involvement': '🎓 View my academic path',
            'More Projects': '🚀 Explore a bigger portfolio of my web dev and programming projects',
            'My Resume': '📄 Download / view my resume in a web format'
        };
        this.init();
    }

    init() {
        this.createPreviewTooltip();
        this.attachHoverEvents();
        console.log('✅ Section preview tooltips initialized');
    }

    createPreviewTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'section-preview-tooltip';
        
        const tooltipCSS = `
        .section-preview-tooltip {
            position: fixed; 
            background: rgba(0,0,0,0.9); 
            color: white;
            padding: 12px 16px; 
            border-radius: 8px; 
            font-size: 0.9em;
            max-width: 300px; 
            z-index: 2100; 
            opacity: 0; 
            visibility: hidden;
            transition: all 0.3s ease; 
            pointer-events: none;
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            font-weight: 500; 
            line-height: 1.4;
            word-wrap: break-word;
        }
        .section-preview-tooltip.visible {
            opacity: 1; 
            visibility: visible;
        }
        .section-preview-tooltip::before {
            content: ''; 
            position: absolute; 
            top: -6px; 
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px; 
            height: 12px; 
            background: rgba(0,0,0,0.9);
            border-top: 1px solid rgba(255,255,255,0.2);
            border-left: 1px solid rgba(255,255,255,0.2);
        }
        `;

        const style = document.createElement('style');
        style.textContent = tooltipCSS;
        document.head.appendChild(style);
        document.body.appendChild(this.tooltip);
    }

    attachHoverEvents() {
        const buttons = document.querySelectorAll('.button-list a, .resume-button');
        
        if (buttons.length === 0) {
            console.warn('Section preview: No buttons found');
            return;
        }
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                const text = e.target.textContent.trim();
                const preview = this.previews[text];
                
                if (preview) {
                    this.showPreview(e.target, preview);
                }
            });

            button.addEventListener('mouseleave', () => {
                this.hidePreview();
            });
            
            // Add visual indicator that tooltip is available
            button.style.position = 'relative';
        });
        
        console.log(`✅ Attached hover events to ${buttons.length} buttons`);
    }

    showPreview(element, text) {
        this.tooltip.textContent = text;
        this.tooltip.classList.add('visible');
        
        // Small delay to ensure tooltip is rendered before positioning
        requestAnimationFrame(() => {
            this.positionTooltip(element);
        });
    }

    hidePreview() {
        this.tooltip.classList.remove('visible');
    }

    positionTooltip(element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        // Calculate position BELOW the button
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 15; // 15px below the button
        
        // Keep tooltip within viewport horizontally
        const margin = 10;
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
        
        // If tooltip would go below viewport, position it ABOVE the button instead
        if (top + tooltipRect.height > window.innerHeight - margin) {
            top = rect.top - tooltipRect.height - 15; // 15px above the button
            
            // Update arrow position for above placement
            this.tooltip.style.setProperty('--arrow-position', 'bottom');
            
            // You might want to add CSS for bottom arrow:
            // .section-preview-tooltip[style*="--arrow-position: bottom"]::before {
            //     top: auto; bottom: -6px;
            //     border-top: none; border-bottom: 1px solid rgba(255,255,255,0.2);
            // }
        } else {
            this.tooltip.style.setProperty('--arrow-position', 'top');
        }
        
        // Ensure tooltip doesn't go above viewport
        top = Math.max(margin, top);
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        
        console.log(`📍 Tooltip positioned: left=${left}, top=${top}, button bottom=${rect.bottom}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SectionPreviews();
});