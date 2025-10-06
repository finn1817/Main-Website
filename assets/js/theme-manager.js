/**
 * Global Theme Manager
 * Centralized theme management for the entire website
 * Eliminates code duplication and ensures consistent behavior
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.toggleButton = null;
    this.observers = [];
    this.isInitialized = false;
    
    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    if (this.isInitialized) return;
    
    this.findToggleButton();
    this.loadSavedTheme();
    this.setupEventListeners();
    this.isInitialized = true;
    
    console.log('🎨 Theme Manager initialized successfully');
  }

  findToggleButton() {
    // Look for theme toggle button with common IDs/classes
    this.toggleButton = document.getElementById('theme-toggle') || 
                       document.querySelector('.theme-toggle') ||
                       document.querySelector('[data-theme-toggle]');
    
    if (!this.toggleButton) {
      console.warn('⚠️ Theme toggle button not found. Theme management disabled.');
      return;
    }

    // Ensure button has proper accessibility attributes
    this.toggleButton.setAttribute('aria-label', 'Toggle theme');
    this.toggleButton.setAttribute('role', 'button');
  }

  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.setTheme(savedTheme, false); // Don't save again on initial load
    } catch (error) {
      console.warn('Could not load saved theme from localStorage:', error);
      this.setTheme('light', false);
    }
  }

  setTheme(theme, save = true) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'light' instead.`);
      theme = 'light';
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    // Update body class
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }

    // Update toggle button
    this.updateToggleButton();

    // Save to localStorage
    if (save) {
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.warn('Could not save theme to localStorage:', error);
      }
    }

    // Notify observers of theme change
    this.notifyObservers(theme, previousTheme);

    // Add visual feedback
    if (save && this.toggleButton) {
      this.addButtonFeedback();
    }
  }

  updateToggleButton() {
    if (!this.toggleButton) return;

    const isDark = this.currentTheme === 'dark';
    
    // Update button content and attributes
    this.toggleButton.textContent = isDark ? '☀️' : '🌙';
    this.toggleButton.setAttribute('aria-label', 
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
    this.toggleButton.title = isDark ? 'Light mode' : 'Dark mode';
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  addButtonFeedback() {
    if (!this.toggleButton) return;

    // Add visual feedback
    this.toggleButton.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      if (this.toggleButton) {
        this.toggleButton.style.transform = '';
      }
    }, 150);
  }

  setupEventListeners() {
    if (!this.toggleButton) return;

    // Click event
    this.toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleTheme();
    });

    // Keyboard support
    this.toggleButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if no manual theme has been set
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  // Observer pattern for components that need to react to theme changes
  addObserver(callback) {
    if (typeof callback === 'function') {
      this.observers.push(callback);
      // Immediately call with current theme
      callback(this.currentTheme, null);
    }
  }

  removeObserver(callback) {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(newTheme, oldTheme) {
    this.observers.forEach(callback => {
      try {
        callback(newTheme, oldTheme);
      } catch (error) {
        console.error('Theme observer error:', error);
      }
    });
  }

  // Public API methods
  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  isLightMode() {
    return this.currentTheme === 'light';
  }

  // Cleanup method for SPA scenarios
  destroy() {
    this.observers = [];
    if (this.toggleButton) {
      // Remove event listeners by cloning the button
      const newButton = this.toggleButton.cloneNode(true);
      this.toggleButton.parentNode?.replaceChild(newButton, this.toggleButton);
    }
    this.isInitialized = false;
  }
}

// Create global instance
const themeManager = new ThemeManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}

// Global access
window.themeManager = themeManager;

console.log('🎨 Global Theme Manager loaded');
