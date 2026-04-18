// ══════════════════════════════════════════
// BETKING — CONFIGURATION
// Replace these with your actual credentials
// ══════════════════════════════════════════

const CONFIG = {
  // ─── SUPABASE ───
  // Get these from: https://app.supabase.com → Your Project → Settings → API
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // ─── RAZORPAY ───
  // Get this from: https://dashboard.razorpay.com → Settings → API Keys
  RAZORPAY_KEY_ID: 'rzp_test_YOUR_KEY_ID',

  // ─── APP SETTINGS ───
  APP_NAME: 'BetKing',
  CURRENCY: 'INR',
  MIN_BET: 10,
  MAX_BET: 100000,
  MIN_DEPOSIT: 100,

  // ─── HOUSE EDGE ───
  // How much edge the house takes (0.05 = 5%)
  HOUSE_EDGE: 0.05,
};

// ══════════════════════════════════════════
// SUPABASE SCHEMA (run this in your Supabase SQL editor):
//
// -- Users wallet table
// CREATE TABLE wallets (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
//   balance DECIMAL(12,2) DEFAULT 0.00,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// -- Bets table
// CREATE TABLE bets (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   type TEXT NOT NULL,         -- 'sports' | 'casino'
//   game TEXT NOT NULL,         -- game name or sport
//   selection TEXT NOT NULL,    -- what they bet on
//   odds DECIMAL(8,2) NOT NULL,
//   stake DECIMAL(12,2) NOT NULL,
//   potential_win DECIMAL(12,2) NOT NULL,
//   status TEXT DEFAULT 'pending',  -- 'pending' | 'won' | 'lost'
//   result TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   settled_at TIMESTAMPTZ
// );
//
// -- Transactions table
// CREATE TABLE transactions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   type TEXT NOT NULL,         -- 'deposit' | 'withdrawal' | 'bet' | 'win'
//   amount DECIMAL(12,2) NOT NULL,
//   reference TEXT,             -- Razorpay payment ID etc
//   status TEXT DEFAULT 'completed',
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// -- RLS Policies (enable Row Level Security)
// ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
// ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
// ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Users can update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);
// CREATE POLICY "Users can insert own wallet" ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
//
// CREATE POLICY "Users can view own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Users can insert own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);
// CREATE POLICY "Users can update own bets" ON bets FOR UPDATE USING (auth.uid() = user_id);
//
// CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
// ══════════════════════════════════════════
