// Pong with settings, audio, touch, gamepad. One ES module; no deps.

/** @typedef {{x:number,y:number,w:number,h:number}} Rect */

const GAME_W = 320, GAME_H = 180, TARGET_HZ = 60, FIXED_DT = 1/TARGET_HZ;

// Persistent settings
const DEFAULTS = {
  aiEnabled: true,
  aiDifficulty: 'normal', // easy|normal|hard
  paddleH: 32,
  ballSpeedMul: 1.0,
  winningScore: 11,
  theme: 'classic', // classic|neon|dmg
  sound: true,
  spin: true
};
const STORE_KEY = 'pong.settings.v1';
const cfg = loadSettings();

// DOM
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const $ = (id) => document.getElementById(id);

// UI wiring
$('#btn-settings').addEventListener('click', toggleSettings);
$('#btn-reset').addEventListener('click', () => reset(true));
$('#btn-fullscreen').addEventListener('click', tryFullscreen);
window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','w','s','W','S',' '].includes(e.key)) e.preventDefault();
  if (e.key === 'p' || e.key === 'P') paused = !paused;
  if (e.key === 'r' || e.key === 'R') reset(true);
  if (e.key === 'a' || e.key === 'A') setCfg('aiEnabled', !cfg.aiEnabled);
  if (e.key === 'o' || e.key === 'O') toggleSettings();
  if (e.key === 'f' || e.key === 'F') tryFullscreen();
  if (e.key === ' ') tryServe();
}, { passive: false });

// Settings panel init
initSettingsPanel();

// Scale logical 320x180 to the window; integer scale + letterbox
function resize() {
  const maxX = Math.floor((window.innerWidth) / GAME_W) || 1;
  const maxY = Math.floor((window.innerHeight - 40) / GAME_H) || 1; // minus header
  const scale = Math.max(1, Math.min(maxX, maxY));
  canvas.style.width = (GAME_W * scale) + 'px';
  canvas.style.height = (GAME_H * scale) + 'px';
  canvas.width = GAME_W; canvas.height = GAME_H;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

// Input
const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Touch controls: drag to set left paddle Y when AI is on (good for mobile)
let touching = false;
canvas.addEventListener('pointerdown', (e) => { touching = true; updatePaddleFromPointer(e); });
canvas.addEventListener('pointermove', (e) => { if (touching) updatePaddleFromPointer(e); });
canvas.addEventListener('pointerup', () => touching = false);
function updatePaddleFromPointer(e) {
  const rect = canvas.getBoundingClientRect();
  const y = ((e.clientY - rect.top) / rect.height) * GAME_H;
  p1.y = clamp(y - p1.h/2, 2, GAME_H - p1.h - 2);
}

// Game state
/** @type Rect */ const p1 = { x: 8, y: GAME_H/2 - DEFAULTS.paddleH/2, w: 4, h: cfg.paddleH };
/** @type Rect */ const p2 = { x: GAME_W - 12, y: GAME_H/2 - DEFAULTS.paddleH/2, w: 4, h: cfg.paddleH };
const ball = { x: GAME_W/2, y: GAME_H/2, r: 2.5, vx: 0, vy: 0 };
let p1Score = 0, p2Score = 0;
let paused = false, awaitingServe = true;
let lastTime = performance.now(), acc = 0;

// Themes
const THEMES = {
  classic: { bg:'#000', net:'#444', fg:'#fff', text:'#eaeaea', hud:'#9aa0a6' },
  neon:    { bg:'#05060a', net:'#182a35', fg:'#2ee6a6', text:'#b7fff1', hud:'#6ad6ff' },
  dmg:     { bg:'#0f380f', net:'#224422', fg:'#8bac0f', text:'#c4f000', hud:'#9bbc0f' }
};

// Audio (simple beeps). Starts after user gesture.
let actx = null;
function ensureAudio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } }
function beep(freq=440, dur=0.06, type='square', vol=0.03) {
  if (!cfg.sound) return;
  ensureAudio(); if (!actx) return;
  const t0 = actx.currentTime;
  const o = actx.createOscillator(); const g = actx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol;
  o.connect(g).connect(actx.destination);
  o.start(t0); o.stop(t0 + dur);
}

// Helpers
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function rectCircleOverlap(rect, cx, cy, r) {
  const nx = clamp(cx, rect.x, rect.x+rect.w);
  const ny = clamp(cy, rect.y, rect.y+rect.h);
  const dx = cx - nx, dy = cy - ny;
  return dx*dx + dy*dy <= r*r;
}

// AI parameters
function aiParams() {
  switch (cfg.aiDifficulty) {
    case 'easy': return { speed: 110, jitter: 0.4 };
    case 'hard': return { speed: 170, jitter: 0.05 };
    default:     return { speed: 140, jitter: 0.15 };
  }
}

// Core
function reset(full=false) {
  p1.h = p2.h = cfg.paddleH;
  p1.y = GAME_H/2 - p1.h/2; p2.y = GAME_H/2 - p2.h/2;
  ball.x = GAME_W/2; ball.y = GAME_H/2; ball.vx = 0; ball.vy = 0;
  awaitingServe = true;
  if (full) { p1Score = 0; p2Score = 0; }
}

function tryServe() {
  if (!awaitingServe) return;
  awaitingServe = false; ensureAudio();
  const dir = Math.random()<0.5?-1:1;
  const base = 100 * cfg.ballSpeedMul;
  const angle = (Math.random()*0.5 - 0.25);
  ball.vx = dir * base * (1 + Math.abs(angle)*0.4);
  ball.vy = base * angle;
}

function score(pointRight) {
  if (pointRight) p2Score++; else p1Score++;
  beep(220,0.09,'sawtooth',0.04);
  if (p1Score >= cfg.winningScore || p2Score >= cfg.winningScore) paused = true;
  reset(false);
}

function update(dt) {
  // P1 movement
  const P1S = 150;
  let dy1 = 0;
  if (keys.has('w') || keys.has('W') || keys.has('ArrowUp')) dy1 -= 1;
  if (keys.has('s') || keys.has('S') || keys.has('ArrowDown')) dy1 += 1;
  const p1PrevY = p1.y;
  p1.y += dy1 * P1S * dt;

  // P2 movement (AI or player)
  const p2PrevY = p2.y;
  if (cfg.aiEnabled) {
    const { speed, jitter } = aiParams();
    // Predictive-ish aim: lead towards ball when it moves right, with some noise
    const targetY = ball.y + (ball.vy * 0.12) - p2.h/2 + ((Math.random()-0.5) * p2.h * jitter);
    const delta = targetY - p2.y;
    const maxMove = speed * dt;
    p2.y += clamp(delta, -maxMove, maxMove);
  } else {
    const P2S = 150;
    let dy2 = 0;
    if (keys.has('ArrowUp')) dy2 -= 1;
    if (keys.has('ArrowDown')) dy2 += 1;
    p2.y += dy2 * P2S * dt;
  }

  // Clamp paddles
  p1.y = clamp(p1.y, 2, GAME_H - p1.h - 2);
  p2.y = clamp(p2.y, 2, GAME_H - p2.h - 2);

  // Ball physics
  if (!awaitingServe) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;

    // Walls
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); beep(800,0.03); }
    if (ball.y + ball.r > GAME_H) { ball.y = GAME_H - ball.r; ball.vy = -Math.abs(ball.vy); beep(800,0.03); }

    // Paddle collisions + spin
    const spinFactor = cfg.spin ? 45 : 0; // adds/subtracts to vy based on paddle motion
    if (rectCircleOverlap(p1, ball.x, ball.y, ball.r) && ball.vx < 0) {
      const hitPos = ((ball.y - (p1.y + p1.h/2)) / (p1.h/2)); // -1..1
      const speed = Math.hypot(ball.vx, ball.vy) * 1.05 + 5;
      const newAngle = hitPos * 0.6;
      ball.vx = Math.abs(Math.cos(newAngle) * speed);
      ball.vy = Math.sin(newAngle) * speed + (p1.y - p1PrevY) * spinFactor;
      ball.x = p1.x + p1.w + ball.r + 0.01;
      beep(600,0.025);
    } else if (rectCircleOverlap(p2, ball.x, ball.y, ball.r) && ball.vx > 0) {
      const hitPos = ((ball.y - (p2.y + p2.h/2)) / (p2.h/2));
      const speed = Math.hypot(ball.vx, ball.vy) * 1.05 + 5;
      const newAngle = hitPos * 0.6;
      ball.vx = -Math.abs(Math.cos(newAngle) * speed);
      ball.vy = Math.sin(newAngle) * speed + (p2.y - p2PrevY) * spinFactor;
      ball.x = p2.x - ball.r - 0.01;
      beep(600,0.025);
    }

    // Scoring
    if (ball.x < -10) score(true);
    else if (ball.x > GAME_W + 10) score(false);
  }

  // Gamepad (first pad controls P1)
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = pads && pads[0];
  if (gp && gp.connected) {
    const y = Math.abs(gp.axes[1]) > 0.12 ? gp.axes[1] : (gp.buttons[12]?.pressed ? -1 : gp.buttons[13]?.pressed ? 1 : 0);
    p1.y = clamp(p1.y + y * 160 * dt, 2, GAME_H - p1.h - 2);
    if (gp.buttons[0]?.pressed) tryServe(); // A / Cross
  }
}

function drawNet(theme) {
  ctx.fillStyle = theme.net;
  const dashH = 6, gap = 5, w = 2;
  for (let y = 0; y < GAME_H; y += dashH + gap) ctx.fillRect(GAME_W/2 - w/2, y, w, dashH);
}

let fps=60, fpsAcc=0, fpsFrames=0;
function draw() {
  const theme = THEMES[cfg.theme] || THEMES.classic;

  // Clear
  ctx.fillStyle = theme.bg; ctx.fillRect(0,0,GAME_W,GAME_H);
  drawNet(theme);

  // Paddles + ball
  ctx.fillStyle = theme.fg;
  ctx.fillRect(p1.x, Math.round(p1.y), p1.w, p1.h);
  ctx.fillRect(p2.x, Math.round(p2.y), p2.w, p2.h);
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();

  // Scores
  ctx.fillStyle = theme.text; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText(String(p1Score).padStart(2,'0'), GAME_W/2 - 24, 16);
  ctx.fillText(String(p2Score).padStart(2,'0'), GAME_W/2 + 24, 16);

  // HUD
  ctx.textAlign = 'left'; ctx.fillStyle = theme.hud; ctx.fillText(`AI:${cfg.aiEnabled?cfg.aiDifficulty.toUpperCase():'OFF'}`, 6, GAME_H - 6);
  ctx.textAlign = 'right'; ctx.fillText(`${Math.round(fps)} FPS`, GAME_W-6, GAME_H - 6);

  // Overlays
  if (paused) overlay('Paused — P to resume');
  else if (awaitingServe) overlay('Press Space (or A) to serve');
}

function overlay(text) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0,0,GAME_W,GAME_H);
  const theme = THEMES[cfg.theme] || THEMES.classic;
  ctx.fillStyle = theme.fg; ctx.font = '12px monospace'; ctx.textAlign = 'center';
  ctx.fillText(text, GAME_W/2, GAME_H/2);
}

// Main loop with fixed timestep and FPS counter
function frame(now) {
  const dt = Math.min(0.25, (now - lastTime) / 1000); lastTime = now;
  if (!paused) {
    acc += dt; let steps=0;
    while (acc >= FIXED_DT && steps < 5) { update(FIXED_DT); acc -= FIXED_DT; steps++; }
  }
  fpsAcc += dt; fpsFrames++; if (fpsAcc >= 0.5) { fps = fpsFrames / fpsAcc; fpsAcc = 0; fpsFrames = 0; }
  draw();
  requestAnimationFrame(frame);
}

// Settings panel helpers
function initSettingsPanel() {
  // set initial values
  $('#s-ai').checked = cfg.aiEnabled;
  $('#s-ai-diff').value = cfg.aiDifficulty;
  $('#s-paddle').value = cfg.paddleH;
  $('#s-speed').value = cfg.ballSpeedMul;
  $('#s-win').value = String(cfg.winningScore);
  $('#s-theme').value = cfg.theme;
  $('#s-sound').checked = cfg.sound;

  // listeners
  $('#s-ai').addEventListener('change', (e)=> setCfg('aiEnabled', e.target.checked));
  $('#s-ai-diff').addEventListener('change', (e)=> setCfg('aiDifficulty', e.target.value));
  $('#s-paddle').addEventListener('input', (e)=> setCfg('paddleH', parseInt(e.target.value,10), true));
  $('#s-speed').addEventListener('input', (e)=> setCfg('ballSpeedMul', parseFloat(e.target.value)));
  $('#s-win').addEventListener('change', (e)=> setCfg('winningScore', parseInt(e.target.value,10), true));
  $('#s-theme').addEventListener('change', (e)=> setCfg('theme', e.target.value));
  $('#s-sound').addEventListener('change', (e)=> setCfg('sound', e.target.checked));
}

function toggleSettings() {
  const panel = $('#settings');
  panel.classList.toggle('open');
}

function setCfg(key, value, resetPositions=false) {
  cfg[key] = value; saveSettings();
  if (key === 'paddleH' || key === 'winningScore') reset(resetPositions);
}

function tryFullscreen() {
  const root = document.documentElement;
  if (!document.fullscreenElement) root.requestFullscreen?.();
  else document.exitFullscreen?.();
}

// Storage
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULTS };
    const data = JSON.parse(raw);
    return { ...DEFAULTS, ...data };
  } catch { return { ...DEFAULTS }; }
}
function saveSettings() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(cfg)); } catch {}
}

// Initialize and run
reset(true);
requestAnimationFrame((t)=>{ lastTime = t; requestAnimationFrame(frame); });