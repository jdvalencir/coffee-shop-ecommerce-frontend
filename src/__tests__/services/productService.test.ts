import { mockProducts } from '@/mock/products';

// mockAxiosGet is hoisted along with jest.mock because it is prefixed with "mock"
const mockAxiosGet = jest.fn();

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  // Helper: loads the service with a specific USE_MOCK value.
  // Uses jest.doMock (non-hoisted) + require after jest.resetModules.
  function loadService(useMock: boolean) {
    jest.doMock('@/services/api', () => ({
      __esModule: true,
      default: { get: mockAxiosGet },
      USE_MOCK: useMock,
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/services/productService') as typeof import('@/services/productService');
  }

  // ── Mock mode ──────────────────────────────────────────────────────────────

  describe('getProducts (mock mode)', () => {
    it('returns all mock products without calling the API', async () => {
      const { getProducts } = loadService(true);
      const result = await getProducts();
      expect(result).toEqual(mockProducts);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('returns an array with 6 products', async () => {
      const { getProducts } = loadService(true);
      const result = await getProducts();
      expect(result).toHaveLength(6);
    });
  });

  describe('getProductById (mock mode)', () => {
    it('returns the correct product by ID', async () => {
      const { getProductById } = loadService(true);
      const result = await getProductById('prod-001');
      expect(result.id).toBe('prod-001');
      expect(result.name).toBe('Ethiopian Yirgacheffe');
    });

    it('throws an error for an unknown product ID', async () => {
      const { getProductById } = loadService(true);
      await expect(getProductById('prod-999')).rejects.toThrow(
        'Product prod-999 not found',
      );
    });

    it('returns the last mock product by ID', async () => {
      const { getProductById } = loadService(true);
      const result = await getProductById('prod-006');
      expect(result.id).toBe('prod-006');
    });
  });

  // ── Real API mode ──────────────────────────────────────────────────────────

  describe('getProducts (real API mode)', () => {
    it('calls GET /products and returns the response data', async () => {
      mockAxiosGet.mockResolvedValueOnce({ data: mockProducts });
      const { getProducts } = loadService(false);
      const result = await getProducts();
      expect(mockAxiosGet).toHaveBeenCalledWith('/products');
      expect(result).toEqual(mockProducts);
    });

    it('propagates network errors', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network Error'));
      const { getProducts } = loadService(false);
      await expect(getProducts()).rejects.toThrow('Network Error');
    });
  });

  describe('getProductById (real API mode)', () => {
    it('calls GET /products/:id and returns the response data', async () => {
      const expected = mockProducts[0];
      mockAxiosGet.mockResolvedValueOnce({ data: expected });
      const { getProductById } = loadService(false);
      const result = await getProductById('prod-001');
      expect(mockAxiosGet).toHaveBeenCalledWith('/products/prod-001');
      expect(result).toEqual(expected);
    });

    it('propagates API errors', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('404 Not Found'));
      const { getProductById } = loadService(false);
      await expect(getProductById('prod-999')).rejects.toThrow('404 Not Found');
    });
  });
});
