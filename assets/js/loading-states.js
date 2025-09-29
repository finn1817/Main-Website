/* Loading States JavaScript Utilities for Dan Finn's Website */

class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
    this.init();
  }

  init() {
    // Create global loading overlay
    this.createLoadingOverlay();
    
    // Add page loading bar
    this.createPageLoadingBar();
    
    // Auto-hide loading on page load
    window.addEventListener('load', () => {
      this.hidePageLoading();
    });

    // Add loading to external links
    this.addExternalLinkLoading();
  }

  createLoadingOverlay() {
    if (document.getElementById('global-loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div class="loading-pulse"></div>
        <div class="loading-text">Loading...</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  createPageLoadingBar() {
    if (document.getElementById('page-loading-bar')) return;

    const loadingBar = document.createElement('div');
    loadingBar.id = 'page-loading-bar';
    loadingBar.className = 'page-loading';
    loadingBar.innerHTML = '<div class="page-loading-bar"></div>';
    document.body.appendChild(loadingBar);
  }

  // Show global loading
  showLoading(text = 'Loading...', type = 'pulse') {
    const overlay = document.getElementById('global-loading-overlay');
    if (!overlay) return;

    const loaderTypes = {
      spinner: '<div class="loading-spinner"></div>',
      pulse: '<div class="loading-pulse"></div>',
      dots: '<div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>'
    };

    overlay.innerHTML = `
      <div style="text-align: center;">
        ${loaderTypes[type] || loaderTypes.pulse}
        <div class="loading-text">${text}</div>
      </div>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Hide global loading
  hideLoading() {
    const overlay = document.getElementById('global-loading-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Page loading progress
  showPageLoading() {
    const bar = document.querySelector('.page-loading-bar');
    if (!bar) return;

    document.getElementById('page-loading-bar').style.display = 'block';
    this.updatePageLoading(0);
  }

  updatePageLoading(progress) {
    const bar = document.querySelector('.page-loading-bar');
    if (!bar) return;

    bar.style.width = `${Math.min(progress, 100)}%`;
  }

  hidePageLoading() {
    const loadingBar = document.getElementById('page-loading-bar');
    if (!loadingBar) return;

    this.updatePageLoading(100);
    setTimeout(() => {
      loadingBar.style.display = 'none';
    }, 500);
  }

  // Button loading states
  setButtonLoading(button, loading = true) {
    if (loading) {
      button.classList.add('btn-loading');
      button.dataset.originalText = button.textContent;
      button.textContent = '';
      button.disabled = true;
    } else {
      button.classList.remove('btn-loading');
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  // Form loading states
  setFormLoading(form, loading = true) {
    if (loading) {
      form.classList.add('form-loading');
      // Disable all form elements
      const elements = form.querySelectorAll('input, select, textarea, button');
      elements.forEach(el => {
        el.disabled = true;
      });
    } else {
      form.classList.remove('form-loading');
      // Re-enable all form elements
      const elements = form.querySelectorAll('input, select, textarea, button');
      elements.forEach(el => {
        el.disabled = false;
      });
    }
  }

  // Image loading with placeholder
  setupImageLoading(img) {
    img.classList.add('image-loading');
    
    const handleLoad = () => {
      img.classList.remove('image-loading');
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };

    const handleError = () => {
      img.classList.remove('image-loading');
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
  }

  // Skeleton loading for cards
  createSkeleton(container, type = 'card') {
    const skeletons = {
      card: `
        <div class="skeleton" style="height: 200px; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text large"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text small"></div>
      `,
      list: `
        <div class="skeleton skeleton-text" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text small" style="margin-bottom: 12px;"></div>
      `,
      profile: `
        <div class="skeleton" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text large"></div>
        <div class="skeleton skeleton-text"></div>
      `
    };

    container.innerHTML = skeletons[type] || skeletons.card;
  }

  // Auto-loading for external links
  addExternalLinkLoading() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[target="_blank"]');
      if (!link) return;

      // Only show loading for project links, not social media
      if (link.href.includes('finn1817.github.io') || link.href.includes('localhost')) {
        this.showLoading('Opening project...', 'dots');
        setTimeout(() => this.hideLoading(), 2000);
      }
    });
  }

  // Simulate network delay (for development/demos)
  simulateLoading(minTime = 1000, maxTime = 3000) {
    const delay = Math.random() * (maxTime - minTime) + minTime;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Smart loading for AJAX requests
  async handleRequest(requestFn, options = {}) {
    const {
      loadingText = 'Loading...',
      loadingType = 'pulse',
      button = null,
      form = null,
      showGlobal = true
    } = options;

    try {
      // Show appropriate loading states
      if (showGlobal) this.showLoading(loadingText, loadingType);
      if (button) this.setButtonLoading(button, true);
      if (form) this.setFormLoading(form, true);

      // Execute request
      const result = await requestFn();
      
      return result;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    } finally {
      // Hide loading states
      if (showGlobal) this.hideLoading();
      if (button) this.setButtonLoading(button, false);
      if (form) this.setFormLoading(form, false);
    }
  }
}

// Initialize loading manager
const loadingManager = new LoadingManager();

// Export for global use
window.LoadingManager = LoadingManager;
window.loading = loadingManager;

// Utility functions for easy access
window.showLoading = (text, type) => loadingManager.showLoading(text, type);
window.hideLoading = () => loadingManager.hideLoading();

// Auto-setup for images
document.addEventListener('DOMContentLoaded', () => {
  // Setup lazy loading for images
  const images = document.querySelectorAll('img[data-loading="true"]');
  images.forEach(img => loadingManager.setupImageLoading(img));

  // Setup form loading
  const forms = document.querySelectorAll('form[data-loading="true"]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      loadingManager.setFormLoading(form, true);
      // Form will be reset when response comes back
    });
  });
});

// Example usage functions
function exampleUsage() {
  // Basic loading
  showLoading('Please wait...', 'spinner');
  
  // Button loading
  const btn = document.querySelector('#myButton');
  loading.setButtonLoading(btn, true);
  
  // Form loading
  const form = document.querySelector('#myForm');
  loading.setFormLoading(form, true);
  
  // Handle AJAX with loading
  loading.handleRequest(async () => {
    const response = await fetch('/api/data');
    return response.json();
  }, {
    loadingText: 'Fetching data...',
    loadingType: 'dots'
  });
}