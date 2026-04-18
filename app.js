// ══════════════════════════════════════════
// BETKING — MAIN APP CONTROLLER
// ══════════════════════════════════════════

// ─── PAGE NAVIGATION ───
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');
  const navEl = document.getElementById(`nav-${page}`);
  if (navEl) navEl.classList.add('active');

  // Page-specific actions
  if (page === 'sports') renderSportsList(currentSportFilter);
  if (page === 'my-bets') loadUserBets();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── MODALS ───
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.style.overflow = '';
}

// Click outside to close
document.querySelectorAll('.modal').forEach(modal => {
  modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
    closeModal(modal.id);
  });
});

// Escape key to close modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// ─── TOAST NOTIFICATIONS ───
let toastTimeout = null;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// ─── ODDS FLICKERING (Live simulation) ───
function startOddsFlicker() {
  setInterval(() => {
    document.querySelectorAll('.odds-value').forEach(el => {
      if (Math.random() > 0.93) {
        const current = parseFloat(el.textContent);
        const delta = (Math.random() - 0.5) * 0.1;
        const newVal = Math.max(1.01, current + delta);
        el.textContent = newVal.toFixed(2);

        el.style.color = delta > 0 ? '#00e87a' : '#ff4d6a';
        setTimeout(() => { el.style.color = ''; }, 500);
      }
    });
  }, 2000);
}

// ─── TICKER ANIMATION ───
function initTicker() {
  const tickerMessages = [
    '🎉 Rahul P. just won ₹45,000 on IPL!',
    '🏆 Priya M. hit 8.5x on Crash game!',
    '⚽ Live: Mumbai City vs Mohun Bagan - 1:1',
    '💰 Amit K. won ₹12,000 on Roulette!',
    '🏏 IPL Match starts in 30 mins - Get your bets in!',
    '🔥 Trending: RCB vs DC - 12,000 bets placed!',
  ];

  let idx = 0;
  const tickerEl = document.createElement('div');
  tickerEl.style.cssText = `
    background: rgba(245,197,24,0.05);
    border-bottom: 1px solid rgba(245,197,24,0.1);
    padding: 8px 60px;
    font-size: 13px;
    color: var(--text-dim);
    overflow: hidden;
    white-space: nowrap;
  `;

  const navbar = document.querySelector('.navbar');
  navbar.after(tickerEl);

  function updateTicker() {
    tickerEl.innerHTML = `<span style="color:var(--gold);font-weight:700">LIVE</span> &nbsp; ${tickerMessages[idx]} &nbsp;&nbsp;`;
    idx = (idx + 1) % tickerMessages.length;
  }

  updateTicker();
  setInterval(updateTicker, 4000);
}

// ─── INIT APP ───
window.addEventListener('DOMContentLoaded', async () => {
  // Init Supabase
  initSupabase();

  // Init Auth
  await initAuth();

  // Render home content
  renderFeaturedEvents();
  renderSportsList('cricket');

  // Init casino games
  initCasinoGames();

  // Start live features
  startOddsFlicker();
  initTicker();

  // Hide loader
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 1800);
});

// Prevent number inputs from scrolling
document.querySelectorAll('input[type=number]').forEach(input => {
  input.addEventListener('wheel', e => e.preventDefault());
});
