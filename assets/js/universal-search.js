/* Universal Search JavaScript Component for Dan Finn's Website 
   Include this script on any page to add search functionality */

class UniversalSearch {
  constructor() {
    // Auto-generated siteContent: includes every project folder found under /projects and top-level pages
    this.siteContent = [
      // Projects (scanned from the projects/ directory)
      {
        title: "2048",
        path: "Home › Projects › 2048",
        url: "/Main-Website/projects/2048/",
        type: "projects",
        description: "Classic 2048 sliding tile puzzle game.",
        keywords: ["2048", "game", "puzzle", "tiles", "javascript"]
      },
      {
        title: "Calculator",
        path: "Home › Projects › Calculator",
        url: "/Main-Website/projects/calculator/",
        type: "projects",
        description: "A fully functional calculator built with JavaScript.",
        keywords: ["calculator", "math", "javascript", "compute"]
      },
      {
        title: "File Transfer",
        path: "Home › Projects › File Transfer",
        url: "/Main-Website/projects/File-Transfer/",
        type: "projects",
        description: "Secure file transfer and sharing tool.",
        keywords: ["file", "transfer", "share", "upload", "download"]
      },
      {
        title: "Finance Check",
        path: "Home › Projects › Finance Check",
        url: "/Main-Website/projects/finance-check/",
        type: "projects",
        description: "Personal finance tracking and budgeting tool.",
        keywords: ["finance", "budget", "money", "expense", "tracking"]
      },
      {
        title: "Hangman",
        path: "Home › Projects › Hangman",
        url: "/Main-Website/projects/hangman/",
        type: "projects",
        description: "Classic hangman word-guessing game implemented in JavaScript.",
        keywords: ["hangman", "game", "word", "javascript"]
      },
      {
        title: "Password Manager",
        path: "Home › Projects › Password Manager",
        url: "/Main-Website/projects/password-manager/",
        type: "projects",
        description: "Secure password manager for storing and generating passwords.",
        keywords: ["password", "manager", "security", "generator"]
      },
      {
        title: "Resume Builder",
        path: "Home › Projects › Resume Builder",
        url: "/Main-Website/projects/resume-builder/",
        type: "projects",
        description: "Create professional resumes with customizable templates.",
        keywords: ["resume", "builder", "template", "cv"]
      },
      {
        title: "Shared Calendar",
        path: "Home › Projects › Shared Calendar",
        url: "/Main-Website/projects/shared-calendar/",
        type: "projects",
        description: "Shared calendar project with event management features.",
        keywords: ["calendar", "shared", "events", "scheduling"]
      },
      {
        title: "Template",
        path: "Home › Projects › Template",
        url: "/Main-Website/projects/template/",
        type: "projects",
        description: "Project template with starter code and styles.",
        keywords: ["template", "starter", "project", "boilerplate"]
      },
      {
        title: "Text Editor",
        path: "Home › Projects › Text Editor",
        url: "/Main-Website/projects/text-editor/",
        type: "projects",
        description: "A powerful online text editor with syntax highlighting.",
        keywords: ["text", "editor", "syntax", "code"]
      },
      {
        title: "Unit Converter",
        path: "Home › Projects › Unit Converter",
        url: "/Main-Website/projects/unit-converter/",
        type: "projects",
        description: "Convert between different units of measurement.",
        keywords: ["unit", "converter", "measurement", "convert"]
      },
      {
        title: "Word Counter",
        path: "Home › Projects › Word Counter",
        url: "/Main-Website/projects/word-counter/",
        type: "projects",
        description: "Count words, characters, and analyze text statistics.",
        keywords: ["word", "counter", "text", "statistics"]
      },
      {
        title: "Word Search",
        path: "Home › Projects › Word Search",
        url: "/Main-Website/projects/word-search/",
        type: "projects",
        description: "Word search puzzle generator and solver.",
        keywords: ["word", "search", "puzzle", "game"]
      },

      // Top-level pages
      {
        title: "All Projects",
        path: "Home › Projects",
        url: "/Main-Website/projects/",
        type: "pages",
        description: "Browse all projects and web applications.",
        keywords: ["projects", "portfolio", "apps"]
      },
      {
        title: "About Me",
        path: "Home › About",
        url: "/Main-Website/about/",
        type: "pages",
        description: "Learn more about Dan Finn and his background.",
        keywords: ["about", "dan", "finn", "bio"]
      },
      {
        title: "Contact",
        path: "Home › Contact",
        url: "/Main-Website/contact/",
        type: "pages",
        description: "Get in touch with Dan Finn.",
        keywords: ["contact", "email", "get in touch"]
      },
      {
        title: "Education",
        path: "Home › Education",
        url: "/Main-Website/education/",
        type: "pages",
        description: "Information about educational background and courses.",
        keywords: ["education", "school", "college"]
      },
      {
        title: "Interests",
        path: "Home › Interests",
        url: "/Main-Website/interests/",
        type: "pages",
        description: "Personal hobbies and interests.",
        keywords: ["interests", "hobbies", "personal"]
      },
      {
        title: "Resume",
        path: "Home › Resume",
        url: "/Main-Website/resume/",
        type: "pages",
        description: "Download or view Dan Finn's professional resume.",
        keywords: ["resume", "cv", "career"]
      },
      {
        title: "Home",
        path: "Home",
        url: "/Main-Website/",
        type: "pages",
        description: "Main website homepage.",
        keywords: ["home", "main", "website"]
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
