// ══════════════════════════════════════════
// BETKING — WALLET & RAZORPAY PAYMENTS
// ══════════════════════════════════════════

let currentBalance = 0;

// ─── LOAD WALLET ───
async function loadWallet(userId) {
  let wallet = await getWallet(userId);

  if (!wallet) {
    // Create new wallet
    wallet = await createWallet(userId);
  }

  if (wallet) {
    currentBalance = parseFloat(wallet.balance) || 0;
    updateBalanceUI(currentBalance);
  }
}

function updateBalanceUI(balance) {
  currentBalance = balance;
  document.getElementById('wallet-balance').textContent = formatCurrency(balance);
}

function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ─── DEPOSIT AMOUNT ───
function setAmount(amount) {
  document.getElementById('deposit-amount').value = amount;
  // Highlight active chip
  document.querySelectorAll('.amount-chip').forEach(chip => {
    chip.style.borderColor = '';
    chip.style.color = '';
    if (chip.textContent.includes(amount.toLocaleString('en-IN'))) {
      chip.style.borderColor = 'var(--gold)';
      chip.style.color = 'var(--gold)';
    }
  });
}

// ─── INITIATE RAZORPAY PAYMENT ───
async function initiatePayment() {
  if (!requireAuth()) return;

  const amountInput = document.getElementById('deposit-amount');
  const amount = parseFloat(amountInput.value);

  if (!amount || amount < CONFIG.MIN_DEPOSIT) {
    showToast(`Minimum deposit is ₹${CONFIG.MIN_DEPOSIT}`, 'error');
    return;
  }

  if (CONFIG.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
    // Demo mode - simulate payment
    simulateDemoDeposit(amount);
    return;
  }

  const options = {
    key: CONFIG.RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // Razorpay takes amount in paise
    currency: CONFIG.CURRENCY,
    name: CONFIG.APP_NAME,
    description: 'Wallet Top-up',
    image: '', // Your logo URL
    handler: async function (response) {
      await onPaymentSuccess(response, amount);
    },
    prefill: {
      email: currentUser?.email || '',
      name: currentUser?.user_metadata?.full_name || '',
    },
    theme: {
      color: '#f5c518'
    },
    modal: {
      ondismiss: function() {
        showToast('Payment cancelled.', 'error');
      }
    }
  };

  // In production, you'd create an order from your backend first:
  // const order = await createRazorpayOrder(amount);
  // options.order_id = order.id;

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showToast('Payment failed: ' + response.error.description, 'error');
    });
    rzp.open();
  } catch (err) {
    showToast('Payment gateway not available. Check your Razorpay key.', 'error');
    console.error(err);
  }
}

// ─── PAYMENT SUCCESS ───
async function onPaymentSuccess(response, amount) {
  const newBalance = currentBalance + amount;
  await updateBalance(currentUser.id, newBalance);
  await addTransaction(currentUser.id, 'deposit', amount, response.razorpay_payment_id);
  updateBalanceUI(newBalance);
  closeModal('deposit-modal');
  showToast(`₹${amount.toLocaleString('en-IN')} added to your wallet! 🎉`, 'success');
}

// ─── DEMO DEPOSIT (when Razorpay not configured) ───
function simulateDemoDeposit(amount) {
  // Simulate Razorpay checkout UI delay
  const btn = document.querySelector('.deposit-box .btn-primary');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  setTimeout(async () => {
    btn.textContent = 'Pay with Razorpay';
    btn.disabled = false;

    const newBalance = currentBalance + amount;
    if (currentUser) {
      await updateBalance(currentUser.id, newBalance);
      await addTransaction(currentUser.id, 'deposit', amount, 'demo_' + Date.now());
    }
    updateBalanceUI(newBalance);
    closeModal('deposit-modal');
    showToast(`₹${amount.toLocaleString('en-IN')} added! (Demo Mode) 🎉`, 'success');
  }, 1500);
}

// ─── DEDUCT BALANCE (for bets) ───
async function deductBalance(amount) {
  if (currentBalance < amount) {
    showToast('Insufficient balance. Please deposit more funds.', 'error');
    return false;
  }
  const newBalance = currentBalance - amount;
  if (currentUser) {
    await updateBalance(currentUser.id, newBalance);
    await addTransaction(currentUser.id, 'bet', -amount);
  }
  updateBalanceUI(newBalance);
  return true;
}

// ─── ADD WINNINGS ───
async function addWinnings(amount, description = 'Win') {
  const newBalance = currentBalance + amount;
  if (currentUser) {
    await updateBalance(currentUser.id, newBalance);
    await addTransaction(currentUser.id, 'win', amount);
  }
  updateBalanceUI(newBalance);
  showToast(`🎉 You won ${formatCurrency(amount)}!`, 'success');
}
