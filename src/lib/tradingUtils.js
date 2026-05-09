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

    const numericValues = [
      trade.options_trading_amount,
      trade.required_profit,
      trade.interest,
      trade.actual_profit,
      trade.total_profit,
      trade.percent,
      trade.mf_trading_amount,
      trade.pnl,
      trade.mf_profit
    ];

    const allFieldsPopulated = numericValues.every(
      (value) => value !== null && value !== undefined && value !== ""
    );

    const allFieldsNonZero = numericValues.every(
      (value) => Number(value) !== 0
    );

    return hasTradeDates && allFieldsPopulated && allFieldsNonZero;
    });
    }

    /**
    * Calculate volatility (standard deviation of daily returns)
    * @param {Array} returns - Array of percentage returns
    * @returns {number} Standard deviation
    */
    export function calculateVolatility(returns) {
    if (!returns || returns.length <= 1) return 0;

    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance);
    }

    /**
    * Calculate Sharpe Ratio
    * @param {number} avgReturn - Average return
    * @param {number} stdDev - Standard deviation
    * @param {number} riskFreeRate - Risk-free rate (default 7%)
    * @returns {string} Sharpe Ratio with 2 decimal places
    */
    export function calculateSharpeRatio(avgReturn, stdDev, riskFreeRate = 7) {
    if (!stdDev || stdDev === 0) return "0.00";
    const result = (avgReturn - riskFreeRate) / stdDev;
    return result.toFixed(2);
    }