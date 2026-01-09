/**
 * CareSync Data Formatting Utilities.
 * Handles display logic for financial and chronological data.
 *
 */

/**
 * Formats numerical values into US Dollar currency strings.
 * Used for consultation fees and Stripe analytics.
 * @param {number} amount - The value to format.
 * @returns {string} - e.g., "$120.00"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Standardizes date presentation across the platform.
 * Used for appointment schedules and lab result timestamps.
 * @param {Date | string} date - The date to format.
 * @param {string} type - 'full', 'short', or 'time'
 * @returns {string} - e.g., "Monday, Jan 12, 2026"
 */
export const formatDate = (date, type = 'full') => {
  const d = new Date(date);
  
  const options = {
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit', hour12: true }
  };

  return new Intl.DateTimeFormat('en-US', options[type] || options.full).format(d);
};

/**
 * Compacts large numbers for dashboard statistics.
 * @param {number} num - The large number to simplify.
 * @returns {string} - e.g., "1.2k"
 */
export const formatCompactNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};