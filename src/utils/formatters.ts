/**
 * Formats a number as Colombian Peso (COP) currency.
 * Example: 65000 → "$65.000"
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Masks a card number showing only the last 4 digits.
 * Example: "1234567890123456" → "•••• •••• •••• 3456"
 */
export function maskCardNumber(number: string): string {
  const digits = number.replace(/\s/g, '');
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

/**
 * Generates a pseudo-random transaction ID.
 * Example: "txn-1718400000000-a3b2c1d"
 */
export function generateId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
