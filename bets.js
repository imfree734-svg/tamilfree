// ══════════════════════════════════════════
// BETKING — MY BETS
// ══════════════════════════════════════════

let allBets = [];
let currentBetFilter = 'all';

async function loadUserBets() {
  if (!currentUser) {
    document.getElementById('bets-list').innerHTML = `
      <div class="empty-state">
        <p>Please <a href="#" onclick="openModal('auth-modal')">login</a> to view your bets.</p>
      </div>`;
    return;
  }

  allBets = await getUserBets(currentUser.id);
  renderBets(currentBetFilter);
}

function renderBets(filter) {
  const container = document.getElementById('bets-list');
  const filtered = filter === 'all' ? allBets : allBets.filter(b => b.status === filter);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${filter === 'all' ? 'No bets yet.' : `No ${filter} bets.`} <a href="#" onclick="showPage('sports')">Start betting!</a></p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(bet => {
    const date = new Date(bet.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const winAmount = bet.status === 'won'
      ? `<span style="color:var(--green);font-family:var(--font-mono)">+${formatCurrency(bet.potential_win)}</span>`
      : bet.status === 'lost'
      ? `<span style="color:var(--red);font-family:var(--font-mono)">-${formatCurrency(bet.stake)}</span>`
      : `<span style="color:var(--gold);font-family:var(--font-mono)">${formatCurrency(bet.potential_win)}</span>`;

    return `
      <div class="bet-row ${bet.status}">
        <div class="bet-row-info">
          <div class="bet-row-title">${bet.selection || 'Unknown'}</div>
          <div class="bet-row-sub">${bet.game} · ${date} · Odds: ${parseFloat(bet.odds).toFixed(2)}x</div>
        </div>
        <div class="bet-row-meta">
          <div class="bet-stake">₹${parseFloat(bet.stake).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="bet-status ${bet.status}">${bet.status.toUpperCase()}</div>
          <div style="margin-top:4px;font-size:13px">${winAmount}</div>
        </div>
      </div>
    `;
  }).join('');
}

function filterBets(filter, btn) {
  currentBetFilter = filter;
  document.querySelectorAll('.bets-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBets(filter);
}
