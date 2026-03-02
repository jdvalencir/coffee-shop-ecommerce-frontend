/**
 * Manual persistence layer using localStorage.
 * CC data is NEVER stored here for security reasons.
 */

const KEY = {
  THEME: 'bb_theme',
  STEP: 'bb_step',
  SELECTED_PRODUCT_ID: 'bb_product_id',
  DELIVERY: 'bb_delivery',
} as const;

// ── Theme ─────────────────────────────────────────────────────────────────────

export function saveTheme(theme: 'light' | 'dark'): void {
  try { localStorage.setItem(KEY.THEME, theme); } catch { /* ignore */ }
}

export function loadTheme(): 'light' | 'dark' | null {
  try {
    const v = localStorage.getItem(KEY.THEME);
    return v === 'light' || v === 'dark' ? v : null;
  } catch { return null; }
}

// ── Checkout step ─────────────────────────────────────────────────────────────

export function saveStep(step: string): void {
  try { localStorage.setItem(KEY.STEP, step); } catch { /* ignore */ }
}

export function loadStep(): string | null {
  try { return localStorage.getItem(KEY.STEP); } catch { return null; }
}

// ── Selected product ID (never the full object) ───────────────────────────────

export function saveSelectedProductId(id: string): void {
  try { localStorage.setItem(KEY.SELECTED_PRODUCT_ID, id); } catch { /* ignore */ }
}

export function loadSelectedProductId(): string | null {
  try { return localStorage.getItem(KEY.SELECTED_PRODUCT_ID); } catch { return null; }
}

// ── Delivery form ─────────────────────────────────────────────────────────────

export function saveDelivery(delivery: unknown): void {
  try { localStorage.setItem(KEY.DELIVERY, JSON.stringify(delivery)); } catch { /* ignore */ }
}

export function loadDelivery<T>(): T | null {
  try {
    const v = localStorage.getItem(KEY.DELIVERY);
    return v ? (JSON.parse(v) as T) : null;
  } catch { return null; }
}

// ── Clear checkout state (called after transaction) ───────────────────────────

export function clearCheckoutPersistence(): void {
  try {
    localStorage.removeItem(KEY.STEP);
    localStorage.removeItem(KEY.SELECTED_PRODUCT_ID);
    localStorage.removeItem(KEY.DELIVERY);
    // CC data is NEVER persisted — nothing to clear
  } catch { /* ignore */ }
}
