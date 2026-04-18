// ══════════════════════════════════════════
// BETKING — SUPABASE CLIENT
// ══════════════════════════════════════════

let supabaseClient = null;

function initSupabase() {
  if (CONFIG.SUPABASE_URL === 'https://YOUR_PROJECT_ID.supabase.co') {
    console.warn('[BetKing] ⚠️ Supabase not configured. Running in demo mode.');
    return null;
  }
  try {
    supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('[BetKing] ✅ Supabase connected');
    return supabaseClient;
  } catch (err) {
    console.error('[BetKing] Supabase init failed:', err);
    return null;
  }
}

// ─── WALLET HELPERS ───

async function getWallet(userId) {
  if (!supabaseClient) return { balance: demoState.balance };
  const { data, error } = await supabaseClient
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

async function createWallet(userId) {
  if (!supabaseClient) return { balance: 0 };
  const { data, error } = await supabaseClient
    .from('wallets')
    .insert({ user_id: userId, balance: 0 })
    .select()
    .single();
  if (error) return null;
  return data;
}

async function updateBalance(userId, newBalance) {
  if (!supabaseClient) {
    demoState.balance = newBalance;
    return { balance: newBalance };
  }
  const { data, error } = await supabaseClient
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  if (error) return null;
  return data;
}

async function addTransaction(userId, type, amount, reference = '') {
  if (!supabaseClient) {
    demoState.transactions.push({ type, amount, reference, created_at: new Date().toISOString() });
    return;
  }
  await supabaseClient
    .from('transactions')
    .insert({ user_id: userId, type, amount, reference });
}

// ─── BET HELPERS ───

async function saveBet(userId, betData) {
  if (!supabaseClient) {
    const bet = { id: 'demo_' + Date.now(), user_id: userId, ...betData, created_at: new Date().toISOString() };
    demoState.bets.unshift(bet);
    return bet;
  }
  const { data, error } = await supabaseClient
    .from('bets')
    .insert({ user_id: userId, ...betData })
    .select()
    .single();
  if (error) return null;
  return data;
}

async function updateBet(betId, updateData) {
  if (!supabaseClient) {
    const bet = demoState.bets.find(b => b.id === betId);
    if (bet) Object.assign(bet, updateData);
    return bet;
  }
  const { data, error } = await supabaseClient
    .from('bets')
    .update(updateData)
    .eq('id', betId)
    .select()
    .single();
  return data;
}

async function getUserBets(userId) {
  if (!supabaseClient) return demoState.bets;
  const { data, error } = await supabaseClient
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data || [];
}

// ─── DEMO STATE (fallback when Supabase not configured) ───
const demoState = {
  balance: 5000,  // Demo starting balance
  bets: [],
  transactions: [],
};
