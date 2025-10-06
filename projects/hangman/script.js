// game state variables
let currentGameMode = '';
let currentCategory = '';
let currentDifficulty = '';
let currentWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
let hintsUsed = 0;
let hintsLeft = 3;
let gameWon = false;
let isAlternatingMode = false;
let alternatingTurn = 1; // 1 for player 1, 2 for player 2

// hangman body parts for drawing
const hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

// word lists by category and difficulty
const wordLists = {
  animals: {
    easy: ['CAT', 'DOG', 'FISH', 'BIRD', 'LION', 'BEAR', 'DEER', 'FROG', 'DUCK', 'GOAT'],
    medium: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'CHEETAH', 'RACCOON', 'HAMSTER', 'LEOPARD'],
    hard: ['RHINOCEROS', 'HIPPOPOTAMUS', 'CHIMPANZEE', 'CROCODILE', 'KANGAROO', 'BUTTERFLY', 'SALAMANDER']
  },
  movies: {
    easy: ['JAWS', 'ROCKY', 'ALIEN', 'TITANIC', 'AVATAR', 'FROZEN', 'SHREK'],
    medium: ['GLADIATOR', 'INCEPTION', 'AVENGERS', 'JURASSIC', 'BATMAN', 'SUPERMAN', 'SPIDERMAN'],
    hard: ['INTERSTELLAR', 'TRANSFORMERS', 'INDEPENDENCE', 'TERMINATOR', 'GHOSTBUSTERS', 'CASABLANCA']
  },
  countries: {
    easy: ['USA', 'CANADA', 'FRANCE', 'SPAIN', 'ITALY', 'JAPAN', 'CHINA', 'BRAZIL'],
    medium: ['GERMANY', 'AUSTRALIA', 'ARGENTINA', 'THAILAND', 'PORTUGAL', 'IRELAND', 'SCOTLAND'],
    hard: ['SWITZERLAND', 'NETHERLANDS', 'BANGLADESH', 'PHILIPPINES', 'AFGHANISTAN', 'MOZAMBIQUE']
  },
  food: {
    easy: ['PIZZA', 'BREAD', 'APPLE', 'CAKE', 'RICE', 'PASTA', 'SALAD', 'SOUP'],
    medium: ['SANDWICH', 'HAMBURGER', 'SPAGHETTI', 'CHOCOLATE', 'PANCAKES', 'COOKIES', 'LASAGNA'],
    hard: ['QUESADILLA', 'CAPPUCCINO', 'BRUSCHETTA', 'CHEESECAKE', 'WATERMELON', 'STRAWBERRY']
  },
  sports: {
    easy: ['SOCCER', 'TENNIS', 'GOLF', 'BOXING', 'HOCKEY', 'RUGBY', 'SKIING'],
    medium: ['FOOTBALL', 'BASEBALL', 'SWIMMING', 'CYCLING', 'RUNNING', 'JUMPING', 'WRESTLING'],
    hard: ['BASKETBALL', 'VOLLEYBALL', 'BADMINTON', 'SKATEBOARD', 'SNOWBOARDING', 'GYMNASTICS']
  },
  technology: {
    easy: ['PHONE', 'LAPTOP', 'MOUSE', 'SCREEN', 'CAMERA', 'TABLET', 'ROBOT'],
    medium: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'KEYBOARD', 'MONITOR', 'PRINTER'],
    hard: ['SMARTPHONE', 'ARTIFICIAL', 'PROGRAMMING', 'ALGORITHM', 'CYBERSECURITY', 'BLOCKCHAIN']
  }
};

// initialize the game
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  createAlphabet();
  loadStats();
  
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
  if (screenId === 'categoryScreen') {
    setupCategorySelection();
  } else if (screenId === 'wordInputScreen') {
    document.getElementById('customWordInput').focus();
  } else if (screenId === 'statsScreen') {
    updateStatsDisplay();
  }
}

// game mode selection
function setGameMode(mode) {
  currentGameMode = mode;
  
  if (mode === 'twoPlayer') {
    showScreen('wordInputScreen');
  } else if (mode === 'vsAI' || mode === 'alternating') {
    if (mode === 'alternating') {
      isAlternatingMode = true;
      alternatingTurn = 1;
    }
    showScreen('categoryScreen');
  }
}

// category and difficulty selection
function setupCategorySelection() {
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

// alphabet keyboard creation
function createAlphabet() {
  const alphabetGrid = document.getElementById('alphabetGrid');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  alphabetGrid.innerHTML = '';
  
  for (let letter of letters) {
    const btn = document.createElement('button');
    btn.className = 'letter-btn';
    btn.textContent = letter;
    btn.onclick = () => guessLetter(letter);
    alphabetGrid.appendChild(btn);
  }
}

// game initialization
function startGame() {
  if (currentGameMode === 'vsAI' || (currentGameMode === 'alternating' && alternatingTurn === 1)) {
    // select random word from chosen category and difficulty
    const words = wordLists[currentCategory][currentDifficulty];
    currentWord = words[Math.floor(Math.random() * words.length)];
  }
  
  initializeGameState();
  updateGameDisplay();
  showScreen('gameScreen');
}

function startCustomGame() {
  const input = document.getElementById('customWordInput');
  const word = input.value.toUpperCase().trim();
  
  // validate input
  if (!word) {
    alert('Please enter a word!');
    return;
  }
  
  if (!/^[A-Z]+$/.test(word)) {
    alert('Only letters are allowed!');
    return;
  }
  
  if (word.length < 3 || word.length > 20) {
    alert('Word must be between 3 and 20 letters!');
    return;
  }
  
  currentWord = word;
  currentCategory = 'Custom';
  currentDifficulty = 'Custom';
  
  initializeGameState();
  updateGameDisplay();
  showScreen('gameScreen');
  
  // clear input
  input.value = '';
}

function initializeGameState() {
  guessedLetters = [];
  wrongGuesses = 0;
  hintsUsed = 0;
  hintsLeft = 3;
  gameWon = false;
  
  // reset hangman drawing
  hangmanParts.forEach(part => {
    document.getElementById(part).style.display = 'none';
  });
  
  // reset alphabet
  createAlphabet();
}

function updateGameDisplay() {
  // update game header
  const modeText = currentGameMode === 'twoPlayer' ? 'Two Player' : 
                   currentGameMode === 'vsAI' ? 'VS Computer' : 'Alternating';
  const difficultyText = currentDifficulty === 'Custom' ? '' : ` - ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}`;
  
  document.getElementById('currentMode').textContent = modeText + difficultyText;
  document.getElementById('currentCategory').textContent = currentCategory;
  
  // update stats
  document.getElementById('hintsLeft').textContent = hintsLeft;
  document.getElementById('wrongCount').textContent = wrongGuesses;
  
  // update word display
  updateWordDisplay();
  
  // update hint button
  const hintBtn = document.getElementById('hintBtn');
  hintBtn.disabled = hintsLeft === 0;
}

function updateWordDisplay() {
  const wordDisplay = document.getElementById('wordDisplay');
  wordDisplay.innerHTML = '';
  
  for (let letter of currentWord) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    
    if (guessedLetters.includes(letter)) {
      slot.textContent = letter;
      slot.classList.add('revealed');
    }
    
    wordDisplay.appendChild(slot);
  }
}

// game logic
function guessLetter(letter) {
  if (guessedLetters.includes(letter)) return;
  
  guessedLetters.push(letter);
  
  const btn = document.querySelector(`.letter-btn:nth-child(${letter.charCodeAt(0) - 64})`);
  
  if (currentWord.includes(letter)) {
    // correct guess
    btn.classList.add('correct');
    btn.disabled = true;
    
    // check if word is complete
    if (currentWord.split('').every(l => guessedLetters.includes(l))) {
      gameWon = true;
      endGame();
    }
  } else {
    // incorrect guess
    btn.classList.add('incorrect');
    btn.disabled = true;
    wrongGuesses++;
    
    // draw hangman part
    if (wrongGuesses <= hangmanParts.length) {
      document.getElementById(hangmanParts[wrongGuesses - 1]).style.display = 'block';
    }
    
    // check if game is lost
    if (wrongGuesses >= 6) {
      gameWon = false;
      endGame();
    }
  }
  
  updateGameDisplay();
}

function useHint() {
  if (hintsLeft === 0) return;
  
  // find unguessed letters in the word
  const unguessedLetters = currentWord.split('').filter(letter => !guessedLetters.includes(letter));
  
  if (unguessedLetters.length === 0) return;
  
  // reveal a random unguessed letter
  const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
  
  hintsUsed++;
  hintsLeft--;
  
  // simulate guessing the letter
  guessLetter(hintLetter);
}

function surrenderGame() {
  if (confirm('Are you sure you want to give up?')) {
    gameWon = false;
    endGame();
  }
}

function endGame() {
  // update statistics
  updateGameStats();
  
  // show game over screen
  showGameOverScreen();
}

function showGameOverScreen() {
  const resultIcon = document.getElementById('resultIcon');
  const resultText = document.getElementById('resultText');
  const revealedWord = document.getElementById('revealedWord');
  const finalWrongCount = document.getElementById('finalWrongCount');
  const finalHintsUsed = document.getElementById('finalHintsUsed');
  
  if (gameWon) {
    resultIcon.textContent = '🎉';
    resultText.textContent = 'You Won!';
    resultText.style.color = 'var(--success-color)';
  } else {
    resultIcon.textContent = '💀';
    resultText.textContent = 'Game Over!';
    resultText.style.color = 'var(--danger-color)';
  }
  
  revealedWord.textContent = currentWord;
  finalWrongCount.textContent = wrongGuesses;
  finalHintsUsed.textContent = hintsUsed;
  
  showScreen('gameOverScreen');
}

function playAgain() {
  if (currentGameMode === 'alternating' && isAlternatingMode) {
    // switch turns in alternating mode
    alternatingTurn = alternatingTurn === 1 ? 2 : 1;
    
    if (alternatingTurn === 1) {
      // back to AI turn
      showScreen('categoryScreen');
    } else {
      // player 2's turn to set word
      showScreen('wordInputScreen');
    }
  } else if (currentGameMode === 'twoPlayer') {
    showScreen('wordInputScreen');
  } else {
    startGame(); // restart with same settings
  }
}

// statistics management
function loadStats() {
  const stats = JSON.parse(localStorage.getItem('hangman-stats')) || {
    totalGames: 0,
    totalWins: 0,
    currentStreak: 0,
    bestStreak: 0,
    twoPlayerWins: 0,
    twoPlayerGames: 0,
    vsAIWins: 0,
    vsAIGames: 0,
    alternatingWins: 0,
    alternatingGames: 0
  };
  
  return stats;
}

function saveStats(stats) {
  localStorage.setItem('hangman-stats', JSON.stringify(stats));
}

function updateGameStats() {
  const stats = loadStats();
  
  stats.totalGames++;
  
  if (gameWon) {
    stats.totalWins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }
  
  // update mode-specific stats
  if (currentGameMode === 'twoPlayer') {
    stats.twoPlayerGames++;
    if (gameWon) stats.twoPlayerWins++;
  } else if (currentGameMode === 'vsAI') {
    stats.vsAIGames++;
    if (gameWon) stats.vsAIWins++;
  } else if (currentGameMode === 'alternating') {
    stats.alternatingGames++;
    if (gameWon) stats.alternatingWins++;
  }
  
  saveStats(stats);
}

function updateStatsDisplay() {
  const stats = loadStats();
  
  document.getElementById('totalGames').textContent = stats.totalGames;
  document.getElementById('totalWins').textContent = stats.totalWins;
  document.getElementById('winPercentage').textContent = 
    stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) + '%' : '0%';
  document.getElementById('currentStreak').textContent = stats.currentStreak;
  
  document.getElementById('twoPlayerStats').textContent = 
    `${stats.twoPlayerWins} wins / ${stats.twoPlayerGames} games`;
  document.getElementById('vsAIStats').textContent = 
    `${stats.vsAIWins} wins / ${stats.vsAIGames} games`;
  document.getElementById('alternatingStats').textContent = 
    `${stats.alternatingWins} wins / ${stats.alternatingGames} games`;
}

function resetStats() {
  if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
    localStorage.removeItem('hangman-stats');
    updateStatsDisplay();
    alert('Statistics have been reset!');
  }
}

// keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // only handle shortcuts when in game screen
  if (!document.getElementById('gameScreen').classList.contains('active')) return;
  
  const key = e.key.toUpperCase();
  
  // handle letter guesses
  if (key >= 'A' && key <= 'Z') {
    e.preventDefault();
    guessLetter(key);
  }
  
  // handle hint shortcut (H key)
  if (key === 'H' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    useHint();
  }
  
  // handle surrender shortcut (Escape key)
  if (key === 'ESCAPE') {
    e.preventDefault();
    surrenderGame();
  }
});

// prevent right-click context menu on game elements (to prevent cheating)
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.game-container')) {
    e.preventDefault();
  }
});

// prevent text selection on game elements
document.addEventListener('selectstart', (e) => {
  if (e.target.closest('.game-container')) {
    e.preventDefault();
  }
});