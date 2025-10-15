// main.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const maxWidth = Math.min(window.innerWidth * 0.8, 1000);
    const maxHeight = Math.min(window.innerHeight * 0.7, 700);
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize game systems
const keys = {};
const statsManager = new StatsManager();
const ui = new UIManager();
const game = new Game();
const inputManager = new InputManager();

// Create player
let player = new Player(canvas.width / 2, canvas.height - 50, 15, 'white');

// Update stats display on load
statsManager.updateStatsDisplay();

// Show initial menu
document.getElementById('howToPlay').style.display = 'block';

// Console easter egg
console.log(`
🚀 DAN'S ASTEROIDS 2025 🚀
========================
Debug Commands:
- game.score += 1000 (add score)
- game.level += 1 (increase level)
- statsManager.resetStats() (reset all stats)
- player.shielded = true (enable shield)
- player.multiShot = true (enable multi-shot)

Good luck, pilot! 🌟
`);