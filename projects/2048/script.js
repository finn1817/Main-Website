// game state variables
let gameMode = 'classic';
let gridSize = 4;
let gameGrid = [];
let score = 0;
let bestScore = 0;
let moveCount = 0;
let gameStartTime = null;
let gameTimer = null;
let speedModeTime = 180; // 3 minutes in seconds
let speedModeTimer = null;
let gameHistory = [];
let hasWon = false;
let canUndo = true;

// game mode settings
const gameModes = {
  classic: { size: 4, target: 2048, timer: false },
  big: { size: 5, target: 2048, timer: false },
  huge: { size: 6, target: 2048, timer: false },
  speed: { size: 4, target: 2048, timer: true }
};

// achievements system
const achievements = [
  { id: 'first_win', title: 'First Victory', desc: 'Reach 2048 for the first time', icon: '🏆', unlocked: false },
  { id: 'speed_demon', title: 'Speed Demon', desc: 'Win a speed mode game', icon: '⚡', unlocked: false },
  { id: 'big_winner', title: 'Big Winner', desc: 'Win on 5x5 grid', icon: '🔥', unlocked: false },
  { id: 'huge_master', title: 'Huge Master', desc: 'Win on 6x6 grid', icon: '🚀', unlocked: false },
  { id: 'tile_4096', title: 'Power of Two', desc: 'Reach 4096 tile', icon: '💎', unlocked: false },
  { id: 'tile_8192', title: 'Legendary', desc: 'Reach 8192 tile', icon: '👑', unlocked: false },
  { id: 'no_undo', title: 'Pure Skill', desc: 'Win without using undo', icon: '🎯', unlocked: false },
  { id: 'speed_master', title: 'Speed Master', desc: 'Win speed mode in under 2 minutes', icon: '🏃', unlocked: false }
];

// initialize the game
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  loadStats();
  loadBestScore();
  setupKeyboardControls();
  setupTouchControls();
  
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
  if (screenId === 'statsScreen') {
    updateStatsDisplay();
  }
}

// game mode selection
function setGameMode(mode) {
  gameMode = mode;
  const settings = gameModes[mode];
  gridSize = settings.size;
  
  showScreen('gameScreen');
  startNewGame();
}

// game initialization
function startNewGame() {
  // reset game state
  score = 0;
  moveCount = 0;
  hasWon = false;
  canUndo = true;
  gameHistory = [];
  
  // initialize grid
  gameGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  
  // add initial tiles
  addRandomTile();
  addRandomTile();
  
  // setup display
  updateGameDisplay();
  updateGrid();
  
  // start timers
  startGameTimer();
  
  if (gameModes[gameMode].timer) {
    startSpeedModeTimer();
  } else {
    document.getElementById('timerContainer').style.display = 'none';
  }
  
  // update mode display
  updateModeDisplay();
}

function updateModeDisplay() {
  const modeNames = {
    classic: 'Classic Mode',
    big: 'Big Grid (5x5)',
    huge: 'Huge Grid (6x6)',
    speed: 'Speed Mode'
  };
  
  document.getElementById('currentMode').textContent = modeNames[gameMode];
  document.getElementById('gameTarget').textContent = gameModes[gameMode].target;
  
  // setup grid size
  const grid = document.getElementById('gameGrid');
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  grid.innerHTML = '';
  
  // create grid cells
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

function updateGameDisplay() {
  document.getElementById('currentScore').textContent = score;
  document.getElementById('bestScore').textContent = bestScore;
  document.getElementById('moveCount').textContent = moveCount;
  
  // update undo button
  document.getElementById('undoBtn').disabled = gameHistory.length === 0;
}

// grid management
function addRandomTile() {
  const emptyCells = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    gameGrid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateGrid() {
  const grid = document.getElementById('gameGrid');
  
  // clear existing tiles
  grid.querySelectorAll('.tile').forEach(tile => tile.remove());
  
  // add current tiles
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const value = gameGrid[row][col];
      if (value !== 0) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        tile.style.transform = `translate(${col * 78}px, ${row * 78}px)`;
        grid.appendChild(tile);
      }
    }
  }
}

// game logic
function saveGameState() {
  gameHistory.push({
    grid: gameGrid.map(row => [...row]),
    score: score,
    moveCount: moveCount
  });
  
  // limit history to last 10 moves
  if (gameHistory.length > 10) {
    gameHistory.shift();
  }
}

function handleMove(direction) {
  if (!canMove()) {
    endGame();
    return;
  }
  
  saveGameState();
  
  const oldGrid = gameGrid.map(row => [...row]);
  let moved = false;
  let scoreGained = 0;
  
  switch (direction) {
    case 'left':
      ({ moved, scoreGained } = moveLeft());
      break;
    case 'right':
      ({ moved, scoreGained } = moveRight());
      break;
    case 'up':
      ({ moved, scoreGained } = moveUp());
      break;
    case 'down':
      ({ moved, scoreGained } = moveDown());
      break;
  }
  
  if (moved) {
    score += scoreGained;
    moveCount++;
    addRandomTile();
    updateGrid();
    updateGameDisplay();
    
    // check for win condition
    if (!hasWon && checkWin()) {
      hasWon = true;
      setTimeout(() => showVictoryScreen(), 500);
    }
    
    // check for game over
    if (!canMove()) {
      setTimeout(() => endGame(), 500);
    }
    
    // update best score
    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }
  } else {
    // remove the last state since no move was made
    gameHistory.pop();
  }
}

function moveLeft() {
  let moved = false;
  let scoreGained = 0;
  
  for (let row = 0; row < gridSize; row++) {
    const line = gameGrid[row].filter(cell => cell !== 0);
    const merged = [];
    
    for (let i = 0; i < line.length; i++) {
      if (i < line.length - 1 && line[i] === line[i + 1]) {
        merged.push(line[i] * 2);
        scoreGained += line[i] * 2;
        i++; // skip next element
      } else {
        merged.push(line[i]);
      }
    }
    
    while (merged.length < gridSize) {
      merged.push(0);
    }
    
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] !== merged[col]) {
        moved = true;
      }
      gameGrid[row][col] = merged[col];
    }
  }
  
  return { moved, scoreGained };
}

function moveRight() {
  let moved = false;
  let scoreGained = 0;
  
  for (let row = 0; row < gridSize; row++) {
    const line = gameGrid[row].filter(cell => cell !== 0);
    const merged = [];
    
    for (let i = line.length - 1; i >= 0; i--) {
      if (i > 0 && line[i] === line[i - 1]) {
        merged.unshift(line[i] * 2);
        scoreGained += line[i] * 2;
        i--; // skip next element
      } else {
        merged.unshift(line[i]);
      }
    }
    
    while (merged.length < gridSize) {
      merged.unshift(0);
    }
    
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] !== merged[col]) {
        moved = true;
      }
      gameGrid[row][col] = merged[col];
    }
  }
  
  return { moved, scoreGained };
}

function moveUp() {
  let moved = false;
  let scoreGained = 0;
  
  for (let col = 0; col < gridSize; col++) {
    const line = [];
    for (let row = 0; row < gridSize; row++) {
      if (gameGrid[row][col] !== 0) {
        line.push(gameGrid[row][col]);
      }
    }
    
    const merged = [];
    for (let i = 0; i < line.length; i++) {
      if (i < line.length - 1 && line[i] === line[i + 1]) {
        merged.push(line[i] * 2);
        scoreGained += line[i] * 2;
        i++; // skip next element
      } else {
        merged.push(line[i]);
      }
    }
    
    while (merged.length < gridSize) {
      merged.push(0);
    }
    
    for (let row = 0; row < gridSize; row++) {
      if (gameGrid[row][col] !== merged[row]) {
        moved = true;
      }
      gameGrid[row][col] = merged[row];
    }
  }
  
  return { moved, scoreGained };
}

function moveDown() {
  let moved = false;
  let scoreGained = 0;
  
  for (let col = 0; col < gridSize; col++) {
    const line = [];
    for (let row = 0; row < gridSize; row++) {
      if (gameGrid[row][col] !== 0) {
        line.push(gameGrid[row][col]);
      }
    }
    
    const merged = [];
    for (let i = line.length - 1; i >= 0; i--) {
      if (i > 0 && line[i] === line[i - 1]) {
        merged.unshift(line[i] * 2);
        scoreGained += line[i] * 2;
        i--; // skip next element
      } else {
        merged.unshift(line[i]);
      }
    }
    
    while (merged.length < gridSize) {
      merged.unshift(0);
    }
    
    for (let row = 0; row < gridSize; row++) {
      if (gameGrid[row][col] !== merged[row]) {
        moved = true;
      }
      gameGrid[row][col] = merged[row];
    }
  }
  
  return { moved, scoreGained };
}

function canMove() {
  // check for empty cells
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] === 0) {
        return true;
      }
    }
  }
  
  // check for possible merges
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const current = gameGrid[row][col];
      
      // check right
      if (col < gridSize - 1 && gameGrid[row][col + 1] === current) {
        return true;
      }
      
      // check down
      if (row < gridSize - 1 && gameGrid[row + 1][col] === current) {
        return true;
      }
    }
  }
  
  return false;
}

function checkWin() {
  const target = gameModes[gameMode].target;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] >= target) {
        return true;
      }
    }
  }
  return false;
}

function getHighestTile() {
  let highest = 0;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (gameGrid[row][col] > highest) {
        highest = gameGrid[row][col];
      }
    }
  }
  return highest;
}

// undo functionality
function undoMove() {
  if (gameHistory.length === 0) return;
  
  const lastState = gameHistory.pop();
  gameGrid = lastState.grid;
  score = Math.max(0, lastState.score - Math.floor(score * 0.1)); // 10% penalty
  moveCount = lastState.moveCount;
  
  updateGrid();
  updateGameDisplay();
  
  canUndo = false; // prevent achievement abuse
}

function restartGame() {
  if (confirm('Are you sure you want to restart? Your current progress will be lost.')) {
    startNewGame();
  }
}

// timer functions
function startGameTimer() {
  gameStartTime = Date.now();
  gameTimer = setInterval(updateGameTimer, 1000);
}

function updateGameTimer() {
  // this is just for tracking, display happens in game over screen
}

function startSpeedModeTimer() {
  document.getElementById('timerContainer').style.display = 'block';
  speedModeTimer = setInterval(() => {
    speedModeTime--;
    updateSpeedModeDisplay();
    
    if (speedModeTime <= 0) {
      clearInterval(speedModeTimer);
      endGame();
    }
  }, 1000);
}

function updateSpeedModeDisplay() {
  const minutes = Math.floor(speedModeTime / 60);
  const seconds = speedModeTime % 60;
  document.getElementById('gameTimer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimers() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  if (speedModeTimer) {
    clearInterval(speedModeTimer);
    speedModeTimer = null;
  }
}

function getGameTime() {
  return Date.now() - gameStartTime;
}

// game end functions
function showVictoryScreen() {
  stopTimers();
  
  const gameTime = getGameTime();
  const minutes = Math.floor(gameTime / 60000);
  const seconds = Math.floor((gameTime % 60000) / 1000);
  
  document.getElementById('victoryTile').textContent = gameModes[gameMode].target;
  document.getElementById('victoryScore').textContent = score;
  document.getElementById('victoryMoves').textContent = moveCount;
  document.getElementById('victoryTime').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // check achievements
  checkAchievements(true);
  
  showScreen('victoryScreen');
}

function endGame() {
  stopTimers();
  updateGameStatistics();
  
  const gameTime = getGameTime();
  const minutes = Math.floor(gameTime / 60000);
  const seconds = Math.floor((gameTime % 60000) / 1000);
  
  document.getElementById('finalScore').textContent = score;
  document.getElementById('highestTile').textContent = getHighestTile();
  document.getElementById('totalMoves').textContent = moveCount;
  document.getElementById('gameTime').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // check achievements
  checkAchievements(false);
  
  // show any new achievements
  displayNewAchievements();
  
  showScreen('gameOverScreen');
}

function continueGame() {
  showScreen('gameScreen');
}

// controls
function setupKeyboardControls() {
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('gameScreen').classList.contains('active')) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handleMove('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleMove('right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleMove('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleMove('down');
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          undoMove();
        }
        break;
      case 'r':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          restartGame();
        }
        break;
    }
  });
}

function setupTouchControls() {
  const grid = document.getElementById('gameGrid');
  let startX, startY;
  
  grid.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  });
  
  grid.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!startX || !startY) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    startX = null;
    startY = null;
  });
}

// statistics and achievements
function loadStats() {
  const stats = JSON.parse(localStorage.getItem('dans2048-stats')) || {
    totalGames: 0,
    gamesWon: 0,
    totalScore: 0,
    totalMoves: 0,
    totalTime: 0,
    highestTile: 2,
    achievements: achievements.map(a => ({ ...a, unlocked: false }))
  };
  
  // merge achievements (in case new ones were added)
  achievements.forEach((achievement, index) => {
    if (!stats.achievements[index]) {
      stats.achievements[index] = { ...achievement, unlocked: false };
    }
  });
  
  return stats;
}

function saveStats(stats) {
  localStorage.setItem('dans2048-stats', JSON.stringify(stats));
}

function loadBestScore() {
  bestScore = parseInt(localStorage.getItem('dans2048-best-score')) || 0;
}

function saveBestScore() {
  localStorage.setItem('dans2048-best-score', bestScore.toString());
}

function updateGameStatistics() {
  const stats = loadStats();
  const gameTime = getGameTime();
  const highestTile = getHighestTile();
  
  stats.totalGames++;
  stats.totalScore += score;
  stats.totalMoves += moveCount;
  stats.totalTime += gameTime;
  
  if (hasWon) {
    stats.gamesWon++;
  }
  
  if (highestTile > stats.highestTile) {
    stats.highestTile = highestTile;
  }
  
  saveStats(stats);
}

function checkAchievements(won) {
  const stats = loadStats();
  const highestTile = getHighestTile();
  const gameTime = getGameTime();
  
  // check each achievement
  if (won && !stats.achievements[0].unlocked) {
    stats.achievements[0].unlocked = true; // first_win
  }
  
  if (won && gameMode === 'speed' && !stats.achievements[1].unlocked) {
    stats.achievements[1].unlocked = true; // speed_demon
  }
  
  if (won && gameMode === 'big' && !stats.achievements[2].unlocked) {
    stats.achievements[2].unlocked = true; // big_winner
  }
  
  if (won && gameMode === 'huge' && !stats.achievements[3].unlocked) {
    stats.achievements[3].unlocked = true; // huge_master
  }
  
  if (highestTile >= 4096 && !stats.achievements[4].unlocked) {
    stats.achievements[4].unlocked = true; // tile_4096
  }
  
  if (highestTile >= 8192 && !stats.achievements[5].unlocked) {
    stats.achievements[5].unlocked = true; // tile_8192
  }
  
  if (won && canUndo && !stats.achievements[6].unlocked) {
    stats.achievements[6].unlocked = true; // no_undo
  }
  
  if (won && gameMode === 'speed' && gameTime < 120000 && !stats.achievements[7].unlocked) {
    stats.achievements[7].unlocked = true; // speed_master
  }
  
  saveStats(stats);
}

function displayNewAchievements() {
  const stats = loadStats();
  const container = document.getElementById('achievementContainer');
  container.innerHTML = '';
  
  // find newly unlocked achievements (this is simplified - in a real app you'd track this better)
  const newAchievements = stats.achievements.filter(a => a.unlocked);
  
  if (newAchievements.length > 0) {
    newAchievements.slice(-2).forEach(achievement => { // show last 2 unlocked
      const achievementDiv = document.createElement('div');
      achievementDiv.className = 'achievement-item';
      achievementDiv.innerHTML = `${achievement.icon} ${achievement.title}: ${achievement.desc}`;
      container.appendChild(achievementDiv);
    });
  }
}

function updateStatsDisplay() {
  const stats = loadStats();
  
  document.getElementById('totalGames').textContent = stats.totalGames;
  document.getElementById('gamesWon').textContent = stats.gamesWon;
  document.getElementById('winPercentage').textContent = 
    stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) + '%' : '0%';
  document.getElementById('bestScoreDisplay').textContent = bestScore;
  
  document.getElementById('highestTileEver').textContent = stats.highestTile;
  document.getElementById('totalScore').textContent = stats.totalScore.toLocaleString();
  document.getElementById('totalMoves').textContent = stats.totalMoves.toLocaleString();
  document.getElementById('averageScore').textContent = 
    stats.totalGames > 0 ? Math.round(stats.totalScore / stats.totalGames).toLocaleString() : '0';
  
  const totalHours = Math.floor(stats.totalTime / 3600000);
  const totalMinutes = Math.floor((stats.totalTime % 3600000) / 60000);
  document.getElementById('totalTimePlayed').textContent = `${totalHours}h ${totalMinutes}m`;
  
  // update achievements display
  updateAchievementsDisplay(stats.achievements);
}

function updateAchievementsDisplay(userAchievements) {
  const grid = document.getElementById('achievementsGrid');
  grid.innerHTML = '';
  
  userAchievements.forEach(achievement => {
    const achievementDiv = document.createElement('div');
    achievementDiv.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
    achievementDiv.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    `;
    grid.appendChild(achievementDiv);
  });
}

function resetStats() {
  if (confirm('Are you sure you want to reset all statistics and achievements? This cannot be undone.')) {
    localStorage.removeItem('dans2048-stats');
    localStorage.removeItem('dans2048-best-score');
    bestScore = 0;
    updateStatsDisplay();
    alert('Statistics have been reset!');
  }
}

// prevent context menu and text selection
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.game-container')) {
    e.preventDefault();
  }
});

document.addEventListener('selectstart', (e) => {
  if (e.target.closest('.game-grid')) {
    e.preventDefault();
  }
});