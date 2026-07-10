function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value) {
  return Math.round(toNumber(value, 0) * 100) / 100;
}

function calculateQuote(items, taxRate) {
  const normalizedTaxRate = toNumber(taxRate, 1);
  const rows = (items || []).map((item) => {
    const quantity = Math.max(1, toNumber(item.quantity, 1));
    const amount = money(item.dealerPrice * quantity);
    return Object.assign({}, item, {
      quantity,
      amount
    });
  });
  const subtotal = money(rows.reduce((sum, item) => sum + item.amount, 0));
  const tax = money(subtotal * normalizedTaxRate / 100);
  const total = money(subtotal + tax);

  return {
    rows,
    subtotal,
    taxRate: normalizedTaxRate,
    tax,
    total
  };
}

module.exports = {
  calculateQuote,
  money
};
