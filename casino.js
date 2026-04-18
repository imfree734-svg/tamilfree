// ══════════════════════════════════════════
// BETKING — CASINO GAMES
// ══════════════════════════════════════════

// ══════════ DICE GAME ══════════
let diceChoice = 'under';
let diceTarget = 50;

function updateDiceTarget(val) {
  diceTarget = parseInt(val);
  document.getElementById('dice-target-val').textContent = val;
  const underOdds = calcDiceOdds('under', val);
  const overOdds = calcDiceOdds('over', val);
  document.getElementById('dice-under-odds').textContent = underOdds + 'x';
  document.getElementById('dice-over-odds').textContent = overOdds + 'x';
}

function calcDiceOdds(side, target) {
  const t = parseInt(target);
  const chance = side === 'under' ? t / 100 : (100 - t) / 100;
  const odds = (1 / chance) * (1 - CONFIG.HOUSE_EDGE);
  return Math.max(1.01, Math.round(odds * 100) / 100).toFixed(2);
}

function selectDiceSide(side) {
  diceChoice = side;
  document.getElementById('dice-under-btn').classList.toggle('active', side === 'under');
  document.getElementById('dice-over-btn').classList.toggle('active', side === 'over');
}

async function playDice() {
  if (!requireAuth()) return;

  const stake = parseFloat(document.getElementById('dice-stake').value);
  if (!stake || stake < CONFIG.MIN_BET) { showToast(`Min bet is ₹${CONFIG.MIN_BET}`, 'error'); return; }

  const odds = parseFloat(calcDiceOdds(diceChoice, diceTarget));
  const success = await deductBalance(stake);
  if (!success) return;

  const roll = Math.floor(Math.random() * 100) + 1;
  const won = (diceChoice === 'under' && roll < diceTarget) || (diceChoice === 'over' && roll > diceTarget);

  const display = document.getElementById('dice-display');
  display.textContent = '?';
  display.className = 'dice-display';

  // Animate
  let counter = 0;
  const interval = setInterval(() => {
    display.textContent = Math.floor(Math.random() * 100) + 1;
    counter++;
    if (counter >= 10) {
      clearInterval(interval);
      display.textContent = roll;
      display.classList.add(won ? 'win' : 'lose');

      const bet = {
        id: 'demo_' + Date.now(),
        type: 'casino', game: 'Dice',
        selection: `${diceChoice === 'under' ? 'Under' : 'Over'} ${diceTarget}`,
        odds, stake, potential_win: stake * odds, status: won ? 'won' : 'lost'
      };

      if (won) {
        addWinnings(stake * odds);
      } else {
        showToast(`Rolled ${roll}. Better luck next time!`, 'error');
      }

      saveBet(currentUser?.id || 'demo', { ...bet, settled_at: new Date().toISOString() });
    }
  }, 80);
}

// ══════════ COIN FLIP ══════════
let coinChoice = 'heads';

function selectCoin(side) {
  coinChoice = side;
  document.getElementById('heads-btn').classList.toggle('active', side === 'heads');
  document.getElementById('tails-btn').classList.toggle('active', side === 'tails');
}

async function playCoin() {
  if (!requireAuth()) return;

  const stake = parseFloat(document.getElementById('coin-stake').value);
  if (!stake || stake < CONFIG.MIN_BET) { showToast(`Min bet is ₹${CONFIG.MIN_BET}`, 'error'); return; }

  const odds = 2.00 * (1 - CONFIG.HOUSE_EDGE / 2);
  const success = await deductBalance(stake);
  if (!success) return;

  const result = Math.random() > 0.5 ? 'heads' : 'tails';
  const won = result === coinChoice;
  const coin = document.getElementById('coin-elem');

  coin.className = 'coin flip';
  setTimeout(() => {
    coin.className = 'coin';
    coin.style.transform = result === 'tails' ? 'rotateY(180deg)' : 'rotateY(0deg)';

    if (won) {
      addWinnings(stake * odds);
    } else {
      showToast(`It was ${result}! You lost.`, 'error');
    }

    saveBet(currentUser?.id || 'demo', {
      type: 'casino', game: 'Coin Flip',
      selection: coinChoice,
      odds, stake, potential_win: stake * odds,
      status: won ? 'won' : 'lost',
      settled_at: new Date().toISOString()
    });
  }, 1000);
}

// ══════════ CRASH GAME ══════════
let crashState = 'idle'; // idle | running | crashed
let crashMultiplier = 1.0;
let crashAnimId = null;
let crashCanvas, crashCtx;
let crashPoints = [];
let crashBetStake = 0;
let crashCrashedAt = 1.0;

function initCrashGame() {
  crashCanvas = document.getElementById('crash-canvas');
  crashCtx = crashCanvas.getContext('2d');
  drawCrashChart();
}

function drawCrashChart() {
  if (!crashCtx) return;
  const w = crashCanvas.width;
  const h = crashCanvas.height;
  crashCtx.clearRect(0, 0, w, h);

  // Background
  crashCtx.fillStyle = '#0f1623';
  crashCtx.fillRect(0, 0, w, h);

  // Grid
  crashCtx.strokeStyle = 'rgba(255,255,255,0.04)';
  crashCtx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    crashCtx.beginPath();
    crashCtx.moveTo(0, (h / 5) * i);
    crashCtx.lineTo(w, (h / 5) * i);
    crashCtx.stroke();
  }

  if (crashPoints.length < 2) return;

  // Scale
  const maxMult = Math.max(...crashPoints.map(p => p.y), 2);
  const toX = (i) => (i / (crashPoints.length - 1)) * (w - 20) + 10;
  const toY = (m) => h - ((m - 1) / (maxMult - 1)) * (h - 20) - 10;

  // Gradient fill
  const grad = crashCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, crashState === 'crashed' ? 'rgba(255,77,106,0.3)' : 'rgba(0,232,122,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  crashCtx.beginPath();
  crashCtx.moveTo(toX(0), h);
  crashPoints.forEach((p, i) => crashCtx.lineTo(toX(i), toY(p.y)));
  crashCtx.lineTo(toX(crashPoints.length - 1), h);
  crashCtx.closePath();
  crashCtx.fillStyle = grad;
  crashCtx.fill();

  // Line
  crashCtx.beginPath();
  crashCtx.strokeStyle = crashState === 'crashed' ? '#ff4d6a' : '#00e87a';
  crashCtx.lineWidth = 2.5;
  crashPoints.forEach((p, i) => {
    if (i === 0) crashCtx.moveTo(toX(i), toY(p.y));
    else crashCtx.lineTo(toX(i), toY(p.y));
  });
  crashCtx.stroke();
}

async function playCrash() {
  if (!requireAuth()) return;
  if (crashState === 'running') { showToast('Game already running!', 'error'); return; }

  const stake = parseFloat(document.getElementById('crash-stake').value);
  if (!stake || stake < CONFIG.MIN_BET) { showToast(`Min bet is ₹${CONFIG.MIN_BET}`, 'error'); return; }
  const autoCashout = parseFloat(document.getElementById('crash-auto-cashout').value) || null;

  const success = await deductBalance(stake);
  if (!success) return;

  crashBetStake = stake;
  crashState = 'running';
  crashMultiplier = 1.0;
  crashPoints = [{ y: 1 }];

  document.getElementById('crash-bet-btn').classList.add('hidden');
  document.getElementById('crash-cashout-btn').classList.remove('hidden');

  const multEl = document.getElementById('crash-multiplier');
  multEl.className = 'crash-multiplier';

  // Generate random crash point (exponential distribution)
  crashCrashedAt = generateCrashPoint();

  let startTime = performance.now();
  function animate(now) {
    const elapsed = (now - startTime) / 1000;
    crashMultiplier = Math.pow(Math.E, 0.2 * elapsed);
    crashPoints.push({ y: crashMultiplier });

    multEl.textContent = crashMultiplier.toFixed(2) + 'x';
    drawCrashChart();

    // Auto cashout
    if (autoCashout && crashMultiplier >= autoCashout) {
      cashoutCrash();
      return;
    }

    if (crashMultiplier >= crashCrashedAt) {
      // CRASH!
      crashState = 'crashed';
      multEl.className = 'crash-multiplier crashed';
      multEl.textContent = 'CRASH ' + crashCrashedAt.toFixed(2) + 'x';
      drawCrashChart();

      document.getElementById('crash-bet-btn').classList.remove('hidden');
      document.getElementById('crash-cashout-btn').classList.add('hidden');

      addCrashHistory(crashCrashedAt, false);
      showToast(`Crashed at ${crashCrashedAt.toFixed(2)}x! You lost ₹${stake}`, 'error');

      saveBet(currentUser?.id || 'demo', {
        type: 'casino', game: 'Crash',
        selection: `Bet @ 1.00x, Crashed @ ${crashCrashedAt.toFixed(2)}x`,
        odds: crashCrashedAt, stake, potential_win: stake * crashCrashedAt,
        status: 'lost', settled_at: new Date().toISOString()
      });

      setTimeout(() => {
        crashState = 'idle';
        crashMultiplier = 1.0;
        crashPoints = [];
        multEl.className = 'crash-multiplier';
        multEl.textContent = '1.00x';
        drawCrashChart();
      }, 3000);
      return;
    }

    crashAnimId = requestAnimationFrame(animate);
  }

  crashAnimId = requestAnimationFrame(animate);
}

async function cashoutCrash() {
  if (crashState !== 'running') return;
  cancelAnimationFrame(crashAnimId);

  const winnings = crashBetStake * crashMultiplier;
  crashState = 'idle';

  document.getElementById('crash-bet-btn').classList.remove('hidden');
  document.getElementById('crash-cashout-btn').classList.add('hidden');

  addCrashHistory(crashMultiplier, true);
  await addWinnings(winnings);

  saveBet(currentUser?.id || 'demo', {
    type: 'casino', game: 'Crash',
    selection: `Cashed out @ ${crashMultiplier.toFixed(2)}x`,
    odds: crashMultiplier, stake: crashBetStake, potential_win: winnings,
    status: 'won', settled_at: new Date().toISOString()
  });

  setTimeout(() => {
    crashState = 'idle';
    crashMultiplier = 1.0;
    crashPoints = [];
    document.getElementById('crash-multiplier').className = 'crash-multiplier';
    document.getElementById('crash-multiplier').textContent = '1.00x';
    drawCrashChart();
  }, 2000);
}

function generateCrashPoint() {
  // House edge built in — crash more often near 1x
  const r = Math.random();
  if (r < 0.33) return 1 + Math.random() * 0.5; // 33% chance crash below 1.5x
  if (r < 0.60) return 1.5 + Math.random() * 1.5; // 27% chance 1.5-3x
  if (r < 0.80) return 3 + Math.random() * 5;     // 20% chance 3-8x
  if (r < 0.95) return 8 + Math.random() * 12;    // 15% chance 8-20x
  return 20 + Math.random() * 80;                  // 5% chance 20-100x
}

function addCrashHistory(multiplier, cashed) {
  const history = document.getElementById('crash-history');
  const pill = document.createElement('span');
  pill.className = 'crash-pill ' + (multiplier >= 3 ? 'high' : multiplier >= 1.5 ? 'med' : 'low');
  pill.textContent = multiplier.toFixed(2) + 'x';
  history.insertBefore(pill, history.firstChild);
  // Keep last 10
  while (history.children.length > 10) history.removeChild(history.lastChild);
}

// ══════════ ROULETTE ══════════
const rouletteNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const rouletteColors = {
  0: 'green',
  1:'red',2:'black',3:'red',4:'black',5:'red',6:'black',7:'red',8:'black',9:'red',10:'black',
  11:'black',12:'red',13:'black',14:'red',15:'black',16:'red',17:'black',18:'red',19:'red',20:'black',
  21:'red',22:'black',23:'red',24:'black',25:'red',26:'black',27:'red',28:'black',29:'black',30:'red',
  31:'black',32:'red',33:'black',34:'red',35:'black',36:'red'
};

const rouletteBets = [
  { label: '🔴 Red', key: 'red', odds: 2.0 },
  { label: '⚫ Black', key: 'black', odds: 2.0 },
  { label: '🟢 Zero', key: 'zero', odds: 36.0 },
  { label: '1-18 Low', key: 'low', odds: 2.0 },
  { label: '19-36 High', key: 'high', odds: 2.0 },
  { label: 'Odd', key: 'odd', odds: 2.0 },
  { label: 'Even', key: 'even', odds: 2.0 },
  { label: '1st 12', key: 'first12', odds: 3.0 },
  { label: '2nd 12', key: 'second12', odds: 3.0 },
];

let rouletteSelection = null;
let rouletteCanvas, rouletteCtx;
let rouletteAngle = 0;
let rouletteSpinning = false;

function initRoulette() {
  rouletteCanvas = document.getElementById('roulette-canvas');
  rouletteCtx = rouletteCanvas.getContext('2d');
  drawRouletteWheel(0);
  renderRouletteBets();
}

function renderRouletteBets() {
  const container = document.getElementById('roulette-bets');
  container.innerHTML = rouletteBets.map(bet => `
    <button class="roulette-bet-btn ${bet.key === 'red' ? 'red-bet' : bet.key === 'black' ? 'black-bet' : bet.key === 'zero' ? 'green-bet' : ''}"
      id="rb-${bet.key}"
      onclick="selectRouletteBet('${bet.key}', this)">
      ${bet.label}<br/><span style="font-size:10px;color:var(--text-muted)">${bet.odds}x</span>
    </button>
  `).join('');
}

function selectRouletteBet(key, btn) {
  rouletteSelection = key;
  document.querySelectorAll('.roulette-bet-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function drawRouletteWheel(angle) {
  if (!rouletteCtx) return;
  const canvas = rouletteCanvas;
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 4;

  rouletteCtx.clearRect(0, 0, w, h);

  const segCount = rouletteNumbers.length;
  const segAngle = (2 * Math.PI) / segCount;

  rouletteNumbers.forEach((num, i) => {
    const startAngle = angle + i * segAngle;
    const endAngle = startAngle + segAngle;
    const color = rouletteColors[num];

    rouletteCtx.beginPath();
    rouletteCtx.moveTo(cx, cy);
    rouletteCtx.arc(cx, cy, r, startAngle, endAngle);
    rouletteCtx.closePath();
    rouletteCtx.fillStyle = color === 'red' ? '#c0392b' : color === 'black' ? '#1a1a2e' : '#1a7a34';
    rouletteCtx.fill();
    rouletteCtx.strokeStyle = '#f5c518';
    rouletteCtx.lineWidth = 1;
    rouletteCtx.stroke();

    // Number text
    rouletteCtx.save();
    rouletteCtx.translate(cx, cy);
    rouletteCtx.rotate(startAngle + segAngle / 2);
    rouletteCtx.translate(r * 0.72, 0);
    rouletteCtx.rotate(Math.PI / 2);
    rouletteCtx.fillStyle = '#fff';
    rouletteCtx.font = 'bold 9px DM Sans';
    rouletteCtx.textAlign = 'center';
    rouletteCtx.fillText(num, 0, 3);
    rouletteCtx.restore();
  });

  // Center
  rouletteCtx.beginPath();
  rouletteCtx.arc(cx, cy, 18, 0, 2 * Math.PI);
  rouletteCtx.fillStyle = '#f5c518';
  rouletteCtx.fill();
}

async function playRoulette() {
  if (!requireAuth()) return;
  if (rouletteSpinning) return;
  if (!rouletteSelection) { showToast('Please select a bet type', 'error'); return; }

  const stake = parseFloat(document.getElementById('roulette-stake').value);
  if (!stake || stake < CONFIG.MIN_BET) { showToast(`Min bet is ₹${CONFIG.MIN_BET}`, 'error'); return; }

  const betDef = rouletteBets.find(b => b.key === rouletteSelection);
  const success = await deductBalance(stake);
  if (!success) return;

  rouletteSpinning = true;
  const resultNum = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
  const resultIdx = rouletteNumbers.indexOf(resultNum);

  // Target angle so result number is at top (pointing arrow)
  const segAngle = (2 * Math.PI) / rouletteNumbers.length;
  const targetAngle = -(resultIdx * segAngle) - segAngle / 2 - Math.PI / 2;
  const spins = 5 * 2 * Math.PI + targetAngle;

  let startTime = null;
  const duration = 3500;
  const startAngle = rouletteAngle;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animate(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    rouletteAngle = startAngle + spins * easeOut(t);
    drawRouletteWheel(rouletteAngle);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      rouletteSpinning = false;
      const color = rouletteColors[resultNum];
      const won = checkRouletteWin(rouletteSelection, resultNum, color);
      const resultEl = document.getElementById('roulette-result');
      resultEl.textContent = resultNum;
      resultEl.style.color = color === 'red' ? '#ff4d6a' : color === 'green' ? '#00e87a' : '#e8eaf2';

      if (won) {
        addWinnings(stake * betDef.odds);
      } else {
        showToast(`Result: ${resultNum} (${color}). You lost!`, 'error');
      }

      saveBet(currentUser?.id || 'demo', {
        type: 'casino', game: 'Roulette',
        selection: betDef.label,
        odds: betDef.odds, stake, potential_win: stake * betDef.odds,
        status: won ? 'won' : 'lost',
        settled_at: new Date().toISOString()
      });
    }
  }

  requestAnimationFrame(animate);
}

function checkRouletteWin(selection, num, color) {
  switch (selection) {
    case 'red': return color === 'red';
    case 'black': return color === 'black';
    case 'zero': return num === 0;
    case 'low': return num >= 1 && num <= 18;
    case 'high': return num >= 19 && num <= 36;
    case 'odd': return num !== 0 && num % 2 !== 0;
    case 'even': return num !== 0 && num % 2 === 0;
    case 'first12': return num >= 1 && num <= 12;
    case 'second12': return num >= 13 && num <= 24;
    default: return false;
  }
}

// ─── INIT ALL CASINO GAMES ───
function initCasinoGames() {
  initCrashGame();
  initRoulette();
}
