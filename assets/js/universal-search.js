/* Universal Search JavaScript Component for Dan Finn's Website 
   Include this script on any page to add search functionality */

class UniversalSearch {
  constructor() {
    this.siteContent = [
      // === SCHOOL PROJECTS ===
      {
        title: "My Calculator",
        path: "Home › Projects › School Projects › Calculator",
        url: "/Main-Website/projects/calculator/",
        type: "projects",
        description: "A fully functional calculator built with JavaScript featuring advanced operations and memory functions.",
        keywords: ["calculator", "math", "javascript", "tool", "arithmetic", "numbers", "compute", "school"]
      },
      {
        title: "Word Counter",
        path: "Home › Projects › School Projects › Word Counter",
        url: "/Main-Website/projects/word-counter/",
        type: "projects",
        description: "Count words, characters, and analyze text statistics in real-time.",
        keywords: ["word", "counter", "text", "statistics", "characters", "analysis", "count", "utility", "school"]
      },
      {
        title: "Unit Conversion Site",
        path: "Home › Projects › School Projects › Unit Converter",
        url: "/Main-Website/projects/unit-converter/",
        type: "projects",
        description: "Convert between different units of measurement including length, weight, and temperature.",
        keywords: ["unit", "converter", "measurement", "length", "weight", "temperature", "convert", "tool", "school"]
      },
      {
        title: "Finance Checker",
        path: "Home › Projects › School Projects › Finance Check",
        url: "/Main-Website/projects/finance-check/",
        type: "projects",
        description: "Personal finance tracking and budgeting tool with expense analysis.",
        keywords: ["finance", "budget", "money", "expense", "tracking", "financial", "banking", "checker", "school"]
      },
      {
        title: "Resume Builder",
        path: "Home › Projects › School Projects › Resume Builder",
        url: "/Main-Website/projects/resume-builder/",
        type: "projects",
        description: "Create professional resumes with customizable templates and layouts.",
        keywords: ["resume", "builder", "create", "template", "professional", "job", "career", "cv", "school"]
      },
      {
        title: "Info Systems Course",
        path: "Home › Projects › School Projects › Info Systems",
        url: "/Main-Website/education/",
        type: "projects",
        description: "Information Systems course exercises and projects.",
        keywords: ["info", "information", "systems", "course", "exercises", "education", "school", "learning"]
      },

      // === PERSONAL PROJECTS ===
      {
        title: "Lacrosse Timer (PC)",
        path: "Home › Projects › Personal Projects › Lacrosse Timer PC",
        url: "/Main-Website/projects/lacrosse-timer-pc/",
        type: "projects",
        description: "Desktop lacrosse game timer application for PC with advanced timing features.",
        keywords: ["lacrosse", "timer", "pc", "desktop", "sports", "timing", "game", "personal"]
      },
      {
        title: "Lacrosse Timer (Mobile)",
        path: "Home › Projects › Personal Projects › Lacrosse Timer Mobile",
        url: "/Main-Website/projects/lacrosse-timer-mobile/",
        type: "projects",
        description: "Mobile lacrosse game timer application optimized for smartphones and tablets.",
        keywords: ["lacrosse", "timer", "mobile", "smartphone", "sports", "timing", "game", "personal"]
      },
      {
        title: "Text Editor",
        path: "Home › Projects › Personal Projects › Text Editor",
        url: "/Main-Website/projects/text-editor/",
        type: "projects",
        description: "A powerful online text editor with syntax highlighting and multiple features.",
        keywords: ["text", "editor", "code", "syntax", "highlighting", "tool", "writing", "development", "personal"]
      },
      {
        title: "Password Manager",
        path: "Home › Projects › Personal Projects › Password Manager",
        url: "/Main-Website/projects/password-manager/",
        type: "projects",
        description: "Secure password manager for storing and generating strong passwords.",
        keywords: ["password", "manager", "security", "generator", "secure", "storage", "encryption", "personal"]
      },
      {
        title: "File Share",
        path: "Home › Projects › Personal Projects › File Share",
        url: "/Main-Website/projects/File-Transfer/",
        type: "projects",
        description: "Secure file transfer and sharing tool with encryption capabilities.",
        keywords: ["file", "transfer", "share", "upload", "download", "secure", "sharing", "personal"]
      },

      // === GAMES & FUN ===
      {
        title: "Tic-Tac-Toe Game",
        path: "Home › Projects › Games › Tic-Tac-Toe",
        url: "/Main-Website/projects/tic-tac-toe/",
        type: "games",
        description: "Classic tic-tac-toe game built with JavaScript and interactive UI.",
        keywords: ["tic", "tac", "toe", "game", "javascript", "interactive", "fun", "classic"]
      },
      {
        title: "Snake Game",
        path: "Home › Projects › Games › Snake",
        url: "/Main-Website/projects/snake/",
        type: "games",
        description: "Classic snake game with modern graphics and smooth gameplay.",
        keywords: ["snake", "game", "classic", "arcade", "javascript", "fun", "retro"]
      },
      {
        title: "Tetris (Beta)",
        path: "Home › Projects › Games › Tetris",
        url: "/Main-Website/projects/tetris/",
        type: "games",
        description: "Tetris game implementation with falling blocks and line clearing mechanics.",
        keywords: ["tetris", "game", "blocks", "puzzle", "beta", "javascript", "fun", "classic"]
      },
      {
        title: "Flappy Bird Remake",
        path: "Home › Projects › Games › Flappy Bird",
        url: "/Main-Website/projects/flappy-bird/",
        type: "games",
        description: "Remake of the popular Flappy Bird game with improved graphics.",
        keywords: ["flappy", "bird", "game", "remake", "arcade", "javascript", "fun", "flying"]
      },
      {
        title: "2048",
        path: "Home › Projects › Games › 2048",
        url: "/Main-Website/projects/2048/",
        type: "games",
        description: "Classic 2048 sliding tile puzzle game implemented in JavaScript.",
        keywords: ["2048", "game", "puzzle", "sliding", "tiles", "javascript", "numbers"]
      },

      // === OTHER PROJECTS ===
      {
        title: "NATracker - Journal Tracker",
        path: "Home › Projects › Other › NATracker",
        url: "/Main-Website/projects/natracker/",
        type: "tools",
        description: "Personal journal and habit tracking application with GitHub integration.",
        keywords: ["natracker", "journal", "tracker", "habits", "github", "personal", "logging"]
      },

      // === MAIN PAGES ===
      {
        title: "About Me",
        path: "Home › About",
        url: "/Main-Website/about/",
        type: "pages",
        description: "Learn more about Dan Finn, his background, skills, and professional experience.",
        keywords: ["about", "dan", "finn", "background", "skills", "experience", "bio", "profile"]
      },
      {
        title: "My Resume",
        path: "Home › Resume", 
        url: "/Main-Website/resume/",
        type: "pages",
        description: "Download or view Dan Finn's professional resume and career accomplishments.",
        keywords: ["resume", "cv", "career", "experience", "download", "professional", "work"]
      },
      {
        title: "Contact Information",
        path: "Home › Contact",
        url: "/Main-Website/contact/",
        type: "pages",
        description: "Get in touch with Dan Finn through various contact methods and social media.",
        keywords: ["contact", "email", "social", "media", "reach", "touch", "phone", "connect"]
      },
      {
        title: "My Interests",
        path: "Home › Interests",
        url: "/Main-Website/interests/",
        type: "pages",
        description: "Discover Dan Finn's hobbies, interests, and personal projects outside of work.",
        keywords: ["interests", "hobbies", "personal", "activities", "passion", "leisure", "fun"]
      },
      {
        title: "Education & School",
        path: "Home › Education",
        url: "/Main-Website/education/",
        type: "pages",
        description: "Information about Dan Finn's educational background and school involvement.",
        keywords: ["education", "school", "college", "university", "learning", "academic", "degree"]
      },
      {
        title: "All Projects",
        path: "Home › Projects",
        url: "/Main-Website/projects/",
        type: "pages",
        description: "Browse all of Dan Finn's projects, tools, and web applications organized by category.",
        keywords: ["projects", "portfolio", "apps", "tools", "development", "coding", "programming", "showcase"]
      },
      {
        title: "Main Website",
        path: "Home",
        url: "/Main-Website/",
        type: "pages",
        description: "Dan Finn's main website homepage with links to all projects and information.",
        keywords: ["home", "main", "website", "homepage", "dan", "finn", "portfolio"]
      }
    ];

    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.createSearchButton();
    this.createSearchModal();
    this.bindEvents();
  }

  createSearchButton() {
    const searchBtn = document.createElement('button');
    searchBtn.id = 'universal-search-btn';
    searchBtn.className = 'universal-search-btn';
    searchBtn.innerHTML = '🔍';
    searchBtn.setAttribute('aria-label', 'Search');
    searchBtn.title = 'Search (Ctrl+K)';
    document.body.appendChild(searchBtn);
  }

  createSearchModal() {
    const modal = document.createElement('div');
    modal.id = 'universal-search-modal';
    modal.className = 'universal-search-modal';
    modal.innerHTML = `
      <div class="universal-search-content">
        <button class="universal-search-close" id="universal-search-close">&times;</button>
        <h2 class="universal-search-title">🔍 Search Everything</h2>
        <div class="universal-search-box">
          <input type="text" class="universal-search-input" id="universal-search-input" 
                 placeholder="Search projects, pages, or content..." autocomplete="off">
          <button class="universal-search-submit" id="universal-search-submit">Search</button>
        </div>
        <div class="universal-search-filters">
          <button class="universal-filter-btn active" data-filter="all">All Content</button>
          <button class="universal-filter-btn" data-filter="projects">Projects</button>
          <button class="universal-filter-btn" data-filter="games">Games</button>
          <button class="universal-filter-btn" data-filter="tools">Tools</button>
          <button class="universal-filter-btn" data-filter="pages">Pages</button>
        </div>
        <div class="universal-search-results" id="universal-search-results">
          <div id="universal-results-container"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  bindEvents() {
    const searchBtn = document.getElementById('universal-search-btn');
    const modal = document.getElementById('universal-search-modal');
    const closeBtn = document.getElementById('universal-search-close');
    const searchInput = document.getElementById('universal-search-input');
    const submitBtn = document.getElementById('universal-search-submit');

    // Show modal
    searchBtn.addEventListener('click', () => this.showModal());
    
    // Hide modal
    closeBtn.addEventListener('click', () => this.hideModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideModal();
    });

    // Search functionality
    submitBtn.addEventListener('click', () => this.performSearch());
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });

    // Search as you type
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.performSearch(), 300);
    });

    // Filter buttons
    document.querySelectorAll('.universal-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.universal-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.performSearch();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.showModal();
      }
      // Escape to close search
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.hideModal();
      }
    });
  }

  showModal() {
    const modal = document.getElementById('universal-search-modal');
    const searchInput = document.getElementById('universal-search-input');
    
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
      searchInput.focus();
    }, 10);
  }

  hideModal() {
    const modal = document.getElementById('universal-search-modal');
    const searchInput = document.getElementById('universal-search-input');
    const resultsContainer = document.getElementById('universal-results-container');
    
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      searchInput.value = '';
      resultsContainer.innerHTML = '';
    }, 300);
  }

  performSearch() {
    const searchInput = document.getElementById('universal-search-input');
    const resultsContainer = document.getElementById('universal-results-container');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      resultsContainer.innerHTML = '<div class="universal-no-results">Start typing to search...</div>';
      return;
    }

    // Filter content
    let filteredContent = this.siteContent.filter(item => {
      const matchesFilter = this.currentFilter === 'all' || item.type === this.currentFilter;
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
      
      return matchesFilter && matchesSearch;
    });

    // Display results
    if (filteredContent.length === 0) {
      resultsContainer.innerHTML = '<div class="universal-no-results">No results found. Try different keywords.</div>';
    } else {
      resultsContainer.innerHTML = filteredContent.map(item => {
        const highlightedTitle = this.highlightText(item.title, searchTerm);
        const highlightedDescription = this.highlightText(item.description, searchTerm);
        
        return `
          <div class="universal-search-result" onclick="universalSearch.navigateToResult('${item.url}')">
            <div class="universal-result-title">${highlightedTitle}</div>
            <div class="universal-result-path">${item.path}</div>
            <div class="universal-result-description">${highlightedDescription}</div>
          </div>
        `;
      }).join('');
    }
  }

  highlightText(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="universal-highlight">$1</span>');
  }

  navigateToResult(url) {
    this.hideModal();
    window.location.href = url;
  }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.universalSearch = new UniversalSearch();
});

// For backwards compatibility
function navigateToResult(url) {
  if (window.universalSearch) {
    window.universalSearch.navigateToResult(url);
  }
}
