// Global Theme Manager - Simple and Reliable
(function() {
  // Apply stored theme immediately
  const storedTheme = localStorage.getItem('theme') || 'light';
  document.body.className = document.body.className.replace(/\b(light|dark|light-mode|dark-mode)\b/g, '');
  document.body.classList.add(storedTheme, storedTheme + '-mode');
  document.body.setAttribute('data-theme', storedTheme);
  document.documentElement.setAttribute('data-theme', storedTheme);

  class ThemeManager {
    constructor() {
      if (window.themeManager) return window.themeManager;
      
      this.currentTheme = storedTheme;
      this.observers = [];
      this.setupToggle();
    }

    setupToggle() {
      const self = this;
      
      function handleClick(event) {
        event.preventDefault();
        const newTheme = self.currentTheme === 'dark' ? 'light' : 'dark';
        self.setTheme(newTheme);
      }

      function setupButton(button) {
        if (button._setup) return;
        button._setup = true;
        button.addEventListener('click', handleClick);
        button.textContent = self.currentTheme === 'dark' ? '☀️' : '🌙';
      }

      // Setup existing buttons
      const setup = () => {
        document.querySelectorAll('#theme-toggle, .theme-toggle, .toggle-btn').forEach(setupButton);
      };

      setup();
      document.addEventListener('DOMContentLoaded', setup);
      
      // Watch for new buttons
      if (window.MutationObserver) {
        const observer = new MutationObserver(setup);
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
      }
    }

    setTheme(theme) {
      this.currentTheme = theme;
      
      document.body.className = document.body.className.replace(/\b(light|dark|light-mode|dark-mode)\b/g, '');
      document.body.classList.add(theme, theme + '-mode');
      document.body.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      localStorage.setItem('theme', theme);
      
      document.querySelectorAll('#theme-toggle, .theme-toggle, .toggle-btn').forEach(button => {
        button.textContent = theme === 'dark' ? '☀️' : '🌙';
      });

      this.observers.forEach(callback => {
        try { callback(theme); } catch(e) {}
      });
    }

    registerToggleButton(button) {
      // Already handled automatically
      return;
    }

    getCurrentTheme() {
      return this.currentTheme;
    }

    addObserver(callback) {
      this.observers.push(callback);
    }
  }

  // Create global instance
  window.themeManager = new ThemeManager();
  window.ThemeManager = ThemeManager;
  console.log('🎨 Theme Manager loaded');
})();
