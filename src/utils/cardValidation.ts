// ── Card type ─────────────────────────────────────────────────────────────────

export type CardType = 'visa' | 'mastercard' | null;

// ── Luhn algorithm ────────────────────────────────────────────────────────────

/**
 * Validates a credit card number using the Luhn algorithm.
 * Accepts the raw number (no spaces).
 */
export function luhnCheck(value: string): boolean {
  const num = value.replace(/\s/g, '');
  if (!/^\d+$/.test(num) || num.length === 0) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// ── Card type detection ───────────────────────────────────────────────────────

/**
 * Detects VISA or MasterCard from the card number prefix.
 * - VISA: starts with 4
 * - MasterCard: starts with 51–55 OR 4-digit prefix between 2221–2720
 */
export function detectCardType(value: string): CardType {
  const num = value.replace(/\s/g, '');
  if (num.length === 0) return null;

  // VISA
  if (/^4/.test(num)) return 'visa';

  // MasterCard — classic 5xxx range
  if (/^5[1-5]/.test(num)) return 'mastercard';

  // MasterCard — 2-series (2221–2720)
  if (num.length >= 4) {
    const prefix4 = parseInt(num.slice(0, 4), 10);
    if (prefix4 >= 2221 && prefix4 <= 2720) return 'mastercard';
  } else if (num.length === 3) {
    const prefix3 = parseInt(num.slice(0, 3), 10);
    if (prefix3 >= 222 && prefix3 <= 272) return 'mastercard';
  }

  return null;
}

// ── Input formatters ──────────────────────────────────────────────────────────

/**
 * Formats a card number string as groups of 4 digits separated by spaces.
 * Caps at 16 digits (19 chars with spaces).
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})(?=.)/g, '$1 ');
}

/**
 * Formats an expiry string as MM/YY.
 * Handles both raw digit input and backspace gracefully.
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}
