/* ─── INDEX ─── */

/* Stars */
(function () {
  const c = document.getElementById('stars-canvas');
  const ctx = c.getContext('2d');
  let stars = [];
  function resize() {
    c.width = window.innerWidth; c.height = window.innerHeight;
    stars = Array.from({ length: Math.floor(c.width * c.height / 4500) }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.1, a: Math.random() * 0.7 + 0.2
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill();
      s.a += (Math.random() - 0.5) * 0.012;
      s.a = Math.max(0.05, Math.min(0.95, s.a));
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();


/* ── SNAKE GAME ── */
(function () {
  const canvas  = document.getElementById('snakeCanvas');
  const ctx     = canvas.getContext('2d');
  const overlay = document.getElementById('gameOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub   = document.getElementById('overlaySub');
  const overlayBtn   = document.getElementById('overlayBtn');
  const scoreEl = document.getElementById('scoreDisplay');
  const hiScoreEl = document.getElementById('hiScore');

  // sizing
  const COLS = 22, ROWS = 18, CELL = 20;
  canvas.width  = COLS * CELL;
  canvas.height = ROWS * CELL;
  canvas.style.display = 'block';

  // colors
  const C = {
    bg:       '#09090f',
    gridLine: 'rgba(255,255,255,0.03)',
    snakeHead:'#c8a97e',
    snakeBody:'#7a6244',
    snakeSeg: '#4a3520',
    food:     '#5a8fff',
    foodGlow: 'rgba(90,143,255,0.35)',
    star:     'rgba(255,255,255,',
    text:     '#e9e6de',
  };

  // stars bg
  const bgStars = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 0.9 + 0.2,
    a: Math.random() * 0.6 + 0.1,
  }));

  // food types with emoji labels
  const FOODS = [
    { label: 'Python',  emoji: '🐍', color: '#4caf82', glow: 'rgba(76,175,130,0.35)' },
    { label: 'SQL',     emoji: '🗄',  color: '#5a8fff', glow: 'rgba(90,143,255,0.35)' },
    { label: 'Pandas',  emoji: '🐼', color: '#c8a97e', glow: 'rgba(200,169,126,0.35)' },
    { label: 'NumPy',   emoji: '∑',  color: '#c87e9e', glow: 'rgba(200,126,158,0.35)' },
    { label: 'PowerBI', emoji: '📊', color: '#f0b060', glow: 'rgba(240,176,96,0.35)'  },
    { label: '★',       emoji: '★',  color: '#ffffff', glow: 'rgba(255,255,255,0.3)'  },
  ];

  let snake, dir, nextDir, food, foodType, score, hiScore = 0;
  let gameLoop, running = false, dead = false;
  let particles = [];

  function rand(max) { return Math.floor(Math.random() * max); }

  function spawnFood() {
    const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
    let fx, fy;
    do { fx = rand(COLS); fy = rand(ROWS); } while (occupied.has(`${fx},${fy}`));
    food = { x: fx, y: fy };
    foodType = FOODS[rand(FOODS.length)];
  }

  function init() {
    const mx = Math.floor(COLS / 2), my = Math.floor(ROWS / 2);
    snake = [{ x: mx, y: my }, { x: mx - 1, y: my }, { x: mx - 2, y: my }];
    dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
    score = 0; scoreEl.textContent = '0';
    particles = [];
    spawnFood();
  }

  function spawnParticles(cx, cy, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color,
        r: Math.random() * 2.5 + 0.5,
        life: 1,
      });
    }
  }

  function step() {
    dir = { ...nextDir };
    const head = { x: (snake[0].x + dir.x + COLS) % COLS, y: (snake[0].y + dir.y + ROWS) % ROWS };

    // self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      endGame(); return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      if (score > hiScore) { hiScore = score; hiScoreEl.textContent = hiScore; }
      spawnParticles(food.x * CELL + CELL/2, food.y * CELL + CELL/2, foodType.color);
      spawnFood();
    } else {
      snake.pop();
    }
  }

  function drawBg() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = C.gridLine;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
    }

    // stars
    bgStars.forEach(s => {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = C.star + s.a + ')'; ctx.fill();
      s.a += (Math.random() - 0.5) * 0.015;
      s.a = Math.max(0.05, Math.min(0.8, s.a));
    });
  }

  function drawFood() {
    const px = food.x * CELL + CELL / 2, py = food.y * CELL + CELL / 2;
    // glow
    const grd = ctx.createRadialGradient(px, py, 0, px, py, CELL * 1.1);
    grd.addColorStop(0, foodType.glow);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(px, py, CELL * 1.1, 0, Math.PI * 2); ctx.fill();
    // emoji / symbol
    ctx.font = `${CELL * 0.75}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(foodType.emoji, px, py + 1);
    // label
    ctx.font = `300 8px 'DM Mono', monospace`;
    ctx.fillStyle = foodType.color;
    ctx.fillText(foodType.label, px, py + CELL * 0.92);
  }

  function drawSnake() {
    snake.forEach((seg, i) => {
      const px = seg.x * CELL, py = seg.y * CELL;
      const isHead = i === 0;
      const pad = isHead ? 1 : 2;
      const size = CELL - pad * 2;
      const bx = px + pad, by = py + pad;

      if (isHead) {
        // head glow
        const grd = ctx.createRadialGradient(px+CELL/2, py+CELL/2, 0, px+CELL/2, py+CELL/2, CELL);
        grd.addColorStop(0, 'rgba(200,169,126,0.25)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(px+CELL/2, py+CELL/2, CELL, 0, Math.PI*2); ctx.fill();
        // head
        ctx.fillStyle = C.snakeHead;
        ctx.beginPath();
        ctx.roundRect(bx, by, size, size, 3);
        ctx.fill();
        // eyes
        const eyeOff = dir.x !== 0 ? CELL * 0.22 : 0;
        const eyeOffY = dir.y !== 0 ? CELL * 0.22 : 0;
        ctx.fillStyle = C.bg;
        ctx.beginPath(); ctx.arc(px + CELL/2 - eyeOff + dir.x*2, py + CELL/2 - eyeOffY - 2 + dir.y*2, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + CELL/2 + eyeOff + dir.x*2, py + CELL/2 + eyeOffY + 2 + dir.y*2, 1.5, 0, Math.PI*2); ctx.fill();
      } else {
        const alpha = Math.max(0.25, 1 - i / (snake.length + 2));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i < 3 ? C.snakeBody : C.snakeSeg;
        ctx.beginPath();
        ctx.roundRect(bx, by, size, size, 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.05;
      p.alpha -= 0.04;
    });
    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.alpha > 0);
  }

  let lastTime = 0;
  const SPEED = 140; // ms per step

  function frame(ts) {
    if (!running) return;
    drawBg(); drawFood(); drawSnake(); drawParticles();
    if (ts - lastTime > SPEED) { step(); lastTime = ts; }
    requestAnimationFrame(frame);
  }

  function startGame() {
    init();
    overlay.classList.add('hidden');
    running = true; dead = false;
    requestAnimationFrame(frame);
  }

  function endGame() {
    running = false; dead = true;
    overlayTitle.textContent = score > 0 ? `${score} pts` : 'Game Over';
    overlaySub.textContent = score > 5 ? '🌌 incrível!' : 'tenta outra vez';
    overlayBtn.textContent = '↺ Jogar de novo';
    overlay.classList.remove('hidden');
  }

  overlayBtn.addEventListener('click', startGame);

  // keys
  const KEY_MAP = {
    ArrowUp:    { x: 0, y:-1 }, w: { x: 0, y:-1 }, W: { x: 0, y:-1 },
    ArrowDown:  { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft:  { x:-1, y: 0 }, a: { x:-1, y: 0 }, A: { x:-1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  };
  document.addEventListener('keydown', e => {
    const d = KEY_MAP[e.key];
    if (d && running) {
      if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
  });

  // touch swipe
  let tStart = null;
  canvas.addEventListener('touchstart', e => { tStart = e.touches[0]; }, { passive: true });
  canvas.addEventListener('touchend', e => {
    if (!tStart || !running) return;
    const dx = e.changedTouches[0].clientX - tStart.clientX;
    const dy = e.changedTouches[0].clientY - tStart.clientY;
    if (Math.abs(dx) > Math.abs(dy)) {
      const d = dx > 0 ? { x:1,y:0 } : { x:-1,y:0 };
      if (d.x !== -dir.x) nextDir = d;
    } else {
      const d = dy > 0 ? { x:0,y:1 } : { x:0,y:-1 };
      if (d.y !== -dir.y) nextDir = d;
    }
    tStart = null;
  }, { passive: true });

  // initial draw
  drawBg();
})();

/* Scroll reveal */
const revObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 55);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* Carousel */
const track = document.getElementById('carouselTrack');
const dotsEl = document.getElementById('carouselDots');
const counter = document.getElementById('carouselCounter');
const total = track.querySelectorAll('.carousel-slide').length;
let cur = 0, timer;
for (let i = 0; i < total; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.addEventListener('click', () => goTo(i));
  dotsEl.appendChild(d);
}
function goTo(n) {
  cur = ((n % total) + total) % total;
  track.style.transform = `translateX(-${cur * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
  counter.textContent = `${String(cur+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
  clearInterval(timer); timer = setInterval(() => goTo(cur + 1), 5000);
}
document.getElementById('prevBtn').addEventListener('click', () => goTo(cur - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(cur + 1));
let tx = 0;
track.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
track.addEventListener('touchend', e => { const dx = tx - e.changedTouches[0].clientX; if (Math.abs(dx) > 50) goTo(dx > 0 ? cur+1 : cur-1); });
timer = setInterval(() => goTo(cur + 1), 5000);