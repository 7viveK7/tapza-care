/**
 * Currency formatting utilities.
 * All prices in the app are denominated in Indian Rupees (INR, ₹).
 */

/**
 * Format a number as an Indian Rupee string.
 * Examples: 500 → "₹500", 1499 → "₹1,499", 10000 → "₹10,000"
 */
export function formatInr(amount: number): string {
  // Use Intl if available (handles lakh/crore grouping on newer runtimes),
  // fall back to a simple manual formatter that at least adds commas.
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback: ₹ prefix + western thousands comma
    return `₹${amount.toLocaleString("en-US")}`;
  }
}

/**
 * Compact form — used where horizontal space is tight.
 * 500 → "₹500", 1500 → "₹1.5K", 100000 → "₹1L"
 */
export function formatInrCompact(amount: number): string {
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(amount % 100_000 === 0 ? 0 : 1)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `₹${amount}`;
}
