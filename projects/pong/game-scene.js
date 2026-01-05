// Pong in one ES module. No dependencies.
// Everything renders in a fixed virtual resolution (320x180), scaled to the window with integer scaling.

/** @typedef {{x:number,y:number,w:number,h:number}} Rect */

const GAME_W = 320;
const GAME_H = 180;
const TARGET_HZ = 60;
const FIXED_DT = 1 / TARGET_HZ;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

// Scale the logical 320x180 to fit the window with integer scaling + letterboxing.
function resize() {
  const maxScaleX = Math.floor(window.innerWidth / GAME_W) || 1;
  const maxScaleY = Math.floor(window.innerHeight / GAME_H) || 1;
  const scale = Math.max(1, Math.min(maxScaleX, maxScaleY));
  canvas.style.width = (GAME_W * scale) + 'px';
  canvas.style.height = (GAME_H * scale) + 'px';
  // Keep backing store at logical size for crisp text/lines
  canvas.width = GAME_W;
  canvas.height = GAME_H;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

// Input
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','w','s','W','S',' '].includes(e.key)) e.preventDefault();
  keys.add(e.key);
  if (e.key === 'p' || e.key === 'P') paused = !paused;
  if (e.key === 'r' || e.key === 'R') reset(true);
  if (e.key === 'a' || e.key === 'A') aiEnabled = !aiEnabled;
  if (e.key === ' ') tryServe();
});
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Game state
/** @type Rect */
const p1 = { x: 8, y: GAME_H/2 - 16, w: 4, h: 32 };
/** @type Rect */
const p2 = { x: GAME_W - 12, y: GAME_H/2 - 16, w: 4, h: 32 };
const ball = { x: GAME_W/2, y: GAME_H/2, r: 2.5, vx: 0, vy: 0 };
let p1Score = 0, p2Score = 0;
let paused = false;
let aiEnabled = true;
let awaitingServe = true;
let lastTime = performance.now();
let acc = 0;

// Helpers
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rectCircleOverlap(rect, cx, cy, r) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx, dy = cy - ny;
  return (dx*dx + dy*dy) <= r*r;
}

function reset(full=false) {
  p1.y = GAME_H/2 - p1.h/2;
  p2.y = GAME_H/2 - p2.h/2;
  ball.x = GAME_W/2; ball.y = GAME_H/2;
  ball.vx = 0; ball.vy = 0;
  awaitingServe = true;
  if (full) { p1Score = 0; p2Score = 0; }
}

function tryServe() {
  if (!awaitingServe) return;
  awaitingServe = false;
  const dir = Math.random() < 0.5 ? -1 : 1;
  const speed = 90 + Math.random()*30; // px/s
  const angle = (Math.random()*0.5 - 0.25); // -0.25..0.25 radians-ish vertical component
  ball.vx = dir * speed * (1 + Math.abs(angle)*0.5);
  ball.vy = speed * angle;
}

function score(pointToRightPlayer) {
  if (pointToRightPlayer) p2Score++; else p1Score++;
  reset(false);
}

function update(dt) {
  // P1 movement
  const p1Speed = 140;
  let dy1 = 0;
  // Support both W/S and ArrowUp/ArrowDown for Player 1
  if (keys.has('w') || keys.has('W') || keys.has('ArrowUp')) dy1 -= 1;
  if (keys.has('s') || keys.has('S') || keys.has('ArrowDown')) dy1 += 1;
  p1.y += dy1 * p1Speed * dt;

  // P2 movement: player or AI
  const p2Speed = 140;
  if (aiEnabled) {
    // Simple AI: follow the ball when it is moving towards the right half
    const targetY = ball.y - p2.h/2;
    const delta = targetY - p2.y;
    const maxMove = p2Speed * dt;
    p2.y += clamp(delta, -maxMove, maxMove);
  } else {
    let dy2 = 0;
    if (keys.has('ArrowUp')) dy2 -= 1;
    if (keys.has('ArrowDown')) dy2 += 1;
    p2.y += dy2 * p2Speed * dt;
  }

  // Clamp paddles
  p1.y = clamp(p1.y, 2, GAME_H - p1.h - 2);
  p2.y = clamp(p2.y, 2, GAME_H - p2.h - 2);

  // Ball
  if (!awaitingServe) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Top/bottom walls
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
    if (ball.y + ball.r > GAME_H) { ball.y = GAME_H - ball.r; ball.vy = -Math.abs(ball.vy); }

    // Paddles collision
    if (rectCircleOverlap(p1, ball.x, ball.y, ball.r) && ball.vx < 0) {
      // Reflect, tweak angle based on hit position
      const hitPos = ((ball.y - (p1.y + p1.h/2)) / (p1.h/2)); // -1..1
      const speed = Math.hypot(ball.vx, ball.vy) * 1.05 + 5;
      const newAngle = hitPos * 0.6; // limit vertical angle
      ball.vx = Math.abs(Math.cos(newAngle) * speed);
      ball.vy = Math.sin(newAngle) * speed;
      ball.x = p1.x + p1.w + ball.r + 0.01;
    } else if (rectCircleOverlap(p2, ball.x, ball.y, ball.r) && ball.vx > 0) {
      const hitPos = ((ball.y - (p2.y + p2.h/2)) / (p2.h/2));
      const speed = Math.hypot(ball.vx, ball.vy) * 1.05 + 5;
      const newAngle = hitPos * 0.6;
      ball.vx = -Math.abs(Math.cos(newAngle) * speed);
      ball.vy = Math.sin(newAngle) * speed;
      ball.x = p2.x - ball.r - 0.01;
    }

    // Scoring
    if (ball.x < -10) score(true);
    else if (ball.x > GAME_W + 10) score(false);
  }
}

function drawNet() {
  ctx.fillStyle = '#444';
  const dashH = 6, gap = 5, w = 2;
  for (let y = 0; y < GAME_H; y += dashH + gap) {
    ctx.fillRect(GAME_W/2 - w/2, y, w, dashH);
  }
}

function draw() {
  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  drawNet();

  // Paddles and ball
  ctx.fillStyle = '#fff';
  ctx.fillRect(p1.x, Math.round(p1.y), p1.w, p1.h);
  ctx.fillRect(p2.x, Math.round(p2.y), p2.w, p2.h);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  // Scores
  ctx.fillStyle = '#eaeaea';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(p1Score).padStart(2,'0'), GAME_W/2 - 24, 16);
  ctx.fillText(String(p2Score).padStart(2,'0'), GAME_W/2 + 24, 16);

  // Overlays
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9aa0a6';
  ctx.fillText(`AI: ${aiEnabled ? 'ON' : 'OFF'}`, 6, GAME_H - 6);

  if (paused) {
    overlay('Paused — press P to resume');
  } else if (awaitingServe) {
    overlay('Press Space to serve');
  }
}

function overlay(text) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, GAME_W/2, GAME_H/2);
}

// Main loop: fixed timestep simulation with rAF
function frame(now) {
  const dt = Math.min(0.25, (now - lastTime) / 1000);
  lastTime = now;
  if (!paused) {
    acc += dt;
    // Avoid spiral of death
    let steps = 0;
    while (acc >= FIXED_DT && steps < 5) {
      update(FIXED_DT);
      acc -= FIXED_DT;
      steps++;
    }
  }
  draw();
  requestAnimationFrame(frame);
}

// Initialize
reset(true);
requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(frame); });