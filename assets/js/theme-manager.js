/**
 * Global Theme Manager
 * Centralized theme management for the entire website
 * Eliminates code duplication and ensures consistent behavior
 */

class ThemeManager {
  constructor() {
    if (ThemeManager._instance) {
      return ThemeManager._instance;
    }

    ThemeManager._instance = this;

    this.currentTheme = 'light';
    this.buttons = new Map();
    this.observers = [];
    this.isInitialized = false;
    this.toggleSelector = '#theme-toggle, .theme-toggle, [data-theme-toggle]';
    this.mutationObserver = null;
    this.systemMediaQuery = null;
    this.systemListener = null;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  static getInstance() {
    return ThemeManager._instance || new ThemeManager();
  }

  init() {
    if (this.isInitialized) return;

    this.applyInitialTheme();
    this.autoDiscoverToggleButtons();
    this.updateToggleButtons();
    this.setupSystemThemeListener();
    this.setupMutationObserver();

    this.isInitialized = true;
    console.log('🎨 Theme Manager initialized successfully');
  }

  applyInitialTheme() {
    const storedTheme = this.readStoredTheme();
    const preferredTheme = storedTheme || this.getSystemPreference();
    this.setTheme(preferredTheme, false);
  }

  readStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      console.warn('Could not access localStorage for theme:', error);
      return null;
    }
  }

  hasStoredPreference() {
    return !!this.readStoredTheme();
  }

  getSystemPreference() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (error) {
      console.warn('Could not read system theme preference:', error);
    }
    return 'light';
  }

  saveTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }

  autoDiscoverToggleButtons() {
    const buttons = document.querySelectorAll(this.toggleSelector);
    buttons.forEach(button => this.registerToggleButton(button));

    if (buttons.length === 0) {
      console.warn('⚠️ Theme toggle button not found. Theme manager running without manual toggle.');
    }
  }

  registerToggleButton(button, options = {}) {
    if (!(button instanceof Element)) return;

    let metadata = this.buttons.get(button);

    if (metadata) {
      metadata.options = { ...metadata.options, ...options };
      this.updateButtonAppearance(button);
      return;
    }

    metadata = {
      options: { ...options },
      listeners: {
        click: (event) => this.handleButtonClick(event, button),
        keydown: (event) => this.handleButtonKeydown(event, button)
      }
    };

    this.buttons.set(button, metadata);
    this.applyButtonAccessibility(button);
    button.addEventListener('click', metadata.listeners.click);
    button.addEventListener('keydown', metadata.listeners.keydown);
    this.updateButtonAppearance(button);
  }

  addToggleButton(button, options = {}) {
    this.registerToggleButton(button, options);
  }

  unregisterToggleButton(button) {
    const metadata = this.buttons.get(button);
    if (!metadata) return;

    button.removeEventListener('click', metadata.listeners.click);
    button.removeEventListener('keydown', metadata.listeners.keydown);
    this.buttons.delete(button);
  }

  handleButtonClick(event, button) {
    this.processToggle(button, event);
  }

  handleButtonKeydown(event, button) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.processToggle(button, event);
    }
  }

  processToggle(button, triggerEvent) {
    if (triggerEvent) {
      triggerEvent.preventDefault();
    }

    const metadata = this.buttons.get(button);
    const context = {
      manager: this,
      sourceButton: button,
      event: triggerEvent,
      currentTheme: this.currentTheme,
      toggle: () => this.toggleTheme(button)
    };

    if (metadata?.options?.beforeToggle) {
      try {
        const result = metadata.options.beforeToggle(context);

        if (result === false) {
          return;
        }

        if (result && typeof result.then === 'function') {
          result
            .then(shouldContinue => {
              if (shouldContinue === false) return;
              context.toggle();
            })
            .catch(error => {
              console.error('Theme beforeToggle error:', error);
              context.toggle();
            });
          return;
        }
      } catch (error) {
        console.error('Theme beforeToggle error:', error);
      }
    }

    context.toggle();
  }

  toggleTheme(sourceButton = null) {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme, true, sourceButton);
  }

  setTheme(theme, save = true, sourceButton = null) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'light' instead.`);
      theme = 'light';
    }

    const previousTheme = this.currentTheme;
    if (previousTheme === theme) {
      if (save) this.saveTheme(theme);
      this.updateToggleButtons();
      return;
    }

    this.currentTheme = theme;

    this.applyThemeClasses(theme);
    this.updateToggleButtons();
    this.updateDataThemeAttributes(theme);

    if (save) {
      this.saveTheme(theme);
    }

    this.notifyObservers(theme, previousTheme);

    if (sourceButton) {
      this.runAfterToggleCallbacks(sourceButton, theme, previousTheme);
      this.addButtonFeedback(sourceButton);
    } else {
      this.buttons.forEach((meta, button) => this.addButtonFeedback(button));
    }
  }

  applyThemeClasses(theme) {
    const body = document.body;
    if (!body) return;

    if (theme === 'dark') {
      body.classList.add('dark', 'dark-mode');
      body.classList.remove('light', 'light-mode');
    } else {
      body.classList.add('light', 'light-mode');
      body.classList.remove('dark', 'dark-mode');
    }
  }

  updateDataThemeAttributes(theme) {
    document.body?.setAttribute('data-theme', theme);
    document.documentElement?.setAttribute('data-theme', theme);
  }

  updateToggleButtons() {
    this.buttons.forEach((metadata, button) => {
      this.updateButtonAppearance(button);
    });
  }

  updateButtonAppearance(button) {
    if (!(button instanceof HTMLElement)) return;

    const isDark = this.currentTheme === 'dark';
    button.textContent = isDark ? '☀️' : '🌙';
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  applyButtonAccessibility(button) {
    if (!(button instanceof HTMLElement)) return;

    button.setAttribute('role', 'button');
    if (!button.hasAttribute('tabindex')) {
      button.setAttribute('tabindex', '0');
    }
  }

  addButtonFeedback(button) {
    if (!(button instanceof HTMLElement)) return;

    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (button instanceof HTMLElement) {
        button.style.transform = '';
      }
    }, 150);
  }

  runAfterToggleCallbacks(button, newTheme, previousTheme) {
    const metadata = this.buttons.get(button);
    if (!metadata?.options?.afterToggle) return;

    try {
      metadata.options.afterToggle({
        manager: this,
        sourceButton: button,
        newTheme,
        previousTheme
      });
    } catch (error) {
      console.error('Theme afterToggle error:', error);
    }
  }

  setupSystemThemeListener() {
    if (!window.matchMedia) return;

    try {
      this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemListener = (event) => {
        if (!this.hasStoredPreference()) {
          this.setTheme(event.matches ? 'dark' : 'light', false);
        }
      };

      if (this.systemMediaQuery.addEventListener) {
        this.systemMediaQuery.addEventListener('change', this.systemListener);
      } else if (this.systemMediaQuery.addListener) {
        // Safari fallback
        this.systemMediaQuery.addListener(this.systemListener);
      }
    } catch (error) {
      console.warn('Could not attach system theme listener:', error);
    }
  }

  setupMutationObserver() {
    if (this.mutationObserver || !window.MutationObserver) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches?.(this.toggleSelector)) {
            this.registerToggleButton(node);
          }
          node.querySelectorAll?.(this.toggleSelector).forEach(el => this.registerToggleButton(el));
        });

        mutation.removedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (this.buttons.has(node)) {
            this.unregisterToggleButton(node);
          }
          node.querySelectorAll?.(this.toggleSelector).forEach(el => {
            if (this.buttons.has(el)) {
              this.unregisterToggleButton(el);
            }
          });
        });
      });
    });

    if (document.body) {
      this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Observer pattern for components that need to react to theme changes
  addObserver(callback) {
    if (typeof callback === 'function') {
      this.observers.push(callback);
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

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  isLightMode() {
    return this.currentTheme === 'light';
  }

  destroy() {
    this.observers = [];
    this.buttons.forEach((metadata, button) => {
      button.removeEventListener('click', metadata.listeners.click);
      button.removeEventListener('keydown', metadata.listeners.keydown);
    });
    this.buttons.clear();

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.systemMediaQuery) {
      if (this.systemMediaQuery.removeEventListener) {
        this.systemMediaQuery.removeEventListener('change', this.systemListener);
      } else if (this.systemMediaQuery.removeListener) {
        this.systemMediaQuery.removeListener(this.systemListener);
      }
    }

    this.systemMediaQuery = null;
    this.systemListener = null;
    this.isInitialized = false;
  }
}

const themeManager = ThemeManager.getInstance();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

window.themeManager = themeManager;

console.log('🎨 Global Theme Manager loaded');
