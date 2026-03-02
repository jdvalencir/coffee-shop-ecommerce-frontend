import productsReducer, {
  decrementStock,
  fetchProducts,
} from '@/store/slices/productsSlice';
import type { Product } from '@/types';

// Provide an explicit factory so Jest never evaluates the real productService
// (which would transitively load api.ts and trigger the import.meta.env error)
jest.mock('@/services/productService', () => ({
  getProducts: jest.fn(),
}));

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

const initialState = {
  items: [],
  status: 'idle' as const,
  error: null,
};

describe('productsSlice', () => {
  it('returns the initial state', () => {
    expect(productsReducer(undefined, { type: '' })).toEqual(initialState);
  });

  describe('decrementStock', () => {
    it('decrements stock for the matching product', () => {
      const state = { items: [{ ...mockProduct, stock: 5 }], status: 'succeeded' as const, error: null };
      const result = productsReducer(state, decrementStock('prod-001'));
      expect(result.items[0].stock).toBe(4);
    });

    it('does not decrement when stock is already 0', () => {
      const state = { items: [{ ...mockProduct, stock: 0 }], status: 'succeeded' as const, error: null };
      const result = productsReducer(state, decrementStock('prod-001'));
      expect(result.items[0].stock).toBe(0);
    });

    it('does nothing for an unknown product ID', () => {
      const state = { items: [{ ...mockProduct }], status: 'succeeded' as const, error: null };
      const result = productsReducer(state, decrementStock('prod-999'));
      expect(result.items[0].stock).toBe(15);
    });

    it('only decrements the target product when multiple exist', () => {
      const second: Product = { ...mockProduct, id: 'prod-002', stock: 10 };
      const state = { items: [{ ...mockProduct }, second], status: 'succeeded' as const, error: null };
      const result = productsReducer(state, decrementStock('prod-001'));
      expect(result.items[0].stock).toBe(14);
      expect(result.items[1].stock).toBe(10);
    });
  });

  describe('fetchProducts extra reducers', () => {
    it('sets status to "loading" and clears error on pending', () => {
      const stateWithError = { ...initialState, error: 'old error' };
      const result = productsReducer(stateWithError, fetchProducts.pending('req1', undefined));
      expect(result.status).toBe('loading');
      expect(result.error).toBeNull();
    });

    it('sets status to "succeeded" and stores items on fulfilled', () => {
      const loadingState = { ...initialState, status: 'loading' as const };
      const result = productsReducer(loadingState, fetchProducts.fulfilled([mockProduct], 'req1', undefined));
      expect(result.status).toBe('succeeded');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('prod-001');
    });

    it('replaces items array on subsequent fulfilled calls', () => {
      const succeededState = { items: [mockProduct], status: 'succeeded' as const, error: null };
      const newProduct: Product = { ...mockProduct, id: 'prod-002' };
      const result = productsReducer(succeededState, fetchProducts.fulfilled([newProduct], 'req2', undefined));
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('prod-002');
    });

    it('sets status to "failed" and stores error message on rejected', () => {
      const loadingState = { ...initialState, status: 'loading' as const };
      const rejectedAction = { type: fetchProducts.rejected.type, error: { message: 'Network error' } };
      const result = productsReducer(loadingState, rejectedAction);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Network error');
    });

    it('falls back to default message when error.message is undefined', () => {
      const loadingState = { ...initialState, status: 'loading' as const };
      const rejectedAction = { type: fetchProducts.rejected.type, error: {} };
      const result = productsReducer(loadingState, rejectedAction);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Failed to load products');
    });
  });
});
