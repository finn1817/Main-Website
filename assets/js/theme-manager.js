// Ultra Simple Theme Manager
console.log('Theme Manager Starting...');

// Global theme variable
let currentTheme = 'light';

// Try to get stored theme
try {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    currentTheme = stored;
  }
} catch (e) {
  console.log('localStorage not available');
}

console.log('Initial theme:', currentTheme);

// Apply theme immediately
function applyTheme(theme) {
  console.log('Applying theme:', theme);
  
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  
  // Update all theme buttons
  const buttons = document.querySelectorAll('#theme-toggle, .theme-toggle, .toggle-btn');
  buttons.forEach(button => {
    if (button.id !== 'search-toggle') {
      button.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  });
  
  console.log('Theme applied, body classes:', document.body.className);
}

// Toggle theme function
function toggleTheme() {
  console.log('Toggling theme...');
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  applyTheme(currentTheme);
  
  // Save to localStorage
  try {
    localStorage.setItem('theme', currentTheme);
  } catch (e) {
    console.log('Could not save to localStorage');
  }
  
  console.log('New theme:', currentTheme);
}

// Apply initial theme
applyTheme(currentTheme);

// Set up theme manager object
window.themeManager = {
  getCurrentTheme: function() {
    return currentTheme;
  },
  
  setTheme: function(theme) {
    currentTheme = theme;
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.log('Could not save to localStorage');
    }
  },
  
  toggleTheme: toggleTheme,
  
  addObserver: function(callback) {
    console.log('Observer added (compatibility method)');
  }
};

// Set up buttons when ready
function setupButtons() {
  console.log('Setting up buttons...');
  
  const buttons = document.querySelectorAll('#theme-toggle, .theme-toggle, .toggle-btn');
  console.log('Found buttons:', buttons.length);
  
  buttons.forEach(button => {
    if (button.id === 'search-toggle') {
      console.log('Skipping search button');
      return;
    }
    
    console.log('Setting up button:', button.id || button.className);
    
    // Remove any existing handlers
    button.onclick = null;
    
    // Add new handler
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Theme button clicked!');
      toggleTheme();
    });
  });
  
  // Apply current theme to buttons
  applyTheme(currentTheme);
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupButtons);
} else {
  setupButtons();
}

console.log('Theme Manager Ready!');
