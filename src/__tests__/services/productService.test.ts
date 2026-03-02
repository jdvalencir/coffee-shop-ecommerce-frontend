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
    it('calls GET /products and normalizes wrapped API responses', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          success: true,
          products: [
            {
              id: 'prod-uuid-123',
              name: 'Cafe de Origen 340g',
              description: 'Cafe tostado de origen con notas achocolatadas',
              price: 250000,
              stock: 12,
              imageUrl: 'https://cdn.example.com/products/cafe-origen.jpg',
              createdAt: '2026-03-01T15:30:00.000Z',
            },
          ],
        },
      });
      const { getProducts } = loadService(false);
      const result = await getProducts();
      expect(mockAxiosGet).toHaveBeenCalledWith('/products');
      expect(result).toEqual([
        {
          id: 'prod-uuid-123',
          name: 'Cafe de Origen 340g',
          description: 'Cafe tostado de origen con notas achocolatadas',
          price: 250000,
          stock: 12,
          image: 'https://cdn.example.com/products/cafe-origen.jpg',
          roastLevel: 'medium',
          origin: 'Origen no especificado',
          weight: 340,
          notes: [],
          createdAt: '2026-03-01T15:30:00.000Z',
        },
      ]);
    });

    it('keeps supporting array responses from the API', async () => {
      mockAxiosGet.mockResolvedValueOnce({ data: mockProducts });
      const { getProducts } = loadService(false);
      const result = await getProducts();
      expect(result).toEqual(mockProducts);
    });

    it('propagates network errors', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network Error'));
      const { getProducts } = loadService(false);
      await expect(getProducts()).rejects.toThrow('Network Error');
    });
  });

  describe('getProductById (real API mode)', () => {
    it('calls GET /products/:id and normalizes wrapped response data', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          success: true,
          product: {
            id: 'prod-001',
            name: 'Ethiopian Yirgacheffe',
            description: 'A bright, complex light roast from the birthplace of coffee.',
            price: 65_000,
            stock: 15,
            imageUrl: 'http://example.com/img.jpg',
            roastLevel: 'MEDIUM',
            createdAt: '2026-03-01T15:30:00.000Z',
          },
        },
      });
      const { getProductById } = loadService(false);
      const result = await getProductById('prod-001');
      expect(mockAxiosGet).toHaveBeenCalledWith('/products/prod-001');
      expect(result).toEqual({
        id: 'prod-001',
        name: 'Ethiopian Yirgacheffe',
        description: 'A bright, complex light roast from the birthplace of coffee.',
        price: 65_000,
        stock: 15,
        image: 'http://example.com/img.jpg',
        roastLevel: 'medium',
        origin: 'Origen no especificado',
        weight: 340,
        notes: [],
        createdAt: '2026-03-01T15:30:00.000Z',
      });
    });

    it('keeps supporting direct object responses from the API', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          id: 'prod-002',
          name: 'Colombian Supremo',
          description: 'Balanced and sweet.',
          price: 48_000,
          stock: 8,
          imageUrl: 'http://example.com/colombia.jpg',
          roastLevel: 'medium_dark',
        },
      });
      const { getProductById } = loadService(false);
      const result = await getProductById('prod-002');
      expect(result.roastLevel).toBe('medium-dark');
    });

    it('propagates API errors', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('404 Not Found'));
      const { getProductById } = loadService(false);
      await expect(getProductById('prod-999')).rejects.toThrow('404 Not Found');
    });
  });
});
