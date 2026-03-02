import api, { USE_MOCK } from './api';
import { resolveProductImage } from '@/lib/productImages';
import { mockProducts } from '@/mock/products';
import type { Product } from '@/types';

type ApiProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  image?: string;
  roastLevel?: string;
  origin?: string;
  weight?: number;
  notes?: string[];
  createdAt?: string;
};

type ProductsApiResponse = {
  success: boolean;
  products: ApiProduct[];
};

type ProductApiResponse = {
  success: boolean;
  product: ApiProduct;
};

function normalizeRoastLevel(value?: string): Product['roastLevel'] {
  switch (value?.toLowerCase()) {
    case 'light':
      return 'light';
    case 'medium-dark':
    case 'medium_dark':
      return 'medium-dark';
    case 'dark':
      return 'dark';
    case 'medium':
    default:
      return 'medium';
  }
}

function normalizeProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: resolveProductImage(product.name, product.imageUrl ?? product.image),
    roastLevel: normalizeRoastLevel(product.roastLevel),
    origin: product.origin ?? 'Origen no especificado',
    weight: product.weight ?? 340,
    notes: product.notes ?? [],
    ...(product.createdAt ? { createdAt: product.createdAt } : {}),
  };
}

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) return Promise.resolve(mockProducts);
  const { data } = await api.get<Product[] | ProductsApiResponse>('/products');
  const products = Array.isArray(data) ? data : data.products;
  return products.map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product> {
  if (USE_MOCK) {
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return Promise.resolve(product);
  }
  const { data } = await api.get<ApiProduct | ProductApiResponse>(`/products/${id}`);
  const product = 'product' in data ? data.product : data;
  return normalizeProduct(product);
}
