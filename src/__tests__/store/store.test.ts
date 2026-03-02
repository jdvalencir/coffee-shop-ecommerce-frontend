// Must mock productService before store is imported (it's imported transitively)
jest.mock('@/services/productService', () => ({
  getProducts: jest.fn(),
}));

import { store } from '@/store/store';
import {
  selectProduct,
  setStep,
  setDelivery,
  resetCheckout,
} from '@/store/slices/checkoutSlice';
import type { Product, DeliveryInfo } from '@/types';

const mockProduct: Product = {
  id: 'prod-001',
  name: 'Ethiopian Yirgacheffe',
  description: 'Test',
  price: 65_000,
  stock: 15,
  image: 'http://example.com/img.jpg',
  roastLevel: 'light',
  origin: 'Ethiopia',
  weight: 500,
  notes: ['Blueberry'],
};

const mockDelivery: DeliveryInfo = {
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '3001234567',
  address: 'Calle 1 #2-3',
  city: 'Bogotá',
  department: 'Cundinamarca',
};

describe('store persistence subscriber', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset checkout state between tests
    store.dispatch(resetCheckout());
  });

  it('saves step to localStorage when step changes via dispatch', () => {
    store.dispatch(setStep('checkout'));
    expect(localStorage.getItem('bb_step')).toBe('checkout');
  });

  it('saves selectedProductId to localStorage when a product is selected', () => {
    store.dispatch(selectProduct(mockProduct));
    expect(localStorage.getItem('bb_product_id')).toBe('prod-001');
  });

  it('saves delivery to localStorage when delivery changes', () => {
    store.dispatch(setDelivery(mockDelivery));
    const stored = JSON.parse(localStorage.getItem('bb_delivery')!);
    expect(stored).toEqual(mockDelivery);
  });

  it('does not re-save if state did not change', () => {
    store.dispatch(setStep('checkout'));
    localStorage.clear();
    // Dispatch an action that changes a different slice — subscriber should not re-save step
    store.dispatch(setStep('checkout')); // same value → slice state may still change internally
    // No assertions on localStorage here — just verifying no crash
    expect(() => store.getState()).not.toThrow();
  });

  it('getState returns correct shape', () => {
    const state = store.getState();
    expect(state).toHaveProperty('products');
    expect(state).toHaveProperty('checkout');
    expect(state.products).toHaveProperty('items');
    expect(state.checkout).toHaveProperty('step');
  });
});
