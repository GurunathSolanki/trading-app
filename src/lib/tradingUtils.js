/**
 * Calculate required profit for options trading
 * Formula: (options_amount * 16 * days) / (100 * 365)
 * @param {string} entry_date - Entry date in YYYY-MM-DD format
 * @param {string} exit_date - Exit date in YYYY-MM-DD format
 * @param {number} options_trading_amount - Amount invested in options
 * @returns {number} Required profit rounded to integer
 */
export function calculateRequiredProfit(entry_date, exit_date, options_trading_amount) {
  if (!entry_date || !exit_date || !options_trading_amount) return "";

  const start = new Date(entry_date);
  const end = new Date(exit_date);

  // Difference in days
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const result = (options_trading_amount * 16 * diffDays) / (100 * 365);

  return Math.round(result); // integer
}

/**
 * Calculate annualized percentage return
 * Formula: (profit * 365 * 100) / (days * amount)
 * @param {number} profit - Total profit
 * @param {string} entry_date - Entry date
 * @param {string} exit_date - Exit date
 * @param {number} amount - Trading amount
 * @returns {string} Percentage with 2 decimal places
 */
export function calculateAnnualizedPercent(profit, entry_date, exit_date, amount) {
  if (!entry_date || !exit_date || !amount || amount === 0) return "0.00";

  const start = new Date(entry_date);
  const end = new Date(exit_date);
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 0) return "0.00";

  const result = (profit * 365 * 100) / (diffDays * amount);
  return result.toFixed(2);
}

/**
 * Get complete trades (trades with all required data populated)
 * @param {Array} trades - Array of trade objects
 * @returns {Array} Filtered array of complete trades
 */
export function getCompleteTrades(trades) {
  return trades.filter(trade => {
    // A trade is complete if it has ALL data populated:
    // - Trade dates (entry_date, exit_date)
    // - Options data (options_trading_amount, interest, actual_profit)
    // - MF data (mf_trading_amount, pnl)
    // All values should be non-null and non-empty strings
    const hasTradeDates = trade.entry_date && trade.exit_date;

    const hasOptionsData = trade.options_trading_amount !== null &&
                          trade.options_trading_amount !== "" &&
                          trade.interest !== null &&
                          trade.interest !== "" &&
                          trade.actual_profit !== null &&
                          trade.actual_profit !== "";

    const hasMFData = trade.mf_trading_amount !== null &&
                     trade.mf_trading_amount !== "" &&
                     trade.pnl !== null &&
                     trade.pnl !== "";

    return hasTradeDates && hasOptionsData && hasMFData;
  });
}