// game state variables
let currentCategory = '';
let currentDifficulty = '';
let currentWords = [];
let gridSize = 15;
let gameGrid = [];
let placedWords = [];
let foundWords = [];
let isSelecting = false;
let selectionStart = null;
let selectionEnd = null;
let gameStartTime = null;
let gameTimer = null;
let hintsLeft = 3;
let isCustomGame = false;

// word lists by category
const wordLists = {
  animals: [
    'CAT', 'DOG', 'LION', 'TIGER', 'BEAR', 'WOLF', 'EAGLE', 'SHARK', 'WHALE', 'HORSE',
    'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'CHEETAH', 'LEOPARD', 'KANGAROO', 'ZEBRA',
    'RHINOCEROS', 'HIPPOPOTAMUS', 'CROCODILE', 'BUTTERFLY', 'OCTOPUS', 'FLAMINGO'
  ],
  countries: [
    'USA', 'CANADA', 'MEXICO', 'BRAZIL', 'FRANCE', 'SPAIN', 'ITALY', 'GERMANY', 'CHINA', 'JAPAN',
    'AUSTRALIA', 'INDIA', 'RUSSIA', 'EGYPT', 'GREECE', 'TURKEY', 'THAILAND', 'PORTUGAL',
    'NETHERLANDS', 'SWITZERLAND', 'ARGENTINA', 'COLOMBIA', 'BANGLADESH', 'PHILIPPINES'
  ],
  food: [
    'PIZZA', 'BURGER', 'PASTA', 'SALAD', 'SOUP', 'BREAD', 'CAKE', 'APPLE', 'BANANA', 'ORANGE',
    'SANDWICH', 'CHOCOLATE', 'COOKIES', 'PANCAKES', 'WAFFLES', 'LASAGNA', 'SPAGHETTI', 'TACOS',
    'QUESADILLA', 'CHEESECAKE', 'STRAWBERRY', 'WATERMELON', 'PINEAPPLE', 'AVOCADO'
  ],
  sports: [
    'SOCCER', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'GOLF', 'BASEBALL', 'HOCKEY', 'SWIMMING', 'BOXING', 'RUGBY',
    'VOLLEYBALL', 'BADMINTON', 'CYCLING', 'RUNNING', 'SKIING', 'SURFING', 'WRESTLING', 'GYMNASTICS',
    'SKATEBOARD', 'SNOWBOARDING', 'ARCHERY', 'BOWLING', 'CRICKET', 'LACROSSE'
  ],
  technology: [
    'COMPUTER', 'PHONE', 'LAPTOP', 'TABLET', 'MOUSE', 'KEYBOARD', 'MONITOR', 'CAMERA', 'ROBOT', 'INTERNET',
    'SOFTWARE', 'HARDWARE', 'WEBSITE', 'DATABASE', 'NETWORK', 'SECURITY', 'ALGORITHM', 'PROGRAMMING',
    'SMARTPHONE', 'ARTIFICIAL', 'BLOCKCHAIN', 'CYBERSECURITY', 'MACHINE', 'LEARNING'
  ],
  mixed: [
    'MUSIC', 'BOOK', 'MOVIE', 'GAME', 'SCHOOL', 'HOUSE', 'CAR', 'TREE', 'FLOWER', 'MOUNTAIN',
    'OCEAN', 'RIVER', 'CLOUD', 'RAINBOW', 'SUNSHINE', 'ADVENTURE', 'FRIENDSHIP', 'FAMILY',
    'HOLIDAY', 'BIRTHDAY', 'CELEBRATION', 'JOURNEY', 'DISCOVERY', 'IMAGINATION'
  ]
};

// difficulty settings
const difficultySettings = {
  easy: { gridSize: 10, wordCount: 8 },
  medium: { gridSize: 15, wordCount: 12 },
  hard: { gridSize: 20, wordCount: 16 }
};

// directions for word placement (8 directions)
const directions = [
  [0, 1],   // horizontal right
  [0, -1],  // horizontal left
  [1, 0],   // vertical down
  [-1, 0],  // vertical up
  [1, 1],   // diagonal down-right
  [-1, -1], // diagonal up-left
  [1, -1],  // diagonal down-left
  [-1, 1]   // diagonal up-right
];

// initialize the game
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  loadStats();
  setupCustomGameHandlers();
  
  // Initialize global theme manager
  const themeManager = new ThemeManager();
  themeManager.init();
  
  // Add the toggle button to the theme manager
  const toggleBtn = document.getElementById('theme-toggle');
  themeManager.addToggleButton(toggleBtn);
  
  // Set up click handler
  toggleBtn.addEventListener('click', () => {
    themeManager.toggleTheme();
  });
});

// particle animation system
function createParticles() {
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 8 + 3;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 15;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = left + '%';
    particle.style.animationDuration = duration + 's';
    particle.style.opacity = Math.random() * 0.2 + 0.05;
    
    document.getElementById('particlesContainer').appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }
  
  // generate particles periodically
  setInterval(createParticle, 800);
}

// screen management
function showScreen(screenId) {
  // hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // show target screen
  document.getElementById(screenId).classList.add('active');
  
  // special handling for certain screens
  if (screenId === 'difficultyScreen') {
    setupDifficultySelection();
  } else if (screenId === 'statsScreen') {
    updateStatsDisplay();
  }
}

// difficulty and category selection
function setupDifficultySelection() {
  const categoryItems = document.querySelectorAll('.category-item');
  const difficultyBtns = document.querySelectorAll('.difficulty-btn');
  const startBtn = document.querySelector('.start-game-btn');
  
  // reset selections
  categoryItems.forEach(item => item.classList.remove('selected'));
  difficultyBtns.forEach(btn => btn.classList.remove('selected'));
  startBtn.disabled = true;
  
  // category selection
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      categoryItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      currentCategory = item.dataset.category;
      checkSelectionComplete();
    });
  });
  
  // difficulty selection
  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      difficultyBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentDifficulty = btn.dataset.difficulty;
      checkSelectionComplete();
    });
  });
  
  function checkSelectionComplete() {
    if (currentCategory && currentDifficulty) {
      startBtn.disabled = false;
    }
  }
}

// custom game handlers
function setupCustomGameHandlers() {
  const gridSizeBtns = document.querySelectorAll('.grid-size-btn');
  
  gridSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gridSizeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// game initialization
function startGame() {
  if (!currentCategory || !currentDifficulty) return;
  
  isCustomGame = false;
  const settings = difficultySettings[currentDifficulty];
  gridSize = settings.gridSize;
  
  // select random words from category
  const categoryWords = wordLists[currentCategory];
  currentWords = getRandomWords(categoryWords, settings.wordCount);
  
  initializeGame();
}

function startCustomGame() {
  const customWordsText = document.getElementById('customWords').value.trim();
  const selectedGridSize = document.querySelector('.grid-size-btn.selected');
  
  if (!customWordsText) {
    alert('Please enter some words!');
    return;
  }
  
  // parse and validate custom words
  const words = customWordsText.split('\n')
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length > 0)
    .filter(word => /^[A-Z]+$/.test(word))
    .filter(word => word.length >= 3 && word.length <= 12);
  
  if (words.length < 5) {
    alert('Please enter at least 5 valid words (3-12 letters each)!');
    return;
  }
  
  if (words.length > 15) {
    alert('Maximum 15 words allowed!');
    return;
  }
  
  isCustomGame = true;
  currentCategory = 'Custom';
  currentDifficulty = 'Custom';
  gridSize = parseInt(selectedGridSize.dataset.size);
  currentWords = words.slice(0, 15); // limit to 15 words max
  
  initializeGame();
}

function getRandomWords(wordArray, count) {
  const shuffled = [...wordArray].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function initializeGame() {
  // reset game state
  foundWords = [];
  placedWords = [];
  hintsLeft = 3;
  
  // create empty grid
  gameGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  
  // place words in grid
  placeWordsInGrid();
  
  // fill empty cells with random letters
  fillEmptyCells();
  
  // setup game display
  setupGameDisplay();
  
  // start timer
  startGameTimer();
  
  // show game screen
  showScreen('gameScreen');
}

function placeWordsInGrid() {
  const maxAttempts = 1000;
  
  for (let word of currentWords) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < maxAttempts) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      
      if (canPlaceWord(word, startRow, startCol, direction)) {
        placeWord(word, startRow, startCol, direction);
        placed = true;
      }
      
      attempts++;
    }
    
    // if word couldn't be placed, try with a shorter word or skip
    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  }
}

function canPlaceWord(word, startRow, startCol, direction) {
  const [dRow, dCol] = direction;
  
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;
    
    // check bounds
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return false;
    }
    
    // check if cell is empty or contains the same letter
    if (gameGrid[row][col] !== '' && gameGrid[row][col] !== word[i]) {
      return false;
    }
  }
  
  return true;
}

function placeWord(word, startRow, startCol, direction) {
  const [dRow, dCol] = direction;
  const wordData = {
    word: word,
    cells: []
  };
  
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;
    
    gameGrid[row][col] = word[i];
    wordData.cells.push({ row, col });
  }
  
  placedWords.push(wordData);
}

function fillEmptyCells() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] === '') {
        gameGrid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function setupGameDisplay() {
  // update header
  const modeText = isCustomGame ? 'Custom' : `${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} - ${currentCategory}`;
  document.getElementById('currentMode').textContent = modeText;
  
  // update stats
  document.getElementById('wordsFound').textContent = foundWords.length;
  document.getElementById('totalWords').textContent = currentWords.length;
  document.getElementById('hintsLeft').textContent = hintsLeft;
  
  // create grid
  createGrid();
  
  // create word list
  createWordList();
  
  // setup grid interaction
  setupGridInteraction();
}

function createGrid() {
  const gridContainer = document.getElementById('wordGrid');
  gridContainer.innerHTML = '';
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = gameGrid[row][col];
      cell.dataset.row = row;
      cell.dataset.col = col;
      gridContainer.appendChild(cell);
    }
  }
}

function createWordList() {
  const wordList = document.getElementById('wordList');
  wordList.innerHTML = '';
  
  currentWords.forEach(word => {
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    wordItem.textContent = word;
    wordItem.dataset.word = word;
    wordList.appendChild(wordItem);
  });
}

function setupGridInteraction() {
  const grid = document.getElementById('wordGrid');
  let isMouseDown = false;
  
  // mouse events
  grid.addEventListener('mousedown', startSelection);
  grid.addEventListener('mousemove', updateSelection);
  grid.addEventListener('mouseup', endSelection);
  
  // touch events for mobile
  grid.addEventListener('touchstart', handleTouchStart, { passive: false });
  grid.addEventListener('touchmove', handleTouchMove, { passive: false });
  grid.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  function startSelection(e) {
    if (e.target.classList.contains('grid-cell')) {
      isMouseDown = true;
      isSelecting = true;
      selectionStart = {
        row: parseInt(e.target.dataset.row),
        col: parseInt(e.target.dataset.col)
      };
      selectionEnd = { ...selectionStart };
      updateSelectionDisplay();
    }
  }
  
  function updateSelection(e) {
    if (isSelecting && e.target.classList.contains('grid-cell')) {
      selectionEnd = {
        row: parseInt(e.target.dataset.row),
        col: parseInt(e.target.dataset.col)
      };
      updateSelectionDisplay();
    }
  }
  
  function endSelection(e) {
    if (isSelecting) {
      isSelecting = false;
      isMouseDown = false;
      checkWordSelection();
      clearSelectionDisplay();
    }
  }
  
  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-cell')) {
      startSelection({ target: element });
    }
  }
  
  function handleTouchMove(e) {
    e.preventDefault();
    if (isSelecting) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.classList.contains('grid-cell')) {
        updateSelection({ target: element });
      }
    }
  }
  
  function handleTouchEnd(e) {
    e.preventDefault();
    endSelection(e);
  }
}

function updateSelectionDisplay() {
  // clear previous selection
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('selecting');
  });
  
  if (!selectionStart || !selectionEnd) return;
  
  const cells = getSelectionCells(selectionStart, selectionEnd);
  cells.forEach(({ row, col }) => {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('selecting');
  });
}

function clearSelectionDisplay() {
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('selecting');
  });
}

function getSelectionCells(start, end) {
  const cells = [];
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;
  
  // determine if selection is in a valid direction
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);
  
  // must be horizontal, vertical, or diagonal
  if (absRowDiff !== 0 && absColDiff !== 0 && absRowDiff !== absColDiff) {
    return [start]; // invalid selection, return just start cell
  }
  
  const steps = Math.max(absRowDiff, absColDiff);
  const rowStep = steps === 0 ? 0 : rowDiff / steps;
  const colStep = steps === 0 ? 0 : colDiff / steps;
  
  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: start.row + Math.round(i * rowStep),
      col: start.col + Math.round(i * colStep)
    });
  }
  
  return cells;
}

function checkWordSelection() {
  if (!selectionStart || !selectionEnd) return;
  
  const cells = getSelectionCells(selectionStart, selectionEnd);
  const selectedWord = cells.map(({ row, col }) => gameGrid[row][col]).join('');
  const reversedWord = selectedWord.split('').reverse().join('');
  
  // check if selected word matches any target word
  const foundWord = currentWords.find(word => 
    word === selectedWord || word === reversedWord
  );
  
  if (foundWord && !foundWords.includes(foundWord)) {
    // word found!
    foundWords.push(foundWord);
    markWordAsFound(foundWord, cells);
    updateGameStats();
    
    // check if all words found
    if (foundWords.length === currentWords.length) {
      endGame();
    }
  }
}

function markWordAsFound(word, cells) {
  // mark cells as found
  cells.forEach(({ row, col }) => {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('found');
  });
  
  // mark word in list as found
  const wordItem = document.querySelector(`[data-word="${word}"]`);
  if (wordItem) wordItem.classList.add('found');
}

function updateGameStats() {
  document.getElementById('wordsFound').textContent = foundWords.length;
}

// timer functions
function startGameTimer() {
  gameStartTime = Date.now();
  gameTimer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsed = Date.now() - gameStartTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  document.getElementById('gameTimer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function getElapsedTime() {
  return Date.now() - gameStartTime;
}

// hint system
function useHint() {
  if (hintsLeft <= 0) return;
  
  // find an unfound word
  const unfoundWords = currentWords.filter(word => !foundWords.includes(word));
  if (unfoundWords.length === 0) return;
  
  const hintWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
  const wordData = placedWords.find(w => w.word === hintWord);
  
  if (wordData) {
    // highlight the word briefly
    wordData.cells.forEach(({ row, col }) => {
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (cell) cell.classList.add('hint-highlight');
    });
    
    // highlight word in list
    const wordItem = document.querySelector(`[data-word="${hintWord}"]`);
    if (wordItem) wordItem.classList.add('hint-highlight');
    
    // remove highlight after animation
    setTimeout(() => {
      document.querySelectorAll('.hint-highlight').forEach(el => {
        el.classList.remove('hint-highlight');
      });
    }, 3000);
    
    hintsLeft--;
    document.getElementById('hintsLeft').textContent = hintsLeft;
    
    if (hintsLeft === 0) {
      document.getElementById('hintBtn').disabled = true;
    }
  }
}

function shuffleHighlight() {
  // briefly highlight all words
  placedWords.forEach(wordData => {
    if (!foundWords.includes(wordData.word)) {
      wordData.cells.forEach(({ row, col }) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
          cell.classList.add('hint-highlight');
          setTimeout(() => {
            cell.classList.remove('hint-highlight');
          }, 1500);
        }
      });
    }
  });
}

// game completion
function endGame() {
  stopTimer();
  updateGameStatistics();
  showGameCompleteScreen();
}

function showGameCompleteScreen() {
  const elapsedTime = getElapsedTime();
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  
  document.getElementById('finalTime').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('finalWordsFound').textContent = `${foundWords.length}/${currentWords.length}`;
  document.getElementById('finalHintsUsed').textContent = 3 - hintsLeft;
  document.getElementById('finalDifficulty').textContent = 
    isCustomGame ? 'Custom' : currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  
  showScreen('gameCompleteScreen');
}

function playAgain() {
  if (isCustomGame) {
    showScreen('customScreen');
  } else {
    showScreen('difficultyScreen');
  }
}

// statistics management
function loadStats() {
  const stats = JSON.parse(localStorage.getItem('wordsearch-stats')) || {
    totalGames: 0,
    totalCompleted: 0,
    totalTime: 0,
    bestTime: 0,
    easyCompleted: 0,
    easyPlayed: 0,
    mediumCompleted: 0,
    mediumPlayed: 0,
    hardCompleted: 0,
    hardPlayed: 0,
    customCompleted: 0,
    customPlayed: 0
  };
  
  return stats;
}

function saveStats(stats) {
  localStorage.setItem('wordsearch-stats', JSON.stringify(stats));
}

function updateGameStatistics() {
  const stats = loadStats();
  const elapsedTime = getElapsedTime();
  const completed = foundWords.length === currentWords.length;
  
  stats.totalGames++;
  
  if (completed) {
    stats.totalCompleted++;
    stats.totalTime += elapsedTime;
    
    if (stats.bestTime === 0 || elapsedTime < stats.bestTime) {
      stats.bestTime = elapsedTime;
    }
  }
  
  // update difficulty-specific stats
  if (isCustomGame) {
    stats.customPlayed++;
    if (completed) stats.customCompleted++;
  } else {
    const diffKey = currentDifficulty.toLowerCase();
    stats[diffKey + 'Played']++;
    if (completed) stats[diffKey + 'Completed']++;
  }
  
  saveStats(stats);
}

function updateStatsDisplay() {
  const stats = loadStats();
  
  document.getElementById('totalGames').textContent = stats.totalGames;
  document.getElementById('totalCompleted').textContent = stats.totalCompleted;
  
  // calculate average time
  const avgTime = stats.totalCompleted > 0 ? stats.totalTime / stats.totalCompleted : 0;
  const avgMinutes = Math.floor(avgTime / 60000);
  const avgSeconds = Math.floor((avgTime % 60000) / 1000);
  document.getElementById('averageTime').textContent = 
    `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
  
  // best time
  const bestMinutes = Math.floor(stats.bestTime / 60000);
  const bestSeconds = Math.floor((stats.bestTime % 60000) / 1000);
  document.getElementById('bestTime').textContent = 
    stats.bestTime > 0 ? `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}` : '0:00';
  
  // difficulty stats
  document.getElementById('easyStats').textContent = 
    `${stats.easyCompleted} completed / ${stats.easyPlayed} played`;
  document.getElementById('mediumStats').textContent = 
    `${stats.mediumCompleted} completed / ${stats.mediumPlayed} played`;
  document.getElementById('hardStats').textContent = 
    `${stats.hardCompleted} completed / ${stats.hardPlayed} played`;
  document.getElementById('customStats').textContent = 
    `${stats.customCompleted} completed / ${stats.customPlayed} played`;
}

function resetStats() {
  if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
    localStorage.removeItem('wordsearch-stats');
    updateStatsDisplay();
    alert('Statistics have been reset!');
  }
}

// keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // only handle shortcuts when in game screen
  if (!document.getElementById('gameScreen').classList.contains('active')) return;
  
  // handle hint shortcut (H key)
  if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    useHint();
  }
  
  // handle highlight shortcut (Space key)
  if (e.key === ' ') {
    e.preventDefault();
    shuffleHighlight();
  }
});

// prevent context menu and text selection on game elements
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.game-container')) {
    e.preventDefault();
  }
});

document.addEventListener('selectstart', (e) => {
  if (e.target.closest('.word-grid')) {
    e.preventDefault();
  }
});