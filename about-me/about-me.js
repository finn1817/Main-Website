// About Me - Professional JavaScript Functionality
// Enhanced with modern ES6+ features and performance optimizations

class AboutPageManager {
  constructor() {
    this.isInitialized = false;
    this.observers = new Map();
    this.animationFrames = new Set();
    this.timeouts = new Set();
    this.intervals = new Set();
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupThemeToggle();
    this.setupScrollAnimations();
    this.setupInteractiveElements();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
    
    this.isInitialized = true;
    console.log('✅ About page initialized successfully');
  }

  // Theme Toggle Functionality using global ThemeManager
  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Initialize global theme manager
    const themeManager = new ThemeManager();
    themeManager.init();
    
    // Add the toggle button to the theme manager
    themeManager.addToggleButton(toggleBtn);

    // Set up click handler
    toggleBtn.addEventListener('click', () => {
      themeManager.toggleTheme();
      // Add subtle animation feedback
      this.addButtonClickFeedback(toggleBtn);
    });
  }

  // Intersection Observer for scroll animations
  setupScrollAnimations() {
    // Create intersection observer for fade-in animations
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after animation to improve performance
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
      fadeObserver.observe(el);
    });

    // Store observer for cleanup
    this.observers.set('fadeObserver', fadeObserver);

    // Animate info cards with staggered delay
    this.animateInfoCards();
  }

  animateInfoCards() {
    const cards = document.querySelectorAll('.info-card');
    
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = index * 100; // Stagger by 100ms
            
            const timeoutId = setTimeout(() => {
              entry.target.style.animation = `fadeInUp 0.6s ease ${delay}ms forwards`;
            }, delay);
            
            this.timeouts.add(timeoutId);
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach(card => {
      card.classList.add('fade-in');
      cardObserver.observe(card);
    });

    this.observers.set('cardObserver', cardObserver);
  }

  // Interactive Elements Enhancement
  setupInteractiveElements() {
    this.setupSkillsInteraction();
    this.setupStatsAnimation();
    this.setupTimelineInteraction();
    this.setupCardHoverEffects();
  }

  setupSkillsInteraction() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(skill => {
      skill.addEventListener('mouseenter', () => {
        this.addRippleEffect(skill);
      });

      // Add keyboard interaction
      skill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.addRippleEffect(skill);
        }
      });
    });
  }

  setupStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateNumber(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(stat => {
      statsObserver.observe(stat);
    });

    this.observers.set('statsObserver', statsObserver);
  }

  animateNumber(element) {
    const finalNumber = parseInt(element.textContent.replace(/[^0-9]/g, ''));
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentNumber = Math.floor(finalNumber * easedProgress);
      
      // Preserve any non-numeric characters
      const originalText = element.textContent;
      const newText = originalText.replace(/\d+/, currentNumber);
      element.textContent = newText;
      
      if (progress < 1) {
        const frameId = requestAnimationFrame(animate);
        this.animationFrames.add(frameId);
      }
    };
    
    const frameId = requestAnimationFrame(animate);
    this.animationFrames.add(frameId);
  }

  setupTimelineInteraction() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item, index) => {
      // Add progressive reveal animation
      const delay = index * 200;
      item.style.animationDelay = `${delay}ms`;
      
      // Add hover interaction for better UX
      item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateX(10px)';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateX(0)';
      });
    });
  }

  setupCardHoverEffects() {
    const cards = document.querySelectorAll('.info-card, .about-hero');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.addGlowEffect(card);
      });
      
      card.addEventListener('mouseleave', () => {
        this.removeGlowEffect(card);
      });
    });
  }

  // Accessibility Enhancements
  setupAccessibility() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupReducedMotion();
  }

  setupKeyboardNavigation() {
    const interactiveElements = document.querySelectorAll(
      '.skill-item, .info-card, .stat-item, .timeline-item'
    );
    
    interactiveElements.forEach(element => {
      element.setAttribute('tabindex', '0');
      element.setAttribute('role', 'button');
      
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });
    });
  }

  setupFocusManagement() {
    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .info-card:focus,
      .skill-item:focus,
      .stat-item:focus {
        outline: 2px solid var(--primary-light);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  setupScreenReaderSupport() {
    // Add ARIA labels and descriptions
    document.querySelectorAll('.stat-item').forEach(stat => {
      const number = stat.querySelector('.stat-number').textContent;
      const label = stat.querySelector('.stat-label').textContent;
      stat.setAttribute('aria-label', `${number} ${label}`);
    });

    document.querySelectorAll('.skill-item').forEach(skill => {
      skill.setAttribute('role', 'listitem');
    });
  }

  setupReducedMotion() {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Performance Optimizations
  setupPerformanceOptimizations() {
    this.setupLazyLoading();
    this.setupDebouncing();
    this.setupMemoryManagement();
  }

  setupLazyLoading() {
    // Lazy load images if any are added later
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });

      this.observers.set('imageObserver', imageObserver);
    }
  }

  setupDebouncing() {
    // Debounce scroll events for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        this.timeouts.delete(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 16); // ~60fps
      
      this.timeouts.add(scrollTimeout);
    }, { passive: true });
  }

  handleScroll() {
    // Add scroll-based interactions here if needed
    const scrolled = window.pageYOffset;
    const topBar = document.querySelector('.top-bar');
    
    if (topBar) {
      if (scrolled > 100) {
        topBar.style.background = 'rgba(255, 255, 255, 0.98)';
        if (document.body.classList.contains('dark')) {
          topBar.style.background = 'rgba(30, 30, 30, 0.98)';
        }
      } else {
        topBar.style.background = 'rgba(255, 255, 255, 0.95)';
        if (document.body.classList.contains('dark')) {
          topBar.style.background = 'rgba(30, 30, 30, 0.95)';
        }
      }
    }
  }

  setupMemoryManagement() {
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Clean up on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanup();
      }
    });
  }

  // Utility Functions
  addRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';

    element.style.position = 'relative';
    element.appendChild(ripple);

    const timeoutId = setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);
    
    this.timeouts.add(timeoutId);
  }

  addButtonClickFeedback(button) {
    button.style.transform = 'scale(0.95)';
    
    const timeoutId = setTimeout(() => {
      button.style.transform = '';
    }, 150);
    
    this.timeouts.add(timeoutId);
  }

  addGlowEffect(element) {
    element.style.boxShadow = '0 8px 35px rgba(59, 130, 246, 0.2)';
  }

  removeGlowEffect(element) {
    element.style.boxShadow = '';
  }

  // Cleanup function for memory management
  cleanup() {
    console.log('🧹 Cleaning up About page resources...');
    
    // Clear all timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    
    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    
    // Cancel all animation frames
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
    this.animationFrames.clear();
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    console.log('✅ About page cleanup completed');
  }
}

// CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AboutPageManager();
  });
} else {
  new AboutPageManager();
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AboutPageManager;
}
