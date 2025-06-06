// Theme toggle functionality
function toggleTheme() {
  const themeIcon = document.getElementById('theme-icon');
  const isDark = document.body.classList.toggle('dark-mode');
  
  if (isDark) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
  
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Apply saved theme or system preference
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const themeIcon = document.getElementById('theme-icon');
  
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
})();
