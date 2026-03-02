import api, { USE_MOCK } from './api';
import { mockProducts } from '@/mock/products';
import type { Product } from '@/types';

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) return Promise.resolve(mockProducts);
  const { data } = await api.get<Product[]>('/products');
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  if (USE_MOCK) {
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return Promise.resolve(product);
  }
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}
