import checkoutReducer, {
  selectProduct,
  rehydrateSelectedProduct,
  setStep,
  setCreditCard,
  setDelivery,
  resetCheckout,
} from '@/store/slices/checkoutSlice';
import type { Product, CreditCard, DeliveryInfo } from '@/types';

const mockProduct: Product = {
  id: 'prod-001',
  name: 'Ethiopian Yirgacheffe',
  description: 'A bright, complex light roast',
  price: 65_000,
  stock: 15,
  image: 'http://example.com/img.jpg',
  roastLevel: 'light',
  origin: 'Ethiopia',
  weight: 500,
  notes: ['Blueberry'],
};

const mockCard: CreditCard = {
  number: '4111111111111111',
  holderName: 'Juan Perez',
  expiry: '12/27',
  cvv: '123',
};

const mockDelivery: DeliveryInfo = {
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '3001234567',
  address: 'Calle 1 #2-3',
  city: 'Bogotá',
  department: 'Cundinamarca',
};

describe('checkoutSlice', () => {
  // Default initial state when localStorage is empty (jsdom starts clean)
  const defaultState = {
    step: 'product' as const,
    selectedProduct: null,
    creditCard: null,
    delivery: null,
  };

  it('returns the default initial state when localStorage is empty', () => {
    const state = checkoutReducer(undefined, { type: '' });
    expect(state.step).toBe('product');
    expect(state.selectedProduct).toBeNull();
    expect(state.creditCard).toBeNull();
  });

  // ── selectProduct ────────────────────────────────────────────────────────────

  describe('selectProduct', () => {
    it('sets the selected product', () => {
      const result = checkoutReducer(defaultState, selectProduct(mockProduct));
      expect(result.selectedProduct).toEqual(mockProduct);
    });

    it('replaces an existing selected product', () => {
      const withProduct = { ...defaultState, selectedProduct: mockProduct };
      const newProduct: Product = { ...mockProduct, id: 'prod-002' };
      const result = checkoutReducer(withProduct, selectProduct(newProduct));
      expect(result.selectedProduct?.id).toBe('prod-002');
    });
  });

  // ── rehydrateSelectedProduct ─────────────────────────────────────────────────

  describe('rehydrateSelectedProduct', () => {
    it('sets the selected product (same reducer logic as selectProduct)', () => {
      const result = checkoutReducer(
        defaultState,
        rehydrateSelectedProduct(mockProduct),
      );
      expect(result.selectedProduct).toEqual(mockProduct);
    });
  });

  // ── setStep ──────────────────────────────────────────────────────────────────

  describe('setStep', () => {
    it('transitions to "checkout"', () => {
      const result = checkoutReducer(defaultState, setStep('checkout'));
      expect(result.step).toBe('checkout');
    });

    it('transitions to "summary"', () => {
      const result = checkoutReducer(defaultState, setStep('summary'));
      expect(result.step).toBe('summary');
    });

    it('transitions to "status"', () => {
      const result = checkoutReducer(defaultState, setStep('status'));
      expect(result.step).toBe('status');
    });

    it('transitions back to "product"', () => {
      const atCheckout = { ...defaultState, step: 'checkout' as const };
      const result = checkoutReducer(atCheckout, setStep('product'));
      expect(result.step).toBe('product');
    });
  });

  // ── setCreditCard ────────────────────────────────────────────────────────────

  describe('setCreditCard', () => {
    it('stores credit card data', () => {
      const result = checkoutReducer(defaultState, setCreditCard(mockCard));
      expect(result.creditCard).toEqual(mockCard);
    });

    it('replaces an existing credit card', () => {
      const withCard = { ...defaultState, creditCard: mockCard };
      const newCard: CreditCard = { ...mockCard, number: '5500000000000004' };
      const result = checkoutReducer(withCard, setCreditCard(newCard));
      expect(result.creditCard?.number).toBe('5500000000000004');
    });
  });

  // ── setDelivery ──────────────────────────────────────────────────────────────

  describe('setDelivery', () => {
    it('stores delivery info', () => {
      const result = checkoutReducer(defaultState, setDelivery(mockDelivery));
      expect(result.delivery).toEqual(mockDelivery);
    });

    it('replaces existing delivery info', () => {
      const withDelivery = { ...defaultState, delivery: mockDelivery };
      const updated: DeliveryInfo = { ...mockDelivery, city: 'Medellín' };
      const result = checkoutReducer(withDelivery, setDelivery(updated));
      expect(result.delivery?.city).toBe('Medellín');
    });
  });

  // ── resetCheckout ─────────────────────────────────────────────────────────────

  describe('resetCheckout', () => {
    it('resets all state to defaults', () => {
      const filledState = {
        step: 'summary' as const,
        selectedProduct: mockProduct,
        creditCard: mockCard,
        delivery: mockDelivery,
      };
      const result = checkoutReducer(filledState, resetCheckout());
      expect(result.step).toBe('product');
      expect(result.selectedProduct).toBeNull();
      expect(result.creditCard).toBeNull();
      expect(result.delivery).toBeNull();
    });

    it('is idempotent — resetting an already-reset state is safe', () => {
      const result = checkoutReducer(defaultState, resetCheckout());
      expect(result).toEqual(defaultState);
    });
  });
});
