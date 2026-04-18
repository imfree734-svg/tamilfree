// ══════════════════════════════════════════
// BETKING — SPORTS BETTING
// ══════════════════════════════════════════

// ─── MOCK EVENTS DATA ───
const sportsEvents = [
  // CRICKET
  {
    id: 'cr1', sport: 'cricket', league: 'IPL 2025',
    team1: 'Mumbai Indians', team2: 'Chennai Super Kings',
    score1: '145/6', score2: '(14.2 Ov)',
    status: 'live', time: 'LIVE',
    odds: { home: 1.85, draw: null, away: 2.10, options: ['Mumbai Indians', 'Chennai Super Kings'] }
  },
  {
    id: 'cr2', sport: 'cricket', league: 'IPL 2025',
    team1: 'Royal Challengers', team2: 'Delhi Capitals',
    score1: '', score2: '',
    status: 'upcoming', time: 'Today 7:30 PM',
    odds: { home: 1.65, draw: null, away: 2.40, options: ['RCB Win', 'DC Win'] }
  },
  {
    id: 'cr3', sport: 'cricket', league: 'Test Series',
    team1: 'India', team2: 'Australia',
    score1: '287/4', score2: '',
    status: 'live', time: 'LIVE · Day 2',
    odds: { home: 1.55, draw: 3.20, away: 4.50, options: ['India', 'Draw', 'Australia'] }
  },
  {
    id: 'cr4', sport: 'cricket', league: 'T20 World Cup',
    team1: 'Pakistan', team2: 'England',
    score1: '', score2: '',
    status: 'upcoming', time: 'Tomorrow 2:30 PM',
    odds: { home: 2.10, draw: null, away: 1.75, options: ['Pakistan', 'England'] }
  },
  // FOOTBALL
  {
    id: 'fb1', sport: 'football', league: 'Indian Super League',
    team1: 'Mumbai City', team2: 'ATK Mohun Bagan',
    score1: '1', score2: '1',
    status: 'live', time: '67\'',
    odds: { home: 2.20, draw: 3.10, away: 3.50, options: ['1', 'X', '2'] }
  },
  {
    id: 'fb2', sport: 'football', league: 'Premier League',
    team1: 'Arsenal', team2: 'Man City',
    score1: '', score2: '',
    status: 'upcoming', time: 'Today 9:00 PM',
    odds: { home: 2.80, draw: 3.30, away: 2.50, options: ['Arsenal', 'Draw', 'Man City'] }
  },
  {
    id: 'fb3', sport: 'football', league: 'La Liga',
    team1: 'Real Madrid', team2: 'Barcelona',
    score1: '', score2: '',
    status: 'upcoming', time: 'Sunday 10:00 PM',
    odds: { home: 2.10, draw: 3.20, away: 3.60, options: ['Real Madrid', 'Draw', 'Barcelona'] }
  },
  // TENNIS
  {
    id: 'tn1', sport: 'tennis', league: 'ATP Masters',
    team1: 'Novak Djokovic', team2: 'Carlos Alcaraz',
    score1: '6-4, 3', score2: '4, -',
    status: 'live', time: 'LIVE · Set 2',
    odds: { home: 1.45, draw: null, away: 2.80, options: ['Djokovic', 'Alcaraz'] }
  },
  {
    id: 'tn2', sport: 'tennis', league: 'WTA Finals',
    team1: 'Iga Swiatek', team2: 'Aryna Sabalenka',
    score1: '', score2: '',
    status: 'upcoming', time: 'Tomorrow 4:00 PM',
    odds: { home: 1.60, draw: null, away: 2.35, options: ['Swiatek', 'Sabalenka'] }
  },
  // KABADDI
  {
    id: 'kb1', sport: 'kabaddi', league: 'Pro Kabaddi League',
    team1: 'U Mumba', team2: 'Patna Pirates',
    score1: '32', score2: '28',
    status: 'live', time: 'LIVE · Half',
    odds: { home: 1.70, draw: null, away: 2.20, options: ['U Mumba', 'Patna Pirates'] }
  },
  {
    id: 'kb2', sport: 'kabaddi', league: 'Pro Kabaddi League',
    team1: 'Jaipur Pink Panthers', team2: 'Bengal Warriors',
    score1: '', score2: '',
    status: 'upcoming', time: 'Today 8:00 PM',
    odds: { home: 1.90, draw: null, away: 2.00, options: ['Jaipur', 'Bengal'] }
  },
];

let currentSportFilter = 'cricket';
let selectedBet = null;

// ─── RENDER FEATURED EVENTS ───
function renderFeaturedEvents() {
  const container = document.getElementById('featured-events');
  const featured = sportsEvents.filter(e => e.status === 'live').slice(0, 4);

  container.innerHTML = featured.map(event => renderEventCard(event)).join('');
}

function renderEventCard(event) {
  const hasThreeWay = event.odds.draw !== null;
  const oddsHTML = hasThreeWay
    ? `
      <div class="odds-btn" onclick="openBetSlip('${event.id}', '${event.odds.options[0]}', ${event.odds.home}, '${event.team1} vs ${event.team2}')">
        <span class="odds-label">${event.odds.options[0]}</span>
        <span class="odds-value">${event.odds.home}</span>
      </div>
      <div class="odds-btn" onclick="openBetSlip('${event.id}', 'Draw', ${event.odds.draw}, '${event.team1} vs ${event.team2}')">
        <span class="odds-label">Draw</span>
        <span class="odds-value">${event.odds.draw}</span>
      </div>
      <div class="odds-btn" onclick="openBetSlip('${event.id}', '${event.odds.options[1]}', ${event.odds.away}, '${event.team1} vs ${event.team2}')">
        <span class="odds-label">${event.odds.options[1]}</span>
        <span class="odds-value">${event.odds.away}</span>
      </div>
    `
    : `
      <div class="odds-btn" onclick="openBetSlip('${event.id}', '${event.odds.options[0]}', ${event.odds.home}, '${event.team1} vs ${event.team2}')">
        <span class="odds-label">${event.odds.options[0]}</span>
        <span class="odds-value">${event.odds.home}</span>
      </div>
      <div class="odds-btn" onclick="openBetSlip('${event.id}', '${event.odds.options[1]}', ${event.odds.away}, '${event.team1} vs ${event.team2}')">
        <span class="odds-label">${event.odds.options[1]}</span>
        <span class="odds-value">${event.odds.away}</span>
      </div>
    `;

  return `
    <div class="event-card">
      <div class="event-card-header">
        <span class="event-league">${event.league}</span>
        ${event.status === 'live' ? '<span class="event-live-badge">● LIVE</span>' : `<span style="font-size:12px;color:var(--text-muted)">${event.time}</span>`}
      </div>
      <div class="event-teams">
        <div class="event-team">
          <div class="event-team-name">${event.team1}</div>
          ${event.score1 ? `<div class="event-score">${event.score1}</div>` : ''}
        </div>
        <div class="event-vs">VS</div>
        <div class="event-team">
          <div class="event-team-name">${event.team2}</div>
          ${event.score2 ? `<div class="event-score">${event.score2}</div>` : ''}
        </div>
      </div>
      <div class="event-odds">${oddsHTML}</div>
    </div>
  `;
}

// ─── RENDER SPORTS LIST ───
function renderSportsList(sport) {
  const container = document.getElementById('sports-events');
  const events = sport === 'all' ? sportsEvents : sportsEvents.filter(e => e.sport === sport);

  if (!events.length) {
    container.innerHTML = '<div class="empty-state"><p>No events available for this sport.</p></div>';
    return;
  }

  container.innerHTML = events.map(event => {
    const hasThreeWay = event.odds.draw !== null;
    return `
      <div class="sport-event-row">
        <div class="sport-event-info">
          <span class="sport-event-league">${event.league}</span>
          <span class="sport-event-teams">${event.team1} vs ${event.team2}</span>
          <span class="sport-event-time">${event.status === 'live' ? '🔴 LIVE' : '📅 ' + event.time}</span>
        </div>
        <div class="sport-event-odds">
          <div class="odds-btn" onclick="openBetSlip('${event.id}', '${event.odds.options[0]}', ${event.odds.home}, '${event.team1} vs ${event.team2}')">
            <span class="odds-label">${event.odds.options[0]}</span>
            <span class="odds-value">${event.odds.home}</span>
          </div>
          ${hasThreeWay ? `
          <div class="odds-btn" onclick="openBetSlip('${event.id}', 'Draw', ${event.odds.draw}, '${event.team1} vs ${event.team2}')">
            <span class="odds-label">Draw</span>
            <span class="odds-value">${event.odds.draw}</span>
          </div>` : ''}
          <div class="odds-btn" onclick="openBetSlip('${event.id}', '${event.odds.options[1]}', ${event.odds.away}, '${event.team1} vs ${event.team2}')">
            <span class="odds-label">${event.odds.options[1]}</span>
            <span class="odds-value">${event.odds.away}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── FILTER SPORTS ───
function filterSport(sport, btn) {
  document.querySelectorAll('.sport-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentSportFilter = sport;
  renderSportsList(sport);
}

// ─── OPEN BET SLIP ───
function openBetSlip(eventId, selection, odds, matchName) {
  if (!requireAuth()) return;

  selectedBet = { eventId, selection, odds, matchName, type: 'sports', game: 'sports' };

  document.getElementById('bet-details').innerHTML = `
    <div style="margin-bottom:8px;font-size:12px;color:var(--text-muted)">Match</div>
    <div style="font-weight:700;margin-bottom:12px">${matchName}</div>
    <div style="display:flex;justify-content:space-between">
      <span style="color:var(--text-muted);font-size:14px">Selection</span>
      <strong style="color:var(--gold)">${selection}</strong>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px">
      <span style="color:var(--text-muted);font-size:14px">Odds</span>
      <strong style="font-family:var(--font-mono)">${odds}x</strong>
    </div>
  `;

  document.getElementById('stake-input').value = '';
  document.getElementById('potential-win').textContent = '₹0.00';
  document.getElementById('bet-error').textContent = '';

  // Live update potential win
  document.getElementById('stake-input').oninput = function() {
    const stake = parseFloat(this.value) || 0;
    document.getElementById('potential-win').textContent = formatCurrency(stake * odds);
  };

  openModal('betslip-modal');
}

// ─── PLACE BET ───
async function placeBet() {
  if (!requireAuth()) return;
  if (!selectedBet) return;

  const stakeInput = document.getElementById('stake-input');
  const stake = parseFloat(stakeInput.value);
  const errEl = document.getElementById('bet-error');
  errEl.textContent = '';

  if (!stake || stake < CONFIG.MIN_BET) {
    errEl.textContent = `Minimum bet is ₹${CONFIG.MIN_BET}`;
    return;
  }
  if (stake > CONFIG.MAX_BET) {
    errEl.textContent = `Maximum bet is ₹${CONFIG.MAX_BET.toLocaleString('en-IN')}`;
    return;
  }

  const potentialWin = stake * selectedBet.odds;
  const success = await deductBalance(stake);
  if (!success) return;

  const betRecord = await saveBet(currentUser.id, {
    type: selectedBet.type || 'sports',
    game: selectedBet.game || 'sports',
    selection: `${selectedBet.matchName} — ${selectedBet.selection}`,
    odds: selectedBet.odds,
    stake,
    potential_win: potentialWin,
    status: 'pending',
  });

  closeModal('betslip-modal');
  showToast(`Bet placed! ₹${stake} on ${selectedBet.selection} @ ${selectedBet.odds}x`, 'success');

  // Simulate result after 5 seconds for demo
  if (betRecord) {
    setTimeout(() => simulateBetResult(betRecord, potentialWin), 5000);
  }

  // Refresh bets if on My Bets page
  if (document.getElementById('page-my-bets').classList.contains('active')) {
    loadUserBets();
  }
}

// ─── SIMULATE BET RESULT (Demo) ───
async function simulateBetResult(bet, potentialWin) {
  const won = Math.random() > 0.5; // 50% chance for demo
  const status = won ? 'won' : 'lost';

  await updateBet(bet.id, {
    status,
    result: won ? 'Win' : 'Loss',
    settled_at: new Date().toISOString()
  });

  if (won) {
    await addWinnings(potentialWin);
    showToast(`🎉 Your bet on "${bet.selection?.split('—')[1]?.trim()}" WON! +${formatCurrency(potentialWin)}`, 'success');
  } else {
    showToast(`Your bet lost. Better luck next time!`, 'error');
  }

  // Refresh bets list if visible
  if (document.getElementById('page-my-bets').classList.contains('active')) {
    loadUserBets();
  }
}
