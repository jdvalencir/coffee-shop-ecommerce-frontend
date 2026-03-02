import {
  saveTheme,
  loadTheme,
  saveStep,
  loadStep,
  saveSelectedProductId,
  loadSelectedProductId,
  saveDelivery,
  loadDelivery,
  clearCheckoutPersistence,
} from '@/utils/persistence';

describe('persistence utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Theme ────────────────────────────────────────────────────────────────────

  describe('saveTheme / loadTheme', () => {
    it('saves and loads "light" theme', () => {
      saveTheme('light');
      expect(loadTheme()).toBe('light');
    });

    it('saves and loads "dark" theme', () => {
      saveTheme('dark');
      expect(loadTheme()).toBe('dark');
    });

    it('returns null when nothing is stored', () => {
      expect(loadTheme()).toBeNull();
    });

    it('returns null for an invalid stored value', () => {
      localStorage.setItem('bb_theme', 'solarized');
      expect(loadTheme()).toBeNull();
    });

    it('overwrites previous theme', () => {
      saveTheme('light');
      saveTheme('dark');
      expect(loadTheme()).toBe('dark');
    });
  });

  // ── Step ─────────────────────────────────────────────────────────────────────

  describe('saveStep / loadStep', () => {
    it('saves and loads "checkout" step', () => {
      saveStep('checkout');
      expect(loadStep()).toBe('checkout');
    });

    it('saves and loads "summary" step', () => {
      saveStep('summary');
      expect(loadStep()).toBe('summary');
    });

    it('returns null when nothing is stored', () => {
      expect(loadStep()).toBeNull();
    });

    it('overwrites previous step', () => {
      saveStep('checkout');
      saveStep('status');
      expect(loadStep()).toBe('status');
    });
  });

  // ── Selected product ID ───────────────────────────────────────────────────────

  describe('saveSelectedProductId / loadSelectedProductId', () => {
    it('saves and loads a product ID', () => {
      saveSelectedProductId('prod-001');
      expect(loadSelectedProductId()).toBe('prod-001');
    });

    it('returns null when nothing is stored', () => {
      expect(loadSelectedProductId()).toBeNull();
    });

    it('overwrites previous product ID', () => {
      saveSelectedProductId('prod-001');
      saveSelectedProductId('prod-003');
      expect(loadSelectedProductId()).toBe('prod-003');
    });
  });

  // ── Delivery ─────────────────────────────────────────────────────────────────

  describe('saveDelivery / loadDelivery', () => {
    const delivery = {
      fullName: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '3001234567',
      address: 'Calle 1 #2-3',
      city: 'Bogotá',
      department: 'Cundinamarca',
    };

    it('saves and loads a delivery object', () => {
      saveDelivery(delivery);
      expect(loadDelivery()).toEqual(delivery);
    });

    it('returns null when nothing is stored', () => {
      expect(loadDelivery<typeof delivery>()).toBeNull();
    });

    it('returns null when stored value is invalid JSON', () => {
      localStorage.setItem('bb_delivery', 'not-valid-json{{{');
      expect(loadDelivery()).toBeNull();
    });

    it('overwrites previous delivery', () => {
      saveDelivery({ ...delivery, city: 'Medellín' });
      saveDelivery({ ...delivery, city: 'Cali' });
      expect((loadDelivery() as typeof delivery).city).toBe('Cali');
    });
  });

  // ── clearCheckoutPersistence ──────────────────────────────────────────────────

  describe('clearCheckoutPersistence', () => {
    it('removes step, product ID, and delivery from localStorage', () => {
      localStorage.setItem('bb_step', 'checkout');
      localStorage.setItem('bb_product_id', 'prod-001');
      localStorage.setItem('bb_delivery', '{}');

      clearCheckoutPersistence();

      expect(localStorage.getItem('bb_step')).toBeNull();
      expect(localStorage.getItem('bb_product_id')).toBeNull();
      expect(localStorage.getItem('bb_delivery')).toBeNull();
    });

    it('does not remove the theme key', () => {
      localStorage.setItem('bb_theme', 'dark');
      localStorage.setItem('bb_step', 'checkout');
      clearCheckoutPersistence();
      expect(localStorage.getItem('bb_theme')).toBe('dark');
    });

    it('is safe to call when nothing is stored (no errors)', () => {
      expect(() => clearCheckoutPersistence()).not.toThrow();
    });
  });
});
